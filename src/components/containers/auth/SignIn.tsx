import { useState, useEffect } from "react";
import { signIn } from "../../../lib/auth-client";
import { useLocation, useNavigate } from "react-router";
import {
  AuthLayout,
  AuthDivider,
  AuthErrorBanner,
  authInputStyle,
} from "./AuthLayout";
import { GoogleButton } from "./GoogleButton";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { useUserStore } from "../../../stores/useUserStore";

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

    const result = await signIn.email({ email, password });

    if (result.error) {
      setError(
        result.error.message ?? "Something went wrong. Please try again.",
      );
      setLoading(false);
      return;
    }

    // Fetch JWT token so authFetch can use it as Bearer on all subsequent requests
    const tokenRes = await fetch(
      `${import.meta.env.VITE_API_URL ?? "http://localhost:3001"}/api/auth/token`,
      { credentials: "include" },
    );
    if (tokenRes.ok) {
      const { token } = await tokenRes.json();
      if (token) localStorage.setItem("better-auth-token", token);
    }

    await useUserStore.getState().fetch();

    // The auth server uses an HttpOnly session cookie for browser auth,
    // so we do not persist the JWT token in localStorage.

    // Cache user info for the fast sign-in chip on next visit
    const user = useUserStore.getState().user;

    if (user) {
      localStorage.setItem(
        REMEMBERED_USER_KEY,
        JSON.stringify({ email, name: user.name, image: user.image ?? null }),
      );
      navigate(from, { replace: true });
    } else {
      setError("Something went wrong. Please try again.");
      setLoading(false);
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
            marginTop: "10px",
            background: "#eff6ff",
            border: "1px solid rgba(37,99,235,0.15)",
            borderRadius: "999px",
            padding: "5px 12px 5px 8px",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <Avatar className="w-7 h-7 shrink-0 text-[10px]">
            <AvatarImage
              src={storedUser?.image ?? undefined}
              alt={displayName ?? ""}
            />
            <AvatarFallback className="bg-blue-600 text-white text-[11px] font-bold">
              {chipInitials}
            </AvatarFallback>
          </Avatar>
          <span style={{ fontSize: "13px", color: "#374151", fontWeight: 500 }}>
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
        <div
          style={{
            display: fastSignInMode ? "none" : "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
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
            required={!fastSignInMode}
            autoComplete="username"
            tabIndex={fastSignInMode ? -1 : undefined}
            style={authInputStyle("email", focusedField)}
          />
        </div>

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
            autoComplete="current-password"
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
