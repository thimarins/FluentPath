const { JSDOM, VirtualConsole } = require((()=>{try{require.resolve('jsdom');return 'jsdom'}catch(e){return process.env.JSDOM_PATH||process.env.TEMP + '/pdfx/node_modules/jsdom'}})());
const html = require('fs').readFileSync(require('path').join(__dirname, '..', 'dist', 'FluentPath.html'), 'utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/', pretendToBeVisual: true, virtualConsole: new VirtualConsole(), beforeParse(w) { w.matchMedia = () => ({ matches: false, addEventListener() { } }); w.scrollTo = () => { }; } });
const w = dom.window; const ev = c => w.eval(c);
const T = {
  'A) B2 correct, well written': "Although remote work offers considerable flexibility, it can undermine collaboration. Teams that rarely meet in person tend to rely on written messages, which are easily misinterpreted. Consequently, managers should schedule regular check-ins in order to maintain trust. Nevertheless, the benefits, such as reduced commuting time, are significant enough that many companies will probably keep hybrid models.",
  'B) Simple text, many classic errors': "Yesterday I go to the office and I explain him the problem. He don't understand me because my english is bad. I have 5 years working here and I make a travel every month. The informations are very importants.",
  'C) Complex text, subtle errors the rules do not cover': "If I would have known about the outage earlier, I will have prevented the data loss. The team which I am working with are very experienced, but they doesn't communicate enough. Despite of the budget was limited, we succeeded to deliver the project in time. Me and my colleague discussed about the solution during the meeting yesterday.",
  'D) Fluent-sounding but meaningless': "Furthermore, moreover, in addition, nevertheless, consequently, therefore, however, although the infrastructure furthermore the colleagues consequently the weather."
};
for (const [k, t] of Object.entries(T)) {
  const a = ev(`analyzeText(${JSON.stringify(t)},{src:'write'})`);
  console.log('\n== ' + k + '\n  level ' + a.cefr + ' (' + a.levelIdx.toFixed(1) + ') | grammar ' + a.scores.grammar + ' | naturalness ' + a.scores.naturalness + ' | connectors ' + a.scores.connectors + ' | vocab ' + a.scores.vocabulary);
  console.log('  errors found (' + a.errors.length + '): ' + (a.errors.map(e => e.bad + ' -> ' + e.good).join(' ; ') || 'none'));
}
console.log('\nrules in engine:', ev('ERROR_RULES.length'), '| words:', ev('CONTENT.words.length'), '| phrasals:', ev('CONTENT.phr.length'));
process.exit(0);
