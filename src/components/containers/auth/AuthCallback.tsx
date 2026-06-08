import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../../../stores/useUserStore";

const REMEMBERED_USER_KEY = "focusflow:last_user";

/**
 * Landing page for Google OAuth redirect.
 *
 * better-auth appends ?token=<jwt> when redirectMetadata: true is set.
 * In dev (http) the JWT plugin may not produce the token, but the session
 * cookie is always set — browser auth relies on cookies rather than local
 * storage persistence.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    (async () => {
      try {
        // Ignore any JWT from the redirect URL in browser auth flows.
        // Authentication is validated from the HttpOnly cookie on the next fetch.

        // Execute store fetch with the freshly set token
        await useUserStore.getState().fetch();
        const user = useUserStore.getState().user;

        if (user) {
          localStorage.setItem(
            REMEMBERED_USER_KEY,
            JSON.stringify({
              email: user.email,
              name: user.name,
              image: user.image ?? null,
            }),
          );
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/sign-in", { replace: true });
        }
      } catch (err) {
        console.error("[AuthCallback] error:", err);
        navigate("/sign-in", { replace: true });
      }
    })();
  }, [navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8faff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div
        style={{
          width: "32px",
          height: "32px",
          border: "3px solid rgba(37,99,235,0.15)",
          borderTop: "3px solid #2563eb",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }}
      />
      <p
        style={{
          color: "#6b7280",
          fontSize: "13px",
          fontFamily: "DM Sans, sans-serif",
        }}
      >
        Signing you in…
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
