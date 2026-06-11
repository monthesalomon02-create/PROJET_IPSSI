import { useState, useEffect } from "react";
import { apiFetch } from "./api";

// Génère un slug simple à partir du nom (ex : "Table ronde" -> "table-ronde")
function genererSlug(nom) {
  return nom
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // enlève les accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");

  // Formulaire (création ou édition)
  const [editId, setEditId] = useState(null); // null = création
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");

  const charger = () => {
    apiFetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d) ? d : []))
      .catch(() => setCategories([]));
  };

  useEffect(() => {
    charger();
  }, []);

  const reinitialiser = () => {
    setEditId(null);
    setNom("");
    setDescription("");
  };

  const enregistrer = async (e) => {
    e.preventDefault();
    setMessage("");
    const corps = { nom, slug: genererSlug(nom), description };

    try {
      let r;
      if (editId) {
        r = await apiFetch(`/api/categories/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(corps),
        });
      } else {
        r = await apiFetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(corps),
        });
      }
      const d = await r.json();
      if (r.ok) {
        setMessage(editId ? "✅ Catégorie modifiée" : "✅ Catégorie créée");
        reinitialiser();
        charger();
      } else {
        setMessage("❌ " + (d.erreur || "Erreur"));
      }
    } catch {
      setMessage("Erreur de connexion");
    }
  };

  const modifier = (cat) => {
    setEditId(cat.id);
    setNom(cat.nom);
    setDescription(cat.description || "");
  };

  const supprimer = async (id) => {
    if (!window.confirm("Supprimer cette catégorie ?")) return;
    setMessage("");
    try {
      const r = await apiFetch(`/api/categories/${id}`, { method: "DELETE" });
      const d = await r.json();
      setMessage(
        r.ok ? "🗑️ Catégorie supprimée" : "❌ " + (d.erreur || "Erreur"),
      );
      if (r.ok) charger();
    } catch {
      setMessage("Erreur de connexion");
    }
  };

  return (
    <div
      className="eh-rise"
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr) minmax(0,1.4fr)",
        gap: 24,
        alignItems: "start",
      }}
    >
      {/* Formulaire */}
      <form onSubmit={enregistrer} className="eh-card eh-card-pad">
        <div className="eh-eyebrow" style={{ marginBottom: 6 }}>
          {editId ? "Modifier" : "Nouvelle catégorie"}
        </div>
        <h2 style={{ fontSize: 20, marginBottom: 18 }}>
          {editId ? "Modifier la catégorie" : "Créer une catégorie"}
        </h2>

        <div style={{ marginBottom: 16 }}>
          <label
            className="eh-label"
            style={{ display: "block", marginBottom: 6 }}
          >
            Nom
          </label>
          <input
            className="eh-input"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
            placeholder="Ex : Conférence"
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label
            className="eh-label"
            style={{ display: "block", marginBottom: 6 }}
          >
            Description (optionnel)
          </label>
          <textarea
            className="eh-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brève description…"
          />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" className="eh-btn eh-btn-primary eh-btn-block">
            {editId ? "Enregistrer" : "Créer"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={reinitialiser}
              className="eh-btn eh-btn-ghost"
            >
              Annuler
            </button>
          )}
        </div>

        {message && (
          <p className="eh-muted" style={{ marginTop: 14 }}>
            {message}
          </p>
        )}
      </form>

      {/* Liste */}
      <div>
        <h2 style={{ fontSize: 20, marginBottom: 14 }}>
          Catégories existantes
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {categories.length === 0 && (
            <p className="eh-muted">Aucune catégorie pour le moment.</p>
          )}
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="eh-card eh-card-pad"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: 180 }}>
                <strong style={{ fontSize: 15 }}>{cat.nom}</strong>
                {cat.description && (
                  <p
                    className="eh-muted"
                    style={{ fontSize: 13, marginTop: 2 }}
                  >
                    {cat.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => modifier(cat)}
                className="eh-btn eh-btn-ghost eh-btn-sm"
              >
                ✏️ Modifier
              </button>
              <button
                onClick={() => supprimer(cat.id)}
                className="eh-btn eh-btn-danger eh-btn-sm"
              >
                🗑️ Supprimer
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminCategories;
