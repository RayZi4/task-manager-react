import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { TaskProvider } from './context/TaskContext';
import { ToastProvider } from './context/ToastContext';
import HomePage from './pages/HomePage';
import CalendarPage from './pages/CalendarPage';
import GanttPage from './pages/GanttPage';
import AnalyticsPage from './pages/AnalyticsPage';
import './index.css';
import './components/Toast.css';

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  return (
    <ToastProvider>
      <TaskProvider>
        <div className="app-container">
          <div className="global-nav">
            <Link to="/">Доска</Link>
            <Link to="/calendar">Календарь</Link>
            <Link to="/gantt">Гант</Link>
            <Link to="/analytics">Аналитика</Link>
            <button onClick={toggleTheme} className="theme-btn">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/gantt" element={<GanttPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Routes>
        </div>
      </TaskProvider>
    </ToastProvider>
  );
}

export default App;