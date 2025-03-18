import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Box,
  Button,
  Avatar,
  IconButton,
  CircularProgress,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profilePic, setProfilePic] = useState(null);
  const [recommendedTopics, setRecommendedTopics] = useState([]);
  const [showFullHistory, setShowFullHistory] = useState(false); // NEW: Toggles expanded history
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
    fetchUserAnswers();
  }, []);

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      if (res.data.profilePic) {
        setProfilePic(res.data.profilePic);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Fetch user answers and compute recommended topics
  const fetchUserAnswers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get('http://localhost:5000/api/answers/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnswers(res.data);
      computeRecommendedTopics(res.data);
    } catch (error) {
      console.error('Error fetching answers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Compute recommended topics based on interview history
  const computeRecommendedTopics = (answers) => {
    const topicCount = {};
    answers.forEach((ans) => {
      const topic = ans.questionId?.topic || 'General';
      topicCount[topic] = (topicCount[topic] || 0) + 1;
    });
    // Recommend topics with count < 2, as an example
    const recommendations = Object.entries(topicCount)
      .filter(([_, count]) => count < 2)
      .map(([topic]) => topic);
    if (recommendations.length === 0) {
      recommendations.push('General');
    }
    setRecommendedTopics(recommendations);
  };

  // Prepare data for the progress chart
  const chartData = answers.map((ans) => ({
    date: new Date(ans.createdAt).toLocaleDateString(),
    score: ans.score,
  }));

  // Calculate average score for performance insights
  const averageScore =
    answers.length > 0
      ? (
          answers.reduce((acc, ans) => acc + (ans.score || 0), 0) / answers.length
        ).toFixed(1)
      : 0;

  // Handle profile picture update
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
        // Optionally, update the profile picture on the server here
      };
      reader.readAsDataURL(file);
    }
  };

  // If still loading, show a spinner
  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  // If no user, prompt to log in
  if (!user) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6">You are not logged in.</Typography>
      </Container>
    );
  }

  // Build a Set of "activeDates" from answers for the calendar
  const activeDates = new Set(
    answers.map((ans) => new Date(ans.createdAt).toDateString())
  );

  // Function to highlight active days in the calendar
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      if (activeDates.has(date.toDateString())) {
        return 'active-day'; // You can define this CSS class
      }
    }
    return null;
  };

  // NEW: Decide how many history items to show
  const displayedAnswers = showFullHistory ? answers : answers.slice(0, 3);

  return (
    <Box sx={{ bgcolor: '#f0f4f8', py: 4, minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Profile Card */}
        <Paper
          elevation={4}
          sx={{
            p: 3,
            mb: 4,
            display: 'flex',
            alignItems: 'center',
            borderRadius: 2,
            background: 'linear-gradient(135deg,rgb(54, 177, 230) 0%,rgba(156, 71, 47, 0.96) 100%)',
            color: '#fffff'
          }}
        >
          <Box sx={{ mr: 3, position: 'relative' }}>
            <Avatar src={profilePic} sx={{ width: 100, height: 100 }}>
              {user.name.charAt(0)}
            </Avatar>
            <IconButton
              color="inherit"
              component="label"
              sx={{ position: 'absolute', bottom: 0, right: 0 }}
            >
              <PhotoCameraIcon />
              <input hidden accept="image/*" type="file" onChange={handleProfilePicChange} />
            </IconButton>
          </Box>
          <Box>
            <Typography variant="h4">{user.name}</Typography>
            <Typography variant="subtitle1">{user.email}</Typography>
          </Box>
        </Paper>

        {/* Interview Options */}
        <Paper elevation={3} sx={{ p: 3, mb: 4, textAlign: 'center' }}>
          <Button variant="contained" color="primary" onClick={() => navigate('/interview')} sx={{ mr: 2, mb: 1 }}>
            Take Basic Interview
          </Button>
          <Button variant="contained" color="success" onClick={() => navigate('/live-interview')} sx={{ mr: 2, mb: 1 }}>
            Take Live Interview
          </Button>
          <Button variant="contained" color="secondary" onClick={() => navigate('/video-interview')} sx={{ mr: 2, mb: 1 }}>
            Take Video Interview
          </Button>
          <Button variant="outlined" color="primary" onClick={() => navigate('/chat')} sx={{ mb: 1 }}>
            Chat with AI
          </Button>
        </Paper>

        {/* Performance Chart & Interview History */}
        <Grid container spacing={4}>
          {/* Performance Chart */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Progress Over Time
              </Typography>
              {chartData.length === 0 ? (
                <Typography variant="body1">No data available for chart.</Typography>
              ) : (
                <Box sx={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 10]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Interview History */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Interview History
              </Typography>
              {answers.length === 0 ? (
                <Typography variant="body1">You have no interview attempts yet.</Typography>
              ) : (
                <Box>
                  {displayedAnswers.map((ans) => {
                    const questionInfo = ans.questionId || {};
                    return (
                      <Paper
                        key={ans._id}
                        sx={{ p: 2, mb: 2, background: '#fff', borderRadius: 2 }}
                      >
                        <Typography variant="body2">
                          <strong>Date:</strong> {new Date(ans.createdAt).toLocaleString()}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Role:</strong> {questionInfo.topic || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Difficulty:</strong> {questionInfo.difficulty || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Question:</strong> {questionInfo.questionText || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Score:</strong> {ans.score}/10
                        </Typography>
                        <Typography variant="body2">
                          <strong>Feedback:</strong> {ans.feedback || 'N/A'}
                        </Typography>
                      </Paper>
                    );
                  })}
                  {/* Show More / Show Less Button */}
                  {answers.length > 3 && (
                    <Button
                      variant="outlined"
                      onClick={() => setShowFullHistory(!showFullHistory)}
                      sx={{ mt: 1 }}
                    >
                      {showFullHistory ? 'Show Less' : 'Show More'}
                    </Button>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Performance Insights */}
        <Paper elevation={3} sx={{ p: 3, mt: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Performance Insights
          </Typography>
          {answers.length === 0 ? (
            <Typography variant="body1">No interviews yet.</Typography>
          ) : (
            <Typography variant="body1">
              Your average score over {answers.length} interviews is {averageScore}. Keep practicing to improve your skills!
            </Typography>
          )}
        </Paper>

        {/* Recommended Topics */}
        <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Recommended Practice Topics
          </Typography>
          {recommendedTopics.length === 0 ? (
            <Typography variant="body1">No recommendations available.</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {recommendedTopics.map((topic, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  color="secondary"
                  onClick={() => navigate('/interview', { state: { topic } })}
                >
                  {topic}
                </Button>
              ))}
            </Box>
          )}
        </Paper>

        {/* Activity Calendar */}
        <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Activity Calendar
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Days highlighted below are those where you had at least one interview attempt.
          </Typography>
          <Calendar
            tileClassName={({ date, view }) => {
              if (view === 'month') {
                const dateString = date.toDateString();
                const isActiveDay = answers.some(
                  (ans) => new Date(ans.createdAt).toDateString() === dateString
                );
                return isActiveDay ? 'active-day' : null;
              }
              return null;
            }}
          />
        </Paper>
      </Container>
    </Box>
  );
};

export default Dashboard;








