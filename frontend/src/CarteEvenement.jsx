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
  if (isNaN(d)) return { jour: "--", mois: "--", heure: "" };
  return {
    jour: d.getDate(),
    mois: MOIS[d.getMonth()],
    heure: `${String(d.getHours()).padStart(2, "0")}h${String(d.getMinutes()).padStart(2, "0")}`,
  };
}

// Carte d'évènement réutilisée sur l'accueil ET la page Explorer.
// Cliquer dessus mène à la page de détail.
function CarteEvenement({ evenement }) {
  const navigate = useNavigate();
  const date = formatDate(evenement.date_debut);
  const gratuit = !evenement.prix || parseFloat(evenement.prix) === 0;

  return (
    <article
      className="eh-card eh-card-hover"
      style={{
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
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
      </div>

      <div
        className="eh-card-pad"
        style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}
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

        <span
          className="eh-btn eh-btn-soft eh-btn-sm"
          style={{ alignSelf: "flex-start" }}
        >
          Voir le détail →
        </span>
      </div>
    </article>
  );
}

export default CarteEvenement;
