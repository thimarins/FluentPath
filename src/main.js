/* ============================================================
   FLUENT PATH — INICIALIZAÇÃO
   Dois modos: (1) launcher do Windows: o progresso é salvo em
   data\progress.json pelo servidor local; (2) navegador/arquivo:
   só localStorage. Em ambos o app funciona igual.
   ============================================================ */
const IS_LOCAL = /^https?:$/.test(location.protocol) && /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
async function serverBoot() {
  if (!IS_LOCAL) return;
  try {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 2500);
    const r = await fetch('/api/info', { headers: { 'X-FluentPath': '1' }, signal: ctl.signal }); clearTimeout(t);
    if (!r.ok) return; const info = await r.json(); SERVER = { path: info.path, ok: true, at: 0 };
    const g = await fetch('/api/state', { headers: { 'X-FluentPath': '1' } });
    if (g.ok) {
      const remote = await g.json();
      if (remote && remote.c && remote.profile) {
        const hasLocal = !S.demo && (S.onboarded || Object.keys(S.c).length);
        applyState(hasLocal ? mergeStates(syncPayload(), remote) : remote); // demo nunca persiste: volta o progresso real do arquivo // junta o que já havia no navegador com o arquivo
      }
    } else if (S.onboarded && !S.demo) srvPush(true); // 1ª vez neste launcher: promove o progresso do navegador para o arquivo
    setInterval(() => fetch('/api/ping', { headers: { 'X-FluentPath': '1' } }).catch(() => { }), 15000);
  } catch (e) { SERVER = null; }
}
(async function boot() {
  buildIndexes();
  load();
  await serverBoot();
  (S.personal || []).forEach(addPersonalToContent);
  applyTheme();
  Speech.init();
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => { });
  if ('serviceWorker' in navigator && /^https?:/.test(location.protocol) && !IS_LOCAL) navigator.serviceWorker.register('sw.js').catch(() => { });
  if (syncConnected()) SYNC.state = 'idle';
  if (!location.hash) location.hash = S.onboarded ? '/home' : '/onboarding';
  window.addEventListener('beforeunload', () => { save(); srvPush(true); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { save(); srvPush(true); } });
  matchMedia('(prefers-color-scheme: dark)').addEventListener && matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (S.settings.theme === 'system' && $('#themeBtn')) chrome(); });
  // Acessibilidade: elementos clicáveis que não são <button>/<a> ganham foco e ativação por teclado.
  const kbFix = root => (root.querySelectorAll ? root : document).querySelectorAll('[data-a]:not(button):not(a):not(input):not(select):not(textarea):not([tabindex])').forEach(el => { el.setAttribute('tabindex', '0'); el.setAttribute('role', 'button'); });
  new MutationObserver(() => kbFix(document)).observe(document.body, { childList: true, subtree: true });
  document.addEventListener('keydown', e => { const t = e.target; if ((e.key === 'Enter' || e.key === ' ') && t && t.getAttribute && t.getAttribute('role') === 'button' && !/^(BUTTON|A|INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) { e.preventDefault(); t.click(); } });
  render();
  kbFix(document);
})();
