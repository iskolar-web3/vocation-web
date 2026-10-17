import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initial Seed Fixtures
const SEED_COMPANIES = [
  {
    id: 'comp_01',
    name: 'Maya Philippines',
    slug: 'maya-philippines',
    logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200',
    banner_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1200',
    website: 'https://www.maya.ph',
    industry: 'Financial Technology',
    location: 'Mandaluyong City, Metro Manila',
    size: '1,000+ employees',
    description: 'Maya is the leading digital banking and fintech ecosystem in the Philippines, empowering millions of Filipinos and businesses with modern financial services.',
    perks: ['Hybrid Work Model', 'Competitive Monthly Allowance', 'Direct Mentorship by Senior Engineers', 'HMO on Day 1'],
    open_role_count: 1,
    verification_status: 'verified',
  },
  {
    id: 'comp_02',
    name: 'Canva Philippines',
    slug: 'canva-philippines',
    logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200',
    banner_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200',
    website: 'https://www.canva.com',
    industry: 'Technology & Design',
    location: 'BGC, Taguig City',
    size: '500-1,000 employees',
    description: 'Canva is a global visual communications platform on a mission to empower everyone in the world to design anything and publish anywhere.',
    perks: ['Free Catered Gourmet Lunches', 'Flexible Hours', 'Vibrant Office Culture', 'MacBook Provided'],
    open_role_count: 1,
    verification_status: 'verified',
  },
  {
    id: 'comp_03',
    name: 'Globe Telecom',
    slug: 'globe-telecom',
    logo_url: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&q=80&w=200',
    banner_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200',
    website: 'https://www.globe.com.ph',
    industry: 'Telecommunications',
    location: 'Taguig City, Metro Manila',
    size: '5,000+ employees',
    description: 'Globe is a leading full-service telecommunications company in the Philippines, committed to powering the Filipino digital lifestyle.',
    perks: ['OJT Allowance', 'Project Ownership', 'Networking Opportunities', 'Certificate of Completion'],
    open_role_count: 1,
    verification_status: 'verified',
  },
  {
    id: 'comp_04',
    name: 'Accenture Philippines',
    slug: 'accenture-philippines',
    logo_url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=200',
    banner_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200',
    website: 'https://www.accenture.com/ph-en',
    industry: 'Consulting & IT Services',
    location: 'Mandaluyong City, Metro Manila',
    size: '10,000+ employees',
    description: 'Accenture is a global professional services company with leading capabilities in digital, cloud, and security.',
    perks: ['Formal Internship Curriculum', 'Executive Mentors', 'Potential Full-time Return Offer'],
    open_role_count: 1,
    verification_status: 'verified',
  },
];

const SEED_INTERNSHIPS = [
  {
    id: 'int_01',
    title: 'Software Engineering Intern (Backend / Go & Node)',
    slug: 'software-engineering-intern-backend-maya',
    company: {
      name: SEED_COMPANIES[0].name,
      slug: SEED_COMPANIES[0].slug,
      logo_url: SEED_COMPANIES[0].logo_url,
      location: SEED_COMPANIES[0].location,
      industry: SEED_COMPANIES[0].industry,
    },
    field: 'Software Engineering',
    work_setup: 'hybrid',
    location: 'Mandaluyong City (Hybrid 2x/week)',
    duration_weeks: 16,
    ojt_hours: 300,
    is_paid: true,
    stipend_amount: 15000,
    stipend_period: 'month',
    status: 'open',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    external_apply_url: 'https://www.maya.ph/careers/internships',
    description: 'Join our Core Banking & Payments engineering team to design resilient microservices, scale transactional APIs, and learn modern distributed systems.',
    responsibilities: [
      'Collaborate with senior engineers to write maintainable Go and TypeScript backend services.',
      'Participate in code reviews, daily standups, and architectural sprint planning.',
      'Build integration tests and monitor service performance metrics.',
    ],
    requirements: [
      'Enrolled in BS Computer Science, Information Technology, Computer Engineering, or related degree.',
      'Familiarity with RESTful APIs, Git, and relational databases (PostgreSQL/MySQL).',
      'Strong problem-solving ability and passion for clean, readable code.',
    ],
    perks: ['₱15,000/mo allowance', 'MacBook provided', 'Meal vouchers', 'Mentorship'],
    recommended_coach_slug: 'engr-mark-villanueva',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: 'int_02',
    title: 'Product Design & UI/UX Intern',
    slug: 'product-design-ui-ux-intern-canva',
    company: {
      name: SEED_COMPANIES[1].name,
      slug: SEED_COMPANIES[1].slug,
      logo_url: SEED_COMPANIES[1].logo_url,
      location: SEED_COMPANIES[1].location,
      industry: SEED_COMPANIES[1].industry,
    },
    field: 'UI/UX Design',
    work_setup: 'hybrid',
    location: 'BGC, Taguig City',
    duration_weeks: 12,
    ojt_hours: 240,
    is_paid: true,
    stipend_amount: 18000,
    stipend_period: 'month',
    status: 'open',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 8).toISOString(),
    external_apply_url: 'https://www.canva.com/careers/students',
    description: 'Craft intuitive, accessible, and delightful product workflows for over 170 million monthly active users worldwide.',
    responsibilities: [
      'Design high-fidelity wireframes, interactive prototypes, and design specs in Figma.',
      'Conduct user interviews, usability testing, and synthesize product feedback.',
      'Collaborate closely with product managers and frontend engineers.',
    ],
    requirements: [
      'Enrolled in Multimedia Arts, Design, Fine Arts, CS, or equivalent experience.',
      'Online portfolio showcasing UI/UX case studies and user-centric problem solving.',
      'Proficiency in Figma and component-based design systems.',
    ],
    perks: ['₱18,000/mo allowance', 'Free gourmet lunch', 'Figma enterprise license'],
    recommended_coach_slug: 'bea-santos',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: 'int_03',
    title: 'Data Analyst & BI Intern',
    slug: 'data-analyst-intern-globe',
    company: {
      name: SEED_COMPANIES[2].name,
      slug: SEED_COMPANIES[2].slug,
      logo_url: SEED_COMPANIES[2].logo_url,
      location: SEED_COMPANIES[2].location,
      industry: SEED_COMPANIES[2].industry,
    },
    field: 'Data & Analytics',
    work_setup: 'remote',
    location: 'Remote (Philippines)',
    duration_weeks: 14,
    ojt_hours: 250,
    is_paid: true,
    stipend_amount: 14000,
    stipend_period: 'month',
    status: 'open',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21).toISOString(),
    external_apply_url: 'https://www.globe.com.ph/careers',
    description: 'Transform millions of telecom customer data points into actionable commercial insights and executive dashboards.',
    responsibilities: [
      'Write SQL queries to extract and clean large operational datasets.',
      'Build executive dashboards in Power BI and Tableau.',
      'Assist analytics managers in cohort retention studies and churn modeling.',
    ],
    requirements: [
      'BS Statistics, Math, Computer Science, Economics, or related fields.',
      'Solid command of SQL and Python or R for exploratory data analysis.',
      'Clear written and verbal presentation skills.',
    ],
    perks: ['₱14,000/mo allowance', 'Fully remote flexibility', 'Telco mobile data credits'],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: 'int_04',
    title: 'Cloud & DevOps Engineering Intern',
    slug: 'cloud-devops-intern-accenture',
    company: {
      name: SEED_COMPANIES[3].name,
      slug: SEED_COMPANIES[3].slug,
      logo_url: SEED_COMPANIES[3].logo_url,
      location: SEED_COMPANIES[3].location,
      industry: SEED_COMPANIES[3].industry,
    },
    field: 'Cloud & Infrastructure',
    work_setup: 'onsite',
    location: 'Mandaluyong City, Metro Manila',
    duration_weeks: 16,
    ojt_hours: 320,
    is_paid: true,
    stipend_amount: 16000,
    stipend_period: 'month',
    status: 'open',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(),
    external_apply_url: 'https://www.accenture.com/ph-en/careers',
    description: 'Work directly on enterprise cloud migrations, CI/CD deployment pipelines, and Kubernetes container management.',
    responsibilities: [
      'Write automated deployment pipelines with GitHub Actions and Terraform.',
      'Monitor container health and write Prometheus/Grafana alert rules.',
      'Assist senior architects with cloud security audits.',
    ],
    requirements: [
      'BS Computer Engineering, Computer Science, or IT.',
      'Basic familiarity with Linux command line, Docker containers, and Git.',
      'Strong curiosity about cloud computing (AWS, Azure, GCP).',
    ],
    perks: ['₱16,000/mo allowance', 'Accenture certified learning credits', 'OJT certificate'],
    recommended_coach_slug: 'engr-mark-villanueva',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
];

