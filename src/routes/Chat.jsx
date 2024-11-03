import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Typography,
    Paper,
    AppBar,
    Toolbar,
    Button,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { getFirestore, collection, onSnapshot, addDoc } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const ChatApp = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const db = getFirestore(); // Get Firestore instance
    const messagesCollection = collection(db, 'messages'); // Reference to 'messages' collection
    const auth = getAuth(); // Get Firebase Authentication instance
    const navigate = useNavigate(); // Use useNavigate for navigation

    // Fetch messages from Firestore in real-time
    useEffect(() => {
        const unsubscribe = onSnapshot(messagesCollection, (snapshot) => {
            const fetchedMessages = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setMessages(fetchedMessages); // Update state with fetched messages
        });

        return () => unsubscribe(); // Cleanup subscription on unmount
    }, [db]);

    const handleSendMessage = async () => {
        if (message.trim()) {
            await addDoc(messagesCollection, {
                text: message,
                sender: 'user', // You can modify this logic for different users
                timestamp: new Date().toISOString(),
            });
            setMessage(''); // Clear the input field
        }
    };

    const handleSignOut = async () => {
        await signOut(auth);
        navigate('/');
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#e0f7fa' }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Chat Application
                    </Typography>
                    <Button color="inherit" onClick={handleSignOut}>
                        Sign Out
                    </Button>
                </Toolbar>
            </AppBar>
            <Box sx={{ flexGrow: 1, padding: '16px', overflowY: 'auto' }}>
                <List>
                    {messages.length > 0 ? (
                        messages.map((msg) => (
                            <ListItem
                                key={msg.id}
                                sx={{
                                    justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                }}
                            >
                                <ListItemText
                                    primary={
                                        <Paper
                                            sx={{
                                                padding: '8px',
                                                borderRadius: '16px',
                                                backgroundColor: msg.sender === 'user' ? '#bbdefb' : '#ffffff',
                                                boxShadow: 2,
                                                maxWidth: '80%',
                                            }}
                                        >
                                            {msg.text}
                                        </Paper>
                                    }
                                />
                            </ListItem>
                        ))
                    ) : (
                        <ListItem>
                            <ListItemText primary="No messages yet." />
                        </ListItem>
                    )}
                </List>
            </Box>
            <Box sx={{ padding: '8px', display: 'flex', alignItems: 'center', backgroundColor: '#fff' }}>
                <TextField
                    variant="outlined"
                    fullWidth
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    sx={{
                        borderRadius: '16px',
                        backgroundColor: '#f1f1f1',
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                border: 'none',
                            },
                            '&:hover fieldset': {
                                border: 'none',
                            },
                            '&.Mui-focused fieldset': {
                                border: 'none',
                            },
                        },
                    }}
                />
                <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                >
                    <SendIcon />
                </IconButton>
            </Box>
        </Box>
    );
};

export default ChatApp;
