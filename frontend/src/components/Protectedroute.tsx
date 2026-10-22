import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { tokenStore } from "../services/api";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  return tokenStore.get() ? <>{children}</> : <Navigate to="/login" replace />;
}