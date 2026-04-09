import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../auth/useAuth";
import { apiFetch } from "../services/api";

const API_BUSCAR_MINUTA = import.meta.env.VITE_API_URL_BUSCAR_MINUTA;

const API_LISTAR_FERIAS_ANTECIP_PRACA_POR_MINUTA = import.meta.env
  .VITE_API_URL_LISTAR_FERIAS_ANTECIP_PRACA_POR_MINUTA;

const API_LISTAR_FERIAS_ANTECIP_OFICIAL_POR_MINUTA = import.meta.env
  .VITE_API_URL_LISTAR_FERIAS_ANTECIP_OFICIAL_POR_MINUTA;

const API_LISTAR_FERIAS_ANTECIP_CIVIL_POR_MINUTA = import.meta.env
  .VITE_API_URL_LISTAR_FERIAS_ANTECIP_CIVIL_POR_MINUTA;

const API_LISTAR_FERIAS_REPROGRAMACAO_PRACA_POR_MINUTA = import.meta.env
  .VITE_API_URL_LISTAR_FERIAS_REPROGRAMACAO_PRACA_POR_MINUTA;

const API_LISTAR_FERIAS_REPROGRAMACAO_OFICIAL_POR_MINUTA = import.meta.env
  .VITE_API_URL_LISTAR_FERIAS_REPROGRAMACAO_OFICIAL_POR_MINUTA;

const API_LISTAR_FERIAS_REPROGRAMACAO_CIVIL_POR_MINUTA = import.meta.env
  .VITE_API_URL_LISTAR_FERIAS_REPROGRAMACAO_CIVIL_POR_MINUTA;

const API_LISTAR_FERIAS_MARCACAO_PRACA_POR_MINUTA = import.meta.env
  .VITE_API_URL_LISTAR_FERIAS_MARCACAO_PRACA_POR_MINUTA;

const API_LISTAR_FERIAS_MARCACAO_OFICIAL_POR_MINUTA = import.meta.env
  .VITE_API_URL_LISTAR_FERIAS_MARCACAO_OFICIAL_POR_MINUTA;

const API_LISTAR_FERIAS_MARCACAO_CIVIL_POR_MINUTA = import.meta.env
  .VITE_API_URL_LISTAR_FERIAS_MARCACAO_CIVIL_POR_MINUTA;

const API_LISTAR_ABONO_OFICIAL_POR_MINUTA = import.meta.env
  .VITE_API_URL_LISTAR_ABONO_OFICIAL_POR_MINUTA;

const API_LISTAR_ABONO_PRACA_POR_MINUTA = import.meta.env
  .VITE_API_URL_LISTAR_ABONO_PRACA_POR_MINUTA;

const API_LISTAR_ABONO_CIVIL_POR_MINUTA = import.meta.env
  .VITE_API_URL_LISTAR_ABONO_CIVIL_POR_MINUTA;

function formatarData(data) {
  if (!data) return "-";

  const valor = String(data).slice(0, 10);
  const partes = valor.split("-");

  if (partes.length !== 3) {
    const dt = new Date(data);
    if (Number.isNaN(dt.getTime())) return data;
    return dt.toLocaleDateString("pt-BR");
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
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
    [item.grad, item.quadro, item.nome].filter(Boolean).join(" ").trim() ||
    item.nome ||
    item.nome_pessoa ||
    item.ds_pessoa ||
    item.matr ||
    "-"
  );
}

function normalizarLista(data) {
  if (Array.isArray(data?.registros)) return data.registros;
  if (Array.isArray(data)) return data;
  return [];
}

function renderBlocoAntecipacao(lista, tipoIdField) {
  if (!lista || lista.length === 0) {
    return <p>Sem Alteração.</p>;
  }

  return lista.map((item, index) => (
    <div key={item[tipoIdField] || index} style={{ marginBottom: "16px" }}>
      <p>
        {montarNomePessoa(item)}, Matrícula{" "}
        {item.mat_pessoa || item.matr || "-"}, requer a Vossa Senhoria a
        antecipação de {item.qtd_dias_ferias || "-"} dias de férias
        regulamentares, relativas ao exercício de {item.ano_exercicio || "-"},
        previstas no Calendário de férias para o mês de{" "}
        {getNomeMes(item.mes_previsto)} de {item.ano_previsto || "-"}, a serem
        gozadas no período de {formatarData(item.dt_inicio_periodo)} a{" "}
        {formatarData(item.dt_fim_periodo)}; Doc. SEI{" "}
        {item.nu_requerimento_sei || "-"}. Deferido em{" "}
        {formatarData(item.dt_deferimento_sei)} Doc. SEI{" "}
        {item.nu_deferimento_sei || "-"}.
      </p>
    </div>
  ));
}

