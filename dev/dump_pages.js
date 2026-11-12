// Despeja o texto de páginas escolhidas, com estado novo ou demo. Uso: node dev/dump_pages.js demo|new /rota1 /rota2 ...
const fs=require('fs'),path=require('path');
const {JSDOM,VirtualConsole}=require((()=>{try{require.resolve('jsdom');return 'jsdom'}catch(e){return process.env.JSDOM_PATH||process.env.TEMP+'/pdfx/node_modules/jsdom'}})());
(async()=>{const mode=process.argv[2],rs=process.argv.slice(3);
const dom=new JSDOM(fs.readFileSync(path.join(__dirname,'..','dist','FluentPath.html'),'utf8'),{runScripts:'dangerously',url:'http://localhost/',pretendToBeVisual:true,virtualConsole:new VirtualConsole(),beforeParse(w){w.matchMedia=()=>({matches:false,addEventListener(){}});w.scrollTo=()=>{};w.speechSynthesis={getVoices:()=>[],speak(){},cancel(){},addEventListener(){}}}});
await new Promise(r=>setTimeout(r,300));const W=dom.window;
if(mode==='demo')W.eval('loadDemo()');else W.eval("S.onboarded=true;S.profile.name='Ana';applyDiagnostic(S,{sk:{reading:3,listening:3,writing:3,speaking:3,vocab:3,grammar:3},theta:3,strengths:[],weaknesses:[],n:0,at:Date.now()});save()");
for(const r of rs){W.eval(`nav(${JSON.stringify(r)})`);await new Promise(r=>setTimeout(r,250));console.log('\n=====',r,mode);console.log(W.document.querySelector('main').textContent.replace(/\s+/g,' ').slice(0,700))}
process.exit(0)})();
