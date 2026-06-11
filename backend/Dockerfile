# Installation de l'image php 8.3
FROM php:8.3-fpm

# Installation des outils système et bibliothèques nécessaires
RUN apt-get update && apt-get install -y \
    git unzip zip libicu-dev libzip-dev \
    && docker-php-ext-install intl pdo pdo_mysql zip \
    && rm -rf /var/lib/apt/lists/*

# Installation du gestionnaire de dépendance PHP
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Dossier de travail dans le conteneur
WORKDIR /var/www/html

# Copier le script d'entrée, corriger les fins de ligne Windows et le rendre exécutable
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh \
    && chmod +x /usr/local/bin/docker-entrypoint.sh

# Exposer le port du serveur
EXPOSE 8000

# Commande lancée au démarrage du conteneur
CMD ["/usr/local/bin/docker-entrypoint.sh"]