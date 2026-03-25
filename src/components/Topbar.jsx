import { useAuth } from "../auth/useAuth";

export function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-title">Painel Administrativo</div>

      <div className="admin-topbar-user">
        <span className="admin-user-badge">
          {user?.email || user?.nome || "Usuário não identificado!"}
        </span>

        <button className="admin-button" onClick={logout}>
          Sair
        </button>
      </div>
    </header>
  );
}
