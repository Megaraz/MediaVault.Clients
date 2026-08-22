import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { createAuthenticationRedirectState } from "./authRedirect";
import { useUser } from "./useUser";

type RequireAuthenticationProps = {
  children: ReactNode;
};

export default function RequireAuthentication({
  children,
}: RequireAuthenticationProps) {
  const { authenticationStatus } = useUser();
  const location = useLocation();

  if (authenticationStatus === "restoring") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Restoring session...</p>
      </main>
    );
  }

  if (authenticationStatus === "unauthenticated") {
    const returnTo = `${location.pathname}${location.search}${location.hash}`;
    return (
      <Navigate
        to="/"
        replace
        state={createAuthenticationRedirectState(returnTo)}
      />
    );
  }

  return children;
}
