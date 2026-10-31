import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import {
  AppState,
  JournalEntry,
  UrgeItem,
  NodeItem,
  CircadianConfig,
  BackupSnapshot,
  WeeklyQuest,
  RoadmapGoal,
  RoadmapStep,
  RoadmapTag,
  MeasurableTarget,
  ActivityRecord,
  SharedTag,
  TargetStatus,
  ExerciseItem,
  WorkoutRoutineTemplate,
  WorkoutSessionRecord,
  WorkoutExerciseLog,
  ReadingSessionRecord,
  BookResourceItem,
  VideoResourceItem,
  ScreenTimeCategory,
  ScreenTimeAppUsage,
  ScreenTimeSessionRecord,
  ImpactDeedRecord,
  RelationshipContact,
  ContactChannel,
  AdaptiveReminderItem,
  AdaptiveReminderSettings
} from '../types';
import { SeedData } from '../data/seedData';
import { DateUtils } from '../utils/dateUtils';
import { soundManager } from '../utils/soundHaptics';
import { verifyPin } from '../utils/pinSecurity';
import {
  DEFAULT_ADAPTIVE_REMINDER_SETTINGS,
  generateAdaptiveReminders
} from '../utils/adaptiveReminderEngine';
import {
  AppVariantId,
  AppVariantConfig,
  APP_VARIANTS,
  getActiveVariantId,
  setActiveVariantId
} from '../config';
import { storagePersistence } from '../services/storagePersistence';
import { SM2Algorithm } from '../utils/sm2Algorithm';

export type NavigationTab = 'today' | 'growth' | 'reflect' | 'insights' | 'skills' | 'learn' | 'urge' | 'stats' | 'journal' | 'videos' | 'books';

interface AppContextType {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  currentVariant: AppVariantId;
  variantConfig: AppVariantConfig;
  switchVariant: (variantId: AppVariantId) => Promise<void>;
  isVariantModalOpen: boolean;
  setIsVariantModalOpen: (open: boolean) => void;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  level: number;
  currentXp: number;
  neededXp: number;
  rankTitle: string;
  totalXp: number;
  awardXp: (amount: number, reason?: string) => void;
  awardCoins: (amount: number) => void;
  deductCoins: (amount: number) => boolean;
  toggleHabit: (habitId: string, customXp?: number) => void;
  incrementCountHabit: (habitId: string, delta: number) => void;
  updateSliderHabit: (habitId: string, level: number) => void;
  togglePillar: (pillarId: string) => void;
  createPillar: (pillarData: {
    name: string;
    emoji: string;
    color?: string;
    description?: string;
  }) => void;
  updatePillar: (id: string, updates: Partial<NodeItem>) => void;
  deletePillar: (id: string) => void;
  reorderPillars: (orderedIds: string[]) => void;
  moveSkillNode: (skillId: string, newParentId: string) => void;
  archivePillar: (id: string, isArchived: boolean) => void;
  claimWeeklyQuest: (questId: string) => void;
  saveJournalEntry: (entryText: string, mood: number, tags: string[]) => void;
  addGoodDeed: (target: 'self' | 'others', text: string) => void;
  logUrgeWave: (waveData: {
    trigger: string;
    preIntensity: number;
    postIntensity: number;
    want: string;
    choice: string;
    note: string;
    somaticSensations: string[];
    contextTags: string[];
    outcomeStatus: 'SURFED' | 'RESISTED' | 'PARTIAL_LAPSE' | 'FULL_LAPSE';
    durationSeconds: number;
  }) => void;
  recordAntiGoalSlip: (id: string) => void;
  advanceAntiGoalStreak: (id: string) => void;
  updateLifeSprintMilestone: (idx: number) => void;
  updateCircadianConfig: (cfg: Partial<CircadianConfig>) => void;
  updatePinConfig: (enabled: boolean, hash: string, lockJournal: boolean, lockUrges: boolean, lockAppLaunch: boolean) => void;
  unlockWithPin: (pin: string) => Promise<boolean>;
  isUnlocked: boolean;
  lockNow: () => void;
  toggleLowEnergy: () => void;
  toggleTheme: () => void;
  teachBackLearnItem: (id: string, explanation: string, masteryRating: number) => void;
  updateBookChapter: (bookId: string, chapterId: string, read: boolean) => void;
  saveBookNote: (bookId: string, note: string) => void;
  saveVideoNote: (videoId: string, note: string) => void;
  addVideoResource: (video: Omit<VideoResourceItem, 'id' | 'isFavorite' | 'playCount'> & { isFavorite?: boolean }) => void;
  deleteVideoResource: (videoId: string) => void;
  toggleVideoFavorite: (videoId: string) => void;
  logVideoStudySession: (videoId: string, minutes: number, notes?: string) => void;
  createBackupSnapshot: (label: string) => void;
  restoreBackupSnapshot: (snapshotId: string) => boolean;
  exportStateJson: () => string;
  importStateJson: (json: string) => boolean;
  addSkillNode: (node: Omit<NodeItem, 'id'>) => void;
  updateSkillNode: (id: string, updates: Partial<NodeItem>) => void;
  deleteSkillNode: (id: string) => void;
  toggleLowEnergyEssential: (id: string) => void;
  addRoadmapGoal: (goal: Omit<RoadmapGoal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRoadmapGoal: (id: string, updates: Partial<RoadmapGoal>) => void;
  deleteRoadmapGoal: (id: string) => void;
  addRoadmapStep: (step: Omit<RoadmapStep, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRoadmapStep: (id: string, updates: Partial<RoadmapStep>) => void;
  deleteRoadmapStep: (id: string) => void;
  toggleRoadmapStepComplete: (id: string) => void;
  addRoadmapTag: (name: string, color: string) => void;
  deleteRoadmapTag: (id: string) => void;

  // Progression Lab & Unified Activity Log
  addMeasurableTarget: (target: Omit<MeasurableTarget, 'id' | 'createdAt' | 'updatedAt' | 'currentProgress'>) => void;
  updateMeasurableTarget: (id: string, updates: Partial<MeasurableTarget>) => void;
  deleteMeasurableTarget: (id: string) => void;
  toggleTargetStatus: (id: string, newStatus: TargetStatus) => void;
  toggleTargetMilestone: (targetId: string, milestoneId: string) => void;
  logActivityRecord: (data: {
    title: string;
    domain: ActivityRecord['domain'];
    value: number;
    unit: string;
    durationMinutes?: number;
    targetId?: string | null;
    skillId?: string | null;
    roadmapGoalId?: string | null;
    notes?: string;
    tagIds: string[];
    isPlanned?: boolean;
    metadata?: Record<string, any>;
  }) => void;
  deleteActivityRecord: (id: string) => void;
  addSharedTag: (tag: Omit<SharedTag, 'id'>) => void;
  updateSharedTag: (id: string, updates: Partial<SharedTag>) => void;
  deleteSharedTag: (id: string) => void;

  // Workout & Physical Training Progression
  saveWorkoutSession: (session: {
    routineName: string;
    routineId?: string | null;
    durationMinutes: number;
    exercises: WorkoutExerciseLog[];
    overallRpe?: number;
    notes?: string;
    date?: string;
  }) => void;
  deleteWorkoutSession: (id: string) => void;
  addCustomExercise: (exercise: Omit<ExerciseItem, 'id' | 'isCustom'>) => void;
  deleteCustomExercise: (id: string) => void;
  addWorkoutTemplate: (template: Omit<WorkoutRoutineTemplate, 'id' | 'isCustom' | 'createdAt'>) => void;
  deleteWorkoutTemplate: (id: string) => void;

  // Reading & Knowledge Progression
  logReadingSession: (session: {
    bookId?: string | null;
    bookTitle: string;
    author?: string;
    startPage: number;
    endPage: number;
    durationMinutes: number;
    notes?: string;
    favoriteQuote?: string;
    date?: string;
  }) => void;
  deleteReadingSession: (id: string) => void;
  addCustomBook: (book: Omit<BookResourceItem, 'id' | 'isCustom'>) => void;
  updateBookReadingStatus: (bookId: string, status: BookResourceItem['status'], userRating?: number) => void;

  // Digital Wellbeing & Screen-Time Progression
  logScreenTimeSession: (session: {
    appName: string;
    appId?: string;
    category: ScreenTimeCategory;
    durationMinutes: number;
    isIntentional: boolean;
    notes?: string;
    triggerCue?: string;
    date?: string;
  }) => void;
  deleteScreenTimeSession: (id: string) => void;
  addScreenTimeApp: (app: Omit<ScreenTimeAppUsage, 'id'>) => void;
  updateScreenTimeApp: (id: string, updates: Partial<ScreenTimeAppUsage>) => void;
  deleteScreenTimeApp: (id: string) => void;

  // Daily Impact & Meaningful Actions Progression
  logImpactDeed: (deed: Omit<ImpactDeedRecord, 'id' | 'timestamp' | 'xpEarned' | 'coinsEarned' | 'activityRecordId'>) => void;
  deleteImpactDeed: (id: string) => void;
  addRelationshipContact: (contact: Omit<RelationshipContact, 'id' | 'totalCheckIns'>) => void;
  updateRelationshipContact: (id: string, updates: Partial<RelationshipContact>) => void;
  deleteRelationshipContact: (id: string) => void;
  logRelationshipCheckIn: (contactId: string, notes?: string, channel?: ContactChannel) => void;

  // Adaptive Reminder Hub
  activeReminders: AdaptiveReminderItem[];
  isReminderModalOpen: boolean;
  setIsReminderModalOpen: (open: boolean) => void;
  updateAdaptiveReminderSettings: (updates: Partial<AdaptiveReminderSettings>) => void;
  snoozeReminder: (reminderId: string, durationMinutes: number) => void;
  dismissReminderForToday: (reminderId: string) => void;
  clearReminderSnooze: (reminderId: string) => void;

  isActionSheetOpen: boolean;
  setIsActionSheetOpen: (open: boolean) => void;
  showToast: (msg: string) => void;
  toastMessage: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'bloomquest_state_v19';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentVariant, setCurrentVariant] = useState<AppVariantId>(() => getActiveVariantId());
  const [isVariantModalOpen, setIsVariantModalOpen] = useState<boolean>(false);

  const [state, setState] = useState<AppState>(() => {
    try {
      const activeVar = getActiveVariantId();
      const variantKey = `selfcare_hero_${activeVar}_hardware_state`;
      const saved = localStorage.getItem(variantKey) || localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const candidate = parsed.data || parsed;
        if (candidate && candidate.v) {
          if (!candidate.roadmapGoals) candidate.roadmapGoals = SeedData.getInitialRoadmapGoals();
          if (!candidate.roadmapSteps) candidate.roadmapSteps = SeedData.getInitialRoadmapSteps();
          if (!candidate.roadmapTags) candidate.roadmapTags = SeedData.getInitialRoadmapTags();
          if (!candidate.measurableTargets) candidate.measurableTargets = SeedData.getInitialMeasurableTargets();
          if (!candidate.activityRecords) candidate.activityRecords = SeedData.getInitialActivityRecords();
          if (!candidate.sharedTags) candidate.sharedTags = SeedData.getInitialSharedTags();
          if (!candidate.exerciseLibrary) candidate.exerciseLibrary = SeedData.getInitialExerciseLibrary();
          if (!candidate.workoutTemplates) candidate.workoutTemplates = SeedData.getInitialWorkoutTemplates();
          if (!candidate.workoutSessions) candidate.workoutSessions = SeedData.getInitialWorkoutSessions();
          if (!candidate.readingSessions) candidate.readingSessions = SeedData.getInitialReadingSessions();
          if (!candidate.screenTimeApps) candidate.screenTimeApps = SeedData.getInitialScreenTimeApps();
          if (!candidate.screenTimeSessions) candidate.screenTimeSessions = SeedData.getInitialScreenTimeSessions();
          if (!candidate.impactDeeds) candidate.impactDeeds = SeedData.getInitialImpactDeeds();
          if (!candidate.relationshipContacts) candidate.relationshipContacts = SeedData.getInitialRelationshipContacts();
          if (!candidate.adaptiveReminderSettings) candidate.adaptiveReminderSettings = { ...DEFAULT_ADAPTIVE_REMINDER_SETTINGS };
          return candidate;
        }
      }
    } catch {
      // ignore
    }
    return SeedData.createInitialState();
  });

