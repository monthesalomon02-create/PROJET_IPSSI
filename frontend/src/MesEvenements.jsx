import { useState, useEffect } from "react";

function MesEvenements({ token }) {
  const [evenements, setEvenements] = useState([]);
  const [message, setMessage] = useState("");

  // Fonction pour charger mes évènements (réutilisable après une soumission)
  const charger = () => {
    fetch("http://localhost:8000/api/mes-evenements", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((donnees) => setEvenements(donnees))
      .catch(() => {});
  };

  useEffect(() => {
    charger();
  }, []);

  const soumettre = async (id) => {
    setMessage("");
    try {
      const reponse = await fetch(
        `http://localhost:8000/api/evenements/${id}/soumettre`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const donnees = await reponse.json();
      if (reponse.ok) {
        setMessage("✅ Évènement soumis pour validation");
        charger(); // on rafraîchit la liste pour voir le nouveau statut
      } else {
        setMessage("❌ " + donnees.erreur);
      }
    } catch (err) {
      setMessage("Erreur de connexion");
    }
  };

  return (
    <div style={{ marginBottom: "2rem" }}>
      <h2>Mes évènements</h2>
      {message && <p>{message}</p>}
      {evenements.length === 0 && (
        <p>Vous n'avez pas encore créé d'évènement.</p>
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
          <strong>{ev.titre}</strong> — statut : <em>{ev.statut}</em>
          {ev.motif_refus && (
            <p style={{ color: "orange" }}>Motif de refus : {ev.motif_refus}</p>
          )}
          {(ev.statut === "brouillon" || ev.statut === "refuse") && (
            <div>
              <button onClick={() => soumettre(ev.id)}>
                Soumettre pour validation
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default MesEvenements;
