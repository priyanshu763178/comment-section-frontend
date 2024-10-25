"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { TextField, Button, Typography, Box, Container, Snackbar } from '@mui/material';
import { styled } from '@mui/material/styles';

const socket = io('http://localhost:4000');


const CustomContainer = styled(Container)(({ theme }) => ({
  backgroundColor: '#f9f9f9',
  padding: theme.spacing(4),
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
 
}));

const CommentBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#ffffff',
  border: '1px solid #ddd',
  borderRadius: '8px',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  transition: 'background-color 0.3s',
  '&:hover': {
    backgroundColor: '#f1f1f1',
  },
}));

const CustomButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#1976d2',
  color: 'white',
  padding: theme.spacing(1.5, 3),
  borderRadius: '20px',
  transition: 'background-color 0.3s, transform 0.2s',
  '&:hover': {
    backgroundColor: '#115293',
    transform: 'scale(1.05)',
  },
}));

const LogoutButton = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(2),
  padding: theme.spacing(1.5, 3),
  borderRadius: '20px',
  backgroundColor: '#4caf50',
  color: 'white',
  transition: 'background-color 0.3s, transform 0.2s',
  '&:hover': {
    backgroundColor: '#388e3c',
    transform: 'scale(1.05)',
  },
}));

const CustomTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    '& fieldset': {
      borderColor: '#1976d2',
    },
    '&:hover fieldset': {
      borderColor: '#115293',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1976d2',
    },
  },
}));

export default function Home() {
  const [username, setUsername] = useState('');
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:4000/api/comments')
      .then(response => setComments(response.data));

    socket.on('newComment', (newComment) => {
      setComments(prev => [newComment, ...prev]);
    });

    return () => socket.off('newComment');
  }, []);

  const handleLogin = () => {
    if (!username.trim()) {
      setError(true);
      return;
    }
    
    axios.post('http://localhost:4000/api/login', { username })
      .then(response => setSessionId(response.data.sessionId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (comment) {
      axios.post('http://localhost:4000/api/comments', { username, comment });
      setComment('');
    }
  };

  const handleLogout = () => {
    setSessionId(null);
    setUsername('');
  };

  const handleClose = () => {
    setError(false);
  };

  return (
    <CustomContainer>
      <Box my={3}>
        <Typography sx={{ textAlign: "center", fontWeight: 'bold', color: '#333' }} variant="h4" gutterBottom>Real-Time Comments</Typography>
        {!sessionId ? (
          <Box display='flex' justifyContent="center" alignItems="center" gap="20px">
            <CustomTextField 
              required 
              label="Username" 
              onChange={(e) => setUsername(e.target.value)} 
              error={!username.trim() && error}
              helperText={!username.trim() && error ? 'Username is required' : ''}
            />
            <CustomButton variant="contained" onClick={handleLogin}>Login</CustomButton>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            <CustomTextField 
              fullWidth 
              multiline 
              rows={4} 
              placeholder="Write a comment..." 
              value={comment} 
              onChange={(e) => setComment(e.target.value)} 
              sx={{ mb: 2 }} // Adding margin-bottom for spacing
            />
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <CustomButton type="submit" variant="contained">Post Comment</CustomButton>
              <LogoutButton variant="contained" onClick={handleLogout}>
                Logout
              </LogoutButton>
            </Box>
          </Box>
        )}
        <Box my={4}>
          {comments.map((c, index) => (
            <CommentBox key={index}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                <strong>{c.username}</strong> - {new Date(c.timestamp).toLocaleString()}
              </Typography>
              <Typography variant="body1">{c.comment}</Typography>
            </CommentBox>
          ))}
        </Box>
      </Box>
      <Snackbar 
        open={error} 
        autoHideDuration={3000} 
        onClose={handleClose} 
        message="Username is required"
      />
    </CustomContainer>
  );
}