function renderBlocoReprogramacao(lista, tipoIdField) {
  if (!lista || lista.length === 0) {
    return <p>Sem Alteração.</p>;
  }

  return lista.map((item, index) => (
    <div key={item[tipoIdField] || index} style={{ marginBottom: "16px" }}>
      <p>
        {montarNomePessoa(item)}, Matrícula{" "}
        {item.mat_pessoa || item.matr || "-"}, requer a Vossa Senhoria a
        reprogramação de férias regulamentares, referente ao exercício de{" "}
        {item.ano_exercicio || "-"}, prevista para o mês de{" "}
        {getNomeMes(item.mes_previsto)} de {item.ano_previsto || "-"}, para o
        mês de {getNomeMes(item.mes_pretendido)} de {item.ano_pretendido || "-"}
        ; Doc. SEI {item.nu_requerimento_sei || "-"}. Deferido em{" "}
        {formatarData(item.dt_deferimento_sei)} Doc. SEI{" "}
        {item.nu_deferimento_sei || "-"}.
      </p>
    </div>
  ));
}

function renderBlocoMarcacao(lista, tipoIdField) {
  if (!lista || lista.length === 0) {
    return <p>Sem Alteração.</p>;
  }

  return lista.map((item, index) => (
    <div key={item[tipoIdField] || index} style={{ marginBottom: "16px" }}>
      <p>
        {montarNomePessoa(item)}, Matrícula{" "}
        {item.mat_pessoa || item.matr || "-"}, requer a Vossa Senhoria o gozo de
        férias regulamentares referente ao exercício de{" "}
        {item.ano_exercicio || "-"}, prevista para o mês de{" "}
        {getNomeMes(item.mes_previsto)} de {item.ano_previsto || "-"}, a serem
        gozadas no período de {formatarData(item.dt_inicio_periodo)} a{" "}
        {formatarData(item.dt_fim_periodo)}; Doc. SEI{" "}
        {item.nu_requerimento_sei || "-"}. Deferido em{" "}
        {formatarData(item.dt_deferimento_sei)} Doc. SEI{" "}
        {item.nu_deferimento_sei || "-"}.
      </p>
    </div>
  ));
}

function renderBlocoAbono(lista, tipoIdField) {
  if (!lista || lista.length === 0) {
    return <p>Sem Alteração.</p>;
  }

  return lista.map((item, index) => (
    <div key={item[tipoIdField] || index} style={{ marginBottom: "16px" }}>
      <p>
        {montarNomePessoa(item)}, Matrícula{" "}
        {item.mat_pessoa || item.matr || "-"}, requer a Vossa Senhoria o gozo de{" "}
        {item.qtd_dias_abono || "-"} dias de abono de ponto anual, referente ao
        exercício de {item.ano_exercicio || "-"}, a serem gozados no período de{" "}
        {formatarData(item.dt_inicio_periodo)} a{" "}
        {formatarData(item.dt_fim_periodo)}; Doc. SEI{" "}
        {item.nu_requerimento_sei || "-"}. Deferido em{" "}
        {formatarData(item.dt_deferimento_sei)} Doc. SEI{" "}
        {item.nu_deferimento_sei || "-"}.
      </p>
    </div>
  ));
}

async function buscarListaComFallback({
  url,
  getValidAccessToken,
  nomeBloco,
  setLista,
  acumularErro,
}) {
  try {
    const data = await apiFetch(url, { method: "GET" }, getValidAccessToken);
    setLista(normalizarLista(data));
  } catch (error) {
    console.error(`Erro ao carregar ${nomeBloco}:`, error);
    setLista([]);
    acumularErro(
      `${nomeBloco}: ${error?.message || "erro ao carregar registros"}`,
    );
  }
}

