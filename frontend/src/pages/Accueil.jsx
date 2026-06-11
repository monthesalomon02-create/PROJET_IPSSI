import { useState, useEffect } from "react";

function Accueil({ token }) {
  const [evenements, setEvenements] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/evenements")
      .then((r) => r.json())
      .then((donnees) => {
        setEvenements(Array.isArray(donnees) ? donnees : []);
        setChargement(false);
      })
      .catch(() => setChargement(false));
  }, []);

  const sInscrire = async (id) => {
    if (!token) {
      alert("Vous devez être connecté pour vous inscrire");
      return;
    }
    try {
      const r = await fetch(
        `http://localhost:8000/api/evenements/${id}/inscription`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const d = await r.json();
      alert(
        r.ok
          ? `✅ ${d.message} (places restantes : ${d.places_restantes})`
          : `❌ ${d.erreur}`,
      );
    } catch {
      alert("Erreur de connexion au serveur");
    }
  };

  return (
    <div>
      {/* Bandeau d'en-tête (hero) */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Découvrez nos évènements
          </h1>
          <p className="text-lg text-primary-100">
            Conférences, ateliers et rencontres près de chez vous
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {chargement && (
          <p className="text-gray-500 text-center">Chargement...</p>
        )}
        {!chargement && evenements.length === 0 && (
          <p className="text-gray-500 text-center">
            Aucun évènement publié pour le moment.
          </p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {evenements.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col"
            >
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-24 flex items-center justify-center">
                <span className="text-5xl">📅</span>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <span className="inline-block self-start bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                  {ev.categorie.nom}
                </span>
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {ev.titre}
                </h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                  {ev.description}
                </p>
                <div className="text-sm text-gray-500 space-y-1 mb-4">
                  <p>🗓️ {ev.date_debut}</p>
                  <p>📍 {ev.lieu}</p>
                </div>
                <button
                  onClick={() => sInscrire(ev.id)}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
                >
                  S'inscrire
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Accueil;
