const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);

// Create a Socket.IO server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Store all active drawing data
let drawingState = {
  paths: [],
  users: {}
};

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Generate a random username with socket id
  const username = `User-${socket.id.substring(0, 5)}`;
  
  // Add user to the users list
  drawingState.users[socket.id] = {
    id: socket.id,
    username,
    color: getRandomColor(),
    cursorPosition: { x: 0, y: 0 }
  };
  
  // Send current state to the new client
  socket.emit('init', drawingState);
  
  // Broadcast new user to all other clients
  socket.broadcast.emit('user-connected', drawingState.users[socket.id]);
  
  // Handle cursor movement
  socket.on('cursor-move', (position) => {
    if (drawingState.users[socket.id]) {
      drawingState.users[socket.id].cursorPosition = position;
      socket.broadcast.emit('cursor-update', {
        userId: socket.id,
        position
      });
    }
  });
  
  // Handle drawing events
  socket.on('draw', (pathData) => {
    // Add user info to the path
    const pathWithUser = {
      ...pathData,
      userId: socket.id,
      username: drawingState.users[socket.id].username,
      userColor: drawingState.users[socket.id].color
    };
    
    // Add to drawing state
    drawingState.paths.push(pathWithUser);
    
    // Broadcast to all clients except sender
    socket.broadcast.emit('draw-update', pathWithUser);
  });
  
  // Handle clearing the canvas
  socket.on('clear-canvas', () => {
    drawingState.paths = [];
    io.emit('canvas-cleared');
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // Remove the user from users list
    if (drawingState.users[socket.id]) {
      delete drawingState.users[socket.id];
    }
    
    // Broadcast user disconnection to all clients
    io.emit('user-disconnected', socket.id);
  });
});

// Function to generate a random color for user
function getRandomColor() {
  const colors = [
    '#3B82F6', // blue
    '#EF4444', // red
    '#10B981', // green
    '#F59E0B', // yellow
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#6366F1', // indigo
    '#F97316', // orange
    '#14B8A6', // teal
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
