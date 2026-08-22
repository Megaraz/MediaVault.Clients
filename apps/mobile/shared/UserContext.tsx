import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { UserDetailedDto, UserLoginDto } from '@mediavault/contracts';
import { AuthService } from '../services/authService';
import { saveToken } from './tokenStore';
import {
  beginSessionTransition,
  clearSession,
  isCurrentSessionTransition,
  subscribeToSessionInvalidation,
} from './sessionLifecycle';

export type AuthenticationStatus = 'restoring' | 'authenticated' | 'unauthenticated';

type UserContextType = {
  currentUser: UserDetailedDto | null;
  authenticationStatus: AuthenticationStatus;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: UserLoginDto) => Promise<UserDetailedDto>;
  logout: () => Promise<void>;
  refreshCurrentUser: () => Promise<UserDetailedDto | null>;
};

type UserProviderProps = {
  children: React.ReactNode;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: UserProviderProps) {
  const [currentUser, setCurrentUser] = useState<UserDetailedDto | null>(null);
  const [authenticationStatus, setAuthenticationStatus] =
    useState<AuthenticationStatus>('restoring');
  const [authService] = useState(() => new AuthService());

  const refreshCurrentUser = useCallback(async () => {
    const transition = beginSessionTransition();
    try {
      const user = await authService.getCurrentUserAsync();
      if (isCurrentSessionTransition(transition)) {
        setCurrentUser(user);
        setAuthenticationStatus('authenticated');
        return user;
      }
      return null;
    } catch {
      if (isCurrentSessionTransition(transition)) {
        await clearSession();
      }
      return null;
    }
  }, [authService]);

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = subscribeToSessionInvalidation(() => {
      if (isMounted) {
        setCurrentUser(null);
        setAuthenticationStatus('unauthenticated');
      }
    });

    const loadCurrentUser = async () => {
      const transition = beginSessionTransition();
      try {
        const user = await authService.getCurrentUserAsync();

        if (isMounted && isCurrentSessionTransition(transition)) {
          setCurrentUser(user);
          setAuthenticationStatus('authenticated');
        }
      } catch {
        if (isMounted && isCurrentSessionTransition(transition)) {
          await clearSession();
        }
      }
    };

    void loadCurrentUser();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [authService]);

  const login = useCallback(async (credentials: UserLoginDto) => {
    const transition = beginSessionTransition();
    const session = await authService.loginAsync(credentials);
    if (!isCurrentSessionTransition(transition)) {
      throw new Error('The session changed while login was completing. Please try again.');
    }
    await saveToken(session.token);
    if (!isCurrentSessionTransition(transition)) {
      await clearSession();
      throw new Error('The session changed while login was completing. Please try again.');
    }
    setCurrentUser(session.user);
    setAuthenticationStatus('authenticated');
    return session.user;
  }, [authService]);

  const logout = useCallback(async () => {
    await authService.logoutAsync();
  }, [authService]);

  const value = useMemo(
    () => ({
      currentUser,
      authenticationStatus,
      isAuthenticated: authenticationStatus === 'authenticated',
      isLoading: authenticationStatus === 'restoring',
      login,
      logout,
      refreshCurrentUser,
    }),
    [currentUser, authenticationStatus, login, logout, refreshCurrentUser]
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
