// Comprehensive RV University Realistic Dataset for Standalone Demo Mode and Offline Fallback

export const MOCK_NOTICES = [
  {
    _id: 'notice-1',
    id: 'notice-1',
    title: 'End-Semester Examination Schedule - Winter 2026',
    description: 'The Controller of Examinations has published the final timetable for the End-Semester Examinations across SoCSE, SoB, SoDI, and SoL. Theory exams commence on December 1st, 2026.',
    date: 'Today at 09:30 AM',
    priority: 'Urgent',
    author: 'Office of the Controller of Examinations',
    authorRole: 'Central Administration'
  },
  {
    _id: 'notice-2',
    id: 'notice-2',
    title: 'RVU Annual Hackathon: InnovateX 2026 Registrations Open',
    description: 'School of Computer Science and Engineering invites teams of 2-4 students for InnovateX 2026. Themes include Generative AI, Cloud Infrastructure, and Sustainable Tech. Cash prize pool: ₹2,50,000.',
    date: 'Yesterday at 04:15 PM',
    priority: 'Academic Circular',
    author: 'Dr. Ramesh Kumar',
    authorRole: 'Faculty Coordinator - SoCSE'
  },
  {
    _id: 'notice-3',
    id: 'notice-3',
    title: 'Extended Library & Digital Resource Center Working Hours',
    description: 'In view of upcoming continuous internal assessments and capstone project submissions, the Central Library will remain operational until 11:00 PM on all weekdays with active high-speed campus WiFi.',
    date: 'Nov 07, 2026',
    priority: 'General Notice',
    author: 'Chief Librarian',
    authorRole: 'Campus Facilities'
  },
  {
    _id: 'notice-4',
    id: 'notice-4',
    title: 'Guest Lecture: Scalable Microservices Architecture with Google Cloud',
    description: 'Join industry experts from Google Cloud Platform for an exclusive interactive session on building resilient enterprise microservices and Kubernetes deployments in the RVU Auditorium.',
    date: 'Nov 05, 2026',
    priority: 'Academic Circular',
    author: 'Prof. Arvind Rao',
    authorRole: 'Faculty Instructor - Networks'
  },
  {
    _id: 'notice-5',
    id: 'notice-5',
    title: 'Mandatory Attendance Review for Pre-Final Term',
    description: 'All students are reminded to ensure minimum 75% attendance across all registered courses. Low attendance warnings have been dispatched to student registered emails.',
    date: 'Nov 03, 2026',
    priority: 'Urgent',
    author: 'Dr. K. S. Sridhar',
    authorRole: 'Dean of Academic Affairs'
  }
];

export const MOCK_COURSES = [
  {
    id: 'course-1',
    _id: 'course-1',
    courseId: 'CS301',
    name: 'Full Stack Web Development & Microservices',
    section: 'Section A - 3rd Year',
    instructor: 'Dr. Ramesh Kumar',
    instructorEmail: 'faculty@rvu.edu.in',
    department: 'SoCSE',
    credits: 4,
    description: 'Modern full-stack engineering using React, Node.js, Express, MongoDB, and cloud deployment pipelines.',
    color: '#166534'
  },
  {
    id: 'course-2',
    _id: 'course-2',
    courseId: 'CS302',
    name: 'Database Management Systems & Distributed Databases',
    section: 'Section B - 3rd Year',
    instructor: 'Prof. Ananya Sharma',
    instructorEmail: 'ananya.sharma@rvu.edu.in',
    department: 'SoCSE',
    credits: 4,
    description: 'Relational database modeling, query optimization, ACID compliance, and MongoDB document architectures.',
    color: '#1e40af'
  },
  {
    id: 'course-3',
    _id: 'course-3',
    courseId: 'CS303',
    name: 'Computer Networks & Network Security Protocols',
    section: 'Section A - 3rd Year',
    instructor: 'Dr. Arvind Rao',
    instructorEmail: 'arvind.rao@rvu.edu.in',
    department: 'SoCSE',
    credits: 3,
    description: 'OSI and TCP/IP protocol suites, socket programming, cryptography, and network defense strategies.',
    color: '#991b1b'
  },
  {
    id: 'course-4',
    _id: 'course-4',
    courseId: 'AI304',
    name: 'Applied Machine Learning & Neural Networks',
    section: 'Elective 1',
    instructor: 'Dr. Priya Sundaram',
    instructorEmail: 'priya.sundaram@rvu.edu.in',
    department: 'SoCSE',
    credits: 4,
    description: 'Supervised and unsupervised learning algorithms, deep learning architectures, and model deployment.',
    color: '#7c3aed'
  },
  {
    id: 'course-5',
    _id: 'course-5',
    courseId: 'DS201',
    name: 'Human-Centered Design Systems & UI/UX',
    section: 'Interdisciplinary Minor',
    instructor: 'Prof. Vikram Nambiar',
    instructorEmail: 'vikram.nambiar@rvu.edu.in',
    department: 'SoDI',
    credits: 3,
    description: 'User research, wireframing, high-fidelity Figma prototyping, and usability heuristic evaluations.',
    color: '#c2410c'
  }
];

