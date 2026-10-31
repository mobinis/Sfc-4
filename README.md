# BloomQuest 🛡️

A mindful self-care, habit progression, deep work, and high-EQ interpersonal wellness companion rewritten as a modern **React + TypeScript + Vite** web application with Tailwind CSS and Web Audio synthesis.

## Features & Core Architecture

### 1. Today Dashboard & Daily Three Pillars
- **Daily Three System**: Learn (🧠), Build (🛠️), and Body (💪). Completing at least one activity under each pillar secures the Daily Three and advances daily streak count with bonus XP.
- **Weekly Quests Engine**: Triad of rotating weekly quests (Vitality Reps, Wisdom & Teach-Back, Keystone Consistency) with progress bars, claims, and automatic countdown resets.
- **90-Day Life Sprint & Identity Compass**: Quarterly identity commitments, milestone roadmaps, and progress tracking.
- **Anti-Goals Dopamine Shield**: Behavioral avoid list with clean streak counters and cognitive reframing replacement actions.
- **Habit Modes & Anchoring**: Checkmark (`check`), Numerical Counter (`count`), and Step Progressions (`step`) with implementation intention anchors (`⚓ [Anchor Cue]`).
- **Low-Energy Mode**: 1-tap toggle that filters the dashboard down to vital essentials.

### 2. Clinical Urge Surfing Protocol
- **10-Minute Wave Timer**: Urges crest like ocean waves and dissolve within 10 minutes when observed without judgment.
- **Harmonic Sine Wave Visualizer**: Interactive dynamic HTML5 Canvas rendering amplitude shifts.
- **Interoceptive Somatic Sensation Tagging**: Facial Heat / Flush, Restless Limbs, Clenched Jaw, Chest Tightness, Shallow Breath, Stomach Knot.
- **DBT Context Tags & Dual Intensity Sliders**: Pre and post 1–10 craving ratings measuring intensity drop.

### 3. Somatic Breath Pacer & Ambient Soundscapes
- **Somatic Breath Pacer**: Box Breathing (4-4-4-4), Relaxing Breath (4-7-8), and Coherent Resonance (5-5) with animated expanding/contracting breath ring.
- **Web Audio Soundscape Synthesizer**: Offline procedural Brown Noise generator and warm singing-bowl completion chimes via the Web Audio API.

### 4. Interactive Book Guides & Video Library
- **Mastery Ebooks & Field Guides**: Dale Carnegie (*How to Win Friends*), Nedra Glover Tawwab (*Set Boundaries, Find Peace*), Kerry Patterson (*Crucial Conversations*), Dr. Marc Brackett (*Permission to Feel*), Kate Murphy (*You're Not Listening*), Carmine Gallo (*Talk Like TED*), and Marshall Rosenberg (*Nonviolent Communication*).
- **Interactive Checklists & Practical Exercises**: Chapter progress tracking, core framework notes, and personal study reflections.
- **Guided Video Masterclasses**: Video streaming player with lecture notes.

### 5. Local AI Reflection Coach (CBT Distortion Engine)
- **100% Client-Side Privacy**: Runs completely in the browser with zero cloud telemetry.
- **8-Pattern CBT Distortion Engine**: Detects All-or-Nothing Thinking, Catastrophizing, Emotional Reasoning, 'Should' Tyranny, Mental Filtering, Overgeneralization, Fortune Telling, and Personalization with stoic reframing.
- **Behavioral Friction Audit & Next Action Compass**: Analyzes habits and schedules to pinpoint friction.
- **Socratic Evening Reflection Coach**: Prompts for The Micro-Win, The Friction Point, and Tomorrow's Keystone.
- **Feynman Teach-Back Evaluation**: Analyzes active recall explanations for ELI10 simplicity, metaphors, and behavioral action triggers.
- **1-Tap Action Tools**: "Deposit to Journal (+15 XP)", "Toggle Low-Energy", and "Run Guided Routine".

### 6. Journal, Gratitude & Kindness
- **5-Point Emotional Scale**: Heavy (😢), Low (😔), Neutral (😐), Good (🙂), Radiant (😄).
- **Kindness & Gratitude Logger**: Records acts of kindness towards others and self-compassion.
- **Salted SHA-256 PIN Lock**: 4-digit keypad protecting private reflections and logs.

### 7. Analytics, Insights & 10-Slot Snapshots
- **Habit-Mood Correlation Engine**: Measures statistical mood uplift when completing vs skipping habits.
- **Pillar Balance Gauge**: Visualizes Learn / Build / Body equilibrium.
- **10-Slot Local Backup System**: Instant snapshots with strict 'CONFIRM' restore guard and full JSON export/import.

## Tech Stack
- **Framework**: React 19, TypeScript 5, Vite 6
- **Styling**: Tailwind CSS v4 (Sage Sanctuary theme: Forest Sage, Warm Amber, Charcoal Velvet, Soft Cream)
- **Sound**: Web Audio API (`AudioContext`, procedural brown noise filter, harmonic chimes)
- **Icons**: Lucide React
- **Celebration**: Canvas-Confetti
