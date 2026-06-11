import { useState } from "react";

function PageLogin({ onConnexion }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState("");

  const seConnecter = async (e) => {
    e.preventDefault();
    setErreur("");
    try {
      const reponse = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!reponse.ok) {
        setErreur("Email ou mot de passe incorrect");
        return;
      }
      const donnees = await reponse.json();
      onConnexion(donnees.token);
    } catch {
      setErreur("Erreur de connexion au serveur");
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
        onSubmit={seConnecter}
        className="eh-card"
        style={{ padding: 36, width: "100%", maxWidth: 420 }}
      >
        <div className="eh-eyebrow" style={{ marginBottom: 6 }}>
          EventHub
        </div>
        <h2 style={{ fontSize: 26, marginBottom: 24 }}>Connexion</h2>

        <div style={{ marginBottom: 16 }}>
          <label
            className="eh-label"
            style={{ display: "block", marginBottom: 6 }}
          >
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="eh-input"
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="eh-input"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          className="eh-btn eh-btn-primary eh-btn-block eh-btn-lg"
        >
          Se connecter
        </button>

        {erreur && (
          <p
            style={{
              color: "var(--rose)",
              fontSize: 14,
              marginTop: 16,
              textAlign: "center",
            }}
          >
            {erreur}
          </p>
        )}
      </form>
    </div>
  );
}

export default PageLogin;
