import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Paper,
  Button,
  TextField,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Timer durations based on difficulty (in seconds)
const difficultyTimes = {
  Easy: 900,    // 15 minutes
  Medium: 2100, // 35 minutes
  Hard: 3000    // 50 minutes
};

// Helper function to format seconds into MM:SS
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const VideoInterview = () => {
  const totalQuestions = 5; // Total questions in the session

  // Pre-interview filter states
  const [filters, setFilters] = useState({
    jobRole: '',
    interviewLevel: '',
    companyType: ''
  });
  const [filtersSet, setFiltersSet] = useState(false);

  // Interview states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [question, setQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState(''); // Transcribed or typed
  const [feedback, setFeedback] = useState(null);
  const [currentQuestionScore, setCurrentQuestionScore] = useState(0);
  const [cumulativeScore, setCumulativeScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0); // Will be set based on difficulty

  // Video
  const videoRef = useRef(null);
  const [videoStream, setVideoStream] = useState(null);

  // Speech recognition
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  // 1) Start interview after filters are chosen
  const startInterview = async () => {
    setFiltersSet(true);
    setCurrentQuestionIndex(0);
    setCumulativeScore(0);
    await fetchQuestion();
  };

  // 2) Fetch a question from the backend
  const fetchQuestion = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/questions/generate',
        {
          topic: filters.jobRole || 'General',
          difficulty: 'Medium', // Example only; can let user pick
          interviewLevel: filters.interviewLevel,
          companyType: filters.companyType
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuestion(response.data);
      setUserAnswer('');
      setFeedback(null);
      setCurrentQuestionScore(0);

      // Timer
      const timeForQuestion = difficultyTimes[response.data.difficulty] || 900;
      setTimer(timeForQuestion);
    } catch (error) {
      console.error('Error fetching question:', error);
    }
    setLoading(false);
  };

  // 3) Start the timer whenever we have a question
  useEffect(() => {
    if (question) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmit(); // auto-submit
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [question]);

  // 4) Start camera feed only when user clicks "Start Video"
  const handleStartVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setVideoStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  // 5) Stop camera feed
  const handleStopVideo = () => {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
      setVideoStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // 6) Speech recognition (optional)
  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in your browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setUserAnswer(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    recognition.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // 7) Submit the current answer
  const handleSubmit = async () => {
    clearInterval(timerRef.current);
    if (!question) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/answers/analyze',
        { questionId: question._id, userAnswer },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const qScore = response.data.score || 0;
      setCurrentQuestionScore(qScore);
      setCumulativeScore((prev) => prev + qScore);
      setFeedback(response.data.feedback);
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  // 8) Move to next question or finish
  const handleNext = async () => {
    if (currentQuestionIndex + 1 >= totalQuestions) {
      alert(`Interview complete! Your total score is: ${cumulativeScore}`);
      navigate('/dashboard');
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      await fetchQuestion();
    }
  };

  // Render filter UI
  const renderFilters = () => (
    <Paper sx={{ p: 4, mb: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Set Interview Filters
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Job Role</InputLabel>
          <Select
            value={filters.jobRole}
            label="Job Role"
            onChange={(e) => setFilters({ ...filters, jobRole: e.target.value })}
          >
            <MenuItem value="Frontend Developer">Frontend Developer</MenuItem>
            <MenuItem value="Backend Developer">Backend Developer</MenuItem>
            <MenuItem value="Fullstack Developer">Fullstack Developer</MenuItem>
            <MenuItem value="Data Scientist">Data Scientist</MenuItem>
            <MenuItem value="DevOps Engineer">DevOps Engineer</MenuItem>
            <MenuItem value="Mobile Developer">Mobile Developer</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Interview Level</InputLabel>
          <Select
            value={filters.interviewLevel}
            label="Interview Level"
            onChange={(e) => setFilters({ ...filters, interviewLevel: e.target.value })}
          >
            <MenuItem value="Technical">Technical</MenuItem>
            <MenuItem value="HR">HR</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Company Type</InputLabel>
          <Select
            value={filters.companyType}
            label="Company Type"
            onChange={(e) => setFilters({ ...filters, companyType: e.target.value })}
          >
            <MenuItem value="MNC">MNC</MenuItem>
            <MenuItem value="FAANG">FAANG</MenuItem>
            <MenuItem value="STARTUP">STARTUP</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={startInterview}
          disabled={!filters.jobRole || !filters.interviewLevel || !filters.companyType}
        >
          Start Video Interview
        </Button>
      </Box>
    </Paper>
  );

  // Actual interview UI
  const renderInterview = () => (
    <>
      <Typography variant="h4" align="center" gutterBottom>
        Video Interview Session ({currentQuestionIndex + 1}/{totalQuestions})
      </Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'primary.main',
          color: '#fff',
          borderRadius: 2,
          p: 1,
          mb: 2,
          width: '200px',
          margin: 'auto'
        }}
      >
        <Typography variant="h6">{formatTime(timer)}</Typography>
      </Box>

      {/* Video controls */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <video
          ref={videoRef}
          autoPlay
          style={{
            width: '100%',
            maxHeight: '300px',
            borderRadius: 8,
            boxShadow: '0px 4px 12px rgba(0,0,0,0.2)'
          }}
        />
        <Box sx={{ mt: 1 }}>
          <Button variant="contained" color="primary" onClick={handleStartVideo} sx={{ mr: 2 }}>
            Start Video
          </Button>
          <Button variant="outlined" color="error" onClick={handleStopVideo}>
            Stop Video
          </Button>
        </Box>
      </Box>

      {loading || !question ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper elevation={4} sx={{ p: 3, mt: 4, bgcolor: '#ffffffcc', backdropFilter: 'blur(4px)' }}>
          <Typography variant="h6" gutterBottom>
            Question: ({question.difficulty})
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {question.questionText}
          </Typography>
          {/* Speech recognition (optional) */}
          <Box sx={{ mb: 2 }}>
            <Button variant="contained" color="primary" onClick={startRecording}>
              Start Speech Recognition
            </Button>
            <Button variant="outlined" color="secondary" sx={{ ml: 2 }} onClick={stopRecording}>
              Stop Speech Recognition
            </Button>
          </Box>
          <TextField
            label="Transcribed / Typed Answer"
            variant="outlined"
            multiline
            rows={4}
            fullWidth
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            helperText="This text is generated from speech recognition or typed manually."
          />
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            sx={{ mt: 2 }}
            onClick={handleSubmit}
            disabled={feedback !== null}
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
      <Paper elevation={3} sx={{ p: 3, mt: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Scoreboard
        </Typography>
        <Typography variant="h5">Total Score: {cumulativeScore}</Typography>
      </Paper>
    </>
  );

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {!filtersSet ? renderFilters() : renderInterview()}
    </Container>
  );
};

export default VideoInterview;


