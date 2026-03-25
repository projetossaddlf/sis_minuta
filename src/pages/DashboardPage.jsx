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
        <SummaryCard label="Usuário autenticado" value="1" />
        <SummaryCard label="Módulos disponíveis" value="6" />
        <SummaryCard label="Status do acesso" value="OK" />
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
