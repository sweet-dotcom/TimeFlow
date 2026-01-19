import React, { useState } from 'react';
import * as api from '../services/api';
import './CreateProject.css';

interface CreateProjectProps {
  onProjectCreated: () => void;
}

export function CreateProject({ onProjectCreated }: CreateProjectProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage('Project name is required');
      setMessageType('error');
      return;
    }

    if (name.trim().length < 2) {
      setMessage('Project name must be at least 2 characters');
      setMessageType('error');
      return;
    }

    let rate: number | undefined;
    if (hourlyRate.trim()) {
      const parsed = parseFloat(hourlyRate);
      if (isNaN(parsed) || parsed < 0) {
        setMessage('Hourly rate must be a valid positive number');
        setMessageType('error');
        return;
      }
      rate = parsed;
    }

    setLoading(true);
    try {
      await api.createProject(name.trim(), description, rate);
      setMessage('Project created successfully!');
      setMessageType('success');
      setName('');
      setDescription('');
      setHourlyRate('');
      onProjectCreated();
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(error.response?.data?.error || error.message || 'Error creating project');
      setMessageType('error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-project">
      <h2>New Project</h2>
      {message && (
        <div className={`message message-${messageType}`}>{message}</div>
      )}
      <form onSubmit={handleSubmit} className="project-form">
        <div className="form-group">
          <label htmlFor="name">Project Name *</label>
          <input
            id="name"
            type="text"
            placeholder="Enter project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label htmlFor="hourlyRate">Hourly Rate (Optional)</label>
          <div className="rate-input-group">
            <span className="currency">$</span>
            <input
              id="hourlyRate"
              type="number"
              placeholder="0.00"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              disabled={loading}
              min="0"
              step="0.01"
            />
            <span className="unit">/hour</span>
          </div>
          <small>If set, revenue will be calculated in the timesheet</small>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description (Optional)</label>
          <textarea
            id="description"
            placeholder="Enter project description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            maxLength={500}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="submit-btn"
        >
          {loading ? 'Creating...' : '✨ Create Project'}
        </button>
      </form>
    </div>
  );
}
