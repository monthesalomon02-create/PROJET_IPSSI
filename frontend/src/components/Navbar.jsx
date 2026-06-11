import { Link, useLocation } from "react-router-dom";

function Navbar({ token, estAdmin, onDeconnexion }) {
  const location = useLocation();
  const estActif = (chemin) => location.pathname === chemin;

  return (
    <nav className="eh-appbar">
      <Link to="/" className="eh-brand">
        <span className="eh-brand-mark">🎉</span>
        <span className="eh-brand-name">
          Event<span className="accent">Hub</span>
        </span>
      </Link>

      <div style={{ flex: 1 }}></div>

      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <Link to="/" className={`eh-nav-link ${estActif("/") ? "active" : ""}`}>
          Accueil
        </Link>
        <Link
          to="/evenements"
          className={`eh-nav-link ${estActif("/evenements") ? "active" : ""}`}
        >
          Explorer
        </Link>

        {token ? (
          <>
            <Link
              to="/organisateur"
              className={`eh-nav-link ${estActif("/organisateur") ? "active" : ""}`}
            >
              Mon espace
            </Link>
            {estAdmin && (
              <Link
                to="/admin"
                className={`eh-nav-link ${estActif("/admin") ? "active" : ""}`}
              >
                Admin
              </Link>
            )}
            <button
              onClick={onDeconnexion}
              className="eh-btn eh-btn-sm"
              style={{
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                marginLeft: "8px",
              }}
            >
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link
              to="/inscription"
              className={`eh-nav-link ${estActif("/inscription") ? "active" : ""}`}
            >
              Créer un compte
            </Link>
            <Link
              to="/login"
              className="eh-btn eh-btn-primary eh-btn-sm"
              style={{ marginLeft: "8px", textDecoration: "none" }}
            >
              Connexion
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
