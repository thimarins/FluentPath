// Testa o dicionário online com os serviços REAIS (precisa de internet).
const path = require('path'), fs = require('fs');
const { JSDOM, VirtualConsole } = require((() => { try { require.resolve('jsdom'); return 'jsdom'; } catch (e) { return process.env.JSDOM_PATH || process.env.TEMP + '/pdfx/node_modules/jsdom'; } })());
const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'FluentPath.html'), 'utf8'); const errs = [];
const vc = new VirtualConsole(); vc.on('jsdomError', e => errs.push(e.message));
const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/', pretendToBeVisual: true, virtualConsole: vc, beforeParse(w) { w.matchMedia = () => ({ matches: false, addEventListener() { } }); w.scrollTo = () => { }; w.Element.prototype.scrollTo = function () { }; w.confirm = () => true; w.fetch = (u, o) => fetch(u, o); w.AbortController = AbortController; } });
const w = dom.window, ev = c => w.eval(c); const sleep = ms => new Promise(r => setTimeout(r, ms));
const pass = (n, c, x = '') => { console.log((c ? 'PASS ' : 'FAIL ') + n + (x ? ' — ' + x : '')); if (!c) process.exitCode = 1; };
(async () => {
  await sleep(100); ev("S.onboarded=true;S.profile.name='T';save()"); w.location.hash = '/vocab'; await sleep(100);
  pass('vocabulary page shows the lookup box', !!w.document.querySelector('#lkq'));
  for (const word of ['outage', 'overwhelmed', 'run into', 'although']) {
    const r = await w.eval(`lookupWord(${JSON.stringify(word)})`);
    pass(`lookup "${word}"`, r.pos.length > 0 && !!r.pt, `PT: ${r.pt} | ${r.pos.map(p => p.pos).join('/')} | ${r.pos[0] ? r.pos[0].defs[0].d.slice(0, 60) : ''} | freq ${r.freq} | syn ${r.syn.slice(0, 3).join(',')} | coll ${r.coll.slice(0, 3).join(',')}`);
  }
  const bad = await w.eval("lookupWord('asdfghjk')"); pass('nonsense word is handled gracefully (no entry)', !bad.pos.length, JSON.stringify(bad.pt));
  const html1 = ev("lookupHTML(lkCache()['although'])"); pass('result card renders sections', /Synonyms|In Portuguese/.test(html1) && /Add to my dictionary/.test(html1));
  // UI + adicionar ao dicionário pessoal + cache
  w.document.querySelector('#lkq').value = 'overwhelmed'; w.eval('ACT.lkgo()'); await sleep(2500);
  pass('modal shows the looked-up word', /overwhelmed/.test(w.document.querySelector('.modal').textContent) && /In Portuguese/.test(w.document.querySelector('.modal').textContent));
  const before = ev('S.personal.length'); w.eval("ACT.lkadd({dataset:{w:'overwhelmed'}})"); await sleep(100);
  pass('added to personal dictionary and review system', ev('S.personal.length') === before + 1 && !!ev("IDX.words['my-overwhelmed']") && ev("S.c['w:my-overwhelmed']") !== undefined, ev("JSON.stringify(S.personal[S.personal.length-1]).slice(0,160)"));
  const it = ev("wordItem(S, IDX.words['my-overwhelmed'], 1)"); pass('the new word generates exercises', it && it.type === 'mcq' && it.opts.length >= 2);
  const t0 = Date.now(); await w.eval("lookupWord('overwhelmed')"); pass('second lookup comes from cache (instant)', Date.now() - t0 < 50, (Date.now() - t0) + ' ms');
  // palette
  w.eval('openPalette()'); const q = w.document.querySelector('#palq'); q.value = 'scalability'; q.dispatchEvent(new w.Event('input')); await sleep(30);
  pass('Ctrl+K offers "Look up online" for any word', [...w.document.querySelectorAll('#palr .r')].some(r => /Look up/.test(r.textContent)));
  // offline
  w.fetch = () => Promise.reject(new Error('offline')); let msg = ''; try { await w.eval("lookupWord('newword')"); } catch (e) { msg = e.message; }
  pass('offline gives a clear message instead of breaking', /internet connection/i.test(msg), msg);
  console.log('ERRORS:', errs.length ? errs.slice(0, 5) : 'none'); process.exit(process.exitCode || 0);
})().catch(e => { console.log('CRASH', e.stack); process.exit(1); });
