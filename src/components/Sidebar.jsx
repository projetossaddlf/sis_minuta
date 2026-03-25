import { NavLink } from "react-router-dom";

export function Sidebar() {
  const linkClass = ({ isActive }) =>
    `admin-nav-link ${isActive ? "active" : ""}`;

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-title">SIS Minuta v2</div>

      <nav className="admin-nav">
        <NavLink to="/dashboard" className={linkClass}>
          Dashboard
        </NavLink>

        <NavLink to="/minutas" className={linkClass}>
          Minutas
        </NavLink>

        <NavLink to="/pessoas" className={linkClass}>
          Pessoas
        </NavLink>
      </nav>
    </aside>
  );
}
