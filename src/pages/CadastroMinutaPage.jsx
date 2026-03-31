import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../auth/useAuth";
import { apiFetch } from "../services/api";

const API_LISTAR_UNIDADES = import.meta.env.VITE_API_URL_LISTAR_UNIDADES;
const API_CADASTRAR_MINUTA = import.meta.env.VITE_API_URL_CADASTRAR_MINUTA;

function hojeInputDate() {
  const dt = new Date();
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function toDateTimeString(dateValue) {
  if (!dateValue) return null;
  return `${dateValue} 00:00:00`;
}

export function CadastroMinutaPage() {
  const navigate = useNavigate();
  const { getValidAccessToken } = useAuth();

  const [unidades, setUnidades] = useState([]);
  const [loadingCombos, setLoadingCombos] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");

  const [form, setForm] = useState({
    nu_minuta: "",
    id_unidade: "",
    tp_minuta: "0",
    st_minuta: "0",
    dt_abertura: hojeInputDate(),
    dt_conclusao: "",
  });

  useEffect(() => {
    async function carregarCombos() {
      try {
        setLoadingCombos(true);
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
        setLoadingCombos(false);
      }
    }

    carregarCombos();
  }, [getValidAccessToken]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.nu_minuta.trim()) {
      alert("Informe o número da minuta.");
      return;
    }

    if (!form.id_unidade) {
      alert("Selecione a unidade.");
      return;
    }

    if (!form.dt_abertura) {
      alert("Informe a data de abertura.");
      return;
    }

    try {
      setSaving(true);
      setErro("");

      const payload = {
        nu_minuta: form.nu_minuta.trim(),
        id_unidade: Number(form.id_unidade),
        tp_minuta: Number(form.tp_minuta),
        st_minuta: Number(form.st_minuta),
        dt_abertura: toDateTimeString(form.dt_abertura),
        dt_conclusao: form.dt_conclusao
          ? toDateTimeString(form.dt_conclusao)
          : null,
      };

      await apiFetch(
        API_CADASTRAR_MINUTA,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        getValidAccessToken,
      );

      alert("Minuta cadastrada com sucesso.");
      navigate("/minutas");
    } catch (error) {
      console.error(error);
      setErro(error.message || "Erro ao cadastrar minuta");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Nova Minuta"
        subtitle="Cadastro de nova minuta no sistema"
      />

      <div className="content-card">
        {loadingCombos && (
          <div className="loading-text">Carregando dados do formulário...</div>
        )}

        {erro && <div className="error-text">{erro}</div>}

        {!loadingCombos && (
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label htmlFor="nu_minuta">Número da minuta</label>
              <input
                id="nu_minuta"
                name="nu_minuta"
                type="text"
                value={form.nu_minuta}
                onChange={handleChange}
                placeholder="Ex: 001/2026"
              />
            </div>

            <div className="form-group">
              <label htmlFor="id_unidade">Unidade</label>
              <select
                id="id_unidade"
                name="id_unidade"
                value={form.id_unidade}
                onChange={handleChange}
              >
                <option value="">Selecione</option>
                {unidades.map((item) => (
                  <option key={item.id_unidade} value={item.id_unidade}>
                    {item.sg_unidade}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="tp_minuta">Tipo</label>
              <select
                id="tp_minuta"
                name="tp_minuta"
                value={form.tp_minuta}
                onChange={handleChange}
              >
                <option value="0">BCG</option>
                <option value="1">BRCG</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="st_minuta">Status</label>
              <select
                id="st_minuta"
                name="st_minuta"
                value={form.st_minuta}
                onChange={handleChange}
              >
                <option value="0">Aberta</option>
                <option value="1">Em Assinatura</option>
                <option value="2">Concluída</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dt_abertura">Data de abertura</label>
              <input
                id="dt_abertura"
                name="dt_abertura"
                type="date"
                value={form.dt_abertura}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="dt_conclusao">Data de conclusão</label>
              <input
                id="dt_conclusao"
                name="dt_conclusao"
                type="date"
                value={form.dt_conclusao}
                onChange={handleChange}
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="admin-button admin-button-secondary"
                onClick={() => navigate("/minutas")}
              >
                Voltar
              </button>

              <button type="submit" className="admin-button" disabled={saving}>
                {saving ? "Salvando..." : "Salvar Minuta"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
