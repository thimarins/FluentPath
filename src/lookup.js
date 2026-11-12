/* ============================================================
   FLUENT PATH — DICIONÁRIO ONLINE (qualquer palavra do inglês)
   Fontes abertas, sem chave: Wiktionary (definições e exemplos),
   Datamuse (frequência, sinônimos, combinações), MyMemory (PT-BR).
   A consulta só acontece quando você pede, e o resultado fica em cache.
   ============================================================ */
const LK_KEY = 'fp.dict.v1';
const lkCache = () => { try { return JSON.parse(localStorage.getItem(LK_KEY) || '{}'); } catch (e) { return {}; } };
function lkStore(c) {
  const ks = Object.keys(c); if (ks.length > 400) ks.sort((a, b) => c[a].at - c[b].at).slice(0, ks.length - 400).forEach(k => delete c[k]);
  try { localStorage.setItem(LK_KEY, JSON.stringify(c)); } catch (e) { }
}
async function lkFetch(url, ms = 9000) {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), ms);
  try { const r = await fetch(url, { signal: ctl.signal }); if (!r.ok) throw new Error('HTTP ' + r.status); return await r.json(); } finally { clearTimeout(t); }
}
const lkText = h => String(h || '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
const ok_ = p => p.status === 'fulfilled' ? p.value : null;

async function lookupWord(raw) {
  const w = String(raw || '').trim().toLowerCase().replace(/\s+/g, ' ');
  if (!/^[a-z][a-z' \-]{0,40}$/.test(w)) throw new Error('Type an English word or expression (letters only).');
  const cache = lkCache(); if (cache[w] && Date.now() - cache[w].at < 90 * DAY) return cache[w];
  const q = encodeURIComponent(w);
  const [wk, dm, sy, an, adj, nn, tr] = (await Promise.allSettled([
    lkFetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${q}`),
    lkFetch(`https://api.datamuse.com/words?sp=${q}&md=dpf&max=1`),
    lkFetch(`https://api.datamuse.com/words?rel_syn=${q}&max=8`),
    lkFetch(`https://api.datamuse.com/words?rel_ant=${q}&max=6`),
    lkFetch(`https://api.datamuse.com/words?rel_jjb=${q}&max=8`),
    lkFetch(`https://api.datamuse.com/words?rel_jja=${q}&max=8`),
    lkFetch(`https://api.mymemory.translated.net/get?q=${q}&langpair=en|pt-BR`)
  ])).map(ok_);
  if (!wk && !dm && !tr) throw new Error('Could not reach the dictionary services. Check your internet connection.');
  const out = { w, at: Date.now(), pos: [], freq: null, tags: [], syn: [], ant: [], coll: [], pt: '', ptAlt: [] };
  // definições (Wiktionary: só a seção "English")
  ((wk && wk.en) || []).forEach(e => {
    const defs = (e.definitions || []).slice(0, 3).map(d => ({ d: lkText(d.definition), ex: lkText((d.examples && d.examples[0]) || (d.parsedExamples && d.parsedExamples[0] && d.parsedExamples[0].example) || '') })).filter(d => d.d);
    if (defs.length) out.pos.push({ pos: e.partOfSpeech, defs });
  });
  if (!out.pos.length && dm && dm[0] && dm[0].defs) { const m = {}; dm[0].defs.forEach(s => { const [p, d] = s.split('\t'); (m[p] = m[p] || []).push({ d: lkText(d), ex: '' }); }); Object.keys(m).forEach(p => out.pos.push({ pos: { n: 'Noun', v: 'Verb', adj: 'Adjective', adv: 'Adverb' }[p] || p, defs: m[p].slice(0, 3) })); }
  const d0 = dm && dm[0] && dm[0].word === w ? dm[0] : null;
  if (d0) { const f = (d0.tags || []).find(t => t.startsWith('f:')); if (f) out.freq = parseFloat(f.slice(2)); }
  const names = a => (a || []).map(x => x.word).filter(x => x && x !== w);
  out.syn = names(sy).slice(0, 8); out.ant = names(an).slice(0, 6);
  const tg = (d0 && d0.tags) || []; // combinações só onde fazem sentido: adjetivo+substantivo e substantivo+adjetivo
  out.coll = [...(tg.includes('n') ? names(adj).slice(0, 6).map(a => a + ' ' + w) : []), ...(tg.includes('adj') ? names(nn).slice(0, 5).map(n => w + ' ' + n) : [])].slice(0, 10);
  if (tr && tr.responseData && tr.responseData.translatedText) {
    const main = tr.responseData.translatedText; if (norm(main) !== norm(w)) out.pt = main;
    const seen = new Set([norm(main)]); (tr.matches || []).forEach(m => { const t = m.translation; if (t && !seen.has(norm(t)) && norm(t) !== norm(w) && (m.match || 0) >= .5 && out.ptAlt.length < 4) { seen.add(norm(t)); out.ptAlt.push(t); } });
  }
  if (out.pos.length || out.pt) { cache[w] = out; lkStore(cache); }
  return out;
}
const freqLabel = f => f == null ? '' : f >= 50 ? 'very common' : f >= 10 ? 'common' : f >= 1 ? 'fairly common' : 'less common';
function lookupHTML(r) {
  const known = IDX.words['my-' + norm(r.w).replace(/ /g, '-')] || CONTENT.words.find(x => x.w === r.w);
  if (!r.pos.length && !r.pt) return `<h2>${esc(r.w)}</h2><p class="muted" style="margin-top:8px">No dictionary entry found. Check the spelling, or try the base form (for example “run” instead of “running”).</p>`;
  return `<div class="wc"><div class="row wrap">${r.freq != null ? `<span class="tag a">${freqLabel(r.freq)}</span>` : ''}${known ? `<span class="tag st-mastered">in your library</span>` : ''}</div>
  <div class="row" style="margin-top:10px"><h2>${esc(r.w)}</h2>${sayBtn(r.w)}</div>
  ${r.pt ? `<div class="sec"><h4>In Portuguese <span class="tiny" style="text-transform:none;letter-spacing:0">(automatic translation, check the context)</span></h4><div class="row wrap"><span class="chip on">${esc(r.pt)}</span>${r.ptAlt.map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div></div>` : ''}
  ${r.pos.map(p => `<div class="sec"><h4>${esc(p.pos)}</h4>${p.defs.map((d, i) => `<p style="margin-top:${i ? 8 : 0}px"><b>${i + 1}.</b> ${esc(d.d)}</p>${d.ex ? `<p class="muted small" style="margin:2px 0 0 18px">“${esc(d.ex)}” ${sayBtn(d.ex)}</p>` : ''}`).join('')}</div>`).join('')}
  ${r.syn.length ? `<div class="sec"><h4>Synonyms</h4><div class="row wrap">${r.syn.map(s => `<button class="chip" data-a="lkword" data-w="${esc(s)}">${esc(s)}</button>`).join('')}</div></div>` : ''}
  ${r.ant.length ? `<div class="sec"><h4>Antonyms</h4><div class="row wrap">${r.ant.map(s => `<button class="chip" data-a="lkword" data-w="${esc(s)}">${esc(s)}</button>`).join('')}</div></div>` : ''}
  ${r.coll.length ? `<div class="sec"><h4>Common combinations</h4><div class="row wrap">${r.coll.map(s => `<span class="chip">${esc(s)}</span>`).join('')}</div></div>` : ''}
  <div class="row wrap" style="margin-top:20px">${known ? `<button class="btn primary" data-a="card" data-t="word" data-id="${known.id}">Open my card</button>` : `<button class="btn primary" data-a="lkadd" data-w="${esc(r.w)}">${I('plus')} Add to my dictionary &amp; reviews</button>`}</div>
  <p class="tiny muted" style="margin-top:14px">Sources: Wiktionary (CC BY-SA), Datamuse, MyMemory. The word was sent to these services, nothing else.</p></div>`;
}
async function openLookup(w) {
  const o = modal(`<h2>${esc(w)}</h2><p class="muted" style="margin-top:10px">${I('refresh')} Looking it up…</p>`);
  try { const r = await lookupWord(w); if ($('#ovl')) $('#ovl .modal').innerHTML = `<button class="iconbtn x" data-a="closeModal" aria-label="Close">${I('x')}</button>` + lookupHTML(r); }
  catch (e) { if ($('#ovl')) $('#ovl .modal').innerHTML = `<button class="iconbtn x" data-a="closeModal" aria-label="Close">${I('x')}</button><h2>${esc(w)}</h2><div class="fb bad" style="margin-top:12px"><div class="d">${esc(e.message)}</div></div>`; }
}
function lookupBox() {
  return `<div class="card" style="margin-bottom:16px"><div class="row wrap"><div class="ico">${I('globe')}</div><div class="grow" style="min-width:220px"><h3>Look up any English word</h3><p class="small muted">Beyond the ${CONTENT.words.length + CONTENT.phr.length} curated entries: definitions, Portuguese, synonyms and common combinations for any word. Add it to your reviews in one tap.</p></div></div><div class="row" style="margin-top:12px"><input type="text" id="lkq" placeholder="e.g. overwhelmed, run into, scalable…" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="btn primary" data-a="lkgo">${I('search')} Look up</button></div></div>`;
}
ACT.lkgo = () => { const v = ($('#lkq') || {}).value; if (!v || !v.trim()) { toast('Type a word first.', 'alert'); return; } openLookup(v.trim()); };
ACT.lkword = el => openLookup(el.dataset.w);
document.addEventListener('keydown', e => { if (e.target && e.target.id === 'lkq' && e.key === 'Enter') { e.preventDefault(); ACT.lkgo(); } });
ACT.lkadd = el => {
  const w = el.dataset.w; const r = lkCache()[w]; if (!r) { toast('Look it up again first.', 'alert'); return; }
  const slug = 'my-' + norm(w).replace(/ /g, '-'); if (S.personal.some(x => x.id === slug)) { toast('Already in your dictionary.', 'alert'); return; }
  const firstDef = ((r.pos[0] || { defs: [{ d: '' }] }).defs[0] || {}).d || ''; let ex = ''; r.pos.some(p => p.defs.some(d => { if (d.ex && d.ex.toLowerCase().includes(w.toLowerCase())) { ex = d.ex; return true; } return false; }));
  if (!ex) ex = `I want to remember the word "${w}".`;
  const e = { id: slug, w, pos: ({ adjective: 'adj', adverb: 'adv' })[(r.pos[0] && r.pos[0].pos || 'word').toLowerCase()] || (r.pos[0] && r.pos[0].pos || 'word').toLowerCase(), pt: [r.pt, ...r.ptAlt.slice(0, 1)].filter(Boolean).join('; '), def: firstDef.length > 140 ? firstDef.slice(0, 138) + '…' : firstDef, ex, lvl: 'B1+', syn: r.syn.slice(0, 3), col: r.coll.slice(0, 4) };
  S.personal.push(e); addPersonalToContent(e); applyAnswer(S, 'w:' + slug, { k: 'word', lvl: 'B1+' }, { ok: false, type: 'mcq', now: Date.now() }); S.c['w:' + slug].seen = 0; S.c['w:' + slug].next = Date.now();
  save(); closeModal(); toast(`“${esc(w)}” added. It will appear in your reviews.`, 'plus'); if (curPath() === '/vocab') render();
};
