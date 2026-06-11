import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function PageInscription() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [message, setMessage] = useState("");
  const [succes, setSucces] = useState(false);
  const navigate = useNavigate();

  const sInscrire = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const reponse = await fetch("http://localhost:8000/api/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, nom, prenom }),
      });
      const donnees = await reponse.json();
      if (reponse.ok) {
        setSucces(true);
        setMessage("✅ Compte créé ! Vous pouvez maintenant vous connecter.");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMessage("❌ " + (donnees.erreur || "Erreur lors de l'inscription"));
      }
    } catch {
      setMessage("Erreur de connexion au serveur");
    }
  };

  return (
    <div
      className="eh-rise"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 20px",
      }}
    >
      <form
        onSubmit={sInscrire}
        className="eh-card"
        style={{ padding: 36, width: "100%", maxWidth: 460 }}
      >
        <div className="eh-eyebrow" style={{ marginBottom: 6 }}>
          EventHub
        </div>
        <h2 style={{ fontSize: 26, marginBottom: 6 }}>Créer un compte</h2>
        <p className="eh-muted" style={{ fontSize: 14, marginBottom: 24 }}>
          Rejoignez la communauté et inscrivez-vous aux évènements.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
            marginBottom: 16,
          }}
        >
          <div>
            <label
              className="eh-label"
              style={{ display: "block", marginBottom: 6 }}
            >
              Prénom
            </label>
            <input
              className="eh-input"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              required
              placeholder="Freddy"
            />
          </div>
          <div>
            <label
              className="eh-label"
              style={{ display: "block", marginBottom: 6 }}
            >
              Nom
            </label>
            <input
              className="eh-input"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
              placeholder="Nanji"
            />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label
            className="eh-label"
            style={{ display: "block", marginBottom: 6 }}
          >
            Email
          </label>
          <input
            type="email"
            className="eh-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="vous@exemple.com"
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label
            className="eh-label"
            style={{ display: "block", marginBottom: 6 }}
          >
            Mot de passe
          </label>
          <input
            type="password"
            className="eh-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          className="eh-btn eh-btn-primary eh-btn-block eh-btn-lg"
          disabled={succes}
        >
          Créer mon compte
        </button>

        {message && (
          <p
            style={{
              color: succes ? "var(--emerald-600)" : "var(--rose)",
              fontSize: 14,
              marginTop: 16,
              textAlign: "center",
            }}
          >
            {message}
          </p>
        )}

        <p
          className="eh-muted"
          style={{ fontSize: 13, marginTop: 18, textAlign: "center" }}
        >
          Déjà un compte ?{" "}
          <Link
            to="/login"
            style={{ color: "var(--emerald-600)", fontWeight: 600 }}
          >
            Se connecter
          </Link>
        </p>
      </form>
    </div>
  );
}

export default PageInscription;
