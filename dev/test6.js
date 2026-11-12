// Simula DOIS aparelhos (PC e Android) sincronizando por um Google Drive falso.
const { JSDOM, VirtualConsole } = require((()=>{try{require.resolve('jsdom');return 'jsdom'}catch(e){return process.env.JSDOM_PATH||process.env.TEMP + '/pdfx/node_modules/jsdom'}})());
const html = require('fs').readFileSync(require('path').join(__dirname, '..', 'dist', 'FluentPath.html'), 'utf8');
const errs = [];
const drive = { files: [], next: 1, calls: 0, log: [] };
function fakeFetch(url, opt = {}) {
  drive.calls++; const u = new URL(url); const m = (opt.method || 'GET').toUpperCase(); const auth = (opt.headers || {}).authorization;
  const ok = body => Promise.resolve({ ok: true, status: 200, json: async () => body });
  if (auth !== 'Bearer t') return Promise.resolve({ ok: false, status: 401, json: async () => ({}) });
  if (u.pathname === '/drive/v3/files' && m === 'GET') {
    const q = decodeURIComponent(u.searchParams.get('q')); let r = drive.files.slice();
    const mm = q.match(/name='([^']+)'/), pm = q.match(/name contains '([^']+)'/);
    if (mm) r = r.filter(f => f.name === mm[1]); if (pm) r = r.filter(f => f.name.includes(pm[1]));
    return ok({ files: r.map(f => ({ id: f.id, name: f.name, modifiedTime: f.mod })) });
  }
  const idm = u.pathname.match(/\/files\/([^/]+)$/);
  if (idm && u.pathname.startsWith('/drive/v3') && m === 'GET') { const f = drive.files.find(x => x.id === idm[1]); return ok(JSON.parse(JSON.stringify(f.data))); }
  if (idm && u.pathname.startsWith('/drive/v3') && m === 'DELETE') { drive.files = drive.files.filter(x => x.id !== idm[1]); return Promise.resolve({ ok: true, status: 204, json: async () => ({}) }); }
  if (u.pathname.startsWith('/upload/drive/v3/files')) {
    const parts = opt.body.split(/--fp[^\r\n]*/).filter(p => /Content-Type/.test(p)).map(p => p.split('\r\n\r\n')[1].replace(/\r\n$/, ''));
    const meta = JSON.parse(parts[0]), data = JSON.parse(parts[1]);
    if (m === 'POST') { const f = { id: 'f' + drive.next++, name: meta.name, data, mod: new Date().toISOString(), parents: meta.parents }; drive.files.push(f); return ok({ id: f.id }); }
    const f = drive.files.find(x => x.id === idm[1]); f.data = data; f.mod = new Date().toISOString(); return ok({ id: f.id });
  }
  return Promise.resolve({ ok: false, status: 404, json: async () => ({}) });
}
function device(name, saved) {
  const vc = new VirtualConsole(); vc.on('jsdomError', e => errs.push(name + ': ' + e.message));
  const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/', pretendToBeVisual: true, virtualConsole: vc, beforeParse(w) {
    w.matchMedia = () => ({ matches: false, addEventListener() { } }); w.scrollTo = () => { }; w.Element.prototype.scrollTo = function () { }; w.confirm = () => true; w.fetch = fakeFetch;
    w.google = { accounts: { oauth2: { initTokenClient: cfg => ({ requestAccessToken: () => setTimeout(() => cfg.callback({ access_token: 't', expires_in: 3600 }), 0) }) } } };
    w.localStorage.setItem('fp.sync', JSON.stringify({ cid: 'test.apps.googleusercontent.com', connected: true })); w.localStorage.setItem('fp.dev', name);
    if (saved) w.localStorage.setItem('fluentpath.v1', saved);
  } });
  dom.window.addEventListener('error', e => errs.push(name + ' window.error ' + e.message)); return dom.window;
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pass = (n, c, x = '') => { console.log((c ? 'PASS ' : 'FAIL ') + n + (x ? ' — ' + x : '')); if (!c) process.exitCode = 1; };
const answer = (w, n, ok = true, kind = 'vocab') => w.eval(`(function(){var p=planQuick(S,'${kind}',5);var c=0;p.items.forEach(function(it){if(c>=${n})return;if(it.cid){recordResult(it,{ok:${ok},rt:3000,yours:'x',correct:it.correctText||'y'});c++}});return c})()`);
const keys = w => w.eval("Object.keys(S.c).filter(function(k){return S.c[k].seen}).sort().join(',')");
(async () => {
  const A = device('PC', null); await sleep(60);
  A.eval("S.profile.name='Thiago';S.onboarded=true;S.profileAt=Date.now();S.settingsAt=Date.now();S.settings.apiKey='sk-ant-SECRET-SECRET-SECRET-1234';save()");
  const a1 = answer(A, 6, true); const a2 = answer(A, 2, false);
  A.eval("recordMistake(S,{cid:'g:second-conditional',ref:'t1',kind:'gram',tag:'second-conditional',q:'q1',yours:'a1',good:'b1',why:'w'});recordMistake(S,{cid:'g:first-conditional',ref:'t2',kind:'gram',tag:'first-conditional',q:'q2',yours:'a2',good:'b2',why:'w'});save()");
  await A.eval("syncNow({})"); await sleep(30);
  const f1 = drive.files.find(f => f.name === 'fluentpath-progress.json');
  pass('A uploads progress on first sync', !!f1 && Object.keys(f1.data.c).length === A.eval('Object.keys(S.c).length'), `${a1} correct, ${a2} wrong, ${Object.keys(f1.data.c).length} concepts in Drive`);
  pass('API key and today\'s plan never leave the device', !JSON.stringify(f1.data).includes('SECRET') && !('plan' in f1.data));
  pass('A keeps its own API key locally', A.eval('S.settings.apiKey').includes('SECRET'));

  // Android: instalação nova, abre o app e sincroniza
  const B = device('ANDROID', null); await sleep(60);
  pass('fresh device starts at onboarding', /onboarding/.test(B.location.hash));
  await B.eval("ACT.obsync()"); await sleep(60);
  pass('B receives A\'s progress (profile, concepts, mistakes)', B.eval('S.onboarded') && B.eval('S.profile.name') === 'Thiago' && keys(B) === keys(A) && B.eval('S.mist.length') === A.eval('S.mist.length'), `${B.eval('Object.keys(S.c).length')} concepts, name ${B.eval('S.profile.name')}`);
  pass('B has no demo/API-key leakage', !B.eval("S.settings.apiKey") && !B.eval('S.demo'));
  pass('B is taken to Home with the restored progress (no questionnaire)', /home/.test(B.location.hash), B.location.hash);

  // cada aparelho estuda coisas diferentes; B muda a meta diária
  answer(B, 5, true, 'grammar'); B.eval("S.profile.minutes=20;S.profileAt=Date.now()+5;save()");
  await B.eval("syncNow({})"); await sleep(30);
  answer(A, 4, true, 'speaking'); const a3 = answer(A, 4, true, 'vocab'); // A estuda offline (sem sincronizar)
  const aBefore = A.eval('Object.keys(S.c).length'), bOnly = B.eval("Object.keys(S.c).filter(function(k){return k[0]==='g'&&S.c[k].seen}).length");
  await A.eval("syncNow({})"); await sleep(40);
  const aKeys = keys(A);
  pass('A merges B\'s grammar work without losing its own vocab work', bOnly > 0 && A.eval("Object.keys(S.c).filter(function(k){return k[0]==='g'&&S.c[k].seen}).length") >= bOnly && A.eval('Object.keys(S.c).length') >= aBefore, `A had ${aBefore}, now ${A.eval('Object.keys(S.c).length')} concepts (B added ${bOnly} grammar)`);
  pass('newer profile setting wins (daily goal 20)', A.eval('S.profile.minutes') === 20);
  pass('XP is max of both, never lost', A.eval('S.xp') >= Math.max(B.eval('S.xp'), 1), 'A xp ' + A.eval('S.xp') + ', B xp ' + B.eval('S.xp'));
  pass('a daily backup of the Drive copy was kept', drive.files.some(f => f.name.startsWith('fluentpath-backup-')), drive.files.map(f => f.name).join(', '));

  // idempotência e convergência
  const snap = w => JSON.stringify([w.eval('Object.keys(S.c).length'), w.eval('S.xp'), w.eval('S.mist.length'), w.eval('S.ev.length'), w.eval('S.sessions.length'), w.eval('S.profile.minutes')]);
  const s1 = snap(A); await A.eval("syncNow({})"); await sleep(30); const s2 = snap(A);
  pass('syncing again changes nothing (idempotent)', s1 === s2, s1);
  await B.eval("syncNow({})"); await sleep(30);
  pass('B converges to the same state as A', keys(B) === keys(A) && B.eval('S.xp') === A.eval('S.xp') && B.eval('S.mist.length') === A.eval('S.mist.length') && B.eval('S.profile.minutes') === 20, snap(B));

  // apagar de propósito não ressuscita
  const key = B.eval('S.mist[0].key'); const id = B.eval('S.mist[0].id'); const nB = B.eval('S.mist.length');
  B.eval(`ACT.mkdel({dataset:{id:'${id}'}})`); await B.eval("syncNow({})"); await sleep(30); await A.eval("syncNow({})"); await sleep(30); await B.eval("syncNow({})"); await sleep(30);
  pass('a mistake deleted on B does not come back from A', A.eval(`S.mist.some(function(m){return m.key===${JSON.stringify(key)}})`) === false && B.eval(`S.mist.some(function(m){return m.key===${JSON.stringify(key)}})`) === false && A.eval('S.mist.length') === nB - 1);

  // sessão sem token: sync silencioso não abre popup nem quebra
  const C = device('PC2', null); await sleep(40); const calls0 = drive.calls; await C.eval("syncNow({silent:true})"); await sleep(20);
  pass('silent sync without a Google session does nothing (no popup, no calls)', drive.calls === calls0 && C.eval("SYNC.state") === 'idle');

  // aparelho novo + Drive vazio: não envia estado vazio
  const saveF=drive.files; drive.files=[]; const F=device('NEW',null); await sleep(40); await F.eval('ACT.obsync()'); await sleep(40); pass('new device with an empty Drive uploads nothing and stays at onboarding', drive.files.length===0 && /onboarding/.test(F.location.hash)); drive.files=saveF;
  // demo bloqueia
  const D = device('DEMO', null); await sleep(40); D.eval('loadDemo()'); const c1 = drive.calls; await D.eval("syncNow({})"); await sleep(20);
  pass('demo user never syncs to Drive', drive.calls === c1);

  // restaurar backup
  const bak = drive.files.find(f => f.name.startsWith('fluentpath-backup-'));
  const E = device('RESTORE', null); await sleep(40); E.eval("S.onboarded=true;S.profile.name='Other';save()"); await E.eval("ensureToken(true)"); await E.eval(`ACT.syncRestorePick({dataset:{id:'${bak.id}'}})`); await sleep(40);
  pass('restoring a backup replaces local progress', E.eval('S.profile.name') === 'Thiago' && E.eval('Object.keys(S.c).length') > 0, E.eval('S.profile.name'));

  // recarregar a página não perde nada (estado local salvo)
  const saved = A.localStorage.getItem('fluentpath.v1'); const A2 = device('PC', saved); await sleep(60);
  pass('reloading the page keeps everything', keys(A2) === keys(A), A2.eval('Object.keys(S.c).length') + ' concepts');
  console.log('\nDrive files:', drive.files.map(f => f.name + ' (' + JSON.stringify(f.data).length + ' B)').join(' | '));
  console.log('ERRORS:', errs.length ? errs.slice(0, 8) : 'none'); process.exit(process.exitCode || 0);
})().catch(e => { console.log('CRASH', e.stack); console.log(errs.slice(0, 5)); process.exit(1); });
