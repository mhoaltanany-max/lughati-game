/* لغتي التفاعلي — an interactive picture-book reader built on the stories of «لغتي».
   Every sentence is a page with a picture scene; the page reads itself aloud word by word,
   any word can be tapped to hear it and see its meaning, and Bubu the owl asks a question every few pages. */
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
const norm = s => String(s).toLowerCase().replace(/[’‘`]/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
const noTash = s => String(s).replace(/[ً-ْ]/g, '');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- icons + Bubu ---------- */
const P = (d, f) => `<svg class="i${f ? ' f' : ''}" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const I = {
  shelf: P('<path d="M4 4h4v16H4zM10 4h4v16h-4zM16.5 4.5l3.8 1-4 15-3.8-1z"/>'),
  box: P('<path d="M3.5 8 12 4l8.5 4v8.5L12 20.5 3.5 16.5z"/><path d="M3.5 8 12 12l8.5-4M12 12v8.5"/>'),
  sticker: P('<path d="M20 12a8 8 0 1 1-8-8h3l5 5z"/><path d="M15 4v5h5"/><circle cx="9" cy="11" r="1" fill="currentColor"/><circle cx="14" cy="11" r="1" fill="currentColor"/><path d="M9 15a4 4 0 0 0 6 0"/>'),
  star: P('<path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z"/>', 1),
  spk: P('<path d="M3.5 9.5v5a1 1 0 0 0 1 1h3l4.6 3.8a.8.8 0 0 0 1.4-.6V5.3a.8.8 0 0 0-1.4-.6L7.5 8.5h-3a1 1 0 0 0-1 1z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>'),
  play: P('<path d="M7 4.8v14.4a1 1 0 0 0 1.5.86l12-7.2a1 1 0 0 0 0-1.72l-12-7.2A1 1 0 0 0 7 4.8z"/>', 1),
  pause: P('<rect x="5.5" y="4.5" width="4.5" height="15" rx="1.3"/><rect x="14" y="4.5" width="4.5" height="15" rx="1.3"/>', 1),
  close: P('<path d="M6 6l12 12M18 6 6 18"/>'),
  next: P('<path d="M15 5l-7 7 7 7"/>'),
  prev: P('<path d="M9 5l7 7-7 7"/>'),
  auto: P('<path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3"/><path d="M18 3v4h-4M6 21v-4h4"/>'),
  eye: P('<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>'),
  turtle: P('<path d="M4 15c0-4 3.6-7 8-7s8 3 8 7z"/><path d="M20 13.5h1.5a1.5 1.5 0 0 0 0-3H20M6 15l-1 3M18 15l1 3M9 8.5l1.5 6.5M15 8.5 13.5 15"/>'),
  back: P('<path d="M20 12H4M10 6l-6 6 6 6"/>'),
  joy: P('<rect x="2.5" y="7" width="19" height="11" rx="5.5"/><path d="M7 10.5v4M5 12.5h4"/><circle cx="15.5" cy="11.5" r=".6" fill="currentColor"/><circle cx="17.5" cy="13.5" r=".6" fill="currentColor"/>'),
  search: P('<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>'),
  check: P('<path d="m4.5 12.5 5 5L19.5 7"/>'),
};
const OWL = (mood = 'happy', size = 92) => `<svg class="owl ${mood}" width="${size}" height="${size}" viewBox="0 0 120 120" aria-hidden="true">
  <ellipse cx="60" cy="112" rx="34" ry="5" fill="rgb(0 0 0 / .12)"/>
  <path d="M26 46 L20 18 L44 34 Z" fill="#7A4FD6"/><path d="M94 46 L100 18 L76 34 Z" fill="#7A4FD6"/>
  <ellipse cx="60" cy="66" rx="38" ry="42" fill="#8E63F0"/><ellipse cx="60" cy="80" rx="24" ry="24" fill="#FFE3A6"/>
  <path d="M48 76 q4 4 8 0 M58 84 q4 4 8 0 M50 92 q4 4 8 0 M62 70 q4 4 8 0" stroke="#F2B84B" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <path class="wing l" d="M23 62 q-10 18 4 34 q6-14 4-34z" fill="#6B44CF"/><path class="wing r" d="M97 62 q10 18-4 34 q-6-14-4-34z" fill="#6B44CF"/>
  <circle cx="44" cy="50" r="15" fill="#fff"/><circle cx="76" cy="50" r="15" fill="#fff"/>
  ${mood === 'sad' ? '<path d="M36 52 q8-6 16 0 M68 52 q8-6 16 0" stroke="#2A1E5C" stroke-width="4" fill="none" stroke-linecap="round"/>' : mood === 'wow' ? '<circle cx="44" cy="50" r="8" fill="#2A1E5C"/><circle cx="76" cy="50" r="8" fill="#2A1E5C"/><circle cx="47" cy="47" r="3" fill="#fff"/><circle cx="79" cy="47" r="3" fill="#fff"/>' : '<circle cx="46" cy="51" r="6.5" fill="#2A1E5C"/><circle cx="78" cy="51" r="6.5" fill="#2A1E5C"/><circle cx="48" cy="48" r="2.4" fill="#fff"/><circle cx="80" cy="48" r="2.4" fill="#fff"/>'}
  <path d="M55 60 L65 60 L60 69 Z" fill="#FFB020"/><circle cx="33" cy="64" r="5" fill="#FF8FB1" opacity=".7"/><circle cx="87" cy="64" r="5" fill="#FF8FB1" opacity=".7"/>
  <path d="M46 106 l-4 6 M52 106 l0 7 M68 106 l0 7 M74 106 l4 6" stroke="#FFB020" stroke-width="4" stroke-linecap="round"/>
</svg>`;

/* ---------- shelves, stories, words ---------- */
const SHELVES = [
  { k: 'A', name: 'رفّ الصغار', sub: 'المستوى الأول', icon: '🧸', kid: true, list: D.L.A || [] },
  { k: 'B', name: 'رفّ المغامرين', sub: 'المستوى الثاني', icon: '🏝️', list: D.L.B || [] },
  { k: 'C', name: 'رفّ الأبطال', sub: 'المستوى الثالث', icon: '🏔️', list: D.L.C || [] },
  { k: 'F', name: 'قصص العائلات', sub: 'كلمات حسب الموضوع', icon: '👨‍👩‍👧', list: D.F || [] },
].filter(s => s.list.length);
/* grammar lessons from «قواعد» become a shelf of their own */
const GD = window.GD || null;
const GL = GD ? ['A', 'B', 'C'].flatMap(k => (GD.order[k] || []).map(id => GD.L.find(l => l.id === id)).filter(Boolean)) : [];
GL.forEach((l, ix) => { l.ix = ix; l.sk = 'G'; });
if (GL.length) SHELVES.push({ k: 'G', name: 'رفّ القواعد', sub: 'قواعد ونطق · ٣ مستويات', icon: '🧩', gram: true, list: GL });
const LBY = new Map(GL.map(l => [l.id, l]));
const SBY = Object.fromEntries(SHELVES.map(s => [s.k, s]));
const PRON = new Map();
Object.values(D.wl || {}).forEach(l => l.forEach(r => { if (!PRON.has(r[0])) PRON.set(r[0], r[1]); }));
(D.fam || []).forEach(f => f.w.forEach(r => { if (!PRON.has(r[0])) PRON.set(r[0], r[1]); }));
const STORY = new Map();
SHELVES.filter(sh => !sh.gram).forEach(sh => sh.list.forEach((s, ix) => { s.sk = sh.k; s.ix = ix; STORY.set(s.id, s); }));
const emoOf = w => EMO[w] || EMO[String(w).toLowerCase()] || '';
function vocab(s) {
  if (s._v) return s._v; const seen = new Set();
  return s._v = s.w.filter(([w]) => { const k = norm(w); if (!k || seen.has(k)) return false; seen.add(k); return true; }).map(([w, m]) => ({ w, m, k: norm(w), emo: emoOf(w), p: PRON.get(w) || '' }));
}
function cover(s) { if (s._c) return s._c; const v = vocab(s).filter(x => x.emo); const fromTitle = s.en.split(/\s+/).map(t => emoOf(t.replace(/[^A-Za-z-]/g, '')) || emoOf(t.replace(/[^A-Za-z-]/g, '').replace(/s$/, ''))).filter(Boolean); return s._c = (fromTitle[0] || v[0]?.emo || '📖'); }

/* tokens per page, with the vocabulary phrase each bold token belongs to */
function pages(s) {
  if (s._pg) return s._pg; const out = []; let gi = 0; const vk = new Map(vocab(s).map(v => [v.k, v]));
  s.p.forEach(([en, ar], pi) => {
    const tk = []; let bold = false, cur = '', curB = false, grp = -1, g = 0;
    const flush = () => { if (cur) tk.push({ t: cur, b: curB, g: curB ? grp : -1, gi: gi++ }); cur = ''; curB = false; };
    for (let i = 0; i < en.length; i++) { if (en[i] === '*' && en[i + 1] === '*') { bold = !bold; if (bold) grp = g++; i++; continue; } if (/\s/.test(en[i])) { flush(); continue; } cur += en[i]; if (bold) curB = true; }
    flush();
    /* map bold groups → vocabulary entries (longest sub-phrase that is a vocab word) */
    const groups = {}; tk.forEach((x, k) => { if (x.g >= 0) (groups[x.g] = groups[x.g] || []).push(k); });
    const words = [];
    Object.values(groups).forEach(ks => {
      for (let a = 0; a < ks.length; a++) for (let b = ks.length - 1; b >= a; b--) {
        const ph = norm(ks.slice(a, b + 1).map(k => tk[k].t).join(' ')), v = vk.get(ph);
        if (v && !words.includes(v)) { for (let k = a; k <= b; k++) tk[ks[k]].v = v; words.push(v); a = b; break; }
      }
    });
    /* scene pictures: vocab first, then any picturable plain word */
    const pics = []; words.forEach(v => v.emo && !pics.includes(v.emo) && pics.push(v.emo));
    tk.forEach(x => { const c = x.t.replace(/[^A-Za-z'-]/g, ''); const e = emoOf(c) || emoOf(c.toLowerCase()) || (c.length > 3 && emoOf(c.toLowerCase().replace(/s$/, ''))); if (e && !pics.includes(e) && pics.length < 4) pics.push(e); });
    out.push({ en, ar, tk, words, pics: pics.slice(0, 4), pi });
  });
  return s._pg = out;
}

/* ---------- progress ---------- */
const KEY = 'lughati-book.v1';
const DEF = { read: {}, words: {}, stk: [], stars: 0, shelf: null, sfx: true, srate: 1, tr: true, last: null, days: {}, streak: 0, lastDay: 0 };
let G = Object.assign({}, DEF);
try { const r = JSON.parse(localStorage.getItem(KEY) || 'null'); if (r) G = Object.assign({}, DEF, r); } catch (e) { }
delete G.read['[object Object]'];
let saveT = 0; const save = () => { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(G)); } catch (e) { } }, 150); };
const DAY = () => { const d = new Date(); return Math.floor((d - d.getTimezoneOffset() * 6e4) / 864e5); };
function touchDay() { const d = DAY(); if (G.lastDay !== d) { G.streak = G.lastDay === d - 1 ? G.streak + 1 : 1; G.lastDay = d; } }
const RS = x => { const id = typeof x === 'string' ? x : x.id; return G.read[id] || (G.read[id] = { page: 0, best: 0, done: 0 }); };
const wid = (s, v) => s.id + ':' + v.k;
function meetWord(s, v) { const k = wid(s, v); if (!G.words[k]) { G.words[k] = { t: Date.now(), ok: 0, bad: 0 }; save(); } }
const STICKERS = '🦄🐳🦋🌈🍩🚀🐙🦖🍉🎈🐝🌻🍭🐢🦜🎠🧁🐬🍦🦒🐞🌟🎡🐨🦔🍓🐠🪁🦩🍪🐣🌵🦕🐿️🍒🎪🐌🦀🍕🛸'.match(/\p{Extended_Pictographic}(️)?/gu);
const shelf = () => SBY[G.shelf] || SHELVES[0];

/* ---------- audio ---------- */
const enSay = w => String(w).replace(/-[^-]*-/g, '').replace(/\s\+.*$/, '').replace(/\bsb\b/g, 'somebody').replace(/\bsth\b/g, 'something').replace(/[؀-ۿ()\[\]]/g, '').replace(/\s+/g, ' ').trim().replace(/^[ ,.;:]+|[ ,.;:]+$/g, '');
const enKey = w => enSay(w).toLowerCase().replace(/’/g, "'").replace(/[^a-z0-9' -]/g, ' ').trim();
const AU = D.au || { e: {} };
const PACKS = {}, PWAIT = {}, URLS = {};
window.__wp = (name, obj) => { PACKS[name] = obj; (PWAIT[name] || []).forEach(f => f()); delete PWAIT[name]; };
function loadPack(name) { return new Promise(res => { if (PACKS[name]) return res(); if (PWAIT[name]) return PWAIT[name].push(res); PWAIT[name] = [res]; const sc = document.createElement('script'); sc.src = 'wp/' + name + '.js'; sc.onerror = () => { (PWAIT[name] || []).forEach(f => f()); delete PWAIT[name]; }; document.head.appendChild(sc); }); }
async function clipUrl(w) {
  const id = AU.e[enKey(w)]; if (!id) return null; if (URLS[id]) return URLS[id];
  const name = 'e' + id[0]; await loadPack(name); const b = PACKS[name]?.[id]; if (!b) return null;
  const bin = atob(b), u = new Uint8Array(bin.length); for (let j = 0; j < bin.length; j++) u[j] = bin.charCodeAt(j);
  return URLS[id] = URL.createObjectURL(new Blob([u], { type: 'audio/webm' }));
}
const wa = new Audio(); wa.preload = 'auto';
let enVoice = null; try { const pv = () => { const v = speechSynthesis.getVoices(); enVoice = v.find(x => /^en[-_]US/i.test(x.lang)) || v.find(x => /^en/i.test(x.lang)) || null; }; pv(); speechSynthesis.onvoiceschanged = pv; } catch (e) { }
function tts(text, rate = .8) { return new Promise(res => { const C = window.Capacitor?.Plugins?.TextToSpeech; if (C) { C.speak({ text, lang: 'en-US', rate, volume: 1, category: 'ambient' }).then(res, res); return; } try { const u = new SpeechSynthesisUtterance(text); if (enVoice) u.voice = enVoice; u.lang = 'en-US'; u.rate = rate; u.onend = res; u.onerror = res; speechSynthesis.speak(u); setTimeout(res, 6000); } catch (e) { res(); } }); }
let sayTok = 0;
async function sayWord(w, rate = 1) {
  stopStory(); const my = ++sayTok; try { wa.pause(); } catch (e) { }
  const url = await clipUrl(w); if (my !== sayTok) return;
  if (!url) return tts(enSay(w), .8 * rate);
  return new Promise(res => { let done = false; const fin = () => { if (!done) { done = true; res(); } }; wa.onended = fin; wa.onerror = fin; wa.src = url; wa.playbackRate = rate; wa.play().catch(fin); setTimeout(fin, 7000); });
}
const SA = new Audio(); SA.preload = 'auto'; let saRaf = 0, saEnd = null, saSrc = '', saOnEnd = null;
function stopStory() { try { SA.pause(); } catch (e) { } cancelAnimationFrame(saRaf); saEnd = null; }
let AC = null;
function tone(f, t0, dur, type = 'sine', vol = .15) { if (!G.sfx) return; try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + t0; o.type = type; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .015); g.gain.exponentialRampToValueAtTime(.0008, t + dur); o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + dur + .05); } catch (e) { } }
const SFX = { ok: () => { tone(660, 0, .14, 'triangle'); tone(990, .09, .22, 'triangle'); }, no: () => { tone(300, 0, .18, 'sine', .1); tone(240, .12, .22, 'sine', .08); }, page: () => { tone(900, 0, .05, 'sine', .05); tone(1300, .04, .06, 'sine', .04); }, pop: () => tone(880, 0, .08, 'sine', .12), win: () => [523, 659, 784, 1046, 1318].forEach((f, k) => tone(f, k * .11, .35, 'triangle', .14)), star: () => [988, 1318].forEach((f, k) => tone(f, k * .08, .2, 'triangle', .12)) };
function toast(msg) { $$('.toast').forEach(t => t.remove()); const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2400); }
function confetti() {
  if (reduce) return; const c = document.createElement('canvas'); c.className = 'confetti'; document.body.appendChild(c);
  const dpr = devicePixelRatio || 1; c.width = innerWidth * dpr; c.height = innerHeight * dpr; const x = c.getContext('2d'); x.scale(dpr, dpr);
  const cols = ['#7C5CFF', '#16C79A', '#FFC23D', '#FF6B6B', '#3BB2FF'];
  const ps = Array.from({ length: 140 }, () => ({ x: innerWidth / 2 + (Math.random() - .5) * 120, y: innerHeight * .35, vx: (Math.random() - .5) * 13, vy: -Math.random() * 13 - 4, r: Math.random() * 6 + 4, a: Math.random() * 6, va: (Math.random() - .5) * .4, c: rnd(cols) }));
  const t0 = performance.now(); (function f(t) { x.clearRect(0, 0, innerWidth, innerHeight); ps.forEach(p => { p.vy += .32; p.x += p.vx; p.y += p.vy; p.a += p.va; x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.fillStyle = p.c; x.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); x.restore(); }); if (t - t0 < 2600) requestAnimationFrame(f); else c.remove(); })(t0);
}
function flyStar(from) { if (reduce) return; const r = from.getBoundingClientRect(), to = $('#starcount')?.getBoundingClientRect(); const s = document.createElement('div'); s.className = 'flystar'; s.innerHTML = I.star; s.style.left = r.left + r.width / 2 - 18 + 'px'; s.style.top = r.top + 'px'; document.body.appendChild(s); requestAnimationFrame(() => { if (to) s.style.transform = `translate(${to.left - r.left - r.width / 2 + 18}px,${to.top - r.top}px) scale(.6)`; s.style.opacity = .2; }); setTimeout(() => s.remove(), 800); }

