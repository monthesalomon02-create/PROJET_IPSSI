<?php

namespace App\Controller;

use App\Entity\Categorie;
use App\Repository\CategorieRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CategorieController extends AbstractController
{
    // Regroupe les messages de violation en un tableau de chaînes
    private function erreursValidation(\Symfony\Component\Validator\ConstraintViolationListInterface $violations): array
    {
        $erreurs = [];
        foreach ($violations as $violation) {
            $erreurs[] = $violation->getMessage();
        }

        return $erreurs;
    }

    // READ — liste de toutes les catégories
    #[Route('/api/categories', name: 'api_categories_list', methods: ['GET'])]
    public function list(CategorieRepository $categorieRepository): JsonResponse
    {
        $categories = $categorieRepository->findAll();

        $data = [];
        foreach ($categories as $categorie) {
            $data[] = $this->serialize($categorie);
        }

        return $this->json($data);
    }

    // READ — une seule catégorie par son id
    #[Route('/api/categories/{id}', name: 'api_categories_show', methods: ['GET'])]
    public function show(?Categorie $categorie): JsonResponse
    {
        if (!$categorie) {
            return $this->json(['erreur' => 'Catégorie introuvable'], 404);
        }

        return $this->json($this->serialize($categorie));
    }

    // CREATE — créer une nouvelle catégorie
    #[Route('/api/categories', name: 'api_categories_create', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function create(Request $request, EntityManagerInterface $em, ValidatorInterface $validator): JsonResponse
    {
        $donnees = json_decode($request->getContent(), true);

        $categorie = new Categorie();
        $categorie->setNom($donnees['nom'] ?? '');
        $categorie->setSlug($donnees['slug'] ?? '');
        $categorie->setDescription($donnees['description'] ?? null);

        $violations = $validator->validate($categorie);
        if (count($violations) > 0) {
            return $this->json(['erreur' => implode(' ', $this->erreursValidation($violations))], 400);
        }

        $em->persist($categorie);
        $em->flush();

        return $this->json($this->serialize($categorie), 201);
    }

    // UPDATE — modifier une catégorie existante
    #[Route('/api/categories/{id}', name: 'api_categories_update', methods: ['PUT'])]
    #[IsGranted('ROLE_ADMIN')]
    public function update(
        ?Categorie $categorie,
        Request $request,
        EntityManagerInterface $em,
        ValidatorInterface $validator
    ): JsonResponse {
        if (!$categorie) {
            return $this->json(['erreur' => 'Catégorie introuvable'], 404);
        }

        $donnees = json_decode($request->getContent(), true);

        if (isset($donnees['nom'])) {
            $categorie->setNom($donnees['nom']);
        }
        if (isset($donnees['slug'])) {
            $categorie->setSlug($donnees['slug']);
        }
        if (isset($donnees['description'])) {
            $categorie->setDescription($donnees['description']);
        }

        $violations = $validator->validate($categorie);
        if (count($violations) > 0) {
            return $this->json(['erreur' => implode(' ', $this->erreursValidation($violations))], 400);
        }

        $em->flush();

        return $this->json($this->serialize($categorie));
    }

    // DELETE — supprimer une catégorie
    #[Route('/api/categories/{id}', name: 'api_categories_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function delete(?Categorie $categorie, EntityManagerInterface $em): JsonResponse
    {
        if (!$categorie) {
            return $this->json(['erreur' => 'Catégorie introuvable'], 404);
        }

        $em->remove($categorie);
        $em->flush();

        return $this->json(['message' => 'Catégorie supprimée'], 200);
    }

    // Petite méthode privée pour éviter de répéter la transformation en tableau
    private function serialize(Categorie $categorie): array
    {
        return [
            'id' => $categorie->getId(),
            'nom' => $categorie->getNom(),
            'slug' => $categorie->getSlug(),
            'description' => $categorie->getDescription(),
        ];
    }
}
