# Stayli - Vacation Rental Management

Application de gestion de locations saisonnières construite avec Next.js 16, Prisma et PostgreSQL.

## 🚀 Démarrage rapide

### Prérequis

- Node.js 20+
- Yarn (via Corepack)
- PostgreSQL 16+

### Installation

1. Cloner le repository

```bash
git clone <url>
cd rental-management-app
```

2. Installer les dépendances

```bash
corepack enable
yarn install
```

3. Configurer les variables d'environnement

```bash
cp .env.local.example .env.local
# Éditer .env.local avec vos configurations
```

4. Générer le client Prisma et migrer la base de données

```bash
yarn prisma:generate
yarn prisma:migrate
```

5. Lancer le serveur de développement

```bash
yarn dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000).

## 📝 Scripts disponibles

### Développement

- `yarn dev` - Lance le serveur de développement
- `yarn build` - Build l'application pour la production
- `yarn start` - Lance l'application en mode production
- `yarn type-check` - Vérifie les types TypeScript

### Code Quality

- `yarn lint` - Lint le code avec ESLint
- `yarn lint:fix` - Corrige automatiquement les erreurs ESLint
- `yarn format` - Formate le code avec Prettier
- `yarn format:check` - Vérifie le formatage sans modifier les fichiers

### Base de données

- `yarn prisma:generate` - Génère le client Prisma
- `yarn prisma:migrate` - Crée et applique une nouvelle migration
- `yarn prisma:push` - Push le schema vers la DB (dev uniquement)
- `yarn prisma:studio` - Ouvre Prisma Studio

## 🏗️ Structure du projet

```
rental-management-app/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/         # Authentification
│   │   ├── bookings/     # Réservations
│   │   ├── clients/      # Clients
│   │   ├── invoices/     # Factures
│   │   ├── properties/   # Propriétés
│   │   └── settings/     # Paramètres
│   ├── bookings/         # Pages réservations
│   ├── clients/          # Pages clients
│   ├── dashboard/        # Tableau de bord
│   ├── invoices/         # Pages factures
│   ├── properties/       # Pages propriétés
│   └── settings/         # Pages paramètres
├── components/            # Composants React réutilisables
│   ├── ui/               # Composants UI de base
│   ├── layout/           # Layout components
│   └── ...
├── features/             # Logique métier par feature
├── lib/                  # Utilitaires et helpers
│   ├── prisma.ts        # Client Prisma
│   ├── booking-price-calculator.ts
│   └── utils.ts
├── prisma/
│   └── schema.prisma    # Schema de base de données
└── types/               # Types TypeScript globaux
```

## 🗄️ Base de données

Le projet utilise Prisma ORM avec PostgreSQL. Modèles principaux :

- **Property** - Propriétés de location
- **Client** - Informations clients
- **Booking** - Réservations
- **Invoice** - Factures
- **User** - Utilisateurs de l'app
- **Settings** - Configuration globale

## 🔐 Authentification

L'authentification est gérée par NextAuth.js avec :

- Provider Credentials (email/password)
- Sessions JWT
- Rôles utilisateurs (ADMIN, USER)

## 🎨 Stack technique

- **Framework** : Next.js 16 (App Router)
- **Language** : TypeScript
- **Database** : PostgreSQL + Prisma ORM
- **Auth** : NextAuth.js v5
- **UI** : Radix UI + Tailwind CSS
- **Forms** : React Hook Form + Zod
- **Icons** : Lucide React
- **Date** : date-fns

## 🧪 Tests & CI/CD

Le projet inclut :

- GitHub Actions pour CI/CD
- ESLint pour le linting
- Prettier pour le formatage
- TypeScript pour la vérification de types

## 📦 Variables d'environnement

Voir `.env.local.example` pour la liste complète des variables nécessaires.

Variables principales :

- `DATABASE_URL` - URL de connexion PostgreSQL
- `NEXTAUTH_SECRET` - Secret pour NextAuth.js
- `NEXTAUTH_URL` - URL de base de l'application

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

Voir `.github/PULL_REQUEST_TEMPLATE.md` pour le template de PR.

## 📄 License

MIT
