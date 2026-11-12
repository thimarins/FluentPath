/* ============================================================
   FLUENT PATH — MOTIVAÇÃO: nível com nome e XP, missões do dia,
   trilha até o B2, confete, sons (opcionais) e tela final de sessão.
   ============================================================ */
const LEVEL_NAMES = ['Newcomer', 'Explorer', 'Builder', 'Speaker', 'Storyteller', 'Debater', 'Negotiator', 'Presenter', 'Fluent', 'Master'];
const levelName = l => LEVEL_NAMES[Math.min(9, Math.floor((l - 1) / 2))];
function xpInfo() {
  const l = levelFromXp(S.xp), lo = xpForLevel(l), hi = xpForLevel(l + 1);
  return { l, name: levelName(l), lo, hi, into: S.xp - lo, need: hi - lo, left: hi - S.xp, p: (S.xp - lo) / Math.max(1, hi - lo) };
}
const sod = (t = Date.now()) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
const dayN = k => (S.days[k] || {});
const todayAn = src => S.analyses.filter(a => a.src === src && a.at >= sod()).length;

/* ---------- missões do dia ---------- */
const QUEST_POOL = [
  { id: 'speak', t: 'Speak out loud once', xp: 25, icon: 'mic', go: '/speaking', n: 1, p: () => todayAn('speak') },
  { id: 'write', t: 'Write a short text', xp: 25, icon: 'pen', go: '/writing', n: 1, p: () => todayAn('write') },
  { id: 'repair', t: 'Fix 3 old mistakes', xp: 20, icon: 'wrench', go: '/mistakes', n: 3, p: () => dayN(today()).rep || 0 },
  { id: 'words', t: 'Meet 4 new words', xp: 20, icon: 'book-open', go: '/vocab', n: 4, p: () => dayN(today()).nw || 0 },
  { id: 'listen', t: 'Do a listening exercise', xp: 20, icon: 'headphones', go: '/listening', n: 1, p: () => S.lastListen >= sod() ? 1 : 0 }
];
function dailyQuests() {
  const k = today(); let h = 7; for (const ch of k) h = (h * 31 + ch.charCodeAt(0)) | 0; h = Math.abs(h);
  const a = QUEST_POOL[h % QUEST_POOL.length]; let b = QUEST_POOL[(h >> 3) % QUEST_POOL.length]; if (b === a) b = QUEST_POOL[(QUEST_POOL.indexOf(a) + 2) % QUEST_POOL.length];
  const base = [
    { id: 'session', t: "Complete today's session", xp: 30, icon: 'play', go: 'start', n: 1, p: () => S.sessions.filter(s => s.at >= sod() && s.kind === 'daily').length },
    { id: 'answers', t: 'Answer 20 exercises', xp: 20, icon: 'zap', go: '/practice', n: 20, p: () => dayN(k).n || 0 }
  ];
  return [...base, a, b].map(q => { const v = Math.min(q.n, q.p()); return { ...q, v, done: v >= q.n }; });
}
function checkQuests() {
  const k = today(); if (!S.quests || S.quests.day !== k) S.quests = { day: k, done: {}, bonus: 0 };
  const qs = dailyQuests(), out = [];
  qs.forEach(q => { if (q.done && !S.quests.done[q.id]) { S.quests.done[q.id] = Date.now(); S.xp += q.xp; dayStat().xp += q.xp; out.push(q); } });
  if (qs.every(q => q.done) && !S.quests.bonus) { S.quests.bonus = Date.now(); S.xp += 40; dayStat().xp += 40; out.push({ id: 'bonus', t: 'All of today\'s quests', xp: 40, bonus: 1 }); }
  out.forEach(q => toast(`${q.bonus ? 'Bonus' : 'Quest complete'}: ${esc(q.t)} · +${q.xp} XP`, 'trophy'));
  if (out.length) { SFX.play('done'); saveSoon(); }
  return out;
}

