// Frase inteira digitada em exercício de lacuna + cronômetro do exercício.
const fs=require('fs'),path=require('path');
const {JSDOM,VirtualConsole}=require((()=>{try{require.resolve('jsdom');return 'jsdom'}catch(e){return process.env.JSDOM_PATH||process.env.TEMP+'/pdfx/node_modules/jsdom'}})());
(async()=>{let bad=0;const ck=(n,ok,x)=>{console.log((ok?'PASS ':'FAIL ')+n+(x?' — '+x:''));if(!ok)bad++};
const dom=new JSDOM(fs.readFileSync(path.join(__dirname,'..','dist','FluentPath.html'),'utf8'),{runScripts:'dangerously',url:'http://localhost/',pretendToBeVisual:true,virtualConsole:new VirtualConsole(),beforeParse(w){w.matchMedia=()=>({matches:false,addEventListener(){}});w.scrollTo=()=>{};w.Element.prototype.scrollTo=function(){};w.speechSynthesis={getVoices:()=>[],speak(){},cancel(){},addEventListener(){}}}});
await new Promise(r=>setTimeout(r,300));const W=dom.window,d=W.document,ev=s=>W.eval(s),wait=ms=>new Promise(r=>setTimeout(r,ms));
ev("S.onboarded=true;S.profile.name='Ana';applyDiagnostic(S,{sk:{reading:3,listening:3,writing:3,speaking:3,vocab:3,grammar:3},theta:3,strengths:[],weaknesses:[],n:0,at:Date.now()});save()");
const mk=()=>ev("startRunner({items:[{kind:'gr',cid:null,skill:'grammar',lvl:'B1',type:'typed',wtype:'typed',tier:2,block:'grammar',q:'Complete the sentence:',sub:esc(\"She hasn't ___ (answer) my email yet.\"),acc:['answered'],hint:'a',correctText:'answered',why:'Past participle of answer.'},{kind:'gr',cid:null,skill:'grammar',lvl:'B1',type:'typed',wtype:'typed',tier:2,block:'grammar',q:'Complete the sentence:',sub:esc('He ___ (go) home.'),acc:['went'],hint:'w',correctText:'went'}],minutes:2})");
const tryIt=async v=>{mk();await wait(100);d.querySelector('#rin').value=v;d.querySelector('[data-a=rcheck]').click();await wait(40);return d.querySelector('#rfbk')};
let f=await tryIt('she hasnt answered my email yer');ck('frase inteira com typo: aceita, avisa o erro de grafia',f.classList.contains('ok')||f.classList.contains('part'),f.textContent.slice(0,140));
f=await tryIt('She hasn\'t answered my email yet.');ck('frase inteira perfeita: aceita',!f.classList.contains('bad'),f.textContent.slice(0,80));
f=await tryIt('answered');ck('só a palavra: continua aceitando',f.classList.contains('ok'));
f=await tryIt('she hasnt answer my email yet');ck('palavra errada: continua errado',f.classList.contains('bad'));
f=await tryIt('banana banana banana');ck('lixo: errado',f.classList.contains('bad'));
mk();await wait(1700);ck('cronômetro anda',d.querySelector('#rtimer')&&/^0:0[1-9]$/.test(d.querySelector('#rtimer').textContent),d.querySelector('#rtimer').textContent);
d.querySelector('#rin').value='answered';d.querySelector('[data-a=rcheck]').click();await wait(100);const t1=d.querySelector('#rtimer').textContent;await wait(1200);ck('cronômetro congela ao responder',d.querySelector('#rtimer').textContent===t1,t1);
d.querySelector('[data-a=rnext]').click();await wait(700);ck('reinicia no próximo exercício',d.querySelector('#rtimer').textContent==='0:00'||d.querySelector('#rtimer').textContent==='0:01');
const mk2=()=>ev("startRunner({items:[{kind:'gr',cid:null,skill:'grammar',lvl:'B1',type:'typed',wtype:'typed',tier:2,block:'grammar',q:'Complete the sentence:',sub:esc('I ____ (never/eat) Japanese food.'),acc:['have never eaten',\"'ve never eaten\"],hint:'h',correctText:'have never eaten',why:'x'}],minutes:2})");
for(const [v,exp] of [["i've never eaten japanese food",true],['I have never eaten Japanese food.',true],['have never eaten',true],["'ve never eaten",true],['i have never ate japanese food',false],['I never eaten japanese food',false]]){mk2();await wait(80);d.querySelector('#rin').value=v;d.querySelector('[data-a=rcheck]').click();await wait(30);ck('contração/frase: '+v,!d.querySelector('#rfbk').classList.contains('bad')===exp,d.querySelector('#rfbk').textContent.slice(0,70))}
console.log(bad?'FALHOU '+bad:'ERRORS: none');process.exit(0)})();
