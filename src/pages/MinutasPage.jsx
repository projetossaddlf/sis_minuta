import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { SummaryCard } from "../components/SummaryCard";
import { DataTable } from "../components/DataTable";
import { useAuth } from "../auth/useAuth";
import { apiFetch } from "../services/api";

const API_LISTAR_MINUTA = import.meta.env.VITE_API_URL_LISTAR_MINUTA;

export function MinutasPage() {
  const { getValidAccessToken } = useAuth();
  const [minutas, setMinutas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);
        setErro("");

        const data = await apiFetch(
          API_LISTAR_MINUTA,
          { method: "GET" },
          getValidAccessToken,
        );

        setMinutas(Array.isArray(data) ? data : []);
      } catch (error) {
        setErro(error.message || "Erro ao carregar minutas");
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, [getValidAccessToken]);

  const columns = [
    { key: "id_minuta", label: "ID" },
    { key: "nu_minuta", label: "Número" },
    {
      key: "ds_departamento",
      label: "Departamento",
      render: (row) => row.ds_departamento || row.id_departamento,
    },
    { key: "tp_minuta", label: "Tipo" },
    { key: "st_minuta", label: "Status" },
    { key: "dt_abertura", label: "Abertura" },
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
          label="Status carregamento"
          value={loading ? "..." : "OK"}
        />
      </div>

      {loading && <div className="loading-text">Carregando minutas...</div>}
      {erro && <div className="error-text">{erro}</div>}

      {!loading && !erro && <DataTable columns={columns} data={minutas} />}
    </div>
  );
}
