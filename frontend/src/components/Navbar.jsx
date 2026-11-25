import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        RailPulse Command
      </Link>

      <nav className="nav-links">
        <NavLink to="/" end>
          Trains
        </NavLink>

        {user?.role === "user" && (
          <>
            <NavLink to="/book">Book Ticket</NavLink>
            <NavLink to="/bookings">My Bookings</NavLink>
          </>
        )}

        {user?.role === "admin" && (
          <>
            <NavLink to="/admin">Manage Trains</NavLink>
            <NavLink to="/bookings">All Bookings</NavLink>
          </>
        )}

        {!user ? (
          <>
            <NavLink to="/login/user">User Login</NavLink>
            <NavLink to="/login/admin">Admin Login</NavLink>
            <Link to="/register" className="nav-register">Register</Link>
          </>
        ) : (
          <div className="nav-account">
            <span className={`nav-role ${user.role}`}>
              {user.role === "admin" ? "ADMIN" : "USER"}
            </span>
            <span className="nav-user-name">{user.name}</span>
            <button type="button" className="btn nav-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