/* ---------- shell ---------- */
let TAB = 'lib';
const TABS = [['lib', 'المكتبة', I.shelf], ['play', 'ملعب بوبو', I.joy], ['dict', 'القاموس', I.search], ['words', 'كلماتي', I.box], ['album', 'ملصقاتي', I.sticker]];
function shell(inner) {
  document.body.classList.toggle('kid', !!shelf().kid);
  app.innerHTML = `<header class="top"><div class="in"><span class="brand">${OWL('happy', 44)}<b>لُغتي</b></span><span class="grow"></span>
      <span class="chip" title="نجوم">${I.star}<span class="num">${G.stars}</span></span><span class="chip st" title="ملصقات">🎟️<span class="num">${G.stk.length}</span></span></div></header>
    <main class="wrap">${inner}</main>
    <nav class="tabs"><div class="in">${TABS.map(([k, n, ic]) => `<button class="tab" type="button" data-tab="${k}" ${TAB === k ? 'aria-current="page"' : ''}><span class="ti">${ic}</span>${n}</button>`).join('')}</div></nav>`;
  $$('[data-tab]').forEach(b => b.onclick = () => { TAB = b.dataset.tab; render(); scrollTo(0, 0); });
}
function render() { try { renderInner(); } catch (e) { console.error(e); if (!render.retry) { render.retry = 1; G.last = null; if (!SBY[G.shelf]) G.shelf = null; save(); try { renderInner(); } catch (e2) { console.error(e2); } render.retry = 0; } } }
function renderInner() { if (!G.shelf) return welcome(); ({ lib: viewLib, play: viewPlay, dict: viewDict, words: viewWords, album: viewAlbum }[TAB] || viewLib)(); }
function welcome() {
  document.body.classList.add('kid');
  app.innerHTML = `<main class="wrap" style="padding-top:22px"><section class="hello">${OWL('happy', 130)}<div class="bubble">أهلاً! أنا <b>بوبو</b> 🦉<br>عندي مكتبة مليانة قصص بالإنجليزي. أي رفّ بدك نفتح؟</div></section>
    <section class="shelves">${SHELVES.map((s, k) => `<button class="shelfbtn c${k}" type="button" data-s="${s.k}"><span class="wi">${s.icon}</span><span class="grow"><b>${s.name}</b><small>${s.sub} · ${AR(s.list.length)} ${s.gram ? 'درس' : 'قصة'}</small></span><span class="go">←</span></button>`).join('')}</section></main>`;
  $$('[data-s]').forEach(b => b.onclick = () => { G.shelf = b.dataset.s; save(); SFX.win(); render(); });
}

