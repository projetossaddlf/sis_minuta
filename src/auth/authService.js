import { authConfig } from "./authConfig";

const STORAGE_KEY = "auth_tokens";
const LOGOUT_FLAG_KEY = "just_logged_out";

export function markJustLoggedOut() {
  sessionStorage.setItem(LOGOUT_FLAG_KEY, "true");
}

export function clearJustLoggedOut() {
  sessionStorage.removeItem(LOGOUT_FLAG_KEY);
}

export function hasJustLoggedOut() {
  return sessionStorage.getItem(LOGOUT_FLAG_KEY) === "true";
}

export function buildLoginUrl() {
  const { domain, clientId, redirectUri, scope } = authConfig;

  return (
    `${domain}/oauth2/authorize?` +
    `client_id=${encodeURIComponent(clientId)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scope)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}`
  );
}

export function buildLogoutUrl() {
  const { domain, clientId, logoutUri } = authConfig;

  return (
    `${domain}/logout?` +
    `client_id=${encodeURIComponent(clientId)}` +
    `&logout_uri=${encodeURIComponent(logoutUri)}`
  );
}

export function redirectToLogin() {
  clearJustLoggedOut();
  window.location.href = buildLoginUrl();
}

export function redirectToLogout() {
  markJustLoggedOut();
  window.location.replace(buildLogoutUrl());
}

export async function exchangeCodeForToken(code) {
  const { domain, clientId, redirectUri } = authConfig;

  const tokenUrl = `${domain}/oauth2/token`;

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    code,
    redirect_uri: redirectUri,
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao trocar code por token: ${errorText}`);
  }

  return response.json();
}

export async function refreshSession(refreshToken) {
  const { domain, clientId } = authConfig;

  const tokenUrl = `${domain}/oauth2/token`;

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    refresh_token: refreshToken,
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao renovar sessão: ${errorText}`);
  }

  return response.json();
}

export function saveTokens(tokens) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

export function getStoredTokens() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearStoredTokens() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getAuthorizationCodeFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("code");
}

export function clearAuthParamsFromUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete("code");
  url.searchParams.delete("state");
  url.searchParams.delete("error");
  url.searchParams.delete("error_description");
  window.history.replaceState({}, document.title, url.pathname);
}

function parseJwt(token) {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function getUserFromIdToken(idToken) {
  const payload = parseJwt(idToken);
  if (!payload) return null;

  return {
    sub: payload.sub,
    email: payload.email,
    name: payload.name || payload["cognito:username"] || payload.email,
    username: payload["cognito:username"],
    raw: payload,
  };
}

export function isTokenExpired(token, offsetSeconds = 30) {
  const payload = parseJwt(token);
  if (!payload?.exp) return true;

  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now + offsetSeconds;
}

export function hasValidAccessToken(tokens) {
  return !!tokens?.access_token && !isTokenExpired(tokens.access_token);
}
