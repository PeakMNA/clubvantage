import { test, expect } from '@playwright/test';

test('debug golf page - check data on current date first', async ({ page }) => {
  await page.goto('/');

  // Login
  await page.waitForFunction(() => {
    const button = document.querySelector('button[type="submit"]');
    return button && !button.hasAttribute('disabled');
  }, { timeout: 10000 });
  await page.fill('input#email', 'admin@royalbangkokclub.com');
  await page.fill('input#password', 'Admin123!');
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });

  // Navigate to golf with hard refresh
  await page.goto('/golf');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Take screenshot of current date (should be Jan 31)
  await page.screenshot({ path: 'e2e/screenshots/debug-jan-31.png', fullPage: true });

  // Check what date is shown
  const dateText = await page.locator('button').filter({ hasText: /January|February/i }).first().textContent();
  console.log('Current date shown:', dateText);

  // Check for bookings on current date
  let badges = await page.locator('.bg-blue-500, .bg-amber-500, .bg-teal-500').count();
  console.log('Player badges on current date:', badges);

  // Count rows in tee sheet
  const rows = await page.locator('tr, [role="row"]').count();
  console.log('Rows in tee sheet:', rows);

  // Check for "Check In" buttons
  let checkInButtons = await page.locator('button:has-text("Check In")').count();
  console.log('Check In buttons on current date:', checkInButtons);

  // Navigate to Feb 4 (Tuesday) - weekdays start at 6:00 AM, aligning with seed data
  const nextDayButton = page.getByRole('button', { name: 'Next day' });
  // Click 4 times to go from Jan 31 (Sat) -> Feb 1 (Sun) -> Feb 2 (Mon) -> Feb 3 (Tue) -> Feb 4 (Wed)
  for (let i = 0; i < 4; i++) {
    console.log(`Clicking Next day button ${i+1}/4...`);
    await nextDayButton.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  }
  await page.waitForTimeout(1500);

  await page.screenshot({ path: 'e2e/screenshots/debug-feb-4th.png', fullPage: true });

  // Check date again
  const newDateText = await page.locator('button').filter({ hasText: /January|February/i }).first().textContent();
  console.log('Date after navigation:', newDateText);

  // Check for bookings on the weekday
  badges = await page.locator('.bg-blue-500, .bg-amber-500, .bg-teal-500').count();
  console.log('Player badges on weekday:', badges);

  checkInButtons = await page.locator('button:has-text("Check In")').count();
  console.log('Check In buttons on weekday:', checkInButtons);

  // Look for any player type indicators (M, G, D, W badges)
  const mBadges = await page.locator('text=/^M$/').count();
  const gBadges = await page.locator('text=/^G$/').count();
  const dBadges = await page.locator('text=/^D$/').count();
  console.log('M badges:', mBadges, 'G badges:', gBadges, 'D badges:', dBadges);
});