/* ---------- library ---------- */
function nextStory(sh) { return sh.list.find(s => !G.read[s.id]?.done) || sh.list[0]; }
const shelfNav = sh => `<section class="shelfnav">${SHELVES.map((s, k) => `<button class="sn c${k}" type="button" data-s="${s.k}" aria-pressed="${s.k === sh.k}">${s.icon} ${s.name}</button>`).join('')}</section>`;
function viewLib() {
  if (shelf().gram) return viewGramLib();
  const sh = shelf(), cont = G.last && STORY.get(G.last) && !G.read[G.last]?.done ? STORY.get(G.last) : null, nx = nextStory(sh);
  const feat = cont || nx, fp = pages(feat).length, rs = G.read[feat.id] || { page: 0 };
  shell(`${shelfNav(sh)}
    <section class="feature c${feat.ix % 5}">
      ${sh.kid ? `<div class="fowl">${OWL('happy', 74)}<div class="bubble sm">${cont ? 'نكمّل القصة؟ 📖' : 'جاهز لقصة جديدة؟ ✨'}</div></div>` : ''}
      <div class="fbook"><div class="fcover"><span>${cover(feat)}</span></div><div class="grow"><div class="k">${cont ? 'كمّل القراءة' : 'القصة الجاية'} · ${AR(feat.ix + 1)}</div><h1>${esc(noTash(feat.ar))}</h1><div class="en">${esc(feat.en)}</div>
        ${rs?.page ? `<div class="pbar"><i style="width:${Math.round(100 * rs.page / fp)}%"></i></div>` : ''}</div></div>
      <button class="btn big" type="button" data-open="${feat.id}">${I.play} ${cont ? 'كمّل من الصفحة ' + AR(rs.page + 1) : 'افتح الكتاب'}</button>
      <button class="btn ghost" type="button" data-words="${feat.id}">🎧 اسمع كلمات القصة بس</button>
    </section>
    <section class="sec"><div class="sec-h"><h2>${sh.icon} ${sh.name}</h2><span class="muted num">${AR(sh.list.filter(s => G.read[s.id]?.done).length)}/${AR(sh.list.length)}</span></div>
      <div class="books">${sh.list.map(s => { const r = G.read[s.id]; return `<button class="book c${s.ix % 5} ${r?.done ? 'done' : ''} ${s === nx ? 'nx' : ''}" type="button" data-open="${s.id}"><span class="spine"></span><span class="be">${cover(s)}</span><span class="bt">${esc(noTash(s.ar))}</span>${r?.done ? `<span class="ribbon">${'★'.repeat(r.best || 1)}</span>` : r?.page ? `<span class="ribbon prog">${AR(Math.round(100 * r.page / pages(s).length))}٪</span>` : s === nx ? '<span class="ribbon new">جديدة</span>' : ''}</button>`; }).join('')}</div></section>`);
  $$('[data-s]').forEach(b => b.onclick = () => { G.shelf = b.dataset.s; save(); SFX.page(); render(); });
  $$('[data-open]').forEach(b => b.onclick = () => openBook(STORY.get(b.dataset.open)));
  $$('[data-words]').forEach(b => b.onclick = () => storyWords(STORY.get(b.dataset.words)));
}

/* ---------- the reader ---------- */
let R = null;
const SCENES = ['sky', 'meadow', 'sunset', 'sea', 'night'];
function openBook(s, from) {
  touchDay(); const pg = pages(s), rs = RS(s); G.last = s.id; save();
  R = { s, pg, p: from ?? (rs.page && rs.page < pg.length ? rs.page : 0), playing: false, auto: false, q: 0, qok: 0, asked: new Set(), kid: !!SBY[s.sk].kid };
  document.body.style.overflow = 'hidden';
  let d = $('.reader'); if (!d) { d = document.createElement('div'); d.className = 'reader'; document.body.appendChild(d); }
  drawPage();
  [...new Set(vocab(s).map(v => AU.e[enKey(v.w)]).filter(Boolean).map(id => 'e' + id[0]))].forEach(loadPack);
}
function closeBook() { stopStory(); try { GA.pause(); } catch (e) { } sayTok++; try { wa.pause(); } catch (e) { } $$('.reader,.pop,.scrim').forEach(e => e.remove()); document.body.style.overflow = ''; R = null; render(); }
function sceneHtml(pg) {
  const sc = SCENES[(R.s.ix + pg.pi) % SCENES.length], spots = [[18, 30], [62, 18], [40, 52], [76, 56]];
  const pics = pg.pics.length ? pg.pics : [cover(R.s)];
  return `<div class="scene ${sc}"><span class="sun"></span><span class="cloud c1"></span><span class="cloud c2"></span><span class="ground"></span>
    ${pics.map((e, k) => `<button class="actor" type="button" data-actor="${k}" style="right:${spots[k][0]}%;top:${spots[k][1]}%;animation-delay:${-k * .7}s">${e}</button>`).join('')}
    ${R.kid ? `<span class="peek">${OWL('happy', 64)}</span>` : ''}</div>`;
}
function drawPage() {
  if (!R || !R.s || !$('.reader')) return;
  const { s, pg: all } = R, pg = all[R.p], d = $('.reader'); const rs = RS(s);
  rs.page = Math.max(rs.page || 0, R.p); save();
  pg.words.forEach(v => meetWord(s, v));
  d.className = 'reader c' + (s.ix % 5) + (R.kid ? ' kid' : '');
  d.innerHTML = `<div class="rin">
    <div class="rtop"><button class="x" type="button" id="close" aria-label="سكّر الكتاب">${I.close}</button>
      <div class="grow" style="min-width:0"><b class="rtitle">${esc(noTash(s.ar))}</b><div class="pbar"><i style="width:${Math.round(100 * (R.p + 1) / all.length)}%"></i></div></div>
      <button class="x" type="button" id="wordsbtn" aria-label="كلمات القصة" title="كلمات القصة">🎧</button><span class="chip" id="starcount">${I.star}<span class="num">${R.qok}</span></span></div>
    <div class="pagewrap" id="pw">${sceneHtml(pg)}
      <div class="text">
        <p class="en sent" id="sent">${pg.tk.map((t, k) => `<span class="t ${t.v ? 'v' : ''}" data-k="${k}">${esc(t.t)}</span>`).join(' ')}</p>
        ${G.tr || R.kid ? `<p class="ar tr">${esc(pg.ar)}</p>` : `<p class="ar tr hid" id="trh">اضغط لتشوف الترجمة</p>`}
        <div class="pnum num">${AR(R.p + 1)} / ${AR(all.length)}</div>
      </div></div>
  </div>
  <div class="rdock"><div class="in">
    <button class="rbtn" type="button" id="prev" ${R.p === 0 ? 'disabled' : ''} aria-label="الصفحة السابقة">${I.prev}</button>
    <button class="rbtn small ${R.auto ? 'on' : ''}" type="button" id="auto" aria-label="قراءة تلقائية" title="قراءة تلقائية">${I.auto}</button>
    <button class="rbtn main" type="button" id="playp" aria-label="${R.playing ? 'وقّف' : 'اقرأ الصفحة'}">${R.playing ? I.pause : I.play}</button>
    <button class="rbtn small" type="button" id="slow" aria-label="أبطأ" title="سرعة القراءة">${I.turtle}<span class="num">${G.srate === 1 ? '' : G.srate}</span></button>
    <button class="rbtn" type="button" id="next" aria-label="الصفحة التالية">${I.next}</button>
  </div></div>`;
  $('#close').onclick = () => { stopStory(); closeBook(); };
  $('#wordsbtn').onclick = () => { stopStory(); R.playing = false; R.auto = false; drawDock(); storyWords(s, true); };
  $('#prev').onclick = () => turn(-1);
  $('#next').onclick = () => turn(1);
  $('#playp').onclick = () => { if (R.playing) { R.auto = false; stopStory(); R.playing = false; drawDock(); } else readPage(); };
  $('#auto').onclick = () => { R.auto = !R.auto; drawDock(); if (R.auto && !R.playing) readPage(); toast(R.auto ? 'القراءة التلقائية شغّالة: الكتاب بيقلب لحاله' : 'القراءة التلقائية وقفت'); };
  $('#slow').onclick = () => { G.srate = G.srate === 1 ? .8 : G.srate === .8 ? .65 : 1; save(); drawDock(); toast(G.srate === 1 ? 'سرعة عادية' : G.srate === .8 ? 'أبطأ شوي' : 'بطيء كتير'); };
  const th = $('#trh'); if (th) th.onclick = () => { th.textContent = pg.ar; th.classList.remove('hid'); };
  $$('#sent .t', d).forEach(sp => sp.onclick = () => tapWord(pg, +sp.dataset.k, sp));
  $$('.actor', d).forEach(a => a.onclick = () => { const e = a.textContent; const v = pg.words.find(x => x.emo === e) || vocab(s).find(x => x.emo === e); a.classList.remove('boing'); void a.offsetWidth; a.classList.add('boing'); SFX.pop(); if (v) { sayWord(v.w); bubbleOn(a, v); } });
  swipe($('#pw'));
  if (R.auto) setTimeout(() => R && R.pg[R.p] === pg && !R.playing && readPage(), 350);
}
function drawDock() { const pp = $('#playp'); if (!pp) return; pp.innerHTML = R.playing ? I.pause : I.play; $('#auto').classList.toggle('on', R.auto); $('#slow').innerHTML = I.turtle + `<span class="num">${G.srate === 1 ? '' : G.srate}</span>`; }
function swipe(el) { let x0 = null; el.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true }); el.addEventListener('touchend', e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 60) turn(dx > 0 ? 1 : -1); }); }
function bubbleOn(anchor, v) {
  $$('.wbub').forEach(b => b.remove()); const r = anchor.getBoundingClientRect(), b = document.createElement('div'); b.className = 'wbub';
  b.innerHTML = `${v.emo ? `<span class="e">${v.emo}</span>` : ''}<span class="grow"><b class="en">${esc(v.w)}</b>${v.p ? `<small>${esc(v.p)}</small>` : ''}<span class="m">${esc(v.m)}</span></span>`;
  document.body.appendChild(b); const w = b.offsetWidth; b.style.left = Math.max(12, Math.min(innerWidth - w - 12, r.left + r.width / 2 - w / 2)) + 'px'; b.style.top = Math.max(10, r.top - b.offsetHeight - 10) + 'px';
  setTimeout(() => b.remove(), 3200);
}
function tapWord(pg, k, sp) {
  const t = pg.tk[k]; sp.classList.remove('tapped'); void sp.offsetWidth; sp.classList.add('tapped');
  if (R.playing) { R.auto = false; stopStory(); R.playing = false; drawDock(); }
  if (t.v) { sayWord(t.v.w); bubbleOn(sp, t.v); }
  else { const w = t.t.replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, ''); if (!w) return; sayWord(w); const e = emoOf(w) || emoOf(w.toLowerCase()); if (e) bubbleOn(sp, { w, m: '', emo: e, p: '' }); }
}
function readPage() {
  const { s } = R, pg = R.pg[R.p], i0 = pg.tk[0]?.gi, i1 = pg.tk[pg.tk.length - 1]?.gi, T = k => s.t[k] / 100;
  if (!s.a || i0 == null || i0 >= s.t.length) { R.playing = false; drawDock(); return toast('هالصفحة مكتوبة بس، بدون صوت'); }
  sayTok++; try { wa.pause(); } catch (e) { }
  if (saSrc !== s.a) { SA.src = s.a; saSrc = s.a; }
  SA.playbackRate = G.srate || 1;
  const st = Math.max(0, T(i0) - .15), en = i1 + 1 < s.t.length ? T(i1 + 1) - .08 : s.d;
  R.playing = true; drawDock();
  const els = $$('#sent .t');
  const go = () => { try { SA.currentTime = st; } catch (e) { } saEnd = en; SA.play().catch(() => { R.playing = false; drawDock(); }); cancelAnimationFrame(saRaf); let last = -1;
    const f = () => { if (!R) return; const t = SA.currentTime;
      if (saEnd != null && t >= saEnd) { stopStory(); els.forEach(e => { e.classList.remove('on'); }); R.playing = false; drawDock(); if (R.auto) setTimeout(() => R && R.auto && turn(1), 700); return; }
      let idx = -1; for (let k = 0; k < pg.tk.length; k++) { const g = pg.tk[k].gi; if (g < s.t.length && T(g) <= t + .03) idx = k; else if (g < s.t.length) break; }
      if (idx !== last) { els.forEach((e, k) => { e.classList.toggle('on', k === idx); e.classList.toggle('read', k < idx); }); last = idx; const tk = pg.tk[idx]; if (tk?.v?.emo) { const a = [...$$('.actor')].find(x => x.textContent === tk.v.emo); if (a) { a.classList.remove('boing'); void a.offsetWidth; a.classList.add('boing'); } } }
      saRaf = requestAnimationFrame(f); };
    saRaf = requestAnimationFrame(f); };
  if (SA.readyState >= 1) go(); else { SA.addEventListener('loadedmetadata', go, { once: true }); SA.load(); }
}
function turn(dir) {
  if (!R) return; stopStory(); R.playing = false; $$('.wbub').forEach(b => b.remove());
  if (dir > 0) {
    const every = R.kid ? 3 : 4;
    if ((R.p + 1) % every === 0 && !R.asked.has(R.p)) { R.asked.add(R.p); const q = makeQuestion(); if (q) return ask(q, () => turn(1)); }
    if (R.p >= R.pg.length - 1) return finishBook();
    R.p++;
  } else { if (R.p === 0) return; R.p--; }
  SFX.page(); const pw = $('#pw'); if (pw && !reduce) { pw.classList.add(dir > 0 ? 'flipL' : 'flipR'); setTimeout(() => R && drawPage(), 180); } else drawPage();
}

