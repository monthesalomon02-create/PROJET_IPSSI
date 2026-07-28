<?php

namespace App\Tests;

use App\Entity\Categorie;
use App\Entity\Utilisateur;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

// Aucune fixture n'est chargée dans la base de test (seules les migrations le sont,
// en local comme en CI) : chaque test crée ses propres données via ce trait, avec
// des identifiants uniques pour rester indépendant d'une exécution à l'autre.
trait ApiTestHelperTrait
{
    private function creerUtilisateur(KernelBrowser $client, array $roles = ['ROLE_USER']): array
    {
        $em = $client->getContainer()->get(EntityManagerInterface::class);
        $hasher = $client->getContainer()->get(UserPasswordHasherInterface::class);

        $email = 'test-'.uniqid('', true).'@exemple.fr';
        $motDePasse = 'motdepasse123';

        $utilisateur = new Utilisateur();
        $utilisateur->setEmail($email);
        $utilisateur->setNom('Test');
        $utilisateur->setPrenom('Test');
        $utilisateur->setRoles($roles);
        $utilisateur->setIsActive(true);
        $utilisateur->setDateInscription(new \DateTime());
        $utilisateur->setPassword($hasher->hashPassword($utilisateur, $motDePasse));

        $em->persist($utilisateur);
        $em->flush();

        return [$email, $motDePasse];
    }

    private function creerCategorie(KernelBrowser $client): Categorie
    {
        $em = $client->getContainer()->get(EntityManagerInterface::class);

        $categorie = new Categorie();
        $categorie->setNom('Test');
        $categorie->setSlug('test-'.uniqid());
        $em->persist($categorie);
        $em->flush();

        return $categorie;
    }

    private function seConnecter(KernelBrowser $client, string $email, string $motDePasse): string
    {
        $client->request('POST', '/api/login', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'email' => $email,
            'password' => $motDePasse,
        ]));

        $donnees = json_decode($client->getResponse()->getContent(), true);

        return $donnees['token'];
    }
}
