import React from 'react';
import './UserSelector.css';

interface UserSelectorProps {
  userId: string;
  onUserChange: (userId: string) => void;
}

export function UserSelector({ userId, onUserChange }: UserSelectorProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [input, setInput] = React.useState(userId);

  const handleSubmit = () => {
    onUserChange(input);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setInput(userId);
    }
  };

  if (isEditing) {
    return (
      <div className="user-selector editing">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          autoFocus
          placeholder="Enter user ID"
        />
        <button onClick={handleSubmit}>Save</button>
        <button onClick={() => setIsEditing(false)}>Cancel</button>
      </div>
    );
  }

  return (
    <div className="user-selector">
      <span className="user-label">User:</span>
      <span className="user-value">{userId}</span>
      <button onClick={() => setIsEditing(true)} className="edit-button">
        Edit
      </button>
    </div>
  );
}
