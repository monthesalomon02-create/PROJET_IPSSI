<?php

namespace App\Service;

// Erreur métier "attendue" (mauvais état, données invalides...), portée jusqu'au
// contrôleur avec le code HTTP à renvoyer, pour éviter de dupliquer les try/catch génériques.
class ServiceException extends \RuntimeException
{
    public function __construct(string $message, private readonly int $statusCode = 400)
    {
        parent::__construct($message);
    }

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }
}
