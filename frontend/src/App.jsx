import { useState, useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { configurerExpiration, apiFetch } from "./api";
import Navbar from "./components/Navbar";
import Accueil from "./pages/Accueil";
import Explorer from "./pages/Explorer";
import DetailEvenement from "./pages/DetailEvenement";
import PageLogin from "./pages/PageLogin";
import PageInscription from "./pages/PageInscription";
import Confidentialite from "./pages/Confidentialite";
import "./App.css";

// Organisateur et Admin ne sont utilisés que par des comptes authentifiés
// (Admin embarque FullCalendar, ~3,5 Mo de dépendances) : chargés à la demande
// plutôt que dans le bundle initial que reçoit chaque visiteur public.
const Organisateur = lazy(() => import("./pages/Organisateur"));
const Admin = lazy(() => import("./pages/Admin"));

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
  // (la réinitialisation à la déconnexion est déjà gérée par seDeconnecter/configurerExpiration)
  useEffect(() => {
    if (!token) {
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
        <Suspense fallback={null}>
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
                token ? (
                  <Organisateur token={token} onDeconnexion={seDeconnecter} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/admin"
              element={
                token ? <Admin token={token} /> : <Navigate to="/login" />
              }
            />
            <Route path="/confidentialite" element={<Confidentialite />} />
          </Routes>
        </Suspense>
      </main>
    </BrowserRouter>
  );
}

export default App;
