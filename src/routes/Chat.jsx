import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Paper,
    AppBar,
    Toolbar,
    Button,
    Typography,
    Divider,
    Switch,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { db } from '../config/firebase-config'; // Adjust the path as per your project structure
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

const ChatApp = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null); // Keep track of selected user
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const navigate = useNavigate();
    const auth = getAuth();

    // Fetch users from Firestore
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'users'), (querySnapshot) => {
            const usersArray = [];
            querySnapshot.forEach((doc) => {
                usersArray.push(doc.data());
            });
            setUsers(usersArray);
        });

        return () => unsubscribe();
    }, []);

    // Fetch the logged-in user after page refresh
    useEffect(() => {
        if (auth.currentUser) {
            const fetchUser = async () => {
                const userRef = doc(db, 'users', auth.currentUser.uid); // Use UID from Firebase auth
                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                    setSelectedUser(userDoc.data()); // Set the selected user from Firestore
                }
            };
            fetchUser();
        }
    }, [auth.currentUser]);

    // Fetch messages from Firestore for the selected user
    useEffect(() => {
        if (selectedUser) {
            const q = query(
                collection(db, 'messages'),
                orderBy('timestamp')
            );

            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const messagesArray = [];
                querySnapshot.forEach((doc) => {
                    if (doc.data().sender === selectedUser.email || doc.data().receiver === selectedUser.email) {
                        messagesArray.push({ ...doc.data(), id: doc.id });
                    }
                });
                setMessages(messagesArray); // Keep the order intact
            });

            return () => unsubscribe();
        }
    }, [selectedUser]);

    // Handle sending a message
    const handleSendMessage = async () => {
        if (message.trim() && selectedUser) {
            try {
                // Add message to Firestore
                await addDoc(collection(db, 'messages'), {
                    text: message,
                    sender: auth.currentUser.email, // Replace with actual user email
                    receiver: selectedUser.email,
                    timestamp: new Date().toISOString(),
                });
                setMessage('');
            } catch (error) {
                console.error('Error sending message: ', error);
            }
        }
    };

    // Handle editing a message
    const handleEditMessage = async () => {
        if (message.trim() && editingMessageId) {
            try {
                const messageDoc = doc(db, 'messages', editingMessageId);
                const messageSnapshot = await getDoc(messageDoc);
                const originalTimestamp = messageSnapshot.data().timestamp; // Retain the original timestamp

                await updateDoc(messageDoc, {
                    text: message + " [edited]", // Append "[edited]" to the message text
                    timestamp: originalTimestamp, // Retain the original timestamp
                });

                // Update the local messages state without changing the order
                setMessages(prevMessages =>
                    prevMessages.map(msg =>
                        msg.id === editingMessageId ? { ...msg, text: message + " [edited]" } : msg
                    )
                );

                setMessage('');
                setEditingMessageId(null); // Reset the editing state
            } catch (error) {
                console.error('Error updating message: ', error);
            }
        }
    };

    // Handle deleting a message
    const handleDeleteMessage = async (id) => {
        try {
            const messageDoc = doc(db, 'messages', id);
            await deleteDoc(messageDoc);
        } catch (error) {
            console.error('Error deleting message: ', error);
        }
    };

    // Handle sign out
    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate('/'); // Redirect to login page
        } catch (error) {
            console.error('Sign-out error', error);
        }
    };

    // Handle Enter key press to send message
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && message.trim()) {
            e.preventDefault(); // Prevents form submission on Enter key press
            if (editingMessageId) {
                handleEditMessage(); // Edit message if editing
            } else {
                handleSendMessage(); // Otherwise send new message
            }
        }
    };

    // Toggle dark mode
    const handleThemeChange = (event) => {
        setIsDarkMode(event.target.checked);
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh', backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' }}>
            {/* Left Side - User List */}
            <Box sx={{ width: '250px', backgroundColor: isDarkMode ? '#1c1c1c' : '#0078d4', color: '#fff', padding: '16px' }}>
                <Typography variant="h6">Users</Typography>
                <List>
                    {users.map((user) => (
                        <ListItem
                            button
                            key={user.email}
                            onClick={() => setSelectedUser(user)} // Set selected user
                            sx={{ backgroundColor: selectedUser?.email === user.email ? '#444' : 'transparent', marginBottom: '8px' }}
                        >
                            <ListItemText primary={user.email} />
                        </ListItem>
                    ))}
                </List>
            </Box>

            {/* Right Side - Chat Messages */}
            <Box sx={{ flexGrow: 1, padding: '16px', display: 'flex', flexDirection: 'column' }}>
                <AppBar position="static" sx={{ backgroundColor: isDarkMode ? '#1c1c1c' : '#0078d4' }}>
                    <Toolbar>
                        <Button color="inherit" onClick={handleSignOut}>
                            Sign Out
                        </Button>
                        <Box sx={{ flexGrow: 1 }} />
                        <Typography variant="body2" color="inherit">Dark Mode</Typography>
                        <Switch checked={isDarkMode} onChange={handleThemeChange} color="default" />
                    </Toolbar>
                </AppBar>

                <Box sx={{ flexGrow: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <List sx={{ flexGrow: 1 }}>
                        {messages.length > 0 ? (
                            messages.map((msg) => (
                                <ListItem key={msg.id} sx={{ display: 'flex', justifyContent: msg.sender === auth.currentUser.email ? 'flex-end' : 'flex-start' }}>
                                    <Box
                                        sx={{
                                            maxWidth: '60%',
                                            background: msg.sender === auth.currentUser.email
                                                ? 'linear-gradient(45deg, #0078d4, #00bcd4)' // Gradient for user messages
                                                : 'linear-gradient(45deg, #eeeeee, #ffffff)', // Lighter gradient for others
                                            color: msg.sender === auth.currentUser.email ? '#fff' : '#333',
                                            borderRadius: '20px',
                                            padding: '12px 20px',
                                            position: 'relative',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '8px',
                                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                            '&:hover': {
                                                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)', // Hover effect for messages
                                            },
                                        }}
                                    >
                                        <Typography variant="body1">{msg.text}</Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="caption">{new Date(msg.timestamp).toLocaleTimeString()}</Typography>
                                            {msg.sender === auth.currentUser.email && (
                                                <Box sx={{ display: 'flex', gap: '8px' }}>
                                                    <IconButton
                                                        size="small"
                                                        sx={{ color: '#fff' }}
                                                        onClick={() => {
                                                            setEditingMessageId(msg.id);
                                                            setMessage(msg.text.replace(" [edited]", "")); // Remove the "[edited]" tag when editing
                                                        }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        sx={{ color: '#fff' }}
                                                        onClick={() => handleDeleteMessage(msg.id)}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                </ListItem>
                            ))
                        ) : (
                            <Typography variant="body2" color="textSecondary">No messages yet.</Typography>
                        )}
                    </List>
                    <Box sx={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <TextField
                            fullWidth
                            label="Type a message"
                            variant="outlined"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={!selectedUser}
                        />
                        <IconButton onClick={editingMessageId ? handleEditMessage : handleSendMessage} disabled={!message.trim()}>
                            <SendIcon />
                        </IconButton>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default ChatApp;
