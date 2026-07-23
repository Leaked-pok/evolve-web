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
- **Clés API Supabase legacy → nouvelle clé publishable** — `SUPABASE_ANON_KEY` dans `_data/allLessons.js` remplacée par la nouvelle clé `sb_publishable_...` (RLS déjà correctement configuré) ; vérifié en local (`npm start`) : 480 leçons uniques récupérées
- **Sitemap.xml** — `sitemap.njk` créé (template natif, boucle sur `collections.all`, pas de plugin), `robots.njk` mis à jour pour pointer dessus dynamiquement via `texts.site.url` ; corrigé au passage : pagination leçons/modules n'ajoutait que sa 1ère page à `collections.all` (`addAllPagesToCollections: true` ajouté) et `CLAUDE.md` était buildé comme page publique (`.eleventyignore`) — build vérifié : 534 URLs (480 leçons + 39 modules + 15 pages statiques). URLs encore en `VOTRE_DOMAINE` en attendant la tâche "URL domaine"
- **Relecture textes des 8 sous-pages features/lasuite** — réduction du contenu (calendrier -32%, mains -24%, news -36%, jeux -29%, communaute -27%, calculateur -45%) : suppression des redondances, retrait des noms de logiciels/sites concurrents cités explicitement (mains, news), francisation des anglicismes évitables (mains), réordonnancement de `lasuite/jeux` en En construction > Pourquoi > L'idée actuelle ; fix CSS au passage (`--space-14` manquante cassait le margin des `h2.feature-article__heading`, aucun espace visible sous les sous-titres à deux couleurs)
- **Rate limiting `lesson-vote.js`** — anti-spam vote en boucle : max 3 requêtes par (IP, leçon) toutes les 15 min via un store Blobs dédié (`lesson-vote-limits`), 429 au-delà, fail-open si le store est indisponible ; logique extraite en fonctions pures (`getClientIp`, `applyVote`, `checkRateLimit`) pour rester testable
- **Premiers tests automatisés** — `test/lesson-vote.test.js` (10 tests, `node --test`, natif Node, zéro dépendance) couvrant la logique de vote et le rate limiting ; `npm test` ajouté à `package.json`
- **Audit mots-clés poker FR + optimisation meta_title/meta_desc** — recherche web sur le champ lexical français (apprendre le poker, application poker gratuite, ranges/calculateur pot odds, calendrier tournois) ; meta_title/meta_desc réécrits pour `home`, `academy` et `features` dans `_data/texts.json` (mots-clés + longueur resserrée sous ~160 caractères, les anciennes meta_desc de `home`/`academy` dépassaient 190-218 caractères et étaient tronquées par Google) ; textes visibles (hero) non modifiés pour préserver la relecture éditoriale récente
- **Page erreur 500** — `500.njk` créé (même style que `404.njk` : `page-header`, `glow-bg`, `text-gradient`, boutons "Réessayer"/"Retour à l'accueil") ; à noter : Netlify ne sert ce fichier automatiquement que pour un statut 500, ce qui n'arrive pas nativement sur de l'hébergement statique — cette page sert de filet de sécurité, pas d'un mécanisme auto-déclenché comme la 404
- **Fix meta title/description vides sur la 404** — `layout.njk` ignorait le frontmatter `title`/`description` des pages sans `page_key` (comme `404.njk`) ; ajout d'un fallback, et `description` renseignée sur `404.njk`
- **Fix double-échappement HTML des apostrophes** — `layout.njk` capturait `_title`/`_desc` via `{% set %}...{% endset %}` (échappement Nunjucks une 1ère fois à la capture) puis les affichait via `{{ }}` (échappement une 2e fois), produisant `&amp;#39;` au lieu de `&#39;` dans tout le HTML généré (meta description, og:description, twitter:description) — bug préexistant sur tout le site, corrigé en passant à une assignation directe (`{% set _title = ... %}`)
- **Gestion d'erreur vote leçons** — `sendVote()` dans `lesson.njk` n'avait pas de `.catch()` : un échec réseau ou un rate-limit (429) échouait silencieusement ; ajout d'un message "Vote non enregistré. Réessayez plus tard." (`.lesson-feedback__error` dans `style.css`, même pattern que `.contact-form__error-msg`)
- **Vérification messages d'erreur formulaires** — `contact.html` gérait déjà correctement succès/échec Netlify Forms (`.contact-form__success-msg`/`.contact-form__error-msg`) ; rien à corriger

### Reste à faire ✗

