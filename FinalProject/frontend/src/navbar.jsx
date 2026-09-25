// navbar.jsx
import { useState } from "react";
import { AiFillBug } from "react-icons/ai";
import { NavLink } from "react-router-dom";
import "./navbar.css";

const Navbar = ({ auth, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const onClickLogout = (e) => {
    e.preventDefault();
    onLogout();
  };

  const navLinkClass = ({ isActive }) =>
    isActive ? "nav-link nav-link--active" : "nav-link";

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">
          <AiFillBug />
          <span>Issue Tracker</span>
        </NavLink>

        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
        </button>

        <div className={`navbar-menu ${menuOpen ? "navbar-menu--open" : ""}`}>
          {auth ? (
            <>
              <ul className="navbar-links">
                <li>
                  <NavLink to="/" className={navLinkClass} end>
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/users" className={navLinkClass}>
                    Users
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/bugs" className={navLinkClass}>
                    Bugs
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/bugs/new" className={navLinkClass}>
                    Report Bug
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/me" className={navLinkClass}>
                    Profile
                  </NavLink>
                </li>
              </ul>
              <div className="navbar-account">
                <span className="navbar-email">{auth.email}</span>
                <button className="navbar-logout" onClick={onClickLogout}>
                  Log out
                </button>
              </div>
            </>
          ) : (
            <ul className="navbar-links">
              <li>
                <NavLink to="/" className={{ navLinkClass }}>
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/register" className={{ navLinkClass }}>
                  Register
                </NavLink>
              </li>
              <li>
                <NavLink to="/login" className={navLinkClass}>
                  Log in
                </NavLink>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
