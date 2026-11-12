/* ============================================================
   FLUENT PATH — UI CORE
   Ícones (estilo Lucide), roteador, layout, modais, paleta de
   comandos, gráficos SVG e cartões de conteúdo.
   ============================================================ */
const ICONS = {
  cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  compass: '<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/>',
  play: '<polygon points="6 3 20 12 6 21 6 3"/>',
  'book-open': '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  book: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/>',
  puzzle: '<path d="M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 15.39a1 1 0 0 1-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 1 .474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L8.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l-1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 8.61a1 1 0 0 1 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1-.474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z"/>',
  mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>',
  headphones: '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
  pen: '<path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  chart: '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  map: '<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>',
  bot: '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>',
  trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
  settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  'check-circle': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  'x-circle': '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  'volume-x': '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/>',
  volume: '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  circle: '<circle cx="12" cy="12" r="10"/>',
  dot: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="currentColor"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
  brain: '<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>',
  sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/>',
  eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  shuffle: '<path d="m18 14 4 4-4 4"/><path d="m18 2 4 4-4 4"/><path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22"/><path d="M2 6h1.972a4 4 0 0 1 3.6 2.2"/><path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45"/>',
  list: '<line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  briefcase: '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
  plane: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  cpu: '<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/>',
  coffee: '<path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/>',
  film: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M3 7.5h4"/><path d="M3 12h18"/><path d="M3 16.5h4"/><path d="M17 3v18"/><path d="M17 7.5h4"/><path d="M17 16.5h4"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  dollar: '<line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  flask: '<path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/>'
};
const I = (n, extra = '') => `<span class="li ${extra}" aria-hidden="true"><svg viewBox="0 0 24 24">${ICONS[n] || ICONS.circle}</svg></span>`;

