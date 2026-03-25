import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { LoggedOutPage } from "./pages/LoggedOutPage";
import { DashboardPage } from "./pages/DashboardPage";
import { MinutasPage } from "./pages/MinutasPage";
import { PessoasPage } from "./pages/PessoasPage";
import { CadastroMinutaPage } from "./pages/CadastroMinutaPage";
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
