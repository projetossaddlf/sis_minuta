/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../auth/useAuth";
import { apiFetch } from "../services/api";

const API_CADASTRAR_ABONO_CIVIL = import.meta.env
  .VITE_API_URL_CADASTRAR_ABONO_CIVIL;

const API_BUSCAR_PESSOA_POR_MATRICULA = import.meta.env
  .VITE_API_URL_BUSCAR_PESSOA_POR_MATRICULA;

const API_LISTAR_ABONO_CIVIL_POR_MINUTA = import.meta.env
  .VITE_API_URL_LISTAR_ABONO_CIVIL_POR_MINUTA;

const API_ATUALIZAR_ABONO_CIVIL = import.meta.env
  .VITE_API_URL_ATUALIZAR_ABONO_CIVIL;

const API_EXCLUIR_ABONO_CIVIL = import.meta.env
  .VITE_API_URL_EXCLUIR_ABONO_CIVIL;

function getAnoAtual() {
  return new Date().getFullYear();
}

function getFormInicial() {
  return {
    matr: "",
    qtd_dias_abono: "",
    ano_exercicio: getAnoAtual(),
    dt_inicio_periodo: "",
    dt_fim_periodo: "",
    nu_requerimento_sei: "",
    dt_deferimento_sei: "",
    nu_deferimento_sei: "",
  };
}

