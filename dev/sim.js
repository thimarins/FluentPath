// Simula um aluno B1+ estudando N dias (relógio virtual) e mede o que o app entrega.
// Uso: node dev/sim.js [dias] [minutosPorDia]
const path = require('path'), fs = require('fs');
const { JSDOM, VirtualConsole } = require((() => { try { require.resolve('jsdom'); return 'jsdom'; } catch (e) { return process.env.JSDOM_PATH || process.env.TEMP + '/pdfx/node_modules/jsdom'; } })());
const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'FluentPath.html'), 'utf8');
const DAYS = +process.argv[2] || 60, MIN = +process.argv[3] || 10; const errs = [];
const vc = new VirtualConsole(); vc.on('jsdomError', e => errs.push(e.message));
const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/', pretendToBeVisual: true, virtualConsole: vc, beforeParse(w) {
  w.matchMedia = () => ({ matches: false, addEventListener() { } }); w.scrollTo = () => { }; w.Element.prototype.scrollTo = function () { }; w.confirm = () => true;
  w.__off = 0; const RD = w.Date; w.Date = class extends RD { constructor(...a) { if (!a.length) super(RD.now() + w.__off); else super(...a); } static now() { return RD.now() + w.__off; } };
} });
const w = dom.window;
setTimeout(() => {
  const script = `(function(DAYS, MIN){
  _rand = seeded(11);
  S.onboarded = true; S.profile.name = 'Sim'; S.profile.minutes = MIN;
  applyDiagnostic(S, { sk: { reading: 3.2, listening: 2.8, writing: 2.7, speaking: 2.7, vocab: 3, grammar: 3 }, theta: 3, strengths: [], weaknesses: [], n: 0, at: Date.now() }); S.profile.level = overallLabel(S);
  const T = 3.0, K = {}, rows = [], seenKey = {}, used = { lis: new Set(), spk: new Set(), wri: new Set(), words: new Set() }; let repeats = 0, total = 0;
  const sig = x => 1 / (1 + Math.exp(x));
  const know = (cid, lvl) => { if (K[cid] == null) K[cid] = sig((lvIdx(lvl) - T) * 1.6); return K[cid]; };
  const pOf = (wt, k) => wt === 'mcq' ? k * .92 + (1 - k) * .25 : wt === 'cloze' ? k * .88 + (1 - k) * .22 : wt === 'order' ? k * .85 + (1 - k) * .1 : (wt === 'typed' || wt === 'translate') ? Math.pow(k, 1.5) * .9 + .03 : Math.pow(k, 2) * .85 + .03;
  const lvlTrace = [], bt = {}; const tally = (it, c) => { const k = it.kind + '/' + (it.wtype || it.type) + (it.tier != null ? '/t' + it.tier : '') + (it.intro ? '/intro' : ''); const o = bt[k] || (bt[k] = { n: 0, ok: 0 }); o.n++; if (c) o.ok++; };
  for (let day = 0; day < DAYS; day++) {
    if (day > 0) { window.__off += DAY; Object.keys(K).forEach(k => K[k] *= .97); }
    if (day % 7 === 6) { rows.push({ day, skipped: 1 }); continue; }
    const backlog = dueCounts().total; const plan = todaysPlan(true); const kinds = {}; let ok = 0, n = 0, fresh = 0, est = plan.est / 60;
    const before = Object.keys(S.c).filter(k => S.c[k].seen).length;
    plan.items.forEach(it => {
      kinds[it.kind] = (kinds[it.kind] || 0) + 1; total++;
      const key = (it.cid || it.ref) + '|' + (it.exKey || it.ref || '') + '|' + it.type; if (seenKey[key] && day - seenKey[key] < 14) repeats++; seenKey[key] = day;
      if (it.type === 'listen') { used.lis.add(it.ref); it.qs.forEach(() => { const c = _rand() < Math.max(.2, Math.min(.95, .62 - .17 * (lvIdx(it.lvl) - T))); if (c) ok++; n++; recordResult({ kind: 'lis', skill: it.skill, lvl: it.lvl, type: 'mcq', wtype: 'mcq', cid: null, ref: null }, { ok: c, rt: 9000 }); }); S.lastListen = Date.now(); S.seenEx[it.ref] = Date.now(); }
      else if (it.type === 'speak' || it.type === 'write') { used[it.type === 'speak' ? 'spk' : 'wri'].add(it.ref); const c = _rand() < Math.max(.25, Math.min(.95, .72 - .18 * (lvIdx(it.lvl) - T))); if (c) ok++; n++; recordResult(it, { ok: c, score: c ? .8 : .4, rt: 70000, record: false }); if (it.type === 'speak') S.lastSpeak = Date.now(); else S.lastWrite = Date.now(); S.seenEx[it.ref] = Date.now(); }
      else { let k = know(it.cid, it.lvl); if (it.intro) { k = k + (1 - k) * .35; K[it.cid] = k; } const c = _rand() < pOf(it.wtype || it.type, k); if (c) ok++; n++; tally(it, c); if (it.kind === 'word') used.words.add(it.ref); recordResult(it, { ok: c, rt: c ? 6000 : 9000, yours: 'x', correct: it.correctText || 'y' }); K[it.cid] = k + (1 - k) * (c ? .14 : .08); }
    });
    S.plan = null; S.sessions.push({ at: Date.now(), min: est, n, ok, xp: 0, kind: 'daily' });
    const after = Object.keys(S.c).filter(k => S.c[k].seen).length;
    rows.push({ day, items: plan.items.length, est: +est.toFixed(1), acc: +(ok / Math.max(1, n)).toFixed(2), newC: after - before, backlog, kinds: Object.entries(kinds).map(e => e[0] + e[1]).join(' '), lvl: overallLabel(S), A: +overallA(S).toFixed(2) });
    if (day % 10 === 9) lvlTrace.push({ day: day + 1, A: +overallA(S).toFixed(2), lvl: overallLabel(S), sk: SKILLS.map(k => k[0] + ':' + S.sk[k].a.toFixed(1)).join(' '), b2: +b2Requirements(S).total.toFixed(2) });
  }
  const stages = { new: 0, learning: 0, familiar: 0, mastered: 0, forgotten: 0 }; Object.keys(S.c).forEach(k => { if (S.c[k].seen && !S.c[k].prior) stages[stageOf(S.c[k])]++; });
  const by = p => Object.keys(S.c).filter(k => k[0] === p && S.c[k].seen && !S.c[k].prior).length;
  const gm = CONTENT.gr.filter(g => { const c = S.c['g:' + g.id]; return c && !c.prior && c.m >= .75; }).map(g => g.name);
  const gs = CONTENT.gr.filter(g => { const c = S.c['g:' + g.id]; return c && !c.prior && c.seen; }).length;
  const kn = ['w', 'p'].map(p => { const ks = Object.keys(K).filter(k => k[0] === p); return ks.length ? (ks.reduce((s, k) => s + K[k], 0) / ks.length).toFixed(2) : '-'; });
  return JSON.stringify({ rows, lvlTrace, stages, met: { words: by('w'), phr: by('p'), gram: by('g'), conn: by('c'), nat: by('n') }, content: { words: CONTENT.words.length, phr: CONTENT.phr.length, gr: CONTENT.gr.length, lis: CONTENT.lis.length, spk: CONTENT.spk.length, rd: (CONTENT.rd || []).length }, used: { lis: used.lis.size, spk: used.spk.size, wri: used.wri.size, words: used.words.size }, repeats, total, gm, gs, mist: S.mist.length, knowledge: { w: kn[0], p: kn[1] }, b2: b2Requirements(S).list.map(r => r.name + ' ' + Math.round(r.v * 100)), xp: S.xp, bt });
})(${DAYS}, ${MIN})`;
  try {
    const r = JSON.parse(w.eval(script)); const rows = r.rows.filter(x => !x.skipped);
    const avg = f => (rows.reduce((s, x) => s + x[f], 0) / rows.length);
    console.log(`SIMULAÇÃO: aluno B1+ real, ${DAYS} dias (${DAYS - rows.length} de folga), meta ${MIN} min/dia\n`);
    console.log('dia  itens  min(est)  acerto  novos  fila  nível   composição');
    rows.filter(x => x.day < 5 || x.day % 6 === 0 || x.day === DAYS - 1).forEach(x => console.log(String(x.day + 1).padStart(3), String(x.items).padStart(5), String(x.est).padStart(8), String(Math.round(x.acc * 100) + '%').padStart(7), String(x.newC).padStart(6), String(x.backlog).padStart(5), (x.lvl + ' ' + x.A).padStart(9), ' ' + x.kinds));
    console.log('\nmédias: itens/sessão', avg('items').toFixed(1), '| minutos estimados', avg('est').toFixed(1), '| acerto', Math.round(avg('acc') * 100) + '% (alvo 80-85%) | conceitos novos/dia', avg('newC').toFixed(1), '| fila média de revisões', avg('backlog').toFixed(0));
    console.log('\nEVOLUÇÃO DO NÍVEL (a cada 10 dias):'); r.lvlTrace.forEach(x => console.log(' dia', x.day, x.lvl, x.A, '|', x.sk, '| B2 gate', Math.round(x.b2 * 100) + '%'));
    console.log('\nCONTEÚDO USADO:', JSON.stringify(r.content), '\n  conhecidos:', JSON.stringify(r.met), '| estágios:', JSON.stringify(r.stages));
    console.log('  listening distintos', r.used.lis + '/' + r.content.lis, '| speaking distintos', r.used.spk + '/' + r.content.spk, '| writing distintos', r.used.wri, '| palavras distintas', r.used.words + '/' + r.content.words);
    console.log('  exercícios repetidos em <14 dias:', r.repeats + '/' + r.total, '(' + Math.round(r.repeats / r.total * 100) + '%) | tópicos de gramática estudados', r.gs + '/' + r.content.gr, '| dominados:', r.gm.join(', ') || 'nenhum');
    console.log('  conhecimento "verdadeiro" médio do aluno: palavras', r.knowledge.w, 'phrasals', r.knowledge.p, '| erros guardados', r.mist, '| XP', r.xp);
    console.log('\n  ACERTO POR TIPO (n, %):'); Object.entries(r.bt).sort((a,b)=>b[1].n-a[1].n).slice(0,16).forEach(([k,v])=>console.log('   ',k.padEnd(26),String(v.n).padStart(4),Math.round(v.ok/v.n*100)+'%')); console.log('  requisitos B2:', r.b2.join(' | '));
  } catch (e) { console.log('SIM ERROR', e.message, errs.slice(0, 3)); }
  console.log('errors:', errs.length ? errs.slice(0, 3) : 'none'); process.exit(0);
}, 150);
