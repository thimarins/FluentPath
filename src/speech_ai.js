/* ============================================================
   FLUENT PATH — SPEECH + AIService
   Voz: Web Speech API do navegador (TTS e reconhecimento).
   IA opcional: camada única (AIService) com respostas estruturadas
   validadas por schema. Sem chave, tudo funciona offline.
   ============================================================ */
const Speech = {
  ok: typeof window !== 'undefined' && 'speechSynthesis' in window,
  sttOk: typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition),
  voices: [], _rec: null, _speaking: false, _queue: 0,
  init() { if (!this.ok) return; const f = () => { this.voices = speechSynthesis.getVoices(); }; f(); speechSynthesis.onvoiceschanged = f; },
  pickVoices(accent) {
    const lang = accent === 'gb' ? 'en-GB' : 'en-US';
    const all = this.voices.filter(v => v.lang && v.lang.replace('_', '-').startsWith(lang));
    const alt = this.voices.filter(v => v.lang && v.lang.startsWith('en') && !all.includes(v));
    const pool = all.concat(alt);
    const natural = pool.filter(v => /natural|online|neural|google|samantha|daniel|aria|guy|jenny|libby|ryan/i.test(v.name));
    const best = natural.length ? natural.concat(pool.filter(v => !natural.includes(v))) : pool;
    return [best[0] || null, best.find(v => v !== best[0] && /female|male|zira|david|aria|guy|jenny|ryan|libby|mark/i.test(v.name) !== /female|zira|aria|jenny|libby/i.test((best[0] || {}).name || '')) || best[1] || best[0] || null];
  },
  stop() { if (this.ok) { speechSynthesis.cancel(); this._speaking = false; } },
  /* fala um script; linhas "Nome: texto" alternam duas vozes */
  speak(script, { rate = 1, accent = 'us', onend, onstart } = {}) {
    if (!this.ok) { onend && onend(); return false; }
    this.stop();
    const lines = String(script).split(/\n+/).map(l => l.trim()).filter(Boolean);
    const speakers = {}; let order = 0; const [v1, v2] = this.pickVoices(accent);
    const parts = lines.map(l => { const m = l.match(/^([A-Z][\w .']{0,20}):\s*(.+)$/); if (m) { if (!(m[1] in speakers)) speakers[m[1]] = order++; return { who: speakers[m[1]], t: m[2] }; } return { who: 0, t: l }; });
    let i = 0; const token = ++this._queue; this._speaking = true; onstart && onstart();
    const next = () => {
      if (token !== this._queue) return;
      if (i >= parts.length) { this._speaking = false; onend && onend(); return; }
      const p = parts[i++]; const u = new SpeechSynthesisUtterance(p.t);
      u.lang = accent === 'gb' ? 'en-GB' : 'en-US'; u.rate = rate; const v = p.who % 2 ? v2 : v1; if (v) u.voice = v; u.pitch = p.who % 2 ? (v1 === v2 ? .82 : 1) : 1;
      u.onend = () => setTimeout(next, 180); u.onerror = () => { this._speaking = false; onend && onend(); };
      speechSynthesis.speak(u);
    };
    next(); return true;
  },
  /* reconhecimento de voz: devolve controlador {stop} */
  listen({ onText, onEnd, onError, lang = 'en-US' } = {}) {
    if (!this.sttOk) { onError && onError('unsupported'); return null; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition; const r = new SR();
    r.lang = lang; r.interimResults = true; r.continuous = true; r.maxAlternatives = 1;
    let finalT = '', conf = [], stopped = false;
    r.onresult = e => { let interim = ''; for (let i = e.resultIndex; i < e.results.length; i++) { const res = e.results[i]; if (res.isFinal) { finalT += res[0].transcript + ' '; conf.push(res[0].confidence); } else interim += res[0].transcript; } onText && onText((finalT + interim).trim(), false); };
    r.onerror = e => { onError && onError(e.error); };
    r.onend = () => { if (!stopped && this._rec === r && r._keep) { try { r.start(); return; } catch (e) { } } onEnd && onEnd({ text: finalT.trim(), confidence: conf.length ? avg(conf) : null }); };
    r._keep = true; this._rec = r;
    try { r.start(); } catch (e) { onError && onError(String(e)); return null; }
    return { stop() { stopped = true; r._keep = false; try { r.stop(); } catch (e) { } } };
  }
};
/* alinhamento palavra a palavra entre a frase-alvo e o que o navegador entendeu */
function comparePron(target, heard) {
  const A = tokens(target), B = tokens(heard); const n = A.length, m = B.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) dp[i][j] = A[i - 1] === B[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  const hit = new Array(n).fill(false); let i = n, j = m;
  while (i > 0 && j > 0) { if (A[i - 1] === B[j - 1]) { hit[i - 1] = true; i--; j--; } else if (dp[i - 1][j] >= dp[i][j - 1]) i--; else j--; }
  return { words: A.map((w, k) => ({ w, ok: hit[k] })), score: n ? Math.round(100 * hit.filter(Boolean).length / n) : 0 };
}
const STRESS = { comfortable: 'COMF-ter-ble', vegetable: 'VEJ-tuh-bul', sandwich: 'SAND-wich', wednesday: 'WENZ-day', particularly: 'per-TIK-yuh-ler-lee', development: 'dih-VEL-up-ment', infrastructure: 'IN-fruh-struk-cher', schedule: 'SKED-jool', thorough: 'THUR-oh', analysis: 'uh-NAL-uh-sis' };

/* ---------------- AIService ---------------- */
const SCHEMAS = {
  writing: { score: 'number', cefr: 'string', grammarErrors: 'array', vocabularySuggestions: 'array', naturalVersion: 'string', explanation: 'string' },
  speaking: { score: 'number', cefr: 'string', grammarErrors: 'array', vocabularySuggestions: 'array', naturalVersion: 'string', explanation: 'string' },
  roleplay: { reply: 'string', objectivesMet: 'array' },
  entry: { w: 'string', pos: 'string', lvl: 'string', pt: 'string', def: 'string', ex: 'string' },
  explain: { explanation: 'string', example: 'string' }
};
function validateSchema(name, o) {
  const sc = SCHEMAS[name]; if (!sc || !o || typeof o !== 'object') return false;
  return Object.keys(sc).every(k => sc[k] === 'array' ? Array.isArray(o[k]) : typeof o[k] === sc[k]);
}
const AIService = {
  enabled: () => !!(S.settings.apiKey && S.settings.apiKey.length > 20),
  async call(system, user, { max = 900, history } = {}) {
    const msgs = history && history.length ? history : [{ role: 'user', content: user }];
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': S.settings.apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({ model: S.settings.model || 'claude-haiku-4-5-20251001', max_tokens: max, system, messages: msgs })
    });
    if (!r.ok) { let t = ''; try { t = (await r.json()).error.message; } catch (e) { } throw new Error('AI error ' + r.status + (t ? ': ' + t : '')); }
    const j = await r.json(); return (j.content || []).map(c => c.text || '').join('');
  },
  async json(schema, system, user, max) {
    const raw = await this.call(system + '\nRespond with ONLY a valid JSON object, no markdown fences.', user, { max });
    const m = raw.match(/\{[\s\S]*\}/); if (!m) throw new Error('No JSON in response');
    const o = JSON.parse(m[0]); if (!validateSchema(schema, o)) throw new Error('Invalid structure from AI'); return o;
  },
  profileLine() { return `Learner: adult Brazilian, level ${S.profile.level}, target ${S.profile.target}, interests: ${(S.profile.topics || []).join(', ')}. Weak points: ${weakPoints(4).map(w => w.name).join('; ') || 'none yet'}.`; },
  async evaluateWriting(text, ctx = {}) {
    return this.json('writing', `You are an English tutor for a Brazilian ${S.profile.level} learner aiming for ${S.profile.target}. ${this.profileLine()} Evaluate the text. Return JSON: {"score":0-100,"cefr":"A2|B1|B1+|B2|B2+|C1","grammarErrors":[{"bad":"","good":"","why":""}],"vocabularySuggestions":[{"instead":"","try":["",""]}],"naturalVersion":"a more natural rewrite of the whole text","explanation":"2-3 short sentences: the most important thing to improve"}. Keep explanations short and simple.`, `Task: ${ctx.prompt || 'free writing'}\nText:\n${text}`, 900);
  },
  async evaluateSpeaking(transcript, ctx = {}) {
    return this.json('speaking', `You evaluate a spoken answer (speech-to-text transcript, so ignore punctuation/capitalization and small recognition glitches). Learner level ${S.profile.level}, target ${S.profile.target}. Return JSON: {"score":0-100,"cefr":"","grammarErrors":[{"bad":"","good":"","why":""}],"vocabularySuggestions":[{"instead":"","try":[""]}],"naturalVersion":"how a B2 speaker would say it","explanation":"2 short sentences"}`, `Question: ${ctx.prompt}\nTranscript:\n${transcript}`, 800);
  },
  async roleplayTurn(sc, history, userText) {
    const objs = sc.objectives.map(o => `${o.id}: ${o.label}`).join('; ');
    const sys = `You play this character in an English roleplay: ${sc.persona}. Situation: ${sc.situation}. Keep each reply under 45 words, natural spoken English at ${S.profile.level}+ level, one question or reaction at a time. Hidden objectives for the learner: ${objs}. Return JSON: {"reply":"your next line as the character","objectivesMet":["ids of objectives the learner has met so far"]}`;
    const msgs = history.map(h => ({ role: h.who === 'me' ? 'user' : 'assistant', content: h.text })); msgs.push({ role: 'user', content: userText });
    const raw = await this.call(sys + '\nRespond ONLY with JSON.', null, { max: 400, history: msgs[0].role === 'user' ? msgs : [{ role: 'user', content: '(start)' }, ...msgs] });
    const m = raw.match(/\{[\s\S]*\}/); const o = JSON.parse(m[0]); if (!validateSchema('roleplay', o)) throw new Error('Invalid roleplay response'); return o;
  },
  async explainMistake(mst) {
    return this.json('explain', `Explain this English mistake to a Brazilian ${S.profile.level} learner in simple English (max 3 sentences, add a short Portuguese hint if useful) and give ONE new example sentence. Return JSON {"explanation":"","example":""}.`, `Wrong: ${mst.yours}\nCorrect: ${mst.good}\nContext: ${mst.q}`, 400);
  },
  async wordEntry(word) {
    return this.json('entry', `Create a vocabulary entry for a Brazilian learner. Return JSON {"w":"","pos":"","lvl":"A2|B1|B1+|B2|B2+|C1","pt":"portuguese translation","def":"simple English definition","ex":"natural example sentence containing the word","ipa":"/ipa/","syn":[""],"col":["3 collocations"]}`, word, 500);
  },
  async tutor(history) {
    const sys = `You are Fluent Path's personal English tutor. ${this.profileLine()} Skills: ${SKILLS.map(k => SKILL_NAME[k] + ' ' + lvLabel(S.sk[k].a)).join(', ')}. Be concise (max 120 words), encouraging but honest, mostly English with a short Portuguese note only when it really helps. Prefer concrete examples and end with a tiny exercise or question when appropriate.`;
    return this.call(sys, null, { max: 500, history });
  }
};
