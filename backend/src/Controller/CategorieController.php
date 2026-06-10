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

class CategorieController extends AbstractController
{
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
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $donnees = json_decode($request->getContent(), true);

        $categorie = new Categorie();
        $categorie->setNom($donnees['nom'] ?? '');
        $categorie->setSlug($donnees['slug'] ?? '');
        $categorie->setDescription($donnees['description'] ?? null);

        $em->persist($categorie);
        $em->flush();

        return $this->json($this->serialize($categorie), 201);
    }

    // UPDATE — modifier une catégorie existante
    #[Route('/api/categories/{id}', name: 'api_categories_update', methods: ['PUT'])]
    #[IsGranted('ROLE_ADMIN')]
    public function update(?Categorie $categorie, Request $request, EntityManagerInterface $em): JsonResponse
    {
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