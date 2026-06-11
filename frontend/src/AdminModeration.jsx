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
function formatDate(s) {
  const d = new Date(String(s).replace(" ", "T"));
  if (isNaN(d)) return { jour: "--", mois: "---", full: "" };
  const jours = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
  return {
    jour: d.getDate(),
    mois: MOIS[d.getMonth()],
    full: `${jours[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()].toLowerCase()} ${d.getFullYear()}`,
  };
}

// Motifs de refus prédéfinis (comme dans la maquette)
const MOTIFS_PREDEFINIS = [
  "Description trop succincte ou imprécise.",
  "Informations manquantes (lieu, horaires).",
  "Contenu hors thématique de la plateforme.",
  "Doublon avec un évènement existant.",
];

function AdminModeration({ token }) {
  const [evenements, setEvenements] = useState([]);
  const [message, setMessage] = useState("");
  const [refus, setRefus] = useState(null); // l'évènement en cours de refus (ouvre la modale)

  const charger = () => {
    apiFetch("/api/admin/file-attente")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setEvenements(Array.isArray(d) ? d : []))
      .catch(() => setEvenements([]));
  };

  useEffect(() => {
    charger();
  }, []);

  const approuver = async (id) => {
    setMessage("");
    try {
      const r = await apiFetch(`/api/evenements/${id}/approuver`, {
        method: "PATCH",
      });
      const d = await r.json();
      setMessage(r.ok ? "✅ Évènement approuvé et publié" : "❌ " + d.erreur);
      if (r.ok) charger();
    } catch {
      setMessage("Erreur de connexion");
    }
  };

  const confirmerRefus = async (motif) => {
    if (!motif.trim()) return;
    setMessage("");
    try {
      const r = await apiFetch(`/api/evenements/${refus.id}/refuser`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motif }),
      });
      const d = await r.json();
      setMessage(
        r.ok ? "Évènement refusé — organisateur notifié" : "❌ " + d.erreur,
      );
      setRefus(null);
      if (r.ok) charger();
    } catch {
      setMessage("Erreur de connexion");
      setRefus(null);
    }
  };

  return (
    <div className="eh-rise">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 18,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <h2 style={{ fontSize: 20 }}>Demandes de publication</h2>
        <span className="eh-tag">⏳ {evenements.length} en attente</span>
      </div>

      {message && (
        <p className="eh-muted" style={{ marginBottom: 14 }}>
          {message}
        </p>
      )}

      {evenements.length === 0 ? (
        <div
          className="eh-card eh-card-pad"
          style={{ textAlign: "center", padding: "50px 20px" }}
        >
          <div style={{ fontSize: 32, marginBottom: 10 }}>✅</div>
          <h3 style={{ fontSize: 18, marginBottom: 4 }}>File vide</h3>
          <p className="eh-muted">
            Toutes les demandes ont été traitées. Beau travail !
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {evenements.map((ev) => {
            const date = formatDate(ev.date_debut);
            return (
              <div
                key={ev.id}
                className="eh-card"
                style={{ overflow: "hidden", display: "flex" }}
              >
                <div
                  style={{
                    width: 6,
                    background: "var(--amber)",
                    flexShrink: 0,
                  }}
                ></div>
                <div className="eh-card-pad" style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                    }}
                  >
                    <div className="eh-dateblock">
                      <div className="eh-dateblock-month">{date.mois}</div>
                      <div className="eh-dateblock-day">{date.jour}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                          marginBottom: 6,
                          flexWrap: "wrap",
                        }}
                      >
                        <span className="eh-pill eh-st-attente">
                          <span
                            className="eh-pill-dot"
                            style={{ background: "currentColor" }}
                          ></span>
                          En attente
                        </span>
                        <span className="eh-tag">{ev.categorie.nom}</span>
                      </div>
                      <h3 style={{ fontSize: 18, marginBottom: 6 }}>
                        {ev.titre}
                      </h3>
                      <p
                        className="eh-muted"
                        style={{
                          fontSize: 13.5,
                          lineHeight: 1.5,
                          marginBottom: 8,
                        }}
                      >
                        {ev.description}
                      </p>
                      <div className="eh-muted" style={{ fontSize: 13 }}>
                        🗓️ {date.full} · 📍 {ev.lieu} · 👤{" "}
                        {ev.organisateur.email}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      marginTop: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      onClick={() => approuver(ev.id)}
                      className="eh-btn eh-btn-primary eh-btn-sm"
                    >
                      ✅ Approuver &amp; publier
                    </button>
                    <button
                      onClick={() => setRefus(ev)}
                      className="eh-btn eh-btn-danger eh-btn-sm"
                    >
                      ❌ Refuser…
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {refus && (
        <ModaleRefus
          evenement={refus}
          onAnnuler={() => setRefus(null)}
          onConfirmer={confirmerRefus}
        />
      )}
    </div>
  );
}

function ModaleRefus({ evenement, onAnnuler, onConfirmer }) {
  const [motif, setMotif] = useState("");
  return (
    <div className="eh-overlay" onClick={onAnnuler}>
      <div className="eh-modal" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            background: "var(--rose-bg)",
            padding: "22px 26px",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <h3 style={{ fontSize: 19, color: "var(--ink-900)" }}>
            Refuser la demande
          </h3>
          <span className="eh-muted" style={{ fontSize: 13 }}>
            {evenement.titre}
          </span>
        </div>
        <div
          className="eh-card-pad"
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <div>
            <span
              className="eh-label"
              style={{ display: "block", marginBottom: 8 }}
            >
              Motif communiqué à l'organisateur *
            </span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {MOTIFS_PREDEFINIS.map((p) => (
                <button
                  key={p}
                  onClick={() => setMotif(p)}
                  className="eh-tag"
                  style={{
                    cursor: "pointer",
                    borderColor: motif === p ? "var(--rose)" : "var(--line)",
                    color: motif === p ? "var(--rose)" : "var(--ink-600)",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <textarea
            className="eh-textarea"
            placeholder="Expliquez ce qui doit être corrigé pour que l'organisateur puisse re-soumettre…"
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            style={{ minHeight: 100 }}
          />
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onAnnuler}
              className="eh-btn eh-btn-ghost eh-btn-block"
            >
              Annuler
            </button>
            <button
              onClick={() => onConfirmer(motif)}
              disabled={!motif.trim()}
              className="eh-btn eh-btn-block"
              style={{ background: "var(--rose)", color: "#fff" }}
            >
              Confirmer le refus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminModeration;
