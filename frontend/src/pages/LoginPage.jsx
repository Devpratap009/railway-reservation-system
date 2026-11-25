import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function LoginPage({ role }) {
  const isAdmin = role === "admin";
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/"} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password, role);
      const requestedPath = location.state?.from?.pathname;
      navigate(requestedPath || (isAdmin ? "/admin" : "/"), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to log in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <div className={`auth-card ${isAdmin ? "admin-auth-card" : ""}`}>
        <Link to="/" className="auth-brand">RailPulse <span>Command</span></Link>
        <div className={`auth-role-icon ${isAdmin ? "admin-role-icon" : ""}`}>
          {isAdmin ? "A" : "U"}
        </div>
        <p className="auth-eyebrow">{isAdmin ? "CONTROL CENTRE" : "WELCOME ABOARD"}</p>
        <h1>{isAdmin ? "Administrator Login" : "User Login"}</h1>
        <p className="auth-description">
          {isAdmin
            ? "Sign in to manage trains and oversee passenger bookings."
            : "Sign in to book your journey and keep track of your tickets."}
        </p>
        {location.state?.message && (
          <p className="success auth-flash">{location.state.message}</p>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email address
            <input
              type="email"
              autoComplete="username"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error && <p className="error auth-error" role="alert">{error}</p>}

          <button className="btn primary auth-submit" type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : `Sign in as ${isAdmin ? "Admin" : "User"}`}
            {!submitting && <span aria-hidden="true">→</span>}
          </button>
        </form>

        {!isAdmin ? (
          <p className="auth-switch">
            New to RailPulse? <Link to="/register">Create an account</Link>
          </p>
        ) : (
          <p className="auth-switch">Administrator access is provisioned by the system owner.</p>
        )}

        <div className="auth-divider"><span>OR</span></div>
        <Link className="auth-alternate" to={isAdmin ? "/login/user" : "/login/admin"}>
          {isAdmin ? "Go to user login" : "Administrator? Sign in here"}
        </Link>
        <Link to="/" className="auth-back">← Back to train search</Link>
      </div>
      <p className="auth-footer">RAILPULSE COMMAND <span>•</span> YOUR JOURNEY, IN CONTROL</p>
    </section>
  );
}
