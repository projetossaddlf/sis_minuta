import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../auth/useAuth";
import { apiFetch } from "../services/api";

const API_BUSCAR_MINUTA = import.meta.env.VITE_API_URL_BUSCAR_MINUTA;

function renderTipo(tipo) {
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

  if (valor === 0) {
    return <span className="badge badge-blue">Aberta</span>;
  }

  if (valor === 1) {
    return <span className="badge badge-yellow">Em Assinatura</span>;
  }

  if (valor === 2) {
    return <span className="badge badge-green">Concluída</span>;
  }

  return <span className="badge">{String(status)}</span>;
}

export function LancarDadosMinutaPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getValidAccessToken } = useAuth();

  const [minuta, setMinuta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);
        setErro("");

        const data = await apiFetch(
          `${API_BUSCAR_MINUTA}/${id}`,
          { method: "GET" },
          getValidAccessToken,
        );

        setMinuta(data);
      } catch (error) {
        console.error(error);
        setErro(error.message || "Erro ao carregar minuta");
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, [id, getValidAccessToken]);

  return (
    <div>
      <PageHeader
        title="Lançar Dados da Minuta"
        subtitle="Montar sessões da Minuta."
      />

      {loading && <div className="loading-text">Carregando minuta...</div>}
      {erro && <div className="error-text">{erro}</div>}

      {!loading && !erro && minuta && (
        <div className="detail-stack">
          <div className="content-card">
            <div className="detail-card-header">
              <h2 className="detail-card-title">Dados da Minuta</h2>

              <div className="detail-card-actions">
                <button
                  className="admin-button admin-button-secondary"
                  onClick={() => navigate("/minutas")}
                >
                  Voltar
                </button>
              </div>
            </div>

            <div className="detail-info-grid">
              <div className="detail-item">
                <span className="detail-label">Número</span>
                <strong>{minuta.nu_minuta || "-"}</strong>
              </div>

              <div className="detail-item">
                <span className="detail-label">Departamento</span>
                <strong>
                  {minuta.ds_departamento || minuta.id_departamento || "-"}
                </strong>
              </div>

              <div className="detail-item">
                <span className="detail-label">Tipo</span>
                <div>{renderTipo(minuta.tp_minuta)}</div>
              </div>

              <div className="detail-item">
                <span className="detail-label">Status</span>
                <div>{renderStatus(minuta.st_minuta)}</div>
              </div>
            </div>
          </div>

          <div className="content-card">
            <div className="detail-card-header">
              <h2 className="detail-card-title">Lançamentos da Minuta</h2>
            </div>

            <div className="actions-grid">
              <button
                className="admin-button"
                onClick={() =>
                  navigate(`/minutas/${id}/ferias-antecipacao-praca`)
                }
              >
                Lançar Dados Férias Antecipação - Praça
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
