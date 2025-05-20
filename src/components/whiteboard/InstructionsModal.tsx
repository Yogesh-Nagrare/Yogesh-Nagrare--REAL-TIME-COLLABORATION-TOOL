import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface InstructionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InstructionsModal: React.FC<InstructionsModalProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to the Collaborative Whiteboard!</DialogTitle>
          <DialogDescription>
            Here's how to use this real-time collaborative tool:
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div>
            <h3 className="font-medium mb-1">Getting Started</h3>
            <p className="text-sm text-gray-600">
              This whiteboard automatically connects you to a shared space where multiple users can draw together in real-time.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-1">Drawing Tools</h3>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li><strong>Pencil:</strong> Free-hand drawing</li>
              <li><strong>Line:</strong> Draw straight lines</li>
              <li><strong>Rectangle:</strong> Create rectangles</li>
              <li><strong>Circle:</strong> Draw circles</li>
              <li><strong>Eraser:</strong> Erase parts of your drawing</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-1">Collaboration Features</h3>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li>See other users' cursors in real-time</li>
              <li>See who's currently connected</li>
              <li>All changes sync instantly across all users</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-1">Running Locally</h3>
            <p className="text-sm text-gray-600">
              To run this project locally:
            </p>
            <ol className="list-decimal pl-5 text-sm text-gray-600 space-y-1">
              <li>Start the WebSocket server: <code>node src/server/server.js</code></li>
              <li>In another terminal, start the React app: <code>npm run dev</code></li>
              <li>Open multiple browser tabs to see the collaboration in action</li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InstructionsModal;
