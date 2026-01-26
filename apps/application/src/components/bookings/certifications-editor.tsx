'use client';

import { useState, useCallback, useMemo } from 'react';
import { cn, Button } from '@clubvantage/ui';
import { Plus, X, Edit2, Check, AlertTriangle, XCircle } from 'lucide-react';
import { format, isAfter, addDays, isBefore } from 'date-fns';

// Types
export interface StaffCertification {
  id?: string;
  name: string;
  expiresAt: string; // ISO date string
}

export interface CertificationsEditorProps {
  value: StaffCertification[];
  onChange: (certifications: StaffCertification[]) => void;
  className?: string;
}

type CertStatus = 'valid' | 'expiring' | 'expired';

function getCertificationStatus(expiresAt: string): CertStatus {
  const expiryDate = new Date(expiresAt);
  const now = new Date();
  const ninetyDaysFromNow = addDays(now, 90);

  if (isBefore(expiryDate, now)) return 'expired';
  if (isBefore(expiryDate, ninetyDaysFromNow)) return 'expiring';
  return 'valid';
}

const STATUS_CONFIG: Record<CertStatus, { label: string; icon: typeof Check; color: string; bg: string }> = {
  valid: {
    label: 'Valid',
    icon: Check,
    color: 'text-emerald-600',
    bg: 'bg-emerald-100 dark:bg-emerald-500/20',
  },
  expiring: {
    label: 'Expiring Soon',
    icon: AlertTriangle,
    color: 'text-amber-600',
    bg: 'bg-amber-100 dark:bg-amber-500/20',
  },
  expired: {
    label: 'Expired',
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-100 dark:bg-red-500/20',
  },
};

/**
 * CertificationsEditor
 *
 * An inline editor for staff certifications with expiration tracking.
 * Shows validity status based on expiration date.
 */
export function CertificationsEditor({
  value = [],
  onChange,
  className,
}: CertificationsEditorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', expiresAt: '' });

  // Generate temporary IDs for new certifications
  const generateId = () => `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const startAdd = useCallback(() => {
    setFormData({ name: '', expiresAt: '' });
    setIsAdding(true);
    setEditingId(null);
  }, []);

  const startEdit = useCallback((cert: StaffCertification) => {
    const id = cert.id || generateId();
    setFormData({
      name: cert.name,
      expiresAt: format(new Date(cert.expiresAt), 'yyyy-MM-dd'),
    });
    setEditingId(id);
    setIsAdding(false);

    // Ensure the cert has an ID
    if (!cert.id) {
      onChange(value.map((c) => (c === cert ? { ...c, id } : c)));
    }
  }, [value, onChange]);

  const cancelEdit = useCallback(() => {
    setFormData({ name: '', expiresAt: '' });
    setIsAdding(false);
    setEditingId(null);
  }, []);

  const saveCertification = useCallback(() => {
    if (!formData.name || !formData.expiresAt) return;

    const certification: StaffCertification = {
      id: editingId || generateId(),
      name: formData.name,
      expiresAt: new Date(formData.expiresAt).toISOString(),
    };

    if (isAdding) {
      onChange([...value, certification]);
    } else if (editingId) {
      onChange(value.map((c) => (c.id === editingId ? certification : c)));
    }

    cancelEdit();
  }, [formData, editingId, isAdding, value, onChange, cancelEdit]);

  const removeCertification = useCallback(
    (id: string) => {
      onChange(value.filter((c) => c.id !== id));
    },
    [value, onChange]
  );

  // Ensure all certs have IDs for editing
  const certsWithIds = useMemo(() => {
    return value.map((cert, index) => ({
      ...cert,
      id: cert.id || `cert-${index}`,
    }));
  }, [value]);

  const isFormValid = formData.name.trim() && formData.expiresAt;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Existing certifications */}
      {certsWithIds.length > 0 ? (
        <div className="space-y-1">
          {certsWithIds.map((cert) => {
            const isEditing = editingId === cert.id;
            const status = getCertificationStatus(cert.expiresAt);
            const statusConfig = STATUS_CONFIG[status];
            const StatusIcon = statusConfig.icon;

            if (isEditing) {
              return (
                <div
                  key={cert.id}
                  className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/50 p-2 dark:border-amber-500/30 dark:bg-amber-500/10"
                >
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Certification name"
                    className="h-9 flex-1 rounded-md border border-border bg-background px-3 text-sm"
                  />
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="h-9 rounded-md border border-border bg-background px-3 text-sm"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={saveCertification}
                    disabled={!isFormValid}
                    className="bg-amber-500 text-white hover:bg-amber-600"
                  >
                    Save
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={cancelEdit}>
                    Cancel
                  </Button>
                </div>
              );
            }

            return (
              <div
                key={cert.id}
                className={cn(
                  'flex items-center gap-3 rounded-lg border p-2 transition-colors',
                  status === 'expired' && 'border-red-200 bg-red-50/30 dark:border-red-500/30 dark:bg-red-500/5',
                  status === 'expiring' && 'border-amber-200 bg-amber-50/30 dark:border-amber-500/30 dark:bg-amber-500/5',
                  status === 'valid' && 'border-border bg-card'
                )}
              >
                {/* Name */}
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                  {cert.name}
                </span>

                {/* Expiry date */}
                <span className="shrink-0 text-xs text-muted-foreground">
                  Exp: {format(new Date(cert.expiresAt), 'MMM yyyy')}
                </span>

                {/* Status badge */}
                <div
                  className={cn(
                    'flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                    statusConfig.bg,
                    statusConfig.color
                  )}
                >
                  <StatusIcon className="h-3 w-3" />
                  {statusConfig.label}
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => startEdit(cert)}
                    className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCertification(cert.id!)}
                    className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-red-100 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        !isAdding && (
          <p className="py-3 text-center text-sm text-muted-foreground">
            No certifications added
          </p>
        )
      )}

      {/* Add new certification form */}
      {isAdding && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/50 p-2 dark:border-amber-500/30 dark:bg-amber-500/10">
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Certification name"
            className="h-9 flex-1 rounded-md border border-border bg-background px-3 text-sm"
            autoFocus
          />
          <input
            type="date"
            value={formData.expiresAt}
            onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
            min={format(new Date(), 'yyyy-MM-dd')}
            className="h-9 rounded-md border border-border bg-background px-3 text-sm"
          />
          <Button
            type="button"
            size="sm"
            onClick={saveCertification}
            disabled={!isFormValid}
            className="bg-amber-500 text-white hover:bg-amber-600"
          >
            Add
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={cancelEdit}>
            Cancel
          </Button>
        </div>
      )}

      {/* Add button */}
      {!isAdding && !editingId && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={startAdd}
          className="w-full"
        >
          <Plus className="mr-1 h-4 w-4" />
          Add Certification
        </Button>
      )}
    </div>
  );
}
