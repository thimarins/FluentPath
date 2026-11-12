/* ============================================================
   FLUENT PATH — RUNNER (tela de exercício) + RESUMO DA SESSÃO
   Foco total no exercício. Feedback curto: Your answer / Better /
   Why / Try again / Hint / Another example / Explain more.
   ============================================================ */
let R = null;
const lev = (a, b) => { const m = a.length, n = b.length; if (!m) return n; if (!n) return m; let p = Array.from({ length: n + 1 }, (_, i) => i); for (let i = 1; i <= m; i++) { const c = [i]; for (let j = 1; j <= n; j++) c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); p = c; } return p[n]; };
const nrm = s => norm(s).replace(/'/g, '');
const BLOCK_ICON = { read: 'book', warm: 'zap', vocab: 'book-open', listen: 'headphones', grammar: 'puzzle', speak: 'mic', write: 'pen', repair: 'wrench', challenge: 'flame', q: 'zap' };
const BLOCK_LABEL = { read: 'Reading', warm: 'Warm-up', vocab: 'Vocabulary recall', listen: 'Listening', grammar: 'Grammar challenge', speak: 'Speaking', write: 'Writing', repair: 'Correction', challenge: 'Mini challenge', q: 'Practice' };

function startRunner(plan, opts = {}) {
  if (!plan || !plan.items || !plan.items.length) { toast('Nothing to practice here yet.', 'alert'); return; }
  Speech.stop(); closeRunner(true);
  R = { plan, queue: plan.items.slice(), i: 0, res: [], t0: Date.now(), opts, xp: 0, mistakes: 0, levelUps: [], followed: {}, newItems: 0, blocks: {} };
  const o = document.createElement('div'); o.id = 'runner';
  o.innerHTML = `<div class="rtop"><button class="iconbtn" data-a="rquit" aria-label="Close">${I('x')}</button><div class="bar"><i id="rprog" style="width:0"></i></div><span class="small b muted" id="rcount"></span><button class="iconbtn" data-a="rsound" id="rsnd" aria-label="Sound effects" style="width:34px;height:34px">${I(S.settings.sound ? 'volume' : 'volume-x')}</button></div>
  <div class="rbody"><div class="rwrap" id="rmain"></div></div><div class="rbar"><div class="in" id="rctl"></div></div>`;
  document.body.appendChild(o); document.body.style.overflow = 'hidden'; showItem();
}
function closeRunner(silent) { const o = $('#runner'); if (o) { o.remove(); } document.body.style.overflow = ''; Speech.stop(); if (R && R.timer) clearInterval(R.timer); if (R && R.rec) { try { R.rec.stop(); } catch (e) { } } if (!silent && S && S.onboarded) { R = null; render(); } else R = null; }
ACT.rquit = () => { if (R && R.res.length) finishSession(true); else closeRunner(); };
const setCtl = html => { $('#rctl').innerHTML = html; };

function showItem() {
  if (!R) return;
  if (R.timer) { clearInterval(R.timer); R.timer = null; }
  const it = R.queue[R.i]; if (!it) return finishSession();
  R.cur = { item: it, t0: Date.now(), hints: 0, phase: 'answer', tries: 0, sel: null, placed: [], extra: {} };
  $('#rprog').style.width = (R.i / R.queue.length * 100) + '%'; $('#rcount').textContent = (R.i + 1) + ' / ' + R.queue.length;
  const blk = BLOCK_LABEL[it.block] || 'Practice';
  const head = `<div class="rlabel">${I(BLOCK_ICON[it.block] || 'zap')}<span>${blk}</span><span>·</span><span>${it.kind === 'lis' || it.kind === 'spk' || it.kind === 'wri' ? (it.mode === 'read' ? 'Reading' : SKILL_NAME[it.skill] || '') : TIER_NAME[it.tier] || ''}</span>${lvTag(it.lvl)}<span class="grow"></span><button class="why" data-a="rwhy">${I('help')} Why this?</button></div>`;
  R.cur.head = head; renderItem();
  const autoplay = it.tts && ['mcq', 'typed'].includes(it.type) && it.kind !== 'nat' && false;
  window.scrollTo(0, 0); const rb = $('#runner .rbody'); if (rb) rb.scrollTop = 0;
}
function renderItem() {
  const it = R.cur.item, head = R.cur.head;
  if (it.intro && !R.cur.introDone) {
    $('#rmain').innerHTML = head.replace('Why this?', 'Why this?') + introBody(it);
    setCtl('<span class="muted small">New: learn it first, then you will be tested</span><button class="btn primary lg" data-a="rintro" id="rgo">Got it, test me ' + I('arrow') + '</button>'); const b = $('#rgo'); b && b.focus(); return;
  }
  const body = BODY[it.type] ? BODY[it.type](it) : '<p>Unsupported exercise</p>';
  $('#rmain').innerHTML = head + body;
  const bind = BIND[it.type]; if (bind) bind(it);
}
ACT.rintro = () => { R.cur.introDone = true; R.cur.t0 = Date.now(); renderItem(); };
function introBody(it) {
  const c = it.card, pt = ptHelpOn(S); let h = '';
  if (c.type === 'word') { const w = IDX.words[c.id]; h = `<div class="rlabel">${I('sparkles')} New word</div><div class="card" style="padding:22px"><div class="row wrap">${lvTag(w.lvl)}<span class="tag a">${esc(w.pos)}</span></div><div class="row" style="margin-top:8px"><h2 style="font-size:2.1rem">${esc(w.w)}</h2>${sayBtn(w.w)}</div><div class="muted">${esc(w.ipa || '')}</div><p style="margin-top:12px;font-size:1.1rem">${pt ? '<b>' + esc(w.pt) + '</b> · ' : ''}${esc(w.def)}</p><p style="margin-top:8px">“${esc(w.ex)}” ${sayBtn(w.ex)}</p>${(w.col || []).length ? '<div class="row wrap" style="margin-top:10px">' + w.col.slice(0, 4).map(x => '<span class="chip">' + esc(x) + '</span>').join('') + '</div>' : ''}${w.mis ? '<div class="mis" style="margin-top:12px"><div class="bad">✗ ' + esc(w.mis.bad) + '</div><div class="good">✓ ' + esc(w.mis.good) + '</div></div>' : ''}</div>`; }
  else if (c.type === 'phr') { const p = IDX.phr[c.id]; h = `<div class="rlabel">${I('sparkles')} New phrasal verb</div><div class="card" style="padding:22px"><div class="row wrap">${lvTag(p.lvl)}<span class="tag a">${p.sep ? 'separable' : 'inseparable'}</span></div><div class="row" style="margin-top:8px"><h2 style="font-size:2.1rem">${esc(p.v + ' ' + p.p)}</h2>${sayBtn(p.v + ' ' + p.p)}</div><p style="margin-top:12px;font-size:1.1rem">${pt ? '<b>' + esc(p.pt) + '</b> · ' : ''}${esc(p.def)}</p><p style="margin-top:8px">“${esc(p.ex)}” ${sayBtn(p.ex)}</p><p class="muted small" style="margin-top:4px">“${esc(p.nat)}”</p>${p.formal ? '<p class="small" style="margin-top:8px">More formal: <b>' + esc(p.formal) + '</b></p>' : ''}${p.contrast ? '<p class="small muted" style="margin-top:6px">' + esc(p.contrast) + '</p>' : ''}</div>`; }
  else if (c.type === 'gram') { const g = IDX.gr[c.id]; h = `<div class="rlabel">${I('sparkles')} New grammar topic</div><div class="card" style="padding:22px"><div class="row wrap">${lvTag(g.lvl)}</div><h2 style="margin-top:8px">${esc(g.name)}</h2><p class="b" style="color:var(--pri);margin-top:6px">${esc(g.form || '')}</p><p style="margin-top:10px;line-height:1.6">${esc(pt ? g.pt : g.en)}</p><div class="stack" style="margin-top:12px">${g.ex.slice(0, 2).map(x => '<div class="rsub" style="padding:10px 14px;font-size:1rem">' + esc(x) + ' ' + sayBtn(x) + '</div>').join('')}</div>${g.mistakes && g.mistakes[0] ? '<div class="mis" style="margin-top:12px"><div class="bad">✗ ' + esc(g.mistakes[0].bad) + '</div><div class="good">✓ ' + esc(g.mistakes[0].good) + '</div><div class="small muted">' + esc(g.mistakes[0].why) + '</div></div>' : ''}</div>`; }
  return h;
}
ACT.rwhy = () => { const it = R.cur.item; modal(`<h3>Why am I seeing this?</h3><p style="margin-top:10px">${esc(it.reason || 'Chosen to keep you slightly above your comfort zone.')}</p><div class="sec" style="margin-top:16px"><h4 class="muted tiny" style="text-transform:uppercase;letter-spacing:.08em">Learning ladder</h4><div class="row wrap" style="margin-top:8px">${TIER_NAME.map((n, i) => `<span class="chip ${i === it.tier ? 'on' : ''}">${i + 1}. ${n}</span>`).join('')}</div><p class="small muted" style="margin-top:10px">Recognizing an answer is not mastery. You only reach 100% when you can produce and use the structure on your own.</p></div>`); };

/* ---------- feedback ---------- */
function fbBlock(kind, title, bodyHTML, acts = '') { return `<div class="fb ${kind}" id="rfbk"><div class="t">${I(kind === 'ok' ? 'check-circle' : kind === 'part' ? 'alert' : 'x-circle')} ${title}</div><div class="d">${bodyHTML}</div><div class="acts">${acts}</div></div>`; }
function showFeedback(html) { const m = $('#rmain'); const old = $('#rfbk'); if (old) old.remove(); m.insertAdjacentHTML('beforeend', html); const rb = $('#runner .rbody'); rb.scrollTo({ top: rb.scrollHeight, behavior: 'smooth' }); }
function actsFor(it, ok, canRetry = true, extra = '') {
  const sim = !ok ? similarItem(S, it) : null;
  return `${!ok && canRetry ? `<button class="btn sm" data-a="rretry">${I('refresh')} Try again</button>` : ''}${!ok && it.hint && !R.cur.hintShown ? `<button class="btn sm" data-a="rhint">${I('bulb')} Hint</button>` : ''}${sim ? `<button class="btn sm" data-a="ranother">${I('plus')} Another example</button>` : ''}<button class="btn sm" data-a="rexplain">${I('help')} Explain more</button>${extra}`;
}
ACT.rhint = () => { const c = R.cur, it = c.item; c.hints++; c.hintShown = true; toast('Hint: <b>' + esc(it.hint) + '</b>', 'bulb'); };
ACT.rexplain = async () => {
  const it = R.cur.item; let h = `<h3>Explain more</h3>`;
  if (it.why) h += `<div class="d" style="margin-top:10px">${it.why}</div>`;
  if (it.card) { const g = it.card.type === 'gram' ? IDX.gr[it.card.id] : null; if (g) h += `<div class="sec" style="margin-top:14px"><h4>${esc(g.name)}</h4><p class="small">${esc(g.en)}</p><p class="small muted" style="margin-top:6px">${esc(g.pt)}</p><p class="small b" style="margin-top:8px">${esc(g.form || '')}</p>${g.mistakes && g.mistakes[0] ? `<div class="mis" style="margin-top:10px"><div class="bad">✗ ${esc(g.mistakes[0].bad)}</div><div class="good">✓ ${esc(g.mistakes[0].good)}</div><div class="small muted">${esc(g.mistakes[0].why)}</div></div>` : ''}</div>`; else h += `<div style="margin-top:12px"><button class="btn sm" data-a="card" data-t="${it.card.type}" data-id="${it.card.id || ''}" data-cat="${it.card.cat || ''}">Open full card</button></div>`; }
  if (AIService.enabled() && R.cur.lastYours) h += `<div id="aiex" class="muted small" style="margin-top:14px">${I('sparkles')} Asking the tutor…</div>`;
  modal(h);
  if (AIService.enabled() && R.cur.lastYours) { try { const r = await AIService.explainMistake({ yours: R.cur.lastYours, good: it.correctText || '', q: it.q }); const e = $('#aiex'); if (e) e.innerHTML = `<b>Tutor:</b> ${esc(r.explanation)}<br><span class="muted">Example: ${esc(r.example)}</span>`; } catch (e) { const x = $('#aiex'); if (x) x.textContent = 'AI unavailable: ' + e.message; } }
};
ACT.ranother = () => { const sim = similarItem(S, R.cur.item); if (sim) { sim.block = R.cur.item.block; sim.reason = 'Similar example to confirm you got it.'; R.queue.splice(R.i + 1, 0, sim); toast('Added a similar exercise next.', 'plus'); } };
ACT.rretry = () => {
  const c = R.cur, it = c.item; c.tries++; c.phase = 'answer'; const old = $('#rfbk'); if (old) old.remove();
  if (it.type === 'mcq') { $$('.opt').forEach(b => { if (!b.classList.contains('no')) b.classList.remove('sel', 'ok'); else { b.classList.add('dim'); b.disabled = true; } }); c.sel = null; setCtl(`<span class="muted small">Pick another option</span><button class="btn primary lg" data-a="rcheck" disabled id="rgo">Check</button>`); }
  else if (it.type === 'order') { c.placed = []; BIND.order(it); }
  else { const inp = $('#rin'); if (inp) { inp.disabled = false; inp.focus(); inp.select && inp.select(); } setCtl(`<span class="muted small">Try once more</span><button class="btn primary lg" data-a="rcheck" id="rgo">Check</button>`); }
};
function continueBtn(label = 'Continue') { setCtl(`<span class="muted small" id="rhelp"></span><button class="btn primary lg" data-a="rnext" id="rgo">${label} ${I('arrow')}</button>`); const b = $('#rgo'); b && b.focus(); }
ACT.rnext = () => { if (R.cur && R.cur.onNext) { const f = R.cur.onNext; R.cur.onNext = null; f(); return; } R.i++; showItem(); };

/* ---------- registro + feedback comum ---------- */
function commit(it, g) {
  const c = R.cur; if (c.phase === 'done') return;
  c.phase = 'done'; const rt = Date.now() - c.t0; c.lastYours = g.yours;
  const out = recordResult(it, { ok: g.ok, score: g.score, rt: g.rt || rt, hints: c.hints, yours: g.yours, correct: g.correct, why: g.whyPlain, qText: g.qText || (it.sub ? it.sub.replace(/<[^>]+>/g, '') : it.q.replace(/<[^>]+>/g, '')) });
  R.res.push({ item: it, ok: out.ok, score: out.score, gain: out.gain, dm: out.dm, block: it.block, retried: c.tries > 0 }); R.xp += out.gain;
  if (!out.ok && it.cid) R.mistakes++; if (out.levelUp) R.levelUps.push(out.levelUp);
  if (it.cid && S.c[it.cid] && S.c[it.cid].seen === 1) R.newItems++;
  SFX.play(out.ok ? 'ok' : 'bad');
  if (out.ok) { const x = document.createElement('div'); x.className = 'xp'; x.textContent = '+' + out.gain + ' XP'; document.body.appendChild(x); setTimeout(() => x.remove(), 1000); }
  else if (it.cid && !R.followed[it.cid]) { const sim = similarItem(S, it); if (sim) { R.followed[it.cid] = 1; sim.block = it.block; sim.reason = 'Error recovery: a similar example right after your mistake.'; R.queue.splice(R.i + 1, 0, sim); } }
  return out;
}
const hasSimilar = it => !!it.cid;

/* ======================= TIPOS DE EXERCÍCIO ======================= */
const BODY = {}, BIND = {};
const tapText = t => String(t).split(/([A-Za-z][A-Za-z'’-]*)/).map((p, i) => i % 2 ? '<span class="tw" data-a="lkword" data-w="' + esc(p.replace(/’/g, "'")) + '">' + esc(p) + '</span>' : esc(p)).join('').replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
const rq = it => `<div class="rq">${it.q}</div>${it.sub ? `<div class="rsub">${it.sub}${it.tts ? ' ' + sayBtn(it.tts) : ''}</div>` : ''}${it.clue ? `<div class="rclue">${I('bulb')} ${esc(it.clue)}</div>` : ''}`;

/* --- múltipla escolha --- */
BODY.mcq = it => rq(it) + `<div class="stack" id="opts">${it.opts.map((o, i) => `<button class="opt" data-a="rsel" data-i="${i}"><span class="k">${i + 1}</span><span>${o}</span></button>`).join('')}</div>`;
BIND.mcq = it => { setCtl(`<button class="btn ghost sm" data-a="rskip">Skip</button><button class="btn primary lg" data-a="rcheck" disabled id="rgo">Check</button>`); };
ACT.rsel = el => { const c = R.cur; if (c.phase !== 'answer') return; $$('.opt').forEach(b => b.classList.remove('sel')); el.classList.add('sel'); c.sel = +el.dataset.i; const b = $('#rgo'); if (b) b.disabled = false; };
ACT.rskip = () => { const it = R.cur.item; commit(it, { ok: false, score: 0, yours: '(skipped)', correct: it.correctText || '', whyPlain: '', record: false }); $$('.opt').forEach((b, i) => { if (i === it.ans) b.classList.add('ok'); else b.classList.add('dim'); }); showFeedback(fbBlock('bad', 'Skipped', `<b>Answer:</b> ${esc(it.correctText || it.opts[it.ans])}<br>${it.why || ''}`, actsFor(it, false, false))); continueBtn(); };
function gradeMcq() {
  const c = R.cur, it = c.item; if (c.sel == null) return;
  const ok = c.sel === it.ans; const first = c.tries === 0;
  $$('.opt').forEach((b, i) => { b.disabled = true; if (i === c.sel) b.classList.add(ok ? 'ok' : 'no'); else if (ok || !first) { if (i === it.ans && (ok)) b.classList.add('ok'); else b.classList.add('dim'); } else b.classList.add('dim'); });
  if (!first) { c.phase = 'done'; if (ok) { $$('.opt')[it.ans].classList.add('ok'); showFeedback(fbBlock('part', 'Right this time', it.why || '', actsFor(it, true))); } else showFeedback(fbBlock('bad', 'Still not it', `<b>Better:</b> ${esc(it.correctText || it.opts[it.ans])}<br>${it.why || ''}`, actsFor(it, false, false))); continueBtn(); return; }
  commit(it, { ok, score: ok ? (c.hints ? .85 : 1) : 0, yours: it.opts[c.sel], correct: it.correctText || it.opts[it.ans], whyPlain: String(it.why || '').replace(/<[^>]+>/g, '') });
  if (ok) showFeedback(fbBlock('ok', pick(['Correct!', 'Nice!', 'Exactly.', 'Well done!']), it.why || '', actsFor(it, true)));
  else { $$('.opt')[it.ans].classList.add('ok'); showFeedback(fbBlock('bad', 'Not quite', `<b>Your answer:</b> ${it.opts[c.sel]}<br><b>Better:</b> ${it.opts[it.ans]}<br><b>Why:</b> ${it.why || ''}`, actsFor(it, false))); }
  continueBtn();
}

/* --- digitar --- */
BODY.typed = it => rq(it) + `<input type="text" id="rin" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type your answer…" style="font-size:1.15rem;padding:14px 16px">`;
BIND.typed = it => { setCtl(`<button class="btn ghost sm" data-a="rhint">${I('bulb')} Hint</button><button class="btn primary lg" data-a="rcheck" id="rgo">Check</button>`); const i = $('#rin'); setTimeout(() => i && i.focus(), 60); };
function gradeTyped() {
  const c = R.cur, it = c.item, inp = $('#rin'); const val = inp.value.trim(); if (!val) { inp.focus(); return; }
  const na = nrm(val); const accs = it.acc.map(nrm);
  let ok = accs.includes(na), score = ok ? 1 : 0, note = '';
  if (!ok && it.fuzzy) { const best = Math.max(...it.acc.map(a => sim(val, a))); if (best >= it.fuzzy) { ok = true; score = .9; note = 'Very close — almost identical.'; } }
  if (!ok && !it.fuzzy) { const near = accs.find(a => a.length >= 5 && lev(a, na) === 1 && !a.includes(' ') === !na.includes(' ')); if (near) { ok = true; score = .85; note = `Watch the spelling: <b>${esc(it.acc[accs.indexOf(near)])}</b>`; } }
  const correct = it.correctText || it.acc[0];
  if (c.tries > 0) { c.phase = 'done'; inp.disabled = true; showFeedback(ok ? fbBlock('part', 'Right this time', it.why || '', actsFor(it, true)) : fbBlock('bad', 'Still not it', `<b>Better:</b> ${esc(correct)}<br>${it.why || ''}`, actsFor(it, false, false))); continueBtn(); return; }
  inp.disabled = true;
  commit(it, { ok, score: c.hints && ok ? Math.min(score, .85) : score, yours: val, correct, whyPlain: String(it.why || '').replace(/<[^>]+>/g, '') });
  if (ok) showFeedback(fbBlock(score < 1 ? 'part' : 'ok', score < 1 ? 'Almost!' : pick(['Correct!', 'Nice!', 'Exactly.']), `${note ? note + '<br>' : ''}${it.why || ''}`, actsFor(it, true)));
  else showFeedback(fbBlock('bad', 'Not quite', `<b>Your answer:</b> ${esc(val)}<br><b>Better:</b> ${esc(correct)}<br><b>Why:</b> ${it.why || ''}`, actsFor(it, false)));
  continueBtn();
}

/* --- montar frase --- */
BODY.order = it => rq(it) + `<div class="answer-line" id="aline"></div><div class="row wrap" id="bank" style="gap:10px"></div>`;
BIND.order = it => {
  const c = R.cur; c.placed = []; c.bank = shuffle(it.seq.map((w, i) => ({ w, i })));
  if (c.bank.length > 2 && c.bank.every((b, k) => b.i === k)) c.bank.reverse();
  const draw = () => {
    $('#aline').innerHTML = c.placed.map((p, k) => `<button class="wchip" data-a="runplace" data-k="${k}">${esc(p.w)}</button>`).join('') + (it.trail && c.placed.length === it.seq.length ? `<span class="b" style="align-self:center">${esc(it.trail)}</span>` : '');
    $('#bank').innerHTML = c.bank.map(b => `<button class="wchip ${c.placed.includes(b) ? 'used' : ''}" data-a="rplace" data-i="${b.i}">${esc(b.w)}</button>`).join('');
    const g = $('#rgo'); if (g) g.disabled = c.placed.length !== it.seq.length;
  };
  c.draw = draw; setCtl(`<button class="btn ghost sm" data-a="rclear">Reset</button><button class="btn primary lg" data-a="rcheck" disabled id="rgo">Check</button>`); draw();
};
ACT.rplace = el => { const c = R.cur; if (c.phase !== 'answer') return; const b = c.bank.find(x => x.i === +el.dataset.i && !c.placed.includes(x)); if (b) { c.placed.push(b); c.draw(); } };
ACT.runplace = el => { const c = R.cur; if (c.phase !== 'answer') return; c.placed.splice(+el.dataset.k, 1); c.draw(); };
ACT.rclear = () => { const c = R.cur; if (c.phase !== 'answer') return; c.placed = []; c.draw(); };
function gradeOrder() {
  const c = R.cur, it = c.item; const val = c.placed.map(p => p.w).join(' ');
  const ok = nrm(val) === nrm(it.seq.join(' ')); const correct = it.correctText || it.seq.join(' ');
  if (c.tries > 0) { c.phase = 'done'; showFeedback(ok ? fbBlock('part', 'Right this time', it.why || '', actsFor(it, true)) : fbBlock('bad', 'Still not it', `<b>Better:</b> ${esc(correct)}<br>${it.why || ''}`, actsFor(it, false, false))); continueBtn(); return; }
  commit(it, { ok, score: ok ? 1 : 0, yours: val, correct, whyPlain: String(it.why || '').replace(/<[^>]+>/g, '') });
  $$('#aline .wchip').forEach(b => b.disabled = true);
  if (ok) showFeedback(fbBlock('ok', 'Perfect order!', `“${esc(correct)}” ${sayBtn(correct)}<br>${it.why || ''}`, actsFor(it, true)));
  else showFeedback(fbBlock('bad', 'Not quite', `<b>Your answer:</b> ${esc(val)}<br><b>Better:</b> ${esc(correct)}<br><b>Why:</b> ${it.why || ''}`, actsFor(it, false)));
  continueBtn();
}

/* --- traduzir PT → EN (naturalidade, não só certo/errado) --- */
BODY.translate = it => rq(it) + `<textarea id="rin" rows="2" style="min-height:90px;font-size:1.1rem" placeholder="Write it in English…"></textarea>`;
BIND.translate = it => { setCtl(`<button class="btn ghost sm" data-a="rskipT">Skip</button><button class="btn primary lg" data-a="rcheck" id="rgo">Check</button>`); setTimeout(() => $('#rin') && $('#rin').focus(), 60); };
ACT.rskipT = () => { const it = R.cur.item; commit(it, { ok: false, score: 0, yours: '(skipped)', correct: it.natural, whyPlain: '', record: false }); showFeedback(fbBlock('bad', 'Skipped', `<b>Natural:</b> ${esc(it.natural)}<br>${it.why}`, actsFor(it, false, false))); continueBtn(); };
function gradeTranslate() {
  const c = R.cur, it = c.item, inp = $('#rin'); const val = inp.value.trim(); if (!val) { inp.focus(); return; }
  const sN = sim(val, it.natural), sU = sim(val, it.understandable); const understood = Math.max(sN, sU) >= .45;
  const natPct = Math.round(clamp(Math.max(sN, sU * .72), 0, 1) * 100);
  const need = it.tier >= 3 ? .82 : .7; const ok = sN >= need; const partial = !ok && understood;
  const an = analyzeText(val, { src: 'write' }); const pre = an.errors[0];
  if (c.tries > 0) { c.phase = 'done'; inp.disabled = true; showFeedback(ok ? fbBlock('part', 'Right this time', it.why, actsFor(it, true)) : fbBlock('bad', 'Still not natural', `<b>Better:</b> ${esc(it.natural)}<br>${it.why}`, actsFor(it, false, false))); continueBtn(); return; }
  inp.disabled = true;
  commit(it, { ok, score: ok ? 1 : partial ? .5 : 0, yours: val, correct: it.natural, whyPlain: it.why.replace(/<[^>]+>/g, ''), qText: it.sub.replace(/<[^>]+>/g, '') });
  const meter = `<div class="score-row"><span>Understandable</span>${bar(understood ? 1 : .2, understood ? 'ok' : 'bad')}<b>${understood ? '✓' : '✗'}</b></div><div class="score-row"><span>Naturalness</span>${bar(natPct / 100, natPct >= 70 ? 'ok' : 'acc')}<b>${natPct}%</b></div>`;
  showFeedback(fbBlock(ok ? 'ok' : partial ? 'part' : 'bad', ok ? 'Natural and correct!' : partial ? 'Understandable, but not natural yet' : 'Not quite', `${meter}${ok ? '' : `<b>Your answer:</b> ${esc(val)}<br>`}<b>Better:</b> “${esc(it.natural)}” ${sayBtn(it.natural)}<br><b>Why:</b> ${it.why.replace(/^<b>Natural:<\/b>[^<]*<br>/, '')}${pre ? `<br><span class="muted small">Also check: ${esc(pre.bad)} → ${esc(pre.good)}</span>` : ''}`, actsFor(it, ok, !ok)));
  continueBtn();
}

/* --- produção livre (frase própria / conectores / gramática) --- */
BODY.produce = it => rq(it) + `<textarea id="rin" placeholder="Write here…" style="min-height:110px;font-size:1.05rem"></textarea><div class="small muted" id="rneed"></div>`;
BIND.produce = it => {
  const upd = () => { const t = $('#rin').value; const an = analyzeText(t); const parts = []; if (it.need && it.need.conn) parts.push(`connectors: <b>${an.connectors.filter(x => it.need.conn.map(y => y.toLowerCase()).includes(x.c)).length}</b>/${it.need.minConn}`); parts.push(`${tokens(t).length} words`); $('#rneed').innerHTML = parts.join(' · '); };
  setCtl(`<button class="btn ghost sm" data-a="rskipP">Skip</button><button class="btn primary lg" data-a="rcheck" id="rgo">Check</button>`);
  const i = $('#rin'); i.addEventListener('input', upd); upd(); setTimeout(() => i.focus(), 60);
};
ACT.rskipP = () => { const it = R.cur.item; commit(it, { ok: false, score: 0, yours: '(skipped)', correct: '', record: false }); showFeedback(fbBlock('bad', 'Skipped', `Model: “${esc(it.model || '')}”`, actsFor(it, false, false))); continueBtn(); };
function evalProduce(it, text) {
  const need = it.need || {}; const an = analyzeText(text, { src: 'write' }); const w = tokens(text).length; const msgs = []; let pass = true;
  if (w < (need.min || 5)) { pass = false; msgs.push(`Write at least ${need.min || 5} words (you wrote ${w}).`); }
  (need.words || []).forEach(x => { const res = stemRe(x); if (!res.every(r => r.test(text))) { pass = false; msgs.push(`Use <b>${esc(x)}</b> in your sentence.`); } });
  if (need.phr) { const p = need.phr; const re = new RegExp('\\b' + p.v.slice(0, Math.max(2, p.v.length - 1)) + '[a-z]*\\s+(?:\\w+\\s+)?' + p.p.replace(/ /g, '\\s+') + '\\b', 'i'); if (!re.test(text)) { pass = false; if (!msgs.some(m => m.includes(p.v))) msgs.push(`Use the phrasal verb <b>${esc(p.v + ' ' + p.p)}</b>.`); } }
  if (need.probe && !need.probe.test(text)) { pass = false; msgs.push('The target structure was not detected. Check the form and try again.'); }
  if (need.conn) { const set = need.conn.map(x => x.toLowerCase()); const used = an.connectors.filter(x => set.includes(x.c)).map(x => x.c); if (used.length < (need.minConn || 1)) { pass = false; msgs.push(`Use ${need.minConn} different connectors (found ${used.length}).`); } }
  return { pass, msgs, an };
}
function gradeProduce() {
  const c = R.cur, it = c.item, inp = $('#rin'); const val = inp.value.trim(); if (!val) { inp.focus(); return; }
  const ev_ = evalProduce(it, val); const errs = ev_.an.errors;
  inp.disabled = true;
  const finishWith = (ok, selfClaimed) => {
    const sc = ok ? (errs.length ? .78 : 1) : .35; const score = selfClaimed ? Math.min(sc, .78) : sc;
    commit(it, { ok: score >= .7, score, yours: val, correct: it.model || '', whyPlain: '', record: false });
    const issues = errs.map(e => `<div class="mis" style="margin-top:6px"><span class="bad">${esc(e.bad)}</span> → <span class="good">${esc(e.good)}</span><div class="small muted">${esc(e.why)}</div></div>`).join('');
    showFeedback(fbBlock(score >= .7 ? (errs.length ? 'part' : 'ok') : 'bad', score >= .7 ? (errs.length ? 'Good — one thing to polish' : 'Great sentence!') : 'Almost', `${ev_.msgs.length ? ev_.msgs.join('<br>') + '<br>' : ''}${issues}${it.model ? `<div style="margin-top:8px"><b>Model:</b> “${esc(it.model)}” ${sayBtn(it.model)}</div>` : ''}${it.why ? `<div class="small muted" style="margin-top:6px">${it.why}</div>` : ''}`, `${AIService.enabled() ? `<button class="btn sm" data-a="raiw">${I('sparkles')} AI feedback</button>` : ''}${score < .7 ? `<button class="btn sm" data-a="rretryP">${I('refresh')} Try again</button>` : ''}<button class="btn sm" data-a="rexplain">${I('help')} Explain more</button>`));
    continueBtn();
  };
  if (it.selfCheck && ev_.pass) {
    c.phase = 'self';
    showFeedback(fbBlock('part', 'Check yourself', `<p>“${esc(val)}”</p><p style="margin-top:8px"><b>Model:</b> “${esc(it.model || '')}”</p><p class="small muted" style="margin-top:6px">No automatic check exists for this one, so be honest: does your sentence use it correctly and naturally?</p>`, `<button class="btn sm primary" data-a="rself" data-v="1">${I('check')} Yes, I used it correctly</button><button class="btn sm" data-a="rself" data-v="0">Not sure</button>`));
    setCtl('<span class="muted small">Self-check</span>'); c.selfFinish = finishWith; return;
  }
  finishWith(ev_.pass, false);
}
ACT.rself = el => { const c = R.cur; if (c.phase !== 'self') return; c.phase = 'answer'; const ok = el.dataset.v === '1'; $('#rfbk').remove(); c.selfFinish(ok, true); };
ACT.rretryP = () => { const c = R.cur; c.phase = 'answer'; c.tries++; const o = $('#rfbk'); if (o) o.remove(); $('#rin').disabled = false; $('#rin').focus(); setCtl(`<span class="muted small">Edit and check again</span><button class="btn primary lg" data-a="rcheck2" id="rgo">Check</button>`); };
ACT.rcheck2 = () => { const c = R.cur, it = c.item, inp = $('#rin'); const val = inp.value.trim(); const e = evalProduce(it, val); inp.disabled = true; c.phase = 'done'; showFeedback(e.pass ? fbBlock('part', 'Better!', `Nice fix. <b>Model:</b> “${esc(it.model || '')}”`, actsFor(it, true)) : fbBlock('bad', 'Still not there', `${e.msgs.join('<br>')}<br><b>Model:</b> “${esc(it.model || '')}”`, actsFor(it, false, false))); continueBtn(); };
ACT.raiw = async el => { const it = R.cur.item, val = $('#rin').value; el.disabled = true; el.innerHTML = I('sparkles') + ' Thinking…'; try { const r = await AIService.evaluateWriting(val, { prompt: it.q.replace(/<[^>]+>/g, '') }); $('#rfbk .d').insertAdjacentHTML('beforeend', aiBlock(r)); el.remove(); } catch (e) { el.textContent = 'AI unavailable'; toast(esc(e.message), 'alert'); } };
const aiBlock = r => `<div class="mis" style="background:var(--surf);border:1px solid var(--line);margin-top:10px"><b>${I('sparkles')} Tutor (${esc(r.cefr)} · ${Math.round(r.score)}/100)</b><p class="small" style="margin-top:4px">${esc(r.explanation)}</p>${r.naturalVersion ? `<p class="small" style="margin-top:6px"><b>More natural:</b> ${esc(r.naturalVersion)}</p>` : ''}${(r.grammarErrors || []).slice(0, 4).map(g => `<p class="small">✗ ${esc(g.bad)} → ✓ ${esc(g.good)} <span class="muted">${esc(g.why || '')}</span></p>`).join('')}</div>`;

/* --- listening / reading --- */
BODY.listen = it => {
  const isRead = it.mode === 'read';
  return `<div class="rq">${isRead ? 'Read the text, then answer.' : 'Listen, then answer.'}</div>` + (isRead ? `${it.title ? '<h3 style="margin-top:-6px">' + esc(it.title) + '</h3>' : ''}<div class="rsub txt">${tapText(it.script)}</div>${(it.gloss || []).length ? '<div class="row wrap" style="margin-top:-6px"><span class="small muted">Glossary:</span>' + it.gloss.map(g => '<span class="chip">' + esc(g.w) + ' = ' + esc(g.pt) + '</span>').join('') + '</div>' : ''}<div class="small muted" style="margin-top:-6px">${I('globe')} Tap any word to look it up.</div>` : `<div class="audio"><button class="play" data-a="lplay" id="lplay">${I('play')}</button><div class="grow"><div class="b" id="lstat">Press play</div><div class="small muted">${it.kind === 'conversation' || /\n/.test(it.script) ? 'Conversation' : 'Short talk'} · ${esc(it.topic)} · ${it.accent === 'gb' ? 'British' : 'American'} accent</div></div></div><div class="row wrap"><span class="small muted">Speed</span><div class="seg" id="lspeed">${[.75, 1, 1.15, 1.25].map(s => `<button data-a="lspd" data-s="${s}" class="${s === curSpeed(it) ? 'on' : ''}">${s}×</button>`).join('')}</div></div>${Speech.ok ? '' : '<div class="fb part">Your browser has no speech synthesis. Switch to <b>Reading</b> mode or use Chrome/Edge.</div>'}`) + `<div id="lq" class="stack"></div>`;
};
function curSpeed(it) { return S.settings.speed && [.75, 1, 1.15, 1.25].includes(S.settings.speed) ? S.settings.speed : (it.speed === 'slow' ? .75 : it.speed === 'fast' ? 1.15 : 1); }
BIND.listen = it => {
  const c = R.cur; c.qi = 0; c.right = 0; c.rate = curSpeed(it); c.plays = 0; c.shown = it.mode === 'read';
  const isRead = it.mode === 'read';
  setCtl(isRead ? `<span class="muted small">Answer the questions</span><span></span>` : `<span class="muted small" id="lhelp">Listen first — the transcript appears after you answer.</span><button class="btn primary" data-a="lready" id="rgo" disabled>I'm ready</button>`);
  if (isRead) lisQuestion(); else { const b = $('#rgo'); b.disabled = false; }
};
ACT.lspd = el => { R.cur.rate = +el.dataset.s; $$('#lspeed button').forEach(b => b.classList.toggle('on', b === el)); };
ACT.lplay = () => { const c = R.cur, it = c.item; c.plays++; const btn = $('#lplay'); btn.innerHTML = I('volume'); $('#lstat').textContent = 'Playing…'; Speech.speak(it.script, { rate: c.rate, accent: it.accent, onend: () => { const b = $('#lplay'); if (b) { b.innerHTML = I('refresh'); $('#lstat').textContent = 'Played ' + c.plays + '× — press to replay'; } } }); };
ACT.lready = () => { Speech.stop(); lisQuestion(); setCtl(`<span class="muted small">Answer the questions</span><span></span>`); };
function lisQuestion() {
  const c = R.cur, it = c.item; const q = it.qs[c.qi];
  if (!q) return lisDone();
  $('#lq').innerHTML = `<div class="rlabel">Question ${c.qi + 1} of ${it.qs.length}</div><div class="rq" style="font-size:1.25rem">${esc(q.q)}</div>` + q.opts.map((o, i) => `<button class="opt" data-a="lans" data-i="${i}"><span class="k">${i + 1}</span><span>${esc(o)}</span></button>`).join('') + '<div id="lfb"></div>';
}
ACT.lans = el => {
  const c = R.cur, it = c.item, q = it.qs[c.qi]; if (c.locked) return; c.locked = true; const i = +el.dataset.i; const ok = i === q.ans;
  $$('#lq .opt').forEach((b, k) => { b.disabled = true; if (k === q.ans) b.classList.add('ok'); else if (k === i) b.classList.add('no'); else b.classList.add('dim'); });
  if (ok) c.right++;
  const sub = { kind: 'lis', skill: it.skill, lvl: it.lvl, type: 'mcq', wtype: 'mcq', cid: null, ref: c.qi ? null : it.ref };
  const out = recordResult(sub, { ok, rt: ok ? 12000 : 9000 }); R.xp += out.gain; if (out.levelUp) R.levelUps.push(out.levelUp);
  $('#lfb').innerHTML = `<div class="fb ${ok ? 'ok' : 'bad'}"><div class="t">${I(ok ? 'check-circle' : 'x-circle')} ${ok ? 'Correct' : 'Not quite'}</div><div class="d">${esc(q.why || '')}</div></div>`;
  setCtl(`<span class="muted small">${c.qi + 1}/${it.qs.length}</span><button class="btn primary lg" data-a="lnext" id="rgo">${c.qi + 1 < it.qs.length ? 'Next question' : 'See transcript'} ${I('arrow')}</button>`); $('#rgo').focus();
};
ACT.lnext = () => { const c = R.cur; c.qi++; c.locked = false; lisQuestion(); if (c.qi >= c.item.qs.length) return; setCtl(`<span class="muted small">Answer the questions</span><span></span>`); };
function lisDone() {
  const c = R.cur, it = c.item, n = it.qs.length; const ok = c.right / n;
  if (it.mode !== 'read') S.lastListen = Date.now(); else S.lastRead = Date.now();
  const mins = (Date.now() - c.t0) / 60000; addMinutes(Math.max(0, mins - .2));
  R.res.push({ item: it, ok: ok >= .6, score: ok, gain: 0, block: it.block }); c.phase = 'done';
  const vocabChips = (it.vocab || []).map(v => { const w = CONTENT.words.find(x => x.w === v) || null; return `<span class="chip" ${w ? `data-a="card" data-t="word" data-id="${w.id}"` : ''}>${esc(v)}</span>`; }).join('');
  $('#lq').innerHTML = `<div class="fb ${ok >= .66 ? 'ok' : ok >= .34 ? 'part' : 'bad'}"><div class="t">${I('headphones')} ${c.right} of ${n} correct</div><div class="d"><b>Transcript</b><div class="txt" style="margin-top:6px">${esc(it.script).replace(/\n/g, '<br>')}</div><div style="margin-top:10px" class="row wrap">${vocabChips ? '<span class="small muted">Useful:</span>' + vocabChips : ''}</div></div><div class="acts"><button class="btn sm" data-a="lreplay">${I('volume')} Listen again with transcript</button></div></div>`;
  setCtl(`<span class="muted small">+${n} questions recorded</span><button class="btn primary lg" data-a="rnext" id="rgo">Continue ${I('arrow')}</button>`);
  S.seenEx[it.ref] = Date.now(); checkAch(); saveSoon();
}
ACT.lreplay = () => { const c = R.cur; Speech.speak(c.item.script, { rate: 1, accent: c.item.accent }); };

/* --- speaking / writing (análise offline + IA opcional) --- */
function analysisHTML(an, goals) {
  const sc = an.scores; const row = (n, v) => `<div class="score-row"><span>${n}</span>${bar(v / 100, v >= 75 ? 'ok' : v >= 55 ? '' : 'acc')}<b>${v}%</b></div>`;
  return `<div class="row between wrap"><div><div class="tiny muted b" style="text-transform:uppercase;letter-spacing:.08em">Estimated level</div><div style="font-family:var(--head);font-size:1.8rem">${an.cefr}</div></div><div class="small muted right">${an.words} words · ${an.sentences} sentences · avg ${an.avgLen} words/sentence</div></div>
  ${row('Grammar', sc.grammar)}${row('Vocabulary', sc.vocabulary)}${row('Naturalness', sc.naturalness)}${row('Clarity', sc.clarity)}${row('Complexity', sc.complexity)}${row('Connectors', sc.connectors)}
  ${goals && goals.length ? `<div class="sec" style="margin-top:12px"><b class="small">Goals</b>${goals.map(g => `<div class="small">${g.ok === true ? '<span style="color:var(--ok)">✓</span>' : g.ok === false ? '<span style="color:var(--bad)">✗</span>' : '•'} ${esc(g.t)}</div>`).join('')}</div>` : ''}
  ${an.errors.length ? `<div class="sec" style="margin-top:12px"><b class="small">Errors detected</b>${an.errors.map(e => `<div class="mis" style="margin-top:6px"><span class="bad">${esc(e.bad)}</span> → <span class="good">${esc(e.good)}</span><div class="small muted">${esc(e.why)}</div></div>`).join('')}</div>` : ''}
  ${an.suggestions.length ? `<div class="sec" style="margin-top:12px"><b class="small">Suggestions</b>${an.suggestions.map(s => s.instead ? `<div class="small">Instead of <b>"${esc(s.instead)}"</b> try: ${s.try.map(t => `<span class="chip">${esc(t)}</span>`).join(' ')}</div>` : `<div class="small">• ${esc(s.tip)}</div>`).join('')}</div>` : ''}
  ${an.connectors.filter(c => c.cat !== 'basic').length ? `<div class="sec small" style="margin-top:12px"><b>Connectors you used:</b> ${an.connectors.filter(c => c.cat !== 'basic').map(c => `<span class="chip on">${esc(c.c)}</span>`).join(' ')}</div>` : ''}
  ${an.b2words.length ? `<div class="sec small" style="margin-top:8px"><b>B2 vocabulary you used:</b> ${an.b2words.map(w => `<span class="chip on">${esc(w)}</span>`).join(' ')}</div>` : ''}
  <div class="sec" style="margin-top:14px" id="ltslot"><div class="tiny muted">Offline estimate: it checks common patterns (${ERROR_RULES.length} rules), not meaning, so it can miss errors in complex texts.</div><button class="btn sm" style="margin-top:8px" data-a="ltcheck">${I('check-circle')} Deep grammar check (online)</button><div class="tiny muted" style="margin-top:4px">Sends this text to languagetool.org. Only when you click.</div></div>`;
}
function goalTopics(goals) { const m = { 'second conditional': 'second-conditional', 'first conditional': 'first-conditional', 'third conditional': 'third-conditional', 'mixed conditional': 'mixed-conditionals', 'present perfect continuous': 'present-perfect-continuous', 'present perfect': 'present-perfect', 'past perfect': 'past-perfect', passive: 'passive-voice', 'reported': 'reported-speech', 'relative clause': 'relative-clauses', 'modal': 'modals-advanced' }; const out = []; (goals || []).forEach(g => Object.keys(m).forEach(k => { if (g.toLowerCase().includes(k) && !out.includes(m[k])) out.push(m[k]); })); return out; }
function creditProduction(text, an, topics, it) {
  const now = Date.now();
  const cats = new Set(an.connectors.filter(c => c.cat !== 'basic').map(c => c.cat));
  cats.forEach(cat => applyAnswer(S, 'c:' + cat, { k: 'conn', lvl: 'B1+' }, { ok: true, type: 'produce', lvl: 'B2', now, rt: 9000 }));
  topics.forEach(t => { if (GPROBE[t] && GPROBE[t].test(text) && IDX.gr[t]) applyAnswer(S, 'g:' + t, { k: 'gram', lvl: IDX.gr[t].lvl }, { ok: true, type: 'convo', lvl: IDX.gr[t].lvl, now, rt: 9000 }); });
  an.errors.forEach(e => recordMistake(S, { cid: null, ref: e.tag, kind: 'prod', tag: e.tag, q: (it && it.prompt || 'Free production').slice(0, 120), yours: e.bad, good: e.good, why: e.why }));
}
BODY.speak = it => `<div class="rq">${it.q}</div><div class="rsub">${it.goals.length ? `<div class="small b">Try to:</div><ul style="margin:6px 0 0 18px;padding:0">${it.goals.map(g => `<li>${esc(g)}</li>`).join('')}</ul>` : ''}${it.useful.length ? `<div class="small muted" style="margin-top:10px">Useful: ${it.useful.map(u => `<span class="chip">${esc(u)}</span>`).join(' ')}</div>` : ''}</div>
  <div class="center" id="spkctl">${Speech.sttOk ? `<button class="mic" data-a="mic" id="micb" aria-label="Record">${I('mic')}</button><div class="small muted" style="margin-top:8px" id="mstat">Tap to speak (about ${it.mins || 1} min) — your browser transcribes it</div>` : `<div class="small muted">Speech recognition isn't available in this browser (try Chrome/Edge). Type your answer instead.</div>`}</div>
  <textarea id="rin" placeholder="${Speech.sttOk ? 'Your transcript appears here — you can edit it' : 'Type what you would say…'}" style="min-height:110px"></textarea><div class="small muted" id="rneed"></div>`;
BIND.speak = it => {
  const c = R.cur; c.spkStart = null; const inp = $('#rin');
  const upd = () => { const w = tokens(inp.value).length; $('#rneed').textContent = `${w} words · target ${it.minWords}+`; }; inp.addEventListener('input', upd); upd();
  setCtl(`<button class="btn ghost sm" data-a="rskipS">Skip</button><button class="btn primary lg" data-a="rcheck" id="rgo">Analyze</button>`);
};
ACT.mic = () => {
  const c = R.cur; const b = $('#micb'); if (c.rec) { c.rec.stop(); c.rec = null; b.classList.remove('rec'); $('#mstat').textContent = 'Stopped — review the transcript, then Analyze'; return; }
  const inp = $('#rin'); const base = inp.value ? inp.value + ' ' : ''; c.spkStart = c.spkStart || Date.now(); b.classList.add('rec'); $('#mstat').textContent = 'Listening… speak naturally';
  c.rec = Speech.listen({ onText: t => { inp.value = base + t; inp.dispatchEvent(new Event('input')); }, onEnd: r => { c.conf = r.confidence; const bb = $('#micb'); if (bb) bb.classList.remove('rec'); c.rec = null; }, onError: e => { const s = $('#mstat'); if (s) s.textContent = e === 'not-allowed' ? 'Microphone blocked — allow it in the address bar, or type.' : 'Mic error (' + e + '). You can type instead.'; const bb = $('#micb'); if (bb) bb.classList.remove('rec'); c.rec = null; } });
};
ACT.rskipS = () => { const it = R.cur.item; R.cur.phase = 'done'; R.res.push({ item: it, ok: false, score: 0, gain: 0, block: it.block, skipped: true }); R.cur.onNext = null; R.i++; showItem(); };
function gradeSpeak() {
  const c = R.cur, it = c.item, inp = $('#rin'); const text = inp.value.trim(); if (tokens(text).length < 4) { toast('Say or type a few more words first.', 'alert'); return; }
  if (c.rec) { c.rec.stop(); c.rec = null; }
  const secs = c.spkStart ? (Date.now() - c.spkStart) / 1000 : null;
  const an = analyzeText(text, { src: 'speak' }); const goals = it.goals.map(g => ({ t: g, ok: goalCheck(g, text, an) }));
  const gm = goals.filter(g => g.ok === true).length, gk = goals.filter(g => g.ok !== null).length;
  const avgSc = avg([an.scores.grammar, an.scores.vocabulary, an.scores.naturalness, an.scores.clarity, an.scores.connectors]) / 100;
  const score = clamp(.5 * avgSc + .3 * (gk ? gm / gk : .7) + .2 * Math.min(1, an.words / it.minWords), 0, 1);
  const wpm = secs && secs > 8 ? Math.round(an.words / (secs / 60)) : null;
  inp.disabled = true; c.phase = 'done'; $('#spkctl').classList.add('hide');
  creditProduction(text, an, goalTopics(it.goals), it);
  S.lastSpeak = Date.now(); S.analyses.push({ ...an, text: text.slice(0, 400), goalsMet: gm, wpm, prompt: it.prompt.slice(0, 100) }); if (S.analyses.length > 80) S.analyses.shift();
  const out = commit(it, { ok: score >= .6, score, yours: text, correct: it.model, rt: Math.max(40000, (secs || 60) * 1000), record: false, whyPlain: '' });
  const ex = `<div class="fb ${score >= .7 ? 'ok' : score >= .5 ? 'part' : 'bad'}" id="rfbk"><div class="t">${I('mic')} Speaking feedback ${wpm ? `<span class="muted small">· ${wpm} words/min</span>` : ''}</div><div class="d"><div class="txt small" style="margin-bottom:10px">“${esc(text)}”</div>${analysisHTML(an, goals)}<div class="sec" style="margin-top:14px"><b class="small">Model answer (B2)</b><p class="small" style="margin-top:4px">“${esc(it.model)}” ${sayBtn(it.model)}</p></div><div id="aislot"></div></div><div class="acts">${AIService.enabled() ? `<button class="btn sm" data-a="raisp">${I('sparkles')} AI feedback</button>` : ''}</div></div>`;
  $('#rmain').insertAdjacentHTML('beforeend', ex); continueBtn(); checkAch(); const rb = $('#runner .rbody'); rb.scrollTo({ top: rb.scrollHeight, behavior: 'smooth' });
}
const LT_TAG = { GRAMMAR: 'grammar', TYPOS: 'spelling', STYLE: 'style', COLLOCATIONS: 'collocation', PUNCTUATION: 'punctuation', REDUNDANCY: 'style', CONFUSED_WORDS: 'word-choice', SEMANTICS: 'word-choice', CASING: 'capitalization' };
ACT.ltcheck = async el => {
  const text = ($('#wrt') && $('#wrt').value) || ($('#rin') && $('#rin').value) || (R && R.msgs ? R.msgs.filter(m => m.who === 'me').map(m => m.text).join(' ') : '');
  if (!text || tokens(text).length < 5) { toast('Nothing to check yet.', 'alert'); return; }
  const slot = $('#ltslot'); el.disabled = true; el.innerHTML = I('refresh') + ' Checking…';
  try {
    const r = await fetch('https://api.languagetool.org/v2/check', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: 'language=en-US&text=' + encodeURIComponent(text.slice(0, 18000)) });
    if (!r.ok) throw new Error('service returned ' + r.status);
    const j = await r.json(); const ms = (j.matches || []).filter(m => m.rule && m.rule.category && m.rule.category.id !== 'TYPOS' || (m.replacements || []).length);
    const items = ms.map(m => ({ bad: text.substr(m.offset, m.length), good: (m.replacements[0] || {}).value || '', why: m.shortMessage || m.message, tag: LT_TAG[m.rule.category.id] || String(m.rule.category.id || 'grammar').toLowerCase() }));
    items.filter(x => x.good && x.tag !== 'style').slice(0, 8).forEach(x => recordMistake(S, { cid: null, ref: 'lt-' + norm(x.bad), kind: 'prod', tag: x.tag, q: 'Online grammar check', yours: x.bad, good: x.good, why: x.why }));
    saveSoon();
    const score = clamp(100 - items.length * 9, 20, 100);
    slot.innerHTML = '<b class="small">Deep grammar check · LanguageTool</b><div class="score-row"><span>Grammar (online)</span>' + bar(score / 100, score >= 75 ? 'ok' : score >= 55 ? '' : 'acc') + '<b>' + score + '%</b></div>' + (items.length ? items.slice(0, 12).map(x => '<div class="mis" style="margin-top:6px"><span class="bad">' + esc(x.bad) + '</span> → <span class="good">' + esc(x.good || '(review)') + '</span><div class="small muted">' + esc(x.why) + '</div></div>').join('') + '<div class="tiny muted" style="margin-top:6px">Saved to My Mistakes. It does not catch everything either: very subtle errors need AI review or a teacher.</div>' : '<div class="small" style="color:var(--ok);margin-top:6px">No issues found by the online checker.</div>');
  } catch (e) { el.disabled = false; el.innerHTML = I('check-circle') + ' Deep grammar check (online)'; toast('Online check unavailable: ' + esc(e.message || 'no connection'), 'alert'); }
};
ACT.raisp = async el => { const it = R.cur.item; el.disabled = true; el.textContent = 'Thinking…'; try { const r = await AIService.evaluateSpeaking($('#rin').value, { prompt: it.prompt }); $('#aislot').innerHTML = aiBlock(r); el.remove(); } catch (e) { el.textContent = 'AI unavailable'; toast(esc(e.message), 'alert'); } };
BODY.write = it => `<div class="rq">${it.q}</div><div class="rsub small">${it.req && it.req.length ? `Use: ${it.req.map(r => `<span class="chip" id="rq-${r.replace(/\W/g, '')}">${esc(r)}</span>`).join(' ')}` : ''} <div class="muted" style="margin-top:6px">Minimum ${it.min} sentences${it.timed ? ' · <b id="rtimer"></b>' : ''}</div></div><textarea id="rin" placeholder="Write here…" style="min-height:170px;font-size:1.05rem"></textarea><div class="small muted" id="rneed"></div>`;
BIND.write = it => {
  const c = R.cur; const inp = $('#rin');
  const upd = () => { const t = inp.value; const an = analyzeText(t); (it.req || []).forEach(r => { const e = $('#rq-' + r.replace(/\W/g, '')); if (e) e.classList.toggle('on', new RegExp('\\b' + r.replace(/ /g, '\\s+') + '\\b', 'i').test(t)); }); $('#rneed').textContent = `${an.sentences} sentence${an.sentences === 1 ? '' : 's'} · ${an.words} words`; };
  inp.addEventListener('input', upd); upd();
  if (it.timed) { let left = it.secs; const tick = () => { const e = $('#rtimer'); if (e) e.textContent = left + 's'; if (left-- <= 0) { clearInterval(R.timer); if (e) e.textContent = "time's up"; } }; tick(); R.timer = setInterval(tick, 1000); }
  setCtl(`<button class="btn ghost sm" data-a="rskipS">Skip</button><button class="btn primary lg" data-a="rcheck" id="rgo">Analyze</button>`); setTimeout(() => inp.focus(), 60);
};
function gradeWrite() {
  const c = R.cur, it = c.item, inp = $('#rin'); const text = inp.value.trim(); if (tokens(text).length < 8) { toast('Write a bit more first.', 'alert'); return; }
  if (R.timer) { clearInterval(R.timer); R.timer = null; }
  const an = analyzeText(text, { src: 'write' });
  const reqs = (it.req || []).map(r => ({ t: 'Use "' + r + '"', ok: new RegExp('\\b' + r.replace(/ /g, '\\s+') + '\\b', 'i').test(text) })); reqs.push({ t: `At least ${it.min} sentences`, ok: an.sentences >= it.min });
  const met = reqs.filter(r => r.ok).length / reqs.length; const avgSc = avg([an.scores.grammar, an.scores.vocabulary, an.scores.naturalness, an.scores.clarity, an.scores.connectors]) / 100;
  const score = clamp(.45 * avgSc + .55 * met, 0, 1);
  inp.disabled = true; c.phase = 'done';
  creditProduction(text, an, [], it); S.lastWrite = Date.now(); S.analyses.push({ ...an, text: text.slice(0, 400), prompt: it.prompt.slice(0, 100) }); if (S.analyses.length > 80) S.analyses.shift();
  commit(it, { ok: score >= .6, score, yours: text, correct: '', rt: Math.max(60000, (Date.now() - c.t0)), record: false });
  $('#rmain').insertAdjacentHTML('beforeend', `<div class="fb ${score >= .7 ? 'ok' : 'part'}" id="rfbk"><div class="t">${I('pen')} Writing feedback</div><div class="d">${analysisHTML(an, reqs)}<div id="aislot"></div></div><div class="acts">${AIService.enabled() ? `<button class="btn sm" data-a="raiw2">${I('sparkles')} AI feedback</button>` : ''}</div></div>`);
  continueBtn(); checkAch();
}
ACT.raiw2 = async el => { const it = R.cur.item; el.disabled = true; el.textContent = 'Thinking…'; try { const r = await AIService.evaluateWriting($('#rin').value, { prompt: it.prompt }); $('#aislot').innerHTML = aiBlock(r); el.remove(); } catch (e) { el.textContent = 'AI unavailable'; toast(esc(e.message), 'alert'); } };

ACT.rcheck = () => {
  if (!R || !R.cur) return; const c = R.cur; if (c.phase === 'done' || c.phase === 'self') return; const t = c.item.type;
  ({ mcq: gradeMcq, typed: gradeTyped, order: gradeOrder, translate: gradeTranslate, produce: gradeProduce, speak: gradeSpeak, write: gradeWrite }[t] || (() => { }))();
};
document.addEventListener('keydown', e => {
  if (!R || !$('#runner')) return; const c = R.cur; if (!c) return;
  if (e.key === 'Enter' && !e.shiftKey) { const ta = e.target.tagName === 'TEXTAREA'; if (ta && !(e.ctrlKey || e.metaKey)) return; const g = $('#rgo'); if (g && !g.disabled) { e.preventDefault(); g.click(); } }
  else if (/^[1-4]$/.test(e.key) && c.item.type === 'mcq' && c.phase === 'answer' && !/INPUT|TEXTAREA/.test(e.target.tagName)) { const b = $$('.opt')[+e.key - 1]; if (b && !b.disabled) b.click(); }
});

/* ======================= RESUMO DA SESSÃO ======================= */
function finishSession(partial) {
  if (!R) return; const r = R; r.partial = !!partial;
  const graded = r.res.filter(x => !x.skipped); const n = graded.length, ok = graded.filter(x => x.ok).length;
  const mins = Math.max(.5, (Date.now() - r.t0) / 60000);
  if (n) {
    S.sessions.push({ at: Date.now(), min: Math.round(mins * 10) / 10, n, ok, xp: r.xp, kind: r.opts.kind || (r.plan.quick ? 'quick' : 'daily') }); if (S.sessions.length > 300) S.sessions.shift();
    ev('session_completed', { n, ok, min: Math.round(mins * 10) / 10, kind: r.opts.kind || 'daily' });
    if (r.opts.kind === 'review') ev('review_completed', { n });
    if (r.opts.daily && !partial && S.plan) S.plan.done = true;
  }
  checkQuests(); const newAch = checkAch(); save(); autoSync();
  const by = {}; graded.forEach(x => { const b = by[x.block] || (by[x.block] = { n: 0, ok: 0 }); b.n++; if (x.ok) b.ok++; });
  const due = dueCounts(Date.now() + DAY);
  const acc = n ? ok / n : 0;
  const o = $('#runner');
  o.innerHTML = `<div class="rbody"><div class="rwrap" style="padding-top:5vh;text-align:center">
    <div style="font-size:3rem;color:var(--acc)">${I(acc >= .8 ? 'trophy' : acc >= .5 ? 'rocket' : 'target')}</div>
    <h1>${partial ? 'Session saved' : acc >= .8 ? 'Excellent session' : acc >= .55 ? 'Solid work' : 'Good practice'}</h1>
    <p class="muted">${n ? `${ok} of ${n} correct · ${Math.round(mins)} min` : 'No answers recorded.'}</p>
    <div class="grid g3 keep" style="text-align:left;margin-top:8px"><div class="card stat"><div class="k">Accuracy</div><div class="v">${pct(acc)}%</div></div><div class="card stat"><div class="k">XP earned</div><div class="v" id="xpCount">+${r.xp}</div></div><div class="card stat"><div class="k">Streak</div><div class="v">${streak()}d</div></div></div>
    ${summaryExtraHTML(r, acc, n)}
    ${Object.keys(by).length > 1 ? `<div class="card" style="text-align:left"><h4>By block</h4>${Object.keys(by).map(k => `<div class="score-row" style="grid-template-columns:150px 1fr 54px"><span>${BLOCK_LABEL[k] || k}</span>${bar(by[k].ok / by[k].n, by[k].ok / by[k].n >= .7 ? 'ok' : 'acc')}<b>${by[k].ok}/${by[k].n}</b></div>`).join('')}</div>` : ''}
    ${r.levelUps.length ? `<div class="fb ok" style="text-align:left"><div class="t">${I('rocket')} Level up! Your overall level is now ${overallLabel(S)}</div></div>` : ''}
    ${newAch.length ? `<div class="card" style="text-align:left"><h4>Achievement${newAch.length > 1 ? 's' : ''} unlocked</h4>${newAch.map(a => `<div class="row" style="margin-top:8px"><div class="ico acc">${I(a.icon)}</div><div><b>${esc(a.name)}</b><div class="small muted">${esc(a.desc)}</div></div></div>`).join('')}</div>` : ''}
    ${r.mistakes ? `<div class="card" style="text-align:left"><div class="row"><div class="ico bad">${I('wrench')}</div><div class="grow"><b>${r.mistakes} new mistake${r.mistakes > 1 ? 's' : ''} saved</b><div class="small muted">They are in My Mistakes and will come back in your next sessions.</div></div></div></div>` : ''}
    <div class="card" style="text-align:left"><div class="row"><div class="ico">${I('calendar')}</div><div class="grow"><b>Tomorrow</b><div class="small muted">${due.total ? due.total + ' item' + (due.total > 1 ? 's' : '') + ' will be due for review.' : 'Nothing is due yet — your next session will bring new content.'}</div></div></div></div>
    <div class="row" style="justify-content:center;margin:10px 0 40px"><button class="btn primary lg" data-a="rdone">${I('home')} Back to home</button>${r.opts.again ? `<button class="btn lg" data-a="ragain">${I('refresh')} Another round</button>` : ''}</div></div></div>`;
  R.summary = true; afterSummary(r, acc, n);
}
ACT.rdone = () => { closeRunner(true); nav('/home'); render(); };
ACT.ragain = () => { const f = R && R.opts.again; closeRunner(true); if (f) f(); };

/* ---------- entradas de alto nível ---------- */
function startSession(plan) { S.plan = plan; plan.day = today(); saveSoon(); startRunner(plan, { daily: true, kind: 'daily' }); }
function startQuick(mode, min) { const plan = planQuick(S, mode, min); if (!plan.items.length) { toast(mode === 'review' ? 'No reviews due right now. Nice!' : 'Nothing available.', 'check-circle'); return; } startRunner(plan, { kind: mode === 'review' ? 'review' : 'quick', again: () => startQuick(mode, min) }); }
ACT.practice = el => { closeModal(); startConceptPractice(el.dataset.cid); };
function startConceptPractice(cid) {
  const c = S.c[cid]; const t0 = c ? c.tier : 0; const items = [];
  for (let k = 0; k < 4; k++) { const it = buildFor(S, cid, clamp(t0 + (k > 1 ? 1 : 0), 0, 3)); if (it) { it.block = 'q'; it.reason = 'You asked to practice ' + conceptName(cid) + '.'; items.push(it); } }
  startRunner({ items, blocks: [{ key: 'q', label: 'Practice', items }], quick: true }, { kind: 'quick' });
}
function teachMe() {
  const A = overallA(S); const cands = [];
  CONTENT.gr.forEach(g => { if (!S.c['g:' + g.id] && grammarUnlocked(S, g) && lvIdx(g.lvl) >= Math.floor(A) && lvIdx(g.lvl) <= A + 1) cands.push({ type: 'gram', id: g.id, s: Math.abs(lvIdx(g.lvl) - A - .3) }); });
  newWordCandidates(S, 6).forEach(w => cands.push({ type: 'word', id: w.id, s: Math.abs(lvIdx(w.lvl) - A - .4) + .3 }));
  newPhrCandidates(S, 3).forEach(p => cands.push({ type: 'phr', id: p.id, s: Math.abs(lvIdx(p.lvl) - A - .3) + .5 }));
  cands.sort((a, b) => a.s - b.s); const x = cands[0]; if (!x) { toast('You have already met everything at your level!'); return; }
  const why = x.type === 'gram' ? `It is the next structure in your plan toward ${S.profile.target}, and you already know its prerequisites.` : x.type === 'word' ? 'It is at your level, matches your interests, and you have not seen it yet.' : 'Phrasal verbs are one of the fastest ways to sound natural.';
  openCard(x); const m = $('.modal'); if (m) m.insertAdjacentHTML('afterbegin', `<div class="fb part" style="margin-bottom:14px"><div class="t">${I('bulb')} Teach me something</div><div class="d">${esc(why)}</div></div>`);
}
