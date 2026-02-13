# Stayli — Gestion de Locations Saisonnières

Application complète de gestion de locations saisonnières : propriétés, réservations, clients, facturation et contrats.

Construite avec **Next.js 16**, **React 19**, **Prisma 6** et **PostgreSQL 16**.

---

## Démarrage rapide

### Prérequis

| Outil      | Version   |
| ---------- | --------- |
| Node.js    | ≥ 20      |
| Yarn       | ≥ 1.22    |
| PostgreSQL | ≥ 16      |
| Docker     | optionnel |

### Installation

```bash
# 1. Cloner le repository
git clone <url>
cd stayli

# 2. Activer Corepack et installer les dépendances
corepack enable
yarn install

# 3. Configurer les variables d'environnement
cp .env.local.example .env.local
# Éditer .env.local avec vos configurations (voir section Variables d'environnement)

# 4. Démarrer PostgreSQL (option Docker)
docker compose up -d

# 5. Générer le client Prisma et appliquer les migrations
yarn prisma:generate
yarn prisma:migrate

# 6. (Optionnel) Peupler la base avec des données de démonstration
yarn prisma db seed

# 7. Lancer le serveur de développement
yarn dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000).

---

## Scripts disponibles

| Commande               | Description                                |
| ---------------------- | ------------------------------------------ |
| `yarn dev`             | Serveur de développement                   |
| `yarn build`           | Build production                           |
| `yarn start`           | Lancer en production                       |
| `yarn lint`            | Linter ESLint                              |
| `yarn format`          | Formater avec Prettier                     |
| `yarn test`            | Lancer les tests Vitest                    |
| `yarn prisma:generate` | Générer le client Prisma                   |
| `yarn prisma:migrate`  | Créer et appliquer une migration           |
| `yarn prisma:studio`   | Ouvrir Prisma Studio (GUI base de données) |
| `yarn prisma db seed`  | Peupler la base avec des données de démo   |

---

## Structure du projet

```
stayli/
├── app/                       # Next.js App Router
│   ├── api/                   # API Routes (REST)
│   │   ├── auth/              # Authentification NextAuth
│   │   ├── bookings/          # CRUD réservations
│   │   ├── clients/           # CRUD clients
│   │   ├── invoices/          # CRUD + génération factures
│   │   ├── properties/        # CRUD propriétés
│   │   ├── dashboard/         # Stats, activités, calendrier
│   │   ├── settings/          # Configuration globale
│   │   └── account/           # Gestion du compte utilisateur
│   ├── bookings/              # Pages réservations (liste, détail, calendrier)
│   ├── clients/               # Pages clients
│   ├── dashboard/             # Tableau de bord
│   ├── invoices/              # Pages factures (liste, détail)
│   ├── properties/            # Pages propriétés
│   └── settings/              # Pages paramètres
├── components/                # Composants React réutilisables
│   ├── ui/                    # Composants UI de base (shadcn/ui)
│   ├── layout/                # Header, Sidebar
│   ├── calendar/              # Calendrier des réservations (modulaire)
│   ├── dashboard/             # Widgets du tableau de bord
│   └── shared/                # DataTable, Toolbar, StatsCard génériques
├── features/                  # Logique métier par domaine
│   ├── bookings/              # Composants, hooks, contexte réservations
│   ├── clients/               # Composants, hooks, contexte clients
│   ├── invoices/              # Composants, hooks, PDF factures/contrats
│   ├── properties/            # Composants, hooks, contexte propriétés
│   └── settings/              # Composants, hooks paramètres
├── hooks/                     # Hooks React globaux (useApi, useDebounce, etc.)
├── lib/                       # Utilitaires (Prisma client, calculs prix, auth)
│   └── validations/           # Schémas Zod
├── prisma/
│   ├── schema.prisma          # Modèle de données
│   ├── seed.ts                # Script de seed (données de démo)
│   └── migrations/            # Historique des migrations
├── services/                  # Services métier côté serveur
├── types/                     # Types TypeScript globaux
└── styles/                    # Styles globaux
```

---

## Base de données

Le projet utilise **Prisma ORM** avec **PostgreSQL**. Modèles principaux :

| Modèle       | Description                                          |
| ------------ | ---------------------------------------------------- |
| **User**     | Comptes utilisateurs (ADMIN, USER), auth credentials |
| **Property** | Propriétés de location (nom, adresse, description)   |
| **Client**   | Clients (coordonnées, adresse)                       |
| **Booking**  | Réservations avec tarification détaillée             |
| **Invoice**  | Factures liées aux réservations                      |
| **Settings** | Configuration globale (entreprise, tarifs, options)  |

### Relations

- Un **Booking** appartient à un **Property** et un **Client**
- Un **Booking** a au plus une **Invoice** (relation 1:1)
- **Settings** est un singleton (un seul enregistrement)

### Seed — Données de démonstration

Le script `prisma/seed.ts` peuple la base avec un jeu de données réaliste :

| Donnée           | Quantité | Détails                                                   |
| ---------------- | -------- | --------------------------------------------------------- |
| **Propriétés**   | 5        | Villa, Appartement, Chalet, Studio, Maison de campagne    |
| **Clients**      | 8        | Profils variés avec noms, emails, téléphones              |
| **Réservations** | 14       | Passées, en cours, futures — statuts variés               |
| **Factures**     | 14       | `paid`, `sent`, `draft`, `overdue` selon les réservations |

**Catégories de réservations seedées :**

- **5 réservations passées** — factures payées (`paid`)
- **3 réservations en cours** — factures envoyées (`sent`), options linge
- **2 réservations passées en retard** — factures impayées (échues)
- **4 réservations futures** — avec assurance annulation, factures `draft`/`sent`

Le seed utilise des dates dynamiques (relatives à `Date.now()`) pour que les données soient toujours pertinentes.

```bash
# Lancer le seed
yarn prisma db seed

