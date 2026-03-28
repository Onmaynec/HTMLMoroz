import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const { isAuthenticated, user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Initialize socket connection
  useEffect(() => {
    if (!isAuthenticated) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    // Create socket connection
    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    // Notification events
    socket.on('notification', (data) => {
      setUnreadNotifications(prev => prev + 1);
      
      if (data.notification) {
        toast.info(data.notification.title, {
          description: data.notification.message,
          action: data.notification.actionLink ? {
            label: data.notification.actionText || 'Открыть',
            onClick: () => window.location.href = data.notification.actionLink
          } : undefined
        });
      }
    });

    // New message event
    socket.on('new_message', (data) => {
      setUnreadMessages(prev => prev + 1);
      
      if (data.message && document.hidden) {
        toast.message('Новое сообщение', {
          description: `${data.message.sender?.username}: ${data.message.content.substring(0, 50)}...`
        });
      }
    });

    // Application status change
    socket.on('application_status_changed', (data) => {
      const statusMessages = {
        approved: 'Ваша заявка одобрена!',
        rejected: 'Ваша заявка отклонена',
        under_review: 'Ваша заявка на рассмотрении'
      };

      toast.info(statusMessages[data.newStatus] || 'Статус заявки изменен', {
        description: `Обновлено: ${data.updatedBy}`
      });
    });

    // Announcement
    socket.on('announcement', (data) => {
      toast.info(data.title, {
        description: data.message,
        duration: 10000
      });
    });

    // Cleanup
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated]);

  // Join application chat room
  const joinApplication = useCallback((applicationId) => {
    if (socketRef.current) {
      socketRef.current.emit('join_application', applicationId);
    }
  }, []);

  // Leave application chat room
  const leaveApplication = useCallback((applicationId) => {
    if (socketRef.current) {
      socketRef.current.emit('leave_application', applicationId);
    }
  }, []);

  // Send typing indicator
  const sendTyping = useCallback((applicationId, isTyping) => {
    if (socketRef.current) {
      socketRef.current.emit('typing', { applicationId, isTyping });
    }
  }, []);

  // Mark messages as read
  const markMessagesRead = useCallback((applicationId) => {
    setUnreadMessages(prev => Math.max(0, prev - 1));
    if (socketRef.current) {
      socketRef.current.emit('message_read', { applicationId });
    }
  }, []);

  // Reset notification count
  const resetNotificationCount = useCallback(() => {
    setUnreadNotifications(0);
  }, []);

  // Reset message count
  const resetMessageCount = useCallback(() => {
    setUnreadMessages(0);
  }, []);

  const value = {
    socket: socketRef.current,
    isConnected,
    unreadMessages,
    unreadNotifications,
    joinApplication,
    leaveApplication,
    sendTyping,
    markMessagesRead,
    resetNotificationCount,
    resetMessageCount
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;