function formatarData(data) {
  if (!data) return "-";
  const valor = String(data).slice(0, 10);
  const partes = valor.split("-");
  if (partes.length !== 3) return valor;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
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

export function CadastrarAbonoCivilPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getValidAccessToken } = useAuth();

  const idMinuta = useMemo(() => Number(id), [id]);

  const [nuMinuta, setNuMinuta] = useState("");
  const [form, setForm] = useState(getFormInicial());
  const [nomePessoa, setNomePessoa] = useState("");
  const [idPessoaEncontrada, setIdPessoaEncontrada] = useState(null);
  const [buscandoPessoa, setBuscandoPessoa] = useState(false);

  const [registros, setRegistros] = useState([]);
  const [loadingRegistros, setLoadingRegistros] = useState(false);

  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [idRegistroEdicao, setIdRegistroEdicao] = useState(null);

  function limparFormulario() {
    setForm(getFormInicial());
    setNomePessoa("");
    setIdPessoaEncontrada(null);
    setIdRegistroEdicao(null);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => {
      const novoForm = { ...prev, [name]: value };

      if (name === "matr") {
        setNomePessoa("");
        setIdPessoaEncontrada(null);
      }

      return novoForm;
    });
  }

  async function carregarRegistros() {
    try {
      setLoadingRegistros(true);

      const data = await apiFetch(
        `${API_LISTAR_ABONO_CIVIL_POR_MINUTA}/${idMinuta}`,
        { method: "GET" },
        getValidAccessToken,
      );

      const minuta = data?.minuta || null;
      const lista = Array.isArray(data?.registros) ? data.registros : [];

      setNuMinuta(minuta?.nu_minuta || "");
      setRegistros(lista);
    } catch (error) {
      console.error(error);
      setNuMinuta("");
      setRegistros([]);
    } finally {
      setLoadingRegistros(false);
    }
  }

  async function buscarPessoaPorMatricula() {
    const matricula = form.matr?.trim();

    if (!matricula) {
      setNomePessoa("");
      setIdPessoaEncontrada(null);
      return;
    }

    try {
      setBuscandoPessoa(true);

      const url = `${API_BUSCAR_PESSOA_POR_MATRICULA}/${encodeURIComponent(matricula)}`;
      const data = await apiFetch(url, { method: "GET" }, getValidAccessToken);

      const nomeMontado = [data?.grad, data?.quadro, data?.nome]
        .filter(Boolean)
        .join(" ")
        .trim();

      setNomePessoa(nomeMontado || "Pessoa não encontrada");
      setIdPessoaEncontrada(data?.id || null);
    } catch (error) {
      console.error("Erro ao buscar pessoa:", error);
      setNomePessoa("Pessoa não encontrada");
      setIdPessoaEncontrada(null);
    } finally {
      setBuscandoPessoa(false);
    }
  }

  function handleEditarRegistro(item) {
    setErro("");
    setSucesso("");

    setIdRegistroEdicao(item.id_abono_civil || null);

    setForm({
      matr: item.matr || "",
      qtd_dias_abono: item.qtd_dias_abono || "",
      ano_exercicio: item.ano_exercicio || getAnoAtual(),
      dt_inicio_periodo: String(item.dt_inicio_periodo || "").slice(0, 10),
      dt_fim_periodo: String(item.dt_fim_periodo || "").slice(0, 10),
      nu_requerimento_sei: item.nu_requerimento_sei || "",
      dt_deferimento_sei: String(item.dt_deferimento_sei || "").slice(0, 10),
      nu_deferimento_sei: item.nu_deferimento_sei || "",
    });

    setNomePessoa(montarNomePessoa(item));
    setIdPessoaEncontrada(item.id || null);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleExcluirRegistro(item) {
    const idRegistro = item.id_abono_civil;

    if (!idRegistro) {
      setErro("Não foi possível identificar o registro para exclusão.");
      return;
    }

    const confirmou = window.confirm("Deseja realmente excluir este registro?");
    if (!confirmou) return;

    try {
      setErro("");
      setSucesso("");

      await apiFetch(
        `${API_EXCLUIR_ABONO_CIVIL}/${idRegistro}`,
        { method: "DELETE" },
        getValidAccessToken,
      );

      if (idRegistroEdicao === idRegistro) {
        limparFormulario();
      }

      setSucesso("Registro excluído com sucesso.");
      await carregarRegistros();
    } catch (error) {
      console.error(error);
      setErro(error.message || "Erro ao excluir o registro.");
    }
  }

  useEffect(() => {
    carregarRegistros();
  }, [idMinuta]);

  useEffect(() => {
    const matricula = form.matr?.trim();

    if (!matricula || matricula.length < 3) {
      setNomePessoa("");
      setIdPessoaEncontrada(null);
      return;
    }

    const timer = setTimeout(() => {
      buscarPessoaPorMatricula();
    }, 500);

    return () => clearTimeout(timer);
  }, [form.matr]);

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

      if (
        form.dt_inicio_periodo &&
        form.dt_fim_periodo &&
        form.dt_fim_periodo < form.dt_inicio_periodo
      ) {
        setErro(
          "A data fim do período não pode ser menor que a data início do período.",
        );
        return;
      }

      const payload = {
        id: idPessoaEncontrada,
        matr: form.matr,
        qtd_dias_abono: Number(form.qtd_dias_abono),
        ano_exercicio: Number(form.ano_exercicio),
        dt_inicio_periodo: form.dt_inicio_periodo,
        dt_fim_periodo: form.dt_fim_periodo,
        nu_requerimento_sei: form.nu_requerimento_sei || null,
        dt_deferimento_sei: form.dt_deferimento_sei || null,
        nu_deferimento_sei: form.nu_deferimento_sei || null,
        id_minuta: idMinuta,
      };

      if (idRegistroEdicao) {
        await apiFetch(
          `${API_ATUALIZAR_ABONO_CIVIL}/${idRegistroEdicao}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          },
          getValidAccessToken,
        );

        setSucesso("Registro atualizado com sucesso.");
      } else {
        await apiFetch(
          API_CADASTRAR_ABONO_CIVIL,
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
          getValidAccessToken,
        );

        setSucesso("Registro cadastrado com sucesso.");
      }

      limparFormulario();
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
        title="Abono de Ponto Anual - Funcionário Civil"
        subtitle={`Lançamento vinculado à minuta ${nuMinuta || `#${idMinuta}`}`}
      />

      <div className="detail-stack">
        <div className="content-card">
          <div className="detail-card-header">
            <h2 className="detail-card-title">
              {idRegistroEdicao ? "Editar Dados" : "Cadastrar Dados"}
            </h2>

            <div className="detail-card-actions">
              <button
                type="button"
                className="admin-button admin-button-secondary"
                onClick={() => navigate(`/minutas/lancar_dados/${idMinuta}`)}
              >
                Voltar
              </button>
            </div>
          </div>

          {erro && <div className="error-text">{erro}</div>}
          {sucesso && <div className="success-text">{sucesso}</div>}

          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="matr">Matrícula</label>
                <input
                  id="matr"
                  name="matr"
                  type="text"
                  value={form.matr}
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
            </div>

            <div className="form-row-compact">
              <div className="form-group">
                <label htmlFor="qtd_dias_abono">Qtd. Dias</label>
                <input
                  id="qtd_dias_abono"
                  name="qtd_dias_abono"
                  type="number"
                  min="1"
                  value={form.qtd_dias_abono}
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
                {saving
                  ? "Salvando..."
                  : idRegistroEdicao
                    ? "Salvar alteração"
                    : "Cadastrar"}
              </button>

              {idRegistroEdicao && (
                <button
                  type="button"
                  className="admin-button admin-button-secondary"
                  onClick={limparFormulario}
                  disabled={saving}
                >
                  Cancelar edição
                </button>
              )}

              <button
                type="button"
                className="admin-button admin-button-secondary"
                onClick={() => navigate(`/minutas/lancar_dados/${idMinuta}`)}
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
                    <th>Início</th>
                    <th>Fim</th>
                    <th>Req. SEI</th>
                    <th>Dt. Deferimento</th>
                    <th>Nº Deferimento</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {registros.map((item) => (
                    <tr
                      key={
                        item.id_abono_civil ||
                        `${item.matr}-${item.dt_inicio_periodo}`
                      }
                    >
                      <td>{item.matr || "-"}</td>
                      <td>{montarNomePessoa(item)}</td>
                      <td>{item.qtd_dias_abono || "-"}</td>
                      <td>{item.ano_exercicio || "-"}</td>
                      <td>{formatarData(item.dt_inicio_periodo)}</td>
                      <td>{formatarData(item.dt_fim_periodo)}</td>
                      <td>{item.nu_requerimento_sei || "-"}</td>
                      <td>{formatarData(item.dt_deferimento_sei)}</td>
                      <td>{item.nu_deferimento_sei || "-"}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="icon-action-button"
                            title="Editar"
                            onClick={() => handleEditarRegistro(item)}
                          >
                            ✏️
                          </button>

                          <button
                            type="button"
                            className="icon-action-button danger"
                            title="Excluir"
                            onClick={() => handleExcluirRegistro(item)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
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
