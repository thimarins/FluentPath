// Prova que Roadmap, Progress, Achievements e My Mistakes reagem ao estudo real (usuário zerado -> sessão simulada).
const fs=require('fs'),path=require('path');
const {JSDOM,VirtualConsole}=require((()=>{try{require.resolve('jsdom');return 'jsdom'}catch(e){return process.env.JSDOM_PATH||process.env.TEMP+'/pdfx/node_modules/jsdom'}})());
(async()=>{
const dom=new JSDOM(fs.readFileSync(path.join(__dirname,'..','dist','FluentPath.html'),'utf8'),{runScripts:'dangerously',url:'http://localhost/',pretendToBeVisual:true,virtualConsole:new VirtualConsole(),beforeParse(w){w.matchMedia=()=>({matches:false,addEventListener(){}});w.scrollTo=()=>{};w.speechSynthesis={getVoices:()=>[],speak(){},cancel(){},addEventListener(){}}}});
await new Promise(r=>setTimeout(r,300));const W=dom.window,d=W.document;
W.eval("S.onboarded=true;S.profile.name='Ana';applyDiagnostic(S,{sk:{reading:3,listening:3,writing:3,speaking:3,vocab:3,grammar:3},theta:3,strengths:[],weaknesses:[],n:0,at:Date.now()});save()");
const snap=async r=>{W.eval(`nav('${r}')`);await new Promise(x=>setTimeout(x,250));return d.querySelector('main').textContent.replace(/\s+/g,' ')};
const grab=(s,re)=>(s.match(re)||[])[0];
const before={rm:await snap('/roadmap'),pg:await snap('/progress'),ac:await snap('/achievements'),mk:await snap('/mistakes')};
// simula 3 dias de estudo: planeja sessão e responde (70% de acerto), com erros reais registrados
W.eval(`(function(){var seed=7;var rnd=function(){seed=(seed*9301+49297)%233280;return seed/233280};
for(var day=0;day<3;day++){var plan=todaysPlan();var items=plan.items||plan.blocks&&plan.blocks.flatMap(function(b){return b.items})||[];var n=0;
items.slice(0,40).forEach(function(it){var ok=rnd()<0.7;try{recordResult(it,{ok:ok,rt:9000+rnd()*8000});n++}catch(e){}});
Object.keys(S.days).forEach(function(k){});
if(day<2){var k=dayKey(Date.now()-(2-day)*864e5);S.days[k]=S.days[dayKey()]?Object.assign({},S.days[dayKey()]):S.days[k];}}
save();})()`);
const after={rm:await snap('/roadmap'),pg:await snap('/progress'),ac:await snap('/achievements'),mk:await snap('/mistakes')};
const st=W.eval('JSON.stringify({xp:S.xp,streak:streak(),mist:S.mist.length,concepts:Object.keys(S.c).length,ach:Object.keys(S.ach).length,sessions:S.sessions.length})');
console.log('Estado após o estudo simulado:',st);
console.log('ROADMAP antes :', before.rm.slice(before.rm.indexOf('Level completion'), before.rm.indexOf('Level completion')+75)); console.log('ROADMAP depois:', after.rm.slice(after.rm.indexOf('Level completion'), after.rm.indexOf('Level completion')+75)); console.log('B2 gate antes/depois:', (before.rm.match(/d+%B2 gate/)||[])[0], (after.rm.match(/d+%B2 gate/)||[])[0], (before.rm.match(/Estimated mastery of B2 requirements: d+%/)||[])[0], '|', (after.rm.match(/Estimated mastery of B2 requirements: d+%/)||[])[0]);
console.log('PROGRESS antes:',grab(before.pg,/Study time.{0,50}/),'| depois:',grab(after.pg,/Study time.{0,60}/));
console.log('PROGRESS depois (exercícios/precisão):',grab(after.pg,/Sessions.{0,40}/),'|',grab(after.pg,/Accuracy.{0,30}/));
console.log('ACHIEV.  antes:',grab(before.ac,/\d+ of 17 unlocked[^L]*/),'| depois:',grab(after.ac,/\d+ of 17 unlocked[^L]*/));
console.log('MISTAKES antes:',grab(before.mk,/All \(\d+\)/),'| depois:',grab(after.mk,/All \(\d+\)/),'|',after.mk.slice(after.mk.indexOf('Error memory'),after.mk.indexOf('Error memory')+150));
process.exit(0)})();
