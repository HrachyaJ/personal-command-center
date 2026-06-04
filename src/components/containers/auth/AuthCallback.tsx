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
        // Case 1: token passed as ?token= query param
        const urlToken = new URLSearchParams(window.location.search).get(
          "token",
        );
        console.log("[AuthCallback] URL token:", urlToken);
        if (urlToken) {
          localStorage.setItem(TOKEN_KEY, urlToken);
          useUserStore.getState().fetch();
          navigate("/dashboard", { replace: true });
          return;
        }

        // Case 2: call getSession and log everything
        console.log("[AuthCallback] Calling getSession...");
        const result = await authClient.getSession();
        console.log(
          "[AuthCallback] getSession result:",
          JSON.stringify(result, null, 2),
        );

        const session = result?.data;

        if (session?.user) {
          console.log("[AuthCallback] Got user:", session.user);
          useUserStore.setState({
            user: {
              id: session.user.id,
              name: session.user.name,
              email: session.user.email,
              image: session.user.image ?? null,
            },
            loading: false,
          });
          navigate("/dashboard", { replace: true });
        } else {
          console.warn(
            "[AuthCallback] No session/user — redirecting to sign-in. Full result:",
            result,
          );
          navigate("/sign-in", { replace: true });
        }
      } catch (err) {
        console.error("[AuthCallback] Error:", err);
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
