import { test, expect } from '@playwright/test';

test.describe('Core Student & Coaching Journey', () => {
  const timestamp = Date.now();
  const testEmail = `student_${timestamp}@iskolar.test`;
  const testPassword = 'Password123!';
  const fullName = 'Juan Dela Cruz';

  test('completes full student journey: signup, onboard, browse, apply, book free, book paid, cancel', async ({
    page,
    request,
    baseURL,
  }) => {
    // 1. Sign Up (the Student role is preselected)
    await page.goto('/signup');
    await expect(page).toHaveTitle(/iSkolar Vocation/i);

    await expect(page.getByRole('radio', { name: /^Student/ })).toBeChecked();
    await page.getByLabel('Full name').fill(fullName);
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Password', { exact: true }).fill(testPassword);
    await page.getByRole('checkbox', { name: /Terms of Service/ }).check();
    await page.getByRole('button', { name: 'Create account' }).click();

    // 2. Student Onboarding (S-030): three steps, submitted once at the end
    await expect(page).toHaveURL(/\/app\/onboarding/);
    await expect(page.getByRole('heading', { level: 1, name: 'Where do you study?' })).toBeVisible();
    await page.getByLabel('University').fill('Polytechnic University of the Philippines');
    await page.getByLabel('Course').fill('BS Computer Science');
    await page.getByLabel('Year level').selectOption('3');
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(
      page.getByRole('heading', { level: 1, name: 'How many OJT hours do you need?' })
    ).toBeVisible();
    await page.getByRole('button', { name: '486' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page.getByRole('heading', { level: 1, name: 'What can you do?' })).toBeVisible();
    await page.getByRole('button', { name: 'React', exact: true }).click();
    await page.getByRole('button', { name: 'Finish' }).click();

    // Student lands on the student dashboard
    await expect(page).toHaveURL(/\/app$/);
    await expect(page.getByRole('heading', { level: 1, name: /^Hi, Juan/ })).toBeVisible();

    // 3. Browse Internships (S-001): students (unlike coaches) can save roles
    await page.goto('/internships');
    await expect(page.getByRole('heading', { level: 1, name: 'Internships' })).toBeVisible();
    const roles = page.getByRole('region', { name: 'Roles' });
    await expect(roles.getByRole('article').first()).toBeVisible({ timeout: 10000 });
    await expect(roles.getByRole('button', { name: /^Save / }).first()).toBeVisible();

    // 4. External Apply Flow (BR-001, BR-002, S-003)
    const applyRequests: string[] = [];
    page.on('request', (req) => {
      if (req.method() !== 'GET' && /appl/i.test(new URL(req.url()).pathname)) {
        applyRequests.push(`${req.method()} ${req.url()}`);
      }
    });
    const leaving = page.getByRole('dialog', { name: /^Leaving Vocation for / });
    const expectOutboundNotice = async () => {
      // The leaving-site notice opens; Vocation never collects the application itself
      await expect(leaving).toBeVisible();
      await expect(leaving.getByText(/Vocation doesn.t see or store your application/)).toBeVisible();
      await expect(leaving.getByRole('button', { name: /^Continue to / })).toBeVisible();
      await expect(leaving.locator('input, textarea')).toHaveCount(0);
      await leaving.getByRole('button', { name: 'Stay on Vocation' }).click();
      await expect(leaving).toBeHidden();
    };

    // Selecting a row fills the preview pane, which carries the apply button
    await roles.getByRole('article').first().getByRole('link').first().click();
    const preview = page.getByRole('complementary', { name: 'Role preview' });
    await preview.getByRole('button', { name: 'Apply on company site' }).click();
    await expectOutboundNotice();

    // The full role page offers the same outbound apply
    await preview.getByRole('link', { name: 'Open full page' }).click();
    await expect(page).toHaveURL(/\/internships\/[^/?]+/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page
      .getByRole('button', { name: /^Apply on / })
      .first()
      .click();
    await expectOutboundNotice();
    expect(applyRequests).toEqual([]);

    // 5. Book Free Coaching Session (F-007, S-011) in the booking panel on the coach profile
    await page.goto('/coaches');
    await page.getByRole('link', { name: 'Engr. Mark Villanueva' }).first().click();
    await expect(page).toHaveURL(/\/coaches\/engr-mark-villanueva/);
    const panel = page.getByRole('complementary', { name: 'Book a session' });
    await expect(panel).toBeVisible();

    await panel.getByRole('radio', { name: /Free 15-Min Career & OJT Discovery/ }).check();
    await panel.getByRole('button', { name: /^\w+day, \w+ \d+, \d{4}$/ }).first().click();
    await panel.getByRole('button', { name: /^\d{1,2}:\d{2} [AP]M$/ }).first().click();
    await panel.getByRole('button', { name: /^Book free (intro call|session)$/ }).click();
    await expect(panel.getByRole('heading', { name: /You.re booked/ })).toBeVisible();

    // 6. Book Paid Coaching Session (F-008, API-045): checkout leaves for the gateway page
    await page.goto('/coaches/engr-mark-villanueva');
    const paidPanel = page.getByRole('complementary', { name: 'Book a session' });
    await paidPanel.getByRole('radio', { name: /Full 1-on-1 Technical Mock Interview/ }).check();
    await paidPanel.getByRole('button', { name: /^\w+day, \w+ \d+, \d{4}$/ }).first().click();
    await paidPanel.getByRole('button', { name: /^\d{1,2}:\d{2} [AP]M$/ }).first().click();
    const created = page.waitForResponse(
      (r) => r.request().method() === 'POST' && /\/bookings$/.test(new URL(r.url()).pathname)
    );
    await paidPanel.getByRole('button', { name: /^Pay / }).click();
    const createdRes = await created;
    expect(createdRes.ok()).toBeTruthy();
    // The API's checkout_url takes the browser to the payment return page for the new booking.
    await expect(page).toHaveURL(/\/checkout\/success\?booking_id=/);
    const bookingId = new URL(page.url()).searchParams.get('booking_id') as string;
    expect(bookingId).toBeTruthy();

    // Simulate Fake Webhook (Signed callback confirming payment per API-045)
    const apiUrl = process.env.VITE_API_URL || new URL(createdRes.url()).origin || baseURL;
    const callbackToken =
      process.env.GATEWAY_CALLBACK_TOKEN || process.env.XENDIT_CALLBACK_TOKEN || 'test-callback-token';
    const webhook = await request
      .post(`${apiUrl}/webhooks/xendit`, {
        headers: { 'x-callback-token': callbackToken, 'Content-Type': 'application/json' },
        data: {
          id: `inv_fake_${timestamp}`,
          external_id: bookingId,
          status: 'PAID',
          amount: 1500,
          paid_amount: 1500,
        },
      })
      .catch(() => null);
    // In devMock / mock mode the webhook route may not exist on the dev server.
    const webhookAccepted = webhook?.ok() ?? false;

    // 7. Verify Checkout Return Pages (S-013, S-014, BR-007)
    await page.goto(`/checkout/success?booking_id=${bookingId}`);
    if (webhookAccepted) {
      // A verified webhook confirmed the payment: now (and only now) it reads as booked.
      await expect(page.getByRole('heading', { level: 1, name: /You.re booked/ })).toBeVisible();
    } else {
      // No webhook arrived: the browser landing here proves nothing, so it must not read as booked.
      await expect(page.getByRole('heading', { level: 1, name: 'Almost there' })).toBeVisible();
      await expect(page.getByRole('heading', { name: /You.re booked/ })).toHaveCount(0);
      await expect(page.getByText('Confirming payment…')).toBeVisible();
    }

    // 8. Cancel Booking with Refund Outcome Preview (F-010, S-032)
    await page.goto('/app/bookings');
    await expect(page.getByRole('heading', { level: 1, name: 'Bookings' })).toBeVisible();
    // The free booking is confirmed; the unconfirmed paid one is never shown as confirmed.
    await expect(page.getByText('Confirmed', { exact: true }).first()).toBeVisible();
    if (!webhookAccepted) {
      await expect(page.getByText('Waiting for payment', { exact: true })).toBeVisible();
    }

    // Cancel the paid booking (the ₱1,500 mock interview).
    await page
      .getByRole('article')
      .filter({ hasText: '₱1,500' })
      .getByRole('button', { name: /^Cancel / })
      .click();
    const cancelDialog = page.getByRole('dialog', { name: 'Cancel this session?' });
    await expect(cancelDialog).toBeVisible();
    // Verify the refund outcome is displayed before confirming
    await expect(cancelDialog.getByText(/refund/i).first()).toBeVisible();
    await cancelDialog.getByRole('button', { name: 'Cancel session' }).click();
    await expect(page.getByText(/^Session cancelled\./)).toBeVisible();
    await expect(cancelDialog).toBeHidden();
  });
});
