// Mostra qual regra marcou cada frase. Uso: node dev/which_rule.js "frase 1" "frase 2"
const fs=require('fs'),path=require('path');
const {JSDOM,VirtualConsole}=require((()=>{try{require.resolve('jsdom');return 'jsdom'}catch(e){return process.env.JSDOM_PATH||process.env.TEMP+'/pdfx/node_modules/jsdom'}})());
const dom=new JSDOM(fs.readFileSync(path.join(__dirname,'..','dist','FluentPath.html'),'utf8'),{runScripts:'dangerously',url:'http://localhost/',pretendToBeVisual:true,virtualConsole:new VirtualConsole(),beforeParse(w){w.matchMedia=()=>({matches:false,addEventListener(){}});w.scrollTo=()=>{}}});
setTimeout(()=>{for(const s of process.argv.slice(2))console.log(s.slice(0,60),'=>',JSON.stringify(dom.window.eval('ERROR_RULES.filter(r=>r[0].test('+JSON.stringify(s)+')).map(r=>r[0].source.slice(0,80))')));process.exit(0)},300);
