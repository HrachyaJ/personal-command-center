import { Navigate, useLocation } from "react-router-dom";
import { useSession } from "../../lib/auth-client";

// Module-level cache — survives remounts and route transitions.
// Set to `true` once we've ever seen a valid session this page load.
let hadValidSession = false;

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending, error } = useSession();
  const location = useLocation();

  if (session) hadValidSession = true;

  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary/15 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Transient server error (5xx / network blip) — don't evict the user if we
  // know they had a valid session earlier in this page load.
  if (error && hadValidSession) {
    return <>{children}</>;
  }

  if (!session) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
