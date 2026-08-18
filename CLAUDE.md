# CLAUDE.md — Contexte maître Evolve Poker

> **Ne fait aucun changement tant que tu n'as pas 95% de confiance. Pose-moi des questions de suivi.**

---

## Le projet

**Evolve Poker** — site vitrine d'une application mobile de progression au poker, développé en solo par un passionné. L'app est **gratuite**, pensée pour tous niveaux (débutant → avancé), en français.

- **Stack** : Eleventy (11ty) v3 · Nunjucks templates · CSS custom properties (pas de framework) · JS vanilla · Netlify (hébergement cible)
- **Dev** : `npm start` → Eleventy avec live reload sur `localhost:8080`
- **Build** : `npm run build` → `_site/`
- **Repo** : git — branche `dev` pour le travail courant, branche `main` = production (voir "Workflow Git / déploiement Netlify" ci-dessous)

---

## Workflow Git / déploiement Netlify (économie de credits)

**Contexte** : Netlify facture en "credits" mensuels (300/mois sur le plan actuel, cycle du 20 au 19 du mois). Diagnostic du 13/08/2026 sur une alerte à 75% du quota (cycle 20/07–19/08) : **les déploiements de prod dominent la conso à 97%** (16 déploiements = 240 credits, soit ~15 credits/déploiement, peu importe le nombre de commits regroupés dans un même push). Le trafic du site est négligeable (1 863 requêtes = ~7 credits, soit ~0,004 credit/requête) — la fréquentation n'est pas un risque de dépassement, la fréquence de mise en ligne l'est.

**Principe** : 2 branches, 2 usages.

| Branche | Usage | Coût Netlify |
|---|---|---|
| `dev` | Tout le travail courant : commits, push, tests | **0 credit** (`Branch deploys` = `None` côté Netlify → aucun build déclenché) |
| `main` | Production uniquement | 1 déploiement (~15 credits) à **chaque** push |

**Réglages Netlify** (Site configuration → Build & deploy → Continuous deployment) : Production branch = `main`, Branch deploys = `None`, Deploy Previews = "Any pull request..." (⚠️ ne jamais ouvrir de PR GitHub vers `main` — ça déclencherait un build de preview facturé ; toujours merger en local).

**Procédure** :
```
# Travail courant (aussi souvent que voulu, gratuit)
git checkout dev
git add … && git commit -m "…" && git push origin dev

# Mise en ligne (uniquement sur demande explicite : "publie" / "mets en ligne" / "déploie")
git checkout main
git merge dev
git push origin main   # déclenche le déploiement Netlify
```

