import * as React from "react";
import { Navigate, useLocation } from "react-router";

/**
 * Fake auth so the template runs with no backend: any email and password signs you in, and the
 * session lives in localStorage. Swap signIn / signUp / signOut for your provider (Clerk, Auth.js,
 * Supabase, your own API) and keep the rest of the app as is.
 */
export interface User {
  name: string;
  email: string;
}

interface AuthContextValue {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const STORAGE_KEY = "acme-admin-session";
const AuthContext = React.createContext<AuthContextValue | null>(null);

function readSession(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function nameFromEmail(email: string) {
  const local = email.split("@")[0] ?? "";
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(readSession);

  const save = React.useCallback((next: User | null) => {
    try {
      if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Private mode or blocked storage: the session just won't survive a reload.
    }
    setUser(next);
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      signIn: async (email) => save({ name: nameFromEmail(email), email }),
      signUp: async (name, email) => save({ name, email }),
      signOut: () => save(null),
    }),
    [user, save],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

/** Sends signed-out visitors to /login, then back to where they were going. */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}
