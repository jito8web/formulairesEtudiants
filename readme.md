
# 🎓 Formulaire — Gestion des étudiants

## 📌 Présentation du projet

Formulaire est une application web permettant à 50 étudiants
de remplir et de soumettre un formulaire en ligne à partir
d'un lien unique.

Les informations envoyées sont enregistrées dans une base de
données centralisée afin de permettre à un administrateur
de consulter et de gérer les réponses.

Le projet est conçu pour être simple, accessible, responsive
et entièrement réalisable avec des solutions gratuites.

## 🎯 Objectifs

- Faciliter la collecte des informations des étudiants.
- Permettre à 50 étudiants d'accéder au même formulaire.
- Centraliser toutes les réponses dans une base de données.
- Simplifier la consultation des informations.
- Éviter la collecte manuelle des formulaires papier.

## 🛠️ Technologies utilisées

| Technologie | Utilisation |
|---|---|
| HTML5 | Structure des pages |
| CSS3 | Design et responsive |
| JavaScript | Logique et traitement |
| Supabase | Base de données PostgreSQL |
| GitHub Pages | Hébergement web |

## ✨ Fonctionnalités prévues

### 👨‍🎓 Espace étudiant

- Accès au formulaire avec un lien unique.
- Saisie des informations personnelles.
- Remplissage des champs du formulaire.
- Validation des données.
- Envoi des réponses.
- Confirmation après soumission.

### 🔐 Espace administrateur

- Connexion administrateur sécurisée.
- Consultation des réponses.
- Recherche d'un étudiant.
- Affichage des informations.
- Exportation des réponses en CSV.
- Suivi des participations.



## 🗄️ Base de données

La base de données utilise Supabase avec PostgreSQL.

Table principale : `etudiants`

| Champ | Type |
|---|---|
| id | BIGINT |
| nom | VARCHAR |
| prenom | VARCHAR |
| numero_matricule | VARCHAR |
| email | VARCHAR |
| reponse | TEXT |
| created_at | TIMESTAMPTZ |



## 🔒 Sécurité

- Utilisation de Row Level Security (RLS).
- Protection de l'espace administrateur.
- Validation des données.
- Protection contre les soumissions abusives.
- Accès public limité à l'envoi des réponses.
- Consultation des données réservée à l'administrateur.

## 💰 Coût du projet

| Service | Coût initial |
|---|---:|
| HTML / CSS / JavaScript | Gratuit |
| Supabase Free | Gratuit |
| GitHub Pages | Gratuit |
| **Total** | **0 Ar** |

Les offres gratuites comportent des limites d'utilisation.

## 📊 Capacité prévue

- Nombre d'étudiants ciblés : 50.
- Accès : lien public unique.
- Plateformes : Android, iOS, Windows et Linux.
- Stockage : base de données en ligne.
- Connexion Internet : nécessaire pour envoyer les réponses.

## 👨‍💻 Auteur

Projet personnel de développement web.

## 📜 Licence

Projet éducatif et personnel.
