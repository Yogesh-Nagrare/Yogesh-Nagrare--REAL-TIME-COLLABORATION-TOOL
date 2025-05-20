import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '@/context/SocketContext';
import { throttle } from 'lodash';
import RemoteCursors from './RemoteCursors';

type Tool = 'pencil' | 'line' | 'rect' | 'circle' | 'eraser';

interface CanvasProps {
  activeTool: Tool;
  activeColor: string;
  brushSize: number;
}

const Canvas: React.FC<CanvasProps> = ({ activeTool, activeColor, brushSize }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { sendCursorPosition, sendDrawingData, drawingPaths } = useSocket();
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);

  // Track mouse position for cursor display
  const throttledCursorUpdate = useRef(
    throttle((position: { x: number; y: number }) => {
      sendCursorPosition(position);
    }, 50)
  ).current;

  // Resize canvas when container size changes
  useEffect(() => {
    const resizeCanvas = () => {
      if (canvasRef.current && containerRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Draw all paths when they change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    drawGrid(ctx, canvas.width, canvas.height);

    // Draw all paths
    drawingPaths.forEach(path => {
      if (path.points.length < 1) return;
      
      ctx.beginPath();
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.strokeStyle = path.type === 'eraser' ? '#f5f5f5' : path.color;
      ctx.lineWidth = path.size;

      if (path.type === 'pencil' || path.type === 'eraser') {
        ctx.moveTo(path.points[0].x, path.points[0].y);
        
        for (let i = 1; i < path.points.length; i++) {
          ctx.lineTo(path.points[i].x, path.points[i].y);
        }
      } else if (path.type === 'line') {
        const start = path.points[0];
        const end = path.points[path.points.length - 1];
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
      } else if (path.type === 'rect') {
        const start = path.points[0];
        const end = path.points[path.points.length - 1];
        const width = end.x - start.x;
        const height = end.y - start.y;
        
        if (path.color !== 'transparent') {
          ctx.fillStyle = path.color;
          ctx.fillRect(start.x, start.y, width, height);
        }
        
        ctx.strokeRect(start.x, start.y, width, height);
      } else if (path.type === 'circle') {
        const start = path.points[0];
        const end = path.points[path.points.length - 1];
        const radius = Math.sqrt(
          Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
        );

        ctx.beginPath();
        ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
        
        if (path.color !== 'transparent') {
          ctx.fillStyle = path.color;
          ctx.fill();
        }
      }
      
      ctx.stroke();
    });

    // Draw current path if drawing
    if (isDrawing && currentPath.length > 0) {
      ctx.beginPath();
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.strokeStyle = activeTool === 'eraser' ? '#f5f5f5' : activeColor;
      ctx.lineWidth = brushSize;

      if (activeTool === 'pencil' || activeTool === 'eraser') {
        ctx.moveTo(currentPath[0].x, currentPath[0].y);
        
        for (let i = 1; i < currentPath.length; i++) {
          ctx.lineTo(currentPath[i].x, currentPath[i].y);
        }
      } else if (activeTool === 'line') {
        const start = currentPath[0];
        const end = currentPath[currentPath.length - 1];
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
      } else if (activeTool === 'rect') {
        const start = currentPath[0];
        const end = currentPath[currentPath.length - 1];
        const width = end.x - start.x;
        const height = end.y - start.y;
        
        if (activeColor !== 'transparent') {
          ctx.fillStyle = activeColor;
          ctx.fillRect(start.x, start.y, width, height);
        }
        
        ctx.strokeRect(start.x, start.y, width, height);
      } else if (activeTool === 'circle') {
        const start = currentPath[0];
        const end = currentPath[currentPath.length - 1];
        const radius = Math.sqrt(
          Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
        );
        
        ctx.beginPath();
        ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
        
        if (activeColor !== 'transparent') {
          ctx.fillStyle = activeColor;
          ctx.fill();
        }
      }
      
      ctx.stroke();
    }
  }, [drawingPaths, currentPath, isDrawing, activeTool, activeColor, brushSize]);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 20;
    
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    
    // Draw vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const getMousePosition = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const position = getMousePosition(event);
    setIsDrawing(true);
    setCurrentPath([position]);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const position = getMousePosition(event);
    
    // Always update cursor position for others to see
    throttledCursorUpdate(position);
    
    if (isDrawing) {
      setCurrentPath(prev => [...prev, position]);
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && currentPath.length > 0) {
      sendDrawingData({
        type: activeTool,
        points: currentPath,
        color: activeColor,
        size: brushSize,
      });
      
      setIsDrawing(false);
      setCurrentPath([]);
    }
  };

  const handleMouseOut = () => {
    if (isDrawing) {
      handleMouseUp();
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full bg-whiteboard-bg overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseOut={handleMouseOut}
      />
      <RemoteCursors />
    </div>
  );
};

export default Canvas;
