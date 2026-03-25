import { useEffect } from "react";
import { useAuth } from "../auth/useAuth";
import {
  clearAuthParamsFromUrl,
  clearJustLoggedOut,
  clearStoredTokens,
} from "../auth/authService";
import "../styles/admin.css";

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
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 380,
          background: "#fff",
          borderRadius: 16,
          padding: 28,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          border: "1px solid #e5e7eb",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: 8 }}>SIS Minuta</h1>

        <p style={{ color: "#6b7280", marginBottom: 24 }}>
          Você saiu do sistema com sucesso.
        </p>

        <button
          className="admin-button"
          style={{ width: "100%" }}
          onClick={login}
        >
          Entrar novamente
        </button>
      </div>
    </div>
  );
}
