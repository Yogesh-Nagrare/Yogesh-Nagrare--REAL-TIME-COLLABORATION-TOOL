
import React from 'react';
import { useSocket } from '@/context/SocketContext';

const RemoteCursors: React.FC = () => {
  const { users, currentUser } = useSocket();

  return (
    <>
      {Object.values(users).map((user) => {
        // Don't render the current user's cursor
        if (user.id === currentUser?.id) {
          return null;
        }

        return (
          <div
            key={user.id}
            className="absolute pointer-events-none"
            style={{
              left: user.cursorPosition.x,
              top: user.cursorPosition.y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Cursor */}
            <div
              className="relative"
              style={{
                color: user.color,
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
              </svg>
              <div
                className="absolute px-2 py-1 text-xs font-medium text-white rounded whitespace-nowrap"
                style={{
                  backgroundColor: user.color,
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
              >
                {user.username}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default RemoteCursors;
