/* ============================================================
   FLUENT PATH — ENGINE 2
   Geradores de exercícios, análise de texto, caderno de erros
   e planejador da sessão diária.
   ============================================================ */
/* segundos REAIS por tipo de item (medidos por leitura/escuta: 2 audições + perguntas, texto de ~200 palavras etc.) */
const EST = { mcq: 20, cloze: 26, order: 40, typed: 40, translate: 50, produce: 90, listen: 165, read: 150, speak: 120, write: 200, rp: 240 };
const TOPIC_MAP = { tech: ['tech'], ai: ['ai'], security: ['security'], business: ['business', 'work'], travel: ['travel'], daily: ['daily'], relationships: ['relationships'], culture: ['culture'], finance: ['finance'], science: ['science'] };
const ptHelpOn = S => S.settings.ptHelp === 'on' ? true : S.settings.ptHelp === 'off' ? false : overallA(S) < 4;
const mask = (s, f) => { const i = s.toLowerCase().indexOf(String(f).toLowerCase()); return i < 0 ? s + ' ____' : s.slice(0, i) + '____' + s.slice(i + f.length); };
const inflClass = f => { const t = String(f).toLowerCase().split(' ').pop(); return /ing$/.test(t) ? 'ing' : /ed$/.test(t) ? 'ed' : /ly$/.test(t) ? 'ly' : /s$/.test(t) ? 's' : 'b'; };
const stemRe = w => { const t = norm(w).split(' ').filter(x => x.length > 2 || true); return t.map(x => new RegExp('\\b' + x.slice(0, Math.max(3, x.length - 2)).replace(/[^a-z']/g, '') + "[a-z']*", 'i')); };
const firstLetters = s => s.split(' ').map(w => w[0] + '_'.repeat(Math.max(0, w.length - 1))).join(' ');
const uniqBy = (arr, f) => { const s = new Set(); return arr.filter(x => { const k = f(x); if (s.has(k)) return false; s.add(k); return true; }); };
const scaf = S => acc20(S) < .62 ? 1 : 0; // acertando pouco: recua um degrau (mais apoio) antes de avançar
const PLANNED = new Map();
const planned = k => Date.now() - (PLANNED.get(k) || 0) < 20000;
const markPlanned = k => PLANNED.set(k, Date.now());
const isRecent = (S, k) => planned(k) || (Date.now() - (S.seenEx[k] || 0)) < 3 * DAY;

/* ---------- vocabulário ---------- */
function wordItem(S, w, tier = 0) {
  const cid = 'w:' + w.id, pt = ptHelpOn(S);
  const base = { kind: 'word', cid, meta: { k: 'word', lvl: w.lvl }, lvl: w.lvl, ref: w.id, card: { type: 'word', id: w.id } };
  if (tier <= 0) {
    const pool = shuffle(CONTENT.words.filter(x => x.id !== w.id && x.pos === w.pos));
    const opt = x => pt ? x.pt : x.def;
    const ds = []; for (const x of pool) { if (ds.length >= 3) break; if (opt(x) !== opt(w) && !ds.some(d => opt(d) === opt(x))) ds.push(x); }
    const opts = shuffle([w, ...ds]);
    return { ...base, type: 'mcq', wtype: 'mcq', tier: 0, q: `In this sentence, what does <b>${esc(w.form)}</b> mean?`, sub: '“' + esc(w.ex) + '”', opts: opts.map(opt), ans: opts.indexOf(w), why: `<b>${esc(w.w)}</b>: ${esc(w.def)} (${esc(w.pt)})`, tts: w.ex };
  }
  if (tier === 1) {
    const cls = inflClass(w.form);
    let pool = CONTENT.words.filter(x => x.id !== w.id && x.pos === w.pos && inflClass(x.form) === cls);
    if (pool.length < 3) pool = CONTENT.words.filter(x => x.id !== w.id && x.pos === w.pos);
    pool = shuffle(pool).sort((a, b) => Math.abs(lvIdx(a.lvl) - lvIdx(w.lvl)) - Math.abs(lvIdx(b.lvl) - lvIdx(w.lvl)) + (rnd() - .5) * 2);
    const ds = uniqBy(pool, x => x.form.toLowerCase()).slice(0, 3);
    const opts = shuffle([w, ...ds]);
    return { ...base, type: 'mcq', wtype: 'cloze', tier: 1, q: 'Choose the word that fits:', sub: esc(mask(w.ex, w.form)), opts: opts.map(x => x.form), ans: opts.indexOf(w), why: `<b>${esc(w.form)}</b> (${esc(w.pt)}). Natural combinations: ${esc((w.col || []).slice(0, 3).join(', '))}.`, tts: w.ex };
  }
  if (tier === 2) {
    return { ...base, type: 'typed', wtype: 'typed', tier: 2, q: 'Type the missing word:', sub: esc(mask(w.ex, w.form)), clue: (pt ? w.pt + ' · ' : '') + w.def, acc: [w.form, w.w], hint: firstLetters(w.form), why: `<b>${esc(w.form)}</b>: ${esc(w.def)}`, tts: w.ex };
  }
  return { ...base, type: 'produce', wtype: 'produce', tier: 3, q: `Write <b>your own sentence</b> using <b>${esc(w.w)}</b>.`, sub: esc(w.def) + ' — e.g. “' + esc((w.col || [])[0] || w.w) + '”', need: { words: [w.w], min: 6 }, model: w.nat, why: `Natural example: “${esc(w.nat)}”`, selfCheck: true };
}
function phrItem(S, p, tier = 0) {
  const cid = 'p:' + p.id, pt = ptHelpOn(S), base_ = `${p.v} ${p.p}`;
  const base = { kind: 'phr', cid, meta: { k: 'phrasal', lvl: p.lvl }, lvl: p.lvl, ref: p.id, card: { type: 'phr', id: p.id } };
  if (tier <= 0) {
    const pool = shuffle(CONTENT.phr.filter(x => x.id !== p.id));
    const opt = x => pt ? x.pt : x.def;
    const ds = []; for (const x of pool) { if (ds.length >= 3) break; if (opt(x) !== opt(p)) ds.push(x); }
    const opts = shuffle([p, ...ds]);
    return { ...base, type: 'mcq', wtype: 'mcq', tier: 0, q: `What does <b>${esc(p.form)}</b> mean here?`, sub: '“' + esc(p.ex) + '”', opts: opts.map(opt), ans: opts.indexOf(p), why: `<b>${esc(base_)}</b> = ${esc(p.def)} (${esc(p.pt)})${p.contrast ? '<br>' + esc(p.contrast) : ''}`, tts: p.ex };
  }
  if (tier === 1) {
    const same = CONTENT.phr.filter(x => x.id !== p.id && x.v === p.v && x.p !== p.p);
    const others = shuffle(CONTENT.phr.filter(x => x.id !== p.id && x.v !== p.v));
    const ds = []; if (same.length) ds.push(pick(same)); for (const x of others) { if (ds.length >= 3) break; ds.push(x); }
    const opts = shuffle([p, ...ds]);
    return { ...base, type: 'mcq', wtype: 'cloze', tier: 1, q: 'Choose the phrasal verb that fits <span class="muted">(the form may change)</span>:', sub: esc(mask(p.ex, p.form)), opts: opts.map(x => `${x.v} ${x.p}`), ans: opts.indexOf(p), why: `<b>${esc(base_)}</b> = ${esc(p.def)}.${p.contrast ? '<br>' + esc(p.contrast) : ''}`, tts: p.ex };
  }
  if (tier === 2) {
    return { ...base, type: 'typed', wtype: 'typed', tier: 2, q: 'Complete with the phrasal verb <span class="muted">(watch the verb form)</span>:', sub: esc(mask(p.ex, p.form)), clue: (pt ? p.pt + ' · ' : '') + `≈ ${p.formal || p.syn && p.syn[0] || p.def}`, acc: [p.form], hint: firstLetters(p.form), why: `<b>${esc(p.form)}</b> (${esc(base_)}) = ${esc(p.def)}`, tts: p.ex };
  }
  return { ...base, type: 'produce', wtype: 'produce', tier: 3, q: `Write <b>your own sentence</b> using <b>${esc(base_)}</b>.`, sub: esc(p.def), need: { words: [p.v + ' ' + p.p], phr: p, min: 6 }, model: p.nat, why: `Natural example: “${esc(p.nat)}”`, selfCheck: true };
}

/* ---------- gramática ---------- */
const GPROBE = {
  'second-conditional': /\bif\b[^.?!]*\b(were|had|knew|could|did|went|\w+ed)\b[^.?!]*\bwould\b|\bwould\b[^.?!]*\bif\b[^.?!]*\b(were|had|knew|could|did|went|\w+ed)\b/i,
  'third-conditional': /\bif\b[^.?!]*\bhad\b[^.?!]*\bwould\s+have\b|\bwould\s+have\b[^.?!]*\bif\b[^.?!]*\bhad\b/i,
  'first-conditional': /\b(if|unless)\b[^.?!]*\b(will|'ll|won't)\b|\b(will|'ll)\b[^.?!]*\b(if|unless)\b/i,
  'mixed-conditionals': /\bif\b[^.?!]*\bhad\b[^.?!]*\bwould\b(?!\s+have)|\bwould\b(?!\s+have)[^.?!]*\bif\b[^.?!]*\bhad\b|\bif\b[^.?!]*\b(were|was)\b[^.?!]*\bwould\s+have\b/i,
  'present-perfect': /\b(have|has|'ve|'s)\s+(\w+ed|been|gone|done|seen|made|taken|had|written|known|become|got(ten)?|come|given|found|met|read|heard|lost)\b/i,
  'present-perfect-continuous': /\b(have|has|'ve|'s)\s+been\s+\w+ing\b/i,
  'past-perfect': /\bhad\s+(\w+ed|been|gone|done|seen|made|taken|written|known|become|got(ten)?|come|given|found|met|left|lost)\b/i,
  'passive-voice': /\b(is|are|was|were|been|be|being)\s+(\w+ed|made|done|taken|given|built|written|known|seen|found|held|sent|kept|chosen|told)\b/i,
  'reported-speech': /\b(said|told|asked|explained|mentioned|wondered)\b[^.?!]*\b(that|if|whether|to|he|she|they|I|we)\b/i,
  'wish-if-only': /\b(wish|if only)\b/i,
  'relative-clauses': /\b(who|which|that|whose|where)\b/i,
  'complex-relative-clauses': /,\s*(which|whose|who)\b|\b(in|on|at|of|to|for|with|by)\s+(which|whom|whose)\b/i,
  'used-to-would': /\bused to\b|\bwould\s+(always|often|usually|\w+)\b/i,
  'modals-advanced': /\b(must|might|may|could|can't|couldn't|should|ought to)\s+have\b/i,
  'participle-clauses': /\b(having\s+\w+|\w+ing)\b[^,.]*,|,\s*\w+ing\b/i,
  'inversion': /\b(not only|never|rarely|seldom|hardly|no sooner|little|only when|under no circumstances)\b[^.?!]*\b(did|do|does|had|have|has|was|were|will|would|can|could)\b/i,
  'gerund-infinitive': /\b(enjoy|avoid|suggest|finish|keep|mind|decide|want|hope|plan|manage|refuse|stop|remember|forget)\b/i,
  'past-continuous': /\b(was|were)\s+\w+ing\b/i,
  'future-forms': /\b(will|going to|'ll|'m going|am going|are going|is going)\b/i,
  'comparatives': /\b(\w+er|more\s+\w+|less\s+\w+)\s+than\b|\bas\s+\w+\s+as\b/i
};
function gramItem(S, g, wantTier) {
  const c = S.c['g:' + g.id]; const tier = wantTier != null ? wantTier : (c ? Math.max(0, c.tier - scaf(S)) : 0);
  const A = overallA(S) + .3 + diffBias(S);
  const exs = g.exercises.map((e, i) => ({ e, i, key: g.id + '#' + i }));
  const typeOrder = [['mcq', 'order', 'fill'], ['order', 'mcq', 'fill'], ['fill', 'order', 'mcq'], ['fill', 'order', 'mcq']][clamp(tier, 0, 3)];
  const recent = k => isRecent(S, k);
  let chosen = null;
  for (const t of typeOrder) {
    const cand = exs.filter(x => x.e.t === t).sort((a, b) => (recent(a.key) - recent(b.key)) * 5 + Math.abs(lvIdx(a.e.lvl || g.lvl) - A) - Math.abs(lvIdx(b.e.lvl || g.lvl) - A));
    if (cand.length) { chosen = cand[0]; if (!recent(chosen.key)) break; }
  }
  if (tier >= 3 || !chosen) {
    if (tier >= 3) {
      const probe = GPROBE[g.id];
      return { kind: 'gram', cid: 'g:' + g.id, meta: { k: 'gram', lvl: g.lvl }, lvl: g.lvl, ref: g.id, type: 'produce', wtype: 'produce', tier: 3, tag: g.id, card: { type: 'gram', id: g.id },
        q: `Write <b>one sentence of your own</b> using <b>${esc(g.name)}</b>.`, sub: esc(g.form || ''), need: { probe, min: 5 }, model: g.ex[0], selfCheck: !probe, why: `Structure: <b>${esc(g.form || g.name)}</b>. Example: “${esc(g.ex[0])}”` };
    }
    return null;
  }
  const e = chosen.e, key = chosen.key; markPlanned(key);
  const base = { kind: 'gram', cid: 'g:' + g.id, meta: { k: 'gram', lvl: g.lvl }, lvl: e.lvl || g.lvl, ref: g.id, exKey: key, tag: g.id, card: { type: 'gram', id: g.id }, why: esc(e.why || '') };
  if (e.t === 'mcq') return { ...base, type: 'mcq', wtype: 'mcq', tier: 0, q: esc(e.q), opts: e.opts.map(esc), ans: e.ans, correctText: e.opts[e.ans] };
  if (e.t === 'order') return { ...base, type: 'order', wtype: 'order', tier: 1, q: 'Put the words in order:', sub: esc(e.q), seq: e.ans.split(' '), correctText: e.ans };
  return { ...base, type: 'typed', wtype: 'typed', tier: 2, q: 'Complete the sentence:', sub: esc(e.q), acc: (e.acc || [e.ans]).map(String), hint: firstLetters(String(e.ans)), correctText: e.ans };
}

/* ---------- conectores ---------- */
function connItem(S, it, tier = 1) {
  const cid = 'c:' + it.cat, base = { kind: 'conn', cid, meta: { k: 'conn', lvl: it.lvl }, lvl: it.lvl, ref: it.id, tag: 'connectors', card: { type: 'conn', cat: it.cat } };
  if (tier >= 3) {
    const cat = CONTENT.con.cats.find(c => c.id === it.cat);
    const list = cat ? cat.items.map(x => x.c) : [];
    return { ...base, type: 'produce', wtype: 'produce', tier: 3, q: `Write <b>2 sentences</b> using different <b>${esc(cat ? cat.name.toLowerCase() : it.cat)}</b> connectors.`, sub: 'Try: ' + esc(list.slice(0, 6).join(' · ')), need: { conn: list, minConn: 2, min: 8 }, model: it.s.replace('____', it.opts[it.ans]), why: 'Vary your linking words: ' + esc(list.join(', ')), selfCheck: false };
  }
  if (tier === 2) {
    return { ...base, type: 'typed', wtype: 'typed', tier: 2, q: 'Type the best connector:', sub: esc(it.s), acc: [it.opts[it.ans]], hint: firstLetters(it.opts[it.ans]), why: esc(it.note || ''), correctText: it.opts[it.ans] };
  }
  return { ...base, type: 'mcq', wtype: 'cloze', tier: 1, q: 'Choose the best connector:', sub: esc(it.s), opts: it.opts.map(esc), ans: it.ans, why: esc(it.note || ''), correctText: it.opts[it.ans] };
}

/* ---------- inglês natural ---------- */
const natTag = n => (n.tags && n.tags[0]) || 'misc';
function natItem(S, n, tier = 0) {
  const cid = 'n:' + natTag(n), pt = ptHelpOn(S);
  const base = { kind: 'nat', cid, meta: { k: 'nat', lvl: n.lvl }, lvl: n.lvl, ref: n.id, tag: 'natural-' + natTag(n), card: { type: 'nat', id: n.id } };
  const why = `<b>Natural:</b> “${esc(n.natural)}”<br>${esc(n.why)}`;
  if (tier <= 0) {
    const opts = shuffle([n.natural, n.understandable, ...(n.alts || [])]).slice(0, 4);
    if (!opts.includes(n.natural)) opts[0] = n.natural;
    const o = shuffle(opts);
    return { ...base, type: 'mcq', wtype: 'mcq', tier: 0, q: 'Choose the <b>most natural</b> sentence:', sub: pt ? `<span class="muted">${esc(n.pt)}</span>` : '', opts: o.map(esc), ans: o.indexOf(n.natural), why, correctText: n.natural, tts: n.natural };
  }
  if (tier === 1) {
    return { ...base, type: 'typed', wtype: 'cloze', tier: 1, q: 'Rewrite this so it sounds <b>more natural</b>:', sub: esc(n.understandable), clue: pt ? n.pt : '', acc: [n.natural], fuzzy: .8, hint: firstLetters(n.natural.split(' ').slice(0, 3).join(' ')) + ' …', why, correctText: n.natural, tts: n.natural };
  }
  return { ...base, type: 'translate', wtype: tier === 2 ? 'translate' : 'produce', tier: tier, q: 'Translate into <b>natural</b> English:', sub: esc(n.pt), natural: n.natural, understandable: n.understandable, why, correctText: n.natural, tts: n.natural };
}
function builderItem(S, n) {
  const sent = n.natural; const w = sent.replace(/[.?!]$/, '').split(' ');
  return { kind: 'nat', cid: 'n:' + natTag(n), meta: { k: 'nat', lvl: n.lvl }, lvl: n.lvl, ref: n.id, tag: 'natural-' + natTag(n), type: 'order', wtype: 'order', tier: 1, q: 'Build the sentence:', sub: esc(n.pt), seq: w, trail: sent.slice(-1).match(/[.?!]/) ? sent.slice(-1) : '.', correctText: sent, why: esc(n.why), tts: sent, card: { type: 'nat', id: n.id } };
}

/* ---------- listening / speaking / writing ---------- */
function listenItem(S, l, mode = 'listen') {
  return { kind: 'lis', cid: null, skill: mode === 'read' ? 'reading' : 'listening', meta: { k: 'lis', lvl: l.lvl }, lvl: l.lvl, ref: l.id, type: 'listen', wtype: 'mcq', tier: 0, mode, script: l.script, speed: l.speed, accent: l.accent, qs: l.qs, vocab: l.vocab || [], topic: l.topic, q: mode === 'read' ? 'Read and answer' : 'Listen and answer' };
}
function readItem(S, r) {
  const it = listenItem(S, { id: r.id, lvl: r.lvl, speed: 'normal', accent: 'us', script: r.text, qs: r.qs, vocab: (r.vocab || []).map(v => v.w), topic: r.topic }, 'read');
  it.title = r.title; it.gloss = r.vocab || []; it.rkind = r.kind; return it;
}
function speakItem(S, p) { return { kind: 'spk', cid: null, skill: 'speaking', meta: { k: 'spk', lvl: p.lvl }, lvl: p.lvl, ref: p.id, type: 'speak', wtype: 'convo', tier: 3, q: esc(p.prompt), prompt: p.prompt, goals: p.goals || [], useful: p.useful || [], model: p.model, minWords: p.minWords || 40, mins: p.mins || 1 }; }
const CHALLENGES = [
  { id: 'ch1', lvl: 'B2', prompt: 'Explain why companies should not replace every employee with AI.', req: ['although', 'however', 'therefore'], min: 5, secs: 90 },
  { id: 'ch2', lvl: 'B1+', prompt: 'Describe the best trip you have ever taken and why it was special.', req: ['because', 'although', 'after'], min: 4, secs: 90 },
  { id: 'ch3', lvl: 'B2', prompt: 'Should remote work be the default for IT teams? Give your opinion.', req: ['on the other hand', 'whereas', 'as a result'], min: 5, secs: 120 },
  { id: 'ch4', lvl: 'B2', prompt: 'Explain to a customer why a service was unavailable for twenty minutes.', req: ['due to', 'as a result', 'in the meantime'], min: 5, secs: 90 },
  { id: 'ch5', lvl: 'B1+', prompt: 'Write about a small habit that improved your daily life.', req: ['since', 'however', 'for example'], min: 4, secs: 90 },
  { id: 'ch6', lvl: 'B2+', prompt: 'Is social media making communication better or worse? Defend a position.', req: ['nevertheless', 'moreover', 'consequently'], min: 6, secs: 120 },
  { id: 'ch7', lvl: 'B2', prompt: 'Describe a cybersecurity risk every company should take seriously.', req: ['furthermore', 'in order to', 'unless'], min: 5, secs: 100 },
  { id: 'ch8', lvl: 'B1+', prompt: 'Give advice to a friend who is starting a new job abroad.', req: ['if', 'so that', 'but'], min: 4, secs: 90 }
];
function writeItem(S, ch, kind = 'write') { return { kind: 'wri', cid: null, skill: 'writing', meta: { k: 'wri', lvl: ch.lvl }, lvl: ch.lvl, ref: ch.id, type: 'write', wtype: 'produce', tier: 3, q: esc(ch.prompt), prompt: ch.prompt, req: ch.req, min: ch.min, secs: ch.secs, timed: kind === 'challenge' }; }

/* ---------- análise de texto offline (heurística transparente) ---------- */
const ERROR_RULES = [
  [/\bI am agree\b/i, 'I agree', 'In English "agree" is a verb: no "to be".', 'literal-translation'],
  [/\bI'm agree\b/i, "I agree", 'In English "agree" is a verb: no "to be".', 'literal-translation'],
  [/\bmake(s|ing)? a travel\b/i, 'take a trip', 'Collocation: take a trip / go on a trip.', 'collocation'],
  [/\bI have (\d+|\w+teen|twenty|thirty|forty) years\b(?!\s+(old|ago))/i, "I'm … years old / I've been … for … years", 'Age uses "to be" (I am 30). For duration use present perfect (continuous).', 'present-perfect'],
  [/\b(since|from)\s+\d+\s+(years|months|days|weeks|hours)\b/i, 'for + period of time', 'Use "for" with a period (for 10 years); "since" needs a starting point (since 2015).', 'present-perfect'],
  [/\bdepends? of\b/i, 'depend on', 'Preposition: depend ON.', 'preposition'],
  [/\b(did|didn't|don't|doesn't) (\w+)ed\b/i, 'base verb after did/didn\'t/don\'t', 'After did/does/do the verb stays in base form.', 'agreement'],
  [/\b(he|she|it) (don't|do not)\b/i, "doesn't", 'Third person singular uses doesn\'t.', 'agreement'],
  [/\bmore (better|easier|cheaper|bigger|faster|worse)\b/i, 'better / easier / …', 'Do not use "more" with -er comparatives.', 'comparatives'],
  [/\bin (the )?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i, 'on + day', 'Days use "on": on Monday.', 'preposition'],
  [/\bI will to\b/i, 'I will + base verb', 'No "to" after will.', 'modals'],
  [/\b(peoples|informations|advices|equipments|furnitures|knowledges|researches)\b/i, 'uncountable noun', 'These nouns are uncountable: no plural -s.', 'uncountable'],
  [/\bexplain me\b/i, 'explain to me', 'Explain something TO someone.', 'preposition'],
  [/\bdiscuss about\b/i, 'discuss (it)', '"Discuss" does not take "about".', 'preposition'],
  [/\bmarried with\b/i, 'married to', 'Preposition: married TO.', 'preposition'],
  [/\blisten (the|a|my|his|her|this|that)\b/i, 'listen to', 'Preposition: listen TO.', 'preposition'],
  [/\bwhen I will\b/i, 'when I + present simple', 'After "when/if/as soon as" use present, not will.', 'conditional'],
  [/\bif I would\b/i, 'if I + past simple', 'No "would" in the if-clause.', 'conditional'],
  [/\bI very like\b/i, 'I really like / I like … very much', '"Very" does not modify verbs.', 'word-order'],
  [/\b(they|we|you|I) gonna\b/i, "going to (with 'be')", 'Missing "be": we\'re going to… ("gonna" is informal).', 'agreement'],
  [/\bI have (\w+ )?(\d+) years (working|living|studying)\b/i, "I've been working … for … years", 'Use present perfect continuous for an activity that started in the past and continues now.', 'present-perfect'],
  [/\bsince (\d+) (years|months)\b/i, 'for', 'since + point in time; for + duration.', 'present-perfect'],
  [/\bmake (a )?(shower|homework|exercise)\b/i, 'take a shower / do homework / do exercise', 'Collocations: take a shower, do homework.', 'collocation'],
  [/\bactually\b.*\b(currently|at the moment)\b/i, 'currently', '"Actually" means "in fact", not "currently".', 'false-friend'],
  [/\bI am (living|working|studying) (here )?since\b/i, "I've been living … since", 'Use present perfect (continuous) with since.', 'present-perfect'],
  [/\bdiscuss(ed|es|ing)? about\b/i, 'discuss (it)', '"Discuss" does not take "about".', 'preposition'],
  [/\bsucceed(ed|s)? to \w+/i, 'succeed in + -ing', 'Succeed IN doing something.', 'gerund-infinitive'],
  [/\bdespite of\b/i, 'despite / in spite of', 'Say "despite" or "in spite of", never "despite of".', 'connectors'],
  [/\b(me and my \w+|me and \w+) (\w+ )?(discussed|went|did|talked|are|were|have|had|will|work)\b/i, 'My colleague and I …', 'Use "I" as a subject: "My colleague and I discussed…".', 'agreement'],
  [/\b(yesterday|last (night|week|month|year|summer|weekend)|\w+ (days|weeks|months|years) ago)\b[^.?!]*\bI (go|eat|see|make|do|take|come|get|buy|meet|say|have)\b/i, 'past simple', 'Use the past simple with finished-time words (yesterday, last week, ago).', 'past-simple'],
  [/\bexplain (him|her|us|them)\b/i, 'explain to + person', 'Explain something TO someone.', 'preposition'],
  [/(?<![A-Za-z])(english|portuguese|spanish|french|german|brazilian|american)\b/, 'capital letter', 'Languages and nationalities start with a capital letter: English, Portuguese.', 'capitalization'],
  [/\bpeople (is|was)\b/i, 'people are / were', '"People" is plural.', 'agreement'],
  [/\b(he|she|it) have\b/i, 'has', 'Third person singular: he/she/it has.', 'agreement'],
  [/\b(they|we|you|I) (doesn't|does not)\b/i, "don't", 'Use don\'t / do not with I, you, we and they.', 'agreement'],
  [/\ban (university|european|one|useful|unit|usual)\b/i, 'a + consonant sound', 'Use "a" before the /j/ or /w/ sound: a university.', 'article'],
  [/\ba (hour|honest|honor)\b/i, 'an hour / an honest', 'Use "an" before a silent h.', 'article'],
  [/\bin the other hand\b/i, 'on the other hand', 'Fixed phrase: ON the other hand.', 'collocation'],
  [/\b(enjoy|avoid|finish|suggest|mind|keep|consider|practice) to \w+/i, 'verb + -ing', 'These verbs take the -ing form, not "to".', 'gerund-infinitive'],
  [/\blook forward to (see|hear|meet|work|talk|speak|have|do)\b/i, 'look forward to + -ing', 'After "look forward to" use -ing.', 'gerund-infinitive'],
  [/\b(must|should|can|could|will|would|might|may) to \w+/i, 'modal + base verb', 'No "to" after modal verbs.', 'modals'],
  [/\bmore (easy|good|bad|cheap|fast|big|small|nice|hard)\b/i, '-er form', 'Use easier / better / cheaper… (not "more" + short adjective).', 'comparatives'],
  [/\bsuggest (me|him|her|us|them) to\b/i, 'suggest (that) …', '"Suggest" does not take "someone to do".', 'gerund-infinitive'],
  [/\bhave (went|did|saw|ate|took|came|wrote)\b/i, 'past participle', 'After have/has use the past participle (gone, done, seen, eaten…).', 'present-perfect'],
  [/\b(importants|difficults|bads)\b/i, 'adjectives have no plural -s', 'Adjectives do not take -s in English.', 'agreement']
];
const SUBORD = /\b(although|though|even though|while|whereas|which|who|whose|that|because|since|as|if|when|unless|despite|so that|in order to|after|before|until)\b/gi;
let _connRe = null, _b2set = null;
function connRegex() {
  if (_connRe) return _connRe;
  const list = []; CONTENT.con.cats.forEach(c => c.items.forEach(i => list.push({ c: i.c.toLowerCase(), cat: c.id })));
  ['because', 'but', 'so', 'and', 'then', 'also', 'if'].forEach(x => { if (!list.find(l => l.c === x)) list.push({ c: x, cat: 'basic' }); });
  _connRe = list.sort((a, b) => b.c.length - a.c.length).map(l => ({ ...l, re: new RegExp('\\b' + l.c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+') + '\\b', 'i') }));
  return _connRe;
}
function b2Set() {
  if (_b2set) return _b2set; _b2set = new Set();
  CONTENT.words.forEach(w => { if (lvIdx(w.lvl) >= 4) { _b2set.add(w.w.toLowerCase()); tokens(w.form).forEach(t => _b2set.add(t)); } });
  CONTENT.phr.forEach(p => { if (lvIdx(p.lvl) >= 3) _b2set.add(norm(p.form)); });
  return _b2set;
}
function analyzeText(text, ctx = {}) {
  const t = String(text || '').trim();
  const sents = t.split(/(?<=[.!?])\s+|\n+/).map(s => s.trim()).filter(Boolean);
  const toks = tokens(t); const nW = toks.length; const nS = Math.max(1, sents.length);
  const avgLen = nW / nS;
  const uniq = nW ? new Set(toks).size / nW : 0;
  const lower = t.toLowerCase();
  const conns = []; const connDistinct = new Set();
  connRegex().forEach(l => { const m = lower.match(new RegExp(l.re.source, 'gi')); if (m && !['and', 'so', 'then', 'also', 'if'].includes(l.c) || (m && ['so', 'also'].includes(l.c) && false)) { conns.push({ c: l.c, n: m.length, cat: l.cat }); if (l.cat !== 'basic') connDistinct.add(l.c); else if (['because', 'but'].includes(l.c)) connDistinct.add(l.c); } });
  const cnt = w => (lower.match(new RegExp('\\b' + w + '\\b', 'g')) || []).length;
  const overuse = { because: cnt('because'), but: cnt('but'), and: cnt('and'), so: cnt('so') };
  const freq = {}; toks.filter(w => w.length > 3 && !['that', 'this', 'with', 'have', 'from', 'they', 'were', 'what', 'when', 'will', 'would', 'there', 'their', 'about', 'which'].includes(w)).forEach(w => freq[w] = (freq[w] || 0) + 1);
  const repeats = Object.keys(freq).filter(w => freq[w] >= 3);
  const errors = []; ERROR_RULES.forEach(([re, good, why, tag]) => { const m = t.match(re); if (m) errors.push({ bad: m[0], good, why, tag }); });
  const seenB = new Set(), b2 = []; const B = b2Set();
  toks.forEach(w => { if (B.has(w) && !seenB.has(w)) { seenB.add(w); b2.push(w); } });
  Object.keys(B).length; B.forEach(p => { if (p.includes(' ') && lower.includes(p) && !seenB.has(p)) { seenB.add(p); b2.push(p); } });
  const sub = (t.match(SUBORD) || []).length;
  let L = avgLen < 7 ? 1.9 : avgLen < 10 ? 2.6 : avgLen < 14 ? 3.4 : avgLen < 18 ? 4.1 : 4.5;
  L += Math.min(.7, connDistinct.size * .14) + Math.min(.6, b2.length * .12) + Math.min(.4, sub / nS * .25) - errors.length * .22;
  if (nW < 12) L = Math.min(L, 2.8);
  const denseConn = conns.filter(c => c.cat !== 'basic').reduce((n, c) => n + c.n, 0);
  const stuffed = nW < 80 && denseConn >= 5 && denseConn / nS > 2.2;
  if (stuffed) L = Math.min(L, 2.6);
  L = Math.min(L, nW >= 120 ? 5.0 : 4.6); // sem checagem profunda (online/IA) a estimativa offline não passa de B2+
  L = clamp(L, 1, 5.5);
  const complexity = clamp(Math.round(30 + sub / nS * 28 + Math.min(30, avgLen * 1.6)), 5, 100);
  const sc = {
    grammar: clamp(Math.round(100 - errors.length * 13 - (nW < 8 ? 10 : 0)), 20, 100),
    vocabulary: clamp(Math.round(50 + b2.length * 9 + uniq * 20 - repeats.length * 6), 20, 100),
    naturalness: clamp(Math.round(92 - errors.filter(e => ['literal-translation', 'collocation', 'false-friend'].includes(e.tag)).length * 14 - errors.length * 4 - (overuse.because >= 3 ? 8 : 0)), 20, 100),
    clarity: clamp(Math.round(96 - (avgLen > 28 ? 22 : 0) - (avgLen < 5 ? 18 : 0) - repeats.length * 3), 25, 100),
    complexity,
    connectors: clamp(Math.round(30 + connDistinct.size * 14 - (overuse.because + overuse.but >= 4 ? 12 : 0)), 10, stuffed ? 40 : 100)
  };
  const sug = [];
  if (overuse.because >= 2) sug.push({ instead: 'because', try: ['since', 'as', 'due to', 'as a result of'] });
  if (overuse.but >= 2) sug.push({ instead: 'but', try: ['however', 'although', 'whereas', 'nevertheless'] });
  if (overuse.and >= 4) sug.push({ instead: 'and', try: ['moreover', 'in addition', 'as well as'] });
  if (overuse.so >= 2) sug.push({ instead: 'so', try: ['therefore', 'as a result', 'consequently'] });
  if (stuffed) sug.push({ tip: 'Many connectors in a row do not make a text complex: every connector needs a full clause around it.' });
  if (avgLen < 9 && nS >= 3) sug.push({ tip: 'Your sentences are short. Combine two of them with although / which / while.' });
  if (!b2.length && nW >= 25) sug.push({ tip: 'No B2 vocabulary detected. Try to use 2–3 words you studied recently.' });
  repeats.slice(0, 2).forEach(r => sug.push({ tip: `You repeated "${r}" ${freq[r]} times. Use a synonym.` }));
  return {
    words: nW, sentences: nS, avgLen: Math.round(avgLen * 10) / 10, uniq: Math.round(uniq * 100) / 100, connectors: conns, connDistinct: connDistinct.size,
    overuse, repeats, errors, b2words: b2, scores: sc, levelIdx: L, cefr: lvLabel(L), suggestions: sug, src: ctx.src || 'write', at: Date.now(), chars: t.length
  };
}
function goalCheck(goal, text, an) {
  const g = goal.toLowerCase(), t = text.toLowerCase();
  const m = g.match(/:\s*(.+)$/); const words = m ? m[1].split(/[\/,]| or /).map(x => x.trim()).filter(Boolean) : [];
  const probe = id => GPROBE[id] && GPROBE[id].test(text);
  if (/second conditional/.test(g)) return probe('second-conditional');
  if (/third conditional/.test(g)) return probe('third-conditional');
  if (/first conditional/.test(g)) return probe('first-conditional');
  if (/mixed conditional/.test(g)) return probe('mixed-conditionals');
  if (/present perfect continuous/.test(g)) return probe('present-perfect-continuous');
  if (/present perfect/.test(g)) return probe('present-perfect');
  if (/past perfect/.test(g)) return probe('past-perfect');
  if (/passive/.test(g)) return probe('passive-voice');
  if (/reported/.test(g)) return probe('reported-speech');
  if (/relative clause/.test(g)) return probe('relative-clauses');
  if (/modal.*(past|deduction)|must have|might have/.test(g)) return probe('modals-advanced');
  if (/past tense|past simple/.test(g)) return /\b(was|were|had|did|went|\w+ed)\b/i.test(text);
  if (/reason|because|since/.test(g) && !words.length) return /\b(because|since|as|due to|so that)\b/i.test(text);
  if (words.length) return words.some(w => new RegExp('\\b' + w.replace(/ /g, '\\s+') + '\\b', 'i').test(text));
  if (/connector|linking/.test(g)) return an.connDistinct >= 2;
  if (/opinion|think|believe/.test(g)) return /\b(i think|i believe|in my opinion|i feel|i'd say)\b/i.test(text);
  if (/example/.test(g)) return /\b(for example|for instance|such as|like)\b/i.test(text);
  return null;
}

/* ---------- caderno de erros (Error Memory) ---------- */
function recordMistake(S, m) {
  const key = (m.cid || '') + '|' + (m.ref || '') + '|' + norm(m.good || '');
  let r = S.mist.find(x => x.key === key);
  const now = Date.now();
  if (r) { r.count++; r.last = now; r.m = Math.max(0, r.m - .25); r.next = now + DAY; r.yours = m.yours || r.yours; r.S = 1.5; }
  else { r = { id: 'm' + now + Math.floor(rnd() * 999), key, cid: m.cid, ref: m.ref, exKey: m.exKey, kind: m.kind, tag: m.tag || m.kind || 'misc', q: m.q || '', yours: m.yours || '', good: m.good || '', why: m.why || '', count: 1, last: now, first: now, m: 0, S: 1.5, next: now + DAY }; S.mist.push(r); }
  if (S.mist.length > 400) S.mist = S.mist.sort((a, b) => b.last - a.last).slice(0, 400);
  return r;
}
function repairMistake(S, r, ok) {
  const now = Date.now();
  if (ok) { r.m = Math.min(1, r.m + .34); r.S = Math.min(120, r.S * 2.2); } else { r.m = Math.max(0, r.m - .2); r.S = 1.5; r.count++; }
  r.last = now; r.next = now + r.S * RETENTION_K * DAY * 3;
}
const mistakeDue = (S, now = Date.now()) => S.mist.filter(r => r.next <= now && r.m < .85).sort((a, b) => a.next - b.next);
function errorPatterns(S) {
  const by = {}; S.mist.forEach(m => { by[m.tag] = (by[m.tag] || 0) + m.count; });
  return Object.keys(by).map(t => ({ tag: t, n: by[t] })).sort((a, b) => b.n - a.n);
}
const TAG_NAME = { 'present-perfect': 'Present Perfect', preposition: 'Prepositions (in/on/at…)', article: 'Articles', 'literal-translation': 'Literal translations from Portuguese', collocation: 'Collocations', agreement: 'Subject–verb agreement', uncountable: 'Uncountable nouns', conditional: 'Conditionals', comparatives: 'Comparatives', modals: 'Modal verbs', connectors: 'Connectors', 'word-order': 'Word order', 'false-friend': 'False friends' };
const tagName = t => t === 'class' ? 'From my teacher' : TAG_NAME[t] || (IDX.gr[t] ? IDX.gr[t].name : t.replace(/^natural-/, 'Natural: ').replace(/-/g, ' '));

/* ---------- construção de item a partir de um conceito ---------- */
function buildFor(S, cid, tierOverride) {
  const c = S.c[cid]; const tier = tierOverride != null ? tierOverride : (c ? Math.max(0, c.tier - scaf(S)) : 0);
  const [pre, ...rest] = cid.split(':'); const id = rest.join(':');
  if (pre === 'w') { const w = IDX.words[id]; return w ? wordItem(S, w, tier) : null; }
  if (pre === 'p') { const p = IDX.phr[id]; return p ? phrItem(S, p, tier) : null; }
  if (pre === 'g') { const g = IDX.gr[id]; return g ? gramItem(S, g, tierOverride) : null; }
  if (pre === 'c') {
    const items = CONTENT.con.items.filter(i => i.cat === id);
    if (!items.length) return null;
    const A = overallA(S) + .3 + diffBias(S);
    const it = items.sort((a, b) => (isRecent(S, a.id) - isRecent(S, b.id)) * 5 + Math.abs(lvIdx(a.lvl) - A) - Math.abs(lvIdx(b.lvl) - A) + (rnd() - .5))[0]; markPlanned(it.id);
    return connItem(S, it, clamp(tier, 1, 3));
  }
  if (pre === 'n') {
    const items = CONTENT.nat.filter(n => natTag(n) === id); if (!items.length) return null;
    const A = overallA(S) + .3 + diffBias(S);
    const it = items.sort((a, b) => (isRecent(S, a.id) - isRecent(S, b.id)) * 5 + Math.abs(lvIdx(a.lvl) - A) - Math.abs(lvIdx(b.lvl) - A) + (rnd() - .5))[0]; markPlanned(it.id);
    return natItem(S, it, tier);
  }
  return null;
}
/* item "parecido" após um erro (Error Recovery) */
function similarItem(S, item) {
  if (!item.cid) return null;
  const t = Math.min(item.tier || 0, 2);
  const cid = item.cid;
  if (cid.startsWith('g:')) { const g = IDX.gr[cid.slice(2)]; const x = g && gramItem(S, g, t); return x && x.exKey !== item.exKey ? x : null; }
  if (cid.startsWith('c:') || cid.startsWith('n:')) { const x = buildFor(S, cid, t); return x && x.ref !== item.ref ? x : null; }
  return null;
}

/* ---------- conceitos sugeridos ---------- */
function newWordCandidates(S, n) {
  const A = overallA(S) + .4 + diffBias(S); const tops = new Set(); (S.profile.topics || []).forEach(t => (TOPIC_MAP[t] || [t]).forEach(x => tops.add(x)));
  return CONTENT.words.filter(w => !S.c['w:' + w.id]).map(w => ({ w, s: Math.abs(lvIdx(w.lvl) - A) - ((w.topics || []).some(t => tops.has(t)) ? .7 : 0) + rnd() * .8 }))
    .sort((a, b) => a.s - b.s).slice(0, n).map(x => x.w);
}
function newPhrCandidates(S, n) {
  const A = overallA(S) + .2 + diffBias(S);
  return CONTENT.phr.filter(p => !S.c['p:' + p.id]).map(p => ({ p, s: Math.abs(lvIdx(p.lvl) - A) + rnd() * .8 })).sort((a, b) => a.s - b.s).slice(0, n).map(x => x.p);
}
const ago = t => { if (!t) return 'never'; const d = Math.floor((Date.now() - t) / DAY); return d <= 0 ? 'today' : d === 1 ? 'yesterday' : d + ' days ago'; };
const daysSince = t => t ? (Date.now() - t) / DAY : 99;
const conceptName = cid => {
  const [pre, ...r] = cid.split(':'); const id = r.join(':');
  if (pre === 'w') return IDX.words[id] ? IDX.words[id].w : id;
  if (pre === 'p') return IDX.phr[id] ? IDX.phr[id].v + ' ' + IDX.phr[id].p : id;
  if (pre === 'g') return IDX.gr[id] ? IDX.gr[id].name : id;
  if (pre === 'c') { const c = CONTENT.con.cats.find(x => x.id === id); return c ? 'Connectors: ' + c.name : id; }
  if (pre === 'n') return 'Natural English: ' + id.replace(/-/g, ' ');
  return id;
};

/* ---------- PLANEJADOR DA SESSÃO DIÁRIA ---------- */
function withReason(it, reason) { if (it) it.reason = reason; return it; }
function planSession(S, minutes, opts = {}) {
  const now = Date.now(), M = minutes || S.profile.minutes || 10;
  const budget = M * 60; const A = overallA(S);
  const dueW = dueList(S, 'w:', now), dueP = dueList(S, 'p:', now), dueG = dueList(S, 'g:', now), dueC = dueList(S, 'c:', now), dueN = dueList(S, 'n:', now);
  const dueMist = mistakeDue(S, now);
  const dSpeak = daysSince(S.lastSpeak), dList = daysSince(S.lastListen), dWrite = daysSince(S.lastWrite);
  // pesos dos blocos, influenciados por fraquezas e recência
  const W = { vocab: .26, grammar: .22, listening: .17, speaking: .2, challenge: .15 };
  W.listening += clamp((abilityFor(S, 'reading') - abilityFor(S, 'listening')) * .15, 0, .15) + Math.min(.08, dList * .02);
  if (S.profile.teacher) W.speaking *= .4; else W.speaking += Math.min(.2, dSpeak * .04); // com aulas semanais, a fala fica com o professor
  if (dueW.length + dueP.length > 10) W.vocab += .08;
  if (M <= 5) { W.listening = dList > 3 ? .15 : 0; W.speaking = dSpeak > 3 ? .2 : 0; }
  if (M >= 15) { W.writing = .1 + Math.min(.1, dWrite * .02); }
  { // o plano se adapta ao seu requisito B2 mais atrasado: mais vocabulário quando ele é o gargalo, menos gramática quando ela já está forte
    const rq = b2Requirements(S).list, by = {}; rq.forEach(r => by[r.id] = r); const vv = Math.min(by['vocab-b2'].v, by['phr'].v);
    W.vocab += clamp((.55 - vv) * .35, 0, .14); W.grammar -= clamp((by['gram-b2'].v - .55) * .3, 0, .1);
  }
  const tw = Object.values(W).reduce((a, b) => a + b, 0);
  const used = new Set(); const blocks = [];
  const take = (cid, tierOver) => { if (used.has(cid)) return null; const it = buildFor(S, cid, tierOver); if (it) used.add(cid); return it; };
  const secs = it => EST[it.type === 'mcq' && it.wtype === 'cloze' ? 'cloze' : (it.type === 'listen' && it.mode === 'read') ? 'read' : it.type] || 25;

  // 1) correção de erros antigos (sempre que houver algo vencido)
  const repairs = [];
  dueMist.slice(0, M >= 10 ? 2 : 1).forEach(r => {
    let it = null;
    if (r.cid) it = r.cid.startsWith('g:') || r.cid.startsWith('c:') || r.cid.startsWith('n:') ? buildFor(S, r.cid, Math.min(2, (S.c[r.cid] || { tier: 0 }).tier)) : null;
    if (it) { it.mistakeId = r.id; repairs.push(withReason(it, `Correction: you missed this ${ago(r.last)} (${r.count}×).`)); }
  });

  // 2) vocabulário: revisões vencidas → palavras novas
  let nVocab = Math.max(2, Math.round(budget * W.vocab / 24));
  const vocabItems = []; const dueMix = []; const mx = Math.max(dueW.length, dueP.length);
  for (let i = 0; i < mx; i++) { if (dueW[i]) dueMix.push(dueW[i]); if (dueP[i]) dueMix.push(dueP[i]); }
  if (dueMix.length > 15) nVocab += 1;
  const baseNew = clamp(Math.round(M / 3), 1, 6); const maxNew = dueMix.length > 40 ? 1 : dueMix.length > 20 ? Math.max(1, Math.round(baseNew * .6)) : baseNew;
  const reviewCap = Math.max(2, nVocab - maxNew);
  // revisões pedem produção cedo: depois de 2 contatos com a palavra, alterna completar (digitar) e escolher no contexto
  const vocabTier = cid => { const c = S.c[cid]; if (!c) return undefined; const base = Math.max(0, c.tier - scaf(S)); if (scaf(S) || c.seen < 2 || c.m < .3) return base; return Math.min(2, Math.max(base, c.seen % 2 ? 1 : 2)); };
  dueMix.slice(0, reviewCap).forEach(cid => { const it = take(cid, vocabTier(cid)); if (it) vocabItems.push(withReason(it, `Due for review: last seen ${ago(S.c[cid].last)}. Forgetting risk ${Math.round(forgetP(S.c[cid], now) * 100)}%.`)); });
  if (vocabItems.length < nVocab) {
    const nw = (M >= 8 && rnd() < .6 ? newPhrCandidates(S, 1) : []).concat(newWordCandidates(S, maxNew));
    for (const x of nw) { if (vocabItems.length >= nVocab) break; const cid = x.v ? 'p:' + x.id : 'w:' + x.id; const it = take(cid, 0); if (it) vocabItems.push(withReason(it, `New ${x.v ? 'phrasal verb' : 'word'} at your level${(x.topics || []).length ? ' · ' + x.topics[0] : ''}.`)); }
  }
  // 3) gramática: conceito mais fraco / vencido (+ um segundo se houver tempo)
  const nGram = Math.max(2, Math.round(budget * W.grammar / 28));
  const gramItems = [];
  const gTopics = pickGrammar(S, M >= 12 ? 2 : 1);
  gTopics.forEach((g, gi) => {
    const c = S.c['g:' + g.id]; const share = gi === 0 ? Math.ceil(nGram * (gTopics.length > 1 ? .6 : 1)) : Math.floor(nGram * .4);
    for (let i = 0; i < share; i++) {
      const tier = c ? clamp(c.tier + (i > 1 ? 1 : 0) - scaf(S), 0, 3) : Math.min(i, 1);
      const it = gramItem(S, g, tier); if (!it) continue;
      const wk = c ? Math.round(mEff(c, now) * 100) : 0; const errs = errorCount(S, g.id);
      gramItems.push(withReason(it, errs >= 2 ? `You struggled with ${g.name} ${errs} times recently.` : c && c.seen ? `${g.name} is at ${wk}% mastery — one of your weakest unlocked topics.` : `${g.name} is the next topic in your B1 → B2 plan.`));
    }
  });
  // 4) listening
  const lisItems = [];
  if (W.listening > .02 && CONTENT.lis.length) {
    const target = A + .2 + diffBias(S);
    const l = CONTENT.lis.filter(x => Date.now() - (S.seenEx[x.id] || 0) > 5 * DAY).sort((a, b) => Math.abs(lvIdx(a.lvl) - target) - Math.abs(lvIdx(b.lvl) - target) + (rnd() - .5))[0] || pick(CONTENT.lis);
    lisItems.push(withReason(listenItem(S, l), abilityFor(S, 'listening') < abilityFor(S, 'reading') - .2 ? `Listening (${lvLabel(abilityFor(S, 'listening'))}) is behind your reading (${lvLabel(abilityFor(S, 'reading'))}).` : `Listening practice · last session ${ago(S.lastListen)}.`));
  }
  // 5) speaking
  const spkItems = [];
  if (W.speaking > .02 && CONTENT.spk.length && (!S.profile.teacher || dSpeak >= 3)) {
    const target = A + .3;
    const weakConn = groupMastery(S, [...new Set(CONTENT.con.items.map(i => 'c:' + i.cat))]) < .5;
    const p = CONTENT.spk.filter(x => Date.now() - (S.seenEx[x.id] || 0) > 6 * DAY).sort((a, b) => (Math.abs(lvIdx(a.lvl) - target) - Math.abs(lvIdx(b.lvl) - target)) + (weakConn ? (/connector|however|although/i.test(b.goals.join(' ')) - /connector|however|although/i.test(a.goals.join(' '))) * .6 : 0) + (rnd() - .5))[0] || pick(CONTENT.spk);
    spkItems.push(withReason(speakItem(S, p), S.lastSpeak ? `You haven't practiced speaking for ${Math.floor(dSpeak)} day${Math.floor(dSpeak) === 1 ? '' : 's'}.` : 'Speaking is where B1 → B2 is won: spontaneous answers.'));
  }
  // 6) escrita (sessões longas)
  const readItems = []; if (M >= 8 && daysSince(S.lastRead) >= 3 && (CONTENT.rd || []).length) { const r = CONTENT.rd.filter(x => Date.now() - (S.seenEx[x.id] || 0) > 20 * DAY).sort((a, b) => Math.abs(lvIdx(a.lvl) - A - .3) - Math.abs(lvIdx(b.lvl) - A - .3) + rnd() - .5)[0]; if (r) readItems.push(withReason(readItem(S, r), S.lastRead ? `Reading practice · last time ${ago(S.lastRead)}.` : 'Reading builds vocabulary and inference. Tap any word to look it up.')); }
  const wriItems = [];
  if (W.writing || (M >= 8 && dWrite >= 4)) { const ch = CHALLENGES.filter(c => Date.now() - (S.seenEx[c.id] || 0) > 5 * DAY).sort((a, b) => Math.abs(lvIdx(a.lvl) - A - .3) - Math.abs(lvIdx(b.lvl) - A - .3) + rnd() - .5)[0]; if (ch) wriItems.push(withReason(writeItem(S, ch), `Writing practice · last time ${ago(S.lastWrite)}.`)); }
  // 7) mini desafio: intercala natural / conectores / phrasal / palavra antiga
  const chItems = [];
  const nCh = Math.max(2, Math.round(budget * W.challenge / 28));
  const pool = [];
  dueN.slice(0, 2).forEach(c => pool.push([c, 'Mixed challenge: natural phrasing due for review.']));
  dueC.slice(0, 2).forEach(c => pool.push([c, 'Mixed challenge: connectors due for review.']));
  dueP.slice(0, 2).forEach(c => pool.push([c, 'Mixed challenge: phrasal verb due for review.']));
  const natKeys = [...new Set(CONTENT.nat.map(n => 'n:' + natTag(n)))].sort((a, b) => mEff(S.c[a]) - mEff(S.c[b]));
  const conKeys = [...new Set(CONTENT.con.items.map(i => 'c:' + i.cat))].sort((a, b) => mEff(S.c[a]) - mEff(S.c[b]));
  pool.push([natKeys[0], 'Mixed challenge: natural English is one of your weaker areas.']); pool.push([conKeys[0], 'Mixed challenge: connectors are essential to leave B1.']);
  pool.push([natKeys[1], 'Mixed challenge: interleaving old and new content.']); pool.push([conKeys[1], 'Mixed challenge: interleaving old and new content.']);
  for (const [cid, why] of shuffle(pool)) { if (chItems.length >= nCh) break; if (!cid) continue; const c = S.c[cid]; const it = take(cid, c ? Math.min(c.tier, 2) : (cid.startsWith('n:') ? 0 : 1)); if (it) chItems.push(withReason(it, why)); }

  // preenche o tempo disponível (sessões longas): mais gramática, vocabulário, desafios e, se couber, outro listening/speaking
  const sumEst = () => [vocabItems, gramItems, lisItems, readItems, spkItems, wriItems, chItems, repairs].reduce((s, a) => s + a.reduce((x, i) => x + secs(i), 0), 0);
  { let total0 = sumEst(), k = 0, fails = 0; const rot = ['grammar', 'vocab', 'challenge', 'grammar', 'vocab', 'listening', 'challenge', 'speaking'];
    const gp = pickGrammar(S, 4); const natKeys2 = natKeys.concat(natKeys), conKeys2 = conKeys.concat(conKeys);
    while (total0 < budget * .92 && k < 80 && fails < 8) {
      const kind = rot[k++ % rot.length]; let it = null;
      if (kind === 'grammar' && gp.length) { const g = gp[Math.floor(k / rot.length * 2) % gp.length]; const c = S.c['g:' + g.id]; it = gramItem(S, g, c ? clamp(c.tier + (rnd() < .5 ? 1 : 0) - scaf(S), 0, 3) : 1); if (it) { withReason(it, `More practice on ${g.name}.`); gramItems.push(it); } }
      else if (kind === 'vocab') { const dueRest = dueMix.find(c => !used.has(c)); let cand = dueRest; if (!cand) { const nw = newWordCandidates(S, 12).find(w => !used.has('w:' + w.id)); if (nw) cand = 'w:' + nw.id; } if (cand) { it = take(cand, dueRest ? undefined : 0); if (it) vocabItems.push(withReason(it, dueRest ? 'Due for review.' : 'New word at your level.')); } }
      else if (kind === 'challenge') { const key = (k % 2 ? natKeys2 : conKeys2)[Math.floor(k / 2) % natKeys2.length]; const c = S.c[key]; it = key && buildFor(S, key, c ? Math.min(c.tier, 2) : key[0] === 'n' ? 0 : 1); if (it) chItems.push(withReason(it, 'Mixed challenge: interleaving old and new content.')); }
      else if (kind === 'listening' && M >= 15 && lisItems.length < 2 && CONTENT.lis.length) { const l = CONTENT.lis.filter(x => !lisItems.some(i => i.ref === x.id) && Date.now() - (S.seenEx[x.id] || 0) > 5 * DAY).sort((a, b) => Math.abs(lvIdx(a.lvl) - A - .3) - Math.abs(lvIdx(b.lvl) - A - .3) + rnd() - .5)[0]; if (l) { it = listenItem(S, l); lisItems.push(withReason(it, 'Extra listening for a longer session.')); } }
      else if (kind === 'speaking' && !S.profile.teacher && M >= 20 && spkItems.length < 2 && CONTENT.spk.length) { const p = CONTENT.spk.filter(x => !spkItems.some(i => i.ref === x.id) && Date.now() - (S.seenEx[x.id] || 0) > 6 * DAY).sort((a, b) => Math.abs(lvIdx(a.lvl) - A - .3) - Math.abs(lvIdx(b.lvl) - A - .3) + rnd() - .5)[0]; if (p) { it = speakItem(S, p); spkItems.push(withReason(it, 'Extra speaking for a longer session.')); } }
      if (it) { total0 += secs(it); fails = 0; } else fails++;
    } }
  const put = (key, label, icon, items) => { if (items.length) blocks.push({ key, label, icon, items, est: items.reduce((s, i) => s + secs(i), 0) }); };
  const warm = [];
  if (M >= 8 && vocabItems.length > 3) { const conf = i => S.c[i.cid] && S.c[i.cid].seen ? mEff(S.c[i.cid]) : 0; vocabItems.slice().sort((a, b) => conf(b) - conf(a)).slice(0, 2).filter(i => conf(i) >= .4).forEach(i => { vocabItems.splice(vocabItems.indexOf(i), 1); warm.push(i); }); }
  put('warm', 'Warm-up', 'zap', warm);
  put('vocab', 'Vocabulary recall', 'book-open', vocabItems);
  put('listen', 'Listening', 'headphones', lisItems);
  put('read', 'Reading', 'book', readItems);
  put('grammar', 'Grammar challenge', 'puzzle', gramItems);
  put('speak', 'Speaking', 'mic', spkItems);
  put('write', 'Writing', 'pen', wriItems);
  put('repair', 'Correction', 'wrench', repairs);
  put('challenge', 'Mini challenge', 'flame', chItems);
  // encaixa no tempo: remove itens do fim até caber (+15% de tolerância)
  let total = blocks.reduce((s, b) => s + b.est, 0);
  const trimOrder = ['challenge', 'vocab', 'grammar', 'warm'];
  let guard = 0;
  while (total > budget * 1.15 && guard++ < 40) {
    const b = trimOrder.map(k => blocks.find(x => x.key === k)).find(x => x && x.items.length > 1);
    if (!b) break; const it = b.items.pop(); b.est -= secs(it); total -= secs(it);
  }
  const items = []; blocks.forEach(b => b.items.forEach(i => { i.block = b.key; items.push(i); }));
  markIntros(S, items); total += items.filter(i => i.intro).length * 14;
  return { id: 's' + now, minutes: M, blocks, items, est: total, createdAt: now };
}

/* conceito novo (nunca visto): o 1º exercício vem precedido de um cartão que ENSINA o item */
function markIntros(S, items) {
  const done = new Set();
  items.forEach(i => { if ((i.kind === 'word' || i.kind === 'phr' || i.kind === 'gram') && i.cid && i.card && !(S.c[i.cid] && S.c[i.cid].seen) && !done.has(i.cid)) { i.intro = true; done.add(i.cid); } });
  return items;
}
/* sessões rápidas: vocabulário, gramática, fala, listening, surpresa, revisão */
function planQuick(S, mode, minutes) {
  const M = minutes || 5, now = Date.now(); const items = []; const used = new Set();
  const addC = (cid, why, t) => { if (!cid || used.has(cid)) return; const it = buildFor(S, cid, t); if (it) { used.add(cid); items.push(withReason(it, why)); } };
  const nItems = Math.max(2, Math.round(M * 60 / 24));
  if (mode === 'vocab') {
    const due = [...dueList(S, 'w:'), ...dueList(S, 'p:')]; due.slice(0, nItems).forEach(c => addC(c, `Due for review: last seen ${ago(S.c[c].last)}.`));
    newWordCandidates(S, nItems).forEach(w => { if (items.length < nItems) addC('w:' + w.id, 'New word at your level.', 0); });
  } else if (mode === 'grammar') {
    pickGrammar(S, 2).forEach((g, gi) => { const c = S.c['g:' + g.id]; for (let i = 0; i < Math.ceil(nItems / 2); i++) { const it = gramItem(S, g, c ? clamp(c.tier + (i > 1 ? 1 : 0), 0, 3) : Math.min(i, 1)); if (it) items.push(withReason(it, `${g.name}: weakest unlocked topic.`)); } });
  } else if (mode === 'speaking') {
    const p = CONTENT.spk.filter(x => Date.now() - (S.seenEx[x.id] || 0) > 3 * DAY).sort((a, b) => Math.abs(lvIdx(a.lvl) - overallA(S) - .3) - Math.abs(lvIdx(b.lvl) - overallA(S) - .3) + rnd() - .5)[0] || pick(CONTENT.spk);
    items.push(withReason(speakItem(S, p), 'Quick speaking practice.'));
  } else if (mode === 'listening') {
    const l = CONTENT.lis.sort((a, b) => Math.abs(lvIdx(a.lvl) - overallA(S) - .2) - Math.abs(lvIdx(b.lvl) - overallA(S) - .2) + rnd() - .5)[0]; items.push(withReason(listenItem(S, l), 'Quick listening practice.'));
  } else if (mode === 'review') {
    [...dueList(S, 'g:'), ...dueList(S, 'w:'), ...dueList(S, 'p:'), ...dueList(S, 'c:'), ...dueList(S, 'n:')].slice(0, 25).forEach(c => addC(c, `Review due: last seen ${ago(S.c[c].last)}.`, Math.min(S.c[c].tier, 2)));
    mistakeDue(S).slice(0, 4).forEach(r => { if (r.cid) { const it = buildFor(S, r.cid, 0); if (it && !items.some(x => x.cid === it.cid)) { it.mistakeId = r.id; items.push(withReason(it, `Correction: you missed this ${ago(r.last)}.`)); } } });
  } else { // surprise
    const s = planSession(S, M); return { ...s, quick: true };
  }
  markIntros(S, items);
  return { id: 'q' + now, minutes: M, quick: true, blocks: [{ key: 'q', label: mode === 'review' ? 'Reviews due' : 'Quick practice', icon: 'zap', items, est: items.reduce((s, i) => s + (EST[i.type] || 25), 0) }], items: items.map(i => (i.block = 'q', i)), est: 0 };
}
function planSpeedRound(S) {
  const keys = Object.keys(S.c).filter(k => /^[wpgcn]:/.test(k) && S.c[k].seen); const src = shuffle(keys).slice(0, 10);
  const items = []; src.forEach(cid => { const it = buildFor(S, cid, cid[0] === 'g' ? 0 : 0); if (it && it.type === 'mcq') { it.timer = 8; items.push(it); } });
  if (items.length < 10) { newWordCandidates(S, 10 - items.length).forEach(w => items.push({ ...wordItem(S, w, 1), timer: 8 })); }
  return { id: 'r' + Date.now(), minutes: 3, quick: true, speed: true, blocks: [{ key: 'q', label: 'Speed round', icon: 'zap', items, est: 80 }], items: items.map(i => (i.block = 'q', i)), est: 80 };
}
function planTopicTest(S, g) {
  const out = []; const exs = shuffle(g.exercises.map((e, i) => ({ e, i }))).slice(0, 6);
  exs.forEach(({ e, i }) => { const it = gramItem({ ...S, c: { ['g:' + g.id]: { tier: e.t === 'mcq' ? 0 : e.t === 'order' ? 1 : 2 } }, seenEx: {}, sk: S.sk, win: S.win, profile: S.profile, settings: S.settings }, g, e.t === 'mcq' ? 0 : e.t === 'order' ? 1 : 2); if (it) { it.cid = 'g:' + g.id; out.push(it); } });
  const seen = new Set(); const items = out.filter(i => { const k = i.exKey; if (seen.has(k)) return false; seen.add(k); return true; });
  items.forEach(i => { i.reason = 'Mini test for ' + g.name; i.block = 'q'; });
  return { id: 't' + Date.now(), minutes: 4, quick: true, test: true, blocks: [{ key: 'q', label: g.name + ' · mini test', icon: 'puzzle', items, est: 120 }], items, est: 120 };
}
