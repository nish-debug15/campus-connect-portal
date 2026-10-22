import React from 'react';
import { Routes, Route, Navigate } from 'react-router';
import LandingPage from './pages/LandingPage';
import AuthModule from './components/AuthModule';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <div className="react-app-container">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthModule initialMode="login" />} />
        <Route path="/register" element={<AuthModule initialMode="register" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
