import {
  InternshipCard,
  InternshipDetail,
  CompanyCard,
  CompanyDetail,
  CoachCard,
  CoachDetail,
  CoachReview,
  AvailabilitySlot,
  UserSession,
  StudentDashboardData,
  StudentProfile,
  BookingItem,
  CreateBookingRequest,
  CreateBookingResponse,
  LandingData,
} from '../types/api';
import { ApiFetchResult, ApiError } from './api';

// Initial Seed Data
const INITIAL_COMPANIES: any[] = [
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
    open_internships: [],
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
    open_internships: [],
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
    open_internships: [],
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
    open_internships: [],
  },
];

const INITIAL_INTERNSHIPS: any[] = [
  {
    id: 'int_01',
    title: 'Software Engineering Intern (Backend / Go & Node)',
    slug: 'software-engineering-intern-backend-maya',
    company: {
      name: INITIAL_COMPANIES[0].name,
      slug: INITIAL_COMPANIES[0].slug,
      logo_url: INITIAL_COMPANIES[0].logo_url,
      location: INITIAL_COMPANIES[0].location,
      industry: INITIAL_COMPANIES[0].industry,
    },
    field: 'Software Engineering',
    work_setup: 'hybrid',
    location: 'Mandaluyong City (Hybrid 2x/week)',
    duration_weeks: 16,
    ojt_hours: 300,
    is_paid: true,
    pay_not_stated: false,
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
      name: INITIAL_COMPANIES[1].name,
      slug: INITIAL_COMPANIES[1].slug,
      logo_url: INITIAL_COMPANIES[1].logo_url,
      location: INITIAL_COMPANIES[1].location,
      industry: INITIAL_COMPANIES[1].industry,
    },
    field: 'UI/UX Design',
    work_setup: 'hybrid',
    location: 'BGC, Taguig City',
    duration_weeks: 12,
    ojt_hours: 240,
    is_paid: true,
    pay_not_stated: false,
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
      'Portfolio demonstrating user-centered design process, wireframes, and visual polish.',
      'Proficiency with Figma and design systems.',
      'Strong communication and presentation skills.',
    ],
    perks: ['₱18,000/mo stipend', 'Free catered lunches', 'Figma Pro license'],
    recommended_coach_slug: 'bea-santos',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: 'int_03',
    title: 'Data Science & Machine Learning Intern',
    slug: 'data-science-ml-intern-globe',
    company: {
      name: INITIAL_COMPANIES[2].name,
      slug: INITIAL_COMPANIES[2].slug,
      logo_url: INITIAL_COMPANIES[2].logo_url,
      location: INITIAL_COMPANIES[2].location,
      industry: INITIAL_COMPANIES[2].industry,
    },
    field: 'Data Science & AI',
    work_setup: 'remote',
    location: 'Remote (Philippines)',
    duration_weeks: 20,
    ojt_hours: 400,
    is_paid: true,
    pay_not_stated: false,
    stipend_amount: 12000,
    stipend_period: 'month',
    status: 'open',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21).toISOString(),
    external_apply_url: 'https://www.globe.com.ph/about-us/careers',
    description: 'Work alongside data scientists on customer behavior modeling, predictive analytics pipelines, and NLP automation projects.',
    responsibilities: [
      'Clean, aggregate, and analyze large-scale datasets using Python and SQL.',
      'Build and evaluate statistical & machine learning baseline models.',
      'Create interactive dashboards and reports for stakeholder visibility.',
    ],
    requirements: [
      'Background in Statistics, Mathematics, Computer Science, or Engineering.',
      'Strong proficiency in Python (Pandas, NumPy, Scikit-Learn) and SQL.',
      'Curiosity for uncovering actionable insights from complex data.',
    ],
    perks: ['₱12,000/mo allowance', 'Free 5G connectivity package', 'Certificate of Completion'],
    recommended_coach_slug: 'engr-mark-villanueva',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'int_04',
    title: 'Cloud & Cyber Defense Apprentice',
    slug: 'cloud-cyber-defense-apprentice-accenture',
    company: {
      name: INITIAL_COMPANIES[3].name,
      slug: INITIAL_COMPANIES[3].slug,
      logo_url: INITIAL_COMPANIES[3].logo_url,
      location: INITIAL_COMPANIES[3].location,
      industry: INITIAL_COMPANIES[3].industry,
    },
    field: 'Cybersecurity',
    work_setup: 'onsite',
    location: 'Mandaluyong City',
    duration_weeks: 24,
    ojt_hours: 500,
    is_paid: true,
    pay_not_stated: false,
    stipend_amount: 14000,
    stipend_period: 'month',
    status: 'open',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18).toISOString(),
    external_apply_url: 'https://www.accenture.com/ph-en/careers',
    description: 'Gain hands-on experience in enterprise cloud architecture, vulnerability assessments, and incident triage for multinational clients.',
    responsibilities: [
      'Assist in monitoring cloud infrastructure security and assessing vulnerability reports.',
      'Automate compliance auditing scripts with bash and Python.',
      'Shadow senior security architects during client technical reviews.',
    ],
    requirements: [
      'Knowledge of TCP/IP networking, Linux administration, and fundamental security concepts.',
      'Hands-on experience with cloud platforms (AWS, Azure, or GCP) is an advantage.',
      'High attention to detail and ethical standard.',
    ],
    perks: ['₱14,000/mo stipend', 'Sponsored AWS / Azure certification exam', 'Return offer opportunity'],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
  },
  {
    id: 'int_05',
    title: 'IT Support & Systems Administration Trainee',
    slug: 'it-support-systems-administration-trainee-accenture',
    company: {
      name: INITIAL_COMPANIES[3].name,
      slug: INITIAL_COMPANIES[3].slug,
      logo_url: INITIAL_COMPANIES[3].logo_url,
      location: INITIAL_COMPANIES[3].location,
      industry: INITIAL_COMPANIES[3].industry,
    },
    field: 'Information Technology',
    work_setup: 'onsite',
    location: 'Mandaluyong City',
    duration_weeks: 10,
    ojt_hours: 200,
    is_paid: false,
    pay_not_stated: true,
    compensation_details: 'Pay not stated in the original post',
    status: 'open',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 11).toISOString(),
    external_apply_url: 'https://www.accenture.com/ph-en/careers',
    description: 'Support the workplace technology team with device provisioning, ticket triage, and basic Windows and network administration for enterprise clients.',
    responsibilities: [
      'Provision and configure laptops, accounts, and access for new joiners.',
      'Triage service desk tickets and document fixes in the knowledge base.',
      'Assist with routine network and endpoint maintenance checks.',
    ],
    requirements: [
      'Enrolled in BS Information Technology, Computer Science, or a related degree.',
      'Basic familiarity with Windows administration and networking fundamentals.',
      'Clear written communication and a service-oriented attitude.',
    ],
    perks: ['Hands-on enterprise tooling', 'Certificate of Completion'],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
];

