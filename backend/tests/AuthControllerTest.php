<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class AuthControllerTest extends WebTestCase
{
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
}
