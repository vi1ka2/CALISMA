import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Avatar,
  IconButton,
  CircularProgress
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const navigate = useNavigate();
  
  // Profile states
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Fetch profile on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    axios
      .get('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data);
        setName(res.data.name);
        setEmail(res.data.email);
        setProfilePic(res.data.profilePic);
      })
      .catch((error) => {
        console.error('Error fetching profile:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);
  
  // Handle profile picture update (preview only)
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Show a preview and optionally update on server
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle profile update submission
  const handleUpdateProfile = async () => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      // Data to update - adjust as needed. The backend must handle these fields.
      const updatedData = { name, email, profilePic };
      const res = await axios.put('http://localhost:5000/api/auth/profile', updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }
  
  if (!user) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6">You are not logged in.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={4} sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar src={profilePic} sx={{ width: 120, height: 120, mb: 2 }}>
            {user.name.charAt(0)}
          </Avatar>
          <IconButton
            color="inherit"
            component="label"
            sx={{ mb: 2 }}
          >
            <PhotoCameraIcon />
            <input hidden accept="image/*" type="file" onChange={handleProfilePicChange} />
          </IconButton>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Update Your Profile
          </Typography>
        </Box>
        <TextField
          label="Name"
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleUpdateProfile}
          disabled={updating}
        >
          {updating ? 'Updating...' : 'Update Profile'}
        </Button>
      </Paper>
      <Button variant="outlined" fullWidth onClick={() => navigate('/dashboard')}>
        Back to Dashboard
      </Button>
    </Container>
  );
};

export default ProfilePage;
