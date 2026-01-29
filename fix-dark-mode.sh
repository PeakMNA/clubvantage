#!/bin/bash

# Script to fix hardcoded colors for dark mode support
# Patterns to replace:
# bg-white → bg-card
# border-stone-200 or border-slate-200 → border
# text-stone-900, text-stone-800, text-stone-700, text-slate-900, text-slate-800, text-slate-700 → text-foreground
# text-stone-600, text-stone-500, text-stone-400, text-slate-600, text-slate-500, text-slate-400 → text-muted-foreground
# bg-stone-50, bg-stone-100, bg-slate-50, bg-slate-100 → bg-muted or bg-muted/50

echo "Fixing hardcoded colors for dark mode support..."

# Files to process
FILES=(
  "apps/application/src/components/members/profile-tab.tsx"
  "apps/application/src/components/members/tabs/profile-tab.tsx"
  "apps/application/src/components/members/tabs/contract-tab.tsx"
  "apps/application/src/components/members/tabs/dependents-tab.tsx"
  "apps/application/src/components/members/tabs/ar-history-tab.tsx"
  "apps/application/src/components/members/charge-card.tsx"
  "apps/application/src/components/members/contract-summary-card.tsx"
  "apps/application/src/components/members/dependent-card.tsx"
  "apps/application/src/components/members/add-member-modal.tsx"
  "apps/application/src/components/golf/tee-sheet-grid.tsx"
  "apps/application/src/components/golf/tee-sheet-row.tsx"
  "apps/application/src/components/golf/flight-detail-panel.tsx"
  "apps/application/src/components/golf/tee-sheet-metrics.tsx"
  "apps/application/src/components/golf/courses-tab.tsx"
  "apps/application/src/components/golf/carts-tab.tsx"
  "apps/application/src/components/golf/caddies-tab.tsx"
  "apps/application/src/components/billing/receipt-form.tsx"
  "apps/application/src/components/billing/member-selection-card.tsx"
  "apps/application/src/components/billing/settlement-summary.tsx"
  "apps/application/src/components/billing/billing-dialogs.tsx"
  "apps/application/src/components/billing/wht-verification-panel.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."

    # Background colors
    sed -i '' 's/bg-white"/bg-card"/g' "$file"
    sed -i '' "s/bg-white'/bg-card'/g" "$file"
    sed -i '' 's/bg-white /bg-card /g' "$file"

    # Borders
    sed -i '' 's/border-stone-200/border/g' "$file"
    sed -i '' 's/border-slate-200/border/g' "$file"

    # Foreground text (dark)
    sed -i '' 's/text-stone-900/text-foreground/g' "$file"
    sed -i '' 's/text-stone-800/text-foreground/g' "$file"
    sed -i '' 's/text-stone-700/text-foreground/g' "$file"
    sed -i '' 's/text-slate-900/text-foreground/g' "$file"
    sed -i '' 's/text-slate-800/text-foreground/g' "$file"
    sed -i '' 's/text-slate-700/text-foreground/g' "$file"

    # Muted foreground text
    sed -i '' 's/text-stone-600/text-muted-foreground/g' "$file"
    sed -i '' 's/text-stone-500/text-muted-foreground/g' "$file"
    sed -i '' 's/text-stone-400/text-muted-foreground/g' "$file"
    sed -i '' 's/text-slate-600/text-muted-foreground/g' "$file"
    sed -i '' 's/text-slate-500/text-muted-foreground/g' "$file"
    sed -i '' 's/text-slate-400/text-muted-foreground/g' "$file"

    # Muted backgrounds
    sed -i '' 's/bg-stone-50/bg-muted/g' "$file"
    sed -i '' 's/bg-stone-100/bg-muted/g' "$file"
    sed -i '' 's/bg-slate-50/bg-muted/g' "$file"
    sed -i '' 's/bg-slate-100/bg-muted/g' "$file"

    # Gradients with stone/slate → muted
    sed -i '' 's/from-stone-50/from-muted/g' "$file"
    sed -i '' 's/to-stone-50/to-muted/g' "$file"
    sed -i '' 's/from-stone-100/from-muted/g' "$file"
    sed -i '' 's/to-stone-100/to-muted/g' "$file"
    sed -i '' 's/from-stone-200/from-muted/g' "$file"
    sed -i '' 's/to-stone-200/to-muted/g' "$file"

    sed -i '' 's/from-slate-50/from-muted/g' "$file"
    sed -i '' 's/to-slate-50/to-muted/g' "$file"
    sed -i '' 's/from-slate-100/from-muted/g' "$file"
    sed -i '' 's/to-slate-100/to-muted/g' "$file"
    sed -i '' 's/from-slate-200/from-border/g' "$file"
    sed -i '' 's/to-slate-200/to-muted/g' "$file"
    sed -i '' 's/from-slate-300/from-border/g' "$file"
    sed -i '' 's/to-slate-300/to-muted/g' "$file"
    sed -i '' 's/via-slate-400/via-muted-foreground/g' "$file"

    echo "✓ Completed $file"
  else
    echo "⚠ File not found: $file"
  fi
done

echo ""
echo "All files processed!"
echo "Please review the changes and run: npm run build"
