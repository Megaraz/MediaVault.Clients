import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { UserDetailedDto, UserLoginDto } from "@mediavault/contracts";
import UsersClient from "../Clients/UsersClient";
import { saveToken } from "../Clients/tokenStore";
import {
  UserContext,
  type AuthenticationStatus,
} from "./UserContextDefinition";
import {
  beginSessionTransition,
  clearSession,
  isCurrentSessionTransition,
  subscribeToSessionInvalidation,
} from "./sessionLifecycle";

type UserProviderProps = {
  children: React.ReactNode;
};

export function UserProvider({ children }: UserProviderProps) {
  const [currentUser, setCurrentUser] = useState<UserDetailedDto | null>(null);
  const [authenticationStatus, setAuthenticationStatus] =
    useState<AuthenticationStatus>("restoring");
  const [client] = useState(() => new UsersClient());

  const refreshCurrentUser = useCallback(async () => {
    const transition = beginSessionTransition();
    try {
      const user = await client.getCurrentUser();
      if (isCurrentSessionTransition(transition)) {
        setCurrentUser(user);
        setAuthenticationStatus("authenticated");
        return user;
      }
      return null;
    } catch {
      if (isCurrentSessionTransition(transition)) {
        await clearSession();
      }
      return null;
    }
  }, [client]);

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = subscribeToSessionInvalidation(() => {
      if (isMounted) {
        setCurrentUser(null);
        setAuthenticationStatus("unauthenticated");
      }
    });

    const loadCurrentUser = async () => {
      const transition = beginSessionTransition();
      try {
        const user = await client.getCurrentUser();

        if (isMounted && isCurrentSessionTransition(transition)) {
          setCurrentUser(user);
          setAuthenticationStatus("authenticated");
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
  }, [client]);

  const login = useCallback(async (credentials: UserLoginDto) => {
    const transition = beginSessionTransition();
    const session = await client.login(credentials);
    if (!isCurrentSessionTransition(transition)) {
      throw new Error("The session changed while login was completing. Please try again.");
    }
    saveToken(session.token);
    if (!isCurrentSessionTransition(transition)) {
      await clearSession();
      throw new Error("The session changed while login was completing. Please try again.");
    }
    setCurrentUser(session.user);
    setAuthenticationStatus("authenticated");
    return session.user;
  }, [client]);

  const logout = useCallback(async () => {
    await client.logout();
  }, [client]);

  const value = useMemo(
    () => ({
      currentUser,
      authenticationStatus,
      isAuthenticated: authenticationStatus === "authenticated",
      isLoading: authenticationStatus === "restoring",
      login,
      logout,
      refreshCurrentUser,
    }),
    [currentUser, authenticationStatus, login, logout, refreshCurrentUser],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
