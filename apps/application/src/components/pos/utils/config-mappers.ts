/**
 * POS Config Mappers
 *
 * Transforms user-friendly template configurations into the format
 * expected by POSToolbar and POSActionBar components.
 */

import { type POSActionType, POS_ACTION_TYPES, getActionTypeIcon } from './action-types'

// ============================================================================
// TYPES - Template Format (what users configure)
// ============================================================================

export interface TemplateToolbarConfig {
  groups: TemplateToolbarGroup[]
}

export interface TemplateToolbarGroup {
  id: string
  label: string
  zone: 'left' | 'center' | 'right'
  items: string[] // e.g., ['search', 'categoryTabs', 'memberLookup']
}

export interface TemplateActionBarConfig {
  buttons: TemplateActionButton[]
}

export interface TemplateActionButton {
  id: string
  label: string
  actionType: POSActionType
  variant: 'primary' | 'secondary' | 'danger' | 'ghost'
  position: 'left' | 'center' | 'right'
}

// ============================================================================
// TYPES - Component Format (what components expect)
// ============================================================================

export interface ComponentToolbarConfig {
  zones: {
    left: string[]
    center: string[]
    right: string[]
  }
}

export interface ComponentActionBarConfig {
  rows: number
  columns: number
  buttons: ComponentActionButton[]
}

export interface ComponentActionButton {
  position: [number, number] // [row, col]
  buttonId: string
  span: number
  actionType?: POSActionType
}

export interface ButtonDefinition {
  id: string
  label: string
  icon: string // lucide icon name
  color: 'primary' | 'success' | 'warning' | 'danger' | 'neutral'
  shortcut?: string
}

export interface ButtonState {
  visible: boolean
  enabled: boolean
  requiresApproval: boolean
}

// ============================================================================
// DEFAULT BUTTON REGISTRY
// ============================================================================

export const DEFAULT_BUTTON_REGISTRY: Record<string, ButtonDefinition> = {
  // Payment buttons
  'pay': {
    id: 'pay',
    label: 'Pay',
    icon: 'CheckCircle',
    color: 'success',
    shortcut: 'F12',
  },
  'cash': {
    id: 'cash',
    label: 'Cash',
    icon: 'Banknote',
    color: 'success',
  },
  'card': {
    id: 'card',
    label: 'Card',
    icon: 'CreditCard',
    color: 'success',
  },
  'charge-member': {
    id: 'charge-member',
    label: 'Charge to Member',
    icon: 'UserCheck',
    color: 'primary',
  },

  // Transaction actions
  'cancel': {
    id: 'cancel',
    label: 'Cancel',
    icon: 'X',
    color: 'danger',
    shortcut: 'Esc',
  },
  'void': {
    id: 'void',
    label: 'Void Item',
    icon: 'Trash2',
    color: 'danger',
  },
  'void-item': {
    id: 'void-item',
    label: 'Void Item',
    icon: 'Trash2',
    color: 'danger',
  },
  'hold': {
    id: 'hold',
    label: 'Hold',
    icon: 'Pause',
    color: 'warning',
  },

  // Utilities
  'discount': {
    id: 'discount',
    label: 'Discount',
    icon: 'Percent',
    color: 'neutral',
  },
  'print': {
    id: 'print',
    label: 'Print',
    icon: 'Printer',
    color: 'neutral',
  },
  'price-check': {
    id: 'price-check',
    label: 'Price Check',
    icon: 'Search',
    color: 'neutral',
  },
  'split': {
    id: 'split',
    label: 'Split Check',
    icon: 'Split',
    color: 'neutral',
  },
  'refund': {
    id: 'refund',
    label: 'Refund',
    icon: 'RotateCcw',
    color: 'warning',
  },
  'open-drawer': {
    id: 'open-drawer',
    label: 'Open Drawer',
    icon: 'Archive',
    color: 'neutral',
  },
}

// Map variant names to color names
const VARIANT_TO_COLOR: Record<string, ButtonDefinition['color']> = {
  'primary': 'primary',
  'secondary': 'neutral',
  'danger': 'danger',
  'ghost': 'neutral',
  'success': 'success',
  'warning': 'warning',
}

// ============================================================================
// TOOLBAR MAPPER
// ============================================================================

/**
 * Maps template toolbar config to component toolbar config
 *
 * Template format:
 *   { groups: [{ zone: 'left', items: ['search'] }, ...] }
 *
 * Component format:
 *   { zones: { left: ['search'], center: [], right: [] } }
 */
