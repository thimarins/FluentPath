// Conjunto de VALIDAÇÃO (holdout): frases novas, escritas ANTES de melhorar as regras, para medir generalização.
// Uso: node dev/bench_holdout.js   (compara regras do app e LanguageTool; também varre todo o conteúdo do app em busca de falsos alarmes)
const fs = require('fs'), path = require('path');
const { JSDOM, VirtualConsole } = require((() => { try { require.resolve('jsdom'); return 'jsdom'; } catch (e) { return process.env.JSDOM_PATH || process.env.TEMP + '/pdfx/node_modules/jsdom'; } })());
const BAD = [
  'She suggested me to change the plan.', 'They discussed about the new strategy.', 'I am married with a lawyer.', 'He explained us the rules.', 'My sister don\'t speak French.', 'There are much problems with the system.',
  'Each student have a laptop.', 'The staff are friendly and they was helpful.', 'I work here since March.', 'He lives in Spain since 2020.', 'I have seen that movie last week.', 'We didn\'t saw the message.',
  'If she would know, she would tell us.', 'When he will get home, he will call.', 'I need some informations about the course.', 'He gave me many advices.', 'This phone is more cheap than that one.', 'He plays the guitar very good.',
  'The lesson was really tired.', 'I\'m looking forward to hear from you.', 'She enjoys to read at night.', 'I\'m used to work late.', 'He asked me what was my name.', 'She said me she was busy.',
  'The man who I spoke with him was kind.', 'I wish I will have more time.', 'I need an information about the schedule.', 'Never I eat meat.', 'I am interesting in music.', 'He is good in math.',
  'I prefer tea than coffee.', 'She is afraid from dogs.', 'I\'ll see you in the next Friday.', 'We arrived to the hotel late.', 'The report was long, however we finished it on time because everyone helped.'
];
const GOOD = [
  'I\'ve been working here for ten years.', 'We explained the plan to him.', 'She suggested that he leave early.', 'There are many options to choose from.', 'Everyone has an opinion about it.', 'He doesn\'t have any experience.',
  'If I were you, I would apologize.', 'Since 2019, I have lived in this city.', 'I have seen it twice since Monday.', 'He said that he was busy.', 'I am used to working late.', 'She enjoys reading at night.',
  'I\'m looking forward to hearing from you.', 'The staff are friendly and helpful.', 'The people I spoke with were very kind.', 'I prefer tea to coffee.', 'We arrived at the hotel late.', 'The lesson was really tiring.',
  'If you have time, would you help me with this?', 'I don\'t know when he will come, but I will wait.', 'She asked me where I lived.', 'The book that I gave to him was a gift.', 'My parents don\'t like spicy food.', 'Sometimes I go to the gym after work.',
  'I speak English every day and I read the news online.', 'She plays good music at parties.', 'He is good at math and interested in physics.', 'The team doesn\'t have enough time.', 'I wish I had more time.', 'Please let me know if there is any problem.'
];
(async () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'FluentPath.html'), 'utf8');
  const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/', pretendToBeVisual: true, virtualConsole: new VirtualConsole(), beforeParse(w) { w.matchMedia = () => ({ matches: false, addEventListener() { } }); w.scrollTo = () => { }; } });
  await new Promise(r => setTimeout(r, 200)); const W = dom.window;
  const off = s => W.eval(`analyzeText(${JSON.stringify(s)},{src:'write'}).errors.length`) > 0;
  const offBad = BAD.map(off), offGood = GOOD.map(off);
  async function lt(lines) { const text = lines.join('\n'); const r = await fetch('https://api.languagetool.org/v2/check', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: 'language=en-US&text=' + encodeURIComponent(text) }); const j = await r.json(); const starts = []; let p = 0; lines.forEach(l => { starts.push(p); p += l.length + 1; }); const f = lines.map(() => false); (j.matches || []).forEach(m => { if (m.rule.category.id === 'STYLE') return; const i = starts.findIndex((s, k) => m.offset >= s && m.offset < s + lines[k].length + 1); if (i >= 0) f[i] = true; }); return f; }
  let lb = null, lg = null; try { lb = await lt(BAD); lg = await lt(GOOD); } catch (e) { console.log('LanguageTool indisponível'); }
  const n = a => a.filter(Boolean).length, pc = (a, b) => Math.round(a / b * 100) + '%';
  console.log(`VALIDAÇÃO — erros (${BAD.length}): app ${n(offBad)} (${pc(n(offBad), BAD.length)})` + (lb ? ` | LanguageTool ${n(lb)} (${pc(n(lb), BAD.length)}) | app OU LT ${BAD.filter((_, i) => offBad[i] || lb[i]).length} (${pc(BAD.filter((_, i) => offBad[i] || lb[i]).length, BAD.length)})` : ''));
  console.log(`VALIDAÇÃO — corretas (${GOOD.length}): falsos alarmes do app ${n(offGood)} (${pc(n(offGood), GOOD.length)})` + (lg ? ` | LanguageTool ${n(lg)}` : ''));
  if (offGood.some(Boolean)) console.log('  falsos alarmes:', GOOD.filter((_, i) => offGood[i]).join(' || '));
  console.log('  perdidas pelo app:', BAD.filter((_, i) => !offBad[i]).join(' || '));
  // varredura de falsos alarmes: todas as frases corretas do próprio conteúdo
  const CT = JSON.parse(W.eval('JSON.stringify(CONTENT)')); const sents = [];
  CT.words.forEach(w => { sents.push(w.ex, w.nat); }); CT.phr.forEach(p => sents.push(p.ex, p.nat)); CT.nat.forEach(x => sents.push(x.natural));
  const SP = /(?<=[.!?])\s+/;
  CT.lis.forEach(l => l.script.split('\n').forEach(x => sents.push(x.replace(/^[A-Z][\w ]{0,15}:\s*/, '')))); CT.rd.forEach(r => r.text.split(SP).forEach(x => sents.push(x))); CT.spk.forEach(x => x.model.split(SP).forEach(y => sents.push(y))); CT.rp.forEach(x => x.model.split(SP).forEach(y => sents.push(y)));
  CT.gr.forEach(g => g.ex.forEach(x => sents.push(x)));
  const clean = sents.filter(s => s && s.split(' ').length >= 4); const fp = clean.filter(off);
  console.log(`\nVARREDURA: ${clean.length} frases corretas do próprio conteúdo -> ${fp.length} marcadas como erro (${(fp.length / clean.length * 100).toFixed(1)}%)`); fp.slice(0, 12).forEach(s => console.log('   FP:', s));
  process.exit(0);
})();
