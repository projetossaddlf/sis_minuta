import { useAuth } from "../auth/useAuth";

export function LoginPage() {
  const { login, loading, authError } = useAuth();

  return (
    <div style={{ padding: 24, fontFamily: "Arial" }}>
      <h1>SIS Minuta</h1>
      <p>Faça login para continuar.</p>

      <button onClick={login} disabled={loading}>
        Autenticar-se
      </button>

      {authError && <p style={{ color: "red" }}>{authError}</p>}
    </div>
  );
}
