import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { authClient } from "../../../lib/auth-client";
import { useUserStore } from "../../../stores/useUserStore";

const TOKEN_KEY = "focusflow:token";

export default function AuthCallback() {
  const navigate = useNavigate();
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    (async () => {
      try {
        // redirectMetadata:true puts the session token in ?token= after OAuth.
        // The jwt plugin makes this a proper signed JWT.
        const queryToken = new URLSearchParams(window.location.search).get(
          "token",
        );
        const hashToken = new URLSearchParams(
          window.location.hash.slice(1),
        ).get("token");
        const urlToken = queryToken ?? hashToken;

        if (urlToken) {
          localStorage.setItem(TOKEN_KEY, urlToken);
          await useUserStore.getState().fetch();
          if (useUserStore.getState().user) {
            navigate("/dashboard", { replace: true });
            return;
          }
        }

        // Fallback: try to get a fresh JWT via the jwt plugin endpoint
        const { data: jwtData } = await authClient.token();
        if (jwtData?.token) {
          localStorage.setItem(TOKEN_KEY, jwtData.token);
          await useUserStore.getState().fetch();
          if (useUserStore.getState().user) {
            navigate("/dashboard", { replace: true });
            return;
          }
        }

        navigate("/sign-in", { replace: true });
      } catch (err) {
        console.error("[AuthCallback]", err);
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
