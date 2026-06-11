import { useNavigate } from "react-router-dom";

const MOIS = [
  "JAN",
  "FÉV",
  "MAR",
  "AVR",
  "MAI",
  "JUIN",
  "JUIL",
  "AOÛT",
  "SEP",
  "OCT",
  "NOV",
  "DÉC",
];
function formatDate(dateStr) {
  const d = new Date(String(dateStr).replace(" ", "T"));
  if (isNaN(d)) return { jour: "--", mois: "--", heure: "", passe: false };
  return {
    jour: d.getDate(),
    mois: MOIS[d.getMonth()],
    heure: `${String(d.getHours()).padStart(2, "0")}h${String(d.getMinutes()).padStart(2, "0")}`,
    passe: d < new Date(), // l'évènement est-il déjà passé ?
  };
}

function CarteEvenement({ evenement }) {
  const navigate = useNavigate();
  const date = formatDate(evenement.date_debut);
  const gratuit = !evenement.prix || parseFloat(evenement.prix) === 0;

  // Données de capacité (viennent du back désormais)
  const max = evenement.capacite_max || 0;
  const inscrits = evenement.inscrits || 0;
  const restantes = evenement.places_restantes ?? Math.max(0, max - inscrits);
  const complet = evenement.complet || restantes <= 0;
  const pct = max > 0 ? Math.min(100, Math.round((inscrits / max) * 100)) : 0;

  return (
    <article
      className="eh-card eh-card-hover"
      style={{
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        opacity: date.passe ? 0.72 : 1,
      }}
      onClick={() => navigate(`/evenements/${evenement.id}`)}
    >
      <div className="eh-cover" style={{ height: 130 }}>
        <span className="eh-cover-label">visuel évènement</span>
        <span
          className="eh-pill eh-st-publie"
          style={{ position: "absolute", top: 12, left: 12 }}
        >
          {evenement.categorie.nom}
        </span>
        {/* Badge en haut à droite : Terminé > Complet > Prix */}
        {date.passe ? (
          <span
            className="eh-pill eh-st-depublie"
            style={{ position: "absolute", top: 12, right: 12 }}
          >
            Terminé
          </span>
        ) : complet ? (
          <span
            className="eh-pill eh-st-refuse"
            style={{ position: "absolute", top: 12, right: 12 }}
          >
            Complet
          </span>
        ) : (
          <span
            className="eh-pill"
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: gratuit ? "var(--forest-800)" : "var(--card)",
              color: gratuit ? "#fff" : "var(--forest-800)",
              boxShadow: "var(--sh-sm)",
            }}
          >
            {gratuit ? "Gratuit" : `${evenement.prix} €`}
          </span>
        )}
      </div>

      <div
        className="eh-card-pad"
        style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div className="eh-dateblock">
            <div className="eh-dateblock-month">{date.mois}</div>
            <div className="eh-dateblock-day">{date.jour}</div>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 17, lineHeight: 1.2, marginBottom: 6 }}>
              {evenement.titre}
            </h3>
            <div className="eh-muted" style={{ fontSize: 13 }}>
              🕒 {date.heure} · 📍 {evenement.lieu}
            </div>
          </div>
        </div>

        <p
          className="eh-muted"
          style={{
            fontSize: 13.5,
            lineHeight: 1.5,
            flex: 1,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {evenement.description}
        </p>

        {/* Jauge de capacité */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12.5,
              marginBottom: 5,
            }}
          >
            <span
              className="eh-mono"
              style={{
                fontWeight: 700,
                color: complet ? "var(--rose)" : "var(--ink-700)",
              }}
            >
              {inscrits}/{max}
            </span>
            <span className="eh-muted" style={{ fontWeight: 600 }}>
              {date.passe
                ? "Évènement terminé"
                : complet
                  ? "Complet"
                  : `${restantes} place${restantes > 1 ? "s" : ""} restante${restantes > 1 ? "s" : ""}`}
            </span>
          </div>
          <div className="eh-capbar">
            <div
              className={`eh-capbar-fill ${complet ? "full" : pct >= 85 ? "warn" : ""}`}
              style={{ width: pct + "%" }}
            ></div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default CarteEvenement;
