import { useState } from "react";

function Login({ onConnexion }) {
  // Les champs du formulaire (state)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState("");

  // Fonction appelée quand on soumet le formulaire
  const seConnecter = async (e) => {
    e.preventDefault(); // empêche le rechargement de la page
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
      // On stocke le token dans le navigateur
      localStorage.setItem("token", donnees.token);
      // On prévient le composant parent qu'on est connecté
      onConnexion(donnees.token);
    } catch {
      setErreur("Erreur de connexion au serveur");
    }
  };

  return (
    <form
      onSubmit={seConnecter}
      style={{
        maxWidth: "400px",
        margin: "2rem auto",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      <h2>Connexion</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button type="submit">Se connecter</button>

      {erreur && <p style={{ color: "red" }}>{erreur}</p>}
    </form>
  );
}

export default Login;
