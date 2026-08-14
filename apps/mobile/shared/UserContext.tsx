import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { UserDetailedDto, UserLoginDto } from '@mediavault/contracts';
import { AuthService } from '../services/authService';

type UserContextType = {
  currentUser: UserDetailedDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: UserLoginDto) => Promise<UserDetailedDto>;
  logout: () => Promise<void>;
  refreshCurrentUser: () => Promise<UserDetailedDto | null>;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserDetailedDto | null>>;
};

type UserProviderProps = {
  children: React.ReactNode;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: UserProviderProps) {
  const [currentUser, setCurrentUser] = useState<UserDetailedDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authService] = useState(() => new AuthService());

  const refreshCurrentUser = async () => {
    try {
      const user = await authService.getCurrentUserAsync();
      setCurrentUser(user);
      return user;
    } catch {
      setCurrentUser(null);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadCurrentUser = async () => {
      try {
        const user = await authService.getCurrentUserAsync();

        if (isMounted) {
          setCurrentUser(user);
        }
      } catch {
        if (isMounted) {
          setCurrentUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [authService]);

  const login = async (credentials: UserLoginDto) => {
    const user = await authService.loginAsync(credentials);
    setCurrentUser(user);
    return user;
  };

  const logout = async () => {
    await authService.logoutAsync();
    setCurrentUser(null);
  };

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: currentUser !== null,
      isLoading,
      login,
      logout,
      refreshCurrentUser,
      setCurrentUser,
    }),
    [currentUser, isLoading]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUser must be used inside UserProvider');
  }

  return context;
}
