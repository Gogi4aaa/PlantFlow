const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://plantflow-backend-1026018297722.europe-west3.run.app';

/**
 * Helper to handle fetch requests
 */
async function request(endpoint, options = {}) {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || data.error || 'API request failed');
    }

    return data;
}

export const api = {
    // Auth endpoints
    auth: {
        login: (credentials) => request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        }),
        register: (data) => request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        me: () => request('/api/auth/me'),
        updateProfile: (data) => request('/api/auth/me', {
            method: 'PUT',
            body: JSON.stringify(data)
        })
    },

    // Device endpoints
    devices: {
        list: () => request('/api/devices'),
        get: (id) => request(`/api/devices/${id}`),
        create: (data) => request('/api/devices', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        update: (id, data) => request(`/api/devices/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
        delete: (id) => request(`/api/devices/${id}`, {
            method: 'DELETE',
        }),
        togglePump: (id, state) => request(`/api/devices/${id}/pump`, {
            method: 'POST',
            body: JSON.stringify({ state })
        }),
    },

    // Sensor endpoints
    sensors: {
        getLatest: (deviceId) => request(`/api/sensors/${deviceId}/latest`),
        getReadings: (deviceId, params = {}) => {
            const queryString = new URLSearchParams(params).toString();
            return request(`/api/sensors/${deviceId}/readings?${queryString}`);
        },
        getStats: (deviceId, hours = 24) =>
            request(`/api/sensors/${deviceId}/stats?hours=${hours}`),
        getChartData: (deviceId, hours = 24, interval = 60) =>
            request(`/api/sensors/${deviceId}/chart?hours=${hours}&interval=${interval}`),
    },

    // Alert endpoints
    alerts: {
        getByDevice: (deviceId, limit = 10) => request(`/api/alerts/${deviceId}?limit=${limit}`),
    },
};
