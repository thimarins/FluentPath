/* ============================================================
   FLUENT PATH — FLUXOS: onboarding, diagnóstico adaptativo,
   simulados CEFR e roleplay.
   ============================================================ */
const OB_GOALS = ['Work & career', 'Travel', 'Living or studying abroad', 'Exams & certificates', 'Everyday conversation', 'Movies, series & reading'];
const OB_TOPICS = [['tech', 'Technology'], ['ai', 'Artificial Intelligence'], ['security', 'Cybersecurity'], ['business', 'Business'], ['travel', 'Travel'], ['daily', 'Daily life'], ['relationships', 'Relationships'], ['culture', 'Culture & media'], ['finance', 'Finance'], ['science', 'Science']];
const OB_SIT = ['Meetings at work', 'Emails & messages', 'Calls with clients', 'Trips abroad', 'Making friends', 'Series & YouTube', 'Reading articles'];
const OB_PAIN = ['Vocabulary', 'Phrasal verbs', 'Connectors', 'Grammar', 'Speaking', 'Listening', 'Writing', 'Sounding natural'];
const OB_PREF = ['Speaking', 'Listening', 'Reading', 'Writing'];
let OB = null;
route(/^\/onboarding$/, () => { OB = OB || { step: 0, d: { name: S.profile.name || '', goal: '', level: 'B1', target: 'B2', minutes: 20, topics: ['tech', 'travel', 'daily'], situations: [], pain: [], prefs: [] } }; return { html: obHTML(), after: obBind }; });
function obHTML() {
  const d = OB.d, st = OB.step, steps = 7;
  const chips = (arr, key, multi = true, fmt = x => x) => `<div class="row wrap" style="gap:10px;margin-top:6px">${arr.map(a => { const v = Array.isArray(a) ? a[0] : a, lab = Array.isArray(a) ? a[1] : a; const on = multi ? d[key].includes(v) : d[key] === v; return `<button class="chip ${on ? 'on' : ''}" style="padding:10px 16px;font-size:.95rem" data-a="obset" data-k="${key}" data-v="${esc(v)}" data-m="${multi ? 1 : 0}">${esc(lab)}</button>`; }).join('')}</div>`;
  const pages = [
    `<h1>Welcome to Fluent Path</h1><p class="muted" style="margin-top:8px;max-width:52ch">A personal English tutor that learns how you learn. It finds your real level, tracks what you know and forget, and builds each session for you.</p><label class="f">What should I call you?</label><input type="text" id="obname" value="${esc(d.name)}" placeholder="Your name" autocomplete="off"><div class="row wrap" style="margin-top:22px"><button class="btn" data-a="obsync">${I('cloud')} Connect Google Drive (cloud backup / restore)</button><button class="btn ghost" data-a="obdemo">${I('eye')} Explore with a demo user</button></div>`,
    `<h2>What is your main goal with English?</h2>${chips(OB_GOALS, 'goal', false)}<label class="f">How would you describe your level today?</label>${chips([['A2', 'A2 · basic'], ['B1', 'B1 · intermediate'], ['B1+', 'B1+ · upper intermediate'], ['B2', 'B2 · advanced-ish']], 'level', false)}<label class="f">Where do you want to get to?</label>${chips([['B1', 'Solid B1'], ['B1+', 'B1+'], ['B2', 'Solid B2'], ['B2+', 'Advanced B2'], ['C1', 'C1']], 'target', false)}`,
    `<h2>How much time can you study per day?</h2><p class="muted">Quality beats quantity. You can change this any time.</p>${chips([[5, '5 min'], [10, '10 min'], [15, '15 min'], [20, '20 min'], [30, '30 min']], 'minutes', false)}`,
    `<h2>What topics interest you?</h2><p class="muted">Pick a few. Lessons will mix them with real-life situations.</p>${chips(OB_TOPICS, 'topics')}`,
    `<h2>Where do you use English?</h2>${chips(OB_SIT, 'situations')}`,
    `<h2>What feels hardest right now?</h2>${chips(OB_PAIN, 'pain')}`,
    `<h2>Which skills do you enjoy most?</h2><p class="muted">The engine still trains all of them, but it will lean on these.</p>${chips(OB_PREF, 'prefs')}`
  ];
  return `<div style="max-width:720px;margin:0 auto;padding:36px 0"><div class="row" style="margin-bottom:26px"><div class="brand" style="padding:0"><div class="logo" style="overflow:hidden">${BRAND_LOGO}</div>Fluent Path</div><span class="grow"></span><span class="small muted">${st + 1} / ${steps}</span></div><div class="bar" style="margin-bottom:30px"><i style="width:${(st + 1) / steps * 100}%"></i></div><div class="card" style="padding:30px">${pages[st]}<div class="row between" style="margin-top:30px">${st ? `<button class="btn ghost" data-a="obback">Back</button>` : '<span></span>'}<button class="btn primary lg" data-a="obnext">${st === steps - 1 ? 'Continue to placement test' : 'Next'} ${I('arrow')}</button></div></div></div>`;
}
function obBind() { const i = $('#obname'); if (i) { i.addEventListener('input', () => OB.d.name = i.value); setTimeout(() => i.focus(), 80); } }
ACT.obset = el => { const d = OB.d, k = el.dataset.k; let v = el.dataset.v; if (['minutes'].includes(k)) v = +v; if (el.dataset.m === '1') { const a = d[k]; const i = a.indexOf(v); if (i >= 0) a.splice(i, 1); else a.push(v); } else d[k] = v; $('#view').innerHTML = obHTML(); obBind(); };
ACT.obback = () => { OB.step = Math.max(0, OB.step - 1); $('#view').innerHTML = obHTML(); obBind(); };
ACT.obnext = () => {
  if (OB.step === 0 && !OB.d.name.trim()) { toast('Tell me your name first.', 'alert'); $('#obname').focus(); return; }
  if (OB.step < 6) { OB.step++; $('#view').innerHTML = obHTML(); obBind(); window.scrollTo(0, 0); return; }
  const d = OB.d; Object.assign(S.profile, { name: d.name.trim(), goal: d.goal, level: d.level, target: d.target, minutes: d.minutes, topics: d.topics.length ? d.topics : ['tech', 'daily'], situations: d.situations, pain: d.pain, prefs: d.prefs });
  S.onboarded = true; S.profileAt = Date.now(); S.settingsAt = Date.now(); save(); OB = null; nav('/diagnostic');
};
ACT.obsync = () => {
  if (clientId()) { ACT.obsyncgo(); return; }
  modal(`<h2>Restore from Google Drive</h2><p class="muted small" style="margin-top:6px">Paste the same Google client ID you use on your other device (Settings → Sync with Google Drive).</p><label class="f">Google OAuth client ID</label><input type="text" id="obcid" placeholder="1234-abc.apps.googleusercontent.com" autocomplete="off"><div class="row" style="margin-top:16px"><button class="btn primary" data-a="obsyncgo">${I('cloud')} Connect &amp; restore</button></div>`);
};
ACT.obsyncgo = async () => {
  const v = $('#obcid'); if (v) setSyncCfg({ cid: v.value.trim() }); if (!clientId()) { toast('Paste your client ID first.', 'alert'); return; }
  closeModal(); setSyncCfg({ connected: true }); await syncNow({ silent: false });
  if (S.onboarded) { OB = null; nav('/home'); render(); toast('Welcome back! Your progress was restored.', 'check-circle'); } else if (SYNC.state !== 'err') toast('Google Drive connected! Your progress will sync automatically as you study.', 'check-circle');
};
ACT.exitDemo = () => {
  if (!confirm('Leave the demo and start your own progress? The demo data will be removed (your real saved progress, if any, is not touched).')) return;
  const st = S.settings; const keepSync = syncCfg(); resetAll(); S.settings = st; setSyncCfg(keepSync); OB = null; save();
  if (typeof SERVER !== 'undefined' && SERVER) { /* o arquivo de progresso real (se existir) é recarregado no próximo início */ }
  applyTheme(); location.hash = '/onboarding'; render(); toast('Demo removed. Let\'s set up your real profile.', 'rocket');
};
ACT.obdemo = () => { loadDemo(); OB = null; applyTheme(); toast('Demo user loaded: explore everything with 40+ days of history.', 'eye'); nav('/home'); };

