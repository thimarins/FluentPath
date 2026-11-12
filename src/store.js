/* ============================================================
   FLUENT PATH — STORE
   Estado persistente (localStorage), eventos, XP, streak,
   conquistas e usuário demo. A IA nunca altera o estado direto.
   ============================================================ */
const KEY = 'fluentpath.v1';
let S = null;
let _saveT = null;
const listeners = [];
const onChange = fn => listeners.push(fn);
function load() {
  try { const r = localStorage.getItem(KEY); S = r ? JSON.parse(r) : newState(); } catch (e) { S = newState(); }
  const base = newState();
  Object.keys(base).forEach(k => { if (S[k] === undefined) S[k] = base[k]; });
  Object.keys(base.profile).forEach(k => { if (S.profile[k] === undefined) S.profile[k] = base.profile[k]; });
  Object.keys(base.settings).forEach(k => { if (S.settings[k] === undefined) S.settings[k] = base.settings[k]; });
  SKILLS.forEach(k => { if (!S.sk[k]) S.sk[k] = { a: 2, n: 0 }; });
  S.plan = null; // plano do dia: só em memória
  const lim = Date.now() - 90 * DAY; Object.keys(S.seenEx).forEach(k => { if (S.seenEx[k] < lim) delete S.seenEx[k]; });
  return S;
}
const NOSAVE = (k, v) => k === 'plan' ? undefined : v;
function save() { try { S.updatedAt = Date.now(); localStorage.setItem(KEY, JSON.stringify(S, NOSAVE)); } catch (e) { console.warn('save failed', e); } srvPush(); }
/* modo launcher do Windows: grava também em data\progress.json (servidor local) */
let SERVER = null, _srvT = null;
const SRV_HDR = { 'X-FluentPath': '1', 'content-type': 'application/json' };
function srvPush(now) {
  if (!SERVER || (S && S.demo)) return; if (!S.onboarded && !Object.keys(S.c).length) return; clearTimeout(_srvT); // nunca grava estado vazio por cima do arquivo
  _srvT = setTimeout(() => { if (!SERVER || S.demo) return; fetch('/api/state', { method: 'PUT', headers: SRV_HDR, body: JSON.stringify(S, SYNC_SKIP) }).then(r => { SERVER.ok = r.ok; SERVER.at = Date.now(); }).catch(() => { SERVER.ok = false; }); }, now ? 0 : 1200);
}
function saveSoon() { clearTimeout(_saveT); _saveT = setTimeout(save, 250); }
function resetAll() { try { localStorage.removeItem(KEY); } catch (e) { } S = newState(); save(); }

/* ---------- eventos (Learning Event System) ---------- */
function ev(type, data = {}) { S.ev.push({ t: Date.now(), e: type, ...data }); if (S.ev.length > 4000) S.ev.splice(0, S.ev.length - 4000); }

/* ---------- dias, streak, meta ---------- */
const today = () => dayKey();
function dayStat(k = today()) { return S.days[k] || (S.days[k] = { min: 0, n: 0, ok: 0, xp: 0, nw: 0 }); }
function streak() {
  let n = 0, d = new Date(); const has = dt => (S.days[dayKey(dt.getTime())] || {}).n > 0;
  if (!has(d)) d = new Date(Date.now() - DAY);
  while (has(d)) { n++; d = new Date(d.getTime() - DAY); }
  return n;
}
function bestStreak() { const ks = Object.keys(S.days).filter(k => S.days[k].n > 0).sort(); let best = 0, cur = 0, prev = null; ks.forEach(k => { const t = new Date(k + 'T12:00:00').getTime(); cur = prev && Math.round((t - prev) / DAY) === 1 ? cur + 1 : 1; best = Math.max(best, cur); prev = t; }); return best; }
const levelFromXp = xp => 1 + Math.floor(Math.sqrt(xp / 60));
const xpForLevel = l => (l - 1) * (l - 1) * 60;
function snapshot() {
  const k = today(); S.snap = S.snap || {};
  if (S.snap[k]) return;
  const g = {}; CONTENT.gr.forEach(x => { const c = S.c['g:' + x.id]; if (c) g[x.id] = Math.round(mEff(c) * 100); });
  const sk = {}; SKILLS.forEach(s => sk[s] = Math.round(S.sk[s].a * 100) / 100);
  S.snap[k] = { g, sk, a: Math.round(overallA(S) * 100) / 100 };
  const keys = Object.keys(S.snap).sort(); while (keys.length > 120) delete S.snap[keys.shift()];
}

