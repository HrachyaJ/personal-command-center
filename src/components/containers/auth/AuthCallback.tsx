import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * No longer part of the active auth flow. Google OAuth now redirects
 * straight to /dashboard via callbackURL on signIn.social, with the
 * session cookie already set by Better Auth — there's no token to catch
 * here anymore. This stub only exists so any stale bookmarks or cached
 * redirects to /auth/callback/google land somewhere sane instead of
 * 404ing. Safe to delete this route entirely once you've confirmed
 * nothing still links here.
 */
export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/dashboard", { replace: true });
  }, [navigate]);

  return null;
}
