import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { Play, Square, AlertCircle, Clock } from 'lucide-react';
import './ClockInOut.css';

interface ClockInOutProps {
  userId: string;
  onEntryCreated: () => void;
}

export function ClockInOut({ userId, onEntryCreated }: ClockInOutProps) {
  const [projectId, setProjectId] = useState('');
  const [notes, setNotes] = useState('');
  const [isBillable, setIsBillable] = useState(true);
  const [tags, setTags] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [activeEntry, setActiveEntry] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

  useEffect(() => {
    api.getProjects().then((data) => {
      if (Array.isArray(data)) setProjects(data);
    }).catch(console.error);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadActiveEntry();
    const interval = setInterval(() => {
      if (activeEntry) {
        updateElapsedTime();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [userId, activeEntry]);

  const loadActiveEntry = async () => {
    try {
      const entry = await api.getActiveEntry(userId);
      setActiveEntry(entry);
      if (entry) {
        updateElapsedTime();
      }
    } catch (error) {
      console.error('Error loading active entry:', error);
    }
  };

  const updateElapsedTime = () => {
    if (!activeEntry) return;
    const start = new Date(activeEntry.clockInTime).getTime();
    const now = Date.now();
    const diff = now - start;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000); // Fixed seconds calc
    
    setElapsedTime(
      `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    );
  };

  const handleClockIn = async () => {
    if (!projectId.trim()) {
      setMessage('Please enter a Project ID');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const tagList = tags.split(',').filter(t => t.trim()).map(t => t.trim());
      const result = await api.clockIn(userId, projectId, notes, isBillable, tagList);
      if (result) {
        setMessage('Clocked in successfully');
        setMessageType('success');
        setProjectId('');
        setNotes('');
        setTags('');
        setIsBillable(true);
        await loadActiveEntry();
        // Force refresh immediately
        setActiveEntry({ 
           projectId, 
           clockInTime: Date.now(), 
           notes, 
           userId,
           isBillable,
           tags: tagList
        }); 
        onEntryCreated();
      }
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Failed to clock in');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!activeEntry) return;

    setLoading(true);
    setMessage('');

    try {
      await api.clockOut(activeEntry.id, notes); // Ensure API matches activeEntry.id or similar
      setMessage('Clocked out successfully');
      setMessageType('success');
      setNotes('');
      setActiveEntry(null);
      setElapsedTime('00:00:00');
      onEntryCreated();
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Failed to clock out');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="clock-in-out">
      <h2>Clock In/Out</h2>
      
      {message && (
        <div className={`message ${messageType}`}>
          {messageType === 'error' && <AlertCircle size={16} style={{marginRight: 8}} />}
          {message}
        </div>
      )}

      {!activeEntry ? (
        <div className="clock-in-form">
          <div className="form-group">
            <label htmlFor="project">Project / Task</label>
            {projects.length > 0 ? (
              <select
                id="project"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                disabled={loading}
                className="form-control" // Ensure this class exists or styles apply
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="">Select a project...</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            ) : (
              <input
                id="project"
                type="text"
                placeholder="What are you working on? (ID)"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                disabled={loading}
                onKeyPress={(e) => e.key === 'Enter' && handleClockIn()}
                autoFocus
              />
            )}
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', margin: 0 }}>
                <input
                  type="checkbox"
                  checked={isBillable}
                  onChange={(e) => setIsBillable(e.target.checked)}
                  disabled={loading}
                  style={{ marginRight: '8px', width: 'auto' }}
                />
                Billable
              </label>
              
              <input
                type="text"
                placeholder="Tags (dev, design...)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                disabled={loading}
                style={{ flex: 1 }}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Description (optional)</label>
            <textarea
              id="notes"
              placeholder="Add details about your work..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
              rows={2}
            />
          </div>

          <button 
            className="btn btn-primary" 
            onClick={handleClockIn} 
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {loading ? 'Processing...' : <><Play size={16} fill="currentColor" /> Start Timer</>}
          </button>
        </div>
      ) : (
        <div className="active-entry">
          <div className="entry-header">
            <h3><Clock size={20} className="text-primary" /> Running Timer</h3>
            <div className="elapsed-time">{elapsedTime}</div>
          </div>

          <div className="entry-details">
            <div className="detail-row">
              <span className="label">Project:</span>
              <span className="value">
                {projects.find(p => p.id === activeEntry.projectId)?.name || activeEntry.projectId}
                {activeEntry.isBillable !== undefined && (
                   <span style={{
                     marginLeft: 8, 
                     fontSize: '0.75em', 
                     background: activeEntry.isBillable ? '#dcfce7' : '#f3f4f6', 
                     color: activeEntry.isBillable ? '#166534' : '#6b7280', 
                     padding: '2px 6px', 
                     borderRadius: 4
                   }}>
                     {activeEntry.isBillable ? 'Billable' : 'Non-billable'}
                   </span>
                )}
              </span>
            </div>
            {activeEntry.tags && activeEntry.tags.length > 0 && (
              <div className="detail-row">
                <span className="label">Tags:</span>
                <span className="value">{activeEntry.tags.join(', ')}</span>
              </div>
            )}
            <div className="detail-row">
              <span className="label">Started at:</span>
              <span className="value">
                {new Date(activeEntry.clockInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
            {(activeEntry.notes || notes) && ( /* Show active notes or input notes */
              <div className="detail-row">
                <span className="label">Notes:</span>
                <span className="value">{activeEntry.notes || notes}</span>
              </div>
            )}
          </div>

          <div className="clock-out-section">
            <div className="form-group">
              <label htmlFor="out-notes">Add closing notes</label>
              <textarea
                id="out-notes"
                placeholder="Summary of work done..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={loading}
                rows={2}
              />
            </div>
            <button 
              className="btn btn-danger" 
              onClick={handleClockOut} 
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {loading ? 'Processing...' : <><Square size={16} fill="currentColor" /> Stop Timer</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
