import { test, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const ARTIFACT_DIR =
  process.env.ARTIFACT_DIR ||
  path.join(process.cwd(), 'test-results', 'snapshots');

if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

test('capture Spotlight UI visual snapshots', async ({ page }) => {
  // 1. Landing Page
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  // Never photograph an error or loading screen: the page heading must be up first.
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  const acceptBtn = page.getByRole('button', { name: 'Accept analytics' });
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
  await expect(page.getByRole('heading', { level: 1, name: 'Coaches' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Engr. Mark Villanueva' }).first()).toBeVisible();
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'coaches_tactile_directory.png'),
    fullPage: false,
  });

  // 4. Student Dashboard (Sign in as student)
  await page.goto('/signin');
  await page.waitForLoadState('networkidle');
  await page.getByLabel('Email').fill('student@iskolar.io');
  await page.getByLabel('Password', { exact: true }).fill('password123');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForURL('**/app**');
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { level: 1, name: /^Hi, / })).toBeVisible();

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'student_dashboard_tactile.png'),
    fullPage: false,
  });

  // 5. Internships Directory with the role preview pane filled
  await page.goto('/internships');
  await page.waitForLoadState('networkidle');
  await page.setViewportSize({ width: 1280, height: 850 });
  await expect(page.getByRole('heading', { level: 1, name: 'Internships' })).toBeVisible();
  // Click the first role row to populate the right-hand preview
  const firstRole = page.getByRole('region', { name: 'Roles' }).getByRole('article').first();
  await expect(firstRole).toBeVisible({ timeout: 10000 });
  await firstRole.getByRole('link').first().click();
  await expect(
    page.getByRole('complementary', { name: 'Role preview' }).getByRole('button', { name: 'Apply on company site' })
  ).toBeVisible();
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'internship_split_dossier.png'),
    fullPage: false,
  });
});
