import { Brain } from "lucide-react";
import { useState, useEffect } from "react";
import { authClient, signIn } from "../../../../lib/auth-client";
import { useLocation, useNavigate } from "react-router-dom";

const REMEMBERED_EMAIL_KEY = "focusflow:last_email";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [rememberedEmail, setRememberedEmail] = useState<string | null>(null);
  const [fastSignInMode, setFastSignInMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: Location })?.from?.pathname ?? "/dashboard";

  // Load remembered email on mount
  useEffect(() => {
    const saved = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    if (saved) {
      setRememberedEmail(saved);
      setEmail(saved);
      setFastSignInMode(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signIn.email({ email, password });

    if (error) {
      setError(error.message ?? "Something went wrong. Please try again.");
      setLoading(false);
    } else {
      localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
      navigate(from, { replace: true });
    }
  };

  const handleNotMe = () => {
    setRememberedEmail(null);
    setFastSignInMode(false);
    setEmail("");
    setPassword("");
    localStorage.removeItem(REMEMBERED_EMAIL_KEY);
  };

  // Derive a display name from the email (part before @)
  const displayName = rememberedEmail
    ? rememberedEmail
        .split("@")[0]
        .replace(/[._-]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : null;

  const VERCEL_ORIGIN = "https://focus-flow-site.vercel.app";

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Serif+Display:ital@0;1&display=swap"
        rel="stylesheet"
      />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .auth-logo    { animation: fadeUp 0.5s ease 0.05s both; }
        .auth-heading { animation: fadeUp 0.5s ease 0.15s both; }
        .auth-card    { animation: fadeUp 0.5s ease 0.25s both; }
        .auth-footer  { animation: fadeUp 0.5s ease 0.35s both; }
        .btn-primary-light {
          background: #2563eb; color: #fff; border: none; padding: 13px 28px;
          border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          width: 100%;
        }
        .btn-primary-light:hover:not(:disabled) { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(37,99,235,0.35); }
        .btn-primary-light:disabled { opacity: 0.6; cursor: not-allowed; }
        .auth-link { color: #2563eb; text-decoration: none; font-weight: 500; transition: color 0.15s; }
        .auth-link:hover { color: #1d4ed8; }
        .auth-divider-line { flex: 1; height: 1px; background: rgba(37,99,235,0.1); }
        .not-me-btn {
          background: none; border: none; padding: 0; font-family: 'DM Sans', sans-serif;
          font-size: 12px; color: #94a3b8; cursor: pointer; transition: color 0.15s;
          text-decoration: underline; text-underline-offset: 2px;
        }
        .not-me-btn:hover { color: #64748b; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fast-signin-chip { animation: fadeIn 0.3s ease both; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "#f8faff",
          fontFamily: "'DM Sans', sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid background */}
        <div
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          aria-hidden
        >
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid"
                width="60"
                height="60"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 60 0 L 0 0 0 60"
                  fill="none"
                  stroke="rgba(37,99,235,0.07)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Logo */}
        <div
          className="auth-logo"
          style={{ marginBottom: "32px", textAlign: "center" }}
        >
          <a
            href="/"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                background: "#2563eb",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Brain style={{ color: "#fff", width: "18px", height: "18px" }} />
            </div>
            <span
              style={{ fontSize: "20px", fontWeight: 600, color: "#0f172a" }}
            >
              FocusFlow
            </span>
          </a>
        </div>

        {/* Heading */}
        <div
          className="auth-heading"
          style={{ textAlign: "center", marginBottom: "32px" }}
        >
          <h1
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "clamp(28px, 4vw, 36px)",
              fontWeight: 400,
              color: "#0f172a",
              letterSpacing: "-0.5px",
              marginBottom: "8px",
            }}
          >
            {fastSignInMode ? `Welcome back` : "Welcome back"}
          </h1>

          {/* Fast sign-in chip */}
          {fastSignInMode && rememberedEmail ? (
            <div
              className="fast-signin-chip"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "6px",
                background: "#eff6ff",
                border: "1px solid rgba(37,99,235,0.15)",
                borderRadius: "999px",
                padding: "5px 12px 5px 8px",
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  background: "#2563eb",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  color: "#fff",
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {displayName?.[0] ?? "?"}
              </div>
              <span
                style={{ fontSize: "13px", color: "#374151", fontWeight: 500 }}
              >
                {rememberedEmail}
              </span>
              <button className="not-me-btn" onClick={handleNotMe}>
                Not me
              </button>
            </div>
          ) : (
            <p style={{ fontSize: "15px", color: "#64748b" }}>
              Sign in to continue your focus journey.
            </p>
          )}
        </div>

        {/* Card */}
        <div
          className="auth-card"
          style={{
            width: "100%",
            maxWidth: "420px",
            background: "#ffffff",
            border: "1px solid rgba(37,99,235,0.12)",
            borderRadius: "20px",
            padding: "36px",
            boxShadow:
              "0 4px 32px rgba(37,99,235,0.08), 0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          {/* Error banner */}
          {error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "10px",
                padding: "12px 14px",
                marginBottom: "20px",
                fontSize: "13px",
                color: "#dc2626",
              }}
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {/* Email — hidden in fast sign-in mode, still submitted */}
            {!fastSignInMode && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <label
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#374151",
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="you@example.com"
                  required
                  style={{
                    padding: "11px 14px",
                    borderRadius: "10px",
                    border:
                      focusedField === "email"
                        ? "1.5px solid #2563eb"
                        : "1.5px solid rgba(37,99,235,0.15)",
                    fontSize: "14px",
                    fontFamily: "'DM Sans', sans-serif",
                    color: "#0f172a",
                    background: focusedField === "email" ? "#fafcff" : "#fff",
                    outline: "none",
                    transition: "border-color 0.15s, background 0.15s",
                    boxShadow:
                      focusedField === "email"
                        ? "0 0 0 3px rgba(37,99,235,0.08)"
                        : "none",
                  }}
                />
              </div>
            )}

            {/* Password */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <label
                style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                placeholder="••••••••"
                required
                autoFocus={fastSignInMode}
                style={{
                  padding: "11px 14px",
                  borderRadius: "10px",
                  border:
                    focusedField === "password"
                      ? "1.5px solid #2563eb"
                      : "1.5px solid rgba(37,99,235,0.15)",
                  fontSize: "14px",
                  fontFamily: "'DM Sans', sans-serif",
                  color: "#0f172a",
                  background: focusedField === "password" ? "#fafcff" : "#fff",
                  outline: "none",
                  transition: "border-color 0.15s, background 0.15s",
                  boxShadow:
                    focusedField === "password"
                      ? "0 0 0 3px rgba(37,99,235,0.08)"
                      : "none",
                }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary-light"
              disabled={loading}
            >
              {loading
                ? "Signing in…"
                : fastSignInMode
                  ? `Continue as ${displayName} →`
                  : "Sign in →"}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              margin: "24px 0",
            }}
          >
            <div className="auth-divider-line" />
            <span
              style={{
                fontSize: "12px",
                color: "#94a3b8",
                whiteSpace: "nowrap",
              }}
            >
              or continue with
            </span>
            <div className="auth-divider-line" />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={() =>
              authClient.signIn.social({
                provider: "google",
                callbackURL: `${VERCEL_ORIGIN}/dashboard`,
              })
            }
            style={{
              width: "100%",
              padding: "11px",
              borderRadius: "10px",
              border: "1.5px solid rgba(37,99,235,0.15)",
              background: "#fff",
              fontSize: "14px",
              fontWeight: 500,
              color: "#374151",
              fontFamily: "'DM Sans', sans-serif",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              transition: "border-color 0.15s, background 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "rgba(37,99,235,0.35)";
              (e.currentTarget as HTMLButtonElement).style.background =
                "#f8faff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "rgba(37,99,235,0.15)";
              (e.currentTarget as HTMLButtonElement).style.background = "#fff";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Footer */}
        <p
          className="auth-footer"
          style={{ marginTop: "24px", fontSize: "14px", color: "#64748b" }}
        >
          Don't have an account?{" "}
          <a href="/sign-up" className="auth-link">
            Create one free →
          </a>
        </p>
      </div>
    </>
  );
}
