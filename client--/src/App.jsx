import React from 'react';
import { Routes, Route } from 'react-router';
import AuthModule from './components/AuthModule';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <div className="react-app-container">
      <Routes>
        <Route path="/login" element={<AuthModule initialMode="login" />} />
        <Route path="/register" element={<AuthModule initialMode="register" />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}

export default App;
