import { useState } from "react";
import CreerEvenement from "../CreerEvenement";
import MesEvenements from "../MesEvenements";
import { apiFetch } from "../api";

function Organisateur({ token, onDeconnexion }) {
  const [vue, setVue] = useState("liste"); // "liste" | "formulaire"
  const [aEditer, setAEditer] = useState(null); // l'évènement à modifier (ou null = création)
  const [rechargement, setRechargement] = useState(0);
  const [confirmationSuppression, setConfirmationSuppression] = useState(false);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const [erreurSuppression, setErreurSuppression] = useState("");

  const supprimerCompte = async () => {
    setSuppressionEnCours(true);
    setErreurSuppression("");
    try {
      const r = await apiFetch("/api/me", { method: "DELETE" });
      if (r.ok) {
        onDeconnexion();
      } else {
        const d = await r.json();
        setErreurSuppression(d.erreur || "Erreur lors de la suppression du compte");
        setSuppressionEnCours(false);
      }
    } catch {
      setErreurSuppression("Erreur de connexion au serveur");
      setSuppressionEnCours(false);
    }
  };

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

      {/* Zone RGPD : suppression (anonymisation) du compte */}
      <div
        className="eh-card eh-card-pad"
        style={{ marginTop: 48, borderColor: "var(--rose)" }}
      >
        <h2 style={{ fontSize: 16, marginBottom: 6 }}>Zone dangereuse</h2>
        <p className="eh-muted" style={{ fontSize: 13, marginBottom: 12 }}>
          Conformément au RGPD, vous pouvez demander la suppression de vos
          données personnelles à tout moment. Voir notre{" "}
          <a href="/confidentialite">politique de confidentialité</a>.
        </p>

        {!confirmationSuppression ? (
          <button
            onClick={() => setConfirmationSuppression(true)}
            className="eh-btn eh-btn-danger"
          >
            Supprimer mon compte
          </button>
        ) : (
          <div>
            <p style={{ fontSize: 13, marginBottom: 10 }}>
              Cette action est irréversible. Confirmez-vous la suppression de
              votre compte ?
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={supprimerCompte}
                disabled={suppressionEnCours}
                className="eh-btn eh-btn-danger"
              >
                {suppressionEnCours ? "Suppression..." : "Confirmer la suppression"}
              </button>
              <button
                onClick={() => setConfirmationSuppression(false)}
                className="eh-btn eh-btn-ghost"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {erreurSuppression && (
          <p style={{ color: "var(--rose)", fontSize: 13, marginTop: 10 }}>
            {erreurSuppression}
          </p>
        )}
      </div>
    </div>
  );
}

export default Organisateur;
