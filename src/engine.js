/* ============================================================
   FLUENT PATH — ENGINE (núcleo)
   Utilidades, estado inicial, domínio de conceitos, revisão
   espaçada (FSRS), habilidades (Elo), requisitos B2, teste
   adaptativo de nivelamento.
   Reescrito em 12/11/2026 após perda do arquivo original.
   ============================================================ */
const DAY = 86400000;
const LV = ['A1', 'A2', 'B1', 'B1+', 'B2', 'B2+', 'C1'];
const SKILLS = ['reading', 'listening', 'writing', 'speaking', 'vocab', 'grammar'];
const SKILL_NAME = { reading: 'Reading', listening: 'Listening', writing: 'Writing', speaking: 'Speaking', vocab: 'Vocabulary', grammar: 'Grammar' };
/* habilidade das questões do nivelamento -> habilidade do aluno */
const DX_SKILL = { vocab: 'vocab', grammar: 'grammar', phrasal: 'vocab', connectors: 'grammar', natural: 'writing', reading: 'reading', listening: 'listening' };

/* ---------- utilidades ---------- */
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
const norm = s => String(s == null ? '' : s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’‘`´]/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
const tokens = s => { const n = norm(s); return n ? n.split(' ') : []; };
const dayKey = (t = Date.now()) => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
function seeded(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
let _rand = Math.random;
const rnd = () => _rand();
const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(_rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = arr => arr[Math.floor(_rand() * arr.length)];
/* similaridade 0..1 entre dois textos (caracteres e palavras) */
function sim(a, b) {
  a = norm(a); b = norm(b); if (!a && !b) return 1; if (!a || !b) return 0; if (a === b) return 1;
  const m = a.length, n = b.length; let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) { const cur = [i]; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; }
  const lev = 1 - prev[n] / Math.max(m, n);
  const A = new Set(a.split(' ')), B = new Set(b.split(' ')); let inter = 0; A.forEach(x => { if (B.has(x)) inter++; });
  const dice = 2 * inter / (A.size + B.size);
  return Math.max(lev, dice * .95);
}

/* ---------- níveis CEFR ---------- */
const lvIdx = l => typeof l === 'number' ? clamp(Math.floor(l + .1), 0, 6) : Math.max(0, LV.indexOf(l));
const lvLabel = a => LV[clamp(Math.floor(a + .1), 0, 6)];

/* ---------- estado inicial ---------- */
function newState() {
  const sk = {}; SKILLS.forEach(k => sk[k] = { a: 2, n: 0 });
  const now = Date.now();
  return {
    v: 1, created: now, onboarded: false, demo: false,
    profile: { name: '', level: 'B1', target: 'B2', minutes: 20, teacher: false, topics: [], goal: '', situations: [], pain: [], prefs: [] },
    settings: { theme: 'system', speed: 1, accent: 'us', ptHelp: 'auto', apiKey: '', model: 'claude-haiku-4-5-20251001', notif: false, sound: false },
    sk, c: {}, win: [], mist: [], ev: [], days: {}, sessions: [], xp: 0, ach: {}, seenEx: {}, assess: [], analyses: [], personal: [],
    lastSpeak: 0, lastListen: 0, lastWrite: 0, diag: null, reports: [], lastRead: 0, quests: null,
    updatedAt: now, profileAt: now, settingsAt: now, mistDel: {}, persDel: {}, snap: {}, tut: []
  };
}

/* ---------- índices do conteúdo ---------- */
const IDX = { words: {}, phr: {}, gr: {}, lis: {}, rd: {}, spk: {}, rp: {}, nat: {} };
function buildIndexes() {
  const put = (m, arr) => { Object.keys(m).forEach(k => delete m[k]); (arr || []).forEach(x => { m[x.id] = x; }); };
  put(IDX.words, CONTENT.words); put(IDX.phr, CONTENT.phr); put(IDX.gr, CONTENT.gr); put(IDX.lis, CONTENT.lis);
  put(IDX.rd, CONTENT.rd); put(IDX.spk, CONTENT.spk); put(IDX.rp, CONTENT.rp); put(IDX.nat, CONTENT.nat);
}

/* ---------- conceitos: domínio + revisão espaçada ---------- */
const TYPE_W = { mcq: .55, cloze: .75, order: .85, typed: 1.0, translate: 1.1, produce: 1.25, convo: 1.5 };
const TIER_OF = { mcq: 0, cloze: 1, order: 1, typed: 2, translate: 2, produce: 3, convo: 3 };
const TIER_CAP = [.40, .62, .85, 1];
const TIER_NAME = ['Recognize', 'Recall in context', 'Produce', 'Use freely'];
const RETENTION_K = .163; // -ln(0.85): intervalo em que a retenção prevista cai a 85% (curva legada)

function newConcept(k, lvl) { return { k, lvl: lvl || 'B1', m: 0, conf: 0, seen: 0, ok: 0, bad: 0, rt: 0, hints: 0, last: 0, next: 0, S: 6, tier: 0, tc: 0, f: 0, peak: 0, st: 'new', prior: false }; }

/* FSRS-4.5 (pesos padrão). Conceitos com c.fs=1: S = dias até a retenção cair a 90%, d = dificuldade 1–10.
   Conceitos sem c.fs (legado, prévios do nivelamento, demo) seguem a curva exponencial até a próxima resposta,
   quando são convertidos preservando o intervalo atual. */
const FSRS_W = [0.4872, 1.4003, 3.7145, 13.8206, 5.1618, 1.2298, 0.8975, 0.031, 1.6474, 0.1367, 1.0461, 2.1072, 0.0793, 0.3246, 1.587, 0.2272, 2.8755];
const FSRS_F = 19 / 81, FSRS_TARGET = .85;
const fsrsR = (t, S) => Math.pow(1 + FSRS_F * t / S, -.5);               // t e S em dias
const fsrsInterval = S => S / FSRS_F * (Math.pow(FSRS_TARGET, -2) - 1);   // dias até a retenção prevista = alvo
function fsrsRating(score, a, t) { if (score < .7) return 1; if (a.hints) return 2; if (score >= .95 && a.rt && a.rt < 8000 && t >= 1) return 4; return 3; }
function fsrsUpdate(c, G, R) {
  const w = FSRS_W, d0 = g => clamp(w[4] - w[5] * (g - 3), 1, 10);
  if (!c.fs) {
    if (c.seen) { c.S = Math.max(.3, c.S * RETENTION_K / fsrsInterval(1)); c.d = 5; c.fs = 1; }
    else { c.S = w[G - 1]; c.d = d0(G); c.fs = 1; return; }
  }
  const D = c.d || 5, S = c.S;
  c.d = clamp(w[7] * d0(3) + (1 - w[7]) * (D - w[6] * (G - 3)), 1, 10);
  if (G === 1) c.S = Math.max(.1, Math.min(S, w[11] * Math.pow(D, -w[12]) * (Math.pow(S + 1, w[13]) - 1) * Math.exp((1 - R) * w[14])));
  else c.S = Math.min(365, S * (1 + Math.exp(w[8]) * (11 - D) * Math.pow(S, -w[9]) * (Math.exp((1 - R) * w[10]) - 1) * (G === 2 ? w[15] : 1) * (G === 4 ? w[16] : 1)));
}
const forgetP = (c, now = Date.now()) => !c.last ? 0 : c.fs ? 1 - fsrsR(Math.max(0, now - c.last) / DAY, c.S) : 1 - Math.exp(-(now - c.last) / (c.S * DAY));
const mEff = (c, now = Date.now()) => c ? c.m * (1 - .35 * forgetP(c, now)) : 0;
function stageOf(c, now = Date.now()) {
  if (!c || !c.seen) return c && c.prior ? 'mastered' : 'new';
  const p = forgetP(c, now);
  if (c.peak >= .6 && c.seen >= 3 && (c.m < .45 || p > .7)) return 'forgotten';
  if (c.m >= .75 && c.tier >= 2) return 'mastered';
  if (c.m >= .4) return 'familiar';
  return 'learning';
}

/* Atualiza um conceito com uma resposta. a: {ok, score?, type, lvl, rt, hints} */
function applyAnswer(S, cid, meta, a) {
  const now = a.now || Date.now();
  const c = S.c[cid] || (S.c[cid] = newConcept(meta.k, meta.lvl));
  const t = TIER_OF[a.type] != null ? TIER_OF[a.type] : 0;
  const w = TYPE_W[a.type] || .6;
  const dw = clamp(.85 + .12 * (lvIdx(a.lvl || c.lvl) - lvIdx(S.profile.level)), .6, 1.3);
  const score = a.score == null ? (a.ok ? 1 : 0) : a.score;
  const before = c.m;
  const good = score >= .7;
  if (good) {
    let g = w * dw * (1 - c.m) * .32 * score;
    if (a.hints) g *= .5;
    if (a.rt && a.rt < 8000 && t >= 1) g *= 1.1;
    c.m = Math.max(c.m, Math.min(c.m + g, TIER_CAP[t])); // reconhecimento nunca passa de 40%; produção livre leva a 100%
    if (t >= c.tier) { c.tc++; if (c.tc >= 2 && c.tier < 3) { c.tier++; c.tc = 0; } }
    c.f = 0;
    c.ok++;
  } else {
    c.m = Math.max(0, c.m - (.10 + .06 * w) * Math.max(c.m, .3));
    c.tc = 0; c.f++;
    if (c.f >= 2 && c.tier > 0) { c.tier--; c.f = 0; }
    c.bad++;
  }
  c.conf = c.seen ? c.conf * .7 + (good ? 1 : 0) * .3 : (good ? .6 : .25);
  c.rt = c.rt ? c.rt * .7 + (a.rt || c.rt) * .3 : (a.rt || 0);
  c.hints += a.hints || 0;
  const Rnow = c.last ? 1 - forgetP(c, now) : 1;
  fsrsUpdate(c, fsrsRating(score, a, t), Rnow);
  c.seen++; c.last = now; c.next = now + fsrsInterval(c.S) * DAY;
  c.peak = Math.max(c.peak, c.m); c.prior = false;
  c.st = stageOf(c, now);
  return { dm: c.m - before, c };
}

/* conceitos vencidos para revisão (mais esquecidos primeiro) */
function dueList(S, prefix, now = Date.now()) {
  return Object.keys(S.c).filter(k => k.startsWith(prefix) && S.c[k].seen && S.c[k].next <= now)
    .sort((a, b) => forgetP(S.c[b], now) - forgetP(S.c[a], now));
}
/* domínio médio de um grupo de conceitos (os não vistos contam 0) */
const groupMastery = (S, cids, now = Date.now()) => cids.length ? avg(cids.map(c => mEff(S.c[c], now))) : 0;
const errorCount = (S, gid) => S.mist.reduce((n, m) => n + ((m.cid === 'g:' + gid || m.tag === gid) ? (m.count || 1) : 0), 0);

/* ---------- habilidades (Elo) e janela de precisão ---------- */
function applySkill(S, skill, itemLvl, ok, weight = 1) {
  const s = S.sk[skill]; if (!s) return;
  const expected = 1 / (1 + Math.exp(-(s.a - itemLvl) * 1.2));
  const k = .17 * weight / (1 + s.n / 30); // passos pequenos: o nível não pode disparar com poucas respostas
  s.a = clamp(s.a + k * ((ok ? 1 : 0) - expected) * 1.6, 0, 6.5);
  s.n++;
}
function pushWin(S, ok) { S.win.push(ok ? 1 : 0); if (S.win.length > 30) S.win.shift(); }
const acc20 = S => S.win.length >= 6 ? avg(S.win.slice(-20)) : .8;
/* alvo de 80–85% de acertos: acima disso sobe a dificuldade; abaixo, reduz */
const diffBias = S => clamp((acc20(S) - .82) * 2.5, -.6, .8);
const overallA = S => avg(SKILLS.map(k => S.sk[k].a));
/* o nível exibido exige EVIDÊNCIA: B2 só com 60% dos requisitos B2 dominados, B2+ com 80% */
const overallLabel = S => { const raw = lvLabel(overallA(S)); const li = lvIdx(raw); if (li >= 4) { const g = b2Requirements(S).total; const need = li >= 5 ? .8 : .6; if (g < need) return (li >= 5 && g >= .6) ? 'B2' : 'B1+'; } return raw; };
const abilityFor = (S, skill) => (S.sk[skill] || { a: 2 }).a;

/* ---------- desbloqueio por pré-requisitos (grafo) ---------- */
function grammarUnlocked(S, g) {
  if (lvIdx(g.lvl) <= overallA(S) - 1.6) return true; // bem abaixo do seu nível: nunca bloqueia
  return (g.prereq || []).every(p => { if (!IDX.gr[p]) return true; const c = S.c['g:' + p]; return !!c && (c.prior || mEff(c) >= .45); });
}
/* tópicos de gramática que mais merecem atenção agora */
function pickGrammar(S, n = 2) {
  const now = Date.now(), A = overallA(S);
  return CONTENT.gr.filter(g => grammarUnlocked(S, g) && lvIdx(g.lvl) <= A + 1.2).map(g => {
    const c = S.c['g:' + g.id];
    const weak = c && c.seen ? 1 - mEff(c, now) : .55;
    const due = c && c.seen && c.next <= now ? .4 : 0;
    const near = Math.max(0, 1 - Math.abs(lvIdx(g.lvl) - (A + .3)) / 1.5);
    const err = Math.min(.6, errorCount(S, g.id) * .15);
    return { g, s: weak * .8 + due + near * .5 + err - (c && c.prior ? 1 : 0) };
  }).sort((a, b) => b.s - a.s).slice(0, n).map(x => x.g);
}

/* ---------- vocabulário: estatísticas ---------- */
function wordStats(S) {
  const by = { new: 0, learning: 0, familiar: 0, mastered: 0, forgotten: 0 }; let passive = 0, active = 0;
  CONTENT.words.forEach(w => {
    const c = S.c['w:' + w.id];
    if (!c || !c.seen) { by.new++; return; }
    by[stageOf(c)]++;
    if (c.tier >= 2 && c.m >= .5) active++; else if (c.m >= .25) passive++;
  });
  return { total: CONTENT.words.length, by, mastered: by.mastered, passive: passive + active, active };
}

/* ---------- requisitos do B2 ---------- */
function b2Requirements(S) {
  const now = Date.now(); const cm = (arr, prefix) => groupMastery(S, arr.map(x => prefix + x.id), now);
  const gramB1 = CONTENT.gr.filter(g => lvIdx(g.lvl) <= 3), gramB2 = CONTENT.gr.filter(g => lvIdx(g.lvl) === 4 || lvIdx(g.lvl) === 5);
  const wB2 = CONTENT.words.filter(w => lvIdx(w.lvl) >= 4);
  const allCats = [...new Set(CONTENT.con.items.map(i => 'c:' + i.cat))];
  const natKeys = [...new Set(CONTENT.nat.map(n => 'n:' + ((n.tags && n.tags[0]) || 'misc')))];
  const conn = S.analyses.slice(-6).map(a => a.connDistinct || 0); const connVar = conn.length ? clamp(avg(conn) / 5, 0, 1) : 0;
  const skillV = k => clamp((abilityFor(S, k) - 2) / 1.9, 0, 1);
  const list = [
    { id: 'gram-b1', name: 'Core grammar (A1–B1+)', w: 1, v: clamp(cm(gramB1, 'g:') / .8, 0, 1), tip: 'Review tenses, modals, conditionals and prepositions until they feel automatic.' },
    { id: 'gram-b2', name: 'Upper grammar', w: 1.4, v: clamp(cm(gramB2, 'g:') / .65, 0, 1), tip: 'Work on third conditional, passive, reported speech and advanced modals.' },
    { id: 'vocab-b2', name: 'Upper vocabulary', w: 1.4, v: clamp(cm(wB2, 'w:') / .38, 0, 1), tip: 'Learn advanced words with production exercises, not only recognition.' },
    { id: 'phr', name: 'Phrasal verbs', w: 1, v: clamp(cm(CONTENT.phr, 'p:') / .45, 0, 1), tip: 'Practice phrasal verbs in sentences you could really say.' },
    { id: 'conn', name: 'Connectors & linking', w: 1.2, v: .6 * groupMastery(S, allCats, now) + .4 * connVar, tip: 'Replace "because" and "but" with since, whereas, nevertheless, due to…' },
    { id: 'nat', name: 'Natural English', w: 1, v: clamp(groupMastery(S, natKeys, now) / .6, 0, 1), tip: 'Choose the phrase a native speaker would use, not the literal translation.' },
    { id: 'read', name: 'Reading', w: .8, v: skillV('reading'), tip: 'Read a text at your level every few days and look up unknown words.' },
    { id: 'listen', name: 'Listening', w: 1, v: skillV('listening'), tip: 'Do listening at 1× speed and answer before reading the transcript.' },
    { id: 'write', name: 'Writing', w: 1, v: skillV('writing'), tip: 'Write short texts with linkers and review the corrections.' },
    { id: 'speak', name: 'Speaking', w: 1, v: skillV('speaking'), tip: 'Speak for 1–2 minutes on a topic and review your transcript.' }
  ];
  const tw = list.reduce((s, r) => s + r.w, 0);
  return { list, total: list.reduce((s, r) => s + r.w * r.v, 0) / tw };
}
function whyNotB2(S) {
  const req = b2Requirements(S); const skillsOk = SKILLS.every(k => abilityFor(S, k) >= 3.9);
  const tests = S.assess.some(a => a.type === 'test' && a.testLevel === 'B2' && a.pass);
  const ready = req.total >= .8 && req.list.every(r => r.v >= .6) && skillsOk;
  const low = req.list.filter(r => r.v < .8).sort((a, b) => a.v - b.v).slice(0, 4);
  return { ready, pct: req.total, low, gate: { req, skillsOk, tests } };
}
/* progresso médio de domínio em todo o conteúdo de um nível */
function levelProgress(S, lvl) {
  const now = Date.now(); const vals = [];
  CONTENT.words.forEach(w => { if (w.lvl === lvl) vals.push(mEff(S.c['w:' + w.id], now)); });
  CONTENT.phr.forEach(p => { if (p.lvl === lvl) vals.push(mEff(S.c['p:' + p.id], now)); });
  CONTENT.gr.forEach(g => { if (g.lvl === lvl) vals.push(mEff(S.c['g:' + g.id], now)); });
  CONTENT.nat.forEach(n => { if (n.lvl === lvl) vals.push(mEff(S.c['n:' + ((n.tags && n.tags[0]) || 'misc')], now)); });
  if (lvl === 'B1+') [...new Set(CONTENT.con.items.map(i => i.cat))].forEach(c => vals.push(mEff(S.c['c:' + c], now)));
  return vals.length ? clamp(avg(vals) / .8, 0, 1) : 0;
}
/* progresso até o nível-alvo (0..1) */
function progressToTarget(S) {
  const t = lvIdx(S.profile.target || 'B2'); const part = clamp((overallA(S) - 1) / Math.max(1, t - 1.1), 0, 1);
  return t >= 4 ? .4 * part + .6 * b2Requirements(S).total : part;
}
const ROADMAP = [
  { name: 'Foundations', desc: 'Solid A2: present, past and future basics, everyday vocabulary, simple conversations.' },
  { name: 'Build a strong B1', desc: 'Perfect tenses, conditionals, modals, 1,000 common words and your first phrasal verbs.' },
  { name: 'Bridge B1+ → B2', desc: 'Connectors, natural phrasing, longer listening and reading, writing with structure.' },
  { name: 'Consolidate B2', desc: 'Passive, reported speech, third conditional, B2 vocabulary in active use, fluent speaking.' },
  { name: 'B2+ and beyond', desc: 'Nuance, register, idioms and complex structures: aim for C1 confidence.' }
];

/* ---------- nivelamento adaptativo ---------- */
const DX_START = { A1: .5, A2: 1.2, B1: 2.2, 'B1+': 3, B2: 4, 'B2+': 5, C1: 5.5 };
function dxStart(profile) { return { theta: DX_START[profile && profile.level] != null ? DX_START[profile.level] : 2.2, ans: [], used: [], done: false, hist: [] }; }
function dxNext(D) {
  if (D.done) return null;
  const target = clamp(D.theta + .25, 0, 6);
  const cnt = {}; D.ans.forEach(a => { cnt[a.skill] = (cnt[a.skill] || 0) + 1; });
  const cands = CONTENT.dx.filter(x => !D.used.includes(x.id)).map(x => ({ x, s: Math.abs(lvIdx(x.lvl) - target) + (cnt[x.skill] || 0) * .35 + _rand() * .3 })).sort((a, b) => a.s - b.s);
  if (!cands.length) { D.done = true; return null; }
  const it = cands[0].x; D.used.push(it.id); return it;
}
function dxAnswer(D, it, i, ms) {
  const ok = i === it.ans, idk = i < 0, L = lvIdx(it.lvl);
  D.ans.push({ id: it.id, lvl: it.lvl, skill: it.skill, tag: it.tag, ok, idk, ms });
  const n = D.ans.length, step = Math.max(.22, .85 - .05 * n);
  D.theta = clamp(D.theta + (ok ? step * (L >= D.theta - 1 ? 1 : .5) : -step * (L <= D.theta + 1 ? 1 : .5) * (idk ? 1.15 : 1)), .3, 6);
  D.hist.push(D.theta);
  if (n >= 24) D.done = true;
  else if (n >= 16) { const last = D.hist.slice(-5); if (Math.max(...last) - Math.min(...last) < .75) D.done = true; }
}
function dxResult(D, writingA, speakingA) {
  const theta = D.theta, sk = {};
  const est = s => {
    const xs = D.ans.filter(a => (DX_SKILL[a.skill] || 'grammar') === s); if (!xs.length) return theta;
    const v = avg(xs.map(a => lvIdx(a.lvl) + (a.ok ? .6 : -.6))); const w = xs.length / (xs.length + 2); return w * v + (1 - w) * theta;
  };
  SKILLS.forEach(s => { sk[s] = clamp(est(s), .3, 5.8); });
  if (writingA != null) sk.writing = clamp(.5 * sk.writing + .5 * writingA, .3, 5.8);
  if (speakingA != null) sk.speaking = clamp(.5 * sk.speaking + .5 * speakingA, .3, 5.8);
  Object.keys(sk).forEach(k => { sk[k] = Math.round(sk[k] * 100) / 100; });
  const by = {}; D.ans.forEach(a => { const b = by[a.tag] || (by[a.tag] = { n: 0, ok: 0, l: 0 }); b.n++; if (a.ok) b.ok++; b.l += lvIdx(a.lvl); });
  const tags = Object.keys(by);
  const strengths = tags.filter(t => t !== 'vocabulary' && ((by[t].ok === by[t].n && by[t].l / by[t].n >= theta - 1.2) || (by[t].n >= 3 && by[t].ok / by[t].n >= .8))).slice(0, 4);
  const weaknesses = tags.filter(t => by[t].ok < by[t].n && by[t].l / by[t].n <= theta + 1.2 && !strengths.includes(t)).sort((a, b) => by[a].ok / by[a].n - by[b].ok / by[b].n).slice(0, 4);
  return { sk, theta: Math.round(theta * 100) / 100, strengths, weaknesses, n: D.ans.length, at: Date.now() };
}
/* aplica o resultado do nivelamento: habilidades, diagnóstico e conhecimento prévio de gramática */
function applyDiagnostic(S, R) {
  const now = Date.now(), th = R.theta;
  SKILLS.forEach(k => { if (R.sk[k] != null) { S.sk[k].a = R.sk[k]; S.sk[k].n = Math.max(S.sk[k].n, 6); } });
  S.diag = R; S.assess.push({ type: 'diagnostic', at: R.at || now, level: lvLabel(th), sk: R.sk });
  CONTENT.gr.forEach(g => {
    const id = 'g:' + g.id, L = lvIdx(g.lvl); if (S.c[id] && S.c[id].seen && !S.c[id].prior) return;
    if (L <= th - 1.6) { const c = newConcept('gram', g.lvl); Object.assign(c, { m: .8, tier: 2, seen: 1, ok: 2, last: now, S: 40, next: now + 7 * DAY, peak: .8, prior: true, st: 'mastered' }); S.c[id] = c; }
    else if (L <= th - 0.9) { const c = newConcept('gram', g.lvl); Object.assign(c, { m: .5, tier: 1, seen: 1, ok: 1, last: now, S: 12, next: now + DAY, peak: .5, prior: true, st: 'familiar' }); S.c[id] = c; }
  });
}
