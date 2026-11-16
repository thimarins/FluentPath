(function () {
  const items = [];
  CONTENT.gr.forEach(g => (g.exercises || []).forEach(e => { if (e.t === 'fill') items.push({ src: 'gr:' + g.id, sub: esc(e.q), acc: (e.acc || [e.ans]).map(String), ans: String(e.ans) }); }));
  (CONTENT.con.items || []).forEach(c => { if (c.s && c.opts) items.push({ src: 'con', sub: esc(c.s), acc: [c.opts[c.ans]], ans: c.opts[c.ans] }); });
  CONTENT.words.forEach(w => { if (w.ex && w.form) items.push({ src: 'word:' + w.w, sub: esc(mask(w.ex, w.form)), acc: [w.form, w.w], ans: w.form }); });
  CONTENT.phr.forEach(p => { if (p.ex && p.form) items.push({ src: 'phr:' + p.v + ' ' + p.p, sub: esc(mask(p.ex, p.form)), acc: [p.form], ans: p.form }); });
  const fails = [], stats = { n: items.length, full: 0, lower: 0, contr: 0, junk: 0 };
  const CONTR = [[/\bI have\b/g, "I've"], [/\bhave not\b/g, "haven't"], [/\bhas not\b/g, "hasn't"], [/\bis not\b/g, "isn't"], [/\bare not\b/g, "aren't"], [/\bdo not\b/g, "don't"], [/\bdoes not\b/g, "doesn't"], [/\bdid not\b/g, "didn't"], [/\bwill not\b/g, "won't"], [/\bI am\b/g, "I'm"], [/\bwe are\b/g, "we're"], [/\bthey are\b/g, "they're"], [/\byou are\b/g, "you're"], [/\bit is\b/g, "it's"], [/\bwould not\b/g, "wouldn't"], [/\bcould not\b/g, "couldn't"], [/\bcannot\b/g, "can't"]];
  items.forEach(it => {
    const ta = document.createElement('textarea'); ta.innerHTML = it.sub; const raw = ta.value;
    if (!/_{2,}/.test(raw)) return;
    const filled = raw.replace(/\s*\([^)]*\)/g, ' ').replace(/\s+/g, ' ').replace(/_{2,}/, it.ans).trim();
    const t = v => typedVerdict(it, v);
    it.acc.forEach(a => { if (!t(a).ok) fails.push({ src: it.src, why: 'acc rejeitada', v: a, q: raw }); });
    if (!t(filled).ok) fails.push({ src: it.src, why: 'frase inteira rejeitada', v: filled, q: raw }); else stats.full++;
    const sents = filled.split(/(?<=[.!?]['"’]?)\s+/); const low = (sents.find(x => x.includes(it.ans)) || filled).toLowerCase().replace(/[.!?,]/g, '');
    if (!t(low).ok) fails.push({ src: it.src, why: 'frase inteira minuscula/sem pontuacao', v: low, q: raw }); else stats.lower++;
    CONTR.forEach(([re, c]) => {
      re.lastIndex = 0; if (re.test(filled)) { re.lastIndex = 0; const v = filled.replace(re, c); if (!t(v).ok) fails.push({ src: it.src, why: 'contracao rejeitada', v, q: raw }); else stats.contr++; }
      re.lastIndex = 0; if (re.test(it.ans)) { re.lastIndex = 0; const v = it.ans.replace(re, c); if (!t(v).ok) fails.push({ src: it.src, why: 'trecho contraido rejeitado', v, q: raw }); }
      re.lastIndex = 0;
    });
    ['banana', raw, raw.replace(/_{2,}/, 'zzzz')].forEach(v => { if (v && t(v).ok) fails.push({ src: it.src, why: 'lixo aceito', v, q: raw }); else stats.junk++; });
  });
  return JSON.stringify({ stats, fails });
})()
