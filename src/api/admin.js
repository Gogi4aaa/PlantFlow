import { api as baseApi } from './api';


const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const adminApi = {
    // Statistics
    getStats: async () => {
        const response = await fetch(`${API_BASE}/api/admin/stats`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to fetch stats');
        return response.json();
    },

    // User Management
    getUsers: async (params = {}) => {
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v != null && v !== '')
        );
        const queryParams = new URLSearchParams(cleanParams).toString();
        const response = await fetch(`${API_BASE}/api/admin/users?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        return response.json();
    },

    updateUser: async (id, data) => {
        const response = await fetch(`${API_BASE}/api/admin/users/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update user');
        return response.json();
    },

    deleteUser: async (id) => {
        const response = await fetch(`${API_BASE}/api/admin/users/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to delete user');
        return response.json();
    },

    changeUserRole: async (id, role) => {
        const response = await fetch(`${API_BASE}/api/admin/users/${id}/role`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ role })
        });
        if (!response.ok) throw new Error('Failed to change user role');
        return response.json();
    },

    // Device Management
    getAllDevices: async (params = {}) => {
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v != null && v !== '')
        );
        const queryParams = new URLSearchParams(cleanParams).toString();
        const response = await fetch(`${API_BASE}/api/admin/devices?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to fetch devices');
        return response.json();
    },

    deleteDevice: async (id) => {
        const response = await fetch(`${API_BASE}/api/admin/devices/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to delete device');
        return response.json();
    },

    // Alert Management
    getAllAlerts: async (params = {}) => {
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v != null && v !== '')
        );
        const queryParams = new URLSearchParams(cleanParams).toString();
        const response = await fetch(`${API_BASE}/api/admin/alerts?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to fetch alerts');
        return response.json();
    },

    resolveAlert: async (id) => {
        const response = await fetch(`${API_BASE}/api/admin/alerts/${id}/resolve`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to resolve alert');
        return response.json();
    },

    getAdminAnalytics: async (period = 'week') => {
        const response = await fetch(`${API_BASE}/api/admin/analytics?period=${period}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to fetch admin analytics');
        return response.json();
    },

    deleteAlert: async (id) => {
        const response = await fetch(`${API_BASE}/api/admin/alerts/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to delete alert');
        return response.json();
    }
};
