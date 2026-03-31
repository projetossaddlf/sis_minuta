import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../auth/useAuth";
import { apiFetch } from "../services/api";

const API_BUSCAR_MINUTA = import.meta.env.VITE_API_URL_BUSCAR_MINUTA;
const API_LISTAR_FERIAS_ANTECIP_PRACA_POR_MINUTA = import.meta.env
  .VITE_API_URL_LISTAR_FERIAS_ANTECIP_PRACA_POR_MINUTA;

function formatarData(data) {
  if (!data) return "-";

  const dt = new Date(data);
  if (Number.isNaN(dt.getTime())) return data;

  return dt.toLocaleDateString("pt-BR");
}

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

function getNomeMes(mes) {
  const meses = {
    1: "janeiro",
    2: "fevereiro",
    3: "março",
    4: "abril",
    5: "maio",
    6: "junho",
    7: "julho",
    8: "agosto",
    9: "setembro",
    10: "outubro",
    11: "novembro",
    12: "dezembro",
  };

  return meses[Number(mes)] || "-";
}

function montarNomePessoa(item) {
  return (
    item.nome_completo ||
    [item.ds_posto_graduacao, item.ds_quadro, item.nm_pessoa]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    item.nm_pessoa ||
    item.nome_pessoa ||
    item.ds_pessoa ||
    item.mat_pessoa ||
    "-"
  );
}

