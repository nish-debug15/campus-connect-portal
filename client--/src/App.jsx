import React from 'react';
import { Routes, Route } from 'react-router';
import AuthModule from './components/AuthModule';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';

function App() {
  return (
    <div className="react-app-container">
      <Routes>
        <Route path="/login" element={<AuthModule initialMode="login" />} />
        <Route path="/register" element={<AuthModule initialMode="register" />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
      </Routes>
    </div>
  );
}

export default App;
