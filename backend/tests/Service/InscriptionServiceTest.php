<?php

namespace App\Tests\Service;

use App\Entity\Categorie;
use App\Entity\Evenement;
use App\Entity\Utilisateur;
use App\Repository\InscriptionRepository;
use App\Service\InscriptionService;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Symfony\Component\Mailer\Exception\TransportException;
use Symfony\Component\Mailer\MailerInterface;

class InscriptionServiceTest extends TestCase
{
    private function creerEvenementPublie(int $capaciteMax = 5): Evenement
    {
        $evenement = new Evenement();
        $evenement->setTitre('Test');
        $evenement->setDescription('Test');
        $evenement->setDateDebut(new \DateTime('+1 day'));
        $evenement->setDateFin(new \DateTime('+1 day +2 hours'));
        $evenement->setLieu('Paris');
        $evenement->setCapaciteMax($capaciteMax);
        $evenement->setPrix('0');
        $evenement->setStatut('publie');
        $evenement->setDateCreation(new \DateTime());
        $evenement->setCategorie(new Categorie());

        return $evenement;
    }

    private function creerUtilisateur(): Utilisateur
    {
        $utilisateur = new Utilisateur();
        $utilisateur->setEmail('test@exemple.fr');
        $utilisateur->setNom('Test');
        $utilisateur->setPrenom('Test');

        return $utilisateur;
    }

    /**
     * Régression : un échec d'envoi d'email (SMTP mal configuré, indisponible...)
     * ne doit jamais faire échouer l'inscription elle-même (pas de 500 côté API).
     */
    public function testEchecEnvoiEmailNeFaitPasEchouerLInscription(): void
    {
        $em = $this->createStub(EntityManagerInterface::class);
        $inscriptionRepository = $this->createStub(InscriptionRepository::class);
        $inscriptionRepository->method('findOneBy')->willReturn(null);
        $inscriptionRepository->method('count')->willReturn(0);

        $mailer = $this->createStub(MailerInterface::class);
        $mailer->method('send')->willThrowException(new TransportException('SMTP indisponible'));

        $logger = $this->createMock(LoggerInterface::class);
        $logger->expects($this->once())->method('error');

        $service = new InscriptionService($em, $inscriptionRepository, $mailer, $logger);

        $resultat = $service->inscrire($this->creerEvenementPublie(), $this->creerUtilisateur());

        $this->assertSame('Inscription confirmée', $resultat['message']);
    }
}
