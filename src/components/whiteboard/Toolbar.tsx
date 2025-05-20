
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Pencil, Square, Circle, Trash2, Minus } from 'lucide-react';
import { useSocket } from '@/context/SocketContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ToolbarProps {
  activeTool: string;
  setActiveTool: (tool: 'pencil' | 'line' | 'rect' | 'circle' | 'eraser') => void;
  activeColor: string;
  setActiveColor: (color: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
}

const colors = [
  '#000000',
  '#ffffff',
  '#ff0000',
  '#00ff00',
  '#0000ff',
  '#ffff00',
  '#ff00ff',
  '#00ffff',
];

const sizes = [2, 4, 6, 8, 12];

const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  setActiveTool,
  activeColor,
  setActiveColor,
  brushSize,
  setBrushSize,
}) => {
  const { clearCanvas, isConnected, users } = useSocket();

  return (
    <div className="flex flex-col items-center gap-4 p-2 bg-white rounded-lg shadow-md">
      <div className="flex flex-col gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === 'pencil' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setActiveTool('pencil')}
                className="h-10 w-10"
              >
                <Pencil size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Pencil</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === 'line' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setActiveTool('line')}
                className="h-10 w-10"
              >
                <Minus size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Line</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === 'rect' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setActiveTool('rect')}
                className="h-10 w-10"
              >
                <Square size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Rectangle</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === 'circle' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setActiveTool('circle')}
                className="h-10 w-10"
              >
                <Circle size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Circle</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === 'eraser' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setActiveTool('eraser')}
                className="h-10 w-10"
              >
                <Pencil size={18} className="rotate-12" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Eraser</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Separator className="my-2" />

      <div className="flex flex-col gap-2">
        {colors.map((color) => (
          <div
            key={color}
            className={`w-6 h-6 rounded-full cursor-pointer border ${
              activeColor === color ? 'border-black scale-110' : 'border-gray-300'
            }`}
            style={{ backgroundColor: color }}
            onClick={() => setActiveColor(color)}
          />
        ))}
      </div>

      <Separator className="my-2" />

      <div className="flex flex-col gap-2">
        {sizes.map((size) => (
          <div
            key={size}
            className={`flex items-center justify-center w-8 h-8 cursor-pointer ${
              brushSize === size ? 'bg-gray-200' : ''
            }`}
            onClick={() => setBrushSize(size)}
          >
            <div
              className="bg-black rounded-full"
              style={{
                width: size,
                height: size,
              }}
            />
          </div>
        ))}
      </div>

      <Separator className="my-2" />

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              onClick={clearCanvas}
              className="h-10 w-10"
            >
              <Trash2 size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Clear Canvas</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="mt-2 bg-green-50 border border-green-100 rounded-md p-2">
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse-opacity`}></div>
          <span className="text-xs text-gray-600">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {Object.keys(users).length} user{Object.keys(users).length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
