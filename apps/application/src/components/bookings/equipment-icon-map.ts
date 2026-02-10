import type { LucideIcon } from 'lucide-react'
import {
  Car,
  Bike,
  Flag,
  Circle,
  CircleDot,
  ShoppingCart,
  Dumbbell,
  Waves,
  Sparkles,
  UtensilsCrossed,
  Users,
  Baby,
  Projector,
  Speaker,
  Table2,
  Armchair,
  Package,
  Box,
  Wrench,
  Settings,
  Trophy,
} from 'lucide-react'

/**
 * Static map of icon names to components used by equipment categories.
 * This avoids `import * as LucideIcons` which pulls the entire 400+ icon library (~1.6MB).
 * Only the icons available in the category icon picker are included.
 */
export const EQUIPMENT_ICON_MAP: Record<string, LucideIcon> = {
  Car,
  Bike,
  Flag,
  Circle,
  CircleDot,
  ShoppingCart,
  Dumbbell,
  Waves,
  Sparkles,
  UtensilsCrossed,
  Users,
  Baby,
  Projector,
  Speaker,
  Table2,
  Armchair,
  Package,
  Box,
  Wrench,
  Settings,
  Trophy,
}

/** Resolve an icon name to a component, falling back to Package */
export function getEquipmentIcon(iconName: string): LucideIcon {
  return EQUIPMENT_ICON_MAP[iconName] || Package
}
