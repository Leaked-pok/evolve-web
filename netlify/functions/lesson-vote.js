// Netlify Function — compteur de likes/dislikes par leçon
// Stockage : Netlify Blobs (gratuit, intégré à Netlify)
//
// Endpoints :
//   GET  /api/lesson-vote?lesson=<slug>   → { likes, dislikes } pour une leçon
//   GET  /api/lesson-vote                 → toutes les leçons triées par likes (vue admin)
//   POST /api/lesson-vote                 → body { lesson, vote: 'like'|'unlike'|'dislike'|'undislike' }
const { getStore } = require('@netlify/blobs');

const VALID_VOTES = ['like', 'unlike', 'dislike', 'undislike'];
const HEADERS_JSON = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};
const HEADERS_HTML = {
  'Content-Type': 'text/html; charset=utf-8'
};

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

    const data = (await store.get(lesson, { type: 'json' }).catch(() => null)) || { likes: 0, dislikes: 0 };

    if (vote === 'like')      data.likes    = Math.max(0, (data.likes    || 0) + 1);
    if (vote === 'unlike')    data.likes    = Math.max(0, (data.likes    || 0) - 1);
    if (vote === 'dislike')   data.dislikes = Math.max(0, (data.dislikes || 0) + 1);
    if (vote === 'undislike') data.dislikes = Math.max(0, (data.dislikes || 0) - 1);

    await store.setJSON(lesson, data);

    return {
      statusCode: 200,
      headers: HEADERS_JSON,
      body: JSON.stringify(data)
    };
  }

  return { statusCode: 405, headers: HEADERS_JSON, body: JSON.stringify({ error: 'Method not allowed' }) };
};
