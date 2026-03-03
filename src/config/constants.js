/* ─── Event Info ─── */
export const EVENT = {
  name: 'NIRMAVORA FEST 2026',
  tagline: 'Where Ideas Take Shape',
  date: '2026-02-19',
  dateDisplay: '19 February 2026',
  registrationDeadline: '2026-02-17T23:59:59',
  hackathonStart: '10:00 AM',
  hackathonEnd: '6:00 PM',
  hackathonDuration: '8 Hours',
  assembleBy: '8:30 AM',
  feePerHead: 350,
  teamMin: 3,
  teamMax: 4,
  contactPhone: '+91 99625 31002',
  contactEmail: 'nirmavora2k26@gmail.com',
  upiId: import.meta.env.VITE_UPI_ID || '',
  upiName: import.meta.env.VITE_UPI_NAME || 'NIRMAVORA FEST 2026',
};

/* ─── Organisers ─── */
export const ORGANISERS = {
  departments: [
    'Department of Civil Engineering',
    'Department of Mechanical Engineering',
  ],
  clubs: [
    'ICI Sustainable Engineers Club',
    'Engineers Without Borders',
  ],
};

/* ─── Events ─── */
export const EVENTS = {
  DESIGNATHON: 'designathon',
  HACKATHON: 'hackathon',
};

/* ─── Designathon Themes ─── */
export const DESIGNATHON_THEMES = {
  civil: [
    'Smart & Sustainable Infrastructure',
    'Innovative Construction Materials',
    'Transportation & Traffic Optimization',
    'Water & Environmental Engineering',
  ],
  mechanical: [
    'Sustainable Energy Systems',
    'Automation & Smart Mechanisms',
    'Product Design & Innovation',
    'Thermal & Fluid Systems',
  ],
};

/* ─── Hackathon Tracks ─── */
export const HACKATHON_TRACKS = {
  software: [
    'Web & Mobile Applications',
    'AI / ML Solutions',
    'IoT & Smart Systems',
    'Data Analytics & Visualization',
  ],
  hardware: [
    'Embedded Systems',
    'Robotics & Automation',
    'Sensor-based Solutions',
    'Renewable Energy Prototypes',
  ],
};

/* ─── Timeline ─── */
export const TIMELINE = [
  { time: '8:30 AM', title: 'Assembly', desc: 'All participants must assemble' },
  { time: '9:00 – 10:00 AM', title: 'Inauguration', desc: 'Opening ceremony' },
  { time: '10:00 AM – 6:00 PM', title: 'Hackathon', desc: '8-hour build session' },
  { time: '11:00 – 12:00 PM', title: 'First Review', desc: 'Mentoring round' },
  { time: '6:00 PM', title: 'Prize Distribution', desc: 'Closing & awards' },
];

export const CANTEEN = {
  morningOpen: '8:00 AM',
  dinnerClose: '8:30 PM',
};

/* ─── Facilities included in fee ─── */
export const FACILITIES = ['Lunch', 'Refreshments', 'ID Card', 'Event Kit'];

/* ─── SDG Goals dropdown ─── */
export const SDG_GOALS = [
  { value: '1', label: 'SDG 1 – No Poverty' },
  { value: '2', label: 'SDG 2 – Zero Hunger' },
  { value: '3', label: 'SDG 3 – Good Health & Well-Being' },
  { value: '4', label: 'SDG 4 – Quality Education' },
  { value: '5', label: 'SDG 5 – Gender Equality' },
  { value: '6', label: 'SDG 6 – Clean Water & Sanitation' },
  { value: '7', label: 'SDG 7 – Affordable & Clean Energy' },
  { value: '8', label: 'SDG 8 – Decent Work & Economic Growth' },
  { value: '9', label: 'SDG 9 – Industry, Innovation & Infrastructure' },
  { value: '10', label: 'SDG 10 – Reduced Inequalities' },
  { value: '11', label: 'SDG 11 – Sustainable Cities & Communities' },
  { value: '12', label: 'SDG 12 – Responsible Consumption & Production' },
  { value: '13', label: 'SDG 13 – Climate Action' },
  { value: '14', label: 'SDG 14 – Life Below Water' },
  { value: '15', label: 'SDG 15 – Life on Land' },
  { value: '16', label: 'SDG 16 – Peace, Justice & Strong Institutions' },
  { value: '17', label: 'SDG 17 – Partnerships for the Goals' },
];

/* ─── Departments ─── */
export const DEPARTMENTS = [
  'Civil Engineering',
  'Mechanical Engineering',
  'Computer Science & Engineering',
  'Electronics & Communication',
  'Electrical & Electronics',
  'Information Technology',
  'Artificial Intelligence & ML',
  'Data Science',
  'Biomedical Engineering',
  'Biotechnology',
  'Other',
];

/* ─── Years ─── */
export const YEARS = ['I Year', 'II Year', 'III Year', 'IV Year'];

/* ─── User Roles ─── */
export const ROLES = {
  PARTICIPANT: 'participant',
  ORGANISER: 'organiser',
  ADMIN: 'admin',
};

/* ─── Team Status ─── */
export const TEAM_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  WAITLISTED: 'waitlisted',
  CANCELLED: 'cancelled',
};

/* ─── Payment Status ─── */
export const PAYMENT_STATUS = {
  NOT_PAID: 'not_paid',
  UPLOADED: 'uploaded',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
};

/* ─── Developer Contact ─── */
export const DEVELOPER = {
  name: 'Harish Pranav',
  email: 'harishspranav2006@gmail.com',
  phone: '+91 78456 93765',
  phoneRaw: '7845693765',
};
