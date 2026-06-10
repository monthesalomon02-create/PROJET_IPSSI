<?php

namespace App\Controller;

use App\Entity\Evenement;
use App\Repository\CategorieRepository;
use App\Repository\EvenementRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class EvenementController extends AbstractController
{
    // READ — liste de tous les évènements
    #[Route('/api/evenements', name: 'api_evenements_list', methods: ['GET'])]
    public function list(EvenementRepository $evenementRepository): JsonResponse
    {
        $data = [];
        foreach ($evenementRepository->findPublies() as $evenement) {
            $data[] = $this->serialize($evenement);
        }

        return $this->json($data);
    }

    // READ — un seul évènement (publié = public ; brouillon = propriétaire/admin seulement)
    #[Route('/api/evenements/{id}', name: 'api_evenements_show', methods: ['GET'])]
    public function show(?Evenement $evenement): JsonResponse
    {
        if (!$evenement) {
            return $this->json(['erreur' => 'Évènement introuvable'], 404);
        }

        // Si l'évènement n'est pas publié, seul le propriétaire ou un admin peut le voir
        if ($evenement->getStatut() !== 'publie') {
            $utilisateur = $this->getUser();
            $estProprietaire = $utilisateur && $evenement->getOrganisateur() === $utilisateur;
            $estAdmin = $utilisateur && in_array('ROLE_ADMIN', $utilisateur->getRoles());

            if (!$estProprietaire && !$estAdmin) {
                // On renvoie 404 (et non 403) pour ne pas révéler l'existence du brouillon
                return $this->json(['erreur' => 'Évènement introuvable'], 404);
            }
        }

        return $this->json($this->serialize($evenement));
    }

    // CREATE — créer un évènement
    #[Route('/api/evenements', name: 'api_evenements_create', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function create(
        Request $request,
        EntityManagerInterface $em,
        CategorieRepository $categorieRepository
    ): JsonResponse {
        $donnees = json_decode($request->getContent(), true);

        // On récupère la catégorie à partir de l'id envoyé
        $categorie = $categorieRepository->find($donnees['categorie_id'] ?? 0);
        if (!$categorie) {
            return $this->json(['erreur' => 'Catégorie introuvable'], 400);
        }

        $evenement = new Evenement();
        $evenement->setTitre($donnees['titre'] ?? '');
        $evenement->setDescription($donnees['description'] ?? '');
        $evenement->setDateDebut(new \DateTime($donnees['date_debut']));
        $evenement->setDateFin(new \DateTime($donnees['date_fin']));
        $evenement->setLieu($donnees['lieu'] ?? '');
        $evenement->setAdresse($donnees['adresse'] ?? null);
        $evenement->setCapaciteMax($donnees['capacite_max'] ?? 0);
        $evenement->setPrix($donnees['prix'] ?? '0');
        $evenement->setImage($donnees['image'] ?? null);
        $evenement->setStatut('brouillon');           // tout évènement naît en brouillon
        $evenement->setDateCreation(new \DateTime());  // date du jour, automatique
        $evenement->setCategorie($categorie);

        $evenement->setStatut('brouillon');
        $evenement->setDateCreation(new \DateTime());
        $evenement->setCategorie($categorie);
        $evenement->setOrganisateur($this->getUser());

        $em->persist($evenement);
        $em->flush();

        return $this->json($this->serialize($evenement), 201);
    }

    // UPDATE — modifier un évènement
    #[Route('/api/evenements/{id}', name: 'api_evenements_update', methods: ['PUT'])]
    public function update(
        ?Evenement $evenement,
        Request $request,
        EntityManagerInterface $em,
        CategorieRepository $categorieRepository
    ): JsonResponse {
        if (!$evenement) {
            return $this->json(['erreur' => 'Évènement introuvable'], 404);
        }

        $this->denyAccessUnlessGranted(\App\Security\Voter\EvenementVoter::EDIT, $evenement);

        $donnees = json_decode($request->getContent(), true);

        if (isset($donnees['titre']))        { $evenement->setTitre($donnees['titre']); }
        if (isset($donnees['description']))  { $evenement->setDescription($donnees['description']); }
        if (isset($donnees['date_debut']))   { $evenement->setDateDebut(new \DateTime($donnees['date_debut'])); }
        if (isset($donnees['date_fin']))     { $evenement->setDateFin(new \DateTime($donnees['date_fin'])); }
        if (isset($donnees['lieu']))         { $evenement->setLieu($donnees['lieu']); }
        if (isset($donnees['adresse']))      { $evenement->setAdresse($donnees['adresse']); }
        if (isset($donnees['capacite_max'])) { $evenement->setCapaciteMax($donnees['capacite_max']); }
        if (isset($donnees['prix']))         { $evenement->setPrix($donnees['prix']); }
        if (isset($donnees['image']))        { $evenement->setImage($donnees['image']); }

        if (isset($donnees['categorie_id'])) {
            $categorie = $categorieRepository->find($donnees['categorie_id']);
            if ($categorie) {
                $evenement->setCategorie($categorie);
            }
        }

        $em->flush();

        return $this->json($this->serialize($evenement));
    }

    // DELETE — supprimer un évènement
    #[Route('/api/evenements/{id}', name: 'api_evenements_delete', methods: ['DELETE'])]
    public function delete(?Evenement $evenement, EntityManagerInterface $em): JsonResponse
    {
        if (!$evenement) {
            return $this->json(['erreur' => 'Évènement introuvable'], 404);
        }
        $this->denyAccessUnlessGranted(\App\Security\Voter\EvenementVoter::DELETE, $evenement);

        $em->remove($evenement);
        $em->flush();

        return $this->json(['message' => 'Évènement supprimé']);
    }

    // L'organisateur soumet son évènement pour validation
    #[Route('/api/evenements/{id}/soumettre', name: 'api_evenements_soumettre', methods: ['PATCH'])]
    public function soumettre(?Evenement $evenement, EntityManagerInterface $em): JsonResponse
    {
        if (!$evenement) {
            return $this->json(['erreur' => 'Évènement introuvable'], 404);
        }

        // Seul le propriétaire (ou un admin) peut soumettre — on réutilise le Voter
        $this->denyAccessUnlessGranted(\App\Security\Voter\EvenementVoter::EDIT, $evenement);

        // On ne peut soumettre que depuis "brouillon" ou "refuse"
        if (!in_array($evenement->getStatut(), ['brouillon', 'refuse'])) {
            return $this->json([
                'erreur' => 'Seul un évènement en brouillon ou refusé peut être soumis (statut actuel : ' . $evenement->getStatut() . ')'
            ], 409);
        }

        $evenement->setStatut('en_attente');
        $evenement->setDateSoumission(new \DateTime());
        $evenement->setMotifRefus(null); // on efface un éventuel ancien motif de refus

        $em->flush();

        return $this->json($this->serialize($evenement));
    }

    // L'admin approuve un évènement en attente → il est publié
    #[Route('/api/evenements/{id}/approuver', name: 'api_evenements_approuver', methods: ['PATCH'])]
    #[IsGranted('ROLE_ADMIN')]
    public function approuver(?Evenement $evenement, EntityManagerInterface $em): JsonResponse
    {
        if (!$evenement) {
            return $this->json(['erreur' => 'Évènement introuvable'], 404);
        }

        if ($evenement->getStatut() !== 'en_attente') {
            return $this->json([
                'erreur' => 'Seul un évènement en attente peut être approuvé (statut actuel : ' . $evenement->getStatut() . ')'
            ], 409);
        }

        $evenement->setStatut('publie');
        $evenement->setDateValidation(new \DateTime());
        $evenement->setMotifRefus(null);

        $em->flush();

        return $this->json($this->serialize($evenement));
    }

    // L'admin refuse un évènement en attente → il est refusé, avec un motif
    #[Route('/api/evenements/{id}/refuser', name: 'api_evenements_refuser', methods: ['PATCH'])]
    #[IsGranted('ROLE_ADMIN')]
    public function refuser(?Evenement $evenement, Request $request, EntityManagerInterface $em): JsonResponse
    {
        if (!$evenement) {
            return $this->json(['erreur' => 'Évènement introuvable'], 404);
        }

        if ($evenement->getStatut() !== 'en_attente') {
            return $this->json([
                'erreur' => 'Seul un évènement en attente peut être refusé (statut actuel : ' . $evenement->getStatut() . ')'
            ], 409);
        }

        $donnees = json_decode($request->getContent(), true);
        $motif = $donnees['motif'] ?? null;

        if (empty($motif)) {
            return $this->json(['erreur' => 'Un motif de refus est obligatoire'], 400);
        }

        $evenement->setStatut('refuse');
        $evenement->setMotifRefus($motif);
        $evenement->setDateValidation(new \DateTime());

        $em->flush();

        return $this->json($this->serialize($evenement));
    }

    // Transformation d'un Evenement en tableau pour le JSON
    private function serialize(Evenement $evenement): array
    {
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
}