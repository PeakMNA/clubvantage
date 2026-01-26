'use client';

import { useState } from 'react';
import {
  cn,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Label,
  Input,
} from '@clubvantage/ui';
import { Loader2, AlertCircle, Clock, Wrench, Trophy, CloudRain, Lock, Users } from 'lucide-react';

export type BlockType = 'MAINTENANCE' | 'TOURNAMENT' | 'WEATHER' | 'PRIVATE' | 'STARTER';

export interface BlockFormData {
  courseId: string;
  startTime: Date;
  endTime: Date;
  blockType: BlockType;
  reason?: string;
  isRecurring: boolean;
  recurringPattern?: string;
}

interface BlockTeeTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BlockFormData) => Promise<void>;
  courseId: string;
  courseName: string;
  initialDate?: Date;
  initialTime?: string;
  existingBlock?: {
    id: string;
    startTime: Date;
    endTime: Date;
    blockType: BlockType;
    reason?: string;
    isRecurring: boolean;
    recurringPattern?: string;
  };
}

const blockTypes: { value: BlockType; label: string; icon: typeof Wrench; description: string }[] = [
  { value: 'MAINTENANCE', label: 'Maintenance', icon: Wrench, description: 'Course or equipment maintenance' },
  { value: 'TOURNAMENT', label: 'Tournament', icon: Trophy, description: 'Tournament or event' },
  { value: 'WEATHER', label: 'Weather', icon: CloudRain, description: 'Weather-related closure' },
  { value: 'PRIVATE', label: 'Private Event', icon: Lock, description: 'Private booking or outing' },
  { value: 'STARTER', label: 'Starter Block', icon: Users, description: 'Reserved for starter operations' },
];

const recurringOptions = [
  { value: '', label: 'No repeat' },
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY:MON', label: 'Every Monday' },
  { value: 'WEEKLY:TUE', label: 'Every Tuesday' },
  { value: 'WEEKLY:WED', label: 'Every Wednesday' },
  { value: 'WEEKLY:THU', label: 'Every Thursday' },
  { value: 'WEEKLY:FRI', label: 'Every Friday' },
  { value: 'WEEKLY:SAT', label: 'Every Saturday' },
  { value: 'WEEKLY:SUN', label: 'Every Sunday' },
  { value: 'WEEKLY:SAT,SUN', label: 'Weekends' },
  { value: 'WEEKLY:MON,TUE,WED,THU,FRI', label: 'Weekdays' },
];

function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0] || '';
}

function formatTimeForInput(date: Date): string {
  return date.toTimeString().slice(0, 5);
}

export function BlockTeeTimeModal({
  isOpen,
  onClose,
  onSubmit,
  courseId,
  courseName,
  initialDate,
  initialTime,
  existingBlock,
}: BlockTeeTimeModalProps) {
  const isEditing = !!existingBlock;

  // Initialize form state
  const defaultDate = initialDate || new Date();
  const defaultStartTime = initialTime || '06:00';
  const defaultEndTime = initialTime
    ? `${(parseInt(initialTime.split(':')[0] || '0') + 1).toString().padStart(2, '0')}:${initialTime.split(':')[1]}`
    : '07:00';

  const [blockType, setBlockType] = useState<BlockType>(existingBlock?.blockType || 'MAINTENANCE');
  const [startDate, setStartDate] = useState(
    existingBlock ? formatDateForInput(existingBlock.startTime) : formatDateForInput(defaultDate)
  );
  const [startTime, setStartTime] = useState(
    existingBlock ? formatTimeForInput(existingBlock.startTime) : defaultStartTime
  );
  const [endDate, setEndDate] = useState(
    existingBlock ? formatDateForInput(existingBlock.endTime) : formatDateForInput(defaultDate)
  );
  const [endTime, setEndTime] = useState(
    existingBlock ? formatTimeForInput(existingBlock.endTime) : defaultEndTime
  );
  const [reason, setReason] = useState(existingBlock?.reason || '');
  const [isRecurring, setIsRecurring] = useState(existingBlock?.isRecurring || false);
  const [recurringPattern, setRecurringPattern] = useState(existingBlock?.recurringPattern || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);

    // Validate times
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);

    if (end <= start) {
      setError('End time must be after start time');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        courseId,
        startTime: start,
        endTime: end,
        blockType,
        reason: reason || undefined,
        isRecurring,
        recurringPattern: isRecurring ? recurringPattern : undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create block');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedBlockType = blockTypes.find((b) => b.value === blockType);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Block' : 'Block Tee Times'}</DialogTitle>
          <DialogDescription>
            Block tee times on {courseName} to prevent bookings during this period.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Block Type Selection */}
          <div className="space-y-2">
            <Label>Block Type</Label>
            <div className="grid grid-cols-5 gap-2">
              {blockTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setBlockType(type.value)}
                    className={cn(
                      'flex flex-col items-center justify-center p-3 rounded-lg border transition-colors',
                      blockType === type.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-muted hover:bg-muted/50'
                    )}
                  >
                    <Icon className="h-5 w-5 mb-1" />
                    <span className="text-xs font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
            {selectedBlockType && (
              <p className="text-xs text-muted-foreground">{selectedBlockType.description}</p>
            )}
          </div>

          {/* Date & Time Range */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Recurring Option */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="recurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="recurring" className="cursor-pointer">
                Repeat this block
              </Label>
            </div>
            {isRecurring && (
              <select
                value={recurringPattern}
                onChange={(e) => setRecurringPattern(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                {recurringOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
              placeholder="Enter a reason for this block..."
              rows={2}
              className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEditing ? 'Update Block' : 'Create Block'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
