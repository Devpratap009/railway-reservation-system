import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="navbar">
      <NavLink to="/" end className="brand">
        RailPulse Command
      </NavLink>

      <nav className="nav-links">
        <NavLink to="/" end>
          Trains
        </NavLink>
        <NavLink to="/book">
          Book Ticket
        </NavLink>
        <NavLink to="/bookings">
          Bookings
        </NavLink>
      </nav>
    </header>
  );
}