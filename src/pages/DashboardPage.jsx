import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import { apiFetch } from "../services/api";

const API_URL = import.meta.env.VITE_API_URL;

export function DashboardPage() {
  const { user, logout, getValidAccessToken } = useAuth();
  const [apiResult, setApiResult] = useState("");
  const [apiError, setApiError] = useState("");
  const [loadingApi, setLoadingApi] = useState(false);

  async function callHealthApi() {
    try {
      setLoadingApi(true);
      setApiError("");
      setApiResult("");

      const data = await apiFetch(
        `${API_URL}/health`,
        {
          method: "GET",
        },
        getValidAccessToken,
      );

      setApiResult(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(error);
      setApiError(error.message || "Erro ao chamar API");
    } finally {
      setLoadingApi(false);
    }
  }

  async function callMeApi() {
    try {
      setLoadingApi(true);
      setApiError("");
      setApiResult("");

      const data = await apiFetch(
        `${API_URL}/me`,
        {
          method: "GET",
        },
        getValidAccessToken,
      );

      setApiResult(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(error);
      setApiError(error.message || "Erro ao chamar API");
    } finally {
      setLoadingApi(false);
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "Arial" }}>
      <h1>SIS Minuta</h1>
      <p>Autenticado com sucesso.</p>

      <p>
        <strong>Usuário:</strong> {user?.name || "-"}
      </p>
      <p>
        <strong>E-mail:</strong> {user?.email || "-"}
      </p>

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <button onClick={callHealthApi} disabled={loadingApi}>
          Chamar /health
        </button>
        <button onClick={callMeApi} disabled={loadingApi}>
          Chamar /me
        </button>
        <button onClick={logout}>Sair</button>
      </div>

      {loadingApi && <p>Chamando API...</p>}
      {apiError && <p style={{ color: "red" }}>{apiError}</p>}

      {apiResult && (
        <>
          <h3>Resposta da API</h3>
          <pre style={{ background: "#f4f4f4", padding: 16, overflow: "auto" }}>
            {apiResult}
          </pre>
        </>
      )}
    </div>
  );
}
