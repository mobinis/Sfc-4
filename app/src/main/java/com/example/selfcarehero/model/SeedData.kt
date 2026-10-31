package com.example.selfcarehero.model

object SeedData {
    fun getInitialRewards(): List<RewardItem> = listOf(
        RewardItem("rew_rest_token", "🛡️ Rest-Day Shield Token (Protects streak)", 12, "🛡️", 0),
        RewardItem("rew_1", "30-min guilt-free break / gaming", 10, "🎮", 0),
        RewardItem("rew_2", "Favorite snack or special coffee", 15, "☕", 0),
        RewardItem("rew_3", "Watch a movie or extra episode", 25, "🍿", 0),
        RewardItem("rew_4", "Afternoon power nap", 20, "😴", 0)
    )

    fun getInitialLearnItems(): List<LearnItem> = listOf(
        LearnItem(
            id = "learn_1",
            title = "Negativity Bias",
            category = "bias",
            summary = "Our brains register negative stimuli far more strongly than positive ones. It takes deliberate effort (3-5 positive thoughts) to balance one perceived setback.",
            whyNote = "Prevents overreacting when a small friction occurs.",
            learnedDate = DateUtils.daysAgoStr(4),
            userExplanation = "Ancestral threat detection makes 1 criticism sting more than 5 compliments. When a setback happens, deliberately count 3 micro-wins to restore balance.",
            teachBackNote = "Ancestral threat detection makes 1 criticism sting more than 5 compliments. When a setback happens, deliberately count 3 micro-wins to restore balance.",
            masteryRating = 2,
            teachBackCount = 1,
            lastTeachBackDate = DateUtils.daysAgoStr(4),
            nextReviewDue = DateUtils.todayStr(),
            reviewCount = 1
        ),
        LearnItem(
            id = "learn_2",
            title = "Labeling the Emotion",
            category = "communication",
            summary = "In tense conversations, neutrally labeling emotional reality ('It sounds like this delay is stressful for you') calms the amygdala arousal.",
            whyNote = "Defuses conflict quickly with compassion.",
            learnedDate = DateUtils.todayStr()
        ),
        LearnItem(
            id = "learn_3",
            title = "The 2-Minute Rule",
            category = "selfhelp",
            summary = "When building a new habit, scale it down until it takes under two minutes. Make showing up effortless.",
            whyNote = "Defeats procrastination on reading and exercise.",
            learnedDate = DateUtils.todayStr()
        ),
        LearnItem(
            id = "learn_4",
            title = "Patience & Renewal",
            category = "islamic",
            summary = "“Verily, with hardship comes ease.” (Quran 94:6). Difficulty does not last forever; every challenging trial carries seeds of relief.",
            whyNote = "Brings peace and grounding during demanding days.",
            learnedDate = DateUtils.todayStr()
        ),
        LearnItem(
            id = "learn_5",
            title = "Progress Over Perfection",
            category = "affirmation",
            summary = "One tiny positive action taken today counts infinitely more than an abandoned flawless plan. Small steps compound.",
            whyNote = "One checkmark is already a victory.",
            learnedDate = DateUtils.todayStr()
        )
    )

    fun getInitialNodes(): List<NodeItem> = listOf(
        // Core Pillars
        NodeItem("learn", "0", "🧠", "Learn", "check", 1, importance = "high"),
        NodeItem("build", "0", "🛠️", "Build", "check", 1, importance = "high"),
        NodeItem("body", "0", "💪", "Body", "check", 1, importance = "critical"),
        NodeItem("mind", "0", "🌙", "Mind", "check", 1, importance = "medium"),
        NodeItem("care", "0", "🪥", "Care", "check", 1, importance = "medium"),
        NodeItem("faith", "0", "🕌", "Faith", "check", 1, importance = "high"),

        // Learn Sub-skills
        NodeItem("l1", "learn", "🔎", "Deep-dive a topic", "check", 1, nature = "concept", importance = "high", routineTime = "evening"),
        NodeItem("l2", "learn", "📖", "Read pages", "count", 10, u = "pages", sliderSteps = listOf("Skim index", "Read 5 pages", "Take notes", "Review takeaways"), nature = "skill", importance = "medium", routineTime = "anytime"),
        NodeItem("l3", "learn", "📝", "Lecture notes", "check", 1, nature = "technique", importance = "medium", routineTime = "afternoon"),

        // Build Sub-skills
        NodeItem("b1", "build", "🎯", "Work on main goal", "check", 1, nature = "skill", importance = "high", routineTime = "morning"),
        NodeItem("b2", "build", "🎨", "Creative sketching", "check", 1, nature = "skill", importance = "medium", routineTime = "evening"),
        NodeItem("b3", "build", "🎤", "Vocal practice", "check", 1, nature = "technique", importance = "low", routineTime = "afternoon"),

        // Body Sub-skills
        NodeItem("w", "body", "💧", "Drink water", "count", 8, u = "glasses", nature = "habit", importance = "critical", routineTime = "morning", ifThenAnchor = "Right after waking up"),
        NodeItem("m1", "body", "🧘", "Gentle movement", "check", 1, nature = "habit", importance = "high", routineTime = "morning", note = "Stretching or walking"),
        NodeItem("m2", "m1", "🥋", "Martial arts drills", "check", 1, nature = "skill", importance = "medium", routineTime = "evening"),

        // Mind Sub-skills
        NodeItem("j", "mind", "✍️", "Nightly Journal", "check", 1, nature = "habit", importance = "medium", routineTime = "evening", ifThenAnchor = "Before sleep"),
        NodeItem("th", "mind", "🧩", "Thought record", "check", 1, nature = "technique", importance = "medium", routineTime = "afternoon"),
        NodeItem("q", "mind", "📵", "No doom-scrolling", "quit", 1, nature = "habit", importance = "high", routineTime = "evening"),

        // Care Sub-skills
        NodeItem("c1", "care", "🦷", "Brush teeth", "count", 2, u = "times", nature = "habit", importance = "critical", routineTime = "morning"),
        NodeItem("c2", "care", "🧼", "Gentle face wash", "check", 1, nature = "habit", importance = "medium", routineTime = "morning", ifThenAnchor = "After brushing teeth"),

        // Faith Sub-skills
        NodeItem("f1", "faith", "🤲", "Daily Prayer (Namaz)", "count", 5, u = "prayers", nature = "habit", importance = "critical", routineTime = "anytime"),
        NodeItem("f2", "faith", "📿", "Quran recitation", "check", 1, nature = "habit", importance = "high", routineTime = "morning")
    )

