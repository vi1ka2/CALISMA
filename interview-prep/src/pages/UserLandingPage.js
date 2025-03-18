// src/pages/UserLandingPage.js

import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Avatar
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserLandingPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Check auth on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    // Fetch user profile
    axios
      .get('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch((err) => {
        console.error(err);
        navigate('/login');
      });
  }, [navigate]);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMenuClick = (path) => {
    setDrawerOpen(false);
    navigate(path);
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Top Navigation - Creative Header */}
      <AppBar
        position="static"
        sx={{
          background: 'linear-gradient(45deg, #42a5f5 30%, #478ed1 90%)',
          boxShadow: 'none',
          p: 1
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Left section: Menu icon + Brand */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton color="inherit" onClick={toggleDrawer} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              InterviewPrep
            </Typography>
          </Box>

          {/* Right section: "Hello, username" + Avatar */}
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography sx={{ mr: 1, fontWeight: 'bold' }}>
                Hello, {user.name}
              </Typography>
              <Avatar
                src={user.profilePic}
                sx={{
                  bgcolor: '#fff',
                  color: 'primary.main',
                  fontWeight: 'bold'
                }}
              >
                {user.name ? user.name.charAt(0) : 'U'}
              </Avatar>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Drawer for Dashboard, Profile, etc. */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
        <Box sx={{ width: 250 }}>
          <List>
            <ListItem button onClick={() => handleMenuClick('/dashboard')}>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem button onClick={() => handleMenuClick('/profile')}>
              <ListItemText primary="Profile" />
            </ListItem>
            <ListItem button onClick={() => handleMenuClick('/community')}>
              <ListItemText primary="Community Forum" />
            </ListItem>
            <ListItem button onClick={() => handleMenuClick('/chat')}>
              <ListItemText primary="Chatbot" />
            </ListItem>
            <ListItem
              button
              onClick={() => {
                localStorage.removeItem('token');
                navigate('/');
              }}
            >
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Hero Section (same background as public landing) */}
      <Box
        sx={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1504384308090-c894fdcc538d")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#fff',
          textAlign: 'center',
          p: 4,
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
          {user ? `Welcome, ${user.name}!` : 'Welcome!'}
        </Typography>
        <Typography variant="h6" sx={{ maxWidth: '600px', mb: 3 }}>
          Your personalized interview hub. Practice, learn, and engage with the community.
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          sx={{ fontWeight: 'bold', px: 4, py: 1.5 }}
          onClick={() => navigate('/dashboard')}
        >
          Go to Dashboard
        </Button>
      </Box>

      {/* Additional content (featured resources, community highlights, etc.) */}
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Your Interview Journey Starts Here
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: '600px', margin: '0 auto' }}>
          Explore our advanced analytics, engage with the community, and refine your skills with personalized feedback.
        </Typography>
      </Box>
    </Box>
  );
};

export default UserLandingPage;