/* ---------- Bubu's questions, about the pages just read ---------- */
function recentWords(n = 4) { const out = []; for (let k = R.p; k >= 0 && k > R.p - n; k--) R.pg[k].words.forEach(v => !out.includes(v) && out.push(v)); return out; }
function makeQuestion() {
  const { s } = R, rec = recentWords(R.kid ? 3 : 4), all = vocab(s), pg = R.pg[R.p];
  if (!rec.length) return null;
  const v = rnd(rec), others = (pred, n) => shuffle(all.filter(x => x !== v && pred(x))).slice(0, n);
  const kinds = [];
  if (v.emo && all.filter(x => x.emo && x.emo !== v.emo).length >= 2) kinds.push('pic', 'pic');
  kinds.push('hear', 'meaning');
  const shortPage = [...R.pg.slice(Math.max(0, R.p - 2), R.p + 1)].reverse().find(x => x.tk.length >= 3 && x.tk.length <= (R.kid ? 6 : 9));
  if (shortPage) kinds.push('order');
  if (!R.kid) kinds.push('gap');
  const k = rnd(kinds);
  if (k === 'pic') return { k, v, opts: shuffle([v, ...others(x => x.emo && x.emo !== v.emo, 2)]) };
  if (k === 'hear') return { k, v, opts: shuffle([v, ...others(x => x.k !== v.k, 2)]) };
  if (k === 'meaning') return { k, v, opts: shuffle([v, ...others(x => noTash(x.m) !== noTash(v.m), 2)]) };
  if (k === 'order') return { k, page: shortPage };
  if (k === 'gap') { const src = R.pg.slice(Math.max(0, R.p - 3), R.p + 1).filter(x => x.words.length).pop(); if (!src) return { k: 'meaning', v, opts: shuffle([v, ...others(x => x.m !== v.m, 2)]) }; const gv = rnd(src.words); return { k, v: gv, page: src, opts: shuffle([gv, ...others(x => x.k !== gv.k, 2)]) }; }
  return null;
}
function ask(q, done) {
  const sc = document.createElement('div'); sc.className = 'scrim'; const p = document.createElement('div'); p.className = 'pop qpop';
  const head = `<div class="qhead">${OWL('happy', 70)}<div class="bubble sm">${q.k === 'pic' ? 'اسمع… وين هي؟ 👀' : q.k === 'hear' ? 'شو الكلمة اللي سمعتها؟ 👂' : q.k === 'meaning' ? 'تذكّر من القصة: شو معنى' : q.k === 'order' ? 'رتّب الجملة متل ما سمعتها 🧩' : 'كمّل الجملة من القصة ✏️'}${q.k === 'meaning' ? ` <b class="en">${esc(q.v.w)}</b>؟` : ''}</div></div>`;
  let body = '';
  if (q.k === 'pic') body = `<div class="row" style="justify-content:center"><button class="say" type="button" id="qs">${I.spk}</button></div><div class="qopts pics">${q.opts.map((o, k) => `<button class="qo pic" type="button" data-k="${k}">${o.emo}</button>`).join('')}</div>`;
  if (q.k === 'hear') body = `<div class="row" style="justify-content:center"><button class="say" type="button" id="qs">${I.spk}</button></div><div class="qopts">${q.opts.map((o, k) => `<button class="qo en" type="button" data-k="${k}">${esc(o.w)}</button>`).join('')}</div>`;
  if (q.k === 'meaning') body = `<div class="qopts">${q.opts.map((o, k) => `<button class="qo" type="button" data-k="${k}">${o.emo ? o.emo + ' ' : ''}${esc(o.m)}</button>`).join('')}</div>`;
  if (q.k === 'gap') { const t = q.page.tk.map(x => x.v === q.v ? '<span class="gap">?</span>' : esc(x.t)).join(' ').replace(/(<span class="gap">\?<\/span>\s*)+/, '<span class="gap">?</span> '); body = `<p class="en qsent">${t}</p><div class="qopts">${q.opts.map((o, k) => `<button class="qo en" type="button" data-k="${k}">${esc(o.w)}</button>`).join('')}</div>`; }
  if (q.k === 'order') { const toks = q.page.tk.map(x => x.t); body = `<div class="sline en" id="sl"></div><div class="gbank en" id="gb">${shuffle(toks.map((t, k) => ({ t, k }))).map(o => `<button class="gt" type="button" data-t="${o.k}">${esc(o.t)}</button>`).join('')}</div>`; }
  p.innerHTML = `<div class="in">${head}${body}<button class="btn ghost sm" type="button" id="skipq" style="justify-self:center">تخطّى السؤال</button></div>`;
  document.body.append(sc, p);
  const end = () => { sc.remove(); p.remove(); done(); };
  $('#skipq', p).onclick = end;
  const qs = $('#qs', p); if (qs) { qs.onclick = () => sayWord(q.v.w); setTimeout(() => sayWord(q.v.w), 250); }
  const result = (ok, el, ans) => {
    R.q++; if (ok) { R.qok++; G.stars++; SFX.ok(); SFX.star(); flyStar(el); } else SFX.no();
    if (q.v) { const w = G.words[wid(R.s, q.v)]; if (w) { ok ? w.ok++ : w.bad++; } }
    save();
    const f = document.createElement('div'); f.className = 'qfb ' + (ok ? 'ok' : 'no');
    f.innerHTML = `${OWL(ok ? 'wow' : 'sad', 54)}<div class="grow"><b>${ok ? rnd(['برافو يا بطل!', 'شاطر!', 'صح عليك!', 'يا سلام!']) : rnd(['قريبة! ولا يهمك', 'بتصير معك!'])}</b>${ok ? '' : `<div>${ans}</div>`}</div><button class="btn sm" type="button" id="qc">كمّل ←</button>`;
    $('.in', p).appendChild(f); $('#skipq', p)?.remove(); $('#qc', f).onclick = end;
    if (ok) setTimeout(() => { if (p.isConnected) end(); }, 1600);
  };
  $$('.qo', p).forEach(b => b.onclick = () => {
    if (p.dataset.done) return; p.dataset.done = 1; const o = q.opts[+b.dataset.k], ok = o === q.v;
    $$('.qo', p).forEach(x => { x.disabled = true; if (q.opts[+x.dataset.k] === q.v) x.classList.add('ok'); }); if (!ok) b.classList.add('no');
    if (ok) sayWord(q.v.w);
    result(ok, b, `${q.v.emo || ''} <b class="en">${esc(q.v.w)}</b> = ${esc(q.v.m)}`);
  });
  if (q.k === 'order') {
    const toks = q.page.tk.map(x => x.t), placed = [];
    const paint = () => { $('#sl', p).innerHTML = placed.map((k, j) => `<button class="gt on" type="button" data-p="${j}">${esc(toks[k])}</button>`).join('') || '<span class="muted" style="font-family:var(--ar);font-size:15px">اضغط على الكلمات بالترتيب…</span>'; $$('#gb .gt', p).forEach(b => b.classList.toggle('used', placed.includes(+b.dataset.t))); $$('#sl .gt', p).forEach(b => b.onclick = () => { if (p.dataset.done) return; placed.splice(+b.dataset.p, 1); paint(); }); };
    $$('#gb .gt', p).forEach(b => b.onclick = () => { if (p.dataset.done || placed.includes(+b.dataset.t)) return; placed.push(+b.dataset.t); SFX.pop(); paint();
      if (placed.length === toks.length) { p.dataset.done = 1; const ok = norm(placed.map(k => toks[k]).join(' ')) === norm(toks.join(' ')); $('#sl', p).classList.add(ok ? 'good' : 'shake'); result(ok, $('#sl', p), `<span class="en">${esc(toks.join(' '))}</span>`); } });
    paint();
  }
}