export const MOCK_ASSIGNMENTS = [
  {
    id: 'assn-1',
    _id: 'assn-1',
    title: 'Full Stack MERN Portal Implementation - Phase 1',
    course: 'Full Stack Web Development & Microservices',
    courseId: 'course-1',
    description: 'Build and deploy a scalable campus portal with JWT authentication, role-based access control (Student, Faculty, Admin), and seamless MongoDB persistence.',
    dueDate: 'Next Friday at 11:59 PM',
    maxPoints: 100,
    status: 'Assigned',
    submission: null
  },
  {
    id: 'assn-2',
    _id: 'assn-2',
    title: 'Distributed Query Optimization & Indexing Lab',
    course: 'Database Management Systems & Distributed Databases',
    courseId: 'course-2',
    description: 'Analyze query execution plans using MongoDB explain() and PostgreSQL EXPLAIN ANALYZE. Optimize compound indexes on high-cardinality collections.',
    dueDate: 'Nov 18, 2026',
    maxPoints: 50,
    status: 'Submitted',
    submission: {
      submissionText: 'Completed indexing benchmark report. Compound index reduced execution time by 84%. GitHub repo attached.',
      submissionLink: 'https://github.com/rvu-student/dbms-lab-benchmark',
      submittedAt: 'Nov 08, 2026',
      grade: 48,
      feedback: 'Excellent query analysis and index cardinality explanation.'
    }
  },
  {
    id: 'assn-3',
    _id: 'assn-3',
    title: 'Packet Sniffing & TLS Handshake Cryptanalysis',
    course: 'Computer Networks & Network Security Protocols',
    courseId: 'course-3',
    description: 'Capture and inspect TLS 1.3 key exchange packets using Wireshark. Document cipher suites, certificate validation, and Diffie-Hellman parameters.',
    dueDate: 'Nov 22, 2026',
    maxPoints: 50,
    status: 'Assigned',
    submission: null
  },
  {
    id: 'assn-4',
    _id: 'assn-4',
    title: 'Convolutional Neural Network for Medical Imaging',
    course: 'Applied Machine Learning & Neural Networks',
    courseId: 'course-4',
    description: 'Train a ResNet-50 transfer learning model to classify chest X-ray scans. Implement data augmentation and evaluate with precision, recall, and AUC-ROC.',
    dueDate: 'Nov 25, 2026',
    maxPoints: 100,
    status: 'Assigned',
    submission: null
  }
];

export const MOCK_ATTENDANCE = {
  overallPercentage: 88.5,
  totalConducted: 142,
  totalAttended: 126,
  status: 'Eligible for Examinations',
  courses: [
    {
      courseCode: 'CS301',
      courseName: 'Full Stack Web Development & Microservices',
      instructor: 'Dr. Ramesh Kumar',
      attended: 32,
      total: 35,
      percentage: 91.4,
      status: 'Excellent'
    },
    {
      courseCode: 'CS302',
      courseName: 'Database Management Systems',
      instructor: 'Prof. Ananya Sharma',
      attended: 28,
      total: 32,
      percentage: 87.5,
      status: 'Good'
    },
    {
      courseCode: 'CS303',
      courseName: 'Computer Networks & Protocols',
      instructor: 'Dr. Arvind Rao',
      attended: 26,
      total: 30,
      percentage: 86.7,
      status: 'Good'
    },
    {
      courseCode: 'AI304',
      courseName: 'Applied Machine Learning',
      instructor: 'Dr. Priya Sundaram',
      attended: 24,
      total: 27,
      percentage: 88.9,
      status: 'Good'
    },
    {
      courseCode: 'DS201',
      courseName: 'Human-Centered Design Systems',
      instructor: 'Prof. Vikram Nambiar',
      attended: 16,
      total: 18,
      percentage: 88.9,
      status: 'Good'
    }
  ]
};

export const MOCK_ADMIN_METRICS = {
  studentsCount: 1420,
  facultyCount: 86,
  totalAssignments: 34,
  totalSubmissions: 1180,
  schoolsCount: 5,
  activeClassrooms: 42
};

