/* ============================================================
   FLUENT PATH — SINCRONIZAÇÃO COM O GOOGLE DRIVE
   O progresso vai para a pasta privada do app (appDataFolder) na
   sua conta Google e é MESCLADO entre aparelhos: nada é sobrescrito.
   Sem servidor próprio. A chave de IA nunca sai do aparelho.
   ============================================================ */
const DEFAULT_CLIENT_ID = ''; // preenchido pelo build (config.json), opcional
const SYNC = { scope: 'https://www.googleapis.com/auth/drive.appdata', file: 'fluentpath-progress.json', bakPrefix: 'fluentpath-backup-', tok: null, exp: 0, state: 'off', msg: '', busy: false };
const DRV = 'https://www.googleapis.com/drive/v3', DUP = 'https://www.googleapis.com/upload/drive/v3';
const clone = o => o === undefined ? undefined : JSON.parse(JSON.stringify(o));
const syncCfg = () => { try { return JSON.parse(localStorage.getItem('fp.sync') || '{}'); } catch (e) { return {}; } };
const setSyncCfg = o => { try { localStorage.setItem('fp.sync', JSON.stringify({ ...syncCfg(), ...o })); } catch (e) { } };
const clientId = () => ((syncCfg().cid || DEFAULT_CLIENT_ID) || '').trim();
const syncConnected = () => !!syncCfg().connected && !!clientId();
const SYNC_SKIP = (k, v) => (k === 'plan' || k === 'apiKey') ? undefined : v;
const syncPayload = () => JSON.parse(JSON.stringify(S, SYNC_SKIP));

