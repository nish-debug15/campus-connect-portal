import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App.jsx';

// If we're on the root path, we show the static landing page.
// If we navigate to any other route, we hide the static landing page and mount React.
const path = window.location.pathname;
const staticLanding = document.getElementById('static-landing');

if (path !== '/' && path !== '/index.html') {
  if (staticLanding) {
    staticLanding.style.display = 'none';
  }
  
  createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
} else {
  // We are on landing page. Just to make the links work with React Router later if needed,
  // but since they are standard <a> tags, the browser will do a full page load to /login,
  // which will hit Vite and then run this script again, mounting React.
}
