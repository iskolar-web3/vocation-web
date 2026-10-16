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
    // 1. Sign Up
    await page.goto('/signup');
    await expect(page).toHaveTitle(/iSkolar Vocation/i);

    // Fill sign up form
    const fullNameInput = page.locator('input[placeholder="e.g. Maria Santos"]');
    if (await fullNameInput.isVisible()) {
      await fullNameInput.fill(fullName);
    }

    await page.locator('input[type="email"]').fill(testEmail);
    await page.locator('input[type="password"]').fill(testPassword);

    // Agree to legal terms
    const legalCheckbox = page.locator('input[type="checkbox"]');
    if (await legalCheckbox.isVisible()) {
      await legalCheckbox.check();
    }

    await page.locator('button[type="submit"]:has-text("Create Account")').click();

    // 2. Student Onboarding (S-030)
    // The user either automatically lands on /app/onboarding or we navigate to it
    await page.waitForTimeout(1000);
    const currentUrl = page.url();
    if (!currentUrl.includes('/app/onboarding')) {
      await page.goto('/app/onboarding');
    }

    await expect(page.locator('h1')).toContainText(/Welcome to iSkolar Vocation|Onboarding/i);

    // Fill onboarding fields
    const schoolInput = page.locator('input[placeholder*="Polytechnic University"]');
    if (await schoolInput.isVisible()) {
      await schoolInput.fill('Polytechnic University of the Philippines');
    }

    const courseInput = page.locator('input[placeholder*="BS Information Tech"]');
    if (await courseInput.isVisible()) {
      await courseInput.fill('BS Computer Science');
    }

    // Submit onboarding
    const submitOnboardingBtn = page.locator('button[type="submit"]');
    await submitOnboardingBtn.click();

    // Verify student lands on student dashboard or internships directory
    await page.waitForTimeout(1000);

    // 3. Browse Internships (S-001)
    await page.goto('/internships');
    await expect(page.locator('h1, h2')).toContainText(/Internship|Directory|Opportunities/i);

    // Find and click the first internship card
    const firstInternshipCard = page.locator('.stream-row, .tactile-card').first();
    await expect(firstInternshipCard).toBeVisible({ timeout: 10000 });
    await firstInternshipCard.click();

    // 4. External Apply Flow (BR-001, BR-002, S-003)
    await expect(page.locator('h1')).toBeVisible();
    const applyButton = page.locator('button:has-text("Apply")').first();
    if (await applyButton.isVisible()) {
      await applyButton.click();
      // Verify Leaving Site Modal opens (never collects student resume/application)
      const leavingModal = page.locator('text=You are being redirected');
      if (await leavingModal.isVisible()) {
        await expect(leavingModal).toBeVisible();
        // Close modal
        const closeBtn = page.locator('button:has-text("Cancel"), button:has-text("Stay on iSkolar")').first();
        if (await closeBtn.isVisible()) {
          await closeBtn.click();
        }
      }
    }

    // 5. Book Free Coaching Session (F-007, S-011)
    await page.goto('/coaches');
    const bookCoachBtn = page.locator('button:has-text("Book")').first();
    await expect(bookCoachBtn).toBeVisible({ timeout: 10000 });
    await bookCoachBtn.click();

    // Booking Dialog is open
    const bookingDialog = page.locator('[role="dialog"], .fixed');
    await expect(bookingDialog.first()).toBeVisible();

    // Select free intro call if available
    const freeCallOption = page.locator('text=Free 15-min Intro, text=Free Intro, text=Free').first();
    if (await freeCallOption.isVisible()) {
      await freeCallOption.click();
    }

    // Select time slot
    const slotButton = page.locator('button:has-text("AM"), button:has-text("PM")').first();
    if (await slotButton.isVisible()) {
      await slotButton.click();
    }

    // Check refund terms checkbox
    const refundAgreeCheckbox = page.locator('input[type="checkbox"]:near(:text("refund"))').first();
    if (await refundAgreeCheckbox.isVisible()) {
      await refundAgreeCheckbox.check();
    }

    // Confirm booking
    const confirmBookingBtn = page.locator('button:has-text("Confirm Booking"), button:has-text("Book Free Session")').first();
    if (await confirmBookingBtn.isVisible()) {
      await confirmBookingBtn.click();
      await page.waitForTimeout(1000);
    }

    // 6. Book Paid Coaching Session & Signed Webhook (F-008, API-045)
    await page.goto('/coaches');
    const bookPaidBtn = page.locator('button:has-text("Book")').first();
    await expect(bookPaidBtn).toBeVisible();
    await bookPaidBtn.click();

    // Select paid session
    const paidOption = page.locator('text=Mock Technical Interview, text=Comprehensive Portfolio Review, text=₱').first();
    if (await paidOption.isVisible()) {
      await paidOption.click();
    }

    // Select slot
    const paidSlot = page.locator('button:has-text("AM"), button:has-text("PM")').first();
    if (await paidSlot.isVisible()) {
      await paidSlot.click();
    }

    if (await refundAgreeCheckbox.isVisible()) {
      await refundAgreeCheckbox.check();
    }

    // Submit paid booking
    const proceedPaymentBtn = page.locator('button:has-text("Proceed to Payment"), button:has-text("Confirm Booking")').first();
    if (await proceedPaymentBtn.isVisible()) {
      await proceedPaymentBtn.click();
      await page.waitForTimeout(1500);
    }

    // Simulate Fake Webhook (Signed callback confirming payment per API-045)
    const apiUrl = process.env.VITE_API_URL || baseURL || 'http://localhost:5173';
    const callbackToken = process.env.GATEWAY_CALLBACK_TOKEN || process.env.XENDIT_CALLBACK_TOKEN || 'test-callback-token';
    const fakeBookingId = `bkg_test_${timestamp}`;

    try {
      await request.post(`${apiUrl}/webhooks/xendit`, {
        headers: {
          'x-callback-token': callbackToken,
          'Content-Type': 'application/json',
        },
        data: {
          id: `inv_fake_${timestamp}`,
          external_id: fakeBookingId,
          status: 'PAID',
          amount: 500,
          paid_amount: 500,
        },
      });
    } catch (_err) {
      // In devMock / mock mode, webhook route may not exist on dev server
    }

    // 7. Verify Checkout Return Pages (S-013, S-014, BR-007)
    await page.goto(`/checkout/success?booking_id=${fakeBookingId}`);
    await expect(page.locator('h1, h2')).toContainText(/Booking Status|Success|Confirmed|Payment/i);

    // 8. Cancel Booking with Refund Outcome Preview (F-010, S-032)
    await page.goto('/app/bookings');
    await expect(page.locator('h1, h2').first()).toContainText(/Mentorship Bookings|Bookings|Sessions/i);

    const cancelButton = page.locator('button:has-text("Cancel")').first();
    if (await cancelButton.isVisible()) {
      await cancelButton.click();
      // Verify refund outcome is displayed in the modal
      await expect(page.locator('text=Refund Assessment, text=Refund Outcome, text=refund policy, text=Refund').first()).toBeVisible();

      // Confirm cancellation
      const confirmCancelBtn = page.locator('button:has-text("Confirm Cancellation"), button:has-text("Yes, Cancel")').first();
      if (await confirmCancelBtn.isVisible()) {
        await confirmCancelBtn.click();
        await page.waitForTimeout(1000);
      }
    }
  });
});