/* ---------- registro de resultado (o coração do ciclo de aprendizagem) ---------- */
const KIND_SKILL = { word: 'vocab', phr: 'vocab', gram: 'grammar', conn: 'grammar', nat: 'writing', lis: 'listening', spk: 'speaking', wri: 'writing' };
function recordResult(item, res) {
  const now = Date.now(); snapshot();
  const score = res.score == null ? (res.ok ? 1 : 0) : res.score; const ok = score >= .7;
  let dm = 0, firstTime = false;
  if (item.cid) {
    const pre = S.c[item.cid]; firstTime = !pre || !pre.seen;
    const before = pre ? stageOf(pre, now) : 'new';
    const r = applyAnswer(S, item.cid, item.meta || { k: 'x', lvl: item.lvl }, { ok, score, type: item.wtype || item.type, lvl: item.lvl, rt: res.rt, hints: res.hints, now });
    dm = r.dm; if (firstTime) r.c.first = now;
    const after = r.c.st;
    if (after === 'mastered' && before !== 'mastered') ev(item.cid[0] === 'g' ? 'grammar_mastered' : 'word_learned', { cid: item.cid });
    if (after === 'forgotten' && before !== 'forgotten') ev('word_forgotten', { cid: item.cid });
    if (!ok && item.cid[0] === 'g') ev('grammar_failed', { cid: item.cid });
  }
  const sk = item.skill || KIND_SKILL[item.kind];
  if (sk) applySkill(S, sk, lvIdx(item.lvl), ok, item.kind === 'nat' ? .5 : item.kind === 'conn' ? .6 : 1);
  if (item.kind === 'nat' && item.tier >= 2) applySkill(S, 'speaking', lvIdx(item.lvl), ok, .25);
  pushWin(S, ok);
  if (item.exKey) S.seenEx[item.exKey] = now; if (item.ref) S.seenEx[item.ref] = now;
  if (!ok && item.cid && res.record !== false && !firstTime) { // errar algo que você acabou de conhecer não é 'erro': é aprendizado
    recordMistake(S, { cid: item.cid, ref: item.ref, exKey: item.exKey, kind: item.kind, tag: item.tag || item.kind, q: (res.qText || item.qText || '').slice(0, 220), yours: res.yours || '', good: res.correct || item.correctText || '', why: res.why || '' });
  }
  if (item.mistakeId) { const m = S.mist.find(x => x.id === item.mistakeId); if (m) { repairMistake(S, m, ok); if (ok) dayStat().rep = (dayStat().rep || 0) + 1; } }
  else if (ok && item.cid && res.record !== false) { S.mist.forEach(m => { if (m.cid === item.cid && m.ref === item.ref && m.m < .85) { repairMistake(S, m, true); dayStat().rep = (dayStat().rep || 0) + 1; } }); }
  const gain = ok ? Math.round(4 + 6 * (TYPE_W[item.wtype || item.type] || .6) * score) : 1;
  S.xp += gain;
  const d = dayStat(); d.n++; if (ok) d.ok++; d.xp += gain; d.min += Math.min(res.rt || 20000, 120000) / 60000; if (firstTime) d.nw = (d.nw || 0) + 1;
  ev('exercise_answered', { cid: item.cid || item.ref, ok, ty: item.wtype || item.type, dm: Math.round(dm * 100) / 100, lv: item.lvl });
  const lvl = overallLabel(S);
  if (lvl !== S.profile.level) { const up = lvIdx(lvl) > lvIdx(S.profile.level); ev('level_changed', { from: S.profile.level, to: lvl }); S.profile.level = lvl; if (up) res._levelUp = lvl; }
  if (typeof checkQuests === 'function') checkQuests();
  saveSoon();
  return { ok, score, dm, gain, levelUp: res._levelUp };
}
/* tempo extra (fala/escrita/listening cobram tempo próprio) */
function addMinutes(min, n = 0) { const d = dayStat(); d.min += min; if (n) d.n += n; saveSoon(); }

