// src/App.js
import React from 'react';
import { Navigate } from 'react-router-dom';

function App() {
  // Option A: Show your own homepage content
  return <h1>Welcome to My Interview App!</h1>;

  // Option B: Redirect to /login
  // return <Navigate to="/login" replace />;
}

export default App;
