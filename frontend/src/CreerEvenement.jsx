import { useState, useEffect } from "react";
import { apiFetch } from "./api";

const MOIS = [
  "JANV.",
  "FÉVR.",
  "MARS",
  "AVR.",
  "MAI",
  "JUIN",
  "JUIL.",
  "AOÛT",
  "SEPT.",
  "OCT.",
  "NOV.",
  "DÉC.",
];
function apercuDate(s) {
  const d = new Date(String(s).replace(" ", "T"));
  if (isNaN(d)) return { jour: "--", mois: "---" };
  return { jour: d.getDate(), mois: MOIS[d.getMonth()] };
}

// Convertit "2026-09-15 18:00" (API) -> "2026-09-15T18:00" (champ datetime-local)
function pourInput(s) {
  if (!s) return "";
  return String(s).replace(" ", "T").slice(0, 16);
}

function CreerEvenement({ token, onCree, evenementAEditer }) {
  const enEdition = Boolean(evenementAEditer);

  const [titre, setTitre] = useState(evenementAEditer?.titre || "");
  const [description, setDescription] = useState(
    evenementAEditer?.description || "",
  );
  const [dateDebut, setDateDebut] = useState(
    pourInput(evenementAEditer?.date_debut),
  );
  const [dateFin, setDateFin] = useState(pourInput(evenementAEditer?.date_fin));
  const [lieu, setLieu] = useState(evenementAEditer?.lieu || "");
  const [capaciteMax, setCapaciteMax] = useState(
    evenementAEditer?.capacite_max || "",
  );
  const [prix, setPrix] = useState(evenementAEditer?.prix || "0");
  const [categorieId, setCategorieId] = useState(
    evenementAEditer?.categorie?.id
      ? String(evenementAEditer.categorie.id)
      : "",
  );
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    apiFetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const enregistrer = async (soumettre) => {
    setMessage("");
    const corps = {
      titre,
      description,
      date_debut: dateDebut,
      date_fin: dateFin,
      lieu,
      capacite_max: parseInt(capaciteMax),
      prix,
      categorie_id: parseInt(categorieId),
    };

    try {
      let id;
      if (enEdition) {
        // MODIFICATION → PUT
        const r = await apiFetch(`/api/evenements/${evenementAEditer.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(corps),
        });
        const d = await r.json();
        if (!r.ok) {
          setMessage("❌ " + (d.erreur || "Erreur"));
          return;
        }
        id = evenementAEditer.id;
        setMessage("✅ Évènement modifié");
      } else {
        // CRÉATION → POST
        const r = await apiFetch("/api/evenements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(corps),
        });
        const d = await r.json();
        if (!r.ok) {
          setMessage("❌ " + (d.erreur || "Erreur"));
          return;
        }
        id = d.id;
        setMessage("✅ Brouillon enregistré");
      }

      // Soumettre pour validation si demandé
      if (soumettre) {
        await apiFetch(`/api/evenements/${id}/soumettre`, {
          method: "PATCH",
        });
      }

      if (onCree) onCree();
    } catch {
      setMessage("Erreur de connexion au serveur");
    }
  };

  const catNom = categories.find((c) => c.id === parseInt(categorieId))?.nom;
  const ad = apercuDate(dateDebut);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0,1.6fr) minmax(0,1fr)",
        gap: 24,
        alignItems: "start",
      }}
      className="eh-create-grid"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          enregistrer(false);
        }}
        className="eh-card eh-card-pad"
      >
        <div className="eh-eyebrow" style={{ marginBottom: 6 }}>
          {enEdition ? "Modifier" : "Nouvel évènement"}
        </div>
        <h2 style={{ fontSize: 22, marginBottom: 20 }}>
          {enEdition ? "Modifier l'évènement" : "Créer un évènement"}
        </h2>

        <Champ label="Titre de l'évènement">
          <input
            className="eh-input"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            required
            placeholder="Ex : Meetup React"
          />
        </Champ>

        <Champ label="Catégorie">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {categories.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => setCategorieId(String(c.id))}
                className="eh-btn eh-btn-sm"
                style={
                  parseInt(categorieId) === c.id
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
        </Champ>

        <Champ label="Description">
          <textarea
            className="eh-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Décrivez votre évènement…"
          />
        </Champ>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
        >
          <Champ label="Date de début">
            <input
              type="datetime-local"
              className="eh-input"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              required
            />
          </Champ>
          <Champ label="Date de fin">
            <input
              type="datetime-local"
              className="eh-input"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              required
            />
          </Champ>
        </div>

        <Champ label="Lieu">
          <input
            className="eh-input"
            value={lieu}
            onChange={(e) => setLieu(e.target.value)}
            required
            placeholder="Nom du lieu"
          />
        </Champ>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
        >
          <Champ label="Capacité maximale">
            <input
              type="number"
              className="eh-input"
              value={capaciteMax}
              onChange={(e) => setCapaciteMax(e.target.value)}
              required
              placeholder="50"
            />
          </Champ>
          <Champ label="Prix (€) — 0 = gratuit">
            <input
              type="number"
              className="eh-input"
              value={prix}
              onChange={(e) => setPrix(e.target.value)}
            />
          </Champ>
        </div>

        {message && (
          <p className="eh-muted" style={{ marginTop: 8 }}>
            {message}
          </p>
        )}
      </form>

      <div
        style={{
          position: "sticky",
          top: 86,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div className="eh-eyebrow">Aperçu</div>
        <article className="eh-card" style={{ overflow: "hidden" }}>
          <div className="eh-cover" style={{ height: 110 }}>
            {catNom && (
              <span
                className="eh-pill eh-st-publie"
                style={{ position: "absolute", top: 12, left: 12 }}
              >
                {catNom}
              </span>
            )}
            <span className="eh-cover-label">visuel évènement</span>
          </div>
          <div className="eh-card-pad" style={{ display: "flex", gap: 12 }}>
            <div className="eh-dateblock">
              <div className="eh-dateblock-month">{ad.mois}</div>
              <div className="eh-dateblock-day">{ad.jour}</div>
            </div>
            <div>
              <h3 style={{ fontSize: 16, marginBottom: 4 }}>
                {titre || "Titre de l'évènement"}
              </h3>
              <span className="eh-muted" style={{ fontSize: 13 }}>
                📍 {lieu || "Lieu à définir"}
              </span>
            </div>
          </div>
        </article>

        <div
          className="eh-card eh-card-pad"
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <button
            onClick={() => enregistrer(false)}
            className="eh-btn eh-btn-ghost eh-btn-block"
          >
            📝{" "}
            {enEdition
              ? "Enregistrer les modifications"
              : "Enregistrer en brouillon"}
          </button>
          <button
            onClick={() => enregistrer(true)}
            className="eh-btn eh-btn-primary eh-btn-block"
          >
            ➤{" "}
            {enEdition
              ? "Enregistrer et soumettre"
              : "Soumettre pour validation"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Champ({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label className="eh-label" style={{ display: "block", marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default CreerEvenement;
