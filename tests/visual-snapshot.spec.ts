import { test } from '@playwright/test';
import path from 'node:path';

const ARTIFACT_DIR = 'C:/Users/Clarisse Salazar/.gemini/antigravity-ide/brain/68b1d663-d7bf-4449-8ab4-fca6b1bb4c69';

test('capture tactile UI visual snapshots', async ({ page }) => {
  // 1. Landing Page
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const acceptBtn = page.locator('button:has-text("Accept Analytics")');
  if (await acceptBtn.isVisible()) {
    await acceptBtn.click();
    await page.waitForTimeout(400);
  }

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'landing_tactile_hero.png'),
    fullPage: false,
  });

  // 2. Full Landing Page
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'landing_full_page.png'),
    fullPage: true,
  });

  // 3. Coaches Directory
  await page.goto('/coaches');
  await page.waitForLoadState('networkidle');
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'coaches_tactile_directory.png'),
    fullPage: false,
  });

  // 4. Student Dashboard (Sign in as student)
  await page.goto('/signin');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', 'student@iskolar.io');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/app**');
  await page.waitForLoadState('networkidle');

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'student_dashboard_tactile.png'),
    fullPage: false,
  });

  // 5. Internships Directory with Clicked Job Dossier
  await page.goto('/internships');
  await page.waitForLoadState('networkidle');
  await page.setViewportSize({ width: 1280, height: 850 });
  // Click first stream row to populate right-hand dossier
  const firstRole = page.locator('.stream-row').first();
  if (await firstRole.isVisible()) {
    await firstRole.click();
    await page.waitForTimeout(500);
  }
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'internship_split_dossier.png'),
    fullPage: false,
  });
});
