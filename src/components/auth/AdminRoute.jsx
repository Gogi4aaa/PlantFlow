import React from 'react';
import { Navigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AdminRoute({ children }) {
    const userStr = localStorage.getItem('plantpulse_user');

    if (!userStr) {
        // Not authenticated, redirect to login
        return <Navigate to={createPageUrl('signin')} replace />;
    }

    try {
        const user = JSON.parse(userStr);

        if (user.role !== 'ADMIN') {
            // Not an admin, redirect to dashboard
            return <Navigate to={createPageUrl('dashboard')} replace />;
        }

        // User is admin, allow access
        return children;
    } catch (error) {
        // Invalid user data, redirect to login
        return <Navigate to={createPageUrl('signin')} replace />;
    }
}
