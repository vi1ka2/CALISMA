import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import io from 'socket.io-client';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Connect to Socket.IO (adjust URL/port as needed)
const socket = io('http://localhost:5000');

export default function CommunityForum() {
  const navigate = useNavigate();

  // User & Auth
  const [username, setUsername] = useState('');

  // Thread list
  const [threads, setThreads] = useState([]);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadMessage, setNewThreadMessage] = useState('');

  // Selected thread detail
  const [selectedThread, setSelectedThread] = useState(null);
  const [newReply, setNewReply] = useState('');

  // On mount, verify auth & fetch user profile
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // If not logged in, redirect to login
      navigate('/login');
      return;
    }
    // Fetch user profile to get username
    axios
      .get('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUsername(res.data.name);
      })
      .catch((err) => {
        console.error('Error fetching profile:', err);
        navigate('/login');
      });

    // Listen for socket events
    socket.on('thread created', (thread) => {
      setThreads((prev) => [thread, ...prev]);
    });
    socket.on('reply created', (reply) => {
      // If the reply belongs to the currently selected thread, update it
      if (selectedThread && reply.threadId === selectedThread._id) {
        setSelectedThread((prev) => ({
          ...prev,
          messages: [...prev.messages, reply]
        }));
      }
    });

    // Cleanup on unmount
    return () => {
      socket.off('thread created');
      socket.off('reply created');
    };
  }, [navigate, selectedThread]);

  // Fetch the list of threads
  const fetchThreads = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/forum/threads', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setThreads(res.data);
    } catch (err) {
      console.error('Error fetching threads:', err);
    }
  };

  // Fetch a single thread detail
  const fetchThreadDetail = async (threadId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/forum/threads/${threadId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedThread(res.data);
    } catch (err) {
      console.error('Error fetching thread detail:', err);
    }
  };

  // On first load, get the threads
  useEffect(() => {
    fetchThreads();
  }, []);

  // Create a new thread
  const handleCreateThread = async () => {
    if (!newThreadTitle.trim() || !newThreadMessage.trim()) {
      alert("Please enter both a thread title and a message.");
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/forum/threads',
        {
          title: newThreadTitle,
          message: newThreadMessage,
          author: username,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const createdThread = res.data;
      // Emit socket event for real-time updates
      socket.emit('thread created', createdThread);

      // Clear form
      setNewThreadTitle('');
      setNewThreadMessage('');
      
      // Refresh thread list to include the new thread
      fetchThreads();
    } catch (err) {
      console.error('Error creating thread:', err);
      alert("There was an error creating the thread. Please try again.");
    }
  };

  // Post a reply in the selected thread
  const handlePostReply = async () => {
    if (!newReply.trim() || !selectedThread) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `http://localhost:5000/api/forum/threads/${selectedThread._id}/replies`,
        {
          text: newReply,
          author: username,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const createdReply = res.data;
      // Emit socket event
      socket.emit('reply created', createdReply);

      setNewReply('');
      // Optionally update the local state
      setSelectedThread((prev) => ({
        ...prev,
        messages: [...prev.messages, createdReply],
      }));
    } catch (err) {
      console.error('Error posting reply:', err);
      alert("There was an error posting your reply. Please try again.");
    }
  };

  // Render the list of threads
  const renderThreadsList = () => (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Typography variant="h5" gutterBottom>
        Forum Threads
      </Typography>
      {threads.length === 0 ? (
        <Typography>No threads yet. Create one below!</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {threads.map((thread) => (
              <TableRow key={thread._id}>
                <TableCell>{thread.title}</TableCell>
                <TableCell>{thread.author}</TableCell>
                <TableCell>
                  <Button variant="outlined" onClick={() => fetchThreadDetail(thread._id)}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Paper>
  );

  // Render create new thread form
  const renderCreateThreadForm = () => (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Create a New Thread
      </Typography>
      <TextField
        label="Thread Title"
        variant="outlined"
        fullWidth
        sx={{ mb: 2 }}
        value={newThreadTitle}
        onChange={(e) => setNewThreadTitle(e.target.value)}
      />
      <TextField
        label="Message"
        variant="outlined"
        multiline
        rows={4}
        fullWidth
        sx={{ mb: 2 }}
        value={newThreadMessage}
        onChange={(e) => setNewThreadMessage(e.target.value)}
      />
      <Button variant="contained" onClick={handleCreateThread}>
        Create Thread
      </Button>
    </Paper>
  );

  // Render a selected thread detail (messages)
  const renderThreadDetail = () => {
    if (!selectedThread) return null;
    return (
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h5" gutterBottom>
          {selectedThread.title}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          by {selectedThread.author}
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {/* List messages */}
        <List>
          {selectedThread.messages.map((msg) => (
            <Box key={msg._id} sx={{ mb: 2 }}>
              <ListItem disablePadding>
                <ListItemText
                  primary={`${msg.author} says:`}
                  secondary={msg.text}
                />
              </ListItem>
              <Divider />
            </Box>
          ))}
        </List>

        {/* Reply form */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">Post a Reply</Typography>
          <TextField
            label="Your Reply"
            variant="outlined"
            multiline
            rows={3}
            fullWidth
            sx={{ mb: 2 }}
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
          />
          <Button variant="contained" onClick={handlePostReply}>
            Reply
          </Button>
          <Button variant="text" sx={{ ml: 2 }} onClick={() => setSelectedThread(null)}>
            Back to Threads
          </Button>
        </Box>
      </Paper>
    );
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Community Forum
      </Typography>
      {/* If no thread is selected, show the thread list and create form */}
      {!selectedThread ? (
        <>
          {renderThreadsList()}
          {renderCreateThreadForm()}
        </>
      ) : (
        renderThreadDetail()
      )}
    </Container>
  );
}




