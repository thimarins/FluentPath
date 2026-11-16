// Revisão somente leitura (botão voltar) e elenco de vozes por personagem.
const fs=require('fs'),path=require('path');
const {JSDOM,VirtualConsole}=require((()=>{try{require.resolve('jsdom');return 'jsdom'}catch(e){return process.env.JSDOM_PATH||process.env.TEMP+'/pdfx/node_modules/jsdom'}})());
(async()=>{let bad=0;const ck=(n,ok,x)=>{console.log((ok?'PASS ':'FAIL ')+n+(x?' — '+x:''));if(!ok)bad++};
const dom=new JSDOM(fs.readFileSync(path.join(__dirname,'..','dist','FluentPath.html'),'utf8'),{runScripts:'dangerously',url:'http://localhost/',pretendToBeVisual:true,virtualConsole:new VirtualConsole(),beforeParse(w){w.matchMedia=()=>({matches:false,addEventListener(){}});w.scrollTo=()=>{};w.Element.prototype.scrollTo=function(){};w.speechSynthesis={getVoices:()=>[],speak(){},cancel(){},addEventListener(){}}}});
await new Promise(r=>setTimeout(r,300));const W=dom.window,d=W.document,ev=s=>W.eval(s),wait=ms=>new Promise(r=>setTimeout(r,ms));
ev("S.onboarded=true;S.profile.name='Ana';applyDiagnostic(S,{sk:{reading:3,listening:3,writing:3,speaking:3,vocab:3,grammar:3},theta:3,strengths:[],weaknesses:[],n:0,at:Date.now()});save()");
ev("startRunner(planSession(S,10))");await wait(200);
ck('botão voltar escondido na 1ª pergunta',d.querySelector('#rbk').style.display==='none');
const answer=async()=>{ if(ev('!!(R.cur.item.intro&&!R.cur.introDone)')){d.querySelector('[data-a=rintro]').click();await wait(40)}
  const it=ev('R.cur.item');const t=ev('R.cur.item.type');
  if(t==='mcq'){d.querySelector('.opt').click();d.querySelector('[data-a=rcheck]').click()}
  else if(t==='typed'){d.querySelector('#rin').value='x';d.querySelector('[data-a=rcheck]').click()}
  else ev('ACT.rskip&&ACT.rskip()');
  await wait(50);};
let n=0;while(n<3&&ev('R&&R.cur&&R.cur.item.type')){const t=ev('R.cur.item.type');if(!['mcq','typed'].includes(t)){ev('R.i++;showItem()');await wait(30);continue}await answer();if(ev('R.cur.phase')!=='done'){ev("R.cur.phase='done'")}d.querySelector('[data-a=rnext]')&&d.querySelector('[data-a=rnext]').click();await wait(60);n++}
ck('depois de responder, aparece o botão voltar',ev('Object.keys(R.hist).length')>=1&&d.querySelector('#rbk').style.display==='');
const idx=ev('R.cur.idx'),xp=ev('R.xp'),res=ev('R.res.length');
d.querySelector('#rbk').click();await wait(50);
ck('entra em modo revisão',ev('R.rev')!=null&&d.querySelector('#rmain').classList.contains('rev'));
ck('controles da revisão travados (sem input habilitado)',[...d.querySelectorAll('#rmain input,#rmain textarea,#rmain button')].every(x=>x.disabled));
ck('Enter/avançar bloqueado durante revisão',(()=>{const i=ev('R.i');ev('ACT.rnext()');return ev('R.i')===i})());
d.querySelector('#rgo').click();await wait(50);
ck('"Back to current" volta à pergunta atual',ev('R.rev')===null&&!d.querySelector('#rmain').classList.contains('rev')&&ev('R.cur.idx')===idx);
ck('revisar não muda XP nem resultados',ev('R.xp')===xp&&ev('R.res.length')===res);
// vozes
W.eval("Speech.voices=[{name:'Microsoft David',lang:'en-US'},{name:'Microsoft Zira',lang:'en-US'},{name:'Microsoft Mark',lang:'en-US'}]");
const c=JSON.parse(ev("JSON.stringify(Object.fromEntries(Object.entries(Speech.castVoices(['Agent','Tenant'],'us')).map(([k,v])=>[k,v.v.name])))"));
ck('2 personagens recebem vozes diferentes',c.Agent!==c.Tenant,JSON.stringify(c));
const c2=JSON.parse(ev("JSON.stringify(Object.fromEntries(Object.entries(Speech.castVoices(['Anna','John','Mr Lee'],'us')).map(([k,v])=>[k,v.v.name])))"));
ck('Anna=voz feminina, John=masculina, 3º diferente',/Zira/.test(c2.Anna)&&/David|Mark/.test(c2.John)&&new Set(Object.values(c2)).size===3,JSON.stringify(c2));
W.eval("Speech.voices=[{name:'Only Voice',lang:'en-US'}]");
const c3=JSON.parse(ev("JSON.stringify(Object.fromEntries(Object.entries(Speech.castVoices(['A','B'],'us')).map(([k,v])=>[k,v.pitch])))"));
ck('com 1 só voz, separa pelo tom',c3.A!==c3.B,JSON.stringify(c3));
console.log(bad?'FALHOU '+bad:'ERRORS: none');process.exit(0)})();
