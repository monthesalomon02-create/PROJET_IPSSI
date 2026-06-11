import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../api";

const MOIS = [
  "janv.",
  "févr.",
  "mars",
  "avr.",
  "mai",
  "juin",
  "juil.",
  "août",
  "sept.",
  "oct.",
  "nov.",
  "déc.",
];
const JOURS = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
function infosDate(s) {
  const d = new Date(String(s).replace(" ", "T"));
  if (isNaN(d)) return { jour: "--", moisCourt: "---", full: "", heure: "" };
  return {
    jour: d.getDate(),
    moisCourt: MOIS[d.getMonth()].toUpperCase().replace(".", ""),
    full: `${JOURS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}`,
    heure: `${String(d.getHours()).padStart(2, "0")}h${String(d.getMinutes()).padStart(2, "0")}`,
  };
}

function DetailEvenement({ token }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ev, setEv] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [message, setMessage] = useState("");
  const [inscrit, setInscrit] = useState(false);

  const charger = () => {
    apiFetch(`/api/evenements/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("introuvable");
        return r.json();
      })
      .then((d) => {
        setEv(d);
        setChargement(false);
      })
      .catch(() => {
        setErreur("Évènement introuvable ou non publié.");
        setChargement(false);
      });
  };

  useEffect(() => {
    charger();
  }, [id]);

  // Vérifie si l'utilisateur est déjà inscrit (via mes-inscriptions)
  useEffect(() => {
    if (!token) return;
    apiFetch("/api/mes-inscriptions")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => {
        if (Array.isArray(d)) {
          setInscrit(d.some((i) => i.evenement?.id === parseInt(id)));
        }
      })
      .catch(() => {});
  }, [id, token, message]);

  const sInscrire = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    setMessage("");
    try {
      const r = await apiFetch(`/api/evenements/${id}/inscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const d = await r.json();
      if (r.ok) {
        setMessage("✅ " + d.message);
        charger();
      } else setMessage("❌ " + d.erreur);
    } catch {
      setMessage("Erreur de connexion");
    }
  };

  const seDesinscrire = async () => {
    setMessage("");
    try {
      const r = await apiFetch(`/api/evenements/${id}/inscription`, {
        method: "DELETE",
      });
      const d = await r.json();
      if (r.ok) {
        setMessage("Désinscription effectuée");
        charger();
      } else setMessage("❌ " + d.erreur);
    } catch {
      setMessage("Erreur de connexion");
    }
  };

  if (chargement)
    return (
      <div className="eh-wrap" style={{ padding: 60 }}>
        <p className="eh-muted">Chargement...</p>
      </div>
    );
  if (erreur)
    return (
      <div className="eh-wrap" style={{ padding: 60, textAlign: "center" }}>
        <p className="eh-muted" style={{ marginBottom: 16 }}>
          {erreur}
        </p>
        <Link
          to="/evenements"
          className="eh-btn eh-btn-ghost"
          style={{ textDecoration: "none" }}
        >
          ← Retour aux évènements
        </Link>
      </div>
    );

  const d = infosDate(ev.date_debut);
  const gratuit = !ev.prix || parseFloat(ev.prix) === 0;

  return (
    <div className="eh-rise">
      {/* En-tête sombre */}
      <div className="eh-hero" style={{ paddingBottom: 0 }}>
        <div
          className="eh-wrap"
          style={{ position: "relative", padding: "32px 26px 40px" }}
        >
          <button
            onClick={() => navigate(-1)}
            className="eh-nav-link"
            style={{ paddingLeft: 0, marginBottom: 16 }}
          >
            ← Retour
          </button>
          <span
            className="eh-pill"
            style={{
              background: "rgba(110,231,183,0.14)",
              color: "var(--mint-200)",
              marginBottom: 14,
            }}
          >
            <span
              className="eh-pill-dot"
              style={{ background: "var(--mint-300)" }}
            ></span>
            {ev.categorie.nom}
          </span>
          <h1
            style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              color: "#fff",
              lineHeight: 1.05,
              marginBottom: 18,
            }}
          >
            {ev.titre}
          </h1>
          <div
            style={{
              display: "flex",
              gap: 22,
              flexWrap: "wrap",
              color: "rgba(255,255,255,0.8)",
              fontSize: 14,
            }}
          >
            <span>🗓️ {d.full}</span>
            <span>🕒 {d.heure}</span>
            <span>📍 {ev.lieu}</span>
          </div>
        </div>
      </div>

      {/* Corps : description (gauche) + carte d'inscription (droite) */}
      <div
        className="eh-wrap"
        style={{
          padding: "40px 26px 80px",
          display: "grid",
          gridTemplateColumns: "minmax(0,1.6fr) minmax(0,1fr)",
          gap: 28,
          alignItems: "start",
        }}
      >
        <div className="eh-detail-grid" style={{ display: "contents" }}></div>

        <div>
          <div
            className="eh-cover"
            style={{ height: 220, borderRadius: 20, marginBottom: 24 }}
          >
            <span className="eh-cover-label">visuel évènement</span>
          </div>
          <h2 style={{ fontSize: 20, marginBottom: 12 }}>À propos</h2>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.65,
              color: "var(--ink-700)",
              whiteSpace: "pre-wrap",
            }}
          >
            {ev.description}
          </p>

          {ev.adresse && (
            <div style={{ marginTop: 24 }}>
              <h2 style={{ fontSize: 20, marginBottom: 8 }}>Lieu</h2>
              <p className="eh-muted">
                📍 {ev.lieu} — {ev.adresse}
              </p>
            </div>
          )}
        </div>

        {/* Carte d'inscription (sticky) */}
        <div
          className="eh-card"
          style={{ padding: 22, position: "sticky", top: 86 }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 8,
            }}
          >
            <div>
              <div className="eh-eyebrow">Tarif</div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 30,
                  fontWeight: 700,
                }}
              >
                {gratuit ? "Gratuit" : `${ev.prix} €`}
              </div>
            </div>
            <div className="eh-dateblock">
              <div className="eh-dateblock-month">{d.moisCourt}</div>
              <div className="eh-dateblock-day">{d.jour}</div>
            </div>
          </div>

          <p className="eh-muted" style={{ fontSize: 13, marginBottom: 16 }}>
            Capacité : {ev.capacite_max} places
          </p>

          {inscrit ? (
            <>
              {/* BILLET (façon maquette) */}
              <div
                style={{
                  background: "var(--mint-100)",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <span
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "var(--emerald-500)",
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  ✓
                </span>
                <div>
                  <strong style={{ color: "var(--forest-700)" }}>
                    Vous êtes inscrit·e
                  </strong>
                  <div className="eh-muted" style={{ fontSize: 12 }}>
                    Un email de confirmation vous a été envoyé.
                  </div>
                </div>
              </div>
              <div
                className="eh-card eh-card-pad"
                style={{
                  marginBottom: 12,
                  textAlign: "center",
                  borderStyle: "dashed",
                }}
              >
                <div className="eh-eyebrow" style={{ marginBottom: 6 }}>
                  🎟️ Votre billet
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 17,
                    fontWeight: 700,
                  }}
                >
                  {ev.titre}
                </div>
                <div
                  className="eh-muted"
                  style={{ fontSize: 13, marginTop: 4 }}
                >
                  {d.full} · {d.heure}
                </div>
                <div
                  className="eh-mono"
                  style={{
                    fontSize: 11,
                    marginTop: 8,
                    color: "var(--ink-400)",
                  }}
                >
                  EVT-{String(ev.id).padStart(4, "0")}
                </div>
              </div>
              <button
                onClick={seDesinscrire}
                className="eh-btn eh-btn-danger eh-btn-block"
              >
                Se désinscrire
              </button>
            </>
          ) : (
            (() => {
              const passe =
                new Date(String(ev.date_debut).replace(" ", "T")) < new Date();
              if (passe) {
                return (
                  <div
                    className="eh-pill eh-st-depublie"
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      padding: "12px",
                    }}
                  >
                    Évènement terminé
                  </div>
                );
              }
              if (ev.complet) {
                return (
                  <div
                    className="eh-pill eh-st-refuse"
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      padding: "12px",
                    }}
                  >
                    Complet — plus de place
                  </div>
                );
              }
              return (
                <>
                  <p
                    className="eh-mono"
                    style={{ fontSize: 13, marginBottom: 10, fontWeight: 700 }}
                  >
                    {ev.inscrits}/{ev.capacite_max} · {ev.places_restantes}{" "}
                    place(s) restante(s)
                  </p>
                  <button
                    onClick={sInscrire}
                    className="eh-btn eh-btn-primary eh-btn-block eh-btn-lg"
                  >
                    {token ? "S'inscrire" : "Se connecter pour s'inscrire"}
                  </button>
                </>
              );
            })()
          )}

          <p className="eh-muted" style={{ fontSize: 12.5, marginTop: 14 }}>
            Organisé par {ev.organisateur.email}
          </p>

          {message && (
            <p
              className="eh-muted"
              style={{ fontSize: 13, marginTop: 12, textAlign: "center" }}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DetailEvenement;
