/* لغتي اللعبة — a playful, offline game built on the content of «لغتي».
   Four worlds: the kids' world (level 1, extra playful), level 2, level 3 and the word-family stories.
   Each day: review → clear today's story station by station → the story challenge. */
(() => {
'use strict';
const D = window.DATA, EMO = window.EMO || {};
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $('#app');
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const rnd = a => a[Math.random() * a.length | 0];
const AR = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
const norm = s => String(s).toLowerCase().replace(/[’‘`]/g, "'").replace(/[“”"]/g, '').replace(/\.(?=\S)/g, '').replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
const bare = s => String(s).replace(/\*\*/g, '');
const noTash = s => String(s).replace(/[ً-ْ]/g, '');
const DAY = () => { const d = new Date(); return Math.floor((d - d.getTimezoneOffset() * 6e4) / 864e5); };
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- icons ---------- */
const P = (d, f) => `<svg class="i${f ? ' f' : ''}" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const I = {
  map: P('<path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6z"/><path d="M9 4v14M15 6v14"/>'),
  chest: P('<rect x="3.5" y="9" width="17" height="11" rx="2"/><path d="M3.5 13h17M5 9V7.5A3.5 3.5 0 0 1 8.5 4h7A3.5 3.5 0 0 1 19 7.5V9"/><rect x="10.5" y="11.5" width="3" height="4" rx="1"/>'),
  joy: P('<rect x="2.5" y="7" width="19" height="11" rx="5.5"/><path d="M7 10.5v4M5 12.5h4"/><circle cx="15.5" cy="11.5" r=".6" fill="currentColor"/><circle cx="17.5" cy="13.5" r=".6" fill="currentColor"/>'),
  me: P('<circle cx="12" cy="8.5" r="4"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>'),
  flame: P('<path d="M12 21.5c-4 0-7-2.8-7-6.7 0-3.4 2.3-5.5 3.7-7.9.5 1.8 1.5 2.8 2.6 3.4C11.8 7.3 13 4.5 15.6 2.5c-.2 3.5 3.9 6.1 3.9 11.6 0 4.6-3 7.4-7.5 7.4z"/>', 1),
  star: P('<path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z"/>', 1),
  spk: P('<path d="M3.5 9.5v5a1 1 0 0 0 1 1h3l4.6 3.8a.8.8 0 0 0 1.4-.6V5.3a.8.8 0 0 0-1.4-.6L7.5 8.5h-3a1 1 0 0 0-1 1z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>'),
  turtle: P('<path d="M4 15c0-4 3.6-7 8-7s8 3 8 7z"/><path d="M20 13.5h1.5a1.5 1.5 0 0 0 0-3H20M6 15l-1 3M18 15l1 3M9 8.5l1.5 6.5M15 8.5 13.5 15"/>'),
  play: P('<path d="M7 4.8v14.4a1 1 0 0 0 1.5.86l12-7.2a1 1 0 0 0 0-1.72l-12-7.2A1 1 0 0 0 7 4.8z"/>', 1),
  pause: P('<rect x="5.5" y="4.5" width="4.5" height="15" rx="1.3"/><rect x="14" y="4.5" width="4.5" height="15" rx="1.3"/>', 1),
  close: P('<path d="M6 6l12 12M18 6 6 18"/>'),
  next: P('<path d="M15 5l-7 7 7 7"/>'),
  prev: P('<path d="M9 5l7 7-7 7"/>'),
  lock: P('<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>'),
  check: P('<path d="m4.5 12.5 5 5L19.5 7"/>'),
  crown: P('<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>', 1),
  bulb: P('<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>'),
  back: P('<path d="M20 12H4M10 6l-6 6 6 6"/>'),
  heart: P('<path d="M12 20.5s-8.5-5-8.5-11A4.5 4.5 0 0 1 12 6.8a4.5 4.5 0 0 1 8.5 2.7c0 6-8.5 11-8.5 11z"/>', 1),
  book: P('<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5zM20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z"/>'),
  sword: P('<path d="M14.5 3.5H20.5V9.5L10 20l-3-3zM5 15l4 4M4 20l2-2"/>'),
  globe: P('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.6 2.5 14.4 0 17M12 3.5c-2.5 2.6-2.5 14.4 0 17"/>'),
};
/* Bubu the owl — the kids' companion (original drawing) */
const OWL = (mood = 'happy', size = 92) => `<svg class="owl ${mood}" width="${size}" height="${size}" viewBox="0 0 120 120" aria-hidden="true">
  <ellipse cx="60" cy="112" rx="34" ry="5" fill="rgb(0 0 0 / .12)"/>
  <path d="M26 46 L20 18 L44 34 Z" fill="#7A4FD6"/><path d="M94 46 L100 18 L76 34 Z" fill="#7A4FD6"/>
  <ellipse cx="60" cy="66" rx="38" ry="42" fill="#8E63F0"/>
  <ellipse cx="60" cy="80" rx="24" ry="24" fill="#FFE3A6"/>
  <path d="M48 76 q4 4 8 0 M58 84 q4 4 8 0 M50 92 q4 4 8 0 M62 70 q4 4 8 0" stroke="#F2B84B" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <path class="wing l" d="M23 62 q-10 18 4 34 q6-14 4-34z" fill="#6B44CF"/><path class="wing r" d="M97 62 q10 18-4 34 q-6-14-4-34z" fill="#6B44CF"/>
  <circle cx="44" cy="50" r="15" fill="#fff"/><circle cx="76" cy="50" r="15" fill="#fff"/>
  ${mood === 'sad' ? '<path d="M36 52 q8-6 16 0 M68 52 q8-6 16 0" stroke="#2A1E5C" stroke-width="4" fill="none" stroke-linecap="round"/>' : mood === 'wow' ? '<circle cx="44" cy="50" r="8" fill="#2A1E5C"/><circle cx="76" cy="50" r="8" fill="#2A1E5C"/><circle cx="47" cy="47" r="3" fill="#fff"/><circle cx="79" cy="47" r="3" fill="#fff"/>' : '<circle class="pupil" cx="46" cy="51" r="6.5" fill="#2A1E5C"/><circle class="pupil" cx="78" cy="51" r="6.5" fill="#2A1E5C"/><circle cx="48" cy="48" r="2.4" fill="#fff"/><circle cx="80" cy="48" r="2.4" fill="#fff"/>'}
  <path d="M55 60 L65 60 L60 69 Z" fill="#FFB020"/>
  <circle cx="33" cy="64" r="5" fill="#FF8FB1" opacity=".7"/><circle cx="87" cy="64" r="5" fill="#FF8FB1" opacity=".7"/>
  <path d="M46 106 l-4 6 M52 106 l0 7 M68 106 l0 7 M74 106 l4 6" stroke="#FFB020" stroke-width="4" stroke-linecap="round"/>
</svg>`;

/* ---------- worlds, stories, words ---------- */
const WORLDS = [
  { k: 'A', name: 'عالم الصغار', sub: 'المستوى الأول · مبتدئ', icon: '🧸', kid: true, list: D.L.A || [] },
  { k: 'B', name: 'جزيرة المغامرين', sub: 'المستوى الثاني · متوسط', icon: '🏝️', list: D.L.B || [] },
  { k: 'C', name: 'قمّة الأبطال', sub: 'المستوى الثالث · متقدّم', icon: '🏔️', list: D.L.C || [] },
  { k: 'F', name: 'عائلات الكلمات', sub: 'قصص حسب الموضوع', icon: '👨‍👩‍👧', list: D.F || [] },
].filter(w => w.list.length);
const WBY = Object.fromEntries(WORLDS.map(w => [w.k, w]));
const PRON = new Map();
Object.values(D.wl || {}).forEach(l => l.forEach(r => { if (!PRON.has(r[0])) PRON.set(r[0], r[1]); }));
(D.fam || []).forEach(f => f.w.forEach(r => { if (!PRON.has(r[0])) PRON.set(r[0], r[1]); }));
const W = []; const STORY = new Map();
WORLDS.forEach(wd => wd.list.forEach((s, si) => {
  s.wk = wd.k; s.ix = si; s.words = []; STORY.set(s.id, s);
  const seen = new Set();
  s.w.forEach(([w, m]) => { const k = norm(w); if (!k || seen.has(k)) return; seen.add(k); const i = W.length; W.push({ i, w, m, p: PRON.get(w) || '', s: s.id, k, emo: wd.k === 'A' || wd.k === 'F' ? EMO[w] || EMO[w.toLowerCase()] || '' : '' }); s.words.push(i); });
}));
const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function exOf(i) {
  const w = W[i]; if (w._ex !== undefined) return w._ex;
  const s = STORY.get(w.s); const core = bare(w.w).replace(/\s*=.*$/, '').trim(); let found = null;
  if (core.length > 1) {
    const re = new RegExp('(^|[^A-Za-z])(' + reEsc(core).replace(/’|'/g, "['’]") + ')(?![A-Za-z])', 'i');
    for (const [en, ar] of s.p) { const t = bare(en), m = re.exec(t); if (m) { const at = m.index + m[1].length; found = { before: t.slice(0, at), span: m[2], after: t.slice(at + m[2].length), ar }; break; } }
  }
  return w._ex = found;
}
const exHtml = (i, gap) => { const e = exOf(i); if (!e) return ''; return `<div class="ex">${esc(e.before)}${gap ? '<span class="gap">?</span>' : `<b>${esc(e.span)}</b>`}${esc(e.after)}</div>`; };
const canBuild = i => /^[a-z]{3,9}$/i.test(W[i].w);
function stations(s) {
  const ws = s.words, k = Math.max(1, Math.min(6, Math.round(ws.length / 8.5))); const out = []; let at = 0;
  for (let g = 0; g < k; g++) { const sz = Math.floor(ws.length / k) + (g < ws.length % k ? 1 : 0); out.push(ws.slice(at, at + sz)); at += sz; }
  return out;
}

/* ---------- saved progress ---------- */
const KEY = 'lughati-game.v1';
const DEF = { w: {}, h: [], days: {}, streak: 0, lastDay: 0, xp: 0, gems: 20, stars: {}, done: {}, av: 0, own: [0, 1], best: {}, sfx: true, wrate: 1, srate: 1, today: null, bestStreak: 0, xpd: {}, world: null, stk: [], cf: {} };
let G = Object.assign({}, DEF);
try { const r = JSON.parse(localStorage.getItem(KEY) || 'null'); if (r) G = Object.assign({}, DEF, r); } catch (e) { }
let saveT = 0;
function save() { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(G)); } catch (e) { } }, 150); }
const wkey = i => W[i].s + ':' + W[i].k;
const ws = i => G.w[wkey(i)] || (G.w[wkey(i)] = { st: 0, due: 0, lp: 0, ok: [0, 0, 0], bad: [0, 0, 0], seen: 0 });
const wget = i => G.w[wkey(i)];
const known = i => !!wget(i)?.seen;
const IV = [0, 1, 3, 7, 14, 30, 60, 120, 240];
function wordScore(i) { const x = wget(i); if (!x) return 0; const b = x.bad[0] + x.bad[1] + x.bad[2], o = x.ok[0] + x.ok[1] + x.ok[2]; return x.lp * 2 + b * 1.5 - o * 0.4 + (x.st <= 1 && x.seen ? 1 : 0); }
const isWeak = i => { const x = wget(i); return !!x && x.seen && (x.lp >= 2 || wordScore(i) >= 3); };
function bumpDay() { const d = DAY(); G.days[d] = (G.days[d] || 0) + 1; if (G.lastDay !== d) { G.streak = G.lastDay === d - 1 ? G.streak + 1 : 1; G.lastDay = d; } G.bestStreak = Math.max(G.bestStreak || 0, G.streak); }
function record(i, skill, ok, opts = {}) {
  const x = ws(i), d = DAY(); bumpDay();
  if (ok) x.ok[skill]++; else x.bad[skill]++;
  if (opts.noSrs) { save(); return; }
  if (ok) { if (!opts.hinted) x.st = Math.min(IV.length - 1, x.st + 1); x.due = d + IV[Math.max(1, x.st)] * (opts.hinted ? 0.5 : 1) | 0; }
  else { x.lp++; x.st = Math.max(1, x.st - 2); x.due = d; }
  save();
}
function meet(i) { const x = ws(i); if (!x.seen) { x.seen = 1; x.due = DAY(); bumpDay(); save(); } }
function weakSkill(i) { const x = ws(i); let best = 0, bv = -1; for (let k = 0; k < 3; k++) { const v = (x.bad[k] + .6) / (x.ok[k] + x.bad[k] + 1.2) + Math.random() * .25; if (v > bv) { bv = v; best = k; } } return best; }
const LEVELS = ['نجم صغير', 'مستكشف', 'مغامر', 'رحّالة', 'فارس الكلمات', 'بطل', 'أسطورة'];
function lvlInfo() { let l = 1, need = 120, x = G.xp; while (x >= need) { x -= need; l++; need = 120 + (l - 1) * 40; } return { l, x, need, rank: LEVELS[Math.min(LEVELS.length - 1, (l - 1) / 4 | 0)] }; }
function addXP(n) { G.xp += n; const d = DAY(); G.xpd[d] = (G.xpd[d] || 0) + n; const keep = Object.keys(G.xpd).map(Number).filter(k => k > d - 14); G.xpd = Object.fromEntries(keep.map(k => [k, G.xpd[k]])); save(); }
const AVS = [['🦉', 0], ['🐼', 0], ['🐸', 40], ['🐯', 60], ['🐨', 80], ['🦁', 100], ['🐙', 130], ['🦊', 160], ['🐧', 200], ['🦄', 260], ['🐲', 340], ['🚀', 450]];
const myAv = () => AVS[G.av]?.[0] || '🦉';
const streakNow = () => G.lastDay >= DAY() - 1 ? G.streak : 0;
const STICKERS = '🦄🐳🦋🌈🍩🚀🐙🦖🍉🎈🐝🌻🍭🐢🦜🎠🧁🐬🍦🦒🐞🌟🎡🐨🦔🍓🐠🪁🦩🍪🐣🌵🦕🐿️🍒🎪🐌🦀🍕🛸'.match(/\p{Extended_Pictographic}(️)?/gu);

/* ---------- daily mission ---------- */
const curWorld = () => WBY[G.world] || WORLDS[0];
const isKid = () => !!curWorld().kid;
const storyDone = id => !!G.done[id];
function firstOpen(wd) { for (const s of wd.list) if (!storyDone(s.id)) return s; return wd.list[wd.list.length - 1]; }
function ensureToday() {
  const d = DAY(), wd = curWorld();
  if (G.today && G.today.d === d && G.today.wk === wd.k && STORY.has(G.today.id)) return G.today;
  const s = firstOpen(wd);
  const rev = Object.keys(G.w).filter(k => G.w[k].seen && G.w[k].due <= d).map(k => { const [sid, wk] = [k.slice(0, k.indexOf(':')), k.slice(k.indexOf(':') + 1)]; const st = STORY.get(sid); return st ? st.words.find(i => W[i].k === wk) : undefined; })
    .filter(i => i != null && W[i].s !== s.id).sort((a, b) => wordScore(b) - wordScore(a)).slice(0, isKid() ? 20 : 36);
  G.today = { d, wk: wd.k, id: s.id, rev, rd: 0 }; save();
  return G.today;
}
function missionSteps() {
  const T = ensureToday(), s = STORY.get(T.id), st = stations(s), out = [];
  if (T.rev.length) out.push({ kind: 'rev', title: isKid() ? 'سلّم على كلمات امبارح 👋' : 'مراجعة القديم', sub: `${AR(Math.min(T.rd, T.rev.length))} من ${AR(T.rev.length)} كلمة`, done: T.rd >= T.rev.length });
  st.forEach((g, k) => out.push({ kind: 'st', k, title: `المحطة ${AR(k + 1)}`, sub: `${AR(g.length)} كلمات جديدة`, done: !!G.stars[s.id + '-' + k] }));
  out.push({ kind: 'boss', title: isKid() ? 'وقت القصة! 🎬' : 'تحدي القصة', sub: 'اسمع القصة كاملة وجاوب', done: storyDone(s.id) });
  return out;
}
const stationOpen = (s, k) => k === 0 || !!G.stars[s.id + '-' + (k - 1)];
const bossOpen = s => stations(s).every((_, k) => G.stars[s.id + '-' + k]);
const chapterOpen = s => { const l = WBY[s.wk].list; return s.ix === 0 || storyDone(l[s.ix - 1].id) || stations(s).some((_, k) => G.stars[s.id + '-' + k]) || s.id === ensureToday().id; };

/* ---------- audio ---------- */
const enSay = w => String(w).replace(/-[^-]*-/g, '').replace(/\s\+.*$/, '').replace(/\bsb\b/g, 'somebody').replace(/\bsth\b/g, 'something').replace(/[؀-ۿ()\[\]]/g, '').replace(/\s+/g, ' ').trim().replace(/^[ ,.;:]+|[ ,.;:]+$/g, '');
const enKey = w => enSay(w).toLowerCase().replace(/’/g, "'").replace(/[^a-z0-9' -]/g, ' ').trim();
const AU = D.au || { e: {} };
const PACKS = {}, PWAIT = {}, URLS = {};
window.__wp = (name, obj) => { PACKS[name] = obj; (PWAIT[name] || []).forEach(f => f()); delete PWAIT[name]; };
function loadPack(name) { return new Promise(res => { if (PACKS[name]) return res(); if (PWAIT[name]) return PWAIT[name].push(res); PWAIT[name] = [res]; const sc = document.createElement('script'); sc.src = 'wp/' + name + '.js'; sc.onerror = () => { (PWAIT[name] || []).forEach(f => f()); delete PWAIT[name]; }; document.head.appendChild(sc); }); }
async function clipUrl(i) {
  if (URLS[i]) return URLS[i];
  const id = AU.e[enKey(W[i].w)]; if (!id) return null; const name = 'e' + id[0]; await loadPack(name);
  const b = PACKS[name]?.[id]; if (!b) return null;
  const bin = atob(b), u = new Uint8Array(bin.length); for (let j = 0; j < bin.length; j++) u[j] = bin.charCodeAt(j);
  return URLS[i] = URL.createObjectURL(new Blob([u], { type: 'audio/webm' }));
}
const prefetch = ids => new Set(ids.map(i => AU.e[enKey(W[i].w)]).filter(Boolean).map(id => 'e' + id[0])).forEach(loadPack);
const au = new Audio(); au.preload = 'auto';
let sayTok = 0, enVoice = null;
function pickVoices() { try { const v = speechSynthesis.getVoices(); enVoice = v.find(x => /^en[-_]US/i.test(x.lang) && /google/i.test(x.name)) || v.find(x => /^en[-_]US/i.test(x.lang)) || v.find(x => /^en/i.test(x.lang)) || null; } catch (e) { } }
try { pickVoices(); speechSynthesis.onvoiceschanged = pickVoices; } catch (e) { }
function tts(text, rate) {
  return new Promise(res => {
    const C = window.Capacitor?.Plugins?.TextToSpeech; if (C) { C.speak({ text, lang: 'en-US', rate, volume: 1, category: 'ambient' }).then(res, res); return; }
    try { const u = new SpeechSynthesisUtterance(text); if (enVoice) u.voice = enVoice; u.lang = enVoice ? enVoice.lang : 'en-US'; u.rate = rate; u.onend = res; u.onerror = res; speechSynthesis.speak(u); setTimeout(res, 6000); } catch (e) { res(); }
  });
}
function stopAudio() { sayTok++; try { au.pause(); } catch (e) { } try { speechSynthesis.cancel(); } catch (e) { } }
async function say(i, rate) {
  rate = rate || G.wrate || 1; stopAudio(); const my = sayTok;
  const url = await clipUrl(i); if (my !== sayTok) return;
  if (!url) return tts(enSay(W[i].w), .85 * rate);
  return new Promise(res => { let done = false; const fin = () => { if (!done) { done = true; res(); } }; au.onended = fin; au.onerror = fin; au.src = url; au.playbackRate = rate; au.play().catch(fin); setTimeout(fin, 7000); });
}
const sayBtn = (i, cls = '') => `<button class="say ${cls}" type="button" data-say="${i}" aria-label="استمع">${I.spk}</button>`;
document.addEventListener('click', e => {
  const b = e.target.closest('[data-say]'); if (!b) return; e.stopPropagation();
  b.classList.add('playing'); say(+b.dataset.say, b.dataset.rate ? +b.dataset.rate : undefined).then(() => b.classList.remove('playing'));
}, true);
let AC = null;
function tone(f, t0, dur, type = 'sine', vol = .16) {
  if (!G.sfx) return; try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume();
    const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + t0;
    o.type = type; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .015); g.gain.exponentialRampToValueAtTime(.0008, t + dur);
    o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + dur + .05);
  } catch (e) { }
}
const SFX = {
  ok: () => { tone(660, 0, .14, 'triangle'); tone(990, .09, .22, 'triangle'); },
  no: () => { tone(300, 0, .18, 'sine', .1); tone(240, .12, .22, 'sine', .08); },
  pop: () => { tone(880, 0, .08, 'sine', .12); tone(1320, .03, .08, 'sine', .08); },
  tap: () => tone(520, 0, .06, 'triangle', .08),
  combo: () => [523, 659, 784, 1046].forEach((f, k) => tone(f, k * .07, .2, 'triangle', .13)),
  win: () => [523, 659, 784, 1046, 1318].forEach((f, k) => tone(f, k * .11, .35, 'triangle', .14)),
  flip: () => tone(400, 0, .07, 'sine', .08),
  chomp: () => { tone(180, 0, .07, 'square', .08); tone(140, .1, .07, 'square', .08); tone(200, .2, .1, 'triangle', .1); },
};