/* ---------- helpers de UI ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [].slice.call(r.querySelectorAll(s));
const lvTag = l => `<span class="tag ${l === 'B1' ? 'b1' : l === 'B1+' ? 'b1p' : l === 'B2' ? 'b2' : l === 'B2+' ? 'b2p' : l === 'C1' ? 'c1' : 'a'}">${l}</span>`;
const stChip = st => `<span class="tag st-${st}">${{ new: 'New', learning: 'Learning', familiar: 'Familiar', mastered: 'Mastered', forgotten: 'Forgotten' }[st]}</span>`;
const pct = v => Math.round(clamp(v, 0, 1) * 100);
const bar = (v, cls = '') => `<div class="bar ${cls}"><i style="width:${pct(v)}%"></i></div>`;
const stOf = cid => stageOf(S.c[cid]);
const sayBtn = (t, extra = '') => `<button class="say" data-a="say" data-t="${esc(t)}" aria-label="Listen" ${extra}>${I('volume')}</button>`;
const topicIcon = { tech: 'cpu', ai: 'brain', security: 'lock', business: 'briefcase', work: 'briefcase', travel: 'plane', daily: 'coffee', relationships: 'heart', culture: 'film', finance: 'dollar', science: 'flask', health: 'heart', abstract: 'bulb' };
const TOPIC_LABEL = { tech: 'Technology', ai: 'Artificial Intelligence', security: 'Cybersecurity', business: 'Business', travel: 'Travel', daily: 'Daily life', relationships: 'Relationships', culture: 'Culture & media', finance: 'Finance', science: 'Science', news: 'Current events', work: 'Work & careers', health: 'Health & wellbeing', abstract: 'Ideas & academic English' };
function ring(v, size = 92, stroke = 9, color = 'var(--pri)', center = '', sub = '') {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, off = c * (1 - clamp(v, 0, 1));
  return `<div class="ring" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--surf2)" stroke-width="${stroke}"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}" style="transition:stroke-dashoffset .8s cubic-bezier(.2,.7,.2,1)"/></svg><div class="c"><b>${center}</b><span class="tiny muted">${sub}</span></div></div>`;
}
function lineChart(vals, { w = 520, h = 140, color = 'var(--pri)', min = 0, max = 100, labels = [], fmt = v => Math.round(v) + '%' } = {}) {
  if (!vals.length) return '<div class="empty small">Not enough data yet.</div>';
  const pad = { l: 30, r: 10, t: 10, b: 22 }, iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  const x = i => pad.l + (vals.length === 1 ? iw / 2 : i * iw / (vals.length - 1)), y = v => pad.t + ih - (clamp(v, min, max) - min) / (max - min || 1) * ih;
  const pts = vals.map((v, i) => [x(i), y(v)]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = d + ` L${pts[pts.length - 1][0].toFixed(1)} ${pad.t + ih} L${pts[0][0].toFixed(1)} ${pad.t + ih} Z`;
  const grid = [0, .5, 1].map(f => { const v = min + (max - min) * f, yy = y(v); return `<line class="gl" x1="${pad.l}" x2="${w - pad.r}" y1="${yy}" y2="${yy}"/><text x="${pad.l - 6}" y="${yy + 3}" text-anchor="end">${fmt(v)}</text>`; }).join('');
  const lab = labels.length ? labels.map((t, i) => (i % Math.ceil(labels.length / 7) === 0) ? `<text x="${x(i)}" y="${h - 6}" text-anchor="middle">${esc(t)}</text>` : '').join('') : '';
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" width="100%" role="img">${grid}<path d="${area}" fill="${color}" opacity=".1"/><path d="${d}" fill="none" stroke="${color}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>${pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="2.8" fill="${color}"/>`).join('')}${lab}</svg>`;
}
function barChart(vals, { w = 520, h = 140, color = 'var(--pri)', labels = [], max = null, goal = null } = {}) {
  const m = max || Math.max(1, ...vals, goal || 0), pad = { l: 28, r: 6, t: 10, b: 22 }, iw = w - pad.l - pad.r, ih = h - pad.t - pad.b, bw = iw / vals.length;
  const bars = vals.map((v, i) => { const hh = v / m * ih; return `<rect x="${pad.l + i * bw + bw * .18}" y="${pad.t + ih - hh}" width="${bw * .64}" height="${Math.max(hh, v ? 2 : 0)}" rx="4" fill="${color}" opacity="${v ? 1 : .15}"/>`; }).join('');
  const gl = goal ? `<line x1="${pad.l}" x2="${w - pad.r}" y1="${pad.t + ih - goal / m * ih}" y2="${pad.t + ih - goal / m * ih}" stroke="var(--acc)" stroke-dasharray="4 4"/>` : '';
  const lab = labels.map((t, i) => `<text x="${pad.l + i * bw + bw / 2}" y="${h - 6}" text-anchor="middle">${esc(t)}</text>`).join('');
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" width="100%"><line class="gl" x1="${pad.l}" x2="${w - pad.r}" y1="${pad.t + ih}" y2="${pad.t + ih}"/>${gl}${bars}${lab}<text x="${pad.l - 6}" y="${pad.t + 8}" text-anchor="end">${Math.round(m)}</text></svg>`;
}
function heatmap(weeks = 13) {
  const cells = []; const end = new Date(); end.setHours(12, 0, 0, 0);
  const dow = (end.getDay() + 6) % 7; const start = new Date(end.getTime() - ((weeks - 1) * 7 + dow) * DAY);
  for (let i = 0; i < weeks * 7; i++) { const t = start.getTime() + i * DAY; if (t > end.getTime()) { cells.push('<i style="visibility:hidden"></i>'); continue; } const d = S.days[dayKey(t)]; const m = d ? d.min : 0; const l = m <= 0 ? '' : m < 5 ? 'l1' : m < 10 ? 'l2' : m < 16 ? 'l3' : 'l4'; cells.push(`<i class="${l}" title="${dayKey(t)} · ${Math.round(m)} min"></i>`); }
  return `<div class="heat">${cells.join('')}</div>`;
}

/* ---------- toasts e modais ---------- */
function toast(msg, icon = 'check-circle') {
  let box = $('.toasts'); if (!box) { box = document.createElement('div'); box.className = 'toasts'; document.body.appendChild(box); }
  const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.innerHTML = I(icon) + '<span>' + String(msg).replace(/<(?!\/?b>)/g, '&lt;') + '</span>'; box.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 3200);
}
function modal(html, cls = '') {
  closeModal(); const o = document.createElement('div'); o.className = 'overlay'; o.id = 'ovl';
  o.innerHTML = `<div class="modal ${cls}" role="dialog" aria-modal="true"><button class="iconbtn x" data-a="closeModal" aria-label="Close">${I('x')}</button>${html}</div>`;
  o.addEventListener('mousedown', e => { if (e.target === o) closeModal(); }); document.body.appendChild(o); return o;
}
function closeModal() { const o = $('#ovl'); if (o) o.remove(); }

