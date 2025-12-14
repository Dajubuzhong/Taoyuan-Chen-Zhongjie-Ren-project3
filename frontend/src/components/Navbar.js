import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path) => (location.pathname === path ? "active" : "");

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <Link to="/" className="navbar-title">
            <span className="navbar-logo-text">Sudoku<span className="navbar-logo-plus">+</span></span>
          </Link>
        </div>

        <div className="navbar-center">
          <ul className="navbar-links">
            <li><Link className={isActive("/")} to="/">Home</Link></li>
            <li><Link className={isActive("/games")} to="/games">Selection</Link></li>
            <li><Link className={isActive("/rules")} to="/rules">Rules</Link></li>
            <li><Link className={isActive("/scores")} to="/scores">High Scores</Link></li>
          </ul>
        </div>

        <div className="navbar-right">
          {!user && (
            <div className="navbar-auth-buttons">
              <Link className={`navbar-auth-link ${isActive("/login")}`} to="/login"> Login </Link>
              <Link className={`navbar-auth-link ${isActive("/register")}`}to="/register"> Register </Link>
            </div>
          )}

          {user && (
            <div className="navbar-auth-buttons">
              <div className="navbar-user-pill">
                <div className="navbar-user-avatar">
                  {user.username?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="navbar-user-name"> {user.username} </span>
              </div>
              <button type="button" className="navbar-auth-link" onClick={logout}> Logout </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
