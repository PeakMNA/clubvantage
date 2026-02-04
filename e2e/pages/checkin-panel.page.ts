import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Page Object Model for the Shopping Cart Check-In Panel
 *
 * This encapsulates all interactions with the check-in panel,
 * making tests more readable and maintainable.
 */
export class CheckInPanelPage {
  readonly page: Page;

  // Panel container
  readonly panel: Locator;
  readonly loadingSpinner: Locator;
  readonly errorState: Locator;
  readonly tryAgainButton: Locator;
  readonly emptyState: Locator;

  // Header elements
  readonly teeTimeHeader: Locator;
  readonly courseNameText: Locator;
  readonly draftBadge: Locator;
  readonly refreshButton: Locator;
  readonly printTicketButton: Locator;

  // Status summary
  readonly playerCountText: Locator;
  readonly allSettledBadge: Locator;
  readonly balanceDueText: Locator;

  // Slot cards
  readonly slotCards: Locator;
  readonly slotCheckboxes: Locator;
  readonly positionIndicators: Locator;

  // Batch actions bar
  readonly batchActionsBar: Locator;
  readonly selectedCountText: Locator;
  readonly selectAllButton: Locator;
  readonly clearSelectionButton: Locator;
  readonly paySelectedButton: Locator;
  readonly checkInSelectedButton: Locator;

  // Transfer dialog
  readonly transferDialog: Locator;
  readonly transferPlayerList: Locator;
  readonly transferConfirmButton: Locator;
  readonly transferCancelButton: Locator;

  // Pro shop picker
  readonly proShopPicker: Locator;
  readonly slotSelector: Locator;
  readonly productSearch: Locator;
  readonly productList: Locator;

  constructor(page: Page) {
    this.page = page;

    // Panel container
    this.panel = page.locator('[role="dialog"], [data-state="open"]');
    this.loadingSpinner = page.locator('.animate-spin');
    this.errorState = page.locator('.text-red-500, .text-red-600').first();
    this.tryAgainButton = page.getByRole('button', { name: /try again/i });
    this.emptyState = page.getByText('No players in this tee time');

    // Header elements
    this.teeTimeHeader = page.locator('h2').first();
    this.courseNameText = page.locator('p.text-muted-foreground').first();
    this.draftBadge = page.getByText('Draft');
    this.refreshButton = page.locator('button[title="Refresh"]');
    this.printTicketButton = page.getByRole('button', { name: /print ticket/i });

    // Status summary
    this.playerCountText = page.getByText(/\d+ players/);
    this.allSettledBadge = page.getByText('All settled');
    this.balanceDueText = page.getByText(/\$[\d,]+\.\d{2} balance due/);

    // Slot cards
    this.slotCards = page.locator('.border.rounded-lg.p-3');
    this.slotCheckboxes = page.locator('button.w-5.h-5.rounded.border-2');
    this.positionIndicators = page.locator('.rounded-full.w-10.h-10');

    // Batch actions bar
    this.batchActionsBar = page.locator('.fixed.bottom-0');
    this.selectedCountText = page.getByText(/\d+ selected/);
    this.selectAllButton = page.getByText('Select all');
    this.clearSelectionButton = page.locator('button[title="Clear selection"]');
    this.paySelectedButton = page.getByRole('button', { name: /pay \$/i });
    this.checkInSelectedButton = page.getByRole('button', { name: /check in/i });

    // Transfer dialog
    this.transferDialog = page.locator('.fixed.inset-0.z-50').filter({ hasText: 'Transfer Item' });
    this.transferPlayerList = page.locator('button').filter({ has: page.locator('.rounded-full.bg-muted') });
    this.transferConfirmButton = page.getByRole('button', { name: 'Transfer' });
    this.transferCancelButton = page.getByRole('button', { name: 'Cancel' });

    // Pro shop picker
    this.proShopPicker = page.locator('[role="dialog"]').filter({ hasText: /add item|products/i });
    this.slotSelector = page.locator('select, [role="combobox"]').first();
    this.productSearch = page.getByPlaceholder(/search/i);
    this.productList = page.locator('.grid').first();
  }

  /**
   * Wait for panel to finish loading
   */
  async waitForLoad() {
    await expect(this.loadingSpinner).not.toBeVisible({ timeout: 10000 });
  }

  /**
   * Check if panel is visible
   */
  async isVisible(): Promise<boolean> {
    return await this.panel.isVisible({ timeout: 3000 }).catch(() => false);
  }

  /**
   * Close the panel using Escape key
   */
  async close() {
    await this.page.keyboard.press('Escape');
    await expect(this.panel).not.toBeVisible({ timeout: 3000 });
  }

