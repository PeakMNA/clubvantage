'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export interface FocusedCell {
  resourceIndex: number;
  slotIndex: number;
}

export interface UseCalendarKeyboardNavOptions {
  /** Total number of resources (columns) */
  resourceCount: number;
  /** Total number of time slots (rows) */
  slotCount: number;
  /** Callback when a cell is activated (Enter or Space) */
  onCellActivate?: (resourceIndex: number, slotIndex: number) => void;
  /** Callback when focus changes */
  onFocusChange?: (cell: FocusedCell | null) => void;
  /** Whether keyboard navigation is enabled */
  enabled?: boolean;
}

export interface UseCalendarKeyboardNavReturn {
  /** Currently focused cell, or null if none */
  focusedCell: FocusedCell | null;
  /** Set the focused cell programmatically */
  setFocusedCell: (cell: FocusedCell | null) => void;
  /** Handler for keydown events on the grid container */
  handleKeyDown: (e: React.KeyboardEvent) => void;
  /** Handler for focus event on the grid container */
  handleFocus: () => void;
  /** Handler for blur event on the grid container */
  handleBlur: () => void;
  /** Whether the grid currently has focus */
  hasFocus: boolean;
  /** Check if a specific cell is focused */
  isCellFocused: (resourceIndex: number, slotIndex: number) => boolean;
  /** Get tabIndex for a cell */
  getCellTabIndex: (resourceIndex: number, slotIndex: number) => number;
  /** Focus a specific cell */
  focusCell: (resourceIndex: number, slotIndex: number) => void;
}

/**
 * useCalendarKeyboardNav
 *
 * A hook that provides keyboard navigation for a calendar grid.
 * Supports arrow key navigation, Enter/Space to activate, and Tab to exit.
 *
 * @example
 * ```tsx
 * const { focusedCell, handleKeyDown, isCellFocused } = useCalendarKeyboardNav({
 *   resourceCount: resources.length,
 *   slotCount: totalSlots,
 *   onCellActivate: (resIdx, slotIdx) => {
 *     const resourceId = resources[resIdx].id;
 *     const time = minutesToTime(startHour * 60 + slotIdx * 15);
 *     onSlotClick?.(resourceId, time);
 *   },
 * });
 * ```
 */
export function useCalendarKeyboardNav({
  resourceCount,
  slotCount,
  onCellActivate,
  onFocusChange,
  enabled = true,
}: UseCalendarKeyboardNavOptions): UseCalendarKeyboardNavReturn {
  const [focusedCell, setFocusedCellInternal] = useState<FocusedCell | null>(null);
  const [hasFocus, setHasFocus] = useState(false);

  // Wrapped setter that also calls onFocusChange
  const setFocusedCell = useCallback(
    (cell: FocusedCell | null) => {
      setFocusedCellInternal(cell);
      onFocusChange?.(cell);
    },
    [onFocusChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!enabled || !hasFocus) return;

      // Initialize focus if not already set
      if (!focusedCell) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          e.preventDefault();
          setFocusedCell({ resourceIndex: 0, slotIndex: 0 });
          return;
        }
      }

      if (!focusedCell) return;

      const { resourceIndex, slotIndex } = focusedCell;

      switch (e.key) {
        case 'ArrowUp': {
          e.preventDefault();
          const newSlotIndex = Math.max(0, slotIndex - 1);
          setFocusedCell({ resourceIndex, slotIndex: newSlotIndex });
          break;
        }
        case 'ArrowDown': {
          e.preventDefault();
          const newSlotIndex = Math.min(slotCount - 1, slotIndex + 1);
          setFocusedCell({ resourceIndex, slotIndex: newSlotIndex });
          break;
        }
        case 'ArrowLeft': {
          e.preventDefault();
          const newResourceIndex = Math.max(0, resourceIndex - 1);
          setFocusedCell({ resourceIndex: newResourceIndex, slotIndex });
          break;
        }
        case 'ArrowRight': {
          e.preventDefault();
          const newResourceIndex = Math.min(resourceCount - 1, resourceIndex + 1);
          setFocusedCell({ resourceIndex: newResourceIndex, slotIndex });
          break;
        }
        case 'Enter':
        case ' ': {
          e.preventDefault();
          onCellActivate?.(resourceIndex, slotIndex);
          break;
        }
        case 'Home': {
          e.preventDefault();
          if (e.ctrlKey) {
            // Ctrl+Home: Go to first cell
            setFocusedCell({ resourceIndex: 0, slotIndex: 0 });
          } else {
            // Home: Go to first resource in current row
            setFocusedCell({ resourceIndex: 0, slotIndex });
          }
          break;
        }
        case 'End': {
          e.preventDefault();
          if (e.ctrlKey) {
            // Ctrl+End: Go to last cell
            setFocusedCell({
              resourceIndex: resourceCount - 1,
              slotIndex: slotCount - 1,
            });
          } else {
            // End: Go to last resource in current row
            setFocusedCell({ resourceIndex: resourceCount - 1, slotIndex });
          }
          break;
        }
        case 'PageUp': {
          e.preventDefault();
          // Jump up by 4 slots (1 hour)
          const newSlotIndex = Math.max(0, slotIndex - 4);
          setFocusedCell({ resourceIndex, slotIndex: newSlotIndex });
          break;
        }
        case 'PageDown': {
          e.preventDefault();
          // Jump down by 4 slots (1 hour)
          const newSlotIndex = Math.min(slotCount - 1, slotIndex + 4);
          setFocusedCell({ resourceIndex, slotIndex: newSlotIndex });
          break;
        }
        case 'Escape': {
          e.preventDefault();
          setFocusedCell(null);
          break;
        }
      }
    },
    [enabled, hasFocus, focusedCell, resourceCount, slotCount, onCellActivate, setFocusedCell]
  );

  const handleFocus = useCallback(() => {
    setHasFocus(true);
    // Set initial focus if not already set
    if (!focusedCell && enabled) {
      setFocusedCell({ resourceIndex: 0, slotIndex: 0 });
    }
  }, [focusedCell, enabled, setFocusedCell]);

  const handleBlur = useCallback(() => {
    setHasFocus(false);
  }, []);

  const isCellFocused = useCallback(
    (resourceIndex: number, slotIndex: number): boolean => {
      return (
        hasFocus &&
        focusedCell?.resourceIndex === resourceIndex &&
        focusedCell?.slotIndex === slotIndex
      );
    },
    [hasFocus, focusedCell]
  );

  const getCellTabIndex = useCallback(
    (resourceIndex: number, slotIndex: number): number => {
      // Only the focused cell (or first cell if none focused) should be tabbable
      if (focusedCell) {
        return focusedCell.resourceIndex === resourceIndex &&
          focusedCell.slotIndex === slotIndex
          ? 0
          : -1;
      }
      // If no cell is focused, make the first cell tabbable
      return resourceIndex === 0 && slotIndex === 0 ? 0 : -1;
    },
    [focusedCell]
  );

  const focusCell = useCallback(
    (resourceIndex: number, slotIndex: number) => {
      setFocusedCell({
        resourceIndex: Math.max(0, Math.min(resourceCount - 1, resourceIndex)),
        slotIndex: Math.max(0, Math.min(slotCount - 1, slotIndex)),
      });
    },
    [resourceCount, slotCount, setFocusedCell]
  );

  return {
    focusedCell,
    setFocusedCell,
    handleKeyDown,
    handleFocus,
    handleBlur,
    hasFocus,
    isCellFocused,
    getCellTabIndex,
    focusCell,
  };
}
