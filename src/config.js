/**
 * Central Multi-Variant Application Configuration
 * Isolates Android package IDs and toggles feature sets per build target
 */
export const APP_CONFIG = {
  variantId: 'core', // 'core' | 'sprint' | 'mind' | 'growth'
  appId: 'com.selfcare.hero.core', // Unique package ID per variant for Android sandbox isolation
  appName: 'SelfCare Hero - Core',
  enableAiCopilot: true,
  enableSomaticBreathing: true,
  enableAntiGoals: true,
  enableRoadmap: true,
  enableFeynman: true,
  enableUrgeSurfing: true,
  enableSprint: true,
  enableAudioSoundscapes: true
};

export const APP_VARIANTS = {
  core: {
    variantId: 'core',
    appId: 'com.selfcare.hero.core',
    appName: 'SelfCare Hero - Core',
    tagline: 'Complete Holistic Self-Care Sanctuary',
    description: 'Unified daily habit tracking, circadian rhythms, somatic breathing, learn roadmap, and AI copilot.',
    enableAiCopilot: true,
    enableSomaticBreathing: true,
    enableAntiGoals: true,
    enableRoadmap: true,
    enableFeynman: true,
    enableUrgeSurfing: true,
    enableSprint: true,
    enableAudioSoundscapes: true
  },
  sprint: {
    variantId: 'sprint',
    appId: 'com.selfcare.hero.sprint',
    appName: 'SelfCare Hero - Sprint',
    tagline: '14-Day Velocity & Habit Contracts',
    description: 'Focused execution: habit contracts, 14-day sprint goals, daily check-ins, velocity metrics, and anti-goals.',
    enableAiCopilot: false,
    enableSomaticBreathing: false,
    enableAntiGoals: true,
    enableRoadmap: true,
    enableFeynman: false,
    enableUrgeSurfing: false,
    enableSprint: true,
    enableAudioSoundscapes: false
  },
  mind: {
    variantId: 'mind',
    appId: 'com.selfcare.hero.mind',
    appName: 'SelfCare Hero - Mind',
    tagline: 'Somatic Mindfulness & Urge Surfing',
    description: 'Nervous system regulation: 4-7-8 and box breath pacing, urge surfing waves, procedural soundscapes, and PIN privacy.',
    enableAiCopilot: true,
    enableSomaticBreathing: true,
    enableAntiGoals: true,
    enableRoadmap: false,
    enableFeynman: false,
    enableUrgeSurfing: true,
    enableSprint: false,
    enableAudioSoundscapes: true
  },
  growth: {
    variantId: 'growth',
    appId: 'com.selfcare.hero.growth',
    appName: 'SelfCare Hero - Growth',
    tagline: 'Future Learning & SM-2 Wisdom Recall',
    description: 'Intellectual mastery: Future Learning Roadmap, Feynman teach-back review cards powered by SM-2 spaced repetition.',
    enableAiCopilot: true,
    enableSomaticBreathing: false,
    enableAntiGoals: false,
    enableRoadmap: true,
    enableFeynman: true,
    enableUrgeSurfing: false,
    enableSprint: true,
    enableAudioSoundscapes: false
  }
};

export function getActiveVariantId() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('selfcare_active_variant');
    if (saved && (saved in APP_VARIANTS)) {
      return saved;
    }
  }
  return 'core';
}

export function setActiveVariantId(variant) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('selfcare_active_variant', variant);
  }
}

