'use client';

import * as React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui';

interface ImpersonationBannerProps {
  userName: string;
  userEmail: string;
  tenantName: string;
  ticketNumber: string;
  remainingMinutes: number;
  onEndSession: () => void;
}

export function ImpersonationBanner({
  userName,
  userEmail,
  tenantName,
  ticketNumber,
  remainingMinutes,
  onEndSession,
}: ImpersonationBannerProps) {
  const [timeRemaining, setTimeRemaining] = React.useState(remainingMinutes * 60);

  // Countdown timer
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isExpired = timeRemaining <= 0;
  const isLow = timeRemaining < 300; // Less than 5 minutes

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[100] h-12 px-4 flex items-center justify-between ${
        isExpired ? 'bg-slate-600' : 'bg-red-600'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-white">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">IMPERSONATING:</span>
        </div>

        <span className="text-sm text-white">
          {userName} ({userEmail})
        </span>

        <span className="text-white/60">|</span>

        <span className="text-sm text-white/80">{tenantName}</span>

        <span className="text-white/60">|</span>

        <span className="text-sm text-white/80">{ticketNumber}</span>

        <span className="text-white/60">|</span>

        <div className={`flex items-center gap-1 ${isLow ? 'text-amber-300' : 'text-white'}`}>
          <Clock className="h-4 w-4" />
          <span className="text-sm font-mono">
            {isExpired ? 'Expired' : `${formatTime(timeRemaining)} remaining`}
          </span>
        </div>
      </div>

      <Button
        variant={isExpired ? 'secondary' : 'destructive'}
        size="sm"
        onClick={onEndSession}
        className={isExpired ? '' : 'bg-white/20 hover:bg-white/30 text-white border-0'}
      >
        End Session
      </Button>
    </div>
  );
}

// Blocked Action Toast
interface BlockedActionToastProps {
  action: string;
  onDismiss: () => void;
}

export function BlockedActionToast({ action, onDismiss }: BlockedActionToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-6 right-6 z-[101] w-80 p-4 bg-white rounded-lg shadow-lg border-l-4 border-amber-500">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-slate-900">Action Blocked</p>
          <p className="text-sm text-slate-600 mt-1">
            Cannot {action} during impersonation session.
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-600 ml-auto"
        >
          ×
        </button>
      </div>
    </div>
  );
}