/* ---------- fx ---------- */
function toast(msg) { $$('.toast').forEach(t => t.remove()); const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2400); }
function flyXP(n, el) { if (reduce || !n) return; const r = (el || document.body).getBoundingClientRect(); const f = document.createElement('div'); f.className = 'fly'; f.textContent = '+' + n; f.style.left = (r.left + r.width / 2 - 20) + 'px'; f.style.top = (el ? r.top : innerHeight / 2) + 'px'; document.body.appendChild(f); setTimeout(() => f.remove(), 950); }
function burst(txt) { const b = document.createElement('div'); b.className = 'burst'; b.textContent = txt; document.body.appendChild(b); setTimeout(() => b.remove(), 1150); }
function confetti() {
  if (reduce) return; const c = document.createElement('canvas'); c.className = 'confetti'; document.body.appendChild(c);
  const dpr = devicePixelRatio || 1; c.width = innerWidth * dpr; c.height = innerHeight * dpr; const x = c.getContext('2d'); x.scale(dpr, dpr);
  const cs = getComputedStyle(document.documentElement), cols = ['--grape', '--mint', '--sun', '--coral', '--sky'].map(v => cs.getPropertyValue(v).trim());
  const ps = Array.from({ length: 140 }, () => ({ x: innerWidth / 2 + (Math.random() - .5) * 120, y: innerHeight * .35, vx: (Math.random() - .5) * 13, vy: -Math.random() * 13 - 4, r: Math.random() * 6 + 4, a: Math.random() * 6, va: (Math.random() - .5) * .4, c: rnd(cols) }));
  const t0 = performance.now();
  (function f(t) { x.clearRect(0, 0, innerWidth, innerHeight); ps.forEach(p => { p.vy += .32; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va; x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.fillStyle = p.c; x.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); x.restore(); }); if (t - t0 < 2600) requestAnimationFrame(f); else c.remove(); })(t0);
}
const starsRow = n => `<span class="stars" aria-label="${n} نجوم">${[0, 1, 2].map(k => `<span class="${k < n ? 'on' : 'off'}">${I.star}</span>`).join('')}</span>`;
const PRAISE_K = ['برافو يا بطل!', 'شاطر!', 'ممتاز!', 'يا سلام عليك!', 'عبقري!', 'هايل!', 'رائع!'];
const PRAISE = ['ممتاز!', 'برافو!', 'عاش!', 'كفو!', 'صح عليك!', 'يا سلام!', 'بطل!'];
const SOFT_K = ['ولا يهمك، جرّب كمان!', 'قريبة كتير!', 'بتصير معك!', 'مش مشكلة يا بطل'];
const SOFT = ['قريبة!', 'ولا يهمك', 'بتصير معك', 'مش مشكلة'];