/* ---------- cartões de conteúdo (word card etc.) ---------- */
function wordCardHTML(w) {
  const c = S.c['w:' + w.id]; const st = stOf('w:' + w.id);
  return `<div class="wc"><div class="row wrap">${lvTag(w.lvl)} ${stChip(st)} <span class="tag a">${esc(w.pos)}</span></div>
  <div class="row" style="margin-top:10px"><h2>${esc(w.w)}</h2>${sayBtn(w.w)}</div><div class="ipa">${esc(w.ipa || '')}</div>
  <div class="sec"><h4>Meaning</h4><p>${esc(w.def)}</p><p class="muted">${esc(w.pt)}</p></div>
  <div class="sec"><h4>Examples</h4><p>“${esc(w.ex)}” ${sayBtn(w.ex)}</p><p class="muted" style="margin-top:4px">“${esc(w.nat)}”</p></div>
  ${(w.col || []).length ? `<div class="sec"><h4>Natural combinations</h4><div class="row wrap">${w.col.map(x => `<span class="chip">${esc(x)}</span>`).join('')}</div></div>` : ''}
  ${w.mis ? `<div class="sec"><h4>Common mistake</h4><div class="mis"><div class="bad">✗ ${esc(w.mis.bad)}</div><div class="good">✓ ${esc(w.mis.good)}</div><div class="small muted" style="margin-top:4px">${esc(w.mis.why)}</div></div></div>` : ''}
  <div class="sec grid g2 keep"><div><h4>Synonyms</h4><p class="small">${(w.syn || []).join(', ') || '—'}</p></div><div><h4>Antonyms</h4><p class="small">${(w.ant || []).join(', ') || '—'}</p></div></div>
  ${(w.fam || []).length ? `<div class="sec"><h4>Word family</h4><p class="small">${w.fam.map(esc).join(' · ')}</p></div>` : ''}
  ${c && c.seen ? `<div class="sec"><h4>Your memory</h4>${bar(mEff(c), 'ok')}<p class="tiny muted" style="margin-top:6px">Mastery ${pct(mEff(c))}% · seen ${c.seen}× · next review ${c.next > Date.now() ? 'in ' + Math.max(1, Math.round((c.next - Date.now()) / DAY)) + ' d' : 'now'} · stage: ${TIER_NAME[c.tier]}</p></div>` : ''}
  <div class="row" style="margin-top:20px"><button class="btn primary" data-a="practice" data-cid="w:${w.id}">${I('zap')} Practice this word</button></div></div>`;
}
function phrCardHTML(p) {
  const st = stOf('p:' + p.id); const sib = CONTENT.phr.filter(x => x.v === p.v && x.id !== p.id);
  return `<div class="wc"><div class="row wrap">${lvTag(p.lvl)} ${stChip(st)} <span class="tag a">${p.sep ? 'separable' : 'inseparable'}</span></div>
  <div class="row" style="margin-top:10px"><h2>${esc(p.v)} ${esc(p.p)}</h2>${sayBtn(p.v + ' ' + p.p)}</div>
  <div class="sec"><h4>Meaning</h4><p>${esc(p.def)}</p><p class="muted">${esc(p.pt)}${p.formal ? ' · formal: ' + esc(p.formal) : ''}</p></div>
  <div class="sec"><h4>Examples</h4><p>“${esc(p.ex)}” ${sayBtn(p.ex)}</p><p class="muted" style="margin-top:4px">“${esc(p.nat)}”</p></div>
  ${p.contrast ? `<div class="sec"><h4>Watch out</h4><p class="small">${esc(p.contrast)}</p></div>` : ''}
  ${sib.length ? `<div class="sec"><h4>Same verb</h4><div class="row wrap">${sib.map(x => `<span class="chip" data-a="card" data-t="phr" data-id="${x.id}">${esc(x.v + ' ' + x.p)}</span>`).join('')}</div></div>` : ''}
  <div class="row" style="margin-top:20px"><button class="btn primary" data-a="practice" data-cid="p:${p.id}">${I('zap')} Practice this phrasal verb</button></div></div>`;
}
function gramSummaryHTML(g) {
  return `<div class="wc"><div class="row wrap">${lvTag(g.lvl)} ${stChip(stOf('g:' + g.id) || 'new')}</div><h2 style="margin-top:10px">${esc(g.name)}</h2>
  <div class="sec"><h4>Form</h4><p class="b">${esc(g.form || '')}</p></div>
  <div class="sec"><h4>Explanation</h4><p>${esc(g.en)}</p><p class="muted small" style="margin-top:6px">${esc(g.pt)}</p></div>
  <div class="sec"><h4>Examples</h4>${g.ex.map(x => `<p>“${esc(x)}” ${sayBtn(x)}</p>`).join('')}</div>
  <div class="row" style="margin-top:20px"><button class="btn primary" data-a="nav" data-to="/grammar/${g.id}">Open Grammar Lab ${I('arrow')}</button></div></div>`;
}
function natCardHTML(n) {
  return `<div class="wc"><div class="row wrap">${lvTag(n.lvl)}<span class="tag a">${esc((n.tags || []).join(' · '))}</span></div><h3 style="margin:10px 0 4px">Sound more natural</h3><p class="muted">${esc(n.pt)}</p>
  <div class="sec"><div class="mis"><div class="bad">✗ ${esc(n.understandable)}</div></div><div class="mis" style="background:var(--ok-soft);margin-top:8px"><div class="good">✓ ${esc(n.natural)} ${sayBtn(n.natural)}</div></div></div>
  <div class="sec"><h4>Why</h4><p>${esc(n.why)}</p></div></div>`;
}
function openCard(ref) {
  let html = '';
  if (ref.type === 'word' && IDX.words[ref.id]) html = wordCardHTML(IDX.words[ref.id]);
  else if (ref.type === 'phr' && IDX.phr[ref.id]) html = phrCardHTML(IDX.phr[ref.id]);
  else if (ref.type === 'gram' && IDX.gr[ref.id]) html = gramSummaryHTML(IDX.gr[ref.id]);
  else if (ref.type === 'nat' && IDX.nat[ref.id]) html = natCardHTML(IDX.nat[ref.id]);
  else if (ref.type === 'conn') { const c = CONTENT.con.cats.find(x => x.id === ref.cat); if (c) html = `<h2>${esc(c.name)}</h2><div class="stack" style="margin-top:14px">${c.items.map(i => `<div><b>${esc(i.c)}</b> <span class="tag a">${esc(i.reg || '')}</span> <span class="muted small">${esc(i.pt || '')}</span><div class="small muted">${esc(i.note || '')}</div></div>`).join('')}</div>`; }
  else if (ref.type === 'personal') { const w = S.personal[ref.i]; if (w) html = `<div class="wc"><h2>${esc(w.w)}</h2><p class="muted">${esc(w.pt || '')}</p><div class="sec"><h4>Meaning</h4><p>${esc(w.def || '—')}</p></div><div class="sec"><h4>Example</h4><p>${esc(w.ex || '—')}</p></div></div>`; }
  if (html) modal(html);
}

