import React, { createContext, useContext, useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';

interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

interface TelegramContextType {
  user: TelegramUser | null;
  webApp: typeof WebApp;
  isLoading: boolean;
}

const TelegramContext = createContext<TelegramContextType | undefined>(undefined);

export const TelegramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize Telegram WebApp
    WebApp.ready();
    WebApp.expand();

    // Set theme colors to match Apple style
    WebApp.setHeaderColor('#ffffff');
    WebApp.setBackgroundColor('#ffffff');

    // Get user data from Telegram
    const initDataUnsafe = WebApp.initDataUnsafe;

    if (initDataUnsafe.user) {
      setUser({
        id: initDataUnsafe.user.id,
        first_name: initDataUnsafe.user.first_name,
        last_name: initDataUnsafe.user.last_name,
        username: initDataUnsafe.user.username,
        photo_url: initDataUnsafe.user.photo_url,
      });

      // Send user data to backend
      fetch(`${import.meta.env.VITE_API_URL}/api/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: initDataUnsafe.user.id,
          first_name: initDataUnsafe.user.first_name,
          username: initDataUnsafe.user.username,
        }),
      }).catch((error) => {
        console.error('Failed to sync user with backend:', error);
      });
    } else {
      // For development/testing outside Telegram
      const devUser = {
        id: 123456789,
        first_name: 'Dev',
        username: 'devuser',
      };
      setUser(devUser);

      // Sync dev user with backend
      fetch(`${import.meta.env.VITE_API_URL}/api/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(devUser),
      }).catch((error) => {
        console.error('Failed to sync dev user with backend:', error);
      });
    }

    setIsLoading(false);
  }, []);

  return (
    <TelegramContext.Provider value={{ user, webApp: WebApp, isLoading }}>
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegram = () => {
  const context = useContext(TelegramContext);
  if (context === undefined) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
};
