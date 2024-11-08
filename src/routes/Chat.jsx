import React, { useState, useEffect, useContext, useRef } from 'react';
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
    Tooltip,
    Typography,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, updateDoc, doc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../config/firebase-config'; // Ensure the import is correct
import { Authcontext } from './AuthContext'; // Assuming you have an Authcontext

const ChatApp = () => {
    const { user } = useContext(Authcontext); // Assuming Authcontext provides logged-in user info
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const messagesCollection = collection(db, 'messages');
    const usersRef = useRef([]);
    const navigate = useNavigate();

    // Fetch users and messages from Firestore in real-time
    useEffect(() => {
        const unsubscribeMessages = onSnapshot(messagesCollection, (snapshot) => {
            const fetchedMessages = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setMessages(fetchedMessages);
        });

        const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
            snapshot.docs.forEach((doc) => {
                usersRef.current = {
                    ...usersRef.current,
                    [doc.id]: doc.data(),
                };
            });
        });

        return () => {
            unsubscribeMessages();
            unsubscribeUsers();
        };
    }, []);

    // Sending a new message
    const handleSendMessage = async () => {
        if (message.trim()) {
            await addDoc(messagesCollection, {
                text: message,
                sender: loginuser.uid,
                timestamp: serverTimestamp(),
                edited: false,
                deleteForMe: [],
            });
            setMessage('');
        }
    };

    // Handle message edit
    const [editable, setEditable] = useState(null);
    const editId = useRef();
    const handleEditable = (index, id) => {
        if (editable?.[index]) {
            editId.current = null;
            setEditable(null);
            setMessage('');
            return;
        }
        editId.current = id;
        setEditable({ [index]: true });
        setMessage(messages[index].text);
    };

    // Edit message
    const editMessage = async () => {
        const docRef = doc(db, 'messages', editId.current);
        await updateDoc(docRef, {
            text: message,
            edited: true,
        });
        editId.current = null;
        setEditable(null);
        setMessage('');
    };

    // Delete message for the current user
    const deleteForMe = async (id) => {
        const docRef = doc(db, 'messages', id);
        await updateDoc(docRef, {
            deleteForMe: arrayUnion(loginuser.uid),
        });
    };

    // Sign out logic
    const handleSignOut = async () => {
        await signOut(auth);
        navigate('/'); // Redirect to login page
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
                            <ListItem key={msg.id}>
                                <ListItemText
                                    primary={
                                        <Paper
                                            sx={{
                                                padding: '8px',
                                                borderRadius: '8px',
                                                backgroundColor: msg.sender === loginuser.uid ? '#0078d4' : '#e0e0e0',
                                                color: msg.sender === loginuser.uid ? '#ffffff' : '#000000',
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
                                            {msg.sender === loginuser.uid && (
                                                <Button onClick={() => handleEditable(index, msg.id)}>
                                                    {editable?.[index] ? 'Cancel' : 'Edit'}
                                                </Button>
                                            )}
                                            {msg.sender !== loginuser.uid && (
                                                <Button onClick={() => deleteForMe(msg.id)}>
                                                    Delete
                                                </Button>
                                            )}
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
                <IconButton color="primary" onClick={editable ? editMessage : handleSendMessage} disabled={!message.trim()}>
                    <SendIcon />
                </IconButton>
            </Box>
        </Box>
    );
};

export default ChatApp;
