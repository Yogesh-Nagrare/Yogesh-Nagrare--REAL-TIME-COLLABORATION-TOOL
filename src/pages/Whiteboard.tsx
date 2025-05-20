import React, { useState } from 'react';
import Canvas from '@/components/whiteboard/Canvas';
import Toolbar from '@/components/whiteboard/Toolbar';
import UsersList from '@/components/whiteboard/UsersList';
import { SocketProvider } from '@/context/SocketContext';
import InstructionsModal from '@/components/whiteboard/InstructionsModal';
import { Button } from '@/components/ui/button';

const Whiteboard: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'pencil' | 'line' | 'rect' | 'circle' | 'eraser'>('pencil');
  const [activeColor, setActiveColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(4);
  const [instructionsOpen, setInstructionsOpen] = useState(true);

  return (
    <SocketProvider>
      <div className="flex h-screen">
        {/* Left sidebar with tools */}
        <div className="w-16 border-r">
          <Toolbar
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            activeColor={activeColor}
            setActiveColor={setActiveColor}
            brushSize={brushSize}
            setBrushSize={setBrushSize}
          />
        </div>

        {/* Main canvas area */}
        <div className="flex-1 relative">
          <Canvas
            activeTool={activeTool}
            activeColor={activeColor}
            brushSize={brushSize}
          />
          
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Button
              variant="outline"
              className="bg-white"
              onClick={() => setInstructionsOpen(true)}
            >
              Instructions
            </Button>
          </div>
        </div>

        {/* Right sidebar with users */}
        <div className="w-64 bg-gray-50 p-4 border-l">
          <UsersList />
        </div>

        {/* Instructions modal */}
        <InstructionsModal
          open={instructionsOpen}
          onOpenChange={setInstructionsOpen}
        />
      </div>
    </SocketProvider>
  );
};

export default Whiteboard;
