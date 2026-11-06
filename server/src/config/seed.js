const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Notice = require('../models/Notice');
const Attendance = require('../models/Attendance');
const Submission = require('../models/Submission');

const seedDB = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('password123', salt);
    const facultyPasswordHash = await bcrypt.hash('faculty123', salt);
    const adminPasswordHash = await bcrypt.hash('admin123', salt);

    // ==========================================
    // 1. COMPREHENSIVE RV UNIVERSITY USERS
    // ==========================================
    const usersToSeed = [
      // --- ADMINISTRATORS ---
      {
        name: 'Campus IT Administrator',
        email: 'admin@rvu.edu.in',
        password: adminPasswordHash,
        role: 'admin',
        empId: 'RVU-ADM-01',
        department: 'Central IT Administration'
      },
      {
        name: 'Dr. K. S. Sridhar',
        email: 'dean.academics@rvu.edu.in',
        password: adminPasswordHash,
        role: 'admin',
        empId: 'RVU-ADM-02',
        department: 'Office of the Academic Dean'
      },
      {
        name: 'Dr. D. P. Nagaraj',
        email: 'registrar@rvu.edu.in',
        password: adminPasswordHash,
        role: 'admin',
        empId: 'RVU-ADM-03',
        department: 'Office of the Registrar'
      },
      {
        name: 'Prof. Manjunath Swamy',
        email: 'exam.controller@rvu.edu.in',
        password: adminPasswordHash,
        role: 'admin',
        empId: 'RVU-ADM-04',
        department: 'Controller of Examinations'
      },

      // --- FACULTY MEMBERS ---
      {
        name: 'Dr. Ramesh Kumar',
        email: 'faculty@rvu.edu.in',
        password: facultyPasswordHash,
        role: 'faculty',
        empId: 'RVU-FAC-042',
        department: 'SoCSE'
      },
      {
        name: 'Prof. Ananya Sharma',
        email: 'ananya.sharma@rvu.edu.in',
        password: facultyPasswordHash,
        role: 'faculty',
        empId: 'RVU-FAC-019',
        department: 'SoCSE'
      },
      {
        name: 'Dr. Arvind Rao',
        email: 'arvind.rao@rvu.edu.in',
        password: facultyPasswordHash,
        role: 'faculty',
        empId: 'RVU-FAC-088',
        department: 'SoCSE'
      },
      {
        name: 'Dr. Priya Sundaram',
        email: 'priya.sundaram@rvu.edu.in',
        password: facultyPasswordHash,
        role: 'faculty',
        empId: 'RVU-FAC-063',
        department: 'SoCSE'
      },
      {
        name: 'Prof. Venkatesh Iyer',
        email: 'venkatesh.iyer@rvu.edu.in',
        password: facultyPasswordHash,
        role: 'faculty',
        empId: 'RVU-FAC-031',
        department: 'SoCSE'
      },
      {
        name: 'Dr. Shalini Murthy',
        email: 'shalini.murthy@rvu.edu.in',
        password: facultyPasswordHash,
        role: 'faculty',
        empId: 'RVU-FAC-105',
        department: 'SoB'
      },
      {
        name: 'Prof. Vikram Nambiar',
        email: 'vikram.nambiar@rvu.edu.in',
        password: facultyPasswordHash,
        role: 'faculty',
        empId: 'RVU-FAC-077',
        department: 'SoDI'
      },
      {
        name: 'Dr. Deepa Hegde',
        email: 'deepa.hegde@rvu.edu.in',
        password: facultyPasswordHash,
        role: 'faculty',
        empId: 'RVU-FAC-052',
        department: 'SoE'
      },

      // --- STUDENTS ACROSS 5 SCHOOLS ---
      {
        name: 'Test Student',
        email: 'student@rvu.edu.in',
        password: defaultPasswordHash,
        role: 'student',
        usn: '1RV21CS001',
        branch: 'SoCSE',
        year: '3'
      },
      {
        name: 'Nishit Patel',
        email: 'patelnishitkumarbsc24@rvu.edu.in',
        password: defaultPasswordHash,
        role: 'student',
        usn: '1RUA24SCS0068',
        branch: 'SoCSE',
        year: '2'
      },
      {
        name: 'Aarav Sharma',
        email: 'aarav.sharma@rvu.edu.in',
        password: defaultPasswordHash,
        role: 'student',
        usn: '1RV22CS014',
        branch: 'SoCSE',
        year: '3'
      },
      {
        name: 'Diya Reddy',
        email: 'diya.reddy@rvu.edu.in',
        password: defaultPasswordHash,
        role: 'student',
        usn: '1RV22CS032',
        branch: 'SoCSE',
        year: '3'
      },
      {
        name: 'Rohan Verma',
        email: 'rohan.verma@rvu.edu.in',
        password: defaultPasswordHash,
        role: 'student',
        usn: '1RV22CS085',
        branch: 'SoCSE',
        year: '3'
      },
      {
        name: 'Ananya Deshmukh',
        email: 'ananya.deshmukh@rvu.edu.in',
        password: defaultPasswordHash,
        role: 'student',
        usn: '1RV23AI019',
        branch: 'SoCSE',
        year: '2'
      },
      {
        name: 'Kavya Nair',
        email: 'kavya.nair@rvu.edu.in',
        password: defaultPasswordHash,
        role: 'student',
        usn: '1RV21IS044',
        branch: 'SoCSE',
        year: '4'
      },
      {
        name: 'Siddharth Menon',
        email: 'siddharth.menon@rvu.edu.in',
        password: defaultPasswordHash,
        role: 'student',
        usn: '1RV22EC058',
        branch: 'SoCSE',
        year: '3'
      },
      {
        name: 'Meera Iyer',
        email: 'meera.iyer@rvu.edu.in',
        password: defaultPasswordHash,
        role: 'student',
        usn: '1RV23BA022',
        branch: 'SoB',
        year: '2'
      },
      {
        name: 'Arjun Kapoor',
        email: 'arjun.kapoor@rvu.edu.in',
        password: defaultPasswordHash,
        role: 'student',
        usn: '1RV22BA089',
        branch: 'SoB',
        year: '3'
      },
      {
        name: 'Tanvi Joshi',
        email: 'tanvi.joshi@rvu.edu.in',
        password: defaultPasswordHash,
        role: 'student',
        usn: '1RV23DI015',
        branch: 'SoDI',
        year: '2'
      },
      {
        name: 'Varun Choudhury',
        email: 'varun.choudhury@rvu.edu.in',
        password: defaultPasswordHash,
        role: 'student',
        usn: '1RV22DI041',
        branch: 'SoDI',
        year: '3'
      },
      {
        name: 'Priyanka Sen',
        email: 'priyanka.sen@rvu.edu.in',
        password: defaultPasswordHash,
        role: 'student',
        usn: '1RV23EP009',
        branch: 'SoE',
        year: '2'
      },
      {
        name: 'Aditya Bhat',
        email: 'aditya.bhat@rvu.edu.in',
        password: defaultPasswordHash,
        role: 'student',
        usn: '1RV22LS031',
        branch: 'SoLAS',
        year: '3'
      },
      {
        name: 'Sneha Kulkarni',
        email: 'sneha.kulkarni@rvu.edu.in',
        password: defaultPasswordHash,
        role: 'student',
        usn: '1RV24CS102',
        branch: 'SoCSE',
        year: '1'
      }
    ];

    for (const u of usersToSeed) {
      const exists = await User.findOne({ email: u.email.toLowerCase() });
      if (!exists) {
        await User.create(u);
      }
    }
    console.log(`Verified & seeded ${usersToSeed.length} institutional users in MongoDB`);

    // ==========================================
    // 2. COURSES ACROSS RV UNIVERSITY SCHOOLS
    // ==========================================
    const coursesToSeed = [
      {
        code: 'CS301',
        name: 'CS301 - Full Stack Web Development',
        section: 'CSE Sem 5 - Section A',
        room: 'Lab 402',
        schedule: 'Mon, Wed 10:00 AM',
        faculty: 'Dr. Ramesh Kumar',
        enrollmentCode: 'rvu-cs301-web',
        enrolledStudents: 42
      },
      {
        code: 'CS304',
        name: 'CS304 - Database Management Systems',
        section: 'CSE Sem 5 - Section A',
        room: 'Hall 201',
        schedule: 'Tue, Thu 02:00 PM',
        faculty: 'Prof. Ananya Sharma',
        enrollmentCode: 'rvu-cs304-db',
        enrolledStudents: 38
      },
      {
        code: 'CS308',
        name: 'CS308 - Computer Networks & Security',
        section: 'CSE Sem 5 - Section B',
        room: 'Lab 305',
        schedule: 'Fri 09:00 AM',
        faculty: 'Dr. Arvind Rao',
        enrollmentCode: 'rvu-cs308-net',
        enrolledStudents: 45
      },
      {
        code: 'AI201',
        name: 'AI201 - Intro to Machine Learning & Data Science',
        section: 'CSE Sem 5 - Elective',
        room: 'Hall 105',
        schedule: 'Wed, Fri 11:30 AM',
        faculty: 'Dr. Priya Sundaram',
        enrollmentCode: 'rvu-ai201-ml',
        enrolledStudents: 50
      },
      {
        code: 'MA202',
        name: 'MA202 - Discrete Mathematics & Graph Theory',
        section: 'CSE Sem 5 - Core',
        room: 'Auditorium 2',
        schedule: 'Mon, Thu 01:00 PM',
        faculty: 'Prof. Venkatesh Iyer',
        enrollmentCode: 'rvu-ma202-dm',
        enrolledStudents: 60
      },
      {
        code: 'CS402',
        name: 'CS402 - Cloud Computing & Distributed Systems',
        section: 'CSE Sem 7 - Core',
        room: 'Lab 204',
        schedule: 'Tue, Fri 03:30 PM',
        faculty: 'Dr. Ramesh Kumar',
        enrollmentCode: 'rvu-cs402-cld',
        enrolledStudents: 35
      },
      {
        code: 'UX210',
        name: 'UX210 - Digital Product Design & Usability Testing',
        section: 'SoDI Sem 3 - Studio',
        room: 'Design Studio 3',
        schedule: 'Tue 10:00 AM',
        faculty: 'Prof. Vikram Nambiar',
        enrollmentCode: 'rvu-ux210-des',
        enrolledStudents: 28
      },
      {
        code: 'BA305',
        name: 'BA305 - Business Analytics & Decision Models',
        section: 'SoB Sem 5 - Core',
        room: 'Seminar Hall A',
        schedule: 'Thu 11:00 AM',
        faculty: 'Dr. Shalini Murthy',
        enrollmentCode: 'rvu-ba305-ana',
        enrolledStudents: 32
      }
    ];

    for (const c of coursesToSeed) {
      const exists = await Course.findOne({ code: c.code });
      if (!exists) {
        await Course.create(c);
      }
    }
    console.log(`Verified & seeded ${coursesToSeed.length} catalog courses in MongoDB`);

    // ==========================================
    // 3. COURSEWORK / ASSIGNMENTS
    // ==========================================
    const assignmentsToSeed = [
      {
        title: 'Sprint 2: RESTful API & Authentication Architecture',
        courseName: 'CS301 - Full Stack Web Development',
        description: 'Build robust JWT authentication with Express, define Mongoose models, and implement protected role-based routes.',
        due: 'Nov 12, 2026',
        points: '100 pts',
        status: 'Due Soon',
        createdBy: 'Dr. Ramesh Kumar'
      },
      {
        title: 'Normalization (1NF to BCNF) & SQL Query Optimization Problem Set',
        courseName: 'CS304 - Database Management Systems',
        description: 'Analyze schema dependencies, perform lossless joins decomposition up to BCNF, and optimize indexed execution plans.',
        due: 'Nov 15, 2026',
        points: '50 pts',
        status: 'Assigned',
        createdBy: 'Prof. Ananya Sharma'
      },
      {
        title: 'Wireshark Packet Analysis: TCP 3-Way Handshake & TLS Decryption',
        courseName: 'CS308 - Computer Networks & Security',
        description: 'Capture packet traces, inspect TCP window size negotiations, and decrypt TLS sessions using master key logs.',
        due: 'Nov 18, 2026',
        points: '75 pts',
        status: 'Assigned',
        createdBy: 'Dr. Arvind Rao'
      },
      {
        title: 'Supervised Learning: Decision Trees vs Random Forest Benchmarking',
        courseName: 'AI201 - Intro to Machine Learning & Data Science',
        description: 'Train decision tree and ensemble models on the Kaggle dataset. Submit ROC curves, confusion matrix, and F1 comparisons.',
        due: 'Nov 22, 2026',
        points: '100 pts',
        status: 'Assigned',
        createdBy: 'Dr. Priya Sundaram'
      },
      {
        title: 'Graph Theory: Dijkstra & Bellman-Ford Shortest Path Verification',
        courseName: 'MA202 - Discrete Mathematics & Graph Theory',
        description: 'Implement shortest path proofs on weighted directed acyclic graphs and handle negative weight detection.',
        due: 'Nov 25, 2026',
        points: '50 pts',
        status: 'Assigned',
        createdBy: 'Prof. Venkatesh Iyer'
      },
      {
        title: 'Microservices Containerization with Docker Compose & Kubernetes Pods',
        courseName: 'CS402 - Cloud Computing & Distributed Systems',
        description: 'Containerize frontend, backend, and MongoDB replica sets with Docker Compose and write Kubernetes deployment manifests.',
        due: 'Nov 28, 2026',
        points: '100 pts',
        status: 'Assigned',
        createdBy: 'Dr. Ramesh Kumar'
      },
      {
        title: 'Figma Interactive High-Fidelity Prototype & Heuristic Evaluation',
        courseName: 'UX210 - Digital Product Design & Usability Testing',
        description: 'Design mobile and desktop flows with auto-layout and design tokens. Conduct user testing on 5 participants.',
        due: 'Dec 02, 2026',
        points: '80 pts',
        status: 'Assigned',
        createdBy: 'Prof. Vikram Nambiar'
      }
    ];

    for (const a of assignmentsToSeed) {
      const exists = await Assignment.findOne({ title: a.title });
      if (!exists) {
        await Assignment.create(a);
      }
    }
    console.log(`Verified & seeded ${assignmentsToSeed.length} assignments in MongoDB`);

    // ==========================================
    // 4. PRE-SEEDED STUDENT SUBMISSIONS
    // ==========================================
    const sprintAssn = await Assignment.findOne({ title: /Sprint 2: RESTful API/i });
    const dbAssn = await Assignment.findOne({ title: /Normalization/i });
    const netAssn = await Assignment.findOne({ title: /Wireshark Packet Analysis/i });

    const studentUser = await User.findOne({ email: 'student@rvu.edu.in' });
    const nishitUser = await User.findOne({ email: 'patelnishitkumarbsc24@rvu.edu.in' });
    const aaravUser = await User.findOne({ email: 'aarav.sharma@rvu.edu.in' });
    const diyaUser = await User.findOne({ email: 'diya.reddy@rvu.edu.in' });
    const rohanUser = await User.findOne({ email: 'rohan.verma@rvu.edu.in' });

    if (sprintAssn && studentUser) {
      const subExists = await Submission.findOne({ assignmentId: sprintAssn._id, studentId: studentUser._id });
      if (!subExists) {
        await Submission.create({
          assignmentId: sprintAssn._id,
          studentId: studentUser._id,
          studentName: studentUser.name,
          studentEmail: studentUser.email,
          studentUsn: studentUser.usn || '1RV21CS001',
          submissionText: 'Implemented full JWT authentication flow, protected routes, and connected MongoDB models with Mongoose.',
          submissionLink: 'https://github.com/student-rvu/fullstack-sprint2',
          status: 'Graded',
          grade: '95/100',
          feedback: 'Excellent modular architecture, robust password hashing, and clean controller segregation.',
          submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        });
      }
    }

    if (sprintAssn && nishitUser) {
      const subExists = await Submission.findOne({ assignmentId: sprintAssn._id, studentId: nishitUser._id });
      if (!subExists) {
        await Submission.create({
          assignmentId: sprintAssn._id,
          studentId: nishitUser._id,
          studentName: nishitUser.name,
          studentEmail: nishitUser.email,
          studentUsn: nishitUser.usn || '1RUA24SCS0068',
          submissionText: 'Production-ready MERN backend with Express 5, role-based authorization, and automated 16-point smoke test suite.',
          submissionLink: 'https://github.com/nish-debug15/campus-connect-portal',
          status: 'Graded',
          grade: '98/100',
          feedback: 'Outstanding end-to-end full stack execution. Express 5 SPA fallback and RBAC middleware executed flawlessly.',
          submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        });
      }
    }

    if (dbAssn && aaravUser) {
      const subExists = await Submission.findOne({ assignmentId: dbAssn._id, studentId: aaravUser._id });
      if (!subExists) {
        await Submission.create({
          assignmentId: dbAssn._id,
          studentId: aaravUser._id,
          studentName: aaravUser.name,
          studentEmail: aaravUser.email,
          studentUsn: aaravUser.usn,
          submissionText: 'Solved normalization problem set. Decomposed hospital management relation to BCNF with functional dependency proofs.',
          submissionLink: 'https://github.com/aarav-sharma/dbms-normalization-lab',
          status: 'Graded',
          grade: '48/50',
          feedback: 'Precise canonical cover derivation and minimal basis calculations.',
          submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        });
      }
    }

    if (netAssn && diyaUser) {
      const subExists = await Submission.findOne({ assignmentId: netAssn._id, studentId: diyaUser._id });
      if (!subExists) {
        await Submission.create({
          assignmentId: netAssn._id,
          studentId: diyaUser._id,
          studentName: diyaUser.name,
          studentEmail: diyaUser.email,
          studentUsn: diyaUser.usn,
          submissionText: 'Captured pcap traces for HTTP/2 vs HTTP/3 QUIC connection establishment and analyzed round-trip latency.',
          submissionLink: 'https://github.com/diya-reddy/wireshark-tcp-analysis',
          status: 'Submitted',
          grade: null,
          feedback: null,
          submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
        });
      }
    }

    if (sprintAssn && rohanUser) {
      const subExists = await Submission.findOne({ assignmentId: sprintAssn._id, studentId: rohanUser._id });
      if (!subExists) {
        await Submission.create({
          assignmentId: sprintAssn._id,
          studentId: rohanUser._id,
          studentName: rohanUser.name,
          studentEmail: rohanUser.email,
          studentUsn: rohanUser.usn,
          submissionText: 'Completed authentication endpoints and integrated refresh token cookies.',
          submissionLink: 'https://github.com/rohan-verma/sprint2-auth',
          status: 'Submitted',
          grade: null,
          feedback: null,
          submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
        });
      }
    }
    console.log('Verified & seeded student coursework submissions in MongoDB');

    // ==========================================
    // 5. OFFICIAL NOTICES & CIRCULARS
    // ==========================================
    const noticesToSeed = [
      {
        title: 'Capstone Project Phase 1 Architecture Review & Submission Guidelines',
        courseName: 'CS301 - Full Stack Web Development',
        description: 'Submit your architecture diagrams, database schemas, and REST API documentation to the classroom portal before midnight. Evaluation starts tomorrow in Lab 402.',
        priority: 'Academic Circular',
        postedBy: 'Dr. Ramesh Kumar'
      },
      {
        title: 'End-Semester Examination Timetable & Hall Ticket Verification Notification',
        courseName: 'Office of the Registrar / Academic Dean',
        description: 'Students must verify exam course registrations and ensure attendance requirements (>= 75%) are fulfilled before hall tickets are released via the student portal.',
        priority: 'Urgent Notice',
        postedBy: 'Office of the Registrar'
      },
      {
        title: 'Annual Inter-University Tech Fest "RVU HackFest 2026" — Problem Statements Released',
        courseName: 'School of Computer Science & Engineering',
        description: 'Registrations are now open for RVU HackFest 2026. Tracks include Generative AI, Cloud Scalability, Web3, and FinTech. 48-hour hackathon with cash prizes up to INR 2,00,000.',
        priority: 'University Event',
        postedBy: 'SoCSE Tech Committee'
      },
      {
        title: 'Mid-Semester Lab Exam Schedule & Practical Problem Statements',
        courseName: 'CS304 - Database Management Systems',
        description: 'Review the indexing strategies, B+ Trees, and SQL normalization problems in course repository. Practical exam duration is 2 hours in Lab 305.',
        priority: 'Academic Circular',
        postedBy: 'Prof. Ananya Sharma'
      },
      {
        title: 'Guest Lecture: High-Performance Data Streaming with Apache Kafka & Apache Flink',
        courseName: 'CS308 - Computer Networks & Security',
        description: 'Industry expert session by Lead Architect from Google Cloud on scalable distributed message streaming this Friday at 2:30 PM in Hall 201. Attendance is compulsory.',
        priority: 'University Event',
        postedBy: 'Dr. Arvind Rao'
      },
      {
        title: 'Tier-1 Product Companies Campus Placement & Internship Drives Schedule',
        courseName: 'Central Placement & Corporate Relations Cell',
        description: 'Pre-placement talks and online assessment schedules for Microsoft, Amazon, Cisco, and Adobe have been updated in the placement tracker. Resume submission deadline is this Friday.',
        priority: 'Urgent Notice',
        postedBy: 'Office of Corporate Relations'
      },
      {
        title: 'Library & 24/7 Digital Learning Resource Centre Extended Hours for Finals',
        courseName: 'Office of Student Affairs',
        description: 'The Central Library, discussion pods, and high-performance computing labs will remain open 24/7 during the examination prep period.',
        priority: 'Campus Facilities',
        postedBy: 'Campus Facilities Administration'
      }
    ];

    for (const n of noticesToSeed) {
      const exists = await Notice.findOne({ title: n.title });
      if (!exists) {
        await Notice.create(n);
      }
    }
    console.log(`Verified & seeded ${noticesToSeed.length} official notices in MongoDB`);

    // ==========================================
    // 6. ATTENDANCE REGISTERS
    // ==========================================
    const allStudents = await User.find({ role: 'student' });
    const attCount = await Attendance.countDocuments();

    if (attCount < 3 && allStudents.length > 0) {
      // Session 1: Nov 04 - CS301
      await Attendance.create({
        courseName: 'CS301 - Full Stack Web Development',
        date: '2026-11-04',
        markedBy: 'Dr. Ramesh Kumar',
        records: allStudents.map((s, idx) => ({
          studentId: s._id.toString(),
          studentName: s.name,
          usn: s.usn || `1RV22CS0${idx + 10}`,
          status: idx % 6 === 0 ? 'Absent' : 'Present'
        }))
      });

      // Session 2: Nov 05 - CS304
      await Attendance.create({
        courseName: 'CS304 - Database Management Systems',
        date: '2026-11-05',
        markedBy: 'Prof. Ananya Sharma',
        records: allStudents.map((s, idx) => ({
          studentId: s._id.toString(),
          studentName: s.name,
          usn: s.usn || `1RV22CS0${idx + 10}`,
          status: idx % 5 === 0 ? 'Absent' : 'Present'
        }))
      });

      // Session 3: Nov 06 - CS308
      await Attendance.create({
        courseName: 'CS308 - Computer Networks & Security',
        date: '2026-11-06',
        markedBy: 'Dr. Arvind Rao',
        records: allStudents.map((s, idx) => ({
          studentId: s._id.toString(),
          studentName: s.name,
          usn: s.usn || `1RV22CS0${idx + 10}`,
          status: 'Present'
        }))
      });

      console.log('Seeded recent institutional attendance registers across courses');
    }

  } catch (error) {
    console.error('Database seeding error:', error.message);
  }
};

module.exports = seedDB;