/* ---------- mesclagem (pura e idempotente: merge(a,b) == merge(merge(a,b),b)) ---------- */
function mergeStates(A, B) {
  const rank = s => (s.onboarded ? 1e15 : 0) + (Object.keys(s.c || {}).length ? 1e14 : 0) + (s.updatedAt || 0);
  const base = rank(A) >= rank(B) ? A : B;
  const m = clone(base);
  const at = (x, k) => x[k] || 0;
  m.onboarded = !!(A.onboarded || B.onboarded); m.demo = false;
  m.created = Math.min(A.created || Infinity, B.created || Infinity); if (!isFinite(m.created)) m.created = Date.now();
  m.profile = clone(at(A, 'profileAt') >= at(B, 'profileAt') && A.onboarded ? A.profile : (at(B, 'profileAt') > at(A, 'profileAt') && B.onboarded ? B.profile : base.profile));
  m.profileAt = Math.max(at(A, 'profileAt'), at(B, 'profileAt'));
  const sa = at(A, 'settingsAt') >= at(B, 'settingsAt') ? A : B; m.settings = clone(sa.settings); m.settingsAt = Math.max(at(A, 'settingsAt'), at(B, 'settingsAt'));
  // conceitos: vence o registro mais recente; contadores nunca diminuem
  m.c = {}; new Set([...Object.keys(A.c || {}), ...Object.keys(B.c || {})]).forEach(k => {
    const x = (A.c || {})[k], y = (B.c || {})[k]; if (!x || !y) { m.c[k] = clone(x || y); return; }
    const px = x.prior && !x.seen, py = y.prior && !y.seen; let w;
    if (px && !py) w = y; else if (py && !px) w = x; else w = (x.last || 0) > (y.last || 0) ? x : (y.last || 0) > (x.last || 0) ? y : ((x.seen || 0) >= (y.seen || 0) ? x : y);
    const r = clone(w); r.seen = Math.max(x.seen || 0, y.seen || 0); r.ok = Math.max(x.ok || 0, y.ok || 0); r.bad = Math.max(x.bad || 0, y.bad || 0); r.peak = Math.max(x.peak || 0, y.peak || 0);
    if (x.first && y.first) r.first = Math.min(x.first, y.first); m.c[k] = r;
  });
  // caderno de erros (com lápides para erros removidos de propósito)
  const del = { ...(A.mistDel || {}), ...(B.mistDel || {}) }; Object.keys(B.mistDel || {}).forEach(k => { del[k] = Math.max(del[k] || 0, (B.mistDel || {})[k]); }); Object.keys(A.mistDel || {}).forEach(k => { del[k] = Math.max(del[k] || 0, (A.mistDel || {})[k]); });
  const mm = {}; [...(A.mist || []), ...(B.mist || [])].forEach(r => { const o = mm[r.key]; if (!o) mm[r.key] = clone(r); else { const w = (r.last || 0) > (o.last || 0) ? r : o; const c = clone(w); c.count = Math.max(r.count || 0, o.count || 0); c.first = Math.min(r.first || Infinity, o.first || Infinity); mm[r.key] = c; } });
  m.mist = Object.values(mm).filter(r => !(del[r.key] && del[r.key] > (r.last || 0))); m.mistDel = del;
  // dias: máximo por campo (idempotente; nunca perde nem duplica)
  m.days = {}; new Set([...Object.keys(A.days || {}), ...Object.keys(B.days || {})]).forEach(k => { const x = (A.days || {})[k] || {}, y = (B.days || {})[k] || {}; const o = {}; new Set([...Object.keys(x), ...Object.keys(y)]).forEach(f => { o[f] = Math.max(x[f] || 0, y[f] || 0); }); m.days[k] = o; });
  const uni = (a, b, keyf, cap) => { const mp = new Map(); [...(a || []), ...(b || [])].forEach(x => { const k = keyf(x); if (!mp.has(k)) mp.set(k, x); }); const arr = [...mp.values()]; return cap ? arr.slice(-cap) : arr; };
  m.sessions = uni(A.sessions, B.sessions, s => s.at, 300).sort((a, b) => a.at - b.at);
  m.ev = uni(A.ev, B.ev, e => e.t + '|' + e.e + '|' + (e.cid || ''), 4000).sort((a, b) => a.t - b.t);
  m.analyses = uni(A.analyses, B.analyses, a => a.at, 80).sort((a, b) => a.at - b.at);
  m.assess = uni(A.assess, B.assess, a => a.at + a.type);
  m.reports = uni(A.reports, B.reports, r => r.at || JSON.stringify(r));
  m.xp = Math.max(A.xp || 0, B.xp || 0);
  m.sk = {}; SKILLS.forEach(k => { const x = (A.sk || {})[k], y = (B.sk || {})[k]; m.sk[k] = clone(!x ? y : !y ? x : (x.n > y.n ? x : y.n > x.n ? y : (A.updatedAt >= B.updatedAt ? x : y))); });
  m.seenEx = {}; new Set([...Object.keys(A.seenEx || {}), ...Object.keys(B.seenEx || {})]).forEach(k => { m.seenEx[k] = Math.max((A.seenEx || {})[k] || 0, (B.seenEx || {})[k] || 0); });
  m.ach = {}; new Set([...Object.keys(A.ach || {}), ...Object.keys(B.ach || {})]).forEach(k => { const x = (A.ach || {})[k], y = (B.ach || {})[k]; m.ach[k] = Math.min(x || Infinity, y || Infinity); });
  const pd = { ...(A.persDel || {}), ...(B.persDel || {}) }; m.persDel = pd;
  m.personal = uni(A.personal, B.personal, w => w.id).filter(w => !pd[w.id]);
  m.snap = { ...(B.snap || {}), ...(A.snap || {}) };
  ['lastSpeak', 'lastListen', 'lastWrite', 'lastRead'].forEach(k => { m[k] = Math.max(A[k] || 0, B[k] || 0); });
  m.diag = ((A.diag && A.diag.at) || 0) >= ((B.diag && B.diag.at) || 0) ? clone(A.diag) : clone(B.diag); if (!m.diag) m.diag = clone(A.diag || B.diag || null);
  const wa = (A.updatedAt || 0) >= (B.updatedAt || 0); m.win = clone(wa ? A.win : B.win); m.tut = clone(((A.tut || []).length >= (B.tut || []).length && wa) ? A.tut : (wa ? A.tut : B.tut));
  { const qa = A.quests, qb = B.quests; if (qa && qb) { m.quests = qa.day > qb.day ? clone(qa) : qb.day > qa.day ? clone(qb) : { day: qa.day, done: { ...qa.done, ...qb.done }, bonus: Math.max(qa.bonus || 0, qb.bonus || 0) }; } else m.quests = clone(qa || qb || null); }
  m.updatedAt = Math.max(A.updatedAt || 0, B.updatedAt || 0); m.plan = null;
  return m;
}

