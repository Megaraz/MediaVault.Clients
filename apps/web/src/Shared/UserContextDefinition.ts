import { createContext } from "react";
import type { UserDetailedDto, UserLoginDto } from "@mediavault/contracts";

export type AuthenticationStatus =
  | "restoring"
  | "authenticated"
  | "unauthenticated";

export type UserContextType = {
  currentUser: UserDetailedDto | null;
  authenticationStatus: AuthenticationStatus;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: UserLoginDto) => Promise<UserDetailedDto>;
  logout: () => Promise<void>;
  refreshCurrentUser: () => Promise<UserDetailedDto | null>;
};

export const UserContext = createContext<UserContextType | undefined>(undefined);
