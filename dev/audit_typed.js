// Audita TODOS os exercicios de digitar: aceita frase inteira, contracoes e variacoes obvias? Rejeita lixo?
// (o codigo que roda dentro da pagina fica em audit_typed_page.js)
const fs = require('fs'), path = require('path');
const { JSDOM, VirtualConsole } = require((() => { try { require.resolve('jsdom'); return 'jsdom'; } catch (e) { return process.env.JSDOM_PATH || process.env.TEMP + '/pdfx/node_modules/jsdom'; } })());
(async () => {
  const dom = new JSDOM(fs.readFileSync(path.join(__dirname, '..', 'dist', 'FluentPath.html'), 'utf8'), { runScripts: 'dangerously', url: 'http://localhost/', pretendToBeVisual: true, virtualConsole: new VirtualConsole(), beforeParse(w) { w.matchMedia = () => ({ matches: false, addEventListener() { } }); w.scrollTo = () => { }; w.speechSynthesis = { getVoices: () => [], speak() { }, cancel() { }, addEventListener() { } }; } });
  await new Promise(r => setTimeout(r, 300));
  const r = JSON.parse(dom.window.eval(fs.readFileSync(path.join(__dirname, 'audit_typed_page.js'), 'utf8')));
  console.log(JSON.stringify(r.stats));
  const by = {}; r.fails.forEach(f => { (by[f.why] = by[f.why] || []).push(f); });
  Object.entries(by).forEach(([k, a]) => { console.log('\n## ' + k + ' (' + a.length + ')'); a.slice(0, 10).forEach(f => console.log('  [' + f.src + '] ' + f.q + '  <-  ' + f.v)); });
  console.log(r.fails.length ? '\nFALHAS: ' + r.fails.length : '\nERRORS: none'); process.exit(r.fails.length ? 1 : 0);
})();
