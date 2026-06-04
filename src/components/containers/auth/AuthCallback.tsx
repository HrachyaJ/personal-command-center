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
        if (urlToken) {
          localStorage.setItem(TOKEN_KEY, urlToken);
          useUserStore.getState().fetch();
          navigate("/dashboard", { replace: true });
          return;
        }

        // Case 2: use the session returned by getSession() directly.
        // The `set-auth-token` header only comes on session *creation*, not reads,
        // so we populate the user store from the session payload instead.
        const { data: session } = await authClient.getSession();

        if (session?.user) {
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
          navigate("/sign-in", { replace: true });
        }
      } catch {
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
