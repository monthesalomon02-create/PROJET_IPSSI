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
    <div className="flex items-center justify-center px-4 py-16">
      <form
        onSubmit={seConnecter}
        className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Connexion
        </h2>

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mot de passe
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />

        <button
          type="submit"
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
        >
          Se connecter
        </button>

        {erreur && (
          <p className="text-red-500 text-sm mt-4 text-center">{erreur}</p>
        )}
      </form>
    </div>
  );
}

export default PageLogin;
