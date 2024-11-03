// ProtectedRoute.jsx
import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { useAuth } from '../routes/AuthContext'; // Adjust the path according to your file structure

const ProtectedRoute = ({ element, ...rest }) => {
    const { user } = useAuth(); // Get the user state from the AuthContext

    return (
        <Route
            {...rest}
            element={user ? element : <Navigate to="/" replace />} // Redirect to login if not authenticated
        />
    );
};

export default ProtectedRoute;
