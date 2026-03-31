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

  const ativos = pessoas.filter(
    (item) => Number(item.situacao) === "DISPOSIÇÃO",
  ).length;

  const columns = [
    { key: "matr", label: "Matrícula" },
    { key: "nome", label: "Nome" },
    { key: "unid", label: "Unidade" },
    { key: "grad", label: "Posto/Graduação" },
    { key: "quadro", label: "Quadro" },
    { key: "situacao", label: "Status" },
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
