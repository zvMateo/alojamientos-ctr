import { Navigate } from "react-router";
import { useAuthStore } from "@/zustand/auth.store";

export function RoleGuard({ children }: { children: React.ReactNode }) {
  const status = useAuthStore((s) => s.status);

  if (status !== "authenticated") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export function RoleViewGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = false;

  if (!isAuthenticated) {
    return null;
  }

  return children;
}
