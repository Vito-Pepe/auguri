(() => {
  'use strict';

  // Data della laurea: 12 novembre 2020 (i mesi in JS partono da 0)
  const GRAD = new Date(2020, 10, 12, 0, 0, 0);
  const N = 4; // puzzle 4x4 = 16 pezzi

  const $ = (s) => document.querySelector(s);

  /* ------------------------------------------------------------------ */
  /* Foto: la prende dall'immagine del biglietto finale. Nel file unico   */
  /* (build.py) è incorporata lì come data URI e si usa così com'è: gli   */
  /* indirizzi blob: non si vedono in alcune anteprime (es. su iPhone)    */
  /* ------------------------------------------------------------------ */
  const src = $('#win-photo').getAttribute('src');
  const PHOTO = src.startsWith('data:') ? src : new URL(src, document.baseURI).href;
  document.documentElement.style.setProperty('--photo', `url("${PHOTO}")`);
  new Image().src = PHOTO; // la carica subito, prima del puzzle

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ */
  /* Tempo trascorso dalla laurea                                        */
  /* ------------------------------------------------------------------ */
  function dayNumber(d) { return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); }

  function elapsed(now) {
    let years = now.getFullYear() - GRAD.getFullYear();
    const anniv = new Date(GRAD);
    anniv.setFullYear(GRAD.getFullYear() + years);
    if (anniv > now) { years -= 1; anniv.setFullYear(GRAD.getFullYear() + years); }
    return {
      years: Math.max(0, years),
      days: dayNumber(now) - dayNumber(anniv),
      hours: now.getHours(),
      minutes: now.getMinutes(),
      seconds: now.getSeconds(),
      total: dayNumber(now) - dayNumber(GRAD),
    };
  }

  const fmt = new Intl.NumberFormat('it-IT');
  const yearsNow = elapsed(new Date()).years || 6;

  function fillStaticTexts() {
    $('#years-num').textContent = yearsNow;
    $('#years-label').textContent = yearsNow === 1 ? 'anno' : 'anni';
    $('#this-year').textContent = GRAD.getFullYear() + yearsNow;
  }

  function startCounter() {
    const ids = { years: '#c-y', days: '#c-d', hours: '#c-h', minutes: '#c-m', seconds: '#c-s' };
    const els = Object.fromEntries(Object.entries(ids).map(([k, s]) => [k, $(s)]));
    const total = $('#c-total');
    const tick = () => {
      const e = elapsed(new Date());
      for (const k in els) els[k].textContent = e[k];
      total.textContent = fmt.format(e.total);
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ------------------------------------------------------------------ */
  /* Corona d'alloro (SVG generato)                                      */
  /* ------------------------------------------------------------------ */
  function buildWreath() {
    const svg = $('.wreath-svg');
    const cx = 100, cy = 100, R = 76;
    const leaf = 'M0 0C5-6.5 15-7.5 25 0C15 7.5 5 6.5 0 0Z';
    const greens = ['#3d6b3a', '#4d7d43', '#2f5a2e', '#58894c'];
    const rad = (deg) => (deg * Math.PI) / 180;
    let out = '';
    let k = 0;

    for (const side of [-1, 1]) {
      const pt = (t) => [cx + side * R * Math.sin(rad(t)), cy + R * Math.cos(rad(t))];
      const dir = (t) => (Math.atan2(-Math.sin(rad(t)), side * Math.cos(rad(t))) * 180) / Math.PI;

      // rametto
      const stem = [];
      for (let t = 14; t <= 156; t += 4) stem.push(pt(t).map((v) => v.toFixed(1)).join(' '));
      out += `<path d="M${stem.join('L')}" fill="none" stroke="#5a4a28" stroke-width="1.6" stroke-linecap="round"/>`;

      // foglie (esterne e interne, sfalsate)
      let i = 0;
      for (let t = 20; t <= 150; t += 10, i++) {
        const sc = 0.62 + 0.38 * Math.sin((Math.PI * (t - 10)) / 150);
        for (const [off, shift] of [[-40, 0], [38, 5]]) {
          const tt = t + shift;
          const [x, y] = pt(tt);
          const fill = greens[(i + (off > 0 ? 1 : 0) + (side > 0 ? 2 : 0)) % greens.length];
          const delay = (k++ * 0.025 + 0.2).toFixed(3);
          out += `<path class="lf" style="animation-delay:${delay}s" d="${leaf}" fill="${fill}" stroke="#24461f" stroke-width=".5"`
            + ` transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(dir(tt) + off).toFixed(1)}) scale(${sc.toFixed(2)})"/>`;
        }
        // bacche rosse, come nella corona della foto
        if (i % 3 === 1) {
          const [x, y] = pt(t + 2);
          const nx = (x - cx) / R, ny = (y - cy) / R;
          const bx = x + nx * 7, by = y + ny * 7;
          out += `<g class="lf" style="animation-delay:${(k * 0.025 + 0.3).toFixed(3)}s">`
            + `<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="3.4" fill="#c8102e"/>`
            + `<circle cx="${(bx - 1).toFixed(1)}" cy="${(by - 1.1).toFixed(1)}" r="1" fill="#ff8a99"/></g>`;
        }
      }
      // foglia in punta
      const [tx, ty] = pt(156);
      out += `<path class="lf" style="animation-delay:${(k * 0.025 + 0.2).toFixed(3)}s" d="${leaf}" fill="#4d7d43" stroke="#24461f" stroke-width=".5"`
        + ` transform="translate(${tx.toFixed(1)} ${ty.toFixed(1)}) rotate(${dir(156).toFixed(1)}) scale(.7)"/>`;
    }

    // fiocco rosso in basso
    out += `<g transform="translate(${cx} ${cy + R + 1})">`
      + '<path d="M-2 2L-13 24L-7 21L-4 27L2 4Z" fill="#9e0b24"/>'
      + '<path d="M2 2L13 24L7 21L4 27L-2 4Z" fill="#9e0b24"/>'
      + '<path d="M0 0C-14-12-27-5-23 5C-19 13-8 8 0 0Z" fill="#c8102e"/>'
      + '<path d="M0 0C14-12 27-5 23 5C19 13 8 8 0 0Z" fill="#c8102e"/>'
      + '<circle r="4.2" fill="#9e0b24"/></g>';

    svg.innerHTML = out;
  }

  /* ------------------------------------------------------------------ */
  /* Effetti: cuori e foglie su canvas                                   */
  /* ------------------------------------------------------------------ */
  const fx = (() => {
    const canvas = $('#fx');
    const ctx = canvas.getContext('2d');
    const heart = new Path2D('M23.6 0c-3.4 0-6.3 2.7-7.6 5.6C14.7 2.7 11.8 0 8.4 0 3.8 0 0 3.8 0 8.4c0 9.4 9.5 11.9 16 21.2 6.1-9.3 16-12.1 16-21.2C32 3.8 28.2 0 23.6 0z');
    const HEARTS = ['#c8102e', '#e23b57', '#ff6b81', '#f7a1b0', '#d4af5a'];
    const LEAVES = ['#3d6b3a', '#58894c'];
    let parts = [];
    let running = false;
    let dpr = 1;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
    }
    window.addEventListener('resize', resize);
    resize();

    const rnd = (a, b) => a + Math.random() * (b - a);
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    function make(x, y, vx, vy, opts = {}) {
      const isLeaf = Math.random() < (opts.leaves ?? 0.2);
      return {
        x, y, vx, vy,
        g: opts.g ?? 0.16,
        drag: opts.drag ?? 0.985,
        rot: rnd(-0.6, 0.6), vr: rnd(-0.06, 0.06),
        size: isLeaf ? rnd(10, 16) : rnd(12, 28),
        color: isLeaf ? pick(LEAVES) : pick(HEARTS),
        leaf: isLeaf,
        sway: opts.sway ?? 0, phase: rnd(0, 6.28),
        life: 0, max: opts.max ?? rnd(150, 230),
      };
    }

    function burst(x, y, n = 70) {
      if (reduceMotion) n = Math.min(n, 12);
      for (let i = 0; i < n; i++) {
        const a = rnd(0, Math.PI * 2);
        const s = rnd(3, 11);
        parts.push(make(x, y, Math.cos(a) * s, Math.sin(a) * s - 3));
      }
      run();
    }

    function rain(n = 60, spread = 3000) {
      if (reduceMotion) n = Math.min(n, 10);
      for (let i = 0; i < n; i++) {
        setTimeout(() => {
          parts.push(make(rnd(0, window.innerWidth), -30, rnd(-0.4, 0.4), rnd(1.2, 2.6),
            { g: 0.004, drag: 1, sway: rnd(0.4, 1.1), max: 600, leaves: 0.15 }));
          run();
        }, rnd(0, spread));
      }
    }

    function run() {
      if (running) return;
      running = true;
      requestAnimationFrame(tick);
    }

    function tick() {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      const H = window.innerHeight;
      parts = parts.filter((p) => p.life < p.max && p.y < H + 60);
      for (const p of parts) {
        p.life++;
        p.vy += p.g;
        p.vx *= p.drag; p.vy *= p.drag;
        p.x += p.vx + Math.sin(p.life * 0.05 + p.phase) * p.sway;
        p.y += p.vy;
        p.rot += p.vr;
        const fade = Math.min(1, p.life / 8, (p.max - p.life) / 40);
        ctx.save();
        ctx.globalAlpha = Math.max(0, fade);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.leaf) {
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 0.55, p.size * 0.22, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const s = p.size / 32;
          ctx.scale(s, s);
          ctx.translate(-16, -15);
          ctx.fill(heart);
        }
        ctx.restore();
      }
      if (parts.length) requestAnimationFrame(tick);
      else { running = false; ctx.clearRect(0, 0, w, h); }
    }

    return { burst, rain };
  })();

  /* ------------------------------------------------------------------ */
  /* Busta                                                               */
  /* ------------------------------------------------------------------ */
  const intro = $('#intro');
  const main = $('#main');
  const envelope = $('#envelope');

  envelope.addEventListener('click', () => {
    if (envelope.classList.contains('open')) return;
    envelope.classList.add('open');
    envelope.setAttribute('aria-label', 'Busta aperta');
    const r = envelope.getBoundingClientRect();
    setTimeout(() => fx.burst(r.left + r.width / 2, r.top + r.height * 0.2, 36), reduceMotion ? 0 : 1100);

    const wait = reduceMotion ? 300 : 2300;
    setTimeout(() => intro.classList.add('leaving'), wait);
    setTimeout(() => {
      intro.hidden = true;
      main.hidden = false;
      window.scrollTo(0, 0);
      buildWreath();
      startCounter();
    }, wait + 700);
  });

  /* ------------------------------------------------------------------ */
  /* Puzzle                                                              */
  /* ------------------------------------------------------------------ */
  const board = $('#board');
  const peek = $('#peek');
  const startOverlay = $('#board-start');
  const startBtn = $('#start');
  const peekBtn = $('#peek-btn');
  const shuffleBtn = $('#shuffle-btn');
  const movesEl = $('#moves');
  const placedEl = $('#placed');
  const win = $('#win');

  const tiles = [];
  const slotOf = [];  // pezzo -> casella
  const pieceAt = []; // casella -> pezzo
  let moves = 0;
  let playing = false;
  let solved = false;
  let selected = null;
  let drag = null;

  for (let p = 0; p < N * N; p++) {
    const t = document.createElement('button');
    t.type = 'button';
    t.className = 'tile';
    t.tabIndex = -1;
    t.dataset.piece = p;
    t.style.setProperty('--pc', p % N);
    t.style.setProperty('--pr', Math.floor(p / N));
    board.insertBefore(t, peek);
    tiles.push(t);
    slotOf[p] = p;
    pieceAt[p] = p;
    place(p);
  }

  function place(p) {
    const s = slotOf[p];
    const c = s % N, r = Math.floor(s / N);
    const t = tiles[p];
    t.style.setProperty('--c', c);
    t.style.setProperty('--r', r);
    t.setAttribute('aria-label', `Pezzo ${p + 1}, riga ${r + 1}, colonna ${c + 1}`);
  }

  function placedCount() { return pieceAt.filter((p, s) => p === s).length; }

  function updateStats() {
    movesEl.textContent = moves;
    placedEl.textContent = placedCount();
  }

  function randomOrder() {
    let a;
    do {
      a = [...Array(N * N).keys()];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
    } while (a.filter((p, s) => p === s).length > 1);
    return a;
  }

  function shuffle() {
    clearSelection();
    const order = randomOrder();
    board.classList.add('shuffling');
    tiles.forEach((t) => t.style.setProperty('--delay', `${Math.round(Math.random() * 220)}ms`));
    order.forEach((p, s) => { pieceAt[s] = p; slotOf[p] = s; });
    tiles.forEach((_, p) => place(p));
    moves = 0;
    updateStats();
    setTimeout(() => board.classList.remove('shuffling'), 1100);
  }

  function clearSelection() {
    if (selected) selected.classList.remove('selected');
    selected = null;
  }

  function flashRight(t) {
    t.classList.remove('right');
    void t.offsetWidth; // riavvia l'animazione
    t.classList.add('right');
  }

  function swap(a, b) {
    if (a === b) return;
    const pa = pieceAt[a], pb = pieceAt[b];
    pieceAt[a] = pb; pieceAt[b] = pa;
    slotOf[pa] = b; slotOf[pb] = a;
    place(pa); place(pb);
    moves++;
    updateStats();
    for (const p of [pa, pb]) if (slotOf[p] === p) setTimeout(() => flashRight(tiles[p]), 220);
    if (placedCount() === N * N) solve();
  }

  function tap(t) {
    if (!selected) { selected = t; t.classList.add('selected'); return; }
    if (selected === t) { clearSelection(); return; }
    const a = slotOf[+selected.dataset.piece];
    const b = slotOf[+t.dataset.piece];
    clearSelection();
    swap(a, b);
  }

  function slotAt(x, y) {
    const r = board.getBoundingClientRect();
    const c = Math.floor(((x - r.left) / r.width) * N);
    const row = Math.floor(((y - r.top) / r.height) * N);
    if (c < 0 || c >= N || row < 0 || row >= N) return null;
    return row * N + c;
  }

  board.addEventListener('pointerdown', (e) => {
    if (solved) return;
    if (!playing || drag) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const t = e.target.closest('.tile');
    if (!t) return;
    e.preventDefault();
    try { t.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
    drag = { t, id: e.pointerId, x0: e.clientX, y0: e.clientY, moved: false, target: null };
  });

  board.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    if (!drag.moved) {
      if (Math.hypot(dx, dy) < 8) return;
      drag.moved = true;
      clearSelection();
      drag.t.classList.add('dragging');
    }
    drag.t.style.setProperty('--dx', `${dx}px`);
    drag.t.style.setProperty('--dy', `${dy}px`);
    const s = slotAt(e.clientX, e.clientY);
    const tgt = s !== null && pieceAt[s] !== +drag.t.dataset.piece ? tiles[pieceAt[s]] : null;
    if (tgt !== drag.target) {
      if (drag.target) drag.target.classList.remove('target');
      if (tgt) tgt.classList.add('target');
      drag.target = tgt;
    }
  });

  function endDrag(e, cancelled) {
    if (!drag || e.pointerId !== drag.id) return;
    const { t, moved, target } = drag;
    drag = null;
    if (target) target.classList.remove('target');
    if (moved) {
      t.classList.remove('dragging');
      t.style.removeProperty('--dx');
      t.style.removeProperty('--dy');
      if (!cancelled && target) swap(slotOf[+t.dataset.piece], slotOf[+target.dataset.piece]);
    } else if (!cancelled) {
      tap(t);
    }
  }
  board.addEventListener('pointerup', (e) => endDrag(e, false));
  board.addEventListener('pointercancel', (e) => endDrag(e, true));

  // Tastiera: Invio/Spazio selezionano, le frecce spostano il focus
  board.addEventListener('click', (e) => {
    const t = e.target.closest('.tile');
    if (solved) {
      // il click che segue l'ultima mossa non deve anticipare la sorpresa
      if (t && performance.now() - solvedAt > 2200) showWin();
      return;
    }
    if (t && e.detail === 0 && playing) tap(t);
  });
  board.addEventListener('keydown', (e) => {
    const t = e.target.closest && e.target.closest('.tile');
    if (!t) return;
    if (e.key === 'Escape') { clearSelection(); return; }
    const m = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (!m) return;
    e.preventDefault();
    const s = slotOf[+t.dataset.piece];
    const c = (s % N) + m[0], r = Math.floor(s / N) + m[1];
    if (c < 0 || c >= N || r < 0 || r >= N) return;
    tiles[pieceAt[r * N + c]].focus();
  });

  function setPlaying(on) {
    playing = on;
    tiles.forEach((t) => { t.tabIndex = on ? 0 : -1; });
    peekBtn.disabled = !on;
    shuffleBtn.disabled = false;
  }

  startBtn.addEventListener('click', () => {
    startOverlay.classList.add('gone');
    setTimeout(() => { shuffle(); setPlaying(true); }, reduceMotion ? 0 : 450);
  });

  let peekTimer = null;
  peekBtn.addEventListener('click', () => {
    peek.classList.add('show');
    clearTimeout(peekTimer);
    peekTimer = setTimeout(() => peek.classList.remove('show'), 2200);
  });

  shuffleBtn.addEventListener('click', () => {
    if (solved) {
      solved = false;
      board.classList.remove('solved');
      shuffleBtn.textContent = 'Rimescola';
    }
    shuffle();
    setPlaying(true);
  });

  let solvedAt = 0;
  function solve() {
    solved = true;
    solvedAt = performance.now();
    clearSelection();
    setPlaying(false);
    shuffleBtn.disabled = true;
    setTimeout(() => board.classList.add('solved'), 350);
    setTimeout(() => {
      showWin();
      shuffleBtn.textContent = 'Gioca ancora';
      shuffleBtn.disabled = false;
    }, 1900);
  }

  /* ------------------------------------------------------------------ */
  /* Sorpresa finale                                                     */
  /* ------------------------------------------------------------------ */
  const winSub = $('#win-sub');
  let lastFocus = null;

  function showWin() {
    if (!win.hidden) return;
    lastFocus = document.activeElement;
    winSub.textContent = `Puzzle completato in ${moves} mosse · Buon anniversario di laurea, Dottoressa`;
    win.hidden = false;
    // riavvia le animazioni del biglietto finale
    const card = win.querySelector('.win-card');
    card.replaceWith(card.cloneNode(true));
    bindWinButtons();
    win.querySelector('#close-win').focus({ preventScroll: true });
    const W = window.innerWidth, H = window.innerHeight;
    setTimeout(() => fx.burst(W / 2, H * 0.42, 90), 500);
    setTimeout(() => fx.rain(70, 4000), 1200);
  }

  function hideWin() {
    win.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  function bindWinButtons() {
    win.querySelector('#again').addEventListener('click', () => {
      fx.burst(window.innerWidth / 2, window.innerHeight * 0.45, 80);
      fx.rain(40, 2500);
    });
    win.querySelector('#close-win').addEventListener('click', hideWin);
  }
  bindWinButtons();

  win.addEventListener('click', (e) => { if (e.target === win) hideWin(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !win.hidden) hideWin(); });

  /* ------------------------------------------------------------------ */
  fillStaticTexts();
  updateStats();
})();
