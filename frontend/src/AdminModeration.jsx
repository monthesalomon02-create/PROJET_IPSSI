import { useState, useEffect } from "react";

function AdminModeration({ token }) {
  const [evenements, setEvenements] = useState([]);
  const [message, setMessage] = useState("");

  const charger = () => {
    fetch("http://localhost:8000/api/admin/file-attente", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) return []; // si pas admin (403), on renvoie une liste vide
        return r.json();
      })
      .then((donnees) => setEvenements(donnees))
      .catch(() => {});
  };

  useEffect(() => {
    charger();
  }, []);

  const approuver = async (id) => {
    setMessage("");
    try {
      const reponse = await fetch(
        `http://localhost:8000/api/evenements/${id}/approuver`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const donnees = await reponse.json();
      if (reponse.ok) {
        setMessage("✅ Évènement approuvé et publié");
        charger();
      } else {
        setMessage("❌ " + donnees.erreur);
      }
    } catch (err) {
      setMessage("Erreur de connexion");
    }
  };

  const refuser = async (id) => {
    const motif = prompt("Motif du refus :");
    if (!motif) return; // si l'admin annule ou laisse vide, on ne fait rien
    setMessage("");
    try {
      const reponse = await fetch(
        `http://localhost:8000/api/evenements/${id}/refuser`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ motif }),
        },
      );
      const donnees = await reponse.json();
      if (reponse.ok) {
        setMessage("Évènement refusé");
        charger();
      } else {
        setMessage("❌ " + donnees.erreur);
      }
    } catch (err) {
      setMessage("Erreur de connexion");
    }
  };

  return (
    <div
      style={{
        marginBottom: "2rem",
        border: "2px solid #c0392b",
        borderRadius: "8px",
        padding: "1rem",
      }}
    >
      <h2>🛡️ Espace admin — File d'attente</h2>
      {message && <p>{message}</p>}
      {evenements.length === 0 && (
        <p>Aucun évènement en attente de validation.</p>
      )}

      {evenements.map((ev) => (
        <div
          key={ev.id}
          style={{
            border: "1px solid #eee",
            borderRadius: "6px",
            padding: "0.75rem",
            marginBottom: "0.5rem",
          }}
        >
          <strong>{ev.titre}</strong>
          <p>{ev.description}</p>
          <p>
            📅 {ev.date_debut} — 📍 {ev.lieu} — Organisé par :{" "}
            {ev.organisateur.email}
          </p>
          <button onClick={() => approuver(ev.id)}>✅ Approuver</button>{" "}
          <button onClick={() => refuser(ev.id)}>❌ Refuser</button>
        </div>
      ))}
    </div>
  );
}

export default AdminModeration;
