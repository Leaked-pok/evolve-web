// Netlify Function — compteur de likes/dislikes par leçon
// Stockage : Netlify Blobs (gratuit, intégré à Netlify)
//
// Endpoints :
//   GET  /api/lesson-vote?lesson=<slug>   → { likes, dislikes } pour une leçon
//   GET  /api/lesson-vote                 → toutes les leçons triées par likes (vue admin)
//   POST /api/lesson-vote                 → body { lesson, vote: 'like'|'unlike'|'dislike'|'undislike' }
const { getStore } = require('@netlify/blobs');

const VALID_VOTES = ['like', 'unlike', 'dislike', 'undislike'];
// Anti-spam : au-delà de RATE_LIMIT_MAX votes pour une même (IP, leçon)
// sur la fenêtre, les requêtes suivantes sont rejetées (429).
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 3;
const HEADERS_JSON = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};
const HEADERS_HTML = {
  'Content-Type': 'text/html; charset=utf-8'
};

// Extraite pour être testée sans mocker le réseau/Blobs.
function getClientIp(event) {
  const headers = event.headers || {};
  const nfIp = headers['x-nf-client-connection-ip'];
  if (nfIp) return nfIp;
  const forwarded = headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown';
}

function applyVote(data, vote) {
  const next = { likes: data.likes || 0, dislikes: data.dislikes || 0 };
  if (vote === 'like')      next.likes    = Math.max(0, next.likes    + 1);
  if (vote === 'unlike')    next.likes    = Math.max(0, next.likes    - 1);
  if (vote === 'dislike')   next.dislikes = Math.max(0, next.dislikes + 1);
  if (vote === 'undislike') next.dislikes = Math.max(0, next.dislikes - 1);
  return next;
}

// Fenêtre fixe par clé (IP+leçon) : incrémente le compteur, le remet à
// zéro si la fenêtre précédente est expirée.
function checkRateLimit(entry, now) {
  const current = entry && (now - entry.windowStart) < RATE_LIMIT_WINDOW_MS
    ? { count: entry.count, windowStart: entry.windowStart }
    : { count: 0, windowStart: now };
  current.count += 1;
  return { allowed: current.count <= RATE_LIMIT_MAX, entry: current };
}

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: HEADERS_JSON, body: '' };
  }

  let store;
  try {
    store = getStore('lesson-votes');
  } catch (err) {
    return { statusCode: 500, headers: HEADERS_JSON, body: JSON.stringify({ error: 'Store unavailable' }) };
  }

  // ── GET ────────────────────────────────────────────────────────────────────
  if (event.httpMethod === 'GET') {
    const lesson = event.queryStringParameters && event.queryStringParameters.lesson;

    // Vue admin : liste toutes les leçons
    if (!lesson) {
      const { blobs } = await store.list().catch(() => ({ blobs: [] }));
      const results = [];
      for (const blob of blobs) {
        const data = await store.get(blob.key, { type: 'json' }).catch(() => null);
        if (data) results.push({ lesson: blob.key, likes: data.likes || 0, dislikes: data.dislikes || 0 });
      }
      results.sort((a, b) => b.likes - a.likes);

      const rows = results.length
        ? results.map(r =>
            `<tr>
              <td style="padding:10px 16px;border-bottom:1px solid #333;">${r.lesson}</td>
              <td style="padding:10px 16px;border-bottom:1px solid #333;text-align:center;color:#f5c842;">👍 ${r.likes}</td>
              <td style="padding:10px 16px;border-bottom:1px solid #333;text-align:center;color:#888;">👎 ${r.dislikes}</td>
            </tr>`).join('')
        : `<tr><td colspan="3" style="padding:16px;text-align:center;color:#888;">Aucun vote enregistré</td></tr>`;

      const html = `<!DOCTYPE html><html lang="fr">
<head><meta charset="UTF-8"><title>Evolve — Votes leçons</title>
<style>
  body { font-family: Inter, sans-serif; background: #0d0d1a; color: #e0e0e0; padding: 32px; }
  h1 { color: #f5c842; margin-bottom: 8px; }
  p { color: #888; margin-bottom: 24px; }
  table { border-collapse: collapse; width: 100%; max-width: 640px; }
  th { text-align: left; padding: 10px 16px; border-bottom: 2px solid #f5c842; color: #f5c842; font-size: 13px; text-transform: uppercase; letter-spacing: .05em; }
</style>
</head>
<body>
  <h1>Votes par leçon</h1>
  <p>${results.length} leçon(s) avec votes · triées par likes</p>
  <table>
    <thead><tr><th>Leçon (slug)</th><th>Likes</th><th>Dislikes</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</body></html>`;

      return { statusCode: 200, headers: HEADERS_HTML, body: html };
    }

    // Compteurs d'une leçon spécifique
    const data = await store.get(lesson, { type: 'json' }).catch(() => null);
    return {
      statusCode: 200,
      headers: HEADERS_JSON,
      body: JSON.stringify(data || { likes: 0, dislikes: 0 })
    };
  }

  // ── POST ───────────────────────────────────────────────────────────────────
  if (event.httpMethod === 'POST') {
    let body;
    try {
      body = JSON.parse(event.body);
    } catch {
      return { statusCode: 400, headers: HEADERS_JSON, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    const { lesson, vote } = body;
    if (!lesson || !VALID_VOTES.includes(vote)) {
      return { statusCode: 400, headers: HEADERS_JSON, body: JSON.stringify({ error: 'Invalid params' }) };
    }

    // Anti-spam : limite les votes en boucle sur une même leçon depuis une même IP.
    // Fail-open si le store de limitation est indisponible, pour ne pas bloquer
    // le vote légitime à cause d'un souci d'infra secondaire.
    try {
      const limitStore = getStore('lesson-vote-limits');
      const limitKey = `${getClientIp(event)}:${lesson}`;
      const existing = await limitStore.get(limitKey, { type: 'json' }).catch(() => null);
      const { allowed, entry } = checkRateLimit(existing, Date.now());
      await limitStore.setJSON(limitKey, entry);
      if (!allowed) {
        return { statusCode: 429, headers: HEADERS_JSON, body: JSON.stringify({ error: 'Too many requests' }) };
      }
    } catch (err) {
      // store indisponible → on laisse passer le vote
    }

    const data = (await store.get(lesson, { type: 'json' }).catch(() => null)) || { likes: 0, dislikes: 0 };
    const updated = applyVote(data, vote);
    await store.setJSON(lesson, updated);

    return {
      statusCode: 200,
      headers: HEADERS_JSON,
      body: JSON.stringify(updated)
    };
  }

  return { statusCode: 405, headers: HEADERS_JSON, body: JSON.stringify({ error: 'Method not allowed' }) };
};

// Exports additionnels pour les tests unitaires (voir test/lesson-vote.test.js).
exports.getClientIp = getClientIp;
exports.applyVote = applyVote;
exports.checkRateLimit = checkRateLimit;
exports.RATE_LIMIT_WINDOW_MS = RATE_LIMIT_WINDOW_MS;
exports.RATE_LIMIT_MAX = RATE_LIMIT_MAX;
