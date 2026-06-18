import { Navigate, useLocation } from "react-router-dom";
import { useAccess } from "@/contexts/AccessContext";
import { canAccessPath, firstAllowedPath } from "@/lib/accessControl";

export function AccessRoute({ children }: { children: React.ReactElement }) {
  const location = useLocation();
  const { session } = useAccess();

  if (!canAccessPath(session, location.pathname)) {
    return <Navigate to={firstAllowedPath(session)} replace />;
  }

  return children;
}
