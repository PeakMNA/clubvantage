'use client';

import { useState, useEffect } from 'react';
import { Globe, Plus, Trash2, Check, AlertCircle, Loader2 } from 'lucide-react';
import {
  Button,
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Label,
  Badge,
  cn,
} from '@clubvantage/ui';
import { useLookupMutations, type LookupTranslationDisplay } from '@/hooks/use-lookups';

// Supported locales
const SUPPORTED_LOCALES = [
  { code: 'th', name: 'Thai', flag: '🇹🇭', nativeName: 'ไทย' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳', nativeName: '简体中文' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', flag: '🇹🇼', nativeName: '繁體中文' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷', nativeName: '한국어' },
  { code: 'ms', name: 'Malay', flag: '🇲🇾', nativeName: 'Bahasa Melayu' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩', nativeName: 'Bahasa Indonesia' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳', nativeName: 'Tiếng Việt' },
];

interface TranslationEditorProps {
  lookupValueId: string;
  lookupValueName: string;
  translations: LookupTranslationDisplay[];
  onClose: () => void;
  onSave: () => void;
}

export function TranslationEditor({
  lookupValueId,
  lookupValueName,
  translations: initialTranslations,
  onClose,
  onSave,
}: TranslationEditorProps) {
  const { addTranslation, deleteTranslation, isAddingTranslation, isDeletingTranslation } =
    useLookupMutations();

  const [translations, setTranslations] = useState<Map<string, { name: string; id?: string }>>(
    () => {
      const map = new Map();
      initialTranslations.forEach((t) => {
        map.set(t.locale, { name: t.name, id: t.id });
      });
      return map;
    }
  );

  const [editingLocale, setEditingLocale] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [saveStatus, setSaveStatus] = useState<Record<string, 'saving' | 'saved' | 'error'>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Get locales that haven't been translated yet
  const untranslatedLocales = SUPPORTED_LOCALES.filter(
    (locale) => !translations.has(locale.code)
  );

  // Get locales that have translations
  const translatedLocales = SUPPORTED_LOCALES.filter((locale) =>
    translations.has(locale.code)
  );

  // Handle save translation
  const handleSaveTranslation = async (localeCode: string, name: string) => {
    if (!name.trim()) return;

    setSaveStatus((prev) => ({ ...prev, [localeCode]: 'saving' }));

    try {
      const result = await addTranslation({
        lookupValueId,
        locale: localeCode,
        name: name.trim(),
      });

      if (result.addLookupTranslation?.success) {
        setTranslations((prev) => {
          const newMap = new Map(prev);
          newMap.set(localeCode, {
            name: name.trim(),
            id: result.addLookupTranslation?.translation?.id,
          });
          return newMap;
        });
        setSaveStatus((prev) => ({ ...prev, [localeCode]: 'saved' }));
        setEditingLocale(null);
        setEditingName('');

        // Clear saved status after delay
        setTimeout(() => {
          setSaveStatus((prev) => {
            const newStatus = { ...prev };
            delete newStatus[localeCode];
            return newStatus;
          });
        }, 2000);
      } else {
        setSaveStatus((prev) => ({ ...prev, [localeCode]: 'error' }));
      }
    } catch {
      setSaveStatus((prev) => ({ ...prev, [localeCode]: 'error' }));
    }
  };

  // Handle delete translation
  const handleDeleteTranslation = async (localeCode: string) => {
    const translation = translations.get(localeCode);
    if (!translation?.id) return;

    try {
      await deleteTranslation(translation.id);
      setTranslations((prev) => {
        const newMap = new Map(prev);
        newMap.delete(localeCode);
        return newMap;
      });
      setDeleteConfirm(null);
      onSave();
    } catch {
      // Handle error silently for now
    }
  };

  // Start editing a locale
  const handleStartEdit = (localeCode: string) => {
    const existing = translations.get(localeCode);
    setEditingLocale(localeCode);
    setEditingName(existing?.name ?? '');
  };

  // Add new locale
  const handleAddLocale = (localeCode: string) => {
    setEditingLocale(localeCode);
    setEditingName('');
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-amber-600" />
            Translations
          </DialogTitle>
          <DialogDescription>
            Manage translations for "{lookupValueName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Translated locales */}
          {translatedLocales.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-stone-700">Translated</Label>
              <div className="space-y-2">
                {translatedLocales.map((locale) => {
                  const translation = translations.get(locale.code);
                  const isEditing = editingLocale === locale.code;
                  const status = saveStatus[locale.code];

                  return (
                    <div
                      key={locale.code}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border p-3 transition-colors',
                        isEditing ? 'border-amber-300 bg-amber-50' : 'bg-white'
                      )}
                    >
                      <span className="text-xl">{locale.flag}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-stone-700">
                            {locale.name}
                          </span>
                          <span className="text-xs text-stone-400">({locale.nativeName})</span>
                        </div>
                        {isEditing ? (
                          <div className="mt-2 flex items-center gap-2">
                            <Input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              placeholder={`Enter ${locale.name} translation`}
                              className="h-8 text-sm"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSaveTranslation(locale.code, editingName);
                                } else if (e.key === 'Escape') {
                                  setEditingLocale(null);
                                }
                              }}
                            />
                            <Button
                              size="sm"
                              onClick={() => handleSaveTranslation(locale.code, editingName)}
                              disabled={!editingName.trim() || isAddingTranslation}
                            >
                              {isAddingTranslation ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        ) : (
                          <p className="truncate text-sm text-stone-600">{translation?.name}</p>
                        )}
                      </div>
                      {!isEditing && (
                        <div className="flex items-center gap-1">
                          {status === 'saved' && (
                            <Badge variant="outline" className="text-xs text-green-600">
                              <Check className="mr-1 h-3 w-3" />
                              Saved
                            </Badge>
                          )}
                          {status === 'error' && (
                            <Badge variant="outline" className="text-xs text-red-600">
                              <AlertCircle className="mr-1 h-3 w-3" />
                              Error
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStartEdit(locale.code)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => setDeleteConfirm(locale.code)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Untranslated locales */}
          {untranslatedLocales.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-stone-700">Add Translation</Label>
              <div className="grid grid-cols-2 gap-2">
                {untranslatedLocales.map((locale) => {
                  const isEditing = editingLocale === locale.code;

                  if (isEditing) {
                    return (
                      <div
                        key={locale.code}
                        className="col-span-2 rounded-lg border border-amber-300 bg-amber-50 p-3"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{locale.flag}</span>
                          <span className="text-sm font-medium text-stone-700">
                            {locale.name}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            placeholder={`Enter ${locale.name} translation`}
                            className="h-8 text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveTranslation(locale.code, editingName);
                              } else if (e.key === 'Escape') {
                                setEditingLocale(null);
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSaveTranslation(locale.code, editingName)}
                            disabled={!editingName.trim() || isAddingTranslation}
                          >
                            {isAddingTranslation ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Add'
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingLocale(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={locale.code}
                      onClick={() => handleAddLocale(locale.code)}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border border-dashed p-3',
                        'text-left transition-colors hover:border-amber-300 hover:bg-amber-50'
                      )}
                    >
                      <span className="text-xl opacity-60">{locale.flag}</span>
                      <div>
                        <span className="text-sm text-stone-600">{locale.name}</span>
                        <p className="text-xs text-stone-400">Click to add</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty state */}
          {translatedLocales.length === 0 && editingLocale === null && (
            <div className="rounded-lg border-2 border-dashed border-stone-200 p-6 text-center">
              <Globe className="mx-auto h-8 w-8 text-stone-300" />
              <p className="mt-2 text-sm text-stone-500">
                No translations yet. Click a language above to add one.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </DialogFooter>

        {/* Delete confirmation dialog */}
        {deleteConfirm && (
          <Dialog open onOpenChange={() => setDeleteConfirm(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Translation</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete the{' '}
                  {SUPPORTED_LOCALES.find((l) => l.code === deleteConfirm)?.name} translation?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteTranslation(deleteConfirm)}
                  disabled={isDeletingTranslation}
                >
                  {isDeletingTranslation ? 'Deleting...' : 'Delete'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}
