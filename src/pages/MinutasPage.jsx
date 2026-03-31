import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { SummaryCard } from "../components/SummaryCard";
import { DataTable } from "../components/DataTable";
import { useAuth } from "../auth/useAuth";
import { apiFetch } from "../services/api";

const API_LISTAR_UNIDADES = import.meta.env.VITE_API_URL_LISTAR_UNIDADES;
const API_LISTAR_MINUTAS_UNIDADE = import.meta.env
  .VITE_API_URL_LISTAR_MINUTAS_UNIDADE;
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
    return <span className="badge badge-orange">BRCG</span>;
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

  const [unidades, setUnidades] = useState([]);
  const [idUnidade, setIdUnidade] = useState("");
  const [minutas, setMinutas] = useState([]);
  const [loadingUnidades, setLoadingUnidades] = useState(true);
  const [loadingMinutas, setLoadingMinutas] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarUnidades() {
      try {
        setLoadingUnidades(true);
        setErro("");

        const data = await apiFetch(
          API_LISTAR_UNIDADES,
          { method: "GET" },
          getValidAccessToken,
        );

        setUnidades(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setErro(error.message || "Erro ao carregar unidades");
      } finally {
        setLoadingUnidades(false);
      }
    }

    carregarUnidades();
  }, [getValidAccessToken]);

  useEffect(() => {
    async function carregarMinutas() {
      if (!idUnidade) {
        setMinutas([]);
        return;
      }

      try {
        setLoadingMinutas(true);
        setErro("");

        const data = await apiFetch(
          `${API_LISTAR_MINUTAS_UNIDADE}/${idUnidade}`,
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
  }, [idUnidade, getValidAccessToken]);

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
      key: "sg_unidade",
      label: "Unidade",
      render: (row) => row.sg_unidade || row.id_unidade,
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
            onClick={() => navigate(`/minutas/lancar_dados/${row.id_minuta}`)}
          >
            Lançar Dados
          </button>
          <button
            className="table-action-button"
            onClick={() => {
              if (!row.id_minuta) {
                alert("ID da minuta não encontrado.");
                return;
              }

              navigate(`/minutas/buscar-minuta/${row.id_minuta}`);
            }}
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
          label="Unidade Selecionada"
          value={
            idUnidade
              ? unidades.find(
                  (item) => String(item.id_unidade) === String(idUnidade),
                )?.sg_unidade || "-"
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
              htmlFor="unidade"
              style={{ display: "block", marginBottom: 8, fontWeight: 600 }}
            >
              Unidade
            </label>

            <select
              id="unidade"
              value={idUnidade}
              onChange={(e) => setIdUnidade(e.target.value)}
              style={{
                width: "100%",
                height: 42,
                borderRadius: 10,
                border: "1px solid #d1d5db",
                padding: "0 12px",
                background: "#fff",
              }}
            >
              <option value="">Selecione uma unidade</option>
              {unidades.map((item) => (
                <option key={item.id_unidade} value={item.id_unidade}>
                  {item.sg_unidade}
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

      {loadingUnidades && (
        <div className="loading-text">Carregando unidades...</div>
      )}

      {erro && <div className="error-text">{erro}</div>}

      {!loadingUnidades && !erro && !idUnidade && (
        <div className="content-card">
          <div className="empty-text">
            Selecione uma unidade para listar as minutas.
          </div>
        </div>
      )}

      {!loadingUnidades && !erro && idUnidade && loadingMinutas && (
        <div className="loading-text">Carregando minutas...</div>
      )}

      {!loadingUnidades && !erro && idUnidade && !loadingMinutas && (
        <DataTable
          columns={columns}
          data={minutas}
          emptyMessage="Nenhuma minuta encontrada para a unidade selecionada."
        />
      )}
    </div>
  );
}
