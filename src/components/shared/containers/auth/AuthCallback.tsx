import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../../../../lib/auth-client";

export default function AuthCallback() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isPending) {
      navigate(session ? "/dashboard" : "/sign-in", { replace: true });
    }
  }, [session, isPending, navigate]);

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
