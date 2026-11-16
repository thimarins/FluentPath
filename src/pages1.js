/* ============================================================
   FLUENT PATH — PÁGINAS 1
   Home, Learn, Daily Session, Practice, Vocabulary, Phrasal verbs,
   Grammar (mapa + lab), Connectors, Sound Natural.
   ============================================================ */
const BLOCK_NAME = { read: 'Reading', warm: 'Warm-up', vocab: 'Vocabulary recall', listen: 'Listening', grammar: 'Grammar challenge', speak: 'Speaking', write: 'Writing', repair: 'Correction', challenge: 'Mini challenge' };
const fmtMin = s => Math.max(1, Math.round(s / 60));
/* Palavra do dia: relevante ao nível e aos temas do usuário, estável durante o dia */
function wordOfDay() {
  let h = 7; for (const ch of today()) h = (h * 31 + ch.charCodeAt(0)) | 0; const r = seeded(Math.abs(h) + 1);
  const A = overallA(S) + .4; const tops = new Set(); (S.profile.topics || []).forEach(t => (TOPIC_MAP[t] || [t]).forEach(x => tops.add(x)));
  const pool = CONTENT.words.filter(w => stOf('w:' + w.id) !== 'mastered').map(w => ({ w, s: Math.abs(lvIdx(w.lvl) - A) - ((w.topics || []).some(t => tops.has(t)) ? .7 : 0) + r() * .6 })).sort((a, b) => a.s - b.s);
  return pool[0] && pool[0].w;
}
function wotdCard() {
  const w = wordOfDay(); if (!w) return '';
  return `<div class="card click" data-a="card" data-t="word" data-id="${w.id}" style="margin-bottom:16px"><div class="row wrap"><div class="ico acc">${I('sparkles')}</div><div class="grow"><div class="tiny muted b" style="text-transform:uppercase;letter-spacing:.08em">Word of the day · picked for your level and interests</div><div class="row" style="gap:10px;margin-top:2px"><h3 style="font-size:1.4rem">${esc(w.w)}</h3>${lvTag(w.lvl)}<span class="muted small">${esc(w.ipa || '')}</span></div><div class="small" style="margin-top:2px">${esc(w.pt)} · ${esc(w.def)}</div><div class="small muted" style="margin-top:4px">“${esc(w.ex)}”</div></div>${sayBtn(w.w)}</div></div>`;
}
const phase = () => { const A = overallA(S); return A < 2.7 ? 0 : A < 3.3 ? 1 : A < 4 ? 2 : A < 4.6 ? 3 : 4; };

ACT.startDaily = () => startSession(todaysPlan());
ACT.reshuffle = () => { todaysPlan(true); render(); toast('New session built from your latest data.', 'shuffle'); };
ACT.quick = el => startQuick(el.dataset.m, +el.dataset.min || 5);
ACT.teach = () => teachMe();
ACT.speedround = () => startRunner(planSpeedRound(S), { kind: 'quick', again: () => ACT.speedround() });
ACT.setminutes = el => { S.profile.minutes = +el.dataset.min; save(); S.plan = null; render(); };
ACT.practiceGroup = el => practiceGroup(el.dataset.code);
function practiceGroup(code) {
  if (code.startsWith('g:')) return startConceptPractice(code);
  const mk = (cids, why) => { const items = []; cids.forEach(c => { const it = buildFor(S, c, Math.min(S.c[c] ? S.c[c].tier : 0, 2)); if (it) { it.block = 'q'; it.reason = why; items.push(it); } }); startRunner({ items, blocks: [{ key: 'q', label: 'Practice', items }], quick: true }, { kind: 'quick' }); };
  if (code === 'p*') { const ids = Object.keys(S.c).filter(k => k[0] === 'p').sort((a, b) => mEff(S.c[a]) - mEff(S.c[b])).slice(0, 6); if (ids.length < 6) newPhrCandidates(S, 6 - ids.length).forEach(p => ids.push('p:' + p.id)); return mk(ids, 'Phrasal verbs are one of your weaker areas.'); }
  if (code === 'c*') { const cats = [...new Set(CONTENT.con.items.map(i => 'c:' + i.cat))].sort((a, b) => mEff(S.c[a]) - mEff(S.c[b])); const ids = []; for (let i = 0; i < 6; i++) ids.push(cats[i % cats.length]); return mk(ids, 'Connectors are essential to move from B1 to B2.'); }
  if (code === 'n*') { const tags = [...new Set(CONTENT.nat.map(n => 'n:' + natTag(n)))].sort((a, b) => mEff(S.c[a]) - mEff(S.c[b])); const ids = []; for (let i = 0; i < 6; i++) ids.push(tags[i % tags.length]); return mk(ids, 'Naturalness is one of your weaker areas.'); }
  if (code === 'l*') return startQuick('listening', 3);
  if (code.startsWith('e:')) return nav('/mistakes');
}
const blockRow = b => `<div class="blk">${I(b.icon)}<span>${esc(b.label)}</span><span style="opacity:.75">${fmtMin(b.est)}′</span></div>`;

