<?php

namespace App\Tests\Controller;

use App\Tests\ApiTestHelperTrait;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class AuthControllerTest extends WebTestCase
{
    use ApiTestHelperTrait;

    public function testTropDeTentativesDeConnexionEstBloque(): void
    {
        $client = static::createClient();
        $identifiants = json_encode(['email' => 'brute-force-test@eventhub.fr', 'password' => 'mauvais-mot-de-passe']);

        // max_attempts: 5 dans security.yaml → les 5 premières tentatives échouent normalement
        for ($i = 0; $i < 5; $i++) {
            $client->request('POST', '/api/login', [], [], ['CONTENT_TYPE' => 'application/json'], $identifiants);
            $this->assertResponseStatusCodeSame(401);
        }

        // La 6e tentative doit être bloquée par le rate limiter, avec un message dédié
        $client->request('POST', '/api/login', [], [], ['CONTENT_TYPE' => 'application/json'], $identifiants);
        $this->assertResponseStatusCodeSame(401);
        $this->assertStringContainsString('Too many failed login attempts', $client->getResponse()->getContent());
    }

    public function testMotDePasseTropCourtEstRejete(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/inscription', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'email' => 'test-'.uniqid().'@exemple.fr',
            'password' => 'court',
            'nom' => 'Test',
            'prenom' => 'Test',
        ]));

        $this->assertResponseStatusCodeSame(400);
    }

    public function testSuppressionCompteAnonymiseEtBloqueLaConnexion(): void
    {
        $client = static::createClient();
        [$email, $mdp] = $this->creerUtilisateur($client);
        $token = $this->seConnecter($client, $email, $mdp);

        $client->request('DELETE', '/api/me', [], [], ['HTTP_AUTHORIZATION' => 'Bearer '.$token]);
        $this->assertResponseIsSuccessful();

        // L'ancien couple email/mot de passe ne doit plus permettre de se connecter
        $client->request('POST', '/api/login', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'email' => $email,
            'password' => $mdp,
        ]));
        $this->assertResponseStatusCodeSame(401);
    }
}