/* ---------- sons (desligados por padrão; liga no ícone do exercício ou em Settings) ---------- */
const SFX = {
  ctx: null,
  play(kind) {
    if (!S || !S.settings.sound) return;
    try {
      this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)(); const c = this.ctx; if (c.state === 'suspended') c.resume();
      const seq = { ok: [[660, 0], [880, .09]], bad: [[240, 0], [190, .11]], done: [[523, 0], [659, .1], [784, .2], [1047, .32]] }[kind] || [];
      seq.forEach(([f, t]) => { const o = c.createOscillator(), g = c.createGain(); o.type = kind === 'bad' ? 'triangle' : 'sine'; o.frequency.value = f; const t0 = c.currentTime + t; g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(.11, t0 + .02); g.gain.exponentialRampToValueAtTime(.0001, t0 + .22); o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + .25); });
    } catch (e) { }
  }
};
ACT.rsound = () => { S.settings.sound = !S.settings.sound; S.settingsAt = Date.now(); save(); const b = $('#rsnd'); if (b) b.innerHTML = I(S.settings.sound ? 'volume' : 'x'); if (S.settings.sound) SFX.play('ok'); toast(S.settings.sound ? 'Sound effects on' : 'Sound effects off', 'volume'); };

/* ---------- confete ---------- */
function confetti(n = 70) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const box = document.createElement('div'); box.className = 'confetti'; const cols = ['#ff7a45', '#3454d1', '#1f9d6b', '#f5b301', '#8aa0ff', '#e35d9a'];
  for (let i = 0; i < n; i++) { const p = document.createElement('i'); p.style.left = Math.random() * 100 + '%'; p.style.background = cols[i % cols.length]; p.style.animationDelay = (Math.random() * .6) + 's'; p.style.animationDuration = (1.8 + Math.random() * 1.6) + 's'; p.style.width = (6 + Math.random() * 6) + 'px'; p.style.height = (8 + Math.random() * 10) + 'px'; p.style.transform = `rotate(${Math.random() * 360}deg)`; box.appendChild(p); }
  document.body.appendChild(box); setTimeout(() => box.remove(), 4600);
}
function countUp(el, to, ms = 900, prefix = '') { if (!el) return; const t0 = performance.now(); const f = t => { const p = clamp((t - t0) / ms, 0, 1); el.textContent = prefix + Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); else el.textContent = prefix + to; }; el.textContent = prefix + 0; requestAnimationFrame(f); }