Test local (`npm start`) reste évidemment gratuit et illimité, indépendant de tout ça.

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
- **Sitemap.xml** — `sitemap.njk` créé (template natif, boucle sur `collections.all`, pas de plugin), `robots.njk` mis à jour pour pointer dessus dynamiquement via `texts.site.url` ; corrigé au passage : pagination leçons/modules n'ajoutait que sa 1ère page à `collections.all` (`addAllPagesToCollections: true` ajouté) et `CLAUDE.md` était buildé comme page publique (`.eleventyignore`) — build vérifié : 534 URLs (480 leçons + 39 modules + 15 pages statiques)
- **Relecture textes des 8 sous-pages features/lasuite** — réduction du contenu (calendrier -32%, mains -24%, news -36%, jeux -29%, communaute -27%, calculateur -45%) : suppression des redondances, retrait des noms de logiciels/sites concurrents cités explicitement (mains, news), francisation des anglicismes évitables (mains), réordonnancement de `lasuite/jeux` en En construction > Pourquoi > L'idée actuelle ; fix CSS au passage (`--space-14` manquante cassait le margin des `h2.feature-article__heading`, aucun espace visible sous les sous-titres à deux couleurs)
- **Rate limiting `lesson-vote.js`** — anti-spam vote en boucle : max 3 requêtes par (IP, leçon) toutes les 15 min via un store Blobs dédié (`lesson-vote-limits`), 429 au-delà, fail-open si le store est indisponible ; logique extraite en fonctions pures (`getClientIp`, `applyVote`, `checkRateLimit`) pour rester testable
- **Premiers tests automatisés** — `test/lesson-vote.test.js` (10 tests, `node --test`, natif Node, zéro dépendance) couvrant la logique de vote et le rate limiting ; `npm test` ajouté à `package.json`
- **Audit mots-clés poker FR + optimisation meta_title/meta_desc** — recherche web sur le champ lexical français (apprendre le poker, application poker gratuite, ranges/calculateur pot odds, calendrier tournois) ; meta_title/meta_desc réécrits pour `home`, `academy` et `features` dans `_data/texts.json` (mots-clés + longueur resserrée sous ~160 caractères, les anciennes meta_desc de `home`/`academy` dépassaient 190-218 caractères et étaient tronquées par Google) ; textes visibles (hero) non modifiés pour préserver la relecture éditoriale récente
- **Page erreur 500** — `500.njk` créé (même style que `404.njk` : `page-header`, `glow-bg`, `text-gradient`, boutons "Réessayer"/"Retour à l'accueil") ; à noter : Netlify ne sert ce fichier automatiquement que pour un statut 500, ce qui n'arrive pas nativement sur de l'hébergement statique — cette page sert de filet de sécurité, pas d'un mécanisme auto-déclenché comme la 404
- **Fix meta title/description vides sur la 404** — `layout.njk` ignorait le frontmatter `title`/`description` des pages sans `page_key` (comme `404.njk`) ; ajout d'un fallback, et `description` renseignée sur `404.njk`
- **Fix double-échappement HTML des apostrophes** — `layout.njk` capturait `_title`/`_desc` via `{% set %}...{% endset %}` (échappement Nunjucks une 1ère fois à la capture) puis les affichait via `{{ }}` (échappement une 2e fois), produisant `&amp;#39;` au lieu de `&#39;` dans tout le HTML généré (meta description, og:description, twitter:description) — bug préexistant sur tout le site, corrigé en passant à une assignation directe (`{% set _title = ... %}`)
- **Gestion d'erreur vote leçons** — `sendVote()` dans `lesson.njk` n'avait pas de `.catch()` : un échec réseau ou un rate-limit (429) échouait silencieusement ; ajout d'un message "Vote non enregistré. Réessayez plus tard." (`.lesson-feedback__error` dans `style.css`, même pattern que `.contact-form__error-msg`)
- **Vérification messages d'erreur formulaires** — `contact.html` gérait déjà correctement succès/échec Netlify Forms (`.contact-form__success-msg`/`.contact-form__error-msg`) ; rien à corriger
- **Fix échec Supabase silencieux** — `allLessons.js` retournait `[]` sans bloquer le build en cas d'échec de fetch (0 leçon ou erreur réseau), risquant une publication Netlify avec l'Academy vide sans alerte ; ajout d'un seuil `MIN_EXPECTED_LESSONS = 400` (vs ~480 en base) et détection du contexte build via `process.env.NETLIFY` — en build Netlify, un fetch en échec ou sous le seuil fait désormais échouer le build (au lieu de publier un site incomplet), déclenchant l'email de notification d'échec Netlify ; en local (`npm start`), comportement inchangé (`console.warn` + `[]`) pour ne pas bloquer le dev hors-ligne
- **Cohérence UX messages d'erreur app Flutter** (repo `ProjetP30/flutter_application_1`) — décision : registre tu/vous **non unifié** entre app et site (app = tutoiement partout, site = vouvoiement partout ; scission volontaire et déjà cohérente en interne de chaque côté, pattern courant en FR app-vs-vitrine — ne pas essayer d'aligner). Travail effectif : audit de 18 messages d'erreur qui fuitaient l'exception brute côté utilisateur (`'Erreur : $e'` / `e.toString()` dans des `UiFeedback.error(...)` ou des `Text()` directs) → remplacés par des messages français curatés, courts, actionnables ("Réessaie plus tard."), cohérents avec le pattern déjà en place (`ErrorPage`, `AppErrorWidget`) ; 3 de ces cas (`calendar_page.dart`, `my_tournaments_list_page.dart`, `hand_notes_dashboard_page.dart`) affichaient un `Text()` brut au lieu du composant `AppErrorWidget` standard — remplacés, avec bouton "Réessayer" branché sur l'invalidation du provider concerné. Bug additionnel trouvé et corrigé au passage : `quiz_page.dart` ne repassait jamais `_isLoading` à `false` en cas d'erreur de chargement → l'écran d'erreur ne s'affichait jamais (loader infini)
- **RLS Supabase activé** — les 2 alertes critiques Advisor (`user_tournament_saves`, `tournaments`) sont résolues : Row Level Security activé avec policies scopées, confirmé côté Supabase
- **Firebase Analytics + lien GA4** (repo Flutter) — SDK intégré, propriété GA4 dédiée créée et activée, événements custom + tracking d'écran confirmés fonctionnels en DebugView
- **Deep link `evolvepoker://`** (repo Flutter) — scheme fonctionnel ; bug de course trouvé et corrigé au passage : le Splash écrasait la navigation d'un deep link entrant au lieu de la respecter
- **Google UMP SDK** (repo Flutter) — formulaire de consentement RGPD confirmé fonctionnel en conditions réelles ; aucune unité pub AdMob activée (AdMob reste en pause, cf. Todo v2)
- **Comptes X + Instagram créés** — `https://x.com/evolvepokerFr` et `https://www.instagram.com/evolvepokerfr/` ; liens branchés dans le footer (`_includes/layout.njk`, icônes Instagram/X) avec `target="_blank" rel="noopener noreferrer"` ; icônes Discord et Facebook ajoutées en attendant (lien `#`, comptes non créés — cf. Todo v2)
- **README.md remis à jour** — l'ancien README référençait encore Eleventy v2 et une todo "à compléter avant mise en ligne" quasi entièrement obsolète (presque tout fait depuis) ; réécrit pour un contributeur/repreneur humain (stack, install, structure à jour, déploiement), et ne duplique plus la todo — renvoie vers `CLAUDE.md` comme source unique pour éviter que les deux redivergent
- **Workflow Git anti-conso de credits Netlify** — suite à une alerte à 75% du quota mensuel (300 credits, cycle 20/07–19/08/2026), diagnostic du breakdown Netlify : 16 déploiements de prod = 240 credits (97% du total), trafic négligeable (~0,004 credit/requête) ; branche `dev` créée et poussée sur GitHub pour absorber tous les commits de travail (`Branch deploys` = `None` côté Netlify → 0 build déclenché), `main` réservé aux mises en ligne explicites — détail dans la section "Workflow Git / déploiement Netlify" plus haut
- **URL domaine** — domaine `evolvepoker.eu` acheté (registrar IONOS SE) et branché : `texts.site.url` dans `_data/texts.json` pointe déjà dessus, build vérifié (canonical, OG, sitemap.xml et robots.txt utilisent tous `https://evolvepoker.eu`, plus aucune trace de `VOTRE_DOMAINE`)
- **Audit Core Web Vitals / PageSpeed + fixes** — Lighthouse (moteur PageSpeed Insights, API publique à quota épuisé donc exécuté en local) sur `evolvepoker.eu` en prod : perf 86, a11y 96→100, best practices 96, SEO 100. Corrigé : 6 images (`ranges1`/`mains1`/`news1`/`calendrier1`/`academy2`/`logo`) converties PNG→WebP et redimensionnées à leur taille d'affichage réelle (`sharp` installé temporairement, `--no-save`, jamais dans `package.json`) — poids homepage -5 Mo (5,66 Mo → ~700 Ko) ; `width`/`height` explicites sur le logo (3 usages) contre le layout shift ; `tarteaucitron.min.js` passé en `defer` (912 ms de render-blocking récupérés, init déplacée sur `DOMContentLoaded`) ; contraste WCAG AA du footer corrigé (`--color-text-3` sur `--color-bg-2` = 2.99:1, insuffisant → `--color-text-2`) ; contraste du bandeau cookies Tarteaucitron corrigé (régression introduite par le passage en bannière "discrète" du même jour — `--color-text-3` sur `--color-surface` = 2.71:1, et le bouton `#tarteaucitronPrivacyUrl` n'était stylé par aucune règle existante = 1.25:1). Le gain de perf réel ne sera mesurable qu'après déploiement sur `main` (un audit local `npm start` n'est pas comparable : pas de gzip contrairement à Netlify)
- **Placeholder App Store (lancement iOS en V2)** — Android sort en V1, iOS suit en V2 ; les boutons App Store et Google Play (`.btn-store` / `.nav__dropdown-store`, 11 emplacements : nav dropdown, drawer mobile, hero + CTA de 13 pages) étaient traités à l'identique. Le bouton App Store a désormais son propre style (`.btn-store--soon` / `.nav__dropdown-store--soon` — opacité 0.5, non cliquable, `aria-disabled`) et son libellé passe à "Bientôt disponible" ; Google Play reste inchangé (placeholder actif, couvert par la tâche "Lien store"). Vérifié visuellement (screenshot local). Non traité volontairement : la Privacy Policy mentionne encore "Android et iOS" sans distinction — texte légal laissé pour la tâche "Relecture CGU" plutôt que réécrit à la volée

