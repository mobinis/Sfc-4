import {
  AppState,
  RewardItem,
  LearnItem,
  NodeItem,
  AlertItem,
  StudyTopic,
  RoutineFlow,
  HabitStackLink,
  AntiGoalItem,
  LifeSprintGoal,
  HabitContract,
  UrgeItem,
  WeeklyQuest,
  VideoResourceItem,
  BookResourceItem,
  RoadmapGoal,
  RoadmapStep,
  RoadmapTag,
  MeasurableTarget,
  ActivityRecord,
  SharedTag,
  ExerciseItem,
  WorkoutRoutineTemplate,
  WorkoutSessionRecord,
  ReadingSessionRecord,
  ScreenTimeAppUsage,
  ScreenTimeSessionRecord,
  ImpactDeedRecord,
  RelationshipContact,
  AdaptiveReminderSettings
} from '../types';
import { DateUtils } from '../utils/dateUtils';
import { DEFAULT_ADAPTIVE_REMINDER_SETTINGS } from '../utils/adaptiveReminderEngine';

export const SeedData = {
  getInitialRewards(): RewardItem[] {
    return [
      { id: 'rew_rest_token', title: '🛡️ Rest-Day Shield Token (Protects streak)', cost: 12, icon: '🛡️', redeemedCount: 0 },
      { id: 'rew_1', title: '30-min guilt-free break / gaming', cost: 10, icon: '🎮', redeemedCount: 0 },
      { id: 'rew_2', title: 'Favorite snack or special coffee', cost: 15, icon: '☕', redeemedCount: 0 },
      { id: 'rew_3', title: 'Watch a movie or extra episode', cost: 25, icon: '🍿', redeemedCount: 0 },
      { id: 'rew_4', title: 'Afternoon power nap', cost: 20, icon: '😴', redeemedCount: 0 },
    ];
  },

  getInitialLearnItems(): LearnItem[] {
    return [
      {
        id: 'learn_1',
        title: 'Negativity Bias',
        category: 'bias',
        summary: 'Our brains register negative stimuli far more strongly than positive ones. It takes deliberate effort (3-5 positive thoughts) to balance one perceived setback.',
        whyNote: 'Prevents overreacting when a small friction occurs.',
        learnedDate: DateUtils.daysAgoStr(4),
        userExplanation: 'Ancestral threat detection makes 1 criticism sting more than 5 compliments. When a setback happens, deliberately count 3 micro-wins to restore balance.',
        teachBackNote: 'Ancestral threat detection makes 1 criticism sting more than 5 compliments. When a setback happens, deliberately count 3 micro-wins to restore balance.',
        masteryRating: 2,
        teachBackCount: 1,
        lastTeachBackDate: DateUtils.daysAgoStr(4),
        nextReviewDue: DateUtils.todayStr(),
        reviewCount: 1,
      },
      {
        id: 'learn_2',
        title: 'Labeling the Emotion',
        category: 'communication',
        summary: 'In tense conversations, neutrally labeling emotional reality (\'It sounds like this delay is stressful for you\') calms the amygdala arousal.',
        whyNote: 'Defuses conflict quickly with compassion.',
        learnedDate: DateUtils.todayStr(),
      },
      {
        id: 'learn_3',
        title: 'The 2-Minute Rule',
        category: 'selfhelp',
        summary: 'When building a new habit, scale it down until it takes under two minutes. Make showing up effortless.',
        whyNote: 'Defeats procrastination on reading and exercise.',
        learnedDate: DateUtils.todayStr(),
      },
      {
        id: 'learn_4',
        title: 'Patience & Renewal',
        category: 'islamic',
        summary: '“Verily, with hardship comes ease.” (Quran 94:6). Difficulty does not last forever; every challenging trial carries seeds of relief.',
        whyNote: 'Brings peace and grounding during demanding days.',
        learnedDate: DateUtils.todayStr(),
      },
      {
        id: 'learn_5',
        title: 'Progress Over Perfection',
        category: 'affirmation',
        summary: 'One tiny positive action taken today counts infinitely more than an abandoned flawless plan. Small steps compound.',
        whyNote: 'One checkmark is already a victory.',
        learnedDate: DateUtils.todayStr(),
      },
    ];
  },

  getInitialNodes(): NodeItem[] {
    return [
      // Core Pillars
      { id: 'learn', p: '0', e: '🧠', n: 'Learn', k: 'check', g: 1, nature: 'skill', importance: 'high' },
      { id: 'build', p: '0', e: '🛠️', n: 'Build', k: 'check', g: 1, nature: 'skill', importance: 'high' },
      { id: 'body', p: '0', e: '💪', n: 'Body', k: 'check', g: 1, nature: 'skill', importance: 'critical' },
      { id: 'mind', p: '0', e: '🌙', n: 'Mind', k: 'check', g: 1, nature: 'skill', importance: 'medium' },
      { id: 'care', p: '0', e: '🪥', n: 'Care', k: 'check', g: 1, nature: 'skill', importance: 'medium' },
      { id: 'faith', p: '0', e: '🕌', n: 'Faith', k: 'check', g: 1, nature: 'skill', importance: 'high' },

      // Learn Sub-skills
      { id: 'l1', p: 'learn', e: '🔎', n: 'Deep-dive a topic', k: 'check', g: 1, nature: 'concept', importance: 'high', routineTime: 'evening' },
      { id: 'l2', p: 'learn', e: '📖', n: 'Read pages', k: 'count', g: 10, u: 'pages', sliderSteps: ['Skim index', 'Read 5 pages', 'Take notes', 'Review takeaways'], nature: 'skill', importance: 'medium', routineTime: 'anytime' },
      { id: 'l3', p: 'learn', e: '📝', n: 'Lecture notes', k: 'check', g: 1, nature: 'technique', importance: 'medium', routineTime: 'afternoon' },

      // Build Sub-skills
      { id: 'b1', p: 'build', e: '🎯', n: 'Work on main goal', k: 'check', g: 1, nature: 'skill', importance: 'high', routineTime: 'morning' },
      { id: 'b2', p: 'build', e: '🎨', n: 'Creative sketching', k: 'check', g: 1, nature: 'skill', importance: 'medium', routineTime: 'evening' },
      { id: 'b3', p: 'build', e: '🎤', n: 'Vocal practice', k: 'check', g: 1, nature: 'technique', importance: 'low', routineTime: 'afternoon' },

      // Body Sub-skills
      { id: 'w', p: 'body', e: '💧', n: 'Drink water', k: 'count', g: 8, u: 'glasses', nature: 'habit', importance: 'critical', routineTime: 'morning', ifThenAnchor: 'Right after waking up' },
      { id: 'm1', p: 'body', e: '🧘', n: 'Gentle movement', k: 'check', g: 1, nature: 'habit', importance: 'high', routineTime: 'morning', note: 'Stretching or walking' },
      { id: 'm2', p: 'm1', e: '🥋', n: 'Martial arts drills', k: 'check', g: 1, nature: 'skill', importance: 'medium', routineTime: 'evening' },

      // Mind Sub-skills
      { id: 'j', p: 'mind', e: '✍️', n: 'Nightly Journal', k: 'check', g: 1, nature: 'habit', importance: 'medium', routineTime: 'evening', ifThenAnchor: 'Before sleep' },
      { id: 'th', p: 'mind', e: '🧩', n: 'Thought record', k: 'check', g: 1, nature: 'technique', importance: 'medium', routineTime: 'afternoon' },
      { id: 'q', p: 'mind', e: '📵', n: 'No doom-scrolling', k: 'quit', g: 1, nature: 'habit', importance: 'high', routineTime: 'evening' },

      // Care Sub-skills
      { id: 'c1', p: 'care', e: '🦷', n: 'Brush teeth', k: 'count', g: 2, u: 'times', nature: 'habit', importance: 'critical', routineTime: 'morning' },
      { id: 'c2', p: 'care', e: '🧼', n: 'Gentle face wash', k: 'check', g: 1, nature: 'habit', importance: 'medium', routineTime: 'morning', ifThenAnchor: 'After brushing teeth' },

      // Faith Sub-skills
      { id: 'f1', p: 'faith', e: '🤲', n: 'Daily Prayer (Namaz)', k: 'count', g: 5, u: 'prayers', nature: 'habit', importance: 'critical', routineTime: 'anytime' },
      { id: 'f2', p: 'faith', e: '📿', n: 'Quran recitation', k: 'check', g: 1, nature: 'habit', importance: 'high', routineTime: 'morning' },
    ];
  },

  getInitialAlerts(): AlertItem[] {
    return [
      { id: 'r_daily_learn', n: 'Daily Learn Insight', icon: '💡', type: 'custom', active: true, tm: '10:00' },
      { id: 'r_water_check', n: 'Stay Hydrated', icon: '💧', type: 'custom', active: true, tm: '14:00', skillId: 'w', skillName: 'Drink water' },
      { id: 'r_meds', n: 'Morning Multivitamin', icon: '💊', type: 'medicine', active: true, tm: '08:30', pillsCount: 28, pillsLowThreshold: 5 },
      { id: 'r_prayer', n: 'Daily Prayer Call', icon: '🕌', type: 'prayer', active: true, tm: '13:00', skillId: 'f1', skillName: 'Daily Prayer (Namaz)' }
    ];
  },

  getInitialStudyTopics(): StudyTopic[] {
    return [
      { id: 'st_1', n: 'Spaced Repetition & Forgetting Curve', ph: 1, s: 1, due: Date.now() + 86400000 },
      { id: 'st_2', n: 'Cognitive Distortion Identification', ph: 2, s: 2, due: Date.now() + 172800000 },
      { id: 'st_3', n: 'Habit Stacking & Anchoring', ph: 0, s: 0, due: Date.now() + 43200000 },
    ];
  },

  getInitialRoutines(): RoutineFlow[] {
    return [
      {
        id: 'routine_morning',
        name: 'Sunrise Kickstart',
        icon: '🌅',
        targetTime: 'morning',
        description: 'Hydration, movement, and intentional focus to anchor your day.',
        steps: [
          { id: 'rs_w', name: 'Hydrate with Fresh Water', durationSeconds: 120, linkedHabitId: 'w', icon: '💧', guidanceNote: 'Drink a tall glass slowly to wake up metabolism.' },
          { id: 'rs_m', name: 'Gentle Movement / Mobility', durationSeconds: 300, linkedHabitId: 'm1', icon: '🧘', guidanceNote: '5 minutes of neck rolls, stretches, or light walking.' },
          { id: 'rs_r', name: 'Micro-Learning or Reading', durationSeconds: 300, linkedHabitId: 'l2', icon: '📖', guidanceNote: 'Read 5 pages or review one mental model.' },
          { id: 'rs_p', name: 'Define Today\'s Core Priority', durationSeconds: 180, linkedHabitId: null, icon: '🎯', guidanceNote: 'Identify the ONE thing that makes today a win.' }
        ]
      },
      {
        id: 'routine_focus',
        name: 'Deep Work Runway',
        icon: '⚡',
        targetTime: 'focus',
        description: 'Clear distractions and prime executive focus before entering flow.',
        steps: [
          { id: 'rs_d1', name: 'Clear Desk & Silence Device', durationSeconds: 120, linkedHabitId: null, icon: '🧹', guidanceNote: 'Remove visual clutter and turn on Do Not Disturb.' },
          { id: 'rs_d2', name: 'Define 1 Definite Objective', durationSeconds: 180, linkedHabitId: null, icon: '🎯', guidanceNote: 'State the single deliverable you will produce.' },
          { id: 'rs_d3', name: '25-Minute Flow Sprint', durationSeconds: 1500, linkedHabitId: 'b1', icon: '⏳', guidanceNote: 'Work with single-minded focus until the chime sounds.' }
        ]
      },
      {
        id: 'routine_evening',
        name: 'Evening Decompression',
        icon: '🌙',
        targetTime: 'evening',
        description: 'Shift your nervous system from active execution to restorative rest.',
        steps: [
          { id: 'rs_e1', name: 'Screens Away & Disconnect', durationSeconds: 120, linkedHabitId: 'q', icon: '📵', guidanceNote: 'Put devices on charger away from bed.' },
          { id: 'rs_e2', name: 'Nightly Journal & Gratitude', durationSeconds: 300, linkedHabitId: 'j', icon: '✍️', guidanceNote: 'Write 1 win, 1 lesson, and 1 moment of appreciation.' },
          { id: 'rs_e3', name: '4-7-8 Parasympathetic Calm', durationSeconds: 240, linkedHabitId: null, icon: '🌬️', guidanceNote: 'Gentle cyclical breathing to lower heart rate.' }
        ]
      }
    ];
  },

  getInitialHabitStacks(): HabitStackLink[] {
    return [
      { triggerHabitId: 'w', followUpHabitId: 'm1', momentumBonusXp: 10, promptMessage: 'Hydrated! Now activate your body with gentle movement.' },
      { triggerHabitId: 'c1', followUpHabitId: 'c2', momentumBonusXp: 5, promptMessage: 'Teeth clean! Complete face care.' },
      { triggerHabitId: 'm1', followUpHabitId: 'l2', momentumBonusXp: 10, promptMessage: 'Body energized! Feed your mind with 5-10 pages.' }
    ];
  },

  getInitialAntiGoals(): AntiGoalItem[] {
    return [
      {
        id: 'ag_phone_bed',
        name: 'No Phone in Bed Before Sleep',
        icon: '📵',
        category: 'digital',
        triggerCue: 'Late night boredom / lying down',
        replacementAction: 'Read physical paperback or listen to soundscape',
        cleanStreakDays: 3,
        lastCleanDate: DateUtils.daysAgoStr(1),
        slipsCountToday: 0
      },
      {
        id: 'ag_soda',
        name: 'Zero Sugary Sodas / Energy Drinks',
        icon: '🥤',
        category: 'health',
        triggerCue: '3 PM afternoon energy dip',
        replacementAction: 'Sparkling lemon water or green tea',
        cleanStreakDays: 7,
        lastCleanDate: DateUtils.daysAgoStr(1),
        slipsCountToday: 0
      },
      {
        id: 'ag_doomscroll',
        name: 'No Mindless YouTube / Social Feeds',
        icon: '🛑',
        category: 'digital',
        triggerCue: 'Friction when starting a tough task',
        replacementAction: 'Do 2 minutes of Box Breathing or 5 min focus sprint',
        cleanStreakDays: 2,
        lastCleanDate: DateUtils.daysAgoStr(1),
        slipsCountToday: 0
      }
    ];
  },

  getInitialLifeSprint(): LifeSprintGoal {
    return {
      id: 'sprint_q1',
      title: 'Build Core Fitness & Launch Hero Project',
      identityStatement: 'I am the kind of person who shows up consistently every single day without excuses.',
      startDateStr: DateUtils.daysAgoStr(12),
      totalDays: 90,
      keyMilestones: [
        'Anchor Daily Three routine for 14 straight days',
        'Complete 10 deep work sprints with zero doomscrolling',
        'Reach Level 5 and earn 50 Carrot-Coins',
        'Complete quarterly review and personal retrospective'
      ],
      currentMilestoneIdx: 1
    };
  },

  getInitialHabitContracts(): HabitContract[] {
    return [
      {
        id: 'contract_init_1',
        targetHabitId: 'w',
        targetHabitName: 'Hydration (2L water)',
        stakedCoins: 10,
        startDateStr: DateUtils.daysAgoStr(2),
        targetDays: 7,
        status: 'active',
        multiplierReward: 1.5,
        daysCompleted: 1,
        lastLoggedDate: DateUtils.daysAgoStr(2),
        protectedDates: [],
        completedDates: [DateUtils.daysAgoStr(2)]
      }
    ];
  },

  getInitialUrges(): UrgeItem[] {
    return [
      {
        id: 'urg_seed_1',
        d: DateUtils.daysAgoStr(1),
        tm: '21:30',
        trigger: 'Late Evening Screen Trigger',
        level: 8,
        want: 'Compulsive social media doomscrolling',
        choice: 'Somatic Breath Pacer & Herbal Tea',
        note: 'Noticed facial heat and restlessness crest at minute 4, then dissolve after Box Breathing.',
        preIntensity: 8,
        postIntensity: 3,
        somaticSensations: ['Facial Heat / Flush', 'Restless Limbs', 'Clenched Jaw'],
        contextTags: ['Late Evening', 'Boredom / Aimless', 'Screen Trigger'],
        outcomeStatus: 'SURFED',
        durationSeconds: 600,
        coinsEarned: 15,
        xpEarned: 35
      },
      {
        id: 'urg_seed_2',
        d: DateUtils.daysAgoStr(2),
        tm: '15:45',
        trigger: 'Work Stress & Mental Fatigue',
        level: 7,
        want: 'Compulsive sugary snack',
        choice: 'Cold water wash & 5-minute walk',
        note: 'Chest tightness subsided once I decoupled the physical sensation from the craving story.',
        preIntensity: 7,
        postIntensity: 2,
        somaticSensations: ['Chest Tightness', 'Shallow Breath'],
        contextTags: ['Fatigue / Exhaustion', 'Stress / Anxiety'],
        outcomeStatus: 'RESISTED',
        durationSeconds: 480,
        coinsEarned: 13,
        xpEarned: 30
      }
    ];
  },

  getInitialWeeklyQuests(): WeeklyQuest[] {
    const monday = DateUtils.currentWeekMondayStr();
    return [
      {
        id: 'quest_vitality',
        title: 'Vitality Reps',
        description: 'Complete 8 hydration, movement, or body self-care habits this week.',
        icon: '⚡',
        category: 'vitality',
        targetCount: 8,
        currentProgress: 5,
        rewardCoins: 10,
        rewardXp: 45,
        isCompleted: false,
        isClaimed: false,
        weekStartDate: monday,
        questType: 'vitality'
      },
      {
        id: 'quest_wisdom',
        title: 'Wisdom & Teach-Back',
        description: 'Complete 2 active teach-backs or reflective journal entries this week.',
        icon: '🧠',
        category: 'wisdom',
        targetCount: 2,
        currentProgress: 2,
        rewardCoins: 12,
        rewardXp: 50,
        isCompleted: true,
        isClaimed: false,
        weekStartDate: monday,
        questType: 'wisdom'
      },
      {
        id: 'quest_consistency',
        title: 'Keystone Consistency',
        description: 'Complete daily essentials or check habits across 5 sessions.',
        icon: '🛡️',
        category: 'consistency',
        targetCount: 5,
        currentProgress: 3,
        rewardCoins: 15,
        rewardXp: 60,
        isCompleted: false,
        isClaimed: false,
        weekStartDate: monday,
        questType: 'consistency'
      }
    ];
  },

  getInitialVideos(): VideoResourceItem[] {
    return [
      {
        id: 'vid_breathing',
        title: 'Box Breathing & Somatic Reset',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        category: 'Breathwork',
        durationLabel: '3 min',
        description: 'Gentle visual pacer to balance autonomic nervous tone and soothe situational anxiety.',
        thumbnailEmoji: '🫁',
        tags: ['Breathing', 'Vagus Nerve', 'Calm'],
        isFavorite: true
      },
      {
        id: 'vid_listening',
        title: 'The Art of Active Listening (How to Truly Hear People)',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        category: 'Empathetic Listening',
        durationLabel: '10 min',
        description: 'Mastering shift vs support responses, psychological safety, and listening for underlying feelings rather than formulating replies.',
        thumbnailEmoji: '👂',
        tags: ['Listening', 'Empathy', 'Rapport', 'HighEQ'],
        isFavorite: true
      },
      {
        id: 'vid_boundaries',
        title: 'How to Set Healthy Boundaries Without Guilt',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        category: 'Healthy Boundaries',
        durationLabel: '11 min',
        description: 'Framework for defining non-negotiables, communicating limits cleanly without over-explaining, and handling pushback calmly.',
        thumbnailEmoji: '🛡️',
        tags: ['Boundaries', 'Assertiveness', 'Peace', 'SelfCare'],
        isFavorite: true
      },
      {
        id: 'vid_conflict',
        title: 'Crucial Conversations: Navigating High-Stakes Conflict',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        category: 'Handling Conflict',
        durationLabel: '12 min',
        description: 'De-escalating heated disagreements, separating observation from evaluation, and restoring mutual respect and safety.',
        thumbnailEmoji: '⚖️',
        tags: ['Conflict', 'Negotiation', 'Deescalation', 'STATE'],
        isFavorite: true
      },
      {
        id: 'vid_confidence',
        title: 'Speaking Confidently & Executive Presence',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        category: 'Confident Speaking',
        durationLabel: '8 min',
        description: 'Techniques for lowering vocal pitch, embracing comfortable pauses, posture alignment, and eliminating speech qualifiers.',
        thumbnailEmoji: '🎙️',
        tags: ['Confidence', 'PublicSpeaking', 'Presence', 'Voice'],
        isFavorite: false
      },
      {
        id: 'vid_friends',
        title: 'The Science of Adult Friendship & Overcoming The Liking Gap',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        category: 'Making Friends',
        durationLabel: '14 min',
        description: 'Attachment theory in social circles, taking the initiative, and overcoming the false cognitive belief that people don\'t like you.',
        thumbnailEmoji: '🤝',
        tags: ['Friendship', 'SocialSkills', 'LikingGap', 'Connection'],
        isFavorite: true
      },
      {
        id: 'vid_eq_emotions',
        title: 'Emotional Intelligence: The Yale RULER Method',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        category: 'High EQ & Emotions',
        durationLabel: '10 min',
        description: 'Developing high emotional granularity on the Mood Meter grid and shifting from reactive amygdala hijacking to proactive regulation.',
        thumbnailEmoji: '🧠',
        tags: ['HighEQ', 'MoodMeter', 'SelfRegulation', 'Granularity'],
        isFavorite: true
      }
    ];
  },

  getInitialBooks(): BookResourceItem[] {
    return [
      {
        id: 'book_carnegie',
        title: 'How to Win Friends and Influence People',
        author: 'Dale Carnegie',
        category: 'Making Friends',
        coverEmoji: '🤝',
        subtitle: 'The timeless classic on human rapport, genuine interest, and influence',
        description: 'Teaches how to cultivate deep personal magnetism by genuinely caring about other people, remembering their names, and validating their core identity.',
        coreFramework: 'Carnegie Rapport Triangle: Sincere Curiosity, Ego-Deflation, and Empathetic Validation',
        keyConcepts: ['Remember Names', 'Talk in Their Interests', 'Sincere Appreciation', 'Avoid Futile Arguments', 'Arouse an Eager Want'],
        externalUrl: 'https://en.wikipedia.org/wiki/How_to_Win_Friends_and_Influence_People',
        readingProgressPercent: 45,
        status: 'reading',
        pagesRead: 120,
        totalPages: 280,
        isFavorite: true,
        userNotes: '',
        fullGuideContent: `# Core Principles: Dale Carnegie's Human Relations

## Pillar 1: Fundamental Techniques in Handling People
1. **Don't criticize, condemn, or complain:** 
   Criticism wounds a person's precious pride and puts them on the defensive. Human beings are creatures of emotion, bristling with prejudices and motivated by vanity.
2. **Give honest, sincere appreciation:** 
   The deepest principle in human nature is the craving to be appreciated (William James). Flattery is shallow; appreciation comes from genuine observation of effort.
3. **Arouse in the other person an eager want:** 
   The only way to influence someone is to talk about what *they* want and show them how to get it.

## Pillar 2: Six Ways to Make People Like You
1. Become genuinely interested in other people.
2. Smile — an authentic, warm expression of welcome.
3. Remember that a person's name is to that person the sweetest sound in any language.
4. Be a good listener; encourage others to talk about themselves.
5. Talk in terms of the other person's interests.
6. Make the other person feel important — and do it sincerely.`,
        chapters: [
          { id: 'ch1', title: 'Part 1: Fundamental Techniques in Handling People', summary: 'Never sting pride; criticism is a boomerang that always flies back.', keyTakeaways: ['Catch people doing something right', 'Withhold knee-jerk blame'], practicalExercise: 'Spend 24 hours without uttering a single complaint or critical remark.', read: true },
          { id: 'ch2', title: 'Part 2: Six Ways to Make People Like You', summary: 'People don\'t care how much you know until they know how much you care.', keyTakeaways: ['Learn 3 new acquaintances\' names today', 'Ask open-ended curiosity questions'], practicalExercise: 'In your next conversation, ask 3 follow-up questions before sharing your own opinion.', read: true },
          { id: 'ch3', title: 'Part 3: How to Win People to Your Way of Thinking', summary: 'The only way to get the best of an argument is to avoid it entirely.', keyTakeaways: ['Show respect for others\' opinions', 'Begin in a friendly way'], practicalExercise: 'Practice agreeing with someone\'s feeling before discussing the facts.', read: false },
          { id: 'ch4', title: 'Part 4: Be a Leader — How to Change People Without Offense', summary: 'Praise every slight improvement; call attention to mistakes indirectly.', keyTakeaways: ['Talk about your own mistakes first', 'Ask questions instead of giving direct orders'], practicalExercise: 'Frame requests as questions: \'Do you think it might be helpful if we...?\'', read: false }
        ]
      },
      {
        id: 'book_boundaries',
        title: 'Set Boundaries, Find Peace',
        author: 'Nedra Glover Tawwab',
        category: 'Healthy Boundaries',
        coverEmoji: '🛡️',
        subtitle: 'A Guide to Reclaiming Yourself and Stopping People-Pleasing',
        description: 'Licensed counselor Nedra Tawwab provides a clear, compassionate roadmap for identifying and expressing healthy physical, emotional, and time boundaries without guilt.',
        coreFramework: 'The Boundary Spectrum: Porous ➔ Rigid ➔ Healthy (Clear, flexible, assertive)',
        keyConcepts: ['Clear is Kind', 'No is a Complete Sentence', 'Over-Explaining Weakens Limits', 'Boundary Rupture Scripts'],
        externalUrl: 'https://www.nedratawwab.com/set-boundaries-find-peace',
        readingProgressPercent: 60,
        status: 'reading',
        pagesRead: 150,
        totalPages: 250,
        isFavorite: true,
        userNotes: '',
        fullGuideContent: `# Boundary Architecture: Nedra Glover Tawwab

## The Three Boundary Styles
- **Porous:** Saying yes when you want to say no; letting others dictate your schedule; taking on other people's emotional baggage; fearing rejection if you speak up.
- **Rigid:** Never letting anyone close; emotional walls; strict avoidance; distrustful isolation.
- **Healthy:** Clear, assertive, respectful communication of what you will and will not tolerate, while maintaining connection.

## Verbal Boundary Formulas
1. **Direct Assertion:** "I am unable to take that on right now."
2. **Time Boundary:** "I have 15 minutes before my next commitment. Let's touch base on the key points."
3. **Emotional Boundary:** "I care about you, but I don't have the emotional capacity to discuss this topic tonight."
4. **Relationship Limit:** "Please don't speak to me in that tone. If it continues, I will end this conversation and step away."`,
        chapters: [
          { id: 'ch1', title: 'Understanding What Boundaries Really Are', summary: 'Boundaries are expectations and needs that help you feel safe and comfortable in your relationships.', keyTakeaways: ['Boundaries protect relationships, not destroy them', 'Resentment is the primary warning sign of a violated boundary'], practicalExercise: 'Audit your schedule: list 2 obligations that cause you resentment.', read: true },
          { id: 'ch2', title: 'The 6 Types of Boundaries', summary: 'Physical, Sexual, Intellectual, Emotional, Material, and Time boundaries.', keyTakeaways: ['Time is non-renewable', 'Emotional boundaries prevent absorbing another\'s distress'], practicalExercise: 'Identify which of the 6 areas feels most porous right now.', read: true },
          { id: 'ch3', title: 'Communicating Boundaries Clearly', summary: 'State what you need without lecturing, defending, or over-explaining.', keyTakeaways: ['State the boundary clearly', 'State what happens if it is crossed'], practicalExercise: 'Practice saying: \'I cannot attend, but thank you for thinking of me.\'', read: true },
          { id: 'ch4', title: 'Dealing with Boundary Pushback', summary: 'When you change your behavior, people who benefited from your lack of boundaries will push back.', keyTakeaways: ['Pushback is normal calibration', 'Hold steady; do not negotiate your peace'], practicalExercise: 'When someone tests your limit, repeat your initial sentence verbatim.', read: false }
        ]
      },
      {
        id: 'book_crucial_convos',
        title: 'Crucial Conversations',
        author: 'Kerry Patterson, Joseph Grenny',
        category: 'Handling Conflict',
        coverEmoji: '⚖️',
        subtitle: 'Tools for Talking When Stakes Are High',
        description: 'The gold standard for conflict resolution. Teaches how to transform charged emotional arguments into dialogue by building safety and mutual purpose.',
        coreFramework: 'The Pool of Shared Meaning & The S.T.A.T.E. Communication Protocol',
        keyConcepts: ['Pool of Shared Meaning', 'Silence vs Violence', 'Start with Heart', 'Create Mutual Purpose', 'The STATE Model'],
        externalUrl: 'https://cruciallearning.com/crucial-conversations-book/',
        readingProgressPercent: 30,
        status: 'reading',
        pagesRead: 75,
        totalPages: 240,
        isFavorite: true,
        userNotes: '',
        fullGuideContent: `# Crucial Conversations Protocol

## What Makes a Conversation "Crucial"?
1. Opinions vary.
2. Stakes are high.
3. Emotions run strong.

## The Two Failure Modes: Silence & Violence
- **Silence (Flight):** Masking (sarcasm), Avoiding (changing subjects), Withdrawing (leaving).
- **Violence (Fight):** Controlling (forcing views), Labeling (name-calling), Attacking (insults).

## The S.T.A.T.E. Method to Express Tough Feedback
- **S - Share your facts:** Objective, observable details.
- **T - Tell your story:** Explain conclusions drawn.
- **A - Ask for others' paths:** Sincere inquiry into their view.
- **T - Talk tentatively:** Avoid aggressive absolutes.
- **E - Encourage testing:** Actively invite alternative viewpoints.`,
        chapters: [
          { id: 'ch1', title: 'What Is a Crucial Conversation?', summary: 'How high-stakes dialogues alter careers, relationships, and health.', keyTakeaways: ['Dialogue is the free flow of meaning', 'Silence and violence are both destructive'], practicalExercise: 'Reflect on one conversation you have been avoiding this week.', read: true },
          { id: 'ch2', title: 'Mastering Your Stories', summary: 'Emotions don\'t just happen; you tell yourself a story that creates the emotion.', keyTakeaways: ['Victim stories: It\'s not my fault', 'Villain stories: They did this maliciously'], practicalExercise: 'Ask: What role did I play in this situation?', read: false }
        ]
      },
      {
        id: 'book_permission_feel',
        title: 'Permission to Feel',
        author: 'Dr. Marc Brackett (Yale)',
        category: 'High EQ & Emotions',
        coverEmoji: '🧠',
        subtitle: 'Unlocking the Power of Emotions to Help Yourself & Others Thrive',
        description: 'Introduces the scientifically validated RULER framework and the Mood Meter.',
        coreFramework: 'The Yale R.U.L.E.R. Framework (Recognizing, Understanding, Labeling, Expressing, Regulating)',
        keyConcepts: ['Emotional Granularity', 'Mood Meter Grid', 'Emotional Scientist vs Judge', 'Meta-Moments'],
        externalUrl: 'https://www.marcbrackett.com/permission-to-feel/',
        readingProgressPercent: 50,
        status: 'reading',
        pagesRead: 140,
        totalPages: 280,
        isFavorite: true,
        userNotes: '',
        fullGuideContent: `# Yale RULER Emotional Intelligence Architecture

## Emotional Scientist vs. Emotional Judge
- An **Emotional Judge** categorizes feelings as "good" or "bad" and suppresses emotions.
- An **Emotional Scientist** views every emotion as neutral physiological information.

## The R.U.L.E.R. Skillset
1. **Recognize:** Notice physical sensations in the body.
2. **Understand:** Identify the root cause.
3. **Label:** Precise emotion words (e.g. anxious vs excited).
4. **Express:** Communicate authentically and safely.
5. **Regulate:** Deploy strategies to balance state.`,
        chapters: [
          { id: 'ch1', title: 'Emotion as Information', summary: 'Emotions influence attention, decision-making, and relationship quality.', keyTakeaways: ['Emotions are not enemies', 'Suppression increases stress'], practicalExercise: 'Notice jaw, shoulders, and heart rate twice today.', read: true },
          { id: 'ch2', title: 'The Mood Meter', summary: 'Plotting internal state across Pleasantness and Energy.', keyTakeaways: ['Red: High energy, low pleasantness', 'Green: Low energy, high pleasantness'], practicalExercise: 'Locate yourself on the Mood Meter 3 times today.', read: true }
        ]
      }
    ];
  },

  createInitialState(): AppState {
    return {
      v: 19,
      nodes: this.getInitialNodes(),
      ev: [],
      jr: [
        {
          id: 'jr_seed_1',
          d: DateUtils.daysAgoStr(1),
          m: 3,
          t: 'Had a strong start today. Completed the morning mobility routine and stayed hydrated. Noticed slight stress in the afternoon, but took 5 minutes to breathe before responding.',
          g: ['#calm', '#focus', '#hydration']
        }
      ],
      rm: this.getInitialAlerts(),
      st: this.getInitialStudyTopics(),
      urges: this.getInitialUrges(),
      learnStack: this.getInitialLearnItems(),
      goodDeeds: [
        { id: 'gd_1', d: DateUtils.daysAgoStr(1), tm: '11:30', target: 'others', text: 'Sent an encouraging note to a friend having a hard week.' },
        { id: 'gd_2', d: DateUtils.todayStr(), tm: '08:15', target: 'self', text: 'Allowed myself a mindful 10-minute quiet stretch without guilt.' }
      ],
      rewardShop: this.getInitialRewards(),
      weeklyReviews: [],
      dailyThreeStreak: {
        cur: 4,
        best: 7,
        lastCompletedDate: DateUtils.daysAgoStr(1)
      },
      snapshots: [],
      lowEnergyMode: false,
      lowEnergyEssentialIds: ['w', 'm1', 'j'],
      restDayTokens: 1,
      usedRestDays: [],
      lastVisitDate: DateUtils.todayStr(),
      comebackBonus: null,
      coins: 25,
      routines: this.getInitialRoutines(),
      habitStacks: this.getInitialHabitStacks(),
      activeMomentumHabitId: null,
      aiChatHistory: [],
      antiGoals: this.getInitialAntiGoals(),
      activeSprint: this.getInitialLifeSprint(),
      circadianConfig: {
        wakeTimeStr: '07:00',
        bedTimeStr: '23:00',
        caffeineCutoffHoursBeforeSleep: 10,
        screenCurfewHoursBeforeSleep: 2,
        enabled: true
      },
      habitContracts: this.getInitialHabitContracts(),
      penaltyVaultCoins: 0,
      weeklyQuests: this.getInitialWeeklyQuests(),
      isDarkMode: true,
      videoResources: this.getInitialVideos(),
      bookResources: this.getInitialBooks(),
      pinLockEnabled: false,
      pinHash: '',
      lockJournal: true,
      lockUrges: true,
      lockAppLaunch: false,
      roadmapTags: this.getInitialRoadmapTags(),
      roadmapGoals: this.getInitialRoadmapGoals(),
      roadmapSteps: this.getInitialRoadmapSteps(),
      measurableTargets: this.getInitialMeasurableTargets(),
      activityRecords: this.getInitialActivityRecords(),
      sharedTags: this.getInitialSharedTags(),
      exerciseLibrary: this.getInitialExerciseLibrary(),
      workoutTemplates: this.getInitialWorkoutTemplates(),
      workoutSessions: this.getInitialWorkoutSessions(),
      readingSessions: this.getInitialReadingSessions(),
      screenTimeApps: this.getInitialScreenTimeApps(),
      screenTimeSessions: this.getInitialScreenTimeSessions(),
      impactDeeds: this.getInitialImpactDeeds(),
      relationshipContacts: this.getInitialRelationshipContacts(),
      adaptiveReminderSettings: { ...DEFAULT_ADAPTIVE_REMINDER_SETTINGS }
    };
  },

  getInitialRoadmapTags(): RoadmapTag[] {
    return [
      { id: 'tag_prog', name: 'Programming', color: '#3B82F6' },
      { id: 'tag_psych', name: 'Psychology', color: '#8B5CF6' },
      { id: 'tag_comm', name: 'Communication', color: '#EC4899' },
      { id: 'tag_career', name: 'Career', color: '#F59E0B' },
      { id: 'tag_reading', name: 'Reading', color: '#10B981' },
      { id: 'tag_growth', name: 'Personal Growth', color: '#3D7D62' },
    ];
  },

  getInitialRoadmapGoals(): RoadmapGoal[] {
    const now = Date.now();
    return [
      {
        id: 'goal_webdev',
        title: 'Modern Web Development Mastery',
        description: 'Comprehensive mastery of modern frontend and full-stack web development principles, component design, and architecture.',
        plannedStartDate: DateUtils.todayStr(),
        targetCompletionDate: DateUtils.daysAgoStr(-45),
        sessionTime: '09:00',
        estimatedDurationMinutes: 60,
        priority: 'high',
        status: 'in_progress',
        tagIds: ['tag_prog', 'tag_growth'],
        notes: '[2026-10-25 09:30] Focus on foundational concepts before deep-diving into complex frameworks. Consistency compounds.\n\nUseful Resources: MDN Web Docs, React Documentation.',
        createdAt: now - 86400000 * 5,
        updatedAt: now,
        linkedSkillId: 'build',
        reminderEnabled: true,
        resourceLinks: [
          { title: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
          { title: 'React Documentation', url: 'https://react.dev' }
        ]
      },
      {
        id: 'goal_dialogue',
        title: 'Crucial Conversations & Interpersonal EQ',
        description: 'Developing high-leverage conflict de-escalation, emotional regulation, and compassionate assertiveness in high-stakes moments.',
        plannedStartDate: DateUtils.todayStr(),
        targetCompletionDate: null,
        sessionTime: '17:30',
        estimatedDurationMinutes: 30,
        priority: 'medium',
        status: 'in_progress',
        tagIds: ['tag_comm', 'tag_psych'],
        notes: '[2026-10-28 17:45] Notice emotional arousal and physical cues (clenched jaw, rapid breathing). Step out of content to restore safety.',
        createdAt: now - 86400000 * 3,
        updatedAt: now,
        linkedSkillId: 'learn',
        reminderEnabled: false,
        resourceLinks: [
          { title: 'Crucial Conversations Guide', url: 'https://vitalsmarts.com' }
        ]
      }
    ];
  },

  getInitialRoadmapSteps(): RoadmapStep[] {
    const now = Date.now();
    return [
      // Goal: Web Development - Top-level Steps
      {
        id: 'step_html',
        goalId: 'goal_webdev',
        parentId: null,
        title: 'HTML Fundamentals & Accessibility',
        description: 'Master core elements, forms, semantics, and WCAG accessibility guidelines.',
        plannedDate: DateUtils.daysAgoStr(2),
        sessionTime: '09:00',
        durationMinutes: 45,
        tagIds: ['tag_prog'],
        notes: 'Semantics are crucial for screen readers and SEO.',
        isCompleted: true,
        order: 0,
        createdAt: now - 86400000 * 5,
        updatedAt: now - 86400000 * 2,
      },
      // Nested under HTML
      {
        id: 'step_html_elems',
        goalId: 'goal_webdev',
        parentId: 'step_html',
        title: 'Semantic Elements & Landmark Attributes',
        description: 'main, nav, article, aside, section, and aria roles.',
        plannedDate: DateUtils.daysAgoStr(3),
        tagIds: ['tag_prog'],
        notes: 'Keep HTML structure clean without nested div-soup.',
        isCompleted: true,
        order: 0,
        createdAt: now - 86400000 * 5,
        updatedAt: now - 86400000 * 3,
      },
      {
        id: 'step_html_forms',
        goalId: 'goal_webdev',
        parentId: 'step_html',
        title: 'Accessible Forms & Client Validation',
        description: 'Input types, label associations, validation constraints.',
        plannedDate: DateUtils.daysAgoStr(2),
        tagIds: ['tag_prog'],
        notes: 'Always wrap inputs with explicit label IDs.',
        isCompleted: true,
        order: 1,
        createdAt: now - 86400000 * 4,
        updatedAt: now - 86400000 * 2,
      },

      // Step: CSS Fundamentals
      {
        id: 'step_css',
        goalId: 'goal_webdev',
        parentId: null,
        title: 'CSS Architecture & Layout Engines',
        description: 'Deep dive into Flexbox, Grid, CSS Variables, and responsive design.',
        plannedDate: DateUtils.todayStr(),
        sessionTime: '09:00',
        durationMinutes: 60,
        tagIds: ['tag_prog'],
        notes: 'Focus on fluid layout calculations and mobile-first media queries.',
        isCompleted: false,
        order: 1,
        createdAt: now - 86400000 * 3,
        updatedAt: now,
      },
      // Nested under CSS
      {
        id: 'step_css_box',
        goalId: 'goal_webdev',
        parentId: 'step_css',
        title: 'Box Model & Stacking Contexts',
        description: 'Margin collapse, padding, borders, z-index, and isolation.',
        plannedDate: DateUtils.daysAgoStr(1),
        tagIds: ['tag_prog'],
        notes: 'Box-sizing: border-box should always be baseline.',
        isCompleted: true,
        order: 0,
        createdAt: now - 86400000 * 3,
        updatedAt: now - 86400000 * 1,
      },
      {
        id: 'step_css_flexgrid',
        goalId: 'goal_webdev',
        parentId: 'step_css',
        title: 'Flexbox & CSS Grid Mastery',
        description: 'Grid template areas, auto-fill/auto-fit, flex-shrink / grow dynamics.',
        plannedDate: DateUtils.todayStr(),
        tagIds: ['tag_prog'],
        notes: 'Use Grid for two-dimensional layouts, Flexbox for one-dimensional alignment.',
        isCompleted: false,
        order: 1,
        createdAt: now - 86400000 * 2,
        updatedAt: now,
      },

      // Step: JavaScript & Modern React
      {
        id: 'step_js',
        goalId: 'goal_webdev',
        parentId: null,
        title: 'JavaScript & Modern React Paradigms',
        description: 'ESNext features, async/await, closures, hooks, state machines.',
        plannedDate: DateUtils.daysAgoStr(-3),
        sessionTime: '10:00',
        durationMinutes: 90,
        tagIds: ['tag_prog'],
        notes: 'Practice building small reactive state flows.',
        isCompleted: false,
        order: 2,
        createdAt: now - 86400000 * 1,
        updatedAt: now,
      },
      {
        id: 'step_js_closures',
        goalId: 'goal_webdev',
        parentId: 'step_js',
        title: 'Variables, Lexical Scope & Closures',
        description: 'Understanding execution contexts and lexical environment.',
        plannedDate: DateUtils.daysAgoStr(-1),
        tagIds: ['tag_prog'],
        notes: 'Closures retain access to their outer enclosing scope.',
        isCompleted: false,
        order: 0,
        createdAt: now - 86400000 * 1,
        updatedAt: now,
      },
      {
        id: 'step_js_react',
        goalId: 'goal_webdev',
        parentId: 'step_js',
        title: 'React Hooks & State Reconciliation',
        description: 'useState, useEffect, useMemo, custom hooks, and concurrent features.',
        plannedDate: DateUtils.daysAgoStr(-3),
        tagIds: ['tag_prog'],
        notes: 'Strict compliance with Rules of Hooks.',
        isCompleted: false,
        order: 1,
        createdAt: now - 86400000 * 1,
        updatedAt: now,
      },

      // Goal: Crucial Conversations Steps
      {
        id: 'step_cc_safety',
        goalId: 'goal_dialogue',
        parentId: null,
        title: 'Establishing Mutual Purpose & Mutual Respect',
        description: 'When safety breaks down, step out of the content and fix the safety condition.',
        plannedDate: DateUtils.todayStr(),
        sessionTime: '17:30',
        durationMinutes: 20,
        tagIds: ['tag_comm'],
        notes: 'People never become defensive about what you say, but because they believe you have ill intent.',
        isCompleted: true,
        order: 0,
        createdAt: now - 86400000 * 3,
        updatedAt: now,
      },
      {
        id: 'step_cc_stories',
        goalId: 'goal_dialogue',
        parentId: null,
        title: 'Mastering My Stories (Path to Action)',
        description: 'Separate facts from judgment. Ask: Why would a reasonable, decent person do this?',
        plannedDate: DateUtils.daysAgoStr(-2),
        sessionTime: '17:30',
        durationMinutes: 25,
        tagIds: ['tag_comm', 'tag_psych'],
        notes: 'Tell the rest of the story: Am I pretending not to notice my role in the problem?',
        isCompleted: false,
        order: 1,
        createdAt: now - 86400000 * 2,
        updatedAt: now,
      }
    ];
  },

  getInitialSharedTags(): SharedTag[] {
    return [
      { id: 'tag_univ_focus', name: 'Deep Focus', color: '#3D7D62', scope: 'universal', icon: '🎯', usageCount: 4 },
      { id: 'tag_univ_habit', name: 'Daily Habit', color: '#E5A93C', scope: 'universal', icon: '⭐', usageCount: 8 },
      { id: 'tag_fit_strength', name: 'Strength', color: '#D95D39', scope: 'fitness', icon: '💪', usageCount: 6 },
      { id: 'tag_fit_calisthenics', name: 'Calisthenics', color: '#F97316', scope: 'fitness', icon: '🤸', usageCount: 3 },
      { id: 'tag_read_psych', name: 'Psychology', color: '#8B5CF6', scope: 'reading', icon: '🧠', usageCount: 5 },
      { id: 'tag_read_nonfiction', name: 'Non-Fiction', color: '#10B981', scope: 'reading', icon: '📚', usageCount: 7 },
      { id: 'tag_learn_webdev', name: 'Web Dev', color: '#3B82F6', scope: 'learning', icon: '💻', usageCount: 9 },
      { id: 'tag_well_screen', name: 'Digital Detox', color: '#EC4899', scope: 'wellbeing', icon: '📵', usageCount: 2 },
      { id: 'tag_impact_kind', name: 'Kindness', color: '#14B8A6', scope: 'impact', icon: '🌱', usageCount: 3 },
      { id: 'tag_work_sprint', name: 'Deep Sprint', color: '#6366F1', scope: 'work', icon: '⚡', usageCount: 4 }
    ];
  },

  getInitialMeasurableTargets(): MeasurableTarget[] {
    const now = Date.now();
    return [
      {
        id: 'target_pushups',
        title: 'Push-Up Daily Volume',
        description: 'Calisthenics endurance: accumulate clean repetitions across morning and evening sets.',
        category: 'fitness',
        icon: '💪',
        type: 'quantity',
        status: 'active',
        unit: 'reps',
        baselineValue: 20,
        targetValue: 60,
        currentProgress: 35,
        trackingPeriod: 'daily',
        startDate: DateUtils.daysAgoStr(7),
        targetDate: null,
        recurrence: 'daily',
        linkedSkillId: 'body',
        linkedRoadmapGoalId: null,
        tagIds: ['tag_fit_strength', 'tag_fit_calisthenics'],
        milestones: [
          { id: 'm_pu_1', title: '20 clean reps in single set', targetValue: 20, isCompleted: true, completedAt: now - 86400000 * 3 },
          { id: 'm_pu_2', title: '40 cumulative daily reps', targetValue: 40, isCompleted: true, completedAt: now - 86400000 * 1 },
          { id: 'm_pu_3', title: '60 cumulative daily reps', targetValue: 60, isCompleted: false }
        ],
        reminderEnabled: true,
        reminderTime: '17:00',
        completionAction: 'log_body_skill',
        notes: '[Form cues] Elbows tucked at 45 degrees, chest touching ground, full lockout without flaring.',
        createdAt: now - 86400000 * 7,
        updatedAt: now,
        lastLoggedAt: now - 7200000,
        isFavorite: true
      },
      {
        id: 'target_reading',
        title: 'Deep Non-Fiction Reading',
        description: 'Read pages with full comprehension, highlighting practical takeaways.',
        category: 'reading',
        icon: '📖',
        type: 'quantity',
        status: 'active',
        unit: 'pages',
        baselineValue: 5,
        targetValue: 20,
        currentProgress: 15,
        trackingPeriod: 'daily',
        startDate: DateUtils.daysAgoStr(10),
        targetDate: null,
        recurrence: 'daily',
        linkedSkillId: 'l2',
        linkedRoadmapGoalId: null,
        tagIds: ['tag_read_nonfiction', 'tag_read_psych'],
        milestones: [
          { id: 'm_rd_1', title: 'Finish Chapter 1 & 2', targetValue: 25, isCompleted: true, completedAt: now - 86400000 * 2 },
          { id: 'm_rd_2', title: 'Complete Book Part 1', targetValue: 50, isCompleted: false }
        ],
        reminderEnabled: true,
        reminderTime: '21:00',
        notes: 'Currently reading Carnegie\'s "How to Win Friends". Practice sincere appreciation and active listening.',
        createdAt: now - 86400000 * 10,
        updatedAt: now,
        lastLoggedAt: now - 14400000,
        isFavorite: true
      },
      {
        id: 'target_deepwork',
        title: 'Deep Focus & Study Time',
        description: 'Uninterrupted software architecture and conceptual study sessions.',
        category: 'learning',
        icon: '⚡',
        type: 'duration',
        status: 'active',
        unit: 'min',
        baselineValue: 45,
        targetValue: 120,
        currentProgress: 75,
        trackingPeriod: 'daily',
        startDate: DateUtils.daysAgoStr(14),
        targetDate: null,
        recurrence: 'daily',
        linkedSkillId: 'build',
        linkedRoadmapGoalId: 'goal_webdev',
        tagIds: ['tag_univ_focus', 'tag_learn_webdev'],
        milestones: [
          { id: 'm_dw_1', title: '1-hour uninterrupted block', targetValue: 60, isCompleted: true, completedAt: now - 86400000 * 4 },
          { id: 'm_dw_2', title: '2-hour daily total achieved', targetValue: 120, isCompleted: false }
        ],
        reminderEnabled: false,
        notes: 'Phone placed in airplane mode in another room. Noise cancelling on. Zero multitasking.',
        createdAt: now - 86400000 * 14,
        updatedAt: now,
        lastLoggedAt: now - 3600000,
        isFavorite: true
      },
      {
        id: 'target_doomscroll',
        title: 'Social Media & Screen Curfew',
        description: 'Keep aimless algorithmic feed scrolling strictly under the daily ceiling.',
        category: 'digital',
        icon: '📵',
        type: 'reduction',
        status: 'active',
        unit: 'min',
        baselineValue: 90,
        targetValue: 30,
        currentProgress: 20,
        isReductionTarget: true,
        trackingPeriod: 'daily',
        startDate: DateUtils.daysAgoStr(5),
        targetDate: null,
        recurrence: 'daily',
        linkedSkillId: 'q',
        linkedRoadmapGoalId: null,
        tagIds: ['tag_well_screen'],
        milestones: [
          { id: 'm_ds_1', title: 'First clean evening under 45m', targetValue: 45, isCompleted: true, completedAt: now - 86400000 * 2 },
          { id: 'm_ds_2', title: 'Maintain under 30m for 3 consecutive days', targetValue: 30, isCompleted: false }
        ],
        reminderEnabled: true,
        reminderTime: '20:30',
        notes: 'When urge strikes, replace with 5 deep breaths or sip cold water.',
        createdAt: now - 86400000 * 5,
        updatedAt: now,
        lastLoggedAt: now - 1800000,
        isFavorite: true
      },
      {
        id: 'target_webdev_milestone',
        title: 'Full-Stack Architecture Mastery',
        description: 'Milestone progression through frontend and backend mastery steps.',
        category: 'work',
        icon: '🚀',
        type: 'milestone',
        status: 'active',
        unit: 'steps',
        baselineValue: 0,
        targetValue: 4,
        currentProgress: 2,
        trackingPeriod: 'monthly',
        startDate: DateUtils.daysAgoStr(20),
        targetDate: DateUtils.daysAgoStr(-30),
        linkedRoadmapGoalId: 'goal_webdev',
        tagIds: ['tag_learn_webdev', 'tag_work_sprint'],
        milestones: [
          { id: 'm_wd_1', title: 'HTML5 Semantic Structure & Forms', targetValue: 1, isCompleted: true, completedAt: now - 86400000 * 10 },
          { id: 'm_wd_2', title: 'Modern CSS Layouts & Responsive Grid', targetValue: 2, isCompleted: true, completedAt: now - 86400000 * 3 },
          { id: 'm_wd_3', title: 'React State Machines & Custom Hooks', targetValue: 3, isCompleted: false },
          { id: 'm_wd_4', title: 'REST/Full-Stack Pipeline Production Ready', targetValue: 4, isCompleted: false }
        ],
        notes: 'Build hands-on prototypes for each milestone before validating.',
        createdAt: now - 86400000 * 20,
        updatedAt: now,
        lastLoggedAt: now - 86400000 * 3
      },
      {
        id: 'target_hydration_streak',
        title: 'Morning Hydration Consistency',
        description: 'Drink 2 full glasses of water immediately upon rising.',
        category: 'wellbeing',
        icon: '💧',
        type: 'consistency',
        status: 'active',
        unit: 'days',
        baselineValue: 1,
        targetValue: 7,
        currentProgress: 5,
        trackingPeriod: 'weekly',
        startDate: DateUtils.daysAgoStr(5),
        targetDate: null,
        recurrence: 'weekly',
        linkedSkillId: 'w',
        tagIds: ['tag_univ_habit'],
        milestones: [
          { id: 'm_hy_1', title: '3-day consistent streak', targetValue: 3, isCompleted: true, completedAt: now - 86400000 * 2 },
          { id: 'm_hy_2', title: '7-day perfect streak', targetValue: 7, isCompleted: false }
        ],
        notes: 'Keep filled glass on bedside table before sleep.',
        createdAt: now - 86400000 * 5,
        updatedAt: now,
        lastLoggedAt: now - 28800000
      },
      {
        id: 'target_kindness',
        title: 'Daily Acts of Impact & Kindness',
        description: 'Brighten someone else\'s day, express heartfelt gratitude, or strengthen a social relationship bond.',
        category: 'impact',
        icon: '🌱',
        type: 'quantity',
        status: 'active',
        unit: 'deeds',
        baselineValue: 1,
        targetValue: 3,
        currentProgress: 1,
        trackingPeriod: 'daily',
        startDate: DateUtils.daysAgoStr(7),
        targetDate: null,
        recurrence: 'daily',
        linkedSkillId: 'c',
        tagIds: ['tag_impact_kind'],
        milestones: [
          { id: 'm_k_1', title: 'First act of kindness logged', targetValue: 1, isCompleted: true, completedAt: now - 86400000 * 5 },
          { id: 'm_k_2', title: 'Touchpoint with loved one or friend', targetValue: 2, isCompleted: false },
          { id: 'm_k_3', title: '3 daily positive contributions', targetValue: 3, isCompleted: false }
        ],
        reminderEnabled: true,
        reminderTime: '15:00',
        notes: 'Altruism creates a positive upward spiral in mental wellbeing and reduces chronic stress.',
        createdAt: now - 86400000 * 7,
        updatedAt: now,
        lastLoggedAt: now - 10800000,
        isFavorite: true
      }
    ];
  },

  getInitialActivityRecords(): ActivityRecord[] {
    const now = Date.now();
    const today = DateUtils.todayStr();
    const yesterday = DateUtils.daysAgoStr(1);

    return [
      {
        id: 'act_1',
        date: today,
        timestamp: now - 3600000,
        title: 'Deep Architecture & State Refactor',
        domain: 'learning',
        targetId: 'target_deepwork',
        skillId: 'build',
        roadmapGoalId: 'goal_webdev',
        value: 75,
        unit: 'min',
        durationMinutes: 75,
        notes: 'Refactored unified target engine & daily activity log schema. Zero distractions.',
        tagIds: ['tag_univ_focus', 'tag_learn_webdev'],
        isPlanned: true,
        xpEarned: 35,
        coinsEarned: 5
      },
      {
        id: 'act_2',
        date: today,
        timestamp: now - 7200000,
        title: 'Afternoon Calisthenics Push-Up Set',
        domain: 'workout',
        targetId: 'target_pushups',
        skillId: 'body',
        value: 35,
        unit: 'reps',
        durationMinutes: 10,
        notes: '20 clean reps first set, 15 reps second set. Great chest activation.',
        tagIds: ['tag_fit_strength', 'tag_fit_calisthenics'],
        isPlanned: true,
        xpEarned: 20,
        coinsEarned: 3
      },
      {
        id: 'act_3',
        date: today,
        timestamp: now - 14400000,
        title: 'Carnegie Reading Session: Chapters 1-2',
        domain: 'reading',
        targetId: 'target_reading',
        skillId: 'l2',
        value: 15,
        unit: 'pages',
        durationMinutes: 25,
        notes: 'Focus on fundamental human need to feel important. Sincere appreciation over flattery.',
        tagIds: ['tag_read_nonfiction', 'tag_read_psych'],
        isPlanned: false,
        xpEarned: 15,
        coinsEarned: 2
      },
      {
        id: 'act_4',
        date: today,
        timestamp: now - 1800000,
        title: 'Checked Social Messages & Quick Feed',
        domain: 'screentime',
        targetId: 'target_doomscroll',
        skillId: 'q',
        value: 20,
        unit: 'min',
        durationMinutes: 20,
        notes: 'Replied to urgent DMs, resisted infinite scroll feed cleanly.',
        tagIds: ['tag_well_screen'],
        isPlanned: true,
        xpEarned: 10,
        coinsEarned: 2
      },
      {
        id: 'act_5',
        date: yesterday,
        timestamp: now - 86400000 - 3600000,
        title: 'Full Calisthenics Volume Session',
        domain: 'workout',
        targetId: 'target_pushups',
        skillId: 'body',
        value: 40,
        unit: 'reps',
        durationMinutes: 15,
        notes: '2 sets of 20 with 90s rest interval.',
        tagIds: ['tag_fit_strength'],
        isPlanned: true,
        xpEarned: 25,
        coinsEarned: 4
      },
      {
        id: 'act_6',
        date: yesterday,
        timestamp: now - 86400000 - 10800000,
        title: 'Deep Focus Coding Session',
        domain: 'learning',
        targetId: 'target_deepwork',
        skillId: 'build',
        value: 90,
        unit: 'min',
        durationMinutes: 90,
        notes: 'Component hierarchy design and layout polish.',
        tagIds: ['tag_univ_focus'],
        isPlanned: true,
        xpEarned: 40,
        coinsEarned: 6
      }
    ];
  },

  getInitialExerciseLibrary(): ExerciseItem[] {
    const yesterday = DateUtils.daysAgoStr(1);
    const threeDaysAgo = DateUtils.daysAgoStr(3);

    return [
      // === PUSH ===
      {
        id: 'ex_pushup',
        name: 'Standard Push-Up',
        pattern: 'push',
        category: 'calisthenics',
        primaryMuscle: 'Chest',
        secondaryMuscles: ['Triceps', 'Anterior Deltoids', 'Core'],
        equipment: 'Bodyweight',
        icon: '💪',
        formCues: [
          'Place hands slightly wider than shoulder width',
          'Elbows track back at a 45-degree angle, not flared',
          'Lock out elbows at the top with solid core bracing',
          'Chest touches floor or hovers 1 inch above'
        ],
        defaultSets: 3,
        defaultReps: 15,
        defaultRestSeconds: 60,
        personalBest: { maxReps: 35, lastPerformedDate: yesterday }
      },
      {
        id: 'ex_pike_pushup',
        name: 'Pike Push-Up',
        pattern: 'push',
        category: 'calisthenics',
        primaryMuscle: 'Shoulders',
        secondaryMuscles: ['Triceps', 'Upper Chest'],
        equipment: 'Bodyweight',
        icon: '🔼',
        formCues: [
          'Hips elevated in an inverted V shape',
          'Look back toward feet to keep cervical spine neutral',
          'Head travels forward in a tripod trajectory',
          'Press vertically through palms back to pike position'
        ],
        defaultSets: 3,
        defaultReps: 8,
        defaultRestSeconds: 75,
        personalBest: { maxReps: 12, lastPerformedDate: threeDaysAgo }
      },
      {
        id: 'ex_dips',
        name: 'Parallel Bar Dips',
        pattern: 'push',
        category: 'calisthenics',
        primaryMuscle: 'Triceps',
        secondaryMuscles: ['Lower Chest', 'Shoulders'],
        equipment: 'Dip Bars / Sturdy Chairs',
        icon: '⚡',
        formCues: [
          'Lean forward 15 degrees for chest or remain upright for triceps',
          'Lower under control until upper arms are parallel to bars',
          'Do not shrug shoulders up toward ears',
          'Explosive push to full lockout at the apex'
        ],
        defaultSets: 3,
        defaultReps: 10,
        defaultRestSeconds: 90,
        personalBest: { maxReps: 15, lastPerformedDate: threeDaysAgo }
      },
      {
        id: 'ex_diamond_pushup',
        name: 'Diamond Push-Up',
        pattern: 'push',
        category: 'calisthenics',
        primaryMuscle: 'Triceps',
        secondaryMuscles: ['Inner Chest', 'Anterior Deltoids'],
        equipment: 'Bodyweight',
        icon: '💎',
        formCues: [
          'Form diamond with thumbs and index fingers under sternum',
          'Keep elbows tucked close to ribcage throughout',
          'Engage glutes and abs to avoid lumbar sagging'
        ],
        defaultSets: 3,
        defaultReps: 10,
        defaultRestSeconds: 60,
        personalBest: { maxReps: 16, lastPerformedDate: threeDaysAgo }
      },

      // === PULL ===
      {
        id: 'ex_pullup',
        name: 'Overhand Pull-Up',
        pattern: 'pull',
        category: 'calisthenics',
        primaryMuscle: 'Lats',
        secondaryMuscles: ['Upper Back', 'Biceps', 'Forearms'],
        equipment: 'Pull-Up Bar',
        icon: '🧗',
        formCues: [
          'Full dead hang start with scapular depression',
          'Drive elbows straight down toward hips',
          'Clear chin over bar with zero kicking or kipping',
          'Controlled 2-second negative descent to full lockout'
        ],
        defaultSets: 3,
        defaultReps: 6,
        defaultRestSeconds: 90,
        personalBest: { maxReps: 10, lastPerformedDate: DateUtils.daysAgoStr(2) }
      },
      {
        id: 'ex_chinup',
        name: 'Underhand Chin-Up',
        pattern: 'pull',
        category: 'calisthenics',
        primaryMuscle: 'Biceps',
        secondaryMuscles: ['Lats', 'Teres Major'],
        equipment: 'Pull-Up Bar',
        icon: '💥',
        formCues: [
          'Palms facing inward toward your face',
          'Keep ribs pinned down and squeeze chest high toward bar',
          'Maximum squeeze on biceps at top flexion'
        ],
        defaultSets: 3,
        defaultReps: 8,
        defaultRestSeconds: 90,
        personalBest: { maxReps: 12, lastPerformedDate: DateUtils.daysAgoStr(2) }
      },
      {
        id: 'ex_inverted_row',
        name: 'Inverted Bodyweight Row',
        pattern: 'pull',
        category: 'calisthenics',
        primaryMuscle: 'Mid Back',
        secondaryMuscles: ['Rhomboids', 'Rear Delts', 'Biceps'],
        equipment: 'Low Bar / Gymnastic Rings / Table',
        icon: '🚣',
        formCues: [
          'Rigid plank posture from heels to shoulders',
          'Pull chest up to touch the bar with proud collarbones',
          'Pinch shoulder blades together for 1-second squeeze'
        ],
        defaultSets: 3,
        defaultReps: 12,
        defaultRestSeconds: 60,
        personalBest: { maxReps: 16, lastPerformedDate: DateUtils.daysAgoStr(2) }
      },
      {
        id: 'ex_facepull',
        name: 'Resistance Band Face Pull',
        pattern: 'pull',
        category: 'weighted',
        primaryMuscle: 'Rear Deltoids',
        secondaryMuscles: ['Rotator Cuff', 'Upper Trapezius'],
        equipment: 'Resistance Band / Cable',
        icon: '🎯',
        formCues: [
          'Thumbs pointing backward toward ears',
          'Pull band directly to eye level while rotating hands externally',
          'Hold 2-second contraction to strengthen postural integrity'
        ],
        defaultSets: 3,
        defaultReps: 15,
        defaultRestSeconds: 45,
        personalBest: { maxReps: 20, lastPerformedDate: DateUtils.daysAgoStr(2) }
      },

      // === LEGS ===
      {
        id: 'ex_squat',
        name: 'Bodyweight Air Squat',
        pattern: 'legs',
        category: 'calisthenics',
        primaryMuscle: 'Quadriceps',
        secondaryMuscles: ['Glutes', 'Hamstrings', 'Calves'],
        equipment: 'Bodyweight',
        icon: '🦵',
        formCues: [
          'Feet shoulder-width apart with toes turned out 15 degrees',
          'Hips back and down, knees track in line with 2nd toe',
          'Break parallel crease (hip below knee) without lumbar rounding',
          'Drive through whole foot, extending hips fully at top'
        ],
        defaultSets: 3,
        defaultReps: 20,
        defaultRestSeconds: 60,
        personalBest: { maxReps: 35, lastPerformedDate: DateUtils.daysAgoStr(4) }
      },
      {
        id: 'ex_bulgarian_split_squat',
        name: 'Bulgarian Split Squat',
        pattern: 'legs',
        category: 'calisthenics',
        primaryMuscle: 'Glutes',
        secondaryMuscles: ['Quadriceps', 'Core Stabilizers'],
        equipment: 'Bench / Stool / Chair',
        icon: '🪑',
        formCues: [
          'Rear foot laces resting flat on elevated surface',
          'Torso leaned slightly forward to load front glute',
          'Descend vertically until front thigh is parallel to floor',
          'Drive predominantly through front midfoot and heel'
        ],
        defaultSets: 3,
        defaultReps: 10,
        defaultRestSeconds: 60,
        personalBest: { maxReps: 14, lastPerformedDate: DateUtils.daysAgoStr(4) }
      },
      {
        id: 'ex_walking_lunges',
        name: 'Walking Lunges',
        pattern: 'legs',
        category: 'calisthenics',
        primaryMuscle: 'Quadriceps',
        secondaryMuscles: ['Hamstrings', 'Calves', 'Core'],
        equipment: 'Bodyweight / Dumbbells',
        icon: '🚶',
        formCues: [
          'Step forward into 90-degree bend in both knees',
          'Back knee lightly kisses the ground without slamming',
          'Keep pelvis square and torso tall throughout movement'
        ],
        defaultSets: 3,
        defaultReps: 12,
        defaultRestSeconds: 60,
        personalBest: { maxReps: 20, lastPerformedDate: DateUtils.daysAgoStr(4) }
      },

      // === CORE ===
      {
        id: 'ex_plank',
        name: 'Forearm Plank',
        pattern: 'core',
        category: 'calisthenics',
        primaryMuscle: 'Transverse Abdominis',
        secondaryMuscles: ['Rectus Abdominis', 'Glutes', 'Shoulders'],
        equipment: 'Floor / Mat',
        icon: '🪵',
        formCues: [
          'Elbows directly beneath shoulders',
          'Squeeze glutes and pull belly button toward spine',
          'Create straight tension line from head to heels'
        ],
        defaultSets: 3,
        defaultReps: 60,
        defaultRestSeconds: 45,
        personalBest: { maxReps: 90, lastPerformedDate: yesterday }
      },
      {
        id: 'ex_hanging_knee_raise',
        name: 'Hanging Knee Raise',
        pattern: 'core',
        category: 'calisthenics',
        primaryMuscle: 'Lower Rectus Abdominis',
        secondaryMuscles: ['Hip Flexors', 'Grip Strength'],
        equipment: 'Pull-Up Bar',
        icon: '⚓',
        formCues: [
          'Active dead hang with engaged lats',
          'Curl pelvis upward toward chest, not just swinging knees',
          'Slow eccentric descent to avoid pendulum momentum'
        ],
        defaultSets: 3,
        defaultReps: 12,
        defaultRestSeconds: 60,
        personalBest: { maxReps: 16, lastPerformedDate: DateUtils.daysAgoStr(2) }
      },
      {
        id: 'ex_hollow_body',
        name: 'Hollow Body Hold',
        pattern: 'core',
        category: 'calisthenics',
        primaryMuscle: 'Core Anterior Chain',
        secondaryMuscles: ['Hip Flexors', 'Quads'],
        equipment: 'Mat',
        icon: '🍌',
        formCues: [
          'Lower back forcefully pressed into floor — zero gap',
          'Arms extended overhead and legs hovered 6 inches off ground',
          'Breathe rhythmically while maintaining intense core brace'
        ],
        defaultSets: 3,
        defaultReps: 40,
        defaultRestSeconds: 45,
        personalBest: { maxReps: 60, lastPerformedDate: yesterday }
      },

      // === CARDIO ===
      {
        id: 'ex_jump_rope',
        name: 'Speed Jump Rope',
        pattern: 'cardio',
        category: 'cardio',
        primaryMuscle: 'Cardiovascular System',
        secondaryMuscles: ['Calves', 'Forearms', 'Shoulders'],
        equipment: 'Jump Rope',
        icon: '🪢',
        formCues: [
          'Bounce lightly on balls of feet with knees soft',
          'Rotate rope solely from wrists, keeping elbows pinned near ribs',
          'Maintain steady nasal breathing cadence'
        ],
        defaultSets: 3,
        defaultReps: 100,
        defaultRestSeconds: 45,
        personalBest: { maxReps: 250, lastPerformedDate: DateUtils.daysAgoStr(5) }
      },
      {
        id: 'ex_burpees',
        name: 'Strict Bodyweight Burpee',
        pattern: 'cardio',
        category: 'cardio',
        primaryMuscle: 'Full Body Conditioning',
        secondaryMuscles: ['Chest', 'Quads', 'Core'],
        equipment: 'Floor / Mat',
        icon: '🔥',
        formCues: [
          'Drop hands to floor, jump feet back into straight plank',
          'Perform a crisp push-up with chest to floor',
          'Snap feet back toward hands and explode into vertical jump with clap'
        ],
        defaultSets: 3,
        defaultReps: 10,
        defaultRestSeconds: 60,
        personalBest: { maxReps: 18, lastPerformedDate: DateUtils.daysAgoStr(5) }
      },

      // === MOBILITY ===
      {
        id: 'ex_deep_squat_hold',
        name: 'Deep Malasana Squat Hold',
        pattern: 'mobility',
        category: 'mobility',
        primaryMuscle: 'Hip Capsule & Ankle Dorsiflexion',
        secondaryMuscles: ['Groin', 'Lower Back'],
        equipment: 'Bodyweight',
        icon: '🧘',
        formCues: [
          'Full deep squat with heels glued flat to the ground',
          'Press elbows gently against inner knees to open adductors',
          'Elongate spine and breathe deeply into pelvic floor'
        ],
        defaultSets: 2,
        defaultReps: 60,
        defaultRestSeconds: 30,
        personalBest: { maxReps: 120, lastPerformedDate: DateUtils.daysAgoStr(1) }
      },
      {
        id: 'ex_worlds_greatest_stretch',
        name: "World's Greatest Stretch",
        pattern: 'mobility',
        category: 'mobility',
        primaryMuscle: 'Thoracic Spine & Hip Flexors',
        secondaryMuscles: ['Hamstrings', 'Adductors'],
        equipment: 'Floor',
        icon: '🌍',
        formCues: [
          'Step into deep lunge, bring inside elbow to instep',
          'Rotate chest open toward ceiling, following top hand with eyes',
          'Rock hips back to stretch front hamstring before switching sides'
        ],
        defaultSets: 2,
        defaultReps: 6,
        defaultRestSeconds: 30,
        personalBest: { maxReps: 8, lastPerformedDate: DateUtils.daysAgoStr(1) }
      }
    ];
  },

  getInitialWorkoutTemplates(): WorkoutRoutineTemplate[] {
    return [
      {
        id: 'tpl_push',
        name: 'Push Calisthenics Mastery',
        description: 'Upper body pushing strength, chest hypertrophy, and shoulder stability routine.',
        icon: '💪',
        movementPatterns: ['push'],
        estimatedMinutes: 25,
        linkedSkillId: 'body',
        linkedTargetId: 'target_pushups',
        warmupNotes: '2 minutes wrist circles, arm swings, 10 scapular push-ups, light shoulder mobility.',
        cooldownNotes: 'Doorway chest stretch and overhead tricep stretch (60s per side).',
        exercises: [
          { exerciseId: 'ex_pushup', sets: 3, targetReps: 15, restSeconds: 60, notes: 'Focus on crisp chest contraction at top' },
          { exerciseId: 'ex_dips', sets: 3, targetReps: 10, restSeconds: 90, notes: 'Controlled descent, strong lockout' },
          { exerciseId: 'ex_pike_pushup', sets: 3, targetReps: 8, restSeconds: 75, notes: 'Inverted V, press upward through shoulders' },
          { exerciseId: 'ex_diamond_pushup', sets: 2, targetReps: 10, restSeconds: 60, notes: 'Finisher for tricep volume' }
        ]
      },
      {
        id: 'tpl_pull',
        name: 'Pull & Posture Foundation',
        description: 'V-taper lat activation, scapular retraction, and posture correction.',
        icon: '🧗',
        movementPatterns: ['pull'],
        estimatedMinutes: 25,
        linkedSkillId: 'body',
        warmupNotes: '30s dead hang, shoulder rolls, 15 resistance band pull-aparts.',
        cooldownNotes: 'Lat stretch against door frame and 2-min child\'s pose.',
        exercises: [
          { exerciseId: 'ex_pullup', sets: 3, targetReps: 6, restSeconds: 90, notes: 'Pronated grip, clear chin over bar' },
          { exerciseId: 'ex_inverted_row', sets: 3, targetReps: 12, restSeconds: 60, notes: 'Pinch shoulder blades for 1s' },
          { exerciseId: 'ex_chinup', sets: 2, targetReps: 6, restSeconds: 90, notes: 'Full biceps curl engagement' },
          { exerciseId: 'ex_facepull', sets: 3, targetReps: 15, restSeconds: 45, notes: 'Postural integrity & rear delt activation' }
        ]
      },
      {
        id: 'tpl_legs',
        name: 'Lower Body Power & Mobility',
        description: 'Unilateral leg strength, knee longevity, and deep hip mobility.',
        icon: '🦵',
        movementPatterns: ['legs', 'mobility'],
        estimatedMinutes: 30,
        linkedSkillId: 'body',
        warmupNotes: 'Ankle rotations, leg swings, 10 unweighted hip hinges.',
        cooldownNotes: 'Couch stretch for hip flexors (90s each side) & seated forward fold.',
        exercises: [
          { exerciseId: 'ex_squat', sets: 3, targetReps: 20, restSeconds: 60, notes: 'Break parallel crease smoothly' },
          { exerciseId: 'ex_bulgarian_split_squat', sets: 3, targetReps: 10, restSeconds: 60, notes: 'Drive through front heel' },
          { exerciseId: 'ex_walking_lunges', sets: 3, targetReps: 12, restSeconds: 60, notes: 'Controlled pace, 90-degree angles' },
          { exerciseId: 'ex_deep_squat_hold', sets: 2, targetReps: 60, restSeconds: 30, notes: 'Rest in deep squat posture' }
        ]
      },
      {
        id: 'tpl_core',
        name: 'Core & Somatic Stability',
        description: 'Anterior chain resilience, anti-extension bracing, and rotational control.',
        icon: '🛡️',
        movementPatterns: ['core'],
        estimatedMinutes: 18,
        linkedSkillId: 'body',
        warmupNotes: 'Cat-Cow 10 reps, bird-dogs 8 reps per side.',
        cooldownNotes: 'Cobra stretch and gentle child\'s pose for 2 minutes.',
        exercises: [
          { exerciseId: 'ex_hollow_body', sets: 3, targetReps: 40, restSeconds: 45, notes: 'Lower back flat to ground' },
          { exerciseId: 'ex_hanging_knee_raise', sets: 3, targetReps: 12, restSeconds: 60, notes: 'Curl pelvis up smoothly' },
          { exerciseId: 'ex_plank', sets: 3, targetReps: 60, restSeconds: 45, notes: 'Full body isometric tension' }
        ]
      },
      {
        id: 'tpl_circuit',
        name: 'Full-Body Express Circuit',
        description: 'High-efficiency metabolic conditioning hitting push, pull, legs, and cardio.',
        icon: '⚡',
        movementPatterns: ['push', 'pull', 'legs', 'cardio'],
        estimatedMinutes: 20,
        linkedSkillId: 'body',
        linkedTargetId: 'target_pushups',
        warmupNotes: 'Jumping jacks 30s, arm circles, hip openers.',
        cooldownNotes: 'Slow diaphragmatic breathing with full-body forward hang.',
        exercises: [
          { exerciseId: 'ex_pushup', sets: 3, targetReps: 15, restSeconds: 45, notes: 'Crisp pace' },
          { exerciseId: 'ex_inverted_row', sets: 3, targetReps: 10, restSeconds: 45, notes: 'Retract scapulae' },
          { exerciseId: 'ex_squat', sets: 3, targetReps: 20, restSeconds: 45, notes: 'Continuous rhythm' },
          { exerciseId: 'ex_jump_rope', sets: 3, targetReps: 100, restSeconds: 45, notes: 'Light bounces, wrist spin' }
        ]
      }
    ];
  },

  getInitialWorkoutSessions(): WorkoutSessionRecord[] {
    const now = Date.now();
    const yesterday = DateUtils.daysAgoStr(1);

    return [
      {
        id: 'ws_1',
        date: yesterday,
        timestamp: now - 86400000 - 3600000,
        routineName: 'Push Calisthenics Mastery',
        routineId: 'tpl_push',
        durationMinutes: 24,
        totalVolumeReps: 85,
        totalVolumeKg: 0,
        overallRpe: 7.5,
        notes: 'Great chest pump and crisp push-up tempo. Hit 20 reps on the first set!',
        activityRecordId: 'act_5',
        xpEarned: 35,
        coinsEarned: 4,
        newPersonalBests: ['Standard Push-Up: 35 reps'],
        exercises: [
          {
            exerciseId: 'ex_pushup',
            exerciseName: 'Standard Push-Up',
            pattern: 'push',
            icon: '💪',
            sets: [
              { setNumber: 1, reps: 20, weightKg: 0, isCompleted: true, rpe: 7 },
              { setNumber: 2, reps: 15, weightKg: 0, isCompleted: true, rpe: 8 },
              { setNumber: 3, reps: 12, weightKg: 0, isCompleted: true, rpe: 8.5 }
            ]
          },
          {
            exerciseId: 'ex_dips',
            exerciseName: 'Parallel Bar Dips',
            pattern: 'push',
            icon: '⚡',
            sets: [
              { setNumber: 1, reps: 10, weightKg: 0, isCompleted: true, rpe: 7 },
              { setNumber: 2, reps: 8, weightKg: 0, isCompleted: true, rpe: 8 },
              { setNumber: 3, reps: 8, weightKg: 0, isCompleted: true, rpe: 8.5 }
            ]
          },
          {
            exerciseId: 'ex_diamond_pushup',
            exerciseName: 'Diamond Push-Up',
            pattern: 'push',
            icon: '💎',
            sets: [
              { setNumber: 1, reps: 12, weightKg: 0, isCompleted: true, rpe: 8 }
            ]
          }
        ]
      }
    ];
  },

  getInitialReadingSessions(): ReadingSessionRecord[] {
    const now = Date.now();
    const today = DateUtils.todayStr();
    const yesterday = DateUtils.daysAgoStr(1);

    return [
      {
        id: 'rs_1',
        bookId: 'book_carnegie',
        bookTitle: 'How to Win Friends and Influence People',
        author: 'Dale Carnegie',
        date: today,
        timestamp: now - 14400000,
        startPage: 105,
        endPage: 120,
        pagesRead: 15,
        durationMinutes: 25,
        notes: 'Chapter 2: The big secret of dealing with people. Focus on fulfilling the core human craving for appreciation.',
        favoriteQuote: 'The deepest urge in human nature is the desire to be important.',
        readingSpeedPpm: 36,
        activityRecordId: 'act_3',
        xpEarned: 25,
        coinsEarned: 2
      },
      {
        id: 'rs_2',
        bookId: 'book_boundaries',
        bookTitle: 'Set Boundaries, Find Peace',
        author: 'Nedra Glover Tawwab',
        date: yesterday,
        timestamp: now - 86400000 - 7200000,
        startPage: 125,
        endPage: 150,
        pagesRead: 25,
        durationMinutes: 38,
        notes: 'The boundary styles spectrum: porous, rigid, and healthy. Resentment is the primary warning light.',
        favoriteQuote: 'Clear is kind. Unclear is unkind. Speaking up early prevents resentment.',
        readingSpeedPpm: 39.5,
        xpEarned: 30,
        coinsEarned: 3
      }
    ];
  },

  getInitialScreenTimeApps(): ScreenTimeAppUsage[] {
    return [
      { id: 'app_ig', name: 'Instagram & Reels', category: 'short_video', icon: '📸', dailyCeilingMinutes: 15, isDoomscrollRisk: true },
      { id: 'app_yt', name: 'YouTube & Longform', category: 'entertainment', icon: '▶️', dailyCeilingMinutes: 45, isDoomscrollRisk: false },
      { id: 'app_x', name: 'X / Twitter Feed', category: 'social_media', icon: '🐦', dailyCeilingMinutes: 15, isDoomscrollRisk: true },
      { id: 'app_rd', name: 'Reddit Discussions', category: 'social_media', icon: '💬', dailyCeilingMinutes: 20, isDoomscrollRisk: true },
      { id: 'app_news', name: 'News & Current Affairs', category: 'news', icon: '📰', dailyCeilingMinutes: 15, isDoomscrollRisk: true },
      { id: 'app_code', name: 'Development & Study', category: 'productive', icon: '💻', dailyCeilingMinutes: 180, isDoomscrollRisk: false }
    ];
  },

  getInitialScreenTimeSessions(): ScreenTimeSessionRecord[] {
    const now = Date.now();
    const today = DateUtils.todayStr();
    const yesterday = DateUtils.daysAgoStr(1);

    return [
      {
        id: 'st_1',
        appId: 'app_ig',
        appName: 'Instagram & Reels',
        category: 'short_video',
        date: today,
        timestamp: now - 7200000,
        durationMinutes: 12,
        isIntentional: false,
        notes: 'Casual scroll after lunch. Caught myself and put phone face down.',
        triggerCue: 'Afternoon post-lunch fatigue'
      },
      {
        id: 'st_2',
        appId: 'app_yt',
        appName: 'YouTube & Longform',
        category: 'entertainment',
        date: yesterday,
        timestamp: now - 86400000 - 10800000,
        durationMinutes: 25,
        isIntentional: true,
        notes: 'Watched an architectural design documentary intentionally.'
      }
    ];
  },

  getInitialRelationshipContacts(): RelationshipContact[] {
    return [
      {
        id: 'contact_mom',
        name: 'Mom & Dad',
        relationshipType: 'family',
        avatarEmoji: '🏡',
        targetCadenceDays: 3,
        lastCheckInDate: DateUtils.daysAgoStr(2),
        preferredChannel: 'call',
        notes: 'Sunday family dinner or evening phone call. Ask about garden and wellness.',
        totalCheckIns: 12,
        isFavorite: true
      },
      {
        id: 'contact_sarah',
        name: 'Sarah (Best Friend)',
        relationshipType: 'friend',
        avatarEmoji: '✨',
        targetCadenceDays: 7,
        lastCheckInDate: DateUtils.daysAgoStr(8), // Overdue by 1 day!
        preferredChannel: 'coffee',
        notes: 'Coffee catch-up at local cafe. Talk about creative writing and upcoming projects.',
        totalCheckIns: 8,
        isFavorite: true
      },
      {
        id: 'contact_alex',
        name: 'Alex (Tech Mentor)',
        relationshipType: 'mentor',
        avatarEmoji: '🧭',
        targetCadenceDays: 14,
        lastCheckInDate: DateUtils.daysAgoStr(5),
        preferredChannel: 'call',
        notes: 'Quarterly career direction & architecture mentorship check-in.',
        totalCheckIns: 4,
        isFavorite: false
      },
      {
        id: 'contact_david',
        name: 'David (Gym Partner)',
        relationshipType: 'friend',
        avatarEmoji: '🏋️',
        targetCadenceDays: 5,
        lastCheckInDate: DateUtils.daysAgoStr(1),
        preferredChannel: 'text',
        notes: 'Coordination on Saturday morning calisthenics & workout sets.',
        totalCheckIns: 15,
        isFavorite: false
      }
    ];
  },

  getInitialImpactDeeds(): ImpactDeedRecord[] {
    const now = Date.now();
    const today = DateUtils.todayStr();
    const yesterday = DateUtils.daysAgoStr(1);
    return [
      {
        id: 'deed_1',
        title: 'Sent heartfelt gratitude audio note to Mom',
        category: 'gratitude_expression',
        recipientType: 'family',
        recipientName: 'Mom & Dad',
        linkedContactId: 'contact_mom',
        date: today,
        timestamp: now - 3600000 * 3,
        notes: 'Thanked her for always believing in me during challenging career transitions.',
        impactRating: 4,
        xpEarned: 25,
        coinsEarned: 2
      },
      {
        id: 'deed_2',
        title: 'Mentored junior engineer on CSS Grid & state management',
        category: 'mentorship_help',
        recipientType: 'colleague',
        recipientName: 'Elena K.',
        date: yesterday,
        timestamp: now - 86400000 - 3600000 * 4,
        notes: 'Spent 30 minutes unblocking sticky layout bug with clean architectural patience.',
        impactRating: 5,
        xpEarned: 30,
        coinsEarned: 3
      },
      {
        id: 'deed_3',
        title: 'Picked up litter along community park trail',
        category: 'community_service',
        recipientType: 'community',
        date: yesterday,
        timestamp: now - 86400000 - 3600000 * 7,
        notes: 'Collected 2 full bags of plastic bottles while on morning recovery walk.',
        impactRating: 4,
        xpEarned: 25,
        coinsEarned: 2
      }
    ];
  }
};


