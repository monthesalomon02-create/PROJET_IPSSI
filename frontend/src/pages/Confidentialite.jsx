function Confidentialite() {
  return (
    <div className="eh-wrap" style={{ padding: "48px 26px 80px", maxWidth: 760 }}>
      <div className="eh-eyebrow" style={{ marginBottom: 6 }}>
        EventHub
      </div>
      <h1 style={{ fontSize: 30, marginBottom: 24 }}>
        Politique de confidentialité
      </h1>

      <p className="eh-muted" style={{ fontSize: 13, marginBottom: 24 }}>
        Ce document est une politique de confidentialité simplifiée, rédigée
        dans le cadre d'un projet de formation (EventHub est une plateforme
        fictive). Elle décrit néanmoins les principes réellement appliqués
        par l'application.
      </p>

      <h2 style={{ fontSize: 18, marginTop: 28, marginBottom: 8 }}>
        1. Données collectées
      </h2>
      <p style={{ fontSize: 14, lineHeight: 1.6 }}>
        Lors de la création d'un compte, EventHub collecte votre nom, prénom,
        adresse email et un mot de passe (stocké de façon irréversible sous
        forme hachée, jamais en clair). Lorsque vous vous inscrivez à un
        évènement, la date d'inscription et l'évènement concerné sont
        enregistrés.
      </p>

      <h2 style={{ fontSize: 18, marginTop: 28, marginBottom: 8 }}>
        2. Utilisation des données
      </h2>
      <p style={{ fontSize: 14, lineHeight: 1.6 }}>
        Ces données servent uniquement au fonctionnement de la plateforme :
        authentification, gestion des inscriptions aux évènements, envoi
        d'un email de confirmation d'inscription. Elles ne sont ni vendues
        ni transmises à des tiers.
      </p>

      <h2 style={{ fontSize: 18, marginTop: 28, marginBottom: 8 }}>
        3. Vos droits
      </h2>
      <p style={{ fontSize: 14, lineHeight: 1.6 }}>
        Conformément au RGPD, vous pouvez à tout moment demander la
        suppression de vos données personnelles depuis votre espace
        organisateur ("Zone dangereuse" → "Supprimer mon compte"). Vos
        informations identifiantes (nom, prénom, email) sont alors
        anonymisées ; vos évènements et inscriptions existants sont
        conservés sous une identité anonyme afin de préserver l'intégrité
        des données des autres utilisateurs (places restantes, historique).
      </p>

      <h2 style={{ fontSize: 18, marginTop: 28, marginBottom: 8 }}>
        4. Sécurité
      </h2>
      <p style={{ fontSize: 14, lineHeight: 1.6 }}>
        Les mots de passe sont hachés, les communications avec l'API
        utilisent un jeton d'authentification (JWT), et l'accès aux données
        est limité par des règles d'autorisation selon votre rôle.
      </p>
    </div>
  );
}

export default Confidentialite;
