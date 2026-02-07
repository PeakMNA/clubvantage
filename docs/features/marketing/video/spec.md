# Marketing / Video / Marketing Video Production

## Overview

Marketing Video Production uses Remotion (React-based video framework) to create programmatic marketing videos for ClubVantage. The primary deliverable is "The Club That Runs Itself," a 90-second aspirational marketing video composed of 6 scenes with 5 reusable infographic components, video B-roll integration, screenshot overlays, and an animated logo reveal. The video system lives in a standalone `video/` directory at the repository root and produces compositions that can be rendered to MP4 via Remotion CLI or previewed in the Remotion Studio.

## Status

**Substantially Implemented.** The Remotion project is set up and operational with:

- 5 infographic components built: AnimatedLogoReveal, StatsCounter, FeatureIcon, BeforeAfterSplit, TimelineRoadmap (all in `video/src/Infographics/`)
- Pre-existing infographic: AnimatedClock
- 2 prior video compositions: ClubOperators and ClubVantageVideo (120-second product video)
- TheClubThatRunsItself composition registered in Root.tsx at 90 seconds (2700 frames at 30fps)
- Scene structure defined with 6 scenes (Vision, Member Experience, Staff Experience, Executive View, Intelligent Club, CTA)
- Root.tsx updated with all compositions including TheClubThatRunsItself

**Not yet completed:** Scene implementation (Scene1-Scene6 components), voiceover data and subtitle sync, voiceover audio recording, final asset integration (some screenshots may need updating), and render/export testing.

## Capabilities

- Programmatic video creation using React components rendered frame-by-frame at 30fps
- 5 reusable infographic components for data visualization and animation
- AnimatedLogoReveal: SVG path animation with stroke draw-on, text fade-in, and glow pulse (5 seconds)
- StatsCounter: Spring-animated number counter with count, multiplier, and progress variants (4 seconds each)
- FeatureIcon: 6 animated module icons (golf, members, billing, facilities, POS, AI) with unique animations (3 seconds each)
- BeforeAfterSplit: Curtain-wipe before/after comparison with configurable images (6 seconds)
- TimelineRoadmap: Horizontal timeline with 5 sequential node activations and screenshot thumbnails (8 seconds)
- Video B-roll integration using Remotion's Video component for MP4 overlays
- Screenshot overlay support for product UI demonstrations
- Subtitle rendering synchronized to voiceover timestamps
- Multiple composition support in a single Remotion project (HelloWorld, ClubOperators, ClubVantage, AnimatedClock, TheClubThatRunsItself)

## Dependencies

### Interface Dependencies

| Component | Path | Purpose |
|-----------|------|---------|
| AnimatedLogoReveal | `video/src/Infographics/AnimatedLogoReveal.tsx` | Logo animation with SVG draw-on |
| StatsCounter | `video/src/Infographics/StatsCounter.tsx` | Animated number counters |
| FeatureIcon | `video/src/Infographics/FeatureIcon.tsx` | 6 animated module icons |
| BeforeAfterSplit | `video/src/Infographics/BeforeAfterSplit.tsx` | Before/after comparison |
| TimelineRoadmap | `video/src/Infographics/TimelineRoadmap.tsx` | Horizontal animated timeline |
| AnimatedClock | `video/src/Infographics/AnimatedClock.tsx` | Pre-existing clock animation |
| Root | `video/src/Root.tsx` | Remotion composition registry |
| TheClubThatRunsItselfVideo | `video/src/TheClubThatRunsItself/` | Main 90-second video composition |
| ClubVantageVideo | `video/src/ClubVantage/ClubVantageVideo.tsx` | Prior 120-second product video |
| ClubOperators | `video/src/ClubOperators/ClubOperators.tsx` | Prior club operators video |

### Settings Dependencies

| Setting | Source | Purpose |
|---------|--------|---------|
| FPS | Constants files | Frames per second (30) |
| TOTAL_FRAMES | Constants files | Total frames per composition |
| SCENE_TIMINGS | TheClubThatRunsItself/constants.ts | Start/end seconds per scene |
| COLORS | TheClubThatRunsItself/constants.ts | Video color palette |

### Data Dependencies

| Asset Type | Location | Notes |
|------------|----------|-------|
| Logo SVGs | `video/public/logo/clubvantage-*.svg` | Logo assets for AnimatedLogoReveal |
| Screenshots | `video/public/screenshots/clubvantage-*.png` | Product UI screenshots for overlays |
| Images | `video/public/image/*.png`, `*.jpeg` | B-roll images and backgrounds |
| Video clips | `video/public/video/section-*.mp4` | B-roll video footage |
| Background music | `video/public/audio/background-music.mp3` | Audio track |
| Voiceover | `video/public/audio/voiceover.mp3` | To be recorded |

## Settings Requirements

