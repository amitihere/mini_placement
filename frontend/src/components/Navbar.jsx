import React from "react";
import "../styles/navbar.css";

export default function Navbar({ onShowLogin, onShowSignup }) {
  return (
    <nav className="navbar">
      <h1 className="navbar-title">Placement Portal</h1>
      <div className="button-group">
        <button className="signup-btn" onClick={onShowSignup}>Sign Up</button>
        <button className="login-btn" onClick={onShowLogin}>Login</button>
      </div>
    </nav>
  );
}
