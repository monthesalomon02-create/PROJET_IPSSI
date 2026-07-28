<?php

namespace App\Repository;

use App\Entity\Evenement;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Evenement>
 */
class EvenementRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Evenement::class);
    }

    //    /**
    //     * @return Evenement[] Returns an array of Evenement objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('e')
    //            ->andWhere('e.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('e.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?Evenement
    //    {
    //        return $this->createQueryBuilder('e')
    //            ->andWhere('e.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }

    // Les 3 requêtes ci-dessous alimentent des listes entièrement sérialisées
    // (EvenementService::serialize() lit categorie, organisateur et inscriptions
    // pour chaque évènement) : on charge ces relations en une seule requête plutôt
    // que de laisser Doctrine les récupérer une par une (N+1) pour chaque évènement.
    private function requeteAvecRelations(): \Doctrine\ORM\QueryBuilder
    {
        return $this->createQueryBuilder('e')
            ->addSelect('c', 'o', 'i')
            ->leftJoin('e.categorie', 'c')
            ->leftJoin('e.organisateur', 'o')
            ->leftJoin('e.inscriptions', 'i');
    }

    public function findPublies(): array
    {
        return $this->requeteAvecRelations()
            ->andWhere('e.statut = :statut')
            ->setParameter('statut', 'publie')
            ->orderBy('e.dateDebut', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Les évènements d'un organisateur donné (tous statuts confondus)
     */
    public function findByOrganisateur(int $organisateurId): array
    {
        return $this->requeteAvecRelations()
            ->andWhere('e.organisateur = :id')
            ->setParameter('id', $organisateurId)
            ->orderBy('e.dateCreation', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Les évènements en attente de validation (pour l'admin)
     */
    public function findEnAttente(): array
    {
        return $this->requeteAvecRelations()
            ->andWhere('e.statut = :statut')
            ->setParameter('statut', 'en_attente')
            ->orderBy('e.dateSoumission', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
