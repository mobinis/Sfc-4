import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

const PRIMARY_STORAGE_KEY = 'selfcare_hero_app_state';
const BACKUP_FILE_NAME = 'selfcare_hero_backup_ring.json';
const CURRENT_SCHEMA_VERSION = 3;

/**
 * Validation guard: Prevents blank or corrupted state from overwriting good backup files
 * @param {any} state 
 * @returns {boolean}
 */
export function hasMeaningfulStateData(state) {
  if (!state || typeof state !== 'object') {
    return false;
  }

  // Must have a schema version and at least one core progression domain populated
  const hasNodes = Array.isArray(state.nodes) && state.nodes.length > 0;
  const hasEvents = Array.isArray(state.ev) && state.ev.length > 0;
  const hasJournal = Array.isArray(state.jr) && state.jr.length > 0;
  const hasUrges = Array.isArray(state.urges) && state.urges.length > 0;
  const hasRoutines = Array.isArray(state.routines) && state.routines.length > 0;
  const hasRoadmap = Array.isArray(state.roadmapGoals) && state.roadmapGoals.length > 0;
  const hasStreak = state.dailyThreeStreak && typeof state.dailyThreeStreak.cur === 'number';

  return Boolean(hasNodes || hasEvents || hasJournal || hasUrges || hasRoutines || hasRoadmap || hasStreak);
}

/**
 * Sequential Schema Migration Engine
 * Migrates data safely starting from db_version: 3 with clean fallbacks
 * @param {any} rawState 
 * @returns {object} Migrated state conforming to current schema
 */
export function migrateSchema(rawState) {
  if (!rawState || typeof rawState !== 'object') {
    return createDefaultState();
  }

  const state = { ...rawState };
  let currentVer = state.db_version || state.v || 1;

  // Migration: Step from v1 -> v2 (if applicable)
  if (currentVer < 2) {
    if (!state.circadianConfig) {
      state.circadianConfig = {
        wakeTimeStr: '06:30',
        bedTimeStr: '22:30',
        caffeineCutoffHoursBeforeSleep: 9,
        screenCurfewHoursBeforeSleep: 1,
        enabled: true
      };
    }
    if (!state.urges) state.urges = [];
    if (!state.antiGoals) state.antiGoals = [];
    currentVer = 2;
  }

  // Migration: Step from v2 -> v3 (Capacitor Filesystem Non-Evictable Persistence)
  if (currentVer < 3) {
    state.db_version = 3;
    state.v = 19;
    if (!state.roadmapGoals) state.roadmapGoals = [];
    if (!state.roadmapSteps) state.roadmapSteps = [];
    if (!state.roadmapTags) state.roadmapTags = [];
    if (!state.measurableTargets) state.measurableTargets = [];
    if (!state.activityRecords) state.activityRecords = [];
    if (!state.sharedTags) state.sharedTags = [];
    if (!state.learnStack) state.learnStack = [];
    if (!state.nodes) state.nodes = [];
    if (!state.ev) state.ev = [];
    if (!state.jr) state.jr = [];
    if (!state.routines) state.routines = [];
    if (!state.coins) state.coins = 0;
    if (!state.dailyThreeStreak) {
      state.dailyThreeStreak = { cur: 0, max: 0, last: '' };
    }
    currentVer = 3;
  }

  state.db_version = CURRENT_SCHEMA_VERSION;
  state.last_migrated_at = new Date().toISOString();
  return state;
}

/**
 * Dual-Layer Storage Service
 * Primary: localStorage (fast UI access)
 * Backup:  Capacitor Filesystem (non-evictable hardware disk storage)
 */
class NativeStorageService {
  constructor() {
    this.isFilesystemAvailable = typeof window !== 'undefined' && 'Capacitor' in window;
    this.saveDebounceTimer = null;
  }

