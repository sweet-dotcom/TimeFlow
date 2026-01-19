import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { Clock, PieChart, FileText, Briefcase, Activity } from 'lucide-react';
import './Dashboard.css';

interface DashboardProps {
  userId: string;
  refreshTrigger: number;
}

interface DashboardData {
  activeEntry: any;
  totalHours: number;
  projectCount: number;
  entriesCount: number;
  todayHours: number;
}

export function Dashboard({ userId, refreshTrigger }: DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, refreshTrigger]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [entries, timesheet, activeEntry] = await Promise.all([
        api.getTimeEntries(),
        api.getTimesheet(userId),
        api.getActiveEntry(userId),
      ]);

      const userEntries = entries.filter((e: any) => e.userId === userId);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayEntries = userEntries.filter((e: any) => 
        new Date(e.clockInTime).toDateString() === today.toDateString()
      );
      const todayHours = todayEntries.reduce((sum: number, e: any) => 
        sum + (e.duration || 0), 0) / (1000 * 60 * 60);

      setData({
        activeEntry,
        totalHours: timesheet.totalHours || 0,
        projectCount: timesheet.projects?.length || 0,
        entriesCount: userEntries.length,
        todayHours: todayHours,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard"><p className="loading-text">Loading dashboard...</p></div>;
  }

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Today's Hours</div>
            <div className="stat-value">{data?.todayHours.toFixed(2)}h</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <PieChart size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Hours</div>
            <div className="stat-value">{data?.totalHours.toFixed(2)}h</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Entries</div>
            <div className="stat-value">{data?.entriesCount}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Briefcase size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Projects</div>
            <div className="stat-value">{data?.projectCount}</div>
          </div>
        </div>
      </div>

      {data?.activeEntry && (
        <div className="active-entry-banner">
          <div className="banner-icon">
            <Activity size={24} />
          </div>
          <div className="banner-content">
            <h3>Active Time Entry</h3>
            <p>Working on <strong>{data.activeEntry.projectId}</strong></p>
            <p>Started at {new Date(data.activeEntry.clockInTime).toLocaleTimeString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}