    fun getInitialAlerts(): List<AlertItem> = listOf(
        AlertItem("r_daily_learn", "Daily Learn Insight", "💡", "custom", true, "10:00"),
        AlertItem("r_water_check", "Stay Hydrated", "💧", "custom", true, "14:00", skillId = "w", skillName = "Drink water"),
        AlertItem("r_meds", "Morning Multivitamin", "💊", "medicine", true, "08:30", pillsCount = 28, pillsLowThreshold = 5),
        AlertItem("r_prayer", "Daily Prayer Call", "🕌", "prayer", true, "13:00", skillId = "f1", skillName = "Daily Prayer (Namaz)")
    )

    fun getInitialStudyTopics(): List<StudyTopic> = listOf(
        StudyTopic("st_1", "Spaced Repetition & Forgetting Curve", 1, 1, System.currentTimeMillis() + 86400000L),
        StudyTopic("st_2", "Cognitive Distortion Identification", 2, 2, System.currentTimeMillis() + 172800000L),
        StudyTopic("st_3", "Habit Stacking & Anchoring", 0, 0, System.currentTimeMillis() + 43200000L)
    )

    fun getInitialRoutines(): List<RoutineFlow> = listOf(
        RoutineFlow(
            id = "routine_morning",
            name = "Sunrise Kickstart",
            icon = "🌅",
            targetTime = "morning",
            description = "Hydration, movement, and intentional focus to anchor your day.",
            steps = listOf(
                RoutineStep("rs_w", "Hydrate with Fresh Water", 120, "w", "💧", "Drink a tall glass slowly to wake up metabolism."),
                RoutineStep("rs_m", "Gentle Movement / Mobility", 300, "m1", "🧘", "5 minutes of neck rolls, stretches, or light walking."),
                RoutineStep("rs_r", "Micro-Learning or Reading", 300, "r", "📖", "Read 5 pages or review one mental model."),
                RoutineStep("rs_p", "Define Today's Core Priority", 180, null, "🎯", "Identify the ONE thing that makes today a win.")
            )
        ),
        RoutineFlow(
            id = "routine_focus",
            name = "Deep Work Runway",
            icon = "⚡",
            targetTime = "focus",
            description = "Clear distractions and prime executive focus before entering flow.",
            steps = listOf(
                RoutineStep("rs_d1", "Clear Desk & Silence Device", 120, null, "🧹", "Remove visual clutter and turn on Do Not Disturb."),
                RoutineStep("rs_d2", "Define 1 Definite Objective", 180, null, "🎯", "State the single deliverable you will produce."),
                RoutineStep("rs_d3", "25-Minute Flow Sprint", 1500, "d", "⏳", "Work with single-minded focus until the chime sounds.")
            )
        ),
        RoutineFlow(
            id = "routine_evening",
            name = "Evening Decompression",
            icon = "🌙",
            targetTime = "evening",
            description = "Shift your nervous system from active execution to restorative rest.",
            steps = listOf(
                RoutineStep("rs_e1", "Screens Away & Disconnect", 120, "q", "📵", "Put devices on charger away from bed."),
                RoutineStep("rs_e2", "Nightly Journal & Gratitude", 300, "j", "✍️", "Write 1 win, 1 lesson, and 1 moment of appreciation."),
                RoutineStep("rs_e3", "4-7-8 Parasympathetic Calm", 240, null, "🌬️", "Gentle cyclical breathing to lower heart rate.")
            )
        )
    )

    fun getInitialHabitStacks(): List<HabitStackLink> = listOf(
        HabitStackLink("w", "m1", 10, "Hydrated! Now activate your body with gentle movement."),
        HabitStackLink("c1", "c2", 5, "Teeth clean! Complete face care."),
        HabitStackLink("m1", "r", 10, "Body energized! Feed your mind with 5-10 pages.")
    )

    fun getInitialAntiGoals(): List<AntiGoalItem> = listOf(
        AntiGoalItem(
            id = "ag_phone_bed",
            name = "No Phone in Bed Before Sleep",
            icon = "📵",
            category = "digital",
            triggerCue = "Late night boredom / lying down",
            replacementAction = "Read physical paperback or listen to soundscape",
            cleanStreakDays = 3,
            lastCleanDate = DateUtils.daysAgoStr(1)
        ),
        AntiGoalItem(
            id = "ag_soda",
            name = "Zero Sugary Sodas / Energy Drinks",
            icon = "🥤",
            category = "health",
            triggerCue = "3 PM afternoon energy dip",
            replacementAction = "Sparkling lemon water or green tea",
            cleanStreakDays = 7,
            lastCleanDate = DateUtils.daysAgoStr(1)
        ),
        AntiGoalItem(
            id = "ag_doomscroll",
            name = "No Mindless YouTube / Social Feeds",
            icon = "🛑",
            category = "digital",
            triggerCue = "Friction when starting a tough task",
            replacementAction = "Do 2 minutes of Box Breathing or 5 min focus sprint",
            cleanStreakDays = 2,
            lastCleanDate = DateUtils.daysAgoStr(1)
        )
    )

