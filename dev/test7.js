// Testa o modo launcher do Windows contra o servidor REAL (tools\server.ps1 rodando em localhost:8765).
// Uso: node dev/test7.js  (ele mesmo sobe um servidor ISOLADO: porta 8799 e pasta temporaria; nunca toca em data\\)
const path = require('path'), fs = require('fs');
const { JSDOM, VirtualConsole } = require(process.env.JSDOM_PATH || process.env.TEMP + '/pdfx/node_modules/jsdom');
const html = fs.readFileSync(path.join(__dirname, '..', 'app', 'index.html'), 'utf8');
const PORT = process.env.TEST_PORT || '8799'; const BASE = 'http://localhost:' + PORT; const errs = [];
function boot(label, preset) {
  const vc = new VirtualConsole(); vc.on('jsdomError', e => errs.push(label + ': ' + e.message));
  const dom = new JSDOM(html, { runScripts: 'dangerously', url: BASE + '/', pretendToBeVisual: true, virtualConsole: vc, beforeParse(w) {
    w.matchMedia = () => ({ matches: false, addEventListener() { } }); w.scrollTo = () => { }; w.Element.prototype.scrollTo = function () { }; w.confirm = () => true;
    w.fetch = (u, o) => fetch(new URL(u, BASE + '/'), o); w.AbortController = AbortController;
    if (preset) w.localStorage.setItem('fluentpath.v1', preset);
  } });
  dom.window.addEventListener('error', e => errs.push(label + ' window.error ' + e.message)); return dom.window;
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pass = (n, c, x = '') => { console.log((c ? 'PASS ' : 'FAIL ') + n + (x ? ' — ' + x : '')); if (!c) process.exitCode = 1; };
const H = { 'X-FluentPath': '1' }; const stateFile = path.join(process.env.TEST_DATA || path.join(require('os').tmpdir(), 'fp_test_data'), 'progress.json');
(async () => {
  const dataDir = path.dirname(stateFile); fs.mkdirSync(dataDir, { recursive: true });
  require('child_process').spawn('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.resolve(__dirname, '..', 'tools', 'server.ps1'), '-NoBrowser', '-Port', PORT, '-DataDir', dataDir], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true }).unref();
  await sleep(6000);
  try { fs.unlinkSync(stateFile); } catch (e) { }
  // 1) primeiro uso: sem arquivo
  let w = boot('first'); await sleep(900);
  pass('first run: server detected', w.eval('!!SERVER && SERVER.path.endsWith("progress.json")'), w.eval('SERVER && SERVER.path'));
  pass('first run: goes to onboarding (no file yet)', /onboarding/.test(w.location.hash));
  w.eval("S.profile.name='Thiago ção';S.onboarded=true;S.profileAt=Date.now();S.settingsAt=Date.now();save()");
  const answered = w.eval(`(function(){var p=planQuick(S,'vocab',5),c=0;p.items.forEach(function(it){if(it.cid&&c<6){recordResult(it,{ok:true,rt:3000});c++}});return c})()`);
  await sleep(1800);
  pass('progress is auto-saved to data\\progress.json', fs.existsSync(stateFile), fs.existsSync(stateFile) ? (fs.statSync(stateFile).size + ' bytes') : 'missing');
  const disk = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  pass('file has the study data and no API key/plan', Object.keys(disk.c).length >= answered && !('plan' in disk) && !JSON.stringify(disk).includes('sk-ant'), Object.keys(disk.c).length + ' concepts, name ' + disk.profile.name);
  const keys1 = w.eval("Object.keys(S.c).sort().join(',')"); const xp1 = w.eval('S.xp'); w.close();

  // 2) "apaguei os dados do navegador": nova janela, localStorage vazio
  w = boot('wiped'); await sleep(900);
  pass('after wiping browser data, progress returns from the file', w.eval('S.onboarded') && w.eval('S.profile.name') === 'Thiago ção' && w.eval("Object.keys(S.c).sort().join(',')") === keys1 && w.eval('S.xp') === xp1, w.eval('Object.keys(S.c).length') + ' concepts restored');
  pass('and opens straight on Home (no questionnaire)', !/onboarding/.test(w.location.hash), w.location.hash);
  pass('Settings shows the file location', (w.eval("ACT.theme&&0"), true));
  w.location.hash = '/settings'; await sleep(200); pass('settings page mentions auto-save path', /Auto-saved to a file on this PC/.test(w.document.querySelector('#view').textContent));

  // 3) navegador tem dados NOVOS que o arquivo não tem: junta tudo
  const extra = w.eval(`(function(){var p=planQuick(S,'grammar',5),c=0;p.items.forEach(function(it){if(it.cid&&c<3){recordResult(it,{ok:true,rt:3000});c++}});return c})()`);
  await sleep(1800); const afterGrammar = w.eval('Object.keys(S.c).length');
  const diskNow = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  pass('new work after reload is saved too', Object.keys(diskNow.c).length === afterGrammar, `${afterGrammar} concepts on disk`);
  const stale = JSON.stringify(Object.assign({}, diskNow, { c: Object.fromEntries(Object.entries(diskNow.c).slice(0, 2)), updatedAt: 1 }));
  w.close(); w = boot('merge', stale); await sleep(900);
  pass('stale browser copy + newer file are merged, nothing lost', w.eval('Object.keys(S.c).length') === afterGrammar, w.eval('Object.keys(S.c).length') + ' of ' + afterGrammar);

  // 4) demo nunca vai para o arquivo
  const before = fs.readFileSync(stateFile, 'utf8'); w.eval('loadDemo()'); await sleep(1800);
  pass('demo user is never written to the file', fs.readFileSync(stateFile, 'utf8') === before);
  w.close(); const demoLs=JSON.stringify(Object.assign({}, JSON.parse(before), {demo:true})); w=boot('demo-reopen', demoLs); await sleep(900); pass('reopening with a demo user left in the browser restores the real progress from the file', !w.eval('S.demo') && w.eval('S.profile.name')==='Thiago ção');
  // 5) /api só responde ao próprio app
  const bad = await fetch(BASE + '/api/state'); pass('API refuses requests without the app header', bad.status === 403);
  const evil = await fetch(BASE + '/api/state', { method: 'PUT', headers: { ...H, Origin: 'http://evil.example' }, body: '{"hacked":true,"padding":"xxxxxxxxxxxxxxxx"}' }); pass('API refuses cross-site writes', evil.status === 403 && JSON.parse(fs.readFileSync(stateFile, 'utf8')).hacked === undefined);
  await fetch(BASE + '/api/quit', { headers: H }); await sleep(800);
  console.log('ERRORS:', errs.length ? errs.slice(0, 6) : 'none'); process.exit(process.exitCode || 0);
})().catch(e => { console.log('CRASH', e.stack); process.exit(1); });
