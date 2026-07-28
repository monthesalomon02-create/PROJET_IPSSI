<?php

namespace App\Controller;

use App\Entity\Evenement;
use App\Entity\Utilisateur;
use App\Repository\InscriptionRepository;
use App\Service\InscriptionService;
use App\Service\ServiceException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class InscriptionController extends AbstractController
{
    // S'inscrire à un évènement
    #[Route('/api/evenements/{id}/inscription', name: 'api_inscription_create', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function inscrire(?Evenement $evenement, InscriptionService $service): JsonResponse
    {
        if (!$evenement) {
            return $this->json(['erreur' => 'Évènement introuvable'], 404);
        }

        /** @var Utilisateur $utilisateur */
        $utilisateur = $this->getUser();

        try {
            $resultat = $service->inscrire($evenement, $utilisateur);
        } catch (ServiceException $e) {
            return $this->json(['erreur' => $e->getMessage()], $e->getStatusCode());
        }

        return $this->json($resultat, 201);
    }

    // Se désinscrire d'un évènement
    #[Route('/api/evenements/{id}/inscription', name: 'api_inscription_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_USER')]
    public function desinscrire(?Evenement $evenement, InscriptionService $service): JsonResponse
    {
        if (!$evenement) {
            return $this->json(['erreur' => 'Évènement introuvable'], 404);
        }

        /** @var Utilisateur $utilisateur */
        $utilisateur = $this->getUser();

        try {
            $service->desinscrire($evenement, $utilisateur);
        } catch (ServiceException $e) {
            return $this->json(['erreur' => $e->getMessage()], $e->getStatusCode());
        }

        return $this->json(['message' => 'Désinscription effectuée']);
    }

    // Mes inscriptions (les évènements auxquels je participe)
    #[Route('/api/mes-inscriptions', name: 'api_mes_inscriptions', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function mesInscriptions(InscriptionRepository $inscriptionRepository): JsonResponse
    {
        /** @var Utilisateur $utilisateur */
        $utilisateur = $this->getUser();

        $data = [];
        foreach ($inscriptionRepository->findBy(['utilisateur' => $utilisateur, 'statut' => 'confirmee']) as $inscription) {
            $evenement = $inscription->getEvenement();
            $data[] = [
                'inscription_id' => $inscription->getId(),
                'date_inscription' => $inscription->getDateInscription()->format('Y-m-d H:i'),
                'evenement' => [
                    'id' => $evenement->getId(),
                    'titre' => $evenement->getTitre(),
                    'date_debut' => $evenement->getDateDebut()->format('Y-m-d H:i'),
                    'lieu' => $evenement->getLieu(),
                ],
            ];
        }

        return $this->json($data);
    }
}