### Reste à faire ✗

| Priorité | Tâche | Scope |
|----------|-------|-------|
| 🔴 | **Mention légale IA sur les leçons** — vérifier si le contenu des leçons (rédigé/assisté par IA) nécessite une mention légale de transparence, et la rédiger si besoin. Vérifié à ce jour : aucune mention de ce type n'existe dans CGU/Privacy (`_data/texts.json`) | Site |
| 🟠 | **Relecture CGU** — repasser sur le contenu du panel `terms` de `pages/cgu.njk` (pas de relecture dédiée recensée depuis la rédaction initiale) ; inclut la phrase de la Privacy Policy (`_data/texts.json` ligne ~21) qui mentionne "application mobile Android et iOS" sans distinguer que iOS n'arrive qu'en V2 | Site |
| 🟢 | **Liste complète des placeholders** — inventaire fait par grep sur le repo (18/08/2026) : (1) boutons App Store → traité (voir "Fait ✓") ; bouton Google Play `href="#"` sur ~20 pages + nav dropdown + drawer mobile → couvert par "Lien store" ; (2) icônes réseaux sociaux Discord/TikTok/YouTube/Facebook `href="#"` (`layout.njk`) → couvert par Todo v2 ; (3) codes parrainage "Bientôt disponible" ×4 (`pages/cgu.njk`) → couvert par Todo v2 ; (4) identité éditeur légal masquée (CGU/Privacy) → couvert par Todo v2 ; (5) `.feature-row__placeholder` ("Illustration") dans `academy.html`/`features.html`/`lasuite.html` — fallback de template pour `row.image` manquant, actuellement inutilisé (toutes les images sont renseignées), pas un placeholder actif. À revalider avant le lancement public général | Site |