/* ---------------------- HOME ---------------------- */
route(/^\/home$/, () => {
  const h = new Date().getHours(); const greet = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  const plan = todaysPlan(); const prog = progressToTarget(S); const A = overallA(S); const lvl = overallLabel(S); const next = LV[Math.min(6, lvIdx(lvl) + 1)]; const capped = lvIdx(lvLabel(A)) > lvIdx(lvl); const bandP = clamp(A - (lvIdx(lvl) - .3), 0, 1);
  const dToday = S.days[today()] || { min: 0, n: 0 }; const goal = S.profile.minutes; const done = Math.round(dToday.min * 10) / 10;
  const due = dueCounts(); const wp = weakPoints(3); const ws = wordStats(S);
  const last14 = []; for (let i = 13; i >= 0; i--) { const d = S.days[dayKey(Date.now() - i * DAY)]; last14.push(d && d.n ? d.ok / d.n * 100 : null); }
  const pts = last14.filter(x => x != null);
  const mins14 = []; const labs = []; for (let i = 13; i >= 0; i--) { const t = Date.now() - i * DAY; const d = S.days[dayKey(t)]; mins14.push(d ? d.min : 0); labs.push(['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(t).getDay()]); }
  return `<div class="ph"><div><h1>${greet}, ${esc(S.profile.name || 'there')}.</h1><p>${due.total ? `You have <b>${due.total}</b> things ready to review. Your session already includes them.` : 'Your plan for today is ready. One tap and you are learning.'}</p></div></div>
  <div class="card hero" style="margin-bottom:16px"><div class="row wrap between hr" style="gap:18px"><div class="grow" style="min-width:260px"><div class="tiny" style="text-transform:uppercase;letter-spacing:.1em;opacity:.8;font-weight:700">Continue learning</div><h2 style="margin-top:6px">Today's session · ${plan.minutes} min</h2><p class="muted" style="margin-top:4px">Built for you from your mistakes, memory curve and goal of ${esc(S.profile.target)}.</p>
  <div class="mgoal"><div class="small" style="opacity:.85">Today: ${done} / ${goal} min</div><div class="bar" style="background:rgba(255,255,255,.22);margin-top:6px"><i style="width:${pct(done / goal)}%;background:#fff"></i></div></div><div class="blocks">${plan.blocks.map(blockRow).join('')}</div><div class="row wrap"><button class="btn white lg" data-a="startDaily">${I('play')} START TODAY'S SESSION — ${plan.minutes} MIN</button><button class="btn lg" style="background:rgba(255,255,255,.14);color:#fff;border-color:transparent" data-a="teach">${I('bulb')} Teach me something</button></div></div>
  <div class="ringbox" style="position:relative;z-index:1">${ring(clamp(done / goal, 0, 1), 118, 11, '#fff', `${done >= 10 ? Math.round(done) : done}<span style="font-size:.9rem;opacity:.8"> / ${goal}</span>`, 'min today')}</div></div></div>
  ${firstRunBanner()}<div class="grid g2" style="margin-bottom:16px">${questsCardHTML()}${levelCardHTML()}</div>
  <div class="grid g4" style="margin-bottom:16px">
    <div class="card stat"><div class="k">Current level</div><div class="v">${lvl}</div><div class="s">${capped ? 'Strong scores: master more ' + next + ' content to level up' : Math.round(bandP * 100) + '% of the way to ' + next}</div>${bar(capped ? .95 : bandP)}</div>
    <div class="card stat"><div class="k">Target · ${esc(S.profile.target)}</div><div class="v">${pct(prog)}%</div><div class="s">Progress to ${esc(S.profile.target)}</div>${bar(prog, 'acc')}</div>
    <div class="card stat"><div class="k">Weekly streak</div><div class="v" style="color:var(--acc)">${I('flame')} ${streak()} day${streak() === 1 ? '' : 's'}</div><div class="s">Best: ${bestStreak()} days</div></div>
    <div class="card stat"><div class="k">Words</div><div class="v">${ws.by.mastered}</div><div class="s">mastered · ${ws.by.learning + ws.by.familiar} learning${ws.by.forgotten ? ' · ' + ws.by.forgotten + ' fading' : ''}</div></div></div>
  <div style="margin-bottom:16px">${pathHTML()}</div>
  <div class="grid g21" style="margin-bottom:16px"><div class="stack">
    <div class="card"><div class="row between"><h3>Reviews due</h3><button class="btn sm primary" data-a="quick" data-m="review" data-min="${clamp(due.minutes, 3, 10)}" ${due.total ? '' : 'disabled'}>${I('refresh')} Review now</button></div>
      <div class="row wrap" style="gap:22px;margin-top:12px"><div><div class="stat"><div class="v">${due.w}</div></div><div class="small muted">words & phrasals</div></div><div><div class="stat"><div class="v">${due.g}</div></div><div class="small muted">grammar & connectors</div></div><div><div class="stat"><div class="v">${due.m}</div></div><div class="small muted">old mistakes</div></div><div><div class="stat"><div class="v">${due.sp}</div></div><div class="small muted">speaking challenge</div></div><div class="grow right small muted">≈ ${due.minutes} min${due.waiting ? " · +" + due.waiting + " waiting, a few each day" : ""}</div></div></div>
    <div class="card"><div class="row between"><h3>Recent progress</h3><span class="small muted">last 14 days</span></div><div class="grid g2 keep" style="margin-top:8px"><div><div class="small muted">Accuracy</div>${lineChart(pts.length ? pts : [], { h: 110, min: 40, max: 100 })}</div><div><div class="small muted">Minutes studied</div>${barChart(mins14, { h: 110, labels: labs, goal })}</div></div></div></div>
  <div class="card"><div class="row between"><h3>Weak points</h3><a class="small b" style="color:var(--pri)" href="#/progress">All</a></div>${wp.length ? `<div class="list" style="margin-top:6px">${wp.map(w => `<div class="it"><div class="grow"><div class="b small">${esc(w.name)}</div><div class="tiny muted">${esc(w.kind)}${w.n ? ' · ' + w.n + ' mistakes' : ''}</div>${bar(w.v, w.v < .4 ? 'bad' : 'acc')}</div><button class="btn sm" data-a="practiceGroup" data-code="${esc(w.cid)}">Practice</button></div>`).join('')}</div>` : `<div class="empty small">Weak points appear after a few exercises.</div>`}
    <div class="sec" style="margin-top:12px"><div class="small muted">Quick practice</div><div class="row wrap" style="margin-top:8px"><button class="chip" data-a="quick" data-m="surprise" data-min="2">2 min</button><button class="chip" data-a="quick" data-m="surprise" data-min="5">5 min</button><button class="chip" data-a="quick" data-m="surprise" data-min="10">10 min</button><button class="chip" data-a="speedround">${I('zap')} Speed round</button></div></div></div></div>`;
});

/* ---------------------- LEARN HUB ---------------------- */
route(/^\/learn$/, () => {
  const areas = [['/vocab', 'book-open', 'Vocabulary', 'Words in context with a memory curve.'], ['/phrasals', 'layers', 'Phrasal verbs', 'By verb family, with natural contrasts.'], ['/grammar', 'puzzle', 'Grammar map', 'See what is mastered, weak or locked.'], ['/connectors', 'link', 'Connectors', 'The fastest way to leave B1.'], ['/natural', 'sparkles', 'Sound natural', 'Understandable → natural.'], ['/speaking', 'mic', 'Speaking & roleplay', 'Real situations, hidden goals.'], ['/listening', 'headphones', 'Listening lab', 'Speeds, accents, inference.'], ['/writing', 'pen', 'Writing lab', 'Level, naturalness, connectors.'], ['/reading', 'book', 'Reading', 'Texts with inference questions.']];
  const tracks = [['tech', 'English for IT'], ['security', 'Cybersecurity'], ['business', 'Business English'], ['travel', 'Travel English'], ['daily', 'Daily life'], ['ai', 'AI & future'], ['work', 'Work & careers'], ['health', 'Health & wellbeing'], ['science', 'Science'], ['finance', 'Finance'], ['relationships', 'Relationships'], ['culture', 'Culture & media'], ['abstract', 'Ideas & academic English']];
  return `<div class="ph"><div><h1>Learn</h1><p>Every area feeds the same learner model, so what you practice here changes what tomorrow's session looks like.</p></div><div class="row"><button class="btn" data-a="teach">${I('bulb')} Teach me something</button><button class="btn primary" data-a="startDaily">${I('play')} Daily session</button></div></div>
  ${wotdCard()}<div class="grid g3">${areas.map(([p, ic, n, d]) => `<a class="card click" href="#${p}"><div class="ico">${I(ic)}</div><h3 style="margin-top:12px">${n}</h3><p class="muted small" style="margin-top:4px">${d}</p></a>`).join('')}</div>
  <h2 style="margin:28px 0 12px">Tracks</h2><div class="grid g3">${tracks.map(([t, n]) => `<a class="card click" href="#/topic/${t}"><div class="row"><div class="ico acc">${I(topicIcon[t] || 'globe')}</div><div><h3>${n}</h3><div class="small muted">${CONTENT.words.filter(w => (w.topics || []).includes(t)).length} words · ${CONTENT.lis.filter(l => l.topic === t).length + CONTENT.rd.filter(r => r.topic === t).length + CONTENT.rp.filter(r => r.topic === t).length} texts, audios & missions</div></div></div></a>`).join('')}</div>`;
});

/* ---------------------- DAILY SESSION ---------------------- */
route(/^\/session$/, () => {
  const plan = todaysPlan();
  return `<div class="ph"><div><h1>Daily Smart Session</h1><p>Built automatically from your errors, memory curve, level and goal. You never have to assemble a lesson.</p></div><div class="row wrap">${[5, 10, 15, 20, 30].map(m => `<button class="chip ${S.profile.minutes === m ? 'on' : ''}" data-a="setminutes" data-min="${m}">${m} min</button>`).join('')}</div></div>
  <div class="grid g21"><div class="stack">${plan.blocks.map(b => `<div class="card"><div class="row"><div class="ico">${I(b.icon)}</div><div class="grow"><h3>${esc(b.label)}</h3><div class="small muted">${b.items.length} exercise${b.items.length > 1 ? 's' : ''} · ≈ ${fmtMin(b.est)} min</div></div></div><div class="list" style="margin-top:8px">${b.items.slice(0, 5).map(i => `<div class="it"><div class="grow small"><span class="b">${esc(sessLabel(i))}</span><div class="tiny muted">${esc(i.reason || '')}</div></div>${lvTag(i.lvl)}</div>`).join('')}${b.items.length > 5 ? `<div class="small muted" style="padding:8px 4px">+ ${b.items.length - 5} more</div>` : ''}</div></div>`).join('')}</div>
  <div class="stack"><div class="card hero"><div class="tiny" style="text-transform:uppercase;letter-spacing:.1em;opacity:.8;font-weight:700">Ready</div><h2 style="margin-top:6px">${plan.items.length} exercises · ${plan.minutes} min</h2><p class="muted" style="margin-top:6px">Aim: 80–85% correct. Too easy → harder next time. Too hard → we review first.</p><div class="row" style="margin-top:16px"><button class="btn white lg" data-a="startDaily" style="flex:1">${I('play')} Start</button></div><div style="margin-top:10px"><button class="btn sm" style="background:rgba(255,255,255,.14);color:#fff;border-color:transparent" data-a="reshuffle">${I('shuffle')} Rebuild</button></div></div>
  <div class="card"><h4>How this was chosen</h4><ul class="small muted" style="margin:8px 0 0 18px;padding:0"><li>Accuracy lately: ${pct(acc20(S))}% (target 82%)</li><li>${dueCounts().total} items due for review</li><li>Weakest unlocked topic: ${esc((pickGrammar(S, 1)[0] || { name: '—' }).name)}</li><li>Last speaking: ${ago(S.lastSpeak)}</li><li>Last listening: ${ago(S.lastListen)}</li></ul></div></div></div>`;
});
function sessLabel(i) {
  if (i.kind === 'word') return 'Word: ' + (IDX.words[i.ref] || { w: i.ref }).w; if (i.kind === 'phr') return 'Phrasal: ' + conceptName('p:' + i.ref); if (i.kind === 'gram') return 'Grammar: ' + (IDX.gr[i.ref] || { name: i.ref }).name;
  if (i.kind === 'conn') return 'Connectors'; if (i.kind === 'nat') return 'Natural phrasing'; if (i.kind === 'lis') return 'Listening passage'; if (i.kind === 'spk') return 'Speaking: ' + i.prompt.slice(0, 60); if (i.kind === 'wri') return 'Writing: ' + i.prompt.slice(0, 50); return 'Exercise';
}

/* ---------------------- PRACTICE ---------------------- */
let PQ = { min: 5 };
route(/^\/practice$/, () => {
  const modes = [['surprise', 'shuffle', 'Surprise me', 'A balanced mix chosen for you'], ['vocab', 'book-open', 'Vocabulary', 'Review and learn words'], ['grammar', 'puzzle', 'Grammar', 'Your weakest unlocked topic'], ['speaking', 'mic', 'Speaking', 'One open question'], ['listening', 'headphones', 'Listening', 'A short passage'], ['review', 'refresh', 'Reviews due', `${dueCounts().total} waiting`]];
  return `<div class="ph"><div><h1>Practice</h1><p>Short on time? Pick a length and a focus. Everything still feeds your learner model.</p></div></div>
  <div class="card"><div class="small muted b">How long?</div><div class="row wrap" style="margin-top:8px">${[2, 5, 10].map(m => `<button class="chip ${PQ.min === m ? 'on' : ''}" data-a="pqmin" data-min="${m}">${m} min</button>`).join('')}</div></div>
  <div class="grid g3" style="margin-top:16px">${modes.map(([m, ic, n, d]) => `<button class="card click" style="text-align:left" data-a="pqgo" data-m="${m}"><div class="ico">${I(ic)}</div><h3 style="margin-top:12px">${n}</h3><div class="small muted">${d}</div></button>`).join('')}</div>
  <div class="grid g3" style="margin-top:16px"><button class="card click" style="text-align:left" data-a="speedround"><div class="ico acc">${I('zap')}</div><h3 style="margin-top:12px">Speed round</h3><div class="small muted">10 quick questions, 8 seconds each. Trains automatic recall.</div></button><button class="card click" style="text-align:left" data-a="teach"><div class="ico acc">${I('bulb')}</div><h3 style="margin-top:12px">Teach me something</h3><div class="small muted">A new concept chosen for your level.</div></button><a class="card click" href="#/roadmap"><div class="ico acc">${I('flag')}</div><h3 style="margin-top:12px">CEFR test</h3><div class="small muted">Full tests with a detailed report.</div></a></div>`;
});
ACT.pqmin = el => { PQ.min = +el.dataset.min; render(); };
ACT.pqgo = el => startQuick(el.dataset.m, PQ.min);

/* ---------------------- VOCABULARY ---------------------- */
let V = { q: '', lvl: '', topic: '', st: '', tab: 'lib' };
const vocabRows = () => {
  const q = norm(V.q); const rows = CONTENT.words.filter(w => (!V.lvl || w.lvl === V.lvl) && (!V.topic || (w.topics || []).includes(V.topic)) && (!q || norm(w.w + ' ' + w.pt + ' ' + w.def).includes(q)) && (!V.st || stOf('w:' + w.id) === V.st));
  return rows.sort((a, b) => lvIdx(a.lvl) - lvIdx(b.lvl) || a.w.localeCompare(b.w));
};
function vocabListHTML() {
  const rows = vocabRows().slice(0, 150); if (!rows.length) return '<div class="empty small">No words match.</div>';
  return `<div class="list">${rows.map(w => { const c = S.c['w:' + w.id]; const st = stOf('w:' + w.id); return `<div class="it click" data-a="card" data-t="word" data-id="${w.id}"><div class="grow"><div class="row"><b>${esc(w.w)}</b> <span class="tiny muted">${esc(w.pos)}</span></div><div class="small muted">${esc(w.pt)} · ${esc(w.def.length > 60 ? w.def.slice(0, 58) + '…' : w.def)}</div></div><div style="width:90px">${c && c.seen ? bar(mEff(c), 'ok thin') : ''}</div>${lvTag(w.lvl)}${stChip(st)}</div>`; }).join('')}</div>${vocabRows().length > 150 ? '<div class="small muted center" style="padding:10px">Showing 150 of ' + vocabRows().length + '. Use filters or search.</div>' : ''}`;
}
route(/^\/vocab$/, () => {
  const ws = wordStats(S); const total = CONTENT.words.length;
  const tops = ['tech', 'security', 'ai', 'business', 'work', 'travel', 'daily', 'relationships', 'health', 'finance', 'science', 'culture', 'abstract'];
  const html = `<div class="ph"><div><h1>Vocabulary</h1><p>Words live in context: every word has levels of mastery — recognize, recall, produce, use freely.</p></div><div class="row wrap"><button class="btn" data-a="addword">${I('plus')} Add word</button><button class="btn primary" data-a="quick" data-m="vocab" data-min="5">${I('zap')} Practice 5 min</button></div></div>
  ${lookupBox()}${wotdCard()}<div class="grid g4" style="margin-bottom:16px"><div class="card stat"><div class="k">Passive vocabulary</div><div class="v">${ws.passive}</div><div class="s">words you recognize</div></div><div class="card stat"><div class="k">Active vocabulary</div><div class="v">${ws.active}</div><div class="s">you can produce</div></div><div class="card stat"><div class="k">Mastered</div><div class="v">${ws.by.mastered}</div><div class="s">${ws.by.learning + ws.by.familiar} learning · ${ws.by.forgotten} fading</div></div><div class="card stat"><div class="k">Library</div><div class="v">${total}</div><div class="s">${ws.by.new === 0 ? 'all met' : 'words + ' + CONTENT.phr.length + ' phrasals'}</div></div></div>
  <div class="tabs"><button class="${V.tab === 'lib' ? 'on' : ''}" data-a="vtab" data-t="lib">Library</button><button class="${V.tab === 'my' ? 'on' : ''}" data-a="vtab" data-t="my">My dictionary (${S.personal.length})</button></div>
  ${V.tab === 'lib' ? `<div class="stack"><input type="text" id="vq" placeholder="Search words, translations, definitions…" value="${esc(V.q)}"><div class="row wrap">${[['', 'All levels'], ['B1', 'B1'], ['B1+', 'B1+'], ['B2', 'B2'], ['B2+', 'B2+']].map(([v, l]) => `<button class="chip ${V.lvl === v ? 'on' : ''}" data-a="vf" data-k="lvl" data-v="${v}">${l}</button>`).join('')}<span style="width:10px"></span>${[['', 'All states'], ['new', 'New'], ['learning', 'Learning'], ['familiar', 'Familiar'], ['mastered', 'Mastered'], ['forgotten', 'Forgotten']].map(([v, l]) => `<button class="chip ${V.st === v ? 'on' : ''}" data-a="vf" data-k="st" data-v="${v}">${l}</button>`).join('')}</div><div class="row wrap"><button class="chip ${V.topic === '' ? 'on' : ''}" data-a="vf" data-k="topic" data-v="">All topics</button>${tops.map(t => `<button class="chip ${V.topic === t ? 'on' : ''}" data-a="vf" data-k="topic" data-v="${t}">${t}</button>`).join('')}</div><div class="card" id="vlist">${vocabListHTML()}</div></div>` : myDictHTML()}`;
  return { html, after: () => { const q = $('#vq'); if (q) q.addEventListener('input', () => { V.q = q.value; $('#vlist').innerHTML = vocabListHTML(); }); } };
});
ACT.vtab = el => { V.tab = el.dataset.t; render(); };
ACT.vf = el => { V[el.dataset.k] = el.dataset.v; render(); };
function myDictHTML() {
  return `<div class="card">${S.personal.length ? `<div class="list">${S.personal.map((w, i) => `<div class="it click" data-a="card" data-t="personal" data-i="${i}"><div class="grow"><b>${esc(w.w)}</b><div class="small muted">${esc(w.pt || '')} ${w.def ? '· ' + esc(w.def) : ''}</div></div>${lvTag(w.lvl || 'B1')}${stChip(stOf('w:' + w.id))}<button class="iconbtn" data-a="delword" data-i="${i}" aria-label="Delete">${I('trash')}</button></div>`).join('')}</div>` : `<div class="empty"><p>Your personal dictionary is empty.</p><p class="small">Add any word you meet in real life. It joins your review system automatically${AIService.enabled() ? ' and AI fills in the details' : ''}.</p><button class="btn primary" style="margin-top:12px" data-a="addword">${I('plus')} Add a word</button></div>`}</div>`;
}
function addPersonalToContent(e) { const w = { id: e.id, w: e.w, pos: e.pos || 'word', lvl: e.lvl || 'B1+', pt: e.pt || '', def: e.def || '', ipa: e.ipa || '', ex: e.ex, form: e.w, nat: e.ex, syn: e.syn || [], ant: [], col: e.col || [], fam: [], topics: ['personal'], personal: true }; if (!IDX.words[w.id]) { CONTENT.words.push(w); IDX.words[w.id] = w; } }
ACT.addword = () => {
  modal(`<h2>Add a word</h2><p class="muted small">Any word or expression from real life.</p><label class="f">Word or expression</label><input type="text" id="aw" placeholder="e.g. overwhelmed"><div class="row" style="margin-top:8px">${AIService.enabled() ? `<button class="btn sm" data-a="awai">${I('sparkles')} Auto-fill with AI</button>` : '<span class="small muted">Tip: add an API key in Settings to auto-fill everything.</span>'}</div><label class="f">Portuguese translation</label><input type="text" id="awpt"><label class="f">Meaning in English</label><input type="text" id="awdef"><label class="f">Example sentence</label><input type="text" id="awex" placeholder="Use the word in a sentence"><div class="row" style="margin-top:20px"><button class="btn primary" data-a="awsave">${I('check')} Save to my dictionary</button></div>`);
};
ACT.awai = async el => { const w = $('#aw').value.trim(); if (!w) { toast('Type the word first.', 'alert'); return; } el.disabled = true; el.textContent = 'Thinking…'; try { const r = await AIService.wordEntry(w); $('#awpt').value = r.pt || ''; $('#awdef').value = r.def || ''; $('#awex').value = r.ex || ''; el.textContent = 'Filled'; } catch (e) { el.textContent = 'AI unavailable'; toast(esc(e.message), 'alert'); } };
ACT.awsave = () => { const w = $('#aw').value.trim(); if (!w) { toast('Type the word first.', 'alert'); return; } const slug = 'my-' + norm(w).replace(/ /g, '-'); if (S.personal.some(x => x.id === slug)) { toast('Already in your dictionary.', 'alert'); return; } let ex = $('#awex').value.trim(); if (!ex.toLowerCase().includes(w.toLowerCase())) ex = ex ? ex + ' (' + w + ')' : `I want to remember the word "${w}".`; const e = { id: slug, w, pt: $('#awpt').value.trim(), def: $('#awdef').value.trim(), ex, lvl: 'B1+' }; S.personal.push(e); addPersonalToContent(e); applyAnswer(S, 'w:' + slug, { k: 'word', lvl: 'B1+' }, { ok: false, type: 'mcq', now: Date.now() }); S.c['w:' + slug].seen = 0; S.c['w:' + slug].next = Date.now(); save(); closeModal(); toast('Added. It will appear in your reviews.', 'plus'); render(); };
ACT.delword = el => { const e = S.personal[+el.dataset.i]; if (!e) return; S.personal.splice(+el.dataset.i, 1); S.persDel = S.persDel || {}; S.persDel[e.id] = Date.now(); delete S.c['w:' + e.id]; CONTENT.words = CONTENT.words.filter(x => x.id !== e.id); delete IDX.words[e.id]; save(); render(); };

/* ---------------------- PHRASAL VERBS ---------------------- */
let PH = { q: '', lvl: '' };
route(/^\/phrasals$/, () => {
  const verbs = {}; CONTENT.phr.forEach(p => (verbs[p.v] = verbs[p.v] || []).push(p));
  const order = Object.keys(verbs).sort((a, b) => verbs[b].length - verbs[a].length);
  const seen = CONTENT.phr.filter(p => S.c['p:' + p.id] && S.c['p:' + p.id].seen).length;
  return { html: `<div class="ph"><div><h1>Phrasal verbs</h1><p>Organized by verb. Learn the family together, then see natural contrasts and practice in context.</p></div><button class="btn primary" data-a="practiceGroup" data-code="p*">${I('zap')} Practice phrasal verbs</button></div>
  <div class="grid g3 keep" style="margin-bottom:16px"><div class="card stat"><div class="k">Library</div><div class="v">${CONTENT.phr.length}</div></div><div class="card stat"><div class="k">Met</div><div class="v">${seen}</div></div><div class="card stat"><div class="k">Mastered</div><div class="v">${CONTENT.phr.filter(p => stOf('p:' + p.id) === 'mastered').length}</div></div></div>
  <input type="text" id="phq" placeholder="Search phrasal verbs or meanings…" value="${esc(PH.q)}" style="margin-bottom:12px"><div id="phl">${phrListHTML(verbs, order)}</div>`, after: () => { const q = $('#phq'); q.addEventListener('input', () => { PH.q = q.value; $('#phl').innerHTML = phrListHTML(verbs, order); }); } };
});
function phrListHTML(verbs, order) {
  const q = norm(PH.q);
  return order.map(v => { const items = verbs[v].filter(p => !q || norm(p.v + ' ' + p.p + ' ' + p.pt + ' ' + p.def).includes(q)).sort((a, b) => lvIdx(a.lvl) - lvIdx(b.lvl)); if (!items.length) return ''; const m = avg(items.map(p => mEff(S.c['p:' + p.id]))); return `<div class="card" style="margin-bottom:12px"><div class="row between"><div class="row"><h3 style="text-transform:uppercase;letter-spacing:.04em">${esc(v)}</h3><span class="tiny muted">${items.length} meanings</span></div><div style="width:110px">${bar(m, 'ok thin')}</div></div><div class="row wrap" style="margin-top:12px">${items.map(p => `<button class="chip ${stOf('p:' + p.id) === 'mastered' ? 'on' : ''}" data-a="card" data-t="phr" data-id="${p.id}">${esc(p.p)}<span class="tiny" style="opacity:.6">· ${esc(p.pt.split(/[;,]/)[0])}</span></button>`).join('')}</div></div>`; }).join('') || '<div class="empty small">No phrasal verbs match.</div>';
}

/* ---------------------- GRAMMAR (mapa + lab) ---------------------- */
function gStatus(g) {
  const c = S.c['g:' + g.id]; if (!grammarUnlocked(S, g) && !(c && c.seen)) return 'locked';
  if (!c || !c.seen && !c.prior) return 'none'; const st = stageOf(c);
  if (c.prior || st === 'mastered') return 'mastered'; if (st === 'forgotten' || (c.seen >= 3 && mEff(c) < .35)) return 'weak'; return 'learning';
}
const GST = { mastered: ['check-circle', 'Mastered'], learning: ['dot', 'Learning'], weak: ['alert', 'Weak'], none: ['circle', 'Not studied'], locked: ['lock', 'Locked'] };
route(/^\/grammar$/, () => {
  const cols = ['A1', 'A2', 'B1', 'B1+', 'B2', 'B2+', 'C1'];
  const cnt = { mastered: 0, learning: 0, weak: 0, none: 0, locked: 0 }; CONTENT.gr.forEach(g => cnt[gStatus(g)]++);
  return `<div class="ph"><div><h1>Grammar map</h1><p>Each topic unlocks when its prerequisites are solid. Click any topic to open its lab.</p></div><button class="btn primary" data-a="quick" data-m="grammar" data-min="5">${I('zap')} Practice weakest topic</button></div>
  <div class="row wrap" style="margin-bottom:16px;gap:16px">${Object.keys(GST).map(k => `<span class="small row" style="gap:6px;color:${k === 'mastered' ? 'var(--ok)' : k === 'weak' ? 'var(--warn)' : k === 'learning' ? 'var(--pri)' : 'var(--mut)'}">${I(GST[k][0])} ${GST[k][1]} · ${cnt[k]}</span>`).join('')}</div>
  <div class="map">${cols.map(l => `<div class="col"><h4>${l}</h4>${CONTENT.gr.filter(g => g.lvl === l).map(g => { const s = gStatus(g); const c = S.c['g:' + g.id]; return `<button class="node ${s}" data-a="nav" data-to="/grammar/${g.id}"><span class="s">${I(GST[s][0])}</span><span class="grow">${esc(g.name)}</span>${c && c.seen && !c.prior ? `<span class="tiny muted">${pct(mEff(c))}%</span>` : ''}</button>`; }).join('') || '<div class="tiny muted">—</div>'}</div>`).join('')}</div>`;
});
let GLANG = null;
route(/^\/grammar\/([\w-]+)$/, m => {
  const g = IDX.gr[m[1]]; if (!g) return '<div class="empty">Topic not found. <a class="b" href="#/grammar">Back</a></div>';
  const c = S.c['g:' + g.id]; const s = gStatus(g); const pt = GLANG ? GLANG === 'pt' : ptHelpOn(S);
  const unlocks = CONTENT.gr.filter(x => (x.prereq || []).includes(g.id));
  const tier = c && !c.prior ? c.tier : 0;
  return `<div class="ph"><div><a class="small muted" href="#/grammar">← Grammar map</a><div class="row" style="margin-top:6px">${lvTag(g.lvl)}<h1>${esc(g.name)}</h1></div><p class="b" style="color:var(--pri);margin-top:6px">${esc(g.form || '')}</p></div><div class="row wrap"><button class="btn primary" data-a="practice" data-cid="g:${g.id}">${I('zap')} Practice (progressive)</button><button class="btn" data-a="gtest" data-id="${g.id}">${I('flag')} Mini test</button></div></div>
  <div class="grid g21"><div class="stack">
  <div class="card"><div class="row between"><h3>1 · Simple explanation</h3><div class="seg"><button class="${pt ? '' : 'on'}" data-a="glang" data-l="en">EN</button><button class="${pt ? 'on' : ''}" data-a="glang" data-l="pt">PT</button></div></div><p style="margin-top:10px;line-height:1.65">${esc(pt ? g.pt : g.en)}</p></div>
  <div class="card"><h3>2 · Examples</h3><div class="stack" style="margin-top:10px">${g.ex.map(x => `<div class="rsub" style="padding:12px 16px;font-size:1.05rem">${esc(x)} ${sayBtn(x)}</div>`).join('')}</div></div>
  ${g.cmp ? `<div class="card"><h3>3 · Compare</h3><p style="margin-top:8px;line-height:1.6">${esc(g.cmp)}</p></div>` : ''}
  <div class="card"><h3>4 · Common mistakes</h3><div class="stack" style="margin-top:10px">${(g.mistakes || []).map(x => `<div class="mis"><div class="bad">✗ ${esc(x.bad)}</div><div class="good">✓ ${esc(x.good)}</div><div class="small muted">${esc(x.why)}</div></div>`).join('') || '<span class="muted small">No typical mistakes listed.</span>'}</div></div>
  <div class="card"><h3>5 · Practice ladder</h3><p class="small muted" style="margin:4px 0 12px">Mastery grows as you move from recognizing to using freely. Multiple choice alone never reaches 100%.</p><div class="grid g4 keep">${TIER_NAME.map((n, i) => `<div style="padding:12px;border-radius:14px;background:${i < tier ? 'var(--ok-soft)' : i === tier ? 'var(--pri-soft)' : 'var(--surf2)'};text-align:center"><div style="font-size:1.3rem;color:${i < tier ? 'var(--ok)' : 'var(--mut)'}">${I(i < tier ? 'check-circle' : 'circle')}</div><div class="small b">${n}</div><div class="tiny muted">${['choose', 'order / cloze', 'type it', 'own sentence'][i]}</div></div>`).join('')}</div></div></div>
  <div class="stack"><div class="card center"><div class="row" style="justify-content:center">${ring(c && !c.prior ? mEff(c) : (c && c.prior ? .8 : 0), 120, 11, 'var(--pri)', c && (c.seen || c.prior) ? pct(c.prior && !c.seen ? .8 : mEff(c)) + '%' : '—', 'mastery')}</div><div style="margin-top:10px"><span class="tag ${s === 'mastered' ? 'st-mastered' : s === 'weak' ? 'st-forgotten' : s === 'learning' ? 'st-familiar' : 'st-new'}">${GST[s][1]}</span></div>${c && c.seen ? `<p class="small muted" style="margin-top:10px">Seen ${c.seen}× · ${c.ok} correct · next review ${c.next > Date.now() ? 'in ' + Math.max(1, Math.round((c.next - Date.now()) / DAY)) + ' d' : 'now'}</p>` : c && c.prior ? `<p class="small muted" style="margin-top:10px">Assumed known from your placement test. Prove it with a mini test.</p>` : ''}</div>
  <div class="card"><h4>Prerequisites</h4>${(g.prereq || []).length ? `<div class="stack" style="margin-top:8px">${g.prereq.map(id => { const p = IDX.gr[id]; return p ? `<a class="row small" href="#/grammar/${id}"><span style="color:${gStatus(p) === 'mastered' ? 'var(--ok)' : 'var(--mut)'}">${I(GST[gStatus(p)][0])}</span>${esc(p.name)}</a>` : ''; }).join('')}</div>` : '<p class="small muted" style="margin-top:6px">None</p>'}${unlocks.length ? `<h4 style="margin-top:14px">Unlocks</h4><div class="stack" style="margin-top:8px">${unlocks.map(p => `<a class="row small" href="#/grammar/${p.id}"><span class="muted">${I('arrow')}</span>${esc(p.name)}</a>`).join('')}</div>` : ''}</div></div></div>`;
});
ACT.glang = el => { GLANG = el.dataset.l; render(); };
ACT.gtest = el => { const g = IDX.gr[el.dataset.id]; startRunner(planTopicTest(S, g), { kind: 'quick' }); };

/* ---------------------- CONNECTORS ---------------------- */
let CN = { cat: null };
route(/^\/connectors$/, () => {
  const cats = CONTENT.con.cats; CN.cat = CN.cat || cats[0].id; const cat = cats.find(c => c.id === CN.cat);
  const recent = S.analyses.slice(-6); const used = {}; recent.forEach(a => a.connectors && a.connectors.forEach(c => { used[c.c] = (used[c.c] || 0) + c.n; }));
  const bec = recent.reduce((n, a) => n + ((a.overuse || {}).because || 0), 0), but = recent.reduce((n, a) => n + ((a.overuse || {}).but || 0), 0);
  const cm = S.c['c:' + cat.id];
  return `<div class="ph"><div><h1>Connectors</h1><p>Link ideas smoothly and naturally. Exercises help you vary linking words instead of repeating "because" and "but".</p></div><button class="btn primary" data-a="practiceGroup" data-code="c*">${I('zap')} Practice connectors</button></div>
  <div class="grid g3 keep" style="margin-bottom:16px"><div class="card stat"><div class="k">Used in your writing</div><div class="v">${Object.keys(used).filter(k => !['because', 'but', 'and', 'so'].includes(k)).length}</div><div class="s">different advanced connectors</div></div><div class="card stat"><div class="k">"because"</div><div class="v">${bec}</div><div class="s">times, recently</div></div><div class="card stat"><div class="k">"but"</div><div class="v">${but}</div><div class="s">times, recently</div></div></div>
  <div class="tabs">${cats.map(c => `<button class="${CN.cat === c.id ? 'on' : ''}" data-a="cncat" data-c="${c.id}">${esc(c.name)}</button>`).join('')}</div>
  <div class="row between" style="margin-bottom:14px"><div class="small muted">Mastery of this group: <b>${cm ? pct(mEff(cm)) : 0}%</b></div><button class="btn sm" data-a="cnpractice" data-c="${cat.id}">${I('zap')} Practice ${esc(cat.name.toLowerCase())}</button></div>
  <div class="grid g2">${cat.items.map(i => `<div class="card flat"><div class="row between"><h3>${esc(i.c)}</h3><span class="tag a">${esc(i.reg || '')}</span></div><div class="muted small" style="margin-top:2px">${esc(i.pt || '')}</div><p class="small" style="margin-top:8px">${esc(i.note || '')}</p>${used[i.c.toLowerCase()] ? `<div class="tiny" style="color:var(--ok);margin-top:6px">✓ You used this ${used[i.c.toLowerCase()]}×</div>` : ''}</div>`).join('')}</div>`;
});
ACT.cncat = el => { CN.cat = el.dataset.c; render(); };
ACT.cnpractice = el => { const cid = 'c:' + el.dataset.c; const items = []; for (let k = 0; k < 6; k++) { const it = buildFor(S, cid, Math.min(k > 3 ? 2 : 1, 3)); if (it) { it.block = 'q'; it.reason = 'Connector practice: ' + el.dataset.c; items.push(it); } } startRunner({ items, blocks: [{ key: 'q', label: 'Practice', items }], quick: true }, { kind: 'quick' }); };

/* ---------------------- SOUND NATURAL ---------------------- */
let NT = { tab: 'list', tag: '', open: {} };
route(/^\/natural$/, () => {
  const tags = [...new Set(CONTENT.nat.flatMap(n => n.tags || []))];
  const list = CONTENT.nat.filter(n => !NT.tag || (n.tags || []).includes(NT.tag));
  return `<div class="ph"><div><h1>Sound more natural</h1><p>Being understood is the first step; sounding natural is fluency. Train collocations, idiomatic choices and the translation habits that give you away.</p></div></div>
  <div class="tabs"><button class="${NT.tab === 'list' ? 'on' : ''}" data-a="nttab" data-t="list">Natural vs. understandable</button><button class="${NT.tab === 'train' ? 'on' : ''}" data-a="nttab" data-t="train">Trainers</button></div>
  ${NT.tab === 'list' ? `<div class="row wrap" style="margin-bottom:14px"><button class="chip ${NT.tag === '' ? 'on' : ''}" data-a="ntf" data-v="">All</button>${tags.map(t => `<button class="chip ${NT.tag === t ? 'on' : ''}" data-a="ntf" data-v="${t}">${t}</button>`).join('')}</div><div class="grid g2">${list.map(n => `<div class="card flat click" data-a="ntopen" data-id="${n.id}"><div class="row between"><span class="small muted">${esc(n.pt)}</span>${lvTag(n.lvl)}</div><div class="mis" style="margin-top:10px"><span class="bad">${esc(n.understandable)}</span></div><div class="mis" style="margin-top:8px;background:var(--ok-soft)"><span class="good">${esc(n.natural)}</span> ${sayBtn(n.natural)}</div>${NT.open[n.id] ? `<p class="small muted" style="margin-top:10px">${esc(n.why)}</p>` : '<p class="tiny muted" style="margin-top:8px">Tap to see why</p>'}</div>`).join('')}</div>`
      : `<div class="grid g3"><button class="card click" style="text-align:left" data-a="nttrain" data-m="choose"><div class="ico">${I('check-circle')}</div><h3 style="margin-top:12px">Choose the natural one</h3><div class="small muted">Pick the most idiomatic sentence out of four.</div></button><button class="card click" style="text-align:left" data-a="nttrain" data-m="translate"><div class="ico acc">${I('pen')}</div><h3 style="margin-top:12px">Translation trainer</h3><div class="small muted">Portuguese → English. You get <b>naturalness</b>, not just right/wrong.</div></button><button class="card click" style="text-align:left" data-a="nttrain" data-m="builder"><div class="ico ok">${I('puzzle')}</div><h3 style="margin-top:12px">Sentence builder</h3><div class="small muted">Rebuild natural sentences from scrambled words.</div></button></div>`}`;
});
ACT.nttab = el => { NT.tab = el.dataset.t; render(); };
ACT.ntf = el => { NT.tag = el.dataset.v; render(); };
ACT.ntopen = el => { if (e_target_is_say(el)) return; NT.open[el.dataset.id] = !NT.open[el.dataset.id]; render(); };
const e_target_is_say = () => false;
ACT.nttrain = el => {
  const A = overallA(S) + .3; const m = el.dataset.m; const pool = shuffle(CONTENT.nat.slice()).sort((a, b) => Math.abs(lvIdx(a.lvl) - A) - Math.abs(lvIdx(b.lvl) - A) + (rnd() - .5) * 1.4).slice(0, 8);
  const items = pool.map(n => m === 'builder' ? builderItem(S, n) : m === 'translate' ? natItem(S, n, 2) : natItem(S, n, 0)).filter(Boolean);
  items.forEach(i => { i.block = 'q'; i.reason = m === 'builder' ? 'Sentence builder practice.' : m === 'translate' ? 'Translation trainer: naturalness matters more than word-for-word accuracy.' : 'Choosing the natural sentence trains your collocation instinct.'; });
  startRunner({ items, blocks: [{ key: 'q', label: 'Practice', items }], quick: true }, { kind: 'quick', again: () => ACT.nttrain(el) });
};
