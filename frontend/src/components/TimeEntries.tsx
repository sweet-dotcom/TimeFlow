import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { Calendar, Clock, CheckCircle2, PlayCircle } from 'lucide-react';
import './TimeEntries.css';

interface TimeEntry {
  id: string;
  userId: string;
  projectId: string;
  clockInTime: number;
  duration?: number; // Duration in ms
  notes?: string;
  status: 'active' | 'completed';
}

interface TimeEntriesProps {
  refreshTrigger: number;
  userId: string;
}

export function TimeEntries({ refreshTrigger, userId }: TimeEntriesProps) {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    loadEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger, userId]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const data = await api.getTimeEntries();
      // Ensure we only show user entries
      const userEntries = userId ? data.filter((e: TimeEntry) => e.userId === userId) : data;
      // Sort by newest first
      userEntries.sort((a: TimeEntry, b: TimeEntry) => b.clockInTime - a.clockInTime);
      setEntries(userEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '--:--';
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    // Provide a cleaner 1h 20m format
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getFilteredEntries = () => {
    return entries.filter((entry) => {
      if (filter === 'active') return entry.status === 'active';
      if (filter === 'completed') return entry.status === 'completed';
      return true;
    });
  };

  const filtered = getFilteredEntries();

  return (
    <div className="time-entries">
      <div className="entries-header">
        <h2>Time Entries</h2>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading entries...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">No time entries found</div>
      ) : (
        <div className="entries-list">
          {filtered.map((entry) => (
            <div key={entry.id} className={`entry-card ${entry.status}`}>
              <div className="entry-card-header">
                <div className="entry-project">
                  {entry.status === 'active' ? (
                     <PlayCircle size={20} className="text-success" color="#10b981" />
                  ) : (
                     <CheckCircle2 size={20} className="text-muted" color="#9ca3af" />
                  )}
                  <span className="project-name">{entry.projectId}</span>
                </div>
                <span className="entry-date">
                  <Calendar size={12} style={{marginRight: 6, display: 'inline' }} />
                  {new Date(entry.clockInTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>

              <div className="entry-card-body">
                <div className="time-details">
                    <div className="time-row">
                    <span className="label">Start Time</span>
                    <span className="value">
                        {new Date(entry.clockInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    </div>
                    {entry.notes && (
                        <div className="time-row" style={{ flex: 1, paddingLeft: 20 }}>
                            <span className="label">Notes</span>
                            <span className="value" style={{ fontSize: 13, color: '#4b5563' }}>{entry.notes}</span>
                        </div>
                    )}
                </div>

                <div className="duration-badge">
                  {formatDuration(entry.duration)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
