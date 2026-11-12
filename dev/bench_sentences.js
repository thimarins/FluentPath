// Benchmark da análise de frases: 40 frases COM erro (típicos de brasileiros) + 20 corretas e complexas.
// Compara: (1) regras offline do app, (2) LanguageTool (online). Uso: node dev/bench_sentences.js
const fs = require('fs'), path = require('path');
const { JSDOM, VirtualConsole } = require((() => { try { require.resolve('jsdom'); return 'jsdom'; } catch (e) { return process.env.JSDOM_PATH || process.env.TEMP + '/pdfx/node_modules/jsdom'; } })());
const BAD = [
  ['preposition', 'We discussed about the budget yesterday.'], ['preposition', 'It depends of the weather.'], ['preposition', 'I am interested on learning more about security.'], ['preposition', 'He is married with a doctor.'], ['preposition', 'I have a meeting in Monday morning.'],
  ['preposition', 'She explained me the problem.'], ['gerund', 'I look forward to see you next week.'], ['gerund', 'I enjoy to swim on weekends.'], ['gerund', 'I am used to wake up early.'],
  ['agreement', 'She don\'t like coffee.'], ['agreement', 'He doesn\'t has any experience.'], ['agreement', 'There is many people waiting outside.'], ['agreement', 'Everyone have their own opinion.'], ['agreement', 'The team are working on it and they was tired.'],
  ['tense', 'I have 10 years working here.'], ['tense', 'I live here since 2019.'], ['tense', 'She is working here since five years.'], ['tense', 'I have lost my keys yesterday.'], ['tense', 'Yesterday I go to the office and I forgot my badge.'], ['tense', 'I didn\'t went to the party.'],
  ['conditional', 'If I would have more time, I would travel more.'], ['conditional', 'I will call you when I will arrive.'], ['conditional', 'If I knew the answer, I will tell you.'],
  ['uncountable', 'The informations are very useful.'], ['uncountable', 'She gave me a lot of advices about my career.'],
  ['comparative', 'My brother is more tall than me.'], ['adverb', 'She speaks English very good.'], ['adjective', 'The movie was bored, so we left early.'],
  ['literal', 'I make a travel to Rio every year.'], ['literal', 'Can you borrow me your charger?'], ['literal', 'They gonna miss the flight.'], ['literal', 'I am agree with you.'],
  ['connector', 'Despite of the rain, we went out.'], ['connector', 'The server crashed, however we restored it quickly because the backup was recent, so nobody noticed.'],
  ['reported', 'He asked me where did I live.'], ['reported', 'My boss said me that the deadline changed.'], ['reported', 'She told that she would come.'],
  ['modal', 'He can to swim very fast.'], ['relative', 'The company which I work for it is very big.'], ['wish', 'I wish I would have more free time right now.'],
  ['article', 'I need an advice about the visa.'], ['word-order', 'Always I drink coffee in the morning.'], ['capitalization', 'My english is not so good.'], ['verb-form', 'I suggested him to take a break.'], ['confusable', 'I would like that you help me with this task.'], ['false-friend', 'Actually I am working on the same project.'],
];
const GOOD = [
  'Although the migration was expensive, the board approved it because it reduced long-term risk.', 'If I had known about the outage earlier, I would have escalated it immediately.', 'Despite working long hours, she has been learning Spanish for two years.',
  'The report, which was written by the security team, highlights several vulnerabilities that need attention.', 'He asked me whether I had ever worked with a cloud provider before.', 'By the time we arrived, the meeting had already started.',
  'I used to commute by train, but now I work from home three days a week.', 'We are planning to roll out the update next week, provided that the tests pass.', 'Not only did the service fail, but the backup also turned out to be corrupted.',
  'She suggested that we postpone the deployment until Monday.', 'The new policy will be reviewed by the committee next month.', 'If you run into any issues, please contact the support team as soon as possible.',
  'I have been working here for ten years and I really enjoy the challenges.', 'They told us that the flight had been cancelled because of the storm.', 'It is essential that every employee complete the security training.',
  'Compared with last year, our response time has improved significantly.', 'Whereas the first option is cheaper, the second one is far more reliable.', 'I am looking forward to meeting you in person next week.',
  'There are several reasons why the project was delayed, and none of them were technical.', 'He apologized for the inconvenience and promised to fix the problem by the end of the day.'
];
(async () => {
  // 1) regras offline do app
  const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'FluentPath.html'), 'utf8');
  const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/', pretendToBeVisual: true, virtualConsole: new VirtualConsole(), beforeParse(w) { w.matchMedia = () => ({ matches: false, addEventListener() { } }); w.scrollTo = () => { }; } });
  await new Promise(r => setTimeout(r, 200));
  const off = s => dom.window.eval(`analyzeText(${JSON.stringify(s)},{src:'write'}).errors.length`) > 0;
  const offBad = BAD.map(([c, s]) => off(s)), offGood = GOOD.map(off);
  // 2) LanguageTool (uma requisição por conjunto; mapeia os achados pelas linhas)
  async function lt(lines) {
    const text = lines.join('\n'); const r = await fetch('https://api.languagetool.org/v2/check', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: 'language=en-US&text=' + encodeURIComponent(text) });
    const j = await r.json(); const starts = []; let p = 0; lines.forEach(l => { starts.push(p); p += l.length + 1; });
    const flagged = lines.map(() => false); (j.matches || []).forEach(m => { if (m.rule.category.id === 'STYLE') return; const idx = starts.findIndex((s, i) => m.offset >= s && m.offset < s + lines[i].length + 1); if (idx >= 0) flagged[idx] = true; }); return flagged;
  }
  let ltBad = null, ltGood = null; try { ltBad = await lt(BAD.map(x => x[1])); ltGood = await lt(GOOD); } catch (e) { console.log('LanguageTool indisponível:', e.message); }
  const n = a => a.filter(Boolean).length; const pc = (a, b) => Math.round(a / b * 100) + '%';
  console.log(`ERROS REAIS (${BAD.length} frases): detectados pelas regras do app: ${n(offBad)} (${pc(n(offBad), BAD.length)})` + (ltBad ? ` | LanguageTool: ${n(ltBad)} (${pc(n(ltBad), BAD.length)}) | pelo menos um dos dois: ${BAD.filter((_, i) => offBad[i] || ltBad[i]).length} (${pc(BAD.filter((_, i) => offBad[i] || ltBad[i]).length, BAD.length)})` : ''));
  console.log(`FRASES CORRETAS (${GOOD.length}): falsos alarmes do app: ${n(offGood)} (${pc(n(offGood), GOOD.length)})` + (ltGood ? ` | LanguageTool: ${n(ltGood)} (${pc(n(ltGood), GOOD.length)})` : ''));
  const cats = {}; BAD.forEach(([c], i) => { const o = cats[c] || (cats[c] = { n: 0, app: 0, lt: 0 }); o.n++; if (offBad[i]) o.app++; if (ltBad && ltBad[i]) o.lt++; });
  console.log('\npor categoria (n | app | LanguageTool):'); Object.entries(cats).forEach(([c, o]) => console.log('  ' + c.padEnd(15), o.n, '|', o.app, '|', ltBad ? o.lt : '-'));
  console.log('\nNÃO detectadas pelo app:', BAD.filter((_, i) => !offBad[i]).map(x => x[1]).slice(0, 12).join(' || '));
  if (ltBad) console.log('\nNÃO detectadas por nenhum:', BAD.filter((_, i) => !offBad[i] && !ltBad[i]).map(x => x[1]).join(' || '));
  if (offGood.some(Boolean)) console.log('\nFalsos alarmes do app:', GOOD.filter((_, i) => offGood[i]).join(' || '));
  process.exit(0);
})();