/* ---------- end of the book ---------- */
function finishBook() {
  const { s } = R, rs = RS(s), first = !rs.done, stars = R.q ? (R.qok / R.q >= .9 ? 3 : R.qok / R.q >= .6 ? 2 : 1) : 3;
  rs.done = 1; rs.best = Math.max(rs.best || 0, stars); rs.page = 0;
  let sticker = null; if (first) { const left = STICKERS.filter(e => !G.stk.includes(e)); sticker = left.length ? rnd(left) : null; if (sticker) G.stk.push(sticker); G.stars += 5; }
  save(); stopStory();
  const v = vocab(s), d = $('.reader');
  d.className = 'reader c' + (s.ix % 5) + (R.kid ? ' kid' : '');
  d.innerHTML = `<div class="rin"><div class="theend">
    ${OWL('wow', 120)}<h1>${R.kid ? 'خلّصت الكتاب! 🎉' : 'خلصت القصة!'}</h1><div class="en muted">The End</div>
    <div class="bigstars">${[0, 1, 2].map(k => `<span class="${k < stars ? 'on' : ''}">${I.star}</span>`).join('')}</div>
    <p class="muted" style="margin:0">جاوبت ${AR(R.qok)} من ${AR(R.q)} سؤال لبوبو</p>
    ${sticker ? `<div class="newstk"><span>${sticker}</span><b>ملصق جديد لألبومك!</b></div>` : ''}
    <div class="sec-h" style="width:100%"><h2>كلمات القصة</h2><span class="muted num">${AR(v.length)}</span></div>
    <div class="wgrid">${v.slice(0, 24).map(x => `<button class="wcard" type="button" data-w="${esc(x.w)}">${x.emo ? `<span class="e">${x.emo}</span>` : ''}<b class="en">${esc(x.w)}</b><small>${esc(x.m)}</small></button>`).join('')}</div>
    <div style="display:grid;gap:12px;width:100%"><button class="btn" type="button" id="lib">للمكتبة ←</button><button class="btn ghost" type="button" id="again">اقرأها كمان</button></div>
  </div></div>`;
  SFX.win(); confetti();
  $$('.wcard', d).forEach(b => b.onclick = () => { sayWord(b.dataset.w); b.classList.remove('boing'); void b.offsetWidth; b.classList.add('boing'); });
  $('#lib').onclick = closeBook; $('#again').onclick = () => openBook(s, 0);
}

/* ---------- my words: flip cards + quick game ---------- */
function viewWords() {
  const list = Object.keys(G.words).map(k => { const i = k.indexOf(':'), s = STORY.get(k.slice(0, i)); const v = s && vocab(s).find(x => x.k === k.slice(i + 1)); return v ? { v, s, r: G.words[k] } : null; }).filter(Boolean).sort((a, b) => b.r.t - a.r.t);
  shell(`<section class="sec"><div class="sec-h"><h2>كلماتي</h2><span class="muted num">${AR(list.length)}</span></div>
    <p class="muted" style="margin:0">كل كلمة بتمرّ فيها بالقصص بتنحفظ هون. اضغط على الكرت ليقلب ويحكي.</p>
    ${list.length >= 4 ? `<button class="btn" type="button" id="wgame">${I.star} العب بكلماتي</button>` : ''}
    ${list.length ? `<div class="flips">${list.slice(0, 80).map((x, k) => `<button class="flip" type="button" data-k="${k}"><span class="fr">${x.v.emo ? `<span class="e">${x.v.emo}</span>` : ''}<b class="en">${esc(x.v.w)}</b></span><span class="bk">${esc(x.v.m)}</span></button>`).join('')}</div>`
      : `<div class="empty">${OWL('happy', 80)}<b>لسا ما في كلمات</b><span class="muted">افتح أول كتاب واضغط على الكلمات الملوّنة!</span></div>`}</section>`);
  $$('.flip').forEach(b => b.onclick = () => { b.classList.toggle('over'); if (b.classList.contains('over')) sayWord(list[+b.dataset.k].v.w); });
  const wg = $('#wgame'); if (wg) wg.onclick = () => wordGame(shuffle(list.sort((a, b) => (b.r.bad - b.r.ok) - (a.r.bad - a.r.ok)).slice(0, 20)).slice(0, 8));
}
function wordGame(items) {
  const all = items.map(x => x.v); let k = 0, ok = 0;
  R = { s: items[0].s, pg: [], p: 0, q: 0, qok: 0, asked: new Set(), kid: true };
  const step = () => {
    if (k >= items.length) { R = null; G.stars += ok; save(); SFX.win(); if (ok >= items.length - 1) confetti(); toast(`جاوبت ${AR(ok)} من ${AR(items.length)} 🌟`); render(); return; }
    const x = items[k++], v = x.v, pool = vocab(x.s).concat(all), others = (pred) => shuffle(pool.filter(y => y !== v && pred(y))).filter((y, j, a) => a.findIndex(z => z.k === y.k) === j).slice(0, 2);
    const q = v.emo && pool.filter(y => y.emo && y.emo !== v.emo).length >= 2 ? { k: 'pic', v, opts: shuffle([v, ...others(y => y.emo && y.emo !== v.emo)]) } : Math.random() < .5 ? { k: 'hear', v, opts: shuffle([v, ...others(y => y.k !== v.k)]) } : { k: 'meaning', v, opts: shuffle([v, ...others(y => noTash(y.m) !== noTash(v.m))]) };
    R.s = x.s; const before = R.qok; ask(q, () => { if (R.qok > before) ok++; step(); });
  };
  step();
}
function viewAlbum() {
  shell(`<section class="sec"><div class="sec-h"><h2>ألبوم الملصقات</h2><span class="muted num">${AR(G.stk.length)}/${AR(STICKERS.length)}</span></div>
    <p class="muted" style="margin:0">كل كتاب بتخلّصه لأول مرة بيعطيك ملصق جديد!</p>
    <div class="album">${STICKERS.map(e => `<span class="stk ${G.stk.includes(e) ? 'got' : ''}">${G.stk.includes(e) ? e : '?'}</span>`).join('')}</div></section>
    <section class="panel">
      <div class="setrow"><span class="grow">الترجمة العربية تحت كل صفحة</span><button class="switch" type="button" role="switch" id="tr" aria-checked="${G.tr}" aria-label="الترجمة"></button></div>
      <div class="setrow"><span class="grow">أصوات اللعبة</span><button class="switch" type="button" role="switch" id="sfx" aria-checked="${G.sfx}" aria-label="أصوات"></button></div>
      <div class="setrow"><span class="grow">أيام القراءة ورا بعض</span><b class="num">🔥 ${AR(G.lastDay >= DAY() - 1 ? G.streak : 0)}</b></div>
    </section>`);
  $('#tr').onclick = () => { G.tr = !G.tr; save(); render(); };
  $('#sfx').onclick = () => { G.sfx = !G.sfx; save(); render(); };
}

