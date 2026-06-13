import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useChatSocket(token: string | null) {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!token) return;

        // URL base de la API, asumimos que NEXT_PUBLIC_API_URL esta definida.
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        
        socketRef.current = io(`${apiUrl}/chat`, {
            auth: { token },
            transports: ['websocket'],
        });

        socketRef.current.on('connect', () => setIsConnected(true));
        socketRef.current.on('disconnect', () => setIsConnected(false));

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [token]);

    return { socket: socketRef.current, isConnected };
}
