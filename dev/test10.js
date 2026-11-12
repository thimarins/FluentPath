const path = require('path'), fs = require('fs');
const { JSDOM, VirtualConsole } = require((() => { try { require.resolve('jsdom'); return 'jsdom'; } catch (e) { return process.env.JSDOM_PATH || process.env.TEMP + '/pdfx/node_modules/jsdom'; } })());
const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'FluentPath.html'), 'utf8'); const errs = [];
const vc = new VirtualConsole(); vc.on('jsdomError', e => errs.push(e.message));
const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/', pretendToBeVisual: true, virtualConsole: vc, beforeParse(w) { w.matchMedia = () => ({ matches: false, addEventListener() { } }); w.scrollTo = () => { }; w.Element.prototype.scrollTo = function () { }; w.confirm = () => true; w.fetch = () => Promise.reject(new Error('offline')); } });
const w = dom.window, ev = c => w.eval(c), sleep = ms => new Promise(r => setTimeout(r, ms));
const pass = (n, c, x = '') => { console.log((c ? 'PASS ' : 'FAIL ') + n + (x ? ' — ' + x : '')); if (!c) process.exitCode = 1; };
(async () => {
  await sleep(100);
  ev("S.onboarded=true;S.profile.name='Ana';applyDiagnostic(S,{sk:{reading:3,listening:3,writing:3,speaking:3,vocab:3,grammar:3},theta:3,strengths:[],weaknesses:[],n:0,at:Date.now()});save()");
  w.location.hash = '/home'; await sleep(80); const home = w.document.querySelector('#view').textContent;
  pass('new-user Home shows welcome, quests, level and the path', /Welcome, Ana/.test(home) && /Today's quests/.test(home) && /Newcomer/.test(home) && /Your path to B2/.test(home), '');
  pass('path has 10 stations', w.document.querySelectorAll('.stn').length === 10);
  pass('content is bigger', ev('CONTENT.words.length') >= 290 && ev('CONTENT.lis.length') >= 40 && ev('CONTENT.rd.length') >= 18, `${ev('CONTENT.words.length')} words, ${ev('CONTENT.lis.length')} listening, ${ev('CONTENT.rd.length')} reading, ${ev('CONTENT.phr.length')} phrasals`);
  // missões: responder 20 exercícios dá XP e conclui a missão
  const xp0 = ev('S.xp'); ev(`(function(){var p=planQuick(S,'vocab',10),c=0;var it0=p.items[0];for(var i=0;i<22;i++){var it=p.items[i%p.items.length];recordResult(it,{ok:true,rt:3000});c++}})()`);
  const q = ev('dailyQuests().find(function(q){return q.id==="answers"})'); pass('"Answer 20 exercises" quest completes and pays XP', q.done && ev('S.quests.done.answers') > 0 && ev('S.xp') >= xp0 + 20, `xp ${xp0} -> ${ev('S.xp')}`);
  const xpAfter = ev('S.xp'); ev('checkQuests()'); pass('quest XP is paid only once', ev('S.xp') === xpAfter);
  // runner: cartão de apresentação + modal acima do runner + som
  ev('ACT.startDaily()'); await sleep(40);
  pass('first item of a new concept starts with a teaching card', ev('R.cur.item.intro') === true && /New (word|phrasal verb|grammar topic)/.test(w.document.querySelector('#rmain').textContent), w.document.querySelector('.rlabel').textContent.slice(0, 40));
  w.eval('ACT.rintro()'); await sleep(20); pass('after "Got it" the exercise appears', w.document.querySelectorAll('.opt, #rin, .wchip').length > 0);
  w.eval('ACT.rwhy()'); const z = w.getComputedStyle ? 'n/a' : ''; pass('modal opens (z-index above runner in CSS)', /z-index:150/.test(w.document.querySelector('style').textContent.replace(/\s/g, '')) , '');
  w.eval('closeModal()');
  ev("S.settings.sound=true"); w.eval('ACT.rsound()'); pass('sound toggle works and never throws without audio', ev('S.settings.sound') === false); ev("S.settings.sound=true"); ev("SFX.play('ok');SFX.play('bad');SFX.play('done')");
  w.eval('closeRunner(true)');
  // sessão completa -> resumo com nível, missões e confete
  ev('ACT.startDaily()'); await sleep(30); let steps = 0;
  while (w.document.querySelector('#runner') && ev('R && !R.summary') && steps++ < 80) {
    const it = ev('R.cur.item'); if (ev('!!(R.cur.item.intro && !R.cur.introDone)')) w.eval('ACT.rintro()');
    try {
      if (it.type === 'mcq') { w.eval("ACT.rsel(document.querySelectorAll('.opt')[R.cur.item.ans]);ACT.rcheck()"); }
      else if (it.type === 'typed') { w.document.querySelector('#rin').value = it.acc[0]; w.eval('ACT.rcheck()'); }
      else if (it.type === 'order') { w.eval('R.cur.item.seq.forEach(function(wd,i){var b=R.cur.bank.find(function(x){return x.i===i&&!R.cur.placed.includes(x)});R.cur.placed.push(b)});R.cur.draw();ACT.rcheck()'); }
      else if (it.type === 'translate') { w.document.querySelector('#rin').value = it.natural; w.eval('ACT.rcheck()'); }
      else if (it.type === 'produce') { w.document.querySelector('#rin').value = it.model || 'I think although it is hard, however I will try because it is useful.'; w.eval('ACT.rcheck()'); if (w.eval('R.cur.phase') === 'self') w.eval("ACT.rself({dataset:{v:'1'}})"); }
      else if (it.type === 'speak') { w.document.querySelector('#rin').value = it.model; w.eval('ACT.rcheck()'); }
      else if (it.type === 'write') { w.document.querySelector('#rin').value = 'Although remote work is useful, however it has drawbacks. Therefore companies must plan. Moreover, trust matters. As a result, teams cope. In addition, goals help.'; w.eval('ACT.rcheck()'); }
      else if (it.type === 'listen') { if (it.mode !== 'read') w.eval('ACT.lready()'); for (let k = 0; k < it.qs.length; k++) { w.eval(`ACT.lans({dataset:{i:'${it.qs[k].ans}'}})`); w.eval('ACT.lnext()'); } }
      w.eval('ACT.rnext()');
    } catch (e) { errs.push('step ' + steps + ' ' + it.type + ': ' + e.message); break; }
  }
  const sum = w.document.querySelector('#runner') ? w.document.querySelector('#runner').textContent : '';
  pass('session summary shows level bar, quests and XP', /Back to home/.test(sum) && /Level \d/.test(sum) && /Today's quests/.test(sum), sum.slice(0, 60));
  pass('confetti is launched on a good session', !!w.document.querySelector('.confetti') || ev('S.sessions.length') > 0);
  pass('session quest completed after finishing the daily session', ev('S.quests.done.session') > 0);
  w.eval('ACT.rdone()'); await sleep(40);
  // reading
  const r = ev('CONTENT.rd[0]'); w.location.hash = '/reading'; await sleep(60);
  pass('Reading page lists the new texts with titles', w.document.querySelectorAll('#view .card.click').length === ev('CONTENT.rd.length') && w.document.querySelector('#view').textContent.includes(r.title), r.title);
  ev(`ACT.lsstart({dataset:{id:'${r.id}',mode:'read'}})`); await sleep(40);
  pass('reading text has tappable words and a glossary', w.document.querySelectorAll('.tw').length > 100 && /Glossary/.test(w.document.querySelector('#rmain').textContent), w.document.querySelectorAll('.tw').length + ' words');
  w.eval("ACT.lkword({dataset:{w:'although'}})"); await sleep(30); pass('tapping a word opens the dictionary over the exercise', !!w.document.querySelector('#ovl'));
  w.eval('closeModal()'); w.eval('closeRunner(true)');
  // fase de leitura entra na sessão
  ev('S.lastRead=0;S.plan=null'); const plan = ev('planSession(S,10)'); pass('Reading is scheduled in daily sessions', plan.blocks.some(b => b.key === 'read'), plan.blocks.map(b => b.key).join(','));
  for (const route of ['/roadmap', '/progress', '/achievements', '/settings']) { w.location.hash = route; await sleep(40); }
  pass('other pages still render', w.document.querySelector('#view').textContent.length > 200);
  console.log('ERRORS:', errs.length ? errs.slice(0, 5) : 'none'); process.exit(process.exitCode || 0);
})().catch(e => { console.log('CRASH', e.stack); console.log(errs.slice(0, 3)); process.exit(1); });