/* ---------- conquistas ---------- */
const ACH = [
  { id: 'first', name: 'First Steps', desc: 'Complete your placement test', icon: 'flag', t: () => !!S.diag },
  { id: 'str3', name: '3 Day Streak', desc: 'Study 3 days in a row', icon: 'flame', t: () => bestStreak() >= 3, p: () => [bestStreak(), 3] },
  { id: 'str7', name: '7 Day Streak', desc: 'Study 7 days in a row', icon: 'flame', t: () => bestStreak() >= 7, p: () => [bestStreak(), 7] },
  { id: 'str30', name: '30 Day Streak', desc: 'Study 30 days in a row', icon: 'flame', t: () => bestStreak() >= 30, p: () => [bestStreak(), 30] },
  { id: 'a100', name: 'Warming Up', desc: 'Answer 100 exercises', icon: 'zap', t: () => totalAnswers() >= 100, p: () => [totalAnswers(), 100] },
  { id: 'w50', name: '50 Words', desc: 'Master 50 words', icon: 'book-open', t: () => wordStats(S).mastered >= 50, p: () => [wordStats(S).mastered, 50] },
  { id: 'w150', name: '150 Words', desc: 'Master 150 words', icon: 'book-open', t: () => wordStats(S).mastered >= 150, p: () => [wordStats(S).mastered, 150] },
  { id: 'phr25', name: 'Phrasal Verb Explorer', desc: 'Meet 25 phrasal verbs', icon: 'compass', t: () => Object.keys(S.c).filter(k => k[0] === 'p' && S.c[k].seen).length >= 25, p: () => [Object.keys(S.c).filter(k => k[0] === 'p' && S.c[k].seen).length, 25] },
  { id: 'gram5', name: 'Grammar Crusher', desc: 'Master 5 grammar topics', icon: 'puzzle', t: () => CONTENT.gr.filter(g => { const c = S.c['g:' + g.id]; return c && c.m >= .75 && !c.prior; }).length >= 5, p: () => [CONTENT.gr.filter(g => { const c = S.c['g:' + g.id]; return c && c.m >= .75 && !c.prior; }).length, 5] },
  { id: 'b1gram', name: 'B1 Grammar Mastered', desc: 'Reach 75% on every B1 topic', icon: 'target', t: () => CONTENT.gr.filter(g => g.lvl === 'B1' || g.lvl === 'B1+').every(g => (S.c['g:' + g.id] || {}).m >= .75) },
  { id: 'conn', name: 'Connector Master', desc: 'Reach 70% on all connector groups', icon: 'link', t: () => { const cats = [...new Set(CONTENT.con.items.map(i => 'c:' + i.cat))]; return cats.length && cats.every(c => (S.c[c] || {}).m >= .7); } },
  { id: 'b2first', name: 'First B2 Challenge', desc: 'Answer a B2 exercise correctly', icon: 'rocket', t: () => S.ev.some(e => e.e === 'exercise_answered' && e.ok && lvIdx(e.lv) >= 4) },
  { id: 'spk10', name: 'Talkative', desc: 'Complete 10 speaking tasks', icon: 'mic', t: () => S.analyses.filter(a => a.src === 'speak').length >= 10, p: () => [S.analyses.filter(a => a.src === 'speak').length, 10] },
  { id: 'wri10', name: 'Wordsmith', desc: 'Complete 10 writing tasks', icon: 'pen', t: () => S.analyses.filter(a => a.src === 'write').length >= 10, p: () => [S.analyses.filter(a => a.src === 'write').length, 10] },
  { id: 'b2lis', name: 'B2 Listening', desc: 'Listening ability reaches B2', icon: 'headphones', t: () => S.sk.listening.a >= 3.9 },
  { id: 'b2wri', name: 'B2 Writing', desc: 'Writing ability reaches B2', icon: 'pen', t: () => S.sk.writing.a >= 3.9 },
  { id: 'perfweek', name: 'Perfect Week', desc: 'Hit your daily goal 7 days in a row', icon: 'trophy', t: () => { for (let i = 0; i < 7; i++) { const d = S.days[dayKey(Date.now() - i * DAY)]; if (!d || d.min < Math.min(S.profile.minutes, 10) * .8) return false; } return true; } }
];
const totalAnswers = () => Object.keys(S.days).reduce((n, k) => n + (S.days[k].n || 0), 0);
function checkAch() {
  const out = [];
  ACH.forEach(a => { if (!S.ach[a.id]) { let ok = false; try { ok = a.t(); } catch (e) { } if (ok) { S.ach[a.id] = Date.now(); out.push(a); } } });
  if (out.length) saveSoon();
  return out;
}

