# Member Portal — Theme Configuration Reference

**Audience**: Technical reference for developers
**Purpose**: How tenant theme configuration maps to CSS custom properties and Tailwind tokens

---

## Theme Injection Flow

```
1. Browser request hits Next.js middleware
2. Middleware resolves tenant from hostname
3. Redis returns cached TenantConfig (or fetches from Control Plane)
4. Middleware computes HSL color scales from hex primary/secondary colors
5. Root layout applies CSS custom properties to <html> element
6. Tailwind utilities reference CSS variables for all color/spacing tokens
```

---

## Color System

### Input: Tenant Config

Tenant provides 1-3 hex colors. The system generates full HSL scales automatically.

```typescript
interface TenantTheme {
  primaryColor: string    // "#f59e0b" — main brand color
  secondaryColor: string  // "#10b981" — accent color
  neutralColor?: string   // "#78716c" — defaults to stone if omitted
  fontFamily?: string     // "DM Sans" — default
  borderRadius?: string   // "0.75rem" — default
}
```

### Output: CSS Custom Properties

Each hex color is converted to an HSL scale (50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950):

```css
:root {
  /* Primary scale (auto-generated from primaryColor) */
  --color-primary-50: 48 96% 95%;
  --color-primary-100: 48 96% 89%;
  --color-primary-200: 48 97% 77%;
  --color-primary-300: 46 97% 65%;
  --color-primary-400: 43 96% 56%;
  --color-primary-500: 38 92% 50%;    /* ← source color */
  --color-primary-600: 32 95% 44%;
  --color-primary-700: 26 90% 37%;
  --color-primary-800: 23 83% 31%;
  --color-primary-900: 22 78% 26%;
  --color-primary-950: 21 92% 14%;

  /* Secondary scale */
  --color-secondary-50: 152 81% 96%;
  --color-secondary-100: 149 80% 90%;
  --color-secondary-200: 152 76% 80%;
  --color-secondary-300: 156 72% 67%;
  --color-secondary-400: 158 64% 52%;
  --color-secondary-500: 160 84% 39%;   /* ← source color */
  --color-secondary-600: 161 94% 30%;
  --color-secondary-700: 163 94% 24%;
  --color-secondary-800: 163 88% 20%;
  --color-secondary-900: 164 86% 16%;
  --color-secondary-950: 166 91% 9%;

  /* Neutral scale (stone default) */
  --color-neutral-50: 60 9% 98%;
  --color-neutral-100: 60 5% 96%;
  --color-neutral-200: 20 6% 90%;
  --color-neutral-300: 24 6% 83%;
  --color-neutral-400: 24 5% 64%;
  --color-neutral-500: 25 5% 45%;
  --color-neutral-600: 33 5% 32%;
  --color-neutral-700: 30 6% 25%;
  --color-neutral-800: 12 6% 15%;
  --color-neutral-900: 24 10% 10%;
  --color-neutral-950: 20 14% 4%;

  /* Typography */
  --font-sans: "DM Sans", system-ui, -apple-system, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, monospace;

  /* Spacing / Radius */
  --radius: 0.75rem;
  --radius-sm: 0.5rem;
  --radius-lg: 1rem;
  --radius-xl: 1.25rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;
}
```

### Tailwind Configuration

```typescript
// tailwind.config.ts (member-portal)
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50:  'hsl(var(--color-primary-50) / <alpha-value>)',
          100: 'hsl(var(--color-primary-100) / <alpha-value>)',
          200: 'hsl(var(--color-primary-200) / <alpha-value>)',
          300: 'hsl(var(--color-primary-300) / <alpha-value>)',
          400: 'hsl(var(--color-primary-400) / <alpha-value>)',
          500: 'hsl(var(--color-primary-500) / <alpha-value>)',
          600: 'hsl(var(--color-primary-600) / <alpha-value>)',
          700: 'hsl(var(--color-primary-700) / <alpha-value>)',
          800: 'hsl(var(--color-primary-800) / <alpha-value>)',
          900: 'hsl(var(--color-primary-900) / <alpha-value>)',
          950: 'hsl(var(--color-primary-950) / <alpha-value>)',
        },
        secondary: {
          // Same pattern for secondary
        },
        neutral: {
          // Same pattern for neutral
        },
      },
      fontFamily: {
        sans: 'var(--font-sans)',
        mono: 'var(--font-mono)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        full: 'var(--radius-full)',
      },
    },
  },
}
```

### Usage in Components

