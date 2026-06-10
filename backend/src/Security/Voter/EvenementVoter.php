<?php

namespace App\Security\Voter;

use App\Entity\Evenement;
use App\Entity\Utilisateur;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class EvenementVoter extends Voter
{
    // Les "actions" qu'on veut contrôler sur un évènement
    public const EDIT = 'EVENEMENT_EDIT';
    public const DELETE = 'EVENEMENT_DELETE';

    // Ce Voter ne s'active QUE pour nos actions ET sur un objet Evenement
    protected function supports(string $attribute, mixed $subject): bool
    {
        return in_array($attribute, [self::EDIT, self::DELETE])
            && $subject instanceof Evenement;
    }

    // La décision : a-t-on le droit, oui ou non ?
    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $utilisateur = $token->getUser();

        // Si pas connecté → refusé
        if (!$utilisateur instanceof Utilisateur) {
            return false;
        }

        // Un admin peut tout faire
        if (in_array('ROLE_ADMIN', $utilisateur->getRoles())) {
            return true;
        }

        /** @var Evenement $evenement */
        $evenement = $subject;

        // Sinon : autorisé seulement si c'est SON propre évènement
        return $evenement->getOrganisateur() === $utilisateur;
    }
}