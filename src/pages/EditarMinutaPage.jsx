import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../auth/useAuth";
import { apiFetch } from "../services/api";

const API_LISTAR_DEPARTAMENTO = import.meta.env
  .VITE_API_URL_LISTAR_DEPARTAMENTO;
const API_BUSCAR_MINUTA = import.meta.env.VITE_API_URL_BUSCAR_MINUTA;
const API_ATUALIZAR_MINUTA = import.meta.env.VITE_API_URL_ATUALIZAR_MINUTA;

function formatDateForInput(dateValue) {
  if (!dateValue) return "";

  const dt = new Date(dateValue);
  if (Number.isNaN(dt.getTime())) return "";

  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

function toDateTimeString(dateValue) {
  if (!dateValue) return null;
  return `${dateValue} 00:00:00`;
}

export function EditarMinutaPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getValidAccessToken } = useAuth();

  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");

  const [form, setForm] = useState({
    nu_minuta: "",
    id_departamento: "",
    tp_minuta: "0",
    st_minuta: "0",
    dt_abertura: "",
    dt_conclusao: "",
  });

  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true);
        setErro("");

        const [departamentosData, minutaData] = await Promise.all([
          apiFetch(
            API_LISTAR_DEPARTAMENTO,
            { method: "GET" },
            getValidAccessToken,
          ),
          apiFetch(
            `${API_BUSCAR_MINUTA}/${id}`,
            { method: "GET" },
            getValidAccessToken,
          ),
        ]);

        setDepartamentos(
          Array.isArray(departamentosData) ? departamentosData : [],
        );

        setForm({
          nu_minuta: minutaData?.nu_minuta || "",
          id_departamento: minutaData?.id_departamento
            ? String(minutaData.id_departamento)
            : "",
          tp_minuta:
            minutaData?.tp_minuta !== undefined &&
            minutaData?.tp_minuta !== null
              ? String(minutaData.tp_minuta)
              : "0",
          st_minuta:
            minutaData?.st_minuta !== undefined &&
            minutaData?.st_minuta !== null
              ? String(minutaData.st_minuta)
              : "0",
          dt_abertura: formatDateForInput(minutaData?.dt_abertura),
          dt_conclusao: formatDateForInput(minutaData?.dt_conclusao),
        });
      } catch (error) {
        console.error(error);
        setErro(error.message || "Erro ao carregar dados da minuta");
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [id, getValidAccessToken]);

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

    if (!form.id_departamento) {
      alert("Selecione o departamento.");
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
        id_departamento: Number(form.id_departamento),
        tp_minuta: Number(form.tp_minuta),
        st_minuta: Number(form.st_minuta),
        dt_abertura: toDateTimeString(form.dt_abertura),
        dt_conclusao: form.dt_conclusao
          ? toDateTimeString(form.dt_conclusao)
          : null,
      };

      await apiFetch(
        `${API_ATUALIZAR_MINUTA}/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        },
        getValidAccessToken,
      );

      alert("Minuta atualizada com sucesso.");
      navigate("/minutas");
    } catch (error) {
      console.error(error);
      setErro(error.message || "Erro ao atualizar minuta");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Editar Minuta"
        subtitle={`Alteração da minuta #${id}`}
      />

      <div className="content-card">
        {loading && (
          <div className="loading-text">Carregando dados da minuta...</div>
        )}
        {erro && <div className="error-text">{erro}</div>}

        {!loading && (
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label htmlFor="nu_minuta">Número da minuta</label>
              <input
                id="nu_minuta"
                name="nu_minuta"
                type="text"
                value={form.nu_minuta}
                onChange={handleChange}
                placeholder="Ex: MIN-001"
              />
            </div>

            <div className="form-group">
              <label htmlFor="id_departamento">Departamento</label>
              <select
                id="id_departamento"
                name="id_departamento"
                value={form.id_departamento}
                onChange={handleChange}
              >
                <option value="">Selecione</option>
                {departamentos.map((item) => (
                  <option
                    key={item.id_departamento}
                    value={item.id_departamento}
                  >
                    {item.ds_departamento}
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
                <option value="1">Restrita</option>
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
                {saving ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
