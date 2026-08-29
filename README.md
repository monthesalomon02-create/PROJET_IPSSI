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
- [Contrôle de version](#contrôle-de-version)
- [Confidentialité et RGPD](#confidentialité-et-rgpd)

---

## Stack technique

| Couche               | Technologie                        |
| -------------------- | ---------------------------------- |
| Back-end             | Symfony 7 (API REST)               |
| Front-end            | React 18 + Vite                    |
| Base de données      | MySQL 8                            |
| Authentification     | JWT (LexikJWTAuthenticationBundle) |
| Validation           | Symfony Validator                  |
| Sécurité             | Rate limiting sur la connexion (brute-force) |
| API externe          | OpenWeatherMap (météo des évènements) |
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
git clone https://github.com/monthesalomon02-create/PROJET_IPSSI.git
cd PROJET_IPSSI
```

### 2. Configurer l'envoi d'emails (optionnel)

La confirmation d'inscription par email nécessite un service SMTP. Copiez le fichier d'exemple et renseignez vos identifiants :

```bash
cp backend/.env.local.example backend/.env.local
```

Puis éditez `backend/.env.local` avec votre DSN (ex. [Mailtrap](https://mailtrap.io/) pour les tests). Sans cette configuration, l'application fonctionne ; seul l'envoi d'email échouera silencieusement.

### 3. Configurer la météo des évènements (optionnel)

La page de détail d'un évènement affiche, si possible, la météo prévue à la date et au lieu de l'évènement, via l'API externe [OpenWeatherMap](https://openweathermap.org/api). Ajoutez votre clé (gratuite) dans `backend/.env.local` :

```
OPENWEATHER_API_KEY=votre_cle_api
```

Sans clé, ou si l'évènement est à plus de 5 jours (limite de l'offre gratuite), la carte météo ne s'affiche simplement pas — aucune erreur.

### 4. Lancer le projet

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

### 5. Accéder à l'application

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
│   │   ├── Controller/      # Points d'entrée de l'API (fins, délèguent aux Services)
│   │   ├── Service/         # Logique métier (workflow évènements, inscriptions, météo)
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

**Back-end** — les tests s'exécutent dans le conteneur PHP, sur une base de données dédiée et isolée (aucune fixture n'y est chargée, chaque test crée ses propres données) :

```bash
docker compose exec php php bin/phpunit
```

La suite comprend des **tests unitaires** (logique des entités), des **tests fonctionnels** (workflow de validation des évènements, inscriptions, RGPD, contrôle des accès) ainsi que des tests de **sécurité** (injection d'un payload `<script>`) et de **performance** (temps de réponse).

**Front-end** — tests de composants et de parcours utilisateur (Vitest + Testing Library) :

```bash
docker compose exec frontend npm run test
```

---

## Intégration continue

À chaque `push`, [GitHub Actions](https://github.com/monthesalomon02-create/PROJET_IPSSI/actions) exécute trois jobs :

- `tests-backend` : recrée un environnement neuf, monte une base MySQL temporaire, applique les migrations, vérifie le style de code (PSR-12 via PHP CS Fixer) et exécute la suite PHPUnit.
- `tests-frontend` : installe les dépendances npm, lance ESLint, exécute la suite de tests (Vitest + Testing Library) puis un build Vite.
- `build-docker` (après succès des deux jobs précédents) : construit les images Docker backend et frontend, pour prouver que l'application se package correctement.

Un commit n'est validé que si tous les jobs passent.

---

## Contrôle de version

Le dépôt suit une organisation de branches simplifiée :

- `main` — versions stables, correspondant aux livrables de jalon.
- `develop` — branche d'intégration où convergent les fonctionnalités en cours.
- des branches `feature/...` pour chaque fonctionnalité, fusionnées dans `develop` via pull request.

---

## Confidentialité et RGPD

EventHub manipule des données personnelles (nom, prénom, email). Conformément au RGPD :

- Les mots de passe sont hachés (jamais stockés en clair) via l'algorithme par défaut de Symfony (bcrypt/argon2).
- Une [politique de confidentialité](frontend/src/pages/Confidentialite.jsx) simplifiée est accessible depuis la barre de navigation (`/confidentialite`), même si EventHub reste une plateforme fictive dans le cadre de ce projet.
- Chaque utilisateur peut demander la suppression de ses données personnelles depuis son espace organisateur (« Zone dangereuse » → « Supprimer mon compte »). Le compte est **anonymisé** plutôt que supprimé physiquement — nom, prénom et email sont écrasés et le mot de passe est invalidé — car ses évènements et inscriptions existants (clés étrangères non nullables) doivent être conservés pour ne pas casser les données des autres utilisateurs (places restantes, historique).

---

## Auteur

Projet réalisé par **Monthe Salomon** — Titre professionnel Concepteur Développeur d'Applications.
