import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import "../styles/admin.css";

export function AppLayout() {
  return (
    <div className="admin-layout">
      <Sidebar />

      <div className="admin-content">
        <Topbar />

        <main className="admin-page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
