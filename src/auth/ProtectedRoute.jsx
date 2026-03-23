import { useEffect, useRef } from "react";
import { useAuth } from "./useAuth";
import { hasJustLoggedOut } from "./authService";

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, login } = useAuth();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (
      !loading &&
      !isAuthenticated &&
      !hasRedirectedRef.current &&
      !hasJustLoggedOut()
    ) {
      hasRedirectedRef.current = true;
      login();
    }
  }, [loading, isAuthenticated, login]);

  if (loading) {
    return <div style={{ padding: 24 }}>Carregando autenticação...</div>;
  }

  if (!isAuthenticated) {
    return <div style={{ padding: 24 }}>Redirecionando para login...</div>;
  }

  return children;
}
