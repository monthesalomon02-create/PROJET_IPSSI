<?php

namespace App\Service;

use App\Entity\Evenement;
use App\Entity\Utilisateur;
use App\Repository\CategorieRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class EvenementService
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ValidatorInterface $validator,
        private readonly CategorieRepository $categorieRepository,
    ) {
    }

    public function creer(array $donnees, Utilisateur $organisateur): Evenement
    {
        $categorie = $this->categorieRepository->find($donnees['categorie_id'] ?? 0);
        if (!$categorie) {
            throw new ServiceException('Catégorie introuvable', 400);
        }

        $evenement = new Evenement();
        $evenement->setTitre($donnees['titre'] ?? '');
        $evenement->setDescription($donnees['description'] ?? '');
        $evenement->setDateDebut(new \DateTime($donnees['date_debut'] ?? 'now'));
        $evenement->setDateFin(new \DateTime($donnees['date_fin'] ?? 'now'));
        $evenement->setLieu($donnees['lieu'] ?? '');
        $evenement->setAdresse($donnees['adresse'] ?? null);
        $evenement->setCapaciteMax($donnees['capacite_max'] ?? 0);
        $evenement->setPrix($donnees['prix'] ?? '0');
        $evenement->setImage($donnees['image'] ?? null);
        $evenement->setStatut('brouillon'); // tout évènement naît en brouillon
        $evenement->setDateCreation(new \DateTime());
        $evenement->setCategorie($categorie);
        $evenement->setOrganisateur($organisateur);

        $this->valider($evenement);

        $this->em->persist($evenement);
        $this->em->flush();

        return $evenement;
    }

    public function modifier(Evenement $evenement, array $donnees): Evenement
    {
        if (isset($donnees['titre'])) {
            $evenement->setTitre($donnees['titre']);
        }
        if (isset($donnees['description'])) {
            $evenement->setDescription($donnees['description']);
        }
        if (isset($donnees['date_debut'])) {
            $evenement->setDateDebut(new \DateTime($donnees['date_debut']));
        }
        if (isset($donnees['date_fin'])) {
            $evenement->setDateFin(new \DateTime($donnees['date_fin']));
        }
        if (isset($donnees['lieu'])) {
            $evenement->setLieu($donnees['lieu']);
        }
        if (isset($donnees['adresse'])) {
            $evenement->setAdresse($donnees['adresse']);
        }
        if (isset($donnees['capacite_max'])) {
            $evenement->setCapaciteMax($donnees['capacite_max']);
        }
        if (isset($donnees['prix'])) {
            $evenement->setPrix($donnees['prix']);
        }
        if (isset($donnees['image'])) {
            $evenement->setImage($donnees['image']);
        }

        if (isset($donnees['categorie_id'])) {
            $categorie = $this->categorieRepository->find($donnees['categorie_id']);
            if ($categorie) {
                $evenement->setCategorie($categorie);
            }
        }

        $this->valider($evenement);

        $this->em->flush();

        return $evenement;
    }

    public function supprimer(Evenement $evenement): void
    {
        $this->em->remove($evenement);
        $this->em->flush();
    }

    // L'organisateur soumet son évènement pour validation
    public function soumettre(Evenement $evenement): Evenement
    {
        if (!in_array($evenement->getStatut(), ['brouillon', 'refuse'], true)) {
            throw new ServiceException(
                'Seul un évènement en brouillon ou refusé peut être soumis (statut actuel : ' . $evenement->getStatut() . ')',
                409
            );
        }

        $evenement->setStatut('en_attente');
        $evenement->setDateSoumission(new \DateTime());
        $evenement->setMotifRefus(null); // on efface un éventuel ancien motif de refus

        $this->em->flush();

        return $evenement;
    }

    // L'admin approuve un évènement en attente → il est publié
    public function approuver(Evenement $evenement): Evenement
    {
        if ($evenement->getStatut() !== 'en_attente') {
            throw new ServiceException(
                'Seul un évènement en attente peut être approuvé (statut actuel : ' . $evenement->getStatut() . ')',
                409
            );
        }

        $evenement->setStatut('publie');
        $evenement->setDateValidation(new \DateTime());
        $evenement->setMotifRefus(null);

        $this->em->flush();

        return $evenement;
    }

    // L'admin refuse un évènement en attente → il est refusé, avec un motif
    public function refuser(Evenement $evenement, ?string $motif): Evenement
    {
        if ($evenement->getStatut() !== 'en_attente') {
            throw new ServiceException(
                'Seul un évènement en attente peut être refusé (statut actuel : ' . $evenement->getStatut() . ')',
                409
            );
        }

        if (empty($motif)) {
            throw new ServiceException('Un motif de refus est obligatoire', 400);
        }

        $evenement->setStatut('refuse');
        $evenement->setMotifRefus($motif);
        $evenement->setDateValidation(new \DateTime());

        $this->em->flush();

        return $evenement;
    }

    // Transformation d'un Evenement en tableau pour le JSON
    public function serialize(Evenement $evenement): array
    {
        $nbInscrits = 0;
        foreach ($evenement->getInscriptions() as $inscription) {
            if ($inscription->getStatut() === 'confirmee') {
                $nbInscrits++;
            }
        }

        return [
            'id' => $evenement->getId(),
            'titre' => $evenement->getTitre(),
            'description' => $evenement->getDescription(),
            'date_debut' => $evenement->getDateDebut()?->format('Y-m-d H:i'),
            'date_fin' => $evenement->getDateFin()?->format('Y-m-d H:i'),
            'lieu' => $evenement->getLieu(),
            'adresse' => $evenement->getAdresse(),
            'capacite_max' => $evenement->getCapaciteMax(),
            'prix' => $evenement->getPrix(),
            'image' => $evenement->getImage(),
            'statut' => $evenement->getStatut(),
            'motif_refus' => $evenement->getMotifRefus(),
            'date_soumission' => $evenement->getDateSoumission()?->format('Y-m-d H:i'),
            'inscrits' => $nbInscrits,
            'places_restantes' => max(0, $evenement->getCapaciteMax() - $nbInscrits),
            'complet' => $nbInscrits >= $evenement->getCapaciteMax(),
            'categorie' => [
                'id' => $evenement->getCategorie()->getId(),
                'nom' => $evenement->getCategorie()->getNom(),
            ],
            'organisateur' => [
                'id' => $evenement->getOrganisateur()->getId(),
                'email' => $evenement->getOrganisateur()->getEmail(),
            ],
        ];
    }

    private function valider(Evenement $evenement): void
    {
        $violations = $this->validator->validate($evenement);
        if (count($violations) > 0) {
            $erreurs = [];
            foreach ($violations as $violation) {
                $erreurs[] = $violation->getMessage();
            }

            throw new ServiceException(implode(' ', $erreurs), 400);
        }
    }
}
