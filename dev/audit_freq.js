// Frequência de uso (palavras por milhão) das 300 palavras, via Datamuse. Requer internet.
const fs = require('fs'), path = require('path');
const words = JSON.parse(fs.readFileSync(path.join(__dirname, '_words_list.json'), 'utf8'));
const get = async w => { for (let k = 0; k < 3; k++) { try { const r = await fetch('https://api.datamuse.com/words?sp=' + encodeURIComponent(w.w.toLowerCase()) + '&md=f&max=1'); const j = await r.json(); const t = j[0] && j[0].word === w.w.toLowerCase() && (j[0].tags || []).find(x => x.startsWith('f:')); return t ? parseFloat(t.slice(2)) : null; } catch (e) { await new Promise(r => setTimeout(r, 500)); } } return undefined; };
(async () => {
  const out = []; let i = 0; const worker = async () => { while (i < words.length) { const w = words[i++]; out.push({ ...w, f: await get(w) }); } };
  await Promise.all(Array.from({ length: 8 }, worker));
  const ok = out.filter(x => typeof x.f === 'number'), miss = out.filter(x => x.f == null);
  const band = f => f >= 50 ? 'muito comum (>=50/milhão)' : f >= 10 ? 'comum (10-50)' : f >= 3 ? 'média (3-10)' : f >= 1 ? 'menos comum (1-3)' : 'rara (<1)';
  const dist = {}; ok.forEach(x => dist[band(x.f)] = (dist[band(x.f)] || 0) + 1);
  const med = a => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  console.log('palavras com frequência encontrada:', ok.length, '/', words.length, '(sem dado:', miss.length + ', ex.: ' + miss.slice(0, 8).map(x => x.w).join(', ') + ')');
  console.log('distribuição:', JSON.stringify(dist));
  ['B1', 'B1+', 'B2', 'B2+'].forEach(l => { const a = ok.filter(x => x.lvl === l).map(x => x.f); console.log('  nível', l.padEnd(3), 'n=' + a.length, 'mediana', med(a).toFixed(1) + '/milhão', '| % >=10:', Math.round(a.filter(f => f >= 10).length / a.length * 100) + '%'); });
  console.log('mais raras:', ok.sort((a, b) => a.f - b.f).slice(0, 12).map(x => x.w + ' (' + x.f.toFixed(2) + ')').join(', '));
  console.log('mais comuns:', ok.sort((a, b) => b.f - a.f).slice(0, 8).map(x => x.w + ' (' + x.f.toFixed(0) + ')').join(', '));
})();
