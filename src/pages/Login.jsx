import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { TextField, Button, Box, Typography, Container, CircularProgress } from '@mui/material';
import { keyframes } from '@emotion/react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase-config';

const slideIn = keyframes`
  0% { transform: translateX(-100%); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
`;

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const LoginForm = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        const { email, password } = data;
        console.log(email, password);
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log('User logged in:', user);
            navigate('./chats');
        } catch (error) {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage);
            if (errorCode === 'auth/invalid-credential') {
                alert("Invalid email or password");
                return;
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                height: '100vh',
                width: '100vw',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                animation: `${gradientAnimation} 10s ease infinite`,
                background: 'linear-gradient(270deg, #ff9a9e, #fad0c4, #fbc2eb, #a18cd1)',
                backgroundSize: '400% 400%',
            }}
        >
            <Container maxWidth="xs" sx={{ animation: `${fadeIn} 2s ease` }}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: 4,
                        borderRadius: 3,
                        backgroundColor: 'rgba(255, 255, 255, 0.85)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="h3" sx={{ fontSize: '3rem', animation: `${bounce} 2s infinite` }}>
                        🔑
                    </Typography>
                    <Typography variant="h5" gutterBottom sx={{ animation: `${slideIn} 2.5s ease forwards` }}>
                        Welcome to Login Page
                    </Typography>

                    {errorMessage && (
                        <Typography color="error" variant="body2">
                            {errorMessage}
                        </Typography>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
                        <TextField
                            margin="normal"
                            fullWidth
                            id="name"
                            label="Name"
                            {...register('name', { required: 'Name is required' })}
                            error={!!errors.name}
                            helperText={errors.name?.message}
                            sx={{ borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            id="email"
                            label="Email Address"
                            {...register('email', { required: 'Email is required' })}
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            sx={{ borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            id="password"
                            label="Password"
                            type="password"
                            {...register('password', { required: 'Password is required' })}
                            error={!!errors.password}
                            helperText={errors.password?.message}
                            sx={{ borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{
                                mt: 3,
                                mb: 2,
                                background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
                                color: 'white',
                                padding: '10px',
                                borderRadius: '25px',
                                transition: 'transform 0.3s ease',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #21CBF3, #2196F3)',
                                    transform: 'scale(1.05)',
                                },
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : "Log In"}
                        </Button>
                    </form>

                    <Typography variant="body2" sx={{ mt: 2, cursor: 'pointer', color: '#2196F3' }} onClick={() => navigate('/signup')}>
                        Don’t have an account? Sign Up
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default LoginForm;
