# CLAUDE.md — Contexte maître Evolve Poker

> **Ne fait aucun changement tant que tu n'as pas 95% de confiance. Pose-moi des questions de suivi.**

---

## Le projet

**Evolve Poker** — site vitrine d'une application mobile de progression au poker, développé en solo par un passionné. L'app est **gratuite**, pensée pour tous niveaux (débutant → avancé), en français.

- **Stack** : Eleventy (11ty) v2 · Nunjucks templates · CSS custom properties (pas de framework) · JS vanilla · Netlify (hébergement cible)
- **Dev** : `npm start` → Eleventy avec live reload sur `localhost:8080`
- **Build** : `npm run build` → `_site/`
- **Repo** : git, branche `main`, déploiements via commit + push

---

## Architecture des fichiers

```
_data/
  texts.json          — Tout le contenu texte (titres, meta, descriptions)
  academy.js / allLessons.js / allModules.js — Données Academy
  lessons.csv / modules.csv — Source CSV des leçons
_includes/
  layout.njk          — Layout global (nav, footer, head)
  lesson-layout.njk   — Layout spécifique leçons
assets/
  css/style.css       — Feuille CSS unique (~4000 lignes), tout le design system
  js/main.js          — JS global
  images/logo.png
pages/
  academy/academy.html · academies.html · module.njk
  features/features.html + calendrier/mains/news/ranges.html (sous-pages)
  lasuite/            — lasuite.html (page principale) + jeux/analyse/communaute.html (sous-pages)
  contact/contact.html
  cgu.njk             — Page multi-panels : Le projet / Risques / Aide inscriptions / CGU / Privacy / FAQ
  lessons/lesson.njk
index.html            — Homepage
robots.njk · 404.njk
```

---

## Design system (CSS variables clés)

```css
--color-gold / --color-gold-light / --color-gold-dim — couleur accentuation principale
--color-surface  — fond des cards (#1a1a2e environ)
--color-border / --color-border-light
--color-text / --color-text-2 / --color-text-3 — hiérarchie texte
--z-nav = 50  — z-index de la nav (back buttons = z-index 51)
--radius-xl   — border-radius cards
text-gradient → linear-gradient(135deg, #FF7FA0 0%, gold 50%, #A8204A 100%)
```

**Composants récurrents** : `.btn-store`, `.cgu-card`, `.accordion`, `.feature-back-sticky`, `.hero`, `.glow-bg`

---

## Navigation

- **Top nav** : Apps (dropdown stores) · Home · Academy · Fonctionnalités · La suite · Le projet (dropdown) · Contact
- **"Le projet" dropdown** : Le projet · Risques du Poker · Aide aux inscriptions · Conditions d'utilisation · Politique de confidentialité · FAQ
- **Footer** : logo + texte beta + liens (Academy · Fonctionnalités · La suite · Le projet · Contact) + réseaux sociaux
- `activeNav` = prop frontmatter sur chaque page pour activer le bon lien

---

## Page CGU (`pages/cgu.njk`)

Panel unique avec selector `<select>` + JS `cguShow(val)`. 6 panels :

| value | Titre hero |
|-------|-----------|
| `evolve` | Le **projet** |
| `risques` | Les **risques** |
| `aide` | Aide aux **inscriptions** |
| `terms` | Le **projet** |
| `privacy` | Le **projet** |
| `faq` | Le **projet** |

Hash navigation : `/cgu/#aide` active directement le bon panel.
Les panels Risques et Aide utilisent des `<details class="accordion">` — style card (icon 40px rose + overline rose + titre bold + preview 2 lignes + flèche).

**Codes parrainage à remplir** : `[TON_CODE_WINAMAX]` · `[TON_CODE_POKERSTARS]` · `[TON_CODE_PMU]` · `[TON_CODE_UNIBET]`

---

## Patterns techniques importants