/* ---------- grammar picture-books ---------- */
G.gram = G.gram || {};
const rich = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b class="hl">$1</b>');
const isLatin = s => /^[\x00-\x7F’‘“”—–…]*$/.test(String(s).replace(/\*\*/g, ''));
const LVL = { A: 'المستوى ١', B: 'المستوى ٢', C: 'المستوى ٣' };
const GA = new Audio(); GA.preload = 'auto'; let gaRaf = 0, gaSrc = '';
function auKey(l, text) { if (!l.au) return null; const t = String(text).replace(/\*\*/g, ''); if (l.au[t]) return t; const n = norm(t); return Object.keys(l.au).find(k => norm(k) === n) || null; }
function playG(l, text, onWord) {
  stopStory(); sayTok++; try { wa.pause(); } catch (e) { } cancelAnimationFrame(gaRaf);
  const k = auKey(l, text); if (!k) return tts(String(text).replace(/\*\*/g, ''), .8);
  const [a, b, wt] = l.au[k], src = 'g/' + l.id + '.webm'; if (gaSrc !== src) { GA.src = src; gaSrc = src; }
  return new Promise(res => {
    const go = () => { try { GA.currentTime = a; } catch (e) { } GA.playbackRate = G.srate || 1; GA.play().catch(res); let last = -1;
      const f = () => { const t = GA.currentTime; if (t >= b || GA.paused) { GA.pause(); onWord && onWord(-1); return res(); }
        if (onWord && wt) { let idx = -1; for (let j = 0; j < wt.length; j++) { if (wt[j] <= t + .03) idx = j; else break; } if (idx !== last) { last = idx; onWord(idx); } }
        gaRaf = requestAnimationFrame(f); };
      gaRaf = requestAnimationFrame(f); };
    if (GA.readyState >= 1) go(); else { GA.addEventListener('loadedmetadata', go, { once: true }); GA.load(); }
    setTimeout(res, 12000);
  });
}
function gPages(l) {
  if (l._gp) return l._gp; const pg = [];
  pg.push({ t: 'intro' });
  let title = null, buf = [];
  const flush = () => { if (buf.length) pg.push({ t: 'talk', title, blocks: buf }); buf = []; };
  l.exp.forEach(([k, x]) => { if (k === 'h') { flush(); title = x; return; } if (k === 'li') { buf.push([k, x]); return; } if (buf.length && buf[buf.length - 1][0] !== 'li') flush(); else if (buf.length) flush(); buf.push([k, x]); });
  flush();
  if (l.table && l.table.length) pg.push({ t: 'table' });
  (l.rule || []).forEach(r => pg.push({ t: 'sounds', r }));
  (l.ex || []).slice(0, 6).forEach((e, k) => pg.push({ t: 'ex', e, emo: l.emo?.[k] || l.node || '📘' }));
  (l.tip || []).slice(0, 3).forEach(tp => pg.push({ t: 'oops', tp }));
  return l._gp = pg;
}
function viewGramLib() {
  const sh = SBY.G, nx = GL.find(l => !G.gram[l.id]) || GL[0];
  shell(`${shelfNav(sh)}
    <section class="feature c${nx.ix % 5}">
      <div class="fowl">${OWL('happy', 74)}<div class="bubble sm">تعال أعلّمك قاعدة جديدة! 🧩</div></div>
      <div class="fbook"><div class="fcover"><span>${esc(nx.node || '📘')}</span></div><div class="grow"><div class="k">${LVL[nx.lv]} · ${nx.k === 'p' ? 'نطق' : 'قواعد'}</div><h1>${esc(nx.ar)}</h1><div class="en">${esc(nx.en)}</div></div></div>
      <button class="btn big" type="button" data-gopen="${nx.id}">${I.play} افتح الدرس</button>
    </section>
    ${['A', 'B', 'C'].map(lv => { const ls = GL.filter(l => l.lv === lv); if (!ls.length) return ''; return `<section class="sec"><div class="sec-h"><h2>🧩 ${LVL[lv]}</h2><span class="muted num">${AR(ls.filter(l => G.gram[l.id]).length)}/${AR(ls.length)}</span></div>
      <div class="books">${ls.map(l => { const r = G.gram[l.id]; return `<button class="book c${l.ix % 5} ${r ? 'done' : ''} ${l === nx ? 'nx' : ''}" type="button" data-gopen="${l.id}"><span class="be">${esc(l.node || '📘')}</span><span class="bt">${esc(l.ar)}</span>${r ? `<span class="ribbon">${'★'.repeat(r.best || 1)}</span>` : l === nx ? '<span class="ribbon new">جديد</span>' : ''}${l.k === 'p' ? '<span class="tag">🔊 نطق</span>' : ''}</button>`; }).join('')}</div></section>`; }).join('')}`);
  $$('[data-s]').forEach(b => b.onclick = () => { G.shelf = b.dataset.s; save(); SFX.page(); render(); });
  $$('[data-gopen]').forEach(b => b.onclick = () => openGram(LBY.get(b.dataset.gopen)));
}
function openGram(l) {
  touchDay(); R = { g: l, pg: gPages(l), p: 0, q: 0, qok: 0, kid: true, playing: false };
  document.body.style.overflow = 'hidden';
  let d = $('.reader'); if (!d) { d = document.createElement('div'); d.className = 'reader'; document.body.appendChild(d); }
  drawG();
}
function talkHtml(blocks) {
  let h = '', ul = false;
  blocks.forEach(([k, x]) => { if (k === 'li') { if (!ul) { h += '<ul>'; ul = true; } h += `<li>${rich(x)}</li>`; return; } if (ul) { h += '</ul>'; ul = false; } h += k === 'note' ? `<div class="note">💡 ${rich(x)}</div>` : `<p>${rich(x)}</p>`; });
  return h + (ul ? '</ul>' : '');
}
function drawG() {
  if (!R || !R.g || !$('.reader')) return;
  const { g: l, pg: all } = R, pg = all[R.p], d = $('.reader');
  d.className = 'reader kid c' + (l.ix % 5);
  let body = '', audio = null;
  if (pg.t === 'intro') body = `<div class="scene ${['sky', 'meadow', 'sunset', 'sea'][l.ix % 4]}"><span class="sun"></span><span class="cloud c1"></span><span class="cloud c2"></span><span class="ground"></span><span class="actor" style="right:38%;top:22%;font-size:clamp(70px,22vw,110px)">${esc(l.node || '📘')}</span><span class="peek">${OWL('wow', 70)}</span></div>
    <div class="text" style="text-align:center"><span class="lvtag">${LVL[l.lv]} · ${l.k === 'p' ? 'درس نطق 🔊' : 'درس قواعد 🧩'}</span><h1 style="font-size:28px">${esc(l.ar)}</h1><div class="en muted" style="font-size:17px">${esc(l.en)}</div></div>`;
  if (pg.t === 'talk') body = `<div class="talk">${OWL('happy', 86)}<div class="tbub">${pg.title ? `<h2>${rich(pg.title)}</h2>` : ''}${talkHtml(pg.blocks)}</div></div>`;
  if (pg.t === 'table') body = `<div class="talk">${OWL('happy', 70)}<div class="tbub"><h2>الجدول 📋</h2><div class="tbl"><table>${l.table.map((r, k) => `<tr>${r.map(c => k ? `<td dir="auto">${rich(c)}</td>` : `<th dir="auto">${rich(c)}</th>`).join('')}</tr>`).join('')}</table></div></div></div>`;
  if (pg.t === 'sounds') body = `<div class="talk">${OWL('happy', 70)}<div class="tbub"><h2>اسمع 🔊</h2><p>${rich(pg.r[0])}</p><div class="chipsw">${pg.r[1].map(w => `<button class="wchip en" type="button" data-gw="${esc(w)}">${emoOf(w) ? emoOf(w) + ' ' : ''}${esc(w)}</button>`).join('')}</div></div></div>`;
  if (pg.t === 'ex') { audio = pg.e[0]; body = `<div class="scene ${['meadow', 'sky', 'sea', 'sunset', 'night'][R.p % 5]}"><span class="sun"></span><span class="cloud c1"></span><span class="ground"></span><span class="actor" style="right:36%;top:20%;font-size:clamp(70px,22vw,110px)">${esc(pg.emo)}</span></div>
    <div class="text"><div class="mini">مثال 👇</div><p class="en sent" id="sent">${String(pg.e[0]).replace(/\*\*/g, '').split(/\s+/).map((t, k) => `<span class="t" data-k="${k}">${esc(t)}</span>`).join(' ')}</p><p class="ar tr">${rich(pg.e[1])}</p></div>`; }
  if (pg.t === 'oops') { audio = pg.tp[1]; body = `<div class="talk">${OWL('wow', 80)}<div class="tbub"><h2>بوبو لقط غلطة! 🕵️</h2>
    <div class="oops no en">✗ ${esc(pg.tp[0])}</div><div class="oops ok en">✓ ${esc(pg.tp[1])}</div><p class="muted">${rich(pg.tp[2])}</p></div></div>`; }
  d.innerHTML = `<div class="rin">
    <div class="rtop"><button class="x" type="button" id="close" aria-label="سكّر">${I.close}</button>
      <div class="grow" style="min-width:0"><b class="rtitle">${esc(l.ar)}</b><div class="pbar"><i style="width:${Math.round(100 * (R.p + 1) / (all.length + 1))}%"></i></div></div>
      <button class="btn sm" type="button" id="tochal">🎮 للتحدي</button></div>
    <div class="pagewrap" id="pw">${body}</div></div>
  <div class="rdock"><div class="in">
    <button class="rbtn" type="button" id="prev" ${R.p === 0 ? 'disabled' : ''} aria-label="السابقة">${I.prev}</button>
    <button class="rbtn main" type="button" id="playp" ${audio ? '' : 'disabled'} aria-label="اسمع">${I.spk}</button>
    <button class="rbtn ${R.p === all.length - 1 ? 'on' : ''}" type="button" id="next" aria-label="التالية">${R.p === all.length - 1 ? '🎮' : I.next}</button>
  </div></div>`;
  $('#close').onclick = closeBook;
  $('#tochal').onclick = () => gChallenge();
  $('#prev').onclick = () => { if (R.p > 0) { R.p--; SFX.page(); drawG(); } };
  $('#next').onclick = () => { if (R.p < all.length - 1) { R.p++; SFX.page(); drawG(); } else gChallenge(); };
  const pl = $('#playp'); if (audio) { pl.onclick = () => sayEx(l, audio); if (pg.t === 'ex') setTimeout(() => R && R.pg?.[R.p] === pg && sayEx(l, audio), 350); }
  $$('[data-gw]').forEach(b => b.onclick = () => { b.classList.remove('boing'); void b.offsetWidth; b.classList.add('boing'); playG(l, b.dataset.gw); });
  $$('.actor').forEach(a => a.onclick = () => { a.classList.remove('boing'); void a.offsetWidth; a.classList.add('boing'); SFX.pop(); if (audio) sayEx(l, audio); });
  swipe($('#pw'));
}
function sayEx(l, text) { const els = $$('#sent .t'); return playG(l, text, idx => els.forEach((e, k) => { e.classList.toggle('on', k === idx); e.classList.toggle('read', idx >= 0 && k < idx); })); }
/* ---------- grammar challenge: one question per screen, kid style ---------- */
function gQuestions(l) {
  const out = [], per = {};
  if (l.k === 'p') {
    (l.q || []).forEach(q => out.push({ q }));
    if (l.cls) shuffle(l.cls.items).slice(0, 4).forEach(it => out.push({ cls: it }));
    shuffle(l.sil || []).slice(0, 2).forEach(it => out.push({ sil: it }));
    shuffle(l.stress || []).slice(0, 2).forEach(it => out.push({ stress: it }));
    return shuffle(out).slice(0, 8);
  }
  const RANK = { rule: 0, mc: 1, pick: 1, gap: 2, fix: 2, ord: 3, tr: 3 };
  shuffle(l.q || []).filter(q => { per[q[0]] = (per[q[0]] || 0) + 1; return per[q[0]] <= 2; }).slice(0, 7).sort((a, b) => RANK[a[0]] - RANK[b[0]]).forEach(q => out.push({ q }));
  shuffle(l.tip || []).slice(0, 1).forEach(tp => out.splice(2, 0, { tf: tp, show: Math.random() < .5 }));
  return out;
}
function gChallenge() {
  const l = R.g, qs = gQuestions(l); let k = 0; R.q = 0; R.qok = 0;
  const d = $('.reader'); d.innerHTML = `<div class="rin"><div class="theend" style="padding-top:40px">${OWL('wow', 120)}<h1>وقت التحدي! 🎮</h1><p class="muted" style="margin:0">${AR(qs.length)} أسئلة. كل جواب صح = نجمة ⭐</p><div class="chip" id="starcount" style="font-size:20px">${I.star}<span class="num">0</span></div></div></div>`;
  $$('.rdock').forEach(e => e.remove()); stopStory(); try { GA.pause(); } catch (e) { }
  const step = () => { if (!R) return; if (k >= qs.length) return gFinish(); const n = qs[k++]; gAsk(l, n, k, qs.length, ok => { R.q++; if (ok) { R.qok++; G.stars++; save(); } const sc = $('#starcount .num'); if (sc) sc.textContent = R.qok; step(); }); };
  setTimeout(step, 700);
}
const swapW = s => { const w = s.split(' '); if (w.length < 3) return null; const k = 1 + (Math.random() * (w.length - 2) | 0); [w[k - 1], w[k]] = [w[k], w[k - 1]]; const o = w.join(' '); return o === s ? null : o; };
const capF = t => /^I\b|^I'/.test(t) || (GD?.caps || []).includes(t.replace(/[^A-Za-z']/g, '')) ? t : t[0].toLowerCase() + t.slice(1);
function gAsk(l, n, k, total, done) {
  const sc = document.createElement('div'); sc.className = 'scrim'; const p = document.createElement('div'); p.className = 'pop qpop';
  let head = '', body = '', correct = null, opts = null, sayText = null, ans = '';
  const q = n.q;
  if (n.tf) { head = 'صح ولا غلط؟ 🤔'; const s = n.show ? n.tf[1] : n.tf[0]; body = `<div class="bigsent en">${esc(s)}</div><div class="tfb"><button class="qo tfx" type="button" data-tf="0">✗ غلط</button><button class="qo tfv" type="button" data-tf="1">✓ صح</button></div>`; sayText = n.tf[1]; ans = `<span class="en">${esc(n.tf[1])}</span>`; }
  else if (n.cls) { const [w, key] = n.cls, cats = l.cls.cats; head = 'اسمع… أي صوت؟ 👂'; correct = cats.find(c => c[0] === key)?.[1]; opts = cats.map(c => c[1]); sayText = w; body = `<div class="row" style="justify-content:center"><button class="say" type="button" id="qs">${I.spk}</button></div><div class="bigsent en">${esc(w)}</div>`; ans = rich(correct); }
  else if (n.sil) { const [w, sil] = n.sil; head = 'أي حرف ساكت وما بينلفظ؟ 🤫'; sayText = w; body = `<div class="row" style="justify-content:center"><button class="say" type="button" id="qs">${I.spk}</button></div><div class="letters en">${w.split('').map((c, j) => `<button class="lt" type="button" data-c="${j}">${esc(c)}</button>`).join('')}</div>`; ans = `<span class="en">${esc(sil.join(', '))}</span>`; }
  else if (n.stress) { const [w, syl] = n.stress, parts = syl.split('-'); head = 'وين الضغطة؟ اضغط على المقطع القوي 💥'; sayText = w; body = `<div class="row" style="justify-content:center"><button class="say" type="button" id="qs">${I.spk}</button></div><div class="letters en">${parts.map((x, j) => `<button class="lt wide" type="button" data-sy="${j}">${esc(x.toLowerCase())}</button>`).join('')}</div>`; ans = `<span class="en">${esc(syl)}</span>`; }
  else if (q[0] === 'mc' || q[0] === 'gap') {
    correct = q[2]; sayText = q[1].replace('___', correct).replace(/\s*\([^)]*\)/, '');
    if (q[0] === 'mc') opts = shuffle(q.slice(2)); else { const mine = new Set(q.slice(2).map(norm)), pool = []; l.q.forEach(o => { if (o !== q && (o[0] === 'gap' || o[0] === 'mc')) pool.push(...o.slice(2)); }); opts = shuffle([correct, ...[...new Set(shuffle(pool).filter(x => !mine.has(norm(x)) && x.split(' ').length <= 3))].slice(0, 2)]); }
    head = 'شو الكلمة الناقصة؟ 🧩'; body = `<div class="bigsent en">${esc(q[1]).replace(/\(([^)]*)\)/, '<small class="muted">($1)</small>').replace('___', '<span class="gap">?</span>')}</div>`; ans = `<span class="en">${esc(sayText)}</span>`;
  } else if (q[0] === 'pick') { correct = q[1]; opts = shuffle(q.slice(1)); head = 'أي جملة صح؟ ✅'; sayText = correct; ans = `<span class="en">${esc(correct)}</span>`; }
  else if (q[0] === 'fix') { correct = q[2]; opts = shuffle([...new Set([correct, q[1], swapW(correct)].filter(Boolean))]); head = 'في غلطة! شو التصحيح؟ 🕵️'; body = `<div class="bigsent en wrongs">${esc(q[1])}</div>`; sayText = correct; ans = `<span class="en">${esc(correct)}</span>`; }
  else if (q[0] === 'rule') { correct = q[2]; opts = shuffle(q.slice(2)); head = 'سؤال بوبو 🦉'; body = `<div class="bigsent" dir="auto" style="font-size:19px">${rich(q[1])}</div>`; ans = rich(correct); if (isLatin(correct)) sayText = correct; }
  else if (q[0] === 'ord' || q[0] === 'tr') {
    const answers = q[0] === 'tr' ? q.slice(2) : [q[1]], toks = answers[0].split(/\s+/).map((t, j) => j ? t : capF(t));
    let extra = []; if (q[0] === 'tr') { const have = new Set(toks.map(norm)); extra = shuffle([...new Set(l.q.flatMap(o => o[0] === 'ord' ? o[1].split(/\s+/) : []).map(t => t.replace(/[.,!?]+$/, '')).filter(t => t && !have.has(norm(t)) && !/^[A-Z]/.test(t)))]).slice(0, 2); }
    head = q[0] === 'tr' ? 'ترجم بالقطع 🧱' : 'رتّب الجملة 🧱'; sayText = answers[0]; ans = `<span class="en">${esc(answers[0])}</span>`;
    body = `${q[0] === 'tr' ? `<div class="bigsent" style="font-size:20px">${esc(q[1])}</div>` : ''}<div class="sline en" id="sl"></div><div class="gbank en" id="gb">${shuffle([...toks, ...extra].map((t, j) => ({ t, j }))).map(o => `<button class="gt" type="button" data-t="${o.j}">${esc(o.t)}</button>`).join('')}</div>${q[0] === 'tr' ? '<button class="btn sm" type="button" id="chk" style="justify-self:center">تحقّق ✓</button>' : ''}`;
    n._ord = { toks: [...toks, ...extra], need: toks.length, answers, tr: q[0] === 'tr' };
  }
  p.innerHTML = `<div class="in"><div class="qhead">${OWL('happy', 64)}<div class="bubble sm">${head}</div><span class="qn num">${AR(k)}/${AR(total)}</span></div>${body}${opts ? `<div class="qopts">${opts.map((o, j) => `<button class="qo ${isLatin(o) ? 'en' : ''}" type="button" data-k="${j}" dir="auto">${rich(o)}</button>`).join('')}</div>` : ''}</div>`;
  document.body.append(sc, p);
  const end = ok => { sc.remove(); p.remove(); done(ok); };
  const qs = $('#qs', p); if (qs) { qs.onclick = () => playG(l, sayText); setTimeout(() => playG(l, sayText), 300); }
  let fin = false;
  const result = (ok, el) => {
    if (fin) return; fin = true; if (ok) { SFX.ok(); SFX.star(); flyStar(el); } else SFX.no();
    if (sayText) setTimeout(() => playG(l, sayText), 250);
    const f = document.createElement('div'); f.className = 'qfb ' + (ok ? 'ok' : 'no');
    f.innerHTML = `${OWL(ok ? 'wow' : 'sad', 54)}<div class="grow"><b>${ok ? rnd(['برافو يا بطل!', 'شاطر!', 'صح عليك!', 'يا سلام!']) : rnd(['قريبة! ولا يهمك', 'بتصير معك!'])}</b>${ok ? '' : `<div>الصح: ${ans}</div>`}${n.tf ? `<div class="muted" style="font-size:14px">${rich(n.tf[2])}</div>` : ''}</div><button class="btn sm" type="button" id="qc">كمّل ←</button>`;
    $('.in', p).appendChild(f); $('#qc', f).onclick = () => end(ok); if (ok && !n.tf) setTimeout(() => p.isConnected && end(ok), 1800);
  };
  $$('.qo[data-k]', p).forEach(b => b.onclick = () => { if (fin) return; const o = opts[+b.dataset.k], ok = o === correct; $$('.qo[data-k]', p).forEach(x => { x.disabled = true; if (opts[+x.dataset.k] === correct) x.classList.add('ok'); }); if (!ok) b.classList.add('no'); result(ok, b); });
  $$('[data-tf]', p).forEach(b => b.onclick = () => { const ok = (b.dataset.tf === '1') === !!n.show; b.classList.add(ok ? 'ok' : 'no'); result(ok, b); });
  $$('[data-c]', p).forEach(b => b.onclick = () => { const w = n.sil[0], ok = n.sil[1].map(x => x.toLowerCase()).includes(w[+b.dataset.c].toLowerCase()); b.classList.add(ok ? 'ok' : 'no'); result(ok, b); });
  $$('[data-sy]', p).forEach(b => b.onclick = () => { const parts = n.stress[1].split('-'), hit = parts.findIndex(x => /[A-Z]/.test(x) && x === x.toUpperCase()), ok = +b.dataset.sy === hit; b.classList.add(ok ? 'ok' : 'no'); const r = $(`[data-sy="${hit}"]`, p); if (r) { r.textContent = parts[hit]; r.classList.add('ok'); } result(ok, b); });
  if (n._ord) {
    const O = n._ord, placed = [];
    const paint = () => { $('#sl', p).innerHTML = placed.map((j, i) => `<button class="gt on" type="button" data-p="${i}">${esc(O.toks[j])}</button>`).join('') || '<span class="muted" style="font-family:var(--ar);font-size:15px">اضغط على القطع بالترتيب…</span>'; $$('#gb .gt', p).forEach(b => b.classList.toggle('used', placed.includes(+b.dataset.t))); $$('#sl .gt', p).forEach(b => b.onclick = () => { if (fin) return; placed.splice(+b.dataset.p, 1); paint(); }); };
    const check = () => { const got = norm(placed.map(j => O.toks[j]).join(' ')), ok = O.answers.some(a => norm(a) === got); $('#sl', p).classList.add(ok ? 'good' : 'shake'); result(ok, $('#sl', p)); };
    $$('#gb .gt', p).forEach(b => b.onclick = () => { if (fin || placed.includes(+b.dataset.t)) return; placed.push(+b.dataset.t); SFX.pop(); paint(); if (!O.tr && placed.length === O.need) check(); });
    const ck = $('#chk', p); if (ck) ck.onclick = () => { if (!fin && placed.length) check(); };
    paint();
  }
}
function gFinish() {
  const l = R.g, prev = G.gram[l.id], stars = R.q ? (R.qok / R.q >= .9 ? 3 : R.qok / R.q >= .6 ? 2 : 1) : 3;
  G.gram[l.id] = { best: Math.max(prev?.best || 0, stars), done: 1 };
  let sticker = null; if (!prev) { const left = STICKERS.filter(e => !G.stk.includes(e)); sticker = left.length ? rnd(left) : null; if (sticker) G.stk.push(sticker); G.stars += 5; }
  save();
  const nx = GL[l.ix + 1], d = $('.reader');
  d.innerHTML = `<div class="rin"><div class="theend">${OWL('wow', 120)}<h1>تعلّمت قاعدة جديدة! 🎉</h1><div class="muted">${esc(l.ar)}</div>
    <div class="bigstars">${[0, 1, 2].map(k => `<span class="${k < stars ? 'on' : ''}">${I.star}</span>`).join('')}</div>
    <p class="muted" style="margin:0">جاوبت ${AR(R.qok)} من ${AR(R.q)}</p>
    ${sticker ? `<div class="newstk"><span>${sticker}</span><b>ملصق جديد لألبومك!</b></div>` : ''}
    <div style="display:grid;gap:12px;width:100%">${nx ? `<button class="btn" type="button" id="gnx">الدرس الجاي: ${esc(nx.ar)} ←</button>` : ''}<button class="btn ghost" type="button" id="gag">العب التحدي كمان</button><button class="btn ghost" type="button" id="glib">للمكتبة</button></div></div></div>`;
  SFX.win(); confetti();
  const gnx = $('#gnx'); if (gnx) gnx.onclick = () => openGram(nx);
  $('#gag').onclick = () => { R.p = 0; gChallenge(); };
  $('#glib').onclick = closeBook;
}

