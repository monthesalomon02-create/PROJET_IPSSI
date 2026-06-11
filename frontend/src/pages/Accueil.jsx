import { useState, useEffect } from "react";

// Petit utilitaire : transforme "2026-09-15 18:00" en jour + mois courts
function formatDate(dateStr) {
  const mois = [
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
  const d = new Date(dateStr.replace(" ", "T"));
  if (isNaN(d)) return { jour: "--", mois: "--", heure: "" };
  return {
    jour: d.getDate(),
    mois: mois[d.getMonth()],
    heure: `${String(d.getHours()).padStart(2, "0")}h${String(d.getMinutes()).padStart(2, "0")}`,
  };
}

function Accueil({ token }) {
  const [evenements, setEvenements] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/evenements")
      .then((r) => r.json())
      .then((donnees) => {
        setEvenements(Array.isArray(donnees) ? donnees : []);
        setChargement(false);
      })
      .catch(() => setChargement(false));
  }, []);

  const sInscrire = async (id) => {
    if (!token) {
      alert("Vous devez être connecté pour vous inscrire");
      return;
    }
    try {
      const r = await fetch(
        `http://localhost:8000/api/evenements/${id}/inscription`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const d = await r.json();
      alert(
        r.ok
          ? `✅ ${d.message} (places restantes : ${d.places_restantes})`
          : `❌ ${d.erreur}`,
      );
    } catch {
      alert("Erreur de connexion au serveur");
    }
  };

  return (
    <div className="eh-rise">
      {/* HERO */}
      <section className="eh-hero">
        <div className="eh-hero-glow1"></div>
        <div className="eh-hero-glow2"></div>
        <div
          className="eh-wrap"
          style={{
            position: "relative",
            padding: "72px 26px 80px",
            textAlign: "center",
          }}
        >
          <span
            className="eh-pill"
            style={{
              background: "rgba(110,231,183,0.14)",
              color: "var(--mint-200)",
              marginBottom: 20,
            }}
          >
            <span
              className="eh-pill-dot"
              style={{ background: "var(--mint-300)" }}
            ></span>
            Plateforme évènementielle
          </span>
          <h1
            style={{
              fontSize: "clamp(36px, 5vw, 60px)",
              color: "#fff",
              lineHeight: 1,
              marginBottom: 18,
            }}
          >
            Là où la communauté
            <br />
            se <span style={{ color: "var(--mint-300)" }}>rassemble</span>.
          </h1>
          <p
            style={{
              fontSize: 18,
              color: "rgba(255,255,255,0.72)",
              maxWidth: 520,
              margin: "0 auto",
              lineHeight: 1.55,
            }}
          >
            Conférences, ateliers et rencontres près de chez vous — réservez
            votre place en deux clics.
          </p>
        </div>
      </section>

      {/* LISTE */}
      <div className="eh-wrap" style={{ padding: "48px 26px 80px" }}>
        <div className="eh-section-head">
          <div className="eh-eyebrow">À l'affiche</div>
          <h2 style={{ fontSize: 28 }}>Prochains rendez-vous</h2>
        </div>

        {chargement && <p className="eh-muted">Chargement...</p>}
        {!chargement && evenements.length === 0 && (
          <p className="eh-muted">Aucun évènement publié pour le moment.</p>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 22,
          }}
        >
          {evenements.map((ev) => {
            const date = formatDate(ev.date_debut);
            return (
              <article
                key={ev.id}
                className="eh-card eh-card-hover"
                style={{
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div className="eh-cover" style={{ height: 130 }}>
                  <span className="eh-cover-label">visuel évènement</span>
                  <span
                    className="eh-pill eh-st-publie"
                    style={{ position: "absolute", top: 12, left: 12 }}
                  >
                    {ev.categorie.nom}
                  </span>
                </div>

                <div
                  className="eh-card-pad"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                    }}
                  >
                    <div className="eh-dateblock">
                      <div className="eh-dateblock-month">{date.mois}</div>
                      <div className="eh-dateblock-day">{date.jour}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3
                        style={{
                          fontSize: 17,
                          lineHeight: 1.2,
                          marginBottom: 6,
                        }}
                      >
                        {ev.titre}
                      </h3>
                      <div className="eh-muted" style={{ fontSize: 13 }}>
                        🕒 {date.heure} · 📍 {ev.lieu}
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
                    {ev.description}
                  </p>

                  <button
                    onClick={() => sInscrire(ev.id)}
                    className="eh-btn eh-btn-primary eh-btn-block"
                  >
                    S'inscrire
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Accueil;
