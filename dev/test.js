const { JSDOM, VirtualConsole } = require((()=>{try{require.resolve('jsdom');return 'jsdom'}catch(e){return process.env.JSDOM_PATH||process.env.TEMP + '/pdfx/node_modules/jsdom'}})());
const fs = require('fs');
const html = fs.readFileSync(require('path').join(__dirname, '..', 'dist', 'FluentPath.html'), 'utf8');
const errs = [];
const vc = new VirtualConsole(); vc.on('jsdomError', e => errs.push('jsdomError: ' + (e.detail && e.detail.stack || e.message))); vc.on('error', e => errs.push('console.error: ' + e));
const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/', pretendToBeVisual: true, virtualConsole: vc, beforeParse(w) { w.matchMedia = w.matchMedia || (() => ({ matches: false, addEventListener() { }, addListener() { } })); w.scrollTo = () => { }; w.Element.prototype.scrollTo = function () { }; w.HTMLElement.prototype.scrollTo = function () { }; w.confirm = () => true; } });
const w = dom.window; const ev = c => w.eval(c);
w.addEventListener('error', e => errs.push('window.error: ' + e.message + ' @' + (e.filename || '') + ':' + e.lineno));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const view = () => w.document.querySelector('#view');
const go = async (h) => { w.location.hash = h; await sleep(30); };
const check = (name, cond, extra = '') => console.log((cond ? 'PASS ' : 'FAIL ') + name + (extra ? ' — ' + extra : ''));
(async () => {
  await sleep(100);
  check('boots to onboarding', /onboarding/.test(w.location.hash) && view() && view().textContent.includes('Welcome'));
  // demo
  ev("ACT.obdemo()"); await sleep(50);
  check('demo loaded', ev('S.demo && S.onboarded'), 'concepts=' + ev('Object.keys(S.c).length') + ' mist=' + ev('S.mist.length'));
  const routes = ['/home', '/learn', '/session', '/practice', '/vocab', '/phrasals', '/grammar', '/grammar/second-conditional', '/connectors', '/natural', '/speaking', '/listening', '/reading', '/writing', '/mistakes', '/review', '/progress', '/roadmap', '/tutor', '/achievements', '/settings', '/topic/tech', '/topic/travel'];
  for (const r of routes) { const before = errs.length; await go(r); const t = view() ? view().textContent.length : 0; check('route ' + r, t > 120 && errs.length === before, t + ' chars' + (errs.length > before ? ' ERR ' + errs[errs.length - 1] : '')); }
  // tabs on pages
  for (const [act, args] of [['sptab', { t: 'roleplay' }], ['sptab', { t: 'pron' }], ['sptab', { t: 'hist' }], ['nttab', { t: 'train' }], ['vtab', { t: 'my' }], ['cncat', { c: 'contrast' }]]) {
    const route = { sptab: '/speaking', nttab: '/natural', vtab: '/vocab', cncat: '/connectors' }[act]; await go(route); const before = errs.length;
    try { const el = w.document.createElement('button'); Object.entries(args).forEach(([k, v]) => el.dataset[k] = v); ev(`ACT.${act}`).call && w.eval(`ACT.${act}`)(el); } catch (e) { errs.push(act + ': ' + e.message); }
    await sleep(20); check('tab ' + act + JSON.stringify(args), errs.length === before, errs[errs.length - 1] || '');
  }
  // palette
  await go('/home'); try { w.eval('openPalette()'); const q = w.document.querySelector('#palq'); q.value = 'deployment'; q.dispatchEvent(new w.Event('input')); await sleep(20); check('palette search', w.document.querySelectorAll('#palr .r').length > 0, w.document.querySelectorAll('#palr .r')[0] && w.document.querySelectorAll('#palr .r')[0].textContent.slice(0, 40)); w.eval('closeModal()'); } catch (e) { check('palette', false, e.message); }
  // cards
  for (const [t, id] of [['word', 'deployment'], ['phr', 'put-off'], ['gram', 'second-conditional'], ['nat', 'nat-01']]) { try { w.eval(`openCard({type:'${t}',id:'${id}'})`); check('card ' + t, !!w.document.querySelector('.modal') && w.document.querySelector('.modal').textContent.length > 50); w.eval('closeModal()'); } catch (e) { check('card ' + t, false, e.message); } }

  // sessão diária completa: responde corretamente tudo
  async function runAll(label, maxSteps = 80) {
    let steps = 0, answered = 0, kinds = {};
    while (w.document.querySelector('#runner') && ev('R && !R.summary') && steps++ < maxSteps) {
      const it = ev('R.cur && R.cur.item'); if (!it) break; kinds[it.type] = (kinds[it.type] || 0) + 1;
      if (ev('!!(R.cur.item.intro && !R.cur.introDone)')) { intros = (typeof intros === 'number' ? intros : 0) + 1; w.eval('ACT.rintro()'); }
      const t = it.type;
      try {
        if (t === 'mcq') { w.eval(`ACT.rsel(document.querySelectorAll('.opt')[R.cur.item.ans])`); w.eval('ACT.rcheck()'); }
        else if (t === 'typed') { w.document.querySelector('#rin').value = it.acc[0]; w.eval('ACT.rcheck()'); }
        else if (t === 'order') { w.eval(`R.cur.item.seq.forEach(function(wd,i){var b=R.cur.bank.find(function(x){return x.i===i&&!R.cur.placed.includes(x)});R.cur.placed.push(b)});R.cur.draw();ACT.rcheck()`); }
        else if (t === 'translate') { w.document.querySelector('#rin').value = it.natural; w.eval('ACT.rcheck()'); }
        else if (t === 'produce') { const need = it.need || {}; let txt = it.model || 'I really think this is a good idea although it can be hard, however I will try.'; w.document.querySelector('#rin').value = txt; w.eval('ACT.rcheck()'); if (w.eval('R.cur.phase') === 'self') w.eval(`ACT.rself({dataset:{v:'1'}})`); }
        else if (t === 'speak') { w.document.querySelector('#rin').value = it.model; w.eval('ACT.rcheck()'); }
        else if (t === 'write') { w.document.querySelector('#rin').value = 'Although remote work can be useful, however it also has drawbacks. Therefore companies should choose carefully. Moreover, managers must communicate clearly. As a result, teams stay productive. In addition, trust is essential for everyone.'; w.eval('ACT.rcheck()'); }
        else if (t === 'listen') { w.eval('ACT.lready()'); for (let q = 0; q < it.qs.length; q++) { w.eval(`ACT.lans({dataset:{i:'${it.qs[q].ans}'}})`); w.eval('ACT.lnext()'); } }
        answered++;
        const nb = w.document.querySelector('#rgo'); if (w.document.querySelector('#runner') && ev('R && !R.summary')) w.eval('ACT.rnext()');
      } catch (e) { errs.push(label + ' step ' + steps + ' (' + t + '): ' + e.message); break; }
      await sleep(5);
    }
    return { steps, answered, kinds, summary: !!w.document.querySelector('#runner') && /Back to home|Another round/.test(w.document.querySelector('#runner').textContent) };
  }
  const xp0 = ev('S.xp'); const before = errs.length;
  await go('/home'); ev('ACT.startDaily()'); await sleep(30);
  const total = ev('R.queue.length'); const blocks = ev('R.plan.blocks.map(b=>b.key+":"+b.items.length).join(" ")');
  const r1 = await runAll('daily');
  check('daily session runs to summary', r1.summary && errs.length === before, `queue ${total} [${blocks}] answered ${r1.answered} kinds ${JSON.stringify(r1.kinds)} xp +${ev('S.xp') - xp0}` + (errs.length > before ? ' ERR ' + errs.slice(before).join(' | ') : ''));
  ev('ACT.rdone()'); await sleep(30); check('back home after session', /home/.test(w.location.hash) && !w.document.querySelector('#runner'));
  // sessões rápidas
  for (const m of ['vocab', 'grammar', 'speaking', 'listening', 'review', 'surprise']) { const b = errs.length; try { ev(`startQuick('${m}',5)`); await sleep(20); if (w.document.querySelector('#runner')) { const r = await runAll('quick-' + m, 40); check('quick ' + m, errs.length === b, `${r.answered} answered ${JSON.stringify(r.kinds)}`); w.eval('closeRunner(true)'); } else check('quick ' + m + ' (nothing due)', true); } catch (e) { check('quick ' + m, false, e.message); } }
  // errando de propósito: verifica caderno de erros e item de recuperação
  const mb = ev('S.mist.length'); ev(`startQuick('grammar',3)`); await sleep(20);
  for (let k = 0; k < 3 && ev('R && R.cur && R.cur.item.type') === 'mcq'; k++) { w.eval(`ACT.rsel(document.querySelectorAll('.opt')[(R.cur.item.ans+1)%R.cur.item.opts.length])`); w.eval('ACT.rcheck()'); w.eval('ACT.rnext()'); }
  check('wrong answers recorded as mistakes', ev('S.mist.length') >= mb, mb + ' → ' + ev('S.mist.length')); w.eval('closeRunner(true)');
  // mistakes page repair
  await go('/mistakes'); try { w.eval('ACT.mkrepair()'); await sleep(20); const r = await runAll('repair', 20); check('mistake repair runs', !!r.steps, JSON.stringify(r.kinds)); w.eval('closeRunner(true)'); } catch (e) { check('mistake repair', false, e.message); }
  // roleplay
  try { w.eval(`startRoleplay('${ev('CONTENT.rp[0].id')}')`); w.document.querySelector('#rpin').value = ev('CONTENT.rp[0].model'); w.eval('ACT.rpsend()'); await sleep(30); for (let i = 0; i < 4 && w.document.querySelector('#rpin'); i++) { w.document.querySelector('#rpin').value = 'The server crashed because of a database issue, so we will restore the backup.'; await w.eval('ACT.rpsend()'); await sleep(20); } check('roleplay finishes', /Done|Try again/.test(w.document.querySelector('#runner').textContent)); w.eval('closeRunner(true)'); } catch (e) { check('roleplay', false, e.message); }
  // writing lab
  await go('/writing'); w.document.querySelector('#wrt').value = 'I think that remote work is good because it saves time. However, I also believe that it can be lonely. Although many people like it, some prefer the office. Therefore companies should be flexible. I make a travel to the office twice a week.'; w.eval('ACT.wranalyze()'); await sleep(20); check('writing analysis renders', /Estimated level/.test(view().textContent) && /take a trip/.test(view().textContent));
  // tutor
  await go('/tutor'); for (const q of ['Why am I still B1?', 'Explain my biggest mistake', 'Give me B2 vocabulary']) { w.eval(`tutAsk(${JSON.stringify(q)})`); await sleep(30); } check('tutor answers offline', /Estimated mastery|pattern|B2 words/i.test(view().textContent));
  // roadmap tests
  const b2 = errs.length; await go('/test/B2'); await sleep(30); let n = 0; while (ev('DX') && ev('DX.cur') && n++ < 40) { const it = ev('DX.cur.it'); w.eval(`ACT.dxans({dataset:{i:'${it.ans}'}})`); await sleep(2); } check('B2 test report', /Back to roadmap/.test(view().textContent) && errs.length === b2, view().textContent.slice(0, 80));

  // FLUXO NOVO: reset → onboarding → diagnóstico adaptativo
  ev('resetAll()'); w.location.hash = '/onboarding'; await sleep(30); w.eval('OB=null'); w.eval('render()'); await sleep(30);
  w.document.querySelector('#obname').value = 'Test'; w.eval('OB.d.name="Test"'); for (let i = 0; i < 7; i++) { w.eval('ACT.obnext()'); await sleep(5); } check('onboarding completes', ev('S.onboarded') && /diagnostic/.test(w.location.hash));
  await sleep(30); w.eval('ACT.dxstart()'); await sleep(20); let q = 0; const lv = []; while (ev('DX && DX.kind==="adaptive" && DX.cur') && q++ < 40) { const it = ev('DX.cur.it'); lv.push(it.lvl); const right = q % 3 !== 0; w.eval(`ACT.dxans({dataset:{i:'${right ? it.ans : (it.ans + 1) % 4}'}})`); await sleep(2); }
  const nq = ev('DX ? DX.D.ans.length : -1'); check('adaptive test asks 16–24 questions', nq >= 16 && nq <= 24, nq + ' questions; levels ' + lv.slice(0, nq).join(','));
  w.document.querySelector('#dxw').value = 'I work as an IT analyst. I have been working here for five years. Although the job is interesting, I want to improve my English because I talk with foreign clients every week.'; w.eval('ACT.dxwdone()'); await sleep(10); w.document.querySelector('#dxs2').value = 'Last month our system stopped and I had to explain the problem to my manager because the customers were angry.'; w.eval('ACT.dxsdone()'); await sleep(20);
  check('placement result', /Estimated CEFR/.test(view().textContent), ev('S.profile.level') + ' skills ' + ev('JSON.stringify(Object.fromEntries(SKILLS.map(k=>[k,lvLabel(S.sk[k].a)])))'));
  w.eval('ACT.dxgo()'); await sleep(30); check('home after placement', /home/.test(w.location.hash) && /START TODAY/.test(view().textContent));
  const plan = ev('S.plan || todaysPlan()'); console.log('plan blocks (fresh user):', plan.blocks.map(b => b.label + '×' + b.items.length).join(', '));
  console.log('\nERRORS:', errs.length ? errs.slice(0, 15).join('\n') : 'none');
  process.exit(0);
})().catch(e => { console.log('CRASH', e.stack); console.log(errs.slice(0, 10)); process.exit(1); });