  /**
   * Click refresh to reload data
   */
  async refresh() {
    await this.refreshButton.click();
    await this.waitForLoad();
  }

  /**
   * Get number of slot cards visible
   */
  async getSlotCount(): Promise<number> {
    return await this.slotCards.count();
  }

  /**
   * Expand a slot card by clicking on it
   */
  async expandSlot(index: number) {
    const slot = this.slotCards.nth(index);
    await slot.locator('button:has-text("$")').click();
  }

  /**
   * Select a slot by clicking its checkbox
   */
  async selectSlot(index: number) {
    await this.slotCheckboxes.nth(index).click();
  }

  /**
   * Select all slots
   */
  async selectAllSlots() {
    await this.selectAllButton.click();
  }

  /**
   * Clear all selections
   */
  async clearSelection() {
    await this.clearSelectionButton.click();
  }

  /**
   * Get the number of selected slots from the batch actions bar
   */
  async getSelectedCount(): Promise<number> {
    const text = await this.selectedCountText.textContent();
    const match = text?.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Click Pay button in batch actions
   */
  async paySelected() {
    await this.paySelectedButton.click();
  }

  /**
   * Click Check In button in batch actions
   */
  async checkInSelected() {
    await this.checkInSelectedButton.click();
  }

  /**
   * Check if Check In button is enabled
   */
  async isCheckInEnabled(): Promise<boolean> {
    return await this.checkInSelectedButton.isEnabled();
  }

  /**
   * Open transfer dialog for a line item
   */
  async openTransferDialog(slotIndex: number, itemIndex: number = 0) {
    await this.expandSlot(slotIndex);
    const transferButtons = this.page.locator('button[title="Transfer to another player"]');
    await transferButtons.nth(itemIndex).click();
    await expect(this.transferDialog).toBeVisible({ timeout: 3000 });
  }

  /**
   * Select a player in transfer dialog and confirm
   */
  async transferToPlayer(playerIndex: number) {
    await this.transferPlayerList.nth(playerIndex).click();
    await this.transferConfirmButton.click();
    await expect(this.transferDialog).not.toBeVisible({ timeout: 3000 });
  }

  /**
   * Cancel transfer dialog
   */
  async cancelTransfer() {
    await this.transferCancelButton.click();
    await expect(this.transferDialog).not.toBeVisible({ timeout: 3000 });
  }

  /**
   * Open pro shop picker to add a charge
   */
  async openProShopPicker(slotIndex: number) {
    await this.expandSlot(slotIndex);
    const addChargeButton = this.page.getByRole('button', { name: /add charge/i });
    await addChargeButton.click();
    await expect(this.proShopPicker).toBeVisible({ timeout: 3000 });
  }

  /**
   * Search for a product in the pro shop picker
   */
  async searchProduct(query: string) {
    await this.productSearch.fill(query);
    await this.page.waitForTimeout(500); // Wait for debounced search
  }

  /**
   * Take a screenshot with a descriptive name
   */
  async screenshot(name: string) {
    await this.page.screenshot({ path: `e2e/screenshots/checkin-${name}.png` });
  }

  /**
   * Get total balance due from the panel
   */
  async getTotalBalance(): Promise<number> {
    const text = await this.balanceDueText.textContent().catch(() => '$0.00');
    const match = text?.match(/\$([\d,]+\.\d{2})/);
    return match ? parseFloat(match[1].replace(',', '')) : 0;
  }

  /**
   * Check if all players are settled (no balance due)
   */
  async isAllSettled(): Promise<boolean> {
    return await this.allSettledBadge.isVisible({ timeout: 1000 }).catch(() => false);
  }

  /**
   * Check if there's a draft indicator
   */
  async hasDraft(): Promise<boolean> {
    return await this.draftBadge.isVisible({ timeout: 1000 }).catch(() => false);
  }

  /**
   * Get player names from slot cards
   */
  async getPlayerNames(): Promise<string[]> {
    const names: string[] = [];
    const count = await this.slotCards.count();

    for (let i = 0; i < count; i++) {
      const nameElement = this.slotCards.nth(i).locator('.font-semibold').first();
      const name = await nameElement.textContent();
      if (name) names.push(name.trim());
    }

    return names;
  }

  /**
   * Check if a specific player type badge is visible
   */
  async hasPlayerType(type: 'M' | 'G' | 'D' | 'W'): Promise<boolean> {
    const badge = this.page.locator(`text=/^${type}$/`);
    return await badge.first().isVisible({ timeout: 1000 }).catch(() => false);
  }
}
