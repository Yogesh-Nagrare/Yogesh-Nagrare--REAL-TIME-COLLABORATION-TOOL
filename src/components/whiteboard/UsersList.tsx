
import React from 'react';
import { useSocket } from '@/context/SocketContext';
import { Users, Wifi, WifiOff } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const UsersList: React.FC = () => {
  const { users, currentUser, isConnected, retryConnection } = useSocket();
  
  // Get the list of users as an array
  const usersList = Object.values(users);

  return (
    <div className="bg-white shadow-md rounded-lg p-4 w-full">
      <div className="flex items-center gap-2 mb-3">
        <Users size={18} className="text-gray-500" />
        <h3 className="font-medium">Connected Users</h3>
        {isConnected ? (
          <Wifi size={16} className="ml-auto text-green-500" />
        ) : (
          <WifiOff size={16} className="ml-auto text-red-500" />
        )}
      </div>
      
      <Separator className="my-2" />
      
      {!isConnected && (
        <Alert variant="destructive" className="mb-3 py-3">
          <AlertTitle className="text-sm font-semibold">Offline Mode</AlertTitle>
          <AlertDescription className="text-xs mt-1">
            <p className="mb-2">You're currently working in offline mode. Your changes won't be shared with others.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-1 w-full text-xs h-8"
              onClick={retryConnection}
            >
              Retry Connection
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {usersList.length > 0 ? (
          usersList.map(user => (
            <div 
              key={user.id} 
              className="flex items-center gap-2"
            >
              <div 
                className="w-3 h-3 rounded-full animate-pulse-opacity" 
                style={{ backgroundColor: user.color }}
              />
              <span className="text-sm">
                {user.username} {user.id === currentUser?.id ? '(you)' : ''}
              </span>
            </div>
          ))
        ) : (
          <div className="text-sm text-gray-500 italic">No users connected</div>
        )}
      </div>
    </div>
  );
};

export default UsersList;
