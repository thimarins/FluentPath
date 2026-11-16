// Gera: dist/FluentPath.html (arquivo único) e site/ (versão instalável: HTML + manifest + service worker + ícones).
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const R = (...p) => path.join(__dirname, ...p);
const J = f => JSON.parse(fs.readFileSync(R('content', f), 'utf8'));
const CONTENT = {
  words: J('words.json'), phr: J('phrasals.json'), gr: J('grammar.json'), nat: J('natural.json'), con: J('connectors.json'),
  lis: J('listening.json'), rd: J('reading.json'), spk: J('speaking.json'), rp: J('roleplay.json'), dx: J('diagnostic.json')
};
let cfg = {}; try { cfg = JSON.parse(fs.readFileSync(R('config.json'), 'utf8')); } catch (e) { }
const order = ['engine.js', 'engine2.js', 'rules.js', 'store.js', 'speech_ai.js', 'ui_core.js', 'runner.js', 'flows.js', 'pages1.js', 'pages2.js', 'tutor_smart.js', 'wprompts.js', 'engage.js', 'sync.js', 'lookup.js', 'main.js'];
let code = order.map(f => '/* ===== ' + f + ' ===== */\n' + fs.readFileSync(R('src', f), 'utf8')).join('\n');
if (cfg.googleClientId) code = code.replace("const DEFAULT_CLIENT_ID = '';", "const DEFAULT_CLIENT_ID = " + JSON.stringify(cfg.googleClientId) + ";");
const css = fs.readFileSync(R('src', 'style.css'), 'utf8');
const safe = s => s.split('</script').join('<\\/script').split(String.fromCharCode(8232)).join('\\u2028').split(String.fromCharCode(8233)).join('\\u2029');
const favicon = 'data:image/png;base64,' + fs.readFileSync(R('assets', 'favicon-128.png')).toString('base64'); // ícone do app (barra de tarefas)
const faviconLinks = [256, 128, 64, 48, 32].map(n => `<link rel="icon" type="image/png" sizes="${n}x${n}" href="data:image/png;base64,${fs.readFileSync(R('assets', 'favicon-' + n + '.png')).toString('base64')}">`).join('');
const faviconOld = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='9' fill='%233454d1'/%3E%3Cpath d='M9 22c3-9 8-12 14-12' stroke='white' stroke-width='3' fill='none' stroke-linecap='round'/%3E%3Ccircle cx='9' cy='22' r='2.5' fill='white'/%3E%3C/svg%3E";
const page = (installable) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#3454d1">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://accounts.google.com https://apis.google.com; style-src 'self' 'unsafe-inline' https://accounts.google.com; font-src 'self'; img-src 'self' data: https:; media-src 'self' data: blob:; connect-src 'self' https://api.anthropic.com https://api.languagetool.org https://*.googleapis.com https://accounts.google.com https://*.wiktionary.org https://api.datamuse.com https://api.mymemory.translated.net; frame-src https://accounts.google.com; object-src 'none'; base-uri 'none'">
<title>Fluent Path — your personal English tutor</title>
${faviconLinks}
${installable ? '<link rel="manifest" href="manifest.webmanifest">\n<link rel="apple-touch-icon" href="icon-192.png">\n<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">' : ''}
<style>
${css}
</style>
</head>
<body>
<div id="app"></div>
<noscript>Fluent Path needs JavaScript.</noscript>
<script>
const CONTENT = ${safe(JSON.stringify(CONTENT))};
${safe(code)}
</script>
</body>
</html>`;
fs.mkdirSync(R('dist'), { recursive: true });
fs.writeFileSync(R('dist', 'FluentPath.html'), page(false));
fs.mkdirSync(R('app'), { recursive: true }); fs.copyFileSync(R('dist', 'FluentPath.html'), R('app', 'index.html')); ['icon-192.png', 'icon-512.png', 'fluentpath.ico'].forEach(f => fs.copyFileSync(R('assets', f), R('app', f))); // usada pelo launcher do Windows
// ---- versão instalável (PWA) ----
const siteHtml = page(true); const ver = crypto.createHash('sha1').update(siteHtml).digest('hex').slice(0, 10);
fs.mkdirSync(R('site'), { recursive: true });
fs.writeFileSync(R('site', 'index.html'), siteHtml);
fs.writeFileSync(R('site', 'manifest.webmanifest'), JSON.stringify({
  name: 'Fluent Path', short_name: 'Fluent Path', description: 'Your personal English tutor: adaptive, spaced repetition, speaking and writing feedback.',
  start_url: './index.html', scope: './', display: 'standalone', orientation: 'any', background_color: '#f6f4ef', theme_color: '#3454d1', lang: 'en',
  icons: [{ src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' }, { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }]
}, null, 2));
['icon-192.png', 'icon-512.png'].forEach(f => fs.copyFileSync(R('assets', f), R('site', f)));
fs.writeFileSync(R('site', 'sw.js'), `// Fluent Path service worker (${ver}): funciona offline; atualiza sozinho quando há versão nova.
const CACHE = 'fluentpath-${ver}';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url); if (e.request.method !== 'GET' || u.origin !== location.origin) return; // Google/Drive/fonts passam direto
  const isPage = e.request.mode === 'navigate' || u.pathname.endsWith('index.html') || u.pathname.endsWith('/');
  if (isPage) { e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put('./index.html', c)); return r; }).catch(() => caches.match('./index.html'))); return; }
  e.respondWith(caches.match(e.request).then(m => m || fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return r; })));
});
`);
console.log('built dist/FluentPath.html', (fs.statSync(R('dist', 'FluentPath.html')).size / 1024).toFixed(0) + ' KB | site/ version ' + ver + (cfg.googleClientId ? ' | client ID embedded' : ''));
