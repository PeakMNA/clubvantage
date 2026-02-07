# ClubVantage Marketing Video Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a 90-second aspirational marketing video with 5 infographic components and animated logo

**Architecture:** Remotion-based video with reusable infographic components, video B-roll integration, and modular scene structure

**Tech Stack:** Remotion, React, TypeScript

---

## Infographics (5 Components)

### 1. AnimatedLogoReveal (5 seconds)

**File:** `src/Infographics/AnimatedLogoReveal.tsx`

**Animation sequence:**
- 0-2s: Green checkmark draws on stroke-by-stroke (SVG path animation using `strokeDasharray` and `strokeDashoffset`)
- 2-3s: "Club" fades in from left, "antage" fades in from right
- 3-4s: Subtle glow pulse on the checkmark
- 4-5s: Hold complete logo

**Colors:**
- "Club": Gray (#6B7280)
- Checkmark + "antage": Green (#22C55E)

**Props:**
```typescript
interface AnimatedLogoRevealProps {
  scale?: number; // default 1
  showTagline?: boolean; // "Club Management, Elevated"
}
```

---

### 2. StatsCounter (4 seconds each)

**File:** `src/Infographics/StatsCounter.tsx`

**Three variants:**
- **Percentage**: Number counts 0 → target (e.g., 60%)
- **Multiplier**: Number counts 1 → 2 → 3 with "x" suffix
- **Progress**: Bar fills to 100%

**Animation:**
- Spring-based easing for natural feel
- Number uses monospace font to prevent layout shift
- Accent color pulses on completion

**Props:**
```typescript
interface StatsCounterProps {
  value: number;
  suffix?: string; // "%", "x", etc.
  label: string;
  variant: 'count' | 'multiplier' | 'progress';
  accentColor?: string; // default green
}
```

**Instances for video:**
- "60% less admin time"
- "3x faster billing"
- "100% booking visibility"

---

### 3. FeatureIcon (3 seconds each)

**File:** `src/Infographics/FeatureIcon.tsx`

**Six animated icons:**
| Module | Animation |
|--------|-----------|
| Golf | Flag plants into ground, waves gently |
| Members | User silhouettes gather/merge together |
| Billing | Invoice with checkmark stamps on |
| Facilities | Calendar grid slots fill in sequentially |
| POS | Receipt paper prints/scrolls out |
| AI | Brain outline with pulsing neural connections |

**Props:**
```typescript
interface FeatureIconProps {
  icon: 'golf' | 'members' | 'billing' | 'facilities' | 'pos' | 'ai';
  label?: string;
  size?: number; // default 120
}
```

---

### 4. BeforeAfterSplit (6 seconds)

**File:** `src/Infographics/BeforeAfterSplit.tsx`

**Animation:**
- 0-2s: Full "Before" state (left image fills screen)
- 2-4s: Curtain wipe reveals "After" from center
- 4-6s: Side-by-side comparison with labels

**Assets:**
- Before: `image/clutter-desk.png` or `image/legacy-system-ui.png` with red/orange tint
- After: `screenshots/clubvantage-dashboard.png` with green accent border

**Props:**
```typescript
interface BeforeAfterSplitProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string; // default "Before"
  afterLabel?: string; // default "After"
}
```

---

### 5. TimelineRoadmap (8 seconds)

**File:** `src/Infographics/TimelineRoadmap.tsx`

**Layout:** Horizontal timeline with 5 nodes

**Nodes:**
1. Members → `screenshots/clubvantage-members.png`
2. Billing → `screenshots/clubvantage-billing.png`
3. Golf/Facilities → `screenshots/clubvantage-golf.png`
4. POS → `screenshots/clubvantage-pos-sales.png`
5. AI/Insights → `screenshots/clubvantage-dashboard.png`

**Animation:**
- Connector line draws between nodes (0.5s each)
- Each node lights up sequentially (1.2s per node)
- Screenshot thumbnail scales up slightly on activation
- Label fades in below active node

**Props:**
```typescript
interface TimelineNode {
  label: string;
  screenshot: string;
}

interface TimelineRoadmapProps {
  nodes: TimelineNode[];
}
```

---

## Video Composition: "TheClubThatRunsItself" (90 seconds)

**File:** `src/TheClubThatRunsItself/TheClubThatRunsItselfVideo.tsx`

### Scene Structure

| Scene | Time | Visual | Voiceover | Infographic |
|-------|------|--------|-----------|-------------|
| 1. Vision Opening | 0-15s | `section-1-shot-1.mp4`, `section-1-shot-2.mp4`, `club-exterior.png` | "Imagine a club where everything just works. Members book in seconds. Staff greet by name, not buried in paperwork. And you—you finally have time to lead." | None (cinematic) |
| 2. Member Experience | 15-30s | `section-1-shot-3.mp4`, `section-2-shot-1.mp4`, portal screenshots | "Tee times, spa appointments, court bookings—members handle it themselves, anytime. No calls. No waiting. Just seamless self-service they'll actually love." | FeatureIcon (Golf, Facilities) |
| 3. Staff Experience | 30-45s | `section-2-shot-2.mp4`, `clean-desk-transformation.jpeg`, dashboard screenshots | "Your team focuses on hospitality, not data entry. Billing runs automatically. Errors disappear. Sixty percent less admin time—back where it belongs." | StatsCounter (60%) |
| 4. Executive View | 45-60s | Dashboard screenshots, AR profiles, billing screens | "Real-time visibility across every department. Revenue, retention, utilization—no more month-end surprises. Collections on autopilot. Clean books, every day." | BeforeAfterSplit |
| 5. Intelligent Club | 60-75s | AI module hints, member profiles | "AI that spots members at risk before they leave. Campaigns that trigger automatically. Your club doesn't just run—it learns." | StatsCounter (3x), FeatureIcon (AI) |
| 6. CTA + Logo | 75-90s | Timeline, logo reveal | "Golf. Members. Billing. Facilities. POS. All connected. All intelligent. This is ClubVantage. Join our founding members. Shape the future of club management." | TimelineRoadmap, AnimatedLogoReveal |

### Constants

**File:** `src/TheClubThatRunsItself/constants.ts`

```typescript
export const FPS = 30;
export const DURATION_SECONDS = 90;
export const TOTAL_FRAMES = FPS * DURATION_SECONDS; // 2700

export const SCENE_TIMINGS = {
  scene1: { start: 0, end: 15 },
  scene2: { start: 15, end: 30 },
  scene3: { start: 30, end: 45 },
  scene4: { start: 45, end: 60 },
  scene5: { start: 60, end: 75 },
  scene6: { start: 75, end: 90 },
};

export const COLORS = {
  background: '#1C1917', // stone-900
  surface: '#292524', // stone-800
  text: '#FAFAF9', // stone-50
  textMuted: '#A8A29E', // stone-400
  primary: '#22C55E', // green-500
  primaryMuted: '#166534', // green-800
  accent: '#F59E0B', // amber-500
};
```

### Voiceover Data

**File:** `src/TheClubThatRunsItself/voiceover/voiceoverData.ts`

Full script with timestamps for subtitle sync (same structure as existing ClubVantage video).

---

## File Structure

```
video/src/
├── Infographics/
│   ├── index.ts
│   ├── constants.ts
│   ├── AnimatedClock.tsx (existing)
│   ├── AnimatedLogoReveal.tsx (new)
│   ├── StatsCounter.tsx (new)
│   ├── FeatureIcon.tsx (new)
│   ├── BeforeAfterSplit.tsx (new)
│   └── TimelineRoadmap.tsx (new)
├── TheClubThatRunsItself/
│   ├── TheClubThatRunsItselfVideo.tsx
│   ├── constants.ts
│   ├── scenes/
│   │   ├── Scene1Vision.tsx
│   │   ├── Scene2MemberExperience.tsx
│   │   ├── Scene3StaffExperience.tsx
│   │   ├── Scene4ExecutiveView.tsx
│   │   ├── Scene5IntelligentClub.tsx
│   │   └── Scene6CTA.tsx
│   └── voiceover/
│       ├── voiceoverData.ts
│       └── Subtitles.tsx
└── Root.tsx (updated with new compositions)
```

---

## Implementation Tasks

### Phase 1: Infographics (5 tasks)
1. Create AnimatedLogoReveal component
2. Create StatsCounter component
3. Create FeatureIcon component (6 icons)
4. Create BeforeAfterSplit component
5. Create TimelineRoadmap component

### Phase 2: Video Composition (7 tasks)
6. Set up TheClubThatRunsItself folder structure and constants
7. Create Scene1Vision with video B-roll
8. Create Scene2MemberExperience
9. Create Scene3StaffExperience
10. Create Scene4ExecutiveView
11. Create Scene5IntelligentClub
12. Create Scene6CTA with logo reveal

### Phase 3: Integration (2 tasks)
13. Add voiceover data and subtitles
14. Register composition in Root.tsx and test

---

## Assets Required

**Already available:**
- Logo SVGs: `public/logo/clubvantage-*.svg`
- Screenshots: `public/screenshots/clubvantage-*.png`
- Images: `public/image/*.png`, `*.jpeg`
- Video clips: `public/video/section-*.mp4`
- Background music: `public/audio/background-music.mp3`

**To be recorded:**
- Voiceover audio (90 seconds, following script timestamps)
