import { useState, useEffect } from "react";
import { signIn } from "../../../../lib/auth-client";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AuthLayout,
  AuthDivider,
  AuthErrorBanner,
  authInputStyle,
} from "./AuthLayout";
import { GoogleButton } from "./GoogleButton";
import { API_BASE } from "../../../../lib/utils";

const REMEMBERED_USER_KEY = "focusflow:last_user";

interface StoredUser {
  email: string;
  name: string;
  image?: string | null;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [rememberedEmail, setRememberedEmail] = useState<string | null>(null);
  const [fastSignInMode, setFastSignInMode] = useState(false);
  const [storedUser, setStoredUser] = useState<StoredUser | null>(null);
  const [avatarError, setAvatarError] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: Location })?.from?.pathname ?? "/dashboard";

  useEffect(() => {
    const raw = localStorage.getItem(REMEMBERED_USER_KEY);
    if (!raw) return;
    try {
      const stored: StoredUser = JSON.parse(raw);
      setRememberedEmail(stored.email);
      setEmail(stored.email);
      setStoredUser(stored);
      setFastSignInMode(true);
    } catch {
      localStorage.removeItem(REMEMBERED_USER_KEY);
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
      // Fetch profile while authenticated and cache for next visit
      try {
        const res = await fetch(`${API_BASE}/api/user`, {
          credentials: "include",
        });
        if (res.ok) {
          const user = await res.json();
          const toStore: StoredUser = {
            email,
            name: user.name,
            image: user.image ?? null,
          };
          localStorage.setItem(REMEMBERED_USER_KEY, JSON.stringify(toStore));
        }
      } catch {
        // Non-fatal — store email only as fallback
        localStorage.setItem(
          REMEMBERED_USER_KEY,
          JSON.stringify({ email, name: "", image: null }),
        );
      }
      navigate(from, { replace: true });
    }
  };

  const handleNotMe = () => {
    setRememberedEmail(null);
    setFastSignInMode(false);
    setStoredUser(null);
    setEmail("");
    setPassword("");
    localStorage.removeItem(REMEMBERED_USER_KEY);
  };

  // Display name: prefer real name from DB, fall back to email prefix
  const displayName = storedUser?.name
    ? storedUser.name.split(" ")[0]
    : rememberedEmail
      ? rememberedEmail
          .split("@")[0]
          .replace(/[._-]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
          .split(" ")[0]
      : null;

  const chipInitials = storedUser?.name
    ? getInitials(storedUser.name)
    : (displayName?.[0]?.toUpperCase() ?? "?");

  const heading = (
    <>
      <span style={{ fontFamily: "inherit" }}>Welcome back</span>
      {fastSignInMode && rememberedEmail && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "12px",
            background: "#eff6ff",
            border: "1px solid rgba(37,99,235,0.18)",
            borderRadius: "999px",
            padding: "5px 10px 5px 5px",
            maxWidth: "100%",
          }}
        >
          {/* Avatar — real image if available, initials fallback */}
          <div
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "50%",
              flexShrink: 0,
              overflow: "hidden",
              background: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "0.02em",
            }}
          >
            {storedUser?.image && !avatarError ? (
              <img
                src={storedUser.image}
                alt={displayName ?? ""}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={() => setAvatarError(true)}
              />
            ) : (
              chipInitials
            )}
          </div>

          {/* Email — nicer typography */}
          <span
            style={{
              fontSize: "13px",
              color: "#1e40af",
              fontWeight: 500,
              letterSpacing: "-0.01em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "220px",
            }}
          >
            {rememberedEmail}
          </span>

          <button
            className="not-me-btn"
            onClick={handleNotMe}
            style={{
              fontSize: "12px",
              color: "#6b7280",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0",
              fontWeight: 500,
              flexShrink: 0,
            }}
          >
            Not me
          </button>
        </div>
      )}
    </>
  );

  return (
    <AuthLayout
      heading={heading}
      footer={
        <>
          Don't have an account?{" "}
          <a href="/sign-up" className="auth-link">
            Create one free →
          </a>
        </>
      }
    >
      {error && <AuthErrorBanner message={error} />}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "20px" }}
      >
        {!fastSignInMode && (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}
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
              style={authInputStyle("email", focusedField)}
            />
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
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
            style={authInputStyle("password", focusedField)}
          />
        </div>

        <button type="submit" className="btn-primary-light" disabled={loading}>
          {loading
            ? "Signing in…"
            : fastSignInMode
              ? `Continue as ${displayName} →`
              : "Sign in →"}
        </button>
      </form>

      <AuthDivider />
      <GoogleButton />
    </AuthLayout>
  );
}