    fun getInitialLifeSprint(): LifeSprintGoal = LifeSprintGoal(
        id = "sprint_q1",
        title = "Build Core Fitness & Launch Hero Project",
        identityStatement = "I am the kind of person who shows up consistently every single day without excuses.",
        startDateStr = DateUtils.daysAgoStr(12),
        totalDays = 90,
        keyMilestones = listOf(
            "Anchor Daily Three routine for 14 straight days",
            "Complete 10 deep work sprints with zero doomscrolling",
            "Reach Level 5 and earn 50 Carrot-Coins",
            "Complete quarterly review and personal retrospective"
        ),
        currentMilestoneIdx = 1
    )

    fun getInitialHabitContracts(): List<HabitContract> = listOf(
        HabitContract(
            id = "contract_init_1",
            targetHabitId = "w",
            targetHabitName = "Hydration (2L water)",
            stakedCoins = 10,
            startDateStr = DateUtils.daysAgoStr(2),
            targetDays = 7,
            status = "active",
            multiplierReward = 1.5,
            daysCompleted = 1,
            lastLoggedDate = DateUtils.daysAgoStr(2),
            protectedDates = emptyList(),
            completedDates = listOf(DateUtils.daysAgoStr(2))
        )
    )

    fun getInitialUrges(): List<UrgeItem> = listOf(
        UrgeItem(
            id = "urg_seed_1",
            d = DateUtils.daysAgoStr(1),
            tm = "21:30",
            trigger = "Late Evening Screen Trigger",
            level = 8,
            want = "Compulsive social media doomscrolling",
            choice = "Somatic Breath Pacer & Herbal Tea",
            note = "Noticed facial heat and restlessness crest at minute 4, then dissolve after Box Breathing.",
            preIntensity = 8,
            postIntensity = 3,
            somaticSensations = listOf("Facial Heat / Flush", "Restless Limbs", "Clenched Jaw"),
            contextTags = listOf("Late Evening", "Boredom / Aimless", "Screen Trigger"),
            outcomeStatus = "SURFED",
            durationSeconds = 600,
            coinsEarned = 15,
            xpEarned = 35
        ),
        UrgeItem(
            id = "urg_seed_2",
            d = DateUtils.daysAgoStr(2),
            tm = "15:45",
            trigger = "Work Stress & Mental Fatigue",
            level = 7,
            want = "Compulsive sugary snack",
            choice = "Cold water wash & 5-minute walk",
            note = "Chest tightness subsided once I decoupled the physical sensation from the craving story.",
            preIntensity = 7,
            postIntensity = 2,
            somaticSensations = listOf("Chest Tightness", "Shallow Breath"),
            contextTags = listOf("Fatigue / Exhaustion", "Stress / Anxiety"),
            outcomeStatus = "RESISTED",
            durationSeconds = 480,
            coinsEarned = 13,
            xpEarned = 30
        )
    )

    fun getInitialWeeklyQuests(): List<WeeklyQuest> {
        val monday = DateUtils.currentWeekMondayStr()
        return listOf(
            WeeklyQuest(
                id = "quest_vitality",
                title = "Vitality Reps",
                description = "Complete 8 hydration, movement, or body self-care habits this week.",
                icon = "⚡",
                category = "vitality",
                targetCount = 8,
                currentProgress = 5,
                rewardCoins = 10,
                rewardXp = 45,
                isCompleted = false,
                isClaimed = false,
                weekStartDate = monday,
                questType = "vitality"
            ),
            WeeklyQuest(
                id = "quest_wisdom",
                title = "Wisdom & Teach-Back",
                description = "Complete 2 active teach-backs or reflective journal entries this week.",
                icon = "🧠",
                category = "wisdom",
                targetCount = 2,
                currentProgress = 2,
                rewardCoins = 12,
                rewardXp = 50,
                isCompleted = true,
                isClaimed = false,
                weekStartDate = monday,
                questType = "wisdom"
            ),
            WeeklyQuest(
                id = "quest_consistency",
                title = "Keystone Consistency",
                description = "Complete daily essentials or check habits across 5 sessions.",
                icon = "🛡️",
                category = "consistency",
                targetCount = 5,
                currentProgress = 3,
                rewardCoins = 15,
                rewardXp = 60,
                isCompleted = false,
                isClaimed = false,
                weekStartDate = monday,
                questType = "consistency"
            )
        )
    }