/* ---------- shell ---------- */
let TAB = 'map', VIEW = null;
try { const h = location.hash.slice(1); if (['map', 'review', 'arcade', 'me'].includes(h)) TAB = h; } catch (e) { }
const TABS = [['map', 'الرحلة', I.map], ['review', 'المراجعة', I.chest], ['arcade', 'الألعاب', I.joy], ['me', 'أنا', I.me]];
function dueAll() { const d = DAY(); return W.filter(w => { const x = G.w[w.s + ':' + w.k]; return x && x.seen && x.due <= d; }).map(w => w.i); }
function shell(inner) {
  document.body.classList.toggle('kid', isKid());
  const L = lvlInfo(), sk = streakNow(), due = dueAll().length;
  app.innerHTML = `<header class="top"><div class="in">
      <button class="ava" type="button" data-tab="me" aria-label="ملفي">${myAv()}</button>
      <div class="lvl grow"><b>مستوى ${AR(L.l)}</b><small>${L.rank}</small></div>
      <span class="chipst ${sk ? 'fire' : 'cold'}" title="أيام متتالية">${I.flame}<span class="num">${sk}</span></span>
      <span class="chipst gem" title="نجوم">${I.star}<span class="num">${G.gems}</span></span>
    </div></header>
    <main class="wrap" id="main">${inner}</main>
    <nav class="tabs"><div class="in">${TABS.map(([k, n, ic]) => `<button class="tab" type="button" data-tab="${k}" ${TAB === k ? 'aria-current="page"' : ''}><span class="ti">${ic}</span>${n}${k === 'review' && due ? `<span class="badge">${due > 99 ? '99+' : due}</span>` : ''}</button>`).join('')}</div></nav>`;
  $$('[data-tab]').forEach(b => b.onclick = () => { TAB = b.dataset.tab; try { history.replaceState(null, '', '#' + TAB); } catch (e) { } render(); scrollTo(0, 0); });
}
function render() { if (!G.world) return welcome(); ({ map: viewMap, review: viewReview, arcade: viewArcade, me: viewMe }[TAB] || viewMap)(); }

/* first run: pick your world */
function welcome() {
  document.body.classList.add('kid');
  app.innerHTML = `<main class="wrap" style="padding-top:24px"><section class="hello">${OWL('happy', 130)}<div class="bubble">أهلاً! أنا <b>بوبو</b> 🦉<br>رح نتعلّم إنجليزي ونحن بنلعب. من وين بدك نبدأ؟</div></section>
    <section class="worlds">${WORLDS.map((w, k) => `<button class="world h${k}" type="button" data-w="${w.k}"><span class="wi">${w.icon}</span><span class="grow"><b>${w.name}</b><small>${w.sub} · ${AR(w.list.length)} قصة</small></span><span class="go">←</span></button>`).join('')}</section></main>`;
  $$('[data-w]').forEach(b => b.onclick = () => { G.world = b.dataset.w; G.today = null; save(); SFX.win(); confetti(); render(); });
}

/* ---------- journey ---------- */
function missionCard() {
  const T = ensureToday(), s = STORY.get(T.id), steps = missionSteps(), done = steps.filter(x => x.done).length, nowK = steps.findIndex(x => !x.done), wd = curWorld();
  const C = 2 * Math.PI * 27, pc = done / steps.length, hue = 'h' + (s.ix % 5);
  return `<section class="mission ${hue}">
    ${isKid() ? `<div class="kidhead">${OWL(nowK < 0 ? 'wow' : 'happy', 78)}<div class="bubble sm">${nowK < 0 ? 'يا بطل! خلّصت قصة اليوم 🎉' : nowK <= 0 ? 'يلا نلعب ونتعلّم! 🎈' : `باقي ${AR(steps.length - done)} خطوات وبتخلص! 💪`}</div></div>` : ''}
    <div class="row" style="position:relative;z-index:1;align-items:flex-start">
      <div class="grow"><div class="k">${wd.icon} ${wd.name} · القصة ${AR(s.ix + 1)} من ${AR(wd.list.length)}</div><h1>${esc(noTash(s.ar))}</h1><div class="ttl">${esc(s.en)}</div></div>
      <div class="ring"><svg viewBox="0 0 66 66"><circle cx="33" cy="33" r="27" fill="none" stroke="rgb(255 255 255 / .3)" stroke-width="8"/><circle cx="33" cy="33" r="27" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pc)}"/></svg><span>${done}/${steps.length}</span></div>
    </div>
    <div class="pips">${steps.map((x, k) => `<span class="${x.done ? 'd' : k === nowK ? 'n' : ''}"></span>`).join('')}</div>
    ${nowK >= 0 ? (() => { const x = steps[nowK]; return `<div class="steps"><button class="step now" type="button" data-step="${nowK}"><span class="sc">${x.kind === 'rev' ? I.chest : x.kind === 'boss' ? I.crown : AR(x.k + 1)}</span><span class="grow"><b>${x.kind === 'rev' ? 'أول إشي: ' : 'هلّق: '}${x.title}</b><small>${x.sub}</small></span><span class="go">يلا ←</span></button></div>`; })() : `<div class="celebrate"><span style="font-size:30px">🏆</span><div class="grow">بكرة بنراجع كلماتها وبنبدأ قصة جديدة.</div></div>`}
  </section>`;
}
function startStep(k) {
  const T = ensureToday(), s = STORY.get(T.id), x = missionSteps()[k]; if (!x) return;
  if (x.kind === 'rev') return startReview(T.rd < T.rev.length ? T.rev.slice(T.rd, T.rd + 10) : T.rev.slice(0, 10), true);
  if (x.kind === 'st') return stationOpen(s, x.k) ? startStation(s, x.k) : toast('خلّص المحطة اللي قبلها أول');
  if (!bossOpen(s)) return toast('القصة بتفتح لما تخلص كل المحطات');
  theatre(s);
}
function mapHtml(s) {
  const st = stations(s), rows = st.length + 1, X = [50, 74, 60, 32, 22, 44, 68];
  let cur = st.findIndex((_, k) => !G.stars[s.id + '-' + k]); if (cur < 0) cur = storyDone(s.id) ? -1 : st.length;
  const pts = Array.from({ length: rows }, (_, r) => [100 - X[r % X.length], r * 104 + 45]);
  let d = `M${pts[0][0]} ${pts[0][1]}`; for (let k = 1; k < pts.length; k++) { const [a, b] = pts[k - 1], [c, e] = pts[k], m = (b + e) / 2; d += ` C${a} ${m} ${c} ${m} ${c} ${e}`; }
  const deco = isKid() ? ['🌳', '🌼', '🍄', '🌷', '🐞', '🌻', '🦋'] : [];
  const node = (r, inner, cls, lab, extra, attrs) => `<div class="node-row">${deco.length ? `<span class="deco" style="${X[r % X.length] > 50 ? 'left' : 'right'}:8%">${deco[(r + s.ix) % deco.length]}</span>` : ''}<div class="node ${cls}" style="right:${X[r % X.length]}%">${extra}<button class="nb" type="button" ${attrs}>${inner}</button><span class="lab">${lab}</span></div></div>`;
  const icon = k => isKid() ? ['🍎', '🎈', '🐶', '🚗', '⭐', '🎁'][k % 6] : AR(k + 1);
  return `<div class="map h${s.ix % 5}" style="height:${rows * 104}px"><svg class="path" viewBox="0 0 100 ${rows * 104}" preserveAspectRatio="none" aria-hidden="true"><path d="${d}" fill="none" stroke="var(--line)" stroke-width="10" stroke-linecap="round" stroke-dasharray="2 16" vector-effect="non-scaling-stroke"/></svg>
    ${st.map((g, k) => { const v = G.stars[s.id + '-' + k] || 0, open = stationOpen(s, k), isCur = k === cur;
      return node(k, open ? icon(k) : I.lock, `${open ? '' : 'lock'} ${isCur ? 'cur' : ''}`, v ? starsRow(v) : `المحطة ${AR(k + 1)}`, isCur ? (isKid() ? `<span class="me">${myAv()}</span>` : `<span class="tip">ابدأ</span>`) : '', `data-st="${k}" aria-label="المحطة ${k + 1}"`); }).join('')}
    ${node(st.length, bossOpen(s) ? (isKid() ? '🎬' : I.crown) : I.lock, `boss ${bossOpen(s) ? '' : 'lock'} ${cur === st.length ? 'cur' : ''}`, storyDone(s.id) ? 'تمّ ✓' : (isKid() ? 'وقت القصة' : 'تحدي القصة'), cur === st.length ? `<span class="tip">التحدي!</span>` : '', `data-boss="1" aria-label="تحدي القصة"`)}
  </div>`;
}
function viewMap() {
  const T = ensureToday(), wd = curWorld(); if (!VIEW || STORY.get(VIEW).wk !== wd.k) VIEW = T.id;
  const s = STORY.get(VIEW), L = wd.list;
  shell(`${missionCard()}
    <section class="sec">
      <div class="chap">
        <button class="nav" type="button" id="cprev" ${s.ix <= 0 ? 'disabled' : ''} aria-label="القصة السابقة">${I.prev}</button>
        <div class="mid"><b>القصة ${AR(s.ix + 1)}${storyDone(s.id) ? ' · ✓' : ''}</b><span class="en">${esc(s.en)}</span></div>
        <button class="nav" type="button" id="cnext" ${s.ix >= L.length - 1 ? 'disabled' : ''} aria-label="القصة التالية">${I.next}</button>
      </div>
      ${chapterOpen(s) ? mapHtml(s) : `<div class="panel" style="text-align:center;display:grid;gap:8px;justify-items:center"><span style="font-size:40px">🔒</span><b>هالقصة مقفلة لسا</b><span class="muted">بتنفتح لما تخلّص القصة اللي قبلها.</span></div>`}
      <div class="row" style="justify-content:center;flex-wrap:wrap"><button class="btn ghost sm" type="button" id="story-read">${I.book} اسمع القصة</button><button class="btn ghost sm" type="button" id="switch">${I.globe} غيّر العالم</button></div>
    </section>`);
  $$('[data-step]').forEach(b => b.onclick = () => startStep(+b.dataset.step));
  $('#cprev').onclick = () => { VIEW = L[s.ix - 1].id; render(); };
  $('#cnext').onclick = () => { VIEW = L[s.ix + 1].id; render(); };
  $$('[data-st]').forEach(b => b.onclick = () => { const k = +b.dataset.st; if (!stationOpen(s, k)) return toast('خلّص المحطة اللي قبلها أول'); startStation(s, k); });
  $$('[data-boss]').forEach(b => b.onclick = () => { if (!bossOpen(s)) return toast('القصة بتفتح لما تخلص كل المحطات'); theatre(s); });
  $('#story-read').onclick = () => { if (!chapterOpen(s)) return toast('القصة مقفلة لسا'); theatre(s, true); };
  $('#switch').onclick = worldSheet;
}
function worldSheet() {
  const sc = document.createElement('div'); sc.className = 'scrim'; const p = document.createElement('div'); p.className = 'pop-w';
  p.innerHTML = `<div class="in"><h2>اختار العالم</h2>${WORLDS.map((w, k) => { const dn = w.list.filter(s => storyDone(s.id)).length; return `<button class="world h${k} ${w.k === curWorld().k ? 'on' : ''}" type="button" data-w="${w.k}"><span class="wi">${w.icon}</span><span class="grow"><b>${w.name}</b><small>${w.sub} · ${AR(dn)}/${AR(w.list.length)}</small></span></button>`; }).join('')}</div>`;
  document.body.append(sc, p); const off = () => { sc.remove(); p.remove(); }; sc.onclick = off;
  $$('[data-w]', p).forEach(b => b.onclick = () => { G.world = b.dataset.w; G.today = null; VIEW = null; save(); off(); SFX.tap(); render(); });
}

