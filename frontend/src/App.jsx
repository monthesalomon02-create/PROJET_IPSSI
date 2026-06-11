import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { configurerExpiration, apiFetch } from "./api";
import Navbar from "./components/Navbar";
import Accueil from "./pages/Accueil";
import Explorer from "./pages/Explorer";
import DetailEvenement from "./pages/DetailEvenement";
import PageLogin from "./pages/PageLogin";
import PageInscription from "./pages/PageInscription";
import Organisateur from "./pages/Organisateur";
import Admin from "./pages/Admin";
import "./App.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [estAdmin, setEstAdmin] = useState(false);

  const seConnecter = (t) => {
    localStorage.setItem("token", t);
    setToken(t);
  };

  const seDeconnecter = () => {
    localStorage.removeItem("token");
    setToken(null);
    setEstAdmin(false);
  };

  // Déconnexion automatique quand le token expire (401 détecté par apiFetch)
  configurerExpiration(() => {
    localStorage.removeItem("token");
    setToken(null);
    setEstAdmin(false);
  });

  // À chaque changement de token, on vérifie le rôle de l'utilisateur
  useEffect(() => {
    if (!token) {
      setEstAdmin(false);
      return;
    }
    apiFetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        setEstAdmin(
          Boolean(
            d && Array.isArray(d.roles) && d.roles.includes("ROLE_ADMIN"),
          ),
        );
      })
      .catch(() => setEstAdmin(false));
  }, [token]);

  return (
    <BrowserRouter>
      <Navbar token={token} estAdmin={estAdmin} onDeconnexion={seDeconnecter} />
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/evenements" element={<Explorer />} />
          <Route
            path="/evenements/:id"
            element={<DetailEvenement token={token} />}
          />
          <Route
            path="/login"
            element={
              token ? (
                <Navigate to="/" />
              ) : (
                <PageLogin onConnexion={seConnecter} />
              )
            }
          />
          <Route
            path="/inscription"
            element={token ? <Navigate to="/" /> : <PageInscription />}
          />
          <Route
            path="/organisateur"
            element={
              token ? <Organisateur token={token} /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/admin"
            element={token ? <Admin token={token} /> : <Navigate to="/login" />}
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
