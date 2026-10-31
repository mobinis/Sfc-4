export interface RememorizeConfig {
  enabled: boolean;
  intervalDays: number;
  lastReviewed: number;
  nextDue: number;
  reviewCount: number;
}

export interface NodeItem {
  id: string;
  p: string; // parent id ("0" for root skills e.g. "learn", "build", "body", "mind", "care", "faith")
  e: string; // emoji icon
  n: string; // name
  k: 'check' | 'count' | 'quit' | 'step';
  g: number; // default goal
  weekdayGoals?: number[] | null;
  u?: string; // unit e.g. "glasses", "pages"
  sliderSteps?: string[] | null;
  sliderLevel?: number;
  nature: 'skill' | 'technique' | 'concept' | 'course' | 'habit';
  importance: 'critical' | 'high' | 'medium' | 'low';
  rememorize?: RememorizeConfig | null;
  ifThenAnchor?: string | null;
  routineTime?: 'morning' | 'afternoon' | 'evening' | 'anytime' | null;
  note?: string;
  lock?: boolean;
  isOpen?: boolean;
  color?: string;
  description?: string;
  isCustom?: boolean;
  isArchived?: boolean;
  order?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface EventRecord {
  t: number; // timestamp
  d: string; // YYYY-MM-DD
  n: string; // node ID or internal metric
  c: number; // count delta
  x: number; // XP delta
}

export interface LearnItem {
  id: string;
  title: string;
  category: 'bias' | 'communication' | 'selfhelp' | 'affirmation' | 'islamic' | 'custom';
  summary: string;
  whyNote: string;
  learnedDate: string;
  favorite?: boolean;
  teachBackNote?: string;
  reviewCount?: number;
  lastReviewed?: number;
  userExplanation?: string | null;
  masteryRating?: number | null; // 1: Struggled, 2: Solid, 3: Mastered
  teachBackCount?: number;
  lastTeachBackDate?: string | null;
  nextReviewDue?: string | null; // YYYY-MM-DD
}

export interface GoodDeedEntry {
  id: string;
  d: string;
  tm: string;
  target: 'self' | 'others';
  text: string;
}

export interface RewardItem {
  id: string;
  title: string;
  cost: number;
  icon: string;
  redeemedCount?: number;
}

export interface JournalEntry {
  id: string;
  d: string; // YYYY-MM-DD
  m: number; // 0..4 (Sad, Low, Neutral, Good, Great)
  t: string; // text
  g: string[]; // tags
}

export interface StudyTopic {
  id: string;
  n: string;
  ph: number; // phase (0..3)
  s: number; // spaced repetition step
  due: number; // timestamp due
}

export interface UrgeItem {
  id: string;
  d: string;
  tm: string;
  trigger: string;
  level: number; // 1..10
  want: string;
  choice: string;
  note: string;
  preIntensity: number;
  postIntensity?: number | null;
  somaticSensations: string[];
  contextTags: string[];
  outcomeStatus: 'SURFED' | 'RESISTED' | 'PARTIAL_LAPSE' | 'FULL_LAPSE';
  durationSeconds: number;
  coinsEarned: number;
  xpEarned: number;
}

export interface AlertItem {
  id: string;
  n: string;
  icon?: string;
  type?: 'custom' | 'medicine' | 'prayer' | 'skill';
  active?: boolean;
  tm: string;
  times?: string[];
  chainedOffsetMinutes?: number | null;
  skillId?: string | null;
  skillName?: string | null;
  days?: number[];
  repeatRule?: string;
  pillsCount?: number | null;
  pillsLowThreshold?: number | null;
  medNote?: string | null;
}

export interface DailyThreeStreakInfo {
  cur: number;
  best: number;
  lastCompletedDate: string;
}

export interface BackupSnapshot {
  id: string;
  timestamp: number;
  label: string;
  level: number;
  xp: number;
  skillsCount: number;
  stateJson: string;
}

export interface WeeklyReviewEntry {
  id: string;
  weekStartDate: string;
  weekEndDate: string;
  completedAt: number;
  winsText: string;
  frictionTags: string[];
  frictionNotes: string;
  focusSkillId?: string | null;
  focusSkillName?: string | null;
  xpAwarded: number;
}

export interface ComebackBonusInfo {
  pending: boolean;
  missedDays: number;
  bonusXp: number;
  bonusCoins: number;
  welcomeMessage: string;
}

export interface HabitStackLink {
  triggerHabitId: string;
  followUpHabitId: string;
  momentumBonusXp: number;
  promptMessage: string;
}

export interface AntiGoalItem {
  id: string;
  name: string;
  icon: string;
  category: 'digital' | 'health' | 'mindset';
  triggerCue: string;
  replacementAction: string;
  cleanStreakDays: number;
  lastCleanDate: string;
  slipsCountToday: number;
}

export interface LifeSprintGoal {
  id: string;
  title: string;
  identityStatement: string;
  startDateStr: string;
  totalDays: number;
  keyMilestones: string[];
  currentMilestoneIdx: number;
}

export interface CircadianConfig {
  wakeTimeStr: string;
  bedTimeStr: string;
  caffeineCutoffHoursBeforeSleep: number;
  screenCurfewHoursBeforeSleep: number;
  enabled: boolean;
}

export interface HabitContract {
  id: string;
  targetHabitId: string;
  targetHabitName: string;
  stakedCoins: number;
  startDateStr: string;
  targetDays: number;
  status: 'active' | 'won' | 'forfeited';
  multiplierReward: number;
  daysCompleted: number;
  lastLoggedDate: string;
  protectedDates: string[];
  completedDates: string[];
}

export interface RoutineStep {
  id: string;
  name: string;
  durationSeconds: number;
  linkedHabitId?: string | null;
  icon: string;
  guidanceNote: string;
}

export interface RoutineFlow {
  id: string;
  name: string;
  icon: string;
  targetTime: 'morning' | 'focus' | 'evening';
  description: string;
  steps: RoutineStep[];
}

export interface CopilotToolItem {
  id: string;
  type: string;
  label: string;
  payload: string;
  emoji: string;
}

export interface AiChatMessage {
  id: string;
  isUser: boolean;
  text: string;
  timestamp: number;
  actionSuggestion?: string | null;
  actionPayload?: string | null;
  toolItems?: CopilotToolItem[];
}

export interface WeeklyQuest {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'vitality' | 'mindfulness' | 'wisdom' | 'consistency';
  targetCount: number;
  currentProgress: number;
  rewardCoins: number;
  rewardXp: number;
  isCompleted: boolean;
  isClaimed: boolean;
  weekStartDate: string;
  questType: 'habit_any' | 'vitality' | 'wisdom' | 'consistency';
  linkedSkillIds?: string[];
}

export interface VideoResourceItem {
  id: string;
  title: string;
  url: string;
  category: string;
  durationLabel: string;
  description: string;
  thumbnailEmoji: string;
  tags: string[];
  isFavorite: boolean;
  lastPlayedTimestamp?: number;
  playCount?: number;
  userNotes?: string;
  lastNotesTimestamp?: number;
  isCustom?: boolean;
  platform?: string;
  instructor?: string;
  embedUrl?: string;
}

export interface BookChapter {
  id: string;
  title: string;
  summary: string;
  keyTakeaways: string[];
  practicalExercise: string;
  read: boolean;
}

export interface BookResourceItem {
  id: string;
  title: string;
  author: string;
  category: string;
  coverEmoji: string;
  subtitle: string;
  description: string;
  keyConcepts: string[];
  coreFramework: string;
  fullGuideContent: string;
  chapters: BookChapter[];
  readingProgressPercent: number;
  status: 'want_to_read' | 'reading' | 'paused' | 'completed' | 'abandoned';
  format?: 'physical' | 'ebook' | 'audiobook';
  userNotes: string;
  externalUrl: string;
  videoLinks?: string[];
  isFavorite: boolean;
  lastReadTimestamp?: number;
  pagesRead: number;
  totalPages: number;
  startDate?: string;
  completedDate?: string;
  userRating?: number; // 1-5 stars
  favoriteQuotes?: string[];
  keyTakeawaysReflections?: string;
  isCustom?: boolean;
}

export interface RoadmapTag {
  id: string;
  name: string;
  color: string;
}

export type RoadmapGoalStatus = 'planned' | 'in_progress' | 'paused' | 'completed' | 'archived';
export type RoadmapGoalPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface RoadmapStep {
  id: string;
  parentId?: string | null;
  goalId: string;
  title: string;
  description?: string;
  plannedDate?: string | null;
  sessionTime?: string | null;
  durationMinutes?: number | null;
  tagIds: string[];
  notes: string;
  isCompleted: boolean;
  isArchived?: boolean;
  order: number;
  createdAt: number;
  updatedAt: number;
  reminderEnabled?: boolean;
  resourceLinks?: { title: string; url: string }[];
}

export interface RoadmapGoal {
  id: string;
  title: string;
  description: string;
  plannedStartDate?: string | null;
  targetCompletionDate?: string | null;
  sessionTime?: string | null;
  estimatedDurationMinutes?: number | null;
  priority: RoadmapGoalPriority;
  status: RoadmapGoalStatus;
  tagIds: string[];
  notes: string;
  createdAt: number;
  updatedAt: number;
  linkedSkillId?: string | null;
  reminderEnabled?: boolean;
  resourceLinks?: { title: string; url: string }[];
}

// === PROGRESSION LAB & ACTIVITY LOG TYPES ===
export type TargetType = 'quantity' | 'duration' | 'frequency' | 'reduction' | 'milestone' | 'consistency';
export type TrackingPeriod = 'daily' | 'weekly' | 'monthly' | 'custom';
export type TargetStatus = 'active' | 'paused' | 'completed' | 'archived';
export type TargetCategory = 'fitness' | 'reading' | 'learning' | 'wellbeing' | 'digital' | 'impact' | 'work' | 'general';
export type TagScope = 'universal' | 'fitness' | 'reading' | 'learning' | 'wellbeing' | 'impact' | 'work';

export interface SharedTag {
  id: string;
  name: string;
  color: string;
  scope: TagScope;
  icon?: string;
  usageCount?: number;
}

export interface TargetMilestone {
  id: string;
  title: string;
  targetValue?: number;
  targetDate?: string;
  isCompleted: boolean;
  completedAt?: number;
}

export interface MeasurableTarget {
  id: string;
  title: string;
  description: string;
  category: TargetCategory;
  icon: string;
  type: TargetType;
  status: TargetStatus;
  unit: string;
  baselineValue: number;
  targetValue: number;
  currentProgress: number;
  isReductionTarget?: boolean;
  trackingPeriod: TrackingPeriod;
  customPeriodDays?: number;
  startDate: string;
  targetDate?: string | null;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  linkedSkillId?: string | null;
  linkedRoadmapGoalId?: string | null;
  tagIds: string[];
  milestones: TargetMilestone[];
  reminderEnabled?: boolean;
  reminderTime?: string;
  completionAction?: string;
  notes: string;
  createdAt: number;
  updatedAt: number;
  lastLoggedAt?: number;
  isFavorite?: boolean;
}

export type ActivityDomain = 'workout' | 'reading' | 'screentime' | 'learning' | 'impact' | 'target' | 'skill';

export interface ActivityRecord {
  id: string;
  date: string;
  timestamp: number;
  title: string;
  domain: ActivityDomain;
  targetId?: string | null;
  skillId?: string | null;
  roadmapGoalId?: string | null;
  value: number;
  unit: string;
  durationMinutes?: number;
  notes?: string;
  tagIds: string[];
  isPlanned?: boolean;
  metadata?: Record<string, any>;
  xpEarned?: number;
  coinsEarned?: number;
}

export interface AppState {
  v: number;
  nodes: NodeItem[];
  ev: EventRecord[];
  jr: JournalEntry[];
  rm: AlertItem[];
  st: StudyTopic[];
  urges: UrgeItem[];
  learnStack: LearnItem[];
  goodDeeds: GoodDeedEntry[];
  rewardShop: RewardItem[];
  weeklyReviews: WeeklyReviewEntry[];
  dailyThreeStreak: DailyThreeStreakInfo;
  snapshots: BackupSnapshot[];
  lowEnergyMode: boolean;
  lowEnergyEssentialIds: string[];
  restDayTokens: number;
  usedRestDays: string[];
  lastVisitDate: string;
  comebackBonus: ComebackBonusInfo | null;
  coins: number;
  routines: RoutineFlow[];
  habitStacks: HabitStackLink[];
  activeMomentumHabitId: string | null;
  aiChatHistory: AiChatMessage[];
  antiGoals: AntiGoalItem[];
  activeSprint: LifeSprintGoal | null;
  circadianConfig: CircadianConfig;
  habitContracts: HabitContract[];
  penaltyVaultCoins: number;
  weeklyQuests: WeeklyQuest[];
  isDarkMode: boolean;
  videoResources: VideoResourceItem[];
  bookResources: BookResourceItem[];
  pinLockEnabled: boolean;
  pinHash: string;
  lockJournal: boolean;
  lockUrges: boolean;
  lockAppLaunch: boolean;
  roadmapGoals: RoadmapGoal[];
  roadmapSteps: RoadmapStep[];
  roadmapTags: RoadmapTag[];
  measurableTargets: MeasurableTarget[];
  activityRecords: ActivityRecord[];
  sharedTags: SharedTag[];
  exerciseLibrary: ExerciseItem[];
  workoutTemplates: WorkoutRoutineTemplate[];
  workoutSessions: WorkoutSessionRecord[];
  readingSessions: ReadingSessionRecord[];
  screenTimeSessions: ScreenTimeSessionRecord[];
  screenTimeApps: ScreenTimeAppUsage[];
  impactDeeds: ImpactDeedRecord[];
  relationshipContacts: RelationshipContact[];
  adaptiveReminderSettings?: AdaptiveReminderSettings;
}

// === DAILY IMPACT & MEANINGFUL ACTIONS TYPES ===
export type ImpactDeedCategory =
  | 'kindness_other'
  | 'kindness_self'
  | 'community_service'
  | 'gratitude_expression'
  | 'mentorship_help';

export type RelationshipType = 'family' | 'friend' | 'mentor' | 'colleague' | 'partner';

export type ContactChannel = 'call' | 'text' | 'in_person' | 'coffee' | 'letter';

export interface ImpactDeedRecord {
  id: string;
  title: string;
  category: ImpactDeedCategory;
  recipientType: 'family' | 'friend' | 'partner' | 'colleague' | 'stranger' | 'community' | 'self';
  recipientName?: string;
  linkedContactId?: string;
  date: string;
  timestamp: number;
  notes?: string;
  impactRating: number; // 1 (small smile) to 5 (life-changing / profound impact)
  activityRecordId?: string;
  xpEarned: number;
  coinsEarned: number;
}

export interface RelationshipContact {
  id: string;
  name: string;
  relationshipType: RelationshipType;
  avatarEmoji: string;
  targetCadenceDays: number; // e.g. 7, 14, 30
  lastCheckInDate: string; // YYYY-MM-DD
  preferredChannel: ContactChannel;
  notes?: string;
  totalCheckIns: number;
  isFavorite?: boolean;
}


// === DIGITAL WELLBEING & SCREEN-TIME TYPES ===
export type ScreenTimeCategory = 'social_media' | 'short_video' | 'gaming' | 'news' | 'entertainment' | 'productive';

export interface ScreenTimeAppUsage {
  id: string;
  name: string;
  category: ScreenTimeCategory;
  icon: string;
  dailyCeilingMinutes: number;
  isDoomscrollRisk: boolean;
}

export interface ScreenTimeSessionRecord {
  id: string;
  appId?: string;
  appName: string;
  category: ScreenTimeCategory;
  date: string;
  timestamp: number;
  durationMinutes: number;
  isIntentional: boolean;
  notes?: string;
  triggerCue?: string;
  activityRecordId?: string;
}

// === READING & KNOWLEDGE PROGRESSION TYPES ===
export interface ReadingSessionRecord {
  id: string;
  bookId?: string | null;
  bookTitle: string;
  author?: string;
  date: string;
  timestamp: number;
  startPage: number;
  endPage: number;
  pagesRead: number;
  durationMinutes: number;
  notes?: string;
  favoriteQuote?: string;
  readingSpeedPpm?: number; // pages per hour
  activityRecordId?: string;
  xpEarned: number;
  coinsEarned: number;
}

// === WORKOUT & PHYSICAL TRAINING TYPES ===
export type ExerciseMovementPattern = 'push' | 'pull' | 'legs' | 'core' | 'cardio' | 'mobility';
export type ExerciseCategory = 'calisthenics' | 'weighted' | 'cardio' | 'mobility';

export interface ExerciseItem {
  id: string;
  name: string;
  pattern: ExerciseMovementPattern;
  category: ExerciseCategory;
  primaryMuscle: string;
  secondaryMuscles?: string[];
  equipment: string;
  icon: string;
  formCues: string[];
  defaultSets: number;
  defaultReps: number;
  defaultWeightKg?: number;
  defaultRestSeconds: number;
  personalBest?: {
    maxReps?: number;
    maxWeightKg?: number;
    bestVolumeKg?: number;
    lastPerformedDate?: string;
  };
  isCustom?: boolean;
}

export interface WorkoutSet {
  setNumber: number;
  reps: number;
  weightKg: number;
  isCompleted: boolean;
  rpe?: number;
  completedAt?: number;
}

export interface WorkoutExerciseLog {
  exerciseId: string;
  exerciseName: string;
  pattern: ExerciseMovementPattern;
  icon: string;
  sets: WorkoutSet[];
  notes?: string;
}

export interface WorkoutRoutineExercise {
  exerciseId: string;
  sets: number;
  targetReps: number;
  targetWeightKg?: number;
  restSeconds: number;
  notes?: string;
}

export interface WorkoutRoutineTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  movementPatterns: ExerciseMovementPattern[];
  estimatedMinutes: number;
  exercises: WorkoutRoutineExercise[];
  linkedSkillId?: string | null;
  linkedTargetId?: string | null;
  warmupNotes?: string;
  cooldownNotes?: string;
  isCustom?: boolean;
  createdAt?: number;
}