    fun getInitialVideos(): List<VideoResourceItem> = listOf(
        VideoResourceItem(
            id = "vid_breathing",
            title = "Box Breathing & Somatic Reset",
            url = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            category = "Breathwork",
            durationLabel = "3 min",
            description = "Gentle visual pacer to balance autonomic nervous tone and soothe situational anxiety.",
            thumbnailEmoji = "🫁",
            tags = listOf("Breathing", "Vagus Nerve", "Calm"),
            isFavorite = true
        ),
        VideoResourceItem(
            id = "vid_listening",
            title = "The Art of Active Listening (How to Truly Hear People)",
            url = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            category = "Empathetic Listening",
            durationLabel = "10 min",
            description = "Mastering shift vs support responses, psychological safety, and listening for underlying feelings rather than formulating replies.",
            thumbnailEmoji = "👂",
            tags = listOf("Listening", "Empathy", "Rapport", "HighEQ"),
            isFavorite = true
        ),
        VideoResourceItem(
            id = "vid_boundaries",
            title = "How to Set Healthy Boundaries Without Guilt",
            url = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            category = "Healthy Boundaries",
            durationLabel = "11 min",
            description = "Framework for defining non-negotiables, communicating limits cleanly without over-explaining, and handling pushback calmly.",
            thumbnailEmoji = "🛡️",
            tags = listOf("Boundaries", "Assertiveness", "Peace", "SelfCare"),
            isFavorite = true
        ),
        VideoResourceItem(
            id = "vid_conflict",
            title = "Crucial Conversations: Navigating High-Stakes Conflict",
            url = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
            category = "Handling Conflict",
            durationLabel = "12 min",
            description = "De-escalating heated disagreements, separating observation from evaluation, and restoring mutual respect and safety.",
            thumbnailEmoji = "⚖️",
            tags = listOf("Conflict", "Negotiation", "Deescalation", "STATE"),
            isFavorite = true
        ),
        VideoResourceItem(
            id = "vid_confidence",
            title = "Speaking Confidently & Executive Presence",
            url = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            category = "Confident Speaking",
            durationLabel = "8 min",
            description = "Techniques for lowering vocal pitch, embracing comfortable pauses, posture alignment, and eliminating speech qualifiers.",
            thumbnailEmoji = "🎙️",
            tags = listOf("Confidence", "PublicSpeaking", "Presence", "Voice")
        ),
        VideoResourceItem(
            id = "vid_friends",
            title = "The Science of Adult Friendship & Overcoming The Liking Gap",
            url = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            category = "Making Friends",
            durationLabel = "14 min",
            description = "Attachment theory in social circles, taking the initiative, and overcoming the false cognitive belief that people don't like you.",
            thumbnailEmoji = "🤝",
            tags = listOf("Friendship", "SocialSkills", "LikingGap", "Connection")
        ),
        VideoResourceItem(
            id = "vid_eq_emotions",
            title = "Emotional Intelligence: The Yale RULER Method",
            url = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            category = "High EQ & Emotions",
            durationLabel = "10 min",
            description = "Developing high emotional granularity on the Mood Meter grid and shifting from reactive amygdala hijacking to proactive regulation.",
            thumbnailEmoji = "🧠",
            tags = listOf("HighEQ", "MoodMeter", "SelfRegulation", "Granularity")
        )
    )

