import { useState, useEffect } from "react";
import "./App.css";

function App() {
  // "state" : une variable que React surveille. Quand elle change, l'affichage se met à jour.
  const [evenements, setEvenements] = useState([]); // la liste des évènements (vide au départ)
  const [chargement, setChargement] = useState(true); // est-ce qu'on est en train de charger ?

  // useEffect : du code qui s'exécute au chargement de la page
  useEffect(() => {
    fetch("http://localhost:8000/api/evenements") // on appelle ton API
      .then((reponse) => reponse.json()) // on transforme la réponse en JSON
      .then((donnees) => {
        setEvenements(donnees); // on range les évènements dans le state
        setChargement(false); // on a fini de charger
      })
      .catch((erreur) => {
        console.error("Erreur :", erreur);
        setChargement(false);
      });
  }, []); // le [] vide = "exécute une seule fois, au démarrage"

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
      <h1>Évènements à venir</h1>

      {chargement && <p>Chargement...</p>}

      {!chargement && evenements.length === 0 && (
        <p>Aucun évènement publié pour le moment.</p>
      )}

      {evenements.map((evenement) => (
        <div
          key={evenement.id}
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <h2>{evenement.titre}</h2>
          <p>{evenement.description}</p>
          <p>
            📅 {evenement.date_debut} &nbsp; 📍 {evenement.lieu}
          </p>
          <p>Catégorie : {evenement.categorie.nom}</p>
        </div>
      ))}
    </div>
  );
}

export default App;
