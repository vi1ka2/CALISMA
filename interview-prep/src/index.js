import React from 'react';
import ReactDOM from 'react-dom/client';
import 'react-calendar/dist/Calendar.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PublicLandingPage from './pages/PublicLandingPage';
import UserLandingPage from './pages/UserLandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Interview from './pages/Interview';
import LiveInterview from './pages/LiveInterview';
import VideoInterview from './pages/VideoInterview';
import Chatbot from './pages/Chatbot';
import CommunityForum from './pages/CommunityForum';
import ProfilePage from './pages/ProfilePage';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <Routes>
      <Route path="/" element={<PublicLandingPage />} />
      <Route path="/user-home" element={<UserLandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/interview" element={<Interview />} />
      <Route path="/live-interview" element={<LiveInterview />} />
      <Route path="/video-interview" element={<VideoInterview />} />
      <Route path="/chat" element={<Chatbot />} />
      <Route path="/community" element={<CommunityForum />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  </Router>
);








