<?php

namespace App\Controller;

use App\Entity\Evenement;
use App\Repository\EvenementRepository;
use App\Service\EvenementService;
use App\Service\ServiceException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class EvenementController extends AbstractController
{
    // READ — liste de tous les évènements
    #[Route('/api/evenements', name: 'api_evenements_list', methods: ['GET'])]
    public function list(EvenementRepository $evenementRepository, EvenementService $service): JsonResponse
    {
        $data = array_map(
            fn (Evenement $e) => $service->serialize($e),
            $evenementRepository->findPublies()
        );

        return $this->json($data);
    }

    // READ — un seul évènement (publié = public ; brouillon = propriétaire/admin seulement)
    #[Route('/api/evenements/{id}', name: 'api_evenements_show', methods: ['GET'])]
    public function show(?Evenement $evenement, EvenementService $service): JsonResponse
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

        return $this->json($service->serialize($evenement));
    }

    // CREATE — créer un évènement
    #[Route('/api/evenements', name: 'api_evenements_create', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function create(Request $request, EvenementService $service): JsonResponse
    {
        $donnees = json_decode($request->getContent(), true) ?? [];

        try {
            $evenement = $service->creer($donnees, $this->getUser());
        } catch (ServiceException $e) {
            return $this->json(['erreur' => $e->getMessage()], $e->getStatusCode());
        }

        return $this->json($service->serialize($evenement), 201);
    }

    // UPDATE — modifier un évènement
    #[Route('/api/evenements/{id}', name: 'api_evenements_update', methods: ['PUT'])]
    public function update(?Evenement $evenement, Request $request, EvenementService $service): JsonResponse
    {
        if (!$evenement) {
            return $this->json(['erreur' => 'Évènement introuvable'], 404);
        }

        $this->denyAccessUnlessGranted(\App\Security\Voter\EvenementVoter::EDIT, $evenement);

        $donnees = json_decode($request->getContent(), true) ?? [];

        try {
            $evenement = $service->modifier($evenement, $donnees);
        } catch (ServiceException $e) {
            return $this->json(['erreur' => $e->getMessage()], $e->getStatusCode());
        }

        return $this->json($service->serialize($evenement));
    }

    // DELETE — supprimer un évènement
    #[Route('/api/evenements/{id}', name: 'api_evenements_delete', methods: ['DELETE'])]
    public function delete(?Evenement $evenement, EvenementService $service): JsonResponse
    {
        if (!$evenement) {
            return $this->json(['erreur' => 'Évènement introuvable'], 404);
        }
        $this->denyAccessUnlessGranted(\App\Security\Voter\EvenementVoter::DELETE, $evenement);

        $service->supprimer($evenement);

        return $this->json(['message' => 'Évènement supprimé']);
    }

    // L'organisateur soumet son évènement pour validation
    #[Route('/api/evenements/{id}/soumettre', name: 'api_evenements_soumettre', methods: ['PATCH'])]
    public function soumettre(?Evenement $evenement, EvenementService $service): JsonResponse
    {
        if (!$evenement) {
            return $this->json(['erreur' => 'Évènement introuvable'], 404);
        }

        // Seul le propriétaire (ou un admin) peut soumettre — on réutilise le Voter
        $this->denyAccessUnlessGranted(\App\Security\Voter\EvenementVoter::EDIT, $evenement);

        try {
            $evenement = $service->soumettre($evenement);
        } catch (ServiceException $e) {
            return $this->json(['erreur' => $e->getMessage()], $e->getStatusCode());
        }

        return $this->json($service->serialize($evenement));
    }

    // L'admin approuve un évènement en attente → il est publié
    #[Route('/api/evenements/{id}/approuver', name: 'api_evenements_approuver', methods: ['PATCH'])]
    #[IsGranted('ROLE_ADMIN')]
    public function approuver(?Evenement $evenement, EvenementService $service): JsonResponse
    {
        if (!$evenement) {
            return $this->json(['erreur' => 'Évènement introuvable'], 404);
        }

        try {
            $evenement = $service->approuver($evenement);
        } catch (ServiceException $e) {
            return $this->json(['erreur' => $e->getMessage()], $e->getStatusCode());
        }

        return $this->json($service->serialize($evenement));
    }

    // L'admin refuse un évènement en attente → il est refusé, avec un motif
    #[Route('/api/evenements/{id}/refuser', name: 'api_evenements_refuser', methods: ['PATCH'])]
    #[IsGranted('ROLE_ADMIN')]
    public function refuser(?Evenement $evenement, Request $request, EvenementService $service): JsonResponse
    {
        if (!$evenement) {
            return $this->json(['erreur' => 'Évènement introuvable'], 404);
        }

        $donnees = json_decode($request->getContent(), true) ?? [];

        try {
            $evenement = $service->refuser($evenement, $donnees['motif'] ?? null);
        } catch (ServiceException $e) {
            return $this->json(['erreur' => $e->getMessage()], $e->getStatusCode());
        }

        return $this->json($service->serialize($evenement));
    }

    // Les évènements de l'organisateur connecté
    #[Route('/api/mes-evenements', name: 'api_mes_evenements', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function mesEvenements(EvenementRepository $evenementRepository, EvenementService $service): JsonResponse
    {
        /** @var \App\Entity\Utilisateur $utilisateur */
        $utilisateur = $this->getUser();
        $data = array_map(
            fn (Evenement $e) => $service->serialize($e),
            $evenementRepository->findByOrganisateur($utilisateur->getId())
        );

        return $this->json($data);
    }

    // La file des évènements en attente de validation (admin)
    #[Route('/api/admin/file-attente', name: 'api_admin_file_attente', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function fileAttente(EvenementRepository $evenementRepository, EvenementService $service): JsonResponse
    {
        $data = array_map(
            fn (Evenement $e) => $service->serialize($e),
            $evenementRepository->findEnAttente()
        );

        return $this->json($data);
    }
}