const INITIAL_COACHES: any[] = [
  {
    id: 'coach_01',
    name: 'Engr. Mark Villanueva',
    slug: 'engr-mark-villanueva',
    headline: 'Senior Staff Engineer at Grab · Ex-Shopee Tech Lead',
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
      {
        id: 'srv_03',
        name: 'Deep Resume Polish & Portfolio Critique',
        duration_minutes: 45,
        price_centavos: 120000,
        description: 'Line-by-line review of your resume and GitHub projects to pass top tech company ATS screeners.',
      },
    ],
  },
  {
    id: 'coach_02',
    name: 'Bea Santos, Product Designer',
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
      {
        id: 'srv_05',
        name: 'Design Portfolio & Case Study Teardown',
        duration_minutes: 45,
        price_centavos: 120000,
        description: 'In-depth 45-minute workshop perfecting your storytelling, visual hierarchy, and metrics.',
      },
    ],
  },
];

const INITIAL_REVIEWS: Record<string, any[]> = {
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
    {
      id: 'rev_02',
      coach_slug: 'engr-mark-villanueva',
      student_first_name: 'Josh',
      rating: 5,
      comment: 'The resume review completely changed how I presented my academic projects. Got 3 interview invites in 2 weeks!',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
      session_type_name: 'Deep Resume Polish & Portfolio Critique',
    },
  ],
  'bea-santos': [
    {
      id: 'rev_03',
      coach_slug: 'bea-santos',
      student_first_name: 'Nicole',
      rating: 5,
      comment: 'Ate Bea gave super clear and empathetic design feedback. She showed me how top product teams evaluate UX problem framing.',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
      session_type_name: 'Free 15-Min Portfolio Diagnostic',
    },
  ],
};

const INITIAL_STUDENT_PROFILE: any = {
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
};

// Storage Helpers & Keys
const STORAGE_KEYS = {
  USER: 'vocation_dev_user',
  ACCOUNTS: 'vocation_dev_accounts',
  INTERNSHIPS: 'vocation_dev_internships',
  COMPANIES: 'vocation_dev_companies',
  COACHES: 'vocation_dev_coaches',
  BOOKINGS: 'vocation_dev_bookings',
  SAVED_BY_USER: 'vocation_dev_saved_by_user_v2',
  PROFILES: 'vocation_dev_profiles',
  SETTINGS: 'vocation_dev_settings',
  COACH_AVAILABILITY: 'vocation_dev_coach_availability',
};

const INITIAL_ACCOUNTS: Record<string, {
  email: string;
  password?: string;
  full_name: string;
  role: 'student' | 'coach' | 'admin';
  avatar_url?: string;
  is_onboarded: boolean;
}> = {
  'student@iskolar.ph': {
    email: 'student@iskolar.ph',
    password: 'password123',
    full_name: 'Clarisse Salazar',
    role: 'student',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    is_onboarded: true,
  },
  'coach@iskolar.ph': {
    email: 'coach@iskolar.ph',
    password: 'password123',
    full_name: 'Engr. Mark Villanueva',
    role: 'coach',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    is_onboarded: true,
  },
  'admin@iskolar.ph': {
    email: 'admin@iskolar.ph',
    password: 'password123',
    full_name: 'Platform Moderator',
    role: 'admin',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    is_onboarded: true,
  },
};

const INITIAL_PROFILES: Record<string, any> = {
  'student@iskolar.ph': INITIAL_STUDENT_PROFILE,
};

const INITIAL_SAVED_BY_USER: Record<string, string[]> = {};

const INITIAL_BOOKINGS: any[] = [
  {
    booking_id: 'bkg_demo_01',
    student_email: 'student@iskolar.ph',
    coach_slug: 'engr-mark-villanueva',
    coach_display_name: 'Engr. Mark Villanueva',
    slot_starts_at: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    slot_ends_at: new Date(Date.now() + 1000 * 60 * 60 * 24 + 45 * 60000).toISOString(),
    status: 'confirmed',
    payment_status: 'paid',
    price_centavos: 0,
    join_url: 'https://meet.google.com/abc-defg-hij',
  },
];

function getStored<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null && raw !== undefined) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return defaultValue;
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

// Generate dynamic 7-day UTC slots for availability
function generateAvailabilitySlots(): any[] {
  const slots: any[] = [];
  const now = new Date();

  for (let d = 1; d <= 7; d++) {
    const dayDate = new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
    const slot1Start = new Date(Date.UTC(dayDate.getUTCFullYear(), dayDate.getUTCMonth(), dayDate.getUTCDate(), 2, 0, 0));
    const slot1End = new Date(slot1Start.getTime() + 45 * 60000);
    const slot2Start = new Date(Date.UTC(dayDate.getUTCFullYear(), dayDate.getUTCMonth(), dayDate.getUTCDate(), 7, 0, 0));
    const slot2End = new Date(slot2Start.getTime() + 45 * 60000);

    slots.push(
      {
        id: `slot_${d}_1`,
        starts_at: slot1Start.toISOString(),
        ends_at: slot1End.toISOString(),
      },
      {
        id: `slot_${d}_2`,
        starts_at: slot2Start.toISOString(),
        ends_at: slot2End.toISOString(),
      }
    );
  }
  return slots;
}

