import { Brain } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  heading: React.ReactNode;
  subheading?: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthLayout({
  children,
  heading,
  subheading,
  footer,
}: AuthLayoutProps) {
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
        .trust-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #94a3b8; }
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
              <Brain style={{ color: "#fff", width: "25px", height: "25px" }} />
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
          style={{ textAlign: "center", marginBottom: "20px" }}
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
            {heading}
          </h1>
          {subheading && (
            <p style={{ fontSize: "15px", color: "#64748b" }}>{subheading}</p>
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
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <p
            className="auth-footer"
            style={{ marginTop: "24px", fontSize: "14px", color: "#64748b" }}
          >
            {footer}
          </p>
        )}
      </div>
    </>
  );
}

/** Shared divider used between form and social login */
export function AuthDivider() {
  return (
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
        style={{ fontSize: "12px", color: "#94a3b8", whiteSpace: "nowrap" }}
      >
        or continue with
      </span>
      <div className="auth-divider-line" />
    </div>
  );
}

/** Shared error banner */
export function AuthErrorBanner({ message }: { message: string }) {
  return (
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
      {message}
    </div>
  );
}

/** Shared styled input — call with a focusedField string to drive focus styles */
export function authInputStyle(
  field: string,
  focusedField: string | null,
): React.CSSProperties {
  const focused = focusedField === field;
  return {
    padding: "11px 14px",
    borderRadius: "10px",
    border: focused
      ? "1.5px solid #2563eb"
      : "1.5px solid rgba(37,99,235,0.15)",
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    color: "#0f172a",
    background: focused ? "#fafcff" : "#fff",
    outline: "none",
    transition: "border-color 0.15s, background 0.15s",
    boxShadow: focused ? "0 0 0 3px rgba(37,99,235,0.08)" : "none",
  };
}