export function DetalheMinutaPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getValidAccessToken } = useAuth();

  const [minuta, setMinuta] = useState(null);
  const [registrosFerias, setRegistrosFerias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [erroRegistros, setErroRegistros] = useState("");

  useEffect(() => {
    async function carregar() {
      if (!id || id === "undefined") {
        setErro("ID da minuta inválido.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErro("");
        setErroRegistros("");
        setMinuta(null);
        setRegistrosFerias([]);

        const dataMinuta = await apiFetch(
          `${API_BUSCAR_MINUTA}/${id}`,
          { method: "GET" },
          getValidAccessToken,
        );

        setMinuta(dataMinuta);

        try {
          const dataRegistros = await apiFetch(
            `${API_LISTAR_FERIAS_ANTECIP_PRACA_POR_MINUTA}/${id}`,
            { method: "GET" },
            getValidAccessToken,
          );

          const lista = Array.isArray(dataRegistros?.registros)
            ? dataRegistros.registros
            : Array.isArray(dataRegistros)
              ? dataRegistros
              : [];

          setRegistrosFerias(lista);
        } catch (errorRegistros) {
          console.error(
            "Erro ao carregar registros de férias:",
            errorRegistros,
          );
          setErroRegistros(
            errorRegistros.message || "Erro ao carregar registros vinculados.",
          );
          setRegistrosFerias([]);
        }
      } catch (error) {
        console.error("Erro ao carregar minuta:", error);
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
        title="Detalhar Minuta"
        subtitle="Minuta gerada para ser anexada no SEI."
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

                <button
                  className="admin-button"
                  onClick={() =>
                    navigate(`/minutas/editar/${minuta.id_minuta}`)
                  }
                >
                  Editar
                </button>
              </div>
            </div>

            <div className="detail-info-grid">
              <div className="detail-item">
                <span className="detail-label">ID</span>
                <strong>{minuta.id_minuta || "-"}</strong>
              </div>

              <div className="detail-item">
                <span className="detail-label">Número</span>
                <strong>{minuta.nu_minuta || "-"}</strong>
              </div>

              <div className="detail-item">
                <span className="detail-label">Unidade</span>
                <strong>{minuta.sg_unidade || minuta.id_unidade || "-"}</strong>
              </div>

              <div className="detail-item">
                <span className="detail-label">Tipo</span>
                <div>{renderTipo(minuta.tp_minuta)}</div>
              </div>

              <div className="detail-item">
                <span className="detail-label">Status</span>
                <div>{renderStatus(minuta.st_minuta)}</div>
              </div>

              <div className="detail-item">
                <span className="detail-label">Data de abertura</span>
                <strong>{formatarData(minuta.dt_abertura)}</strong>
              </div>

              <div className="detail-item">
                <span className="detail-label">Data de conclusão</span>
                <strong>{formatarData(minuta.dt_conclusao)}</strong>
              </div>
            </div>
          </div>

          <div className="content-card">
            <h2 className="detail-card-title">Minuta Gerada</h2>

            {erroRegistros && (
              <div className="error-text" style={{ marginBottom: 16 }}>
                {erroRegistros}
              </div>
            )}

            <div className="text-card">
              <p>
                MINUTA Nº {minuta.nu_minuta || "-"} - PARA PUBLICAÇÃO EM{" "}
                {Number(minuta.tp_minuta) === 0 ? "BCG" : "BRCG"}
              </p>
              <p>ATOS DO CHEFE DO DEPARTAMENTO DE LOGÍSTICA E FINANÇAS - DLF</p>
              <p>1ª PARTE – SERVIÇOS DIÁRIOS</p>
              <p>Sem Alteração.</p>
              <p>2ª PARTE – ENSINO E INSTRUÇÃO</p>
              <p>Sem Alteração.</p>
              <p>3ª PARTE – ASSUNTOS GERAIS E ADMINISTRATIVOS</p>
              <p>I - ASSUNTOS ADMINISTRATIVOS</p>
              <p>(A) - PESSOAL/ALTERAÇÕES DIVERSAS</p>
              <p>1 - OFICIAIS</p>
              <p>A - FÉRIAS/INÍCIO/TÉRMINO</p>
              <p>(B) DESPACHOS EM REQUERIMENTOS</p>
              <p>1 - DE OFICIAIS</p>
              <p>A - FÉRIAS/ANTECIPAÇÃO</p>
              <p>Sem Alteração.</p>
              <p>B - FÉRIAS/MARCAÇÃO</p>
              <p>Sem Alteração.</p>
              <p>C - FÉRIAS/REPROGRAMAÇÃO</p>
              <p>Sem Alteração.</p>
              <p>D - ABONO DE PONTO ANUAL</p>
              <p>Sem Alteração.</p>
              <p>2 - DE PRAÇAS</p>
              <p>A - FÉRIAS/ANTECIPAÇÃO</p>

              {registrosFerias.length === 0 ? (
                <p>Sem Alteração.</p>
              ) : (
                registrosFerias.map((item, index) => (
                  <div
                    key={item.id_ferias_antecipacao_praca || index}
                    style={{ marginBottom: "16px" }}
                  >
                    <p>
                      {montarNomePessoa(item)}, Matrícula{" "}
                      {item.mat_pessoa || item.matr || "-"}, requer a Vossa
                      Senhoria a antecipação de {item.qtd_dias_ferias || "-"}{" "}
                      dias de férias regulamentares, referente ao exercício de{" "}
                      {item.ano_exercicio || "-"}, prevista para o mês de{" "}
                      {getNomeMes(item.mes_previsto)} de{" "}
                      {item.ano_previsto || "-"}, a serem gozadas no período de{" "}
                      {formatarData(item.dt_inicio_periodo)} a{" "}
                      {formatarData(item.dt_fim_periodo)}; Doc. SEI{" "}
                      {item.nu_requerimento_sei || "-"}. Deferido em{" "}
                      {formatarData(item.dt_deferimento_sei)} Doc. SEI{" "}
                      {item.nu_deferimento_sei || "-"}.
                    </p>
                  </div>
                ))
              )}

              <p>B - FÉRIAS/MARCAÇÃO</p>
              <p>Sem Alteração.</p>
              <p>C - FÉRIAS/REPROGRAMAÇÃO</p>
              <p>Sem Alteração.</p>
              <p>D - ABONO DE PONTO ANUAL</p>
              <p>Sem Alteração.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