const SEED_COACHES = [
  {
    id: 'coach_01',
    name: 'Engr. Mark Villanueva',
    display_name: 'Engr. Mark Villanueva',
    slug: 'engr-mark-villanueva',
    headline: 'Senior Staff Software Engineer at Grab · Ex-Shopee · Top Career Coach',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    current_role: 'Senior Staff Engineer',
    company: 'Grab Philippines',
    location: 'Metro Manila / Remote',
    bio: 'Over 9 years of engineering experience across Southeast Asia unicorn tech companies. Mentored 120+ Filipino students and career shifters into junior & mid-level engineering roles with a 90% placement rate.',
    expertise: ['Technical Coding Interviews', 'System Design', 'Backend Engineering', 'Resume Review'],
    experience_years: 9,
    rating: 4.95,
    review_count: 48,
    starting_price_centavos: 0,
    session_types: [
      {
        id: 'srv_01',
        name: 'Free 15-Min Career & OJT Discovery',
        duration_minutes: 15,
        price_centavos: 0,
        description: 'Quick roadmap alignment, OJT goal setting, and deciding which career tracks fit your strengths.',
        badge: 'Free Intro',
      },
      {
        id: 'srv_02',
        name: 'Full 1-on-1 Technical Mock Interview',
        duration_minutes: 45,
        price_centavos: 150000,
        description: 'Comprehensive 45-minute live coding session, data structures question, and detailed written evaluation.',
      },
    ],
  },
  {
    id: 'coach_02',
    name: 'Bea Santos, Product Designer',
    display_name: 'Bea Santos',
    slug: 'bea-santos',
    headline: 'Lead Product Designer at Canva · Design Mentor',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    current_role: 'Lead Product Designer',
    company: 'Canva',
    location: 'Taguig City / Remote',
    bio: 'Passionate about shaping the next generation of Filipino product designers. I help design students articulate their design thinking, build standout case studies, and ace whiteboarding interviews.',
    expertise: ['UI/UX Design', 'Portfolio Review', 'Design Systems', 'Design Challenge Prep'],
    experience_years: 7,
    rating: 4.9,
    review_count: 36,
    starting_price_centavos: 0,
    session_types: [
      {
        id: 'srv_04',
        name: 'Free 15-Min Portfolio Diagnostic',
        duration_minutes: 15,
        price_centavos: 0,
        description: 'High-level evaluation of your case studies and identifying your biggest improvement areas.',
        badge: 'Free Intro',
      },
    ],
  },
];

const SEED_REVIEWS = {
  'engr-mark-villanueva': [
    {
      id: 'rev_01',
      coach_slug: 'engr-mark-villanueva',
      student_first_name: 'Clarisse',
      rating: 5,
      comment: 'Kuya Mark helped me prepare for my technical interview at Maya. His actionable feedback on data structures and how to explain thought processes gave me huge confidence!',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      session_type_name: 'Full 1-on-1 Technical Mock Interview',
    },
  ],
};

