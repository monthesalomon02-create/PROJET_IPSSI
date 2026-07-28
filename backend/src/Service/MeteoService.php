<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;

// Prévision météo pour un évènement, via l'API externe OpenWeatherMap.
// L'offre gratuite ne prévoit qu'à 5 jours : au-delà, ou en cas d'erreur
// (clé manquante, ville inconnue, API indisponible), on ne renvoie rien
// plutôt que de faire échouer l'affichage de l'évènement.
class MeteoService
{
    private const URL_PREVISIONS = 'https://api.openweathermap.org/data/2.5/forecast';

    public function __construct(
        private readonly HttpClientInterface $httpClient,
        private readonly string $openWeatherApiKey,
    ) {
    }

    public function previsionPour(string $lieu, \DateTimeInterface $dateDebut): ?array
    {
        if ($this->openWeatherApiKey === '') {
            return null;
        }

        $maintenant = new \DateTime();
        $dansCinqJours = (clone $maintenant)->modify('+5 days');
        if ($dateDebut < $maintenant || $dateDebut > $dansCinqJours) {
            return null;
        }

        try {
            $reponse = $this->httpClient->request('GET', self::URL_PREVISIONS, [
                'query' => [
                    'q' => $lieu,
                    'appid' => $this->openWeatherApiKey,
                    'units' => 'metric',
                    'lang' => 'fr',
                ],
                'timeout' => 5,
            ]);

            $donnees = $reponse->toArray();
        } catch (\Throwable) {
            return null;
        }

        return $this->creneauLePlusProche($donnees['list'] ?? [], $dateDebut);
    }

    private function creneauLePlusProche(array $creneaux, \DateTimeInterface $dateDebut): ?array
    {
        $meilleur = null;
        $meilleurEcart = null;

        foreach ($creneaux as $creneau) {
            $instant = new \DateTime($creneau['dt_txt'] ?? '');
            $ecart = abs($instant->getTimestamp() - $dateDebut->getTimestamp());

            if ($meilleurEcart === null || $ecart < $meilleurEcart) {
                $meilleur = $creneau;
                $meilleurEcart = $ecart;
            }
        }

        if (!$meilleur) {
            return null;
        }

        return [
            'temperature' => round($meilleur['main']['temp']),
            'description' => $meilleur['weather'][0]['description'] ?? null,
            'icone' => $meilleur['weather'][0]['icon'] ?? null,
            'date' => $meilleur['dt_txt'] ?? null,
        ];
    }
}
