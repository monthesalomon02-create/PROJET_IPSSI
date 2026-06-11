import { useState, useEffect } from "react";
import { apiFetch } from "../api";
import AdminModeration from "../AdminModeration";
import AdminDashboard from "../AdminDashboard";
import AdminCategories from "../AdminCategories";

function Admin({ token }) {
  const [role, setRole] = useState("inconnu"); // inconnu | admin | refuse
  const [vue, setVue] = useState("dashboard"); // dashboard | file | categories

  useEffect(() => {
    apiFetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && Array.isArray(d.roles) && d.roles.includes("ROLE_ADMIN")) {
          setRole("admin");
        } else {
          setRole("refuse");
        }
      })
      .catch(() => setRole("refuse"));
  }, []);

  if (role === "inconnu") {
    return (
      <div className="eh-wrap" style={{ padding: 60 }}>
        <p className="eh-muted">Vérification des droits…</p>
      </div>
    );
  }

  if (role === "refuse") {
    return (
      <div className="eh-wrap" style={{ padding: 60, textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>Accès réservé</h1>
        <p className="eh-muted">Cette page est réservée aux administrateurs.</p>
      </div>
    );
  }

  const boutonStyle = (actif) =>
    actif
      ? { background: "var(--forest-800)", color: "#fff" }
      : {
          background: "var(--card)",
          color: "var(--ink-700)",
          border: "1px solid var(--line-strong)",
        };

  return (
    <div className="eh-wrap eh-rise" style={{ padding: "40px 26px 80px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        <div>
          <div className="eh-eyebrow">Back-office · Administration</div>
          <h1 style={{ fontSize: 30 }}>Console d'administration</h1>
          <p className="eh-muted" style={{ marginTop: 6 }}>
            Validez les demandes, gérez les catégories et suivez l'activité.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => setVue("dashboard")}
            className="eh-btn eh-btn-sm"
            style={boutonStyle(vue === "dashboard")}
          >
            📊 Tableau de bord
          </button>
          <button
            onClick={() => setVue("file")}
            className="eh-btn eh-btn-sm"
            style={boutonStyle(vue === "file")}
          >
            🛡️ File d'attente
          </button>
          <button
            onClick={() => setVue("categories")}
            className="eh-btn eh-btn-sm"
            style={boutonStyle(vue === "categories")}
          >
            🏷️ Catégories
          </button>
        </div>
      </div>

      {vue === "dashboard" && <AdminDashboard token={token} />}
      {vue === "file" && <AdminModeration token={token} />}
      {vue === "categories" && <AdminCategories />}
    </div>
  );
}

export default Admin;
