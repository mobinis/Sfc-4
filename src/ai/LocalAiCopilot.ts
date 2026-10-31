import { AppState, CopilotToolItem } from '../types';

export interface CognitiveDistortionMatch {
  name: string;
  description: string;
  matchedPhrases: string[];
  reframingAdvice: string;
}

export interface AiCopilotResponse {
  title: string;
  analysisText: string;
  suggestedAction?: string | null;
  suggestedActionPayload?: string | null;
  interactiveTools: CopilotToolItem[];
  confidence: number;
}

export const distortionRules: CognitiveDistortionMatch[] = [
  {
    name: 'All-or-Nothing Thinking',
    description: 'Seeing things in black-or-white categories without nuance.',
    matchedPhrases: ['always', 'never', 'ruined', 'completely failed', 'total waste', 'nothing works', 'impossible'],
    reframingAdvice: 'Look for the gray area. Partial progress (10% done) is exponentially better than 0%. Where was there a small win today?'
  },
  {
    name: 'Catastrophizing',
    description: 'Assuming the worst possible outcome will inevitably occur.',
    matchedPhrases: ['disaster', 'nightmare', 'terrible', "can't handle", 'falling apart', 'end of the world', 'panic'],
    reframingAdvice: 'Ask yourself: What is the most probable outcome, not just the worst? What is one actionable thing within your control right now?'
  },
  {
    name: 'Emotional Reasoning',
    description: 'Assuming that because you feel a certain way, it must be objective truth.',
    matchedPhrases: ['feel like a failure', 'feel worthless', 'feel stupid', 'feel overwhelmed', 'hopeless'],
    reframingAdvice: 'Feelings are real physiological signals, but they are not facts. Remind yourself: "I feel exhausted right now, but that does not mean I am failing."'
  },
  {
    name: "'Should' / Obligation Tyranny",
    description: 'Pressuring yourself with rigid expectations that produce guilt.',
    matchedPhrases: ['i should have', 'i must', 'i ought to', "why didn't i", 'i have to be perfect'],
    reframingAdvice: "Replace 'I should' with 'I prefer' or 'I choose'. Compassionate flexibility sustains long-term habits much better than guilt."
  },
  {
    name: 'Mental Filtering',
    description: 'Fixating exclusively on one perceived flaw while ignoring dozens of successes.',
    matchedPhrases: ['only thing that went wrong', 'ruined the whole day', 'screwed up', 'mess up'],
    reframingAdvice: 'Zoom out to the full picture. Count 3 neutral or positive actions that happened today alongside this friction.'
  },
  {
    name: 'Overgeneralization',
    description: 'Treating a single setback as a never-ending pattern of defeat.',
    matchedPhrases: ['everyone else', 'nobody cares', 'i always mess up', 'story of my life', 'typical of me'],
    reframingAdvice: 'One isolated incident does not define a lifetime. A slip is just data, not a permanent destiny.'
  },
  {
    name: 'Fortune Telling',
    description: 'Predicting negative future outcomes as established certainties without evidence.',
    matchedPhrases: ['going to fail', "won't work out", 'will be a disaster', 'predicting the worst', 'destined to fail', 'hopeless anyway', 'never gonna change'],
    reframingAdvice: 'Treat predictions as anxious hypotheses, not guaranteed future facts. What is the most probable balanced outcome? What is one realistic counter-example?'
  },
  {
    name: 'Personalization',
    description: 'Assuming total responsibility or blame for events outside your direct control.',
    matchedPhrases: ['my fault', 'blame myself', 'because of me', 'ruined it for them', 'let everyone down', "i'm the problem"],
    reframingAdvice: "Distinguish influence from control. You can influence circumstances, but you do not control all variables or other people's emotional reactions. Compassionately return responsibility to where it belongs."
  }
];