### Back button (pages features / lasuite)
```css
.feature-back-sticky {
  position: fixed; top: 88px; left: 0; right: 0;
  z-index: calc(var(--z-nav) + 1); /* = 51, AU-DESSUS de la nav */
  pointer-events: none;
}
.feature-back-btn { pointer-events: auto; }
```
Envelopper dans `.container` pour aligner avec le logo.

### Hash deep-link (contact.html)
```js
const hash = window.location.hash.replace('#', '');
if (hash === 'panel-help' || hash === 'panel-contact') showPanel(hash);
```

### Accordion (accordéons `<details>`)
```html
<details class="accordion">
  <summary class="accordion__header">
    <span class="accordion__icon">SVG</span>
    <div class="accordion__card-body">
      <span class="accordion__overline">CATÉGORIE</span>
      <span class="accordion__title">Titre</span>
      <p class="accordion__preview">Début du texte visible...</p>
    </div>
    <svg class="accordion__arrow">▾</svg>
  </summary>
  <div class="accordion__body">contenu complet</div>
</details>
```
- Flèche animée CSS : `details[open] .accordion__arrow { transform: rotate(180deg); }`
- Body indenté : `padding-left: calc(var(--space-6) + 40px + var(--space-5))`

### La suite — feature rows avec anchors
Chaque feature row a `id="{{ row.id }}"` dans `_data/texts.json` (`jeux`, `analyse`, `communaute`).
Back buttons des sous-pages → `/pages/next/lasuite.html#jeux` etc.

---

## État d'avancement

### Fait ✓
- Homepage complète (hero, features, CTA stores)
- Academy : listing, modules, pages leçons (CSV)
- Fonctionnalités : page listing + 5 sous-pages détail (calendrier, mains, ranges, news + 1)
- La suite : page avec 3 features (Jeux, Analyse, Communauté) + 3 sous-pages éditoriales
- Contact : formulaire 2 panels (Contact / Nous aider), hash deep-link
- CGU / Le projet : 6 panels accordéons (Le projet, Risques poker, Aide inscriptions, CGU, Privacy, FAQ)
- Nav responsive (drawer mobile), footer beta
- SEO base : robots.njk, 404.njk, meta title/desc par page
- Design system cohérent, CSS unique, 0 dépendance UI

### Reste à faire ✗

| Priorité | Tâche |
|----------|-------|
| 🔴 | **Codes parrainage** — remplacer les 4 placeholders `[TON_CODE_*]` |
| 🔴 | **Contenu CGU/Privacy/Terms** — remplacer tous les `[Placeholder]` dans `texts.json` |
| 🔴 | **Hébergement Netlify** — déployer + mettre le vrai domaine dans `robots.njk` |
| 🟡 | **Formulaire contact backend** — activer Netlify Forms + tester les emails |
| 🟡 | **Google AdSense + Axeptio** (cookies) **+ Analytics** (GA ou Plausible) |
| 🟡 | **Security headers** — `netlify.toml` (CSP, X-Frame, etc.) |
| 🟡 | **Open Graph meta tags** — og:image, og:title sur chaque page |
| 🟡 | **Canonical URLs** |
| 🟡 | **Structured data Schema.org** |
| 🟠 | **Deep link** `evolvepoker://` (Flutter) |
| 🟠 | **Webhook rebuild** Netlify auto sur push |
| 🟠 | **Favicon complet** (apple-touch-icon, manifest) |
| 🟠 | **i18n** (langues) — non démarré |
| 🟠 | **SEO/SEA strategy** |
| 🟠 | **Photos site + catégories** |
| 🟠 | **Logo "E" pour les leçons** |

---

## Conventions à respecter

- **Pas de framework CSS** — tout en custom properties et classes BEM-like
- **Nunjucks** pour les pages avec `layout.njk` en frontmatter
- **texts.json** pour tout contenu éditorial (pas de texte hardcodé dans les templates sauf exceptions)
- **JS vanilla uniquement** — pas de librairies
- **Mobile-first** — breakpoints principaux : 640px, 768px, 1024px
- **Commit + push** uniquement sur demande explicite
