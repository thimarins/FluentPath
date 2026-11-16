// Estatísticas objetivas do conteúdo (sem rede). Uso: node dev/audit_content.js
const fs = require('fs'), path = require('path');
const J = f => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'content', f), 'utf8'));
const words = fs.readdirSync(path.join(__dirname, '..', 'content')).filter(f => f.startsWith('words_') && f.endsWith('.json')).sort().flatMap(J), phr = J('phrasals.json'), gr = J('grammar.json'), nat = J('natural.json'), con = J('connectors.json'), lis = [...J('listening.json'), ...J('listening_b.json')], rd = J('reading.json'), spk = J('speaking.json'), rp = J('roleplay.json'), dx = J('diagnostic.json');
const cnt = (arr, f) => arr.reduce((m, x) => { const k = f(x); m[k] = (m[k] || 0) + 1; return m; }, {});
const pct = (n, d) => Math.round(n / d * 100) + '%';
const wc = s => String(s).split(/\s+/).filter(Boolean).length;
console.log('=== VOCABULÁRIO (palavras) ===');
console.log('total', words.length, '| por nível', JSON.stringify(cnt(words, w => w.lvl)), '| por classe', JSON.stringify(cnt(words, w => w.pos)));
const tops = {}; words.forEach(w => (w.topics || []).forEach(t => tops[t] = (tops[t] || 0) + 1)); console.log('por tema', JSON.stringify(tops));
const forms = new Set(words.map(w => w.w.toLowerCase())); console.log('campos: exemplo', pct(words.filter(w => w.ex).length, words.length), '| collocations (>=3)', pct(words.filter(w => (w.col || []).length >= 3).length, words.length), '| erro comum "mis"', pct(words.filter(w => w.mis).length, words.length), '| sinônimos', pct(words.filter(w => (w.syn || []).length).length, words.length), '| IPA', pct(words.filter(w => w.ipa).length, words.length), '| família', pct(words.filter(w => (w.fam || []).length).length, words.length));
const exLen = lvl => { const a = words.filter(w => w.lvl === lvl).map(w => wc(w.ex)); return a.length ? (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1) : '-'; }; console.log('palavras no exemplo por nível:', ['B1', 'B1+', 'B2', 'B2+'].map(l => l + ':' + exLen(l)).join(' '));
console.log('\n=== PHRASAL VERBS ===  total', phr.length, '| níveis', JSON.stringify(cnt(phr, p => p.lvl)), '| verbos-base', Object.keys(cnt(phr, p => p.v)).length, '| com contraste', pct(phr.filter(p => p.contrast).length, phr.length), '| separáveis', pct(phr.filter(p => p.sep).length, phr.length));
console.log('\n=== GRAMÁTICA ===  tópicos', gr.length, '| exercícios', gr.reduce((n, g) => n + g.exercises.length, 0), '| por nível', JSON.stringify(cnt(gr, g => g.lvl)), '| tipos', JSON.stringify(cnt(gr.flatMap(g => g.exercises), e => e.t)));
console.log('  explicação PT+EN em todos:', gr.every(g => g.pt && g.en), '| erros comuns por tópico (média)', (gr.reduce((n, g) => n + (g.mistakes || []).length, 0) / gr.length).toFixed(1));
console.log('\n=== CONECTORES ===  categorias', con.cats.length, '| conectores', con.cats.reduce((n, c) => n + c.items.length, 0), '| exercícios', con.items.length, '| níveis', JSON.stringify(cnt(con.items, i => i.lvl)));
console.log('\n=== INGLÊS NATURAL ===  pares', nat.length, '| níveis', JSON.stringify(cnt(nat, n => n.lvl)), '| tags', JSON.stringify(cnt(nat.flatMap(n => n.tags || []), t => t)));
const lw = lis.map(l => wc(l.script)); const totalMin = lw.reduce((a, b) => a + b, 0) / 150;
console.log('\n=== ÁUDIO / LISTENING ===  passagens', lis.length, '| níveis', JSON.stringify(cnt(lis, l => l.lvl)), '| velocidades', JSON.stringify(cnt(lis, l => l.speed)), '| sotaques', JSON.stringify(cnt(lis, l => l.accent)), '| tipos', JSON.stringify(cnt(lis, l => l.kind)));
console.log('  duração total aprox.', totalMin.toFixed(0), 'min de áudio (150 palavras/min) | perguntas', lis.reduce((n, l) => n + l.qs.length, 0), '| conversas com 2+ falantes', lis.filter(l => /^[A-Z][\w ]{0,15}:/m.test(l.script)).length);
console.log('\n=== LEITURA ===  textos', rd.length, '| níveis', JSON.stringify(cnt(rd, r => r.lvl)), '| palavras/texto (média)', (rd.reduce((n, r) => n + wc(r.text), 0) / rd.length).toFixed(0), '| perguntas', rd.reduce((n, r) => n + r.qs.length, 0), '| temas', JSON.stringify(cnt(rd, r => r.topic)));
console.log('\n=== FALA ===  prompts', spk.length, '| níveis', JSON.stringify(cnt(spk, s => s.lvl)), '| temas', Object.keys(cnt(spk, s => s.topic)).length, '| roleplays', rp.length, '| objetivos ocultos', rp.reduce((n, r) => n + r.objectives.length, 0));
console.log('\n=== NIVELAMENTO ===  itens', dx.length, '| por nível', JSON.stringify(cnt(dx, d => d.lvl)), '| habilidades', JSON.stringify(cnt(dx, d => d.skill)));
// totais de exercícios únicos que o app consegue gerar
const perWord = 4, perPhr = 4; const gen = words.length * perWord + phr.length * perPhr + gr.reduce((n, g) => n + g.exercises.length, 0) + con.items.length + nat.length * 3 + lis.length * 3 + rd.length * 4 + spk.length + rp.length;
console.log('\nTOTAL de exercícios distintos que o app gera (aprox.):', gen);
// itens usados em mais de um papel / duplicatas
const dupWord = {}; words.forEach(w => dupWord[w.w.toLowerCase()] = (dupWord[w.w.toLowerCase()] || 0) + 1); console.log('palavras duplicadas:', Object.keys(dupWord).filter(k => dupWord[k] > 1).length);
fs.writeFileSync(path.join(__dirname, '_words_list.json'), JSON.stringify(words.map(w => ({ w: w.w, lvl: w.lvl, pos: w.pos }))));
