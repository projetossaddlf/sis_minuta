import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../auth/useAuth";
import { apiFetch } from "../services/api";

const API_CADASTRAR_FERIAS_ANTECIP_PRACA = import.meta.env
  .VITE_API_URL_CADASTRAR_FERIAS_ANTECIP_PRACA;

function getAnoAtual() {
  return new Date().getFullYear();
}

function getMesAtual() {
  return new Date().getMonth() + 1;
}

export function CadastrarFeriasAntecipacaoPracaPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getValidAccessToken } = useAuth();

  const idMinuta = useMemo(() => Number(id), [id]);

  const [form, setForm] = useState({
    id_pessoa: "",
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

  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setErro("");
      setSucesso("");

      const payload = {
        id_pessoa: Number(form.id_pessoa),
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

      setSucesso(
        "Dados de férias antecipação - praça cadastrados com sucesso.",
      );

      setForm({
        id_pessoa: "",
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
              <label htmlFor="id_pessoa">ID Pessoa</label>
              <input
                id="id_pessoa"
                name="id_pessoa"
                type="number"
                value={form.id_pessoa}
                onChange={handleChange}
                required
              />
            </div>

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
              <label htmlFor="qtd_dias_ferias">Qtd. Dias de Férias</label>
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
              <input
                id="mes_previsto"
                name="mes_previsto"
                type="number"
                min="1"
                max="12"
                value={form.mes_previsto}
                onChange={handleChange}
                required
              />
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

            <div className="form-group">
              <label htmlFor="dt_inicio_periodo">Data Início do Período</label>
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
              <label htmlFor="dt_deferimento_sei">Data Deferimento SEI</label>
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

            <div className="form-group form-group-full">
              <label htmlFor="id_minuta">ID Minuta</label>
              <input
                id="id_minuta"
                name="id_minuta"
                type="number"
                value={idMinuta}
                disabled
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="admin-button" disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
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
      </div>
    </div>
  );
}
