import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/"} replace />;
  }

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/login/user", {
        replace: true,
        state: { message: "Your account is ready. Sign in to continue." },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create your account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card register-card">
        <Link to="/" className="auth-brand">RailPulse <span>Command</span></Link>
        <div className="auth-role-icon">U</div>
        <p className="auth-eyebrow">START YOUR JOURNEY</p>
        <h1>Create your account</h1>
        <p className="auth-description">Register once to book tickets and manage your journeys.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Full name
            <input
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={updateField}
              minLength="2"
              maxLength="80"
              required
            />
          </label>
          <label>
            Email address
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={updateField}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={updateField}
              minLength="8"
              required
            />
          </label>
          <label>
            Confirm password
            <input
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={updateField}
              minLength="8"
              required
            />
          </label>

          {error && <p className="error auth-error" role="alert">{error}</p>}

          <button className="btn primary auth-submit" type="submit" disabled={submitting}>
            {submitting ? "Creating account..." : "Create account"}
            {!submitting && <span aria-hidden="true">→</span>}
          </button>
        </form>

        <p className="auth-switch">Already registered? <Link to="/login/user">Sign in</Link></p>
        <Link to="/" className="auth-back">← Back to train search</Link>
      </div>
      <p className="auth-footer">RAILPULSE COMMAND <span>•</span> YOUR JOURNEY, IN CONTROL</p>
    </section>
  );
}
