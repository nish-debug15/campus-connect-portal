const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Notice = require('../models/Notice');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

// 1. Get Faculty's Courses & Classes
exports.getCourses = async (req, res) => {
  try {
    let courses = await Course.find().sort({ code: 1 });
    if (!courses || courses.length === 0) {
      courses = [
        {
          code: 'CS301',
          name: 'CS301 - Full Stack Web Development',
          section: 'CSE Sem 5 - Section A',
          room: 'Lab 402',
          enrolledStudents: 42,
          schedule: 'Mon, Wed 10:00 AM'
        },
        {
          code: 'CS304',
          name: 'CS304 - Database Management Systems',
          section: 'CSE Sem 5 - Section A',
          room: 'Hall 201',
          enrolledStudents: 38,
          schedule: 'Tue, Thu 02:00 PM'
        },
        {
          code: 'CS308',
          name: 'CS308 - Computer Networks & Security',
          section: 'CSE Sem 5 - Section B',
          room: 'Lab 305',
          enrolledStudents: 45,
          schedule: 'Fri 09:00 AM'
        }
      ];
    }
    res.json({ courses });
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

// 2. Assignments (Mini Google Classroom)
exports.getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 });
    const formatted = assignments.map((a) => ({
      id: a._id.toString(),
      _id: a._id.toString(),
      title: a.title,
      courseName: a.courseName,
      description: a.description,
      due: a.due,
      points: a.points,
      status: a.status,
      createdBy: a.createdBy,
      createdAt: a.createdAt
    }));
    res.json({ assignments: formatted });
  } catch (err) {
    console.error('Error fetching assignments:', err);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
};

exports.createAssignment = async (req, res) => {
  try {
    const { title, courseName, description, due, points } = req.body;

    if (!title || !courseName) {
      return res.status(400).json({ error: 'Title and course name are required' });
    }

    const assignment = await Assignment.create({
      title: title.trim(),
      courseName: courseName.trim(),
      description: description || 'Complete the assignment as instructed.',
      due: due || 'Next Week',
      points: points ? `${points} pts` : '100 pts',
      status: 'Assigned',
      createdBy: req.user?.name || 'Faculty Instructor',
      creatorId: req.user?.userId || null
    });

    const formatted = {
      id: assignment._id.toString(),
      _id: assignment._id.toString(),
      title: assignment.title,
      courseName: assignment.courseName,
      description: assignment.description,
      due: assignment.due,
      points: assignment.points,
      status: assignment.status,
      createdBy: assignment.createdBy,
      createdAt: assignment.createdAt
    };

    res.status(201).json({ assignment: formatted, message: 'Assignment published successfully' });
  } catch (err) {
    console.error('Error creating assignment:', err);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    await Assignment.findByIdAndDelete(id);
    res.json({ message: 'Assignment deleted successfully' });
  } catch (err) {
    console.error('Error deleting assignment:', err);
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
};

// 3. Announcements / Stream
exports.postAnnouncement = async (req, res) => {
  try {
    const { title, courseName, description } = req.body;

    if (!title || !courseName) {
      return res.status(400).json({ error: 'Title and Course are required' });
    }

    const notice = await Notice.create({
      title: title.trim(),
      courseName: courseName.trim(),
      description: description || '',
      postedBy: req.user?.name || 'Faculty Instructor',
      priority: 'Announcement'
    });

    const formatted = {
      id: notice._id.toString(),
      _id: notice._id.toString(),
      title: notice.title,
      courseName: notice.courseName,
      description: notice.description,
      date: notice.date,
      postedBy: notice.postedBy,
      priority: notice.priority,
      createdAt: notice.createdAt
    };

    res.status(201).json({ notice: formatted, message: 'Announcement posted to class stream' });
  } catch (err) {
    console.error('Error posting announcement:', err);
    res.status(500).json({ error: 'Failed to post announcement' });
  }
};

// 4. Attendance
exports.getEnrolledStudents = async (req, res) => {
  try {
    const studentUsers = await User.find({ role: 'student' }).sort({ name: 1 });
    let students = studentUsers.map((s) => ({
      id: s._id.toString(),
      _id: s._id.toString(),
      name: s.name,
      usn: s.usn || '1RV21CS001',
      branch: s.branch || 'SoCSE',
      email: s.email
    }));

    if (students.length === 0) {
      students = [
        { id: 'std-1', name: 'Nishit Patel', usn: '1RUA24SCS0068', branch: 'SoCSE', email: 'patelnishitkumarbsc24@rvu.edu.in' },
        { id: 'std-2', name: 'Aarav Sharma', usn: '1RV22CS014', branch: 'SoCSE', email: 'aarav@rvu.edu.in' },
        { id: 'std-3', name: 'Diya Reddy', usn: '1RV22CS032', branch: 'SoCSE', email: 'diya@rvu.edu.in' },
        { id: 'std-4', name: 'Rohan Verma', usn: '1RV22CS085', branch: 'SoCSE', email: 'rohan@rvu.edu.in' }
      ];
    }

    res.json({ students });
  } catch (err) {
    console.error('Error fetching student roster:', err);
    res.status(500).json({ error: 'Failed to fetch student roster' });
  }
};

exports.saveAttendance = async (req, res) => {
  try {
    const { courseName, date, records } = req.body;

    if (!courseName || !records) {
      return res.status(400).json({ error: 'Course name and attendance records required' });
    }

    const sessionRecord = await Attendance.create({
      courseName,
      date: date || new Date().toISOString().split('T')[0],
      markedBy: req.user?.name || 'Faculty Instructor',
      records
    });

    const formatted = {
      id: sessionRecord._id.toString(),
      _id: sessionRecord._id.toString(),
      courseName: sessionRecord.courseName,
      date: sessionRecord.date,
      markedBy: sessionRecord.markedBy,
      records: sessionRecord.records,
      createdAt: sessionRecord.createdAt
    };

    res.status(201).json({ message: 'Attendance register saved successfully', record: formatted });
  } catch (err) {
    console.error('Error saving attendance:', err);
    res.status(500).json({ error: 'Failed to record attendance' });
  }
};

exports.getAttendanceHistory = async (req, res) => {
  try {
    const list = await Attendance.find().sort({ createdAt: -1 });
    const formatted = list.map((a) => ({
      id: a._id.toString(),
      _id: a._id.toString(),
      courseName: a.courseName,
      date: a.date,
      markedBy: a.markedBy,
      records: a.records,
      createdAt: a.createdAt
    }));
    res.json({ history: formatted });
  } catch (err) {
    console.error('Error fetching attendance history:', err);
    res.status(500).json({ error: 'Failed to fetch attendance history' });
  }
};
