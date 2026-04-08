import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

// ── Singleton socket ──────────────────────────────────────────────────────────
// One shared socket instance for the entire app lifetime.
// This avoids the race condition where socketRef.current is null
// when a component's useEffect runs before the socket connects.
let _socket = null;

function getSocket() {
    if (!_socket || _socket.disconnected) {
        _socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
        });

        _socket.on('connect', () => {
            console.log('[Socket] Connected:', _socket.id);
        });

        _socket.on('disconnect', (reason) => {
            console.log('[Socket] Disconnected:', reason);
        });

        _socket.on('connect_error', (err) => {
            console.warn('[Socket] Connection error:', err.message);
        });
    }
    return _socket;
}

/**
 * Returns a stable ref to the singleton socket.
 * The socket is guaranteed to be non-null when the ref is read.
 */
export function useSocket() {
    const socketRef = useRef(null);

    // Assign synchronously so it's available immediately
    if (!socketRef.current) {
        socketRef.current = getSocket();
    }

    return socketRef;
}
