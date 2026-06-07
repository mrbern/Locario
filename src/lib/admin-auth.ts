export const ADMIN_AUTH_COOKIE_NAME = "Locario-admin-auth";

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? "";
}

export function getAdminSessionToken() {
  return process.env.ADMIN_SESSION_TOKEN ?? "";
}

export function isAdminLoginConfigured() {
  return Boolean(getAdminPassword() && getAdminSessionToken());
}
