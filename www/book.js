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
const SBY = Object.fromEntries(SHELVES.map(s => [s.k, s]));
const PRON = new Map();
Object.values(D.wl || {}).forEach(l => l.forEach(r => { if (!PRON.has(r[0])) PRON.set(r[0], r[1]); }));
(D.fam || []).forEach(f => f.w.forEach(r => { if (!PRON.has(r[0])) PRON.set(r[0], r[1]); }));
const STORY = new Map();
SHELVES.forEach(sh => sh.list.forEach((s, ix) => { s.sk = sh.k; s.ix = ix; STORY.set(s.id, s); }));
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
let saveT = 0; const save = () => { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(G)); } catch (e) { } }, 150); };
const DAY = () => { const d = new Date(); return Math.floor((d - d.getTimezoneOffset() * 6e4) / 864e5); };
function touchDay() { const d = DAY(); if (G.lastDay !== d) { G.streak = G.lastDay === d - 1 ? G.streak + 1 : 1; G.lastDay = d; } }
const RS = id => G.read[id] || (G.read[id] = { page: 0, best: 0, done: 0 });
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
const TABS = [['lib', 'المكتبة', I.shelf], ['words', 'كلماتي', I.box], ['album', 'ملصقاتي', I.sticker]];
function shell(inner) {
  document.body.classList.toggle('kid', !!shelf().kid);
  app.innerHTML = `<header class="top"><div class="in"><span class="brand">${OWL('happy', 44)}<b>لُغتي</b></span><span class="grow"></span>
      <span class="chip" title="نجوم">${I.star}<span class="num">${G.stars}</span></span><span class="chip st" title="ملصقات">🎟️<span class="num">${G.stk.length}</span></span></div></header>
    <main class="wrap">${inner}</main>
    <nav class="tabs"><div class="in">${TABS.map(([k, n, ic]) => `<button class="tab" type="button" data-tab="${k}" ${TAB === k ? 'aria-current="page"' : ''}><span class="ti">${ic}</span>${n}</button>`).join('')}</div></nav>`;
  $$('[data-tab]').forEach(b => b.onclick = () => { TAB = b.dataset.tab; render(); scrollTo(0, 0); });
}
function render() { if (!G.shelf) return welcome(); ({ lib: viewLib, words: viewWords, album: viewAlbum }[TAB] || viewLib)(); }
function welcome() {
  document.body.classList.add('kid');
  app.innerHTML = `<main class="wrap" style="padding-top:22px"><section class="hello">${OWL('happy', 130)}<div class="bubble">أهلاً! أنا <b>بوبو</b> 🦉<br>عندي مكتبة مليانة قصص بالإنجليزي. أي رفّ بدك نفتح؟</div></section>
    <section class="shelves">${SHELVES.map((s, k) => `<button class="shelfbtn c${k}" type="button" data-s="${s.k}"><span class="wi">${s.icon}</span><span class="grow"><b>${s.name}</b><small>${s.sub} · ${AR(s.list.length)} قصة</small></span><span class="go">←</span></button>`).join('')}</section></main>`;
  $$('[data-s]').forEach(b => b.onclick = () => { G.shelf = b.dataset.s; save(); SFX.win(); render(); });
}

