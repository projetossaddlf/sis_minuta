import { getStoredTokens } from "../auth/authService";

// eslint-disable-next-line no-unused-vars
export async function apiFetch(url, options = {}, getValidAccessToken) {
  const tokens = getStoredTokens();
  const token = tokens?.id_token;

  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "Content-Type": "application/json",
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Erro API ${response.status}: ${text}`);
  }

  return response.json();
}