export function DetalheMinutaPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getValidAccessToken } = useAuth();

  const [minuta, setMinuta] = useState(null);

  const [registrosAntecipPraca, setRegistrosAntecipPraca] = useState([]);
  const [registrosAntecipOficial, setRegistrosAntecipOficial] = useState([]);
  const [registrosAntecipCivil, setRegistrosAntecipCivil] = useState([]);

  const [registrosReprogPraca, setRegistrosReprogPraca] = useState([]);
  const [registrosReprogOficial, setRegistrosReprogOficial] = useState([]);
  const [registrosReprogCivil, setRegistrosReprogCivil] = useState([]);

  const [registrosMarcacaoPraca, setRegistrosMarcacaoPraca] = useState([]);
  const [registrosMarcacaoOficial, setRegistrosMarcacaoOficial] = useState([]);
  const [registrosMarcacaoCivil, setRegistrosMarcacaoCivil] = useState([]);

  const [registrosAbonoOficial, setRegistrosAbonoOficial] = useState([]);
  const [registrosAbonoPraca, setRegistrosAbonoPraca] = useState([]);
  const [registrosAbonoCivil, setRegistrosAbonoCivil] = useState([]);

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

        setRegistrosAntecipPraca([]);
        setRegistrosAntecipOficial([]);
        setRegistrosAntecipCivil([]);

        setRegistrosReprogPraca([]);
        setRegistrosReprogOficial([]);
        setRegistrosReprogCivil([]);

        setRegistrosMarcacaoPraca([]);
        setRegistrosMarcacaoOficial([]);
        setRegistrosMarcacaoCivil([]);

        setRegistrosAbonoOficial([]);
        setRegistrosAbonoPraca([]);
        setRegistrosAbonoCivil([]);

        const dataMinuta = await apiFetch(
          `${API_BUSCAR_MINUTA}/${id}`,
          { method: "GET" },
          getValidAccessToken,
        );

        setMinuta(dataMinuta);

        const erros = [];
        const acumularErro = (mensagem) => {
          erros.push(mensagem);
        };

        await buscarListaComFallback({
          url: `${API_LISTAR_FERIAS_ANTECIP_PRACA_POR_MINUTA}/${id}`,
          getValidAccessToken,
          nomeBloco: "Férias Antecipação Praça",
          setLista: setRegistrosAntecipPraca,
          acumularErro,
        });

        await buscarListaComFallback({
          url: `${API_LISTAR_FERIAS_ANTECIP_OFICIAL_POR_MINUTA}/${id}`,
          getValidAccessToken,
          nomeBloco: "Férias Antecipação Oficial",
          setLista: setRegistrosAntecipOficial,
          acumularErro,
        });

        await buscarListaComFallback({
          url: `${API_LISTAR_FERIAS_ANTECIP_CIVIL_POR_MINUTA}/${id}`,
          getValidAccessToken,
          nomeBloco: "Férias Antecipação Civil",
          setLista: setRegistrosAntecipCivil,
          acumularErro,
        });

        await buscarListaComFallback({
          url: `${API_LISTAR_FERIAS_REPROGRAMACAO_PRACA_POR_MINUTA}/${id}`,
          getValidAccessToken,
          nomeBloco: "Férias Reprogramação Praça",
          setLista: setRegistrosReprogPraca,
          acumularErro,
        });

        await buscarListaComFallback({
          url: `${API_LISTAR_FERIAS_REPROGRAMACAO_OFICIAL_POR_MINUTA}/${id}`,
          getValidAccessToken,
          nomeBloco: "Férias Reprogramação Oficial",
          setLista: setRegistrosReprogOficial,
          acumularErro,
        });

        await buscarListaComFallback({
          url: `${API_LISTAR_FERIAS_REPROGRAMACAO_CIVIL_POR_MINUTA}/${id}`,
          getValidAccessToken,
          nomeBloco: "Férias Reprogramação Civil",
          setLista: setRegistrosReprogCivil,
          acumularErro,
        });

        await buscarListaComFallback({
          url: `${API_LISTAR_FERIAS_MARCACAO_PRACA_POR_MINUTA}/${id}`,
          getValidAccessToken,
          nomeBloco: "Férias Marcação Praça",
          setLista: setRegistrosMarcacaoPraca,
          acumularErro,
        });

        await buscarListaComFallback({
          url: `${API_LISTAR_FERIAS_MARCACAO_OFICIAL_POR_MINUTA}/${id}`,
          getValidAccessToken,
          nomeBloco: "Férias Marcação Oficial",
          setLista: setRegistrosMarcacaoOficial,
          acumularErro,
        });

        await buscarListaComFallback({
          url: `${API_LISTAR_FERIAS_MARCACAO_CIVIL_POR_MINUTA}/${id}`,
          getValidAccessToken,
          nomeBloco: "Férias Marcação Civil",
          setLista: setRegistrosMarcacaoCivil,
          acumularErro,
        });

        await buscarListaComFallback({
          url: `${API_LISTAR_ABONO_OFICIAL_POR_MINUTA}/${id}`,
          getValidAccessToken,
          nomeBloco: "Abono Oficial",
          setLista: setRegistrosAbonoOficial,
          acumularErro,
        });

        await buscarListaComFallback({
          url: `${API_LISTAR_ABONO_PRACA_POR_MINUTA}/${id}`,
          getValidAccessToken,
          nomeBloco: "Abono Praça",
          setLista: setRegistrosAbonoPraca,
          acumularErro,
        });

        await buscarListaComFallback({
          url: `${API_LISTAR_ABONO_CIVIL_POR_MINUTA}/${id}`,
          getValidAccessToken,
          nomeBloco: "Abono Civil",
          setLista: setRegistrosAbonoCivil,
          acumularErro,
        });

        if (erros.length > 0) {
          setErroRegistros(
            `Alguns blocos não foram carregados: ${erros.join(" | ")}`,
          );
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
              <p>ATOS DO CHEFE DO {minuta.sg_unidade}</p>
              <p>1ª PARTE – SERVIÇOS DIÁRIOS</p>
              <p>Sem Alteração.</p>
              <p>2ª PARTE – ENSINO E INSTRUÇÃO</p>
              <p>Sem Alteração.</p>
              <p>3ª PARTE – ASSUNTOS GERAIS E ADMINISTRATIVOS</p>
              <p>I - ASSUNTOS ADMINISTRATIVOS</p>
              <p>(A) - PESSOAL/ALTERAÇÕES DIVERSAS</p>

              <p>1 - OFICIAIS</p>

              <p>A - FÉRIAS/ANTECIPAÇÃO</p>
              {renderBlocoAntecipacao(
                registrosAntecipOficial,
                "id_ferias_antecipacao_oficial",
              )}

              <p>B - FÉRIAS/MARCAÇÃO</p>
              {renderBlocoMarcacao(
                registrosMarcacaoOficial,
                "id_ferias_marcacao_oficial",
              )}

              <p>C - FÉRIAS/REPROGRAMAÇÃO</p>
              {renderBlocoReprogramacao(
                registrosReprogOficial,
                "id_ferias_reprogramacao_oficial",
              )}

              <p>D - ABONO DE PONTO ANUAL</p>
              {renderBlocoAbono(registrosAbonoOficial, "id_abono_oficial")}

              <p>2 - DE PRAÇAS</p>

              <p>A - FÉRIAS/ANTECIPAÇÃO</p>
              {renderBlocoAntecipacao(
                registrosAntecipPraca,
                "id_ferias_antecipacao_praca",
              )}

              <p>B - FÉRIAS/MARCAÇÃO</p>
              {renderBlocoMarcacao(
                registrosMarcacaoPraca,
                "id_ferias_marcacao_praca",
              )}

              <p>C - FÉRIAS/REPROGRAMAÇÃO</p>
              {renderBlocoReprogramacao(
                registrosReprogPraca,
                "id_ferias_reprogramacao_praca",
              )}

              <p>D - ABONO DE PONTO ANUAL</p>
              {renderBlocoAbono(registrosAbonoPraca, "id_abono_praca")}

              <p>3 - FUNCIONÁRIOS CIVIS</p>

              <p>A - FÉRIAS/ANTECIPAÇÃO</p>
              {renderBlocoAntecipacao(
                registrosAntecipCivil,
                "id_ferias_antecipacao_civil",
              )}

              <p>B - FÉRIAS/MARCAÇÃO</p>
              {renderBlocoMarcacao(
                registrosMarcacaoCivil,
                "id_ferias_marcacao_civil",
              )}

              <p>C - FÉRIAS/REPROGRAMAÇÃO</p>
              {renderBlocoReprogramacao(
                registrosReprogCivil,
                "id_ferias_reprogramacao_civil",
              )}

              <p>D - ABONO DE PONTO ANUAL</p>
              {renderBlocoAbono(registrosAbonoCivil, "id_abono_civil")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
