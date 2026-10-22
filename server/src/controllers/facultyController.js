const fs = require('fs');
const path = require('path');

const assignmentsFile = path.join(__dirname, '..', 'data', 'assignments.json');
const noticesFile = path.join(__dirname, '..', 'data', 'notices.json');
const attendanceFile = path.join(__dirname, '..', 'data', 'attendance.json');
const usersFile = path.join(__dirname, '..', 'data', 'users.json');

const ensureFile = (filePath, defaultData = []) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
};

ensureFile(assignmentsFile);
ensureFile(noticesFile);
ensureFile(attendanceFile);

const readJSON = (file) => {
  try {
    ensureFile(file);
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
    return [];
  }
};

const writeJSON = (file, data) => {
  ensureFile(file);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// 1. Get Faculty's Courses & Classes
exports.getCourses = (req, res) => {
  const courses = [
    {
      id: 'cs301',
      code: 'CS301',
      name: 'CS301 - Full Stack Web Development',
      section: 'CSE Sem 5 - Section A',
      room: 'Lab 402',
      enrolledStudents: 42,
      schedule: 'Mon, Wed 10:00 AM'
    },
    {
      id: 'cs304',
      code: 'CS304',
      name: 'CS304 - Database Management Systems',
      section: 'CSE Sem 5 - Section A',
      room: 'Hall 201',
      enrolledStudents: 38,
      schedule: 'Tue, Thu 02:00 PM'
    },
    {
      id: 'cs308',
      code: 'CS308',
      name: 'CS308 - Computer Networks & Security',
      section: 'CSE Sem 5 - Section B',
      room: 'Lab 305',
      enrolledStudents: 45,
      schedule: 'Fri 09:00 AM'
    }
  ];
  res.json({ courses });
};

// 2. Assignments (Mini Google Classroom)
exports.getAssignments = (req, res) => {
  const allAssignments = readJSON(assignmentsFile);
  res.json({ assignments: allAssignments });
};

exports.createAssignment = (req, res) => {
  try {
    const { title, courseName, description, due, points } = req.body;

    if (!title || !courseName) {
      return res.status(400).json({ error: 'Title and course name are required' });
    }

    const assignments = readJSON(assignmentsFile);
    const newAssignment = {
      id: `assn-${Date.now()}`,
      title,
      courseName,
      description: description || 'Complete the assignment as instructed.',
      due: due || 'Next Week',
      points: points ? `${points} pts` : '100 pts',
      status: 'Assigned',
      createdBy: req.user.name || req.user.userId,
      createdAt: new Date().toISOString()
    };

    assignments.unshift(newAssignment);
    writeJSON(assignmentsFile, assignments);

    res.status(201).json({ assignment: newAssignment, message: 'Assignment published successfully' });
  } catch (err) {
    console.error('Error creating assignment:', err);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
};

exports.deleteAssignment = (req, res) => {
  try {
    const { id } = req.params;
    let assignments = readJSON(assignmentsFile);
    assignments = assignments.filter((a) => a.id !== id);
    writeJSON(assignmentsFile, assignments);
    res.json({ message: 'Assignment deleted successfully' });
  } catch (err) {
    console.error('Error deleting assignment:', err);
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
};

// 3. Announcements / Stream
exports.postAnnouncement = (req, res) => {
  try {
    const { title, courseName, description } = req.body;

    if (!title || !courseName) {
      return res.status(400).json({ error: 'Title and Course are required' });
    }

    const notices = readJSON(noticesFile);
    const newNotice = {
      id: `not-${Date.now()}`,
      title,
      courseName,
      description: description || '',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      postedBy: req.user.name || 'Faculty',
      createdAt: new Date().toISOString()
    };

    notices.unshift(newNotice);
    writeJSON(noticesFile, notices);

    res.status(201).json({ notice: newNotice, message: 'Announcement posted to class stream' });
  } catch (err) {
    console.error('Error posting announcement:', err);
    res.status(500).json({ error: 'Failed to post announcement' });
  }
};

// 4. Attendance
exports.getEnrolledStudents = (req, res) => {
  try {
    const users = readJSON(usersFile);
    const students = users
      .filter((u) => u.role === 'student')
      .map((s) => ({
        id: s.id,
        name: s.name,
        usn: s.usn || '1RV21CS001',
        branch: s.branch || 'SoCSE',
        email: s.email
      }));

    // If no students in system, provide standard class roster
    if (students.length === 0) {
      students.push(
        { id: 'std-1', name: 'Nishit Patel', usn: '1RUA24SCS0068', branch: 'SoCSE', email: 'patelnishitkumarbsc24@rvu.edu.in' },
        { id: 'std-2', name: 'Aarav Sharma', usn: '1RV22CS014', branch: 'SoCSE', email: 'aarav@rvu.edu.in' },
        { id: 'std-3', name: 'Diya Reddy', usn: '1RV22CS032', branch: 'SoCSE', email: 'diya@rvu.edu.in' },
        { id: 'std-4', name: 'Rohan Verma', usn: '1RV22CS085', branch: 'SoCSE', email: 'rohan@rvu.edu.in' }
      );
    }

    res.json({ students });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch student roster' });
  }
};

exports.saveAttendance = (req, res) => {
  try {
    const { courseName, date, records } = req.body;

    if (!courseName || !records) {
      return res.status(400).json({ error: 'Course name and attendance records required' });
    }

    const attendanceList = readJSON(attendanceFile);
    const sessionRecord = {
      id: `att-${Date.now()}`,
      courseName,
      date: date || new Date().toISOString().split('T')[0],
      markedBy: req.user.name || 'Faculty',
      records, // array of { studentId, studentName, usn, status: 'Present' | 'Absent' }
      timestamp: new Date().toISOString()
    };

    attendanceList.unshift(sessionRecord);
    writeJSON(attendanceFile, attendanceList);

    res.status(201).json({ message: 'Attendance register saved successfully', record: sessionRecord });
  } catch (err) {
    console.error('Error saving attendance:', err);
    res.status(500).json({ error: 'Failed to record attendance' });
  }
};

exports.getAttendanceHistory = (req, res) => {
  try {
    const attendanceList = readJSON(attendanceFile);
    res.json({ history: attendanceList });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch attendance history' });
  }
};
