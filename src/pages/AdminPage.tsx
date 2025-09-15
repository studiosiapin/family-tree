import React, { useState, useEffect } from 'react';
import { useFamilyTree } from '../context/FamilyTreeContext';
import { MessageDisplay } from '../components/MessageDisplay';
import { PersonForm } from '../components/PersonForm';
import { CoupleForm } from '../components/CoupleForm';
import { AddChildrenForm } from '../components/AddChildrenForm';
import { EditDeletePersonForm } from '../components/EditDeletePersonForm';
import { SearchForm } from '../components/SearchForm';
import { FamilyTreeDisplay } from '../components/FamilyTreeDisplay';
import { isAdminLoggedIn, loginAdmin, logoutAdmin } from '../services/familyTreeService';

export function AdminPage() {
  const { familyData, loading, resetData, message, clearMessage, showMessage } = useFamilyTree();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    setIsLoggedIn(isAdminLoggedIn());
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loginAdmin(username.trim(), password)) {
      setIsLoggedIn(true);
      showMessage('Login successful! Welcome to the admin panel.', 'success');
      setUsername('');
      setPassword('');
    } else {
      showMessage('Invalid credentials. Please try again.', 'error');
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setIsLoggedIn(false);
    showMessage('You have been logged out successfully.', 'success');
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to delete all family tree data? This cannot be undone.')) {
      resetData();
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <div className="login-card">
          <MessageDisplay message={message} onClose={clearMessage} />
          <h1 className="login-title">🔐 Admin Login</h1>
          <p className="login-subtitle">Please enter your credentials to access the admin panel</p>
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter username"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter password"
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              🚀 Login
            </button>
          </form>
          
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#64748b' }}>Demo credentials:</p>
            <p style={{ fontSize: '14px', color: '#64748b' }}><strong>Username:</strong> admin</p>
            <p style={{ fontSize: '14px', color: '#64748b' }}><strong>Password:</strong> password</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button onClick={handleLogout} className="logout-btn">
        🚪 Logout
      </button>
      
      <div className="admin-layout-container">
        {/* Admin Panel */}
        <div className="admin-panel">
          <MessageDisplay message={message} onClose={clearMessage} />
          <h1 style={{ color: '#1e293b', marginBottom: '24px', fontSize: '24px', fontWeight: '700' }}>
            🌳 Family Tree Admin
          </h1>
          
          {/* Stats */}
          <div className="stats">
            <div className="stats-item">
              <span>👥 People:</span>
              <span>{familyData.people.length}</span>
            </div>
            <div className="stats-item">
              <span>💕 Couples:</span>
              <span>{familyData.couples.length}</span>
            </div>
          </div>

          {/* Search Section */}
          <SearchForm />

          {/* Add Person Section */}
          <PersonForm />

          {/* Create Couple Section */}
          <CoupleForm />

          {/* Add Children Section */}
          <AddChildrenForm />

          {/* Edit/Delete Person Section */}
          <EditDeletePersonForm />

          {/* Reset Data Section */}
          <div className="section">
            <h2>⚠️ Reset Data</h2>
            <button onClick={handleResetData} className="btn btn-danger">
              🗑️ Clear All Data
            </button>
          </div>
        </div>

        {/* Tree View */}
        <div className="tree-container">
          <h2 style={{ marginBottom: '20px', color: '#1e293b' }}>🌳 Family Tree Preview</h2>
          <div className="tree-view">
            <FamilyTreeDisplay />
          </div>
        </div>
      </div>
    </div>
  );
}