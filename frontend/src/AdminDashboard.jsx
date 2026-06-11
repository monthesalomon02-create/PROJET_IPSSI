import { useState, useEffect } from "react";
import { apiFetch } from "./api";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

function AdminDashboard({ token }) {
  const [evenements, setEvenements] = useState([]);
  const [message, setMessage] = useState("");

  const charger = () => {
    // La liste publique ne renvoie que les "publie". Pour un vrai dashboard admin
    // on combine : les publiés (route publique) + la file d'attente (en_attente).
    apiFetch("/api/evenements")
      .then((r) => (r.ok ? r.json() : []))
      .then((pub) => {
        apiFetch("/api/admin/file-attente")
          .then((r) => (r.ok ? r.json() : []))
          .then((att) => {
            const tout = [
              ...(Array.isArray(pub) ? pub : []),
              ...(Array.isArray(att) ? att : []),
            ];
            setEvenements(tout);
          })
          .catch(() => setEvenements(Array.isArray(pub) ? pub : []));
      })
      .catch(() => setEvenements([]));
  };

  useEffect(() => {
    charger();
  }, []);

  const supprimer = async (id) => {
    if (!window.confirm("Supprimer définitivement cet évènement ?")) return;
    setMessage("");
    try {
      const r = await apiFetch(`/api/evenements/${id}`, { method: "DELETE" });
      const d = await r.json();
      setMessage(
        r.ok ? "🗑️ Évènement supprimé" : "❌ " + (d.erreur || "Erreur"),
      );
      if (r.ok) charger();
    } catch {
      setMessage("Erreur de connexion");
    }
  };

  const maintenant = new Date();
  const publies = evenements.filter((e) => e.statut === "publie");
  const enAttente = evenements.filter((e) => e.statut === "en_attente");
  const passes = publies.filter(
    (e) => new Date(String(e.date_debut).replace(" ", "T")) < maintenant,
  );
  const totalInscrits = publies.reduce((s, e) => s + (e.inscrits || 0), 0);

  // Évènements pour le calendrier
  const eventsCalendrier = publies.map((e) => ({
    title: e.titre,
    start: String(e.date_debut).replace(" ", "T"),
    color: "#16a34a",
  }));

  return (
    <div
      className="eh-rise"
      style={{ display: "flex", flexDirection: "column", gap: 28 }}
    >
      {message && <p className="eh-muted">{message}</p>}

      {/* STATS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
        }}
      >
        <Stat label="Évènements en ligne" valeur={publies.length} icone="✅" />
        <Stat label="En attente" valeur={enAttente.length} icone="⏳" />
        <Stat label="Participants totaux" valeur={totalInscrits} icone="👥" />
        <Stat label="Évènements passés" valeur={passes.length} icone="📅" />
      </div>

      {/* CALENDRIER */}
      <div className="eh-card eh-card-pad">
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>
          📅 Calendrier des évènements publiés
        </h2>
        <div className="eh-calendar">
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            locale="fr"
            events={eventsCalendrier}
            height="auto"
            firstDay={1}
            buttonText={{ today: "Aujourd'hui" }}
          />
        </div>
      </div>

      {/* SIGNALEMENT DES PASSÉS */}
      {passes.length > 0 && (
        <div
          className="eh-card eh-card-pad"
          style={{ borderColor: "var(--amber)", background: "var(--amber-bg)" }}
        >
          <h3 style={{ fontSize: 16, marginBottom: 8, color: "var(--amber)" }}>
            ⚠️ {passes.length} évènement(s) déjà passé(s)
          </h3>
          <p className="eh-muted" style={{ fontSize: 13.5 }}>
            Ces évènements sont terminés. Vous pouvez les supprimer ci-dessous
            s'ils ne sont plus pertinents.
          </p>
        </div>
      )}

      {/* LISTE PUBLIÉS AVEC SUPPRESSION */}
      <div>
        <h2 style={{ fontSize: 18, marginBottom: 14 }}>Évènements en ligne</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {publies.length === 0 && (
            <p className="eh-muted">Aucun évènement publié.</p>
          )}
          {publies.map((e) => {
            const passe =
              new Date(String(e.date_debut).replace(" ", "T")) < maintenant;
            return (
              <div
                key={e.id}
                className="eh-card eh-card-pad"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      marginBottom: 4,
                      flexWrap: "wrap",
                    }}
                  >
                    <strong style={{ fontSize: 15 }}>{e.titre}</strong>
                    {passe && (
                      <span className="eh-pill eh-st-depublie">Terminé</span>
                    )}
                    {e.complet && !passe && (
                      <span className="eh-pill eh-st-refuse">Complet</span>
                    )}
                  </div>
                  <span className="eh-muted" style={{ fontSize: 13 }}>
                    {e.categorie.nom} · {e.inscrits || 0}/{e.capacite_max}{" "}
                    inscrits · {e.lieu}
                  </span>
                </div>
                <button
                  onClick={() => supprimer(e.id)}
                  className="eh-btn eh-btn-danger eh-btn-sm"
                >
                  🗑️ Supprimer
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, valeur, icone }) {
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

export default AdminDashboard;
