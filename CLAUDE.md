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
  images/             — logo, favicons, og-default, visuels par feature
netlify/
  functions/
    lesson-vote.js    — API likes/dislikes leçons (Netlify Blobs)
pages/
  academy/            — academy.html (listing) · academies.html · module.njk
  features/           — features.html (listing) · calendrier · mains · news · ranges
  lasuite/            — lasuite.html (page principale) · jeux · analyse · communaute · calculateur (pot odds)
  contact/            — contact.html (2 panels : Contact / Nous aider)
  lessons/            — lesson.njk (template leçons générées depuis CSV)
  cgu.njk             — Page multi-panels : Le projet / Risques / Aide inscriptions / CGU / Privacy / FAQ
manifest.json         — PWA manifest
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

**Codes parrainage** : masqués pour le moment (affichent "Bientôt disponible" dans les 4 blocs `.accordion__referral` de `pages/cgu.njk`) — à renseigner quand les comptes affiliés existeront.

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
Chaque feature row a `id="{{ row.id }}"` dans `_data/texts.json` (`jeux`, `analyse`, `communaute`, `potodds`).
Back buttons des sous-pages → `/pages/lasuite/lasuite.html#jeux` etc.

Le champ `coming_soon: true` sur une feature row affiche un `.badge.badge--neutral` "Bientôt disponible" à la place du bouton "Découvrir →" (voir `pages/lasuite/lasuite.html`).

---

## État d'avancement

### Fait ✓
- Homepage complète (hero, features, CTA stores)
- Academy : listing, modules, pages leçons (CSV)
- Fonctionnalités : page listing + 5 sous-pages détail (calendrier, mains, ranges, news + 1)
- La suite : page avec 4 features (Jeux, Analyse, Communauté, Pot odds "coming soon") + 4 sous-pages (jeux, analyse, communaute, calculateur)
- Contact : formulaire 2 panels (Contact / Nous aider), hash deep-link
- CGU / Le projet : 6 panels accordéons (Le projet, Risques poker, Aide inscriptions, CGU, Privacy, FAQ)
- Nav responsive (drawer mobile), footer beta
- SEO base : robots.njk, 404.njk, meta title/desc par page
- Open Graph complet (og:title, og:description, og:url, og:image 1200×630) — `layout.njk`
- Canonical URL — `layout.njk`
- Favicon complet — favicon.ico, favicon-96x96.png, favicon.svg, apple-touch-icon.png, web-app-manifest-192×192/512×512, og-default.png, manifest.json (PWA)
- Schema.org JSON-LD (LearningResource) — `lesson-layout.njk`
- netlify.toml (base build + redirects API)
- Design system cohérent, CSS unique, 0 dépendance UI
- GA4 web stream intégré + bannière consentement CNIL (Tarteaucitron) — `layout.njk`
- Security headers — `netlify.toml` (CSP, HSTS, X-Frame, etc.)
- Netlify Forms — formulaire contact et contribution opérationnels
- Vulnérabilités npm critiques corrigées (liquidjs + ws)
- Logo favicon.svg dans l'en-tête des pages leçons — `_includes/lesson-layout.njk`
- **Déploiement Netlify** — site créé et lié au repo GitHub (`ubiquitous-tiramisu-7fd9e1.netlify.app`), CI/CD auto sur push `main` configuré
- Fix CSP bloquant le CSS Tarteaucitron (bandeau cookies s'affichait en texte brut) — `style-src` autorise désormais `cdn.jsdelivr.net`
- **Adresse email de contact** — `contact.evolvepoker@gmail.com` créée (base aussi pour les futurs comptes réseaux sociaux), remplace `[EMAIL_CONTACT]` dans CGU/Privacy et alimente `email_contact/support/partners/team` (alias `+support`/`+partners`/`+team`) dans `_data/texts.json`
- **Notification Netlify Forms** — email de notification configuré vers `contact.evolvepoker@gmail.com` pour les formulaires `contact` et `contribution`
- **Supabase region** — confirmée en `eu-west-1` (Irlande, UE) ; section "Transferts hors UE" de `_data/texts.json` mise à jour en conséquence
- **Eleventy v2 → v3** — migration effectuée (`@11ty/eleventy@3.1.6`), build vérifié byte-identique à l'ancienne version, plus aucune vulnérabilité npm (`npm audit` propre)
- **Nettoyage `[Placeholder]` feature pages** — page Leçons (`feature_lecons`) et bloc `lasuite_detail` supprimés de `_data/texts.json` (orphelins, non référencés par aucun template) ; `hero_desc`/`sections` (jamais rendus) retirés de `feature_ranges`/`feature_calendrier`/`feature_news`/`feature_mains` ; `cta_desc` rédigé pour ces 4 pages

### Reste à faire ✗

| Priorité | Tâche | Scope |
|----------|-------|-------|
| 🔴 | **Clés API Supabase legacy désactivées** — `_data/allLessons.js` retourne 0 leçons en local (`npm start`) : "Legacy API keys are disabled" depuis le 2026-04-30. À corriger avec les nouvelles clés API Supabase (probablement `sb_publishable_...` / `sb_secret_...`) | Externe |
| 🔴 | **URL domaine** — remplacer `https://VOTRE_DOMAINE` dans `_data/texts.json` (affecte canonical, OG, sitemap) | Site |
| ⏸️ | **Codes parrainage** — masqués ("Bientôt disponible") tant que les comptes affiliés n'existent pas | Site |
| ⏸️ | **Identité éditeur légal** — nom/adresse/SIRET masqués dans CGU/Privacy tant que l'entreprise n'est pas créée | Site |
| 🟠 | **Relecture textes** — passe de relecture/finalisation de tout le contenu éditorial dans `_data/texts.json` (au-delà des `[Placeholder]` déjà identifiés) | Site |
| ⏸️ | **Migration domaine email** — une fois `evolvepoker.app` acheté (cf. tâche "URL domaine"), basculer vers Cloudflare Email Routing (gratuit) pour `contact@evolvepoker.app` → redirection vers `contact.evolvepoker@gmail.com` | Externe |
| 🟡 | **Firebase Analytics** — ajouter `firebase_analytics` dans le projet Flutter | App |
| 🟡 | **Lier Firebase → GA4** — connecter le projet Firebase à la propriété GA4 `G-6Q1X0GBT65` | Console Firebase |
| 🟡 | **Google UMP SDK** — consentement RGPD in-app (obligatoire avant activation AdMob) | App |
| 🟡 | **AdMob** — publicités in-app et webview ; plugin Flutter `google_mobile_ads` | App |
| 🟠 | **Deep link** `evolvepoker://` (Flutter) | App |
| 🟠 | **i18n** (langues) — non démarré | Site |
| 🟠 | **Sitemap.xml** — non généré (template Nunjucks à créer ou plugin `@11ty/eleventy-plugin-sitemap`) | Site |
| 🟠 | **SEO/SEA strategy** | Site |

---

## Conventions à respecter

- **Pas de framework CSS** — tout en custom properties et classes BEM-like
- **Nunjucks** pour les pages avec `layout.njk` en frontmatter
- **texts.json** pour tout contenu éditorial (pas de texte hardcodé dans les templates sauf exceptions)
- **JS vanilla uniquement** — pas de librairies
- **Mobile-first** — breakpoints principaux : 640px, 768px, 1024px
- **Commit + push** uniquement sur demande explicite
