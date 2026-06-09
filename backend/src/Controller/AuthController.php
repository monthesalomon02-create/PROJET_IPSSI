<?php

namespace App\Controller;

use App\Entity\Utilisateur;
use App\Repository\UtilisateurRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

use Symfony\Component\Security\Http\Attribute\IsGranted;

class AuthController extends AbstractController
{
    #[Route('/api/inscription', name: 'api_inscription', methods: ['POST'])]
    public function inscription(
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $passwordHasher,
        UtilisateurRepository $utilisateurRepository
    ): JsonResponse {
        $donnees = json_decode($request->getContent(), true);

        // Vérifications de base
        if (empty($donnees['email']) || empty($donnees['password'])) {
            return $this->json(['erreur' => 'Email et mot de passe obligatoires'], 400);
        }

        // L'email est-il déjà utilisé ?
        if ($utilisateurRepository->findOneBy(['email' => $donnees['email']])) {
            return $this->json(['erreur' => 'Cet email est déjà utilisé'], 409);
        }

        $utilisateur = new Utilisateur();
        $utilisateur->setEmail($donnees['email']);
        $utilisateur->setNom($donnees['nom'] ?? '');
        $utilisateur->setPrenom($donnees['prenom'] ?? '');
        $utilisateur->setRoles(['ROLE_USER']);
        $utilisateur->setIsActive(true);
        $utilisateur->setDateInscription(new \DateTime());

        // On hache le mot de passe AVANT de l'enregistrer (jamais en clair !)
        $motDePasseHache = $passwordHasher->hashPassword($utilisateur, $donnees['password']);
        $utilisateur->setPassword($motDePasseHache);

        $em->persist($utilisateur);
        $em->flush();

        return $this->json([
            'message' => 'Compte créé avec succès',
            'utilisateur' => [
                'id' => $utilisateur->getId(),
                'email' => $utilisateur->getEmail(),
                'nom' => $utilisateur->getNom(),
                'prenom' => $utilisateur->getPrenom(),
            ],
        ], 201);
    }

    #[Route('/api/me', name: 'api_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        /** @var \App\Entity\Utilisateur $utilisateur */
        $utilisateur = $this->getUser();

        if (!$utilisateur) {
            return $this->json(['erreur' => 'Non authentifié'], 401);
        }

        return $this->json([
            'id' => $utilisateur->getId(),
            'email' => $utilisateur->getEmail(),
            'nom' => $utilisateur->getNom(),
            'prenom' => $utilisateur->getPrenom(),
            'roles' => $utilisateur->getRoles(),
        ]);
    }

    #[Route('/api/admin/test', name: 'api_admin_test', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function adminTest(): JsonResponse
    {
        return $this->json([
            'message' => 'Bravo, tu es bien administrateur !',
            'email' => $this->getUser()->getUserIdentifier(),
        ]);
    }
}