/* ---------- Google: login (token) e API do Drive ---------- */
function loadGsi() {
  return new Promise((res, rej) => {
    if (window.google && google.accounts && google.accounts.oauth2) return res();
    const s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.async = true;
    s.onload = () => res(); s.onerror = () => rej(new Error('Could not load Google sign-in (are you offline?)')); document.head.appendChild(s);
  });
}
async function ensureToken(interactive) {
  if (SYNC.tok && Date.now() < SYNC.exp - 60000) return;
  if (!interactive && !syncCfg().consented) throw new Error('needs-tap');
  await loadGsi();
  await new Promise((res, rej) => {
    let done = false;
    const timer = !interactive ? setTimeout(() => { if (!done) { done = true; rej(new Error('needs-tap')); } }, 5000) : null;
    const tc = google.accounts.oauth2.initTokenClient({
      client_id: clientId(), scope: SYNC.scope,
      callback: r => {
        if (done) return; done = true; if (timer) clearTimeout(timer);
        if (r.error) { rej(new Error(!interactive ? 'needs-tap' : (r.error_description || r.error))); return; }
        SYNC.tok = r.access_token; SYNC.exp = Date.now() + (r.expires_in || 3600) * 1000; setSyncCfg({ consented: true }); res();
      },
      error_callback: e => {
        if (done) return; done = true; if (timer) clearTimeout(timer);
        rej(new Error(!interactive ? 'needs-tap' : (e && e.type === 'popup_closed' ? 'Google sign-in was closed' : (e && e.type) || 'Google sign-in failed')));
      }
    });
    tc.requestAccessToken({ prompt: !interactive ? 'none' : (syncCfg().consented ? '' : 'consent') });
  });
}
async function dfetch(url, opt = {}) {
  const r = await fetch(url, { ...opt, headers: { ...(opt.headers || {}), authorization: 'Bearer ' + SYNC.tok } });
  if (r.status === 401) { SYNC.tok = null; throw new Error('Google session expired. Tap the cloud to sign in again.'); }
  if (!r.ok) { let t = ''; try { t = (await r.json()).error.message; } catch (e) { } throw new Error('Drive error ' + r.status + (t ? ': ' + t : '')); }
  return r;
}
async function driveList(prefix) {
  const q = encodeURIComponent("'appDataFolder' in parents and trashed=false" + (prefix ? ` and name contains '${prefix}'` : ` and name='${SYNC.file}'`));
  const r = await dfetch(`${DRV}/files?spaces=appDataFolder&q=${q}&fields=files(id,name,modifiedTime)&pageSize=50`); return ((await r.json()).files || []);
}
const driveRead = async id => (await dfetch(`${DRV}/files/${id}?alt=media`)).json();
async function driveWrite(id, name, obj) {
  const b = 'fp' + Date.now() + Math.random().toString(36).slice(2); const meta = id ? { name } : { name, parents: ['appDataFolder'] };
  const body = `--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${b}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(obj)}\r\n--${b}--`;
  const r = await dfetch(id ? `${DUP}/files/${id}?uploadType=multipart` : `${DUP}/files?uploadType=multipart`, { method: id ? 'PATCH' : 'POST', headers: { 'content-type': `multipart/related; boundary=${b}` }, body }); return r.json();
}
const driveDelete = id => dfetch(`${DRV}/files/${id}`, { method: 'DELETE' });

