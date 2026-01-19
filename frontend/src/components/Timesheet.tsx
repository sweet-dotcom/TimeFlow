import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import './Timesheet.css';

interface TimesheetData {
  userId: string;
  period: string;
  projects: {
    projectId: string;
    projectName: string;
    totalHours: number;
    revenue?: number;
  }[];
  totalHours: number;
  totalRevenue?: number;
}

interface TimesheetProps {
  userId: string;
  refreshTrigger: number;
}

export function Timesheet({ userId, refreshTrigger }: TimesheetProps) {
  const [timesheet, setTimesheet] = useState<TimesheetData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimesheet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, refreshTrigger]);

  const loadTimesheet = async () => {
    setLoading(true);
    try {
      const data = await api.getTimesheet(userId);
      setTimesheet(data);
    } catch (error) {
      console.error('Error loading timesheet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!timesheet) return;

    const csv = [
      ['Timesheet Report'],
      ['User:', userId],
      ['Period:', timesheet.period],
      [],
      ['Project', 'Hours', timesheet.projects[0]?.revenue ? 'Revenue' : ''].filter(Boolean),
      ...timesheet.projects.map((p) => [
        p.projectName,
        p.totalHours.toFixed(2),
        p.revenue ? `$${p.revenue.toFixed(2)}` : '',
      ].filter((_, i) => i < 2 || timesheet.projects[0]?.revenue)),
      [],
      ['Total Hours:', timesheet.totalHours.toFixed(2)],
      timesheet.totalRevenue ? ['Total Revenue:', `$${timesheet.totalRevenue.toFixed(2)}`] : [],
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timesheet-${userId}-${timesheet.period}.csv`;
    a.click();
  };

  if (loading) {
    return <div className="timesheet"><p>Loading timesheet...</p></div>;
  }

  return (
    <div className="timesheet">
      <div className="timesheet-header">
        <div>
          <h2>Timesheet Report</h2>
          <p className="user-period">{userId} • {timesheet?.period}</p>
        </div>
        <button className="export-btn" onClick={handleExport}>
          📥 Export CSV
        </button>
      </div>

      {!timesheet || timesheet.projects.length === 0 ? (
        <p className="empty">No timesheet data available</p>
      ) : (
        <>
          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-label">Total Hours</div>
              <div className="card-value">{timesheet.totalHours.toFixed(2)}h</div>
            </div>
            {timesheet.totalRevenue !== undefined && (
              <div className="summary-card">
                <div className="card-label">Total Revenue</div>
                <div className="card-value">${timesheet.totalRevenue.toFixed(2)}</div>
              </div>
            )}
          </div>

          <div className="projects-table">
            <table>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Hours</th>
                  {timesheet.projects[0]?.revenue !== undefined && <th>Revenue</th>}
                </tr>
              </thead>
              <tbody>
                {timesheet.projects.map((project) => (
                  <tr key={project.projectId}>
                    <td className="project-cell">{project.projectName}</td>
                    <td className="hours-cell">{project.totalHours.toFixed(2)}</td>
                    {project.revenue !== undefined && (
                      <td className="revenue-cell">${project.revenue.toFixed(2)}</td>
                    )}
                  </tr>
                ))}
                <tr className="total-row">
                  <td className="project-cell"><strong>Total</strong></td>
                  <td className="hours-cell"><strong>{timesheet.totalHours.toFixed(2)}</strong></td>
                  {timesheet.totalRevenue !== undefined && (
                    <td className="revenue-cell"><strong>${timesheet.totalRevenue.toFixed(2)}</strong></td>
                  )}
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
