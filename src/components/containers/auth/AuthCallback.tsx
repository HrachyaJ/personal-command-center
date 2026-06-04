import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { authClient } from "../../../lib/auth-client";
import { useUserStore } from "../../../stores/useUserStore";

const TOKEN_KEY = "focusflow:token";

export default function AuthCallback() {
  const navigate = useNavigate();
  const fetchUser = useUserStore((s) => s.fetch);
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    (async () => {
      try {
        // Some better-auth configs pass the token as ?token= in the URL
        const urlToken = new URLSearchParams(window.location.search).get(
          "token",
        );
        if (urlToken) localStorage.setItem(TOKEN_KEY, urlToken);

        // This fetch triggers the onResponse hook in auth-client.ts,
        // which reads the `set-auth-token` header and saves it to localStorage.
        await authClient.getSession();

        // Now fetch your own /api/user with the Bearer token attached.
        await fetchUser();

        navigate("/dashboard", { replace: true });
      } catch {
        navigate("/sign-in", { replace: true });
      }
    })();
  }, [fetchUser, navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8faff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