export function mapToolbarConfig(
  templateConfig: TemplateToolbarConfig | null | undefined
): ComponentToolbarConfig {
  const defaultConfig: ComponentToolbarConfig = {
    zones: {
      left: ['search', 'memberLookup'],
      center: ['categoryTabs'],
      right: ['holdTicket', 'newTicket'],
    },
  }

  if (!templateConfig?.groups?.length) {
    return defaultConfig
  }

  const zones: ComponentToolbarConfig['zones'] = {
    left: [],
    center: [],
    right: [],
  }

  // Assign items from each group to their designated zone
  for (const group of templateConfig.groups) {
    const zone = group.zone || 'center'
    if (zone in zones) {
      zones[zone].push(...(group.items || []))
    }
  }

  // If all zones are empty, return defaults
  if (!zones.left.length && !zones.center.length && !zones.right.length) {
    return defaultConfig
  }

  return { zones }
}

// ============================================================================
// ACTION BAR MAPPER
// ============================================================================

/**
 * Maps template action bar config to component action bar config
 *
 * Template format:
 *   { buttons: [{ id, label, variant, position: 'left' }] }
 *
 * Component format:
 *   { rows: 2, columns: 6, buttons: [{ position: [0, 0], buttonId, span: 1 }] }
 *
 * Layout algorithm:
 *   - Buttons are placed in their designated zone (left, center, right)
 *   - Each zone gets 2 columns in a 6-column grid
 *   - Left: cols 0-1, Center: cols 2-3, Right: cols 4-5
 *   - Buttons wrap to additional rows if needed
 */
export function mapActionBarConfig(
  templateConfig: TemplateActionBarConfig | null | undefined,
  options: { columns?: number; maxButtonsPerZone?: number } = {}
): ComponentActionBarConfig {
  const { columns = 6, maxButtonsPerZone = 4 } = options

  if (!templateConfig?.buttons?.length) {
    // Return a sensible default
    return {
      rows: 2,
      columns,
      buttons: [
        { position: [0, 0], buttonId: 'cancel', span: 1 },
        { position: [0, 1], buttonId: 'void', span: 1 },
        { position: [0, 2], buttonId: 'discount', span: 1 },
        { position: [0, 3], buttonId: 'hold', span: 1 },
        { position: [1, 0], buttonId: 'charge-member', span: 2 },
        { position: [1, 2], buttonId: 'cash', span: 1 },
        { position: [1, 3], buttonId: 'card', span: 1 },
        { position: [1, 4], buttonId: 'pay', span: 2 },
      ],
    }
  }

  // Group buttons by position
  const leftButtons = templateConfig.buttons.filter(b => b.position === 'left')
  const centerButtons = templateConfig.buttons.filter(b => b.position === 'center')
  const rightButtons = templateConfig.buttons.filter(b => b.position === 'right')

  // Calculate layout
  const zoneWidth = Math.floor(columns / 3) // 2 columns per zone in a 6-col grid
  const maxRows = Math.max(
    Math.ceil(leftButtons.length / zoneWidth),
    Math.ceil(centerButtons.length / zoneWidth),
    Math.ceil(rightButtons.length / zoneWidth),
    1
  )

  const mappedButtons: ComponentActionButton[] = []

  // Place left buttons (columns 0-1)
  leftButtons.forEach((btn, idx) => {
    const row = Math.floor(idx / zoneWidth)
    const col = idx % zoneWidth
    mappedButtons.push({
      position: [row, col],
      buttonId: btn.id,
      span: 1,
      actionType: btn.actionType,
    })
  })

  // Place center buttons (columns 2-3)
  centerButtons.forEach((btn, idx) => {
    const row = Math.floor(idx / zoneWidth)
    const col = zoneWidth + (idx % zoneWidth)
    mappedButtons.push({
      position: [row, col],
      buttonId: btn.id,
      span: 1,
      actionType: btn.actionType,
    })
  })

  // Place right buttons (columns 4-5)
  rightButtons.forEach((btn, idx) => {
    const row = Math.floor(idx / zoneWidth)
    const col = (zoneWidth * 2) + (idx % zoneWidth)
    mappedButtons.push({
      position: [row, col],
      buttonId: btn.id,
      span: 1,
      actionType: btn.actionType,
    })
  })

  return {
    rows: maxRows,
    columns,
    buttons: mappedButtons,
  }
}