/* ---------- review ---------- */
function viewReview() {
  const due = dueAll(), weak = W.filter(w => isWeak(w.i)).map(w => w.i).sort((a, b) => wordScore(b) - wordScore(a));
  const learned = Object.values(G.w).filter(x => x.seen).length, mastered = Object.values(G.w).filter(x => x.st >= 5).length;
  shell(`<section class="panel chest ${due.length ? 'ready' : ''}">
      <div class="big">${due.length ? '🎁' : '📦'}</div>
      <div style="display:grid;gap:6px"><h2 style="font-size:22px">${due.length ? `${AR(due.length)} كلمة جاهزة للمراجعة` : 'الصندوق فاضي هلّق'}</h2>
      <span class="muted">${due.length ? 'كل جولة ١٠ كلمات بألعاب سريعة. كل كلمة بتثبّتها بتبعد مراجعتها أكتر.' : 'رجعلي بكرة! الكلمات بترجع لما يجي وقتها.'}</span>
      ${due.length ? `<button class="btn sm" type="button" id="open-chest" style="justify-self:start">افتح الصندوق</button>` : ''}</div>
    </section>
    <section class="kpis"><div class="kpi"><b>${learned}</b><span>كلمة تعرّفت عليها</span></div><div class="kpi"><b>${mastered}</b><span>كلمة محفوظة</span></div><div class="kpi"><b>${weak.length}</b><span>كلمة بدها شغل</span></div></section>
    ${weak.length ? `<section class="sec"><div class="sec-h"><h2>كلمات بتعاندك</h2><button class="btn sm h3" type="button" id="drill-weak">درّبها</button></div>
      <div class="wlist">${weak.slice(0, 12).map(i => `<div class="wl">${sayBtn(i, 'sm')}${W[i].emo ? `<span class="wemo">${W[i].emo}</span>` : ''}<span class="w en grow">${esc(W[i].w)}</span><span class="m">${esc(W[i].m)}</span></div>`).join('')}</div></section>` : ''}`);
  const oc = $('#open-chest'); if (oc) oc.onclick = () => startReview(shuffle(due.sort((a, b) => wordScore(b) - wordScore(a)).slice(0, 20)).slice(0, 10));
  const dw = $('#drill-weak'); if (dw) dw.onclick = () => startReview(weak.slice(0, 10));
}

/* ---------- arcade ---------- */
function pool(min = 12, needEmo) {
  let p = W.filter(w => known(w.i) && (!needEmo || w.emo)).map(w => w.i);
  if (p.length < min) { const s = STORY.get(ensureToday().id); const extra = [...s.words, ...curWorld().list[0].words].filter(i => !needEmo || W[i].emo); p = [...new Set([...p, ...extra])]; }
  if (needEmo && p.length < 8) p = [...new Set([...p, ...W.filter(w => w.emo).slice(0, 40).map(w => w.i)])];
  return p;
}
function viewArcade() {
  const b = k => G.best[k] ? `<span class="best">أفضل: ${G.best[k]}</span>` : '';
  shell(`<section class="sec"><div class="sec-h"><h2>صالة الألعاب</h2></div>
    <p class="muted" style="margin:0">ألعاب سريعة بالكلمات اللي تعلّمتها. كل لعبة بتعطيك نجوم.</p>
    <div class="games">
      <button class="game h2" type="button" data-g="balloon">${b('balloon')}<span class="gi">🎈</span><span><b>البالونات</b><small>فقّع البالون اللي فيه الكلمة الصح</small></span></button>
      <button class="game h1" type="button" data-g="feed">${b('feed')}<span class="gi">👾</span><span><b>طعمي الوحش</b><small>الوحش جوعان! طعميه الكلمة الصح</small></span></button>
      <button class="game h4" type="button" data-g="pic">${b('pic')}<span class="gi">🖼️</span><span><b>اسمع والقط الصورة</b><small>اسمع الكلمة واضغط على صورتها</small></span></button>
      <button class="game h0" type="button" data-g="mem">${b('mem')}<span class="gi">🃏</span><span><b>لعبة الذاكرة</b><small>اقلب الكروت ولاقي كل كلمة مع صورتها</small></span></button>
      <button class="game h3" type="button" data-g="rain">${b('rain')}<span class="gi">🌧️</span><span><b>مطر الكلمات</b><small>التقط الكلمة الصح قبل ما توقع</small></span></button>
      <button class="game h2" type="button" data-g="rush" style="--h:var(--coral);--hd:var(--coral-d);--hon:#fff">${b('rush')}<span class="gi">⚡</span><span><b>سباق الدقيقة</b><small>صح ولا غلط؟ بـ٦٠ ثانية</small></span></button>
      <button class="game h1" type="button" data-g="build" style="--h:var(--grape);--hd:var(--grape-d)">${b('build')}<span class="gi">🧩</span><span><b>ركّب الكلمة</b><small>رتّب الحروف</small></span></button>
      <button class="game h4" type="button" data-g="ear" style="--h:var(--mint);--hd:var(--mint-d)">${b('ear')}<span class="gi">🎧</span><span><b>تحدي السمع</b><small>اسمع واختار المعنى</small></span></button>
    </div></section>`);
  $$('[data-g]').forEach(btn => btn.onclick = () => {
    const g = btn.dataset.g, p = shuffle(pool());
    if (g === 'rush') return rush(p);
    if (g === 'rain') return rain(p);
    if (g === 'mem') return memory(shuffle(pool(6, true)));
    if (g === 'pic') { const q = shuffle(pool(8, true)).slice(0, 10).map(i => ({ t: 'pic', i })); return play({ kind: 'arcade', key: 'pic', hue: 'h4', q }); }
    if (g === 'feed') return play({ kind: 'arcade', key: 'feed', hue: 'h1', q: p.slice(0, 10).map(i => ({ t: 'feed', i })) });
    if (g === 'balloon') return play({ kind: 'arcade', key: 'balloon', hue: 'h2', q: p.slice(0, 10).map(i => ({ t: 'balloon', i })) });
    if (g === 'ear') return play({ kind: 'arcade', key: 'ear', hue: 'h0', q: p.slice(0, 10).map(i => ({ t: 'listen', i })) });
    const bp = p.filter(canBuild); return play({ kind: 'arcade', key: 'build', hue: 'h0', q: (bp.length >= 6 ? bp : p).slice(0, 8).map(i => ({ t: canBuild(i) ? 'build' : 'balloon', i })) });
  });
}

/* ---------- me ---------- */
function viewMe() {
  const L = lvlInfo(), learned = Object.values(G.w).filter(x => x.seen).length, mastered = Object.keys(G.done).length;
  const d = DAY(), week = Array.from({ length: 7 }, (_, k) => G.xpd[d - 6 + k] || 0), mx = Math.max(60, ...week);
  const dn = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
  shell(`<section class="panel" style="display:grid;gap:12px;justify-items:center;text-align:center">
      <div style="font-size:72px;line-height:1">${myAv()}</div>
      <div><h1 style="font-size:24px">${L.rank} · مستوى ${AR(L.l)}</h1><span class="muted num">${L.x} / ${L.need} XP للمستوى الجاي</span></div>
      <div class="bar h2" style="width:100%"><i style="width:${Math.round(100 * L.x / L.need)}%"></i></div>
    </section>
    <section class="kpis"><div class="kpi"><b>${mastered}</b><span>قصة خلّصتها</span></div><div class="kpi"><b>${learned}</b><span>كلمة تعلّمتها</span></div><div class="kpi"><b>${Math.max(G.bestStreak || 0, streakNow())}</b><span>أطول سلسلة أيام</span></div></section>
    <section class="sec"><div class="sec-h"><h2>ألبوم الملصقات</h2><span class="muted num">${G.stk.length}/${STICKERS.length}</span></div>
      <div class="album">${STICKERS.map(e => `<span class="stk ${G.stk.includes(e) ? 'got' : ''}">${G.stk.includes(e) ? e : '?'}</span>`).join('')}</div>
      <p class="muted" style="margin:0;font-size:14.5px">كل محطة بتخلصها بتعطيك ملصق جديد!</p></section>
    <section class="panel" style="display:grid;gap:10px"><b>نقاطك هالأسبوع</b>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:8px;align-items:end;height:110px">${week.map((v, k) => `<div style="display:grid;gap:4px;justify-items:center;align-content:end;height:100%"><span class="num" style="font-size:12px;color:var(--muted)">${v || ''}</span><div style="width:100%;border-radius:8px;height:${Math.max(6, Math.round(76 * v / mx))}px;background:${k === 6 ? 'var(--grape)' : 'color-mix(in srgb,var(--grape) 35%,var(--sunk))'}"></div><span style="font-size:11.5px;color:var(--muted)">${dn[new Date((d - 6 + k) * 864e5).getUTCDay()]}</span></div>`).join('')}</div></section>
    <section class="sec"><div class="sec-h"><h2>اختار شخصيتك</h2><span class="chipst gem">${I.star}<span class="num">${G.gems}</span></span></div>
      <div class="shop">${AVS.map(([e, c], k) => { const own = G.own.includes(k); return `<button class="av ${G.av === k ? 'sel' : ''} ${own ? '' : 'lockd'}" type="button" data-av="${k}"><span class="e">${e}</span><small>${own ? (G.av === k ? 'معك' : 'اختار') : `${I.star}${c}`}</small></button>`; }).join('')}</div></section>
    <section class="panel">
      <div class="setrow"><span class="grow">العالم</span><button class="btn ghost sm" type="button" id="sw">${curWorld().icon} ${curWorld().name}</button></div>
      <div class="setrow"><span class="grow">أصوات اللعبة</span><button class="switch" type="button" role="switch" id="sfx" aria-checked="${G.sfx}" aria-label="أصوات اللعبة"></button></div>
      <div class="setrow"><span class="grow">سرعة نطق الكلمات</span><div class="seg">${[[.75, 'بطيء'], [1, 'عادي']].map(([v, l]) => `<button type="button" data-wr="${v}" aria-pressed="${G.wrate === v}">${l}</button>`).join('')}</div></div>
      <div class="setrow"><span class="grow">سرعة القصة</span><div class="seg">${[[.8, '٠٫٨'], [1, '١'], [1.2, '١٫٢']].map(([v, l]) => `<button type="button" data-sr="${v}" aria-pressed="${G.srate === v}">${l}</button>`).join('')}</div></div>
    </section>`);
  $$('[data-av]').forEach(b => b.onclick = () => {
    const k = +b.dataset.av; if (G.own.includes(k)) { G.av = k; save(); SFX.tap(); return render(); }
    const c = AVS[k][1]; if (G.gems < c) return toast(`بدك ${c - G.gems} نجمة كمان. العب وجمّع!`);
    G.gems -= c; G.own.push(k); G.av = k; save(); SFX.win(); confetti(); render();
  });
  $('#sw').onclick = worldSheet;
  $('#sfx').onclick = () => { G.sfx = !G.sfx; save(); render(); };
  $$('[data-wr]').forEach(b => b.onclick = () => { G.wrate = +b.dataset.wr; save(); render(); });
  $$('[data-sr]').forEach(b => b.onclick = () => { G.srate = +b.dataset.sr; save(); render(); });
}

