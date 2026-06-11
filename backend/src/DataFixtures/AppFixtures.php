<?php

namespace App\DataFixtures;

use App\Entity\Categorie;
use App\Entity\Evenement;
use App\Entity\Inscription;
use App\Entity\Utilisateur;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    public function __construct(private UserPasswordHasherInterface $hasher)
    {
    }

    public function load(ObjectManager $manager): void
    {
        // ---------------------------------------------------------------
        // 1. UTILISATEURS
        // ---------------------------------------------------------------
        $admin = new Utilisateur();
        $admin->setEmail('admin@eventhub.fr');
        $admin->setRoles(['ROLE_ADMIN']);
        $admin->setPassword($this->hasher->hashPassword($admin, 'admin123'));
        $admin->setNom('Martin');
        $admin->setPrenom('Alice');
        $admin->setIsActive(true);
        $admin->setDateInscription(new \DateTime('-3 months'));
        $manager->persist($admin);

        // Organisateurs (ROLE_USER, ils créent des évènements)
        $organisateurs = [];
        $infosOrga = [
            ['orga1@eventhub.fr', 'Dubois', 'Karim'],
            ['orga2@eventhub.fr', 'Leroy', 'Sophie'],
            ['orga3@eventhub.fr', 'Nguyen', 'Thomas'],
        ];
        foreach ($infosOrga as $i => $info) {
            $u = new Utilisateur();
            $u->setEmail($info[0]);
            $u->setRoles(['ROLE_USER']);
            $u->setPassword($this->hasher->hashPassword($u, 'user123'));
            $u->setNom($info[1]);
            $u->setPrenom($info[2]);
            $u->setIsActive(true);
            $u->setDateInscription(new \DateTime('-2 months'));
            $manager->persist($u);
            $organisateurs[] = $u;
        }

        // Participants (pour remplir les inscriptions)
        $participants = [];
        for ($i = 1; $i <= 12; $i++) {
            $p = new Utilisateur();
            $p->setEmail("membre{$i}@exemple.fr");
            $p->setRoles(['ROLE_USER']);
            $p->setPassword($this->hasher->hashPassword($p, 'user123'));
            $p->setNom('Membre');
            $p->setPrenom("Numero{$i}");
            $p->setIsActive(true);
            $p->setDateInscription(new \DateTime('-1 month'));
            $manager->persist($p);
            $participants[] = $p;
        }

        // ---------------------------------------------------------------
        // 2. CATÉGORIES
        // ---------------------------------------------------------------
        $donneesCategories = [
            ['Conférence', 'conference', 'Présentations et interventions d\'experts.'],
            ['Atelier', 'atelier', 'Sessions pratiques en petit groupe.'],
            ['Meetup', 'meetup', 'Rencontres informelles entre passionnés.'],
            ['Hackathon', 'hackathon', 'Marathons de création en équipe.'],
            ['Table ronde', 'table-ronde', 'Débats et échanges autour d\'un thème.'],
        ];
        $categories = [];
        foreach ($donneesCategories as $d) {
            $c = new Categorie();
            $c->setNom($d[0]);
            $c->setSlug($d[1]);
            $c->setDescription($d[2]);
            $manager->persist($c);
            $categories[] = $c;
        }

        // ---------------------------------------------------------------
        // 3. ÉVÈNEMENTS (variés : statuts, dates, capacités)
        // ---------------------------------------------------------------
        // Format : [titre, description, joursDecalage, dureeHeures, lieu, adresse, capacite, prix, indexCategorie, statut, nbInscrits]
        $donneesEvenements = [
            // --- PUBLIÉS À VENIR ---
            ['React Lyon — Server Components en production', 'Retour d\'expérience sur la migration vers les React Server Components à grande échelle : architecture, pièges et gains de performance.', 12, 3, 'La Commune', '46 Rue Saint-Antoine, 69003 Lyon', 90, '0', 0, 'publie', 80],
            ['Atelier Docker & CI/CD — du commit au déploiement', 'Atelier pratique : conteneuriser une application, écrire un pipeline GitHub Actions complet, et déployer en continu.', 18, 4, 'Campus Numérique', '12 Rue des Serruriers, 69002 Lyon', 30, '25', 1, 'publie', 30],
            ['Conférence IA & Éthique', 'Une soirée pour confronter les promesses de l\'IA générative aux enjeux d\'éthique, de biais et de régulation.', 25, 2, 'Hôtel de Région', '1 Esplanade François Mitterrand, 69002 Lyon', 200, '0', 0, 'publie', 134],
            ['Hackathon Climat — 48h pour la transition', 'Deux jours pour prototyper des solutions numériques au service de la transition écologique. Mentors et jury de professionnels.', 30, 48, 'H7 — Totem French Tech', '70 Quai Perrache, 69002 Lyon', 120, '0', 3, 'publie', 47],
            ['Design Systems : industrialiser ses composants', 'Comment passer d\'une librairie de composants à un véritable design system adopté par toutes les équipes.', 35, 3, 'Le Tubé', '15 Rue du Griffon, 69001 Lyon', 60, '15', 1, 'publie', 23],
            ['Meetup Rust — vers la performance sans peur', 'Découverte de Rust pour les développeurs venus d\'autres horizons. Ownership, borrow checker et live coding.', 40, 2, 'La Commune', '46 Rue Saint-Antoine, 69003 Lyon', 70, '0', 2, 'publie', 12],
            ['Table ronde : l\'avenir du télétravail dans la tech', 'Quatre intervenants débattent des nouveaux modèles d\'organisation du travail dans les entreprises tech.', 45, 2, 'WeWork Part-Dieu', '52 Quai Rambaud, 69002 Lyon', 80, '0', 4, 'publie', 35],
            ['Atelier UX — places limitées', 'Atelier intimiste en très petit groupe sur les fondamentaux de l\'expérience utilisateur. Inscriptions closes une fois la salle pleine.', 15, 3, 'Le Tubé', '15 Rue du Griffon, 69001 Lyon', 10, '0', 1, 'publie', 10],
            
            // --- PUBLIÉS PASSÉS (pour tester "Terminé") ---
            ['Introduction au Machine Learning', 'Une demi-journée pour comprendre les fondamentaux du ML : régression, classification, et premiers modèles.', -20, 4, 'Campus Numérique', '12 Rue des Serruriers, 69002 Lyon', 50, '10', 0, 'publie', 48],
            ['Meetup PHP — les nouveautés de la 8.3', 'Tour d\'horizon des nouveautés de PHP 8.3 et retours d\'expérience sur la migration.', -10, 2, 'La Commune', '46 Rue Saint-Antoine, 69003 Lyon', 60, '0', 2, 'publie', 40],

            // --- EN ATTENTE DE VALIDATION (file admin) ---
            ['Atelier accessibilité web (RGAA)', 'Rendre ses interfaces accessibles : bonnes pratiques, tests et conformité au RGAA.', 28, 3, 'Le Tubé', '15 Rue du Griffon, 69001 Lyon', 40, '20', 1, 'en_attente', 0],
            ['Conférence : sécurité des applications web', 'Panorama des failles OWASP Top 10 et stratégies de défense concrètes pour les développeurs.', 33, 2, 'Hôtel de Région', '1 Esplanade François Mitterrand, 69002 Lyon', 150, '0', 0, 'en_attente', 0],

            // --- BROUILLON ---
            ['Meetup Kotlin (en préparation)', 'Brouillon : rencontre autour de Kotlin et du développement Android moderne.', 50, 2, 'À définir', null, 50, '0', 2, 'brouillon', 0],

            // --- REFUSÉ (avec motif) ---
            ['Soirée networking (refusée)', 'Brouillon refusé : description trop succincte, à compléter.', 22, 3, 'Bar à définir', null, 100, '0', 4, 'refuse', 0],
        ];

        foreach ($donneesEvenements as $d) {
            $ev = new Evenement();
            $ev->setTitre($d[0]);
            $ev->setDescription($d[1]);

            $debut = new \DateTime();
            $debut->modify(($d[2] >= 0 ? '+' : '') . $d[2] . ' days');
            $debut->setTime(18, 30);
            $fin = (clone $debut)->modify('+' . $d[3] . ' hours');

            $ev->setDateDebut($debut);
            $ev->setDateFin($fin);
            $ev->setLieu($d[4]);
            $ev->setAdresse($d[5]);
            $ev->setCapaciteMax($d[6]);
            $ev->setPrix($d[7]);
            $ev->setImage(null);
            $ev->setCategorie($categories[$d[8]]);
            $ev->setStatut($d[9]);
            $ev->setOrganisateur($organisateurs[array_rand($organisateurs)]);
            $ev->setDateCreation(new \DateTime('-1 month'));

            // Dates de workflow selon le statut
            if (in_array($d[9], ['en_attente', 'publie', 'refuse'])) {
                $ev->setDateSoumission(new \DateTime('-3 weeks'));
            }
            if ($d[9] === 'publie') {
                $ev->setDateValidation(new \DateTime('-2 weeks'));
            }
            if ($d[9] === 'refuse') {
                $ev->setMotifRefus('Description trop succincte. Merci de détailler le programme et le public visé.');
            }

            $manager->persist($ev);

            // Inscriptions (uniquement pour les publiés)
            $nbInscrits = $d[10];
            for ($i = 0; $i < $nbInscrits && $i < count($participants); $i++) {
                $inscription = new Inscription();
                $inscription->setUtilisateur($participants[$i]);
                $inscription->setEvenement($ev);
                $inscription->setStatut('confirmee');
                $inscription->setDateInscription(new \DateTime('-1 week'));
                $manager->persist($inscription);
            }
        }

        $manager->flush();
    }
}