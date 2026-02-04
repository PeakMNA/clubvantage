import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Golf Check-in Shopping Cart
 *
 * Encapsulates all golf check-in panel interactions using user-facing locators.
 */
export class GolfCheckInPage {
  readonly page: Page;

  // Navigation elements
  readonly golfMenuItem: Locator;
  readonly nextDayButton: Locator;
  readonly splitViewButton: Locator;

  // Panel elements
  readonly playersHeading: Locator;
  readonly slotCards: Locator;
  readonly checkInButton: Locator;
  readonly batchCheckInButton: Locator;

  // Batch actions
  readonly selectAllDueButton: Locator;
  readonly selectAllReadyButton: Locator;
  readonly addProShopItemButton: Locator;

  // Payment elements
  readonly cashButton: Locator;
  readonly cardButton: Locator;
  readonly memberAccountButton: Locator;
  readonly payButton: Locator;

  // Dialog elements
  readonly transferDialog: Locator;
  readonly printButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Navigation
    this.golfMenuItem = page.getByRole('link', { name: /golf/i }).first();
    this.nextDayButton = page.getByRole('button', { name: 'Next day' });
    this.splitViewButton = page.getByRole('button', { name: /split view/i });

    // Panel
    this.playersHeading = page.getByRole('heading', { name: /players/i });
    this.slotCards = page.getByTestId('slot-card');
    this.checkInButton = page.getByRole('button', { name: /check in/i }).first();
    this.batchCheckInButton = page.getByRole('button', { name: /check in all/i });

    // Batch actions
    this.selectAllDueButton = page.getByRole('button', { name: /select.*due/i });
    this.selectAllReadyButton = page.getByRole('button', { name: /select.*ready/i });
    this.addProShopItemButton = page.getByRole('button', { name: /add.*item/i });

    // Payment
    this.cashButton = page.getByRole('button', { name: /cash/i });
    this.cardButton = page.getByRole('button', { name: /card/i });
    this.memberAccountButton = page.getByRole('button', { name: /account/i });
    this.payButton = page.getByRole('button', { name: /pay \$/i });

    // Dialogs
    this.transferDialog = page.getByRole('dialog');
    this.printButton = page.getByRole('button', { name: /print/i });
  }

  async goto() {
    await this.page.goto('/golf');
  }

  async navigateToGolf() {
    await this.golfMenuItem.click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToNextDay(days: number = 1) {
    for (let i = 0; i < days; i++) {
      await this.nextDayButton.click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  async switchToSplitView() {
    const button = this.page.locator('button[title="Front 9 / Back 9 split view"]');
    if (await button.isVisible()) {
      await button.click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  async openBookedTeeTime(): Promise<boolean> {
    // Try multiple strategies to find a booked tee time slot
    // Strategy 1: Look for BookingChip buttons (data-booking-chip parent, blue-50 bg for booked status)
    const bookingChip = this.page.locator('[data-booking-chip] button').first();

    if (await bookingChip.isVisible().catch(() => false)) {
      await bookingChip.click();
      // Wait for panel to appear
      const panelVisible = await this.playersHeading
        .or(this.page.getByText(/slot/i))
        .or(this.page.getByText(/player/i))
        .isVisible({ timeout: 5000 })
        .catch(() => false);
      return panelVisible;
    }

    // Strategy 2: Look for any button with booking styling (bg-blue-50 = booked)
    const bookedButton = this.page.locator('button.bg-blue-50').first();

    if (await bookedButton.isVisible().catch(() => false)) {
      await bookedButton.click();
      const panelVisible = await this.playersHeading
        .or(this.page.getByText(/slot/i))
        .isVisible({ timeout: 5000 })
        .catch(() => false);
      return panelVisible;
    }

    // Strategy 3: Look for slot cards in split view with player count badges
    const slotCard = this.page.locator('.rounded-lg.border').filter({
      has: this.page.locator('.bg-blue-100, .bg-emerald-100, .bg-amber-100'),
    }).first();

    if (await slotCard.isVisible().catch(() => false)) {
      await slotCard.click();
      return true;
    }

    // Strategy 4: Look for any row with player names (booking chips show truncated names)
    const rowWithBooking = this.page.locator('button').filter({
      has: this.page.locator('.truncate.text-sm'),
    }).first();

    if (await rowWithBooking.isVisible().catch(() => false)) {
      await rowWithBooking.click();
      return true;
    }

    return false;
  }

  async openCheckInViaContextMenu(): Promise<boolean> {
    // Try to find a booking chip and right-click on it
    const bookingChip = this.page.locator('[data-booking-chip] button').first();

    if (await bookingChip.isVisible().catch(() => false)) {
      await bookingChip.click({ button: 'right' });
      const checkInMenuItem = this.page.getByRole('menuitem', { name: /check in/i });
      const menuVisible = await checkInMenuItem.isVisible({ timeout: 2000 }).catch(() => false);
      if (menuVisible) {
        await checkInMenuItem.click();
        return true;
      }
    }

    // Fallback: Try to find a booked button (bg-blue-50)
    const bookedButton = this.page.locator('button.bg-blue-50').first();

    if (await bookedButton.isVisible().catch(() => false)) {
      await bookedButton.click({ button: 'right' });
      const checkInMenuItem = this.page.getByRole('menuitem', { name: /check in/i });
      const menuVisible = await checkInMenuItem.isVisible({ timeout: 2000 }).catch(() => false);
      if (menuVisible) {
        await checkInMenuItem.click();
        return true;
      }
    }
    return false;
  }

  async closePanel() {
    await this.page.keyboard.press('Escape');
  }

  async selectAllDue() {
    await this.selectAllDueButton.click();
  }

  async selectAllReady() {
    await this.selectAllReadyButton.click();
  }

  async payWithCash() {
    await this.cashButton.click();
    await this.payButton.click();
  }

  async payWithCard() {
    await this.cardButton.click();
    await this.payButton.click();
  }

  async payWithMemberAccount() {
    await this.memberAccountButton.click();
    await this.payButton.click();
  }

  async checkInSelected() {
    await this.checkInButton.click();
  }

  async checkInAll() {
    await this.batchCheckInButton.click();
  }

  // Assertions
  async expectPanelVisible() {
    await expect(this.playersHeading.or(this.page.getByText(/slot/i))).toBeVisible();
  }

  async expectPanelClosed() {
    await expect(this.playersHeading).not.toBeVisible();
  }

  async expectPlayerBadgesVisible() {
    // Member (M), Guest (G), Dependent (D) badges
    const badge = this.page.getByText(/^[MGD]$/).first();
    await expect(badge).toBeVisible();
  }

  async expectCartInfoVisible() {
    await expect(this.page.getByText(/green fee|cart|total|due/i).first()).toBeVisible();
  }

  async expectStatusIndicatorVisible() {
    await expect(this.page.getByText(/ready|due|checked|booked/i).first()).toBeVisible();
  }

  async expectCheckInButtonVisible() {
    await expect(this.checkInButton).toBeVisible();
  }

  async expectPaymentMethodsVisible() {
    const hasPayment = await this.cashButton.or(this.cardButton).or(this.payButton).isVisible();
    expect(hasPayment).toBe(true);
  }
}
