import React from 'react';

export const Spinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-4 h-4 rounded-full bg-brand-primary animate-pulse" style={{ animationDelay: '0s' }}></div>
      <div className="w-4 h-4 rounded-full bg-brand-primary animate-pulse" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-4 h-4 rounded-full bg-brand-primary animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.9);
          }
        }
        .animate-pulse {
          animation: pulse 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};