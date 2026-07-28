<?php

namespace App\Service;

use App\Entity\Evenement;
use App\Entity\Inscription;
use App\Entity\Utilisateur;
use App\Repository\InscriptionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

class InscriptionService
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly InscriptionRepository $inscriptionRepository,
        private readonly MailerInterface $mailer,
        private readonly LoggerInterface $logger,
    ) {
    }

    public function inscrire(Evenement $evenement, Utilisateur $utilisateur): array
    {
        // 1) On ne s'inscrit qu'à un évènement publié
        if ($evenement->getStatut() !== 'publie') {
            throw new ServiceException('Cet évènement n\'est pas ouvert aux inscriptions', 409);
        }

        // 2) Pas de double inscription
        $existante = $this->inscriptionRepository->findOneBy([
            'utilisateur' => $utilisateur,
            'evenement' => $evenement,
        ]);
        if ($existante && $existante->getStatut() === 'confirmee') {
            throw new ServiceException('Vous êtes déjà inscrit à cet évènement', 409);
        }

        // 3) Contrôle de la capacité
        $nbInscrits = $this->inscriptionRepository->count([
            'evenement' => $evenement,
            'statut' => 'confirmee',
        ]);
        if ($nbInscrits >= $evenement->getCapaciteMax()) {
            throw new ServiceException('Cet évènement est complet', 409);
        }

        // Si une inscription "annulee" existe déjà, on la réactive ; sinon on en crée une
        $inscription = $existante ?? new Inscription();
        $inscription->setUtilisateur($utilisateur);
        $inscription->setEvenement($evenement);
        $inscription->setStatut('confirmee');
        $inscription->setDateInscription(new \DateTime());

        $this->em->persist($inscription);
        $this->em->flush();

        $this->envoyerEmailConfirmation($evenement, $utilisateur);

        return [
            'message' => 'Inscription confirmée',
            'evenement' => $evenement->getTitre(),
            'places_restantes' => $evenement->getCapaciteMax() - ($nbInscrits + 1),
        ];
    }

    public function desinscrire(Evenement $evenement, Utilisateur $utilisateur): void
    {
        $inscription = $this->inscriptionRepository->findOneBy([
            'utilisateur' => $utilisateur,
            'evenement' => $evenement,
        ]);

        if (!$inscription || $inscription->getStatut() !== 'confirmee') {
            throw new ServiceException('Vous n\'êtes pas inscrit à cet évènement', 409);
        }

        $inscription->setStatut('annulee');
        $this->em->flush();
    }

    // L'inscription elle-même est déjà actée (persistée) avant cet appel : un envoi
    // d'email qui échoue (SMTP mal configuré, service indisponible...) ne doit jamais
    // faire échouer l'inscription en retournant une erreur 500 à l'utilisateur.
    private function envoyerEmailConfirmation(Evenement $evenement, Utilisateur $utilisateur): void
    {
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

        try {
            $this->mailer->send($email);
        } catch (TransportExceptionInterface $e) {
            $this->logger->error('Échec de l\'envoi de l\'email de confirmation d\'inscription', [
                'evenement_id' => $evenement->getId(),
                'utilisateur_id' => $utilisateur->getId(),
                'erreur' => $e->getMessage(),
            ]);
        }
    }
}
