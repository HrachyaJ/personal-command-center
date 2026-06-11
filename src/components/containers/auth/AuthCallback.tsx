import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserStore } from "../../../stores/useUserStore";

const REMEMBERED_USER_KEY = "focusflow:last_user";

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    (async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");
        console.log("[AuthCallback] token from location:", token);
        if (token) localStorage.setItem("better-auth-token", token);

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
  }, [navigate, location.search]);

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
