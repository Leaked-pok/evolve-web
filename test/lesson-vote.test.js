'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  getClientIp,
  applyVote,
  checkRateLimit,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX
} = require('../netlify/functions/lesson-vote.js');

test('applyVote incrémente les likes sur "like"', () => {
  const result = applyVote({ likes: 0, dislikes: 0 }, 'like');
  assert.equal(result.likes, 1);
  assert.equal(result.dislikes, 0);
});

test('applyVote décrémente les likes sur "unlike", jamais sous 0', () => {
  assert.equal(applyVote({ likes: 3, dislikes: 0 }, 'unlike').likes, 2);
  assert.equal(applyVote({ likes: 0, dislikes: 0 }, 'unlike').likes, 0);
});

test('applyVote gère les dislikes indépendamment des likes', () => {
  const disliked = applyVote({ likes: 5, dislikes: 0 }, 'dislike');
  assert.equal(disliked.dislikes, 1);
  assert.equal(disliked.likes, 5);
  assert.equal(applyVote({ likes: 0, dislikes: 2 }, 'undislike').dislikes, 1);
  assert.equal(applyVote({ likes: 0, dislikes: 0 }, 'undislike').dislikes, 0);
});

test('applyVote ignore un vote inconnu sans planter', () => {
  const result = applyVote({ likes: 1, dislikes: 1 }, 'not-a-vote');
  assert.deepEqual(result, { likes: 1, dislikes: 1 });
});

test('getClientIp privilégie x-nf-client-connection-ip', () => {
  const ip = getClientIp({ headers: {
    'x-nf-client-connection-ip': '1.2.3.4',
    'x-forwarded-for': '5.6.7.8'
  } });
  assert.equal(ip, '1.2.3.4');
});

test('getClientIp retombe sur la première IP de x-forwarded-for', () => {
  const ip = getClientIp({ headers: { 'x-forwarded-for': '9.9.9.9, 10.10.10.10' } });
  assert.equal(ip, '9.9.9.9');
});

test('getClientIp renvoie "unknown" sans en-tête IP', () => {
  assert.equal(getClientIp({ headers: {} }), 'unknown');
  assert.equal(getClientIp({}), 'unknown');
});

test('checkRateLimit autorise les requêtes sous le plafond', () => {
  const now = Date.now();
  let entry = null;
  for (let i = 0; i < RATE_LIMIT_MAX; i++) {
    const result = checkRateLimit(entry, now);
    assert.equal(result.allowed, true);
    entry = result.entry;
  }
  assert.equal(entry.count, RATE_LIMIT_MAX);
});

test('checkRateLimit bloque au-delà du plafond dans la même fenêtre', () => {
  const now = Date.now();
  const entry = { count: RATE_LIMIT_MAX, windowStart: now };
  const result = checkRateLimit(entry, now + 1000);
  assert.equal(result.allowed, false);
  assert.equal(result.entry.count, RATE_LIMIT_MAX + 1);
});

test('checkRateLimit remet le compteur à zéro une fois la fenêtre écoulée', () => {
  const now = Date.now();
  const staleEntry = { count: RATE_LIMIT_MAX, windowStart: now - RATE_LIMIT_WINDOW_MS - 1 };
  const result = checkRateLimit(staleEntry, now);
  assert.equal(result.allowed, true);
  assert.equal(result.entry.count, 1);
  assert.equal(result.entry.windowStart, now);
});
