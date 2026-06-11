import { useState, useEffect } from "react";

function CreerEvenement({ token, onCree }) {
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [lieu, setLieu] = useState("");
  const [capaciteMax, setCapaciteMax] = useState("");
  const [categorieId, setCategorieId] = useState("");
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/api/categories")
      .then((r) => r.json())
      .then((donnees) => setCategories(Array.isArray(donnees) ? donnees : []))
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
        setTitre("");
        setDescription("");
        setDateDebut("");
        setDateFin("");
        setLieu("");
        setCapaciteMax("");
        setCategorieId("");
        if (onCree) onCree();
      } else {
        setMessage("❌ " + (donnees.erreur || "Erreur lors de la création"));
      }
    } catch {
      setMessage("Erreur de connexion au serveur");
    }
  };

  const champ = { marginBottom: 16 };
  const labelStyle = { display: "block", marginBottom: 6 };

  return (
    <form onSubmit={creer} className="eh-card eh-card-pad">
      <div className="eh-eyebrow" style={{ marginBottom: 6 }}>
        Nouvel évènement
      </div>
      <h2 style={{ fontSize: 22, marginBottom: 20 }}>Créer un évènement</h2>

      <div style={champ}>
        <label className="eh-label" style={labelStyle}>
          Titre
        </label>
        <input
          className="eh-input"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          required
          placeholder="Ex : Atelier Symfony pour débutants"
        />
      </div>

      <div style={champ}>
        <label className="eh-label" style={labelStyle}>
          Description
        </label>
        <textarea
          className="eh-textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          placeholder="Décrivez votre évènement…"
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          ...champ,
        }}
      >
        <div>
          <label className="eh-label" style={labelStyle}>
            Date de début
          </label>
          <input
            type="datetime-local"
            className="eh-input"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="eh-label" style={labelStyle}>
            Date de fin
          </label>
          <input
            type="datetime-local"
            className="eh-input"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            required
          />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 14,
          ...champ,
        }}
      >
        <div>
          <label className="eh-label" style={labelStyle}>
            Lieu
          </label>
          <input
            className="eh-input"
            value={lieu}
            onChange={(e) => setLieu(e.target.value)}
            required
            placeholder="Ex : Espace Coworking"
          />
        </div>
        <div>
          <label className="eh-label" style={labelStyle}>
            Capacité max
          </label>
          <input
            type="number"
            className="eh-input"
            value={capaciteMax}
            onChange={(e) => setCapaciteMax(e.target.value)}
            required
            placeholder="30"
          />
        </div>
      </div>

      <div style={{ marginBottom: 22 }}>
        <label className="eh-label" style={labelStyle}>
          Catégorie
        </label>
        <select
          className="eh-select"
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
      </div>

      <button type="submit" className="eh-btn eh-btn-primary eh-btn-block">
        Créer l'évènement
      </button>

      {message && (
        <p className="eh-muted" style={{ marginTop: 14, textAlign: "center" }}>
          {message}
        </p>
      )}
    </form>
  );
}

export default CreerEvenement;
