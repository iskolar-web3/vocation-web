import { server } from './server.mjs';

async function runTests() {
  const baseUrl = 'http://localhost:8080';
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/healthz`);
    const health = await healthRes.json();
    assert(health.status === 'ok', 'GET /healthz returns status ok');

    // 2. Student Signup & Onboarding Flow
    const studentEmail = `student_${Date.now()}@iskolar.ph`;
    const signupStudentRes = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: studentEmail,
        password: 'password123',
        role: 'student',
        full_name: 'Juan Luna',
      }),
    });
    const signupStudentData = await signupStudentRes.json();
    const studentSessionId = signupStudentData.data.session_id;
    assert(signupStudentRes.status === 200, 'POST /auth/signup (student) returns 200');
    assert(signupStudentData.data.is_onboarded === false, 'New student account is_onboarded is initially false');

    // Verify session before onboarding
    const meBeforeRes = await fetch(`${baseUrl}/me`, {
      headers: { 'X-Session-Id': studentSessionId },
    });
    const meBeforeData = await meBeforeRes.json();
    assert(meBeforeData.data.is_onboarded === false, 'GET /me before onboarding has is_onboarded: false');

    // Complete Student Onboarding (API-030)
    const onboardStudentRes = await fetch(`${baseUrl}/me/student-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': studentSessionId,
      },
      body: JSON.stringify({
        full_name: 'Juan Novicio Luna',
        school: 'University of the Philippines Manila',
        course: 'BS Applied Physics',
        year_level: 4,
        target_ojt_hours: 350,
        skills: ['Python', 'Data Analysis', 'Problem Solving'],
      }),
    });
    const onboardStudentData = await onboardStudentRes.json();
    assert(onboardStudentRes.status === 200, 'POST /me/student-profile returns 200');
    assert(onboardStudentData.data.school === 'University of the Philippines Manila', 'Student profile has correct school');
    assert(onboardStudentData.data.target_ojt_hours === 350, 'Student profile has target_ojt_hours = 350');

    // Verify session after onboarding
    const meAfterRes = await fetch(`${baseUrl}/me`, {
      headers: { 'X-Session-Id': studentSessionId },
    });
    const meAfterData = await meAfterRes.json();
    assert(meAfterData.data.is_onboarded === true, 'GET /me after student onboarding has is_onboarded: true');
    assert(meAfterData.data.full_name === 'Juan Novicio Luna', 'GET /me after student onboarding has updated full_name');

    // 3. Coach Signup & Onboarding Flow (API-060)
    const coachEmail = `coach_${Date.now()}@iskolar.ph`;
    const signupCoachRes = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: coachEmail,
        password: 'password123',
        role: 'coach',
        full_name: 'Coach Maria Clara',
      }),
    });
    const signupCoachData = await signupCoachRes.json();
    const coachSessionId = signupCoachData.data.session_id;
    assert(signupCoachRes.status === 200, 'POST /auth/signup (coach) returns 200');
    assert(signupCoachData.data.is_onboarded === false, 'New coach account is_onboarded is initially false');

    // Complete Coach Onboarding (API-060: POST /me/coach-profile)
    const coachSlug = `coach-maria-clara-${Date.now()}`;
    const onboardCoachRes = await fetch(`${baseUrl}/me/coach-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': coachSessionId,
      },
      body: JSON.stringify({
        display_name: 'Maria Clara, Senior Fintech Recruiter',
        headline: 'Lead Talent Partner at Fintech PH · 8+ Years Coaching',
        bio: 'Passionate career mentor helping graduating Filipino students land high-paying technology and business internships.',
        experience: '8+ years leading technical and business recruitment across Metro Manila.',
        languages: ['English', 'Filipino'],
        slug: coachSlug,
        price_type: 'paid',
        skills: ['Resume Review', 'Interview Prep', 'Salary Negotiation'],
      }),
    });
    const onboardCoachData = await onboardCoachRes.json();
    assert(onboardCoachRes.status === 201, 'POST /me/coach-profile returns 201 Created');
    assert(onboardCoachData.data.slug === coachSlug, 'Coach profile has correct slug');
    assert(onboardCoachData.data.display_name === 'Maria Clara, Senior Fintech Recruiter', 'Coach profile has correct display_name');

    // Verify session after coach onboarding
    const meCoachAfterRes = await fetch(`${baseUrl}/me`, {
      headers: { 'X-Session-Id': coachSessionId },
    });
    const meCoachAfterData = await meCoachAfterRes.json();
    assert(meCoachAfterData.data.is_onboarded === true, 'GET /me after coach onboarding has is_onboarded: true');

    // 4. Edit Coach Profile (API-061: PATCH /me/coach-profile)
    const patchCoachRes = await fetch(`${baseUrl}/me/coach-profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': coachSessionId,
      },
      body: JSON.stringify({
        headline: 'Executive Talent Advisor & Career Coach',
        payout_account_number: '1234567890',
      }),
    });
    const patchCoachData = await patchCoachRes.json();
    assert(patchCoachRes.status === 200, 'PATCH /me/coach-profile returns 200');
    assert(patchCoachData.data.headline === 'Executive Talent Advisor & Career Coach', 'PATCH /me/coach-profile updated headline');
    assert(patchCoachData.data.payout_account_number_masked === '**** 7890', 'PATCH /me/coach-profile masked payout account');

    // 5. Coach Availability (API-062: GET & PUT /me/availability)
    const availGetRes = await fetch(`${baseUrl}/me/availability`, {
      headers: { 'X-Session-Id': coachSessionId },
    });
    assert(availGetRes.status === 200, 'GET /me/availability returns 200');

    const tomorrow = new Date(Date.now() + 86400000);
    const startsAt = tomorrow.toISOString();
    const endsAt = new Date(tomorrow.getTime() + 45 * 60000).toISOString();
    const availPutRes = await fetch(`${baseUrl}/me/availability`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': coachSessionId,
      },
      body: JSON.stringify({
        slots: [{ starts_at: startsAt, ends_at: endsAt }],
      }),
    });
    const availPutData = await availPutRes.json();
    assert(availPutRes.status === 200, 'PUT /me/availability returns 200');
    assert(availPutData.data.length === 1, 'PUT /me/availability saved 1 slot');

    // 6. Coach Sessions (API-063: GET /me/sessions)
    const sessionsRes = await fetch(`${baseUrl}/me/sessions?when=upcoming`, {
      headers: { 'X-Session-Id': coachSessionId },
    });
    const sessionsData = await sessionsRes.json();
    assert(sessionsRes.status === 200, 'GET /me/sessions returns 200');
    assert(Array.isArray(sessionsData.data), 'GET /me/sessions returns an array');

    // 7. Coach Earnings (API-064: GET /me/earnings)
    const earningsRes = await fetch(`${baseUrl}/me/earnings`, {
      headers: { 'X-Session-Id': coachSessionId },
    });
    const earningsData = await earningsRes.json();
    assert(earningsRes.status === 200, 'GET /me/earnings returns 200');
    assert(earningsData.meta?.balance !== undefined, 'GET /me/earnings returns balance in meta');

    // 8. Coach in Directory (GET /coaches)
    const coachesRes = await fetch(`${baseUrl}/coaches`);
    const coachesData = await coachesRes.json();
    const foundCoach = coachesData.data.find((c) => c.slug === coachSlug);
    assert(Boolean(foundCoach), 'Newly onboarded coach appears in public /coaches directory');

    console.log(`\n================================`);
    console.log(`Results: ${passed} passed, ${failed} failed`);
    console.log(`================================`);
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  }
}

runTests();
