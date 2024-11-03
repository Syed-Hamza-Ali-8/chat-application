import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { TextField, Button, Box, Typography, Container } from '@mui/material';
import { keyframes } from '@emotion/react';
import { useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../config/firebase-config';
import { getFirestore, setDoc, doc } from 'firebase/firestore';

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// const auth = getAuth();

const SignupForm = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [isMounted, setIsMounted] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const onSubmit = async (data) => {
        const { email, password } = data;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                createdAt: new Date(),
            });

            console.log('User signed up and saved to Firestore:', user);
            navigate('/');
        } catch (error) {
            const errorCode = error.code;
            const errorMessage = error.message;

            if (errorCode === 'auth/email-already-in-use') {
                alert("Email already exists");
                return;
            }

            if (errorCode === 'auth/weak-password') {
                alert("Password should be at least six characters");
                return;
            }
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
                background: 'linear-gradient(270deg, #ff9a9e, #fad0c4, #fad0c4, #fbc2eb, #fbc2eb, #a18cd1)',
                backgroundSize: '400% 400%',
            }}
        >
            <Container
                maxWidth="xs"
                sx={{
                    animation: isMounted ? `${fadeIn} 2s ease` : '',
                }}
            >
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
                    <Typography variant="h5" component="h1" gutterBottom>
                        Create an Account
                    </Typography>

                    <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
                        {/* Email Field */}
                        <TextField
                            margin="normal"
                            fullWidth
                            id="email"
                            label="Email Address"
                            {...register('email', { required: 'Email is required' })}
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            autoFocus
                            sx={{
                                borderRadius: '10px',
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            }}
                        />
                        {/* Password Field */}
                        <TextField
                            margin="normal"
                            fullWidth
                            id="password"
                            label="Password"
                            type="password"
                            {...register('password', { required: 'Password is required' })}
                            error={!!errors.password}
                            helperText={errors.password?.message}
                            sx={{
                                borderRadius: '10px',
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
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
                            Sign Up
                        </Button>
                    </form>
                    {/* Redirect to Login Page */}
                    <Typography
                        variant="body2"
                        sx={{ mt: 2, cursor: 'pointer', color: '#2196F3' }}
                        onClick={() => navigate('/')}
                    >
                        Already have an account? Log In
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default SignupForm;
