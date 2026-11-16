// Listening/reading: tentar de novo a pergunta e retestar as erradas (sem pontuar de novo).
const fs=require('fs'),path=require('path');
const {JSDOM,VirtualConsole}=require((()=>{try{require.resolve('jsdom');return 'jsdom'}catch(e){return process.env.JSDOM_PATH||process.env.TEMP+'/pdfx/node_modules/jsdom'}})());
(async()=>{let bad=0;const ck=(n,ok,x)=>{console.log((ok?'PASS ':'FAIL ')+n+(x?' — '+x:''));if(!ok)bad++};
const dom=new JSDOM(fs.readFileSync(path.join(__dirname,'..','dist','FluentPath.html'),'utf8'),{runScripts:'dangerously',url:'http://localhost/',pretendToBeVisual:true,virtualConsole:new VirtualConsole(),beforeParse(w){w.matchMedia=()=>({matches:false,addEventListener(){}});w.scrollTo=()=>{};w.Element.prototype.scrollTo=function(){};w.speechSynthesis={getVoices:()=>[],speak(){},cancel(){},addEventListener(){}}}});
await new Promise(r=>setTimeout(r,300));const W=dom.window,d=W.document,ev=s=>W.eval(s),wait=ms=>new Promise(r=>setTimeout(r,ms)),click=s=>{const e=d.querySelector(s);e.click();return wait(30)};
ev("S.onboarded=true;S.profile.name='Ana';applyDiagnostic(S,{sk:{reading:3,listening:3,writing:3,speaking:3,vocab:3,grammar:3},theta:3,strengths:[],weaknesses:[],n:0,at:Date.now()});save()");
const item=ev("(function(){var l=(CONTENT.lis).find(function(x){return x.qs&&x.qs.length>=2});return l?JSON.stringify({id:l.id}):null})()");
if(!item){console.log('sem item de listening achado');process.exit(1)}
ev("(function(){var l=(CONTENT.lis).find(function(x){return x.qs&&x.qs.length>=2});var it=Object.assign({},l,{kind:'lis',type:'listen',mode:'read',block:'listen',tier:3,skill:'listening',lvl:l.lvl||'B1',ref:l.id,script:l.script});startRunner({items:[it],minutes:2})})()");await wait(200);
const wrong=()=>{const a=ev('R.cur.item.qs[R.cur.qi].ans');const opts=[...d.querySelectorAll('#lq .opt')];return opts.find((_,i)=>i!==a)};
const right=()=>d.querySelectorAll('#lq .opt')[ev('curQs(R.cur)[R.cur.qi].ans')];
await wait(50);ck('pergunta renderizada',!!d.querySelector('#lq .opt'));
const xp0=ev('R.xp');wrong().click();await wait(30);
ck('errou: botão Try again aparece',!!d.querySelector('[data-a=lretry]'));
const rec=ev('R.xp');
await click('[data-a=lretry]');ck('Try again reabre a mesma pergunta',ev('R.cur.qi')===0&&!!d.querySelector('#lq .opt:not([disabled])'));
right().click();await wait(30);ck('acerto no retry: não conta ponto extra (right=0)',ev('R.cur.right')===0&&ev('R.xp')===rec);
await click('[data-a=lnext]');
while(ev('R.cur.phase')!=='done'&&d.querySelector('#lq .opt')){right().click();await wait(20);await click('[data-a=lnext]')}
ck('fim: botão Retest aparece',!!d.querySelector('[data-a=lredo]'));
await click('[data-a=lredo]');ck('retest mostra só a errada',ev('R.cur.list.length')===1&&/Retry/.test(d.querySelector('#lq').textContent));
const before=ev('R.cur.right');right().click();await wait(30);await click('[data-a=lnext]');
ck('retest fecha com resumo e sem alterar nota',/Retest:/.test(d.querySelector('#lq').textContent)&&ev('R.cur.right')===before&&!d.querySelector('[data-a=lredo]'));
console.log(bad?'FALHOU '+bad:'ERRORS: none');process.exit(0)})();
