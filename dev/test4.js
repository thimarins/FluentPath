const { JSDOM, VirtualConsole } = require((()=>{try{require.resolve('jsdom');return 'jsdom'}catch(e){return process.env.JSDOM_PATH||process.env.TEMP + '/pdfx/node_modules/jsdom'}})());
const html = require('fs').readFileSync(require('path').join(__dirname, '..', 'dist', 'FluentPath.html'), 'utf8');
const errs = [];
function boot(saved) {
  const vc = new VirtualConsole(); vc.on('jsdomError', e => errs.push(e.message));
  const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/', pretendToBeVisual: true, virtualConsole: vc, beforeParse(w) { w.matchMedia = () => ({ matches: false, addEventListener() { } }); w.scrollTo = () => { }; w.Element.prototype.scrollTo = function () { }; w.confirm = () => true; if (saved) w.localStorage.setItem('fluentpath.v1', saved); } });
  dom.window.addEventListener('error', e => errs.push('window.error ' + e.message)); return dom.window;
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  let w = boot(); await sleep(80); w.eval('ACT.obdemo()'); await sleep(30);
  w.eval('ACT.startDaily()'); await sleep(20); w.eval('R.cur.item.type'); w.eval("ACT.rquit()"); await sleep(20);
  const saved = w.localStorage.getItem('fluentpath.v1'); const o = JSON.parse(saved);
  console.log('saved size KB', Math.round(saved.length / 1024), '| has plan?', 'plan' in o, '| concepts', Object.keys(o.c).length, '| onboarded', o.onboarded);
  w.close();
  // recarrega a página com o estado salvo e roda TODOS os tipos de produção
  w = boot(saved); await sleep(80);
  console.log('after reload: hash', w.location.hash, '| demo', w.eval('S.demo'), '| view chars', w.document.querySelector('#view').textContent.length);
  const kinds = {};
  for (const mk of ["wordItem(S,CONTENT.words[0],3)", "phrItem(S,CONTENT.phr[0],3)", "gramItem(S,IDX.gr['second-conditional'],3)", "gramItem(S,IDX.gr['present-perfect'],3)", "connItem(S,CONTENT.con.items[0],3)", "natItem(S,CONTENT.nat[0],3)", "natItem(S,CONTENT.nat[1],2)", "natItem(S,CONTENT.nat[2],1)"]) {
    try {
      w.eval(`var __it=${mk}; __it.block='q'; __it.reason='t'; startRunner({items:[__it],blocks:[]},{kind:'quick'})`); await sleep(10);
      const it = w.eval('R.cur.item'); kinds[it.kind + '/' + it.type] = 1;
      if (it.type === 'produce') { w.document.querySelector('#rin').value = it.model || 'I think we should although'; w.eval('ACT.rcheck()'); if (w.eval('R.cur.phase') === 'self') w.eval("ACT.rself({dataset:{v:'1'}})"); }
      else if (it.type === 'translate') { w.document.querySelector('#rin').value = it.natural; w.eval('ACT.rcheck()'); }
      else if (it.type === 'typed') { w.document.querySelector('#rin').value = it.acc[0]; w.eval('ACT.rcheck()'); }
      const fb = w.document.querySelector('#rfbk'); if (!fb) errs.push('no feedback for ' + mk);
      w.eval('closeRunner(true)');
    } catch (e) { errs.push(mk + ': ' + e.message); }
  }
  console.log('tier-3/2/1 item types exercised:', Object.keys(kinds).join(', '));
  // exportar / importar
  const exported = w.eval('JSON.stringify(S,NOSAVE)'); console.log('export ok, bytes', exported.length, '| contains RegExp junk?', /"probe":\{\}/.test(exported));
  console.log('ERRORS:', errs.length ? errs : 'none'); process.exit(0);
})();
