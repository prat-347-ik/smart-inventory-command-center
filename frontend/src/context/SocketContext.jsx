import { createContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { io } from 'socket.io-client';
import useAuth from '../hooks/useAuth';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    // Only connect if user is authenticated
    if (!isAuthenticated || !token) {
        if (socket) {
            socket.disconnect();
            setSocket(null);
        }
        return;
    }

    // Initialize Socket Connection to Service A (Node.js)
    const socketInstance = io(import.meta.env.VITE_NODE_API || 'http://localhost:4000', {
      auth: {
        token: token // Send token for handshake auth (if backend requires it)
      },
      transports: ['websocket'] // Force WebSocket to avoid polling delays
    });

    socketInstance.on('connect', () => {
      console.log('🟢 Connected to Real-time Inventory Stream');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('🔴 Disconnected from Stream');
      setIsConnected(false);
    });

    setSocket(socketInstance);

    // Cleanup on unmount or logout
    return () => {
      socketInstance.disconnect();
    };
  }, [isAuthenticated, token]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};