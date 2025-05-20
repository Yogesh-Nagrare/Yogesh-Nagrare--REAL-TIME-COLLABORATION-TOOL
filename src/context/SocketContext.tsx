import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

interface User {
  id: string;
  username: string;
  color: string;
  cursorPosition: { x: number; y: number };
}

interface DrawingPath {
  type: 'pencil' | 'line' | 'rect' | 'circle' | 'eraser';
  points: { x: number; y: number }[];
  color: string;
  size: number;
  userId: string;
  username: string;
  userColor: string;
}

interface DrawingState {
  paths: DrawingPath[];
  users: Record<string, User>;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  users: Record<string, User>;
  currentUser: User | null;
  drawingPaths: DrawingPath[];
  sendCursorPosition: (position: { x: number; y: number }) => void;
  sendDrawingData: (pathData: Omit<DrawingPath, 'userId' | 'username' | 'userColor'>) => void;
  clearCanvas: () => void;
  retryConnection: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

// Mock user data for when server is not available
const generateMockUser = () => {
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];
  return {
    id: 'local-user',
    username: 'You (Local Mode)',
    color: colors[Math.floor(Math.random() * colors.length)],
    cursorPosition: { x: 0, y: 0 }
  };
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [drawingPaths, setDrawingPaths] = useState<DrawingPath[]>([]);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  // Initialize the local user immediately so we have a user even before connection attempt
  useEffect(() => {
    // Create a local user right away
    const mockUser = generateMockUser();
    setUsers({ [mockUser.id]: mockUser });
    setCurrentUser(mockUser);
  }, []);

  const setupSocketConnection = useCallback(() => {
    // Disconnect any existing socket first
    if (socket) {
      socket.disconnect();
    }
    
    try {
      // We use a relative URL so it works in both development and production
      const socketIo = io('http://localhost:3001', {
        reconnectionAttempts: 3,
        timeout: 5000,
        transports: ['websocket', 'polling']
      });
      
      setSocket(socketIo);

      socketIo.on('connect', () => {
        console.log('Connected to socket server');
        setIsConnected(true);
        setConnectionAttempts(0); // Reset attempts on successful connection
        toast.success('Connected to whiteboard!');
      });

      socketIo.on('disconnect', () => {
        console.log('Disconnected from socket server');
        setIsConnected(false);
        toast.error('Disconnected from whiteboard');
      });

      socketIo.on('connect_error', (err) => {
        console.error('Connection error:', err.message);
        setConnectionAttempts(prev => prev + 1);
        
        if (connectionAttempts >= 2) {
          // On last attempt, ensure we have a local user for offline mode
          const mockUser = generateMockUser();
          setUsers(prev => {
            // Only add the mock user if there are no users yet
            if (Object.keys(prev).length === 0) {
              return { [mockUser.id]: mockUser };
            }
            return prev;
          });
          
          setCurrentUser(prev => prev || mockUser);
          toast.error('Unable to connect to server - running in local mode');
        } else {
          toast.error(`Connection error: ${err.message}`);
        }
      });

      socketIo.on('init', (state: DrawingState) => {
        setDrawingPaths(state.paths);
        setUsers(state.users);
        setCurrentUser(state.users[socketIo.id]);
      });

      socketIo.on('user-connected', (user: User) => {
        setUsers(prevUsers => ({
          ...prevUsers,
          [user.id]: user
        }));
        toast.info(`${user.username} joined the whiteboard`);
      });

      socketIo.on('user-disconnected', (userId: string) => {
        setUsers(prevUsers => {
          const newUsers = { ...prevUsers };
          if (newUsers[userId]) {
            toast.info(`${newUsers[userId].username} left the whiteboard`);
            delete newUsers[userId];
          }
          return newUsers;
        });
      });

      socketIo.on('cursor-update', ({ userId, position }) => {
        setUsers(prevUsers => {
          if (!prevUsers[userId]) return prevUsers;
          
          return {
            ...prevUsers,
            [userId]: {
              ...prevUsers[userId],
              cursorPosition: position
            }
          };
        });
      });

      socketIo.on('draw-update', (pathData: DrawingPath) => {
        setDrawingPaths(prev => [...prev, pathData]);
      });

      socketIo.on('canvas-cleared', () => {
        setDrawingPaths([]);
        toast.info('Canvas cleared by a user');
      });
      
      return socketIo;
    } catch (err) {
      console.error('Error creating socket connection:', err);
      toast.error('Failed to initialize connection');
      
      // Create a local user for offline mode if we don't have one yet
      if (Object.keys(users).length === 0 || !currentUser) {
        const mockUser = generateMockUser();
        setUsers({ [mockUser.id]: mockUser });
        setCurrentUser(mockUser);
      }
      
      return null;
    }
  }, [connectionAttempts, socket, users, currentUser]);

  // Initialize connection on component mount
  useEffect(() => {
    let socketIo: Socket | null = null;
    
    // Only try to connect if we haven't exceeded max attempts
    if (connectionAttempts < 3) {
      socketIo = setupSocketConnection();
    } else if (Object.keys(users).length === 0 || !currentUser) {
      // If we've exceeded connection attempts and don't have a user yet, create one
      const mockUser = generateMockUser();
      setUsers({ [mockUser.id]: mockUser });
      setCurrentUser(mockUser);
      toast.error('Running in offline mode - changes will not be saved');
    }

    return () => {
      if (socketIo) {
        socketIo.disconnect();
      }
    };
  }, [connectionAttempts, setupSocketConnection, users, currentUser]);

  // Function to retry connection
  const retryConnection = () => {
    toast.info('Attempting to reconnect...');
    setConnectionAttempts(0); // Reset connection attempts
    setupSocketConnection();
  };

  const sendCursorPosition = (position: { x: number; y: number }) => {
    if (socket && isConnected) {
      socket.emit('cursor-move', position);
    }
  };

  const sendDrawingData = (pathData: Omit<DrawingPath, 'userId' | 'username' | 'userColor'>) => {
    // Always update local state for immediate feedback
    const fullPathData = {
      ...pathData,
      userId: currentUser?.id || 'local-user',
      username: currentUser?.username || 'You (Local Mode)',
      userColor: currentUser?.color || '#000000'
    };
    setDrawingPaths(prev => [...prev, fullPathData]);
    
    // Only send to server if connected
    if (socket && isConnected) {
      socket.emit('draw', pathData);
    }
  };

  const clearCanvas = () => {
    setDrawingPaths([]);
    
    if (socket && isConnected) {
      socket.emit('clear-canvas');
    }
  };

  const value = {
    socket,
    isConnected,
    users,
    currentUser,
    drawingPaths,
    sendCursorPosition,
    sendDrawingData,
    clearCanvas,
    retryConnection
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
