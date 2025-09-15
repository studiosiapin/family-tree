import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FamilyTreeProvider } from './context/FamilyTreeContext';
import { HomePage } from './pages/HomePage';
import { AdminPage } from './pages/AdminPage';
import './style.css';

function App() {
  return (
    <FamilyTreeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Router>
    </FamilyTreeProvider>
  );
}

export default App;