<?php

namespace App\Tests\Controller;

use App\Tests\ApiTestHelperTrait;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class EvenementControllerTest extends WebTestCase
{
    use ApiTestHelperTrait;

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
        $client->request(
            'POST',
            '/api/evenements',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['titre' => 'Test'])
        );

        // Sans token, la création doit être refusée → 401 Unauthorized
        $this->assertResponseStatusCodeSame(401);
    }

    public function testWorkflowCompletBrouillonVersPublie(): void
    {
        $client = static::createClient();
        $categorie = $this->creerCategorie($client);
        [$emailOrga, $mdpOrga] = $this->creerUtilisateur($client, ['ROLE_USER']);
        [$emailAdmin, $mdpAdmin] = $this->creerUtilisateur($client, ['ROLE_ADMIN']);

        $tokenOrga = $this->seConnecter($client, $emailOrga, $mdpOrga);

        // Création → brouillon
        $client->request('POST', '/api/evenements', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer '.$tokenOrga,
        ], json_encode([
            'titre' => 'Évènement de test',
            'description' => 'Description de test',
            'date_debut' => '2027-01-10 10:00',
            'date_fin' => '2027-01-10 12:00',
            'lieu' => 'Paris',
            'capacite_max' => 10,
            'prix' => '0',
            'categorie_id' => $categorie->getId(),
        ]));
        $this->assertResponseStatusCodeSame(201);
        $evenement = json_decode($client->getResponse()->getContent(), true);
        $this->assertSame('brouillon', $evenement['statut']);

        // Soumission → en_attente
        $client->request('PATCH', '/api/evenements/'.$evenement['id'].'/soumettre', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer '.$tokenOrga,
        ]);
        $this->assertResponseIsSuccessful();
        $this->assertSame('en_attente', json_decode($client->getResponse()->getContent(), true)['statut']);

        // Approbation par l'admin → publie
        $tokenAdmin = $this->seConnecter($client, $emailAdmin, $mdpAdmin);
        $client->request('PATCH', '/api/evenements/'.$evenement['id'].'/approuver', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer '.$tokenAdmin,
        ]);
        $this->assertResponseIsSuccessful();
        $this->assertSame('publie', json_decode($client->getResponse()->getContent(), true)['statut']);
    }

    public function testRefusSansMotifEstRejete(): void
    {
        $client = static::createClient();
        $categorie = $this->creerCategorie($client);
        [$emailOrga, $mdpOrga] = $this->creerUtilisateur($client, ['ROLE_USER']);
        [$emailAdmin, $mdpAdmin] = $this->creerUtilisateur($client, ['ROLE_ADMIN']);

        $tokenOrga = $this->seConnecter($client, $emailOrga, $mdpOrga);
        $client->request('POST', '/api/evenements', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer '.$tokenOrga,
        ], json_encode([
            'titre' => 'Évènement à refuser',
            'description' => 'Description',
            'date_debut' => '2027-01-10 10:00',
            'date_fin' => '2027-01-10 12:00',
            'lieu' => 'Paris',
            'capacite_max' => 10,
            'prix' => '0',
            'categorie_id' => $categorie->getId(),
        ]));
        $id = json_decode($client->getResponse()->getContent(), true)['id'];
        $client->request('PATCH', '/api/evenements/'.$id.'/soumettre', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer '.$tokenOrga,
        ]);

        $tokenAdmin = $this->seConnecter($client, $emailAdmin, $mdpAdmin);
        $client->request('PATCH', '/api/evenements/'.$id.'/refuser', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer '.$tokenAdmin,
        ], json_encode([]));

        // Un motif est obligatoire → 400
        $this->assertResponseStatusCodeSame(400);
    }

    public function testDateFinAvantDateDebutEstRejetee(): void
    {
        $client = static::createClient();
        $categorie = $this->creerCategorie($client);
        [$email, $mdp] = $this->creerUtilisateur($client);
        $token = $this->seConnecter($client, $email, $mdp);

        $client->request('POST', '/api/evenements', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer '.$token,
        ], json_encode([
            'titre' => 'Dates incohérentes',
            'description' => 'Description',
            'date_debut' => '2027-01-10 12:00',
            'date_fin' => '2027-01-10 10:00', // avant la date de début
            'lieu' => 'Paris',
            'capacite_max' => 10,
            'prix' => '0',
            'categorie_id' => $categorie->getId(),
        ]));

        $this->assertResponseStatusCodeSame(400);
    }

    /**
     * Test de sécurité : une entrée type <script> ne doit jamais être exécutée.
     * L'API JSON ne fait aucun rendu HTML côté serveur (pas de risque XSS ici) ;
     * la protection réelle vient de l'échappement automatique de React côté front.
     * On vérifie ici que l'API stocke/restitue la valeur telle quelle, sans
     * l'interpréter ni planter ; c'est au front de ne jamais l'insérer en HTML brut.
     */
    public function testPayloadScriptEstStockeSansEtreInterprete(): void
    {
        $client = static::createClient();
        $categorie = $this->creerCategorie($client);
        [$email, $mdp] = $this->creerUtilisateur($client);
        $token = $this->seConnecter($client, $email, $mdp);

        $payload = '<script>alert(1)</script>';

        $client->request('POST', '/api/evenements', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer '.$token,
        ], json_encode([
            'titre' => $payload,
            'description' => 'Description',
            'date_debut' => '2027-01-10 10:00',
            'date_fin' => '2027-01-10 12:00',
            'lieu' => 'Paris',
            'capacite_max' => 10,
            'prix' => '0',
            'categorie_id' => $categorie->getId(),
        ]));

        $this->assertResponseStatusCodeSame(201);
        $evenement = json_decode($client->getResponse()->getContent(), true);
        // Stocké tel quel (pas d'exécution possible côté serveur, JSON pur)
        $this->assertSame($payload, $evenement['titre']);
    }

    public function testMeteoIndisponibleSansClefApi(): void
    {
        $client = static::createClient();
        $categorie = $this->creerCategorie($client);
        [$email, $mdp] = $this->creerUtilisateur($client);
        $token = $this->seConnecter($client, $email, $mdp);

        $client->request('POST', '/api/evenements', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer '.$token,
        ], json_encode([
            'titre' => 'Évènement météo',
            'description' => 'Description',
            'date_debut' => '2027-01-10 10:00',
            'date_fin' => '2027-01-10 12:00',
            'lieu' => 'Paris',
            'capacite_max' => 10,
            'prix' => '0',
            'categorie_id' => $categorie->getId(),
        ]));
        $id = json_decode($client->getResponse()->getContent(), true)['id'];

        // Aucune clé OPENWEATHER_API_KEY en environnement de test → réponse silencieuse
        $client->request('GET', '/api/evenements/'.$id.'/meteo', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer '.$token,
        ]);
        $this->assertResponseIsSuccessful();
        $this->assertSame(['disponible' => false], json_decode($client->getResponse()->getContent(), true));
    }

    /**
     * Test de performance simple (non bloquant sur un seuil strict, juste indicatif) :
     * la liste des évènements publiés doit répondre rapidement.
     */
    public function testTempsDeReponseListeEvenements(): void
    {
        $client = static::createClient();

        $debut = microtime(true);
        $client->request('GET', '/api/evenements');
        $duree = microtime(true) - $debut;

        $this->assertResponseIsSuccessful();
        $this->assertLessThan(2.0, $duree, 'La liste des évènements doit répondre en moins de 2 secondes');
    }
}
