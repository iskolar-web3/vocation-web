import { test, expect, type Page } from '@playwright/test';

async function signInAsCoach(page: Page) {
  await page.goto('/signin');
  await page.getByLabel('Email').fill('coach@iskolar.ph');
  await page.getByLabel('Password', { exact: true }).fill('password123');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/coach/);
}

// Manila calendar day `offset` days from today, as YYYY-MM-DD.
function manilaDay(offset: number): string {
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const d = new Date(`${today}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
}

test.describe('Coach Onboarding & Portal Journey', () => {
  const timestamp = Date.now();
  const testEmail = `coach_${timestamp}@iskolar.test`;
  const testPassword = 'Password123!';
  const coachName = 'Coach Gabriel Ramos';

  test('completes coach signup, onboarding, and manages coach dashboard', async ({
    page,
  }) => {
    // 1. Sign Up as Coach
    await page.goto('/signup');
    await expect(page).toHaveTitle(/iSkolar Vocation/i);

    await page.getByRole('radio', { name: /^Coach/ }).check();
    await page.getByLabel('Full name').fill(coachName);
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Password', { exact: true }).fill(testPassword);
    await page.getByRole('checkbox', { name: /Terms of Service/ }).check();
    await page.getByRole('button', { name: 'Create account' }).click();

    // 2. Coach Onboarding (S-040): three steps
    await expect(page).toHaveURL(/\/coach\/onboarding/);
    await expect(page.getByRole('heading', { level: 1, name: 'Your profile' })).toBeVisible();

    await page.getByLabel('Your profile link').fill(`gabriel-ramos-${timestamp}`);
    await page.getByLabel('Headline').fill('Senior DevOps Lead at Coins.ph · Career Mentor');
    await page
      .getByLabel('Bio')
      .fill('Helping aspiring cloud and software engineers in the Philippines crack technical OJT interviews.');
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page.getByRole('heading', { level: 1, name: 'What you coach' })).toBeVisible();
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(
      page.getByRole('heading', { level: 1, name: 'Pricing and agreement' })
    ).toBeVisible();
    await page.getByRole('checkbox', { name: /I agree to the Coach Agreement/ }).check();
    await page.getByRole('button', { name: 'Create coach profile' }).click();

    // 3. Coach Dashboard
    await expect(page).toHaveURL(/\/coach(\?|$)/);
    await expect(page.getByRole('heading', { level: 1, name: 'Sessions' })).toBeVisible();

    // Verify the three dashboard sections in the coach navigation
    const nav = page.getByRole('navigation', { name: 'Coach pages' });
    await expect(nav.getByRole('link', { name: 'Sessions' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Earnings' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Availability' })).toBeVisible();

    // Switch to Availability
    await nav.getByRole('link', { name: 'Availability' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Availability' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add open time' }).first()).toBeVisible();
  });

  test('coach account has strictly NO student features and 0 auto-saved companies', async ({
    page,
  }) => {
    // Sign in as coach: lands on /coach and NOT /app
    await signInAsCoach(page);
    await expect(page.getByRole('heading', { level: 1, name: 'Sessions' })).toBeVisible();

    // 1. Attempting to visit student routes (/app, /app/saved, /app/bookings) redirects back to /coach
    await page.goto('/app');
    await expect(page).toHaveURL(/\/coach/);

    await page.goto('/app/saved');
    await expect(page).toHaveURL(/\/coach/);

    await page.goto('/app/bookings');
    await expect(page).toHaveURL(/\/coach/);

    // 2. Coach shell does not expose the student navigation or the saved-roles link
    await expect(page.getByRole('navigation', { name: 'Student pages' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /^Saved roles/ })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Bookings', exact: true })).toHaveCount(0);

    // 3. Internship directory does not render save buttons for coach
    await page.goto('/internships');
    await expect(page.getByRole('region', { name: 'Roles' }).getByRole('article').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /^(Save|Remove saved) / })).toHaveCount(0);

    // 4. Coaches directory and profiles do not offer booking to a coach
    await page.goto('/coaches');
    await expect(page.getByRole('link', { name: 'Bea Santos' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /^Book/ })).toHaveCount(0);

    await page.goto('/coaches/bea-santos');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText('Coaches cannot book sessions.')).toBeVisible();
    await expect(page.getByRole('button', { name: /^(Book|Pay|Choose)/ })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Confirm|Proceed/ })).toHaveCount(0);
  });

  test('coach publishes new time slot and it is immediately reflected to student in the booking panel', async ({
    page,
  }) => {
    // 1. Sign in as coach
    await signInAsCoach(page);

    // 2. Open Availability
    await page
      .getByRole('navigation', { name: 'Coach pages' })
      .getByRole('link', { name: 'Availability' })
      .click();
    await expect(page.getByRole('heading', { level: 1, name: 'Availability' })).toBeVisible();
    await page.getByRole('button', { name: 'Add open time' }).first().click();

    // 3. Fill and publish the slot. A random day and start time keep reruns on the same
    // (stateful) mock from overlapping an earlier run's slot; if one still collides the
    // dialog says so and we draw another.
    const hhmm = (mins: number) =>
      `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
    const clock = (mins: number) =>
      `${Math.floor(mins / 60) % 12 || 12}:${String(mins % 60).padStart(2, '0')} ${mins >= 720 ? 'PM' : 'AM'}`;
    const dialog = page.getByRole('dialog', { name: 'Add open time' });
    await expect(dialog).toBeVisible();

    let day = '';
    let startLabel = '';
    let endLabel = '';
    for (let attempt = 0; attempt < 6; attempt++) {
      day = manilaDay(2 + Math.floor(Math.random() * 25));
      const start = (6 + Math.floor(Math.random() * 13)) * 60 + 15 * Math.floor(Math.random() * 4);
      startLabel = clock(start);
      endLabel = clock(start + 45);
      await dialog.getByLabel('Date').fill(day);
      await dialog.getByLabel('Start time').fill(hhmm(start));
      await dialog.getByLabel('End time').fill(hhmm(start + 45));
      await dialog.getByRole('button', { name: 'Add open time' }).click();
      // Either the dialog closes (published) or it shows the overlap error.
      await expect
        .poll(async () => (await dialog.isHidden()) || (await dialog.getByRole('alert').count()) > 0)
        .toBe(true);
      if (await dialog.isHidden()) break;
      await expect(dialog.getByRole('alert')).toContainText('overlaps');
    }

    // Verify success toast in Coach Portal
    await expect(dialog).toBeHidden();
    await expect(page.getByText(new RegExp(`^Added .*${startLabel} – ${endLabel}`, 'i'))).toBeVisible();

    // 4. Sign out
    await page.getByRole('button', { name: 'Account menu' }).click();
    await page.getByRole('menuitem', { name: 'Sign out' }).click();
    await expect(page).toHaveURL(/\/$/);

    // 5. Navigate to the coach's profile as a visitor
    await page.goto('/coaches/engr-mark-villanueva');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Engr. Mark Villanueva/i);

    // 6. The booking panel lists the free session, then the new day, then its time
    const panel = page.getByRole('complementary', { name: 'Book a session' });
    await expect(panel).toBeVisible();
    await panel.getByText('Free 15-Min Career & OJT Discovery').click();

    const [y, m, d] = day.split('-').map(Number);
    const dayLabel = new Intl.DateTimeFormat('en-US', {
      timeZone: 'UTC',
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(Date.UTC(y, m - 1, d)));
    const dayBtn = panel.getByRole('button', { name: dayLabel, exact: true });
    const nextWeek = panel.getByRole('button', { name: 'Next week' });
    for (let i = 0; i < 3 && !(await dayBtn.isVisible()); i++) await nextWeek.click();
    await expect(dayBtn).toBeEnabled();
    await dayBtn.click();

    // 7. The newly published time is offered
    await expect(panel.getByRole('button', { name: startLabel, exact: true })).toBeEnabled();
  });
});