function getInitialDB() {
  return {
    accounts: {
      'student@iskolar.ph': {
        id: 'usr_student_01',
        email: 'student@iskolar.ph',
        password: 'password123',
        full_name: 'Clarisse Salazar',
        role: 'student',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        is_onboarded: true,
      },
      'coach@iskolar.ph': {
        id: 'usr_coach_01',
        email: 'coach@iskolar.ph',
        password: 'password123',
        full_name: 'Engr. Mark Villanueva',
        role: 'coach',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
        is_onboarded: true,
      },
      'admin@iskolar.ph': {
        id: 'usr_admin_01',
        email: 'admin@iskolar.ph',
        password: 'password123',
        full_name: 'Platform Moderator',
        role: 'admin',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
        is_onboarded: true,
      },
    },
    sessions: {},
    student_profiles: {
      'student@iskolar.ph': {
        full_name: 'Clarisse Salazar',
        email: 'student@iskolar.ph',
        school: 'University of the Philippines Diliman',
        course: 'BS Computer Science',
        year_level: 4,
        target_ojt_hours: 300,
        completed_ojt_hours: 180,
        skills: ['React', 'TypeScript', 'Node.js', 'Go', 'PostgreSQL', 'Git'],
        bio: 'Aspiring software engineer passionate about web systems and cloud development.',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        completeness_pct: 85,
      },
    },
    settings: {
      'student@iskolar.ph': {
        email: 'student@iskolar.ph',
        notification_preference: {
          channel_email: true,
          topic_bookings: true,
          topic_internships: true,
        },
      },
    },
    saved_internships: {},
    coach_profiles: {
      'coach@iskolar.ph': {
        slug: 'engr-mark-villanueva',
        display_name: 'Engr. Mark Villanueva',
        headline: 'Senior Staff Software Engineer at Grab · Ex-Shopee · Top Career Coach',
        bio: 'Over 9 years of engineering experience across Southeast Asia unicorn tech companies. Mentored 120+ Filipino students and career shifters into junior & mid-level engineering roles with a 90% placement rate.',
        experience: '9+ years staff software engineer at Grab, Shopee, Voyager Innovations.',
        languages: ['English', 'Filipino'],
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
        price_type: 'paid',
        expertise: ['Technical Coding Interviews', 'System Design', 'Backend Engineering', 'Resume Review'],
        skills: ['Technical Coding Interviews', 'System Design', 'Backend Engineering', 'Resume Review'],
        session_types: SEED_COACHES[0].session_types,
        rating_avg: 4.95,
        rating_count: 48,
        default_join_url: 'https://meet.google.com/abc-defg-hij',
        payout_channel_code: 'BDO',
        payout_account_number_masked: '**** 1234',
        payout_account_holder_name: 'Mark Villanueva',
      },
    },
    coach_availability: {},
    bookings: [
      {
        booking_id: 'bkg_demo_01',
        student_email: 'student@iskolar.ph',
        student_display_name: 'Clarisse Salazar',
        coach_slug: 'engr-mark-villanueva',
        coach_display_name: 'Engr. Mark Villanueva',
        slot_starts_at: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
        slot_ends_at: new Date(Date.now() + 1000 * 60 * 60 * 24 + 45 * 60000).toISOString(),
        status: 'confirmed',
        payment_status: 'paid',
        price_centavos: 0,
        join_url: 'https://meet.google.com/abc-defg-hij',
      },
    ],
    internships: SEED_INTERNSHIPS,
    companies: SEED_COMPANIES,
    coaches: SEED_COACHES,
    reviews: SEED_REVIEWS,
  };
}

let db = getInitialDB();

function saveDB() {
  // Persistence maintained directly in backend API runtime
}

// Helper to parse cookies
function parseCookies(req) {
  const list = {};
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach((cookie) => {
    let [name, ...rest] = cookie.split('=');
    name = name?.trim();
    if (!name) return;
    const value = rest.join('=').trim();
    list[name] = decodeURIComponent(value);
  });
  return list;
}

// Helper to authenticate request
function getAuthUser(req) {
  const cookies = parseCookies(req);
  const sessionId = req.headers['x-session-id'] || cookies.session_id;
  if (sessionId && db.sessions[sessionId]) {
    const email = db.sessions[sessionId];
    return db.accounts[email] || null;
  }
  return null;
}

// Generate dynamic 7-day UTC slots for availability
function generateAvailabilitySlots() {
  const slots = [];
  const now = new Date();
  for (let d = 1; d <= 7; d++) {
    const dayDate = new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
    const slot1Start = new Date(Date.UTC(dayDate.getUTCFullYear(), dayDate.getUTCMonth(), dayDate.getUTCDate(), 2, 0, 0));
    const slot1End = new Date(slot1Start.getTime() + 45 * 60000);
    const slot2Start = new Date(Date.UTC(dayDate.getUTCFullYear(), dayDate.getUTCMonth(), dayDate.getUTCDate(), 7, 0, 0));
    const slot2End = new Date(slot2Start.getTime() + 45 * 60000);
    slots.push(
      { id: `slot_${d}_1`, starts_at: slot1Start.toISOString(), ends_at: slot1End.toISOString() },
      { id: `slot_${d}_2`, starts_at: slot2Start.toISOString(), ends_at: slot2End.toISOString() }
    );
  }
  return slots;
}

