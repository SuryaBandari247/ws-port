import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { EditorPage } from './pages/EditorPage';
import './index.css';

function App() {
  return (
    <Router basename="/passport-photo-online">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/editor/:type" element={<EditorPage />} />
      </Routes>
    </Router>
  );
}

export default App;
