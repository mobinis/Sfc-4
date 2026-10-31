import { openDB, IDBPDatabase } from 'idb';
import { Preferences } from '@capacitor/preferences';
import { AppState } from '../types';
import { SeedData } from '../data/seedData';
import { AppVariantId } from '../config';
import { nativeStorageService } from './NativeStorageService.js';

const DB_NAME = 'SelfCareHeroHardwareDB';
const DB_VERSION = 1;
const STORE_NAME = 'hardware_persistence';

interface StoredPayload {
  variantId: string;
  timestamp: number;
  version: number;
  data: AppState;
}

class StoragePersistenceService {
  private dbPromise: Promise<IDBPDatabase> | null = null;
  private saveTimeout: NodeJS.Timeout | null = null;

  private getDB(): Promise<IDBPDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'variantId' });
          }
        }
      });
    }
    return this.dbPromise;
  }

  private getStorageKey(variantId: AppVariantId): string {
    return `selfcare_hero_${variantId}_hardware_state`;
  }

  /**
   * Layer 1: Hardware-backed IndexedDB load
   */
  async loadFromLayer1(variantId: AppVariantId): Promise<AppState | null> {
    try {
      const db = await this.getDB();
      const record = await db.get(STORE_NAME, variantId) as StoredPayload | undefined;
      if (record && record.data && record.data.v) {
        return record.data;
      }
    } catch (err) {
      console.warn('[Persistence Layer 1] IndexedDB read error:', err);
    }
    return null;
  }

  /**
   * Layer 2: SharedPreferences (Capacitor) & LocalStorage mirror
   */
  async loadFromLayer2(variantId: AppVariantId): Promise<AppState | null> {
    const key = this.getStorageKey(variantId);

    // 1. Check Capacitor Preferences (Native SharedPreferences on Android)
    try {
      const { value } = await Preferences.get({ key });
      if (value) {
        const parsed = JSON.parse(value);
        if (parsed && (parsed.data?.v || parsed.v)) {
          return parsed.data || parsed;
        }
      }
    } catch {
      // ignore
    }

    // 2. Check Web LocalStorage
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && (parsed.data?.v || parsed.v)) {
            return parsed.data || parsed;
          }
        }
      }
    } catch {
      // ignore
    }

    return null;
  }

  /**
   * Dual-Layer Hardware Load with Self-Healing Cross-Synchronization
   */
  async loadState(variantId: AppVariantId): Promise<AppState> {
    const [layer1State, layer2State] = await Promise.all([
      this.loadFromLayer1(variantId),
      this.loadFromLayer2(variantId)
    ]);

    let resolvedState: AppState | null = null;

    if (layer1State && layer2State) {
      // Both layers intact: Layer 1 (IndexedDB) is primary authority
      resolvedState = layer1State;
    } else if (layer1State && !layer2State) {
      // Layer 2 missing or purged during APK upgrade: Self-heal Layer 2 from Layer 1!
      console.info('[Persistence Self-Heal] Layer 2 missing. Restoring Layer 2 from Layer 1 (IndexedDB)...');
      resolvedState = layer1State;
      await this.saveToLayer2(variantId, layer1State);
    } else if (!layer1State && layer2State) {
      // Layer 1 missing: Self-heal Layer 1 from Layer 2 (Capacitor SharedPreferences / LocalStorage)!
      console.info('[Persistence Self-Heal] Layer 1 missing. Restoring Layer 1 from Layer 2...');
      resolvedState = layer2State;
      await this.saveToLayer1(variantId, layer2State);
    } else {
      // Fresh install: Initialize and seed to both layers
      console.info('[Persistence Init] Initializing fresh state across both persistence layers...');
      const fresh = SeedData.createInitialState();
      resolvedState = fresh;
      await Promise.all([
        this.saveToLayer1(variantId, fresh),
        this.saveToLayer2(variantId, fresh)
      ]);
    }

    // Ensure all seed fields exist for backward compatibility
    this.ensureCompleteSchema(resolvedState);
    return resolvedState;
  }

  /**
   * Save payload to Layer 1 (IndexedDB)
   */
  async saveToLayer1(variantId: AppVariantId, state: AppState): Promise<void> {
    try {
      const db = await this.getDB();
      const payload: StoredPayload = {
        variantId,
        timestamp: Date.now(),
        version: state.v || 19,
        data: state
      };
      await db.put(STORE_NAME, payload);
    } catch (err) {
      console.warn('[Persistence Layer 1] IndexedDB write error:', err);
    }
  }

  /**
   * Save payload to Layer 2 (Capacitor Preferences & LocalStorage)
   */
  async saveToLayer2(variantId: AppVariantId, state: AppState): Promise<void> {
    const key = this.getStorageKey(variantId);
    const payload: StoredPayload = {
      variantId,
      timestamp: Date.now(),
      version: state.v || 19,
      data: state
    };
    const jsonStr = JSON.stringify(payload);

    try {
      await Preferences.set({ key, value: jsonStr });
    } catch {
      // ignore
    }

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, jsonStr);
        // Also keep legacy key synced for backward compatibility
        localStorage.setItem('bloomquest_state_v19', JSON.stringify(state));
      }
    } catch {
      // ignore
    }

    // 3. Write non-evictable backup snapshot to Capacitor Filesystem
    try {
      await nativeStorageService.writeToFilesystem(state);
    } catch {
      // ignore
    }
  }

  /**
   * Debounced Dual-Layer Hardware Write
   */
  persistState(variantId: AppVariantId, state: AppState): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(async () => {
      await Promise.all([
        this.saveToLayer1(variantId, state),
        this.saveToLayer2(variantId, state)
      ]);
    }, 120);
  }

  /**
   * Export Full Hardware Snapshot for JSON Backup
   */
  exportBackup(variantId: AppVariantId, state: AppState): string {
    const backup = {
      app: 'SelfCare Hero',
      variantId,
      exportedAt: new Date().toISOString(),
      timestamp: Date.now(),
      version: state.v || 19,
      integrityChecksum: this.computeChecksum(state),
      state
    };
    return JSON.stringify(backup, null, 2);
  }

  /**
   * Import Full Hardware Snapshot from JSON
   */
  async importBackup(variantId: AppVariantId, jsonStr: string): Promise<AppState> {
    const parsed = JSON.parse(jsonStr);
    const candidateState: AppState = parsed.state || parsed;

    if (!candidateState || !candidateState.v) {
      throw new Error('Invalid backup file: Missing valid AppState signature');
    }

    this.ensureCompleteSchema(candidateState);

    await Promise.all([
      this.saveToLayer1(variantId, candidateState),
      this.saveToLayer2(variantId, candidateState)
    ]);

    return candidateState;
  }

  private computeChecksum(state: AppState): string {
    const sample = `${state.v}_${(state.nodes || []).length}_${(state.ev || []).length}_${(state.urges || []).length}_${(state.jr || []).length}`;
    let hash = 0;
    for (let i = 0; i < sample.length; i++) {
      hash = ((hash << 5) - hash) + sample.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  }

  private ensureCompleteSchema(state: AppState): void {
    if (!state.roadmapGoals) state.roadmapGoals = SeedData.getInitialRoadmapGoals();
    if (!state.roadmapSteps) state.roadmapSteps = SeedData.getInitialRoadmapSteps();
    if (!state.roadmapTags) state.roadmapTags = SeedData.getInitialRoadmapTags();
    if (!state.measurableTargets) state.measurableTargets = SeedData.getInitialMeasurableTargets();
    if (!state.activityRecords) state.activityRecords = SeedData.getInitialActivityRecords();
    if (!state.sharedTags) state.sharedTags = SeedData.getInitialSharedTags();
    if (!state.exerciseLibrary) state.exerciseLibrary = SeedData.getInitialExerciseLibrary();
    if (!state.workoutTemplates) state.workoutTemplates = SeedData.getInitialWorkoutTemplates();
    if (!state.workoutSessions) state.workoutSessions = SeedData.getInitialWorkoutSessions();
    if (!state.readingSessions) state.readingSessions = SeedData.getInitialReadingSessions();
    if (!state.screenTimeApps) state.screenTimeApps = SeedData.getInitialScreenTimeApps();
    if (!state.screenTimeSessions) state.screenTimeSessions = SeedData.getInitialScreenTimeSessions();
    if (!state.impactDeeds) state.impactDeeds = SeedData.getInitialImpactDeeds();
    if (!state.relationshipContacts) state.relationshipContacts = SeedData.getInitialRelationshipContacts();
  }
}

export const storagePersistence = new StoragePersistenceService();
