import { useState, useEffect } from "react";

const STATUT_STYLE = {
  brouillon: {
    cls: "eh-st-brouillon",
    label: "Brouillon",
    barre: "var(--slate)",
  },
  en_attente: {
    cls: "eh-st-attente",
    label: "En attente",
    barre: "var(--amber)",
  },
  publie: { cls: "eh-st-publie", label: "Publié", barre: "var(--emerald-500)" },
  refuse: { cls: "eh-st-refuse", label: "Refusé", barre: "var(--rose)" },
  depublie: { cls: "eh-st-depublie", label: "Dépublié", barre: "var(--slate)" },
};

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
  if (isNaN(d)) return { jour: "--", mois: "--", full: "" };
  const jours = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
  return {
    jour: d.getDate(),
    mois: MOIS[d.getMonth()],
    full: `${jours[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()].toLowerCase()} ${d.getFullYear()}`,
  };
}

function MesEvenements({ token }) {
  const [evenements, setEvenements] = useState([]);
  const [message, setMessage] = useState("");
  const [filtre, setFiltre] = useState("tous");

  const charger = () => {
    fetch("http://localhost:8000/api/mes-evenements", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setEvenements(Array.isArray(d) ? d : []))
      .catch(() => setEvenements([]));
  };

  useEffect(() => {
    charger();
  }, []);

  const soumettre = async (id) => {
    setMessage("");
    try {
      const r = await fetch(
        `http://localhost:8000/api/evenements/${id}/soumettre`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const d = await r.json();
      setMessage(
        r.ok ? "✅ Évènement soumis pour validation" : "❌ " + d.erreur,
      );
      if (r.ok) charger();
    } catch {
      setMessage("Erreur de connexion");
    }
  };

  // Statistiques calculées à partir de mes évènements
  const stats = {
    publies: evenements.filter((e) => e.statut === "publie").length,
    attente: evenements.filter((e) => e.statut === "en_attente").length,
    brouillons: evenements.filter((e) => e.statut === "brouillon").length,
    refuses: evenements.filter((e) => e.statut === "refuse").length,
  };

  // Filtrage par onglet
  const FILTRES = [
    { k: "tous", label: "Tous" },
    { k: "brouillon", label: "Brouillons" },
    { k: "en_attente", label: "En attente" },
    { k: "publie", label: "Publiés" },
    { k: "refuse", label: "Refusés" },
  ];
  const liste =
    filtre === "tous"
      ? evenements
      : evenements.filter((e) => e.statut === filtre);

  return (
    <div className="eh-rise">
      {/* CARTES DE STATISTIQUES */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatCard
          label="Évènements publiés"
          valeur={stats.publies}
          icone="✅"
        />
        <StatCard
          label="En attente de validation"
          valeur={stats.attente}
          icone="⏳"
        />
        <StatCard label="Brouillons" valeur={stats.brouillons} icone="📝" />
        <StatCard label="Refusés" valeur={stats.refuses} icone="❌" />
      </div>

      {/* BANDEAU CYCLE DE VALIDATION */}
      <div
        className="eh-card eh-card-pad"
        style={{
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <span className="eh-eyebrow">Cycle de validation</span>
        <Etape couleur="var(--slate)" label="Brouillon" />
        <span className="eh-muted">→</span>
        <Etape couleur="var(--amber)" label="En attente" />
        <span className="eh-muted">→</span>
        <Etape couleur="var(--emerald-500)" label="Publié" />
        <span className="eh-muted" style={{ marginLeft: "auto", fontSize: 13 }}>
          Un évènement n'est visible qu'une fois{" "}
          <strong>validé par un administrateur</strong>.
        </span>
      </div>

      {/* ONGLETS DE FILTRAGE */}
      <div
        style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}
      >
        {FILTRES.map((f) => (
          <button
            key={f.k}
            onClick={() => setFiltre(f.k)}
            className="eh-btn eh-btn-sm"
            style={
              filtre === f.k
                ? { background: "var(--forest-800)", color: "#fff" }
                : {
                    background: "var(--card)",
                    color: "var(--ink-700)",
                    border: "1px solid var(--line-strong)",
                  }
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {message && (
        <p className="eh-muted" style={{ marginBottom: 12 }}>
          {message}
        </p>
      )}
      {liste.length === 0 && (
        <p className="eh-muted">Aucun évènement dans cette catégorie.</p>
      )}

      {/* LISTE DES ÉVÈNEMENTS */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {liste.map((ev) => {
          const st = STATUT_STYLE[ev.statut] || STATUT_STYLE.brouillon;
          const date = formatDate(ev.date_debut);
          return (
            <div
              key={ev.id}
              className="eh-card"
              style={{ overflow: "hidden", display: "flex" }}
            >
              {/* barre colorée à gauche */}
              <div
                style={{ width: 6, background: st.barre, flexShrink: 0 }}
              ></div>
              <div
                className="eh-card-pad"
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
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
                    <span className={`eh-pill ${st.cls}`}>
                      <span
                        className="eh-pill-dot"
                        style={{ background: "currentColor" }}
                      ></span>
                      {st.label}
                    </span>
                    <span className="eh-tag">{ev.categorie.nom}</span>
                  </div>
                  <h3 style={{ fontSize: 17, marginBottom: 4 }}>{ev.titre}</h3>
                  <span className="eh-muted" style={{ fontSize: 13 }}>
                    🗓️ {date.full} · 📍 {ev.lieu}
                  </span>
                  {ev.motif_refus && (
                    <p
                      style={{
                        color: "var(--amber)",
                        fontSize: 13,
                        marginTop: 8,
                        background: "var(--amber-bg)",
                        padding: "8px 12px",
                        borderRadius: 8,
                      }}
                    >
                      Motif de refus : {ev.motif_refus}
                    </p>
                  )}
                </div>

                {(ev.statut === "brouillon" || ev.statut === "refuse") && (
                  <button
                    onClick={() => soumettre(ev.id)}
                    className="eh-btn eh-btn-primary eh-btn-sm"
                  >
                    ➤ Soumettre
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Petit composant carte de statistique
function StatCard({ label, valeur, icone }) {
  return (
    <div className="eh-card eh-card-pad">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <span
          className="eh-mono"
          style={{
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--ink-500)",
            fontWeight: 700,
          }}
        >
          {label}
        </span>
        <span style={{ fontSize: 18 }}>{icone}</span>
      </div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 38,
          fontWeight: 700,
          marginTop: 8,
          lineHeight: 1,
        }}
      >
        {valeur}
      </div>
    </div>
  );
}

// Étape du cycle de validation
function Etape({ couleur, label }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      <span
        style={{
          width: 9,
          height: 9,
          borderRadius: "50%",
          background: couleur,
        }}
      ></span>
      {label}
    </span>
  );
}

export default MesEvenements;