/* ---------- roteador ---------- */
const ROUTES = [];
const route = (re, fn) => ROUTES.push([re, fn]);
let CUR = '/home';
function nav(path) { if (location.hash.slice(1) === path) render(); else location.hash = path; }
function curPath() { return location.hash.slice(1) || '/home'; }
const NAV = [
  ['Main', [['/home', 'home', 'Home'], ['/session', 'play', 'Daily Session'], ['/learn', 'compass', 'Learn']]],
  ['Skills', [['/vocab', 'book-open', 'Vocabulary'], ['/phrasals', 'layers', 'Phrasal verbs'], ['/grammar', 'puzzle', 'Grammar'], ['/connectors', 'link', 'Connectors'], ['/natural', 'sparkles', 'Sound natural'], ['/speaking', 'mic', 'Speaking'], ['/listening', 'headphones', 'Listening'], ['/writing', 'pen', 'Writing'], ['/reading', 'book', 'Reading']]],
  ['Practice', [['/practice', 'zap', 'Practice'], ['/mistakes', 'wrench', 'My Mistakes'], ['/review', 'refresh', 'Review']]],
  ['You', [['/progress', 'chart', 'Progress'], ['/roadmap', 'map', 'Roadmap'], ['/tutor', 'bot', 'AI Tutor'], ['/achievements', 'trophy', 'Achievements'], ['/settings', 'settings', 'Settings']]]
];
function navHTML() {
  const due = dueCounts();
  return NAV.map(([sec, items]) => `<div class="sec">${sec}</div>` + items.map(([p, ic, name]) => `<a href="#${p}" data-p="${p}">${I(ic)}<span>${name}</span>${p === '/review' && due.total ? `<span class="dot">${due.total}</span>` : ''}</a>`).join('')).join('');
}
function shell() {
  const app = $('#app');
  app.innerHTML = `<div class="app"><aside class="side"><div class="brand"><div class="logo">${I('sparkles')}</div>Fluent Path</div><nav class="nav" id="nav"></nav></aside>
  <div class="main"><header class="top"><div class="search" data-a="palette">${I('search')}<span>Search words, grammar, mistakes…</span><kbd>Ctrl K</kbd></div>
  <div class="chipbar"><button class="pill fire" id="pStreak" data-a="streakInfo" title="Your streak: tap for details"></button><button class="pill xpp" id="pXp" data-a="xpInfo" title="Your level and XP: tap for details"></button><button class="iconbtn" data-a="syncNow" aria-label="Sync" id="syncBtn"></button><button class="iconbtn" data-a="theme" aria-label="Toggle theme" id="themeBtn"></button></div></header>
  <main class="page" id="view"></main></div></div>
  <div class="tabbar" id="tabbar"></div><div class="drawer" id="drawer"><div class="sheet" id="sheet"></div></div>`;
  $('#tabbar').innerHTML = [['/home', 'home', 'Home'], ['/session', 'play', 'Session'], ['/practice', 'zap', 'Practice'], ['/review', 'refresh', 'Review']].map(([p, ic, n]) => `<a href="#${p}" data-p="${p}">${I(ic)}<span>${n}</span></a>`).join('') + `<button data-a="more">${I('more')}<span>More</span></button>`;
}
function chrome() {
  $('#nav').innerHTML = navHTML();
  const p = curPath(); const act = '/' + p.split('/')[1];
  $$('[data-p]').forEach(a => a.classList.toggle('on', a.dataset.p === act));
  $('#pStreak').innerHTML = I('flame') + streak() + ' day' + (streak() === 1 ? '' : 's');
  const lv = levelFromXp(S.xp); $('#pXp').innerHTML = I('star') + 'Lv ' + lv + ' · ' + S.xp + ' XP';
  $('#themeBtn').innerHTML = I(document.documentElement.dataset.theme === 'dark' || (S.settings.theme === 'system' && matchMedia('(prefers-color-scheme:dark)').matches) ? 'sun' : 'moon');
  if (typeof syncPill === 'function') syncPill();
}
function applyTheme() {
  const t = S.settings.theme; const r = document.documentElement;
  if (t === 'system') r.removeAttribute('data-theme'); else r.dataset.theme = t;
}
function render() {
  const path = curPath(); CUR = path;
  if (S.onboarded && path === '/onboarding' && typeof OB !== 'undefined' && !OB) { location.hash = '/home'; return; }
  if (!S.onboarded && !/^\/(onboarding|diagnostic)/.test(path)) { location.hash = '/onboarding'; return; }
  const full = /^\/(onboarding|diagnostic)/.test(path);
  if (!$('#view')) shell();
  $('.side').style.display = full ? 'none' : ''; $('.top').style.display = full ? 'none' : ''; $('#tabbar').style.display = full ? 'none' : '';
  $('.app').style.gridTemplateColumns = full ? '1fr' : '';
  let html = null, after = null;
  for (const [re, fn] of ROUTES) { const m = path.match(re); if (m) { const r = fn(m); if (typeof r === 'string') html = r; else if (r) { html = r.html; after = r.after; } break; } }
  if (html == null) html = `<div class="empty">Page not found. <a href="#/home" class="b">Go home</a></div>`;
  if (S.demo && !full) html = `<div class="fb part" style="max-width:none;margin:6px 0 14px"><div class="t">${I('eye')} Demo mode: everything you see here is made-up data</div><div class="d">The streak, XP, level, words and mistakes belong to a fictional user so you can explore the app. Your real progress starts at zero.</div><div class="acts"><button class="btn primary sm" data-a="exitDemo">${I('rocket')} Start my own progress</button></div></div>` + html;
  $('#view').innerHTML = html; $('#view').scrollTop = 0; window.scrollTo(0, 0);
  chrome(); if (after) after();
}
window.addEventListener('hashchange', () => { Speech.stop(); render(); });

