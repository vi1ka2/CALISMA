import React, { useState } from 'react';
import { Container, Paper, TextField, Button, List, ListItem, ListItemText, Box } from '@mui/material';
import axios from 'axios';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;

    // 1. Add the user's message to the chat
    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);

    // 2. Clear the input field
    const userMessage = input;
    setInput('');

    try {
      // 3. Call your backend route to get AI response
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/chat', // Adjust if needed
        { userMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 4. Extract the AI reply from the response
      const aiReply = response.data.reply || "No response";

      // 5. Add the AI's message to the chat
      setMessages((prev) => [...prev, { sender: 'ai', text: aiReply }]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Optionally show an error message in the chat
      setMessages((prev) => [...prev, { sender: 'ai', text: "Error getting AI response." }]);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 2, height: 400, overflowY: 'auto', mb: 2 }}>
        <List>
          {messages.map((msg, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={
                  <Box
                    sx={{
                      bgcolor: msg.sender === 'user' ? '#1976d2' : '#e0e0e0',
                      color: msg.sender === 'user' ? '#fff' : '#000',
                      p: 1,
                      borderRadius: 1,
                      textAlign: msg.sender === 'user' ? 'right' : 'left',
                      maxWidth: '80%',
                      alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {msg.text}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>
      <TextField
        fullWidth
        placeholder="Type your message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={sendMessage} sx={{ mt: 2 }}>
        Send
      </Button>
    </Container>
  );
};

export default Chatbot;