/* ---------------------- NIVELAMENTO ADAPTATIVO ---------------------- */
let DX = null;
route(/^\/diagnostic$/, () => {
  DX = null;
  return `<div style="max-width:760px;margin:0 auto;padding:36px 0"><div class="brand" style="padding:0 0 26px"><div class="logo" style="overflow:hidden">${BRAND_LOGO}</div>Fluent Path</div>
  <div class="card" style="padding:32px"><div class="ico">${I('target')}</div><h1 style="margin-top:14px">Let's find your real level</h1>
  <p class="muted" style="margin-top:10px">An <b>adaptive</b> test: if you answer quickly and correctly, questions get harder; if you struggle, they get easier until we find your limit. It measures vocabulary, grammar, reading, listening, phrasal verbs, natural phrasing and connectors, and ends with a short writing and speaking sample.</p>
  <div class="grid g3 keep" style="margin:22px 0"><div class="stat"><div class="k">Time</div><div class="v">~8 min</div></div><div class="stat"><div class="k">Questions</div><div class="v">16–24</div></div><div class="stat"><div class="k">Result</div><div class="v">By skill</div></div></div>
  <p class="small muted">No need to guess wildly: use “I don't know” when you really don't. Headphones help for the listening questions.</p>
  <div class="row" style="margin-top:22px"><button class="btn primary lg" data-a="dxstart">${I('play')} Start the test</button><button class="btn ghost" data-a="dxskip">Skip for now</button></div></div></div>`;
});
ACT.dxskip = () => {
  const L = { A2: 1.2, B1: 2.2, 'B1+': 3.0, B2: 4.0 }[S.profile.level] || 2.2; const sk = {}; SKILLS.forEach(k => sk[k] = L);
  applyDiagnostic(S, { sk, theta: L, strengths: [], weaknesses: [], n: 0, at: Date.now() }); S.diag = null; S.assess = []; save(); toast('You can take the placement test later from Roadmap.', 'clock'); nav('/home');
};
ACT.dxstart = () => { DX = { kind: 'adaptive', D: dxStart(S.profile), cur: null, plays: 0, t0: Date.now() }; dxNextScreen(); };
function dxItemHTML(it, n, total, title) {
  const body = it.skill === 'reading' && it.passage ? `<div class="rsub txt">${esc(it.passage)}</div>` : '';
  const aud = it.skill === 'listening' && it.script ? `<div class="audio"><button class="play" data-a="dxplay" id="dxp">${I('play')}</button><div class="grow"><div class="b" id="dxs">Press play (you can listen twice)</div><div class="small muted">Listen carefully, then answer.</div></div></div>${Speech.ok ? '' : '<div class="fb part">This browser can’t play speech. Try Chrome/Edge — this question will be marked as skipped.</div>'}` : '';
  return `<div style="max-width:760px;margin:0 auto;padding:30px 0"><div class="row" style="margin-bottom:16px"><div class="brand" style="padding:0;font-size:1rem"><div class="logo" style="width:28px;height:28px;overflow:hidden">${BRAND_LOGO}</div>${esc(title)}</div><span class="grow"></span><span class="small b muted">Question ${n}${total ? ' / ' + total : ''}</span></div><div class="bar" style="margin-bottom:24px"><i style="width:${total ? (n - 1) / total * 100 : Math.min(100, (n - 1) / 24 * 100)}%"></i></div>
  <div class="stack"><div class="rq">${esc(it.q)}</div>${body}${aud}${it.opts.map((o, i) => `<button class="opt" data-a="dxans" data-i="${i}"><span class="k">${i + 1}</span><span>${esc(o)}</span></button>`).join('')}<div class="center"><button class="btn ghost sm" data-a="dxans" data-i="-1">I don't know</button></div></div></div>`;
}
function dxNextScreen() {
  const X = DX; let it, n, total = null, title;
  if (X.kind === 'adaptive') { it = dxNext(X.D); n = X.D.ans.length + 1; title = 'Placement test'; if (!it || X.D.done) return dxWriting(); }
  else { it = X.items[X.i]; n = X.i + 1; total = X.items.length; title = X.title; if (!it) return dxFinishTest(); }
  X.cur = { it, t0: Date.now() }; X.plays = 0;
  const v = $('#view'); v.innerHTML = dxItemHTML(it, n, total, title); const app = $('.app'); app.style.gridTemplateColumns = '1fr'; $('.side').style.display = 'none'; $('.top').style.display = 'none'; $('#tabbar').style.display = 'none'; window.scrollTo(0, 0);
}
ACT.dxplay = () => { const X = DX; if (X.plays >= 2) { toast('You can listen twice.', 'headphones'); return; } X.plays++; const b = $('#dxp'); b.innerHTML = I('volume'); Speech.speak(X.cur.it.script, { rate: 1, accent: 'us', onend: () => { const e = $('#dxp'); if (e) { e.innerHTML = I('refresh'); $('#dxs').textContent = X.plays >= 2 ? 'Played twice' : 'Played once — you can listen again'; } } }); };
ACT.dxans = el => {
  const X = DX; if (!X || !X.cur || X.cur.locked) return; X.cur.locked = true; Speech.stop();
  const i = +el.dataset.i, it = X.cur.it, ms = Date.now() - X.cur.t0;
  if (X.kind === 'adaptive') { dxAnswer(X.D, it, i, ms); }
  else { X.ans.push({ id: it.id, ok: i === it.ans, lvl: it.lvl, skill: it.skill }); X.i++; }
  const ok = i === it.ans; applySkill(S, DX_SKILL[it.skill] || 'grammar', lvIdx(it.lvl), ok, X.kind === 'test' ? .35 : .15);
  dxNextScreen();
};
/* amostras de escrita e fala ao final */
function dxWriting() {
  $('#view').innerHTML = `<div style="max-width:760px;margin:0 auto;padding:36px 0"><div class="card" style="padding:30px"><div class="rlabel">${I('pen')} Writing sample</div><h2 style="margin:10px 0 6px">Write 3–5 sentences</h2><p class="muted">Describe your job or studies, and what you would like to improve in English. Write freely — this shows us how you really build sentences.</p><textarea id="dxw" placeholder="I work as…" style="min-height:160px;margin-top:16px"></textarea><div class="row between" style="margin-top:16px"><button class="btn ghost" data-a="dxwskip">Skip</button><button class="btn primary lg" data-a="dxwdone">Continue ${I('arrow')}</button></div></div></div>`;
}
ACT.dxwskip = () => { DX.writingA = null; dxSpeaking(); };
ACT.dxwdone = () => { const t = $('#dxw').value.trim(); if (tokens(t).length < 12) { toast('Write at least 2–3 sentences.', 'alert'); return; } const an = analyzeText(t, { src: 'write' }); DX.writingA = clamp(an.levelIdx, 1, 5); DX.wan = an; S.analyses.push({ ...an, text: t.slice(0, 400), prompt: 'Placement writing' }); S.lastWrite = Date.now(); dxSpeaking(); };
function dxSpeaking() {
  $('#view').innerHTML = `<div style="max-width:760px;margin:0 auto;padding:36px 0"><div class="card" style="padding:30px"><div class="rlabel">${I('mic')} Speaking sample</div><h2 style="margin:10px 0 6px">Answer out loud</h2><p class="muted">“Tell me about a day when something went wrong. What happened and what did you do?” Speak for about 30–60 seconds.</p><div class="center" style="margin:20px 0">${Speech.sttOk ? `<button class="mic" data-a="dxmic" id="micb">${I('mic')}</button><div class="small muted" style="margin-top:8px" id="mstat">Tap to start</div>` : '<div class="small muted">Speech recognition isn’t available here — type your answer below, or skip.</div>'}</div><textarea id="dxs2" placeholder="Your transcript…" style="min-height:120px"></textarea><div class="row between" style="margin-top:16px"><button class="btn ghost" data-a="dxsskip">Skip</button><button class="btn primary lg" data-a="dxsdone">See my results ${I('arrow')}</button></div></div></div>`;
}
ACT.dxmic = () => { const X = DX; const b = $('#micb'); if (X.rec) { X.rec.stop(); X.rec = null; b.classList.remove('rec'); $('#mstat').textContent = 'Stopped'; return; } const inp = $('#dxs2'); const base = inp.value ? inp.value + ' ' : ''; X.spkStart = X.spkStart || Date.now(); b.classList.add('rec'); $('#mstat').textContent = 'Listening…'; X.rec = Speech.listen({ onText: t => inp.value = base + t, onEnd: () => { const bb = $('#micb'); if (bb) bb.classList.remove('rec'); X.rec = null; }, onError: e => { $('#mstat').textContent = e === 'not-allowed' ? 'Mic blocked. Type instead.' : 'Mic error. Type instead.'; const bb = $('#micb'); if (bb) bb.classList.remove('rec'); X.rec = null; } }); };
ACT.dxsskip = () => { if (DX.rec) DX.rec.stop(); DX.speakingA = null; dxResult_(); };
ACT.dxsdone = () => { if (DX.rec) { DX.rec.stop(); DX.rec = null; } const t = $('#dxs2').value.trim(); if (tokens(t).length < 10) { toast('Say or type a bit more, or skip.', 'alert'); return; } const an = analyzeText(t, { src: 'speak' }); DX.speakingA = clamp(an.levelIdx - .15, 1, 5); S.analyses.push({ ...an, text: t.slice(0, 400), prompt: 'Placement speaking' }); S.lastSpeak = Date.now(); dxResult_(); };
function dxResult_() {
  const D = DX.D; const R_ = dxResult(D, DX.writingA, DX.speakingA);
  const before = overallLabel(S); applyDiagnostic(S, R_); S.profile.level = overallLabel(S); ev('level_changed', { from: before, to: S.profile.level }); snapshot(); checkAch(); save();
  const lbl = k => lvLabel(R_.sk[k]);
  const tn = t => tagName(t).replace(/^./, c => c.toUpperCase());
  $('#view').innerHTML = `<div style="max-width:820px;margin:0 auto;padding:36px 0"><div class="card" style="padding:32px"><div class="rlabel">${I('trophy')} Your placement result</div>
  <div class="row wrap" style="margin:14px 0 4px;gap:24px"><div><div class="tiny muted b" style="text-transform:uppercase;letter-spacing:.08em">Estimated CEFR</div><div style="font-family:var(--head);font-size:3.4rem;line-height:1;color:var(--pri)">${S.profile.level}</div></div><div class="grow muted">Not just one number: Fluent Path tracks each skill separately and updates them as you practice.</div></div>
  <div style="margin-top:18px">${SKILLS.map(k => `<div class="score-row" style="grid-template-columns:120px 1fr 56px"><span>${SKILL_NAME[k]}</span>${bar(R_.sk[k] / 6)}<b>${lbl(k)}</b></div>`).join('')}</div>
  <div class="grid g2" style="margin-top:20px"><div><h4 style="color:var(--ok)">Strengths</h4><div class="row wrap" style="margin-top:8px">${(R_.strengths.length ? R_.strengths : ['reading comprehension']).map(t => `<span class="chip on">${esc(tn(t))}</span>`).join('')}</div></div><div><h4 style="color:var(--bad)">To work on</h4><div class="row wrap" style="margin-top:8px">${(R_.weaknesses.length ? R_.weaknesses : ['phrasal verbs', 'connectors']).map(t => `<span class="chip">${esc(tn(t))}</span>`).join('')}</div></div></div>
  <p class="muted small" style="margin-top:18px">Based on ${R_.n} adaptive questions${DX.writingA != null ? ', your writing sample' : ''}${DX.speakingA != null ? ' and your speaking sample' : ''}. Estimates sharpen after a few sessions.</p>
  <div class="row" style="margin-top:22px"><button class="btn primary lg" data-a="dxgo">${I('rocket')} Create my plan</button></div></div></div>`;
  DX = null;
}
ACT.dxgo = () => { S.plan = null; saveSoon(); nav('/home'); render(); toast('Your first daily session is ready.', 'rocket'); };

