import { test as base, expect } from '@playwright/test';
import { GolfCheckInPage } from '../pages/golf-checkin.page';

// Test credentials from environment or defaults
const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'admin@royalbangkokclub.com',
  password: process.env.TEST_USER_PASSWORD || 'Admin123!',
};

type GolfFixtures = {
  golfPage: GolfCheckInPage;
  authenticatedGolfPage: GolfCheckInPage;
};

/**
 * Custom test fixtures for Golf Check-in E2E tests
 *
 * Provides:
 * - golfPage: GolfCheckInPage instance
 * - authenticatedGolfPage: Pre-authenticated golf page, navigated to golf section
 */
export const test = base.extend<GolfFixtures>({
  golfPage: async ({ page }, use) => {
    const golfPage = new GolfCheckInPage(page);
    await use(golfPage);
  },

  authenticatedGolfPage: async ({ page }, use) => {
    const golfPage = new GolfCheckInPage(page);

    // Navigate to app
    await page.goto('/');

    // Check if login is required
    const emailInput = page.getByLabel('Email');
    if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Fill login form
      await emailInput.fill(TEST_USER.email);
      await page.getByLabel('Password').fill(TEST_USER.password);
      await page.getByRole('button', { name: /sign in/i }).click();

      // Wait for redirect away from login
      await expect(page).not.toHaveURL(/login/);
    }

    // Navigate to golf section
    await golfPage.navigateToGolf();

    // Navigate to date with bookings (tomorrow for seed data)
    await golfPage.navigateToNextDay(1);

    // Wait for booking data to load
    await golfPage.page.waitForLoadState('networkidle');

    // Try to find any booking chip to confirm data loaded
    const hasBookings = await golfPage.page.locator('[data-booking-chip]').first().isVisible({ timeout: 5000 }).catch(() => false);
    if (!hasBookings) {
      // If no bookings found, try one more day (in case of weekend)
      await golfPage.navigateToNextDay(1);
      await golfPage.page.waitForLoadState('networkidle');
    }

    // Switch to split view for slot cards if available
    await golfPage.switchToSplitView();

    await use(golfPage);
  },
});

export { expect };
