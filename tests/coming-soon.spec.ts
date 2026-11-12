import { test, expect, type Locator, type Page, type Route } from '@playwright/test';

// The four booleans of GET /features (API-082). The typed object is the
// witness that the spec, like useFeatures(), reads google_signin too.
type Features = {
  email: boolean;
  uploads: boolean;
  checkout: boolean;
  google_signin: boolean;
};

const ALL_FALSE: Features = {
  email: false,
  uploads: false,
  checkout: false,
  google_signin: false,
};

const ALL_TRUE: Features = {
  email: true,
  uploads: true,
  checkout: true,
  google_signin: true,
};

const CORS_HEADERS = {
  'access-control-allow-origin': 'http://localhost:5173',
  'access-control-allow-credentials': 'true',
  'access-control-allow-methods': 'GET, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
};

async function mockFeatures(page: Page, features: Features): Promise<{ apiOrigin: string }> {
  const state = { apiOrigin: 'http://localhost:8080' };
  await page.route('**/features', async (route: Route) => {
    state.apiOrigin = new URL(route.request().url()).origin;
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: CORS_HEADERS });
      return;
    }
    const payload: Features = features;
    await route.fulfill({
      status: 200,
      headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
      body: JSON.stringify({ message: 'ok', data: payload }),
    });
  });
  return state;
}

async function signIn(page: Page, email: string, password: string) {
  await page.goto('/signin');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
}

// The coach profile carries the booking panel (desktop viewport) in place of the old dialog.
async function openBookingPanel(page: Page) {
  await page.goto('/coaches/engr-mark-villanueva');
  const panel = page.getByRole('complementary', { name: 'Book a session' });
  await expect(panel).toBeVisible();
  // Wait for the session list: it is what the checkout feature flag drives.
  await expect(panel.getByRole('radio').first()).toBeVisible();
  return panel;
}

// Pick the first open day and time so the panel's CTA can become enabled.
async function pickFirstSlot(panel: Locator) {
  await panel.getByRole('button', { name: /^\w+day, \w+ \d+, \d{4}$/ }).first().click();
  await panel.getByRole('button', { name: /^\d{1,2}:\d{2} [AP]M$/ }).first().click();
}

const PAID = /Full 1-on-1 Technical Mock Interview/;
const FREE = /Free 15-Min Career & OJT Discovery/;

// Answers GET /features with an arbitrary raw body so a case can prove the hook
// itself (not the devMock fallback) keeps a feature on.
async function mockFeaturesBody(page: Page, data: unknown): Promise<{ apiOrigin: string }> {
  const state = { apiOrigin: 'http://localhost:8080' };
  await page.route('**/features', async (route: Route) => {
    state.apiOrigin = new URL(route.request().url()).origin;
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: CORS_HEADERS });
      return;
    }
    await route.fulfill({
      status: 200,
      headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
      body: JSON.stringify({ message: 'ok', data }),
    });
  });
  return state;
}

// Retires every open booking (confirmed or pending) so the one a case creates is
// the only pending booking the student has: the lists render one pay button per
// pending booking, and the mock keeps state between runs.
async function retireOpenBookings(page: Page, apiOrigin: string) {
  const upcoming = await page.request.get(`${apiOrigin}/me/bookings?when=upcoming`);
  expect(upcoming.ok()).toBeTruthy();
  const bookable = ((await upcoming.json()).data ?? []) as Array<{
    booking_id: string;
    status: string;
  }>;
  for (const booking of bookable.filter((b) => b.status === 'confirmed' || b.status === 'pending')) {
    const cancelled = await page.request.post(`${apiOrigin}/bookings/${booking.booking_id}/cancel`);
    expect(cancelled.ok()).toBeTruthy();
  }
}

// Creates one pending paid booking for the signed-in student.
async function seedPendingPaidBooking(page: Page, apiOrigin: string) {
  await retireOpenBookings(page, apiOrigin);
  const created = await page.request.post(`${apiOrigin}/bookings`, {
    data: {
      coach_slug: 'engr-mark-villanueva',
      session_type_id: 'srv_02',
      slot_starts_at: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
    },
  });
  expect(created.ok()).toBeTruthy();
}