  /**
   * Load state with automatic failover and self-healing cross-sync
   * @returns {Promise<object>}
   */
  async loadState() {
    let primaryData = null;
    let backupData = null;

    // 1. Try reading from Primary Layer (localStorage)
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(PRIMARY_STORAGE_KEY) || localStorage.getItem('bloomquest_state_v19');
        if (raw) {
          primaryData = JSON.parse(raw);
        }
      }
    } catch (err) {
      console.warn('[NativeStorageService] Primary localStorage read error:', err);
    }

    // 2. Try reading from Backup Layer (@capacitor/filesystem)
    try {
      const fileResult = await Filesystem.readFile({
        path: BACKUP_FILE_NAME,
        directory: Directory.Data,
        encoding: Encoding.UTF8
      });
      if (fileResult && fileResult.data) {
        backupData = JSON.parse(fileResult.data);
      }
    } catch {
      // Backup file does not exist yet or running in pure web
    }

    // 3. Evaluate and reconcile state
    let resolvedState = null;

    if (hasMeaningfulStateData(primaryData)) {
      resolvedState = primaryData;
      // Self-heal backup layer if missing or outdated
      if (!backupData || !hasMeaningfulStateData(backupData)) {
        this.writeToFilesystem(resolvedState);
      }
    } else if (hasMeaningfulStateData(backupData)) {
      console.info('[NativeStorageService] Primary storage missing or evicted. Restoring from Hardware Filesystem Backup!');
      resolvedState = backupData;
      // Self-heal primary layer
      try {
        localStorage.setItem(PRIMARY_STORAGE_KEY, JSON.stringify(resolvedState));
      } catch {
        // ignore
      }
    } else {
      console.info('[NativeStorageService] Initializing default application state.');
      resolvedState = createDefaultState();
      this.saveState(resolvedState);
    }

    return migrateSchema(resolvedState);
  }

  /**
   * Save state across both hardware layers with debouncing and integrity check
   * @param {object} state 
   */
  saveState(state) {
    if (!state) return;

    // 1. Write to Primary Layer (localStorage) immediately for instant UI responsiveness
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(PRIMARY_STORAGE_KEY, JSON.stringify(state));
        localStorage.setItem('bloomquest_state_v19', JSON.stringify(state));
      }
    } catch (err) {
      console.warn('[NativeStorageService] localStorage save error:', err);
    }

    // 2. Debounced write to Backup Layer (@capacitor/filesystem)
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
    }

    this.saveDebounceTimer = setTimeout(() => {
      if (hasMeaningfulStateData(state)) {
        this.writeToFilesystem(state);
      }
    }, 200);
  }

  /**
   * Non-evictable direct write to native hardware file
   * @param {object} state 
   */
  async writeToFilesystem(state) {
    try {
      const payload = {
        _savedAt: new Date().toISOString(),
        _timestamp: Date.now(),
        db_version: CURRENT_SCHEMA_VERSION,
        ...state
      };
      await Filesystem.writeFile({
        path: BACKUP_FILE_NAME,
        data: JSON.stringify(payload, null, 2),
        directory: Directory.Data,
        encoding: Encoding.UTF8
      });
      console.debug('[NativeStorageService] Hardware disk backup synchronized successfully.');
    } catch (err) {
      // In web browser environment, Filesystem will throw gracefully
      console.debug('[NativeStorageService] Filesystem write skipped (running in browser environment).');
    }
  }

  /**
   * Manual JSON snapshot export for external backup
   * @param {object} state 
   * @returns {string}
   */
  exportBackupSnapshot(state) {
    const backup = {
      app: 'SelfCare Hero',
      exportedAt: new Date().toISOString(),
      db_version: CURRENT_SCHEMA_VERSION,
      state: migrateSchema(state)
    };
    return JSON.stringify(backup, null, 2);
  }

  /**
   * Manual JSON snapshot restore
   * @param {string} jsonString 
   * @returns {object}
   */
  importBackupSnapshot(jsonString) {
    const parsed = JSON.parse(jsonString);
    const candidate = parsed.state || parsed;
    if (!hasMeaningfulStateData(candidate)) {
      throw new Error('Invalid backup file: Payload does not contain meaningful SelfCare Hero state.');
    }
    const migrated = migrateSchema(candidate);
    this.saveState(migrated);
    return migrated;
  }
}

function createDefaultState() {
  return {
    db_version: CURRENT_SCHEMA_VERSION,
    v: 19,
    nodes: [],
    ev: [],
    jr: [],
    rm: [],
    st: [],
    urges: [],
    learnStack: [],
    goodDeeds: [],
    rewardShop: [],
    weeklyReviews: [],
    dailyThreeStreak: { cur: 0, max: 0, last: '' },
    snapshots: [],
    lowEnergyMode: false,
    lowEnergyEssentialIds: [],
    restDayTokens: 2,
    usedRestDays: [],
    lastVisitDate: new Date().toISOString().split('T')[0],
    comebackBonus: null,
    coins: 50,
    routines: [],
    habitStacks: [],
    activeMomentumHabitId: null,
    aiChatHistory: [],
    antiGoals: [],
    activeSprint: null,
    circadianConfig: {
      wakeTimeStr: '06:30',
      bedTimeStr: '22:30',
      caffeineCutoffHoursBeforeSleep: 9,
      screenCurfewHoursBeforeSleep: 1,
      enabled: true
    },
    habitContracts: [],
    penaltyVaultCoins: 0,
    weeklyQuests: [],
    isDarkMode: true,
    videoResources: [],
    bookResources: [],
    pinLockEnabled: false,
    pinHash: '',
    lockJournal: false,
    lockUrges: false,
    lockAppLaunch: false,
    roadmapGoals: [],
    roadmapSteps: [],
    roadmapTags: [],
    measurableTargets: [],
    activityRecords: [],
    sharedTags: []
  };
}

export const nativeStorageService = new NativeStorageService();
