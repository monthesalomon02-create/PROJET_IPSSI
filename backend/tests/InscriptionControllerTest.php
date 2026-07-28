<?php

namespace App\Tests\Controller;

use App\Entity\Evenement;
use App\Tests\ApiTestHelperTrait;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class InscriptionControllerTest extends WebTestCase
{
    use ApiTestHelperTrait;

    private function creerEvenementPublie(KernelBrowser $client, int $capaciteMax = 1): Evenement
    {
        $em = $client->getContainer()->get(EntityManagerInterface::class);
        $categorie = $this->creerCategorie($client);
        [$emailOrga] = $this->creerUtilisateur($client);
        $organisateur = $em->getRepository(\App\Entity\Utilisateur::class)->findOneBy(['email' => $emailOrga]);

        $evenement = new Evenement();
        $evenement->setTitre('Évènement inscriptible');
        $evenement->setDescription('Description');
        $evenement->setDateDebut(new \DateTime('+5 days'));
        $evenement->setDateFin(new \DateTime('+5 days +2 hours'));
        $evenement->setLieu('Paris');
        $evenement->setCapaciteMax($capaciteMax);
        $evenement->setPrix('0');
        $evenement->setStatut('publie');
        $evenement->setDateCreation(new \DateTime());
        $evenement->setCategorie($categorie);
        $evenement->setOrganisateur($organisateur);

        $em->persist($evenement);
        $em->flush();

        return $evenement;
    }

    public function testInscriptionEtDesinscription(): void
    {
        $client = static::createClient();
        $evenement = $this->creerEvenementPublie($client, 5);
        [$email, $mdp] = $this->creerUtilisateur($client);
        $token = $this->seConnecter($client, $email, $mdp);

        $client->request('POST', '/api/evenements/'.$evenement->getId().'/inscription', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer '.$token,
        ]);
        $this->assertResponseStatusCodeSame(201);

        $client->request('DELETE', '/api/evenements/'.$evenement->getId().'/inscription', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer '.$token,
        ]);
        $this->assertResponseIsSuccessful();
    }

    public function testDoubleInscriptionEstRejetee(): void
    {
        $client = static::createClient();
        $evenement = $this->creerEvenementPublie($client, 5);
        [$email, $mdp] = $this->creerUtilisateur($client);
        $token = $this->seConnecter($client, $email, $mdp);

        $client->request('POST', '/api/evenements/'.$evenement->getId().'/inscription', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer '.$token,
        ]);
        $this->assertResponseStatusCodeSame(201);

        $client->request('POST', '/api/evenements/'.$evenement->getId().'/inscription', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer '.$token,
        ]);
        $this->assertResponseStatusCodeSame(409);
    }

    public function testInscriptionRefuseeSiComplet(): void
    {
        $client = static::createClient();
        // Capacité de 1 place, prise par un premier membre
        $evenement = $this->creerEvenementPublie($client, 1);
        [$email1, $mdp1] = $this->creerUtilisateur($client);
        $token1 = $this->seConnecter($client, $email1, $mdp1);
        $client->request('POST', '/api/evenements/'.$evenement->getId().'/inscription', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer '.$token1,
        ]);
        $this->assertResponseStatusCodeSame(201);

        // Un second membre ne doit pas pouvoir s'inscrire : complet
        [$email2, $mdp2] = $this->creerUtilisateur($client);
        $token2 = $this->seConnecter($client, $email2, $mdp2);
        $client->request('POST', '/api/evenements/'.$evenement->getId().'/inscription', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer '.$token2,
        ]);
        $this->assertResponseStatusCodeSame(409);
    }
}
