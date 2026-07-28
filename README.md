# Evolve Poker — Site vitrine

Site de présentation de l'application mobile **Evolve Poker**, outil gratuit de progression au poker (Academy, Ranges, Analyse de mains, Communauté), pensé pour tous niveaux. Développé en solo, en français.

Site en ligne : `https://ubiquitous-tiramisu-7fd9e1.netlify.app` (domaine définitif à venir).

---

## Stack

- **[Eleventy (11ty) v3](https://www.11ty.dev/)** — générateur de site statique
- **Nunjucks** — templates HTML
- **CSS custom properties** — design system maison, 0 framework UI
- **JS vanilla** — pas de librairies
- **[Netlify](https://netlify.com)** — hébergement, CI/CD (déploiement auto sur push `main`), fonctions serverless, formulaires

---

## Installation & développement

```bash
npm install
npm start        # Démarre le serveur local avec live reload sur http://localhost:8080
npm run build    # Génère le site statique dans _site/
npm test         # Lance les tests (node --test)
```

---

## Structure du projet

```
_data/
  texts.json          — Tout le contenu éditorial (titres, textes, meta) — voir "Modifier le contenu"
  academy.js / allLessons.js / allModules.js — Récupération des données Academy (Supabase)
  lessons.csv / modules.csv — Source CSV des leçons
_includes/
  layout.njk          — Layout global (nav, head, footer, réseaux sociaux)
  lesson-layout.njk   — Layout spécifique pages leçons
assets/
  css/style.css       — Feuille CSS unique (~4000 lignes), tout le design system
  js/main.js          — JS global (nav, scroll, animations)
  images/             — Favicons, image OG, visuels par feature
netlify/
  functions/
    lesson-vote.js    — API likes/dislikes par leçon (Netlify Blobs + rate limiting)
pages/
  academy/            — Listing Academy + modules + template leçons
  features/           — Fonctionnalités : listing + sous-pages détail
  lasuite/             — La suite : listing + sous-pages (jeux, analyse, communauté, calculateur pot odds)
  contact/             — Formulaire de contact (2 panels : Contact / Nous aider)
  lessons/             — Template leçons générées depuis CSV/Supabase
  cgu.njk              — Page multi-panels : Le projet, Risques, Aide inscriptions, CGU, Privacy, FAQ
test/
  lesson-vote.test.js  — Tests unitaires (node --test) de la logique de vote et du rate limiting
index.html             — Homepage
manifest.json          — Manifest PWA
robots.njk / sitemap.njk / 404.njk / 500.njk
netlify.toml            — Config build, redirects, headers de sécurité
```

---

## Modifier le contenu

Tout le texte du site passe par **`_data/texts.json`** — aucun texte hardcodé dans les templates (sauf exceptions ponctuelles).

Pour modifier un titre, une description, ou ajouter du contenu : ouvrir `_data/texts.json` et chercher la clé correspondante (ex. `home`, `lasuite`, `features`, `terms`…).

Les leçons Academy sont servies depuis Supabase (voir `_data/allLessons.js`) ; `lessons.csv`/`modules.csv` restent comme source de référence.

---

## Déploiement

Le site est lié à Netlify (`netlify.toml`) :
- Build command : `npm run build`
- Publish directory : `_site/`
- Fonctions serverless dans `netlify/functions/`
- Déploiement automatique sur chaque push de la branche `main`

---

## État du projet et todo

Ce README couvre la prise en main technique. Pour l'état d'avancement à jour, la todo priorisée, les décisions prises et le contexte détaillé de chaque fonctionnalité, voir **[`CLAUDE.md`](CLAUDE.md)** — c'est la source de référence unique, tenue à jour à chaque changement (pour éviter qu'elle diverge de ce README, comme c'était le cas avant).
