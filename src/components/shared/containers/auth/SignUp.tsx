import { useState } from "react";
import { signUp } from "../../../../lib/auth-client";
import { useNavigate } from "react-router";
import {
  AuthLayout,
  AuthDivider,
  AuthErrorBanner,
  authInputStyle,
} from "./AuthLayout";
import { GoogleButton } from "./GoogleButton";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signUp.email({ name, email, password });

    if (error) {
      setError(error.message ?? "Something went wrong. Please try again.");
      setLoading(false);
    } else {
      navigate("/dashboard");
    }
  };

  const passwordStrength =
    password.length === 0
      ? 0
      : password.length < 6
        ? 1
        : password.length < 10
          ? 2
          : /[^a-zA-Z0-9]/.test(password)
            ? 4
            : 3;

  const strengthColors = ["#ef4444", "#f97316", "#2563eb", "#16a34a"];

  return (
    <AuthLayout
      heading="Start for free"
      subheading="No credit card required. Up and running in 60 seconds."
      footer={
        <>
          Already have an account?{" "}
          <a href="/sign-in" className="auth-link">
            Sign in →
          </a>
        </>
      }
    >
      {error && <AuthErrorBanner message={error} />}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "18px" }}
      >
        {/* Name */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}
          >
            Full name
          </label>
          <input
            autoComplete="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => setFocusedField("name")}
            onBlur={() => setFocusedField(null)}
            placeholder="Alex Johnson"
            required
            style={authInputStyle("name", focusedField)}
          />
        </div>

        {/* Email */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}
          >
            Email
          </label>
          <input
            autoComplete="email"
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

        {/* Password */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}
          >
            Password
          </label>
          <input
            autoComplete="new-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setFocusedField("password")}
            onBlur={() => setFocusedField(null)}
            placeholder="Min. 8 characters"
            required
            minLength={8}
            style={authInputStyle("password", focusedField)}
          />
          {password.length > 0 && (
            <div style={{ display: "flex", gap: "4px", marginTop: "6px" }}>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: "3px",
                    borderRadius: "2px",
                    background:
                      i <= passwordStrength
                        ? strengthColors[passwordStrength - 1]
                        : "rgba(37,99,235,0.1)",
                    transition: "background 0.2s",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="btn-primary-light"
          disabled={loading}
          style={{ marginTop: "4px" }}
        >
          {loading ? "Creating account…" : "Create account →"}
        </button>

        <p
          style={{
            fontSize: "12px",
            color: "#94a3b8",
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          By creating an account you agree to our{" "}
          <a href="/terms" className="auth-link" style={{ fontSize: "12px" }}>
            Terms
          </a>{" "}
          and{" "}
          <a href="/privacy" className="auth-link" style={{ fontSize: "12px" }}>
            Privacy Policy
          </a>
          .
        </p>
      </form>

      <AuthDivider />
      <GoogleButton />

      {/* Trust signals */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {["Free forever plan", "No spam", "Cancel anytime"].map((label) => (
          <div key={label} className="trust-item">
            <span style={{ color: "#16a34a" }}>✓</span> {label}
          </div>
        ))}
      </div>
    </AuthLayout>
  );
}