export interface WorkoutSessionRecord {
  id: string;
  date: string;
  timestamp: number;
  routineName: string;
  routineId?: string | null;
  durationMinutes: number;
  totalVolumeReps: number;
  totalVolumeKg: number;
  exercises: WorkoutExerciseLog[];
  overallRpe?: number;
  notes?: string;
  activityRecordId?: string;
  xpEarned: number;
  coinsEarned: number;
  newPersonalBests?: string[];
}

export interface HabitMoodCorrelation {
  habitName: string;
  habitEmoji: string;
  avgMoodDone: number;
  avgMoodNotDone: number;
  deltaPercent: number;
  totalDoneDays: number;
}

export interface PillarBalance {
  learnPercent: number;
  buildPercent: number;
  bodyPercent: number;
  dominantPillar: string;
}

export interface UrgeAnalytics {
  totalUrges: number;
  avgIntensity: number;
  delayedCount: number;
  successRate: number;
  topTriggers: [string, number][];
  avgIntensityDrop: number;
  surfedCount: number;
  topSomaticSensations: [string, number][];
}

export interface WeeklyTopSkill {
  id: string;
  name: string;
  emoji: string;
  nature: string;
  importance: string;
  xpEarned: number;
  completionCount: number;
  activeDays: number;
  hybridScore: number;
  momentumTag: string;
}