/* ---------- fluxo de sincronização ---------- */
function applyState(next) {
  const keyKeep = S.settings && S.settings.apiKey || '';
  S = next; S.plan = null; if (!S.settings) S.settings = newState().settings; S.settings.apiKey = keyKeep;
  const base = newState(); Object.keys(base).forEach(k => { if (S[k] === undefined) S[k] = base[k]; });
  save();
}
function setSyncState(st, msg) { SYNC.state = st; SYNC.msg = msg || ''; if (typeof syncPill === 'function') syncPill(); }
async function syncNow(opts = {}) {
  if (SYNC.busy) return;
  if (S.demo) { if (!opts.silent) toast('Sync is off while the demo user is loaded.', 'alert'); return; }
  if (!clientId()) { if (!opts.silent) { toast('Add your Google client ID in Settings first.', 'alert'); nav('/settings'); } return; }
  SYNC.busy = true; setSyncState('busy');
  try {
    await ensureToken(!opts.silent);
    const files = await driveList(); const remoteFile = files[0];
    let remote = null; if (remoteFile) remote = await driveRead(remoteFile.id);
    if (!remote && !S.onboarded) { setSyncCfg({ last: Date.now() }); setSyncState('idle'); return; } // aparelho novo e nada na nuvem: não envia estado vazio
    try { localStorage.setItem(KEY + '.pre', JSON.stringify(S, NOSAVE)); } catch (e) { }
    const local = syncPayload();
    const merged = remote ? mergeStates(local, remote) : local;
    // backup diário do que estava na nuvem antes desta escrita (mantém 7)
    if (remote) {
      const day = dayKey(); const baks = await driveList(SYNC.bakPrefix); const nm = SYNC.bakPrefix + day + '.json';
      if (!baks.some(f => f.name === nm)) { await driveWrite(null, nm, remote); const all = (await driveList(SYNC.bakPrefix)).sort((a, b) => a.name < b.name ? -1 : 1); while (all.length > 7) { await driveDelete(all.shift().id); } }
    }
    applyState(merged);
    await driveWrite(remoteFile && remoteFile.id, SYNC.file, syncPayload());
    setSyncCfg({ last: Date.now(), connected: true }); setSyncState('ok');
    if (!$('#runner')) render();
    if (!opts.silent) toast('Synced with Google Drive.', 'check-circle');
  } catch (e) {
    const tap = e.message === 'needs-tap'; setSyncState(tap ? 'idle' : 'err', tap ? 'Tap the cloud to sync' : e.message);
    if (!opts.silent && !tap) toast(esc(e.message), 'alert');
  } finally { SYNC.busy = false; if (typeof chrome === 'function' && $('#nav')) chrome(); }
}
function autoSync() {
  if (!syncConnected() || S.demo || SYNC.busy) return;
  if (Date.now() - (syncCfg().last || 0) < 45000) return;
  if ((SYNC.tok && Date.now() < SYNC.exp - 60000) || syncCfg().consented) syncNow({ silent: true });
}
function syncPill() {
  const b = $('#syncBtn'); if (!b) return; const st = SYNC.state; const on = syncConnected();
  b.className = 'iconbtn' + (st === 'busy' ? ' spin' : '') + (on && st === 'ok' ? ' ok' : '') + (st === 'err' ? ' err' : '');
  b.innerHTML = I(st === 'busy' ? 'refresh' : 'cloud');
  const last = syncCfg().last; b.title = !on ? 'Sync with Google Drive (not connected)' : st === 'busy' ? 'Syncing…' : st === 'err' ? 'Sync error: ' + SYNC.msg : last ? 'Last sync ' + ago(last) + ' · tap to sync' : 'Tap to sync';
}
document.addEventListener('visibilitychange', () => { if (document.hidden) autoSync(); });

