#!/bin/bash
set -e

echo "⏳ Installation des dépendances Composer..."
composer install --no-interaction --prefer-dist

echo "🔑 Génération des clés JWT (si absentes)..."
php bin/console lexik:jwt:generate-keypair --skip-if-exists --no-interaction

echo "⏳ Attente de la base de données..."
until php bin/console dbal:run-sql "SELECT 1" >/dev/null 2>&1; do
  echo "   base pas encore prête, nouvelle tentative dans 2s..."
  sleep 2
done

echo "🗄️  Application des migrations..."
php bin/console doctrine:migrations:migrate --no-interaction

echo "🚀 Démarrage du serveur Symfony sur le port 8000..."
php -S 0.0.0.0:8000 -t public