/* ---------- sessions ---------- */
function startStation(s, k) {
  const ids = stations(s)[k], first = !G.stars[s.id + '-' + k] || ids.some(i => !known(i)); prefetch(ids);
  const kid = !!WBY[s.wk].kid, q = [];
  const chunks = ids.length > (kid ? 4 : 5) ? (() => { const n = Math.ceil(ids.length / (kid ? 3 : 2)); const c = []; for (let a = 0; a < ids.length; a += n) c.push(ids.slice(a, a + n)); return c; })() : [ids];
  chunks.forEach(ch => {
    if (first) ch.forEach(i => q.push({ t: 'intro', i }));
    q.push({ t: 'match', ids: ch });
    shuffle(ch).forEach((i, j) => q.push({ t: kid ? (W[i].emo && j % 2 === 0 ? 'pic' : rnd(['balloon', 'feed'])) : (j % 2 ? 'bubble' : 'listen'), i }));
  });
  shuffle(ids).forEach(i => q.push({ t: kid ? (W[i].emo ? rnd(['pic', 'listen', 'feed']) : rnd(['listen', 'balloon'])) : canBuild(i) && Math.random() < .5 ? 'build' : exOf(i) ? 'gap' : 'bubble', i }));
  play({ kind: 'station', sid: s.id, sk: k, hue: 'h' + (s.ix % 5), q });
}
function reviewRound(i) {
  const kid = !!WBY[STORY.get(W[i].s).wk].kid, sk = weakSkill(i);
  if (kid) return { t: W[i].emo && sk !== 2 ? 'pic' : rnd(['listen', 'balloon', 'feed']), i };
  if (sk === 1) return { t: 'listen', i };
  if (sk === 2) return { t: canBuild(i) ? 'build' : exOf(i) ? 'gap' : 'bubble', i };
  return { t: exOf(i) && Math.random() < .5 ? 'gap' : 'bubble', i };
}
function startReview(ids, mission) {
  if (!ids.length) return toast('ما في كلمات للمراجعة هلّق');
  prefetch(ids);
  const q = [], head = ids.slice(0, Math.min(4, ids.length));
  if (ids.length >= 4) q.push({ t: 'match', ids: head });
  ids.forEach(i => { if (!(ids.length >= 4 && head.includes(i))) q.push(reviewRound(i)); });
  shuffle(head).forEach(i => q.push(reviewRound(i)));
  play({ kind: 'review', mission, ids, hue: 'h4', q });
}

