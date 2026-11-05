import { test, expect, type Page, type Route } from '@playwright/test';

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
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
}

async function openBookingDialog(page: Page) {
  await page.goto('/coaches');
  await page.locator('button:has-text("Book")').first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  return dialog;
}

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

// Creates a pending paid booking and retires every confirmed one so the
// dashboard renders both resume-payment buttons (banner and pending card).
async function seedPendingPaidBooking(page: Page, apiOrigin: string) {
  const upcoming = await page.request.get(`${apiOrigin}/me/bookings?when=upcoming`);
  expect(upcoming.ok()).toBeTruthy();
  const bookable = ((await upcoming.json()).data ?? []) as Array<{
    booking_id: string;
    status: string;
  }>;
  for (const booking of bookable.filter((b) => b.status === 'confirmed')) {
    const cancelled = await page.request.post(`${apiOrigin}/bookings/${booking.booking_id}/cancel`);
    expect(cancelled.ok()).toBeTruthy();
  }
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
    await expect(page.getByText('Coming soon').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Forgot password?' })).toHaveCount(0);

    // Reset without a token: the request form is replaced by the coming-soon panel.
    await page.goto('/reset-password');
    await expect(page.getByText('Password reset by email is coming soon.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Back to sign in' })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toHaveCount(0);

    // Checkout cancel page: the resume-payment button is disabled.
    await page.goto('/checkout/cancel?booking_id=bkg_demo_01');
    await expect(page.getByRole('button', { name: 'Complete Payment' })).toBeDisabled();
    await expect(page.getByText('Coming soon').first()).toBeVisible();

    // Student settings: the two upload rows are disabled and badged.
    await signIn(page, 'student@iskolar.ph', 'password123');
    await expect(page).toHaveURL(/\/app/);
    await page.goto('/app/settings');
    await expect(page.getByText('Profile photo', { exact: true })).toBeVisible();
    await expect(page.getByText('Resume (PDF)', { exact: true })).toBeVisible();
    await expect(page.getByText('Coming soon')).toHaveCount(2);

    // Booking dialog: paid types are badged and cannot be booked, free ones can.
    const dialog = await openBookingDialog(page);
    await dialog.getByText('Full 1-on-1 Technical Mock Interview').click();
    await expect(
      dialog.getByRole('button', { name: 'Paid sessions are coming soon' })
    ).toBeDisabled();
    await expect(dialog.getByText('Coming soon').first()).toBeVisible();

    await dialog.getByText('Free 15-Min Career & OJT Discovery').click();
    const confirmFree = dialog.getByRole('button', { name: 'Confirm Free Booking' });
    await expect(confirmFree).toBeEnabled({ timeout: 10000 });
    await confirmFree.click();
    // A successful free booking sends the student to their bookings page.
    await expect(page).toHaveURL(/\/app\/bookings/);
    await expect(page.getByText('Confirmed').first()).toBeVisible();

    // Student bookings: a pending booking's resume-payment button is disabled.
    const futureSlot = new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString();
    const created = await page.request.post(`${state.apiOrigin}/bookings`, {
      data: {
        coach_slug: 'engr-mark-villanueva',
        session_type_id: 'srv_02',
        slot_starts_at: futureSlot,
      },
    });
    expect(created.ok()).toBeTruthy();

    await page.reload();
    await expect(page.getByRole('button', { name: 'Complete Payment' })).toBeDisabled();
    await expect(page.getByText('Coming soon').first()).toBeVisible();
  });

  test('all features off: coach onboarding shows the disabled photo row', async ({ page }) => {
    await mockFeatures(page, ALL_FALSE);

    await signIn(page, 'coach@iskolar.ph', 'password123');
    await expect(page).toHaveURL(/\/coach/);
    await page.goto('/coach/onboarding');

    await expect(page.getByText('Profile photo', { exact: true })).toBeVisible();
    await expect(page.getByText('Coming soon').first()).toBeVisible();
    // A8: the row adds no checkbox and no submit control.
    await expect(page.locator('input[type="checkbox"]')).toHaveCount(1);
    await expect(page.locator('button[type="submit"]')).toHaveCount(1);
  });

  test('all features on: no Coming soon spot renders', async ({ page }) => {
    await mockFeatures(page, ALL_TRUE);

    await page.goto('/signin');
    await expect(page.locator('button:has-text("Forgot password?")')).toBeVisible();
    await expect(page.getByText('Coming soon')).toHaveCount(0);

    await page.goto('/reset-password');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.getByText('Coming soon')).toHaveCount(0);

    await signIn(page, 'student@iskolar.ph', 'password123');
    await expect(page).toHaveURL(/\/app/);

    await page.goto('/app/settings');
    await expect(page.getByText('Profile photo')).toHaveCount(0);
    await expect(page.getByText('Resume (PDF)')).toHaveCount(0);
    await expect(page.getByText('Coming soon')).toHaveCount(0);

    const dialog = await openBookingDialog(page);
    await dialog.getByText('Full 1-on-1 Technical Mock Interview').click();
    await expect(dialog.getByRole('button', { name: 'Proceed to Payment' })).toBeEnabled({
      timeout: 10000,
    });
    await expect(dialog.getByText('Coming soon')).toHaveCount(0);
    await dialog.getByRole('button', { name: 'Cancel' }).click();

    await page.goto('/checkout/cancel?booking_id=bkg_demo_01');
    await expect(page.getByRole('button', { name: 'Complete Payment' })).toBeEnabled();
    await expect(page.getByText('Coming soon')).toHaveCount(0);
  });

  test('all features on: coach onboarding has no photo row', async ({ page }) => {
    await mockFeatures(page, ALL_TRUE);

    await signIn(page, 'coach@iskolar.ph', 'password123');
    await expect(page).toHaveURL(/\/coach/);
    await page.goto('/coach/onboarding');

    await expect(page.getByText('Profile photo')).toHaveCount(0);
    await expect(page.getByText('Coming soon')).toHaveCount(0);
  });

  test('all features off: dashboard resume-payment buttons are disabled and badged', async ({
    page,
  }) => {
    const state = await mockFeatures(page, ALL_FALSE);

    await signIn(page, 'student@iskolar.ph', 'password123');
    await expect(page).toHaveURL(/\/app/);
    await seedPendingPaidBooking(page, state.apiOrigin);

    await page.goto('/app');
    await expect(page.getByRole('button', { name: 'Complete Payment' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Resume Checkout' })).toBeDisabled();
    await expect(page.getByText('Coming soon')).toHaveCount(2);
  });

  test('all features on: dashboard resume-payment buttons are enabled', async ({ page }) => {
    const state = await mockFeatures(page, ALL_TRUE);

    await signIn(page, 'student@iskolar.ph', 'password123');
    await expect(page).toHaveURL(/\/app/);
    await seedPendingPaidBooking(page, state.apiOrigin);

    await page.goto('/app');
    await expect(page.getByRole('button', { name: 'Complete Payment' })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Resume Checkout' })).toBeEnabled();
    await expect(page.getByText('Coming soon')).toHaveCount(0);
  });

  test('all features off: the reset request page never promises an email', async ({ page }) => {
    await mockFeatures(page, ALL_FALSE);

    await page.goto('/reset-password');
    await expect(page.getByText('Password reset by email is coming soon.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Reset Your Password' })).toHaveCount(0);
    await expect(
      page.getByText('We will send a secure password reset link to your email')
    ).toHaveCount(0);
  });

  test('all features off: a reset token never flashes the coming-soon panel', async ({ page }) => {
    await mockFeatures(page, ALL_FALSE);

    // Warm the features cache as email=false, then leave the auth page so the
    // next /reset-password?token= mount is the same first render a real email
    // link produces.
    await page.goto('/signin');
    await expect(page.locator('button:has-text("Forgot password?")')).toHaveCount(0);
    await page.evaluate(() => {
      window.history.pushState({}, '', '/internships');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    await expect(
      page.getByRole('heading', { name: 'Find High-Impact Internships in the Philippines' })
    ).toBeVisible();

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

    await expect(page.getByRole('heading', { name: 'Set New Password' })).toBeVisible();
    await expect(page.locator('input[type="password"]')).toHaveCount(2);
    expect(await page.evaluate(() => (window as any).__resetPanelSeen)).toBe(false);
  });

  test('only an explicit false turns a feature off', async ({ page }) => {
    await mockFeaturesBody(page, { checkout: false });

    // email and uploads are absent from the payload: they stay on.
    await page.goto('/signin');
    await expect(page.locator('button:has-text("Forgot password?")')).toBeVisible();
    await signIn(page, 'student@iskolar.ph', 'password123');
    await expect(page).toHaveURL(/\/app/);
    await page.goto('/app/settings');
    await expect(page.getByText('Profile photo')).toHaveCount(0);
    await expect(page.getByText('Resume (PDF)')).toHaveCount(0);

    // checkout is explicitly false: only the paid spots change.
    const dialog = await openBookingDialog(page);
    await dialog.getByText('Full 1-on-1 Technical Mock Interview').click();
    await expect(
      dialog.getByRole('button', { name: 'Paid sessions are coming soon' })
    ).toBeDisabled();
    await dialog.getByRole('button', { name: 'Cancel' }).click();

    await page.goto('/checkout/cancel?booking_id=bkg_demo_01');
    await expect(page.getByRole('button', { name: 'Complete Payment' })).toBeDisabled();
  });

  test('fails open when /features answers with missing or non-boolean keys', async ({ page }) => {
    await mockFeaturesBody(page, { email: 'no' });

    // Nothing is explicitly false, so no spot appears.
    await page.goto('/signin');
    await expect(page.locator('button:has-text("Forgot password?")')).toBeVisible();
    await expect(page.getByText('Coming soon')).toHaveCount(0);

    await signIn(page, 'student@iskolar.ph', 'password123');
    await expect(page).toHaveURL(/\/app/);
    await page.goto('/app/settings');
    await expect(page.getByText('Profile photo')).toHaveCount(0);
    await expect(page.getByText('Coming soon')).toHaveCount(0);

    const dialog = await openBookingDialog(page);
    await dialog.getByText('Full 1-on-1 Technical Mock Interview').click();
    await expect(dialog.getByRole('button', { name: 'Proceed to Payment' })).toBeEnabled();
    await dialog.getByRole('button', { name: 'Cancel' }).click();

    await page.goto('/checkout/cancel?booking_id=bkg_demo_01');
    await expect(page.getByRole('button', { name: 'Complete Payment' })).toBeEnabled();
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
    await expect(page.locator('button:has-text("Forgot password?")')).toBeVisible();
    await expect(page.getByText('Coming soon')).toHaveCount(0);

    await signIn(page, 'student@iskolar.ph', 'password123');
    await expect(page).toHaveURL(/\/app/);
    await page.goto('/app/settings');
    await expect(page.getByText('Profile photo')).toHaveCount(0);
    await expect(page.getByText('Coming soon')).toHaveCount(0);
  });
});