test.describe('Coming soon badges driven by GET /features', () => {
  test('all features off: every spot shows Coming soon and a free session still books', async ({
    page,
  }) => {
    const state = await mockFeatures(page, ALL_FALSE);

    // Sign-in: "Forgot password?" is muted text, not a link.
    await page.goto('/signin');
    await expect(page.getByText('Forgot password?')).toBeVisible();
    await expect(page.getByText('Coming soon', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Forgot password?' })).toHaveCount(0);

    // Reset without a token: the request form is replaced by the coming-soon panel.
    await page.goto('/reset-password');
    await expect(page.getByText('Password reset by email is coming soon.')).toBeVisible();
    await expect(page.getByRole('main').getByRole('link', { name: 'Back to sign in' })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toHaveCount(0);

    // Checkout cancel page: the resume-payment button is disabled.
    await page.goto('/checkout/cancel?booking_id=bkg_demo_01');
    await expect(page.getByRole('button', { name: 'Paid sessions are coming soon' })).toBeDisabled();

    // Student profile (S-024, was settings): the two upload rows are disabled and badged.
    await signIn(page, 'student@iskolar.ph', 'password123');
    await expect(page).toHaveURL(/\/app/);
    await page.goto('/app/profile');
    await expect(page.getByText('Profile photo', { exact: true })).toBeVisible();
    await expect(page.getByText('Resume (PDF)', { exact: true })).toBeVisible();
    await expect(page.getByText('Coming soon', { exact: true })).toHaveCount(2);

    // Booking panel: paid types are badged and cannot be chosen, free ones can be booked.
    const panel = await openBookingPanel(page);
    await expect(panel.getByRole('radio', { name: PAID })).toBeDisabled();
    await expect(panel.getByText('Paid sessions are coming soon')).toBeVisible();
    // The session list beside the panel offers no way to pick the paid type either.
    await expect(page.getByRole('button', { name: `Choose Full 1-on-1 Technical Mock Interview` })).toHaveCount(0);
    await expect(page.getByRole('button', { name: `Choose Free 15-Min Career & OJT Discovery` })).toBeVisible();

    await panel.getByRole('radio', { name: FREE }).check();
    await pickFirstSlot(panel);
    const bookFree = panel.getByRole('button', { name: /^Book free (intro call|session)$/ });
    await expect(bookFree).toBeEnabled({ timeout: 10000 });
    await bookFree.click();
    // A successful free booking confirms in place and links to the student's bookings.
    await expect(panel.getByRole('heading', { name: /You.re booked/ })).toBeVisible();
    await panel.getByRole('link', { name: 'See my bookings' }).click();
    await expect(page).toHaveURL(/\/app\/bookings/);
    await expect(page.getByText('Confirmed', { exact: true }).first()).toBeVisible();

    // Student bookings: a pending booking's resume-payment button is disabled.
    await seedPendingPaidBooking(page, state.apiOrigin);

    await page.reload();
    await expect(page.getByRole('button', { name: /^Finish paying/ })).toBeDisabled();
    await expect(page.getByText('Coming soon', { exact: true })).toBeVisible();
  });

  test('all features off: coach onboarding shows the disabled photo row', async ({ page }) => {
    await mockFeatures(page, ALL_FALSE);

    await signIn(page, 'coach@iskolar.ph', 'password123');
    await expect(page).toHaveURL(/\/coach/);
    await page.goto('/coach/onboarding');

    await expect(page.getByText('Profile photo', { exact: true })).toBeVisible();
    await expect(page.getByText('Coming soon', { exact: true })).toBeVisible();
    // A8: the row adds no checkbox and no submit control. Step 1 of the wizard
    // has no checkbox of its own (the agreement is on step 3) and one submit.
    await expect(page.locator('input[type="checkbox"]')).toHaveCount(0);
    await expect(page.locator('button[type="submit"]')).toHaveCount(1);
  });

  test('all features on: no Coming soon spot renders', async ({ page }) => {
    await mockFeatures(page, ALL_TRUE);

    await page.goto('/signin');
    await expect(page.getByRole('link', { name: 'Forgot password?' })).toBeVisible();
    await expect(page.getByText('Coming soon')).toHaveCount(0);

    await page.goto('/reset-password');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.getByText('Coming soon')).toHaveCount(0);

    await signIn(page, 'student@iskolar.ph', 'password123');
    await expect(page).toHaveURL(/\/app/);

    await page.goto('/app/profile');
    await expect(page.getByRole('heading', { name: 'Skills' })).toBeVisible();
    await expect(page.getByText('Resume (PDF)', { exact: true })).toHaveCount(0);
    await expect(page.getByText('uploads are coming soon')).toHaveCount(0);
    await expect(page.getByText('Coming soon')).toHaveCount(0);

    const panel = await openBookingPanel(page);
    await expect(panel.getByRole('radio', { name: PAID })).toBeEnabled();
    await panel.getByRole('radio', { name: PAID }).check();
    await pickFirstSlot(panel);
    await expect(panel.getByRole('button', { name: /^Pay / })).toBeEnabled({ timeout: 10000 });
    await expect(panel.getByText('Coming soon')).toHaveCount(0);
    await expect(panel.getByText('Paid sessions are coming soon')).toHaveCount(0);

    await page.goto('/checkout/cancel?booking_id=bkg_demo_01');
    await expect(page.getByRole('button', { name: /^Finish paying/ })).toBeEnabled();
    await expect(page.getByText('Coming soon')).toHaveCount(0);
  });

  test('all features on: coach onboarding has no photo row', async ({ page }) => {
    await mockFeatures(page, ALL_TRUE);

    await signIn(page, 'coach@iskolar.ph', 'password123');
    await expect(page).toHaveURL(/\/coach/);
    await page.goto('/coach/onboarding');

    // Wait for the wizard so the absence checks below are not vacuous.
    await expect(page.getByLabel('Display name')).toBeVisible();
    await expect(page.getByText('Profile photo')).toHaveCount(0);
    await expect(page.getByText('Coming soon')).toHaveCount(0);
  });

  test('all features off: dashboard resume-payment button is disabled and badged', async ({
    page,
  }) => {
    const state = await mockFeatures(page, ALL_FALSE);

    await signIn(page, 'student@iskolar.ph', 'password123');
    await expect(page).toHaveURL(/\/app/);
    await seedPendingPaidBooking(page, state.apiOrigin);

    // The redesigned dashboard has a single pending-payment banner (the old
    // separate "pending card" with its own Resume Checkout button is gone).
    await page.goto('/app');
    await expect(page.getByRole('button', { name: 'Finish paying' })).toBeDisabled();
    await expect(page.getByText('Coming soon', { exact: true })).toHaveCount(1);
  });

  test('all features on: dashboard resume-payment button is enabled', async ({ page }) => {
    const state = await mockFeatures(page, ALL_TRUE);

    await signIn(page, 'student@iskolar.ph', 'password123');
    await expect(page).toHaveURL(/\/app/);
    await seedPendingPaidBooking(page, state.apiOrigin);

    await page.goto('/app');
    await expect(page.getByRole('button', { name: 'Finish paying' })).toBeEnabled();
    await expect(page.getByText('Coming soon')).toHaveCount(0);
  });

  test('all features off: the reset request page never promises an email', async ({ page }) => {
    await mockFeatures(page, ALL_FALSE);

    await page.goto('/reset-password');
    await expect(page.getByText('Password reset by email is coming soon.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Reset your password' })).toHaveCount(0);
    await expect(page.getByText('We’ll send you a link')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Send reset link' })).toHaveCount(0);
  });

  test('all features off: a reset token never flashes the coming-soon panel', async ({ page }) => {
    await mockFeatures(page, ALL_FALSE);

    // Warm the features cache as email=false, then leave the auth page so the
    // next /reset-password?token= mount is the same first render a real email
    // link produces.
    await page.goto('/signin');
    await expect(page.getByText('Coming soon', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Forgot password?' })).toHaveCount(0);
    await page.evaluate(() => {
      window.history.pushState({}, '', '/internships');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    await expect(page.getByRole('heading', { level: 1, name: 'Internships' })).toBeVisible();

    await page.evaluate(() => {
      (window as any).__resetPanelSeen = false;
      const observer = new MutationObserver((records) => {
        for (const record of records) {
          for (const node of Array.from(record.addedNodes)) {
            const el = node as HTMLElement;
            if (el.textContent?.includes('Password reset by email is coming soon.')) {
              (window as any).__resetPanelSeen = true;
            }
          }
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    });
    await page.evaluate(() => {
      window.history.pushState({}, '', '/reset-password?token=tok_coming_soon');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    await expect(page.getByRole('heading', { name: 'Choose a new password' })).toBeVisible();
    await expect(page.locator('input[type="password"]')).toHaveCount(2);
    expect(await page.evaluate(() => (window as any).__resetPanelSeen)).toBe(false);
  });

  test('only an explicit false turns a feature off', async ({ page }) => {
    await mockFeaturesBody(page, { checkout: false });

    // email and uploads are absent from the payload: they stay on.
    await page.goto('/signin');
    await expect(page.getByRole('link', { name: 'Forgot password?' })).toBeVisible();
    await signIn(page, 'student@iskolar.ph', 'password123');
    await expect(page).toHaveURL(/\/app/);
    await page.goto('/app/profile');
    await expect(page.getByRole('heading', { name: 'Skills' })).toBeVisible();
    await expect(page.getByText('Resume (PDF)', { exact: true })).toHaveCount(0);
    await expect(page.getByText('uploads are coming soon')).toHaveCount(0);

    // checkout is explicitly false: only the paid spots change.
    const panel = await openBookingPanel(page);
    await expect(panel.getByRole('radio', { name: PAID })).toBeDisabled();
    await expect(panel.getByRole('radio', { name: FREE })).toBeEnabled();

    await page.goto('/checkout/cancel?booking_id=bkg_demo_01');
    await expect(page.getByRole('button', { name: 'Paid sessions are coming soon' })).toBeDisabled();
  });

  test('fails open when /features answers with missing or non-boolean keys', async ({ page }) => {
    await mockFeaturesBody(page, { email: 'no' });

    // Nothing is explicitly false, so no spot appears.
    await page.goto('/signin');
    await expect(page.getByRole('link', { name: 'Forgot password?' })).toBeVisible();
    await expect(page.getByText('Coming soon')).toHaveCount(0);

    await signIn(page, 'student@iskolar.ph', 'password123');
    await expect(page).toHaveURL(/\/app/);
    await page.goto('/app/profile');
    await expect(page.getByRole('heading', { name: 'Skills' })).toBeVisible();
    await expect(page.getByText('uploads are coming soon')).toHaveCount(0);
    await expect(page.getByText('Coming soon')).toHaveCount(0);

    const panel = await openBookingPanel(page);
    await expect(panel.getByRole('radio', { name: PAID })).toBeEnabled();
    await panel.getByRole('radio', { name: PAID }).check();
    await pickFirstSlot(panel);
    await expect(panel.getByRole('button', { name: /^Pay / })).toBeEnabled();

    await page.goto('/checkout/cancel?booking_id=bkg_demo_01');
    await expect(page.getByRole('button', { name: /^Finish paying/ })).toBeEnabled();
    await expect(page.getByText('Coming soon')).toHaveCount(0);
  });

  test('fails open when /features cannot be reached', async ({ page }) => {
    let attempts = 0;
    await page.route('**/features', async (route) => {
      attempts += 1;
      await route.abort();
    });

    await page.goto('/signin');
    await expect.poll(() => attempts, { timeout: 15000 }).toBeGreaterThan(0);
    await expect(page.getByRole('link', { name: 'Forgot password?' })).toBeVisible();
    await expect(page.getByText('Coming soon')).toHaveCount(0);

    await signIn(page, 'student@iskolar.ph', 'password123');
    await expect(page).toHaveURL(/\/app/);
    await page.goto('/app/profile');
    await expect(page.getByRole('heading', { name: 'Skills' })).toBeVisible();
    await expect(page.getByText('uploads are coming soon')).toHaveCount(0);
    await expect(page.getByText('Coming soon')).toHaveCount(0);
  });
});
