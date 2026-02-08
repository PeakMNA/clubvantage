# Facility & Golf Course Marketing Images

**Date**: 2026-02-07
**Status**: Ready to implement
**Scope**: Add marketing hero images to facility and golf course cards in the member portal

---

## Overview

Wire up the existing `imageUrl` fields on Facility and GolfCourse models to display hero images in the member portal browse pages. Populate seed data with curated Unsplash URLs.

## Changes

### 1. Seed Data (`database/prisma/seed.ts`)

Add `imageUrl` to existing facility and golf course upserts:

| Entity | Image Subject |
|--------|--------------|
| Tennis Courts | Outdoor tennis court |
| Fitness Center | Modern gym interior |
| Swimming Pool | Resort-style pool |
| Championship Course | Golf course landscape |

Use Unsplash optimized URLs with `?w=800&q=80` sizing.

### 2. Data Layer Pass-through

**`apps/member-portal/src/app/portal/book/page.tsx`**
- Add `imageUrl` to the facility object mapped to `BrowseContent` props

**`apps/member-portal/src/app/portal/golf/browse/page.tsx`**
- Golf courses already pass full objects — verify `imageUrl` is included

### 3. Component Updates

**`apps/member-portal/src/app/portal/book/browse-content.tsx`**
- Replace text placeholder with `<img>` tag inside the 4:3 aspect ratio container
- Add bottom gradient overlay for category badge
- Fall back to current placeholder when no imageUrl

**`apps/member-portal/src/app/portal/golf/browse/browse-content.tsx`**
- Replace empty stone-200 hero with course imageUrl
- Keep existing gradient-to-white fade
- Fall back to stone-200 when no imageUrl

### 4. Verification

- Run `npx prisma db seed` to update demo data
- Run `pnpm next build` to verify clean build
- Visual check in browser

## Non-goals

- No schema changes (imageUrl fields already exist)
- No image upload UI (future work)
- No multiple images / carousel (future work)
- No Supabase storage bucket (using Unsplash URLs for demo)
