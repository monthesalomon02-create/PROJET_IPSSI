<?php

namespace App\Tests\Entity;

use App\Entity\Utilisateur;
use PHPUnit\Framework\TestCase;

class UtilisateurTest extends TestCase
{
    public function testUnNouvelUtilisateurEstUserParDefaut(): void
    {
        $utilisateur = new Utilisateur();

        // Même sans rôle défini, getRoles() doit contenir ROLE_USER
        $this->assertContains('ROLE_USER', $utilisateur->getRoles());
    }

    public function testRolesAdmin(): void
    {
        $utilisateur = new Utilisateur();
        $utilisateur->setRoles(['ROLE_ADMIN']);

        $roles = $utilisateur->getRoles();

        // Un admin doit avoir ROLE_ADMIN ET ROLE_USER
        $this->assertContains('ROLE_ADMIN', $roles);
        $this->assertContains('ROLE_USER', $roles);
    }

    public function testEmailEstBienEnregistre(): void
    {
        $utilisateur = new Utilisateur();
        $utilisateur->setEmail('test@exemple.com');

        $this->assertSame('test@exemple.com', $utilisateur->getEmail());
        // getUserIdentifier doit renvoyer l'email
        $this->assertSame('test@exemple.com', $utilisateur->getUserIdentifier());
    }
}