/* ---------- ações e tela de configuração ---------- */
ACT.syncNow = () => { if (!syncConnected()) { nav('/settings'); return; } syncNow({}); };
ACT.syncConnect = () => { const v = ($('#scid') || {}).value; if (v !== undefined) setSyncCfg({ cid: v.trim() }); if (!clientId()) { toast('Paste your Google client ID first.', 'alert'); return; } setSyncCfg({ connected: true }); syncNow({}); };
ACT.syncDisconnect = () => { setSyncCfg({ connected: false }); SYNC.tok = null; setSyncState('off'); toast('Disconnected. Your Drive copy stays as a backup.', 'cloud'); render(); };
ACT.syncRestore = async () => {
  if (!syncConnected()) { toast('Connect Google Drive first.', 'alert'); return; }
  try { await ensureToken(true); const baks = (await driveList(SYNC.bakPrefix)).sort((a, b) => a.name < b.name ? 1 : -1); if (!baks.length) { toast('No backups yet. One is created daily after sync.', 'alert'); return; }
    modal(`<h2>Restore a backup</h2><p class="muted small">Replaces your progress on THIS device with the chosen day's copy, then syncs it.</p><div class="list" style="margin-top:12px">${baks.map(f => `<div class="it click" data-a="syncRestorePick" data-id="${f.id}"><div class="ico">${I('calendar')}</div><div class="grow b small">${esc(f.name.replace(SYNC.bakPrefix, '').replace('.json', ''))}</div>${I('chevron')}</div>`).join('')}</div>`);
  } catch (e) { toast(esc(e.message), 'alert'); }
};
ACT.syncRestorePick = async el => {
  if (!confirm('Replace the progress on this device with this backup?')) return;
  try { const data = await driveRead(el.dataset.id); if (!data || !data.c || !data.profile) throw new Error('Invalid backup'); data.updatedAt = Date.now(); applyState(data); const f = (await driveList())[0]; await driveWrite(f && f.id, SYNC.file, syncPayload()); closeModal(); toast('Backup restored.', 'check-circle'); render(); } catch (e) { toast(esc(e.message), 'alert'); }
};
function syncCardHTML() {
  const on = syncConnected(), last = syncCfg().last, embedded = !!DEFAULT_CLIENT_ID;
  return `<div class="card"><h3>Sync with Google Drive</h3><p class="small muted">Keep your progress on Windows and Android in sync. It is saved in a private, hidden app folder in <b>your own</b> Google Drive and merged between devices, so nothing is overwritten. Free, no server.</p>
  ${embedded ? '' : `<label class="f">Google OAuth client ID</label><input type="text" id="scid" value="${esc(syncCfg().cid || '')}" placeholder="1234-abc.apps.googleusercontent.com" autocomplete="off">`}
  <div class="row wrap" style="margin-top:14px"><button class="btn primary" data-a="syncConnect">${I('cloud')} ${on ? 'Sync now' : 'Connect & sync'}</button>${on ? `<button class="btn" data-a="syncRestore">${I('refresh')} Restore backup</button><button class="btn danger" data-a="syncDisconnect">Disconnect</button>` : ''}</div>
  <div class="small" style="margin-top:10px">${on ? (last ? `<span style="color:var(--ok)">Connected</span> · last sync ${ago(last)}` : 'Connected · not synced yet') : '<span class="muted">Not connected.</span>'}${SYNC.state === 'err' ? `<div style="color:var(--bad);margin-top:4px">${esc(SYNC.msg)}</div>` : ''}</div>
  <details style="margin-top:12px"><summary class="small b" style="cursor:pointer">How do I get a client ID? (5 minutes, free)</summary><ol class="small muted" style="margin:8px 0 0 18px;padding:0;line-height:1.7"><li>Open <b>console.cloud.google.com</b> → create a project.</li><li><b>APIs &amp; Services → Library</b> → enable <b>Google Drive API</b>.</li><li><b>OAuth consent screen</b> → External → app name → add yourself as a test user (and the scope <i>drive.appdata</i>).</li><li><b>Credentials → Create credentials → OAuth client ID → Web application</b>.</li><li>In <b>Authorized JavaScript origins</b> add the address where you host this app (for example <i>https://yourname.github.io</i>, origin only).</li><li>Copy the client ID and paste it here, on each device.</li></ol></details></div>`;
}
