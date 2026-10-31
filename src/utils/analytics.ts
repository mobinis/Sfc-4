import { AppState, AdvancedAnalyticsData, WeeklyInsightsData, HabitMoodCorrelation, PillarBalance, UrgeAnalytics, WeeklyTopSkill } from '../types';
import { DateUtils } from './dateUtils';

export function computeAnalytics(state: AppState): AdvancedAnalyticsData {
  // 1. Habit-Mood correlations
  const correlations: HabitMoodCorrelation[] = [];
  const habits = state.nodes.filter(n => n.p !== '0');

  // Map journal entries by date
  const moodByDate = new Map<string, number>();
  state.jr.forEach(j => {
    moodByDate.set(j.d, j.m);
  });

  habits.forEach(habit => {
    const doneDates = new Set(state.ev.filter(e => e.n === habit.id).map(e => e.d));
    let sumDone = 0;
    let countDone = 0;
    let sumNotDone = 0;
    let countNotDone = 0;

    moodByDate.forEach((mood, date) => {
      if (doneDates.has(date)) {
        sumDone += mood;
        countDone++;
      } else {
        sumNotDone += mood;
        countNotDone++;
      }
    });

    if (countDone > 0) {
      const avgDone = sumDone / countDone;
      const avgNotDone = countNotDone > 0 ? sumNotDone / countNotDone : 2.0;
      const deltaPercent = Math.round(((avgDone - avgNotDone) / 4) * 100);
      correlations.push({
        habitName: habit.n,
        habitEmoji: habit.e,
        avgMoodDone: Number(avgDone.toFixed(1)),
        avgMoodNotDone: Number(avgNotDone.toFixed(1)),
        deltaPercent,
        totalDoneDays: countDone
      });
    }
  });

  // 2. Pillar Balance
  const pillarCounts = { learn: 0, build: 0, body: 0 };
  state.ev.forEach(e => {
    const node = state.nodes.find(n => n.id === e.n);
    if (node) {
      if (node.p === 'learn' || node.id === 'learn') pillarCounts.learn++;
      else if (node.p === 'build' || node.id === 'build') pillarCounts.build++;
      else if (node.p === 'body' || node.id === 'body') pillarCounts.body++;
    }
  });

  const totalPillars = (pillarCounts.learn + pillarCounts.build + pillarCounts.body) || 1;
  const learnPercent = Math.round((pillarCounts.learn / totalPillars) * 100);
  const buildPercent = Math.round((pillarCounts.build / totalPillars) * 100);
  const bodyPercent = Math.round((pillarCounts.body / totalPillars) * 100);

  let dominantPillar = 'Balanced';
  if (learnPercent >= 50) dominantPillar = 'Learn';
  else if (buildPercent >= 50) dominantPillar = 'Build';
  else if (bodyPercent >= 50) dominantPillar = 'Body';

  const pillarBalance: PillarBalance = {
    learnPercent,
    buildPercent,
    bodyPercent,
    dominantPillar
  };

  // 3. Urge Analytics
  const urges = state.urges;
  const totalUrges = urges.length;
  let totalIntensity = 0;
  let totalDrop = 0;
  let delayedCount = 0;
  let surfedCount = 0;
  const triggerMap: Record<string, number> = {};
  const sensationMap: Record<string, number> = {};

  urges.forEach(u => {
    totalIntensity += u.preIntensity;
    const post = u.postIntensity ?? u.preIntensity;
    totalDrop += (u.preIntensity - post);
    if (u.outcomeStatus === 'SURFED' || u.outcomeStatus === 'RESISTED') {
      delayedCount++;
    }
    if (u.outcomeStatus === 'SURFED') {
      surfedCount++;
    }
    if (u.trigger) {
      triggerMap[u.trigger] = (triggerMap[u.trigger] || 0) + 1;
    }
    u.somaticSensations.forEach(s => {
      sensationMap[s] = (sensationMap[s] || 0) + 1;
    });
  });

  const avgIntensity = totalUrges > 0 ? Number((totalIntensity / totalUrges).toFixed(1)) : 0;
  const avgIntensityDrop = totalUrges > 0 ? Number((totalDrop / totalUrges).toFixed(1)) : 0;
  const successRate = totalUrges > 0 ? Math.round((delayedCount / totalUrges) * 100) : 100;

  const topTriggers: [string, number][] = Object.entries(triggerMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const topSomaticSensations: [string, number][] = Object.entries(sensationMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const urgeAnalytics: UrgeAnalytics = {
    totalUrges,
    avgIntensity,
    delayedCount,
    successRate,
    topTriggers,
    avgIntensityDrop,
    surfedCount,
    topSomaticSensations
  };

  return {
    correlations,
    pillarBalance,
    urgeAnalytics
  };
}

export function computeWeeklyInsights(state: AppState): WeeklyInsightsData {
  const startDate = DateUtils.daysAgoStr(7);
  const endDate = DateUtils.todayStr();

  const recentEvents = state.ev.filter(e => e.d >= startDate && e.d <= endDate);
  const totalXp = recentEvents.reduce((acc, e) => acc + e.x, 0);
  const totalCompletions = recentEvents.length;

  const moodCounts = [0, 0, 0, 0, 0];
  let sumMood = 0;
  let moodTotal = 0;
  state.jr.filter(j => j.d >= startDate && j.d <= endDate).forEach(j => {
    if (j.m >= 0 && j.m <= 4) {
      moodCounts[j.m]++;
      sumMood += j.m;
      moodTotal++;
    }
  });

  const dominantMoodIndex = moodCounts.indexOf(Math.max(...moodCounts));
  const moodEmojis = ['😢', '😔', '😐', '🙂', '😄'];
  const moodLabels = ['Heavy', 'Low', 'Neutral', 'Good', 'Radiant'];

  // Top skills
  const skillCountMap = new Map<string, { xp: number; count: number; days: Set<string> }>();
  recentEvents.forEach(e => {
    const cur = skillCountMap.get(e.n) || { xp: 0, count: 0, days: new Set() };
    cur.xp += e.x;
    cur.count++;
    cur.days.add(e.d);
    skillCountMap.set(e.n, cur);
  });

  const topSkills: WeeklyTopSkill[] = [];
  skillCountMap.forEach((data, id) => {
    const node = state.nodes.find(n => n.id === id);
    if (node) {
      const activeDays = data.days.size;
      const hybridScore = data.xp * 0.4 + data.count * 10 + activeDays * 15;
      let momentumTag = '🌱 Consistent Anchor';
      if (activeDays >= 6) momentumTag = '🔥 7-Day Streak';
      else if (data.count >= 8) momentumTag = '💪 Master Reps';
      else if (data.xp >= 60) momentumTag = '⚡ High Growth';

      topSkills.push({
        id: node.id,
        name: node.n,
        emoji: node.e,
        nature: node.nature,
        importance: node.importance,
        xpEarned: data.xp,
        completionCount: data.count,
        activeDays,
        hybridScore,
        momentumTag
      });
    }
  });

  topSkills.sort((a, b) => b.hybridScore - a.hybridScore);

  return {
    startDate,
    endDate,
    totalXp,
    totalCompletions,
    dailyThreeDays: state.dailyThreeStreak.cur,
    topSkills: topSkills.slice(0, 4),
    moodCounts,
    dominantMoodIndex,
    dominantMoodEmoji: moodEmojis[dominantMoodIndex] || '🙂',
    dominantMoodLabel: moodLabels[dominantMoodIndex] || 'Good',
    averageMood: moodTotal > 0 ? Number((sumMood / moodTotal).toFixed(1)) : 3.0,
    gratitudeEntries: state.goodDeeds.slice(0, 3)
  };
}
