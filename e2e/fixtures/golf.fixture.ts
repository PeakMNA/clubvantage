import { test as base, expect } from '@playwright/test';
import { CheckInPanelPage } from '../pages/checkin-panel.page';

// Test user credentials (from seed data)
const TEST_USER = {
  email: 'admin@royalbangkokclub.com',
  password: 'Admin123!',
};

/**
 * Custom fixtures for Golf E2E tests
 */
type GolfFixtures = {
  checkInPanel: CheckInPanelPage;
  authenticatedPage: void;
  golfPage: void;
};

export const test = base.extend<GolfFixtures>({
  /**
   * CheckInPanelPage object for interacting with the check-in panel
   */
  checkInPanel: async ({ page }, use) => {
    const checkInPanel = new CheckInPanelPage(page);
    await use(checkInPanel);
  },

  /**
   * Fixture that logs in before the test
   */
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/');

    // Check if we need to log in
    if (page.url().includes('/login')) {
      await page.getByLabel('Email').fill(TEST_USER.email);
      await page.getByLabel('Password').fill(TEST_USER.password);
      await page.getByRole('button', { name: /sign in/i }).click();

      // Wait for login to complete
      await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
    }

    await use();
  },

  /**
   * Fixture that navigates to golf page (requires authentication)
   */
  golfPage: async ({ page, authenticatedPage }, use) => {
    await page.goto('/golf');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000); // Allow client-side rendering

    await use();
  },
});

export { expect };

/**
 * Helper to find and click on a booked tee time to open check-in panel
 */
export async function openBookedTeeTime(page: import('@playwright/test').Page): Promise<boolean> {
  // Find a booked tee time row (has player badges visible)
  const bookedRow = page.locator('[data-testid="flight-row"]').filter({
    has: page.locator('.bg-blue-500, .bg-amber-500, .bg-teal-500, button:has-text("Check In")'),
  }).first();

  const hasBookedRow = await bookedRow.isVisible({ timeout: 5000 }).catch(() => false);

  if (!hasBookedRow) {
    // Try finding any clickable row with players
    const anyPlayerRow = page.locator('tr, [role="row"]').filter({
      has: page.locator('text=/M|G|D/i'),
    }).first();

    if (await anyPlayerRow.isVisible({ timeout: 3000 }).catch(() => false)) {
      await anyPlayerRow.click();
      await page.waitForTimeout(500);
      return true;
    }
    return false;
  }

  await bookedRow.click();
  await page.waitForTimeout(500);
  return true;
}
