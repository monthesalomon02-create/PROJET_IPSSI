import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Accueil from "./pages/Accueil";
import PageLogin from "./pages/PageLogin";
import Organisateur from "./pages/Organisateur";
import Admin from "./pages/Admin";
import "./App.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const seConnecter = (t) => {
    localStorage.setItem("token", t);
    setToken(t);
  };

  const seDeconnecter = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <BrowserRouter>
      <Navbar token={token} onDeconnexion={seDeconnecter} />
      <main className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Accueil token={token} />} />
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
