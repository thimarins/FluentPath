// Testa o Tutor offline: atalhos e perguntas livres, com usuário novo e com dados demo. Uso: node dev/test_tutor.js
const fs=require('fs'),path=require('path');
const {JSDOM,VirtualConsole}=require((()=>{try{require.resolve('jsdom');return 'jsdom'}catch(e){return process.env.JSDOM_PATH||process.env.TEMP+'/pdfx/node_modules/jsdom'}})());
(async()=>{for(const mode of ['new','demo']){
const dom=new JSDOM(fs.readFileSync(path.join(__dirname,'..','dist','FluentPath.html'),'utf8'),{runScripts:'dangerously',url:'http://localhost/',pretendToBeVisual:true,virtualConsole:new VirtualConsole(),beforeParse(w){w.matchMedia=()=>({matches:false,addEventListener(){}});w.scrollTo=()=>{};w.speechSynthesis={getVoices:()=>[],speak(){},cancel(){},addEventListener(){}}}});
await new Promise(r=>setTimeout(r,300));const W=dom.window,d=W.document;
if(mode==='demo')W.eval('loadDemo()');else W.eval("S.onboarded=true;S.profile.name='Ana';applyDiagnostic(S,{sk:{reading:3,listening:3,writing:3,speaking:3,vocab:3,grammar:3},theta:3,strengths:[],weaknesses:[],n:0,at:Date.now()});save()");
W.eval("nav('/tutor')");await new Promise(r=>setTimeout(r,200));
console.log('\n######',mode);
const qs=[...d.querySelectorAll('[data-a=tq]')].map(b=>b.dataset.q).concat(['how do I use the present perfect?','what is the difference between make and do','can you correct my sentence: I have 10 years working here','explain phrasal verbs','hello','how many words do I know?','what should I study today?','translate "saudade" to english']);
for(const q of qs){await W.eval(`tutAsk(${JSON.stringify(q)})`);await new Promise(r=>setTimeout(r,60));const m=[...d.querySelectorAll('#tchat .msg.ai')].pop();console.log('\nQ:',q,'\nA:',m.textContent.replace(/\s+/g,' ').slice(0,260))}}
process.exit(0)})();
