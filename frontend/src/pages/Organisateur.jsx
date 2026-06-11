import { useState } from "react";
import CreerEvenement from "../CreerEvenement";
import MesEvenements from "../MesEvenements";

function Organisateur({ token }) {
  const [vue, setVue] = useState("liste"); // "liste" | "formulaire"
  const [aEditer, setAEditer] = useState(null); // l'évènement à modifier (ou null = création)
  const [rechargement, setRechargement] = useState(0);

  const ouvrirCreation = () => {
    setAEditer(null);
    setVue("formulaire");
  };
  const ouvrirEdition = (ev) => {
    setAEditer(ev);
    setVue("formulaire");
  };
  const retourListe = () => {
    setRechargement((n) => n + 1);
    setAEditer(null);
    setVue("liste");
  };

  return (
    <div className="eh-wrap" style={{ padding: "40px 26px 80px" }}>
      {vue === "liste" ? (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 16,
              flexWrap: "wrap",
              marginBottom: 28,
            }}
          >
            <div>
              <div className="eh-eyebrow" style={{ marginBottom: 6 }}>
                Espace organisateur
              </div>
              <h1 style={{ fontSize: 30 }}>Mes évènements</h1>
              <p className="eh-muted" style={{ marginTop: 6, maxWidth: 480 }}>
                Créez vos évènements, suivez leur statut et modifiez-les à tout
                moment.
              </p>
            </div>
            <button onClick={ouvrirCreation} className="eh-btn eh-btn-primary">
              + Créer un évènement
            </button>
          </div>

          <MesEvenements
            key={rechargement}
            token={token}
            onModifier={ouvrirEdition}
          />
        </>
      ) : (
        <>
          <button
            onClick={retourListe}
            className="eh-nav-link"
            style={{
              color: "var(--ink-700)",
              marginBottom: 16,
              paddingLeft: 0,
            }}
          >
            ← Retour à mes évènements
          </button>
          <CreerEvenement
            token={token}
            evenementAEditer={aEditer}
            onCree={retourListe}
          />
        </>
      )}
    </div>
  );
}

export default Organisateur;
