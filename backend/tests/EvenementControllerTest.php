<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class EvenementControllerTest extends WebTestCase
{
    public function testListeEvenementsEstPublique(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/evenements');

        // La consultation est publique → 200 OK
        $this->assertResponseIsSuccessful();
    }

    public function testCreationSansTokenEstRefusee(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/evenements', [], [], 
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['titre' => 'Test'])
        );

        // Sans token, la création doit être refusée → 401 Unauthorized
        $this->assertResponseStatusCodeSame(401);
    }
}