  const [activeTab, setActiveTab] = useState<NavigationTab>('today');
  const [isActionSheetOpen, setIsActionSheetOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(!state.pinLockEnabled || !state.lockAppLaunch);

  // Reconcile and load hardware persistence (IndexedDB + SharedPreferences) on mount or variant change
  useEffect(() => {
    let isMounted = true;
    storagePersistence.loadState(currentVariant).then(loadedState => {
      if (isMounted && loadedState) {
        setState(loadedState);
      }
    });
    return () => { isMounted = false; };
  }, [currentVariant]);

  // Dual-Layer Hardware Persistence on state mutations
  useEffect(() => {
    storagePersistence.persistState(currentVariant, state);
  }, [currentVariant, state]);

  const switchVariant = async (newVariant: AppVariantId) => {
    setCurrentVariant(newVariant);
    setActiveVariantId(newVariant);
    const variantState = await storagePersistence.loadState(newVariant);
    setState(variantState);
  };

  const variantConfig = useMemo(() => {
    return APP_VARIANTS[currentVariant] || APP_VARIANTS.core;
  }, [currentVariant]);

  // Sync HTML theme class
  useEffect(() => {
    if (state.isDarkMode) {
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
    }
  }, [state.isDarkMode]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // XP & Level calculations
  const totalXp = state.ev.reduce((sum, e) => sum + e.x, 35);
  const level = Math.floor(totalXp / 100) + 1;
  const currentXp = totalXp % 100;
  const neededXp = 100;

  const rankTitles = [
    'Novice Sentinel',
    'Apprentice Bloom',
    'Mindful Adept',
    'Keystone Warden',
    'Somatic Guardian',
    'Equanimity Master',
    'Sage Architect'
  ];
  const rankTitle = rankTitles[Math.min(level - 1, rankTitles.length - 1)];

  const triggerXpFeedback = (amount: number, reason?: string) => {
    const prevLevel = level;
    const nextTotal = totalXp + amount;
    const nextLevel = Math.floor(nextTotal / 100) + 1;

    if (nextLevel > prevLevel) {
      soundManager.playChime('levelUp');
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
      showToast(`🎉 Level Up! You reached Level ${nextLevel}: ${rankTitles[Math.min(nextLevel - 1, rankTitles.length - 1)]}!`);
    } else {
      soundManager.playChime('success');
      if (reason) showToast(`+${amount} XP: ${reason}`);
    }
  };

  const awardXp = (amount: number, reason?: string) => {
    const newEvent = {
      t: Date.now(),
      d: DateUtils.todayStr(),
      n: 'xp_award',
      c: 1,
      x: amount
    };

    setState(prev => ({
      ...prev,
      ev: [...prev.ev, newEvent]
    }));

    triggerXpFeedback(amount, reason);
  };

  const awardCoins = (amount: number) => {
    setState(prev => ({
      ...prev,
      coins: prev.coins + amount
    }));
    soundManager.vibrate(20);
  };

  const deductCoins = (amount: number): boolean => {
    if (state.coins < amount) {
      showToast('⚠️ Not enough Carrot-Coins!');
      return false;
    }
    setState(prev => ({
      ...prev,
      coins: prev.coins - amount
    }));
    return true;
  };

  const toggleHabit = (habitId: string, customXp: number = 15) => {
    const today = DateUtils.todayStr();
    const existingIndex = state.ev.findIndex(e => e.n === habitId && e.d === today);

    if (existingIndex >= 0) {
      // Uncheck habit cleanly: remove this specific habit event so totalXp decreases symmetrically
      setState(prev => ({
        ...prev,
        ev: prev.ev.filter((_, idx) => idx !== existingIndex)
      }));
      soundManager.playChime('click');
    } else {
      // Check habit: event stores customXp directly in ev (no duplicate 'xp_award' entry)
      const newEvent = {
        t: Date.now(),
        d: today,
        n: habitId,
        c: 1,
        x: customXp
      };
      triggerXpFeedback(customXp, 'Habit completed');
      awardCoins(2);

      // Check habit stack link
      const stack = state.habitStacks.find(s => s.triggerHabitId === habitId);
      if (stack) {
        showToast(`⚡ Habit Stack: ${stack.promptMessage} (+${stack.momentumBonusXp} XP available)`);
      }

      // Update weekly quests progress
      setState(prev => {
        const nextQuests = prev.weeklyQuests.map(q => {
          if (q.questType === 'vitality' && ['w', 'm1', 'm2', 'c1', 'c2'].includes(habitId)) {
            const nextP = q.currentProgress + 1;
            return { ...q, currentProgress: nextP, isCompleted: nextP >= q.targetCount };
          }
          if (q.questType === 'consistency') {
            const nextP = q.currentProgress + 1;
            return { ...q, currentProgress: nextP, isCompleted: nextP >= q.targetCount };
          }
          return q;
        });

        return {
          ...prev,
          ev: [...prev.ev, newEvent],
          weeklyQuests: nextQuests
        };
      });
    }
  };

  const incrementCountHabit = (habitId: string, delta: number) => {
    const today = DateUtils.todayStr();
    const existing = state.ev.find(e => e.n === habitId && e.d === today);
    const curCount = existing ? existing.c : 0;
    const nextCount = Math.max(0, curCount + delta);

    if (nextCount > curCount) {
      triggerXpFeedback(5, 'Count logged');
      awardCoins(1);
    } else if (nextCount < curCount) {
      soundManager.playChime('click');
    }

    setState(prev => {
      const filtered = prev.ev.filter(e => !(e.n === habitId && e.d === today));
      if (nextCount > 0) {
        filtered.push({
          t: Date.now(),
          d: today,
          n: habitId,
          c: nextCount,
          x: nextCount * 5
        });
      }
      return { ...prev, ev: filtered };
    });
  };

  const updateSliderHabit = (habitId: string, levelVal: number) => {
    setState(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === habitId ? { ...n, sliderLevel: levelVal } : n)
    }));
    awardXp(10, 'Step updated');
  };

  const togglePillar = (pillarId: string) => {
    const today = DateUtils.todayStr();
    const isDone = state.ev.some(e => e.n === pillarId && e.d === today);

    if (isDone) {
      setState(prev => ({
        ...prev,
        ev: prev.ev.filter(e => !(e.n === pillarId && e.d === today))
      }));
      soundManager.playChime('click');
    } else {
      triggerXpFeedback(15, `${pillarId.toUpperCase()} pillar secured`);
      awardCoins(1);
      const newEvent = {
        t: Date.now(),
        d: today,
        n: pillarId,
        c: 1,
        x: 15
      };

      setState(prev => {
        const nextEv = [...prev.ev, newEvent];
        // Check if all 3 pillars are secured today
        const hasLearn = nextEv.some(e => e.n === 'learn' && e.d === today);
        const hasBuild = nextEv.some(e => e.n === 'build' && e.d === today);
        const hasBody = nextEv.some(e => e.n === 'body' && e.d === today);

        let nextStreak = { ...prev.dailyThreeStreak };
        if (hasLearn && hasBuild && hasBody && nextStreak.lastCompletedDate !== today) {
          nextStreak = {
            cur: nextStreak.cur + 1,
            best: Math.max(nextStreak.cur + 1, nextStreak.best),
            lastCompletedDate: today
          };
          showToast(`🛡️ Daily Three All Secured! Streak: ${nextStreak.cur} Days! (+30 XP Bonus)`);
        }

        return {
          ...prev,
          ev: nextEv,
          dailyThreeStreak: nextStreak
        };
      });
    }
  };

  const claimWeeklyQuest = (questId: string) => {
    const quest = state.weeklyQuests.find(q => q.id === questId);
    if (!quest || !quest.isCompleted || quest.isClaimed) return;

    awardCoins(quest.rewardCoins);
    awardXp(quest.rewardXp, `Claimed ${quest.title}`);
    soundManager.playChime('levelUp');

    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.5 }
      });
    } catch {
      // ignore
    }

    setState(prev => ({
      ...prev,
      weeklyQuests: prev.weeklyQuests.map(q => q.id === questId ? { ...q, isClaimed: true } : q)
    }));
  };

  const saveJournalEntry = (entryText: string, mood: number, tags: string[]) => {
    const newEntry: JournalEntry = {
      id: 'jr_' + Date.now(),
      d: DateUtils.todayStr(),
      m: mood,
      t: entryText,
      g: tags
    };

    awardXp(20, 'Reflection journal deposited');
    awardCoins(2);

    setState(prev => ({
      ...prev,
      jr: [newEntry, ...prev.jr],
      weeklyQuests: prev.weeklyQuests.map(q => {
        if (q.questType === 'wisdom') {
          const nextP = q.currentProgress + 1;
          return { ...q, currentProgress: nextP, isCompleted: nextP >= q.targetCount };
        }
        return q;
      })
    }));
  };

  const addGoodDeed = (target: 'self' | 'others', text: string) => {
    const newDeed = {
      id: 'gd_' + Date.now(),
      d: DateUtils.todayStr(),
      tm: DateUtils.nowTimeStr(),
      target,
      text
    };

    awardXp(15, 'Kind deed recorded');
    awardCoins(1);

    setState(prev => ({
      ...prev,
      goodDeeds: [newDeed, ...prev.goodDeeds]
    }));
  };

  const logUrgeWave = (waveData: {
    trigger: string;
    preIntensity: number;
    postIntensity: number;
    want: string;
    choice: string;
    note: string;
    somaticSensations: string[];
    contextTags: string[];
    outcomeStatus: 'SURFED' | 'RESISTED' | 'PARTIAL_LAPSE' | 'FULL_LAPSE';
    durationSeconds: number;
  }) => {
    const coins = waveData.outcomeStatus === 'SURFED' ? 15 : 10;
    const xp = waveData.outcomeStatus === 'SURFED' ? 35 : 25;

    const newUrge: UrgeItem = {
      id: 'urg_' + Date.now(),
      d: DateUtils.todayStr(),
      tm: DateUtils.nowTimeStr(),
      level: waveData.preIntensity,
      coinsEarned: coins,
      xpEarned: xp,
      ...waveData
    };

    awardCoins(coins);
    awardXp(xp, `Urge wave surfed! Outcome: ${waveData.outcomeStatus}`);

    setState(prev => ({
      ...prev,
      urges: [newUrge, ...prev.urges]
    }));
  };

  const recordAntiGoalSlip = (id: string) => {
    setState(prev => ({
      ...prev,
      antiGoals: prev.antiGoals.map(ag => ag.id === id ? { ...ag, slipsCountToday: ag.slipsCountToday + 1, cleanStreakDays: 0 } : ag)
    }));
    showToast('🌱 Slip acknowledged with compassion. Reset and anchor the next positive move.');
  };

  const advanceAntiGoalStreak = (id: string) => {
    setState(prev => ({
      ...prev,
      antiGoals: prev.antiGoals.map(ag => ag.id === id ? {
        ...ag,
        cleanStreakDays: ag.cleanStreakDays + 1,
        lastCleanDate: DateUtils.todayStr()
      } : ag)
    }));
    awardXp(15, 'Anti-Goal Clean Day');
    awardCoins(1);
  };

  const updateLifeSprintMilestone = (idx: number) => {
    setState(prev => {
      if (!prev.activeSprint) return prev;
      return {
        ...prev,
        activeSprint: {
          ...prev.activeSprint,
          currentMilestoneIdx: idx
        }
      };
    });
    awardXp(30, 'Life sprint milestone advanced');
    awardCoins(5);
  };

  const updateCircadianConfig = (cfg: Partial<CircadianConfig>) => {
    setState(prev => ({
      ...prev,
      circadianConfig: { ...prev.circadianConfig, ...cfg }
    }));
    showToast('Circadian schedule updated');
  };

  const updatePinConfig = (enabled: boolean, hash: string, lockJournal: boolean, lockUrges: boolean, lockAppLaunch: boolean) => {
    setState(prev => ({
      ...prev,
      pinLockEnabled: enabled,
      pinHash: hash,
      lockJournal,
      lockUrges,
      lockAppLaunch
    }));
    showToast('PIN privacy settings updated');
  };

  const unlockWithPin = async (pin: string): Promise<boolean> => {
    if (!state.pinLockEnabled) {
      setIsUnlocked(true);
      return true;
    }
    const ok = await verifyPin(pin, state.pinHash);
    if (ok) {
      setIsUnlocked(true);
      soundManager.playChime('success');
      return true;
    } else {
      soundManager.vibrate([40, 60, 40]);
      return false;
    }
  };

  const lockNow = () => {
    if (state.pinLockEnabled) {
      setIsUnlocked(false);
      showToast('🔒 Locked');
    }
  };

  const toggleLowEnergy = () => {
    setState(prev => {
      const next = !prev.lowEnergyMode;
      showToast(next ? '🌿 Low-Energy Mode: Focus on 3 vital essentials' : '☀️ Standard Mode: Full view restored');
      return { ...prev, lowEnergyMode: next };
    });
  };

  const toggleTheme = () => {
    setState(prev => ({
      ...prev,
      isDarkMode: !prev.isDarkMode
    }));
  };

  const teachBackLearnItem = (id: string, explanation: string, masteryRating: number) => {
    const today = DateUtils.todayStr();

    setState(prev => {
      const targetItem = prev.learnStack.find(item => item.id === id);
      // Map mastery rating to SM-2 quality grade (3 -> 5 perfect, 2 -> 4 good, 1 -> 2 fail)
      const sm2Grade = masteryRating === 3 ? 5 : masteryRating === 2 ? 4 : 2;
      const sm2Result = SM2Algorithm.calculate(
        {
          repetitions: targetItem?.teachBackCount || 0,
          intervalDays: 1,
          easeFactor: 2.5
        },
        sm2Grade
      );

      return {
        ...prev,
        learnStack: prev.learnStack.map(item => item.id === id ? {
          ...item,
          userExplanation: explanation,
          masteryRating,
          teachBackCount: sm2Result.repetitions,
          lastTeachBackDate: today,
          nextReviewDue: sm2Result.nextReviewDate
        } : item),
        weeklyQuests: prev.weeklyQuests.map(q => {
          if (q.questType === 'wisdom') {
            const nextP = q.currentProgress + 1;
            return { ...q, currentProgress: nextP, isCompleted: nextP >= q.targetCount };
          }
          return q;
        })
      };
    });

    awardXp(25, 'Teach-back mastery recorded');
    awardCoins(3);
  };

  const updateBookChapter = (bookId: string, chapterId: string, read: boolean) => {
    setState(prev => ({
      ...prev,
      bookResources: prev.bookResources.map(b => {
        if (b.id !== bookId) return b;
        const nextChapters = b.chapters.map(c => c.id === chapterId ? { ...c, read } : c);
        const readCount = nextChapters.filter(c => c.read).length;
        const pct = Math.round((readCount / nextChapters.length) * 100);
        return {
          ...b,
          chapters: nextChapters,
          readingProgressPercent: pct,
          status: pct >= 100 ? 'completed' : pct > 0 ? 'reading' : b.status
        };
      })
    }));
    awardXp(15, 'Chapter completed');
  };

  const saveBookNote = (bookId: string, note: string) => {
    setState(prev => ({
      ...prev,
      bookResources: prev.bookResources.map(b => b.id === bookId ? { ...b, userNotes: note } : b)
    }));
    awardXp(10, 'Book notes updated');
  };

  const saveVideoNote = (videoId: string, note: string) => {
    setState(prev => ({
      ...prev,
      videoResources: prev.videoResources.map(v => v.id === videoId ? { ...v, userNotes: note } : v)
    }));
    awardXp(10, 'Video notes updated');
  };

  const addVideoResource = (video: Omit<VideoResourceItem, 'id' | 'isFavorite' | 'playCount'> & { isFavorite?: boolean }) => {
    const newVideo: VideoResourceItem = {
      ...video,
      id: 'vid_' + Date.now(),
      isFavorite: video.isFavorite ?? false,
      playCount: 0,
      isCustom: true
    };
    setState(prev => ({
      ...prev,
      videoResources: [newVideo, ...prev.videoResources]
    }));
    awardXp(15, 'Added new masterclass');
    awardCoins(1);
    showToast(`Masterclass added: ${video.title}`);
    soundManager.playChime('success');
  };

  const deleteVideoResource = (videoId: string) => {
    setState(prev => ({
      ...prev,
      videoResources: prev.videoResources.filter(v => v.id !== videoId)
    }));
    showToast('Masterclass removed');
    soundManager.playChime('click');
  };

  const toggleVideoFavorite = (videoId: string) => {
    setState(prev => ({
      ...prev,
      videoResources: prev.videoResources.map(v => v.id === videoId ? { ...v, isFavorite: !v.isFavorite } : v)
    }));
    soundManager.playChime('click');
  };

  const logVideoStudySession = (videoId: string, minutes: number, notes?: string) => {
    const vid = state.videoResources.find(v => v.id === videoId);
    if (!vid) return;

    setState(prev => ({
      ...prev,
      videoResources: prev.videoResources.map(v => v.id === videoId ? {
        ...v,
        playCount: (v.playCount || 0) + 1,
        lastPlayedTimestamp: Date.now(),
        userNotes: notes !== undefined ? notes : v.userNotes,
        lastNotesTimestamp: notes !== undefined ? Date.now() : v.lastNotesTimestamp
      } : v)
    }));

    // Record in unified activity log
    logActivityRecord({
      title: `Masterclass: ${vid.title}`,
      domain: 'learning',
      value: minutes || 15,
      unit: 'min',
      durationMinutes: minutes || 15,
      notes: notes || `Studied masterclass: ${vid.title}`,
      tagIds: vid.tags || []
    });

    awardXp(20, 'Masterclass study session complete');
    awardCoins(2);
    showToast(`Masterclass logged: +20 XP, +2 🪙`);
    soundManager.playChime('levelUp');
  };

  const createBackupSnapshot = (label: string) => {
    const snap: BackupSnapshot = {
      id: 'snap_' + Date.now(),
      timestamp: Date.now(),
      label,
      level,
      xp: currentXp,
      skillsCount: state.nodes.filter(n => n.p !== '0').length,
      stateJson: JSON.stringify(state)
    };

    setState(prev => ({
      ...prev,
      snapshots: [snap, ...prev.snapshots].slice(0, 10)
    }));
    showToast(`Snapshot '${label}' created successfully`);
  };

  const restoreBackupSnapshot = (snapshotId: string): boolean => {
    const snap = state.snapshots.find(s => s.id === snapshotId);
    if (!snap) return false;
    try {
      const parsed = JSON.parse(snap.stateJson);
      setState(parsed);
      showToast(`Restored snapshot: ${snap.label}`);
      return true;
    } catch {
      showToast('⚠️ Failed to restore snapshot');
      return false;
    }
  };

  const exportStateJson = (): string => {
    return JSON.stringify(state, null, 2);
  };

  const importStateJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && Array.isArray(parsed.nodes)) {
        setState(parsed);
        showToast('State successfully imported!');
        return true;
      }
    } catch {
      showToast('⚠️ Invalid JSON backup format');
    }
    return false;
  };

  const addSkillNode = (nodeData: Omit<NodeItem, 'id'>) => {
    const newNode: NodeItem = {
      id: 'node_' + Date.now(),
      ...nodeData
    };
    setState(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));
    awardXp(15, 'New skill added');
  };

  const deleteSkillNode = (id: string) => {
    setState(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== id && n.p !== id),
      lowEnergyEssentialIds: prev.lowEnergyEssentialIds.filter(x => x !== id)
    }));
    showToast('Habit removed');
  };

  const updateSkillNode = (id: string, updates: Partial<NodeItem>) => {
    setState(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => (n.id === id ? { ...n, ...updates } : n))
    }));
    soundManager.playChime('click');
    showToast('Habit updated');
  };

  const createPillar = (pillarData: {
    name: string;
    emoji: string;
    color?: string;
    description?: string;
  }) => {
    const rootPillars = state.nodes.filter(n => n.p === '0');
    const newPillar: NodeItem = {
      id: 'pillar_' + Date.now(),
      p: '0',
      e: pillarData.emoji || '🏛️',
      n: pillarData.name.trim(),
      k: 'check',
      g: 1,
      nature: 'skill',
      importance: 'high',
      color: pillarData.color || '#3D7D62',
      description: pillarData.description?.trim() || '',
      isCustom: true,
      isArchived: false,
      order: rootPillars.length
    };

    setState(prev => ({
      ...prev,
      nodes: [...prev.nodes, newPillar]
    }));
    awardXp(25, 'New Pillar Created');
    awardCoins(2);
    soundManager.playChime('levelUp');
    showToast(`🏛️ Created Pillar '${newPillar.n}' (+25 XP, +2 🪙)`);
  };

  const updatePillar = (id: string, updates: Partial<NodeItem>) => {
    setState(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => (n.id === id ? { ...n, ...updates } : n))
    }));
    soundManager.playChime('click');
    showToast('Pillar updated');
  };

  const deletePillar = (id: string) => {
    setState(prev => {
      // Find or create 'unassigned' archive pillar
      const existingUnassigned = prev.nodes.find(n => n.id === 'unassigned');
      let updatedNodes = [...prev.nodes];

      if (!existingUnassigned) {
        const unassignedPillar: NodeItem = {
          id: 'unassigned',
          p: '0',
          e: '📦',
          n: 'Unassigned Archive',
          k: 'check',
          g: 1,
          nature: 'skill',
          importance: 'low',
          color: '#859A90',
          description: 'Skills safely retained from removed pillars',
          isCustom: false,
          isArchived: true,
          order: 999
        };
        updatedNodes.push(unassignedPillar);
      }

      // Reparent all immediate children of this pillar to 'unassigned'
      updatedNodes = updatedNodes.map(n => {
        if (n.p === id) {
          return { ...n, p: 'unassigned' };
        }
        return n;
      });

      // Remove the pillar itself
      updatedNodes = updatedNodes.filter(n => n.id !== id);

      return {
        ...prev,
        nodes: updatedNodes
      };
    });

    soundManager.playChime('click');
    showToast('Pillar removed (child skills moved to Unassigned Archive)');
  };

  const reorderPillars = (orderedIds: string[]) => {
    setState(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => {
        const idx = orderedIds.indexOf(n.id);
        if (idx !== -1) {
          return { ...n, order: idx };
        }
        return n;
      })
    }));
  };

  const moveSkillNode = (skillId: string, newParentId: string) => {
    setState(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => (n.id === skillId ? { ...n, p: newParentId } : n))
    }));
    soundManager.playChime('click');
    showToast('Skill moved successfully');
  };

  const archivePillar = (id: string, isArchived: boolean) => {
    setState(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => (n.id === id ? { ...n, isArchived } : n))
    }));
    soundManager.playChime('click');
    showToast(isArchived ? 'Pillar archived' : 'Pillar restored from archive');
  };

  const toggleLowEnergyEssential = (id: string) => {
    setState(prev => {
      const exists = prev.lowEnergyEssentialIds.includes(id);
      const nextIds = exists
        ? prev.lowEnergyEssentialIds.filter(x => x !== id)
        : [...prev.lowEnergyEssentialIds, id];
      return {
        ...prev,
        lowEnergyEssentialIds: nextIds
      };
    });
    soundManager.playChime('click');
  };

  // Roadmap Operations
  const addRoadmapGoal = (goalData: Omit<RoadmapGoal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    const newGoal: RoadmapGoal = {
      ...goalData,
      id: 'goal_' + now,
      createdAt: now,
      updatedAt: now,
    };
    setState(prev => ({
      ...prev,
      roadmapGoals: [newGoal, ...prev.roadmapGoals]
    }));
    awardXp(20, 'New Learning Goal Created');
    showToast('🎯 Learning Goal Created (+20 XP)');
  };

  const updateRoadmapGoal = (id: string, updates: Partial<RoadmapGoal>) => {
    const now = Date.now();
    setState(prev => ({
      ...prev,
      roadmapGoals: prev.roadmapGoals.map(g => (g.id === id ? { ...g, ...updates, updatedAt: now } : g))
    }));
    showToast('Goal updated');
  };

  const deleteRoadmapGoal = (id: string) => {
    setState(prev => ({
      ...prev,
      roadmapGoals: prev.roadmapGoals.filter(g => g.id !== id),
      roadmapSteps: prev.roadmapSteps.filter(s => s.goalId !== id)
    }));
    showToast('Learning goal deleted');
  };

  const addRoadmapStep = (stepData: Omit<RoadmapStep, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    const newStep: RoadmapStep = {
      ...stepData,
      id: 'step_' + now,
      createdAt: now,
      updatedAt: now,
    };
    setState(prev => ({
      ...prev,
      roadmapSteps: [...prev.roadmapSteps, newStep]
    }));
    awardXp(10, 'Prerequisite step added');
    showToast('Prerequisite step added (+10 XP)');
  };

  const updateRoadmapStep = (id: string, updates: Partial<RoadmapStep>) => {
    const now = Date.now();
    setState(prev => ({
      ...prev,
      roadmapSteps: prev.roadmapSteps.map(s => (s.id === id ? { ...s, ...updates, updatedAt: now } : s))
    }));
    showToast('Step updated');
  };

  const deleteRoadmapStep = (id: string) => {
    setState(prev => ({
      ...prev,
      roadmapSteps: prev.roadmapSteps.filter(s => s.id !== id && s.parentId !== id)
    }));
    showToast('Step deleted');
  };

  const toggleRoadmapStepComplete = (id: string) => {
    const target = state.roadmapSteps.find(s => s.id === id);
    if (!target) return;
    const nextCompleted = !target.isCompleted;
    const now = Date.now();

    setState(prev => ({
      ...prev,
      roadmapSteps: prev.roadmapSteps.map(s => (s.id === id ? { ...s, isCompleted: nextCompleted, updatedAt: now } : s))
    }));

    if (nextCompleted) {
      soundManager.playChime('success');
      awardXp(15, 'Prerequisite completed');
      awardCoins(1);
      confetti({ particleCount: 20, spread: 45, origin: { y: 0.8 } });
      showToast('🌟 Prerequisite step completed (+15 XP, +1 🪙)');
    } else {
      showToast('Step marked uncompleted');
    }
  };

  const addRoadmapTag = (name: string, color: string) => {
    const newTag: RoadmapTag = {
      id: 'tag_' + Date.now(),
      name,
      color,
    };
    setState(prev => ({
      ...prev,
      roadmapTags: [...prev.roadmapTags, newTag]
    }));
    showToast(`Tag "${name}" created`);
  };

  const deleteRoadmapTag = (id: string) => {
    setState(prev => ({
      ...prev,
      roadmapTags: prev.roadmapTags.filter(t => t.id !== id)
      // Per instructions: "When deleting a tag, do not delete the learning items associated with it."
    }));
    showToast('Tag deleted');
  };

  // === PROGRESSION LAB & ACTIVITY LOG METHODS ===
  const addMeasurableTarget = (targetData: Omit<MeasurableTarget, 'id' | 'createdAt' | 'updatedAt' | 'currentProgress'>) => {
    const now = Date.now();
    const newTarget: MeasurableTarget = {
      ...targetData,
      id: 'target_' + now + '_' + Math.random().toString(36).substring(2, 6),
      currentProgress: targetData.baselineValue || 0,
      createdAt: now,
      updatedAt: now,
    };
    setState(prev => ({
      ...prev,
      measurableTargets: [newTarget, ...prev.measurableTargets]
    }));
    soundManager.playChime('click');
    showToast(`Target "${targetData.title}" created`);
  };

  const updateMeasurableTarget = (id: string, updates: Partial<MeasurableTarget>) => {
    const now = Date.now();
    setState(prev => ({
      ...prev,
      measurableTargets: prev.measurableTargets.map(t => (t.id === id ? { ...t, ...updates, updatedAt: now } : t))
    }));
    showToast('Target updated');
  };

  const deleteMeasurableTarget = (id: string) => {
    setState(prev => ({
      ...prev,
      measurableTargets: prev.measurableTargets.filter(t => t.id !== id)
    }));
    showToast('Target removed');
  };

  const toggleTargetStatus = (id: string, newStatus: TargetStatus) => {
    const now = Date.now();
    setState(prev => ({
      ...prev,
      measurableTargets: prev.measurableTargets.map(t => (t.id === id ? { ...t, status: newStatus, updatedAt: now } : t))
    }));
    showToast(`Target marked ${newStatus}`);
  };

  const toggleTargetMilestone = (targetId: string, milestoneId: string) => {
    const target = state.measurableTargets.find(t => t.id === targetId);
    if (!target) return;
    const milestone = target.milestones.find(m => m.id === milestoneId);
    if (!milestone) return;
    const nextCompleted = !milestone.isCompleted;
    const now = Date.now();

    const updatedMilestones = target.milestones.map(m =>
      m.id === milestoneId ? { ...m, isCompleted: nextCompleted, completedAt: nextCompleted ? now : undefined } : m
    );

    const completedCount = updatedMilestones.filter(m => m.isCompleted).length;
    const newProgress = target.type === 'milestone' ? completedCount : target.currentProgress;

    setState(prev => ({
      ...prev,
      measurableTargets: prev.measurableTargets.map(t =>
        t.id === targetId ? { ...t, milestones: updatedMilestones, currentProgress: newProgress, updatedAt: now } : t
      )
    }));

    if (nextCompleted) {
      soundManager.playChime('success');
      awardXp(25, `Milestone reached: ${milestone.title}`);
      awardCoins(2);
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
      showToast(`🎯 Milestone reached: ${milestone.title} (+25 XP, +2 🪙)`);
    } else {
      showToast('Milestone uncompleted');
    }
  };

  const logActivityRecord = (data: {
    title: string;
    domain: ActivityRecord['domain'];
    value: number;
    unit: string;
    durationMinutes?: number;
    targetId?: string | null;
    skillId?: string | null;
    roadmapGoalId?: string | null;
    notes?: string;
    tagIds: string[];
    isPlanned?: boolean;
    metadata?: Record<string, any>;
  }) => {
    const now = Date.now();
    const today = DateUtils.todayStr();
    const baseXp = Math.min(50, Math.max(10, Math.round(data.value > 0 ? (data.durationMinutes ? data.durationMinutes * 0.5 : 15) : 10)));
    const coinsEarned = Math.max(1, Math.floor(baseXp / 10));

    const newRecord: ActivityRecord = {
      id: 'act_' + now + '_' + Math.random().toString(36).substring(2, 6),
      date: today,
      timestamp: now,
      title: data.title,
      domain: data.domain,
      targetId: data.targetId || null,
      skillId: data.skillId || null,
      roadmapGoalId: data.roadmapGoalId || null,
      value: data.value,
      unit: data.unit,
      durationMinutes: data.durationMinutes,
      notes: data.notes,
      tagIds: data.tagIds,
      isPlanned: data.isPlanned !== false,
      metadata: data.metadata,
      xpEarned: baseXp,
      coinsEarned: coinsEarned
    };

    let targetCelebration = false;

    setState(prev => {
      let updatedTargets = prev.measurableTargets;
      if (data.targetId) {
        updatedTargets = prev.measurableTargets.map(t => {
          if (t.id === data.targetId) {
            const oldProgress = t.currentProgress;
            const nextProgress = oldProgress + data.value;
            if (!t.isReductionTarget && oldProgress < t.targetValue && nextProgress >= t.targetValue) {
              targetCelebration = true;
            }
            return {
              ...t,
              currentProgress: nextProgress,
              lastLoggedAt: now,
              updatedAt: now
            };
          }
          return t;
        });
      }

      // Update shared tag usage
      const updatedSharedTags = prev.sharedTags.map(tag => {
        if (data.tagIds.includes(tag.id)) {
          return { ...tag, usageCount: (tag.usageCount || 0) + 1 };
        }
        return tag;
      });

      // Also link to habit event log if linkedSkillId / skillId exists
      let updatedEv = prev.ev;
      const effectiveSkillId = data.skillId || (data.targetId ? prev.measurableTargets.find(t => t.id === data.targetId)?.linkedSkillId : null);
      if (effectiveSkillId) {
        const existingEvIndex = prev.ev.findIndex(e => e.n === effectiveSkillId && e.d === today);
        if (existingEvIndex >= 0) {
          updatedEv = prev.ev.map((e, idx) => (idx === existingEvIndex ? { ...e, c: e.c + 1, x: e.x + baseXp, t: now } : e));
        } else {
          updatedEv = [...prev.ev, { t: now, d: today, n: effectiveSkillId, c: 1, x: baseXp }];
        }
      } else {
        // Record domain-level activity event in ev so XP is recorded exactly once
        updatedEv = [...prev.ev, { t: now, d: today, n: `act_${data.domain}`, c: 1, x: baseXp }];
      }

      return {
        ...prev,
        activityRecords: [newRecord, ...prev.activityRecords],
        measurableTargets: updatedTargets,
        sharedTags: updatedSharedTags,
        ev: updatedEv
      };
    });

    triggerXpFeedback(baseXp, `Logged: ${data.title}`);
    awardCoins(coinsEarned);

    if (targetCelebration) {
      soundManager.playChime('levelUp');
      confetti({ particleCount: 60, spread: 80, origin: { y: 0.7 } });
      showToast(`🏆 Target Achieved: ${data.title}! (+${baseXp} XP, +${coinsEarned} 🪙)`);
    }
  };

  const deleteActivityRecord = (id: string) => {
    setState(prev => {
      const recordToDelete = prev.activityRecords.find(a => a.id === id);
      if (!recordToDelete) return prev;

      // 1. Revert target progress if linked to measurable target
      let updatedTargets = prev.measurableTargets;
      if (recordToDelete.targetId) {
        updatedTargets = prev.measurableTargets.map(t => {
          if (t.id === recordToDelete.targetId) {
            const nextProgress = Math.max(0, t.currentProgress - recordToDelete.value);
            return {
              ...t,
              currentProgress: nextProgress,
              updatedAt: Date.now()
            };
          }
          return t;
        });
      }

      // 2. Decrement corresponding skill or act event in ev if present
      const effectiveSkillId = recordToDelete.skillId || (recordToDelete.targetId ? prev.measurableTargets.find(t => t.id === recordToDelete.targetId)?.linkedSkillId : null);
      const eventKey = effectiveSkillId || `act_${recordToDelete.domain}`;
      const recordXp = recordToDelete.xpEarned || 15;
      const updatedEv = prev.ev.map(e => {
        if (e.n === eventKey && e.d === recordToDelete.date) {
          return {
            ...e,
            c: Math.max(0, e.c - 1),
            x: Math.max(0, e.x - recordXp)
          };
        }
        return e;
      }).filter(e => e.c > 0 || e.x > 0);

      // 3. Remove corresponding session records across domains
      const updatedWorkouts = prev.workoutSessions.filter(w => w.activityRecordId !== id);
      const updatedReading = prev.readingSessions.filter(r => r.activityRecordId !== id);
      const updatedScreenTime = (prev.screenTimeSessions || []).filter(s => s.activityRecordId !== id);
      const updatedImpact = (prev.impactDeeds || []).filter(d => d.activityRecordId !== id);

      return {
        ...prev,
        activityRecords: prev.activityRecords.filter(a => a.id !== id),
        measurableTargets: updatedTargets,
        ev: updatedEv,
        workoutSessions: updatedWorkouts,
        readingSessions: updatedReading,
        screenTimeSessions: updatedScreenTime,
        impactDeeds: updatedImpact
      };
    });
    soundManager.playChime('click');
    showToast('Activity record removed and targets synchronized');
  };

  const addSharedTag = (tag: Omit<SharedTag, 'id'>) => {
    const newTag: SharedTag = {
      ...tag,
      id: 'tag_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      usageCount: 0
    };
    setState(prev => ({
      ...prev,
      sharedTags: [...prev.sharedTags, newTag]
    }));
    showToast(`Tag "${tag.name}" added`);
  };

  const updateSharedTag = (id: string, updates: Partial<SharedTag>) => {
    setState(prev => ({
      ...prev,
      sharedTags: prev.sharedTags.map(t => (t.id === id ? { ...t, ...updates } : t))
    }));
    showToast('Tag updated');
  };

  const deleteSharedTag = (id: string) => {
    setState(prev => ({
      ...prev,
      sharedTags: prev.sharedTags.filter(t => t.id !== id)
    }));
    showToast('Tag deleted');
  };

  // Workout & Physical Training Progression
  const saveWorkoutSession = (session: {
    routineName: string;
    routineId?: string | null;
    durationMinutes: number;
    exercises: WorkoutExerciseLog[];
    overallRpe?: number;
    notes?: string;
    date?: string;
  }) => {
    const sessionDate = session.date || DateUtils.todayStr();
    const sessionId = 'ws_' + Date.now();
    const actId = 'act_' + Date.now();

    // 1. Calculate volume metrics
    let totalVolumeReps = 0;
    let totalVolumeKg = 0;
    let totalPushupReps = 0;

    session.exercises.forEach(ex => {
      ex.sets.forEach(set => {
        if (set.isCompleted) {
          totalVolumeReps += set.reps;
          totalVolumeKg += set.reps * (set.weightKg || 0);
          if (ex.exerciseId.includes('pushup') || ex.exerciseName.toLowerCase().includes('push-up') || ex.exerciseName.toLowerCase().includes('pushup')) {
            totalPushupReps += set.reps;
          }
        }
      });
    });

    // 2. Check and record Personal Bests
    const newPersonalBests: string[] = [];
    const updatedExerciseLibrary = state.exerciseLibrary.map(ex => {
      const match = session.exercises.find(e => e.exerciseId === ex.id);
      if (!match) return ex;

      const completedSets = match.sets.filter(s => s.isCompleted);
      if (completedSets.length === 0) return ex;

      const sessionMaxReps = Math.max(...completedSets.map(s => s.reps));
      const sessionMaxWeight = Math.max(...completedSets.map(s => s.weightKg || 0));

      const prevPb = ex.personalBest || {};
      let brokePb = false;
      const nextPb = { ...prevPb, lastPerformedDate: sessionDate };

      if (!prevPb.maxReps || sessionMaxReps > prevPb.maxReps) {
        if (sessionMaxReps > 0 && prevPb.maxReps) {
          newPersonalBests.push(`${ex.name}: ${sessionMaxReps} reps (PR)`);
        }
        nextPb.maxReps = sessionMaxReps;
        brokePb = true;
      }

      if (sessionMaxWeight > 0 && (!prevPb.maxWeightKg || sessionMaxWeight > prevPb.maxWeightKg)) {
        if (prevPb.maxWeightKg) {
          newPersonalBests.push(`${ex.name}: ${sessionMaxWeight}kg (PR)`);
        }
        nextPb.maxWeightKg = sessionMaxWeight;
        brokePb = true;
      }

      return brokePb ? { ...ex, personalBest: nextPb } : ex;
    });

    // 3. Calculate XP & Coins
    const baseXp = 25 + Math.min(30, Math.floor(totalVolumeReps / 5)) + (session.overallRpe && session.overallRpe >= 8 ? 10 : 0);
    const coinsEarned = 3 + (newPersonalBests.length > 0 ? 2 : 0);

    // 4. Create Activity Record for Unified Daily Log
    const newActivityRecord: ActivityRecord = {
      id: actId,
      date: sessionDate,
      timestamp: Date.now(),
      title: session.routineName || 'Physical Training Workout',
      domain: 'workout',
      value: totalVolumeReps > 0 ? totalVolumeReps : session.durationMinutes,
      unit: totalVolumeReps > 0 ? 'reps' : 'min',
      durationMinutes: session.durationMinutes,
      notes: session.notes || (newPersonalBests.length ? 'New PBs: ' + newPersonalBests.join(', ') : `Completed ${session.exercises.length} exercises with ${totalVolumeReps} total reps.`),
      tagIds: ['tag_fit_strength', 'tag_fit_calisthenics'],
      isPlanned: true,
      xpEarned: baseXp,
      coinsEarned,
      metadata: {
        routineId: session.routineId,
        exerciseCount: session.exercises.length,
        totalVolumeReps,
        totalVolumeKg,
        overallRpe: session.overallRpe,
        newPersonalBests
      }
    };

    // 5. Create WorkoutSessionRecord
    const newWorkoutSession: WorkoutSessionRecord = {
      id: sessionId,
      date: sessionDate,
      timestamp: Date.now(),
      routineName: session.routineName,
      routineId: session.routineId,
      durationMinutes: session.durationMinutes,
      totalVolumeReps,
      totalVolumeKg,
      exercises: session.exercises,
      overallRpe: session.overallRpe,
      notes: session.notes,
      activityRecordId: actId,
      xpEarned: baseXp,
      coinsEarned,
      newPersonalBests
    };

    // 6. Update linked measurable targets (e.g. push-ups target)
    let updatedTargets = state.measurableTargets.map(t => {
      // Direct push-up target update
      if (t.id === 'target_pushups' && totalPushupReps > 0) {
        const nextProg = t.currentProgress + totalPushupReps;
        return {
          ...t,
          currentProgress: nextProg,
          lastLoggedAt: Date.now(),
          updatedAt: Date.now()
        };
      }
      // Or target explicitly linked to this routine
      if (session.routineId && t.id === state.workoutTemplates.find(r => r.id === session.routineId)?.linkedTargetId) {
        const nextProg = t.currentProgress + (t.unit === 'min' ? session.durationMinutes : totalVolumeReps);
        return {
          ...t,
          currentProgress: nextProg,
          lastLoggedAt: Date.now(),
          updatedAt: Date.now()
        };
      }
      return t;
    });

    // 7. Update AppState with all records and Body skill XP event
    setState(prev => ({
      ...prev,
      coins: prev.coins + coinsEarned,
      exerciseLibrary: updatedExerciseLibrary,
      workoutSessions: [newWorkoutSession, ...prev.workoutSessions],
      activityRecords: [newActivityRecord, ...prev.activityRecords],
      measurableTargets: updatedTargets,
      ev: [
        ...prev.ev,
        {
          t: Date.now(),
          d: sessionDate,
          n: 'body', // awards to Body pillar!
          c: 1,
          x: baseXp
        }
      ]
    }));

    // Audio & celebratory feedback
    if (newPersonalBests.length > 0) {
      soundManager.playChime('levelUp');
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      showToast(`🔥 Workout Complete! PR broken: ${newPersonalBests[0]} (+${baseXp} XP, +${coinsEarned} 🪙)`);
    } else {
      soundManager.playChime('success');
      showToast(`💪 Workout Logged: ${session.routineName} (+${baseXp} XP, +${coinsEarned} 🪙)`);
    }
  };

  const deleteWorkoutSession = (id: string) => {
    setState(prev => {
      const targetActId = prev.workoutSessions.find(w => w.id === id)?.activityRecordId;
      return {
        ...prev,
        workoutSessions: prev.workoutSessions.filter(w => w.id !== id),
        activityRecords: targetActId ? prev.activityRecords.filter(a => a.id !== targetActId) : prev.activityRecords
      };
    });
    soundManager.playChime('click');
    showToast('Workout session removed');
  };

  const addCustomExercise = (exercise: Omit<ExerciseItem, 'id' | 'isCustom'>) => {
    const newEx: ExerciseItem = {
      ...exercise,
      id: 'ex_custom_' + Date.now(),
      isCustom: true
    };
    setState(prev => ({
      ...prev,
      exerciseLibrary: [...prev.exerciseLibrary, newEx]
    }));
    showToast(`Added exercise: ${exercise.name}`);
  };

  const deleteCustomExercise = (id: string) => {
    setState(prev => ({
      ...prev,
      exerciseLibrary: prev.exerciseLibrary.filter(e => e.id !== id)
    }));
    showToast('Exercise removed');
  };

  const addWorkoutTemplate = (template: Omit<WorkoutRoutineTemplate, 'id' | 'isCustom' | 'createdAt'>) => {
    const newTpl: WorkoutRoutineTemplate = {
      ...template,
      id: 'tpl_custom_' + Date.now(),
      isCustom: true,
      createdAt: Date.now()
    };
    setState(prev => ({
      ...prev,
      workoutTemplates: [newTpl, ...prev.workoutTemplates]
    }));
    showToast(`Created workout routine: ${template.name}`);
  };

  const deleteWorkoutTemplate = (id: string) => {
    setState(prev => ({
      ...prev,
      workoutTemplates: prev.workoutTemplates.filter(t => t.id !== id)
    }));
    showToast('Routine deleted');
  };

  // Reading & Knowledge Progression
  const logReadingSession = (session: {
    bookId?: string | null;
    bookTitle: string;
    author?: string;
    startPage: number;
    endPage: number;
    durationMinutes: number;
    notes?: string;
    favoriteQuote?: string;
    date?: string;
  }) => {
    const sessionDate = session.date || DateUtils.todayStr();
    const sessionId = 'rs_' + Date.now();
    const actId = 'act_' + Date.now();

    const pagesRead = Math.max(0, session.endPage - session.startPage);
    const readingSpeedPpm =
      session.durationMinutes > 0
        ? Math.round((pagesRead / (session.durationMinutes / 60)) * 10) / 10
        : 0;

    const baseXp = 15 + Math.min(30, Math.floor(pagesRead / 2));
    const coinsEarned = 2 + (pagesRead >= 20 ? 1 : 0);

    // 1. Create Unified Activity Record
    const newActivityRecord: ActivityRecord = {
      id: actId,
      date: sessionDate,
      timestamp: Date.now(),
      title: `Reading: ${session.bookTitle}`,
      domain: 'reading',
      value: pagesRead,
      unit: 'pages',
      durationMinutes: session.durationMinutes,
      notes:
        session.notes ||
        (session.favoriteQuote ? `"${session.favoriteQuote}"` : `Read pages ${session.startPage}–${session.endPage}`),
      tagIds: ['tag_read_nonfiction'],
      isPlanned: true,
      xpEarned: baseXp,
      coinsEarned,
      metadata: {
        bookId: session.bookId,
        startPage: session.startPage,
        endPage: session.endPage,
        readingSpeedPpm,
        favoriteQuote: session.favoriteQuote
      }
    };

    // 2. Create ReadingSessionRecord
    const newReadingSession: ReadingSessionRecord = {
      id: sessionId,
      bookId: session.bookId,
      bookTitle: session.bookTitle,
      author: session.author,
      date: sessionDate,
      timestamp: Date.now(),
      startPage: session.startPage,
      endPage: session.endPage,
      pagesRead,
      durationMinutes: session.durationMinutes,
      notes: session.notes,
      favoriteQuote: session.favoriteQuote,
      readingSpeedPpm,
      activityRecordId: actId,
      xpEarned: baseXp,
      coinsEarned
    };

    // 3. Update Book in Library if bookId matches
    let bookFinished = false;
    const updatedBooks = state.bookResources.map(b => {
      if (session.bookId && b.id === session.bookId) {
        const nextPages = Math.max(b.pagesRead || 0, session.endPage);
        const nextPercent = b.totalPages > 0 ? Math.min(100, Math.round((nextPages / b.totalPages) * 100)) : 100;
        const isNowFinished = nextPages >= b.totalPages;
        if (isNowFinished && b.status !== 'completed') {
          bookFinished = true;
        }

        const quotes = b.favoriteQuotes || [];
        if (session.favoriteQuote && !quotes.includes(session.favoriteQuote)) {
          quotes.push(session.favoriteQuote);
        }

        return {
          ...b,
          pagesRead: nextPages,
          readingProgressPercent: nextPercent,
          status: isNowFinished ? ('completed' as const) : ('reading' as const),
          completedDate: isNowFinished ? sessionDate : b.completedDate,
          lastReadTimestamp: Date.now(),
          favoriteQuotes: quotes
        };
      }
      return b;
    });

    // 4. Update linked reading measurable targets (e.g. target_reading)
    const updatedTargets = state.measurableTargets.map(t => {
      if (t.category === 'reading' || t.id === 'target_reading') {
        const nextProg = t.currentProgress + (t.unit === 'pages' ? pagesRead : session.durationMinutes);
        return {
          ...t,
          currentProgress: nextProg,
          lastLoggedAt: Date.now(),
          updatedAt: Date.now()
        };
      }
      return t;
    });

    // 5. Update AppState
    setState(prev => ({
      ...prev,
      coins: prev.coins + coinsEarned,
      bookResources: updatedBooks,
      readingSessions: [newReadingSession, ...prev.readingSessions],
      activityRecords: [newActivityRecord, ...prev.activityRecords],
      measurableTargets: updatedTargets,
      ev: [
        ...prev.ev,
        {
          t: Date.now(),
          d: sessionDate,
          n: 'l2', // awards to Learn pillar!
          c: 1,
          x: baseXp
        }
      ]
    }));

    if (bookFinished) {
      soundManager.playChime('levelUp');
      confetti({ particleCount: 80, spread: 90, origin: { y: 0.6 } });
      showToast(`🎉 Book Finished: ${session.bookTitle}! (+${baseXp + 50} XP, +${coinsEarned + 10} 🪙)`);
    } else {
      soundManager.playChime('success');
      showToast(`📖 Reading Logged: ${pagesRead} pages in ${session.durationMinutes}m (+${baseXp} XP, +${coinsEarned} 🪙)`);
    }
  };

  const deleteReadingSession = (id: string) => {
    setState(prev => {
      const targetActId = prev.readingSessions.find(r => r.id === id)?.activityRecordId;
      return {
        ...prev,
        readingSessions: prev.readingSessions.filter(r => r.id !== id),
        activityRecords: targetActId ? prev.activityRecords.filter(a => a.id !== targetActId) : prev.activityRecords
      };
    });
    soundManager.playChime('click');
    showToast('Reading session removed');
  };

  const addCustomBook = (book: Omit<BookResourceItem, 'id' | 'isCustom'>) => {
    const newBook: BookResourceItem = {
      ...book,
      id: 'book_custom_' + Date.now(),
      isCustom: true
    };
    setState(prev => ({
      ...prev,
      bookResources: [...prev.bookResources, newBook]
    }));
    showToast(`Added "${book.title}" to reading library`);
  };

  const updateBookReadingStatus = (
    bookId: string,
    status: BookResourceItem['status'],
    userRating?: number
  ) => {
    setState(prev => ({
      ...prev,
      bookResources: prev.bookResources.map(b => {
        if (b.id === bookId) {
          return {
            ...b,
            status,
            userRating: userRating !== undefined ? userRating : b.userRating,
            completedDate: status === 'completed' ? DateUtils.todayStr() : b.completedDate
          };
        }
        return b;
      })
    }));
    showToast('Book status updated');
  };

  // Digital Wellbeing & Screen-Time Progression
  const logScreenTimeSession = (session: {
    appName: string;
    appId?: string;
    category: ScreenTimeCategory;
    durationMinutes: number;
    isIntentional: boolean;
    notes?: string;
    triggerCue?: string;
    date?: string;
  }) => {
    const sessionDate = session.date || DateUtils.todayStr();
    const sessionId = 'st_' + Date.now();
    const actId = 'act_' + Date.now();

    // 1. Create Activity Record for Unified Daily Log
    const newActivityRecord: ActivityRecord = {
      id: actId,
      date: sessionDate,
      timestamp: Date.now(),
      title: `Screen Time: ${session.appName} (${session.isIntentional ? 'Intentional' : 'Doom-scroll / Slip'})`,
      domain: 'screentime',
      value: session.durationMinutes,
      unit: 'min',
      durationMinutes: session.durationMinutes,
      notes: session.notes || (session.triggerCue ? `Trigger: ${session.triggerCue}` : undefined),
      tagIds: ['tag_well_screen'],
      isPlanned: session.isIntentional,
      metadata: {
        appId: session.appId,
        appName: session.appName,
        category: session.category,
        isIntentional: session.isIntentional,
        triggerCue: session.triggerCue
      }
    };

    // 2. Create ScreenTimeSessionRecord
    const newSession: ScreenTimeSessionRecord = {
      id: sessionId,
      appId: session.appId,
      appName: session.appName,
      category: session.category,
      date: sessionDate,
      timestamp: Date.now(),
      durationMinutes: session.durationMinutes,
      isIntentional: session.isIntentional,
      notes: session.notes,
      triggerCue: session.triggerCue,
      activityRecordId: actId
    };

    // 3. Accumulate into reduction target target_doomscroll
    const updatedTargets = state.measurableTargets.map(t => {
      if (t.id === 'target_doomscroll' || (t.category === 'digital' && t.isReductionTarget)) {
        return {
          ...t,
          currentProgress: t.currentProgress + session.durationMinutes,
          lastLoggedAt: Date.now(),
          updatedAt: Date.now()
        };
      }
      return t;
    });

    // 4. Update Anti-Goal if mindless doom-scroll
    let antiGoalsUpdated = state.antiGoals;
    if (!session.isIntentional) {
      antiGoalsUpdated = state.antiGoals.map(ag => {
        if (ag.id === 'q') {
          return {
            ...ag,
            slipsCountToday: ag.slipsCountToday + 1
          };
        }
        return ag;
      });
    }

    setState(prev => ({
      ...prev,
      screenTimeSessions: [newSession, ...prev.screenTimeSessions],
      activityRecords: [newActivityRecord, ...prev.activityRecords],
      measurableTargets: updatedTargets,
      antiGoals: antiGoalsUpdated
    }));

    if (session.isIntentional) {
      soundManager.playChime('success');
      awardXp(10, 'Intentional screen time recorded');
      showToast(`🛡️ Intentional ${session.appName} session logged (${session.durationMinutes}m)`);
    } else {
      soundManager.playChime('timer');
      showToast(`📱 ${session.appName} logged (${session.durationMinutes}m). Take a mindful pause!`);
    }
  };

  const deleteScreenTimeSession = (id: string) => {
    setState(prev => {
      const targetActId = prev.screenTimeSessions.find(s => s.id === id)?.activityRecordId;
      return {
        ...prev,
        screenTimeSessions: prev.screenTimeSessions.filter(s => s.id !== id),
        activityRecords: targetActId ? prev.activityRecords.filter(a => a.id !== targetActId) : prev.activityRecords
      };
    });
    soundManager.playChime('click');
    showToast('Screen time record removed');
  };

  const addScreenTimeApp = (app: Omit<ScreenTimeAppUsage, 'id'>) => {
    const newApp: ScreenTimeAppUsage = {
      id: 'app_' + Date.now(),
      ...app
    };
    setState(prev => ({
      ...prev,
      screenTimeApps: [...prev.screenTimeApps, newApp]
    }));
    showToast(`Added ${app.name} to monitored apps`);
  };

  const updateScreenTimeApp = (id: string, updates: Partial<ScreenTimeAppUsage>) => {
    setState(prev => ({
      ...prev,
      screenTimeApps: prev.screenTimeApps.map(a => a.id === id ? { ...a, ...updates } : a)
    }));
    showToast('App ceiling updated');
  };

  const deleteScreenTimeApp = (id: string) => {
    setState(prev => ({
      ...prev,
      screenTimeApps: prev.screenTimeApps.filter(a => a.id !== id)
    }));
    showToast('App removed from monitored list');
  };

  // === DAILY IMPACT & MEANINGFUL ACTIONS PROGRESSION ===
  const logImpactDeed = (deed: Omit<ImpactDeedRecord, 'id' | 'timestamp' | 'xpEarned' | 'coinsEarned' | 'activityRecordId'>) => {
    const today = deed.date || DateUtils.todayStr();
    const deedId = 'deed_' + Date.now();
    const actId = 'act_' + Date.now();

    const xpEarned = Math.round(15 + Math.min(5, Math.max(1, deed.impactRating)) * 3);
    const coinsEarned = deed.impactRating >= 4 ? 2 : 1;

    const newDeed: ImpactDeedRecord = {
      id: deedId,
      title: deed.title,
      category: deed.category,
      recipientType: deed.recipientType,
      recipientName: deed.recipientName,
      linkedContactId: deed.linkedContactId,
      date: today,
      timestamp: Date.now(),
      notes: deed.notes,
      impactRating: deed.impactRating,
      activityRecordId: actId,
      xpEarned,
      coinsEarned
    };

    const newActivityRecord: ActivityRecord = {
      id: actId,
      date: today,
      timestamp: Date.now(),
      title: deed.title,
      domain: 'impact',
      value: 1,
      unit: 'deed',
      notes: deed.notes ? `${deed.notes} (Recipient: ${deed.recipientName || deed.recipientType}, Impact: ${deed.impactRating}/5)` : undefined,
      tagIds: ['tag_impact_kind'],
      isPlanned: false,
      xpEarned,
      coinsEarned,
      metadata: {
        category: deed.category,
        recipientType: deed.recipientType,
        recipientName: deed.recipientName,
        impactRating: deed.impactRating,
        linkedContactId: deed.linkedContactId
      }
    };

    const updatedTargets = state.measurableTargets.map(t => {
      if (t.id === 'target_kindness' || (t.category === 'impact' && t.type === 'quantity')) {
        return {
          ...t,
          currentProgress: t.currentProgress + 1,
          lastLoggedAt: Date.now(),
          updatedAt: Date.now()
        };
      }
      return t;
    });

    let updatedContacts = state.relationshipContacts;
    if (deed.linkedContactId) {
      updatedContacts = state.relationshipContacts.map(c => {
        if (c.id === deed.linkedContactId) {
          return {
            ...c,
            lastCheckInDate: today,
            totalCheckIns: c.totalCheckIns + 1
          };
        }
        return c;
      });
    }

    setState(prev => ({
      ...prev,
      impactDeeds: [newDeed, ...prev.impactDeeds],
      activityRecords: [newActivityRecord, ...prev.activityRecords],
      measurableTargets: updatedTargets,
      relationshipContacts: updatedContacts
    }));

    soundManager.playChime('success');
    awardXp(xpEarned, `Kind deed recorded (+${xpEarned} XP)`);
    awardCoins(coinsEarned);
    showToast(`🌱 Meaningful act recorded: ${deed.title} (+${xpEarned} XP, +${coinsEarned} 🪙)`);
  };

  const deleteImpactDeed = (id: string) => {
    setState(prev => {
      const targetActId = prev.impactDeeds.find(d => d.id === id)?.activityRecordId;
      return {
        ...prev,
        impactDeeds: prev.impactDeeds.filter(d => d.id !== id),
        activityRecords: targetActId ? prev.activityRecords.filter(a => a.id !== targetActId) : prev.activityRecords
      };
    });
    soundManager.playChime('click');
    showToast('Impact deed removed');
  };

  const addRelationshipContact = (contact: Omit<RelationshipContact, 'id' | 'totalCheckIns'>) => {
    const newContact: RelationshipContact = {
      id: 'contact_' + Date.now(),
      totalCheckIns: 0,
      ...contact
    };
    setState(prev => ({
      ...prev,
      relationshipContacts: [...prev.relationshipContacts, newContact]
    }));
    soundManager.playChime('click');
    showToast(`Added ${contact.name} to your relationship circle`);
  };

  const updateRelationshipContact = (id: string, updates: Partial<RelationshipContact>) => {
    setState(prev => ({
      ...prev,
      relationshipContacts: prev.relationshipContacts.map(c => (c.id === id ? { ...c, ...updates } : c))
    }));
    soundManager.playChime('click');
    showToast('Contact updated');
  };

  const deleteRelationshipContact = (id: string) => {
    setState(prev => ({
      ...prev,
      relationshipContacts: prev.relationshipContacts.filter(c => c.id !== id)
    }));
    showToast('Contact removed');
  };

  const logRelationshipCheckIn = (contactId: string, notes?: string, channel?: ContactChannel) => {
    const contact = state.relationshipContacts.find(c => c.id === contactId);
    if (!contact) return;
    const today = DateUtils.todayStr();
    const deedId = 'deed_' + Date.now();
    const actId = 'act_' + Date.now();
    const ch = channel || contact.preferredChannel || 'call';
    const channelLabel = ch === 'call' ? 'phone call' : ch === 'text' ? 'message' : ch === 'coffee' ? 'coffee catch-up' : ch === 'in_person' ? 'in-person visit' : 'letter';

    const newDeed: ImpactDeedRecord = {
      id: deedId,
      title: `Checked in with ${contact.name} via ${channelLabel}`,
      category: 'kindness_other',
      recipientType: contact.relationshipType === 'partner' ? 'partner' : contact.relationshipType === 'family' ? 'family' : 'friend',
      recipientName: contact.name,
      linkedContactId: contact.id,
      date: today,
      timestamp: Date.now(),
      notes: notes || `Meaningful reach-out via ${channelLabel}. Sustaining cadence (${contact.targetCadenceDays}d target).`,
      impactRating: 4,
      activityRecordId: actId,
      xpEarned: 25,
      coinsEarned: 2
    };

    const newActivityRecord: ActivityRecord = {
      id: actId,
      date: today,
      timestamp: Date.now(),
      title: `Touchpoint: ${contact.name} (${channelLabel})`,
      domain: 'impact',
      value: 1,
      unit: 'touchpoint',
      notes: notes || `Meaningful social check-in with ${contact.name}`,
      tagIds: ['tag_impact_kind'],
      isPlanned: false,
      xpEarned: 25,
      coinsEarned: 2,
      metadata: {
        contactId: contact.id,
        contactName: contact.name,
        channel: ch
      }
    };

    const updatedTargets = state.measurableTargets.map(t => {
      if (t.id === 'target_kindness' || (t.category === 'impact' && t.type === 'quantity')) {
        return {
          ...t,
          currentProgress: t.currentProgress + 1,
          lastLoggedAt: Date.now(),
          updatedAt: Date.now()
        };
      }
      return t;
    });

    setState(prev => ({
      ...prev,
      relationshipContacts: prev.relationshipContacts.map(c => {
        if (c.id === contactId) {
          return {
            ...c,
            lastCheckInDate: today,
            totalCheckIns: c.totalCheckIns + 1
          };
        }
        return c;
      }),
      impactDeeds: [newDeed, ...prev.impactDeeds],
      activityRecords: [newActivityRecord, ...prev.activityRecords],
      measurableTargets: updatedTargets
    }));

    soundManager.playChime('success');
    awardXp(25, `Touchpoint with ${contact.name}`);
    awardCoins(2);
    showToast(`💌 Touchpoint with ${contact.name} recorded! (+25 XP, +2 🪙)`);
  };

  // Adaptive Reminders Management
  const [isReminderModalOpen, setIsReminderModalOpen] = useState<boolean>(false);
  const [reminderTick, setReminderTick] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setReminderTick(t => t + 1);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const activeReminders = useMemo(() => {
    return generateAdaptiveReminders(state);
  }, [state, reminderTick]);

  const updateAdaptiveReminderSettings = useCallback((updates: Partial<AdaptiveReminderSettings>) => {
    setState(prev => {
      const current = prev.adaptiveReminderSettings || { ...DEFAULT_ADAPTIVE_REMINDER_SETTINGS };
      return {
        ...prev,
        adaptiveReminderSettings: {
          ...current,
          ...updates,
          channels: {
            ...current.channels,
            ...(updates.channels || {})
          }
        }
      };
    });
  }, []);

  const snoozeReminder = useCallback((reminderId: string, durationMinutes: number) => {
    soundManager.playChime('click');
    const until = Date.now() + durationMinutes * 60 * 1000;
    setState(prev => {
      const current = prev.adaptiveReminderSettings || { ...DEFAULT_ADAPTIVE_REMINDER_SETTINGS };
      return {
        ...prev,
        adaptiveReminderSettings: {
          ...current,
          snoozedUntil: {
            ...(current.snoozedUntil || {}),
            [reminderId]: until
          }
        }
      };
    });
    showToast(`Snoozed for ${durationMinutes >= 60 ? Math.round(durationMinutes / 60) + 'h' : durationMinutes + 'm'}`);
  }, [showToast]);

  const dismissReminderForToday = useCallback((reminderId: string) => {
    soundManager.playChime('click');
    const today = DateUtils.todayStr();
    setState(prev => {
      const current = prev.adaptiveReminderSettings || { ...DEFAULT_ADAPTIVE_REMINDER_SETTINGS };
      return {
        ...prev,
        adaptiveReminderSettings: {
          ...current,
          dismissedToday: {
            ...(current.dismissedToday || {}),
            [reminderId]: today
          }
        }
      };
    });
    showToast('Dismissed for today');
  }, [showToast]);

  const clearReminderSnooze = useCallback((reminderId: string) => {
    setState(prev => {
      const current = prev.adaptiveReminderSettings || { ...DEFAULT_ADAPTIVE_REMINDER_SETTINGS };
      const updated = { ...(current.snoozedUntil || {}) };
      delete updated[reminderId];
      return {
        ...prev,
        adaptiveReminderSettings: {
          ...current,
          snoozedUntil: updated
        }
      };
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        activeTab,
        setActiveTab,
        activeReminders,
        isReminderModalOpen,
        setIsReminderModalOpen,
        updateAdaptiveReminderSettings,
        snoozeReminder,
        dismissReminderForToday,
        clearReminderSnooze,
        level,
        currentXp,
        neededXp,
        rankTitle,
        totalXp,
        awardXp,
        awardCoins,
        deductCoins,
        toggleHabit,
        incrementCountHabit,
        updateSliderHabit,
        togglePillar,
        claimWeeklyQuest,
        saveJournalEntry,
        addGoodDeed,
        logUrgeWave,
        recordAntiGoalSlip,
        advanceAntiGoalStreak,
        updateLifeSprintMilestone,
        updateCircadianConfig,
        updatePinConfig,
        unlockWithPin,
        isUnlocked,
        lockNow,
        toggleLowEnergy,
        toggleTheme,
        teachBackLearnItem,
        updateBookChapter,
        saveBookNote,
        saveVideoNote,
        addVideoResource,
        deleteVideoResource,
        toggleVideoFavorite,
        logVideoStudySession,
        createBackupSnapshot,
        restoreBackupSnapshot,
        exportStateJson,
        importStateJson,
        addSkillNode,
        updateSkillNode,
        deleteSkillNode,
        createPillar,
        updatePillar,
        deletePillar,
        reorderPillars,
        moveSkillNode,
        archivePillar,
        toggleLowEnergyEssential,
        addRoadmapGoal,
        updateRoadmapGoal,
        deleteRoadmapGoal,
        addRoadmapStep,
        updateRoadmapStep,
        deleteRoadmapStep,
        toggleRoadmapStepComplete,
        addRoadmapTag,
        deleteRoadmapTag,
        addMeasurableTarget,
        updateMeasurableTarget,
        deleteMeasurableTarget,
        toggleTargetStatus,
        toggleTargetMilestone,
        logActivityRecord,
        deleteActivityRecord,
        addSharedTag,
        updateSharedTag,
        deleteSharedTag,
        saveWorkoutSession,
        deleteWorkoutSession,
        addCustomExercise,
        deleteCustomExercise,
        addWorkoutTemplate,
        deleteWorkoutTemplate,
        logReadingSession,
        deleteReadingSession,
        addCustomBook,
        updateBookReadingStatus,
        logScreenTimeSession,
        deleteScreenTimeSession,
        addScreenTimeApp,
        updateScreenTimeApp,
        deleteScreenTimeApp,
        logImpactDeed,
        deleteImpactDeed,
        addRelationshipContact,
        updateRelationshipContact,
        deleteRelationshipContact,
        logRelationshipCheckIn,
        isActionSheetOpen,
        setIsActionSheetOpen,
        showToast,
        toastMessage,
        currentVariant,
        variantConfig,
        switchVariant,
        isVariantModalOpen,
        setIsVariantModalOpen,
        setState
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
};