/* ---------- play deck ---------- */
let DK = null;
function deckEl() { let d = $('.deck'); if (!d) { d = document.createElement('div'); d.className = 'deck'; d.setAttribute('role', 'dialog'); document.body.appendChild(d); document.body.style.overflow = 'hidden'; } return d; }
function closeDeck() { stopAudio(); stopStory(); $$('.deck,.fb,.dock,.pop-w,.scrim').forEach(e => e.remove()); document.body.style.overflow = ''; DK = null; render(); }
function play(cfg) { DK = Object.assign({}, cfg, { k: 0, n: 0, ok: 0, combo: 0, xp: 0, retried: new Set(), words: new Set() }); DK.q = cfg.q.slice(); renderRound(); }
function topHtml() { return `<div class="dtop"><button class="x" type="button" id="quit" aria-label="اطلع">${I.close}</button><div class="pbar"><i style="width:${Math.round(100 * DK.k / DK.q.length)}%"></i></div><span class="combo ${DK.combo >= 2 ? '' : 'zero'}">${I.flame}<span class="num">${DK.combo}</span></span></div>`; }
function bindQuit() { $('#quit').onclick = quitSheet; }
function quitSheet() {
  if ($('.pop-w')) return;
  const sc = document.createElement('div'); sc.className = 'scrim'; const p = document.createElement('div'); p.className = 'pop-w';
  p.innerHTML = `<div class="in" style="text-align:center">${OWL('sad', 90)}<h2>بدك تطلع هلّق؟</h2><p class="muted" style="margin:0">الكلمات اللي جاوبتها انحفظت، بس النجوم ما بتنحسب إلا لما تخلّص.</p><button class="btn" type="button" id="stay">لا، بكمّل!</button><button class="btn ghost" type="button" id="leave">اطلع</button></div>`;
  document.body.append(sc, p);
  const off = () => { sc.remove(); p.remove(); }; sc.onclick = off; $('#stay', p).onclick = off; $('#leave', p).onclick = () => { off(); closeDeck(); };
}
const kidRound = it => it.i != null ? !!WBY[STORY.get(W[it.i].s).wk].kid : isKid();
function renderRound() {
  $$('.fb,.dock').forEach(e => e.remove());
  if (DK.k >= DK.q.length) return finish();
  const it = DK.q[DK.k], d = deckEl();
  d.className = 'deck ' + (DK.hue || '') + (kidRound(it) ? ' kidd' : '');
  d.innerHTML = `<div class="in pop-in">${topHtml()}<div id="rbody" style="display:grid;gap:18px"></div></div>`;
  d.scrollTop = 0; bindQuit();
  ({ intro: rIntro, match: rMatch, bubble: rBubble, listen: rListen, build: rBuild, gap: rGap, pic: rPic, feed: rFeed, balloon: rBalloon }[it.t] || rBubble)(it, $('#rbody', d));
}
function nextRound() { DK.k++; renderRound(); }
const SKILL = { bubble: 0, balloon: 0, feed: 0, gap: 0, match: 0, pic: 1, listen: 1, build: 2 };
function scored(it, i, ok, hinted) {
  DK.n++; if (ok) DK.ok++; DK.words.add(i);
  record(i, SKILL[it.t] ?? 0, ok, { hinted: hinted || it.retry, noSrs: DK.kind === 'arcade' && !known(i) });
  if (ok) {
    DK.combo++; let x = 10;
    if ([3, 5, 8, 12, 16, 20].includes(DK.combo)) { x += DK.combo * 2; setTimeout(() => { burst(`كومبو ×${DK.combo}!`); SFX.combo(); }, 250); }
    DK.xp += x; addXP(x); return x;
  }
  DK.combo = 0;
  if (!it.retry && !DK.retried.has(i) && DK.kind !== 'arcade') { DK.retried.add(i); DK.q.splice(Math.min(DK.q.length, DK.k + 3), 0, { t: it.t === 'build' ? 'build' : kidRound(it) ? (W[i].emo ? 'pic' : 'balloon') : rnd(['bubble', 'listen']), i, retry: true }); }
  return 0;
}
function feedback(ok, i, xp) {
  const kid = kidRound({ i }), f = document.createElement('div'); f.className = 'fb ' + (ok ? 'ok' : 'no');
  f.innerHTML = `<div class="in">
    <div class="fbt">${kid ? `<span class="mini-owl">${OWL(ok ? 'wow' : 'sad', 52)}</span>` : ok ? I.check : ''}${ok ? rnd(kid ? PRAISE_K : PRAISE) : rnd(kid ? SOFT_K : SOFT)}${ok && xp ? `<span class="num" style="margin-inline-start:auto;font-size:18px;color:var(--sun-d)">+${xp}</span>` : ''}</div>
    ${ok ? '' : `<div class="row">${sayBtn(i, 'sm')}${W[i].emo ? `<span style="font-size:34px">${W[i].emo}</span>` : ''}<div class="fbx grow">الجواب: <span class="en">${esc(W[i].w)}</span> = ${esc(W[i].m)}</div></div>`}
    <button class="btn ${ok ? 'good' : 'bad'}" type="button" id="cont">كمّل</button></div>`;
  document.body.appendChild(f);
  let gone = false; const go = () => { if (gone) return; gone = true; nextRound(); };
  $('#cont', f).onclick = go;
  if (ok) { SFX.ok(); setTimeout(go, 1150); } else { SFX.no(); say(i); }
}
function optsFor(i, n, by) {
  const w = W[i], seen = new Set([by === 'm' ? noTash(w.m) : by === 'emo' ? w.emo : w.k]), out = [i];
  const src = [...(G.cf[i] || []), ...shuffle(STORY.get(w.s).words), ...shuffle(pool()).slice(0, 30), ...(by === 'emo' ? shuffle(W.filter(x => x.emo).map(x => x.i)).slice(0, 40) : [])];
  for (const j of src) { if (out.length >= n) break; if (by === 'emo' && !W[j].emo) continue; const key = by === 'm' ? noTash(W[j].m) : by === 'emo' ? W[j].emo : W[j].k; if (j === i || seen.has(key)) continue; seen.add(key); out.push(j); }
  return shuffle(out);
}
function logConf(i, j) { const a = G.cf[i] || (G.cf[i] = []); if (!a.includes(j)) a.unshift(j); G.cf[i] = a.slice(0, 4); save(); }
const hintBtn = () => `<button class="btn ghost sm" type="button" id="hint" style="justify-self:center">${I.bulb} مساعدة</button>`;
function mc(el, it, choices, labelOf, cls, after) {
  const box = $('.opts', el);
  box.innerHTML = choices.map(j => `<button class="opt ${cls || ''}" type="button" data-o="${j}">${labelOf(j)}</button>`).join('');
  let hinted = false, done = false;
  const hb = $('#hint', el); if (hb) hb.onclick = () => { const wrong = $$('.opt:not(.gone)', box).filter(b => +b.dataset.o !== it.i); if (wrong.length > 1) { rnd(wrong).classList.add('gone'); hinted = true; SFX.tap(); } hb.disabled = wrong.length <= 2; };
  $$('.opt', box).forEach(b => b.onclick = () => {
    if (done) return; done = true; const j = +b.dataset.o, ok = j === it.i;
    $$('.opt', box).forEach(x => { x.disabled = true; if (+x.dataset.o === it.i) x.classList.add('ok'); });
    if (!ok) { b.classList.add('no', 'shake'); logConf(it.i, j); }
    const xp = scored(it, it.i, ok, hinted); if (ok) flyXP(xp, b); after && after(ok, b); feedback(ok, it.i, xp);
  });
}
/* rounds */
function rIntro(it, el) {
  const w = W[it.i], kid = kidRound(it); meet(it.i);
  el.innerHTML = `<div class="ask">${kid ? '⭐ كلمة جديدة!' : 'كلمة جديدة!'}<small>${kid ? 'اسمعها وقولها بصوت عالي' : 'اسمعها، شوف معناها، وتخيّلها بالقصة'}</small></div>
    <div class="card intro">${w.emo ? `<div class="pic big">${w.emo}</div>` : ''}<div class="row" style="justify-content:center">${sayBtn(it.i)}<button class="say sm" type="button" data-say="${it.i}" data-rate=".7" aria-label="استمع ببطء" style="background:var(--mint);box-shadow:0 4px 0 var(--mint-d)">${I.turtle}</button></div>
      <div class="big-en">${esc(w.w)}</div>${w.p ? `<div class="pron">${esc(w.p)}</div>` : ''}<div class="big-ar">${esc(w.m)}</div>${kid ? '' : exHtml(it.i)}</div>`;
  const dk = document.createElement('div'); dk.className = 'dock'; dk.innerHTML = `<div class="in"><button class="btn" type="button" id="got">${kid ? 'حفظتها! 👍' : 'حفظتها! ←'}</button></div>`; document.body.appendChild(dk);
  $('#got', dk).onclick = () => { SFX.tap(); nextRound(); };
  setTimeout(() => DK && DK.q[DK.k] === it && say(it.i), 250);
}
function rListen(it, el) {
  const kid = kidRound(it);
  el.innerHTML = `<div class="ask">${kid ? 'اسمع… شو معناها؟ 👂' : 'شو معنى الكلمة اللي سمعتها؟'}</div>
    <div class="card" style="padding:26px"><div class="row" style="justify-content:center;gap:16px">${sayBtn(it.i, 'huge')}<button class="say" type="button" data-say="${it.i}" data-rate=".7" aria-label="ببطء" style="background:var(--mint);box-shadow:0 5px 0 var(--mint-d)">${I.turtle}</button></div></div>
    <div class="opts"></div>${hintBtn()}`;
  mc(el, it, optsFor(it.i, 3, 'm'), j => esc(W[j].m), '');
  setTimeout(() => { const b = $('.say.huge', el); if (b && DK && DK.q[DK.k] === it) b.click(); }, 300);
}
function rPic(it, el) {
  if (!W[it.i].emo) return rListen(it, el);
  el.innerHTML = `<div class="ask">اسمع واضغط على الصورة 🖼️</div>
    <div class="row" style="justify-content:center">${sayBtn(it.i, 'huge')}</div><div class="opts pics"></div>`;
  mc(el, it, optsFor(it.i, 3, 'emo'), j => `<span class="pic">${W[j].emo}</span>`, 'picopt', ok => { if (ok) say(it.i); });
  setTimeout(() => { const b = $('.say.huge', el); if (b && DK && DK.q[DK.k] === it) b.click(); }, 300);
}
function rBubble(it, el) {
  const ch = optsFor(it.i, 4, 'k');
  el.innerHTML = `<div class="ask">فقّع فقاعة: <span style="color:var(--grape)">${esc(W[it.i].m)}</span><small>اضغط على الفقاعة اللي فيها الكلمة الإنجليزية الصح</small></div><div class="pond" id="pond"></div>${hintBtn()}`;
  floaters($('#pond', el), it, ch, 'bub', [[6, 8], [52, 4], [10, 52], [56, 50]], el);
}
function rBalloon(it, el) {
  const ch = optsFor(it.i, 3, 'k'), w = W[it.i];
  el.innerHTML = `<div class="ask">فقّع البالون الصح! 🎈<small>${w.emo ? `<span style="font-size:30px">${w.emo}</span> ` : ''}<b style="color:var(--grape);font-size:19px">${esc(w.m)}</b></small></div><div class="sky" id="pond"></div>${hintBtn()}`;
  floaters($('#pond', el), it, ch, 'balloon', [[4, 22], [36, 10], [68, 26]], el);
}
function floaters(pond, it, ch, cls, spots, el) {
  const cols = ['var(--coral)', 'var(--sky)', 'var(--sun)', 'var(--mint)'];
  pond.innerHTML = ch.map((j, k) => `<button class="${cls}" type="button" data-o="${j}" style="right:${spots[k][0]}%;top:${spots[k][1]}%;${cls === 'balloon' ? `--bc:${cols[k % 4]}` : ''}"><span>${esc(W[j].w)}</span></button>`).join('');
  let hinted = false, done = false;
  $('#hint', el).onclick = e => { const wrong = $$(`.${cls}:not(.pop)`, pond).filter(b => +b.dataset.o !== it.i); if (wrong.length > 1) { rnd(wrong).classList.add('pop'); hinted = true; SFX.pop(); } e.currentTarget.disabled = wrong.length <= 2; };
  $$('.' + cls, pond).forEach(b => b.onclick = () => {
    if (done) return; done = true; const j = +b.dataset.o, ok = j === it.i;
    if (ok) { b.classList.add('ok'); SFX.pop(); say(it.i); setTimeout(() => b.classList.add('pop'), 200); }
    else { b.classList.add('no'); logConf(it.i, j); const r = $(`[data-o="${it.i}"]`, pond); r && r.classList.add('ok'); }
    const xp = scored(it, it.i, ok, hinted); if (ok) flyXP(xp, b); setTimeout(() => feedback(ok, it.i, xp), ok ? 350 : 150);
  });
}
function rFeed(it, el) {
  const w = W[it.i], ch = optsFor(it.i, 3, 'k');
  el.innerHTML = `<div class="ask">الوحش جوعان! 👾<small>طعميه كلمة: <b style="color:var(--grape);font-size:19px">${esc(w.m)}</b> ${w.emo || ''}</small></div>
    <div class="monster-wrap"><div class="monster" id="mon"><div class="eyes"><i></i><i></i></div><div class="mouth"></div></div></div>
    <div class="opts cookies"></div>${hintBtn()}`;
  mc(el, it, ch, j => `<span class="cookie">🍪</span><span class="en">${esc(W[j].w)}</span>`, 'cookieopt', ok => { const m = $('#mon', el); if (!m) return; m.classList.add(ok ? 'yum' : 'yuck'); if (ok) { SFX.chomp(); say(it.i); } });
}
function rGap(it, el) {
  const w = W[it.i], e = exOf(it.i); if (!e) return rBubble(it, el);
  const st = STORY.get(w.s).words.filter(j => j !== it.i && exOf(j) && norm(exOf(j).span) !== norm(e.span));
  const ch = shuffle([it.i, ...shuffle(st).slice(0, 2)]);
  el.innerHTML = `<div class="ask">كمّل الجملة من القصة<small>الكلمة الناقصة معناها: <b style="color:var(--grape)">${esc(w.m)}</b></small></div>${exHtml(it.i, true)}<div class="muted" style="font-size:15px">${esc(e.ar)}</div><div class="opts"></div>${hintBtn()}`;
  mc(el, it, ch, j => esc(j === it.i ? e.span : exOf(j).span), 'en', ok => { const g = $('.gap', el); if (g) { g.textContent = e.span; g.style.color = ok ? 'var(--good)' : 'var(--bad)'; } });
}
function rMatch(it, el) {
  const ids = it.ids.slice(0, 5), kid = kidRound({ i: ids[0] }), L = shuffle(ids), R = shuffle(ids), miss = new Set(); let sel = null, left = ids.length;
  el.innerHTML = `<div class="ask">${kid ? 'وصّل كل كلمة بصورتها 🔗' : 'وصّل كل كلمة بمعناها'}<small>اضغط على كلمة وبعدين على ${kid ? 'صورتها' : 'معناها'}</small></div>
    <div class="match"><div class="col">${L.map(i => `<button class="opt en" type="button" data-side="e" data-o="${i}">${esc(W[i].w)}</button>`).join('')}</div>
    <div class="col">${R.map(i => `<button class="opt" type="button" data-side="a" data-o="${i}">${kid && W[i].emo ? `<span class="pic sm">${W[i].emo}</span>` : ''}${esc(W[i].m)}</button>`).join('')}</div></div>`;
  $$('.match .opt', el).forEach(b => b.onclick = () => {
    if (b.classList.contains('done')) return;
    if (b.dataset.side === 'e') say(+b.dataset.o); else SFX.tap();
    if (!sel || sel.dataset.side === b.dataset.side) { $$('.match .opt.sel', el).forEach(x => x.classList.remove('sel')); sel = b; b.classList.add('sel'); return; }
    const a = +sel.dataset.o, c = +b.dataset.o, s = sel; sel = null;
    if (a === c) {
      [s, b].forEach(x => { x.classList.remove('sel'); x.classList.add('ok'); }); SFX.pop();
      const xp = scored({ t: 'match' }, a, !miss.has(a)); if (xp) flyXP(xp, b);
      setTimeout(() => { [s, b].forEach(x => x.classList.add('done')); }, 380);
      if (--left === 0) setTimeout(() => { SFX.ok(); burst(kid ? 'كلّه صح! 🎉' : 'كلّه صح!'); setTimeout(nextRound, 700); }, 450);
    } else {
      miss.add(a); miss.add(c);
      [s, b].forEach(x => { x.classList.remove('sel'); x.classList.add('no', 'shake'); setTimeout(() => x.classList.remove('no', 'shake'), 450); }); SFX.no(); DK.combo = 0;
    }
  });
}
function rBuild(it, el) {
  const w = W[it.i]; if (!canBuild(it.i)) return rBalloon(it, el);
  const word = w.w.toLowerCase(), letters = word.split(''), tiles = shuffle(letters.slice(1).map((c, k) => ({ c, k })));
  const filled = [letters[0]], from = [null]; let hinted = false, done = false;
  el.innerHTML = `<div class="ask">ركّب الكلمة: <span style="color:var(--grape)">${esc(w.m)}</span> ${w.emo || ''}<small>أول حرف عليّ، والباقي عليك</small></div>
    <div class="card" style="gap:16px">${sayBtn(it.i)}<div class="slots" id="slots"></div></div>
    <div class="tiles" id="tiles">${tiles.map((t, k) => `<button class="tile" type="button" data-t="${k}">${t.c}</button>`).join('')}</div>
    <div class="tools"><button class="btn ghost sm" type="button" id="hint">${I.bulb} حرف</button><button class="btn ghost sm" type="button" id="undo">${I.back} امسح</button></div>`;
  const paint = () => { $('#slots', el).innerHTML = letters.map((_, k) => `<button type="button" class="slot ${k === 0 ? 'fix' : filled[k] ? 'f' : ''}" data-s="${k}">${filled[k] || ''}</button>`).join(''); $$('.slot', el).forEach(s => s.onclick = () => { const k = +s.dataset.s; if (k > 0 && k === filled.length - 1 && !done) undo(); }); };
  const put = k => { const t = $(`.tile[data-t="${k}"]`, el); if (!t || t.classList.contains('used') || done) return; t.classList.add('used'); filled.push(tiles[k].c); from.push(k); SFX.tap(); paint(); if (filled.length === letters.length) check(); };
  const undo = () => { if (filled.length <= 1 || done) return; filled.pop(); const k = from.pop(); const t = $(`.tile[data-t="${k}"]`, el); t && t.classList.remove('used'); paint(); };
  const check = () => { done = true; const ok = filled.join('') === word; if (!ok) $('#slots', el).classList.add('shake'); else $$('.slot', el).forEach(s => { s.style.borderBottomColor = 'var(--good)'; s.style.color = 'var(--good)'; }); const xp = scored(it, it.i, ok, hinted); if (ok) { say(it.i); flyXP(xp, $('#slots', el)); } feedback(ok, it.i, xp); };
  $$('.tile', el).forEach(t => t.onclick = () => put(+t.dataset.t));
  $('#undo', el).onclick = undo;
  $('#hint', el).onclick = () => { while (filled.length > 1 && filled.join('') !== word.slice(0, filled.length)) undo(); const need = letters[filled.length]; const k = tiles.findIndex((t, j) => t.c === need && !$(`.tile[data-t="${j}"]`, el).classList.contains('used')); if (k >= 0) { hinted = true; put(k); } };
  paint();
}

