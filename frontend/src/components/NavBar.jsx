import React from "react";
import { Link } from "react-router-dom";
import "./NavBarStyles.css";

const NavBar = ({ user, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">TTP Winter</Link>
      </div>

      <div className="nav-links">
        {user ? (
          <div className="user-section">
            <Link to={`/profile/${user.username}`} className="profile-link">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="nav-avatar"
                  onError={(e) => {
                    e.target.style.display = "none";
                    const initial = e.target.nextElementSibling;
                    if (initial) initial.style.display = "flex";
                  }}
                />
              ) : null}
              {!user.avatar && (
                <span className="username-avatar">
                  {user.username?.[0]?.toUpperCase() || "U"}
                </span>
              )}
              <span className="username">Welcome, {user.username}!</span>
            </Link>
            <button onClick={onLogout} className="logout-btn">
              Logout
            </button>
          </div>
        ) : (
          <div className="auth-links">
            <Link to="/login" className="nav-link">
              Login
            </Link>
            <Link to="/signup" className="nav-link">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