/* ---------------------- SIMULADOS CEFR ---------------------- */
const TEST_SPEC = { B1: [['A2', 6], ['B1', 12], ['B1+', 6]], 'B1+': [['B1', 6], ['B1+', 12], ['B2', 6]], B2: [['B1+', 6], ['B2', 12], ['B2+', 6]], 'B2+': [['B2', 6], ['B2+', 12], ['C1', 6]], C1: [['B2', 6], ['B2+', 6], ['C1', 12]] };
const TEST_NAME = { B1: 'B1 Test', 'B1+': 'B1+ Test', B2: 'B2 Test', 'B2+': 'B2 Advanced Test', C1: 'C1 Test', quick: 'Quick check' };
route(/^\/test\/([\w+]+)$/, m => { const lvl = m[1]; return { html: '<div class="empty">Loading…</div>', after: () => startTest(lvl) }; });
function startTest(level) {
  let items;
  if (level === 'quick') { const A = overallA(S); items = shuffle(CONTENT.dx.filter(x => Math.abs(lvIdx(x.lvl) - A) <= 1.2)).slice(0, 10); }
  else { items = []; (TEST_SPEC[level] || TEST_SPEC.B2).forEach(([l, n]) => items.push(...shuffle(CONTENT.dx.filter(x => x.lvl === l)).slice(0, n))); items = shuffle(items); }
  DX = { kind: 'test', level, title: TEST_NAME[level] || 'Test', items, i: 0, ans: [], cur: null, plays: 0 }; dxNextScreen();
}
function dxFinishTest() {
  const X = DX, n = X.ans.length, ok = X.ans.filter(a => a.ok).length; const tgt = X.level === 'quick' ? null : X.level;
  const tAns = tgt ? X.ans.filter(a => a.lvl === tgt) : X.ans; const tAcc = tAns.length ? tAns.filter(a => a.ok).length / tAns.length : ok / n; const acc = ok / n;
  const pass = tgt ? (tAcc >= .7 && acc >= .65) : acc >= .7; const by = {}; X.ans.forEach(a => { const s = DX_SKILL[a.skill] || 'grammar'; const b = by[s] || (by[s] = { n: 0, ok: 0 }); b.n++; if (a.ok) b.ok++; });
  const byLv = {}; X.ans.forEach(a => { const b = byLv[a.lvl] || (byLv[a.lvl] = { n: 0, ok: 0 }); b.n++; if (a.ok) b.ok++; });
  S.assess.push({ type: 'test', testLevel: tgt || 'quick', pass, acc, at: Date.now(), by }); ev('test_completed', { level: X.level, acc: Math.round(acc * 100) });
  const weakSk = Object.keys(by).filter(k => by[k].n >= 2).sort((a, b) => by[a].ok / by[a].n - by[b].ok / by[b].n).slice(0, 2);
  checkAch(); save();
  const body = `<div style="max-width:760px;margin:0 auto;padding:36px 0"><div class="card" style="padding:30px"><div class="rlabel">${I('flag')} ${esc(X.title)} · report</div><h1 style="margin-top:10px">${tgt ? (pass ? `You passed ${esc(tgt)}` : `Not yet at ${esc(tgt)}`) : `${Math.round(acc * 100)}% correct`}</h1><p class="muted" style="margin-top:6px">${ok} of ${n} correct${tgt ? ` · ${Math.round(tAcc * 100)}% on ${esc(tgt)} questions (need 70%)` : ''}.</p>
  <div style="margin-top:18px"><h4>By level</h4>${Object.keys(byLv).sort((a, b) => lvIdx(a) - lvIdx(b)).map(l => `<div class="score-row" style="grid-template-columns:70px 1fr 60px"><span>${lvTag(l)}</span>${bar(byLv[l].ok / byLv[l].n, byLv[l].ok / byLv[l].n >= .7 ? 'ok' : 'acc')}<b>${byLv[l].ok}/${byLv[l].n}</b></div>`).join('')}</div>
  <div style="margin-top:14px"><h4>By skill</h4>${Object.keys(by).map(k => `<div class="score-row"><span>${SKILL_NAME[k] || k}</span>${bar(by[k].ok / by[k].n, by[k].ok / by[k].n >= .7 ? 'ok' : 'acc')}<b>${by[k].ok}/${by[k].n}</b></div>`).join('')}</div>
  <p class="small muted" style="margin-top:14px">${weakSk.length ? 'Focus next on: ' + weakSk.map(k => SKILL_NAME[k]).join(' and ') + '.' : ''} A pass here is one piece of advancing to ${esc(S.profile.target || 'your target')}: it also needs solid mastery across all skills.</p>
  <div class="row" style="margin-top:20px"><button class="btn primary lg" data-a="nav" data-to="/roadmap">${I('map')} Back to roadmap</button><button class="btn lg" data-a="nav" data-to="/home">Home</button></div></div></div>`;
  $('#view').innerHTML = body; DX = null; window.scrollTo(0, 0);
}

