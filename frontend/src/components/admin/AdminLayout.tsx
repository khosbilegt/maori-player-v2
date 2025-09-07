import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./AdminLayout.css";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: "⚡" },
    { name: "Videos", href: "/admin/videos", icon: "▶" },
    { name: "Vocabulary", href: "/admin/vocabulary", icon: "◊" },
    { name: "VTT Files", href: "/admin/vtt", icon: "📄" },
  ];

  const isActive = (href: string) => {
    return (
      location.pathname === href || location.pathname.startsWith(href + "/")
    );
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="admin-sidebar-header">
          <h2>Admin Panel</h2>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ×
          </button>
        </div>

        <nav className="admin-nav">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`admin-nav-link ${
                isActive(item.href) ? "active" : ""
              }`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="admin-main">
        {/* Top bar */}
        <header className="admin-header">
          <button
            className="mobile-menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ≡
          </button>
          <h1>Admin Panel</h1>
          <div className="admin-header-actions">
            <Link to="/" className="btn btn-secondary">
              ← Back to Site
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="admin-content">{children}</main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
};

export default AdminLayout;