/* ---------- componentes da Home e do Roadmap ---------- */
function levelCardHTML() {
  const x = xpInfo(); const st = streak();
  return `<div class="card"><div class="row between wrap"><div class="row"><div class="ico acc" style="width:48px;height:48px;font-size:1.4rem">${I('star')}</div><div><div class="tiny muted b" style="text-transform:uppercase;letter-spacing:.08em">Level ${x.l}</div><h3 style="font-size:1.4rem">${esc(x.name)}</h3></div></div><div class="right"><div class="b" style="font-size:1.5rem;color:var(--acc)">${I('flame')} ${st}</div><div class="tiny muted">${st ? 'day streak · best ' + bestStreak() : 'start your streak today'}</div></div></div>
  <div style="margin-top:14px">${bar(x.p, 'acc')}<div class="row between tiny muted" style="margin-top:6px"><span>${S.xp} XP</span><span>${x.left} XP to level ${x.l + 1}</span></div></div>${levelExtras()}</div>`;
}
function levelExtras() {
  const nb = ACH.filter(a => !S.ach[a.id] && a.p).map(a => { const [x, y] = a.p(); return { a, x, y, r: x / Math.max(1, y) }; }).sort((a, b) => b.r - a.r)[0];
  let m = 0; const dots = []; for (let i = 6; i >= 0; i--) { const d = S.days[dayKey(Date.now() - i * DAY)]; m += d ? d.min || 0 : 0; dots.push(!!(d && d.n)); }
  return `<div class="list" style="margin-top:12px">${nb ? `<div class="it"><div class="ico ok" style="width:34px;height:34px;font-size:1rem">${I(nb.a.icon)}</div><div class="grow"><div class="b small">Next badge: ${esc(nb.a.name)}</div><div style="margin-top:4px">${bar(nb.r, 'thin')}</div></div><span class="tiny muted">${Math.min(nb.x, nb.y)} / ${nb.y}</span></div>` : ''}
  <div class="it"><div class="ico" style="width:34px;height:34px;font-size:1rem">${I('calendar')}</div><div class="grow"><div class="b small">This week: ${Math.round(m)} min</div><div class="row" style="gap:6px;margin-top:6px">${dots.map(d => `<i style="width:16px;height:16px;border-radius:5px;background:${d ? 'var(--ok)' : 'var(--surf2)'}"></i>`).join('')}</div></div><span class="tiny muted">${dots.filter(Boolean).length} / 7 days</span></div></div>`;
}
function questsCardHTML() {
  const qs = dailyQuests(); const done = qs.filter(q => q.done).length; const all = done === qs.length;
  return `<div class="card"><div class="row between"><h3>Today's quests</h3><span class="tag ${all ? 'st-mastered' : 'a'}">${done} / ${qs.length}${all ? ' · bonus +40 XP' : ''}</span></div>
  <div class="list" style="margin-top:6px">${qs.map(q => `<div class="it ${q.done ? '' : 'click'}" ${q.done ? '' : `data-a="questgo" data-go="${q.go}"`}><div class="ico ${q.done ? 'ok' : ''}" style="width:34px;height:34px;font-size:1rem">${I(q.done ? 'check' : q.icon)}</div><div class="grow"><div class="b small" style="${q.done ? 'text-decoration:line-through;opacity:.6' : ''}">${esc(q.t)}</div>${q.n > 1 ? `<div style="margin-top:4px">${bar(q.v / q.n, q.done ? 'ok thin' : 'thin')}</div>` : ''}</div><span class="tag ${q.done ? 'st-mastered' : 'a'}">+${q.xp} XP</span></div>`).join('')}</div></div>`;
}
ACT.questgo = el => { const g = el.dataset.go; if (g === 'start') startSession(todaysPlan()); else nav(g); };
const PATH_ORDER = [['gram-b1', 'Core grammar', '/grammar', 'puzzle'], ['gram-b2', 'B2 grammar', '/grammar', 'puzzle'], ['vocab-b2', 'B2 words', '/vocab', 'book-open'], ['phr', 'Phrasal verbs', '/phrasals', 'layers'], ['conn', 'Connectors', '/connectors', 'link'], ['nat', 'Natural English', '/natural', 'sparkles'], ['read', 'Reading', '/reading', 'book'], ['listen', 'Listening', '/listening', 'headphones'], ['write', 'Writing', '/writing', 'pen'], ['speak', 'Speaking', '/speaking', 'mic']];
function pathHTML() {
  const req = b2Requirements(S).list, by = {}; req.forEach(r => by[r.id] = r);
  const nodes = PATH_ORDER.map(([id, name, go, ic]) => ({ id, name, go, ic, v: (by[id] || { v: 0 }).v })); const next = nodes.findIndex(n => n.v < .8);
  return `<div class="card"><div class="row between wrap"><div><h3>Your path to ${esc(S.profile.target)}</h3><p class="small muted">Each station fills as you demonstrate mastery. ${next >= 0 ? 'Next up: <b>' + esc(nodes[next].name) + '</b>' : 'Every station is complete: take the B2 test!'}</p></div><a class="btn sm" href="#/roadmap">Roadmap</a></div>
  <div class="path">${nodes.map((n, i) => `<a class="stn ${n.v >= .8 ? 'done' : i === next ? 'next' : ''}" href="#${n.go}" title="${esc(n.name)} ${pct(n.v)}%"><span class="ring-mini" style="--p:${pct(n.v)}"><span class="li-wrap">${I(n.v >= .8 ? 'check' : n.ic)}</span></span><span class="tiny b">${esc(n.name)}</span><span class="tiny muted">${pct(n.v)}%</span></a>`).join('<i class="seg-line"></i>')}</div></div>`;
}
/* tela final da sessão: nível, missões, sequência e comemoração */
function summaryExtraHTML(r, acc, n) {
  const x = xpInfo(), st = streak(); const ms = [3, 7, 14, 21, 30, 50, 75, 100].includes(st);
  const qs = dailyQuests(); const dn = qs.filter(q => q.done).length;
  return `<div class="card" style="text-align:left"><div class="row between wrap"><div class="row"><div class="ico acc" style="width:46px;height:46px">${I('star')}</div><div><div class="tiny muted b" style="text-transform:uppercase;letter-spacing:.08em">Level ${x.l} · ${esc(x.name)}</div><div class="small">${x.left} XP to level ${x.l + 1}</div></div></div><div class="right b" style="color:var(--acc);font-size:1.3rem">${I('flame')} ${st}d</div></div><div style="margin-top:10px">${bar(x.p, 'acc')}</div></div>
  ${ms ? `<div class="fb part" style="text-align:left"><div class="t">${I('flame')} ${st}-day streak!</div><div class="d">Consistency beats long sessions. Keep it going tomorrow.</div></div>` : ''}
  <div class="card" style="text-align:left"><div class="row between"><b>Today's quests</b><span class="tag ${dn === qs.length ? 'st-mastered' : 'a'}">${dn} / ${qs.length}</span></div><div class="stack small" style="margin-top:8px">${qs.map(q => `<div class="row" style="gap:8px;${q.done ? '' : 'opacity:.65'}"><span style="color:${q.done ? 'var(--ok)' : 'var(--mut)'}">${I(q.done ? 'check-circle' : 'circle')}</span><span>${esc(q.t)}</span><span class="grow"></span><span class="muted">+${q.xp} XP</span></div>`).join('')}</div></div>`;
}
function firstRunBanner() {
  if (S.demo || S.sessions.length) return '';
  return `<div class="fb part" style="max-width:none;margin:0 0 16px"><div class="t">${I('rocket')} Welcome, ${esc(S.profile.name || 'there')}! Your journey starts with one 10-minute session</div><div class="d">Finish it to start your streak, unlock today's quests and see your path to ${esc(S.profile.target)} fill up. New items always begin with a short card that teaches them before you are tested.</div></div>`;
}
function afterSummary(r, acc, n) {
  checkQuests(); countUp($('#xpCount'), r.xp, 900, '+');
  const big = acc >= .7 || r.levelUps.length || [3, 7, 14, 21, 30, 50, 75, 100].includes(streak());
  if (n && big) { confetti(r.levelUps.length ? 120 : 70); SFX.play('done'); } else if (n) SFX.play('ok');
}