    fun getInitialBooks(): List<BookResourceItem> = listOf(
        BookResourceItem(
            id = "book_carnegie",
            title = "How to Win Friends and Influence People",
            author = "Dale Carnegie",
            category = "Making Friends",
            coverEmoji = "🤝",
            subtitle = "The timeless classic on human rapport, genuine interest, and influence",
            description = "Teaches how to cultivate deep personal magnetism by genuinely caring about other people, remembering their names, and validating their core identity.",
            coreFramework = "Carnegie Rapport Triangle: Sincere Curiosity, Ego-Deflation, and Empathetic Validation",
            keyConcepts = listOf("Remember Names", "Talk in Their Interests", "Sincere Appreciation", "Avoid Futile Arguments", "Arouse an Eager Want"),
            externalUrl = "https://en.wikipedia.org/wiki/How_to_Win_Friends_and_Influence_People",
            readingProgressPercent = 45,
            status = "reading",
            pagesRead = 120,
            totalPages = 280,
            isFavorite = true,
            fullGuideContent = """
# Core Principles: Dale Carnegie's Human Relations

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
6. Make the other person feel important — and do it sincerely.
            """.trimIndent(),
            chapters = listOf(
                BookChapter("ch1", "Part 1: Fundamental Techniques in Handling People", "Never sting pride; criticism is a boomerang that always flies back.", listOf("Catch people doing something right", "Withhold knee-jerk blame"), "Spend 24 hours without uttering a single complaint or critical remark.", true),
                BookChapter("ch2", "Part 2: Six Ways to Make People Like You", "People don't care how much you know until they know how much you care.", listOf("Learn 3 new acquaintances' names today", "Ask open-ended curiosity questions"), "In your next conversation, ask 3 follow-up questions before sharing your own opinion.", true),
                BookChapter("ch3", "Part 3: How to Win People to Your Way of Thinking", "The only way to get the best of an argument is to avoid it entirely.", listOf("Show respect for others' opinions", "Begin in a friendly way"), "Practice agreeing with someone's feeling before discussing the facts.", false),
                BookChapter("ch4", "Part 4: Be a Leader — How to Change People Without Offense", "Praise every slight improvement; call attention to mistakes indirectly.", listOf("Talk about your own mistakes first", "Ask questions instead of giving direct orders"), "Frame requests as questions: 'Do you think it might be helpful if we...?'", false)
            )
        ),

        BookResourceItem(
            id = "book_boundaries",
            title = "Set Boundaries, Find Peace",
            author = "Nedra Glover Tawwab",
            category = "Healthy Boundaries",
            coverEmoji = "🛡️",
            subtitle = "A Guide to Reclaiming Yourself and Stopping People-Pleasing",
            description = "Licensed counselor Nedra Tawwab provides a clear, compassionate roadmap for identifying and expressing healthy physical, emotional, and time boundaries without guilt.",
            coreFramework = "The Boundary Spectrum: Porous (Over-sharing/Yes to everything) ➔ Rigid (Closed walls) ➔ Healthy (Clear, flexible, assertive)",
            keyConcepts = listOf("Clear is Kind", "No is a Complete Sentence", "Over-Explaining Weakens Limits", "Boundary Rupture Scripts"),
            externalUrl = "https://www.nedratawwab.com/set-boundaries-find-peace",
            readingProgressPercent = 60,
            status = "reading",
            pagesRead = 150,
            totalPages = 250,
            isFavorite = true,
            fullGuideContent = """
# Boundary Architecture: Nedra Glover Tawwab

## The Three Boundary Styles
- **Porous:** Saying yes when you want to say no; letting others dictate your schedule; taking on other people's emotional baggage; fearing rejection if you speak up.
- **Rigid:** Never letting anyone close; emotional walls; strict avoidance; distrustful isolation.
- **Healthy:** Clear, assertive, respectful communication of what you will and will not tolerate, while maintaining connection.

## Verbal Boundary Formulas
1. **Direct Assertion:** "I am unable to take that on right now."
2. **Time Boundary:** "I have 15 minutes before my next commitment. Let's touch base on the key points."
3. **Emotional Boundary:** "I care about you, but I don't have the emotional capacity to discuss this topic tonight."
4. **Relationship Limit:** "Please don't speak to me in that tone. If it continues, I will end this conversation and step away."

*Key Rule: Do not apologize for setting a boundary. Apologizing implies you did something wrong.*
            """.trimIndent(),
            chapters = listOf(
                BookChapter("ch1", "Understanding What Boundaries Really Are", "Boundaries are expectations and needs that help you feel safe and comfortable in your relationships.", listOf("Boundaries protect relationships, not destroy them", "Resentment is the primary warning sign of a violated boundary"), "Audit your schedule: list 2 obligations that cause you resentment.", true),
                BookChapter("ch2", "The 6 Types of Boundaries", "Physical, Sexual, Intellectual, Emotional, Material, and Time boundaries.", listOf("Time is non-renewable", "Emotional boundaries prevent absorbing another's distress"), "Identify which of the 6 areas feels most porous right now.", true),
                BookChapter("ch3", "Communicating Boundaries Clearly", "State what you need without lecturing, defending, or over-explaining.", listOf("State the boundary clearly", "State what happens if it is crossed"), "Practice saying: 'I cannot attend, but thank you for thinking of me.'", true),
                BookChapter("ch4", "Dealing with Boundary Pushback", "When you change your behavior, people who benefited from your lack of boundaries will push back.", listOf("Pushback is normal calibration", "Hold steady; do not negotiate your peace"), "When someone tests your limit, repeat your initial sentence verbatim (The Broken Record).", false)
            )
        ),

        BookResourceItem(
            id = "book_crucial_convos",
            title = "Crucial Conversations: Tools for Talking When Stakes Are High",
            author = "Kerry Patterson, Joseph Grenny, Ron McMillan, Al Switzler",
            category = "Handling Conflict",
            coverEmoji = "⚖️",
            subtitle = "Navigating high-stakes, conflicting opinions, and intense emotions with poise",
            description = "The gold standard for conflict resolution. Teaches how to transform charged emotional arguments into dialogue by building safety and mutual purpose.",
            coreFramework = "The Pool of Shared Meaning & The S.T.A.T.E. Communication Protocol",
            keyConcepts = listOf("Pool of Shared Meaning", "Silence vs Violence", "Start with Heart", "Create Mutual Purpose", "The STATE Model"),
            externalUrl = "https://cruciallearning.com/crucial-conversations-book/",
            readingProgressPercent = 30,
            status = "reading",
            pagesRead = 75,
            totalPages = 240,
            isFavorite = true,
            fullGuideContent = """
# Crucial Conversations Protocol

## What Makes a Conversation "Crucial"?
1. Opinions vary.
2. Stakes are high.
3. Emotions run strong.

## The Two Failure Modes: Silence & Violence
When psychological safety vanishes, humans revert to fight-or-flight:
- **Silence (Flight):** Masking (sarcasm), Avoiding (changing subjects), Withdrawing (leaving).
- **Violence (Fight):** Controlling (forcing views), Labeling (name-calling), Attacking (insults).

## The S.T.A.T.E. Method to Express Tough Feedback
- **S - Share your facts:** Facts are objective, unarguable, and least insulting.
- **T - Tell your story:** Explain the conclusion you drew from the facts.
- **A - Ask for others' paths:** Inquire sincerely about their view of the situation.
- **T - Talk tentatively:** Use phrases like "It seems to me..." or "I'm beginning to wonder if..." rather than absolute statements.
- **E - Encourage testing:** Actively invite opposing viewpoints: "Do you see this differently?"
            """.trimIndent(),
            chapters = listOf(
                BookChapter("ch1", "What Is a Crucial Conversation?", "How high-stakes dialogues alter careers, relationships, and health.", listOf("Dialogue is the free flow of meaning", "Silence and violence are both destructive"), "Reflect on one conversation you have been avoiding this week.", true),
                BookChapter("ch2", "Mastering Your Stories", "Emotions don't just happen to you; you tell yourself a story that creates the emotion.", listOf("Victim stories: 'It's not my fault'", "Villain stories: 'They did this maliciously'"), "Ask: 'What role did I play in this situation? What would a reasonable person do?'", false),
                BookChapter("ch3", "STATE Your Path", "How to speak persuasively, not abrasively.", listOf("Share facts before feelings", "Ask for their perspective"), "Draft a 3-sentence STATE script for an upcoming difficult talk.", false),
                BookChapter("ch4", "Explore Others' Paths: AMPP", "Ask, Mirror, Paraphrase, Prime when the other person is clamming up or angry.", listOf("Mirror their body language", "Paraphrase their core fear"), "Practice mirroring: 'You say you're fine, but your voice sounds tense.'", false)
            )
        ),

        BookResourceItem(
            id = "book_permission_feel",
            title = "Permission to Feel",
            author = "Dr. Marc Brackett (Yale)",
            category = "High EQ & Emotions",
            coverEmoji = "🧠",
            subtitle = "Unlocking the Power of Emotions to Help Yourself & Others Thrive",
            description = "Written by the director of the Yale Center for Emotional Intelligence, this guide introduces the scientifically validated RULER framework and the Mood Meter.",
            coreFramework = "The Yale R.U.L.E.R. Framework (Recognizing, Understanding, Labeling, Expressing, Regulating)",
            keyConcepts = listOf("Emotional Granularity", "Mood Meter Grid", "Emotional Scientist vs Judge", "Meta-Moments"),
            externalUrl = "https://www.marcbrackett.com/permission-to-feel/",
            readingProgressPercent = 50,
            status = "reading",
            pagesRead = 140,
            totalPages = 280,
            isFavorite = true,
            fullGuideContent = """
# Yale RULER Emotional Intelligence Architecture

## Emotional Scientist vs. Emotional Judge
- An **Emotional Judge** categorizes feelings as "good" or "bad", tries to suppress unpleasant emotions, and criticizes themselves for feeling anxious or angry.
- An **Emotional Scientist** views every emotion as neutral physiological data. They ask with curiosity: "What is my nervous system telling me right now?"

## The R.U.L.E.R. Skillset
1. **Recognize:** Notice physical sensations in the face, breath, stomach, and posture.
2. **Understand:** Identify the root cause. Why am I feeling this way? What expectation was broken?
3. **Label:** Move beyond "bad" or "fine". Differentiate anger from disappointment, envy from longing, anxiety from excitement.
4. **Express:** Choose how and when to communicate the feeling safely and authentically.
5. **Regulate:** Deploy strategies (somatic sighs, cognitive reframing, brief pause) to shift state.
            """.trimIndent(),
            chapters = listOf(
                BookChapter("ch1", "Emotion as Information", "Emotions influence attention, memory, decision-making, relationship quality, and physical health.", listOf("Emotions are not enemies", "Suppression increases cardiovascular load"), "Track your somatic state twice today: note your jaw, shoulders, and heart rate.", true),
                BookChapter("ch2", "The Mood Meter", "Plotting internal state across two axes: Pleasantness (horizontal) and Energy (vertical).", listOf("Red: High energy, low pleasantness (Anger, Panic)", "Blue: Low energy, low pleasantness (Sadness, Burnout)", "Green: Low energy, high pleasantness (Calm, Serenity)", "Yellow: High energy, high pleasantness (Joy, Focus)"), "Locate yourself on the Mood Meter 3 times today.", true),
                BookChapter("ch3", "Labeling: Words Create Worlds", "Granular emotional vocabulary gives the prefrontal cortex leverage over the amygdala.", listOf("Differentiate frustrated vs overwhelmed", "Name it to tame it"), "When upset, identify 3 distinct emotions present simultaneously.", false),
                BookChapter("ch4", "The Meta-Moment: The Space Between Trigger and Response", "Pausing, taking a deep breath, and visualizing your 'Best Self' before reacting.", listOf("Breathe into the gap", "Ask: How would my ideal self respond?"), "Next time someone cuts you off or annoys you, take a 5-second Meta-Moment.", false)
            )
        ),

        BookResourceItem(
            id = "book_listening",
            title = "You're Not Listening: What You're Missing and Why It Matters",
            author = "Kate Murphy",
            category = "Empathetic Listening",
            coverEmoji = "👂",
            subtitle = "The Lost Art of Real Human Connection in an Age of Distraction",
            description = "New York Times contributor Kate Murphy explores the neurobiology, psychology, and sociology of active listening, revealing why modern loneliness stems from our inability to listen.",
            coreFramework = "Support Responses vs. Shift Responses & The Psychology of Intentional Silence",
            keyConcepts = listOf("Shift vs Support Responses", "Conversational Narcissism", "Negative Capability", "Listening with the Eyes"),
            externalUrl = "https://www.katemurphyauthor.com/",
            readingProgressPercent = 20,
            status = "want_to_read",
            pagesRead = 40,
            totalPages = 220,
            fullGuideContent = """
# Active Listening Mastery

## The Great Conversational Trap: Shift vs. Support
- **Shift Response:** Turning the spotlight back to yourself.
  *Friend:* "I'm feeling so burnt out from work."
  *You (Shift):* "Me too! My boss has been dumping projects on me all week."
- **Support Response:** Keeping the focus on their inner experience with curiosity.
  *You (Support):* "That sounds heavy. What's been the most draining part of it lately?"

## The Rule of Negative Capability (Keats)
The ability to exist in uncertainties, mysteries, and doubts without irritably reaching after fact or reason. When someone confides in you:
1. Resist giving advice for the first 5 minutes.
2. Hold space for their silence.
3. Validate their emotion before solving their logistical problem.
            """.trimIndent(),
            chapters = listOf(
                BookChapter("ch1", "The Epidemic of Inattention", "Why we have thousands of followers yet feel completely unheard.", listOf("Listening requires cognitive energy", "Digital multitasking fragments attention"), "Put your phone entirely out of sight during your next conversation.", true),
                BookChapter("ch2", "Shift vs. Support: Eliminating Conversational Narcissism", "How subtle speech habits redirect attention back to ourselves.", listOf("Catch your impulse to share your own story", "Ask follow-up questions instead"), "Count how many times you offer a Support response instead of a Shift response today.", false),
                BookChapter("ch3", "Tolerating the Awkward Silence", "The deepest insights emerge after a 3-to-4 second pause.", listOf("Do not rush to fill pauses", "Let the other person think aloud"), "Count to 3 in your head before responding after someone finishes speaking.", false)
            )
        ),

        BookResourceItem(
            id = "book_talk_ted",
            title = "Talk Like TED: The 9 Public-Speaking Secrets",
            author = "Carmine Gallo",
            category = "Confident Speaking",
            coverEmoji = "🎙️",
            subtitle = "How to Speak with Authentic Presence, Clarity, and Magnetic Confidence",
            description = "Analyzes over 500 top TED presentations to uncover the exact science of persuasive, confident communication in meetings, presentations, and daily conversations.",
            coreFramework = "The 3 Pillars of Influence: Emotional (Touch the heart), Novel (Teach something new), Memorable (Present unforgettable content)",
            keyConcepts = listOf("The 18-Minute Rule", "Storytelling Arc", "Vocal Cadence", "The Rule of Three", "Body Language Alignment"),
            externalUrl = "https://carminegallo.com/books/talk-like-ted/",
            readingProgressPercent = 35,
            status = "reading",
            pagesRead = 90,
            totalPages = 260,
            fullGuideContent = """
# Confident Speaking Blueprint

## 1. Unleash the Master Storyteller
The brain does not process bullet points; it processes narrative arcs. When making a point in a meeting or casual talk:
1. Set the context (Where were we?)
2. Present the tension / complication (What went wrong?)
3. Reveal the breakthrough (What did we learn?)

## 2. Vocal Mechanics
- **Pacing:** Aim for 140–160 words per minute.
- **Vocal Inflection:** Avoid upward inflection (uptalk) at the end of statements; it signals insecurity. End statements with vocal gravity (neutral or downward pitch).
- **The Power Pause:** Replace filler words ("um", "like", "you know") with deliberate silence. A pause conveys composure, control, and executive poise.
            """.trimIndent(),
            chapters = listOf(
                BookChapter("ch1", "Unleash the Master Storyteller", "Why personal vulnerability and character arcs build instant trust.", listOf("Stories trigger neural coupling", "Replace abstract data with human examples"), "Explain your next work update or idea as a 60-second micro-story.", true),
                BookChapter("ch2", "Master the Nonverbal", "Your body language speaks seconds before your mouth opens.", listOf("Open posture; keep hands visible", "Avoid self-soothing gestures (touching neck/hair)"), "Notice your posture when entering a room; pull shoulders back and breathe deeply.", false),
                BookChapter("ch3", "Teach Me Something New (Novelty)", "The human brain is an evolutionary novelty detector.", listOf("Present familiar concepts with fresh metaphors", "Package ideas in memorable frameworks"), "Craft a simple, novel analogy for a concept you explain frequently.", false)
            )
        ),

        BookResourceItem(
            id = "book_nvc",
            title = "Nonviolent Communication: A Language of Life",
            author = "Marshall B. Rosenberg, PhD",
            category = "Handling Conflict",
            coverEmoji = "🕊️",
            subtitle = "Life-Changing Tools for Healthy Relationships, Empathy, and Compassion",
            description = "Dr. Rosenberg's revolutionary communication model shows how to express honesty without criticism and receive others' messages without taking them personally.",
            coreFramework = "The O.F.N.R. Framework: Observations ➔ Feelings ➔ Needs ➔ Requests",
            keyConcepts = listOf("Observation vs Evaluation", "Universal Human Needs", "Direct Requests vs Demands", "Empathy as Connection"),
            externalUrl = "https://www.cnvc.org/",
            readingProgressPercent = 25,
            status = "want_to_read",
            pagesRead = 55,
            totalPages = 220,
            fullGuideContent = """
# Nonviolent Communication (NVC) Framework

## The 4 Steps of Compassionate Expression (O.F.N.R.)
1. **Observation:** What did I actually see or hear? (Strip away judgment, moral evaluations, and generalizations like "always" or "never").
   - *Wrong:* "You are always inconsiderate."
   - *Right (Observation):* "When you looked at your phone during dinner..."
2. **Feeling:** How do I feel? (Must be an emotion word, not a disguised thought like "I feel that you don't care").
   - *Right (Feeling):* "...I felt disconnected and lonely..."
3. **Need:** What universal human need is connected to this feeling? (Autonomy, safety, connection, respect, peace).
   - *Right (Need):* "...because I value focused connection when we eat together..."
4. **Request:** What concrete, actionable, positive request can I make?
   - *Right (Request):* "...Would you be willing to leave your phone in the other room during our meals?"
            """.trimIndent(),
            chapters = listOf(
                BookChapter("ch1", "Giving from the Heart", "How language alienates us from our compassionate nature.", listOf("Moralistic judgments create distance", "Demands trigger rebellion or submission"), "Identify one judgment you made about someone today; reframe it as an unmet need.", true),
                BookChapter("ch2", "Observing Without Evaluating", "Observation without evaluation is the highest form of human intelligence.", listOf("Eliminate 'always' and 'never'", "Stick to camera-observable facts"), "Practice stating facts without editorializing in your next feedback discussion.", false),
                BookChapter("ch3", "Identifying and Expressing Feelings", "Distinguishing authentic emotional states from thoughts and accusations.", listOf("Say 'I feel sad' instead of 'I feel ignored'", "Take responsibility for your feelings"), "Replace 'You make me angry' with 'I feel angry because I need...'", false),
                BookChapter("ch4", "Requesting That Which Would Enrich Life", "How to ask for what you need clearly and non-coercively.", listOf("Use positive action language", "Verify they heard a request, not a demand"), "Make one clear, respectful request today using the OFNR formula.", false)
            )
        )
    )

