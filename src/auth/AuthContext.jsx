import { createContext, useEffect, useRef, useState } from "react";
import {
  clearAuthParamsFromUrl,
  clearStoredTokens,
  exchangeCodeForToken,
  getAuthorizationCodeFromUrl,
  getStoredTokens,
  getUserFromIdToken,
  hasValidAccessToken,
  isTokenExpired,
  redirectToLogin,
  redirectToLogout,
  refreshSession,
  saveTokens,
  hasJustLoggedOut,
} from "./authService";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [tokens, setTokens] = useState(getStoredTokens());
  const [user, setUser] = useState(
    getStoredTokens()?.id_token
      ? getUserFromIdToken(getStoredTokens().id_token)
      : null,
  );
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const hasHandledCodeRef = useRef(false);

  useEffect(() => {
    async function bootstrapAuth() {
      try {
        setLoading(true);
        setAuthError("");

        const currentPath = window.location.pathname;

        if (currentPath === "/logged-out" || hasJustLoggedOut()) {
          clearStoredTokens();
          setTokens(null);
          setUser(null);
          return;
        }

        const code = getAuthorizationCodeFromUrl();

        if (code && !hasHandledCodeRef.current) {
          hasHandledCodeRef.current = true;

          const tokenResponse = await exchangeCodeForToken(code);
          saveTokens(tokenResponse);
          setTokens(tokenResponse);
          setUser(getUserFromIdToken(tokenResponse.id_token));
          clearAuthParamsFromUrl();
          return;
        }

        const stored = getStoredTokens();

        if (!stored) {
          setTokens(null);
          setUser(null);
          return;
        }

        if (hasValidAccessToken(stored)) {
          setTokens(stored);
          setUser(getUserFromIdToken(stored.id_token));
          return;
        }

        if (stored.refresh_token) {
          const refreshed = await refreshSession(stored.refresh_token);
          const merged = {
            ...stored,
            ...refreshed,
            refresh_token: stored.refresh_token,
          };

          saveTokens(merged);
          setTokens(merged);
          setUser(getUserFromIdToken(merged.id_token || stored.id_token));
          return;
        }

        clearStoredTokens();
        setTokens(null);
        setUser(null);
      } catch (error) {
        console.error(error);
        clearStoredTokens();
        setTokens(null);
        setUser(null);
        setAuthError(error.message || "Erro de autenticação");
      } finally {
        setLoading(false);
      }
    }

    bootstrapAuth();
  }, []);

  async function getValidAccessToken() {
    const current = getStoredTokens();

    if (!current) return null;

    if (current.access_token && !isTokenExpired(current.access_token)) {
      return current.access_token;
    }

    if (current.refresh_token) {
      const refreshed = await refreshSession(current.refresh_token);
      const merged = {
        ...current,
        ...refreshed,
        refresh_token: current.refresh_token,
      };

      saveTokens(merged);
      setTokens(merged);
      setUser(getUserFromIdToken(merged.id_token || current.id_token));

      return merged.access_token;
    }

    return null;
  }

  function login() {
    redirectToLogin();
  }

  function logout() {
    clearStoredTokens();
    setTokens(null);
    setUser(null);
    redirectToLogout();
  }

  const value = {
    isAuthenticated: !!tokens?.access_token,
    tokens,
    user,
    loading,
    authError,
    login,
    logout,
    getValidAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