/* ---------- painéis dos chips do topo (sequência e nível) ---------- */
const STREAK_MILES = [3, 7, 14, 30, 60, 100, 200, 365];
function streakModal() {
  const n = streak(), best = Math.max(bestStreak(), n), td = dayN(today()), studied = (td.n || 0) > 0;
  const next = STREAK_MILES.find(m => m > n) || n + 100, prev = [...STREAK_MILES].reverse().find(m => m <= n) || 0;
  const days = []; for (let i = 27; i >= 0; i--) { const t = Date.now() - i * DAY, d = S.days[dayKey(t)]; days.push({ t, on: !!(d && d.n), min: d ? d.min : 0, today: i === 0 }); }
  const active = Object.values(S.days).filter(d => d.n > 0).length;
  let wk = 0; for (let i = 0; i < 7; i++) wk += dayN(dayKey(Date.now() - i * DAY)).min || 0;
  const msg = n === 0 ? 'Study for a couple of minutes today to start your streak.' : studied ? 'Today is done. Your streak is safe until tomorrow.' : `Study today to keep your ${n}-day streak alive.`;
  modal(`<div style="text-align:center;padding:4px 8px 0"><div class="ico acc" style="margin:0 auto 10px;width:56px;height:56px">${I('flame')}</div><h2 style="margin:0">${n} day${n === 1 ? '' : 's'} in a row</h2><p class="muted small" style="margin:6px 0 0">${msg}</p></div>
  <div class="grid g3" style="margin:18px 0 6px;gap:10px"><div class="card flat" style="text-align:center"><div class="small muted">Best streak</div><b style="font-size:1.4rem">${best}</b></div><div class="card flat" style="text-align:center"><div class="small muted">Active days</div><b style="font-size:1.4rem">${active}</b></div><div class="card flat" style="text-align:center"><div class="small muted">This week</div><b style="font-size:1.4rem">${Math.round(wk)}<span class="small muted"> min</span></b></div></div>
  <div class="small muted" style="margin:14px 0 8px">Last 4 weeks</div>
  <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px">${days.map(d => `<div title="${new Date(d.t).toLocaleDateString()} · ${Math.round(d.min)} min" style="aspect-ratio:1;border-radius:8px;display:grid;place-items:center;font-size:.7rem;font-weight:700;background:${d.on ? 'var(--acc)' : 'var(--surf2, var(--surf))'};color:${d.on ? '#fff' : 'var(--mut, inherit)'};border:${d.today ? '2px solid var(--pri)' : '1px solid var(--line)'}">${new Date(d.t).getDate()}</div>`).join('')}</div>
  <div style="margin-top:18px"><div class="row between"><b class="small">Next milestone: ${next} days</b><span class="small muted">${Math.max(0, next - n)} to go</span></div>${bar(clamp((n - prev) / Math.max(1, next - prev), 0, 1), 'ok')}</div>
  <p class="small muted" style="margin-top:14px">A day counts when you answer at least one exercise. Short, regular practice beats long, rare sessions.</p>
  <div class="row" style="margin-top:14px;justify-content:flex-end;gap:8px"><button class="btn" data-a="closeModal">Close</button>${studied ? '' : `<button class="btn primary" data-a="streakgo">${I('zap')} Study 2 minutes</button>`}</div>`, 'wide');
}
function xpModal() {
  const x = xpInfo(), qs = dailyQuests(), td = dayN(today()).xp || 0;
  let wk = 0; for (let i = 0; i < 7; i++) wk += dayN(dayKey(Date.now() - i * DAY)).xp || 0;
  const ladder = LEVEL_NAMES.map((nm, i) => { const lv = i * 2 + 1, cur = x.l >= lv && x.l < lv + 2; return `<div class="row" style="padding:7px 10px;border-radius:10px;${cur ? 'background:var(--surf2, var(--surf));border:1px solid var(--pri)' : ''};opacity:${x.l >= lv ? 1 : .55}"><span style="width:56px" class="small muted">Lv ${lv}–${lv + 1}</span><b class="grow">${nm}</b>${x.l >= lv + 2 ? I('check') : cur ? '<span class="tiny" style="color:var(--pri)">you are here</span>' : I('lock')}</div>`; }).join('');
  modal(`<div style="text-align:center">${ring(x.p, 110, 10, 'var(--pri)', 'Lv ' + x.l, x.name)}<h2 style="margin:10px 0 0">${x.name}</h2><p class="muted small" style="margin:6px 0 0">${x.into} / ${x.need} XP in this level · <b>${x.left} XP</b> to Level ${x.l + 1}${x.l % 2 === 1 ? '' : ' · ' + levelName(x.l + 1)}</p></div>
  <div class="grid g3" style="margin:18px 0 6px;gap:10px"><div class="card flat" style="text-align:center"><div class="small muted">Total XP</div><b style="font-size:1.4rem">${S.xp}</b></div><div class="card flat" style="text-align:center"><div class="small muted">Today</div><b style="font-size:1.4rem">+${td}</b></div><div class="card flat" style="text-align:center"><div class="small muted">7 days</div><b style="font-size:1.4rem">+${wk}</b></div></div>
  <div class="small muted" style="margin:14px 0 8px">Today's quests</div>
  <div class="stack" style="gap:6px">${qs.map(q => `<div class="row" style="gap:10px"><span style="color:${q.done ? 'var(--ok)' : 'var(--mut, inherit)'}">${I(q.done ? 'check' : q.icon)}</span><span class="grow small ${q.done ? 'muted' : ''}">${esc(q.t)}</span><span class="tiny muted">${q.done ? 'done' : q.v + '/' + q.n}</span><b class="small">+${q.xp}</b></div>`).join('')}</div>
  <div class="small muted" style="margin:16px 0 8px">Level names</div><div class="stack" style="gap:4px">${ladder}</div>
  <p class="small muted" style="margin-top:14px">You earn XP for every exercise (harder ones earn more) and for daily quests. Finish all quests for a +40 bonus.</p>
  <div class="row" style="margin-top:14px;justify-content:flex-end;gap:8px"><button class="btn" data-a="closeModal">Close</button><a class="btn primary" href="#/achievements" data-a="closeModal">${I('trophy')} Achievements</a></div>`, 'wide');
}
ACT.streakInfo = () => streakModal();
ACT.xpInfo = () => xpModal();
ACT.streakgo = () => { closeModal(); startQuick('surprise', 2); };