/* ---------- plano do dia (persistido até ser concluído) ---------- */
function todaysPlan(force) {
  const k = today();
  if (!force && S.plan && S.plan.day === k && !S.plan.done && S.plan.minutes === S.profile.minutes) return S.plan;
  const p = planSession(S, S.profile.minutes); p.day = k; S.plan = p; saveSoon(); return p;
}

/* ---------- estatísticas derivadas ---------- */
function dueCounts(now = Date.now()) {
  const w = dueList(S, 'w:', now).length + dueList(S, 'p:', now).length;
  const g = dueList(S, 'g:', now).length + dueList(S, 'c:', now).length;
  const n = dueList(S, 'n:', now).length;
  const m = mistakeDue(S, now).length;
  const sp = daysSince(S.lastSpeak) >= 3 ? 1 : 0;
  const rawTotal = w + g + n + m, CAP = 25; const total = Math.min(rawTotal, CAP); const f = rawTotal ? total / rawTotal : 0; // teto diário: a fila nunca vira uma montanha
  const minutes = Math.max(0, Math.round(((w * 22 + g * 28 + n * 22 + m * 30) * f + sp * 75) / 60));
  return { w, g, n, m, sp, total, waiting: rawTotal - total, minutes };
}
function weakPoints(n = 4) {
  const now = Date.now(); const out = [];
  CONTENT.gr.forEach(g => { const c = S.c['g:' + g.id]; if (c && c.seen && !c.prior && lvIdx(g.lvl) >= 2) out.push({ cid: 'g:' + g.id, name: g.name, v: mEff(c, now), kind: 'Grammar' }); });
  const ps = Object.keys(S.c).filter(k => k[0] === 'p' && S.c[k].seen); if (ps.length >= 3) out.push({ cid: 'p*', name: 'Phrasal verbs', v: avg(ps.map(k => mEff(S.c[k], now))), kind: 'Vocabulary' });
  const cs = Object.keys(S.c).filter(k => k[0] === 'c'); if (cs.length) out.push({ cid: 'c*', name: 'Connectors', v: avg(cs.map(k => mEff(S.c[k], now))), kind: 'Writing' });
  const ns = Object.keys(S.c).filter(k => k[0] === 'n'); if (ns.length) out.push({ cid: 'n*', name: 'Natural phrasing', v: avg(ns.map(k => mEff(S.c[k], now))), kind: 'Speaking' });
  errorPatterns(S).slice(0, 3).forEach(e => out.push({ cid: 'e:' + e.tag, name: tagName(e.tag), v: Math.max(0, .55 - e.n * .04), kind: 'Mistakes', n: e.n }));
  if (S.sk.listening.a + .25 < S.sk.reading.a) out.push({ cid: 'l*', name: 'Fast listening', v: .35, kind: 'Listening' });
  return uniqBy(out.sort((a, b) => a.v - b.v), x => x.name).slice(0, n);
}

