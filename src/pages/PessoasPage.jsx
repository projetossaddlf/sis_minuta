import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { SummaryCard } from "../components/SummaryCard";
import { DataTable } from "../components/DataTable";
import { useAuth } from "../auth/useAuth";
import { apiFetch } from "../services/api";

const API_LISTAR_PESSOA = import.meta.env.VITE_API_URL_LISTAR_PESSOA;

export function PessoasPage() {
  const { getValidAccessToken } = useAuth();
  const [pessoas, setPessoas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);
        setErro("");

        const data = await apiFetch(
          API_LISTAR_PESSOA,
          { method: "GET" },
          getValidAccessToken,
        );

        setPessoas(Array.isArray(data) ? data : []);
      } catch (error) {
        setErro(error.message || "Erro ao carregar pessoas");
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, [getValidAccessToken]);

  const ativos = pessoas.filter((item) => Number(item.st_pessoa) === 1).length;

  const columns = [
    { key: "id_pessoa", label: "ID" },
    { key: "mat_pessoa", label: "Matrícula" },
    { key: "nm_pessoa", label: "Nome" },
    { key: "ds_departamento", label: "Departamento" },
    { key: "ds_posto_graduacao", label: "Posto/Graduação" },
    { key: "ds_quadro", label: "Quadro" },
    {
      key: "st_pessoa",
      label: "Status",
      render: (row) => (
        <span
          className={`status-badge ${
            Number(row.st_pessoa) === 1 ? "status-active" : "status-inactive"
          }`}
        >
          {Number(row.st_pessoa) === 1 ? "Ativo" : "Inativo"}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Pessoas" subtitle="Listagem de pessoas cadastradas" />

      <div className="summary-grid">
        <SummaryCard label="Total de pessoas" value={pessoas.length} />
        <SummaryCard label="Pessoas ativas" value={ativos} />
      </div>

      {loading && <div className="loading-text">Carregando pessoas...</div>}
      {erro && <div className="error-text">{erro}</div>}

      {!loading && !erro && <DataTable columns={columns} data={pessoas} />}
    </div>
  );
}
