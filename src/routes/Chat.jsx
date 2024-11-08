import React, { useState } from 'react';
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
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

const ChatApp = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const navigate = useNavigate();
    const auth = getAuth();

    const handleSendMessage = () => {
        if (message.trim()) {
            setMessages([...messages, { text: message, sender: 'User', timestamp: new Date().toISOString() }]);
            setMessage('');
        }
    };

    const [editable, setEditable] = useState(null);
    const editId = React.useRef();
    const handleEditable = (index) => {
        if (editable === index) {
            setEditable(null);
            setMessage('');
        } else {
            setEditable(index);
            setMessage(messages[index].text);
        }
    };

    const editMessage = () => {
        const updatedMessages = [...messages];
        updatedMessages[editable] = { ...updatedMessages[editable], text: message, edited: true };
        setMessages(updatedMessages);
        setEditable(null);
        setMessage('');
    };

    const deleteMessage = (index) => {
        const updatedMessages = messages.filter((_, idx) => idx !== index);
        setMessages(updatedMessages);
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error('Sign-out error', error);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f0f2f5' }}>
            <AppBar position="static">
                <Toolbar>
                    <Button color="inherit" onClick={handleSignOut}>
                        Sign Out
                    </Button>
                </Toolbar>
            </AppBar>

            <Box sx={{ flexGrow: 1, padding: '16px', overflowY: 'auto' }}>
                <List>
                    {messages.length > 0 ? (
                        messages.map((msg, index) => (
                            <ListItem key={index}>
                                <ListItemText
                                    primary={
                                        <Paper
                                            sx={{
                                                padding: '8px',
                                                borderRadius: '8px',
                                                backgroundColor: '#0078d4',
                                                color: '#ffffff',
                                                position: 'relative',
                                            }}
                                        >
                                            <Typography variant="body1" component="span">
                                                {msg.edited && (
                                                    <span
                                                        style={{
                                                            position: 'absolute',
                                                            height: '8px',
                                                            width: '8px',
                                                            borderRadius: '50%',
                                                            top: '0px',
                                                            left: '22px',
                                                            background: 'red',
                                                        }}
                                                    ></span>
                                                )}
                                                {msg.text}
                                            </Typography>
                                            <Button onClick={() => handleEditable(index)} sx={{ marginLeft: '8px', color: '#ffffff' }}>
                                                {editable === index ? 'Cancel' : 'Edit'}
                                            </Button>
                                            <Button onClick={() => deleteMessage(index)} sx={{ marginLeft: '8px', color: '#ffffff' }}>
                                                Delete
                                            </Button>
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
                />
                <IconButton color="primary" onClick={editable !== null ? editMessage : handleSendMessage} disabled={!message.trim()}>
                    <SendIcon />
                </IconButton>
            </Box>
        </Box>
    );
};

export default ChatApp;
