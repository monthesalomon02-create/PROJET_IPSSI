# EventHub — Plateforme de gestion d'évènements

Application web de publication et de gestion d'évènements, développée dans le cadre du titre professionnel **Concepteur Développeur d'Applications (CDA)**.

Elle permet à des organisateurs de créer des évènements, à un administrateur de les valider, et au public de les consulter et de s'y inscrire.

---

## Sommaire

- [Stack technique](#stack-technique)
- [Fonctionnalités](#fonctionnalités)
- [Prérequis](#prérequis)
- [Installation et lancement](#installation-et-lancement)
- [Comptes de démonstration](#comptes-de-démonstration)
- [Architecture du projet](#architecture-du-projet)
- [Tests](#tests)
- [Intégration continue](#intégration-continue)

---

## Stack technique

| Couche               | Technologie                        |
| -------------------- | ---------------------------------- |
| Back-end             | Symfony 7 (API REST)               |
| Front-end            | React 18 + Vite                    |
| Base de données      | MySQL 8                            |
| Authentification     | JWT (LexikJWTAuthenticationBundle) |
| Conteneurisation     | Docker / Docker Compose            |
| Tests                | PHPUnit                            |
| Intégration continue | GitHub Actions                     |
| Emails               | Symfony Mailer (SMTP)              |

---

## Fonctionnalités

- **Visiteurs** : consultation des évènements publiés, recherche et filtres par catégorie, page de détail.
- **Membres** : création de compte, connexion, inscription/désinscription aux évènements, billet personnel.
- **Organisateurs** : création, modification et soumission d'évènements ; suivi du statut de validation.
- **Administrateurs** : validation ou refus des évènements (avec motif), gestion des catégories, tableau de bord avec statistiques et calendrier, suppression d'évènements.
- **Workflow de validation** : brouillon → en attente → publié / refusé.
- **Contrôle de capacité** : places restantes, badge « complet », badge « terminé » pour les évènements passés.

---

## Prérequis

- [Docker](https://docs.docker.com/get-docker/) et Docker Compose
- Git

Aucune installation de PHP, Node ou MySQL n'est nécessaire sur la machine : tout tourne dans des conteneurs.

---

## Installation et lancement

### 1. Cloner le dépôt

```bash
git clone https://github.com/Leroy020699/PROJET_IPSSI.git
cd PROJET_IPSSI
```

### 2. Configurer l'envoi d'emails (optionnel)

La confirmation d'inscription par email nécessite un service SMTP. Copiez le fichier d'exemple et renseignez vos identifiants :

```bash
cp backend/.env.local.example backend/.env.local
```

Puis éditez `backend/.env.local` avec votre DSN (ex. [Mailtrap](https://mailtrap.io/) pour les tests). Sans cette configuration, l'application fonctionne ; seul l'envoi d'email échouera silencieusement.

### 3. Lancer le projet

```bash
docker compose up --build
```

C'est tout. Au **premier démarrage**, le projet réalise automatiquement :

1. l'installation des dépendances PHP (Composer) ;
2. la génération des clés JWT ;
3. l'attente de la base de données ;
4. la création des tables (migrations) ;
5. le chargement des données de démonstration (fixtures) ;
6. le démarrage du serveur.

Les démarrages suivants **préservent les données** existantes.

### 4. Accéder à l'application

- **Front-end** : http://localhost:5173
- **API back-end** : http://localhost:8000

---

## Comptes de démonstration

Au premier lancement, la base est peuplée avec ces comptes :

| Rôle           | Email                | Mot de passe |
| -------------- | -------------------- | ------------ |
| Administrateur | `admin@eventhub.fr`  | `admin123`   |
| Organisateur   | `orga1@eventhub.fr`  | `user123`    |
| Membre         | `membre1@exemple.fr` | `user123`    |

Des évènements variés (publiés, passés, en attente de validation, brouillon, refusé) sont également créés pour illustrer toutes les fonctionnalités.

---

## Architecture du projet

```
.
├── backend/                # API REST Symfony
│   ├── src/
│   │   ├── Controller/      # Points d'entrée de l'API
│   │   ├── Entity/          # Entités Doctrine (Utilisateur, Evenement, Categorie, Inscription)
│   │   ├── Repository/      # Requêtes personnalisées
│   │   ├── Security/        # Voter (droits sur les évènements)
│   │   └── DataFixtures/    # Données de démonstration
│   ├── migrations/          # Historique du schéma de base de données
│   ├── tests/               # Tests unitaires et fonctionnels
│   └── docker-entrypoint.sh # Script de démarrage automatisé
├── frontend/                # Application React (Vite)
│   └── src/
│       ├── pages/           # Pages (Accueil, Explorer, Détail, Admin, etc.)
│       └── components/      # Composants réutilisables
├── .github/workflows/       # Pipeline d'intégration continue
└── docker-compose.yml       # Orchestration des conteneurs
```

L'application suit une architecture **client-serveur découplée** : un front-end React communique avec une API REST Symfony via des requêtes HTTP authentifiées par jeton JWT.

---

## Tests

Les tests s'exécutent dans le conteneur PHP, sur une base de données dédiée et isolée :

```bash
docker compose exec php php bin/phpunit
```

La suite comprend des **tests unitaires** (logique des entités) et des **tests fonctionnels** (routes de l'API, contrôle des accès).

---

## Intégration continue

À chaque `push`, [GitHub Actions](https://github.com/Leroy020699/PROJET_IPSSI/actions) recrée un environnement neuf, monte une base MySQL temporaire, applique les migrations et exécute la suite de tests. Un commit n'est validé que si tous les tests passent.

---

## Auteur

Projet réalisé par **Monthe Salomon** — Titre professionnel Concepteur Développeur d'Applications.
