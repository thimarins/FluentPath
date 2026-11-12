// Mede cada página do app: quanto texto, quantos itens/botões/gráficos, e se há áreas vazias. Uso: node dev/audit_pages.js
const fs=require('fs'),path=require('path');
const {JSDOM,VirtualConsole}=require((()=>{try{require.resolve('jsdom');return 'jsdom'}catch(e){return process.env.JSDOM_PATH||process.env.TEMP+'/pdfx/node_modules/jsdom'}})());
const routes=['/home','/learn','/practice','/vocab','/phrasals','/grammar','/grammar/present-perfect','/connectors','/natural','/speaking','/listening','/reading','/writing','/mistakes','/review','/progress','/roadmap','/tutor','/achievements','/settings','/topic/work','/diagnostic'];
(async()=>{
const dom=new JSDOM(fs.readFileSync(path.join(__dirname,'..','dist','FluentPath.html'),'utf8'),{runScripts:'dangerously',url:'http://localhost/',pretendToBeVisual:true,virtualConsole:new VirtualConsole(),beforeParse(w){w.matchMedia=()=>({matches:false,addEventListener(){}});w.scrollTo=()=>{};w.speechSynthesis={getVoices:()=>[],speak(){},cancel(){},addEventListener(){}}}});
await new Promise(r=>setTimeout(r,300));const W=dom.window,d=W.document;
W.eval("S.onboarded=true;S.profile.name='Ana';applyDiagnostic(S,{sk:{reading:3,listening:3,writing:3,speaking:3,vocab:3,grammar:3},theta:3,strengths:[],weaknesses:[],n:0,at:Date.now()});save()");
console.log('rota'.padEnd(28),'texto','cards','botões','links','svg','inputs','itens-lista','h*');
for(const r of routes){try{W.eval(`nav(${JSON.stringify(r)})`)}catch(e){console.log(r,'ERRO',e.message);continue}
await new Promise(r=>setTimeout(r,150));const m=d.querySelector('main')||d.body;const q=s=>m.querySelectorAll(s).length;
console.log(r.padEnd(28),String((m.textContent||'').replace(/\s+/g,' ').length).padStart(5),String(q('.card')).padStart(5),String(q('button')).padStart(6),String(q('a')).padStart(5),String(q('svg')).padStart(4),String(q('input,textarea,select')).padStart(6),String(q('li,.item,.row.item,.list>*')).padStart(11),q('h1,h2,h3,h4'))}
process.exit(0)})();