/* ---------------------- ROLEPLAY / REAL WORLD ---------------------- */
function startRoleplay(id) {
  const sc = IDX.rp[id]; if (!sc) return; closeRunner(true); Speech.stop();
  R = { rp: true, sc, msgs: [{ who: 'ai', text: sc.opening }], fu: 0, turns: 0, met: {}, t0: Date.now(), res: [], opts: {}, queue: [], i: 0, busy: false };
  const o = document.createElement('div'); o.id = 'runner';
  o.innerHTML = `<div class="rtop"><button class="iconbtn" data-a="rpquit" aria-label="Close">${I('x')}</button><div class="grow"><div class="b">${esc(sc.title)}</div><div class="small muted">${esc(sc.persona)}</div></div>${lvTag(sc.lvl)}</div><div class="rbody"><div class="rwrap"><div class="rsub small"><b>Situation:</b> ${esc(sc.situation)}<div class="muted" style="margin-top:6px">${sc.objectives.length} hidden objectives · respond like you would in real life</div></div><div class="chat" id="chat"></div></div></div>
  <div class="rbar"><div class="in"><textarea id="rpin" rows="1" placeholder="Type your reply (or use the mic)…" style="flex:1;min-height:48px;max-height:120px;border-radius:14px"></textarea>${Speech.sttOk ? `<button class="iconbtn" data-a="rpmic" id="rpm" style="width:48px;height:48px" aria-label="Mic">${I('mic')}</button>` : ''}<button class="btn primary" data-a="rpsend">${I('send')}</button><button class="btn ghost sm" data-a="rpend">Finish</button></div></div>`;
  document.body.appendChild(o); document.body.style.overflow = 'hidden'; rpDraw(); $('#rpin').focus();
  Speech.speak(sc.opening, { rate: S.settings.speed, accent: 'us' });
  $('#rpin').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ACT.rpsend(); } });
}
function rpDraw() { const c = $('#chat'); if (!c) return; c.innerHTML = R.msgs.map(m => `<div class="msg ${m.who === 'me' ? 'me' : 'ai'}">${m.who === 'ai' ? sayBtn(m.text) + ' ' : ''}${esc(m.text)}</div>`).join('') + (R.busy ? '<div class="msg ai muted">…</div>' : ''); const b = $('#runner .rbody'); if (b) b.scrollTo({ top: b.scrollHeight, behavior: 'smooth' }); }
ACT.rpquit = () => { closeRunner(); };
ACT.rpmic = () => { const b = $('#rpm'); if (R.rec) { R.rec.stop(); R.rec = null; b.classList.remove('rec'); return; } const inp = $('#rpin'); b.classList.add('rec'); R.rec = Speech.listen({ onText: t => inp.value = t, onEnd: () => { const x = $('#rpm'); if (x) x.classList.remove('rec'); R.rec = null; }, onError: () => { const x = $('#rpm'); if (x) x.classList.remove('rec'); R.rec = null; } }); };
function rpUserText() { return R.msgs.filter(m => m.who === 'me').map(m => m.text).join(' '); }
function rpUpdateMet() { const t = rpUserText(); R.sc.objectives.forEach(o => { try { if (new RegExp(o.re, 'i').test(t)) R.met[o.id] = 1; } catch (e) { } }); }
ACT.rpsend = async () => {
  if (R.busy) return; if (R.rec) { R.rec.stop(); R.rec = null; } const inp = $('#rpin'); const text = inp.value.trim(); if (!text) return; inp.value = ''; Speech.stop();
  R.msgs.push({ who: 'me', text }); R.turns++; rpUpdateMet(); R.busy = true; rpDraw();
  const done = () => R.turns >= 4 || Object.keys(R.met).length === R.sc.objectives.length && R.turns >= 3;
  let reply = null;
  if (AIService.enabled()) { try { const r = await AIService.roleplayTurn(R.sc, R.msgs.slice(0, -1), text); reply = r.reply; (r.objectivesMet || []).forEach(id => R.met[id] = 1); } catch (e) { toast('AI unavailable — continuing offline.', 'alert'); } }
  if (reply == null) { const f = R.sc.followups || []; reply = R.fu < f.length ? f[R.fu++] : null; }
  R.busy = false;
  if (reply && !done()) { R.msgs.push({ who: 'ai', text: reply }); rpDraw(); Speech.speak(reply, { rate: S.settings.speed, accent: 'us' }); $('#rpin').focus(); }
  else { rpDraw(); rpFinish(); }
};
ACT.rpend = () => { if (R.turns < 1) { closeRunner(); return; } rpFinish(); };
function rpFinish() {
  const sc = R.sc, text = rpUserText(); rpUpdateMet(); const an = analyzeText(text, { src: 'speak' });
  const total = sc.objectives.length, met = sc.objectives.filter(o => R.met[o.id]).length; const avgSc = avg([an.scores.grammar, an.scores.vocabulary, an.scores.naturalness, an.scores.clarity, an.scores.connectors]) / 100;
  const score = clamp(.6 * (met / total) + .4 * avgSc, 0, 1);
  creditProduction(text, an, [], { prompt: sc.title }); S.lastSpeak = Date.now(); S.analyses.push({ ...an, text: text.slice(0, 400), prompt: sc.title }); if (S.analyses.length > 80) S.analyses.shift();
  const out = recordResult({ kind: 'spk', skill: 'speaking', lvl: sc.lvl, type: 'convo', wtype: 'convo', cid: null, ref: sc.id }, { ok: score >= .6, score, rt: Math.max(90000, Date.now() - R.t0) });
  S.sessions.push({ at: Date.now(), min: Math.round((Date.now() - R.t0) / 6000) / 10, n: 1, ok: score >= .6 ? 1 : 0, xp: out.gain, kind: 'roleplay' }); ev('speaking_completed', { id: sc.id, score: Math.round(score * 100) }); checkAch(); save();
  const o = $('#runner'); Speech.stop();
  o.innerHTML = `<div class="rbody"><div class="rwrap" style="padding-top:4vh"><div class="center"><div style="font-size:2.6rem;color:var(--acc)">${I(met === total ? 'trophy' : 'target')}</div><h1>${met === total ? 'Mission accomplished' : met >= total / 2 ? 'Good job' : 'Keep practicing'}</h1><p class="muted">${esc(sc.title)} · +${out.gain} XP</p></div>
  <div class="card"><h4>Hidden objectives</h4>${sc.objectives.map(ob => `<div class="row" style="margin-top:10px;align-items:flex-start"><div class="ico ${R.met[ob.id] ? 'ok' : 'warn'}" style="width:32px;height:32px;font-size:1rem">${I(R.met[ob.id] ? 'check' : 'x')}</div><div><b class="small">${esc(ob.label)}</b>${R.met[ob.id] ? '' : `<div class="small muted">${esc(ob.hint)}</div>`}</div></div>`).join('')}</div>
  <div class="card">${analysisHTML(an, [])}</div><div class="card"><h4>Model answer</h4><p class="small" style="margin-top:6px">“${esc(sc.model)}” ${sayBtn(sc.model)}</p></div>
  <div class="row" style="justify-content:center;margin:10px 0 40px"><button class="btn primary lg" data-a="rdone">${I('home')} Done</button><button class="btn lg" data-a="rpagain" data-id="${sc.id}">${I('refresh')} Try again</button></div></div></div>`;
  R.rp = false;
}
ACT.rpagain = el => startRoleplay(el.dataset.id);