    fun getInitialRoadmapTags(): List<RoadmapTag> = listOf(
        RoadmapTag("tag_ai", "Artificial Intelligence", "#3B82F6"),
        RoadmapTag("tag_health", "Biohacking & Health", "#3D7D62"),
        RoadmapTag("tag_stoic", "Philosophy & Mind", "#E5A93C"),
        RoadmapTag("tag_leadership", "Leadership & EQ", "#8B5CF6")
    )

    fun getInitialRoadmapGoals(): List<RoadmapGoal> = listOf(
        RoadmapGoal(
            id = "goal_ml_mastery",
            title = "On-Device Edge ML & Transformer Architecture",
            description = "Master local quantization, ONNX Runtime Mobile, and transformer mechanics for mobile edge devices.",
            plannedStartDate = "2026-11-01",
            targetCompletionDate = "2026-12-15",
            sessionTime = "08:30",
            estimatedDurationMinutes = 45,
            priority = "high",
            status = "in_progress",
            tagIds = listOf("tag_ai"),
            notes = "Key focus: INT4 quantization, key-value cache memory constraints, and CPU vectorization on ARM NEON.",
            createdAt = System.currentTimeMillis() - 86400000L * 5,
            updatedAt = System.currentTimeMillis()
        ),
        RoadmapGoal(
            id = "goal_somatic_longevity",
            title = "Circadian Rhythm & HRV Optimization",
            description = "In-depth study and protocol deployment for heart rate variability, vagal tone, and restorative slow-wave sleep.",
            plannedStartDate = "2026-11-10",
            targetCompletionDate = "2026-12-30",
            sessionTime = "21:00",
            estimatedDurationMinutes = 30,
            priority = "medium",
            status = "planned",
            tagIds = listOf("tag_health", "tag_stoic"),
            notes = "Focus on Andrew Huberman's morning optic flow protocols and Matthew Walker's sleep architecture research.",
            createdAt = System.currentTimeMillis() - 86400000L * 2,
            updatedAt = System.currentTimeMillis()
        )
    )