/* ---------- library ---------- */
function nextStory(sh) { return sh.list.find(s => !G.read[s.id]?.done) || sh.list[0]; }
function viewLib() {
  const sh = shelf(), cont = G.last && STORY.get(G.last) && !G.read[G.last]?.done ? STORY.get(G.last) : null, nx = nextStory(sh);
  const feat = cont || nx, fp = pages(feat).length, rs = G.read[feat.id];
  shell(`<section class="shelfnav">${SHELVES.map((s, k) => `<button class="sn c${k}" type="button" data-s="${s.k}" aria-pressed="${s.k === sh.k}">${s.icon} ${s.name}</button>`).join('')}</section>
    <section class="feature c${feat.ix % 5}">
      ${sh.kid ? `<div class="fowl">${OWL('happy', 74)}<div class="bubble sm">${cont ? 'نكمّل القصة؟ 📖' : 'جاهز لقصة جديدة؟ ✨'}</div></div>` : ''}
      <div class="fbook"><div class="fcover"><span>${cover(feat)}</span></div><div class="grow"><div class="k">${cont ? 'كمّل القراءة' : 'القصة الجاية'} · ${AR(feat.ix + 1)}</div><h1>${esc(noTash(feat.ar))}</h1><div class="en">${esc(feat.en)}</div>
        ${rs?.page ? `<div class="pbar"><i style="width:${Math.round(100 * rs.page / fp)}%"></i></div>` : ''}</div></div>
      <button class="btn big" type="button" data-open="${feat.id}">${I.play} ${cont ? 'كمّل من الصفحة ' + AR(rs.page + 1) : 'افتح الكتاب'}</button>
    </section>
    <section class="sec"><div class="sec-h"><h2>${sh.icon} ${sh.name}</h2><span class="muted num">${AR(sh.list.filter(s => G.read[s.id]?.done).length)}/${AR(sh.list.length)}</span></div>
      <div class="books">${sh.list.map(s => { const r = G.read[s.id]; return `<button class="book c${s.ix % 5} ${r?.done ? 'done' : ''} ${s === nx ? 'nx' : ''}" type="button" data-open="${s.id}"><span class="spine"></span><span class="be">${cover(s)}</span><span class="bt">${esc(noTash(s.ar))}</span>${r?.done ? `<span class="ribbon">${'★'.repeat(r.best || 1)}</span>` : r?.page ? `<span class="ribbon prog">${AR(Math.round(100 * r.page / pages(s).length))}٪</span>` : s === nx ? '<span class="ribbon new">جديدة</span>' : ''}</button>`; }).join('')}</div></section>`);
  $$('[data-s]').forEach(b => b.onclick = () => { G.shelf = b.dataset.s; save(); SFX.page(); render(); });
  $$('[data-open]').forEach(b => b.onclick = () => openBook(STORY.get(b.dataset.open)));
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
function closeBook() { stopStory(); sayTok++; try { wa.pause(); } catch (e) { } $$('.reader,.pop,.scrim').forEach(e => e.remove()); document.body.style.overflow = ''; R = null; render(); }
function sceneHtml(pg) {
  const sc = SCENES[(R.s.ix + pg.pi) % SCENES.length], spots = [[18, 30], [62, 18], [40, 52], [76, 56]];
  const pics = pg.pics.length ? pg.pics : [cover(R.s)];
  return `<div class="scene ${sc}"><span class="sun"></span><span class="cloud c1"></span><span class="cloud c2"></span><span class="ground"></span>
    ${pics.map((e, k) => `<button class="actor" type="button" data-actor="${k}" style="right:${spots[k][0]}%;top:${spots[k][1]}%;animation-delay:${-k * .7}s">${e}</button>`).join('')}
    ${R.kid ? `<span class="peek">${OWL('happy', 64)}</span>` : ''}</div>`;
}
function drawPage() {
  const { s, pg: all } = R, pg = all[R.p], d = $('.reader'); const rs = RS(s);
  rs.page = Math.max(rs.page || 0, R.p); save();
  pg.words.forEach(v => meetWord(s, v));
  d.className = 'reader c' + (s.ix % 5) + (R.kid ? ' kid' : '');
  d.innerHTML = `<div class="rin">
    <div class="rtop"><button class="x" type="button" id="close" aria-label="سكّر الكتاب">${I.close}</button>
      <div class="grow" style="min-width:0"><b class="rtitle">${esc(noTash(s.ar))}</b><div class="pbar"><i style="width:${Math.round(100 * (R.p + 1) / all.length)}%"></i></div></div>
      <span class="chip" id="starcount">${I.star}<span class="num">${R.qok}</span></span></div>
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
  SFX.page(); const pw = $('#pw'); if (pw && !reduce) { pw.classList.add(dir > 0 ? 'flipL' : 'flipR'); setTimeout(drawPage, 180); } else drawPage();
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

render();
})();
