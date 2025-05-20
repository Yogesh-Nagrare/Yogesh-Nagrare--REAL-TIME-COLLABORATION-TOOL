import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Users, Pencil } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="max-w-3xl w-full text-center">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Collaborative Whiteboard
        </h1>
        
        <p className="text-xl text-gray-600 mb-10 max-w-xl mx-auto">
          A real-time collaborative drawing tool that allows multiple users to connect and create together simultaneously.
        </p>
        
        <div className="bg-white rounded-xl shadow-lg p-8 mb-10">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-100 p-3 rounded-full mb-4">
                <Users size={28} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-Time Collaboration</h3>
              <p className="text-gray-600">
                Connect with others instantly. See their cursors and changes in real-time as you work together.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="bg-purple-100 p-3 rounded-full mb-4">
                <Pencil size={28} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Multiple Drawing Tools</h3>
              <p className="text-gray-600">
                Use pencils, shapes, and more to express your ideas visually on a shared canvas.
              </p>
            </div>
          </div>
          
          <div className="mt-8 flex flex-col items-center">
            <Link to="/whiteboard">
              <Button className="text-lg px-8 py-6 h-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all">
                Start Collaborating Now
              </Button>
            </Link>
            
            <p className="text-sm text-gray-500 mt-4">
              No sign-up required. Just click and start creating!
            </p>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-6 bg-white">
          <h3 className="font-semibold mb-2">How to run locally:</h3>
          <ol className="text-left text-gray-700 space-y-2 ml-6 list-decimal">
            <li>Clone the repository</li>
            <li>Install dependencies with <code className="bg-gray-100 px-1 rounded">npm install</code></li>
            <li>Start the WebSocket server: <code className="bg-gray-100 px-1 rounded">node src/server/server.js</code></li>
            <li>In another terminal, start the React app: <code className="bg-gray-100 px-1 rounded">npm run dev</code></li>
            <li>Open multiple browser windows to see real-time collaboration</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Index;
