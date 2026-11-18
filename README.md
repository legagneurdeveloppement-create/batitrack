# BâtiTrack

> Application professionnelle de **gestion de parc matériel &amp; de chantiers BTP**.
> Construite avec **Next.js 16** (App Router), **React 19**, **Tailwind CSS 4** et **lucide-react**.

BâtiTrack centralise la gestion du matériel, des chantiers, du stock, des réservations et de la maintenance dans une interface moderne, responsive et installable comme une vraie application (PWA).

---

## ✨ Fonctionnalités

- **Authentification par code d'accès** — 3 rôles distincts avec permissions différenciées.
- **Vue d'ensemble administrateur** — statistiques globales (matériel, chantiers actifs, stock total, maintenance), alertes de stock faible, activité récente.
- **Gestion du matériel** — recherche, filtre par catégorie, badges de statut colorés, ajout/édition/suppression.
- **Gestion des chantiers** — cartes avec statut, dates, équipe, budget.
- **Stock &amp; mouvements** — entrées / sorties / transferts, alertes de stock faible, historique.
- **Réservations** — liaison matériel ↔ chantier, dates, statut (en attente / active / retournée).
- **Maintenance** — préventive, corrective, contrôle ; statut planifiée / en cours / terminée.
- **PWA installable** — manifeste, favicon SVG, fonctionnalité d'installation via `AppToolbar`.
- **Persistance locale** — toutes les données sont sauvegardées dans le `localStorage` (aucun backend requis).

---

## 🔑 Codes d'accès

Choisissez un rôle et utilisez le code correspondant pour vous connecter :

| Rôle | Code d'accès | Permissions |
|------|--------------|-------------|
| **Administrateur** | `ADMIN2026` | Accès complet en lecture/écriture sur tous les modules |
| **Magasinier** | `MAG2026` | Édition du matériel, gestion du stock &amp; des mouvements (lecture seule sur chantiers &amp; réservations) |
| **Chef de chantier** | `CHEF2026` | Édition des chantiers &amp; des réservations (lecture seule sur le matériel &amp; le stock) |

---

## 🚀 Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer le serveur de développement
npm run dev

# 3. Ouvrir http://localhost:3000
```

### Build de production

```bash
npm run build
npm start
```

---

## 🧱 Structure du projet

```
batitrack-app/
├── public/
│   ├── favicon.svg          # Logo BâtiTrack (dégradé orange/bleu + casque)
│   ├── manifest.json        # Manifeste PWA
│   └── robots.txt
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Layout racine (métadonnées, polices, body)
│   │   ├── globals.css      # Thème CSS variables + classes utilitaires
│   │   └── page.tsx         # Page d'accueil (rend <LoginScreen/>)
│   ├── components/
│   │   ├── app-toolbar.tsx        # Barre d'outils flottante (Portfolio/Installer/Fermer)
│   │   ├── login-screen.tsx       # Écran de connexion + sélection de rôle
│   │   ├── dashboard.tsx          # Tableau de bord + navigation par onglets
│   │   ├── materials-view.tsx     # Vue gestion du matériel
│   │   ├── sites-view.tsx         # Vue gestion des chantiers
│   │   ├── stock-view.tsx         # Vue stock & mouvements
│   │   ├── reservations-view.tsx  # Vue réservations
│   │   ├── maintenance-view.tsx   # Vue maintenance
│   │   └── modal.tsx              # Modal réutilisable (Escape, backdrop, scroll)
│   ├── data/
│   │   └── seed.ts          # Données de démonstration (10 matériaux, 5 chantiers, etc.)
│   ├── hooks/
│   │   ├── use-auth.ts      # Authentification par code (localStorage)
│   │   └── use-store.ts     # Store global avec persistance localStorage
│   └── lib/
│       └── utils.ts         # Types, ROLE_CONFIG, lookups, cn(), genId()
├── next.config.mjs
├── tsconfig.json
└── package.json
```

---

## 🎨 Thème & design

Le thème est piloté par des **variables CSS** définies dans `src/app/globals.css` :

| Variable | Couleur (light) | Rôle |
|----------|-----------------|------|
| `--primary` | `#f97316` (orange) | Couleur principale (boutons, accents) |
| `--accent` | `#0ea5e9` (bleu) | Couleur secondaire |
| `--accent-2` | `#6366f1` (indigo) | Accent complémentaire |
| `--bg` | `#f8fafc` | Fond |
| `--surface` | `#ffffff` | Surface de cartes |
| `--surface-2` | `#f1f5f9` | Surface secondaire (champs) |
| `--border` | `#e2e8f0` | Bordures |
| `--text` | `#0f172a` | Texte principal |
| `--text-muted` | `#64748b` | Texte secondaire |

Le mode sombre (`.dark`) redéfinit ces variables. Les polices **Inter** (corps) et **Outfit** (titres) sont chargées depuis Google Fonts.

Classes utilitaires disponibles : `.batitrack-bg`, `.glass` (glass-morphism), `.animate-fade-in`, `.animate-scale-in`.

---

## 👥 Permissions par rôle

| Module | Admin | Magasinier | Chef |
|--------|:-----:|:----------:|:----:|
| Vue d'ensemble | ✅ | — | — |
| Matériel | Lecture/Écriture | Lecture/Écriture | Lecture seule |
| Chantiers | Lecture/Écriture | Lecture seule | Lecture/Écriture |
| Stock &amp; Mouvements | Lecture/Écriture | Lecture/Écriture | — |
| Réservations | Lecture/Écriture | Lecture seule | Lecture/Écriture |
| Maintenance | Lecture/Écriture | — | — |

---

## 🛠 Stack technique

- **Next.js 16.4.5** — App Router, React Server Components
- **React 19** — hooks modernes
- **TypeScript 5** — typage strict
- **Tailwind CSS 4** — styling utilitaire avec `@theme`
- **lucide-react** — icônes
- **clsx** + **tailwind-merge** — gestion conditionnelle des classes

---

## 📦 Installation comme application (PWA)

1. Ouvrez l'application dans **Chrome** ou **Edge** (recommandé).
2. Cliquez sur l'icône **Installer** dans la barre d'outils flottante en haut à droite, ou utilisez le menu navigateur → *Installer l'application*.
3. L'application s'ouvre dans sa propre fenêtre, comme un vrai logiciel, et fonctionne hors-ligne.

> La barre d'outils flottante (`AppToolbar`) détecte automatiquement votre navigateur et propose les instructions d'installation adaptées (Chrome, Edge, Opera, iOS Safari, Android Chrome, etc.).

---

## 🔄 Réinitialisation des données

Les données sont stockées dans le `localStorage` du navigateur sous les clés :
- `batitrack-auth-v1` — rôle connecté
- `batitrack-data-v1` — données applicatives (matériel, chantiers, mouvements…)

Pour réinitialiser : videz le `localStorage` du navigateur, ou utilisez la fonction `resetData()` exposée par `useStore()`.

---

## 📝 Licence &amp; auteur

**BâtiTrack** · par **LEGAGNEUR DÉVELOPPEMENT**

Application de démonstration — tous droits réservés.
