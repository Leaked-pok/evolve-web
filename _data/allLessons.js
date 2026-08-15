const https = require('https');

const SUPABASE_URL      = 'https://vpzqboqbaosguyyqyzmx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_lL_-i8PPoRrHfW9kjEXt7Q_Eoxna5Uq';

// Met à true pour tester l'UI sans Supabase
const USE_MOCK = false;

const MOCK_LESSONS = [
  {
    lesson_id: 1,
    slug: 'demo-lecon-1',
    title: 'Bienvenue dans les MTT',
    introduction: 'Le point de départ. Comprends ce qu\'est un tournoi MTT, comment il se déroule et ce qui t\'attend en tant que joueur.',
    image_url: 'https://vpzqboqbaosguyyqyzmx.supabase.co/storage/v1/object/public/academy/parcours/M1-L01.webp',
    module_id: 1,
    content: `
      <h2>Qu'est-ce qu'un MTT ?</h2>
      <p>Un <strong>Multi-Table Tournament</strong> (MTT) est un tournoi de poker qui réunit des centaines, voire des milliers de joueurs simultanément sur plusieurs tables.</p>
    `
  },
  {
    lesson_id: 2,
    slug: 'demo-lecon-2',
    title: 'Règles du Texas Hold\'em',
    introduction: 'Deux cartes en main, cinq au centre. Apprends les règles fondamentales du Hold\'em de A à Z.',
    image_url: 'https://vpzqboqbaosguyyqyzmx.supabase.co/storage/v1/object/public/academy/parcours/M1-L02.webp',
    module_id: 1,
    content: `
      <h2>La distribution</h2>
      <p>Chaque joueur reçoit <strong>2 cartes privées</strong> (hole cards).</p>
    `
  }
];

function fetchPage(offset, limit) {
  return new Promise((resolve, reject) => {
    const path = `lessons?select=slug,module_slug,title,introduction,content,image_url,order_index&slug=not.is.null&order=order_index&offset=${offset}&limit=${limit}`;
    const url  = `${SUPABASE_URL}/rest/v1/${path}`;
    const options = {
      headers: {
        'apikey':        SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Accept':        'application/json',
      }
    };
    https.get(url, options, (res) => {
      const chunks = [];
      // Accumule les Buffer bruts et ne décode qu'une fois à la fin : concaténer des
      // chunks déjà convertis en string (`data += chunk`) coupe parfois un caractère
      // multi-octets (ex. "è") pile à la frontière réseau entre deux chunks, ce qui le
      // corrompt en "?" — d'où les accents cassés vus dans le contenu des leçons.
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const data = Buffer.concat(chunks).toString('utf8');
        try {
          resolve(JSON.parse(data));
        } catch(e) {
          console.warn('[allLessons] JSON parse error taille=' + data.length + ' début=' + data.substring(0, 200));
          reject(new Error('JSON parse error'));
        }
      });
    }).on('error', reject);
  });
}

async function fetchAllLessons() {
  const pageSize = 50;
  let offset = 0;
  const all = [];

  while (true) {
    const page = await fetchPage(offset, pageSize);
    if (!Array.isArray(page)) {
      console.warn('[allLessons] Réponse inattendue:', JSON.stringify(page).substring(0, 200));
      break;
    }
    if (page.length === 0) break;
    all.push(...page);
    console.log(`[allLessons] +${page.length} leçons (total: ${all.length})`);
    if (page.length < pageSize) break;
    offset += pageSize;
  }

  return all;
}

// En dessous de ce seuil (~480 leçons en base), on considère le fetch en échec plutôt que de publier un site incomplet
const MIN_EXPECTED_LESSONS = 400;

module.exports = async function () {
  if (USE_MOCK) {
    console.log('[allLessons] MODE MOCK — 2 leçons de test');
    return MOCK_LESSONS;
  }

  const isNetlifyBuild = !!process.env.NETLIFY;

  try {
    const lessons = await fetchAllLessons();

    if (!lessons.length) {
      const msg = '[allLessons] 0 leçons retournées — vérifie RLS et les slugs dans Supabase';
      if (isNetlifyBuild) throw new Error(msg);
      console.warn(msg);
      return [];
    }

    // Déduplique par slug (protection contre les doublons en base)
    const seen = new Set();
    const unique = lessons.filter(l => {
      if (seen.has(l.slug)) { console.warn('[allLessons] Slug en double ignoré:', l.slug); return false; }
      seen.add(l.slug);
      return true;
    });
    console.log(`[allLessons] Total: ${unique.length} leçons uniques (${lessons.length - unique.length} doublons ignorés)`);

    if (isNetlifyBuild && unique.length < MIN_EXPECTED_LESSONS) {
      throw new Error(`[allLessons] Seulement ${unique.length} leçons récupérées (minimum attendu: ${MIN_EXPECTED_LESSONS}) — build annulé pour éviter une publication incomplète`);
    }

    return unique;
  } catch(e) {
    if (isNetlifyBuild) throw e;
    console.warn('[allLessons] Erreur fetch Supabase:', e.message);
    return [];
  }
};
