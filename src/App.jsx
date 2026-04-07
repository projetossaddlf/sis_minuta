import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { LoggedOutPage } from "./pages/LoggedOutPage";
import { DashboardPage } from "./pages/DashboardPage";
import { MinutasPage } from "./pages/MinutasPage";
import { PessoasPage } from "./pages/PessoasPage";
import { CadastroMinutaPage } from "./pages/CadastroMinutaPage";
import { EditarMinutaPage } from "./pages/EditarMinutaPage";
import { LancarDadosMinutaPage } from "./pages/LancarDadosMinutaPage";
import { CadastrarFeriasAntecipacaoPracaPage } from "./pages/CadastrarFeriasAntecipacaoPracaPage";
import { CadastrarFeriasAntecipacaoOficialPage } from "./pages/CadastrarFeriasAntecipacaoOficialPage";
import { CadastrarFeriasAntecipacaoCivilPage } from "./pages/CadastrarFeriasAntecipacaoCivilPage";
import { CadastrarFeriasReprogramacaoCivilPage } from "./pages/CadastrarFeriasReprogramacaoCivilPage";
import { DetalheMinutaPage } from "./pages/DetalheMinutaPage";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { useAuth } from "./auth/useAuth";
import { AppLayout } from "./components/AppLayout";

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />

      <Route path="/logged-out" element={<LoggedOutPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/minutas" element={<MinutasPage />} />
        <Route path="/minutas/nova" element={<CadastroMinutaPage />} />
        <Route path="/minutas/:id" element={<DetalheMinutaPage />} />
        <Route
          path="/minutas/buscar-minuta/:id"
          element={<DetalheMinutaPage />}
        />
        <Route path="/minutas/editar/:id" element={<EditarMinutaPage />} />
        <Route
          path="/minutas/lancar_dados/:id"
          element={<LancarDadosMinutaPage />}
        />
        <Route
          path="/minutas/:id/ferias-antecipacao-praca"
          element={<CadastrarFeriasAntecipacaoPracaPage />}
        />
        <Route
          path="/minutas/:id/ferias-antecipacao-oficial"
          element={<CadastrarFeriasAntecipacaoOficialPage />}
        />
        <Route
          path="/minutas/:id/ferias-antecipacao-civil"
          element={<CadastrarFeriasAntecipacaoCivilPage />}
        />
        <Route
          path="/minutas/:id/ferias-reprogramacao-civil"
          element={<CadastrarFeriasReprogramacaoCivilPage />}
        />
        <Route path="/pessoas" element={<PessoasPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