export const MOCK_USERS_LIST = [
  {
    id: 'user-adm-1',
    name: 'Campus IT Administrator',
    email: 'admin@rvu.edu.in',
    role: 'admin',
    empId: 'RVU-ADM-01',
    department: 'Central IT Administration',
    status: 'Active'
  },
  {
    id: 'user-adm-2',
    name: 'Dr. K. S. Sridhar',
    email: 'dean.academics@rvu.edu.in',
    role: 'admin',
    empId: 'RVU-ADM-02',
    department: 'Office of the Academic Dean',
    status: 'Active'
  },
  {
    id: 'user-adm-3',
    name: 'Dr. D. P. Nagaraj',
    email: 'registrar@rvu.edu.in',
    role: 'admin',
    empId: 'RVU-ADM-03',
    department: 'Office of the Registrar',
    status: 'Active'
  },
  {
    id: 'user-fac-1',
    name: 'Dr. Ramesh Kumar',
    email: 'faculty@rvu.edu.in',
    role: 'faculty',
    empId: 'RVU-FAC-042',
    department: 'School of Computer Science & Engineering',
    status: 'Active'
  },
  {
    id: 'user-fac-2',
    name: 'Prof. Ananya Sharma',
    email: 'ananya.sharma@rvu.edu.in',
    role: 'faculty',
    empId: 'RVU-FAC-019',
    department: 'School of Computer Science & Engineering',
    status: 'Active'
  },
  {
    id: 'user-fac-3',
    name: 'Dr. Arvind Rao',
    email: 'arvind.rao@rvu.edu.in',
    role: 'faculty',
    empId: 'RVU-FAC-088',
    department: 'School of Computer Science & Engineering',
    status: 'Active'
  },
  {
    id: 'user-fac-4',
    name: 'Dr. Priya Sundaram',
    email: 'priya.sundaram@rvu.edu.in',
    role: 'faculty',
    empId: 'RVU-FAC-063',
    department: 'School of Computer Science & Engineering',
    status: 'Active'
  },
  {
    id: 'user-fac-5',
    name: 'Prof. Vikram Nambiar',
    email: 'vikram.nambiar@rvu.edu.in',
    role: 'faculty',
    empId: 'RVU-FAC-077',
    department: 'School of Design & Innovation',
    status: 'Active'
  },
  {
    id: 'user-std-1',
    name: 'Test Student',
    email: 'student@rvu.edu.in',
    role: 'student',
    usn: '1RV21CS001',
    branch: 'SoCSE',
    year: '3',
    status: 'Active'
  },
  {
    id: 'user-std-2',
    name: 'Nishit Patel',
    email: 'patelnishitkumarbsc24@rvu.edu.in',
    role: 'student',
    usn: '1RUA24SCS0068',
    branch: 'SoCSE',
    year: '2',
    status: 'Active'
  },
  {
    id: 'user-std-3',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@rvu.edu.in',
    role: 'student',
    usn: '1RV22CS014',
    branch: 'SoCSE',
    year: '3',
    status: 'Active'
  },
  {
    id: 'user-std-4',
    name: 'Diya Reddy',
    email: 'diya.reddy@rvu.edu.in',
    role: 'student',
    usn: '1RV22CS032',
    branch: 'SoCSE',
    year: '3',
    status: 'Active'
  },
  {
    id: 'user-std-5',
    name: 'Rohan Verma',
    email: 'rohan.verma@rvu.edu.in',
    role: 'student',
    usn: '1RV22CS085',
    branch: 'SoCSE',
    year: '3',
    status: 'Active'
  },
  {
    id: 'user-std-6',
    name: 'Ananya Deshmukh',
    email: 'ananya.deshmukh@rvu.edu.in',
    role: 'student',
    usn: '1RV23AIML022',
    branch: 'SoCSE - AI & ML',
    year: '2',
    status: 'Active'
  },
  {
    id: 'user-std-7',
    name: 'Meera Iyer',
    email: 'meera.iyer@rvu.edu.in',
    role: 'student',
    usn: '1RV23BBA045',
    branch: 'School of Business',
    year: '2',
    status: 'Active'
  },
  {
    id: 'user-std-8',
    name: 'Tanvi Joshi',
    email: 'tanvi.joshi@rvu.edu.in',
    role: 'student',
    usn: '1RV22DES019',
    branch: 'School of Design & Innovation',
    year: '3',
    status: 'Active'
  }
];

export const MOCK_SYSTEM_AUDIT = {
  serverStatus: 'Online (Production Ready)',
  databaseStatus: 'Operational (Mongoose + Seed Cluster)',
  authGateway: 'JWT RSA-256 Validated',
  googleClassroomAPI: 'Connected (Simulation & Live OAuth Ready)',
  activeSessions: 18,
  uptime: '99.98%',
  lastBackup: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
};
