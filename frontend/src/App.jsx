import { useState, useEffect } from "react";
import Login from "./Login";
import CreerEvenement from "./CreerEvenement";
import MesEvenements from "./MesEvenements";
import AdminModeration from "./AdminModeration";
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

  const sInscrire = async (evenementId) => {
    if (!token) {
      alert("Vous devez être connecté pour vous inscrire");
      return;
    }

    try {
      const reponse = await fetch(
        `http://localhost:8000/api/evenements/${evenementId}/inscription`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // on envoie le token !
          },
        },
      );

      const donnees = await reponse.json();

      if (reponse.ok) {
        alert(
          "✅ " +
            donnees.message +
            " (places restantes : " +
            donnees.places_restantes +
            ")",
        );
      } else {
        alert("❌ " + donnees.erreur);
      }
    } catch (err) {
      alert("Erreur de connexion au serveur");
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
      <h1 className="text-3xl font-bold text-primary-600">Test Tailwind ✅</h1>
      {/* Barre du haut : selon qu'on est connecté ou pas */}
      {token ? (
        <div>
          <div style={{ textAlign: "right" }}>
            <span>✅ Connecté</span>{" "}
            <button onClick={seDeconnecter}>Se déconnecter</button>
          </div>
          <CreerEvenement token={token} />
          <MesEvenements token={token} />
          <AdminModeration token={token} />
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
          <button onClick={() => sInscrire(evenement.id)}>S'inscrire</button>
        </div>
      ))}
    </div>
  );
}

export default App;