// ============================================================================
// BUTTON REGISTRY HELPERS
// ============================================================================

/**
 * Creates a button registry from template buttons, enriched with defaults
 */
export function createButtonRegistry(
  templateButtons: TemplateActionButton[],
  baseRegistry: Record<string, ButtonDefinition> = DEFAULT_BUTTON_REGISTRY
): Record<string, ButtonDefinition> {
  const registry = { ...baseRegistry }

  for (const btn of templateButtons) {
    // Get icon from action type, fall back to default icon logic
    const icon = btn.actionType
      ? getActionTypeIcon(btn.actionType)
      : getDefaultIcon(btn.id, btn.variant)

    // If button exists in base registry, merge with template overrides
    const existing = registry[btn.id]
    if (existing) {
      registry[btn.id] = {
        ...existing,
        label: btn.label || existing.label,
        icon: icon || existing.icon,
        color: VARIANT_TO_COLOR[btn.variant] || existing.color,
      }
    } else {
      // Create new button definition from template
      registry[btn.id] = {
        id: btn.id,
        label: btn.label,
        icon,
        color: VARIANT_TO_COLOR[btn.variant] || 'neutral',
      }
    }
  }

  return registry
}

/**
 * Creates button states map from template buttons
 */
export function createButtonStates(
  templateButtons: TemplateActionButton[],
  overrides?: Record<string, Partial<ButtonState>>
): Map<string, ButtonState> {
  const states = new Map<string, ButtonState>()

  for (const btn of templateButtons) {
    const override = overrides?.[btn.id]
    states.set(btn.id, {
      visible: override?.visible ?? true,
      enabled: override?.enabled ?? true,
      requiresApproval: override?.requiresApproval ?? (btn.variant === 'danger'),
    })
  }

  return states
}

function getDefaultIcon(buttonId: string, variant: string): string {
  // Try to infer icon from button ID
  const iconMap: Record<string, string> = {
    'pay': 'CheckCircle',
    'cash': 'Banknote',
    'card': 'CreditCard',
    'cancel': 'X',
    'void': 'Trash2',
    'hold': 'Pause',
    'discount': 'Percent',
    'print': 'Printer',
    'refund': 'RotateCcw',
    'split': 'Split',
    'member': 'User',
    'charge': 'UserCheck',
  }

  // Check if any key is contained in buttonId
  for (const [key, icon] of Object.entries(iconMap)) {
    if (buttonId.toLowerCase().includes(key)) {
      return icon
    }
  }

  // Default based on variant
  switch (variant) {
    case 'primary': return 'Star'
    case 'danger': return 'AlertTriangle'
    case 'success': return 'Check'
    default: return 'Circle'
  }
}

// ============================================================================
// COMBINED MAPPER
// ============================================================================

export interface MappedPOSConfig {
  toolbarConfig: ComponentToolbarConfig
  actionBarConfig: ComponentActionBarConfig
  buttonRegistry: Record<string, ButtonDefinition>
  buttonStates: Map<string, ButtonState>
  /** Maps button ID to action type for executing handlers */
  buttonActionMap: Map<string, POSActionType>
}

/**
 * Maps a complete template config to component-ready format
 */
export function mapTemplateToComponentConfig(
  template: {
    toolbarConfig?: TemplateToolbarConfig | null
    actionBarConfig?: TemplateActionBarConfig | null
  } | null | undefined,
  options?: {
    baseRegistry?: Record<string, ButtonDefinition>
    buttonStateOverrides?: Record<string, Partial<ButtonState>>
  }
): MappedPOSConfig {
  const toolbarConfig = mapToolbarConfig(template?.toolbarConfig)
  const actionBarConfig = mapActionBarConfig(template?.actionBarConfig)

  const templateButtons = template?.actionBarConfig?.buttons || []
  const buttonRegistry = createButtonRegistry(
    templateButtons,
    options?.baseRegistry || DEFAULT_BUTTON_REGISTRY
  )
  const buttonStates = createButtonStates(
    templateButtons,
    options?.buttonStateOverrides
  )

  // Create button ID to action type mapping
  const buttonActionMap = new Map<string, POSActionType>()
  for (const btn of templateButtons) {
    if (btn.actionType) {
      buttonActionMap.set(btn.id, btn.actionType)
    }
  }

  return {
    toolbarConfig,
    actionBarConfig,
    buttonRegistry,
    buttonStates,
    buttonActionMap,
  }
}
