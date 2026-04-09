import { useEffect, useState } from "react";
//import { useAuth } from "../auth/useAuth";
import { PageHeader } from "../components/PageHeader";
import { SummaryCard } from "../components/SummaryCard";
import { apiFetch } from "../services/api";

const API_QTD_MINUTAS_STATUS = import.meta.env.VITE_API_URL_QTD_MINUTAS_STATUS;

export function DashboardPage() {
  //const { user } = useAuth();

  const [resumo, setResumo] = useState({
    qtd_abertas: 0,
    qtd_em_assinatura: 0,
    qtd_concluidas: 0,
  });
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarResumo() {
      try {
        setLoading(true);
        setErro("");

        const data = await apiFetch(API_QTD_MINUTAS_STATUS);

        setResumo({
          qtd_abertas: data?.qtd_abertas ?? 0,
          qtd_em_assinatura: data?.qtd_em_assinatura ?? 0,
          qtd_concluidas: data?.qtd_concluidas ?? 0,
        });
      } catch (error) {
        console.error("Erro ao carregar resumo do dashboard:", error);
        setErro("Não foi possível carregar os indicadores do dashboard.");
      } finally {
        setLoading(false);
      }
    }

    carregarResumo();
  }, []);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral do sistema de minutas"
      />

      {erro ? (
        <p style={{ color: "red", marginBottom: "16px" }}>{erro}</p>
      ) : null}

      <div className="summary-grid">
        <SummaryCard
          label="Minutas em Aberto"
          value={loading ? "..." : String(resumo.qtd_abertas).padStart(2, "0")}
        />
        <SummaryCard
          label="Minutas em Assinatura"
          value={
            loading ? "..." : String(resumo.qtd_em_assinatura).padStart(2, "0")
          }
        />
        <SummaryCard
          label="Minutas Concluídas"
          value={
            loading ? "..." : String(resumo.qtd_concluidas).padStart(2, "0")
          }
        />
      </div>
    </div>
  );
}