```tsx
// Components use semantic tokens — never hardcoded colors
<button className="bg-primary-500 text-white rounded-xl">
  Book Now
</button>

<span className="text-secondary-500">Active</span>

<div className="bg-neutral-50 border border-neutral-200 rounded-lg">
  Card content
</div>
```

---

## HSL Scale Generation

### Algorithm

Given a hex source color for the 500 shade, generate the full 50–950 scale:

```typescript
function generateScale(hexColor: string): Record<string, string> {
  const hsl = hexToHSL(hexColor) // { h, s, l }

  return {
    50:  `${hsl.h} ${Math.min(hsl.s + 4, 100)}% 95%`,
    100: `${hsl.h} ${Math.min(hsl.s + 4, 100)}% 89%`,
    200: `${hsl.h} ${Math.min(hsl.s + 5, 100)}% 77%`,
    300: `${adjustHue(hsl.h, -2)} ${Math.min(hsl.s + 5, 100)}% 65%`,
    400: `${adjustHue(hsl.h, -5)} ${Math.min(hsl.s + 4, 100)}% 56%`,
    500: `${hsl.h} ${hsl.s}% ${hsl.l}%`,  // Source
    600: `${adjustHue(hsl.h, -6)} ${Math.min(hsl.s + 3, 100)}% 44%`,
    700: `${adjustHue(hsl.h, -12)} ${Math.min(hsl.s - 2, 100)}% 37%`,
    800: `${adjustHue(hsl.h, -15)} ${Math.min(hsl.s - 9, 100)}% 31%`,
    900: `${adjustHue(hsl.h, -16)} ${Math.min(hsl.s - 14, 100)}% 26%`,
    950: `${adjustHue(hsl.h, -17)} ${hsl.s}% 14%`,
  }
}
```

This matches Tailwind's native color scale distribution for consistent contrast ratios.

---

## Dark Mode (Optional)

When `portal.darkMode` feature flag is enabled, members can toggle dark mode in profile.

### Dark Mode Variables

```css
[data-theme="dark"] {
  --color-neutral-50: 20 14% 4%;
  --color-neutral-100: 24 10% 10%;
  --color-neutral-200: 12 6% 15%;
  /* ... reversed neutral scale */
  --color-neutral-900: 60 5% 96%;
  --color-neutral-950: 60 9% 98%;

  /* Primary/secondary stay the same — they're accent colors */
}
```

### Implementation

```typescript
// Profile preferences
const toggleDarkMode = () => {
  const current = document.documentElement.getAttribute('data-theme')
  const next = current === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', next)
  localStorage.setItem('theme', next)
}
```

---

## Mapping Reference

| Tenant Setting | CSS Variable | Tailwind Class | Component Usage |
|---------------|-------------|----------------|-----------------|
| `primaryColor` | `--color-primary-500` | `bg-primary-500` | CTA buttons, active nav |
| `primaryColor` (light) | `--color-primary-50` | `bg-primary-50` | Card backgrounds, highlights |
| `primaryColor` (dark) | `--color-primary-900` | `text-primary-900` | Headings on light bg |
| `secondaryColor` | `--color-secondary-500` | `bg-secondary-500` | Success badges, secondary actions |
| `neutralColor` | `--color-neutral-500` | `text-neutral-500` | Body text, borders |
| `neutralColor` (bg) | `--color-neutral-50` | `bg-neutral-50` | Page backgrounds |
| `fontFamily` | `--font-sans` | `font-sans` | All text |
| `borderRadius` | `--radius` | `rounded` | Default border radius |

---

## Contrast Guidelines

Follow WCAG AA contrast requirements (4.5:1 for text, 3:1 for large text):

| Background | Text Color | Min Contrast |
|-----------|-----------|-------------|
| `primary-500` | `text-white` | ✅ Always use white on primary |
| `primary-50` | `text-primary-900` | ✅ Dark text on light primary |
| `secondary-500` | `text-white` | ✅ Always use white on secondary |
| `neutral-50` | `text-neutral-900` | ✅ Dark text on light bg |
| `neutral-900` | `text-neutral-50` | ✅ Light text on dark bg (dark mode) |
| `primary-500` | `text-primary-950` | ❌ Avoid — poor contrast on some colors |

**Rule**: When the tenant's primary color is light (e.g., yellow, light blue), the system should auto-detect and use dark text on primary backgrounds. This is handled by checking luminance:

```typescript
function textColorForBackground(bgHex: string): 'white' | 'black' {
  const luminance = getLuminance(bgHex)
  return luminance > 0.5 ? 'black' : 'white'
}
```
