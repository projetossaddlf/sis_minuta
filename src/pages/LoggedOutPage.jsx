import { useEffect } from "react";
import { useAuth } from "../auth/useAuth";
import {
  clearAuthParamsFromUrl,
  clearJustLoggedOut,
  clearStoredTokens,
} from "../auth/authService";

export function LoggedOutPage() {
  const { login } = useAuth();

  useEffect(() => {
    clearStoredTokens();
    clearAuthParamsFromUrl();

    return () => {
      clearJustLoggedOut();
    };
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: "Arial" }}>
      <h1>SIS Minuta</h1>
      <p>Você saiu com sucesso.</p>
      <button onClick={login}>Entrar novamente</button>
    </div>
  );
}