### Tests / Sécurité

| Priorité | Tâche | Scope |
|----------|-------|-------|
| 🟢 | **Audit npm périodique** — propre depuis la migration Eleventy v3, prévoir un contrôle régulier | Site |

### Doc pro et après

| Priorité | Tâche | Scope |
|----------|-------|-------|
| 🟠 | **Lien store** — ajouter les liens App Store / Play Store une fois l'app publiée | Externe |
| 🟠 | **KPIs post-lancement** — définir les métriques à suivre une fois l'app publiée (installs, rétention, etc.) | Site |

### Réseaux sociaux

| Priorité | Tâche | Scope |
|----------|-------|-------|
| 🟢 | ~~Création comptes X + Instagram~~ | Fait — voir section "Fait ✓" |

### Backend (Firebase Analytics et Google)

| Priorité | Tâche | Scope |
|----------|-------|-------|
| 🟠 | **Google Search Console** — non configuré pour le site | Site |

### Todo v2 — en pause (à ne traiter que sur demande explicite)

| Priorité | Tâche | Scope |
|----------|-------|-------|
| ⏸️ | **Codes parrainage** — masqués ("Bientôt disponible") tant que les comptes affiliés n'existent pas | Site |
| ⏸️ | **Identité éditeur légal** — nom/adresse/SIRET masqués dans CGU/Privacy tant que l'entreprise n'est pas créée | Site |
| ⏸️ | **Migration domaine email** — `evolvepoker.eu` déjà acheté (registrar IONOS) ; basculer vers Cloudflare Email Routing (gratuit) pour `contact@evolvepoker.eu` → redirection vers `contact.evolvepoker@gmail.com` | Externe |
| ⏸️ | **AdMob** — publicités in-app et webview ; plugin Flutter `google_mobile_ads` | App |
| ⏸️ | **i18n** (langues) — non démarré, à réévaluer une fois l'app multi-langue et le trafic international avéré | Site |
| ⏸️ | **SEA — campagnes Google Ads Search** (test petit budget, mots-clés ciblés issus de l'audit) | Site/Externe — dépendances Firebase Analytics/GA4 déjà remplies |
| ⏸️ | **SEA — Google Ads App Campaigns (UAC)** — format optimisé installs (Search + YouTube + Play Store + Display) | Externe |
| ⏸️ | **Comptes Discord / YouTube / TikTok / Facebook** — X et Instagram déjà créés (voir "Fait ✓") ; ces 4 restent à créer, icônes déjà présentes dans le footer (`layout.njk`, ordre : Discord · Instagram · X · TikTok · YouTube · Facebook) en lien `#` en attendant | Externe |

---

## Conventions à respecter

- **Pas de framework CSS** — tout en custom properties et classes BEM-like
- **Nunjucks** pour les pages avec `layout.njk` en frontmatter
- **texts.json** pour tout contenu éditorial (pas de texte hardcodé dans les templates sauf exceptions)
- **JS vanilla uniquement** — pas de librairies
- **Mobile-first** — breakpoints principaux : 640px, 768px, 1024px
- **Commit sur `dev`** possible à tout moment (0 conséquence, 0 credit Netlify) ; **push sur `main`** (= mise en ligne, consomme des credits) uniquement sur demande explicite ("publie" / "mets en ligne" / "déploie")
