/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { socketApiUrl } from '../utils/axiosProvider';
import { localStorageGetItem } from '../utils/GlobalFunction';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isRefresh, setIsRefresh] = useState(false);

  const userId = localStorageGetItem("userId");

  useEffect(() => {

    if (userId) {
      const newSocket = io(socketApiUrl, {
        auth: {
          userId: userId
        },
        transports: ['websocket']
      });
      newSocket.on('connected', () => {
        setIsConnected(true);
        console.log("🟢 socket connected")
      });
      
      newSocket.on('disconnected', () => {
        setIsConnected(false);
        console.log("🔴 socket disconnected")
      });

      newSocket.on('connect_error', () => {
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [userId,isRefresh]);

  return (
    <SocketContext.Provider value={{ socket, isConnected , setIsRefresh }}>
      {children}
    </SocketContext.Provider>
  );
};