/* ---------- usuário DEMO (histórico simulado) ---------- */
function loadDemo() {
  const keepSettings = S && S.settings; const keepKey = keepSettings && keepSettings.apiKey;
  const saveRand = _rand; _rand = seeded(2026);
  const D = newState(); const now = Date.now();
  D.onboarded = true; D.demo = true;
  D.profile = { name: 'Thiago', level: 'B1+', target: 'B2', minutes: 10, topics: ['tech', 'ai', 'security', 'business', 'travel', 'daily'], goal: 'Reach a solid B2', situations: ['work', 'travel', 'conversation'], pain: ['phrasal verbs', 'connectors', 'speaking naturally'], prefs: ['speaking', 'listening'] };
  if (keepSettings) { D.settings = { ...D.settings, ...keepSettings }; D.settings.apiKey = keepKey || ''; }
  D.sk = { reading: { a: 3.8, n: 60 }, listening: { a: 3.15, n: 52 }, writing: { a: 2.75, n: 40 }, speaking: { a: 2.95, n: 30 }, vocab: { a: 3.1, n: 90 }, grammar: { a: 3.05, n: 80 } };
  D.xp = 2860;
  const topicStrength = { tech: .85, security: .75, ai: .8, business: .6, work: .62, travel: .75, daily: .7, relationships: .5, health: .6, finance: .55, science: .6, culture: .55, abstract: .45 };
  const mk = (cid, k, lvl, m, ago) => {
    const c = newConcept(k, lvl); c.m = Math.round(m * 100) / 100; c.seen = 3 + Math.floor(_rand() * 9); c.ok = Math.round(c.seen * (.5 + m * .5)); c.bad = c.seen - c.ok;
    c.tier = m > .75 ? 3 : m > .55 ? 2 : m > .3 ? 1 : 0; c.peak = Math.min(1, m + (_rand() < .15 ? .3 : .05)); c.conf = Math.min(1, m + .1); c.rt = 4000 + _rand() * 6000;
    c.S = 2 + m * 40; const interval = c.S * RETENTION_K; c.last = now - Math.min(30, _rand() * interval * 1.25) * DAY; c.next = c.last + interval * DAY; c.first = c.last - 20 * DAY; c.st = stageOf(c, now); D.c[cid] = c;
  };
  CONTENT.words.forEach(w => {
    const idx = lvIdx(w.lvl); const ts = avg((w.topics || ['daily']).map(t => topicStrength[t] || .55));
    const pSeen = clamp(.95 - (idx - 2) * .22, .12, .95) * (.55 + ts * .6);
    if (_rand() < pSeen) mk('w:' + w.id, 'word', w.lvl, clamp(ts * (1.05 - (idx - 2) * .15) + (_rand() - .5) * .35, .05, .97), _rand() * 24);
  });
  CONTENT.phr.forEach(p => { const idx = lvIdx(p.lvl); if (_rand() < clamp(.65 - (idx - 2) * .2, .1, .65)) mk('p:' + p.id, 'phrasal', p.lvl, clamp(.5 - (idx - 2) * .1 + (_rand() - .5) * .35, .05, .85), _rand() * 20); });
  CONTENT.gr.forEach(g => {
    const idx = lvIdx(g.lvl);
    if (idx <= 1) { const c = newConcept('gram', g.lvl); Object.assign(c, { m: .85, tier: 3, seen: 1, ok: 3, last: now - 30 * DAY, S: 60, next: now + 10 * DAY, peak: .85, prior: true, st: 'mastered' }); D.c['g:' + g.id] = c; return; }
    const m = idx === 2 ? .62 + _rand() * .3 : idx === 3 ? .45 + _rand() * .3 : idx === 4 ? .18 + _rand() * .3 : _rand() * .1; if (m > .08) mk('g:' + g.id, 'gram', g.lvl, m, _rand() * 12);
  });
  [...new Set(CONTENT.con.items.map(i => i.cat))].forEach((c, i) => mk('c:' + c, 'conn', 'B1+', .28 + _rand() * .32, _rand() * 8));
  [...new Set(CONTENT.nat.map(natTag))].forEach(t => mk('n:' + t, 'nat', 'B1+', .25 + _rand() * .35, _rand() * 8));
  // dias de estudo: 6 dias de streak atual
  for (let i = 0; i < 90; i++) { const active = i < 6 || (i > 6 && _rand() < .68); if (!active) continue; const mins = 6 + Math.round(_rand() * 12); const n = Math.round(mins * 2.2); D.days[dayKey(now - i * DAY)] = { min: mins, n, ok: Math.round(n * (.62 + _rand() * .2)), xp: n * 6, nw: Math.round(_rand() * 6) }; }
  Object.keys(D.days).forEach(k => { const d = D.days[k]; const t = new Date(k + 'T19:00:00').getTime(); D.sessions.push({ at: t, min: Math.round(d.min * 10) / 10, n: d.n, ok: d.ok, xp: d.xp, kind: 'daily' }); });
  D.sessions.sort((a, b) => a.at - b.at);
  // eventos recentes (relatório semanal e analytics)
  const cids = Object.keys(D.c);
  for (let i = 0; i < 260; i++) { const dAgo = Math.floor(_rand() * 14); const cid = cids[Math.floor(_rand() * cids.length)]; D.ev.push({ t: now - dAgo * DAY - _rand() * DAY / 2, e: 'exercise_answered', cid, ok: _rand() < .74, ty: pick(['mcq', 'cloze', 'typed', 'order']), dm: Math.round((_rand() - .3) * 8) / 100, lv: pick(['B1', 'B1+', 'B2']) }); }
  for (let i = 0; i < 21; i++) D.ev.push({ t: now - Math.floor(_rand() * 7) * DAY - _rand() * DAY / 2, e: 'word_learned', cid: pick(cids.filter(c => c[0] === 'w')) });
  D.ev.sort((a, b) => a.t - b.t);
  // caderno de erros realista
  const mk2 = (q, yours, good, why, tag, count, ago, cid) => D.mist.push({ id: 'm' + Math.floor(_rand() * 1e9), key: q + good, cid: cid || null, ref: null, kind: 'gram', tag, q, yours, good, why, count, last: now - ago * DAY, first: now - (ago + 20) * DAY, m: Math.round(_rand() * 70) / 100, S: 2, next: now + (_rand() * 3 - 1) * DAY });
  mk2('Translate: "Eles vão perder o voo."', 'They gonna miss the flight.', "They're going to miss the flight.", 'Missing the verb "to be" before going to.', 'agreement', 4, 4);
  mk2('Translate: "Eu trabalho aqui há 10 anos."', 'I have 10 years working here.', "I've been working here for 10 years.", 'Present Perfect Continuous for an activity that started in the past and continues now.', 'present-perfect', 6, 2);
  mk2('Say it naturally: "Vou fazer uma viagem."', 'I will make a travel.', 'I will take a trip.', 'Collocation: take a trip.', 'literal-translation', 5, 6);
  mk2('Complete: It depends ___ the weather.', 'of', 'on', 'Preposition: depend ON.', 'preposition', 3, 9);
  mk2('Choose the correct sentence.', 'Can you explain me the process?', 'Can you explain the process to me?', 'Explain something TO someone.', 'preposition', 2, 11);
  mk2('Complete: If I ___ more time, I would travel.', 'would have', 'had', 'No "would" in the if-clause of the second conditional.', 'second-conditional', 3, 3, 'g:second-conditional');
  mk2('Complete: She has lived here ___ 2015.', 'for', 'since', 'Use since with a starting point in time.', 'present-perfect', 2, 13);
  mk2('Choose the best connector.', 'but', 'although', 'Use "although" to start a concessive clause.', 'connectors', 3, 5);
  mk2('Rewrite naturally: "I have many informations."', 'many informations', 'a lot of information', 'Information is uncountable.', 'uncountable', 2, 8);
  mk2('Complete: I look forward to ___ you.', 'see', 'seeing', 'After "to" as a preposition use -ing.', 'gerund-infinitive', 2, 15, 'g:gerund-infinitive');
  // análises e diagnóstico
  D.analyses = [
    { src: 'write', words: 62, sentences: 5, avgLen: 12.4, connDistinct: 3, levelIdx: 3.1, cefr: 'B1+', scores: { grammar: 82, vocabulary: 71, naturalness: 64, clarity: 88, complexity: 55, connectors: 52 }, overuse: { because: 3, but: 3 }, at: now - 3 * DAY, errors: [], b2words: ['reliable'], suggestions: [], repeats: [] },
    { src: 'speak', words: 48, sentences: 4, avgLen: 12, connDistinct: 2, levelIdx: 3, cefr: 'B1+', scores: { grammar: 78, vocabulary: 66, naturalness: 60, clarity: 84, complexity: 50, connectors: 46 }, overuse: { because: 2, but: 2 }, at: now - 2 * DAY, errors: [], b2words: [], suggestions: [], repeats: [] },
    { src: 'write', words: 75, sentences: 5, avgLen: 15, connDistinct: 4, levelIdx: 3.4, cefr: 'B1+', scores: { grammar: 84, vocabulary: 74, naturalness: 66, clarity: 90, complexity: 62, connectors: 64 }, overuse: { because: 1, but: 2 }, at: now - 1 * DAY, errors: [], b2words: ['drawback', 'estimate'], suggestions: [], repeats: [] },
    { src: 'speak', words: 55, sentences: 4, avgLen: 13.7, connDistinct: 3, levelIdx: 3.2, cefr: 'B1+', scores: { grammar: 80, vocabulary: 68, naturalness: 62, clarity: 86, complexity: 54, connectors: 58 }, overuse: { because: 1, but: 2 }, at: now - 1 * DAY, errors: [], b2words: [], suggestions: [], repeats: [] }
  ];
  D.lastSpeak = now - 2 * DAY; D.lastListen = now - 3 * DAY; D.lastWrite = now - 1 * DAY;
  D.diag = { sk: { reading: 3.9, listening: 3.1, writing: 2.7, speaking: 2.9, vocab: 3.0, grammar: 3.0 }, theta: 3.1, strengths: ['vocabulary', 'reading', 'present-perfect'], weaknesses: ['phrasal-verbs', 'connectors', 'second-conditional', 'natural'], n: 22, at: now - 40 * DAY };
  D.assess = [{ type: 'diagnostic', at: now - 40 * DAY, level: 'B1', sk: D.diag.sk }];
  D.snap = {}; [28, 21, 14, 7].forEach((d, i) => { const g = {}; CONTENT.gr.forEach(x => { const c = D.c['g:' + x.id]; if (c) g[x.id] = Math.max(0, Math.round(mEff(c, now) * 100 - d * 0.9)); }); D.snap[dayKey(now - d * DAY)] = { g, sk: { reading: 3.5 + i * .08, listening: 2.7 + i * .1, writing: 2.5 + i * .06, speaking: 2.6 + i * .08, vocab: 2.8 + i * .08, grammar: 2.8 + i * .07 }, a: 2.85 + i * .08 }; });
  D.seenEx = {};
  D.ach = { first: now - 40 * DAY, str3: now - 30 * DAY, a100: now - 25 * DAY };
  S = D; _rand = saveRand; checkAch(); save();
}
