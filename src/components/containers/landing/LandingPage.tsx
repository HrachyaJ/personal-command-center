import { Brain } from "lucide-react";
import { useState, useEffect } from "react";
import { FEATURES, STATS, TESTIMONIALS } from "../../../lib/constants";
import {
  getCurrentYear,
  useInView,
  useScrollY,
} from "../../../hooks/dashboard";
import { GridBackground } from "./GridBackground";
import { AppPreview } from "./AppPreview";
import { FeatureCard } from "./FeatureCard";
import { authClient } from "../../../lib/auth-client";

export default function LandingPage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [LoggedIn, setLoggedIn] = useState(false);
  const scrollY = useScrollY();
  const ctaSection = useInView();
  const statsSection = useInView();
  const { data: session, isPending } = authClient.useSession();
  const isLoggedIn = !!session?.user;

  useEffect(() => {
    const id = setInterval(
      () => setActiveTestimonial((i) => (i + 1) % TESTIMONIALS.length),
      4000,
    );
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setLoggedIn(true);
    }
  }, []);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Serif+Display:ital@0;1&display=swap"
        rel="stylesheet"
      />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes float {
          0%,100% { transform: perspective(1200px) rotateY(-8deg) rotateX(4deg) translateY(0px); }
          50%      { transform: perspective(1200px) rotateY(-8deg) rotateX(4deg) translateY(-12px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dot { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        .hero-badge   { animation: fadeUp 0.6s ease 0.10s both; }
        .hero-h1      { animation: fadeUp 0.6s ease 0.25s both; }
        .hero-sub     { animation: fadeUp 0.6s ease 0.40s both; }
        .hero-cta     { animation: fadeUp 0.6s ease 0.55s both; }
        .hero-social  { animation: fadeUp 0.6s ease 0.65s both; }
        .hero-preview { animation: fadeUp 0.8s ease 0.70s both; }
        .preview-float { animation: float 6s ease-in-out infinite; }
        .nav-link-light { color: rgba(0,0,0,0.5); font-size:14px; text-decoration:none; transition:color 0.2s; }
        .nav-link-light:hover { color:#0f172a; }
        .btn-primary-light {
          background:#2563eb; color:#fff; border:none; padding:13px 28px; border-radius:10px;
          font-size:15px; font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif;
          transition:background 0.2s,transform 0.15s,box-shadow 0.2s; text-decoration:none; display:inline-block;
        }
        .btn-primary-light:hover { background:#1d4ed8; transform:translateY(-1px); box-shadow:0 8px 24px rgba(37,99,235,0.35); }
        .btn-ghost-light {
          background:transparent; color:rgba(0,0,0,0.6); border:1px solid rgba(0,0,0,0.15);
          padding:13px 28px; border-radius:10px; font-size:15px; font-weight:500; cursor:pointer;
          font-family:'DM Sans',sans-serif; transition:border-color 0.2s,color 0.2s; text-decoration:none; display:inline-block;
        }
        .btn-ghost-light:hover { border-color:rgba(0,0,0,0.3); color:#0f172a; }
        .t-dot { width:6px; height:6px; border-radius:50%; border:none; cursor:pointer; transition:background 0.2s,transform 0.2s; }
        .feature-card-hover:hover { border-color: rgba(37,99,235,0.2) !important; box-shadow: 0 8px 32px rgba(37,99,235,0.1) !important; transform: translateY(-2px); transition: all 0.2s ease; }

        /* ── Responsive ── */

        /* Nav: hide text links on mobile, shrink padding */
        @media (max-width: 640px) {
          .nav-links { display: none !important; }
          .nav-auth-full { display: none !important; }
          .nav-auth-compact { display: flex !important; }
          .nav-inner { padding: 0 20px !important; }
        }

        /* Hero: single column on mobile */
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
            text-align: center;
          }
          .hero-badge-wrap { justify-content: center; }
          .hero-sub { max-width: 100% !important; }
          .hero-cta { justify-content: center !important; }
          .hero-social { justify-content: center !important; }
          .hero-preview { display: none !important; }
          .hero-section { min-height: auto !important; padding: 100px 0 60px !important; }
          .hero-inner { padding: 0 20px !important; }
        }

        /* Stats: 2 columns on mobile */
        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 24px !important;
          }
          .stats-section { padding: 48px 20px !important; }
        }

        /* Features: 1 column on mobile */
        @media (max-width: 640px) {
          .features-grid {
            grid-template-columns: 1fr !important;
          }
          .features-section { padding: 64px 20px !important; }
        }

        /* Testimonials */
        @media (max-width: 640px) {
          .testimonials-section { padding: 64px 20px !important; }
        }

        /* CTA section */
        @media (max-width: 640px) {
          .cta-section { padding: 64px 20px !important; }
          .cta-box { padding: 40px 24px !important; }
          .cta-btn { width: 100%; text-align: center; }
        }

        /* Footer */
        @media (max-width: 640px) {
          .footer-inner {
            flex-direction: column !important;
            gap: 16px !important;
            text-align: center;
            padding: 24px 20px !important;
          }
        }
      `}</style>

      <div
        style={{
          background: "#f8faff",
          minHeight: "100vh",
          color: "#0f172a",
          fontFamily: "'DM Sans',sans-serif",
          overflowX: "hidden",
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
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: scrollY > 40 ? "rgba(248,250,255,0.92)" : "transparent",
            borderBottom:
              scrollY > 40
                ? "1px solid rgba(37,99,235,0.08)"
                : "1px solid transparent",
            backdropFilter: scrollY > 40 ? "blur(12px)" : "none",
            transition: "all 0.3s ease",
            padding: "0 40px",
          }}
          className="nav-inner"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
              <span
                style={{ color: "#fff", fontSize: "14px", fontWeight: 700 }}
              >
                <Brain className="text-primary-foreground text-sm" />
              </span>
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
          </div>

          {/* Desktop nav links */}
          <div className="nav-links" style={{ display: "flex", gap: "32px" }}>
            <a href="#features" className="nav-link-light">
              Features
            </a>
            <a href="#testimonials" className="nav-link-light">
              Reviews
            </a>
          </div>

          {/* Desktop auth buttons */}
          {isPending ? null : isLoggedIn ? (
            <div className="nav-auth-full">
              <a
                href="/dashboard"
                className="btn-primary-light"
                style={{ padding: "9px 20px", fontSize: "14px" }}
              >
                Dashboard →
              </a>
            </div>
          ) : (
            <div
              className="nav-auth-full"
              style={{ display: "flex", gap: "12px" }}
            >
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
          )}

          {/* Mobile compact auth — shown only on small screens via CSS */}
          <div
            className="nav-auth-compact"
            style={{ display: "none", gap: "8px" }}
          >
            {isLoggedIn ? (
              <a
                href="/dashboard"
                className="btn-primary-light"
                style={{ padding: "8px 14px", fontSize: "13px" }}
              >
                Dashboard →
              </a>
            ) : (
              <>
                <a
                  href="/sign-in"
                  className="btn-ghost-light"
                  style={{ padding: "8px 14px", fontSize: "13px" }}
                >
                  Sign in
                </a>
                <a
                  href="/sign-up"
                  className="btn-primary-light"
                  style={{ padding: "8px 14px", fontSize: "13px" }}
                >
                  Sign up
                </a>
              </>
            )}
          </div>
        </nav>

        {/* HERO */}
        <section
          className="hero-section"
          style={{
            position: "relative",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            paddingTop: "64px",
          }}
        >
          <GridBackground />
          <div
            style={{
              position: "absolute",
              top: "20%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "700px",
              height: "500px",
              background:
                "radial-gradient(ellipse, rgba(37,99,235,0.07) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div
            className="hero-inner"
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "0 40px",
              width: "100%",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              className="hero-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "80px",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  className="hero-badge hero-badge-wrap"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "rgba(37,99,235,0.08)",
                    border: "1px solid rgba(37,99,235,0.2)",
                    borderRadius: "100px",
                    padding: "6px 14px 6px 8px",
                    marginBottom: "28px",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#16a34a",
                      display: "block",
                      animation: "pulse-dot 2s ease infinite",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#2563eb",
                      fontWeight: 600,
                    }}
                  >
                    Now in public beta
                  </span>
                </div>

                <h1
                  className="hero-h1"
                  style={{
                    fontFamily: "'DM Serif Display',serif",
                    fontSize: "clamp(40px,5vw,60px)",
                    fontWeight: 400,
                    lineHeight: 1.1,
                    letterSpacing: "-1px",
                    marginBottom: "20px",
                    color: "#0f172a",
                  }}
                >
                  Your goals deserve
                  <br />
                  <span style={{ color: "#2563eb", fontStyle: "italic" }}>
                    better tools.
                  </span>
                </h1>

                <p
                  className="hero-sub"
                  style={{
                    fontSize: "17px",
                    color: "#64748b",
                    lineHeight: 1.65,
                    marginBottom: "36px",
                    maxWidth: "420px",
                  }}
                >
                  FocusFlow brings your tasks, habits, and goals into one calm,
                  focused workspace — so you spend less time managing and more
                  time doing.
                </p>

                <div
                  className="hero-cta"
                  style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}
                >
                  <a href="/sign-up" className="btn-primary-light">
                    Start for free →
                  </a>
                  <a href="#features" className="btn-ghost-light">
                    See how it works
                  </a>
                </div>

                <div
                  className="hero-social"
                  style={{
                    marginTop: "36px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex" }}>
                    {["#a78bfa", "#60a5fa", "#34d399", "#fb923c"].map(
                      (c, i) => (
                        <div
                          key={i}
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                            background: c,
                            border: "2px solid #f8faff",
                            marginLeft: i > 0 ? "-8px" : 0,
                          }}
                        />
                      ),
                    )}
                  </div>
                  <span style={{ fontSize: "13px", color: "#94a3b8" }}>
                    Joined by{" "}
                    <strong style={{ color: "#334155" }}>10,000+</strong>{" "}
                    focused people
                  </span>
                </div>
              </div>

              <div className="hero-preview">
                <div
                  className="preview-float"
                  style={{ maxWidth: "480px", marginLeft: "auto" }}
                >
                  <AppPreview />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section
          className="stats-section"
          style={{
            padding: "60px 40px",
            borderTop: "1px solid rgba(37,99,235,0.08)",
            borderBottom: "1px solid rgba(37,99,235,0.08)",
            background: "#fff",
          }}
        >
          <div
            ref={statsSection.ref}
            className="stats-grid"
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: "40px",
            }}
          >
            {STATS.map((s, i) => (
              <div
                key={s.label}
                style={{
                  textAlign: "center",
                  opacity: statsSection.inView ? 1 : 0,
                  transform: statsSection.inView
                    ? "translateY(0)"
                    : "translateY(20px)",
                  transition: `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`,
                }}
              >
                <div
                  style={{
                    fontFamily: "'DM Serif Display',serif",
                    fontSize: "42px",
                    letterSpacing: "-1px",
                    color: "#0f172a",
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#94a3b8",
                    marginTop: "4px",
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section
          id="features"
          className="features-section"
          style={{ padding: "100px 40px", background: "#f8faff" }}
        >
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "64px" }}>
              <p
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "2px",
                  color: "#2563eb",
                  textTransform: "uppercase",
                  marginBottom: "12px",
                }}
              >
                Everything you need
              </p>
              <h2
                style={{
                  fontFamily: "'DM Serif Display',serif",
                  fontSize: "clamp(32px,4vw,48px)",
                  fontWeight: 400,
                  letterSpacing: "-0.5px",
                  color: "#0f172a",
                }}
              >
                One place. Total clarity.
              </h2>
            </div>
            <div
              className="features-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2,1fr)",
                gap: "20px",
              }}
            >
              {FEATURES.map((f, i) => (
                <FeatureCard key={f.title} feature={f} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section
          id="testimonials"
          className="testimonials-section"
          style={{ padding: "100px 40px", background: "#fff" }}
        >
          <div
            style={{ maxWidth: "640px", margin: "0 auto", textAlign: "center" }}
          >
            <p
              style={{
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "2px",
                color: "#2563eb",
                textTransform: "uppercase",
                marginBottom: "48px",
              }}
            >
              What people say
            </p>
            <div style={{ minHeight: "140px", position: "relative" }}>
              {TESTIMONIALS.map((t, i) => (
                <div
                  key={i}
                  style={{
                    position: i === 0 ? "relative" : "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    opacity: activeTestimonial === i ? 1 : 0,
                    transform:
                      activeTestimonial === i
                        ? "translateY(0)"
                        : "translateY(10px)",
                    transition: "opacity 0.5s ease,transform 0.5s ease",
                    pointerEvents: activeTestimonial === i ? "auto" : "none",
                  }}
                >
                  <blockquote
                    style={{
                      fontFamily: "'DM Serif Display',serif",
                      fontSize: "clamp(20px,3vw,26px)",
                      fontStyle: "italic",
                      color: "#1e293b",
                      lineHeight: 1.45,
                      marginBottom: "24px",
                    }}
                  >
                    "{t.quote}"
                  </blockquote>
                  <div style={{ fontSize: "14px", color: "#94a3b8" }}>
                    <strong style={{ color: "#475569" }}>{t.name}</strong> ·{" "}
                    {t.role}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "8px",
                marginTop: "40px",
              }}
            >
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  className="t-dot"
                  onClick={() => setActiveTestimonial(i)}
                  style={{
                    background:
                      activeTestimonial === i ? "#2563eb" : "rgba(0,0,0,0.15)",
                    transform:
                      activeTestimonial === i ? "scale(1.3)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          className="cta-section"
          style={{ padding: "100px 40px", background: "#f8faff" }}
        >
          <div
            ref={ctaSection.ref}
            style={{
              maxWidth: "800px",
              margin: "0 auto",
              textAlign: "center",
              opacity: ctaSection.inView ? 1 : 0,
              transform: ctaSection.inView
                ? "translateY(0)"
                : "translateY(30px)",
              transition: "opacity 0.6s ease,transform 0.6s ease",
            }}
          >
            <div
              className="cta-box"
              style={{
                background:
                  "linear-gradient(135deg, rgba(37,99,235,0.06) 0%, rgba(37,99,235,0.02) 100%)",
                border: "1px solid rgba(37,99,235,0.15)",
                borderRadius: "24px",
                padding: "64px 48px",
                boxShadow: "0 4px 32px rgba(37,99,235,0.08)",
              }}
            >
              <h2
                style={{
                  fontFamily: "'DM Serif Display',serif",
                  fontSize: "clamp(32px,4vw,48px)",
                  fontWeight: 400,
                  color: "#0f172a",
                  letterSpacing: "-0.5px",
                  marginBottom: "16px",
                }}
              >
                Ready to get focused?
              </h2>
              <p
                style={{
                  fontSize: "16px",
                  color: "#64748b",
                  marginBottom: "36px",
                }}
              >
                Free to start. No credit card required.
              </p>
              <a
                href="/sign-up"
                className="btn-primary-light cta-btn"
                style={{ fontSize: "16px", padding: "14px 36px" }}
              >
                Create your account →
              </a>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer
          className="footer-inner"
          style={{
            borderTop: "1px solid rgba(37,99,235,0.08)",
            padding: "32px 40px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#fff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px", color: "#94a3b8" }}>
              © {getCurrentYear()} FocusFlow
            </span>
          </div>
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
