import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../auth/useAuth";
import { apiFetch } from "../services/api";

const API_CADASTRAR_FERIAS_ANTECIP_PRACA = import.meta.env
  .VITE_API_URL_CADASTRAR_FERIAS_ANTECIP_PRACA;

const API_BUSCAR_PESSOA_POR_MATRICULA = import.meta.env
  .VITE_API_URL_BUSCAR_PESSOA_POR_MATRICULA;

const API_LISTAR_FERIAS_ANTECIP_PRACA_POR_MINUTA = import.meta.env
  .VITE_API_URL_LISTAR_FERIAS_ANTECIP_PRACA_POR_MINUTA;

const MESES = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
];

function getAnoAtual() {
  return new Date().getFullYear();
}

function getMesAtual() {
  return new Date().getMonth() + 1;
}

function formatarData(data) {
  if (!data) return "-";

  const valor = String(data);
  const partes = valor.split("-");

  if (partes.length !== 3) return valor;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function getNomeMes(mes) {
  const encontrado = MESES.find((item) => Number(item.value) === Number(mes));
  return encontrado ? encontrado.label : "-";
}

export function CadastrarFeriasAntecipacaoPracaPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getValidAccessToken } = useAuth();

  const idMinuta = useMemo(() => Number(id), [id]);

  const [form, setForm] = useState({
    mat_pessoa: "",
    qtd_dias_ferias: "",
    ano_exercicio: getAnoAtual(),
    mes_previsto: getMesAtual(),
    ano_previsto: getAnoAtual(),
    dt_inicio_periodo: "",
    dt_fim_periodo: "",
    nu_requerimento_sei: "",
    dt_deferimento_sei: "",
    nu_deferimento_sei: "",
  });

  const [nomePessoa, setNomePessoa] = useState("");
  const [idPessoaEncontrada, setIdPessoaEncontrada] = useState(null);
  const [buscandoPessoa, setBuscandoPessoa] = useState(false);

  const [registros, setRegistros] = useState([]);
  const [loadingRegistros, setLoadingRegistros] = useState(false);

  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "mat_pessoa") {
      setNomePessoa("");
      setIdPessoaEncontrada(null);
    }
  }

  async function carregarRegistros() {
    try {
      setLoadingRegistros(true);

      const data = await apiFetch(
        `${API_LISTAR_FERIAS_ANTECIP_PRACA_POR_MINUTA}/${idMinuta}`,
        { method: "GET" },
        getValidAccessToken,
      );

      setRegistros(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setRegistros([]);
    } finally {
      setLoadingRegistros(false);
    }
  }

  async function buscarPessoaPorMatricula() {
    if (!form.mat_pessoa?.trim()) {
      setNomePessoa("");
      setIdPessoaEncontrada(null);
      return;
    }

    try {
      setBuscandoPessoa(true);

      const data = await apiFetch(
        `${API_BUSCAR_PESSOA_POR_MATRICULA}/${encodeURIComponent(form.mat_pessoa)}`,
        { method: "GET" },
        getValidAccessToken,
      );

      setNomePessoa(
        data?.nm_pessoa ||
          data?.nome ||
          data?.ds_pessoa ||
          data?.nome_pessoa ||
          "-",
      );

      setIdPessoaEncontrada(
        data?.id_pessoa || data?.id || data?.idPessoa || null,
      );
    } catch (error) {
      console.error(error);
      setNomePessoa("Pessoa não encontrada");
      setIdPessoaEncontrada(null);
    } finally {
      setBuscandoPessoa(false);
    }
  }

  useEffect(() => {
    carregarRegistros();
  }, [idMinuta]);

  useEffect(() => {
    const matricula = form.mat_pessoa?.trim();

    if (!matricula || matricula.length < 3) {
      setNomePessoa("");
      setIdPessoaEncontrada(null);
      return;
    }

    const timer = setTimeout(() => {
      buscarPessoaPorMatricula();
    }, 500);

    return () => clearTimeout(timer);
  }, [form.mat_pessoa]);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setErro("");
      setSucesso("");

      if (!idPessoaEncontrada) {
        setErro("Informe uma matrícula válida para localizar a pessoa.");
        return;
      }

      const payload = {
        id_pessoa: Number(idPessoaEncontrada),
        mat_pessoa: form.mat_pessoa,
        qtd_dias_ferias: Number(form.qtd_dias_ferias),
        ano_exercicio: Number(form.ano_exercicio),
        mes_previsto: Number(form.mes_previsto),
        ano_previsto: Number(form.ano_previsto),
        dt_inicio_periodo: form.dt_inicio_periodo,
        dt_fim_periodo: form.dt_fim_periodo,
        nu_requerimento_sei: form.nu_requerimento_sei || null,
        dt_deferimento_sei: form.dt_deferimento_sei || null,
        nu_deferimento_sei: form.nu_deferimento_sei || null,
        id_minuta: idMinuta,
      };

      await apiFetch(
        API_CADASTRAR_FERIAS_ANTECIP_PRACA,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        getValidAccessToken,
      );

      setSucesso("Registro cadastrado com sucesso.");

      setForm({
        mat_pessoa: "",
        qtd_dias_ferias: "",
        ano_exercicio: getAnoAtual(),
        mes_previsto: getMesAtual(),
        ano_previsto: getAnoAtual(),
        dt_inicio_periodo: "",
        dt_fim_periodo: "",
        nu_requerimento_sei: "",
        dt_deferimento_sei: "",
        nu_deferimento_sei: "",
      });

      setNomePessoa("");
      setIdPessoaEncontrada(null);

      await carregarRegistros();
    } catch (error) {
      console.error(error);
      setErro(error.message || "Erro ao salvar os dados.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Férias Antecipação - Praça"
        subtitle={`Lançamento vinculado à minuta #${idMinuta}`}
      />

      <div className="detail-stack">
        <div className="content-card">
          <div className="detail-card-header">
            <h2 className="detail-card-title">Cadastrar Dados</h2>

            <div className="detail-card-actions">
              <button
                type="button"
                className="admin-button admin-button-secondary"
                onClick={() => navigate(`/minutas/lancar-dados/${idMinuta}`)}
              >
                Voltar
              </button>
            </div>
          </div>

          {erro && <div className="error-text">{erro}</div>}
          {sucesso && <div className="success-text">{sucesso}</div>}

          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label htmlFor="mat_pessoa">Matrícula</label>
              <input
                id="mat_pessoa"
                name="mat_pessoa"
                type="text"
                value={form.mat_pessoa}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Nome</label>
              <div className="form-readonly-box">
                {buscandoPessoa
                  ? "Buscando..."
                  : nomePessoa || "Informe a matrícula"}
              </div>
            </div>

            <div className="form-row-compact">
              <div className="form-group">
                <label htmlFor="qtd_dias_ferias">Qtd. Dias</label>
                <input
                  id="qtd_dias_ferias"
                  name="qtd_dias_ferias"
                  type="number"
                  min="1"
                  value={form.qtd_dias_ferias}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="ano_exercicio">Ano Exercício</label>
                <input
                  id="ano_exercicio"
                  name="ano_exercicio"
                  type="number"
                  value={form.ano_exercicio}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="mes_previsto">Mês Previsto</label>
                <select
                  id="mes_previsto"
                  name="mes_previsto"
                  value={form.mes_previsto}
                  onChange={handleChange}
                  required
                >
                  {MESES.map((mes) => (
                    <option key={mes.value} value={mes.value}>
                      {mes.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="ano_previsto">Ano Previsto</label>
                <input
                  id="ano_previsto"
                  name="ano_previsto"
                  type="number"
                  value={form.ano_previsto}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="dt_inicio_periodo">
                  Data Início do Período
                </label>
                <input
                  id="dt_inicio_periodo"
                  name="dt_inicio_periodo"
                  type="date"
                  value={form.dt_inicio_periodo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="dt_fim_periodo">Data Fim do Período</label>
                <input
                  id="dt_fim_periodo"
                  name="dt_fim_periodo"
                  type="date"
                  value={form.dt_fim_periodo}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row-compact">
              <div className="form-group">
                <label htmlFor="nu_requerimento_sei">Nº Requerimento SEI</label>
                <input
                  id="nu_requerimento_sei"
                  name="nu_requerimento_sei"
                  type="text"
                  value={form.nu_requerimento_sei}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="dt_deferimento_sei">Dt. Deferimento SEI</label>
                <input
                  id="dt_deferimento_sei"
                  name="dt_deferimento_sei"
                  type="date"
                  value={form.dt_deferimento_sei}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="nu_deferimento_sei">Nº Deferimento SEI</label>
                <input
                  id="nu_deferimento_sei"
                  name="nu_deferimento_sei"
                  type="text"
                  value={form.nu_deferimento_sei}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="admin-button" disabled={saving}>
                {saving ? "Salvando..." : "Cadastrar"}
              </button>

              <button
                type="button"
                className="admin-button admin-button-secondary"
                onClick={() => navigate(`/minutas/lancar-dados/${idMinuta}`)}
                disabled={saving}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>

        <div className="content-card">
          <div className="detail-card-header">
            <h2 className="detail-card-title">
              Registros já cadastrados nesta minuta
            </h2>
          </div>

          {loadingRegistros ? (
            <div className="loading-text">Carregando registros...</div>
          ) : registros.length === 0 ? (
            <div className="empty-text">Nenhum registro cadastrado.</div>
          ) : (
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Matrícula</th>
                    <th>Nome</th>
                    <th>Qtd. Dias</th>
                    <th>Ano Exercício</th>
                    <th>Mês Previsto</th>
                    <th>Ano Previsto</th>
                    <th>Início</th>
                    <th>Fim</th>
                    <th>Req. SEI</th>
                    <th>Dt. Deferimento</th>
                    <th>Nº Deferimento</th>
                  </tr>
                </thead>
                <tbody>
                  {registros.map((item) => (
                    <tr
                      key={
                        item.id_ferias_antecipacao_praca ||
                        `${item.mat_pessoa}-${item.dt_inicio_periodo}`
                      }
                    >
                      <td>{item.mat_pessoa || "-"}</td>
                      <td>
                        {item.nm_pessoa ||
                          item.nome_pessoa ||
                          item.ds_pessoa ||
                          "-"}
                      </td>
                      <td>{item.qtd_dias_ferias || "-"}</td>
                      <td>{item.ano_exercicio || "-"}</td>
                      <td>{getNomeMes(item.mes_previsto)}</td>
                      <td>{item.ano_previsto || "-"}</td>
                      <td>{formatarData(item.dt_inicio_periodo)}</td>
                      <td>{formatarData(item.dt_fim_periodo)}</td>
                      <td>{item.nu_requerimento_sei || "-"}</td>
                      <td>{formatarData(item.dt_deferimento_sei)}</td>
                      <td>{item.nu_deferimento_sei || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
