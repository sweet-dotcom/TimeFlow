import React, { useState } from 'react';
import { LayoutDashboard, Timer, ListTodo, FileBarChart, FolderKanban, ChevronDown } from 'lucide-react';
import { ClockInOut } from './components/ClockInOut';
import { TimeEntries } from './components/TimeEntries';
import { Timesheet } from './components/Timesheet';
import { CreateProject } from './components/CreateProject';
import { Dashboard } from './components/Dashboard';
import { UserSelector } from './components/UserSelector';
import './App.css';

function App() {
  const [userId, setUserId] = useState('user1');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clock' | 'entries' | 'timesheet' | 'projects'>('dashboard');

  const handleEntryCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleUserChange = (newUserId: string) => {
    if (newUserId.trim()) {
      setUserId(newUserId.trim());
      setRefreshTrigger(0);
    }
  };

  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">T</div>
          <span>TimeFlow</span>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="icon"><LayoutDashboard size={20} /></span>
            Dashboard
          </button>
          <button 
            className={`sidebar-item ${activeTab === 'clock' ? 'active' : ''}`}
            onClick={() => setActiveTab('clock')}
          >
            <span className="icon"><Timer size={20} /></span>
            Timer
          </button>
          <button 
            className={`sidebar-item ${activeTab === 'entries' ? 'active' : ''}`}
            onClick={() => setActiveTab('entries')}
          >
            <span className="icon"><ListTodo size={20} /></span>
            Timesheets
          </button>
          <button 
            className={`sidebar-item ${activeTab === 'timesheet' ? 'active' : ''}`}
            onClick={() => setActiveTab('timesheet')}
          >
            <span className="icon"><FileBarChart size={20} /></span>
            Reports
          </button>
          <button 
            className={`sidebar-item ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            <span className="icon"><FolderKanban size={20} /></span>
            Projects
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">{userId.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <span className="name">{userId}</span>
              <span className="role">Member</span>
            </div>
            <UserSelector userId={userId} onUserChange={handleUserChange} />
          </div>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-header">
          <h2 className="page-title">
            {activeTab === 'dashboard' && 'Dashboard'}
            {activeTab === 'clock' && 'Timer'}
            {activeTab === 'entries' && 'Timesheets'}
            {activeTab === 'timesheet' && 'Reports'}
            {activeTab === 'projects' && 'Projects'}
          </h2>
          <div className="header-actions">
            <button className="organization-select">
              My Organization <ChevronDown size={14} style={{ display: 'inline', marginLeft: 6 }} />
            </button>
          </div>
        </header>

        <div className="content-scrollable">
          <div className="content-container">
            {activeTab === 'dashboard' && (
              <Dashboard userId={userId} refreshTrigger={refreshTrigger} />
            )}
            {activeTab === 'clock' && (
              <ClockInOut userId={userId} onEntryCreated={handleEntryCreated} />
            )}
            {activeTab === 'entries' && (
              <TimeEntries refreshTrigger={refreshTrigger} userId={userId} />
            )}
            {activeTab === 'timesheet' && (
              <Timesheet userId={userId} refreshTrigger={refreshTrigger} />
            )}
            {activeTab === 'projects' && (
              <CreateProject onProjectCreated={handleEntryCreated} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
