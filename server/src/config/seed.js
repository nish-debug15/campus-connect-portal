const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Notice = require('../models/Notice');

const seedDB = async () => {
  try {
    // 1. Seed or Migrate Users
    const usersCount = await User.countDocuments();
    
    // Check if default admin exists
    const adminExists = await User.findOne({ email: 'admin@rvu.edu.in' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('admin123', salt);
      await User.create({
        name: 'Campus IT Administrator',
        email: 'admin@rvu.edu.in',
        password: hash,
        role: 'admin',
        empId: 'RVU-ADM-01',
        department: 'Central IT Administration'
      });
      console.log('Seeded Admin: admin@rvu.edu.in');
    }

    // Check if default faculty exists
    const facultyExists = await User.findOne({ email: 'faculty@rvu.edu.in' });
    if (!facultyExists) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('faculty123', salt);
      await User.create({
        name: 'Dr. Ramesh Kumar',
        email: 'faculty@rvu.edu.in',
        password: hash,
        role: 'faculty',
        empId: 'RVU-FAC-042',
        department: 'SoCSE'
      });
      console.log('Seeded Faculty: faculty@rvu.edu.in');
    }

    // Check if default student exists
    const studentExists = await User.findOne({ email: 'student@rvu.edu.in' });
    if (!studentExists) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('password123', salt);
      await User.create({
        name: 'Test Student',
        email: 'student@rvu.edu.in',
        password: hash,
        role: 'student',
        usn: '1RV21CS001',
        branch: 'SoCSE',
        year: '3'
      });
      console.log('Seeded Student: student@rvu.edu.in');
    }

    // Also migrate any users from users.json if they don't exist in MongoDB yet
    const usersFile = path.join(__dirname, '..', 'data', 'users.json');
    if (fs.existsSync(usersFile)) {
      try {
        const fileUsers = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
        for (const fu of fileUsers) {
          if (fu.email) {
            const exists = await User.findOne({ email: fu.email.toLowerCase() });
            if (!exists) {
              await User.create({
                name: fu.name || 'User',
                email: fu.email.toLowerCase(),
                password: fu.password,
                role: fu.role || 'student',
                usn: fu.usn || null,
                branch: fu.branch || null,
                year: fu.year || null,
                empId: fu.empId || null,
                department: fu.department || null
              });
              console.log(`Migrated user to Mongo: ${fu.email}`);
            }
          }
        }
      } catch (e) {
        console.error('Error migrating users.json:', e.message);
      }
    }

    // 2. Seed Courses
    const coursesCount = await Course.countDocuments();
    if (coursesCount === 0) {
      await Course.create([
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
        }
      ]);
      console.log('Seeded standard RV University courses in MongoDB');
    }

    // 3. Seed Initial Assignments if empty
    const assnCount = await Assignment.countDocuments();
    if (assnCount === 0) {
      await Assignment.create([
        {
          title: 'Sprint 2: RESTful API & Authentication Architecture',
          courseName: 'CS301 - Full Stack Web Development',
          description: 'Build robust JWT authentication with Express and connect Mongo models.',
          due: 'Nov 05, 2026',
          points: '100 pts',
          status: 'Due Soon',
          createdBy: 'Dr. Ramesh Kumar'
        },
        {
          title: 'Normalization (1NF to BCNF) & SQL Query Optimization Problem Set',
          courseName: 'CS304 - Database Management Systems',
          description: 'Solve the normalization problem statements and optimize indexed queries.',
          due: 'Nov 08, 2026',
          points: '50 pts',
          status: 'Assigned',
          createdBy: 'Prof. Ananya Sharma'
        },
        {
          title: 'Wireshark Packet Analysis: TCP Handshake & TLS Decryption',
          courseName: 'CS308 - Computer Networks & Security',
          description: 'Capture packet traces, inspect TCP 3-way handshakes and write lab observations.',
          due: 'Nov 12, 2026',
          points: '75 pts',
          status: 'Assigned',
          createdBy: 'Dr. Arvind Rao'
        }
      ]);
      console.log('Seeded initial assignments in MongoDB');
    }

    // 4. Seed Initial Notices if empty
    const noticesCount = await Notice.countDocuments();
    if (noticesCount === 0) {
      await Notice.create([
        {
          title: 'Capstone Project Phase 1 Architecture Review & Submission Guidelines',
          courseName: 'CS301 - Full Stack Web Development',
          description: 'Submit your architecture diagrams, database schemas, and REST API documentation before midnight.',
          priority: 'Academic Circular',
          postedBy: 'Dr. Ramesh Kumar'
        },
        {
          title: 'Guest Lecture: Scalable Microservices Architecture with Docker & K8s',
          courseName: 'CS308 - Computer Networks & Security',
          description: 'Industry expert session by AWS Principal Architect this Friday at 2:30 PM in Hall 201.',
          priority: 'University Event',
          postedBy: 'Dr. Arvind Rao'
        },
        {
          title: 'Mid-Semester Lab Exam Schedule & Practical Problem Statements',
          courseName: 'CS304 - Database Management Systems',
          description: 'Review the indexing strategies, B-Trees, and SQL normalization problems in course files.',
          priority: 'Academic Circular',
          postedBy: 'Prof. Ananya Sharma'
        }
      ]);
      console.log('Seeded initial notices in MongoDB');
    }

  } catch (error) {
    console.error('Database seeding error:', error.message);
  }
};

module.exports = seedDB;