/* ---------- ações globais (delegação de eventos) ---------- */
const ACT = {
  nav: el => nav(el.dataset.to),
  closeModal: () => closeModal(),
  say: el => Speech.speak(el.dataset.t, { rate: S.settings.speed, accent: S.settings.accent }),
  card: el => openCard({ type: el.dataset.t, id: el.dataset.id, cat: el.dataset.cat, i: +el.dataset.i }),
  theme: () => { const dark = document.documentElement.dataset.theme === 'dark' || (S.settings.theme === 'system' && matchMedia('(prefers-color-scheme:dark)').matches); S.settings.theme = dark ? 'light' : 'dark'; S.settingsAt = Date.now(); applyTheme(); save(); chrome(); },
  palette: () => openPalette(),
  more: () => { const d = $('#drawer'); $('#sheet').innerHTML = `<div class="nav">${navHTML()}</div>`; d.classList.add('open'); d.onclick = e => { if (e.target === d || e.target.closest('a')) d.classList.remove('open'); }; }
};
document.addEventListener('click', e => { const t = e.target.closest('[data-a]'); if (t && ACT[t.dataset.a]) { e.preventDefault(); ACT[t.dataset.a](t, e); } });

/* ---------- paleta de comandos (Ctrl+K) e busca global ---------- */
function paletteIndex() {
  const out = [];
  NAV.forEach(([, items]) => items.forEach(([p, ic, n]) => out.push({ t: 'Go to ' + n, k: 'page ' + n, ic, do: () => nav(p) })));
  out.push({ t: 'Start today\'s session', k: 'start lesson session daily', ic: 'play', do: () => startSession(todaysPlan()) });
  out.push({ t: 'Practice speaking', k: 'speaking practice talk', ic: 'mic', do: () => startQuick('speaking', 3) });
  out.push({ t: 'Open my mistakes', k: 'mistakes errors', ic: 'wrench', do: () => nav('/mistakes') });
  out.push({ t: 'Review words', k: 'review words vocabulary', ic: 'refresh', do: () => startQuick('review', 5) });
  out.push({ t: 'Ask the AI Tutor', k: 'ask ai tutor', ic: 'bot', do: () => nav('/tutor') });
  out.push({ t: 'Teach me something', k: 'teach learn something', ic: 'bulb', do: () => teachMe() });
  CONTENT.words.forEach(w => out.push({ t: w.w, sub: w.pt, k: `${w.w} ${w.pt} ${w.def}`, ic: 'book-open', tag: w.lvl, do: () => openCard({ type: 'word', id: w.id }) }));
  CONTENT.phr.forEach(p => out.push({ t: p.v + ' ' + p.p, sub: p.pt, k: `${p.v} ${p.p} ${p.pt} ${p.def} phrasal`, ic: 'layers', tag: p.lvl, do: () => openCard({ type: 'phr', id: p.id }) }));
  CONTENT.gr.forEach(g => out.push({ t: g.name, sub: g.form, k: `${g.name} ${g.form} grammar`, ic: 'puzzle', tag: g.lvl, do: () => nav('/grammar/' + g.id) }));
  CONTENT.nat.forEach(n => out.push({ t: n.natural, sub: n.understandable, k: `${n.natural} ${n.understandable} ${n.pt} natural`, ic: 'sparkles', tag: n.lvl, do: () => openCard({ type: 'nat', id: n.id }) }));
  S.mist.forEach(m => out.push({ t: m.good || m.q, sub: 'Mistake · ' + m.yours, k: `${m.good} ${m.yours} ${m.q} mistake error`, ic: 'wrench', do: () => nav('/mistakes') }));
  return out;
}
let _pal = null;
function openPalette() {
  _pal = paletteIndex(); let sel = 0, res = [];
  const o = modal(`<input type="text" id="palq" placeholder="Search vocabulary, grammar, phrasal verbs, mistakes, or run a command…" autocomplete="off"><div class="res" id="palr"></div>`, 'pal');
  const draw = () => { $('#palr').innerHTML = res.length ? res.map((r, i) => `<div class="r ${i === sel ? 'on' : ''}" data-i="${i}"><div class="ico">${I(r.ic)}</div><div class="grow"><div class="b">${esc(r.t)}</div>${r.sub ? `<div class="small muted">${esc(r.sub)}</div>` : ''}</div>${r.tag ? lvTag(r.tag) : ''}</div>`).join('') : '<div class="empty small">No results</div>'; };
  const search = q => { q = norm(q); const toks = q.split(' ').filter(Boolean); res = (toks.length ? _pal.map(r => { const k = norm(r.k + ' ' + r.t); let s = 0; for (const t of toks) { if (!k.includes(t)) return null; s += norm(r.t).startsWith(t) ? 3 : norm(r.t).includes(t) ? 2 : 1; } return { r, s }; }).filter(Boolean).sort((a, b) => b.s - a.s).map(x => x.r) : _pal.filter(r => /^(Go to|Start|Practice|Teach|Ask|Open|Review)/.test(r.t))).slice(0, 14); if (/^[a-z][a-z' ]{1,40}$/.test(q)) res.push({ t: 'Look up “' + q + '” online', sub: 'Definitions, Portuguese, synonyms (Wiktionary, Datamuse, MyMemory)', ic: 'globe', do: () => openLookup(q) }); sel = 0; draw(); };
  const q = $('#palq'); q.focus(); search('');
  q.addEventListener('input', () => search(q.value));
  q.addEventListener('keydown', e => { if (e.key === 'ArrowDown') { sel = Math.min(res.length - 1, sel + 1); draw(); e.preventDefault(); } else if (e.key === 'ArrowUp') { sel = Math.max(0, sel - 1); draw(); e.preventDefault(); } else if (e.key === 'Enter' && res[sel]) { closeModal(); res[sel].do(); } });
  $('#palr').addEventListener('click', e => { const r = e.target.closest('.r'); if (r) { const x = res[+r.dataset.i]; closeModal(); x.do(); } });
}
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); if ($('#ovl') && $('#palq')) closeModal(); else if (S && S.onboarded && !$('#runner')) openPalette(); }
  if (e.key === 'Escape') { if ($('#ovl')) closeModal(); }
});
