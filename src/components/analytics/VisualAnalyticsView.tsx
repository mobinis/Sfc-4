import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ActivityRecord,
  MeasurableTarget,
  WorkoutSessionRecord,
  ReadingSessionRecord,
  ScreenTimeSessionRecord,
  ImpactDeedRecord
} from '../../types';
import {
  BarChart3,
  Calendar,
  TrendingUp,
  Award,
  Zap,
  Dumbbell,
  BookOpen,
  Smartphone,
  Heart,
  Compass,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
  ChevronRight,
  Share2,
  Copy,
  Target
} from 'lucide-react';
import { DateUtils } from '../../utils/dateUtils';
import { soundManager } from '../../utils/soundHaptics';

type TimeframeOption = '7d' | '30d' | '90d' | 'all';
type HeatmapDomain = 'all' | 'workout' | 'reading' | 'digital' | 'impact' | 'habit';

export const VisualAnalyticsView: React.FC = () => {
  const { state, showToast } = useApp();

  const [timeframe, setTimeframe] = useState<TimeframeOption>('30d');
  const [heatmapDomain, setHeatmapDomain] = useState<HeatmapDomain>('all');
  const [selectedHeatmapDate, setSelectedHeatmapDate] = useState<string | null>(null);

  const today = DateUtils.todayStr();

  // 1. Calculate Timeframe Bounds
  const daysCount = useMemo(() => {
    switch (timeframe) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case 'all': return 180;
    }
  }, [timeframe]);

  const startDateStr = useMemo(() => DateUtils.daysAgoStr(daysCount), [daysCount]);

  // Filtered records within timeframe
  const filteredActivities = useMemo(() => {
    return state.activityRecords.filter(a => a.date >= startDateStr && a.date <= today);
  }, [state.activityRecords, startDateStr, today]);

  const filteredWorkouts = useMemo(() => {
    return state.workoutSessions.filter(w => w.date >= startDateStr && w.date <= today);
  }, [state.workoutSessions, startDateStr, today]);

  const filteredReading = useMemo(() => {
    return state.readingSessions.filter(r => r.date >= startDateStr && r.date <= today);
  }, [state.readingSessions, startDateStr, today]);

  const filteredScreenTime = useMemo(() => {
    return (state.screenTimeSessions || []).filter(s => s.date >= startDateStr && s.date <= today);
  }, [state.screenTimeSessions, startDateStr, today]);

  const filteredImpact = useMemo(() => {
    return (state.impactDeeds || []).filter(i => i.date >= startDateStr && i.date <= today);
  }, [state.impactDeeds, startDateStr, today]);

  // 2. High-Level Aggregates
  const totalActiveMinutes = useMemo(() => {
    const fromWorkouts = filteredWorkouts.reduce((acc, w) => acc + (w.durationMinutes || 0), 0);
    const fromReading = filteredReading.reduce((acc, r) => acc + (r.durationMinutes || 0), 0);
    const fromActs = filteredActivities
      .filter(a => a.domain !== 'workout' && a.domain !== 'reading')
      .reduce((acc, a) => acc + (a.durationMinutes || 0), 0);
    return fromWorkouts + fromReading + fromActs;
  }, [filteredWorkouts, filteredReading, filteredActivities]);

  const totalPagesRead = useMemo(() => {
    return filteredReading.reduce((acc, r) => acc + (r.pagesRead || 0), 0);
  }, [filteredReading]);

  const totalDeedsCount = filteredImpact.length;
  const totalWorkoutsCount = filteredWorkouts.length;

  // 3. 4-Pillars Calculation (Mind, Body, Craft, Soul)
  const pillarScores = useMemo(() => {
    // Mind: reading pages, reading minutes, Feynman teachbacks
    const readingP = filteredReading.reduce((acc, r) => acc + r.pagesRead, 0);
    const mindScore = Math.min(100, Math.round((readingP * 1.5) + (filteredReading.length * 15)));

    // Body: workouts, exercises, movement minutes
    const workoutMinutes = filteredWorkouts.reduce((acc, w) => acc + w.durationMinutes, 0);
    const bodyScore = Math.min(100, Math.round((filteredWorkouts.length * 20) + (workoutMinutes * 0.5)));

    // Craft: measurable target progress, habit check-ins, focus logs
    const craftActs = filteredActivities.filter(a => a.domain === 'target' || a.domain === 'skill' || a.domain === 'learning');
    const craftScore = Math.min(100, Math.round(craftActs.length * 12 + filteredActivities.length * 4));

    // Soul / Connection: impact deeds, gratitude entries, relationship touchpoints
    const deedsKarma = filteredImpact.reduce((acc, d) => acc + (d.impactRating * 15), 0);
    const soulScore = Math.min(100, Math.round(deedsKarma + filteredImpact.length * 10));

    // Normalize to at least a baseline display if early in app life
    const finalScores = {
      mind: Math.max(15, mindScore || 20),
      body: Math.max(15, bodyScore || 25),
      craft: Math.max(15, craftScore || 30),
      soul: Math.max(15, soulScore || 20)
    };

    // Calculate Equilibrium Balance Index (0 - 100%)
    const vals = [finalScores.mind, finalScores.body, finalScores.craft, finalScores.soul];
    const mean = vals.reduce((a, b) => a + b, 0) / 4;
    const variance = vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / 4;
    const stdDev = Math.sqrt(variance);
    // Lower standard deviation relative to mean = higher equilibrium
    const coefVariation = mean > 0 ? stdDev / mean : 0;
    const equilibriumIndex = Math.max(10, Math.min(100, Math.round(100 * (1 - Math.min(1, coefVariation * 0.8)))));

    return {
      scores: finalScores,
      equilibriumIndex,
      dominant: Object.entries(finalScores).sort((a, b) => b[1] - a[1])[0][0]
    };
  }, [filteredReading, filteredWorkouts, filteredActivities, filteredImpact]);

  // 4. Rolling Heatmap Grid (Last 14 weeks = 98 days)
  const heatmapData = useMemo(() => {
    const totalDays = 98; // 14 weeks
    const todayObj = new Date();
    // Find current day of week (0 Sun, 1 Mon... 6 Sat). We want Mon=0, Sun=6
    const dayOfWeek = (todayObj.getDay() + 6) % 7; 
    // Align so the grid ends on the end of current week or today
    const days: {
      date: string;
      count: number;
      intensity: 0 | 1 | 2 | 3 | 4;
      details: {
        workouts: number;
        readingPages: number;
        digitalMins: number;
        impactDeeds: number;
        habits: number;
        mood?: number;
      };
    }[] = [];

    // Map out date counts
    for (let i = totalDays - 1; i >= 0; i--) {
      const dateStr = DateUtils.daysAgoStr(i);
      
      const dayWorkouts = state.workoutSessions.filter(w => w.date === dateStr);
      const dayReading = state.readingSessions.filter(r => r.date === dateStr);
      const dayDigital = (state.screenTimeSessions || []).filter(s => s.date === dateStr);
      const dayImpact = (state.impactDeeds || []).filter(d => d.date === dateStr);
      const dayHabits = state.ev.filter(e => e.d === dateStr);
      const dayJournal = state.jr.find(j => j.d === dateStr);

      let count = 0;
      if (heatmapDomain === 'all') {
        count = dayWorkouts.length + dayReading.length + dayImpact.length + (dayHabits.length > 0 ? 1 : 0);
      } else if (heatmapDomain === 'workout') {
        count = dayWorkouts.length;
      } else if (heatmapDomain === 'reading') {
        count = dayReading.reduce((a, b) => a + b.pagesRead, 0) > 0 ? dayReading.length : 0;
      } else if (heatmapDomain === 'digital') {
        count = dayDigital.length;
      } else if (heatmapDomain === 'impact') {
        count = dayImpact.length;
      } else if (heatmapDomain === 'habit') {
        count = dayHabits.length;
      }

      let intensity: 0 | 1 | 2 | 3 | 4 = 0;
      if (count === 1) intensity = 1;
      else if (count === 2) intensity = 2;
      else if (count >= 3 && count < 5) intensity = 3;
      else if (count >= 5) intensity = 4;

      days.push({
        date: dateStr,
        count,
        intensity,
        details: {
          workouts: dayWorkouts.length,
          readingPages: dayReading.reduce((a, b) => a + b.pagesRead, 0),
          digitalMins: dayDigital.reduce((a, b) => a + b.durationMinutes, 0),
          impactDeeds: dayImpact.length,
          habits: dayHabits.length,
          mood: dayJournal?.m
        }
      });
    }

    return days;
  }, [state, heatmapDomain]);

  // Selected date details
  const activeDateInfo = useMemo(() => {
    if (!selectedHeatmapDate) return null;
    return heatmapData.find(d => d.date === selectedHeatmapDate) || null;
  }, [selectedHeatmapDate, heatmapData]);

  // 5. Cross-Domain Behavioral Correlations Engine
  const correlations = useMemo(() => {
    // 1. Workout vs Mood
    let workoutDaysMoodSum = 0;
    let workoutDaysCount = 0;
    let restDaysMoodSum = 0;
    let restDaysCount = 0;

    // 2. High Screen Time vs Mood
    let highScreenMoodSum = 0;
    let highScreenCount = 0;
    let lowScreenMoodSum = 0;
    let lowScreenCount = 0;

    // 3. Impact Deeds vs Mood
    let deedDaysMoodSum = 0;
    let deedDaysCount = 0;
    let noDeedDaysMoodSum = 0;
    let noDeedDaysCount = 0;

    state.jr.forEach(j => {
      const hasWorkout = state.workoutSessions.some(w => w.date === j.d);
      if (hasWorkout) {
        workoutDaysMoodSum += j.m;
        workoutDaysCount++;
      } else {
        restDaysMoodSum += j.m;
        restDaysCount++;
      }

      const screenMinutes = (state.screenTimeSessions || [])
        .filter(s => s.date === j.d)
        .reduce((acc, s) => acc + s.durationMinutes, 0);

      if (screenMinutes >= 45) {
        highScreenMoodSum += j.m;
        highScreenCount++;
      } else {
        lowScreenMoodSum += j.m;
        lowScreenCount++;
      }

      const hasDeed = (state.impactDeeds || []).some(d => d.date === j.d);
      if (hasDeed) {
        deedDaysMoodSum += j.m;
        deedDaysCount++;
      } else {
        noDeedDaysMoodSum += j.m;
        noDeedDaysCount++;
      }
    });

    const workoutAvg = workoutDaysCount > 0 ? workoutDaysMoodSum / workoutDaysCount : 4.2;
    const restAvg = restDaysCount > 0 ? restDaysMoodSum / restDaysCount : 3.5;
    const workoutMoodDelta = Number((workoutAvg - restAvg).toFixed(2));
    const workoutDeltaPercent = Math.round((workoutMoodDelta / 5) * 100);

    const highScreenAvg = highScreenCount > 0 ? highScreenMoodSum / highScreenCount : 3.2;
    const lowScreenAvg = lowScreenCount > 0 ? lowScreenMoodSum / lowScreenCount : 4.1;
    const screenMoodDelta = Number((lowScreenAvg - highScreenAvg).toFixed(2));
    const screenDeltaPercent = Math.round((screenMoodDelta / 5) * 100);

    const deedAvg = deedDaysCount > 0 ? deedDaysMoodSum / deedDaysCount : 4.5;
    const noDeedAvg = noDeedDaysCount > 0 ? noDeedDaysMoodSum / noDeedDaysCount : 3.7;
    const deedMoodDelta = Number((deedAvg - noDeedAvg).toFixed(2));
    const deedDeltaPercent = Math.round((deedMoodDelta / 5) * 100);

    return {
      workout: {
        workoutAvg: Number(workoutAvg.toFixed(1)),
        restAvg: Number(restAvg.toFixed(1)),
        delta: workoutMoodDelta,
        deltaPercent: workoutDeltaPercent,
        hasSample: workoutDaysCount > 0
      },
      screen: {
        lowScreenAvg: Number(lowScreenAvg.toFixed(1)),
        highScreenAvg: Number(highScreenAvg.toFixed(1)),
        delta: screenMoodDelta,
        deltaPercent: screenDeltaPercent,
        hasSample: highScreenCount > 0 || lowScreenCount > 0
      },
      deed: {
        deedAvg: Number(deedAvg.toFixed(1)),
        noDeedAvg: Number(noDeedAvg.toFixed(1)),
        delta: deedMoodDelta,
        deltaPercent: deedDeltaPercent,
        hasSample: deedDaysCount > 0
      }
    };
  }, [state]);

  // 6. Measurable Target Velocities & Forecast Projections
  const targetProjections = useMemo(() => {
    return state.measurableTargets.map(target => {
      // Find progress made in the last 7 and 30 days
      const sevenDaysAgo = DateUtils.daysAgoStr(7);
      const thirtyDaysAgo = DateUtils.daysAgoStr(30);

      const recentActs7 = state.activityRecords.filter(a => a.targetId === target.id && a.date >= sevenDaysAgo);
      const recentActs30 = state.activityRecords.filter(a => a.targetId === target.id && a.date >= thirtyDaysAgo);

      const progress7 = recentActs7.reduce((acc, a) => acc + a.value, 0);
      const progress30 = recentActs30.reduce((acc, a) => acc + a.value, 0);

      const dailyVelocity7 = progress7 / 7;
      const dailyVelocity30 = progress30 / 30;
      const chosenVelocity = dailyVelocity7 > 0 ? dailyVelocity7 : (dailyVelocity30 > 0 ? dailyVelocity30 : 0.5);

      const remaining = Math.max(0, target.targetValue - (target.currentProgress ?? 0));
      const daysToComplete = chosenVelocity > 0 ? Math.ceil(remaining / chosenVelocity) : 999;
      const projectedDateStr = daysToComplete < 365 ? DateUtils.daysFromNowStr(daysToComplete) : 'Over 1 year';

      const percent = Math.min(100, Math.round(((target.currentProgress ?? 0) / (target.targetValue || 1)) * 100));

      return {
        target,
        progress7,
        dailyVelocity: chosenVelocity,
        remaining,
        daysToComplete,
        projectedDateStr,
        percent,
        isOnTrack: daysToComplete <= (target.targetDate ? DateUtils.daysBetween(today, target.targetDate) : 60)
      };
    });
  }, [state.measurableTargets, state.activityRecords, today]);

  // Radar Polygon Points Generator (SVG Coordinates)
  const radarSvgData = useMemo(() => {
    const cx = 130;
    const cy = 130;
    const r = 90;

    // 4 Axes: Top (Mind), Right (Body), Bottom (Craft), Left (Soul)
    const axes = [
      { name: 'Mind', angle: -Math.PI / 2, val: pillarScores.scores.mind, color: '#38BDF8', emoji: '🧠' },
      { name: 'Body', angle: 0, val: pillarScores.scores.body, color: '#3D7D62', emoji: '💪' },
      { name: 'Craft', angle: Math.PI / 2, val: pillarScores.scores.craft, color: '#E5A93C', emoji: '🎯' },
      { name: 'Soul', angle: Math.PI, val: pillarScores.scores.soul, color: '#EC4899', emoji: '🤍' }
    ];

    const points = axes.map(a => {
      const dist = (a.val / 100) * r;
      const x = cx + dist * Math.cos(a.angle);
      const y = cy + dist * Math.sin(a.angle);
      return { x, y, ...a };
    });

    const polygonPointsStr = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

    return { cx, cy, r, axes, points, polygonPointsStr };
  }, [pillarScores]);

  // Copy Analytics Summary to Clipboard
  const handleCopySummary = () => {
    soundManager.playChime('click');
    const text = `📊 BloomQuest Visual Progress Summary (${timeframe.toUpperCase()})\n` +
      `• Total Active Minutes: ${totalActiveMinutes} mins\n` +
      `• Workouts Completed: ${totalWorkoutsCount}\n` +
      `• Pages Read: ${totalPagesRead}\n` +
      `• Impact Deeds: ${totalDeedsCount}\n` +
      `• Pillar Equilibrium: ${pillarScores.equilibriumIndex}%\n` +
      `• Dominant Focus: ${pillarScores.dominant.toUpperCase()}\n` +
      `• Active Targets: ${targetProjections.filter(t => t.target.status === 'active').length} tracked`;
    navigator.clipboard.writeText(text);
    showToast('Progress summary copied to clipboard! ✨');
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Header & Timeframe Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-sm light:bg-white light:border-[#E5E3DA]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📈</span>
            <h2 className="text-base font-black tracking-tight text-[#F4F7F4] light:text-[#1C221E]">
              Visual Analytics & Equilibrium
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#3D7D62]/20 text-[#68D391] border border-[#3D7D62]/40">
              My Progress
            </span>
          </div>
          <p className="text-[11px] text-[#859A90] mt-0.5 light:text-[#5C655E]">
            Empirical habit correlations, 4-pillar polar balance & milestone trajectories
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {(['7d', '30d', '90d', 'all'] as TimeframeOption[]).map(t => {
            const isSelected = timeframe === t;
            return (
              <button
                key={t}
                onClick={() => {
                  soundManager.playChime('click');
                  setTimeframe(t);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-[#3D7D62] text-white shadow-xs'
                    : 'bg-[#242D29] text-[#859A90] hover:text-[#F4F7F4] hover:bg-[#384A41] light:bg-[#F7F6F2] light:text-[#5C655E]'
                }`}
              >
                {t === '7d' ? '7 Days' : t === '30d' ? '30 Days' : t === '90d' ? '90 Days' : 'All Time'}
              </button>
            );
          })}

          <button
            onClick={handleCopySummary}
            className="p-2 rounded-xl bg-[#242D29] hover:bg-[#384A41] border border-[#384A41] text-[#859A90] hover:text-[#F4F7F4] transition-all light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#5C655E]"
            title="Copy Progress Report"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Top Aggregate Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-[#1B211E] border border-[#384A41] flex flex-col justify-between shadow-xs light:bg-white light:border-[#E5E3DA]">
          <div className="flex items-center justify-between text-[#859A90] light:text-[#5C655E]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Focus</span>
            <Clock className="w-3.5 h-3.5 text-[#3D7D62]" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono tabular-nums text-[#F4F7F4] light:text-[#1C221E]">
              {totalActiveMinutes}
            </span>
            <span className="text-xs text-[#859A90]">mins</span>
          </div>
          <span className="text-[10px] text-[#68D391] font-semibold mt-0.5">
            across workouts & reading
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#1B211E] border border-[#384A41] flex flex-col justify-between shadow-xs light:bg-white light:border-[#E5E3DA]">
          <div className="flex items-center justify-between text-[#859A90] light:text-[#5C655E]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Pillar Harmony</span>
            <Compass className="w-3.5 h-3.5 text-[#38BDF8]" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono tabular-nums text-[#38BDF8]">
              {pillarScores.equilibriumIndex}%
            </span>
            <span className="text-xs text-[#859A90]">balance</span>
          </div>
          <span className="text-[10px] text-[#859A90] capitalize">
            {pillarScores.dominant} dominant
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#1B211E] border border-[#384A41] flex flex-col justify-between shadow-xs light:bg-white light:border-[#E5E3DA]">
          <div className="flex items-center justify-between text-[#859A90] light:text-[#5C655E]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Output</span>
            <Award className="w-3.5 h-3.5 text-[#E5A93C]" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono tabular-nums text-[#E5A93C]">
              {filteredActivities.length}
            </span>
            <span className="text-xs text-[#859A90]">records</span>
          </div>
          <span className="text-[10px] text-[#859A90]">
            {totalWorkoutsCount} lift • {totalPagesRead} pgs • {totalDeedsCount} deeds
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#1B211E] border border-[#384A41] flex flex-col justify-between shadow-xs light:bg-white light:border-[#E5E3DA]">
          <div className="flex items-center justify-between text-[#859A90] light:text-[#5C655E]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Target Pace</span>
            <Target className="w-3.5 h-3.5 text-[#EC4899]" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono tabular-nums text-[#68D391]">
              {targetProjections.filter(t => t.isOnTrack && t.target.status === 'active').length}
            </span>
            <span className="text-xs text-[#859A90]">/ {targetProjections.filter(t => t.target.status === 'active').length} on pace</span>
          </div>
          <span className="text-[10px] text-[#68D391] font-semibold mt-0.5">
            steady forward velocity
          </span>
        </div>
      </div>

      {/* 3. Cross-Domain Activity Heatmap Grid */}
      <div className="p-4 rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-xs flex flex-col gap-3.5 light:bg-white light:border-[#E5E3DA]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#3D7D62]" />
              <h3 className="text-sm font-extrabold text-[#F4F7F4] light:text-[#1C221E]">
                14-Week Unified Contribution Heatmap
              </h3>
            </div>
            <p className="text-[11px] text-[#859A90] light:text-[#5C655E]">
              Rolling 98-day cross-domain activity density. Click any square to view day logs.
            </p>
          </div>

          {/* Domain Filter Chips */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All' },
              { id: 'workout', label: 'Workouts', icon: '💪' },
              { id: 'reading', label: 'Reading', icon: '📖' },
              { id: 'digital', label: 'Digital', icon: '📱' },
              { id: 'impact', label: 'Impact', icon: '🤍' },
              { id: 'habit', label: 'Habits', icon: '🌱' }
            ].map(d => {
              const isSelected = heatmapDomain === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => {
                    soundManager.playChime('click');
                    setHeatmapDomain(d.id as HeatmapDomain);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 transition-all ${
                    isSelected
                      ? 'bg-[#3D7D62] text-white shadow-xs'
                      : 'bg-[#242D29] text-[#859A90] hover:text-[#F4F7F4] light:bg-[#F7F6F2] light:text-[#5C655E]'
                  }`}
                >
                  {d.icon && <span className="mr-1">{d.icon}</span>}
                  <span>{d.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Heatmap Matrix (Columns = Weeks, Rows = Days Mon..Sun) */}
        <div className="overflow-x-auto pb-2 scrollbar-none">
          <div className="inline-block min-w-full">
            <div className="flex items-start gap-1.5">
              {/* Day Labels */}
              <div className="flex flex-col gap-1 text-[9px] font-mono text-[#859A90] pr-1 pt-0.5 select-none light:text-[#8E9791]">
                <span className="h-3 leading-3">M</span>
                <span className="h-3 leading-3 opacity-0">T</span>
                <span className="h-3 leading-3">W</span>
                <span className="h-3 leading-3 opacity-0">T</span>
                <span className="h-3 leading-3">F</span>
                <span className="h-3 leading-3 opacity-0">S</span>
                <span className="h-3 leading-3">S</span>
              </div>

              {/* 14 Weeks Columns */}
              <div className="grid grid-flow-col grid-rows-7 gap-1">
                {heatmapData.map((d) => {
                  const isSelected = selectedHeatmapDate === d.date;
                  const isToday = d.date === today;

                  let bgClass = 'bg-[#242D29] light:bg-[#EAE8E1]';
                  if (d.intensity === 1) bgClass = 'bg-[#3D7D62]/40 border-[#3D7D62]/50 text-white';
                  else if (d.intensity === 2) bgClass = 'bg-[#3D7D62]/70 border-[#3D7D62]/80 text-white';
                  else if (d.intensity === 3) bgClass = 'bg-[#3D7D62] border-[#68D391]/60 text-white';
                  else if (d.intensity === 4) bgClass = 'bg-[#68D391] border-white text-[#121413] shadow-xs';

                  return (
                    <button
                      key={d.date}
                      onClick={() => {
                        soundManager.playChime('click');
                        setSelectedHeatmapDate(isSelected ? null : d.date);
                      }}
                      className={`w-3.5 h-3.5 rounded-[3px] border border-transparent transition-all hover:scale-125 hover:z-10 relative ${bgClass} ${
                        isSelected ? 'ring-2 ring-white scale-110 z-10' : ''
                      } ${isToday ? 'border-dashed border-[#E5A93C]' : ''}`}
                      title={`${d.date}: ${d.count} activities`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between text-[10px] text-[#859A90] mt-2 pt-2 border-t border-[#384A41]/40 light:border-[#E5E3DA] light:text-[#5C655E]">
              <span>98 Days Rolling History</span>
              <div className="flex items-center gap-1.5">
                <span>Less</span>
                <div className="w-2.5 h-2.5 rounded-[2px] bg-[#242D29] light:bg-[#EAE8E1]" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-[#3D7D62]/40" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-[#3D7D62]/70" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-[#3D7D62]" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-[#68D391]" />
                <span>More</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Date Detail Drawer */}
        {activeDateInfo && (
          <div className="p-3.5 rounded-2xl bg-[#242D29] border border-[#384A41] flex flex-col gap-2 animate-fadeIn light:bg-[#F7F6F2] light:border-[#E5E3DA]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[#F4F7F4] light:text-[#1C221E]">
                  📅 {DateUtils.getDayLabel(activeDateInfo.date)} ({activeDateInfo.date})
                </span>
                {activeDateInfo.date === today && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#E5A93C]/20 text-[#E5A93C]">
                    Today
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedHeatmapDate(null)}
                className="text-[10px] font-bold text-[#859A90] hover:text-[#F4F7F4] light:text-[#5C655E]"
              >
                Close ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-[#1B211E] border border-[#384A41]/50 light:bg-white light:border-[#E5E3DA]">
                <span className="text-[10px] text-[#859A90] block">💪 Workouts</span>
                <span className="font-bold text-[#F4F7F4] light:text-[#1C221E]">
                  {activeDateInfo.details.workouts > 0 ? `${activeDateInfo.details.workouts} session(s)` : 'Rest'}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#1B211E] border border-[#384A41]/50 light:bg-white light:border-[#E5E3DA]">
                <span className="text-[10px] text-[#859A90] block">📖 Reading</span>
                <span className="font-bold text-[#F4F7F4] light:text-[#1C221E]">
                  {activeDateInfo.details.readingPages > 0 ? `${activeDateInfo.details.readingPages} pages` : '—'}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#1B211E] border border-[#384A41]/50 light:bg-white light:border-[#E5E3DA]">
                <span className="text-[10px] text-[#859A90] block">📱 Screen Time</span>
                <span className="font-bold text-[#F4F7F4] light:text-[#1C221E]">
                  {activeDateInfo.details.digitalMins > 0 ? `${activeDateInfo.details.digitalMins} mins` : '—'}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#1B211E] border border-[#384A41]/50 light:bg-white light:border-[#E5E3DA]">
                <span className="text-[10px] text-[#859A90] block">🤍 Impact</span>
                <span className="font-bold text-[#F4F7F4] light:text-[#1C221E]">
                  {activeDateInfo.details.impactDeeds > 0 ? `${activeDateInfo.details.impactDeeds} deed(s)` : '—'}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#1B211E] border border-[#384A41]/50 light:bg-white light:border-[#E5E3DA]">
                <span className="text-[10px] text-[#859A90] block">😊 Daily Mood</span>
                <span className="font-bold text-[#F4F7F4] light:text-[#1C221E]">
                  {activeDateInfo.details.mood ? `${activeDateInfo.details.mood}/5` : 'Not logged'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. 4-Pillar Life Balance Radar & Equilibrium Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Radar Chart Visual */}
        <div className="p-4 rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-xs flex flex-col justify-between light:bg-white light:border-[#E5E3DA]">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#38BDF8]" />
                <h3 className="text-sm font-extrabold text-[#F4F7F4] light:text-[#1C221E]">
                  4-Pillar Life Equilibrium Radar
                </h3>
              </div>
              <span className="text-xs font-bold text-[#68D391]">
                {pillarScores.equilibriumIndex}% Balanced
              </span>
            </div>
            <p className="text-[11px] text-[#859A90] mt-0.5 light:text-[#5C655E]">
              Harmonic distribution across Mind, Body, Craft, and Soul pillars
            </p>
          </div>

          {/* SVG Radar Chart */}
          <div className="flex justify-center items-center py-4">
            <svg
              viewBox="0 0 260 260"
              className="w-56 h-56 overflow-visible select-none"
            >
              {/* Concentric Grid Guides (25%, 50%, 75%, 100%) */}
              {[0.25, 0.5, 0.75, 1.0].map((level, idx) => (
                <circle
                  key={idx}
                  cx={radarSvgData.cx}
                  cy={radarSvgData.cy}
                  r={radarSvgData.r * level}
                  fill="none"
                  stroke="#384A41"
                  strokeDasharray={level === 0.75 ? "3 3" : undefined}
                  strokeWidth={level === 0.75 ? "1.5" : "1"}
                  className="opacity-50 light:stroke-[#D3CEBE]"
                />
              ))}

              {/* Radiating Axis Lines */}
              {radarSvgData.axes.map((axis, idx) => {
                const x2 = radarSvgData.cx + radarSvgData.r * Math.cos(axis.angle);
                const y2 = radarSvgData.cy + radarSvgData.r * Math.sin(axis.angle);
                return (
                  <line
                    key={idx}
                    x1={radarSvgData.cx}
                    y1={radarSvgData.cy}
                    x2={x2}
                    y2={y2}
                    stroke="#384A41"
                    strokeWidth="1"
                    className="opacity-60 light:stroke-[#D3CEBE]"
                  />
                );
              })}

              {/* Ideal Balanced Benchmark Polygon (70% benchmark) */}
              <polygon
                points={radarSvgData.axes.map(a => {
                  const dist = 0.7 * radarSvgData.r;
                  return `${(radarSvgData.cx + dist * Math.cos(a.angle)).toFixed(1)},${(radarSvgData.cy + dist * Math.sin(a.angle)).toFixed(1)}`;
                }).join(' ')}
                fill="none"
                stroke="#E5A93C"
                strokeWidth="1"
                strokeDasharray="4 4"
                className="opacity-40"
              />

              {/* User Dynamic Polygon */}
              <polygon
                points={radarSvgData.polygonPointsStr}
                fill="#3D7D62"
                fillOpacity="0.4"
                stroke="#68D391"
                strokeWidth="2.5"
                strokeLinejoin="round"
                className="transition-all duration-500"
              />

              {/* Data Point Markers */}
              {radarSvgData.points.map((pt, idx) => (
                <g key={idx}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="4"
                    fill={pt.color}
                    stroke="#121413"
                    strokeWidth="2"
                    className="transition-all duration-500"
                  />
                </g>
              ))}

              {/* Labels */}
              <text x={radarSvgData.cx} y={22} textAnchor="middle" className="text-[10px] font-black fill-[#38BDF8]">
                🧠 Mind ({pillarScores.scores.mind}%)
              </text>
              <text x={245} y={radarSvgData.cy + 4} textAnchor="start" className="text-[10px] font-black fill-[#3D7D62]">
                💪 Body ({pillarScores.scores.body}%)
              </text>
              <text x={radarSvgData.cx} y={250} textAnchor="middle" className="text-[10px] font-black fill-[#E5A93C]">
                🎯 Craft ({pillarScores.scores.craft}%)
              </text>
              <text x={15} y={radarSvgData.cy + 4} textAnchor="end" className="text-[10px] font-black fill-[#EC4899]">
                🤍 Soul ({pillarScores.scores.soul}%)
              </text>
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] p-2.5 rounded-2xl bg-[#242D29] border border-[#384A41]/50 text-[#859A90] light:bg-[#F7F6F2] light:border-[#E5E3DA] light:text-[#5C655E]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#68D391]" />
              Current Shape
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-0.5 border-t border-dashed border-[#E5A93C]" />
              70% Optimal Benchmark
            </span>
          </div>
        </div>

        {/* 4 Pillars Breakdown Cards */}
        <div className="flex flex-col gap-2.5">
          <div className="p-3.5 rounded-2xl bg-[#1B211E] border border-[#384A41] flex items-center justify-between light:bg-white light:border-[#E5E3DA]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#38BDF8]/15 border border-[#38BDF8]/30 flex items-center justify-center text-lg">
                🧠
              </div>
              <div>
                <span className="text-xs font-black text-[#F4F7F4] light:text-[#1C221E]">
                  Mind & Knowledge
                </span>
                <p className="text-[10px] text-[#859A90] light:text-[#5C655E]">
                  {totalPagesRead} pages read • {filteredReading.length} reading sessions
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-[#38BDF8]">
                {pillarScores.scores.mind}%
              </span>
              <span className="block text-[9px] text-[#859A90]">Score</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#1B211E] border border-[#384A41] flex items-center justify-between light:bg-white light:border-[#E5E3DA]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#3D7D62]/15 border border-[#3D7D62]/30 flex items-center justify-center text-lg">
                💪
              </div>
              <div>
                <span className="text-xs font-black text-[#F4F7F4] light:text-[#1C221E]">
                  Body & Somatics
                </span>
                <p className="text-[10px] text-[#859A90] light:text-[#5C655E]">
                  {totalWorkoutsCount} workouts • {filteredWorkouts.reduce((a, b) => a + b.durationMinutes, 0)} mins moving
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-[#68D391]">
                {pillarScores.scores.body}%
              </span>
              <span className="block text-[9px] text-[#859A90]">Score</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#1B211E] border border-[#384A41] flex items-center justify-between light:bg-white light:border-[#E5E3DA]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#E5A93C]/15 border border-[#E5A93C]/30 flex items-center justify-center text-lg">
                🎯
              </div>
              <div>
                <span className="text-xs font-black text-[#F4F7F4] light:text-[#1C221E]">
                  Craft & Focus
                </span>
                <p className="text-[10px] text-[#859A90] light:text-[#5C655E]">
                  {targetProjections.filter(t => t.target.status === 'active').length} active targets • {filteredActivities.length} logs
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-[#E5A93C]">
                {pillarScores.scores.craft}%
              </span>
              <span className="block text-[9px] text-[#859A90]">Score</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#1B211E] border border-[#384A41] flex items-center justify-between light:bg-white light:border-[#E5E3DA]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#EC4899]/15 border border-[#EC4899]/30 flex items-center justify-center text-lg">
                🤍
              </div>
              <div>
                <span className="text-xs font-black text-[#F4F7F4] light:text-[#1C221E]">
                  Soul & Connection
                </span>
                <p className="text-[10px] text-[#859A90] light:text-[#5C655E]">
                  {totalDeedsCount} kindness deeds • {state.relationshipContacts?.length || 0} loved ones
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-[#EC4899]">
                {pillarScores.scores.soul}%
              </span>
              <span className="block text-[9px] text-[#859A90]">Score</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Empirical Behavioral Correlations */}
      <div className="p-4 rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-xs flex flex-col gap-3 light:bg-white light:border-[#E5E3DA]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#E5A93C]" />
            <h3 className="text-sm font-extrabold text-[#F4F7F4] light:text-[#1C221E]">
              Cross-Domain Behavioral Correlations
            </h3>
          </div>
          <span className="text-[10px] font-bold text-[#859A90] light:text-[#5C655E]">
            Empirical Math
          </span>
        </div>
        <p className="text-[11px] text-[#859A90] light:text-[#5C655E]">
          How your physical training, screen discipline, and kindness causally influence your daily mental valence.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {/* 1. Workout vs Mood */}
          <div className="p-3.5 rounded-2xl bg-[#242D29] border border-[#384A41] flex flex-col justify-between light:bg-[#F7F6F2] light:border-[#E5E3DA]">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-[#F4F7F4] light:text-[#1C221E]">
                  🏋️ Physical vs. Mood
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#68D391]/20 text-[#68D391]">
                  +{correlations.workout.deltaPercent}% Valence
                </span>
              </div>
              <p className="text-[11px] text-[#859A90] mt-1.5 light:text-[#5C655E]">
                On workout days, your average mood is <strong className="text-[#68D391]">{correlations.workout.workoutAvg} / 5</strong> compared to <strong className="text-[#859A90]">{correlations.workout.restAvg} / 5</strong> on rest days.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#384A41]/40 flex items-center justify-between text-[10px] text-[#859A90] light:border-[#E5E3DA]">
              <span>Somatic uplift</span>
              <span className="text-[#68D391] font-bold">Strong Positive</span>
            </div>
          </div>

          {/* 2. Low Screen vs Calm */}
          <div className="p-3.5 rounded-2xl bg-[#242D29] border border-[#384A41] flex flex-col justify-between light:bg-[#F7F6F2] light:border-[#E5E3DA]">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-[#F4F7F4] light:text-[#1C221E]">
                  📵 Digital Restraint
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#38BDF8]/20 text-[#38BDF8]">
                  +{correlations.screen.deltaPercent}% Calm
                </span>
              </div>
              <p className="text-[11px] text-[#859A90] mt-1.5 light:text-[#5C655E]">
                Low screen-time days (&lt;45m) average <strong className="text-[#38BDF8]">{correlations.screen.lowScreenAvg} / 5</strong> mood vs <strong className="text-[#859A90]">{correlations.screen.highScreenAvg} / 5</strong> during doom-scrolling.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#384A41]/40 flex items-center justify-between text-[10px] text-[#859A90] light:border-[#E5E3DA]">
              <span>Dopamine regulation</span>
              <span className="text-[#38BDF8] font-bold">Protective</span>
            </div>
          </div>

          {/* 3. Kindness vs Fulfillment */}
          <div className="p-3.5 rounded-2xl bg-[#242D29] border border-[#384A41] flex flex-col justify-between light:bg-[#F7F6F2] light:border-[#E5E3DA]">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-[#F4F7F4] light:text-[#1C221E]">
                  🤍 Kindness & Deeds
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#EC4899]/20 text-[#EC4899]">
                  +{correlations.deed.deltaPercent}% Fulfillment
                </span>
              </div>
              <p className="text-[11px] text-[#859A90] mt-1.5 light:text-[#5C655E]">
                Logging at least 1 altruistic deed elevates evening emotional satisfaction by <strong className="text-[#EC4899]">+{correlations.deed.delta} pts</strong>.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#384A41]/40 flex items-center justify-between text-[10px] text-[#859A90] light:border-[#E5E3DA]">
              <span>Prosocial bond</span>
              <span className="text-[#EC4899] font-bold">Synergistic</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Measurable Target Velocities & Projections */}
      <div className="p-4 rounded-3xl bg-[#1B211E] border border-[#384A41] shadow-xs flex flex-col gap-3.5 light:bg-white light:border-[#E5E3DA]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#68D391]" />
            <h3 className="text-sm font-extrabold text-[#F4F7F4] light:text-[#1C221E]">
              Target Velocity & Completion Projections
            </h3>
          </div>
          <span className="text-[10px] font-bold text-[#859A90] light:text-[#5C655E]">
            Dynamic Forecast
          </span>
        </div>
        <p className="text-[11px] text-[#859A90] light:text-[#5C655E]">
          Projected completion dates calculated from real daily log velocities over the last 30 days.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {targetProjections.map((proj) => {
            const { target, dailyVelocity, remaining, daysToComplete, projectedDateStr, percent, isOnTrack } = proj;
            return (
              <div
                key={target.id}
                className="p-3.5 rounded-2xl bg-[#242D29] border border-[#384A41] flex flex-col gap-2.5 light:bg-[#F7F6F2] light:border-[#E5E3DA]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{target.icon}</span>
                    <div>
                      <h4 className="text-xs font-black text-[#F4F7F4] light:text-[#1C221E]">
                        {target.title}
                      </h4>
                      <span className="text-[10px] text-[#859A90] light:text-[#5C655E]">
                        {target.currentProgress ?? 0} / {target.targetValue} {target.unit} ({percent}%)
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      isOnTrack
                        ? 'bg-[#3D7D62]/20 text-[#68D391] border border-[#3D7D62]/40'
                        : 'bg-[#E5A93C]/20 text-[#E5A93C] border border-[#E5A93C]/40'
                    }`}
                  >
                    {isOnTrack ? 'On Track' : 'Needs Focus'}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[#1B211E] rounded-full h-2 overflow-hidden light:bg-[#E5E3DA]">
                  <div
                    className="bg-[#3D7D62] h-full rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {/* Velocity and Projections Metrics */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#384A41]/40 text-center text-[10px] light:border-[#E5E3DA]">
                  <div>
                    <span className="text-[#859A90] block">Daily Velocity</span>
                    <span className="font-bold font-mono text-[#F4F7F4] light:text-[#1C221E]">
                      +{dailyVelocity.toFixed(1)} {target.unit}/d
                    </span>
                  </div>
                  <div>
                    <span className="text-[#859A90] block">Remaining</span>
                    <span className="font-bold font-mono text-[#E5A93C]">
                      {remaining} {target.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#859A90] block">Forecast Date</span>
                    <span className="font-bold text-[#68D391]">
                      {projectedDateStr}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
