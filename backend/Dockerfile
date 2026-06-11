# Installation de l'image php 8.3
FROM php:8.3-fpm
#Installation des outils systeme et bibliotheques necessaires
RUN apt-get update && apt-get install -y \
    git unzip zip libicu-dev libzip-dev \
    && docker-php-ext-install intl pdo pdo_mysql zip \
    && rm -rf /var/lib/apt/lists/*
# Installation du gestionnaire de dependance php
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
# Dossier de tranvail dans le conteneur
WORKDIR /var/www/html

# Copier le script d'entrée et le rendre exécutable
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Exposer le port du serveur
EXPOSE 8000

# Commande lancée au démarrage du conteneur
CMD ["docker-entrypoint.sh"]