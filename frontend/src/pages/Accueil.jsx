import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api";
import CarteEvenement from "../CarteEvenement";

function Accueil() {
  const [evenements, setEvenements] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    apiFetch("/api/evenements")
      .then((r) => r.json())
      .then((donnees) => {
        setEvenements(Array.isArray(donnees) ? donnees : []);
        setChargement(false);
      })
      .catch(() => setChargement(false));
  }, []);

  // On n'affiche que les 6 premiers sur l'accueil
  const apercu = evenements.slice(0, 6);

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
              margin: "0 auto 28px",
              lineHeight: 1.55,
            }}
          >
            Conférences, ateliers et rencontres près de chez vous — réservez
            votre place en deux clics.
          </p>
          <Link
            to="/evenements"
            className="eh-btn eh-btn-primary eh-btn-lg"
            style={{ textDecoration: "none" }}
          >
            Explorer les évènements →
          </Link>
        </div>
      </section>

      {/* LISTE (aperçu) */}
      <div className="eh-wrap" style={{ padding: "48px 26px 80px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 22,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div className="eh-eyebrow">À l'affiche</div>
            <h2 style={{ fontSize: 28 }}>Prochains rendez-vous</h2>
          </div>
          <Link
            to="/evenements"
            className="eh-btn eh-btn-ghost"
            style={{ textDecoration: "none" }}
          >
            Tout voir →
          </Link>
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
          {apercu.map((ev) => (
            <CarteEvenement key={ev.id} evenement={ev} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Accueil;