    fun getInitialRoadmapSteps(): List<RoadmapStep> = listOf(
        RoadmapStep(
            id = "step_ml_1",
            goalId = "goal_ml_mastery",
            title = "Tokenization & Byte-Pair Encoding (BPE)",
            description = "Understand subword vocabularies, merges, and ChatML special tokens.",
            plannedDate = "2026-11-03",
            sessionTime = "08:30",
            durationMinutes = 30,
            tagIds = listOf("tag_ai"),
            notes = "Completed implementation of pure Kotlin SmolLmTokenizer with byte-level fallback.",
            isCompleted = true,
            order = 0,
            createdAt = System.currentTimeMillis() - 86400000L * 4,
            updatedAt = System.currentTimeMillis()
        ),
        RoadmapStep(
            id = "step_ml_2",
            goalId = "goal_ml_mastery",
            title = "ONNX Session Introspection & Memory Lifecycle",
            description = "Verify tensor shapes (input_ids, attention_mask), native buffer closing, and heap limits.",
            plannedDate = "2026-11-08",
            sessionTime = "08:30",
            durationMinutes = 45,
            tagIds = listOf("tag_ai"),
            notes = "Ensure every OnnxTensor and OrtSession.Result closes immediately per generation step.",
            isCompleted = true,
            order = 1,
            createdAt = System.currentTimeMillis() - 86400000L * 3,
            updatedAt = System.currentTimeMillis()
        ),
        RoadmapStep(
            id = "step_ml_3",
            goalId = "goal_ml_mastery",
            title = "Autoregressive Sampling (Top-K & Repetition Penalty)",
            description = "Implement logit temperature scaling and repetition penalty to prevent degeneration loops.",
            plannedDate = "2026-11-15",
            sessionTime = "08:30",
            durationMinutes = 45,
            tagIds = listOf("tag_ai"),
            notes = "Top-K=40, temp=0.7, repetition_penalty=1.15.",
            isCompleted = false,
            order = 2,
            createdAt = System.currentTimeMillis() - 86400000L * 2,
            updatedAt = System.currentTimeMillis()
        ),
        RoadmapStep(
            id = "step_sleep_1",
            goalId = "goal_somatic_longevity",
            title = "Morning Optic Flow & Adenosine Clearance",
            description = "10 minutes of direct morning sunlight exposure to anchor circadian clock.",
            plannedDate = "2026-11-12",
            sessionTime = "07:30",
            durationMinutes = 15,
            tagIds = listOf("tag_health"),
            notes = "Outdoor sunlight sets the melatonin release timer for 14-16 hours later.",
            isCompleted = false,
            order = 0,
            createdAt = System.currentTimeMillis() - 86400000L,
            updatedAt = System.currentTimeMillis()
        )
    )

    fun createInitialState(): AppState = AppState(
        v = 19,
        nodes = getInitialNodes(),
        rm = getInitialAlerts(),
        learnStack = getInitialLearnItems(),
        rewardShop = getInitialRewards(),
        st = getInitialStudyTopics(),
        routines = getInitialRoutines(),
        habitStacks = getInitialHabitStacks(),
        antiGoals = getInitialAntiGoals(),
        activeSprint = getInitialLifeSprint(),
        habitContracts = getInitialHabitContracts(),
        urges = getInitialUrges(),
        penaltyVaultCoins = 0,
        lastVisitDate = DateUtils.todayStr(),
        coins = 25,
        weeklyQuests = getInitialWeeklyQuests(),
        videoResources = getInitialVideos(),
        bookResources = getInitialBooks(),
        roadmapGoals = getInitialRoadmapGoals(),
        roadmapSteps = getInitialRoadmapSteps(),
        roadmapTags = getInitialRoadmapTags(),
        aiOnlineSearchEnabled = true
    )
}


