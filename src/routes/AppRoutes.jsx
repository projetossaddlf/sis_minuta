import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../components/AppLayout";
import { DashboardPage } from "../pages/DashboardPage";
import { MinutasPage } from "../pages/MinutasPage";
import { PessoasPage } from "../pages/PessoasPage";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/minutas" element={<MinutasPage />} />
          <Route path="/pessoas" element={<PessoasPage />} />
          <Route path="/departamentos" element={<DepartamentosPage />} />
          <Route path="/quadros" element={<QuadrosPage />} />
          <Route path="/postos-graduacao" element={<PostosGraduacaoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
