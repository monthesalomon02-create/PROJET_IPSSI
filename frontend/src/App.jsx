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

      <h1 className="text-3xl font-bold text-primary-800 mb-6">
        Évènements à venir
      </h1>

      {chargement && <p className="text-gray-500">Chargement...</p>}

      {!chargement && evenements.length === 0 && (
        <p className="text-gray-500">Aucun évènement publié pour le moment.</p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {evenements.map((evenement) => (
          <div
            key={evenement.id}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100"
          >
            <div className="bg-primary-600 h-2"></div>
            <div className="p-5">
              <span className="inline-block bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                {evenement.categorie.nom}
              </span>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {evenement.titre}
              </h2>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {evenement.description}
              </p>
              <div className="text-sm text-gray-500 space-y-1 mb-4">
                <p>📅 {evenement.date_debut}</p>
                <p>📍 {evenement.lieu}</p>
              </div>
              <button
                onClick={() => sInscrire(evenement.id)}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                S'inscrire
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