| Setting | Type | Default | Configured By | Description |
|---------|------|---------|---------------|-------------|
| FPS | number | `30` | Developer | Frames per second for all compositions |
| DURATION_SECONDS | number | `90` | Developer | Total video duration in seconds |
| TOTAL_FRAMES | number | `2700` | Derived | FPS * DURATION_SECONDS |
| SCENE_TIMINGS.scene1 | object | `{ start: 0, end: 15 }` | Developer | Vision Opening timing (seconds) |
| SCENE_TIMINGS.scene2 | object | `{ start: 15, end: 30 }` | Developer | Member Experience timing |
| SCENE_TIMINGS.scene3 | object | `{ start: 30, end: 45 }` | Developer | Staff Experience timing |
| SCENE_TIMINGS.scene4 | object | `{ start: 45, end: 60 }` | Developer | Executive View timing |
| SCENE_TIMINGS.scene5 | object | `{ start: 60, end: 75 }` | Developer | Intelligent Club timing |
| SCENE_TIMINGS.scene6 | object | `{ start: 75, end: 90 }` | Developer | CTA + Logo timing |
| COLORS.background | string | `#1C1917` | Developer | Stone-900 background |
| COLORS.surface | string | `#292524` | Developer | Stone-800 surface |
| COLORS.text | string | `#FAFAF9` | Developer | Stone-50 text |
| COLORS.textMuted | string | `#A8A29E` | Developer | Stone-400 muted text |
| COLORS.primary | string | `#22C55E` | Developer | Green-500 primary accent |
| COLORS.primaryMuted | string | `#166534` | Developer | Green-800 muted primary |
| COLORS.accent | string | `#F59E0B` | Developer | Amber-500 accent |
| resolution.width | number | `1920` | Developer | Output video width |
| resolution.height | number | `1080` | Developer | Output video height |

## Data Model

### Infographic Component Props

```typescript
// AnimatedLogoReveal
interface AnimatedLogoRevealProps {
  scale?: number;           // default 1
  showTagline?: boolean;    // "Club Management, Elevated"
}

// StatsCounter
interface StatsCounterProps {
  value: number;
  suffix?: string;          // "%", "x", etc.
  label: string;
  variant: 'count' | 'multiplier' | 'progress';
  accentColor?: string;     // default green
}

// FeatureIcon
interface FeatureIconProps {
  icon: 'golf' | 'members' | 'billing' | 'facilities' | 'pos' | 'ai';
  label?: string;
  size?: number;            // default 120
}

// BeforeAfterSplit
interface BeforeAfterSplitProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;     // default "Before"
  afterLabel?: string;      // default "After"
}

// TimelineRoadmap
interface TimelineNode {
  label: string;
  screenshot: string;
}
interface TimelineRoadmapProps {
  nodes: TimelineNode[];
}
```

### Scene Structure

```typescript
// TheClubThatRunsItself/constants.ts
export const SCENE_TIMINGS = {
  scene1: { start: 0, end: 15 },    // Vision Opening
  scene2: { start: 15, end: 30 },   // Member Experience
  scene3: { start: 30, end: 45 },   // Staff Experience
  scene4: { start: 45, end: 60 },   // Executive View
  scene5: { start: 60, end: 75 },   // Intelligent Club
  scene6: { start: 75, end: 90 },   // CTA + Logo
};
```

### Voiceover Data Structure

```typescript
interface VoiceoverSegment {
  startTime: number;        // seconds
  endTime: number;
  text: string;
  scene: number;
}
```

## Business Rules

1. All compositions must be registered in `video/src/Root.tsx` to appear in Remotion Studio and be renderable.
2. Infographic components are designed to be standalone and reusable across multiple video compositions.
3. Each scene component receives the scene's start frame and duration as props, calculated from SCENE_TIMINGS and FPS.
4. Animations use Remotion's `interpolate()` and `spring()` functions for frame-accurate timing.
5. The color palette for TheClubThatRunsItself uses a dark theme (stone-900 background) distinct from the ClubVantage product UI palette.
6. Logo colors follow brand guidelines: "Club" in gray (#6B7280), checkmark and "antage" in green (#22C55E).
7. StatsCounter uses monospace font (`font-variant-numeric: tabular-nums`) to prevent layout shift during number animation.
8. TimelineRoadmap nodes activate sequentially with a 1.2-second duration per node.
9. Video B-roll clips must be placed in `video/public/video/` and referenced by relative path from the public directory.
10. The project uses TypeScript strict mode; all props interfaces must be explicitly typed.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Screenshot image missing from public directory | Remotion renders a broken image placeholder; build-time validation should check asset existence |
| Video clip format not supported by browser | Use MP4 with H.264 codec; Remotion's bundler handles format compatibility |
| Voiceover audio shorter/longer than 90 seconds | Audio is truncated at 90 seconds or padded with silence; timing mismatches flagged in preview |
| Infographic props missing required fields | TypeScript compilation error; defaults provided where sensible |
| Remotion Studio fails to load compositions | Check Root.tsx for import errors; ensure all imported constants are defined |
| Render output exceeds expected file size | Adjust CRF (constant rate factor) in render command; target ~50MB for 90-second 1080p |
| Multiple compositions share same FPS constant name | Each video folder exports its own FPS/TOTAL_FRAMES; Root.tsx uses aliased imports (e.g., `FPS as MARKETING_FPS`) |
| Browser memory issues during preview of long compositions | Use Remotion's composition selector to preview individual scenes rather than full 90-second composition |
| Asset hot-reload not working in Remotion Studio | Static assets in public/ require Studio restart; code changes hot-reload normally |
| Subtitle text overflows on screen | Use `line-clamp` or dynamic font sizing based on text length; test with longest voiceover segment |
