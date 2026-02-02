'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { cn } from '@clubvantage/ui'
import { Plus, X, ChevronDown, Clock, Calendar, Users, UserCog, Check } from 'lucide-react'

// ============================================================================
// Types
// ============================================================================

export type VisibilityRuleType = 'DAY_OF_WEEK' | 'TIME_OF_DAY' | 'MEMBER_TYPE' | 'OUTLET_ROLE'
export type VisibilityRuleOperator = 'IS' | 'IS_NOT' | 'BETWEEN' | 'INCLUDES' | 'EXCLUDES'

export interface VisibilityRule {
  id: string
  type: VisibilityRuleType
  operator: VisibilityRuleOperator
  value: string | string[] | { start: string; end: string }
}

export interface VisibilityRulesBuilderProps {
  rules: VisibilityRule[]
  onChange: (rules: VisibilityRule[]) => void
  className?: string
}

// ============================================================================
// Constants
// ============================================================================

const DAYS_OF_WEEK = [
  { value: 'MONDAY', label: 'Monday' },
  { value: 'TUESDAY', label: 'Tuesday' },
  { value: 'WEDNESDAY', label: 'Wednesday' },
  { value: 'THURSDAY', label: 'Thursday' },
  { value: 'FRIDAY', label: 'Friday' },
  { value: 'SATURDAY', label: 'Saturday' },
  { value: 'SUNDAY', label: 'Sunday' },
]

const MEMBER_TYPES = [
  { value: 'FULL_MEMBER', label: 'Full Member' },
  { value: 'ASSOCIATE', label: 'Associate' },
  { value: 'DEPENDENT', label: 'Dependent' },
  { value: 'GUEST', label: 'Guest' },
  { value: 'CORPORATE', label: 'Corporate' },
]

const OUTLET_ROLES = [
  { value: 'SERVER', label: 'Server' },
  { value: 'BARTENDER', label: 'Bartender' },
  { value: 'CASHIER', label: 'Cashier' },
  { value: 'MANAGER', label: 'Manager' },
]

const RULE_TYPE_CONFIG: Record<VisibilityRuleType, {
  label: string
  icon: typeof Calendar
  operators: { value: VisibilityRuleOperator; label: string }[]
  options: { value: string; label: string }[]
}> = {
  DAY_OF_WEEK: {
    label: 'Day of Week',
    icon: Calendar,
    operators: [
      { value: 'IS', label: 'is' },
      { value: 'IS_NOT', label: 'is not' },
      { value: 'INCLUDES', label: 'includes' },
    ],
    options: DAYS_OF_WEEK,
  },
  TIME_OF_DAY: {
    label: 'Time of Day',
    icon: Clock,
    operators: [
      { value: 'BETWEEN', label: 'between' },
    ],
    options: [],
  },
  MEMBER_TYPE: {
    label: 'Member Type',
    icon: Users,
    operators: [
      { value: 'IS', label: 'is' },
      { value: 'IS_NOT', label: 'is not' },
      { value: 'INCLUDES', label: 'includes' },
      { value: 'EXCLUDES', label: 'excludes' },
    ],
    options: MEMBER_TYPES,
  },
  OUTLET_ROLE: {
    label: 'Outlet Role',
    icon: UserCog,
    operators: [
      { value: 'IS', label: 'is' },
      { value: 'IS_NOT', label: 'is not' },
      { value: 'INCLUDES', label: 'includes' },
    ],
    options: OUTLET_ROLES,
  },
}

const RULE_TYPES: { value: VisibilityRuleType; label: string }[] = [
  { value: 'DAY_OF_WEEK', label: 'Day of Week' },
  { value: 'TIME_OF_DAY', label: 'Time of Day' },
  { value: 'MEMBER_TYPE', label: 'Member Type' },
  { value: 'OUTLET_ROLE', label: 'Outlet Role' },
]

// ============================================================================
// Helper Functions
// ============================================================================