/* results */
function finish() {
  $$('.fb,.dock').forEach(e => e.remove());
  const acc = DK.n ? DK.ok / DK.n : 1, stars = acc >= .9 ? 3 : acc >= .7 ? 2 : 1;
  const info = DK.kind === 'station' ? stationResult(stars) : DK.kind === 'review' ? reviewResult() : DK.kind === 'boss' ? bossResult(stars) : arcadeResult();
  const gems = stars * 3 + (info.gems || 0); G.gems += gems; addXP(20); DK.xp += 20;
  let sticker = null; if (info.sticker) { const left = STICKERS.filter(e => !G.stk.includes(e)); sticker = left.length ? rnd(left) : rnd(STICKERS); if (!G.stk.includes(sticker)) G.stk.push(sticker); }
  save();
  const d = deckEl(), kid = isKid();
  d.className = 'deck ' + (DK.hue || '') + (kid ? ' kidd' : '');
  d.innerHTML = `<div class="in"><div class="res ${DK.hue || 'h0'}">
    ${kid ? OWL('wow', 110) : `<div style="font-size:60px;line-height:1">${myAv()}</div>`}
    <div class="bigstars">${[0, 1, 2].map(k => `<svg viewBox="0 0 24 24" class="${k < stars ? 'on' : ''}"><path fill="currentColor" d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z"/></svg>`).join('')}</div>
    <h1>${info.title || (stars === 3 ? (kid ? 'إنت نجم! 🌟' : 'أداء أسطوري!') : stars === 2 ? 'شغل حلو!' : 'خلّصتها!')}</h1>${info.sub ? `<p class="muted" style="margin:0">${info.sub}</p>` : ''}
    ${sticker ? `<div class="newstk"><span>${sticker}</span><b>ملصق جديد لألبومك!</b></div>` : ''}
    <div class="rk"><div class="h2"><b>${DK.xp}</b><span>XP</span></div><div class="h4"><b>+${gems}</b><span>نجوم</span></div><div class="h3"><b>${Math.round(acc * 100)}%</b><span>دقّة</span></div></div>
    ${DK.words.size ? `<div class="wlist" style="width:100%;text-align:start">${[...DK.words].slice(0, 10).map(i => `<div class="wl">${sayBtn(i, 'sm')}${W[i].emo ? `<span class="wemo">${W[i].emo}</span>` : ''}<span class="w en grow">${esc(W[i].w)}</span><span class="m">${esc(W[i].m)}</span></div>`).join('')}</div>` : ''}
    <div style="display:grid;gap:12px;width:100%">${info.btns}</div></div></div>`;
  d.scrollTop = 0; SFX.win(); confetti();
  $$('[data-act]', d).forEach(b => b.onclick = () => info.act[b.dataset.act]());
}
function stationResult(stars) {
  const s = STORY.get(DK.sid), k = DK.sk, key = s.id + '-' + k, prev = G.stars[key] || 0; G.stars[key] = Math.max(prev, stars);
  const nxt = k + 1 < stations(s).length;
  const act = { map: closeDeck, again: () => { closeDeck(); startStation(s, k); }, next: () => { closeDeck(); nxt ? startStation(s, k + 1) : theatre(s); } };
  return { gems: prev ? 0 : 5, sticker: !prev, sub: nxt ? `المحطة ${AR(k + 2)} انفتحت!` : 'كل المحطات خلصت. القصة انفتحت!',
    btns: `<button class="btn" type="button" data-act="next">${nxt ? 'المحطة الجاية ←' : 'للقصة ←'}</button>${stars < 3 ? `<button class="btn ghost" type="button" data-act="again">العبها كمان لـ٣ نجوم</button>` : ''}<button class="btn ghost" type="button" data-act="map">للخريطة</button>`, act };
}
function reviewResult() {
  if (DK.mission) { const T = ensureToday(); T.rd = Math.min(T.rev.length, T.rd + DK.ids.length); save(); }
  const left = dueAll().length;
  return { gems: 3, title: 'المراجعة تمّت!', sub: left ? `باقي ${AR(left)} كلمة بالصندوق.` : 'الصندوق صار فاضي.', btns: `<button class="btn" type="button" data-act="map">كمّل الرحلة ←</button>`, act: { map: () => { TAB = 'map'; closeDeck(); } } };
}
function bossResult(stars) {
  const s = STORY.get(DK.sid), first = !G.done[s.id]; G.done[s.id] = Math.max(G.done[s.id] || 0, stars);
  const L = WBY[s.wk].list, nx = L[s.ix + 1];
  return { gems: first ? 20 : 0, sticker: first, title: first ? 'خلّصت القصة! 🏆' : 'القصة تمّت!', sub: first ? 'بكرة بنراجع كلماتها وبنبدأ القصة الجاية.' : '', btns: `<button class="btn" type="button" data-act="map">للخريطة</button>`, act: { map: () => { VIEW = nx ? nx.id : s.id; TAB = 'map'; closeDeck(); } } };
}
function arcadeResult() {
  if (DK.key) G.best[DK.key] = Math.max(G.best[DK.key] || 0, DK.ok);
  return { title: `${DK.ok} من ${DK.n}`, btns: `<button class="btn" type="button" data-act="again">العب كمان</button><button class="btn ghost" type="button" data-act="back">لصالة الألعاب</button>`, act: { again: () => { const k = DK.key; closeDeck(); $(`[data-g="${k}"]`)?.click(); }, back: closeDeck } };
}

/* ---------- arcade: rush, rain, memory ---------- */
function arcadeDone(key, score, n, stars, title) {
  const isBest = score > (G.best[key] || 0); G.best[key] = Math.max(G.best[key] || 0, score);
  const gems = Math.max(2, Math.round(score / 3)); G.gems += gems; addXP(score * 3);
  const d = deckEl();
  d.innerHTML = `<div class="in"><div class="res">${OWL('wow', 100)}
    <div class="bigstars">${[0, 1, 2].map(k => `<svg viewBox="0 0 24 24" class="${k < stars ? 'on' : ''}"><path fill="currentColor" d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z"/></svg>`).join('')}</div>
    <h1>${title}</h1>${isBest ? `<p style="margin:0;font-weight:800;color:var(--coral)">رقم قياسي جديد!</p>` : `<p class="muted" style="margin:0">أفضل نتيجة: ${G.best[key]}</p>`}
    <div class="rk"><div class="h2"><b>${score * 3}</b><span>XP</span></div><div class="h4"><b>+${gems}</b><span>نجوم</span></div><div class="h1"><b>${n}</b><span>كلمة</span></div></div>
    <div style="display:grid;gap:12px;width:100%"><button class="btn" type="button" id="again">العب كمان</button><button class="btn ghost" type="button" id="back">لصالة الألعاب</button></div></div></div>`;
  d.scrollTop = 0; SFX.win(); if (isBest || stars === 3) confetti();
  $('#again').onclick = () => { closeDeck(); $(`[data-g="${key}"]`)?.click(); }; $('#back').onclick = closeDeck;
}
function rush(p) {
  DK = { kind: 'rush' }; const d = deckEl(); d.className = 'deck h3';
  let score = 0, streak = 0, t = 60, cur = null, end = false; const seen = new Set();
  d.innerHTML = `<div class="in"><div class="dtop"><button class="x" type="button" id="quit" aria-label="اطلع">${I.close}</button><div class="timer grow"><i id="tbar" style="width:100%"></i></div><span class="score num" id="sc">0</span></div>
    <div class="ask" style="text-align:center">هل هاد هو المعنى الصح؟</div><div class="card" id="rc" style="min-height:220px;align-content:center"></div>
    <div class="tfbtns"><button class="btn bad" type="button" id="no">✗ غلط</button><button class="btn good" type="button" id="yes">✓ صح</button></div>
    <p class="muted" style="text-align:center;margin:0">كل ٥ صح ورا بعض = ٣ ثواني زيادة</p></div>`;
  bindQuit();
  const next = () => { const i = rnd(p), real = Math.random() < .5; let m = i; if (!real) m = optsFor(i, 2, 'm').find(j => j !== i) ?? i; cur = { i, real: m === i }; $('#rc').innerHTML = `${W[i].emo ? `<div class="pic">${W[i].emo}</div>` : ''}<div class="big-en">${esc(W[i].w)}</div><div class="big-ar" style="color:var(--coral)">${esc(W[m].m)}</div>`; $('#rc').classList.remove('pop-in'); void $('#rc').offsetWidth; $('#rc').classList.add('pop-in'); };
  const ans = yes => { if (end) return; const ok = yes === cur.real; seen.add(cur.i); if (known(cur.i)) record(cur.i, 0, ok, { noSrs: true });
    if (ok) { score++; streak++; SFX.ok(); if (streak % 5 === 0) { t = Math.min(60, t + 3); burst('+٣ ثواني'); SFX.combo(); } } else { streak = 0; SFX.no(); $('#rc').classList.add('shake'); toast(`${W[cur.i].w} = ${W[cur.i].m}`); }
    $('#sc').textContent = score; next(); };
  $('#yes').onclick = () => ans(true); $('#no').onclick = () => ans(false); next();
  let last = Date.now();
  const tm = setInterval(() => { if (!$('.deck') || DK?.kind !== 'rush') return clearInterval(tm); const now = Date.now(); t -= (now - last) / 1000; last = now; $('#tbar').style.width = Math.max(0, t / 60 * 100) + '%'; if (t <= 0) { clearInterval(tm); end = true; arcadeDone('rush', score, seen.size, score >= 25 ? 3 : score >= 15 ? 2 : 1, `${score} جواب صح`); } }, 100);
}
function rain(p) {
  DK = { kind: 'rain' }; const d = deckEl(); d.className = 'deck h4';
  d.innerHTML = `<div class="in"><div class="dtop"><button class="x" type="button" id="quit" aria-label="اطلع">${I.close}</button><div class="hearts grow" id="hearts"></div><span class="score num" id="sc">0</span></div>
    <div class="ask" style="text-align:center">التقط: <span id="tg" style="color:var(--sky-d)"></span></div><div class="rain" id="rain"><div class="ground"></div></div></div>`;
  bindQuit();
  const box = $('#rain'); let lives = 3, score = 0, target = null, drops = [], speed = isKid() ? 42 : 55, lastSpawn = 0, sinceT = 0, raf = 0, end = false, prev = performance.now(); const seen = new Set();
  const hearts = () => { $('#hearts').innerHTML = [0, 1, 2].map(k => `<span class="${k < lives ? '' : 'off'}">${I.heart}</span>`).join(''); };
  const newTarget = () => { target = rnd(p); $('#tg').textContent = (W[target].emo ? W[target].emo + ' ' : '') + W[target].m; sinceT = 0; };
  const spawn = () => {
    const isT = !drops.some(x => x.i === target && !x.hit) && (sinceT >= 1 || Math.random() < .45);
    let i = isT ? target : rnd(p); if (!isT && i === target) i = p[(p.indexOf(i) + 1) % p.length];
    sinceT = isT ? 0 : sinceT + 1;
    const el = document.createElement('button'); el.type = 'button'; el.className = 'drop'; el.textContent = W[i].w; box.appendChild(el);
    const x = 8 + Math.random() * Math.max(0, box.clientWidth - el.offsetWidth - 16); const dr = { i, el, y: -50 }; el.style.left = x + 'px'; drops.push(dr);
    el.onclick = () => { if (end || dr.hit) return; dr.hit = 1; seen.add(i);
      if (i === target) { score++; speed += 3; el.classList.add('ok'); SFX.pop(); say(i); $('#sc').textContent = score; newTarget(); }
      else { lives--; el.classList.add('no'); SFX.no(); hearts(); toast(`${W[i].w} = ${W[i].m}`); }
      setTimeout(() => { el.remove(); drops = drops.filter(x => x !== dr); }, 260); if (lives <= 0) over(); };
  };
  const over = () => { end = true; cancelAnimationFrame(raf); setTimeout(() => arcadeDone('rain', score, seen.size, score >= 20 ? 3 : score >= 10 ? 2 : 1, `${score} كلمة التقطتها`), 500); };
  const loop = t => { if (!$('#rain')) return; const dt = Math.min(.05, (t - prev) / 1000); prev = t; const H = box.clientHeight;
    if (t - lastSpawn > Math.max(700, 1600 - score * 30) && drops.filter(x => !x.hit).length < 4) { lastSpawn = t; spawn(); }
    drops.forEach(dr => { if (dr.hit) return; dr.y += speed * dt; dr.el.style.transform = `translateY(${dr.y}px)`; if (dr.y > H - 40) { dr.hit = 1; dr.el.remove(); if (dr.i === target) { lives--; SFX.no(); hearts(); toast(`فاتتك: ${W[dr.i].w}`); newTarget(); if (lives <= 0) over(); } } });
    drops = drops.filter(x => x.el.isConnected); if (!end) raf = requestAnimationFrame(loop); };
  hearts(); newTarget(); raf = requestAnimationFrame(loop);
}
function memory(p) {
  DK = { kind: 'mem' }; const d = deckEl(); d.className = 'deck h1';
  const ids = p.slice(0, 6), cards = shuffle([...ids.map(i => ({ i, s: 'e' })), ...ids.map(i => ({ i, s: 'a' }))]);
  let up = [], moves = 0, got = 0, lock = false;
  d.innerHTML = `<div class="in"><div class="dtop"><button class="x" type="button" id="quit" aria-label="اطلع">${I.close}</button><div class="grow ask" style="font-size:18px">لاقي كل كلمة مع صورتها</div><span class="score num" id="mv">0</span></div>
    <div class="mem">${cards.map((c, k) => `<button class="mc" type="button" data-c="${k}" aria-label="كرت"><span class="fa front">?</span><span class="fa back ${c.s === 'e' ? 'en' : ''}">${c.s === 'e' ? esc(W[c.i].w) : W[c.i].emo ? `<span style="font-size:40px">${W[c.i].emo}</span>` : esc(W[c.i].m)}</span></button>`).join('')}</div>
    <p class="muted" style="text-align:center;margin:0">الرقم فوق هو عدد المحاولات. كل ما قلّ، أحسن.</p></div>`;
  bindQuit();
  $$('.mc', d).forEach(b => b.onclick = () => {
    const c = cards[+b.dataset.c]; if (lock || b.classList.contains('up')) return;
    b.classList.add('up'); SFX.flip(); if (c.s === 'e') say(c.i); up.push([b, c]); if (up.length < 2) return;
    moves++; $('#mv').textContent = moves; const [[b1, c1], [b2, c2]] = up; up = [];
    if (c1.i === c2.i) { got++; SFX.pop(); [b1, b2].forEach(x => x.classList.add('got')); if (got === ids.length) setTimeout(() => arcadeDone('mem', Math.max(1, 20 - moves), ids.length, moves <= 9 ? 3 : moves <= 13 ? 2 : 1, `خلّصتها بـ${moves} محاولة`), 600); }
    else { lock = true; setTimeout(() => { b1.classList.remove('up'); b2.classList.remove('up'); lock = false; }, 950); }
  });
}

/* ---------- story theatre ---------- */
const SA = new Audio(); SA.preload = 'auto';
let saRaf = 0, saEnd = null, SA_SRC = '';
function stopStory() { try { SA.pause(); } catch (e) { } cancelAnimationFrame(saRaf); saEnd = null; }
function toks(s) {
  if (s._tok) return s._tok; const out = [];
  s.p.forEach(([en], pi) => { let bold = false, cur = '', curB = false; const flush = () => { if (cur) out.push({ t: cur, b: curB, p: pi }); cur = ''; curB = false; };
    for (let i = 0; i < en.length; i++) { if (en[i] === '*' && en[i + 1] === '*') { bold = !bold; i++; continue; } if (/\s/.test(en[i])) { flush(); continue; } cur += en[i]; if (bold) curB = true; } flush(); });
  return s._tok = out;
}
function theatre(s, readOnly) {
  const tk = toks(s), T = k => s.t[k] / 100; let p = 0, playing = false, auto = false;
  const lookup = new Map(); s.words.forEach(i => lookup.set(W[i].k, i));
  DK = { kind: 'theatre' }; const d = deckEl(); d.className = 'deck h' + (s.ix % 5) + (WBY[s.wk].kid ? ' kidd' : '');
  const range = pi => { let a = -1, b = -1; tk.forEach((x, k) => { if (x.p === pi) { if (a < 0) a = k; b = k; } }); return [a, b]; };
  const draw = () => {
    const [a, b] = range(p);
    d.innerHTML = `<div class="in">
      <div class="dtop"><button class="x" type="button" id="quit" aria-label="اطلع">${I.close}</button><div class="grow" style="text-align:center"><b>${esc(noTash(s.ar))}</b><div class="en muted" style="font-size:14px">${esc(s.en)}</div></div><span class="num muted" style="width:40px;text-align:center">${AR(p + 1)}/${AR(s.p.length)}</span></div>
      ${p === 0 && !readOnly ? `<div class="panel" style="display:flex;gap:12px;align-items:center">${WBY[s.wk].kid ? OWL('happy', 60) : '<span style="font-size:34px">🎬</span>'}<span>اسمع القصة. اضغط على أي كلمة ملوّنة لتشوف معناها. وبعدين التحدي!</span></div>` : ''}
      <div class="stage"><div class="p-en" id="pen">${tk.slice(a, b + 1).map((t, k) => `<span class="t ${t.b ? 'v' : ''}" data-k="${a + k}">${esc(t.t)}</span>`).join(' ')}</div>
        <div class="p-ar ${WBY[s.wk].kid ? '' : 'blur'}" id="par">${esc(s.p[p][1])}</div></div>
      <div class="pbar" style="height:10px"><i style="width:${Math.round(100 * (p + 1) / s.p.length)}%"></i></div>
    </div>`;
    const dk = $('.dock') || document.body.appendChild(Object.assign(document.createElement('div'), { className: 'dock h' + (s.ix % 5) }));
    dk.innerHTML = `<div class="in"><div class="row" style="justify-content:center;gap:14px">
        <button class="btn ghost sm" type="button" id="pp" ${p === 0 ? 'disabled' : ''} aria-label="السابقة">${I.prev}</button>
        <button class="say huge" type="button" id="pl" style="width:76px;height:76px;border-radius:26px;background:var(--h);box-shadow:0 6px 0 var(--hd)" aria-label="${playing ? 'وقّف' : 'شغّل'}">${playing ? I.pause : I.play}</button>
        <button class="btn ghost sm" type="button" id="pn" ${p === s.p.length - 1 ? 'disabled' : ''} aria-label="التالية">${I.next}</button></div>
        ${readOnly ? '' : `<button class="btn ${p === s.p.length - 1 ? '' : 'ghost'}" type="button" id="fight">${I.sword} ابدأ التحدي</button>`}</div>`;
    bindQuit();
    $('#par').onclick = e => e.currentTarget.classList.toggle('blur');
    $('#pp').onclick = () => { stopStory(); playing = auto = false; p--; draw(); };
    $('#pn').onclick = () => { stopStory(); playing = auto = false; p++; draw(); };
    $('#pl').onclick = () => { if (playing) { stopStory(); playing = auto = false; draw(); } else { auto = true; playPara(); } };
    const f = $('#fight'); if (f) f.onclick = () => { stopStory(); $$('.dock').forEach(e => e.remove()); bossChallenge(s); };
    $$('.t.v', d).forEach(sp => sp.onclick = () => {
      let k = +sp.dataset.k, a2 = k, b2 = k; while (a2 > 0 && tk[a2 - 1].b && tk[a2 - 1].p === tk[k].p) a2--; while (b2 < tk.length - 1 && tk[b2 + 1].b && tk[b2 + 1].p === tk[k].p) b2++;
      const phrase = norm(tk.slice(a2, b2 + 1).map(x => x.t).join(' ')); let i = lookup.get(phrase);
      if (i == null) for (let x = a2; x <= b2 && i == null; x++) for (let y = b2; y >= x && i == null; y--) i = lookup.get(norm(tk.slice(x, y + 1).map(z => z.t).join(' ')));
      if (i == null) return; const was = playing; if (was) { stopStory(); playing = false; }
      wordPop(i, () => { if (was) { auto = true; playPara(); } else draw(); });
    });
  };
  const playPara = () => {
    const [a, b] = range(p); if (!s.a || a < 0 || a >= s.t.length) { playing = false; toast('هالجزء مكتوب بس، بدون صوت'); return; }
    if (SA_SRC !== s.a) { SA.src = s.a; SA_SRC = s.a; }
    SA.playbackRate = G.srate || 1; stopAudio();
    const st = Math.max(0, T(a) - .15), en = b + 1 < s.t.length ? T(b + 1) - .1 : s.d;
    playing = true; draw();
    const go = () => { SA.currentTime = st; saEnd = en; SA.play().catch(() => { playing = false; draw(); }); tick(a, b); };
    if (SA.readyState >= 1) go(); else SA.addEventListener('loadedmetadata', go, { once: true });
  };
  const tick = (a, b) => {
    cancelAnimationFrame(saRaf); let last = -1; const els = $$('#pen .t', d);
    const f = () => {
      const t = SA.currentTime;
      if (saEnd != null && t >= saEnd) { stopStory(); els.forEach(e => e.classList.add('past'));
        if (auto && p < s.p.length - 1) setTimeout(() => { if (DK?.kind !== 'theatre') return; p++; playPara(); }, 500);
        else { playing = auto = false; setTimeout(() => { if (DK?.kind === 'theatre') draw(); }, 400); } return; }
      let idx = -1; for (let k = a; k <= Math.min(b, s.t.length - 1); k++) { if (T(k) <= t + .03) idx = k - a; else break; }
      if (idx !== last) { els.forEach((e, k) => { e.classList.toggle('on', k === idx); e.classList.toggle('past', k < idx); }); last = idx; }
      saRaf = requestAnimationFrame(f);
    };
    saRaf = requestAnimationFrame(f);
  };
  draw();
}
function wordPop(i, onClose) {
  const sc = document.createElement('div'); sc.className = 'scrim'; const p = document.createElement('div'); p.className = 'pop-w';
  p.innerHTML = `<div class="in"><div class="row">${W[i].emo ? `<span style="font-size:52px">${W[i].emo}</span>` : ''}${sayBtn(i)}<div class="grow"><div class="big-en" style="font-size:30px;text-align:right">${esc(W[i].w)}</div>${W[i].p ? `<div class="pron">${esc(W[i].p)}</div>` : ''}</div></div><div class="big-ar" style="font-size:23px">${esc(W[i].m)}</div><button class="btn" type="button" id="pc">تمام</button></div>`;
  document.body.append(sc, p); say(i);
  const off = () => { sc.remove(); p.remove(); onClose && onClose(); }; sc.onclick = off; $('#pc', p).onclick = off;
}
function bossChallenge(s) {
  const kid = !!WBY[s.wk].kid, wsx = shuffle(s.words);
  const q = kid
    ? wsx.slice(0, 10).map(i => ({ t: W[i].emo ? rnd(['pic', 'balloon']) : rnd(['listen', 'feed', 'balloon']), i }))
    : [...wsx.filter(i => exOf(i)).slice(0, 8).map(i => ({ t: 'gap', i })), ...wsx.slice(0, 4).map(i => ({ t: 'listen', i }))];
  prefetch(s.words);
  play({ kind: 'boss', sid: s.id, hue: 'h' + (s.ix % 5), q: shuffle(q) });
}

window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (['map', 'review', 'arcade', 'me'].includes(h) && !DK) { TAB = h; render(); } });
render();
})();
