import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export function getSocket(token: string): Socket {
    if (socket?.connected) return socket;

    socket = io(`${BACKEND_URL}/chat`, {
        auth: { token },
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}
