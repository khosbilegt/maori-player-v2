import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Navigation.css";

const Navigation: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-text">Māori Player</span>
        </Link>

        <div className="nav-links">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/library" className="nav-link">
            Library
          </Link>
          {isAuthenticated && (
            <Link to="/admin" className="nav-link">
              Admin
            </Link>
          )}
        </div>

        <div className="nav-auth">
          {isAuthenticated ? (
            <div className="user-menu">
              <span className="user-greeting">Welcome, {user?.username}</span>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="nav-button secondary">
                Sign In
              </Link>
              <Link to="/register" className="nav-button primary">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
