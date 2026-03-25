import { useAuth } from "../auth/useAuth";
import { PageHeader } from "../components/PageHeader";
import { SummaryCard } from "../components/SummaryCard";

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral do sistema de minutas"
      />

      <div className="summary-grid">
        <SummaryCard label="Minutas em Aberto" value="01" />
        <SummaryCard label="Minutas em Assinatura" value="06" />
        <SummaryCard label="Minutas Concluídas" value="02" />
      </div>

      <div className="info-grid">
        <div className="info-card">
          <strong>Nome</strong>
          <span>{user?.name || "-"}</span>
        </div>

        <div className="info-card">
          <strong>E-mail</strong>
          <span>{user?.email || "-"}</span>
        </div>

        <div className="info-card">
          <strong>Sistema</strong>
          <span>SIS Minuta</span>
        </div>
      </div>
    </div>
  );
}