# Le seed supprime les données existantes avant de recréer
# ⚠️  Ne pas exécuter en production
```

---

## Fonctionnalités

### Réservations

- Calendrier interactif avec drag & drop pour créer des réservations
- Gestion des statuts (confirmée, en attente, annulée, bloquée)
- Calcul automatique des prix (nuitées, ménage, linge, taxe de séjour, assurance)
- Système de remise (montant fixe ou pourcentage)

### Clients

- Fiche client complète (coordonnées, adresse)
- Lien direct par email depuis la fiche réservation

### Propriétés

- Gestion multi-propriétés
- Statistiques de revenus et taux d'occupation

### Facturation

- Génération automatique de factures (numérotation séquentielle)
- PDF professionnel (via `@react-pdf/renderer`)
- Suivi des statuts : brouillon → envoyée → payée / en retard

### Contrats

- Génération PDF de contrat de location (2 pages)
- Clauses légales, conditions d'annulation, description du bien

### Notifications

- Alertes sur les échéances : check-in imminent, check-out proche, factures en retard

### Tableau de bord

- Taux d'occupation, revenu mensuel, réservations actives
- Arrivées/départs du jour, activité récente

---

## Stack technique

| Catégorie       | Technologie                        |
| --------------- | ---------------------------------- |
| Framework       | Next.js 16 (App Router)            |
| Langage         | TypeScript 5                       |
| Base de données | PostgreSQL 16 + Prisma 6           |
| Auth            | NextAuth.js v5 (Credentials + JWT) |
| UI              | shadcn/ui + Radix UI + Tailwind v4 |
| Data fetching   | SWR 2                              |
| Validation      | Zod 3                              |
| PDF             | @react-pdf/renderer                |
| Tests           | Vitest                             |
| Icons           | Lucide React                       |

---

## Authentification

L'authentification est gérée par **NextAuth.js v5** :

- Provider **Credentials** (email + mot de passe hashé bcrypt)
- Sessions **JWT**
- Rôles : `ADMIN`, `USER`
- Middleware de protection des routes (`middleware.ts`)

---

## Variables d'environnement

Voir `.env.local.example` pour la liste complète.

| Variable          | Description                               |
| ----------------- | ----------------------------------------- |
| `DATABASE_URL`    | URL de connexion PostgreSQL               |
| `NEXTAUTH_SECRET` | Secret pour le chiffrement des JWT        |
| `NEXTAUTH_URL`    | URL de base (ex: `http://localhost:3000`) |

---

## Docker

Un `docker-compose.yml` est fourni pour démarrer PostgreSQL :

```bash
docker compose up -d    # Démarre PostgreSQL
docker compose down     # Arrête et supprime le conteneur
```

---

## Licence

MIT
