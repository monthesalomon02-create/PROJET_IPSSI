<?php

namespace App\Tests\Controller;

use App\Tests\ApiTestHelperTrait;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class CategorieControllerTest extends WebTestCase
{
    use ApiTestHelperTrait;

    public function testCreationParUnNonAdminEstRefusee(): void
    {
        $client = static::createClient();
        [$email, $mdp] = $this->creerUtilisateur($client, ['ROLE_USER']);
        $token = $this->seConnecter($client, $email, $mdp);

        $client->request('POST', '/api/categories', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer '.$token,
        ], json_encode(['nom' => 'Test', 'slug' => 'test']));

        $this->assertResponseStatusCodeSame(403);
    }

    public function testSlugInvalideEstRejete(): void
    {
        $client = static::createClient();
        [$email, $mdp] = $this->creerUtilisateur($client, ['ROLE_ADMIN']);
        $token = $this->seConnecter($client, $email, $mdp);

        $client->request('POST', '/api/categories', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer '.$token,
        ], json_encode(['nom' => 'Test', 'slug' => 'Slug Invalide !']));

        $this->assertResponseStatusCodeSame(400);
    }

    public function testCreationValideParUnAdmin(): void
    {
        $client = static::createClient();
        [$email, $mdp] = $this->creerUtilisateur($client, ['ROLE_ADMIN']);
        $token = $this->seConnecter($client, $email, $mdp);

        $client->request('POST', '/api/categories', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer '.$token,
        ], json_encode(['nom' => 'Test', 'slug' => 'test-'.uniqid()]));

        $this->assertResponseStatusCodeSame(201);
    }
}
