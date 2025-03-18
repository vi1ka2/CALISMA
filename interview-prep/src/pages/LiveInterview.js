import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Paper,
  Button,
  TextField,
  Box,
  CircularProgress,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const defaultTimeForDifficulty = {
  Easy: 1080,
  Medium:2100 ,
  Hard: 3000,
};

const jobRoles = [
  'Frontend Developer',
  'Backend Developer',
  'Fullstack Developer',
  'Data Scientist',
  'DevOps Engineer',
  'Mobile Developer',
  'Software Developer',
  'Software Developer in MNC',
  'Software Developer in FAANG',
];

const LiveInterview = () => {
  const totalQuestions = 5;  // Total questions per session

  // States for role & custom time
  const [selectedRole, setSelectedRole] = useState('');
  const [customTime, setCustomTime] = useState(0);

  // States for question & interview flow
  const [questionTime, setQuestionTime] = useState(30);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [question, setQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [currentQuestionScore, setCurrentQuestionScore] = useState(0);
  const [cumulativeScore, setCumulativeScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(questionTime);

  const navigate = useNavigate();
  const timerRef = useRef(null);

  // ---------------------------
  // 1) Fetch Question
  // ---------------------------
  const fetchQuestion = async () => {
    setLoading(true);
    try {
      // For simplicity, we use "Medium" difficulty here.
      // You can also let the user pick difficulty or store it in state.
      const response = await axios.post(
        'http://localhost:5000/api/questions/generate',
        {
          // Pass the selected role as the "topic" or "domain"
          topic: selectedRole || 'General',
          difficulty: 'Medium',
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      setQuestion(response.data);
      setUserAnswer('');
      setFeedback(null);
      setCurrentQuestionScore(0);

      // Determine timer based on difficulty or customTime
      const autoTime = defaultTimeForDifficulty[response.data.difficulty] || 30;
      const newTime = customTime > 0 ? customTime : autoTime;
      setQuestionTime(newTime);
      setTimer(newTime);
    } catch (error) {
      console.error('Error fetching question:', error);
    }
    setLoading(false);
  };

  // ---------------------------
  // 2) Start Timer When New Question Is Loaded
  // ---------------------------
  useEffect(() => {
    if (question) {
      clearInterval(timerRef.current);
      setTimer(questionTime);

      timerRef.current = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(timerRef.current);
            handleSubmit(); // auto-submit when time runs out
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [question, questionTime]);

  // ---------------------------
  // 3) Submit Answer
  // ---------------------------
  const handleSubmit = async () => {
    clearInterval(timerRef.current);
    if (!question) return;

    try {
      const response = await axios.post(
        'http://localhost:5000/api/answers/analyze',
        { questionId: question._id, userAnswer },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      const qScore = response.data.score || 0;
      setCurrentQuestionScore(qScore);
      setCumulativeScore((prev) => prev + qScore);
      setFeedback(response.data.feedback);
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  // ---------------------------
  // 4) Next Question or Finish
  // ---------------------------
  const handleNext = async () => {
    if (currentQuestionIndex + 1 >= totalQuestions) {
      alert(`Interview session complete! Your total score is: ${cumulativeScore}`);
      navigate('/dashboard');
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      await fetchQuestion();
    }
  };

  // ---------------------------
  // 5) Start the Interview (Initial)
  // ---------------------------
  const startInterview = async () => {
    setCurrentQuestionIndex(0);
    setCumulativeScore(0);
    await fetchQuestion();
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {/* If user hasn't chosen a role yet, show role selection UI */}
      {!question && currentQuestionIndex === 0 ? (
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Select Your Job Role
          </Typography>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Job Role</InputLabel>
            <Select
              value={selectedRole}
              label="Job Role"
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              {jobRoles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Custom Time (seconds)"
            type="number"
            value={customTime}
            onChange={(e) => setCustomTime(Number(e.target.value))}
            sx={{ mt: 2 }}
            helperText="Leave 0 for auto time based on difficulty"
            fullWidth
          />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
            onClick={startInterview}
            disabled={!selectedRole}
          >
            Start Interview
          </Button>
        </Paper>
      ) : (
        <>
          <Typography variant="h4" align="center" gutterBottom>
            Live Interview Session ({currentQuestionIndex + 1}/{totalQuestions})
          </Typography>
          <Typography variant="h6" align="center">
            Timer: {timer} seconds
          </Typography>

          {loading || !question ? (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Question ({question.difficulty}):
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {question.questionText}
              </Typography>
              <TextField
                label="Your Answer"
                variant="outlined"
                multiline
                rows={4}
                fullWidth
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
              />
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                sx={{ mt: 2 }}
                onClick={handleSubmit}
                disabled={feedback !== null} // Prevent re-submission
              >
                Submit Answer
              </Button>
              {feedback && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" color="textSecondary">
                    Feedback: {feedback}
                  </Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    Score for this question: {currentQuestionScore}
                  </Typography>
                  <Button variant="outlined" color="primary" fullWidth sx={{ mt: 2 }} onClick={handleNext}>
                    Next Question
                  </Button>
                </Box>
              )}
            </Paper>
          )}

          <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Scoreboard
            </Typography>
            <Typography variant="h5">
              Total Score: {cumulativeScore}
            </Typography>
          </Paper>
        </>
      )}
    </Container>
  );
};

export default LiveInterview;



