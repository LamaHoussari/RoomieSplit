import type { AppUser } from "../types/auth";

export const ADMIN_EMAIL = "admin@admin.com";
export const ADMIN_PASSWORD = "admin123";

const ADMIN_STORAGE_KEY = "rs_local_admin_session";

export function isReservedAdminEmail(email: string) {
  return email.trim().toLowerCase() === ADMIN_EMAIL;
}

export function isAdminCredentials(email: string, password: string) {
  return isReservedAdminEmail(email) && password === ADMIN_PASSWORD;
}

export function createLocalAdminUser(): AppUser {
  return {
    id: "local-admin",
    email: ADMIN_EMAIL,
    name: "Admin",
    isAdmin: true,
    authSource: "local-admin",
  };
}

export function getStoredAdminSession(): AppUser | null {
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<AppUser> | null;
    if (
      !parsed ||
      parsed.authSource !== "local-admin" ||
      parsed.email !== ADMIN_EMAIL ||
      !parsed.id
    ) {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
      return null;
    }

    return {
      id: parsed.id,
      email: parsed.email ?? ADMIN_EMAIL,
      name: parsed.name ?? "Admin",
      isAdmin: true,
      authSource: "local-admin",
    };
  } catch {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    return null;
  }
}

export function storeAdminSession(user: AppUser) {
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(user));
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_STORAGE_KEY);
}
