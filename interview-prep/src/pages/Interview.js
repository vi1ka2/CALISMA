import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import axios from 'axios';

const Interview = () => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [question, setQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);

  const fetchQuestion = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/questions/generate',
        { topic, difficulty },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setQuestion(response.data);
      setUserAnswer('');
      setFeedback(null);
    } catch (error) {
      console.error('Error fetching question:', error);
    }
  };

  const submitAnswer = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/answers/analyze',
        { questionId: question._id, userAnswer },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setFeedback(response.data);
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        AI Interview Practice
      </Typography>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Topic"
            variant="outlined"
            fullWidth
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <FormControl fullWidth variant="outlined">
            <InputLabel>Difficulty</InputLabel>
            <Select
              label="Difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <MenuItem value=""><em>Select Difficulty</em></MenuItem>
              <MenuItem value="Easy">Easy</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Hard">Hard</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Button variant="contained" color="primary" fullWidth onClick={fetchQuestion}>
          Generate Question
        </Button>
      </Paper>

      {question && (
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Question:
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
            onClick={submitAnswer}
          >
            Submit Answer
          </Button>
        </Paper>
      )}

      {feedback && (
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>
            Feedback:
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Score: {feedback.score}/10
          </Typography>
          <Typography variant="body1">{feedback.feedback}</Typography>
        </Paper>
      )}
    </Container>
  );
};

export default Interview;