// Create HTTP server on port 8080
export const server = http.createServer(async (req, res) => {
  // CORS
  const origin = req.headers.origin || 'http://localhost:5173';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Session-Id');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Parse URL & Query
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost:8080'}`);
  const cleanPath = parsedUrl.pathname.replace(/^\/v1/, '').replace(/^\//, '');
  const method = req.method;

  // Read Body
  let body = {};
  if (method === 'POST' || method === 'PATCH' || method === 'PUT') {
    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const raw = Buffer.concat(chunks).toString();
      if (raw) body = JSON.parse(raw);
    } catch {
      body = {};
    }
  }

  const sendJson = (statusCode, data, message = 'ok', meta = undefined) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    const payload = { message, data };
    if (meta) payload.meta = meta;
    res.end(JSON.stringify(payload));
  };

  const sendError = (statusCode, message, code = 'error') => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message, error: { code } }));
  };

  try {
    // Health Check
    if (cleanPath === 'healthz') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
      return;
    }

    // 1. Auth & Session Routes
    if (cleanPath === 'me' && method === 'GET') {
      const user = getAuthUser(req);
      if (!user) {
        sendError(401, 'Not authenticated', 'unauthenticated');
        return;
      }
      sendJson(200, user, 'Authenticated');
      return;
    }

    if (cleanPath === 'auth/signin' && method === 'POST') {
      const email = (body?.email || 'student@iskolar.ph').trim().toLowerCase();
      let account = db.accounts[email];

      if (!account) {
        const isCoach = email.includes('coach');
        const isAdmin = email.includes('admin');
        const role = isAdmin ? 'admin' : isCoach ? 'coach' : 'student';
        account = {
          id: `usr_${role}_${Date.now()}`,
          email,
          password: body?.password || 'password123',
          full_name: role === 'student' ? 'Clarisse Salazar' : role === 'coach' ? 'Engr. Mark Villanueva' : 'Platform Moderator',
          role,
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
          is_onboarded: true,
        };
        db.accounts[email] = account;
        saveDB();
      } else {
        if (account.password && body?.password && account.password !== body.password) {
          sendError(401, 'Incorrect email or password. Please verify your credentials.', 'invalid_credentials');
          return;
        }
      }

      const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      db.sessions[sessionId] = email;
      saveDB();

      res.setHeader('Set-Cookie', `session_id=${sessionId}; Path=/; HttpOnly; SameSite=Lax`);
      sendJson(200, { ...account, session_id: sessionId }, 'Signed in successfully');
      return;
    }

    if (cleanPath === 'auth/signup' && method === 'POST') {
      const role = body?.role || 'student';
      const email = (body?.email || 'newstudent@iskolar.ph').trim().toLowerCase();
      const fullName = body?.full_name || (role === 'coach' ? 'Industry Mentor' : 'New iSkolar Student');

      const account = {
        id: `usr_${role}_${Date.now()}`,
        email,
        password: body?.password || 'password123',
        full_name: fullName,
        role,
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        is_onboarded: false,
      };
      db.accounts[email] = account;

      if (role === 'student') {
        db.student_profiles[email] = {
          full_name: fullName,
          email,
          school: '',
          course: '',
          year_level: 3,
          target_ojt_hours: Number(body?.target_ojt_hours) || 300,
          completed_ojt_hours: 0,
          skills: body?.skills || ['React', 'TypeScript'],
          bio: '',
          avatar_url: account.avatar_url,
          completeness_pct: 40,
        };
        db.saved_internships[email] = [];
      }

      const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      db.sessions[sessionId] = email;
      saveDB();

      res.setHeader('Set-Cookie', `session_id=${sessionId}; Path=/; HttpOnly; SameSite=Lax`);
      sendJson(200, { ...account, session_id: sessionId }, 'Account created successfully');
      return;
    }

    if (cleanPath === 'auth/signout' && method === 'POST') {
      const cookies = parseCookies(req);
      const reqSessionId = req.headers['x-session-id'] || cookies.session_id;
      if (reqSessionId && db.sessions[reqSessionId]) {
        delete db.sessions[reqSessionId];
        saveDB();
      }
      res.setHeader('Set-Cookie', 'session_id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
      sendJson(200, null, 'Signed out successfully');
      return;
    }

    // 2. Student Profile & Settings
    if (cleanPath === 'me/student-profile' && method === 'GET') {
      const user = getAuthUser(req) || db.accounts['student@iskolar.ph'];
      if (!user || user.role !== 'student') {
        sendJson(404, null, 'Student profile not found');
        return;
      }
      const email = user.email;
      const profile = db.student_profiles[email] || {
        full_name: user?.full_name || 'Clarisse Salazar',
        email,
        school: 'University of the Philippines Diliman',
        course: 'BS Computer Science',
        year_level: 4,
        target_ojt_hours: 300,
        completed_ojt_hours: 180,
        skills: ['React', 'TypeScript', 'Node.js', 'Go'],
        bio: 'Aspiring software engineer passionate about web systems.',
        avatar_url: user?.avatar_url,
        completeness_pct: 85,
      };
      sendJson(200, profile);
      return;
    }

    if (cleanPath === 'me/student-profile' && (method === 'PATCH' || method === 'POST')) {
      const user = getAuthUser(req) || db.accounts['student@iskolar.ph'];
      if (!user || user.role !== 'student') {
        sendJson(403, null, 'Only student accounts can create or update a student profile');
        return;
      }
      const email = user.email;
      const current = db.student_profiles[email] || {};
      const updated = {
        ...current,
        ...body,
        target_ojt_hours: body?.target_ojt_hours !== undefined ? Number(body.target_ojt_hours) : (current.target_ojt_hours || 300),
        completed_ojt_hours: body?.completed_ojt_hours !== undefined ? Number(body.completed_ojt_hours) : (current.completed_ojt_hours || 180),
        completeness_pct: 100,
      };
      db.student_profiles[email] = updated;

      if (db.accounts[email]) {
        if (body?.full_name) {
          db.accounts[email].full_name = body.full_name;
        }
        db.accounts[email].is_onboarded = true;
      }
      saveDB();

      sendJson(200, updated, 'Profile updated');
      return;
    }

    if (cleanPath === 'me/settings' && method === 'GET') {
      const user = getAuthUser(req) || db.accounts['student@iskolar.ph'];
      const email = user?.email || 'student@iskolar.ph';
      sendJson(200, db.settings[email] || { email_notifications: true });
      return;
    }

    if (cleanPath === 'me/settings' && method === 'PATCH') {
      const user = getAuthUser(req) || db.accounts['student@iskolar.ph'];
      const email = user?.email || 'student@iskolar.ph';

      if (body?.password && db.accounts[email]) {
        db.accounts[email].password = body.password;
      }

      if (body?.email && body.email.toLowerCase() !== email) {
        const newEmail = body.email.toLowerCase();
        if (db.accounts[email]) {
          db.accounts[newEmail] = { ...db.accounts[email], email: newEmail };
          delete db.accounts[email];
        }
        if (db.student_profiles[email]) {
          db.student_profiles[newEmail] = { ...db.student_profiles[email], email: newEmail };
          delete db.student_profiles[email];
        }
      }

      const current = db.settings[email] || {};
      const updated = { ...current, ...body };
      db.settings[email] = updated;
      saveDB();

      sendJson(200, updated, 'Settings saved');
      return;
    }

    // 3. Saved Internships
    if (cleanPath === 'me/saved' && method === 'GET') {
      const user = getAuthUser(req);
      if (!user || user.role !== 'student') {
        sendJson(200, []);
        return;
      }
      const email = user.email;
      const savedIds = db.saved_internships[email] || [];
      const saved = db.internships.filter((i) => savedIds.includes(i.id));
      sendJson(200, saved);
      return;
    }

    if (cleanPath.startsWith('me/saved/') && method === 'PUT') {
      const user = getAuthUser(req);
      if (!user || user.role !== 'student') {
        sendJson(403, null, 'Only students can bookmark internships');
        return;
      }
      const id = cleanPath.replace('me/saved/', '');
      const email = user.email;
      const current = db.saved_internships[email] || [];
      if (!current.includes(id)) {
        db.saved_internships[email] = [...current, id];
        saveDB();
      }
      sendJson(200, { saved: true }, 'Internship saved to bookmarks');
      return;
    }

    if (cleanPath.startsWith('me/saved/') && method === 'DELETE') {
      const user = getAuthUser(req);
      if (!user || user.role !== 'student') {
        sendJson(403, null, 'Only students can unsave internships');
        return;
      }
      const id = cleanPath.replace('me/saved/', '');
      const email = user.email;
      const current = db.saved_internships[email] || [];
      db.saved_internships[email] = current.filter((x) => x !== id);
      saveDB();
      sendJson(200, { saved: false }, 'Internship removed from bookmarks');
      return;
    }

    // 4. Student Dashboard
    if (cleanPath === 'me/dashboard' && method === 'GET') {
      const user = getAuthUser(req);
      if (!user || user.role !== 'student') {
        sendJson(403, null, 'Student dashboard is restricted to student accounts');
        return;
      }
      const email = user.email;
      const savedIds = db.saved_internships[email] || [];
      const userBookings = db.bookings.filter((b) => b.student_email === email);
      const now = Date.now();
      const upcomingSessions = userBookings.filter((b) => {
        const isNotCancelledOrCompleted = b.status !== 'cancelled' && b.status !== 'completed';
        const sessionEndTime = new Date(b.slot_ends_at || b.slot_starts_at).getTime();
        return isNotCancelledOrCompleted && sessionEndTime >= now;
      });
      const profile = db.student_profiles[email] || {};

      sendJson(200, {
        saved_count: savedIds.length,
        upcoming_sessions_count: upcomingSessions.length,
        completeness_pct: profile?.completeness_pct || 85,
      });
      return;
    }

    // 5. Bookings
    if (cleanPath === 'me/bookings' && method === 'GET') {
      const user = getAuthUser(req);
      if (!user || user.role !== 'student') {
        sendJson(200, []);
        return;
      }
      const email = user.email;
      const userBookings = db.bookings.filter((b) => b.student_email === email);
      const when = parsedUrl.searchParams.get('when');
      const now = Date.now();

      let filtered = userBookings;
      if (when === 'upcoming') {
        filtered = userBookings.filter((b) => {
          const isNotCancelledOrCompleted = b.status !== 'cancelled' && b.status !== 'completed';
          const sessionEndTime = new Date(b.slot_ends_at || b.slot_starts_at).getTime();
          return isNotCancelledOrCompleted && sessionEndTime >= now;
        });
      } else if (when === 'past') {
        filtered = userBookings.filter((b) => {
          const isCancelledOrCompleted = b.status === 'cancelled' || b.status === 'completed';
          const sessionEndTime = new Date(b.slot_ends_at || b.slot_starts_at).getTime();
          return isCancelledOrCompleted || sessionEndTime < now;
        });
      }

      sendJson(200, filtered);
      return;
    }

    if (cleanPath === 'bookings' && method === 'POST') {
      const user = getAuthUser(req);
      if (!user || user.role !== 'student') {
        sendJson(403, null, 'Coach accounts cannot book mentorship sessions. Only students can book.');
        return;
      }
      const email = user.email;
      const coach = db.coaches.find((c) => c.slug === body?.coach_slug) || db.coaches[0];
      const sessionType = coach?.session_types?.find((s) => s.id === body?.session_type_id) || coach?.session_types?.[0];
      const isFree = (sessionType?.price_centavos || 0) === 0;
      const bookingId = `bkg_${Date.now()}`;
      const slotStartsAt = body?.slot_starts_at || new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString();
      const slotEndsAt = new Date(new Date(slotStartsAt).getTime() + (sessionType?.duration_minutes || 45) * 60000).toISOString();

      const newBooking = {
        booking_id: bookingId,
        student_email: email,
        coach_slug: coach.slug,
        coach_display_name: coach.display_name || coach.name,
        slot_starts_at: slotStartsAt,
        slot_ends_at: slotEndsAt,
        status: isFree ? 'confirmed' : 'pending',
        payment_status: isFree ? 'paid' : 'pending',
        price_centavos: sessionType?.price_centavos || 0,
        amount_due_centavos: isFree ? undefined : (sessionType?.price_centavos || 0),
        join_url: isFree ? 'https://meet.google.com/abc-defg-hij' : undefined,
      };

      db.bookings.unshift(newBooking);

      // Reflect booked slot in coach availability
      if (coach?.slug) {
        if (!db.coach_availability[coach.slug]) {
          db.coach_availability[coach.slug] = generateAvailabilitySlots();
        }
        const matchedSlot = db.coach_availability[coach.slug].find((s) => s.starts_at === slotStartsAt);
        if (matchedSlot) {
          matchedSlot.is_booked = true;
        }
      }
      saveDB();

      const resData = {
        booking_id: bookingId,
        status: newBooking.status,
        payment_status: newBooking.payment_status === 'paid' ? 'none' : 'pending',
        price_centavos: newBooking.price_centavos,
        platform_fee_centavos: isFree ? 0 : Math.round(newBooking.price_centavos * 0.1),
        coach_payout_centavos: isFree ? 0 : Math.round(newBooking.price_centavos * 0.9),
        checkout_url: isFree ? undefined : `/checkout/success?booking_id=${bookingId}`,
      };

      sendJson(200, resData, 'Booking created');
      return;
    }

    if (cleanPath.startsWith('bookings/') && cleanPath.endsWith('/cancel') && method === 'POST') {
      const bookingId = cleanPath.replace('bookings/', '').replace('/cancel', '');
      const target = db.bookings.find((b) => b.booking_id === bookingId);
      if (target) {
        target.status = 'cancelled';
        // Release slot back to available
        if (target.coach_slug && target.slot_starts_at && db.coach_availability[target.coach_slug]) {
          const matchedSlot = db.coach_availability[target.coach_slug].find((s) => s.starts_at === target.slot_starts_at);
          if (matchedSlot) {
            matchedSlot.is_booked = false;
          }
        }
        saveDB();
      }
      sendJson(200, target || { booking_id: bookingId, status: 'cancelled' }, 'Booking cancelled successfully');
      return;
    }

    if (cleanPath.startsWith('bookings/') && (cleanPath.endsWith('/checkout') || cleanPath.endsWith('/resume-checkout')) && method === 'POST') {
      const bookingId = cleanPath.replace('bookings/', '').replace('/resume-checkout', '').replace('/checkout', '');
      sendJson(200, { checkout_url: `/checkout/success?booking_id=${bookingId}` }, 'Checkout resumed');
      return;
    }

    // 5.1 Coach Self-Service Routes (API-060, API-061, API-062, API-063, API-064, API-067)
    if (cleanPath === 'me/coach-profile' && method === 'POST') {
      const user = getAuthUser(req) || db.accounts['coach@iskolar.ph'];
      const email = user?.email || 'coach@iskolar.ph';
      const displayName = (body?.display_name || user?.full_name || 'Coach').trim();
      const slug = (body?.slug || displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).trim();
      const skills = body?.skills || ['Career Guidance', 'Resume Review'];

      const newProfile = {
        slug,
        display_name: displayName,
        headline: body?.headline || 'Industry Career Coach & Mentor',
        bio: body?.bio || '',
        experience: body?.experience || null,
        languages: body?.languages || ['English', 'Filipino'],
        avatar_url: user?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
        price_type: body?.price_type || 'paid',
        expertise: skills,
        skills,
        session_types: [
          {
            id: `srv_${Date.now()}_1`,
            name: 'Free 15-Min Career & OJT Discovery',
            duration_minutes: 15,
            price_centavos: 0,
            is_intro_call: true,
          },
          {
            id: `srv_${Date.now()}_2`,
            name: '1-on-1 Mentorship & Coaching Session',
            duration_minutes: 45,
            price_centavos: body?.price_type === 'free' ? 0 : 100000,
            is_intro_call: false,
          },
        ],
        rating_avg: 5.0,
        rating_count: 0,
        default_join_url: 'https://meet.google.com/abc-defg-hij',
      };

      db.coach_profiles[email] = newProfile;

      // Add or update in db.coaches
      const existingIdx = db.coaches.findIndex((c) => c.slug === slug || c.id === slug);
      const coachCard = {
        id: `coach_${Date.now()}`,
        name: displayName,
        display_name: displayName,
        slug,
        headline: newProfile.headline,
        avatar_url: newProfile.avatar_url,
        current_role: newProfile.headline.split('·')[0].trim(),
        company: 'Independent Coach',
        location: 'Metro Manila / Remote',
        bio: newProfile.bio,
        expertise: skills,
        experience_years: 5,
        rating: 5.0,
        review_count: 0,
        starting_price_centavos: newProfile.session_types[0]?.price_centavos || 0,
        session_types: newProfile.session_types,
      };

      if (existingIdx >= 0) {
        db.coaches[existingIdx] = { ...db.coaches[existingIdx], ...coachCard };
      } else {
        db.coaches.push(coachCard);
      }

      if (db.accounts[email]) {
        db.accounts[email].full_name = displayName;
        db.accounts[email].is_onboarded = true;
      }

      saveDB();
      sendJson(201, newProfile, 'Coach profile created');
      return;
    }

    if (cleanPath === 'me/coach-profile' && method === 'PATCH') {
      const user = getAuthUser(req) || db.accounts['coach@iskolar.ph'];
      const email = user?.email || 'coach@iskolar.ph';
      const current = db.coach_profiles[email] || db.coach_profiles['coach@iskolar.ph'] || {};
      const updated = {
        ...current,
        ...body,
        expertise: body?.skills || current?.expertise || [],
        payout_account_number_masked: body?.payout_account_number ? `**** ${body.payout_account_number.slice(-4)}` : current?.payout_account_number_masked,
      };
      db.coach_profiles[email] = updated;

      if (body?.display_name && db.accounts[email]) {
        db.accounts[email].full_name = body.display_name;
      }

      const coachIdx = db.coaches.findIndex((c) => c.slug === updated.slug);
      if (coachIdx >= 0) {
        db.coaches[coachIdx] = {
          ...db.coaches[coachIdx],
          display_name: updated.display_name,
          name: updated.display_name,
          headline: updated.headline,
          bio: updated.bio,
          expertise: updated.expertise,
        };
      }

      saveDB();
      sendJson(200, updated, 'Coach profile updated');
      return;
    }

    if (cleanPath === 'me/coach-profile' && method === 'GET') {
      const user = getAuthUser(req) || db.accounts['coach@iskolar.ph'];
      const email = user?.email || 'coach@iskolar.ph';
      const profile = db.coach_profiles[email] || db.coach_profiles['coach@iskolar.ph'];
      sendJson(200, profile);
      return;
    }

    if (cleanPath === 'me/availability' && method === 'GET') {
      const user = getAuthUser(req) || db.accounts['coach@iskolar.ph'];
      const email = user?.email || 'coach@iskolar.ph';
      const profile = db.coach_profiles[email] || db.coach_profiles['coach@iskolar.ph'];
      const slug = profile?.slug || 'engr-mark-villanueva';
      if (!db.coach_availability[slug]) {
        db.coach_availability[slug] = generateAvailabilitySlots();
      }
      const slots = db.coach_availability[slug];
      sendJson(200, slots, 'ok', { total: slots.length });
      return;
    }

    if (cleanPath === 'me/availability' && method === 'PUT') {
      const user = getAuthUser(req) || db.accounts['coach@iskolar.ph'];
      const email = user?.email || 'coach@iskolar.ph';
      const profile = db.coach_profiles[email] || db.coach_profiles['coach@iskolar.ph'];
      const slug = profile?.slug || 'engr-mark-villanueva';
      const inputSlots = (body?.slots || []).map((s, idx) => ({
        id: s.id || `slot_custom_${Date.now()}_${idx}`,
        starts_at: s.starts_at,
        ends_at: s.ends_at,
        is_booked: Boolean(s.is_booked),
      }));
      db.coach_availability[slug] = inputSlots;
      saveDB();
      sendJson(200, inputSlots, 'Availability updated', { total: inputSlots.length });
      return;
    }

    if (cleanPath === 'me/sessions' && method === 'GET') {
      const user = getAuthUser(req) || db.accounts['coach@iskolar.ph'];
      const email = user?.email || 'coach@iskolar.ph';
      const profile = db.coach_profiles[email] || db.coach_profiles['coach@iskolar.ph'];
      const slug = profile?.slug || 'engr-mark-villanueva';
      const when = parsedUrl.searchParams.get('when') || 'upcoming';
      const now = Date.now();

      const coachBookings = db.bookings.filter((b) => b.coach_slug === slug);
      let filtered = coachBookings;
      if (when === 'upcoming') {
        filtered = coachBookings.filter((b) => {
          const isNotCancelledOrCompleted = b.status !== 'cancelled' && b.status !== 'completed';
          const sessionEndTime = new Date(b.slot_ends_at || b.slot_starts_at).getTime();
          return isNotCancelledOrCompleted && sessionEndTime >= now;
        });
      } else if (when === 'past') {
        filtered = coachBookings.filter((b) => {
          const isCancelledOrCompleted = b.status === 'cancelled' || b.status === 'completed';
          const sessionEndTime = new Date(b.slot_ends_at || b.slot_starts_at).getTime();
          return isCancelledOrCompleted || sessionEndTime < now;
        });
      }

      const formatted = filtered.map((b) => ({
        id: b.booking_id,
        booking_id: b.booking_id,
        student_display_name: b.student_display_name || 'Clarisse Salazar',
        student_email: b.student_email || 'student@iskolar.ph',
        slot_starts_at: b.slot_starts_at,
        slot_ends_at: b.slot_ends_at,
        status: b.status,
        payment_status: b.payment_status,
        price_centavos: b.price_centavos,
        join_url: b.join_url || 'https://meet.google.com/abc-defg-hij',
      }));

      sendJson(200, formatted, 'ok', { total: formatted.length });
      return;
    }

    if (cleanPath === 'me/earnings' && method === 'GET') {
      const user = getAuthUser(req) || db.accounts['coach@iskolar.ph'];
      const email = user?.email || 'coach@iskolar.ph';
      const profile = db.coach_profiles[email] || db.coach_profiles['coach@iskolar.ph'];
      const slug = profile?.slug || 'engr-mark-villanueva';

      const coachBookings = db.bookings.filter((b) => b.coach_slug === slug);
      const items = coachBookings.map((b) => ({
        id: `earn_${b.booking_id}`,
        booking_id: b.booking_id,
        price_centavos: b.price_centavos,
        platform_fee_centavos: Math.round(b.price_centavos * 0.1),
        coach_payout_centavos: Math.round(b.price_centavos * 0.9),
        payment_status: b.payment_status,
        slot_starts_at: b.slot_starts_at,
        created_at: b.slot_starts_at,
      }));

      const totalPaidCentavos = items
        .filter((i) => i.payment_status === 'paid')
        .reduce((sum, i) => sum + i.coach_payout_centavos, 0);

      sendJson(200, items, 'ok', {
        balance: {
          available_centavos: totalPaidCentavos,
          in_transit_centavos: 0,
          paid_out_centavos: 0,
          pending_centavos: 0,
        },
      });
      return;
    }

    if (cleanPath === 'me/session-types' && method === 'GET') {
      const user = getAuthUser(req) || db.accounts['coach@iskolar.ph'];
      const email = user?.email || 'coach@iskolar.ph';
      const profile = db.coach_profiles[email] || db.coach_profiles['coach@iskolar.ph'];
      sendJson(200, profile?.session_types || []);
      return;
    }

    if (cleanPath === 'me/session-types' && method === 'POST') {
      const user = getAuthUser(req) || db.accounts['coach@iskolar.ph'];
      const email = user?.email || 'coach@iskolar.ph';
      const profile = db.coach_profiles[email] || db.coach_profiles['coach@iskolar.ph'];
      const newType = {
        id: `srv_${Date.now()}`,
        name: body?.name || 'New Mentorship Session',
        duration_minutes: Number(body?.duration_minutes) || 45,
        price_centavos: Number(body?.price_centavos) || 0,
        is_intro_call: Boolean(body?.is_intro_call),
      };
      if (!profile.session_types) profile.session_types = [];
      profile.session_types.push(newType);
      saveDB();
      sendJson(201, newType, 'Session type created');
      return;
    }

    // 6. Directory Routes: Internships, Companies, Coaches
    if (cleanPath === 'internships' && method === 'GET') {
      let filtered = db.internships.filter((i) => i.status === 'open');
      const q = parsedUrl.searchParams.get('q');
      const field = parsedUrl.searchParams.get('field');
      const setup = parsedUrl.searchParams.get('setup');
      const pay = parsedUrl.searchParams.get('pay');

      if (q) {
        const qLower = q.toLowerCase();
        filtered = filtered.filter((i) => i.title.toLowerCase().includes(qLower) || i.field.toLowerCase().includes(qLower) || i.company.name.toLowerCase().includes(qLower));
      }
      if (field && field !== 'all') {
        filtered = filtered.filter((i) => i.field.toLowerCase() === field.toLowerCase());
      }
      if (setup && setup !== 'all') {
        filtered = filtered.filter((i) => i.work_setup === setup);
      }
      if (pay === 'paid') {
        filtered = filtered.filter((i) => i.is_paid);
      } else if (pay === 'unpaid') {
        filtered = filtered.filter((i) => !i.is_paid);
      }

      sendJson(200, filtered, 'ok', { page: 1, per_page: 20, total: filtered.length });
      return;
    }

    if (cleanPath.startsWith('internships/') && method === 'GET') {
      const slug = cleanPath.replace('internships/', '');
      const item = db.internships.find((i) => i.slug === slug || i.id === slug);
      if (!item) {
        sendError(404, 'Internship not found');
        return;
      }
      sendJson(200, item);
      return;
    }

    if (cleanPath.includes('/apply-click') && method === 'POST') {
      sendJson(200, { recorded: true }, 'Apply click recorded');
      return;
    }

    if (cleanPath === 'companies' && method === 'GET') {
      const cards = db.companies.map((c) => ({
        ...c,
        open_role_count: db.internships.filter((i) => i.company?.slug === c.slug && i.status === 'open').length,
      }));
      sendJson(200, cards, 'ok', { page: 1, per_page: 20, total: cards.length });
      return;
    }

    if (cleanPath.startsWith('companies/') && method === 'GET') {
      const slug = cleanPath.replace('companies/', '');
      const company = db.companies.find((c) => c.slug === slug || c.id === slug);
      if (!company) {
        sendError(404, 'Company not found');
        return;
      }
      const withRoles = {
        ...company,
        open_internships: db.internships.filter((i) => i.company?.slug === company.slug && i.status === 'open'),
      };
      sendJson(200, withRoles);
      return;
    }

    if (cleanPath === 'coaches' && method === 'GET') {
      sendJson(200, db.coaches, 'ok', { page: 1, per_page: 20, total: db.coaches.length });
      return;
    }

    if (cleanPath.endsWith('/reviews') && cleanPath.startsWith('coaches/') && method === 'GET') {
      const slug = cleanPath.replace('coaches/', '').replace('/reviews', '');
      sendJson(200, db.reviews[slug] || []);
      return;
    }

    if (cleanPath.endsWith('/availability') && cleanPath.startsWith('coaches/') && method === 'GET') {
      const slug = cleanPath.replace('coaches/', '').replace('/availability', '');
      if (!db.coach_availability[slug]) {
        db.coach_availability[slug] = generateAvailabilitySlots();
      }
      const slots = db.coach_availability[slug] || [];
      const unbookedSlots = slots.filter((s) => !s.is_booked);

      const fromParam = parsedUrl.searchParams.get('from');
      const toParam = parsedUrl.searchParams.get('to');
      let filtered = unbookedSlots;
      if (fromParam) {
        const fromDate = new Date(fromParam);
        if (!isNaN(fromDate.getTime())) {
          filtered = filtered.filter((s) => new Date(s.ends_at || s.starts_at) >= fromDate);
        }
      }
      if (toParam) {
        const toDate = new Date(toParam);
        if (!isNaN(toDate.getTime())) {
          filtered = filtered.filter((s) => new Date(s.starts_at) <= toDate);
        }
      }

      sendJson(200, filtered, 'ok', { total: filtered.length });
      return;
    }

    if (cleanPath.startsWith('coaches/') && method === 'GET') {
      const slug = cleanPath.replace('coaches/', '');
      const coach = db.coaches.find((c) => c.slug === slug || c.id === slug);
      if (!coach) {
        sendError(404, 'Coach not found');
        return;
      }
      sendJson(200, coach);
      return;
    }

    if (cleanPath === 'landing' && method === 'GET') {
      sendJson(200, {
        featured_internships: db.internships.slice(0, 4),
        featured_coaches: db.coaches.slice(0, 3).map((c) => ({
          slug: c.slug,
          display_name: c.display_name || c.name,
          headline: c.headline,
          avatar_url: c.avatar_url,
          price_type: c.session_types?.some((s) => s.price_centavos === 0) ? 'free' : 'paid',
          expertise: c.expertise || [],
          rating_avg: c.rating,
          rating_count: c.review_count,
        })),
      });
      return;
    }

    // Default 404
    sendError(404, `Endpoint ${req.url} not found`);
  } catch (err) {
    console.error('[Server Error]', err);
    sendError(500, 'Internal server error');
  }
});

const PORT = 8080;
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`[iSkolar Vocation Backend] Port ${PORT} already active, reusing existing backend instance.`);
  } else {
    console.error('[iSkolar Vocation Backend Error]', err);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[iSkolar Vocation Backend API] Running on http://localhost:${PORT}`);
});

