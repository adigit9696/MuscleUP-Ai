/**
 * Food Search Autocomplete Engine
 * Pure ES6 Module for MuscleUP Ai React App
 */

function normalize(s) {
  return String(s == null ? '' : s).toLowerCase().normalize('NFC')
    .replace(/[()\[\],./'"\u2019\-\u2013\u2014!?:;&|]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function phonetic(s) {
  return normalize(s).replace(/ph/g, 'f').replace(/([bdgkpt])h/g, '$1').replace(/aa/g, 'a').replace(/ee|ii/g, 'i').replace(/oo|uu/g, 'u')
    .replace(/w/g, 'v').replace(/(.)\1+/g, '$1');
}

function lev(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]; let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (cur[j] < rowMin) rowMin = cur[j];
    }
    if (rowMin > max) return max + 1; prev = cur;
  }
  return prev[b.length];
}

const CONF = { high: 3, medium: 2, low: 1, none: 0 };
const RAWWORDS = /\b(raw|kaccha|kacha|atta|flour|dry|uncooked)\b/;

export function createFoodSearch(index, opts = {}) {
  const options = Object.assign({ limit: 8, minScore: 400, confirmBelow: 560 }, opts);
  const foods = index.foods || {};
  const A = (index.aliases || []).map(function (a) {
    const n = a[0], toks = n.split(' ');
    return { n, f: a[1], t: a[2], flag: a[3], toks, ph: phonetic(n), pt: toks.map(phonetic) };
  });

  function scoreAlias(a, qn, qt, qph, qpt) {
    if (a.n === qn) return { s: 1000, m: 'exact_alias' };
    if (qn.length >= 2 && a.n.indexOf(qn) === 0) return { s: 800 - Math.min(100, a.n.length - qn.length), m: 'prefix' };
    const allTok = a.t !== 'm' && qt.every(t => a.toks.some(x => t.length >= 2 ? x.indexOf(t) === 0 : x === t));
    if (allTok) return { s: 650 - 10 * Math.max(0, a.toks.length - qt.length), m: 'token' };
    if (a.t === 'm') return null;
    if (a.ph === qph) return { s: 560, m: 'phonetic' };
    if (qph.length >= 4) {
      let total = 0;
      const ok = qpt.every(t => {
        if (t.length < 4) return a.pt.some(x => x === t || x.indexOf(t) === 0);
        const lim = t.length <= 5 ? 1 : 2; let best = lim + 1;
        a.pt.forEach(x => { const d = lev(t, x, lim); if (d < best) best = d; });
        if (best <= lim) { total += best; return true; } return false;
      });
      if (ok) return { s: 440 - 40 * total, m: 'fuzzy' };
    }
    return null;
  }

  function search(query, o = {}) {
    const conf = Object.assign({}, options, o);
    const qn = normalize(query);
    if (!qn) return { query, normalized: qn, results: [], ambiguous: false, needsConfirmation: false, notFound: true, combo: false };
    const qt = qn.split(' '), qph = phonetic(qn), qpt = qph.split(' '), wantsRaw = RAWWORDS.test(qn);
    const best = {};

    for (let i = 0; i < A.length; i++) {
      const a = A[i], r = scoreAlias(a, qn, qt, qph, qpt); if (!r) continue;
      let s = r.s + (a.t === 'c' ? 25 : 0) + (foods[a.f]?.pop ? 10 : 0);
      const fd = foods[a.f];
      if (fd) {
        if (!wantsRaw && fd.raw) s -= 15;
        if (!best[a.f] || s > best[a.f].s) best[a.f] = { s, m: r.m, a };
      }
    }

    let list = Object.keys(best).map(id => {
      const b = best[id], fd = foods[id];
      return {
        food_id: id,
        display_name: fd?.d || id,
        canonical_name: fd?.en || fd?.d || id,
        name_hi: fd?.hi || '',
        category: fd?.c || 'Prepared Food',
        preparation: fd?.p || '',
        vegetarian: fd?.v !== false,
        score: b.s,
        match_type: b.m
      };
    }).filter(r => r.score >= conf.minScore);

    list.sort((x, y) => y.score - x.score);
    list = list.slice(0, conf.limit);

    return {
      query,
      normalized: qn,
      results: list,
      notFound: list.length === 0
    };
  }

  return { search, normalize, phonetic, foodCount: Object.keys(foods).length };
}

