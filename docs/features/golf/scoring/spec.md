# Golf / Scoring / Digital Scorecard

## Overview
Digital scorecard tracking for golf rounds with hole-by-hole scoring, statistics, and trend analysis. Accessible via the member portal at `/portal/golf/scorecard`.

## Status
- Backend: Implemented (Prisma models, data layer, seed data)
- Frontend: Implemented (list view, detail view, stats cards, trend chart)
- Phase: 5 (Premium Features)

## Capabilities
- View list of past rounds with course name, date, and total score
- View detailed hole-by-hole scorecard with par comparison
- Color-coded score display (eagle=purple, birdie=blue, par=green, bogey=amber, double+=red)
- Statistics dashboard: rounds played, best score, average score, average putts
- Score trend visualization (last 5 rounds, bar chart)
- Front nine / back nine split totals
- FIR% and GIR% statistics per round

## Dependencies
### Interface Dependencies
- Member Portal bottom navigation (Golf tab)
- Golf hub page links to scorecard

### Settings Dependencies
- `features.golf.enabled` must be true

### Data Dependencies
- Member must have Scorecard records
- GolfCourse must exist for course name display
- ScoreHole records for hole-by-hole detail

## Settings Requirements
| Setting | Type | Default | Configured By | Description |
|---------|------|---------|---------------|-------------|
| features.golf.enabled | boolean | true | Club Admin | Enables golf features including scorecard |

## Data Model
```typescript
interface Scorecard {
  id: string
  memberId: string       // UUID FK to Member
  courseId: string        // UUID FK to GolfCourse
  playedAt: Date         // Date of round
  totalScore: number
  totalPutts?: number
  fairwaysHit?: number
  greensInReg?: number
  notes?: string
  weather?: string
  holes: ScoreHole[]
}

interface ScoreHole {
  id: string
  scorecardId: string    // UUID FK to Scorecard
  holeNumber: number     // 1-18
  par: number
  strokes: number
  putts?: number
  fairwayHit?: boolean
  greenInReg?: boolean
}

interface ScorecardStats {
  roundsPlayed: number
  bestScore: number | null
  averageScore: number | null
  averagePutts: number | null
  trend: { score: number; coursePar: number; date: string }[]
}
```

## Business Rules
- Scorecards are read-only in current implementation (no score entry UI yet)
- Stats computed from all member scorecards (no date filtering)
- Trend shows last 5 rounds ordered by playedAt descending
- Score color coding: eagle (-2) = purple, birdie (-1) = blue, par (0) = green, bogey (+1) = amber, double bogey+ (+2 or more) = red

## Edge Cases
| Scenario | Handling |
|----------|----------|
| No scorecards exist | Empty state with flag icon and "No rounds recorded" message |
| Missing hole data | Scorecard detail still renders; holes with null strokes show dash |
| Course deleted | Scorecard shows "Unknown Course" fallback |
