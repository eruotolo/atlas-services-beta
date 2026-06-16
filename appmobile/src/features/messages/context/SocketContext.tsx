import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { io, type Socket } from 'socket.io-client';
import { getClientToken } from '@/shared/lib/apiClient';
import { useAuth } from '@/features/auth/context/AuthContext';

const SOCKET_URL =
    Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';

interface SocketContextValue {
    readonly socket: Socket | null;
    readonly isConnected: boolean;
    connect: () => void;
    disconnect: () => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
    // useState instead of useRef so consumers re-render when the socket is created
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setConnected] = useState(false);
    const { isAuthenticated } = useAuth();

    // Named handlers so they can be removed with .off() — avoids anonymous-listener leaks
    const handleConnect = useCallback((): void => { setConnected(true); }, []);
    const handleDisconnect = useCallback((): void => { setConnected(false); }, []);

    // Keep stable refs to the handlers so disconnect() can always find them
    const handleConnectRef = useRef(handleConnect);
    const handleDisconnectRef = useRef(handleDisconnect);
    useEffect(() => { handleConnectRef.current = handleConnect; }, [handleConnect]);
    useEffect(() => { handleDisconnectRef.current = handleDisconnect; }, [handleDisconnect]);

    const disconnect = useCallback((): void => {
        setSocket((prev) => {
            if (prev) {
                prev.off('connect', handleConnectRef.current);
                prev.off('disconnect', handleDisconnectRef.current);
                prev.disconnect();
            }
            return null;
        });
        setConnected(false);
    }, []);

    const connect = useCallback((): void => {
        const token = getClientToken();
        if (!token) return;

        // Disconnect any existing socket before creating a new one
        setSocket((prev) => {
            if (prev?.connected) return prev; // already connected — nothing to do
            if (prev) {
                prev.off('connect', handleConnectRef.current);
                prev.off('disconnect', handleDisconnectRef.current);
                prev.disconnect();
            }

            const next = io(`${SOCKET_URL}/chat`, {
                auth: { token },
                transports: ['websocket'],
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: 5,
            });

            next.on('connect', handleConnectRef.current);
            next.on('disconnect', handleDisconnectRef.current);

            return next;
        });
    }, []);

    // Auto-connect/disconnect based on auth state
    useEffect(() => {
        if (isAuthenticated) {
            connect();
        } else {
            disconnect();
        }
    }, [isAuthenticated, connect, disconnect]);

    // Cleanup on unmount
    useEffect(() => () => { disconnect(); }, [disconnect]);

    return (
        <SocketContext.Provider value={{ socket, isConnected, connect, disconnect }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket(): SocketContextValue {
    const ctx = useContext(SocketContext);
    if (ctx === null) throw new Error('useSocket must be inside <SocketProvider>');
    return ctx;
}
