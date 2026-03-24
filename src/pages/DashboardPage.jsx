import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import { apiFetch } from "../services/api";

const API_URL = import.meta.env.VITE_API_URL;
const API_LISTAR_DEPTO = import.meta.env.VITE_API_URL_LISTAR_DEPARTAMENTO;
const API_LISTAR_QUADRO = import.meta.env.VITE_API_URL_LISTAR_QUADRO;
const API_LISTAR_POSTO_GRADUACAO = import.meta.env
  .VITE_API_URL_LISTAR_POSTO_GRADUACAO;
const API_LISTAR_MINUTA = import.meta.env.VITE_API_URL_LISTAR_MINUTA;
const API_LISTAR_PESSOA = import.meta.env.VITE_API_URL_LISTAR_PESSOA;

export function DashboardPage() {
  const { user, logout, getValidAccessToken } = useAuth();
  const [apiResult, setApiResult] = useState("");
  const [apiError, setApiError] = useState("");
  const [loadingApi, setLoadingApi] = useState(false);

  async function callListDptoApi() {
    try {
      setLoadingApi(true);
      setApiError("");
      setApiResult("");

      const data = await apiFetch(
        `${API_LISTAR_DEPTO}`,
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

  async function callListQuadroApi() {
    try {
      setLoadingApi(true);
      setApiError("");
      setApiResult("");

      const data = await apiFetch(
        `${API_LISTAR_QUADRO}`,
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

  async function callListPostoGraduacaoApi() {
    try {
      setLoadingApi(true);
      setApiError("");
      setApiResult("");

      const data = await apiFetch(
        `${API_LISTAR_POSTO_GRADUACAO}`,
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

  async function callListMinutaApi() {
    try {
      setLoadingApi(true);
      setApiError("");
      setApiResult("");

      const data = await apiFetch(
        `${API_LISTAR_MINUTA}`,
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

  async function callListPessoaApi() {
    try {
      setLoadingApi(true);
      setApiError("");
      setApiResult("");

      const data = await apiFetch(
        `${API_LISTAR_PESSOA}`,
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

        <button onClick={callListDptoApi} disabled={loadingApi}>
          Listar Departamentos
        </button>

        <button onClick={callListQuadroApi} disabled={loadingApi}>
          Listar Quadro
        </button>

        <button onClick={callListPostoGraduacaoApi} disabled={loadingApi}>
          Listar Posto/Graduaçãoo
        </button>

        <button onClick={callListMinutaApi} disabled={loadingApi}>
          Listar Minutas
        </button>

        <button onClick={callListPessoaApi} disabled={loadingApi}>
          Listar Pessoas
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
