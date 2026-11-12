/* Tutor offline mais esperto: responde perguntas livres com os dados do próprio app
   (gramática, palavras, phrasal verbs, correção de frase, progresso, plano do dia). */
function tutorOffline(q) { return tutorSmart(q) || tutorBasic(q); }
const tutBtn = (label, attrs, primary = true) => `<button class="btn sm ${primary ? 'primary' : ''}" ${attrs}>${label}</button>`;
function tutWordCard(w, kind) {
  const open = kind === 'phr' ? `data-a="card" data-t="phr" data-id="${w.id}"` : `data-a="card" data-t="word" data-id="${w.id}"`;
  const title = kind === 'phr' ? w.v + ' ' + w.p : w.w;
  return `<div class="mis" style="margin-top:8px"><b>${esc(title)}</b> <span class="muted small">${esc(w.pt || '')}</span><div class="small">${esc(w.def || '')}</div><div class="muted small">“${esc(w.ex || '')}”</div>${(w.col || []).length ? `<div class="tiny muted" style="margin-top:4px">Common: ${w.col.slice(0, 3).map(esc).join(' · ')}</div>` : ''}<div style="margin-top:8px">${tutBtn('Open card', open, false)}</div></div>`;
}
function tutFind(term) {
  const t = norm(term).replace(/^(a|an|the|to) /, ''); if (!t) return null;
  const ph = CONTENT.phr.find(p => norm(p.v + ' ' + p.p) === t || norm(p.form || '') === t);
  if (ph) return { kind: 'phr', o: ph };
  const w = CONTENT.words.find(x => norm(x.w) === t || norm(x.form || '') === t);
  return w ? { kind: 'word', o: w } : null;
}
function tutorSmart(q) {
  const raw = q.trim(), t = norm(raw);
  // 1) progresso e números
  if (/how many|my progress|how am i doing|my stats|how much (have|did) i|my level\b/.test(t) && !/mistake/.test(t)) {
    const mastered = CONTENT.words.filter(w => stOf('w:' + w.id) === 'mastered').length, met = CONTENT.words.filter(w => S.c['w:' + w.id]).length;
    const phm = CONTENT.phr.filter(p => stOf('p:' + p.id) === 'mastered').length; const xi = xpInfo(); const wb = whyNotB2(S);
    return `<b>Your numbers</b><ul style="margin:6px 0 0 18px;padding:0"><li>Level <b>${overallLabel(S)}</b> · ${pct(wb.pct)}% of the B2 requirements</li><li>Words: <b>${mastered}</b> mastered, ${met} met (of ${CONTENT.words.length})</li><li>Phrasal verbs mastered: <b>${phm}</b> (of ${CONTENT.phr.length})</li><li>Streak: <b>${streak()}</b> day${streak() === 1 ? '' : 's'} · ${S.xp} XP (Lv ${xi.l} ${xi.name})</li></ul><div style="margin-top:8px">${tutBtn('Open progress', 'data-a="nav" data-to="/progress"', false)}</div>`;
  }
  // 2) o que estudar hoje
  if (/what (should|do|can) i (study|do|practice|learn)|study today|today's plan|todays plan|what next|where (do|should) i (start|begin)/.test(t)) {
    const d = dueCounts(); const wb = whyNotB2(S); const low = wb.low && wb.low[0];
    return `Today I would do this:<ol style="margin:6px 0 0 18px;padding:0;line-height:1.6"><li>${d.total ? `Clear your <b>${d.total}</b> due reviews (about ${d.minutes || Math.ceil(d.total / 3)} min)` : 'No reviews due: great, you are up to date'}</li><li>${low ? `Work on your weakest B2 area: <b>${esc(low.name)}</b> (${pct(low.v)}%)` : 'Do today\'s session'}</li><li>One short <b>speaking or writing</b> task, because production is what moves you to B2</li></ol><div class="row wrap" style="margin-top:8px;gap:8px">${tutBtn(I('play') + ' Start today\'s session', 'data-a="startDaily"')}${d.total ? tutBtn('Reviews', 'data-a="nav" data-to="/review"', false) : ''}</div>`;
  }
  // 3) diferença entre X e Y
  let m = t.match(/(?:difference|different) between (.+?) and (.+)$/);
  if (m) {
    const a = tutFind(m[1]), b = tutFind(m[2]);
    if (a || b) return `Here is what I have on <b>${esc(m[1])}</b> and <b>${esc(m[2])}</b>:${a ? tutWordCard(a.o, a.kind) : `<div class="small muted" style="margin-top:8px">“${esc(m[1])}”: not in my content.</div>`}${b ? tutWordCard(b.o, b.kind) : `<div class="small muted" style="margin-top:8px">“${esc(m[2])}”: not in my content.</div>`}<div class="small muted" style="margin-top:8px">For a full explanation of differences, connect an AI key in Settings.</div>`;
    return `I do not have both of these in my content. Look each one up with examples and meanings:<div class="row wrap" style="margin-top:8px;gap:8px">${tutBtn(esc(m[1]), `data-a="lkword" data-w="${esc(m[1])}"`, false)}${tutBtn(esc(m[2]), `data-a="lkword" data-w="${esc(m[2])}"`, false)}</div><div class="small muted" style="margin-top:8px">For a real comparison (make vs do, etc.), add an AI key in Settings.</div>`;
  }
  // 4) significado / tradução
  m = raw.match(/^(?:what does|what is|what's|meaning of|define|translate|how (?:do|can) (?:i|you) say)\s+["“']?(.+?)["”']?(?:\s+mean|\s+(?:in|to) english)?\??$/i);
  if (m && m[1].split(' ').length <= 4) {
    const term = m[1].trim(), hit = tutFind(term);
    if (hit) return `Found it in your content:${tutWordCard(hit.o, hit.kind)}`;
    const g = CONTENT.gr.find(x => norm(x.name) === norm(term));
    if (!g) return `“${esc(term)}” is not in my built-in content. Look it up online (meaning, examples, Portuguese):<div style="margin-top:8px">${tutBtn(I('search') + ' Look up “' + esc(term) + '”', `data-a="lkword" data-w="${esc(term)}"`)}</div>`;
  }
  // 5) explicação de gramática
  const gm = CONTENT.gr.filter(g => t.includes(norm(g.name)) || t.includes(g.id.replace(/-/g, ' '))).sort((a, b) => b.name.length - a.name.length)[0];
  if (gm && /explain|how|when|use|what|rule|difference|teach|grammar|form|usar/.test(t)) {
    const mis = (gm.mistakes || [])[0];
    return `<b>${esc(gm.name)}</b> <span class="muted small">(${esc(gm.lvl)})</span><div class="small" style="margin-top:6px">${esc(gm.pt)}</div><div class="small" style="margin-top:6px"><b>Form:</b> ${esc(gm.form || '')}</div>${(gm.ex || [])[0] ? `<div class="muted small">“${esc(gm.ex[0])}”</div>` : ''}${mis ? `<div class="mis" style="margin-top:8px"><div class="bad">✗ ${esc(mis.bad)}</div><div class="good">✓ ${esc(mis.good)}</div><div class="small muted">${esc(mis.why)}</div></div>` : ''}<div style="margin-top:8px">${tutBtn('Study and practice', `data-a="nav" data-to="/grammar/${gm.id}"`)}</div>`;
  }
  const words = t.split(' ').filter(x => x.length > 4);
  if (/conditional|tense|grammar|article|preposition|modal|passive|clause|gerund|infinitive/.test(t)) {
    const list = CONTENT.gr.filter(g => words.some(w => norm(g.name).includes(w.replace(/s$/, '')))).slice(0, 5);
    if (list.length) return `Which one do you mean?<div class="row wrap" style="margin-top:8px;gap:8px">${list.map(g => tutBtn(esc(g.name), `data-a="nav" data-to="/grammar/${g.id}"`, false)).join('')}</div>`;
  }
  // 6) phrasal verbs
  if (/phrasal/.test(t)) {
    const v = t.split(' ').find(x => CONTENT.phr.some(p => p.v === x));
    const list = (v ? CONTENT.phr.filter(p => p.v === v) : CONTENT.phr.filter(p => stOf('p:' + p.id) !== 'mastered').sort(() => rnd() - .5)).slice(0, 5);
    return `${v ? `Phrasal verbs with <b>${esc(v)}</b>` : 'Five phrasal verbs to learn next'}:<div class="stack" style="margin-top:8px">${list.map(p => `<div class="small"><a class="b" style="color:var(--pri);cursor:pointer" data-a="card" data-t="phr" data-id="${p.id}">${esc(p.v + ' ' + p.p)}</a> — ${esc(p.pt)}<div class="muted tiny">“${esc(p.ex)}”</div></div>`).join('')}</div><div style="margin-top:8px">${tutBtn('Open all phrasal verbs', 'data-a="nav" data-to="/phrasals"', false)}</div>`;
  }
  // 7) correção de frase (explícita, ou uma frase solta em inglês)
  const cm = raw.match(/(?:correct|check|fix|is this (?:right|correct|ok)|does this sound (?:ok|natural|right))[^:"“]*[:"“]\s*["“]?(.+?)["”]?$/i);
  const sent = cm ? cm[1] : (!/\?$/.test(raw) && raw.split(/\s+/).length >= 5 && /^[A-Za-z' ,.!-]+$/.test(raw) && !/^(please|can|could|why|how|what|when|give|show|tell|explain|teach|help|let)/i.test(raw) ? raw : null);
  if (sent) {
    const er = (analyzeText(sent).errors || []);
    return er.length ? `I found <b>${er.length}</b> issue${er.length > 1 ? 's' : ''} in your sentence:${er.slice(0, 4).map(e => `<div class="mis" style="margin-top:8px"><div class="bad">✗ ${esc(e.bad)}</div><div class="good">✓ ${esc(e.good)}</div><div class="small muted">${esc(e.why)}</div></div>`).join('')}<div style="margin-top:8px">${tutBtn('Open Writing lab', 'data-a="nav" data-to="/writing"', false)}</div>`
      : `No common mistake patterns found in that sentence. My offline check is limited, so for a deeper review use <b>Writing lab</b> (LanguageTool button) or an AI key.<div style="margin-top:8px">${tutBtn('Open Writing lab', 'data-a="nav" data-to="/writing"', false)}</div>`;
  }
  return null;
}
