import { useState, useEffect } from "react";
import { apiFetch } from "../api";
import CarteEvenement from "../CarteEvenement";

function Explorer() {
  const [evenements, setEvenements] = useState([]);
  const [categories, setCategories] = useState([]);
  const [chargement, setChargement] = useState(true);

  // Filtres
  const [recherche, setRecherche] = useState("");
  const [categorieActive, setCategorieActive] = useState(null);
  const [gratuitSeulement, setGratuitSeulement] = useState(false);

  useEffect(() => {
    apiFetch("/api/evenements")
      .then((r) => r.json())
      .then((d) => {
        setEvenements(Array.isArray(d) ? d : []);
        setChargement(false);
      })
      .catch(() => setChargement(false));

    apiFetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  // Filtrage côté front (on ne touche pas au back)
  let liste = evenements;
  if (recherche.trim()) {
    const t = recherche.toLowerCase();
    liste = liste.filter(
      (e) =>
        e.titre.toLowerCase().includes(t) ||
        e.lieu.toLowerCase().includes(t) ||
        e.description.toLowerCase().includes(t),
    );
  }
  if (categorieActive)
    liste = liste.filter((e) => e.categorie.id === categorieActive);
  if (gratuitSeulement)
    liste = liste.filter((e) => !e.prix || parseFloat(e.prix) === 0);

  return (
    <div className="eh-wrap eh-rise" style={{ padding: "40px 26px 80px" }}>
      <div className="eh-eyebrow">
        {liste.length} évènement{liste.length > 1 ? "s" : ""}
      </div>
      <h1 style={{ fontSize: 30, marginBottom: 6 }}>Explorer les évènements</h1>
      <p className="eh-muted" style={{ marginBottom: 26, maxWidth: 520 }}>
        Parcourez l'agenda complet. Filtrez par catégorie, prix et mot-clé.
      </p>

      {/* Barre de recherche + filtre gratuit */}
      <div
        style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}
      >
        <input
          className="eh-input"
          style={{ flex: 1, minWidth: 240 }}
          placeholder="🔍 Rechercher un évènement, un lieu…"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />
        <button
          onClick={() => setGratuitSeulement((v) => !v)}
          className="eh-btn"
          style={
            gratuitSeulement
              ? { background: "var(--forest-800)", color: "#fff" }
              : {
                  background: "var(--card)",
                  color: "var(--ink-700)",
                  border: "1.5px solid var(--line-strong)",
                }
          }
        >
          € Gratuits
        </button>
      </div>

      {/* Pastilles de catégorie */}
      <div
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}
      >
        <button
          onClick={() => setCategorieActive(null)}
          className="eh-btn eh-btn-sm"
          style={
            !categorieActive
              ? {
                  background: "var(--mint-100)",
                  color: "var(--forest-700)",
                  border: "1.5px solid var(--emerald-400)",
                }
              : {
                  background: "var(--card)",
                  color: "var(--ink-600)",
                  border: "1.5px solid var(--line)",
                }
          }
        >
          Tous
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() =>
              setCategorieActive(categorieActive === c.id ? null : c.id)
            }
            className="eh-btn eh-btn-sm"
            style={
              categorieActive === c.id
                ? {
                    background: "var(--mint-100)",
                    color: "var(--forest-700)",
                    border: "1.5px solid var(--emerald-400)",
                  }
                : {
                    background: "var(--card)",
                    color: "var(--ink-600)",
                    border: "1.5px solid var(--line)",
                  }
            }
          >
            {c.nom}
          </button>
        ))}
      </div>

      {chargement && <p className="eh-muted">Chargement...</p>}
      {!chargement && liste.length === 0 && (
        <div
          className="eh-card eh-card-pad"
          style={{ textAlign: "center", padding: "50px 20px" }}
        >
          <div style={{ fontSize: 30, marginBottom: 10 }}>🔍</div>
          <h3 style={{ fontSize: 18, marginBottom: 4 }}>
            Aucun évènement trouvé
          </h3>
          <p className="eh-muted">
            Essayez d'élargir votre recherche ou de retirer un filtre.
          </p>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 22,
        }}
      >
        {liste.map((ev) => (
          <CarteEvenement key={ev.id} evenement={ev} />
        ))}
      </div>
    </div>
  );
}

export default Explorer;
