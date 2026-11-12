// Captura de tela com o Edge headless. Uso: node dev/shot.js <nome> <w> <h> "<js>" [light|dark]   -> %TEMP%\fp_<nome>.png
const fs = require('fs'), cp = require('child_process'), path = require('path'), os = require('os');
const [name, w, h, js, theme] = process.argv.slice(2);
let html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'FluentPath.html'), 'utf8').replace(/<link[^>]*(googleapis|gstatic)[^>]*>/g, '');
const pre = "S.onboarded=true;S.profile.name='Thiago';S.profileAt=Date.now();applyDiagnostic(S,{sk:{reading:3.2,listening:2.8,writing:2.7,speaking:2.7,vocab:3,grammar:3},theta:3,strengths:[],weaknesses:[],n:0,at:Date.now()});";
const inj = `<script>setTimeout(function(){try{${theme ? `S.settings.theme='${theme}';applyTheme();` : ''}${process.env.FRESH ? pre : ''}${js};}catch(e){document.title='ERR '+e.message}},200)</script></body>`;
html = html.split('</body>').join(inj);
const tmp = os.tmpdir(), f = path.join(tmp, 'fp_' + name + '.html'); fs.writeFileSync(f, html);
const out = path.join(tmp, 'fp_' + name + '.png'); try { fs.unlinkSync(out); } catch (e) { }
const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
cp.spawn(edge, ['--headless=new', '--disable-gpu', '--no-sandbox', '--user-data-dir=' + path.join(tmp, 'fpprof_' + name + '_' + Date.now()), '--hide-scrollbars', '--virtual-time-budget=5000', '--window-size=' + w + ',' + h, '--screenshot=' + out, 'file:///' + f.split('\\').join('/')], { stdio: 'ignore', detached: true }).unref();
let n = 0; const t = setInterval(() => { if (fs.existsSync(out) && fs.statSync(out).size > 5000) { clearInterval(t); console.log('ok ' + out); } else if (++n > 40) { clearInterval(t); console.log('FAILED ' + name); } }, 1000);