/* ---------- Bubu's playground ---------- */
function myWordList() { const out = []; Object.keys(G.words).forEach(k => { const i = k.indexOf(':'), s = STORY.get(k.slice(0, i)); const v = s && vocab(s).find(x => x.k === k.slice(i + 1)); if (v) out.push(v); }); return out; }
function playPool(needEmo) {
  let p = myWordList().filter(v => !needEmo || v.emo);
  if (p.length < 8) { const sh = SHELVES.find(s => s.k === 'A') || SHELVES[0]; p = p.concat(sh.list.slice(0, 6).flatMap(s => vocab(s)).filter(v => !needEmo || v.emo)); }
  const seen = new Set(); return p.filter(v => !seen.has(v.k) && seen.add(v.k));
}
function viewPlay() {
  G.best = G.best || {};
  const b = k => G.best[k] ? `<span class="best">أفضل: ${AR(G.best[k])}</span>` : '';
  shell(`<section class="hello" style="gap:6px">${OWL('wow', 96)}<div class="bubble sm">أهلا بملعبي! اختار لعبة 🎈</div></section>
    <div class="games">
      <button class="game c0" type="button" data-g="balloon">${b('balloon')}<span class="gi">🎈</span><b>البالونات</b><small>اسمع الكلمة وفقّع البالون الصح</small></button>
      <button class="game c1" type="button" data-g="mem">${b('mem')}<span class="gi">🃏</span><b>الذاكرة</b><small>لاقي كل صورة مع كلمتها</small></button>
      <button class="game c2" type="button" data-g="tf">${b('tf')}<span class="gi">🕵️</span><b>صح ولا غلط</b><small>جمل من دروس القواعد</small></button>
      <button class="game c3" type="button" data-g="fish">${b('fish')}<span class="gi">🎣</span><b>صيد الكلمات</b><small>اصطاد السمكة اللي فيها المعنى الصح</small></button>
    </div>`);
  $$('[data-g]').forEach(x => x.onclick = () => ({ balloon: gameBalloon, mem: gameMem, tf: gameTF, fish: gameFish }[x.dataset.g])());
}
function arena(cls, inner) {
  document.body.style.overflow = 'hidden'; let d = $('.reader'); if (!d) { d = document.createElement('div'); document.body.appendChild(d); }
  d.className = 'reader kid ' + cls; d.innerHTML = `<div class="rin"><div class="rtop"><button class="x" type="button" id="close" aria-label="اطلع">${I.close}</button><div class="grow"><div class="pbar"><i id="gbar" style="width:0%"></i></div></div><span class="chip" id="starcount">${I.star}<span class="num" id="gsc">0</span></span></div>${inner}</div>`;
  $('#close').onclick = () => { R = null; closeBook(); }; return d;
}
function gameOver(key, score, total) {
  G.best = G.best || {}; const best = score > (G.best[key] || 0); G.best[key] = Math.max(G.best[key] || 0, score); G.stars += score; save();
  const stars = score >= total * .9 ? 3 : score >= total * .6 ? 2 : 1;
  $('.reader .rin').innerHTML = `<div class="theend">${OWL('wow', 120)}<h1>${stars === 3 ? 'إنت بطل! 🏆' : 'شغل حلو! 🎉'}</h1><div class="bigstars">${[0, 1, 2].map(k => `<span class="${k < stars ? 'on' : ''}">${I.star}</span>`).join('')}</div><p class="muted" style="margin:0">${AR(score)} من ${AR(total)}${best ? ' · رقم قياسي جديد!' : ''}</p>
    <div style="display:grid;gap:12px;width:100%"><button class="btn" type="button" id="again">العب كمان</button><button class="btn ghost" type="button" id="back">للملعب</button></div></div>`;
  SFX.win(); confetti(); $('#again').onclick = () => ({ balloon: gameBalloon, mem: gameMem, tf: gameTF, fish: gameFish }[key])(); $('#back').onclick = () => { R = null; closeBook(); };
}
function gameBalloon() {
  const pool = shuffle(playPool(false)), N = Math.min(10, pool.length); let k = 0, sc = 0;
  arena('c0', `<div class="ask2">اسمع… وفقّع البالون الصح! 🎈</div><div class="row" style="justify-content:center"><button class="say" type="button" id="hear">${I.spk}</button></div><div class="skyb" id="sky"></div>`);
  const cols = ['var(--berry)', 'var(--blue)', 'var(--orange)', 'var(--teal)'];
  const round = () => {
    if (k >= N) return gameOver('balloon', sc, N); const v = pool[k++]; $('#gbar').style.width = (100 * k / N) + '%';
    const opts = shuffle([v, ...shuffle(pool.filter(x => x.k !== v.k)).slice(0, 2)]); let done = false;
    $('#sky').innerHTML = opts.map((o, j) => `<button class="balloon" type="button" data-j="${j}" style="right:${[4, 36, 68][j]}%;top:${[26, 10, 30][j]}%;--bc:${cols[(k + j) % 4]};animation-delay:${-j}s">${o.emo ? `<span class="be">${o.emo}</span>` : ''}<span class="en">${esc(o.w)}</span></button>`).join('');
    $('#hear').onclick = () => sayWord(v.w); setTimeout(() => sayWord(v.w), 300);
    $$('#sky .balloon').forEach(b => b.onclick = () => { if (done) return; done = true; const ok = opts[+b.dataset.j] === v;
      if (ok) { sc++; $('#gsc').textContent = sc; b.classList.add('pop'); SFX.pop(); SFX.ok(); flyStar(b); } else { b.classList.add('no'); SFX.no(); toast(`${v.emo || ''} ${v.w} = ${v.m}`); }
      setTimeout(round, ok ? 700 : 1500); });
  };
  round();
}
function gameMem() {
  const pool = shuffle(playPool(true)).slice(0, 6); if (pool.length < 3) return toast('اقرأ كتاب أول عشان تفتح هاللعبة');
  const cards = shuffle([...pool.map(v => ({ v, s: 'e' })), ...pool.map(v => ({ v, s: 'p' }))]); let up = [], moves = 0, got = 0, lock = false;
  arena('c1', `<div class="ask2">لاقي كل صورة مع كلمتها 🃏</div><div class="memg">${cards.map((c, j) => `<button class="mcard" type="button" data-c="${j}"><span class="f">?</span><span class="b ${c.s === 'e' ? 'en' : 'pic'}">${c.s === 'e' ? esc(c.v.w) : c.v.emo}</span></button>`).join('')}</div>`);
  $$('.mcard').forEach(b => b.onclick = () => { if (lock || b.classList.contains('up')) return; const c = cards[+b.dataset.c]; b.classList.add('up'); SFX.pop(); if (c.s === 'e') sayWord(c.v.w); up.push([b, c]); if (up.length < 2) return;
    moves++; const [[b1, c1], [b2, c2]] = up; up = [];
    if (c1.v === c2.v && c1.s !== c2.s) { got++; SFX.ok(); [b1, b2].forEach(x => x.classList.add('got')); $('#gsc').textContent = got; $('#gbar').style.width = (100 * got / pool.length) + '%'; if (got === pool.length) setTimeout(() => gameOver('mem', Math.max(1, pool.length * 2 - Math.max(0, moves - pool.length)), pool.length * 2), 600); }
    else { lock = true; setTimeout(() => { b1.classList.remove('up'); b2.classList.remove('up'); lock = false; }, 950); } });
}
function gameTF() {
  const done = GL.filter(l => G.gram[l.id]), ls = done.length ? done : GL.slice(0, 4), items = [];
  ls.forEach(l => { (l.tip || []).forEach(([w, r, n]) => { items.push({ s: w, ok: false, r, l }); items.push({ s: r, ok: true, r, l }); }); (l.q || []).forEach(q => { if (q[0] === 'pick') { items.push({ s: q[1], ok: true, r: q[1], l }); items.push({ s: q[2], ok: false, r: q[1], l }); } }); });
  if (items.length < 4) return toast('افتح درس من رفّ القواعد أول');
  const qs = shuffle(items).slice(0, 10); let k = 0, sc = 0;
  arena('c2', `<div class="ask2">بوبو حكى جملة… صح ولا فيها غلطة؟ 🕵️</div><div class="bigsent en" id="tfs" style="min-height:120px;display:grid;place-items:center"></div><div class="tfb"><button class="qo tfx" type="button" id="no">✗ غلط</button><button class="qo tfv" type="button" id="yes">✓ صح</button></div>`);
  const round = () => { if (k >= qs.length) return gameOver('tf', sc, qs.length); const it = qs[k++]; $('#gbar').style.width = (100 * k / qs.length) + '%'; $('#tfs').textContent = it.s; $('#tfs').classList.remove('popin'); void $('#tfs').offsetWidth; $('#tfs').classList.add('popin'); let done = false;
    const ans = yes => { if (done) return; done = true; const ok = yes === it.ok; if (ok) { sc++; $('#gsc').textContent = sc; SFX.ok(); } else { SFX.no(); toast('الصح: ' + it.r); } setTimeout(round, ok ? 600 : 1700); };
    $('#yes').onclick = () => ans(true); $('#no').onclick = () => ans(false); };
  round();
}
function gameFish() {
  const pool = shuffle(playPool(false)), N = Math.min(10, pool.length); let k = 0, sc = 0;
  arena('c3', `<div class="ask2" id="fq"></div><div class="pondf" id="pond"></div>`);
  const round = () => {
    if (k >= N) return gameOver('fish', sc, N); const v = pool[k++]; $('#gbar').style.width = (100 * k / N) + '%';
    $('#fq').innerHTML = `اصطاد: <b class="en" style="color:var(--blue)">${esc(v.w)}</b> 🎣 <small class="muted">(اختار السمكة اللي فيها معناها)</small>`; sayWord(v.w);
    const opts = shuffle([v, ...shuffle(pool.filter(x => noTash(x.m) !== noTash(v.m))).slice(0, 2)]); let done = false;
    $('#pond').innerHTML = opts.map((o, j) => `<button class="fish f${j}" type="button" data-j="${j}"><span class="fb">🐟</span><span class="fm">${esc(o.m)}</span></button>`).join('');
    $$('#pond .fish').forEach(b => b.onclick = () => { if (done) return; done = true; const ok = opts[+b.dataset.j] === v;
      if (ok) { sc++; $('#gsc').textContent = sc; b.classList.add('caught'); SFX.ok(); flyStar(b); } else { b.classList.add('no'); SFX.no(); toast(`${v.w} = ${v.m}`); }
      setTimeout(round, ok ? 800 : 1500); });
  };
  round();
}