function generateRuleId(): string {
  return `rule-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

function getDefaultValueForType(type: VisibilityRuleType, operator: VisibilityRuleOperator): VisibilityRule['value'] {
  if (type === 'TIME_OF_DAY') {
    return { start: '09:00', end: '17:00' }
  }
  if (operator === 'IS' || operator === 'IS_NOT') {
    return ''
  }
  return []
}

function formatTimeValue(value: VisibilityRule['value']): string {
  if (typeof value === 'object' && 'start' in value) {
    return `${value.start} - ${value.end}`
  }
  return ''
}

function formatMultiSelectValue(
  value: VisibilityRule['value'],
  options: { value: string; label: string }[]
): string {
  if (Array.isArray(value)) {
    if (value.length === 0) return 'None selected'
    const labels = value.map(v => options.find(opt => opt.value === v)?.label || v)
    if (labels.length <= 2) return labels.join(', ')
    return `${labels.slice(0, 2).join(', ')} +${labels.length - 2} more`
  }
  if (typeof value === 'string' && value) {
    return options.find(opt => opt.value === value)?.label || value
  }
  return 'None selected'
}

// ============================================================================
// Sub-Components
// ============================================================================

interface MultiSelectDropdownProps {
  options: { value: string; label: string }[]
  selected: string[]
  onChange: (values: string[]) => void
  placeholder?: string
}

function MultiSelectDropdown({
  options,
  selected,
  onChange,
  placeholder = 'Select options...',
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleToggle = useCallback((value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter(v => v !== value)
      : [...selected, value]
    onChange(newSelected)
  }, [selected, onChange])

  const displayValue = formatMultiSelectValue(selected, options)

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border bg-white',
          'text-sm text-stone-900 dark:text-stone-100',
          'border-stone-300 dark:border-stone-600 dark:bg-stone-800',
          'hover:border-stone-400 dark:hover:border-stone-500',
          'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500',
          'transition-colors'
        )}
      >
        <span className={cn(
          'truncate text-left flex-1',
          selected.length === 0 && 'text-stone-400'
        )}>
          {selected.length === 0 ? placeholder : displayValue}
        </span>
        <ChevronDown className={cn(
          'h-4 w-4 text-stone-400 transition-transform flex-shrink-0',
          isOpen && 'rotate-180'
        )} />
      </button>

      {isOpen && (
        <div className={cn(
          'absolute z-50 w-full mt-1 bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700',
          'shadow-lg shadow-stone-200/50 dark:shadow-black/20',
          'max-h-60 overflow-y-auto'
        )}>
          <div className="p-1">
            {options.map((option) => {
              const isSelected = selected.includes(option.value)
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleToggle(option.value)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left',
                    'transition-colors',
                    isSelected
                      ? 'bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-100'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
                  )}
                >
                  <div className={cn(
                    'flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center',
                    isSelected
                      ? 'bg-amber-500 border-amber-500'
                      : 'border-stone-300 dark:border-stone-600'
                  )}>
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span>{option.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

interface SingleSelectDropdownProps {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

function SingleSelectDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select...',
}: SingleSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = useCallback((val: string) => {
    onChange(val)
    setIsOpen(false)
  }, [onChange])

  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border bg-white',
          'text-sm text-stone-900 dark:text-stone-100',
          'border-stone-300 dark:border-stone-600 dark:bg-stone-800',
          'hover:border-stone-400 dark:hover:border-stone-500',
          'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500',
          'transition-colors'
        )}
      >
        <span className={cn(
          'truncate text-left flex-1',
          !selectedOption && 'text-stone-400'
        )}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown className={cn(
          'h-4 w-4 text-stone-400 transition-transform flex-shrink-0',
          isOpen && 'rotate-180'
        )} />
      </button>

      {isOpen && (
        <div className={cn(
          'absolute z-50 w-full mt-1 bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700',
          'shadow-lg shadow-stone-200/50 dark:shadow-black/20',
          'max-h-60 overflow-y-auto'
        )}>
          <div className="p-1">
            {options.map((option) => {
              const isSelected = option.value === value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left',
                    'transition-colors',
                    isSelected
                      ? 'bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-100'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
                  )}
                >
                  <span>{option.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

interface TimeRangePickerProps {
  start: string
  end: string
  onChange: (start: string, end: string) => void
}

function TimeRangePicker({ start, end, onChange }: TimeRangePickerProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="time"
        value={start}
        onChange={(e) => onChange(e.target.value, end)}
        className={cn(
          'flex-1 px-3 py-2 rounded-lg border bg-white',
          'text-sm text-stone-900 dark:text-stone-100',
          'border-stone-300 dark:border-stone-600 dark:bg-stone-800',
          'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500',
          'transition-colors'
        )}
      />
      <span className="text-stone-500 text-sm">to</span>
      <input
        type="time"
        value={end}
        onChange={(e) => onChange(start, e.target.value)}
        className={cn(
          'flex-1 px-3 py-2 rounded-lg border bg-white',
          'text-sm text-stone-900 dark:text-stone-100',
          'border-stone-300 dark:border-stone-600 dark:bg-stone-800',
          'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500',
          'transition-colors'
        )}
      />
    </div>
  )
}

// ============================================================================
// Rule Row Component
// ============================================================================

interface RuleRowProps {
  rule: VisibilityRule
  index: number
  onUpdate: (rule: VisibilityRule) => void
  onDelete: () => void
}

function RuleRow({ rule, index, onUpdate, onDelete }: RuleRowProps) {
  const config = RULE_TYPE_CONFIG[rule.type]
  const Icon = config.icon

  const handleTypeChange = useCallback((newType: VisibilityRuleType) => {
    const newConfig = RULE_TYPE_CONFIG[newType]
    const defaultOperator = newConfig.operators[0].value
    onUpdate({
      ...rule,
      type: newType,
      operator: defaultOperator,
      value: getDefaultValueForType(newType, defaultOperator),
    })
  }, [rule, onUpdate])

  const handleOperatorChange = useCallback((newOperator: VisibilityRuleOperator) => {
    // Adjust value based on operator change
    let newValue = rule.value
    if (newOperator === 'IS' || newOperator === 'IS_NOT') {
      // Single value
      if (Array.isArray(rule.value)) {
        newValue = rule.value[0] || ''
      } else if (typeof rule.value === 'object' && 'start' in rule.value) {
        newValue = ''
      }
    } else if (newOperator === 'INCLUDES' || newOperator === 'EXCLUDES') {
      // Multi value
      if (typeof rule.value === 'string') {
        newValue = rule.value ? [rule.value] : []
      } else if (typeof rule.value === 'object' && 'start' in rule.value) {
        newValue = []
      }
    } else if (newOperator === 'BETWEEN') {
      newValue = { start: '09:00', end: '17:00' }
    }

    onUpdate({
      ...rule,
      operator: newOperator,
      value: newValue,
    })
  }, [rule, onUpdate])

  const handleValueChange = useCallback((newValue: VisibilityRule['value']) => {
    onUpdate({
      ...rule,
      value: newValue,
    })
  }, [rule, onUpdate])

  const isMultiSelect = rule.operator === 'INCLUDES' || rule.operator === 'EXCLUDES'
  const isTimeRange = rule.type === 'TIME_OF_DAY'

  return (
    <div className={cn(
      'p-4 rounded-xl border border-stone-200 dark:border-stone-700',
      'bg-white dark:bg-stone-800/50',
      'shadow-sm'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            'flex items-center justify-center w-6 h-6 rounded-full',
            'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
          )}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
            Rule {index + 1}
          </span>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className={cn(
            'p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50',
            'dark:hover:bg-red-900/20 transition-colors'
          )}
          aria-label="Delete rule"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Rule Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Type Selector */}
        <SingleSelectDropdown
          options={RULE_TYPES}
          value={rule.type}
          onChange={(val) => handleTypeChange(val as VisibilityRuleType)}
          placeholder="Select type..."
        />

        {/* Operator Selector */}
        <SingleSelectDropdown
          options={config.operators}
          value={rule.operator}
          onChange={(val) => handleOperatorChange(val as VisibilityRuleOperator)}
          placeholder="Select operator..."
        />

        {/* Value Selector */}
        <div className="sm:col-span-1">
          {isTimeRange ? (
            <TimeRangePicker
              start={typeof rule.value === 'object' && 'start' in rule.value ? rule.value.start : '09:00'}
              end={typeof rule.value === 'object' && 'start' in rule.value ? rule.value.end : '17:00'}
              onChange={(start, end) => handleValueChange({ start, end })}
            />
          ) : isMultiSelect ? (
            <MultiSelectDropdown
              options={config.options}
              selected={Array.isArray(rule.value) ? rule.value : []}
              onChange={handleValueChange}
              placeholder="Select values..."
            />
          ) : (
            <SingleSelectDropdown
              options={config.options}
              value={typeof rule.value === 'string' ? rule.value : ''}
              onChange={handleValueChange}
              placeholder="Select value..."
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function VisibilityRulesBuilder({
  rules,
  onChange,
  className,
}: VisibilityRulesBuilderProps) {
  const handleAddRule = useCallback(() => {
    const newRule: VisibilityRule = {
      id: generateRuleId(),
      type: 'DAY_OF_WEEK',
      operator: 'INCLUDES',
      value: [],
    }
    onChange([...rules, newRule])
  }, [rules, onChange])

  const handleUpdateRule = useCallback((index: number, updatedRule: VisibilityRule) => {
    const newRules = [...rules]
    newRules[index] = updatedRule
    onChange(newRules)
  }, [rules, onChange])

  const handleDeleteRule = useCallback((index: number) => {
    const newRules = rules.filter((_, i) => i !== index)
    onChange(newRules)
  }, [rules, onChange])

  return (
    <div className={cn('space-y-4', className)}>
      {/* Add Rule Button */}
      <button
        type="button"
        onClick={handleAddRule}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg',
          'bg-gradient-to-br from-amber-500 to-amber-600 text-white',
          'hover:from-amber-600 hover:to-amber-700',
          'font-medium text-sm',
          'transition-all shadow-sm hover:shadow-md',
          'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2'
        )}
      >
        <Plus className="h-4 w-4" />
        Add Rule
      </button>

      {/* Rules List */}
      {rules.length === 0 ? (
        <div className={cn(
          'p-6 rounded-xl border-2 border-dashed border-stone-200 dark:border-stone-700',
          'bg-stone-50/50 dark:bg-stone-800/30',
          'text-center'
        )}>
          <div className="flex justify-center mb-3">
            <div className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center',
              'bg-stone-100 dark:bg-stone-700'
            )}>
              <Calendar className="h-6 w-6 text-stone-400 dark:text-stone-500" />
            </div>
          </div>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            No visibility rules configured.
          </p>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
            Product will always be visible on the POS panel.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule, index) => (
            <RuleRow
              key={rule.id}
              rule={rule}
              index={index}
              onUpdate={(updatedRule) => handleUpdateRule(index, updatedRule)}
              onDelete={() => handleDeleteRule(index)}
            />
          ))}
        </div>
      )}

      {/* Summary Info */}
      {rules.length > 0 && (
        <div className={cn(
          'p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30'
        )}>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <span className="font-medium">Note:</span> All rules must be satisfied for the product to be visible.
            Rules are combined with AND logic.
          </p>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Export Types
// ============================================================================

export type {
  VisibilityRule,
  VisibilityRulesBuilderProps,
}
