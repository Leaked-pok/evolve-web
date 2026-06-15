# Evolve Poker — Site vitrine

Site de présentation de l'application mobile **Evolve Poker**, outil de progression au poker (Academy, Ranges, Analyse de mains, Communauté). Développé en solo, gratuit, en français.

---

## Stack

- **[Eleventy (11ty) v2](https://www.11ty.dev/)** — générateur de site statique
- **Nunjucks** — templates HTML
- **CSS custom properties** — design system maison, 0 framework UI
- **JS vanilla** — pas de librairies
- **[Netlify](https://netlify.com)** — hébergement + fonctions serverless

---

## Installation & développement

```bash
npm install
npm start        # Démarre le serveur local sur http://localhost:8080
npm run build    # Génère le site statique dans _site/
```

---

## Structure du projet

```
_data/
  texts.json        — Tout le contenu éditorial (titres, textes, meta)
  lessons.csv       — Données des leçons Academy (source)
  modules.csv       — Données des modules Academy (source)
_includes/
  layout.njk        — Layout global (nav, head, footer)
  lesson-layout.njk — Layout spécifique pages leçons
assets/
  css/style.css     — Feuille CSS unique, tout le design system
  js/main.js        — JS global (nav, scroll, animations)
  images/           — Favicons, OG image, visuels
netlify/
  functions/
    lesson-vote.js  — API likes/dislikes par leçon (Netlify Blobs)
pages/
  academy/          — Listing Academy + modules + template leçons
  features/         — Fonctionnalités : listing + 4 sous-pages détail
  lasuite/          — La suite : listing + 4 sous-pages (jeux, analyse, communauté, pot odds)
  contact/          — Formulaire de contact (2 panels)
  lessons/          — Template leçons générées depuis CSV
  cgu.njk           — CGU multi-panels (Le projet, Risques, CGU, Privacy, FAQ)
index.html          — Homepage
```

---

## Modifier le contenu

Tout le texte du site passe par **`_data/texts.json`** — aucun texte hardcodé dans les templates.

Pour modifier un titre, une description, ou ajouter du contenu : ouvrir `_data/texts.json` et chercher la clé correspondante (ex. `home`, `lasuite`, `features`, `terms`…).

Pour les leçons Academy : modifier `_data/lessons.csv` et `_data/modules.csv`.

---

## Déploiement

Le site est configuré pour **Netlify** via `netlify.toml` :
- Build command : `npm run build`
- Publish directory : `_site/`
- Fonctions serverless dans `netlify/functions/`

Déploiement via commit + push sur la branche `main`.

---

## À compléter avant mise en ligne

| Priorité | Tâche |
|----------|-------|
| 🔴 | Remplacer `https://VOTRE_DOMAINE` dans `_data/texts.json` |
| 🔴 | Remplacer les 4 codes parrainage `[TON_CODE_*]` dans `pages/cgu.njk` |
| 🔴 | Remplir les placeholders légaux (`[NOM_EDITEUR]`, `[SIRET]`, `[EMAIL_CONTACT]`) dans `_data/texts.json` |
| 🔴 | Rédiger la Politique de confidentialité (sections `privacy` dans `_data/texts.json`) |
| 🔴 | Déployer sur Netlify et connecter le domaine |
| 🟡 | Activer Netlify Forms (formulaire de contact) |
| 🟡 | Ajouter les security headers dans `netlify.toml` |
| 🟡 | Configurer Analytics (Plausible recommandé) |
| 🟠 | Remplacer les blocs `[Placeholder]` dans les pages features/lasuite |
| 🟠 | Intégrer les visuels / illustrations (`feature-row__placeholder`) |

Voir `CLAUDE.md` pour le contexte technique complet.
