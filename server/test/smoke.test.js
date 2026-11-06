const http = require('http');

async function testAll() {
  console.log('--- Starting Comprehensive API Smoke Test Suite ---');

  const app = require('../src/app');
  // Wait 1.5 seconds for DB connection and seed
  await new Promise((r) => setTimeout(r, 1500));

  const server = http.createServer(app);
  await new Promise((r) => server.listen(5099, '127.0.0.1', r));
  console.log('Test Server listening on http://127.0.0.1:5099');

  const request = async (method, path, body = null, token = null) => {
    return new Promise((resolve, reject) => {
      const url = new URL(`http://127.0.0.1:5099${path}`);
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const req = http.request(
        url,
        {
          method,
          headers
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            let parsed = null;
            try {
              parsed = JSON.parse(data);
            } catch {
              parsed = data;
            }
            resolve({ status: res.statusCode, data: parsed });
          });
        }
      );

      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  };

  try {
    // 1. Health Check
    console.log('\n[1] Testing Health Check...');
    const health = await request('GET', '/api/health');
    console.log('Health status:', health.status, health.data.status);
    if (health.status !== 200) throw new Error('Health check failed');

    // 2. Auth - Student Login
    console.log('\n[2] Logging in as Demo Student...');
    const studentLogin = await request('POST', '/api/auth/login', {
      email: 'student@rvu.edu.in',
      password: 'password123'
    });
    console.log('Student Login status:', studentLogin.status, 'User:', studentLogin.data.user?.name);
    if (studentLogin.status !== 200 || !studentLogin.data.token) throw new Error('Student login failed');
    const studentToken = studentLogin.data.token;

    // 3. Auth - Faculty Login
    console.log('\n[3] Logging in as Demo Faculty...');
    const facultyLogin = await request('POST', '/api/auth/login', {
      email: 'faculty@rvu.edu.in',
      password: 'faculty123'
    });
    console.log('Faculty Login status:', facultyLogin.status, 'User:', facultyLogin.data.user?.name);
    if (facultyLogin.status !== 200 || !facultyLogin.data.token) throw new Error('Faculty login failed');
    const facultyToken = facultyLogin.data.token;

    // 4. Auth - Admin Login
    console.log('\n[4] Logging in as Demo Admin...');
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@rvu.edu.in',
      password: 'admin123'
    });
    console.log('Admin Login status:', adminLogin.status, 'User:', adminLogin.data.user?.name);
    if (adminLogin.status !== 200 || !adminLogin.data.token) throw new Error('Admin login failed');
    const adminToken = adminLogin.data.token;

    // 5. RBAC Security Tests
    console.log('\n[5] Testing Role-Based Access Control (RBAC)...');
    const studentAdminAccess = await request('GET', '/api/admin/metrics', null, studentToken);
    console.log('Student calling /api/admin/metrics -> Status:', studentAdminAccess.status, '(Expected 403)');
    if (studentAdminAccess.status !== 403) throw new Error('RBAC security violation: Student accessed Admin route!');

    const studentFacultyAccess = await request('POST', '/api/faculty/assignments', { title: 'Hacked', courseName: 'CS301' }, studentToken);
    console.log('Student calling /api/faculty/assignments -> Status:', studentFacultyAccess.status, '(Expected 403)');
    if (studentFacultyAccess.status !== 403) throw new Error('RBAC security violation: Student created assignment!');

    const adminMetrics = await request('GET', '/api/admin/metrics', null, adminToken);
    console.log('Admin calling /api/admin/metrics -> Status:', adminMetrics.status, 'Total Users:', adminMetrics.data.metrics?.totalUsers);
    if (adminMetrics.status !== 200) throw new Error('Admin metrics failed');

    // 6. Faculty creates an assignment
    console.log('\n[6] Faculty creating an assignment...');
    const createAssn = await request(
      'POST',
      '/api/faculty/assignments',
      {
        title: 'Smoke Test: Automated Verification Deliverable',
        courseName: 'CS301 - Full Stack Web Development',
        description: 'Implement end-to-end unit tests and submit artifact link.',
        due: '2026-11-20',
        points: '100'
      },
      facultyToken
    );
    console.log('Create assignment status:', createAssn.status, 'Assignment ID:', createAssn.data.assignment?.id);
    if (createAssn.status !== 201) throw new Error('Failed to create assignment');
    const testAssnId = createAssn.data.assignment.id;

    // 7. Student syncs Google Classroom / coursework
    console.log('\n[7] Student syncing coursework...');
    const syncRes = await request('POST', '/api/classroom/sync', null, studentToken);
    console.log('Classroom Sync status:', syncRes.status, 'Total Assignments:', syncRes.data.assignments?.length);
    const foundAssn = syncRes.data.assignments.find((a) => a.id === testAssnId);
    if (!foundAssn) throw new Error('Newly created assignment not found in student sync!');

    // 8. Student submits coursework
    console.log('\n[8] Student submitting coursework...');
    const submitRes = await request(
      'POST',
      `/api/classroom/assignments/${testAssnId}/submit`,
      {
        submissionText: 'Comprehensive test suite implemented and verified against MongoDB models.',
        submissionLink: 'https://github.com/nish-debug15/campus-connect-portal/pull/1'
      },
      studentToken
    );
    console.log('Submission status:', submitRes.status, 'Submission ID:', submitRes.data.submission?.id);
    if (submitRes.status !== 201) throw new Error('Failed to submit coursework');
    const subId = submitRes.data.submission.id;

    // 9. Faculty reviews submissions
    console.log('\n[9] Faculty reviewing submissions for assignment...');
    const subsRes = await request('GET', `/api/faculty/assignments/${testAssnId}/submissions`, null, facultyToken);
    console.log('Submissions fetched:', subsRes.data.submissions?.length);
    if (subsRes.status !== 200 || subsRes.data.submissions.length === 0) throw new Error('Submissions list empty');

    // 10. Faculty grades submission
    console.log('\n[10] Faculty grading student submission...');
    const gradeRes = await request(
      'POST',
      `/api/faculty/submissions/${subId}/grade`,
      {
        grade: '98/100',
        feedback: 'Outstanding architecture and complete test coverage.'
      },
      facultyToken
    );
    console.log('Grading status:', gradeRes.status, 'Grade:', gradeRes.data.submission?.grade);
    if (gradeRes.status !== 200) throw new Error('Failed to grade submission');

    // 11. Student verifies grade received
    console.log('\n[11] Student verifying grade receipt...');
    const verifySub = await request('GET', `/api/classroom/assignments/${testAssnId}/submission`, null, studentToken);
    console.log('Student submission status:', verifySub.data.submission?.status, 'Grade:', verifySub.data.submission?.grade);
    if (verifySub.data.submission?.grade !== '98/100') throw new Error('Grade mismatch!');

    // 12. Faculty records attendance
    console.log('\n[12] Faculty recording attendance register...');
    const attRes = await request(
      'POST',
      '/api/faculty/attendance',
      {
        courseName: 'CS301 - Full Stack Web Development',
        date: '2026-11-06',
        records: [
          {
            studentId: studentLogin.data.user.id,
            studentName: studentLogin.data.user.name,
            usn: studentLogin.data.user.usn || '1RV21CS001',
            status: 'Present'
          }
        ]
      },
      facultyToken
    );
    console.log('Attendance register status:', attRes.status);
    if (attRes.status !== 201) throw new Error('Failed to record attendance');

    // 13. Student checks live attendance calculation
    console.log('\n[13] Student checking live attendance...');
    const studentAtt = await request('GET', '/api/classroom/attendance', null, studentToken);
    console.log('Attendance calculation:', studentAtt.data.overallPercentage + '%', 'Courses:', studentAtt.data.courses?.length);
    if (studentAtt.status !== 200) throw new Error('Failed to get student attendance');

    // 14. Admin broadcasts a circular
    console.log('\n[14] Admin broadcasting circular...');
    const broadcastRes = await request(
      'POST',
      '/api/admin/broadcast',
      {
        title: 'End-Semester Evaluation & Capstone Viva Schedule',
        description: 'All final capstone presentations are scheduled for next month in Hall 201.',
        priority: 'Academic Circular'
      },
      adminToken
    );
    console.log('Broadcast status:', broadcastRes.status, 'Notice Title:', broadcastRes.data.notice?.title);
    if (broadcastRes.status !== 201) throw new Error('Failed to broadcast circular');

    // 15. Verify Circular in Student Feed
    console.log('\n[15] Verifying broadcasted circular in student feed...');
    const studentFeed = await request('POST', '/api/classroom/sync', null, studentToken);
    const noticeFound = studentFeed.data.notices.find((n) => n.title.includes('End-Semester Evaluation'));
    if (!noticeFound) throw new Error('Broadcasted circular not found in student feed!');
    console.log('Verified circular in student feed:', noticeFound.title);

    // 16. Verify static serving
    console.log('\n[16] Verifying static client serving from root...');
    const rootHtml = await request('GET', '/');
    console.log('Root GET status:', rootHtml.status, 'Is HTML:', typeof rootHtml.data === 'string' && rootHtml.data.includes('<html'));
    if (rootHtml.status !== 200 || !rootHtml.data.includes('Campus Connect Portal')) {
      throw new Error('Static serving of React build failed!');
    }

    console.log('\nALL 16 AUTOMATED TESTS PASSED SUCCESSFULLY! ZERO BUGS DETECTED.');
  } finally {
    server.close();
    const Assignment = require('../src/models/Assignment');
    const Submission = require('../src/models/Submission');
    await Assignment.deleteMany({ title: /Smoke Test/i }).catch(() => {});
    await Submission.deleteMany({ submissionText: /Comprehensive test suite/i }).catch(() => {});
    process.exit(0);
  }
}

testAll().catch((err) => {
  console.error('\nTEST SUITE FAILED:', err);
  process.exit(1);
});
