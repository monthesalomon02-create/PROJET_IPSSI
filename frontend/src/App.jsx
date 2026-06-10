import { useState, useEffect } from "react";
import Login from "./Login";
import "./App.css";

function App() {
  const [evenements, setEvenements] = useState([]);
  const [chargement, setChargement] = useState(true);
  // On récupère un éventuel token déjà stocké (si on s'était connecté avant)
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    fetch("http://localhost:8000/api/evenements")
      .then((reponse) => reponse.json())
      .then((donnees) => {
        setEvenements(donnees);
        setChargement(false);
      })
      .catch(() => setChargement(false));
  }, []);

  const seDeconnecter = () => {
    localStorage.removeItem("token"); // on efface le token
    setToken(null);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
      {/* Barre du haut : selon qu'on est connecté ou pas */}
      {token ? (
        <div style={{ textAlign: "right" }}>
          <span>✅ Connecté</span>{" "}
          <button onClick={seDeconnecter}>Se déconnecter</button>
        </div>
      ) : (
        <Login onConnexion={(t) => setToken(t)} />
      )}

      <h1>Évènements à venir</h1>

      {chargement && <p>Chargement...</p>}
      {!chargement && evenements.length === 0 && <p>Aucun évènement publié.</p>}

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
