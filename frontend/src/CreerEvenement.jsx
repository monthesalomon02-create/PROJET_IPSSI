import { useState, useEffect } from "react";

function CreerEvenement({ token, onCree }) {
  // Les champs du formulaire
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [lieu, setLieu] = useState("");
  const [capaciteMax, setCapaciteMax] = useState("");
  const [categorieId, setCategorieId] = useState("");

  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");

  // Au chargement, on récupère la liste des catégories pour le menu déroulant
  useEffect(() => {
    fetch("http://localhost:8000/api/categories")
      .then((r) => r.json())
      .then((donnees) => setCategories(donnees))
      .catch(() => {});
  }, []);

  const creer = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const reponse = await fetch("http://localhost:8000/api/evenements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          titre,
          description,
          date_debut: dateDebut,
          date_fin: dateFin,
          lieu,
          capacite_max: parseInt(capaciteMax),
          prix: "0",
          categorie_id: parseInt(categorieId),
        }),
      });

      const donnees = await reponse.json();

      if (reponse.ok) {
        setMessage("✅ Évènement créé en brouillon (id " + donnees.id + ")");
        if (onCree) onCree(); // prévient le parent pour rafraîchir si besoin
      } else {
        setMessage("❌ " + (donnees.erreur || "Erreur lors de la création"));
      }
    } catch (err) {
      setMessage("Erreur de connexion au serveur");
    }
  };

  return (
    <form
      onSubmit={creer}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "1rem",
        marginBottom: "2rem",
      }}
    >
      <h2>Créer un évènement</h2>

      <input
        placeholder="Titre"
        value={titre}
        onChange={(e) => setTitre(e.target.value)}
        required
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      <label>Date de début :</label>
      <input
        type="datetime-local"
        value={dateDebut}
        onChange={(e) => setDateDebut(e.target.value)}
        required
      />

      <label>Date de fin :</label>
      <input
        type="datetime-local"
        value={dateFin}
        onChange={(e) => setDateFin(e.target.value)}
        required
      />

      <input
        placeholder="Lieu"
        value={lieu}
        onChange={(e) => setLieu(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Capacité max"
        value={capaciteMax}
        onChange={(e) => setCapaciteMax(e.target.value)}
        required
      />

      <label>Catégorie :</label>
      <select
        value={categorieId}
        onChange={(e) => setCategorieId(e.target.value)}
        required
      >
        <option value="">-- Choisir --</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.nom}
          </option>
        ))}
      </select>

      <button type="submit">Créer</button>

      {message && <p>{message}</p>}
    </form>
  );
}

export default CreerEvenement;