export async function handleDevMockRequest<T>(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  params?: Record<string, any>
): Promise<ApiFetchResult<T> | null> {
  const cleanPath = endpoint.split('?')[0].replace(/^\/v1/, '').replace(/^\//, '');
  const methodUpper = method.toUpperCase();

  // Feature flags (API-082) — every optional integration is on in local dev
  if (cleanPath === 'features' && methodUpper === 'GET') {
    return {
      message: 'ok',
      data: { email: true, uploads: true, checkout: true, google_signin: true } as unknown as T,
    };
  }

  // 1. Auth & Session Routes
  if (cleanPath === 'me' && methodUpper === 'GET') {
    const user = getStored<UserSession | null>(STORAGE_KEYS.USER, null);

    if (!user) {
      throw new ApiError('Not authenticated', 401, 'unauthenticated');
    }
    return { message: 'Authenticated', data: user as unknown as T };
  }

  if (cleanPath === 'auth/signin' && methodUpper === 'POST') {
    const email = (body?.email || 'student@iskolar.ph').trim().toLowerCase();
    const accounts = getStored<Record<string, any>>(STORAGE_KEYS.ACCOUNTS, INITIAL_ACCOUNTS);
    let account = accounts[email];

    if (!account) {
      const isCoach = email.includes('coach');
      const isAdmin = email.includes('admin');
      const role = isAdmin ? 'admin' : isCoach ? 'coach' : 'student';
      account = {
        email,
        password: body?.password || 'password123',
        full_name: role === 'student' ? 'Clarisse Salazar' : role === 'coach' ? 'Engr. Mark Villanueva' : 'Platform Moderator',
        role,
        is_onboarded: true,
      };
      accounts[email] = account;
      setStored(STORAGE_KEYS.ACCOUNTS, accounts);
    } else {
      if (account.password && body?.password && account.password !== body.password) {
        throw new ApiError('Incorrect email or password. Please verify your credentials.', 401, 'invalid_credentials');
      }
    }

    const profiles = getStored<Record<string, any>>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    const profile = profiles[email];

    const user: UserSession = {
      id: `usr_${account.role}_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      email: account.email,
      full_name: profile?.full_name || account.full_name,
      role: account.role,
      avatar_url: profile?.avatar_url || account.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      is_onboarded: account.is_onboarded ?? true,
      email_verified: true,
    };
    setStored(STORAGE_KEYS.USER, user);
    return { message: 'Signed in successfully', data: user as unknown as T };
  }

  if (cleanPath === 'auth/signup' && methodUpper === 'POST') {
    const role = body?.role || 'student';
    const email = (body?.email || 'newstudent@iskolar.ph').trim().toLowerCase();
    const fullName = body?.full_name || (role === 'coach' ? 'Industry Mentor' : 'New iSkolar Student');
    const accounts = getStored<Record<string, any>>(STORAGE_KEYS.ACCOUNTS, INITIAL_ACCOUNTS);

    accounts[email] = {
      email,
      password: body?.password || 'password123',
      full_name: fullName,
      role,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      is_onboarded: false,
      email_verified: false,
    };
    setStored(STORAGE_KEYS.ACCOUNTS, accounts);

    const user: UserSession = {
      id: `usr_${role}_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      email,
      full_name: fullName,
      role,
      avatar_url: accounts[email].avatar_url,
      is_onboarded: false,
      email_verified: false,
    };
    setStored(STORAGE_KEYS.USER, user);

    if (role === 'student') {
      const profiles = getStored<Record<string, any>>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
      profiles[email] = {
        ...INITIAL_STUDENT_PROFILE,
        full_name: fullName,
        email,
        target_ojt_hours: 300,
        completed_ojt_hours: 0,
      };
      setStored(STORAGE_KEYS.PROFILES, profiles);

      const savedByUser = getStored<Record<string, string[]>>(STORAGE_KEYS.SAVED_BY_USER, INITIAL_SAVED_BY_USER);
      savedByUser[email] = [];
      setStored(STORAGE_KEYS.SAVED_BY_USER, savedByUser);
    }

    return { message: 'Account created successfully', data: user as unknown as T };
  }

  if (cleanPath === 'auth/signout' && methodUpper === 'POST') {
    setStored(STORAGE_KEYS.USER, null);
    return { message: 'Signed out successfully', data: null as unknown as T };
  }

  if (cleanPath === 'auth/password-reset/request' && methodUpper === 'POST') {
    return { message: 'Password reset link sent to your email', data: null as unknown as T };
  }

  if (cleanPath === 'me/student-profile' && methodUpper === 'GET') {
    const user = getStored<UserSession | null>(STORAGE_KEYS.USER, null);
    const email = user?.email?.toLowerCase() || 'student@iskolar.ph';
    const profiles = getStored<Record<string, any>>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    const profile = profiles[email] || {
      ...INITIAL_STUDENT_PROFILE,
      email,
      full_name: user?.full_name || 'Clarisse Salazar',
    };
    if (user?.full_name) {
      profile.full_name = user.full_name;
    }
    return { message: 'ok', data: profile as unknown as T };
  }

  if (cleanPath === 'me/student-profile' && (methodUpper === 'PATCH' || methodUpper === 'POST')) {
    const user = getStored<UserSession | null>(STORAGE_KEYS.USER, null);
    const email = user?.email?.toLowerCase() || 'student@iskolar.ph';
    const profiles = getStored<Record<string, any>>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    const current = profiles[email] || {
      ...INITIAL_STUDENT_PROFILE,
      email,
      full_name: user?.full_name || 'Clarisse Salazar',
    };
    const updated = {
      ...current,
      ...body,
      target_ojt_hours: body?.target_ojt_hours !== undefined ? Number(body.target_ojt_hours) : current.target_ojt_hours,
      completed_ojt_hours: body?.completed_ojt_hours !== undefined ? Number(body.completed_ojt_hours) : current.completed_ojt_hours,
    };
    profiles[email] = updated;
    setStored(STORAGE_KEYS.PROFILES, profiles);

    // Sync account and active session
    if (user) {
      const updatedUser: UserSession = {
        ...user,
        full_name: updated.full_name || user.full_name,
        avatar_url: updated.avatar_url || user.avatar_url,
        is_onboarded: true,
      };
      setStored(STORAGE_KEYS.USER, updatedUser);

      const accounts = getStored<Record<string, any>>(STORAGE_KEYS.ACCOUNTS, INITIAL_ACCOUNTS);
      if (accounts[email]) {
        accounts[email].full_name = updated.full_name || accounts[email].full_name;
        accounts[email].is_onboarded = true;
        setStored(STORAGE_KEYS.ACCOUNTS, accounts);
      }
    }

    return { message: 'Profile updated', data: updated as unknown as T };
  }

  // Coach Self-Service Endpoints (API-060, API-061, API-062, API-063, API-064, API-067)
  if (cleanPath === 'me/coach-profile' && methodUpper === 'POST') {
    const user = getStored<UserSession | null>(STORAGE_KEYS.USER, null);
    const email = user?.email?.toLowerCase() || 'coach@iskolar.ph';
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

    if (user) {
      setStored(STORAGE_KEYS.USER, { ...user, full_name: displayName, is_onboarded: true });
    }
    const accounts = getStored<Record<string, any>>(STORAGE_KEYS.ACCOUNTS, INITIAL_ACCOUNTS);
    if (accounts[email]) {
      accounts[email].full_name = displayName;
      accounts[email].is_onboarded = true;
      setStored(STORAGE_KEYS.ACCOUNTS, accounts);
    }

    const coaches = getStored<any[]>(STORAGE_KEYS.COACHES, INITIAL_COACHES);
    const existingIdx = coaches.findIndex((c) => c.slug === slug || c.id === slug);
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
      coaches[existingIdx] = { ...coaches[existingIdx], ...coachCard };
    } else {
      coaches.push(coachCard);
    }
    setStored(STORAGE_KEYS.COACHES, coaches);

    return { message: 'Coach profile created', data: newProfile as unknown as T };
  }

  if (cleanPath === 'me/coach-profile' && methodUpper === 'PATCH') {
    const coaches = getStored<any[]>(STORAGE_KEYS.COACHES, INITIAL_COACHES);
    const updated = { ...coaches[0], ...body };
    return { message: 'Coach profile updated', data: updated as unknown as T };
  }

  if (cleanPath === 'me/coach-profile' && methodUpper === 'GET') {
    const coaches = getStored<any[]>(STORAGE_KEYS.COACHES, INITIAL_COACHES);
    return { message: 'ok', data: coaches[0] as unknown as T };
  }

  if (cleanPath === 'me/availability' && methodUpper === 'GET') {
    const user = getStored<UserSession | null>(STORAGE_KEYS.USER, null);
    const coaches = getStored<any[]>(STORAGE_KEYS.COACHES, INITIAL_COACHES);
    const currentCoach = coaches.find((c) => c.slug === 'engr-mark-villanueva' || c.name === user?.full_name) || coaches[0];
    const slug = currentCoach?.slug || 'engr-mark-villanueva';
    const allAvail = getStored<Record<string, any[]>>(STORAGE_KEYS.COACH_AVAILABILITY, {});
    if (!allAvail[slug]) {
      allAvail[slug] = generateAvailabilitySlots();
      setStored(STORAGE_KEYS.COACH_AVAILABILITY, allAvail);
    }
    const slots = allAvail[slug];
    return { message: 'ok', data: slots as unknown as T, meta: { page: 1, per_page: 20, total: slots.length } };
  }

  if (cleanPath === 'me/availability' && methodUpper === 'PUT') {
    const user = getStored<UserSession | null>(STORAGE_KEYS.USER, null);
    const coaches = getStored<any[]>(STORAGE_KEYS.COACHES, INITIAL_COACHES);
    const currentCoach = coaches.find((c) => c.slug === 'engr-mark-villanueva' || c.name === user?.full_name) || coaches[0];
    const slug = currentCoach?.slug || 'engr-mark-villanueva';
    const inputSlots = (body?.slots || []).map((s: any, idx: number) => ({
      id: s.id || `slot_c_${Date.now()}_${idx}`,
      starts_at: s.starts_at,
      ends_at: s.ends_at,
      is_booked: Boolean(s.is_booked),
    }));
    const allAvail = getStored<Record<string, any[]>>(STORAGE_KEYS.COACH_AVAILABILITY, {});
    allAvail[slug] = inputSlots;
    setStored(STORAGE_KEYS.COACH_AVAILABILITY, allAvail);
    return { message: 'Availability updated', data: inputSlots as unknown as T, meta: { page: 1, per_page: 20, total: inputSlots.length } };
  }

  if (cleanPath === 'me/sessions' && methodUpper === 'GET') {
    const allBookings = getStored<any[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const formatted = allBookings.map((b) => ({
      id: b.booking_id,
      booking_id: b.booking_id,
      student_display_name: 'Clarisse Salazar',
      student_email: b.student_email || 'student@iskolar.ph',
      slot_starts_at: b.slot_starts_at,
      slot_ends_at: b.slot_ends_at,
      status: b.status,
      payment_status: b.payment_status,
      price_centavos: b.price_centavos,
      join_url: b.join_url || 'https://meet.google.com/abc-defg-hij',
    }));
    return { message: 'ok', data: formatted as unknown as T, meta: { page: 1, per_page: 20, total: formatted.length } };
  }

  if (cleanPath === 'me/earnings' && methodUpper === 'GET') {
    const allBookings = getStored<any[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const items = allBookings.map((b) => ({
      id: `earn_${b.booking_id}`,
      booking_id: b.booking_id,
      price_centavos: b.price_centavos,
      platform_fee_centavos: Math.round(b.price_centavos * 0.1),
      coach_payout_centavos: Math.round(b.price_centavos * 0.9),
      payment_status: b.payment_status,
      slot_starts_at: b.slot_starts_at,
      created_at: b.slot_starts_at,
    }));
    const totalPaid = items.filter((i) => i.payment_status === 'paid').reduce((sum, i) => sum + i.coach_payout_centavos, 0);
    return {
      message: 'ok',
      data: items as unknown as T,
      meta: {
        balance: {
          available_centavos: totalPaid,
          in_transit_centavos: 0,
          paid_out_centavos: 0,
          pending_centavos: 0,
        },
      } as any,
    };
  }

  if (cleanPath === 'me/session-types' && methodUpper === 'GET') {
    const coaches = getStored<any[]>(STORAGE_KEYS.COACHES, INITIAL_COACHES);
    return { message: 'ok', data: (coaches[0]?.session_types || []) as unknown as T };
  }

  if (cleanPath === 'me/session-types' && methodUpper === 'POST') {
    const newType = {
      id: `srv_${Date.now()}`,
      name: body?.name || 'New Mentorship Session',
      duration_minutes: Number(body?.duration_minutes) || 45,
      price_centavos: Number(body?.price_centavos) || 0,
      is_intro_call: Boolean(body?.is_intro_call),
    };
    return { message: 'Session type created', data: newType as unknown as T };
  }

  if (cleanPath === 'me/settings' && methodUpper === 'GET') {
    const user = getStored<UserSession | null>(STORAGE_KEYS.USER, null);
    const email = user?.email?.toLowerCase() || 'student@iskolar.ph';
    const allSettings = getStored<Record<string, any>>(STORAGE_KEYS.SETTINGS, {});
    const userSettings = allSettings[email] || { email_notifications: true };
    return { message: 'ok', data: userSettings as unknown as T };
  }

  if (cleanPath === 'me/settings' && methodUpper === 'PATCH') {
    const user = getStored<UserSession | null>(STORAGE_KEYS.USER, null);
    const email = user?.email?.toLowerCase() || 'student@iskolar.ph';
    const accounts = getStored<Record<string, any>>(STORAGE_KEYS.ACCOUNTS, INITIAL_ACCOUNTS);

    // If changing password: save to account
    if (body?.password && accounts[email]) {
      accounts[email].password = body.password;
      setStored(STORAGE_KEYS.ACCOUNTS, accounts);
    }

    // If changing email
    if (body?.email && body.email.toLowerCase() !== email) {
      const newEmail = body.email.toLowerCase();
      if (accounts[email]) {
        accounts[newEmail] = { ...accounts[email], email: newEmail };
        delete accounts[email];
        setStored(STORAGE_KEYS.ACCOUNTS, accounts);
      }
      if (user) {
        setStored(STORAGE_KEYS.USER, { ...user, email: newEmail });
      }
    }

    const allSettings = getStored<Record<string, any>>(STORAGE_KEYS.SETTINGS, {});
    const current = allSettings[email] || { email_notifications: true };
    const updated = { ...current, ...body };
    allSettings[email] = updated;
    setStored(STORAGE_KEYS.SETTINGS, allSettings);

    return { message: 'Settings saved', data: updated as unknown as T };
  }

  // 2. Landing Page
  if (cleanPath === 'landing' && methodUpper === 'GET') {
    const internships = getStored<any[]>(STORAGE_KEYS.INTERNSHIPS, INITIAL_INTERNSHIPS);
    const coaches = getStored<any[]>(STORAGE_KEYS.COACHES, INITIAL_COACHES);

    const landingData: LandingData = {
      featured_internships: internships.slice(0, 4),
      featured_coaches: coaches.slice(0, 3).map((c: any) => ({
        slug: c.slug,
        display_name: c.display_name || c.name || 'Coach',
        headline: c.headline || '',
        avatar_url: c.avatar_url || null,
        price_type: (c.price_type === 'free' ? 'free' : 'paid') as 'free' | 'paid',
        expertise: c.expertise || [],
        rating_avg: c.rating_avg ?? c.rating ?? 5.0,
        rating_count: c.rating_count ?? c.review_count ?? 12,
      })),
    };
    return { message: 'ok', data: landingData as unknown as T };
  }

  // 3. Internships
  if (cleanPath === 'internships' && methodUpper === 'GET') {
    const all = getStored<any[]>(STORAGE_KEYS.INTERNSHIPS, INITIAL_INTERNSHIPS);
    let filtered = all.filter((i) => i.status === 'open');

    if (params?.q) {
      const q = String(params.q).toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.field.toLowerCase().includes(q) ||
          i.company.name.toLowerCase().includes(q)
      );
    }
    if (params?.field && params.field !== 'all') {
      filtered = filtered.filter((i) => i.field.toLowerCase() === String(params.field).toLowerCase());
    }
    if (params?.setup && params.setup !== 'all') {
      filtered = filtered.filter((i) => i.work_setup === params.setup);
    }
    if (params?.pay === 'paid') {
      filtered = filtered.filter((i) => i.is_paid);
    } else if (params?.pay === 'unpaid') {
      filtered = filtered.filter((i) => !i.is_paid);
    }

    const page = Number(params?.page) || 1;
    const per_page = Number(params?.per_page) || 20;

    return {
      message: 'ok',
      data: filtered as unknown as T,
      meta: { page, per_page, total: filtered.length },
    };
  }

  if (cleanPath.startsWith('internships/') && methodUpper === 'GET') {
    const slug = cleanPath.replace('internships/', '');
    const all = getStored<InternshipDetail[]>(STORAGE_KEYS.INTERNSHIPS, INITIAL_INTERNSHIPS);
    const item = all.find((i) => i.slug === slug || i.id === slug);
    if (!item) throw new ApiError('Internship not found', 404);
    return { message: 'ok', data: item as unknown as T };
  }

  if (cleanPath.includes('/apply-click') && methodUpper === 'POST') {
    return { message: 'Apply click recorded', data: { recorded: true } as unknown as T };
  }

  // 4. Companies
  if (cleanPath === 'companies' && methodUpper === 'GET') {
    const companies = getStored<any[]>(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES);
    const internships = getStored<any[]>(STORAGE_KEYS.INTERNSHIPS, INITIAL_INTERNSHIPS);

    const cards: CompanyCard[] = companies.map((c) => ({
      name: c.name,
      slug: c.slug,
      logo_url: c.logo_url || null,
      industry: c.industry,
      location: c.location,
      verification_status: c.verification_status || 'verified',
      open_role_count: internships.filter((i) => i.company?.slug === c.slug && i.status === 'open').length,
    }));
    return { message: 'ok', data: cards as unknown as T, meta: { page: 1, per_page: 20, total: cards.length } };
  }

  if (cleanPath.startsWith('companies/') && methodUpper === 'GET') {
    const slug = cleanPath.replace('companies/', '');
    const companies = getStored<any[]>(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES);
    const internships = getStored<any[]>(STORAGE_KEYS.INTERNSHIPS, INITIAL_INTERNSHIPS);
    const company = companies.find((c) => c.slug === slug || c.id === slug);
    if (!company) throw new ApiError('Company not found', 404);
    company.open_internships = internships.filter((i) => i.company?.slug === company.slug && i.status === 'open');
    return { message: 'ok', data: company as unknown as T };
  }

  // 5. Coaches & Availability
  if (cleanPath === 'coaches' && methodUpper === 'GET') {
    const coaches = getStored<any[]>(STORAGE_KEYS.COACHES, INITIAL_COACHES);
    let filtered = [...coaches];

    if (params?.q) {
      const q = String(params.q).toLowerCase();
      filtered = filtered.filter((c) => (c.display_name || c.name || '').toLowerCase().includes(q) || (c.headline || '').toLowerCase().includes(q));
    }
    if (params?.price === 'free') {
      filtered = filtered.filter((c) => c.session_types?.some((s: any) => s.price_centavos === 0));
    } else if (params?.price === 'paid') {
      filtered = filtered.filter((c) => c.session_types?.some((s: any) => s.price_centavos > 0));
    }

    return { message: 'ok', data: filtered as unknown as T, meta: { page: 1, per_page: 20, total: filtered.length } };
  }

  if (cleanPath.endsWith('/reviews') && cleanPath.startsWith('coaches/') && methodUpper === 'GET') {
    const slug = cleanPath.replace('coaches/', '').replace('/reviews', '');
    const reviews = INITIAL_REVIEWS[slug] || [];
    return { message: 'ok', data: reviews as unknown as T };
  }

  if (cleanPath.endsWith('/availability') && cleanPath.startsWith('coaches/') && methodUpper === 'GET') {
    const slug = cleanPath.replace('coaches/', '').replace('/availability', '');
    const allAvail = getStored<Record<string, any[]>>(STORAGE_KEYS.COACH_AVAILABILITY, {});
    if (!allAvail[slug]) {
      allAvail[slug] = generateAvailabilitySlots();
      setStored(STORAGE_KEYS.COACH_AVAILABILITY, allAvail);
    }
    const slots = allAvail[slug] || [];
    const bookableSlots = slots.filter((s: any) => !s.is_booked);
    return { message: 'ok', data: bookableSlots as unknown as T, meta: { page: 1, per_page: 20, total: bookableSlots.length } };
  }

  if (cleanPath.startsWith('coaches/') && methodUpper === 'GET') {
    const slug = cleanPath.replace('coaches/', '');
    const coaches = getStored<any[]>(STORAGE_KEYS.COACHES, INITIAL_COACHES);
    const coach = coaches.find((c) => c.slug === slug || c.id === slug);
    if (!coach) throw new ApiError('Coach not found', 404);
    return { message: 'ok', data: coach as unknown as T };
  }

  // 6. Bookings
  if (cleanPath === 'bookings' && methodUpper === 'POST') {
    const bookingReq = body as CreateBookingRequest;
    const coaches = getStored<CoachDetail[]>(STORAGE_KEYS.COACHES, INITIAL_COACHES);
    const coach = coaches.find((c) => c.slug === bookingReq.coach_slug) || coaches[0];
    const sessionTypes = coach?.session_types || [
      {
        id: 'srv_01',
        name: 'Free 15-Min Career & OJT Discovery',
        duration_minutes: 15,
        price_centavos: 0,
        is_intro_call: true,
      },
      {
        id: 'srv_02',
        name: 'Full 1-on-1 Technical Mock Interview',
        duration_minutes: 45,
        price_centavos: 150000,
        is_intro_call: false,
      },
    ];
    const sessionType =
      sessionTypes.find((s) => s.id === bookingReq.session_type_id) || sessionTypes[0];
    const isFree = (sessionType?.price_centavos || 0) === 0;
    const bookingId = `bkg_${Date.now()}`;
    const slotStartsAt =
      bookingReq.slot_starts_at || new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString();
    const slotEndsAt = new Date(
      new Date(slotStartsAt).getTime() + (sessionType?.duration_minutes || 45) * 60000
    ).toISOString();

    const user = getStored<UserSession | null>(STORAGE_KEYS.USER, null);
    if (user?.role !== 'student') {
      return {
        message: 'Coach accounts cannot book mentorship sessions. Only students can book.',
        error: { code: 'FORBIDDEN', message: 'Forbidden' },
      } as unknown as ApiFetchResult<T>;
    }
    const email = user?.email?.toLowerCase() || 'student@iskolar.ph';

    const newBooking: BookingItem & { student_email?: string } = {
      booking_id: bookingId,
      student_email: email,
      coach_slug: coach ? coach.slug : bookingReq.coach_slug,
      coach_display_name: coach ? (coach.display_name || (coach as any).name || 'Coach') : 'Coach',
      slot_starts_at: slotStartsAt,
      slot_ends_at: slotEndsAt,
      status: isFree ? 'confirmed' : 'pending',
      payment_status: isFree ? 'paid' : 'pending',
      price_centavos: sessionType?.price_centavos || 0,
      amount_due_centavos: isFree ? undefined : (sessionType?.price_centavos || 0),
      join_url: isFree ? 'https://meet.google.com/abc-defg-hij' : undefined,
    };

    const bookings = getStored<any[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    setStored(STORAGE_KEYS.BOOKINGS, [newBooking, ...bookings]);

    // Mark slot as booked in coach availability
    const allAvail = getStored<Record<string, any[]>>(STORAGE_KEYS.COACH_AVAILABILITY, {});
    const cSlug = coach ? coach.slug : bookingReq.coach_slug;
    if (cSlug && allAvail[cSlug]) {
      const matched = allAvail[cSlug].find((s: any) => s.starts_at === slotStartsAt);
      if (matched) {
        matched.is_booked = true;
        setStored(STORAGE_KEYS.COACH_AVAILABILITY, allAvail);
      }
    }

    const res: CreateBookingResponse = {
      booking_id: bookingId,
      status: (newBooking.status === 'confirmed' ? 'confirmed' : 'pending') as 'confirmed' | 'pending',
      payment_status: (newBooking.payment_status === 'paid' ? 'none' : 'pending') as 'none' | 'pending',
      price_centavos: newBooking.price_centavos,
      platform_fee_centavos: isFree ? 0 : Math.round((sessionType?.price_centavos || 0) * 0.1),
      coach_payout_centavos: isFree ? 0 : Math.round((sessionType?.price_centavos || 0) * 0.9),
      checkout_url: isFree ? undefined : `/checkout/success?booking_id=${bookingId}`,
    };

    return { message: 'Booking created', data: res as unknown as T };
  }

  // Cancel Booking (API-046 / Issue #17)
  if (cleanPath.startsWith('bookings/') && cleanPath.endsWith('/cancel') && methodUpper === 'POST') {
    const bookingId = cleanPath.replace('bookings/', '').replace('/cancel', '');
    const bookings = getStored<any[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const target = bookings.find((b) => b.booking_id === bookingId);

    const now = Date.now();
    const isFree = target ? target.price_centavos === 0 : true;
    const sessionTime = target ? new Date(target.slot_starts_at).getTime() : now + 86400000 * 2;
    const isRefundEligible = !isFree && (sessionTime - now >= 24 * 60 * 60 * 1000);

    const updatedBookings = bookings.map((b) => {
      if (b.booking_id === bookingId) {
        return {
          ...b,
          status: 'cancelled' as const,
          payment_status: isRefundEligible ? ('refunded' as const) : b.payment_status,
        };
      }
      return b;
    });
    setStored(STORAGE_KEYS.BOOKINGS, updatedBookings);

    // Release slot back to available in coach availability
    if (target?.coach_slug && target?.slot_starts_at) {
      const allAvail = getStored<Record<string, any[]>>(STORAGE_KEYS.COACH_AVAILABILITY, {});
      if (allAvail[target.coach_slug]) {
        const matched = allAvail[target.coach_slug].find((s: any) => s.starts_at === target.slot_starts_at);
        if (matched) {
          matched.is_booked = false;
          setStored(STORAGE_KEYS.COACH_AVAILABILITY, allAvail);
        }
      }
    }

    const cancelledBooking = updatedBookings.find((b) => b.booking_id === bookingId) || {
      booking_id: bookingId,
      status: 'cancelled' as const,
      payment_status: isRefundEligible ? 'refunded' : 'none',
      price_centavos: target?.price_centavos || 0,
      platform_fee_centavos: 0,
      coach_payout_centavos: 0,
    };

    return {
      message: 'Booking cancelled successfully',
      data: cancelledBooking as unknown as T,
    };
  }

  // Resume Checkout (API-042) - supports both /checkout and /resume-checkout
  if (
    cleanPath.startsWith('bookings/') &&
    (cleanPath.endsWith('/checkout') || cleanPath.endsWith('/resume-checkout')) &&
    methodUpper === 'POST'
  ) {
    const bookingId = cleanPath
      .replace('bookings/', '')
      .replace('/resume-checkout', '')
      .replace('/checkout', '');
    return {
      message: 'Checkout resumed',
      data: { checkout_url: `/checkout/success?booking_id=${bookingId}` } as unknown as T,
    };
  }

  // Review Booking (API-048)
  if (cleanPath.startsWith('bookings/') && cleanPath.endsWith('/review') && methodUpper === 'POST') {
    return {
      message: 'Review submitted successfully',
      data: { id: `rev_${Date.now()}` } as unknown as T,
    };
  }

  // 7. Student Portal
  if (cleanPath === 'me/bookings' && methodUpper === 'GET') {
    const user = getStored<UserSession | null>(STORAGE_KEYS.USER, null);
    const email = user?.email?.toLowerCase() || 'student@iskolar.ph';
    const allBookings = getStored<any[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const bookings = allBookings.filter((b) => !b.student_email || b.student_email.toLowerCase() === email);
    const now = Date.now();

    const whenParam = params?.when;
    let filtered = bookings;

    if (whenParam === 'upcoming') {
      filtered = bookings.filter((b) => {
        const isNotCancelledOrCompleted = b.status !== 'cancelled' && b.status !== 'completed';
        const sessionEndTime = new Date(b.slot_ends_at || b.slot_starts_at).getTime();
        return isNotCancelledOrCompleted && sessionEndTime >= now;
      });
    } else if (whenParam === 'past') {
      filtered = bookings.filter((b) => {
        const isCancelledOrCompleted = b.status === 'cancelled' || b.status === 'completed';
        const sessionEndTime = new Date(b.slot_ends_at || b.slot_starts_at).getTime();
        return isCancelledOrCompleted || sessionEndTime < now;
      });
    }

    return { message: 'ok', data: filtered as unknown as T };
  }

  if (cleanPath === 'me/saved' && methodUpper === 'GET') {
    const user = getStored<UserSession | null>(STORAGE_KEYS.USER, null);
    if (user?.role !== 'student') {
      return { message: 'ok', data: [] as unknown as T };
    }
    const email = user.email?.toLowerCase();
    const savedByUser = getStored<Record<string, string[]>>(STORAGE_KEYS.SAVED_BY_USER, INITIAL_SAVED_BY_USER);
    const savedIds = (email ? savedByUser[email] : null) ?? [];
    const all = getStored<InternshipDetail[]>(STORAGE_KEYS.INTERNSHIPS, INITIAL_INTERNSHIPS);
    const saved = all.filter((i) => savedIds.includes(i.id));
    return { message: 'ok', data: saved as unknown as T };
  }

  if (cleanPath.startsWith('me/saved/') && methodUpper === 'PUT') {
    const user = getStored<UserSession | null>(STORAGE_KEYS.USER, null);
    if (user?.role !== 'student') {
      return {
        message: 'Only student accounts can save internships',
        error: { code: 'FORBIDDEN', message: 'Forbidden' },
      } as unknown as ApiFetchResult<T>;
    }
    const id = cleanPath.replace('me/saved/', '');
    const email = user.email?.toLowerCase();
    const savedByUser = getStored<Record<string, string[]>>(STORAGE_KEYS.SAVED_BY_USER, INITIAL_SAVED_BY_USER);
    const current = (email ? savedByUser[email] : null) ?? [];
    if (!current.includes(id) && email) {
      savedByUser[email] = [...current, id];
      setStored(STORAGE_KEYS.SAVED_BY_USER, savedByUser);
    }
    return { message: 'Internship saved to bookmarks', data: { saved: true } as unknown as T };
  }

  if (cleanPath.startsWith('me/saved/') && methodUpper === 'DELETE') {
    const user = getStored<UserSession | null>(STORAGE_KEYS.USER, null);
    if (user?.role !== 'student') {
      return {
        message: 'Only student accounts can unsave internships',
        error: { code: 'FORBIDDEN', message: 'Forbidden' },
      } as unknown as ApiFetchResult<T>;
    }
    const id = cleanPath.replace('me/saved/', '');
    const email = user.email?.toLowerCase();
    const savedByUser = getStored<Record<string, string[]>>(STORAGE_KEYS.SAVED_BY_USER, INITIAL_SAVED_BY_USER);
    const current = (email ? savedByUser[email] : null) ?? [];
    if (email) {
      savedByUser[email] = current.filter((x) => x !== id);
      setStored(STORAGE_KEYS.SAVED_BY_USER, savedByUser);
    }
    return { message: 'Internship removed from bookmarks', data: { saved: false } as unknown as T };
  }

  if (cleanPath === 'me/dashboard' && methodUpper === 'GET') {
    const user = getStored<UserSession | null>(STORAGE_KEYS.USER, null);
    if (user?.role !== 'student') {
      return {
        message: 'Student dashboard is restricted to student accounts',
        error: { code: 'FORBIDDEN', message: 'Forbidden' },
      } as unknown as ApiFetchResult<T>;
    }
    const email = user.email?.toLowerCase();
    const savedByUser = getStored<Record<string, string[]>>(STORAGE_KEYS.SAVED_BY_USER, INITIAL_SAVED_BY_USER);
    const savedIds = (email ? savedByUser[email] : null) ?? [];

    const allBookings = getStored<any[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const userBookings = allBookings.filter((b) => b.student_email && b.student_email.toLowerCase() === email);
    const now = Date.now();
    const upcomingSessions = userBookings.filter((b) => {
      const isNotCancelledOrCompleted = b.status !== 'cancelled' && b.status !== 'completed';
      const sessionEndTime = new Date(b.slot_ends_at || b.slot_starts_at).getTime();
      return isNotCancelledOrCompleted && sessionEndTime >= now;
    });

    const profiles = getStored<Record<string, any>>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    const profile = (email ? profiles[email] : null) || INITIAL_STUDENT_PROFILE;

    const data: StudentDashboardData = {
      saved_count: savedIds.length,
      upcoming_sessions_count: upcomingSessions.length,
      completeness_pct: profile?.completeness_pct || 85,
    };
    return { message: 'ok', data: data as unknown as T };
  }

  // 8. Admin Moderation
  if (cleanPath === 'admin/internships' && methodUpper === 'GET') {
    const all = getStored<InternshipDetail[]>(STORAGE_KEYS.INTERNSHIPS, INITIAL_INTERNSHIPS);
    let filtered = all;
    if (params?.status && params.status !== 'all') {
      filtered = all.filter((i) => (i as any).status === params.status);
    }
    return { message: 'ok', data: filtered as unknown as T };
  }

  if (cleanPath.endsWith('/withdraw') && cleanPath.startsWith('admin/internships/') && methodUpper === 'POST') {
    const id = cleanPath.replace('admin/internships/', '').replace('/withdraw', '');
    const all = getStored<InternshipDetail[]>(STORAGE_KEYS.INTERNSHIPS, INITIAL_INTERNSHIPS);
    const updated = all.map((i) => (i.id === id ? ({ ...i, status: 'withdrawn' } as any) : i));
    setStored(STORAGE_KEYS.INTERNSHIPS, updated);
    return { message: 'Listing withdrawn successfully', data: { id, status: 'withdrawn' } as unknown as T };
  }

  return null;
}
