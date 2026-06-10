<?php

namespace App\Controller;

use App\Entity\Evenement;
use App\Entity\Inscription;
use App\Entity\Utilisateur;
use App\Repository\InscriptionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

class InscriptionController extends AbstractController
{
    // S'inscrire à un évènement
    #[Route('/api/evenements/{id}/inscription', name: 'api_inscription_create', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function inscrire(
        ?Evenement $evenement,
        EntityManagerInterface $em,
        InscriptionRepository $inscriptionRepository,
        MailerInterface $mailer
    ): JsonResponse {
        if (!$evenement) {
            return $this->json(['erreur' => 'Évènement introuvable'], 404);
        }

        /** @var Utilisateur $utilisateur */
        $utilisateur = $this->getUser();

        // 1) On ne s'inscrit qu'à un évènement publié
        if ($evenement->getStatut() !== 'publie') {
            return $this->json(['erreur' => 'Cet évènement n\'est pas ouvert aux inscriptions'], 409);
        }

        // 2) Pas de double inscription
        $existante = $inscriptionRepository->findOneBy([
            'utilisateur' => $utilisateur,
            'evenement' => $evenement,
        ]);
        if ($existante && $existante->getStatut() === 'confirmee') {
            return $this->json(['erreur' => 'Vous êtes déjà inscrit à cet évènement'], 409);
        }

        // 3) Contrôle de la capacité
        $nbInscrits = $inscriptionRepository->count([
            'evenement' => $evenement,
            'statut' => 'confirmee',
        ]);
        if ($nbInscrits >= $evenement->getCapaciteMax()) {
            return $this->json(['erreur' => 'Cet évènement est complet'], 409);
        }

        // Si une inscription "annulee" existe déjà, on la réactive ; sinon on en crée une
        $inscription = $existante ?? new Inscription();
        $inscription->setUtilisateur($utilisateur);
        $inscription->setEvenement($evenement);
        $inscription->setStatut('confirmee');
        $inscription->setDateInscription(new \DateTime());

        $em->persist($inscription);
        $em->flush();

        // Envoi de l'email de confirmation
        $email = (new Email())
            ->from('noreply@plateforme-evenements.com')
            ->to($utilisateur->getEmail())
            ->subject('Confirmation d\'inscription : ' . $evenement->getTitre())
            ->text(
                "Bonjour " . $utilisateur->getPrenom() . ",\n\n" .
                "Votre inscription à l'évènement \"" . $evenement->getTitre() . "\" est confirmée.\n\n" .
                "Date : " . $evenement->getDateDebut()->format('d/m/Y à H:i') . "\n" .
                "Lieu : " . $evenement->getLieu() . "\n\n" .
                "À bientôt !"
            );

        $mailer->send($email);

        return $this->json([
            'message' => 'Inscription confirmée',
            'evenement' => $evenement->getTitre(),
            'places_restantes' => $evenement->getCapaciteMax() - ($nbInscrits + 1),
        ], 201);
    }

    // Se désinscrire d'un évènement
    #[Route('/api/evenements/{id}/inscription', name: 'api_inscription_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_USER')]
    public function desinscrire(
        ?Evenement $evenement,
        EntityManagerInterface $em,
        InscriptionRepository $inscriptionRepository
    ): JsonResponse {
        if (!$evenement) {
            return $this->json(['erreur' => 'Évènement introuvable'], 404);
        }

        /** @var Utilisateur $utilisateur */
        $utilisateur = $this->getUser();

        $inscription = $inscriptionRepository->findOneBy([
            'utilisateur' => $utilisateur,
            'evenement' => $evenement,
        ]);

        if (!$inscription || $inscription->getStatut() !== 'confirmee') {
            return $this->json(['erreur' => 'Vous n\'êtes pas inscrit à cet évènement'], 409);
        }

        $inscription->setStatut('annulee');
        $em->flush();

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