export interface WeeklyInsightsData {
  startDate: string;
  endDate: string;
  totalXp: number;
  totalCompletions: number;
  dailyThreeDays: number;
  topSkills: WeeklyTopSkill[];
  moodCounts: number[];
  dominantMoodIndex: number;
  dominantMoodEmoji: string;
  dominantMoodLabel: string;
  averageMood: number;
  gratitudeEntries: GoodDeedEntry[];
}

export interface AdvancedAnalyticsData {
  correlations: HabitMoodCorrelation[];
  pillarBalance: PillarBalance;
  urgeAnalytics: UrgeAnalytics;
}

// === UNIFIED CROSS-DOMAIN ADAPTIVE REMINDER SYSTEM TYPES ===
export type AdaptiveReminderCategory =
  | 'routine'
  | 'target_milestone'
  | 'relationship'
  | 'screen_curfew'
  | 'caffeine_cutoff'
  | 'skill_anchor'
  | 'roadmap_step'
  | 'screentime_limit';

export type AdaptiveUrgency = 'critical' | 'urgent' | 'due_now' | 'upcoming' | 'gentle';

export interface AdaptiveReminderItem {
  id: string;
  title: string;
  message: string;
  category: AdaptiveReminderCategory;
  urgency: AdaptiveUrgency;
  icon: string;
  domainBadge: string;
  dueTimeLabel: string;
  timestamp: number;
  actionType?: 'toggle_habit' | 'open_routine' | 'log_deed' | 'open_target' | 'wind_down' | 'custom';
  actionPayload?: string | null;
  actionLabel?: string;
}

export interface AdaptiveReminderSettings {
  enabled: boolean;
  webNotificationsEnabled: boolean;
  soundEnabled: boolean;
  quietHoursStart: string; // e.g. "22:30"
  quietHoursEnd: string;   // e.g. "07:00"
  channels: {
    routines: boolean;
    targets: boolean;
    relationships: boolean;
    screenCurfew: boolean;
    caffeineCutoff: boolean;
    learning: boolean;
  };
  snoozedUntil: Record<string, number>; // id -> snoozedUntil timestamp
  dismissedToday: Record<string, string>; // id -> dateStr
}

