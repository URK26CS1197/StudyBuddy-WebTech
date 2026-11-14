/* =========================================================
   cats.js — Pixel cat sprite engine
   Every cat is a 20x21 grid of palette letters drawn onto a
   <canvas>. Palettes + small overlays give each cat a look.
   States: idle | blink | sleep | happy | sad
   ========================================================= */
(function (global) {
  'use strict';

  // o outline, b body, w light fur, k face mask, p pink, e eye, h glint,
  // t tail, g glasses, u hair, x shawl, y pin, c tear
  var GRID = [
    '...oo..........oo...',
    '..obpo........opbo..',
    '..obbbbbbbbbbbbbbo..',
    '..obbbkkkkkkkkbbbo..',
    '..obbkkkkkkkkkkbbo..',
    '..obbkkhkkkkhkkbbo..',
    '..obbkkekkkkekkbbo..',
    '..obbbkkkppkkkbbbo..',
    '..obbbbbwwwwbbbbbo..',
    '...obbbbbbbbbbbbo...',
    '....oooooooooooo....',
    '..obbbbwwwwwwbbbbo..',
    '..obbbwwwwwwwwbbbooo',
    '..obbbwwwwwwwwbbboto',
    '..obbbwwwwwwwwbbboto',
    '..obbbwwwwwwwwbbboto',
    '..obbbwwwwwwwwbbboto',
    '..obbwwwwwwwwwwbboto',
    '..obbwwwwwwwwwwbboto',
    '..owwwwwoooowwwwwoto',
    '..oooooooooooooooooo'
  ];
  var W = 20, H = GRID.length;

  function P(c, list) { return { c: c, px: list }; }

  var CATS = {
    miso: {
      name: 'Miso', breed: 'Seal-point Siamese', unlock: 0,
      blurb: 'Calm, loyal and very quiet. The perfect first study partner.',
      pal: { o: '#2a1420', b: '#e6dcb6', w: '#f4eed2', k: '#5b3446', p: '#c98f93', e: '#1d0f18', h: '#ffffff', t: '#5b3446' },
      over: []
    },
    mocha: {
      name: 'Mocha', breed: 'Orange Tabby', unlock: 1,
      blurb: 'Warm, cheerful and always hungry for another page of notes.',
      pal: { o: '#4a2412', b: '#e39b4f', w: '#f8e0b8', p: '#e58f8f', e: '#2b1a10', h: '#ffffff', t: '#e39b4f', m: '#b9671f' },
      over: [
        P('m', [[9, 2], [10, 2], [9, 3], [10, 3], [3, 5], [4, 5], [15, 5], [16, 5],
          [3, 13], [4, 13], [3, 15], [4, 15], [15, 13], [16, 13], [15, 15], [16, 15], [18, 14], [18, 16]])
      ]
    },
    espresso: {
      name: 'Espresso', breed: 'Midnight Black Cat', unlock: 3,
      blurb: 'Night-owl energy. Loves late library sessions and strong coffee.',
      pal: { o: '#0e080c', b: '#3b3138', w: '#52454d', p: '#c27a8a', e: '#f2c94c', h: '#ffffff', t: '#3b3138' },
      over: []
    },
    latte: {
      name: 'Latte', breed: 'Grey Shorthair', unlock: 6,
      blurb: 'Smooth, steady and patient. Never rushes, always finishes.',
      pal: { o: '#2e3238', b: '#9aa3ad', w: '#dfe4e8', p: '#e29aa4', e: '#232a30', h: '#ffffff', t: '#7f8892', m: '#7f8892' },
      over: [P('m', [[9, 2], [10, 2], [3, 14], [4, 14], [15, 14], [16, 14], [18, 15]])]
    },
    cookie: {
      name: 'Cookie', breed: 'Calico', unlock: 10,
      blurb: 'Three colours, zero distractions. A true study champion.',
      pal: { o: '#3a2a26', b: '#f6ead6', w: '#fffaf0', p: '#e8949a', e: '#2a1c18', h: '#ffffff', t: '#4b3a38', m: '#e08a3c', n: '#4b3a38' },
      over: [
        P('m', [[3, 2], [4, 2], [5, 2], [3, 3], [4, 3], [5, 3], [3, 4], [4, 4], [3, 12], [4, 12], [3, 13], [4, 13], [3, 14]]),
        P('n', [[13, 2], [14, 2], [15, 2], [16, 2], [14, 3], [15, 3], [16, 3], [15, 4], [16, 4],
          [14, 13], [15, 13], [16, 13], [15, 14], [16, 14], [16, 15], [15, 16], [16, 16]])
      ]
    },
    grandma: {
      name: 'Grandma Biscuit', breed: 'Wise Old Persian', unlock: 0, hidden: true,
      blurb: 'Knits, bakes and answers every question.',
      pal: { o: '#4a3a3a', b: '#cfc6bd', w: '#f0eae2', p: '#e0a0a6', e: '#2a2020', h: '#ffffff', t: '#cfc6bd',
        g: '#8a5a2b', u: '#f7f7f7', x: '#b5543c', y: '#f2c94c' },
      over: [
        P('g', [[6, 4], [7, 4], [8, 4], [6, 5], [8, 5], [6, 6], [8, 6], [6, 7], [7, 7], [8, 7],
          [11, 4], [12, 4], [13, 4], [11, 5], [13, 5], [11, 6], [13, 6], [11, 7], [12, 7], [13, 7], [9, 5], [10, 5]]),
        P('u', [[9, 0], [10, 0], [8, 1], [9, 1], [10, 1], [11, 1], [5, 2], [6, 2], [7, 2], [8, 2], [9, 2], [10, 2], [11, 2], [12, 2], [13, 2], [14, 2]]),
        P('x', [[3, 11], [4, 11], [5, 11], [6, 11], [7, 11], [8, 11], [9, 11], [10, 11], [11, 11], [12, 11], [13, 11], [14, 11], [15, 11], [16, 11],
          [3, 12], [4, 12], [5, 12], [14, 12], [15, 12], [16, 12]]),
        P('y', [[9, 12], [10, 12]])
      ]
    }
  };

  function build(id, state) {
    var cat = CATS[id] || CATS.miso;
    var g = GRID.map(function (r) { return r.split(''); });
    (cat.over || []).forEach(function (o) {
      o.px.forEach(function (p) { g[p[1]][p[0]] = o.c; });
    });
    function set(x, y, c) { g[y][x] = c; }
    var eyes = [7, 12];
    if (state === 'sleep' || state === 'blink') {
      eyes.forEach(function (x) { set(x, 5, 'k'); set(x - 1, 6, 'e'); set(x, 6, 'e'); set(x + 1, 6, 'e'); });
    } else if (state === 'happy') {
      eyes.forEach(function (x) { set(x, 5, 'e'); set(x - 1, 6, 'e'); set(x + 1, 6, 'e'); set(x, 6, 'k'); });
    } else if (state === 'sad') {
      eyes.forEach(function (x) { set(x, 5, 'e'); set(x, 7, 'c'); });
    }
    return g;
  }

  function colour(ch, pal) {
    if (ch === '.') return null;
    if (ch === 'k') return pal.k || pal.b;
    if (ch === 'c') return '#7fd0ff';
    if (ch === 'n') return pal.n || pal.m || pal.b;
    return pal[ch] || pal.b;
  }

  function draw(canvas, id, state, scale) {
    scale = scale || 6;
    var cat = CATS[id] || CATS.miso;
    var g = build(id, state || 'idle');
    canvas.width = W * scale; canvas.height = H * scale;
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var y = 0; y < H; y++) {
      for (var x = 0; x < W; x++) {
        var c = colour(g[y][x], cat.pal);
        if (c) { ctx.fillStyle = c; ctx.fillRect(x * scale, y * scale, scale, scale); }
      }
    }
  }

  function mount(el, id, opt) {
    opt = opt || {};
    var scale = opt.scale || 6, state = opt.state || 'idle', current = id;
    var canvas = document.createElement('canvas');
    canvas.className = 'cat-sprite';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', (CATS[id] || CATS.miso).name + ' the cat');
    el.appendChild(canvas);
    function render(s) { draw(canvas, current, s || state, scale); }
    render();
    if (opt.blink !== false) {
      setInterval(function () {
        if (state !== 'idle' || document.hidden) return;
        render('blink');
        setTimeout(function () { render(); }, 160);
      }, 3200 + Math.floor(Math.random() * 1800));
    }
    return {
      canvas: canvas,
      get id() { return current; },
      setState: function (s) { state = s; render(); },
      setCat: function (cid) {
        current = cid;
        canvas.setAttribute('aria-label', (CATS[cid] || CATS.miso).name + ' the cat');
        render();
      }
    };
  }

  function list() {
    return Object.keys(CATS).filter(function (k) { return !CATS[k].hidden; });
  }

  function autoMount() {
    var nodes = document.querySelectorAll('[data-cat]');
    Array.prototype.forEach.call(nodes, function (n) {
      if (n.dataset.mounted) return;
      n.dataset.mounted = '1';
      mount(n, n.dataset.cat, { scale: parseInt(n.dataset.scale || '4', 10), state: n.dataset.state || 'idle' });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoMount);
  else autoMount();

  global.Cats = { CATS: CATS, draw: draw, mount: mount, list: list, autoMount: autoMount, W: W, H: H, GRID: GRID };
})(window);
