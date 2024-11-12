# Métajour - Application de Prévisions Météo

## Description

Métajour est une application web de prévisions météo qui permet aux utilisateurs de consulter les conditions météorologiques actuelles et les prévisions sur plusieurs jours pour une ville spécifique. Les utilisateurs peuvent rechercher une ville par nom ou cliquer sur une carte interactive pour obtenir les prévisions locales. L'application récupère les données météo en temps réel via l'API `https://www.prevision-meteo.ch` et les affiche dans une interface conviviale.

## Fonctionnalités

- **Recherche de ville** : Permet à l'utilisateur d'entrer le nom d'une ville pour afficher les prévisions météo actuelles et futures.
- **Intégration de carte** : Permet de cliquer sur une localisation sur la carte pour afficher la météo de la ville la plus proche.
- **Prévision quotidienne** : Affiche la température, la vitesse du vent, l'humidité et les conditions météo pour la journée actuelle.
- **Prévision multi-jours** : Montre les informations météo pour les 4 jours suivants.
- **Gestion des erreurs** : Affiche des messages d'erreur en cas de problème, comme un nom de ville incorrect ou des problèmes de connexion.

## Technologies Utilisées

- **HTML, CSS, JavaScript** : Structure de base, style et fonctionnalités de l'application.
- **Leaflet.js** : Utilisé pour la carte interactive, permettant de sélectionner une ville en cliquant sur la carte.
- **API Nominatim** : Service de géolocalisation utilisé pour convertir les coordonnées de la carte en noms de villes.
- **API Prevision Météo** : Fournit les données météo actuelles et les prévisions pour la ville sélectionnée.

## Utilisation

1. **Entrer un nom de ville** :
   - Tapez le nom de la ville dans le champ de saisie, puis cliquez sur "Afficher" ou appuyez sur Entrée.
   - L'application affichera les données météo actuelles et les prévisions sur 4 jours pour la ville choisie.

2. **Utiliser la carte** :
   - Cliquez sur un endroit sur la carte.
   - L'application identifiera la ville la plus proche et affichera ses prévisions météo.

## Gestion des Erreurs

L'application intègre une gestion basique des erreurs :
- **Noms de villes incorrects** : Affiche un message d'erreur si la ville est introuvable.
- **Erreurs API ou réseau** : Affiche un message d'erreur en cas de problème de récupération des données.
