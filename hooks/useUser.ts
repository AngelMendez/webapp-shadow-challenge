'use client';

import { useState, useEffect } from 'react';

const USER_STORAGE_KEY = 'ai-todo-user-identifier';

export function useUser() {
  const [userIdentifier, setUserIdentifier] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user identifier from localStorage on mount
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      setUserIdentifier(storedUser);
    }
    setIsLoading(false);
  }, []);

  const setUser = (identifier: string) => {
    localStorage.setItem(USER_STORAGE_KEY, identifier);
    setUserIdentifier(identifier);
  };

  const clearUser = () => {
    localStorage.removeItem(USER_STORAGE_KEY);
    setUserIdentifier(null);
  };

  return {
    userIdentifier,
    setUser,
    clearUser,
    isLoading,
  };
}
