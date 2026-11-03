import { test, expect } from '@playwright/test';

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

    // Switch role to Coach
    const coachRoleBtn = page.locator('button:has-text("Industry Coach")');
    await coachRoleBtn.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    if (await coachRoleBtn.isVisible()) {
      await coachRoleBtn.click();
    }

    // Fill sign up form
    const fullNameInput = page.locator('input[placeholder="e.g. Maria Santos"]');
    await fullNameInput.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    if (await fullNameInput.isVisible()) {
      await fullNameInput.fill(coachName);
    }

    await page.locator('input[type="email"]').fill(testEmail);
    await page.locator('input[type="password"]').fill(testPassword);

    // Agree to legal terms
    const legalCheckbox = page.locator('input[type="checkbox"]');
    if (await legalCheckbox.isVisible()) {
      await legalCheckbox.check();
    }

    await page.locator('button[type="submit"]:has-text("Create Account")').click();

    // 2. Coach Onboarding (S-040)
    await page.waitForTimeout(1000);
    const currentUrl = page.url();
    if (!currentUrl.includes('/coach/onboarding') && !currentUrl.includes('/onboarding/coach')) {
      await page.goto('/coach/onboarding');
    }

    await expect(page.locator('h1')).toContainText(/Coach Onboarding/i);

    // Fill slug, headline & bio
    await page.locator('input[placeholder="maria-santos"]').fill(`gabriel-ramos-${timestamp}`);
    await page.locator('input[placeholder*="Senior Software Engineer"]').fill('Senior DevOps Lead at Coins.ph · Career Mentor');
    await page.locator('textarea').fill('Helping aspiring cloud and software engineers in the Philippines crack technical OJT interviews.');

    // Agree to coach agreement checkbox
    const coachAgreementCheckbox = page.locator('input[type="checkbox"]').last();
    await coachAgreementCheckbox.check();

    // Submit coach onboarding
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // 3. Coach Dashboard
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/coach/);
    await expect(page.locator('h1')).toContainText(/Coach Dashboard|Gabriel/i);

    // Verify tabs
    await expect(page.locator('button:has-text("Booked Sessions")')).toBeVisible();
    await expect(page.locator('button:has-text("Earnings & Balance")')).toBeVisible();
    await expect(page.locator('button:has-text("My Availability")')).toBeVisible();

    // Switch to My Availability tab
    await page.locator('button:has-text("My Availability")').click();
    await expect(page.locator('button:has-text("Add Availability Slot")')).toBeVisible();
  });

  test('coach account has strictly NO student features and 0 auto-saved companies', async ({
    page,
  }) => {
    // Sign in as coach
    await page.goto('/signin');
    await page.locator('input[type="email"]').fill('coach@iskolar.ph');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();

    // Verify coach is redirected to /coach and NOT /app
    await expect(page).toHaveURL(/\/coach/);
    await expect(page.locator('h1')).toContainText(/Coach Dashboard|Mark/i);

    // 1. Attempting to visit student routes (/app, /app/saved, /app/bookings) redirects back to /coach
    await page.goto('/app');
    await expect(page).toHaveURL(/\/coach/);

    await page.goto('/app/saved');
    await expect(page).toHaveURL(/\/coach/);

    await page.goto('/app/bookings');
    await expect(page).toHaveURL(/\/coach/);

    // 2. Navbar does not expose student dashboard or student links
    await expect(page.locator('text=Student Dashboard')).not.toBeVisible();

    // 3. Internship directory does not render bookmark buttons for coach
    await page.goto('/internships');
    await expect(page.locator('button[title*="Save"]')).toHaveCount(0);

    // 4. Coaches directory does not render "Book 1-on-1" or "Book Session" buttons for coach
    await page.goto('/coaches');
    await expect(page.locator('button:has-text("Book 1-on-1")')).toHaveCount(0);
    await expect(page.locator('button:has-text("Book Session")')).toHaveCount(0);
  });

  test('coach publishes new time slot and it is immediately reflected to student in booking dialog', async ({
    page,
  }) => {
    // 1. Sign in as coach
    await page.goto('/signin');
    await page.locator('input[type="email"]').fill('coach@iskolar.ph');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/coach/);

    // 2. Open My Availability tab
    await page.locator('button:has-text("My Availability")').click();
    const addSlotBtn = page.locator('button:has-text("Add Slot")').first();
    await expect(addSlotBtn).toBeVisible();
    await addSlotBtn.click();

    // 3. Fill and publish slot
    await expect(page.locator('text=Add Mentorship Availability Slot')).toBeVisible();
    const startTimeInput = page.locator('input[type="time"]').first();
    const endTimeInput = page.locator('input[type="time"]').last();
    await startTimeInput.fill('16:00');
    await endTimeInput.fill('16:45');
    await page.locator('button[type="submit"]:has-text("Publish Slot")').click();

    // Verify success banner in Coach Portal
    await expect(page.locator('text=Availability slot successfully published')).toBeVisible();

    // 4. Sign out
    await page.locator('button[title="Sign Out"]').click();
    await expect(page).toHaveURL(/\/$/);

    // 5. Navigate to the coach's profile as a student/visitor
    await page.goto('/coaches/engr-mark-villanueva');
    await expect(page.locator('h1').first()).toContainText(/Engr. Mark Villanueva/i);

    // 6. Open Book session modal
    const bookBtn = page.locator('button:has-text("Book a Session"), button:has-text("Book 1-on-1"), button:has-text("Book This")').first();
    await expect(bookBtn).toBeVisible();
    await bookBtn.click();

    // 7. Verify modal opens and displays the coach's newly published time slot (16:00 / 4:00 PM)
    await expect(page.locator('text=Choose Available Date & Time')).toBeVisible();
    const slotOption = page.locator('button:has-text("4:00 PM"), button:has-text("16:00")').first();
    await expect(slotOption).toBeVisible();
  });
});

