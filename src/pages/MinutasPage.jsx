import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { SummaryCard } from "../components/SummaryCard";
import { DataTable } from "../components/DataTable";
import { useAuth } from "../auth/useAuth";
import { apiFetch } from "../services/api";

const API_LISTAR_DEPARTAMENTO = import.meta.env
  .VITE_API_URL_LISTAR_DEPARTAMENTO;
const API_LISTAR_MINUTAS_DEPARTAMENTO = import.meta.env
  .VITE_API_URL_LISTAR_MINUTAS_DEPARTAMENTO;
const API_EXCLUIR_MINUTA = import.meta.env.VITE_API_URL_EXCLUIR_MINUTA;

function formatarData(data) {
  if (!data) return "-";

  const dt = new Date(data);
  if (Number.isNaN(dt.getTime())) return data;

  return dt.toLocaleDateString("pt-BR");
}

function renderTipoBadge(tipo) {
  const valor = Number(tipo);

  if (valor === 0) {
    return <span className="badge badge-green">BCG</span>;
  }

  if (valor === 1) {
    return <span className="badge badge-orange">Restrita</span>;
  }

  return <span>-</span>;
}

function renderStatus(status) {
  const valor = Number(status);

  if (valor === 0) return "Aberta";
  if (valor === 1) return "Em Assinatura";
  if (valor === 2) return "Concluída";

  return String(status);
}

export function MinutasPage() {
  const navigate = useNavigate();
  const { getValidAccessToken } = useAuth();

  const [departamentos, setDepartamentos] = useState([]);
  const [idDepartamento, setIdDepartamento] = useState("");
  const [minutas, setMinutas] = useState([]);
  const [loadingDepartamentos, setLoadingDepartamentos] = useState(true);
  const [loadingMinutas, setLoadingMinutas] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarDepartamentos() {
      try {
        setLoadingDepartamentos(true);
        setErro("");

        const data = await apiFetch(
          API_LISTAR_DEPARTAMENTO,
          { method: "GET" },
          getValidAccessToken,
        );

        setDepartamentos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setErro(error.message || "Erro ao carregar departamentos");
      } finally {
        setLoadingDepartamentos(false);
      }
    }

    carregarDepartamentos();
  }, [getValidAccessToken]);

  useEffect(() => {
    async function carregarMinutas() {
      if (!idDepartamento) {
        setMinutas([]);
        return;
      }

      try {
        setLoadingMinutas(true);
        setErro("");

        const data = await apiFetch(
          `${API_LISTAR_MINUTAS_DEPARTAMENTO}/${idDepartamento}`,
          { method: "GET" },
          getValidAccessToken,
        );

        setMinutas(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setErro(error.message || "Erro ao carregar minutas");
      } finally {
        setLoadingMinutas(false);
      }
    }

    carregarMinutas();
  }, [idDepartamento, getValidAccessToken]);

  async function handleExcluirMinuta(idMinuta) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir esta minuta?",
    );

    if (!confirmar) return;

    try {
      await apiFetch(
        `${API_EXCLUIR_MINUTA}/${idMinuta}`,
        { method: "DELETE" },
        getValidAccessToken,
      );

      setMinutas((prev) => prev.filter((item) => item.id_minuta !== idMinuta));
    } catch (error) {
      console.error(error);
      alert(error.message || "Erro ao excluir minuta");
    }
  }

  const columns = [
    { key: "id_minuta", label: "ID" },
    { key: "nu_minuta", label: "Número" },
    {
      key: "ds_departamento",
      label: "Departamento",
      render: (row) => row.ds_departamento || row.id_departamento,
    },
    {
      key: "tp_minuta",
      label: "Tipo",
      render: (row) => renderTipoBadge(row.tp_minuta),
    },
    {
      key: "st_minuta",
      label: "Status",
      render: (row) => renderStatus(row.st_minuta),
    },
    {
      key: "dt_abertura",
      label: "Abertura",
      render: (row) => formatarData(row.dt_abertura),
    },
    {
      key: "acoes",
      label: "Ações",
      render: (row) => (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            className="table-action-button"
            onClick={() => navigate(`/minutas/${row.id_minuta}`)}
          >
            Detalhar
          </button>

          <button
            className="table-action-button"
            onClick={() => navigate(`/minutas/editar/${row.id_minuta}`)}
          >
            Editar
          </button>

          <button
            className="table-action-button table-action-danger"
            onClick={() => handleExcluirMinuta(row.id_minuta)}
          >
            Excluir
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Minutas"
        subtitle="Listagem de minutas cadastradas no sistema"
      />

      <div className="summary-grid">
        <SummaryCard label="Total de minutas" value={minutas.length} />
        <SummaryCard
          label="Departamento selecionado"
          value={
            idDepartamento
              ? departamentos.find(
                  (item) =>
                    String(item.id_departamento) === String(idDepartamento),
                )?.ds_departamento || "-"
              : "-"
          }
        />
      </div>

      <div className="content-card" style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "end",
            flexWrap: "wrap",
          }}
        >
          <div style={{ minWidth: 280 }}>
            <label
              htmlFor="departamento"
              style={{ display: "block", marginBottom: 8, fontWeight: 600 }}
            >
              Departamento
            </label>

            <select
              id="departamento"
              value={idDepartamento}
              onChange={(e) => setIdDepartamento(e.target.value)}
              style={{
                width: "100%",
                height: 42,
                borderRadius: 10,
                border: "1px solid #d1d5db",
                padding: "0 12px",
                background: "#fff",
              }}
            >
              <option value="">Selecione um departamento</option>
              {departamentos.map((item) => (
                <option key={item.id_departamento} value={item.id_departamento}>
                  {item.ds_departamento}
                </option>
              ))}
            </select>
          </div>

          <button
            className="admin-button"
            onClick={() => navigate("/minutas/nova")}
          >
            Nova Minuta
          </button>
        </div>
      </div>

      {loadingDepartamentos && (
        <div className="loading-text">Carregando departamentos...</div>
      )}

      {erro && <div className="error-text">{erro}</div>}

      {!loadingDepartamentos && !erro && !idDepartamento && (
        <div className="content-card">
          <div className="empty-text">
            Selecione um departamento para listar as minutas.
          </div>
        </div>
      )}

      {!loadingDepartamentos && !erro && idDepartamento && loadingMinutas && (
        <div className="loading-text">Carregando minutas...</div>
      )}

      {!loadingDepartamentos && !erro && idDepartamento && !loadingMinutas && (
        <DataTable
          columns={columns}
          data={minutas}
          emptyMessage="Nenhuma minuta encontrada para o departamento selecionado."
        />
      )}
    </div>
  );
}