export const LocalAiCopilot = {
  getDistortionRules(): CognitiveDistortionMatch[] {
    return distortionRules;
  },

  detectDistortions(text: string): CognitiveDistortionMatch[] {
    const lower = text.toLowerCase();
    return distortionRules.filter(rule =>
      rule.matchedPhrases.some(phrase => lower.includes(phrase))
    );
  },

  async diagnosePatternsAndFriction(state: AppState): Promise<AiCopilotResponse> {
    const habits = state.nodes.filter(n => n.p !== '0');
    const recentEvents = state.ev.slice(-50);
    const completedIds = new Set(recentEvents.map(e => e.n));
    const unanchored = habits.filter(h => !h.ifThenAnchor);
    const lowMoodEntries = state.jr.filter(j => j.m <= 1);

    const lines: string[] = ['🔬 **Behavioral Friction Audit**:\n'];
    const actions: CopilotToolItem[] = [];

    if (habits.length > 8) {
      lines.push(`• **Cognitive Overload Risk**: You have **${habits.length} active habits**. When too many items compete for attention, executive fatigue sets in.`);
      lines.push('  *Recommendation*: Enable **Low-Energy Mode** to protect your 3 keystone essentials.\n');
      actions.push({ id: 'action_low_energy', type: 'ACTION', label: 'Toggle Low-Energy Essentials', payload: 'toggle_low_energy', emoji: '⚡' });
    }

    if (unanchored.length > 0) {
      const target = unanchored[0];
      lines.push(`• **Missing Implementation Intention**: **'${target.n}'** lacks a clear habit anchor.`);
      lines.push(`  *Fix*: Anchor it: *"After I finish my morning routine, I will ${target.n}."*\n`);
    }

    if (lowMoodEntries.length > 0) {
      lines.push('• **Somatic-Mood Connection**: On days with low energy ratings, micro-physical anchors (hydration, daylight, breath pacing) were delayed.\n');
      actions.push({ id: 'action_breath', type: 'MODAL', label: 'Open Breath Pacer (4-4-4-4)', payload: 'breath_modal', emoji: '🫁' });
    }

    lines.push('💡 **Compassionate Reframing**: Slips are never moral failures. They are simply feedback that the friction was too high. Scale the initial step down to 2 minutes.');

    return {
      title: 'Behavioral Pattern Diagnostics',
      analysisText: lines.join('\n'),
      interactiveTools: actions,
      confidence: 0.95
    };
  },

  async suggestWhatToDoNext(state: AppState): Promise<AiCopilotResponse> {
    const hour = new Date().getHours();
    const lines: string[] = ['🧭 **Optimal Next Action Recommendation**:\n'];
    const actions: CopilotToolItem[] = [];

    if (hour < 12) {
      lines.push('☀️ **Morning Alignment Window**:');
      lines.push('Cortisol and dopaminergic focus are rising. Prioritize hydration and your highest-value objective.');
      actions.push({ id: 'routine_morning', type: 'ROUTINE', label: 'Run Sunrise Kickstart Routine', payload: 'routine_morning', emoji: '🌅' });
    } else if (hour < 18) {
      lines.push('⚡ **Afternoon Focus Runway**:');
      lines.push('Combat the post-lunch dip with deliberate, single-task deep work or somatic grounding.');
      actions.push({ id: 'routine_focus', type: 'ROUTINE', label: 'Start 25m Deep Work Sprint', payload: 'routine_focus', emoji: '⏳' });
    } else {
      lines.push('🌙 **Evening Decompression Window**:');
      lines.push('Lower sensory arousal, dim blue light, and complete today\'s mindful reflection.');
      actions.push({ id: 'routine_evening', type: 'ROUTINE', label: 'Run Evening Decompression Routine', payload: 'routine_evening', emoji: '🌙' });
    }

    actions.push({ id: 'action_urge', type: 'MODAL', label: 'Urge Surfing Wave (10m)', payload: 'urge_modal', emoji: '🌊' });

    return {
      title: 'Next Action Compass',
      analysisText: lines.join('\n'),
      interactiveTools: actions,
      confidence: 0.92
    };
  },

  async startGuidedReflectionCoach(state: AppState): Promise<AiCopilotResponse> {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    const completedCount = state.ev.length;

    const text = `🌿 **Socratic Evening Reflection Coach** (${today})

Let us synthesize your day with compassionate, evidence-based self-inquiry:

1. **The Micro-Win (Dopamine Anchor)**:
   *What is 1 small action you took today that your future self will thank you for?* (Even drinking one glass of water counts).

2. **The Friction Point (Curiosity over Judgment)**:
   *Where did you feel internal friction, delay, or hesitation? What environment cue triggered it?*

3. **Tomorrow's Single Keystone**:
   *If you could only accomplish ONE single habit tomorrow before 11 AM to feel at peace, which one would it be?*

You have secured **${completedCount} habit repetitions** in this active cycle.`;

    const actions: CopilotToolItem[] = [
      { id: 'tool_save_ref', type: 'SAVE_REFLECTION', label: 'Deposit to Journal (+15 XP)', payload: 'prompt_journal', emoji: '✍️' },
      { id: 'tool_learn_card', type: 'MODAL', label: 'Review Learn Wisdom Cards', payload: 'learn_screen', emoji: '🧠' }
    ];

    return {
      title: 'Socratic Evening Reflection Coach',
      analysisText: text,
      interactiveTools: actions,
      confidence: 0.98
    };
  },

  async critiqueFeynmanExplanation(explanation: string, topicTitle: string): Promise<AiCopilotResponse> {
    const wordCount = explanation.trim().split(/\s+/).length;
    const lines: string[] = [`🧠 **Feynman Teach-Back Evaluation**: *${topicTitle}*\n`];
    const actions: CopilotToolItem[] = [];

    const hasAnalogy = /like|similar to|imagine|as if|think of/i.test(explanation);
    const hasAction = /when|do|action|step|instead|practice|will/i.test(explanation);

    if (wordCount < 15) {
      lines.push('⚠️ **Elaboration Too Brief**: The explanation is very concise. Try explaining *why* this principle functions the way it does using a simple metaphor.');
    } else {
      lines.push('✅ **Depth & Conceptual Flow**: Good depth of articulation.');
    }

    if (hasAnalogy) {
      lines.push('🌟 **Analogy Detected**: Excellent! Concrete metaphors anchor concepts into long-term semantic memory.');
    } else {
      lines.push('💡 **Analogy Suggestion**: Add a real-world metaphor: *"It is like..."* to make the concept vivid for an 11-year-old.');
    }

    if (hasAction) {
      lines.push('🎯 **Behavioral Cue Present**: You included an action trigger for when to apply this in real life.');
    } else {
      lines.push('⚓ **Action Anchor Needed**: Specify: *"When [X situation happens], I will [Y response]..."*');
    }

    lines.push('\n**Rubric Score**: Solid grasp of core behavioral science.');
    actions.push({ id: 'tool_mark_mastered', type: 'ACTION', label: 'Mark Mastered (+20 XP, +3 🪙)', payload: 'mastered', emoji: '🟢' });

    return {
      title: 'Feynman Critique & Active Recall',
      analysisText: lines.join('\n'),
      interactiveTools: actions,
      confidence: 0.94
    };
  }
};
