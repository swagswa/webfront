import React from 'react';
import { useTelegram } from '../contexts/TelegramContext';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { user, isLoading } = useTelegram();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-apple-gray-200 border-t-apple-blue-500 rounded-full animate-spin"></div>
          <p className="text-apple-gray-400 font-light">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="text-center animate-scale-in">
          <h1 className="text-3xl font-light text-gray-900 mb-4">
            ✋ Welcome
          </h1>
          <p className="text-apple-gray-400">
            Please open this app from Telegram
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
