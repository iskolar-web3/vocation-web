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
const INITIAL_COMPANIES: CompanyDetail[] = [
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

const INITIAL_INTERNSHIPS: InternshipDetail[] = [
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
];

const INITIAL_COACHES: CoachDetail[] = [
  {
    id: 'coach_01',
    name: 'Engr. Mark Villanueva',
    slug: 'engr-mark-villanueva',
    headline: 'Senior Staff Engineer at Grab · Ex-Shopee Tech Lead',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    current_role: 'Senior Staff Engineer',
    company: 'Grab Philippines',
    location: 'Metro Manila / Remote',
    bio: 'Over 9 years of engineering experience across Southeast Asia unicorn tech companies. Mentored 120+ Filipino students and career shifters into junior & mid-level engineering roles with an 85% placement rate.',
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

const INITIAL_REVIEWS: Record<string, CoachReview[]> = {
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

const INITIAL_STUDENT_PROFILE: StudentProfile = {
  full_name: 'Clarisse Salazar',
  email: 'student@iskolar.ph',
  school: 'University of the Philippines Diliman',
  course: 'BS Computer Science',
  year_level: '4th Year',
  target_ojt_hours: 300,
  completed_ojt_hours: 180,
  skills: ['React', 'TypeScript', 'Node.js', 'Go', 'PostgreSQL', 'Git'],
  bio: 'Aspiring software engineer passionate about web systems and cloud development.',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
};

// Storage Helpers
const STORAGE_KEYS = {
  USER: 'vocation_dev_user',
  INTERNSHIPS: 'vocation_dev_internships',
  COMPANIES: 'vocation_dev_companies',
  COACHES: 'vocation_dev_coaches',
  BOOKINGS: 'vocation_dev_bookings',
  SAVED: 'vocation_dev_saved',
  PROFILE: 'vocation_dev_student_profile',
};

function getStored<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
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
function generateAvailabilitySlots(): AvailabilitySlot[] {
  const slots: AvailabilitySlot[] = [];
  const now = new Date();

  for (let d = 1; d <= 7; d++) {
    const dayDate = new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
    const slot1Start = new Date(Date.UTC(dayDate.getUTCFullYear(), dayDate.getUTCMonth(), dayDate.getUTCDate(), 2, 0, 0));
    const slot2Start = new Date(Date.UTC(dayDate.getUTCFullYear(), dayDate.getUTCMonth(), dayDate.getUTCDate(), 7, 0, 0));

    slots.push(
      {
        id: `slot_${d}_1`,
        slot_starts_at: slot1Start.toISOString(),
        duration_minutes: 45,
        is_available: d !== 2,
      },
      {
        id: `slot_${d}_2`,
        slot_starts_at: slot2Start.toISOString(),
        duration_minutes: 45,
        is_available: true,
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

  // 1. Auth & Session Routes
  if (cleanPath === 'me' && methodUpper === 'GET') {
    const user = getStored<UserSession | null>(STORAGE_KEYS.USER, {
      id: 'usr_student_01',
      email: 'student@iskolar.ph',
      full_name: 'Clarisse Salazar',
      role: 'student',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      is_onboarded: true,
    });

    if (!user) {
      throw new ApiError('Not authenticated', 401, 'UNAUTHORIZED');
    }
    return { message: 'Authenticated', data: user as unknown as T };
  }

  if (cleanPath === 'auth/signin' && methodUpper === 'POST') {
    const email = body?.email || 'student@iskolar.ph';
    const isCoach = email.toLowerCase().includes('coach');
    const isAdmin = email.toLowerCase().includes('admin');
    const role = isAdmin ? 'admin' : isCoach ? 'coach' : 'student';

    const user: UserSession = {
      id: `usr_${role}_${Date.now()}`,
      email,
      full_name: isAdmin ? 'Platform Moderator' : isCoach ? 'Engr. Mark Villanueva' : 'Clarisse Salazar',
      role,
      avatar_url: isCoach
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      is_onboarded: true,
    };
    setStored(STORAGE_KEYS.USER, user);
    return { message: 'Signed in successfully', data: { user } as unknown as T };
  }

  if (cleanPath === 'auth/signup' && methodUpper === 'POST') {
    const role = body?.role || 'student';
    const email = body?.email || 'newstudent@iskolar.ph';
    const user: UserSession = {
      id: `usr_${role}_${Date.now()}`,
      email,
      full_name: body?.full_name || (role === 'coach' ? 'Industry Mentor' : 'New iSkolar Student'),
      role,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      is_onboarded: true,
    };
    setStored(STORAGE_KEYS.USER, user);
    return { message: 'Account created successfully', data: { user } as unknown as T };
  }

  if (cleanPath === 'auth/signout' && methodUpper === 'POST') {
    setStored(STORAGE_KEYS.USER, null);
    return { message: 'Signed out successfully', data: null as unknown as T };
  }

  if (cleanPath === 'auth/password-reset/request' && methodUpper === 'POST') {
    return { message: 'Password reset link sent to your email', data: null as unknown as T };
  }

  if (cleanPath === 'me/student-profile' && methodUpper === 'PATCH') {
    const profile = getStored<StudentProfile>(STORAGE_KEYS.PROFILE, INITIAL_STUDENT_PROFILE);
    const updated = { ...profile, ...body };
    setStored(STORAGE_KEYS.PROFILE, updated);
    return { message: 'Profile updated', data: updated as unknown as T };
  }

  if (cleanPath === 'me/settings' && methodUpper === 'PATCH') {
    return { message: 'Settings saved', data: { success: true } as unknown as T };
  }

  // 2. Landing Page
  if (cleanPath === 'landing' && methodUpper === 'GET') {
    const internships = getStored<InternshipDetail[]>(STORAGE_KEYS.INTERNSHIPS, INITIAL_INTERNSHIPS);
    const coaches = getStored<CoachDetail[]>(STORAGE_KEYS.COACHES, INITIAL_COACHES);

    const landingData: LandingData = {
      stats: {
        open_internships: 142,
        active_coaches: 24,
        partner_companies: 38,
      },
      featured_internships: internships.slice(0, 4),
      top_coaches: coaches.slice(0, 3),
    };
    return { message: 'ok', data: landingData as unknown as T };
  }

  // 3. Internships
  if (cleanPath === 'internships' && methodUpper === 'GET') {
    const all = getStored<InternshipDetail[]>(STORAGE_KEYS.INTERNSHIPS, INITIAL_INTERNSHIPS);
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
    const companies = getStored<CompanyDetail[]>(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES);
    const internships = getStored<InternshipDetail[]>(STORAGE_KEYS.INTERNSHIPS, INITIAL_INTERNSHIPS);

    const cards: CompanyCard[] = companies.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      logo_url: c.logo_url,
      banner_url: c.banner_url,
      industry: c.industry,
      location: c.location,
      size: c.size,
      website: c.website,
      description: c.description,
      perks: c.perks,
      open_role_count: internships.filter((i) => i.company.slug === c.slug && i.status === 'open').length,
    }));
    return { message: 'ok', data: cards as unknown as T, meta: { page: 1, per_page: 20, total: cards.length } };
  }

  if (cleanPath.startsWith('companies/') && methodUpper === 'GET') {
    const slug = cleanPath.replace('companies/', '');
    const companies = getStored<CompanyDetail[]>(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES);
    const internships = getStored<InternshipDetail[]>(STORAGE_KEYS.INTERNSHIPS, INITIAL_INTERNSHIPS);
    const company = companies.find((c) => c.slug === slug || c.id === slug);
    if (!company) throw new ApiError('Company not found', 404);
    company.open_internships = internships.filter((i) => i.company.slug === company.slug && i.status === 'open');
    return { message: 'ok', data: company as unknown as T };
  }

  // 5. Coaches & Availability
  if (cleanPath === 'coaches' && methodUpper === 'GET') {
    const coaches = getStored<CoachDetail[]>(STORAGE_KEYS.COACHES, INITIAL_COACHES);
    let filtered = [...coaches];

    if (params?.q) {
      const q = String(params.q).toLowerCase();
      filtered = filtered.filter((c) => c.name.toLowerCase().includes(q) || c.headline.toLowerCase().includes(q));
    }
    if (params?.price === 'free') {
      filtered = filtered.filter((c) => c.session_types.some((s) => s.price_centavos === 0));
    } else if (params?.price === 'paid') {
      filtered = filtered.filter((c) => c.session_types.some((s) => s.price_centavos > 0));
    }

    return { message: 'ok', data: filtered as unknown as T, meta: { page: 1, per_page: 20, total: filtered.length } };
  }

  if (cleanPath.endsWith('/reviews') && cleanPath.startsWith('coaches/') && methodUpper === 'GET') {
    const slug = cleanPath.replace('coaches/', '').replace('/reviews', '');
    const reviews = INITIAL_REVIEWS[slug] || [];
    return { message: 'ok', data: reviews as unknown as T };
  }

  if (cleanPath.endsWith('/availability') && cleanPath.startsWith('coaches/') && methodUpper === 'GET') {
    const slots = generateAvailabilitySlots();
    return { message: 'ok', data: slots as unknown as T };
  }

  if (cleanPath.startsWith('coaches/') && methodUpper === 'GET') {
    const slug = cleanPath.replace('coaches/', '');
    const coaches = getStored<CoachDetail[]>(STORAGE_KEYS.COACHES, INITIAL_COACHES);
    const coach = coaches.find((c) => c.slug === slug || c.id === slug);
    if (!coach) throw new ApiError('Coach not found', 404);
    return { message: 'ok', data: coach as unknown as T };
  }

  // 6. Bookings
  if (cleanPath === 'bookings' && methodUpper === 'POST') {
    const bookingReq = body as CreateBookingRequest;
    const coaches = getStored<CoachDetail[]>(STORAGE_KEYS.COACHES, INITIAL_COACHES);
    const coach = coaches.find((c) => c.slug === bookingReq.coach_slug) || coaches[0];
    const sessionType = coach.session_types.find((s) => s.id === bookingReq.session_type_id) || coach.session_types[0];
    const isFree = sessionType.price_centavos === 0;

    const newBooking: BookingItem = {
      id: `bkg_${Date.now()}`,
      coach_slug: coach.slug,
      coach_name: coach.name,
      coach_role: coach.current_role,
      coach_avatar_url: coach.avatar_url,
      session_type_id: sessionType.id,
      session_type_name: sessionType.name,
      session_duration: sessionType.duration_minutes,
      status: isFree ? 'confirmed' : 'pending',
      payment_status: isFree ? 'paid' : 'pending',
      slot_starts_at: bookingReq.slot_starts_at || new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
      join_url: isFree ? 'https://meet.google.com/abc-defg-hij' : undefined,
      notes: bookingReq.notes,
      price_centavos: sessionType.price_centavos,
      platform_fee_centavos: isFree ? 0 : Math.round(sessionType.price_centavos * 0.2),
      coach_payout_centavos: isFree ? 0 : Math.round(sessionType.price_centavos * 0.8),
      student_name: 'Clarisse Salazar',
      student_email: 'student@iskolar.ph',
    };

    const bookings = getStored<BookingItem[]>(STORAGE_KEYS.BOOKINGS, []);
    setStored(STORAGE_KEYS.BOOKINGS, [newBooking, ...bookings]);

    const res: CreateBookingResponse = {
      booking_id: newBooking.id,
      status: (newBooking.status === 'confirmed' ? 'confirmed' : 'pending') as 'confirmed' | 'pending',
      payment_status: (newBooking.payment_status === 'paid' ? 'none' : 'pending') as 'none' | 'pending',
      price_centavos: newBooking.price_centavos,
      platform_fee_centavos: newBooking.platform_fee_centavos,
      coach_payout_centavos: newBooking.coach_payout_centavos,
      checkout_url: isFree ? undefined : `https://checkout.paymongo.com/demo_cs_${newBooking.id}`,
    };
    return { message: isFree ? 'Session booked successfully!' : 'Proceed to checkout', data: res as unknown as T };
  }

  // 7. Student Portal
  if (cleanPath === 'me/bookings' && methodUpper === 'GET') {
    const bookings = getStored<BookingItem[]>(STORAGE_KEYS.BOOKINGS, [
      {
        id: 'bkg_demo_01',
        coach_slug: 'engr-mark-villanueva',
        coach_name: 'Engr. Mark Villanueva',
        coach_role: 'Senior Staff Engineer at Grab',
        coach_avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
        session_type_id: 'srv_01',
        session_type_name: 'Free 15-Min Career & OJT Discovery',
        session_duration: 15,
        status: 'confirmed',
        payment_status: 'paid',
        slot_starts_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
        join_url: 'https://meet.google.com/iskolar-mentor-session',
        notes: 'Preparing for Maya backend interview.',
        price_centavos: 0,
        platform_fee_centavos: 0,
        coach_payout_centavos: 0,
        student_name: 'Clarisse Salazar',
        student_email: 'student@iskolar.ph',
      },
    ]);
    return { message: 'ok', data: bookings as unknown as T };
  }

  if (cleanPath === 'me/saved' && methodUpper === 'GET') {
    const savedIds = getStored<string[]>(STORAGE_KEYS.SAVED, ['int_01', 'int_02']);
    const all = getStored<InternshipDetail[]>(STORAGE_KEYS.INTERNSHIPS, INITIAL_INTERNSHIPS);
    const saved = all.filter((i) => savedIds.includes(i.id));
    return { message: 'ok', data: saved as unknown as T };
  }

  if (cleanPath.startsWith('me/saved/') && methodUpper === 'PUT') {
    const id = cleanPath.replace('me/saved/', '');
    const savedIds = getStored<string[]>(STORAGE_KEYS.SAVED, []);
    if (!savedIds.includes(id)) {
      setStored(STORAGE_KEYS.SAVED, [...savedIds, id]);
    }
    return { message: 'Internship saved to bookmarks', data: { saved: true } as unknown as T };
  }

  if (cleanPath.startsWith('me/saved/') && methodUpper === 'DELETE') {
    const id = cleanPath.replace('me/saved/', '');
    const savedIds = getStored<string[]>(STORAGE_KEYS.SAVED, []);
    setStored(STORAGE_KEYS.SAVED, savedIds.filter((x) => x !== id));
    return { message: 'Internship removed from bookmarks', data: { saved: false } as unknown as T };
  }

  if (cleanPath === 'me/dashboard' && methodUpper === 'GET') {
    const savedIds = getStored<string[]>(STORAGE_KEYS.SAVED, ['int_01', 'int_02']);
    const bookings = getStored<BookingItem[]>(STORAGE_KEYS.BOOKINGS, []);

    const data: StudentDashboardData = {
      saved_count: savedIds.length,
      upcoming_sessions_count: bookings.filter((b) => b.status === 'confirmed').length,
      completeness_pct: 85,
    };
    return { message: 'ok', data: data as unknown as T };
  }

  // 8. Admin Moderation
  if (cleanPath === 'admin/internships' && methodUpper === 'GET') {
    const all = getStored<InternshipDetail[]>(STORAGE_KEYS.INTERNSHIPS, INITIAL_INTERNSHIPS);
    let filtered = all;
    if (params?.status && params.status !== 'all') {
      filtered = all.filter((i) => i.status === params.status);
    }
    return { message: 'ok', data: filtered as unknown as T };
  }

  if (cleanPath.endsWith('/withdraw') && cleanPath.startsWith('admin/internships/') && methodUpper === 'POST') {
    const id = cleanPath.replace('admin/internships/', '').replace('/withdraw', '');
    const all = getStored<InternshipDetail[]>(STORAGE_KEYS.INTERNSHIPS, INITIAL_INTERNSHIPS);
    const updated = all.map((i) => (i.id === id ? { ...i, status: 'withdrawn' as const } : i));
    setStored(STORAGE_KEYS.INTERNSHIPS, updated);
    return { message: 'Listing withdrawn successfully', data: { id, status: 'withdrawn' } as unknown as T };
  }

  return null;
}