/* ---------- story words player ---------- */
function storyWords(s, inReader) {
  if (!window.WordPlayer || !s) return;
  [...new Set(vocab(s).map(v => AU.e[enKey(v.w)]).filter(Boolean).map(id => 'e' + id[0]))].forEach(loadPack);
  window.WordPlayer.open({ title: noTash(s.ar) + ' · ' + s.en, items: vocab(s).map(v => ({ w: v.w, m: v.m, emo: v.emo, p: v.p })),
    sayEn: (w, rate) => sayWord(w, rate), stop: () => { sayTok++; try { wa.pause(); } catch (e) { } }, keepOverflow: !!inReader });
}

/* ---------- dictionary ---------- */
const DSRC = {
  entries: () => {
    const seen = new Set(), out = [];
    ['A', 'B', 'C'].forEach(k => (D.wl?.[k] || []).forEach(r => { const key = norm(r[0]); if (!key || seen.has(key)) return; seen.add(key); out.push({ w: r[0], p: r[1], m: r[2], forms: [[r[0], r[2]], ...(r[3] || []).map(f => [f[0], f[1]])] }); }));
    (D.fam || []).forEach(f => f.w.forEach(r => { const key = norm(r[0]); if (!key || seen.has(key)) return; seen.add(key); out.push({ w: r[0], p: r[1], m: r[2], forms: [[r[0], r[2]]] }); }));
    return out;
  },
  fam: D.fam, ant: D.ant, syn: D.syn,
  say: text => sayWord(text),
};
function viewDict() { shell('<div id="dxroot"></div>'); if (window.Dict) window.Dict.mount($('#dxroot'), DSRC); }

render();
})();
