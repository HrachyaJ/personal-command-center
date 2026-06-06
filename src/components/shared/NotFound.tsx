import { Brain } from "lucide-react";

export default function NotFound() {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Serif+Display:ital@0;1&display=swap"
        rel="stylesheet"
      />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatY {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-14px); }
        }
        @keyframes spin404 {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }

        .nf-badge   { animation: fadeUp 0.5s ease 0.1s both; }
        .nf-code    { animation: fadeUp 0.6s ease 0.2s both; }
        .nf-heading { animation: fadeUp 0.6s ease 0.35s both; }
        .nf-sub     { animation: fadeUp 0.6s ease 0.48s both; }
        .nf-actions { animation: fadeUp 0.6s ease 0.60s both; }
        .nf-float   { animation: floatY 5s ease-in-out infinite; }

        .btn-primary-light {
          background: #2563eb; color: #fff; border: none;
          padding: 13px 28px; border-radius: 10px;
          font-size: 15px; font-weight: 600; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          text-decoration: none; display: inline-block;
        }
        .btn-primary-light:hover {
          background: #1d4ed8; transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(37,99,235,0.35);
        }
        .btn-ghost-light {
          background: transparent; color: rgba(0,0,0,0.6);
          border: 1px solid rgba(0,0,0,0.15);
          padding: 13px 28px; border-radius: 10px;
          font-size: 15px; font-weight: 500; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.2s, color 0.2s;
          text-decoration: none; display: inline-block;
        }
        .btn-ghost-light:hover { border-color: rgba(0,0,0,0.3); color: #0f172a; }

        .nav-link-light {
          color: rgba(0,0,0,0.5); font-size: 14px;
          text-decoration: none; transition: color 0.2s;
        }
        .nav-link-light:hover { color: #0f172a; }

        .grid-bg {
          position: absolute; inset: 0; pointer-events: none; overflow: hidden;
        }
        .grid-bg svg { width: 100%; height: 100%; opacity: 0.35; }

        .cursor-ring {
          animation: spin404 12s linear infinite;
          transform-origin: center;
        }
      `}</style>

      <div
        style={{
          background: "#f8faff",
          minHeight: "100vh",
          color: "#0f172a",
          fontFamily: "'DM Sans', sans-serif",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* NAV */}
        <nav
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            padding: "0 40px",
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(248,250,255,0.92)",
            borderBottom: "1px solid rgba(37,99,235,0.08)",
            backdropFilter: "blur(12px)",
          }}
        >
          <a
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "8px",
                background: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Brain size={16} color="#fff" />
            </div>
            <span
              style={{
                fontWeight: 700,
                fontSize: "16px",
                letterSpacing: "-0.3px",
                color: "#0f172a",
              }}
            >
              FocusFlow
            </span>
          </a>

          <div style={{ display: "flex", gap: "32px" }}>
            <a href="/#features" className="nav-link-light">
              Features
            </a>
            <a href="/#testimonials" className="nav-link-light">
              Reviews
            </a>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <a
              href="/sign-in"
              className="btn-ghost-light"
              style={{ padding: "9px 20px", fontSize: "14px" }}
            >
              Sign in
            </a>
            <a
              href="/sign-up"
              className="btn-primary-light"
              style={{ padding: "9px 20px", fontSize: "14px" }}
            >
              Get started free
            </a>
          </div>
        </nav>

        {/* MAIN */}
        <main
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: "64px",
            position: "relative",
            minHeight: "100vh",
          }}
        >
          {/* Grid background */}
          <div className="grid-bg">
            <svg
              viewBox="0 0 1440 900"
              preserveAspectRatio="xMidYMid slice"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="grid"
                  width="48"
                  height="48"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 48 0 L 0 0 0 48"
                    fill="none"
                    stroke="rgba(37,99,235,0.15)"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Radial glow */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "700px",
              height: "500px",
              background:
                "radial-gradient(ellipse, rgba(37,99,235,0.07) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              padding: "0 24px",
              maxWidth: "680px",
              margin: "0 auto",
            }}
          >
            {/* Floating illustration */}
            <div className="nf-code nf-float" style={{ marginBottom: "40px" }}>
              <div style={{ position: "relative", display: "inline-block" }}>
                {/* Spinning ring */}
                <svg
                  width="160"
                  height="160"
                  viewBox="0 0 160 160"
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <circle
                    className="cursor-ring"
                    cx="80"
                    cy="80"
                    r="72"
                    fill="none"
                    stroke="rgba(37,99,235,0.12)"
                    strokeWidth="1.5"
                    strokeDasharray="8 12"
                  />
                </svg>

                {/* 404 badge */}
                <div
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "28px",
                    background:
                      "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                    border: "1.5px solid rgba(37,99,235,0.18)",
                    boxShadow:
                      "0 12px 40px rgba(37,99,235,0.12), inset 0 1px 0 rgba(255,255,255,0.8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: "2px",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#2563eb",
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                    }}
                  >
                    Error
                  </span>
                  <span
                    style={{
                      fontFamily: "'DM Serif Display', serif",
                      fontSize: "44px",
                      fontWeight: 400,
                      color: "#1e40af",
                      lineHeight: 1,
                      letterSpacing: "-2px",
                    }}
                  >
                    404
                  </span>
                </div>
              </div>
            </div>

            {/* Badge */}
            <div
              className="nf-badge"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(37,99,235,0.08)",
                border: "1px solid rgba(37,99,235,0.2)",
                borderRadius: "100px",
                padding: "6px 14px 6px 10px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#2563eb",
                  animation: "blink 1.8s ease-in-out infinite",
                }}
              />
              <span
                style={{ fontSize: "13px", fontWeight: 500, color: "#2563eb" }}
              >
                Page not found
              </span>
            </div>

            <h1
              className="nf-heading"
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "clamp(36px, 5vw, 58px)",
                fontWeight: 400,
                letterSpacing: "-1px",
                color: "#0f172a",
                lineHeight: 1.15,
                marginBottom: "20px",
              }}
            >
              Looks like you've{" "}
              <span style={{ fontStyle: "italic", color: "#2563eb" }}>
                lost focus.
              </span>
            </h1>

            <p
              className="nf-sub"
              style={{
                fontSize: "17px",
                color: "#64748b",
                lineHeight: 1.65,
                marginBottom: "40px",
                maxWidth: "460px",
              }}
            >
              The page you're looking for doesn't exist or may have been moved.
              Let's get you back on track.
            </p>

            <div
              className="nf-actions"
              style={{
                display: "flex",
                gap: "14px",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <a
                href="/"
                className="btn-primary-light"
                style={{ fontSize: "15px", padding: "13px 28px" }}
              >
                ← Back to home
              </a>
              <a
                href="/#features"
                className="btn-ghost-light"
                style={{ fontSize: "15px", padding: "13px 28px" }}
              >
                Explore features
              </a>
            </div>
          </div>
        </main>

        {/* FOOTER */}
        <footer
          style={{
            borderTop: "1px solid rgba(37,99,235,0.08)",
            padding: "32px 40px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#fff",
          }}
        >
          <span style={{ fontSize: "14px", color: "#94a3b8" }}>
            © {new Date().getFullYear()} FocusFlow
          </span>
          <div style={{ display: "flex", gap: "24px" }}>
            {["Privacy", "Terms", "Contact"].map((l) => (
              <a
                key={l}
                href="#"
                className="nav-link-light"
                style={{ fontSize: "13px" }}
              >
                {l}
              </a>
            ))}
          </div>
        </footer>
      </div>
    </>
  );
}