| Priorité | Tâche | Scope |
|----------|-------|-------|
| 🔴 | **URL domaine** — remplacer `https://VOTRE_DOMAINE` dans `_data/texts.json` (affecte canonical, OG, sitemap) | Site |
| 🟠 | **Deep link** `evolvepoker://` (Flutter) | App |
| 🟠 | **i18n** (langues) — non démarré | Site |
| 🟠 | **Core Web Vitals / PageSpeed** — audit vitesse une fois le domaine final en place | Site — dépend de : URL domaine |

### Tests / Sécurité

| Priorité | Tâche | Scope |
|----------|-------|-------|
| 🔴 | **RLS Supabase désactivé** — 2 alertes critiques Advisor (`user_tournament_saves`, `tournaments`) non résolues | App/Backend |
| 🟢 | **Audit npm périodique** — propre depuis la migration Eleventy v3, prévoir un contrôle régulier | Site |

### Doc pro et après

| Priorité | Tâche | Scope |
|----------|-------|-------|
| 🟠 | **Documentation technique repo** — pas de README pour un futur contributeur/repreneur du projet | Site |
| 🟠 | **Press kit / fiche stores** — argumentaire et visuels pour App Store / Play Store à préparer avant lancement | Externe |
| 🟠 | **KPIs post-lancement** — définir les métriques à suivre une fois l'app publiée (installs, rétention, etc.) | App |

### Réseaux sociaux

| Priorité | Tâche | Scope |
|----------|-------|-------|
| 🔴 | **Création des comptes** — aucun compte réseau social créé (X, Instagram, TikTok...) ; `contact.evolvepoker@gmail.com` déjà prévu comme base | Externe |
| 🟠 | **Liens réseaux sociaux** — footer du site prêt à recevoir les liens, actuellement absents de `_data/texts.json` | Site |
| 🟠 | **Calendrier de contenu** — stratégie de publication à définir | Externe |

### Erreur message

| Priorité | Tâche | Scope |
|----------|-------|-------|
| 🟡 | **Échec Supabase silencieux** — `allLessons.js` retourne `[]` sans alerte visible si le fetch échoue (juste un `console.warn`), risque de build "vide" passé inaperçu | Site |
| 🟠 | **Messages d'erreur app Flutter** — cohérence UX à définir avec le site | App |

### Backend (Firebase Analytics et Google)

| Priorité | Tâche | Scope |
|----------|-------|-------|
| 🟡 | **Firebase Analytics** — ajouter `firebase_analytics` dans le projet Flutter | App |
| 🟡 | **Lier Firebase → GA4** — connecter le projet Firebase à la propriété GA4 `G-6Q1X0GBT65` | Console Firebase |
| 🟡 | **Google UMP SDK** — consentement RGPD in-app (obligatoire avant activation AdMob) | App |
| 🟠 | **Google Search Console** — non configuré pour le site | Site — dépend de : URL domaine |
| 🟠 | **Google Play Console** — fiche/setup de l'app à préparer | Externe |

### Todo v2 — en pause (à ne traiter que sur demande explicite)

| Priorité | Tâche | Scope |
|----------|-------|-------|
| ⏸️ | **Codes parrainage** — masqués ("Bientôt disponible") tant que les comptes affiliés n'existent pas | Site |
| ⏸️ | **Identité éditeur légal** — nom/adresse/SIRET masqués dans CGU/Privacy tant que l'entreprise n'est pas créée | Site |
| ⏸️ | **Migration domaine email** — une fois `evolvepoker.app` acheté (cf. tâche "URL domaine"), basculer vers Cloudflare Email Routing (gratuit) pour `contact@evolvepoker.app` → redirection vers `contact.evolvepoker@gmail.com` | Externe |
| ⏸️ | **AdMob** — publicités in-app et webview ; plugin Flutter `google_mobile_ads` | App |
| ⏸️ | **SEA — campagnes Google Ads Search** (test petit budget, mots-clés ciblés issus de l'audit) | Site/Externe — dépend de : Firebase Analytics, Lien Firebase → GA4 |
| ⏸️ | **SEA — Google Ads App Campaigns (UAC)** — format optimisé installs (Search + YouTube + Play Store + Display) | Externe — dépend de : Google Play Console, Firebase Analytics |

---

## Conventions à respecter

- **Pas de framework CSS** — tout en custom properties et classes BEM-like
- **Nunjucks** pour les pages avec `layout.njk` en frontmatter
- **texts.json** pour tout contenu éditorial (pas de texte hardcodé dans les templates sauf exceptions)
- **JS vanilla uniquement** — pas de librairies
- **Mobile-first** — breakpoints principaux : 640px, 768px, 1024px
- **Commit + push** uniquement sur demande explicite
