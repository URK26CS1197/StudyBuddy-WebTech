/* =========================================================
   pomodoro.js — Home dashboard logic (FR-05)
   Timer, cat study buddies, tasks, stats, sounds, mobile drawer
   ========================================================= */
(function () {
  'use strict';
  if (!window.Auth || !Auth.session()) { window.location.replace('signin.html'); return; }

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  var settings = Object.assign({ focus: 25, short: 5, long: 15, chime: true, rain: false, auto: false }, store.get('sb_settings', {}));
  var stats = Object.assign({ days: {}, sessions: 0, fish: 0, minutes: 0 }, store.get('sb_stats', {}));
  var tasks = store.get('sb_tasks', []);
  var catId = store.get('sb_cat', 'miso');
  if (!Cats.CATS[catId] || stats.sessions < Cats.CATS[catId].unlock) catId = 'miso';

  var mode = 'focus', running = false, endAt = 0, remaining = settings.focus * 60000;
  var cycle = 0, hiddenAt = 0, hiddenTotal = 0, distracted = false, tickId = null;

  /* ---------- helpers ---------- */
  function dayKey(d) { d = d || new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function total() { return settings[mode] * 60000; }
  function pad(n) { return ('0' + n).slice(-2); }
  function fmt(ms) { var s = Math.max(0, Math.ceil(ms / 1000)); return pad(Math.floor(s / 60)) + ':' + pad(s % 60); }
  function say(text) { $('#catBubble').textContent = text; }
  function save() { store.set('sb_settings', settings); store.set('sb_stats', stats); store.set('sb_tasks', tasks); store.set('sb_cat', catId); }

  var LINES = {
    focus: ['Mrrp. I\u2019m right here studying with you.', 'Eyes on the page. I\u2019ll guard the coffee.', 'You\u2019re doing great. Keep going!', 'Quiet paws, busy brain.', 'One page at a time.'],
    rest: ['Zzz\u2026 break time. Stretch those paws.', 'Sip some water. I\u2019m napping.', 'Rest well. We go again soon.'],
    idle: ['Ready when you are. Press Start!', 'Pick a task and let\u2019s begin.', 'Shall we brew some focus?']
  };
  function rand(a) { return a[Math.floor(Math.random() * a.length)]; }

  /* ---------- cat ---------- */
  var cat = Cats.mount($('#catStage .cat-holder'), catId, { scale: 12 });
  function catState() {
    if (distracted && mode === 'focus' && running) return 'sad';
    if (running && mode !== 'focus') return 'sleep';
    return 'idle';
  }
  function syncCat() { cat.setState(catState()); }

  $('#catStage .cat-holder').addEventListener('click', function (e) {
    var h = document.createElement('span');
    h.className = 'heart'; h.textContent = '\u2665';
    h.style.left = (30 + Math.random() * 40) + '%';
    e.currentTarget.appendChild(h);
    setTimeout(function () { h.remove(); }, 1200);
    cat.setState('happy'); say(rand(['Purrrrr\u2026', 'Mrrow! That\u2019s the spot.', '*happy purring*']));
    setTimeout(syncCat, 1400);
  });

  function buildCatList() {
    var ul = $('#catList'); ul.innerHTML = '';
    Cats.list().forEach(function (id) {
      var c = Cats.CATS[id], locked = stats.sessions < c.unlock;
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'cat-option' + (id === catId ? ' selected' : '') + (locked ? ' locked' : '');
      b.setAttribute('aria-pressed', id === catId ? 'true' : 'false');
      var thumb = document.createElement('span'); thumb.className = 'thumb';
      var info = document.createElement('span'); info.className = 'info';
      info.innerHTML = '<strong>' + c.name + '</strong><small>' + (locked ? '\uD83D\uDD12 ' + (c.unlock - stats.sessions) + ' more session' + (c.unlock - stats.sessions > 1 ? 's' : '') : c.breed) + '</small>';
      b.appendChild(thumb); b.appendChild(info); li.appendChild(b); ul.appendChild(li);
      Cats.draw((function () { var cv = document.createElement('canvas'); cv.className = 'cat-sprite'; thumb.appendChild(cv); return cv; })(), id, 'idle', 2);
      b.addEventListener('click', function () {
        if (locked) { say('Finish ' + (c.unlock - stats.sessions) + ' more focus session(s) to unlock ' + c.name + '!'); return; }
        catId = id; cat.setCat(id); save(); buildCatList(); say('Hi, I\u2019m ' + c.name + '. ' + c.blurb);
      });
    });
  }

  /* ---------- audio ---------- */
  var actx = null, noise = null;
  function ctx() {
    if (!actx) { var AC = window.AudioContext || window.webkitAudioContext; if (AC) actx = new AC(); }
    if (actx && actx.state === 'suspended') actx.resume();
    return actx;
  }
  function chime() {
    if (!settings.chime || !ctx()) return;
    [660, 880, 1320].forEach(function (f, i) {
      var o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + i * 0.18;
      o.type = 'square'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + 0.4);
    });
  }
  function syncRain() {
    if (settings.rain && ctx()) {
      if (noise) return;
      var len = actx.sampleRate * 2, buf = actx.createBuffer(1, len, actx.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      var src = actx.createBufferSource(); src.buffer = buf; src.loop = true;
      var lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400;
      var hp = actx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 300;
      var g = actx.createGain(); g.gain.value = 0.09;
      src.connect(hp); hp.connect(lp); lp.connect(g); g.connect(actx.destination); src.start();
      noise = src;
    } else if (noise) { noise.stop(); noise = null; }
  }

  /* ---------- timer ---------- */
  function render() {
    $('#time').textContent = fmt(remaining);
    var pct = Math.min(100, Math.max(0, (1 - remaining / total()) * 100));
    $('#mugFill').style.height = pct + '%';
    $('#progressText').textContent = Math.round(pct) + '% of ' + settings[mode] + ' min';
    document.title = (running ? fmt(remaining) + ' \u00B7 ' : '') + 'Study Buddy';
    $('#startBtn').textContent = running ? 'Pause' : (remaining < total() ? 'Resume' : 'Start');
    $$('#modeTabs button').forEach(function (b) {
      var on = b.dataset.mode === mode; b.classList.toggle('active', on); b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    $$('#dots i').forEach(function (d, i) { d.classList.toggle('on', i < cycle); });
    $('#mug').classList.toggle('steaming', running);
  }
  function setMode(m) {
    mode = m; running = false; remaining = total(); hiddenTotal = 0; distracted = false;
    render(); syncCat(); say(rand(m === 'focus' ? LINES.idle : LINES.rest));
  }
  function start() {
    ctx(); syncRain();
    if (running) { running = false; remaining = endAt - Date.now(); say('Paused. Take a breath.'); }
    else {
      if (remaining >= total()) { hiddenTotal = 0; distracted = false; }
      running = true; endAt = Date.now() + remaining;
      say(rand(mode === 'focus' ? LINES.focus : LINES.rest));
    }
    render(); syncCat();
  }
  function recordSession() {
    var k = dayKey(), day = stats.days[k] || { sessions: 0, minutes: 0 };
    day.sessions++; day.minutes += settings.focus; stats.days[k] = day;
    stats.sessions++; stats.minutes += settings.focus;
    var earned = distracted ? 2 : 5; stats.fish += earned;
    return earned;
  }
  function complete() {
    running = false; chime();
    if (mode === 'focus') {
      var before = stats.sessions, earned = recordSession();
      cycle = Math.min(4, cycle + 1);
      var fresh = Cats.list().filter(function (id) { var u = Cats.CATS[id].unlock; return u > before && u <= stats.sessions; });
      cat.setState('happy');
      say(fresh.length ? '\uD83C\uDF89 You unlocked ' + Cats.CATS[fresh[0]].name + '! +' + earned + ' \uD83D\uDC1F' : (distracted ? 'You wandered off a bit, but you finished. +' + earned + ' \uD83D\uDC1F' : 'Session complete! +' + earned + ' \uD83D\uDC1F Proud of you.'));
      var next = cycle >= 4 ? 'long' : 'short';
      save(); buildCatList(); renderStats();
      mode = next; remaining = total(); hiddenTotal = 0; distracted = false;
    } else {
      if (mode === 'long') cycle = 0;
      mode = 'focus'; remaining = total(); say('Break over. Ready for another round?');
    }
    render();
    setTimeout(syncCat, 3500);
    if (settings.auto) setTimeout(start, 1500);
  }
  function tick() {
    if (!running) return;
    remaining = endAt - Date.now();
    if (remaining <= 0) { remaining = 0; render(); complete(); } else render();
  }
  tickId = setInterval(tick, 250);

  setInterval(function () { if (running && !document.hidden) say(rand(mode === 'focus' ? LINES.focus : LINES.rest)); }, 25000);

  document.addEventListener('visibilitychange', function () {
    if (!running || mode !== 'focus') return;
    if (document.hidden) hiddenAt = Date.now();
    else {
      hiddenTotal += Date.now() - hiddenAt;
      if (hiddenTotal > 30000 && !distracted) { distracted = true; say('Where did you go? I waited all alone\u2026 \uD83D\uDE3F'); syncCat(); }
      tick();
    }
  });

  $('#startBtn').addEventListener('click', start);
  $('#resetBtn').addEventListener('click', function () { setMode(mode); });
  $('#skipBtn').addEventListener('click', function () { setMode(mode === 'focus' ? 'short' : 'focus'); });
  $('#modeTabs').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) setMode(b.dataset.mode); });

  /* ---------- settings ---------- */
  ['focus', 'short', 'long'].forEach(function (k) {
    var inp = $('#set-' + k); inp.value = settings[k];
    inp.addEventListener('change', function () {
      var v = Math.min(120, Math.max(1, parseInt(inp.value, 10) || settings[k]));
      inp.value = v; settings[k] = v; save();
      if (!running && mode === k) { remaining = total(); render(); }
    });
  });
  [['chime', '#opt-chime'], ['rain', '#opt-rain'], ['auto', '#opt-auto']].forEach(function (p) {
    var el = $(p[1]); el.checked = !!settings[p[0]];
    el.addEventListener('change', function () { settings[p[0]] = el.checked; save(); if (p[0] === 'rain') syncRain(); });
  });

  /* ---------- tasks ---------- */
  function renderTasks() {
    var ul = $('#taskList'); ul.innerHTML = '';
    tasks.forEach(function (t, i) {
      var li = document.createElement('li'); li.className = t.done ? 'done' : '';
      var cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = t.done; cb.setAttribute('aria-label', 'Mark done: ' + t.text);
      var sp = document.createElement('span'); sp.textContent = t.text;
      var del = document.createElement('button'); del.type = 'button'; del.className = 'del'; del.textContent = '\u2715'; del.setAttribute('aria-label', 'Delete task');
      cb.addEventListener('change', function () { t.done = cb.checked; if (t.done) { cat.setState('happy'); say('Task done! Purrfect. \uD83D\uDC3E'); setTimeout(syncCat, 1500); } save(); renderTasks(); });
      del.addEventListener('click', function () { tasks.splice(i, 1); save(); renderTasks(); });
      li.appendChild(cb); li.appendChild(sp); li.appendChild(del); ul.appendChild(li);
    });
    var left = tasks.filter(function (t) { return !t.done; }).length;
    $('#taskCount').textContent = tasks.length ? left + ' left' : 'Nothing yet';
  }
  $('#taskForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var inp = $('#taskInput'), v = inp.value.trim();
    if (!v) return;
    tasks.push({ text: v.slice(0, 80), done: false }); inp.value = ''; save(); renderTasks();
  });

  /* ---------- stats ---------- */
  function renderStats() {
    var today = stats.days[dayKey()] || { sessions: 0, minutes: 0 };
    $('#statToday').textContent = today.sessions;
    $('#statMin').textContent = today.minutes;
    $('#statTotal').textContent = stats.sessions;
    $('#statFish').textContent = stats.fish;
    $('#fishCount').textContent = stats.fish;
    var chart = $('#weekChart'); chart.innerHTML = '';
    var vals = [], max = 30, names = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    for (var i = 6; i >= 0; i--) {
      var d = new Date(); d.setDate(d.getDate() - i);
      var m = (stats.days[dayKey(d)] || { minutes: 0 }).minutes; vals.push({ m: m, n: names[d.getDay()] }); max = Math.max(max, m);
    }
    vals.forEach(function (v) {
      var col = document.createElement('div'); col.className = 'bar-col';
      col.innerHTML = '<div class="bar" style="height:' + Math.max(4, Math.round(v.m / max * 100)) + '%" title="' + v.m + ' min"></div><span>' + v.n + '</span>';
      chart.appendChild(col);
    });
  }

  /* ---------- session / drawer ---------- */
  var sess = Auth.session();
  $('#greeting').textContent = 'Hi, ' + (sess.name || 'friend').split(' ')[0] + '!';
  $('#signOut').addEventListener('click', function () { Auth.logout(); window.location.href = 'index.html'; });
  var menuBtn = $('#menuBtn');
  function drawer(open) {
    document.body.classList.toggle('drawer-open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  menuBtn.addEventListener('click', function () { drawer(!document.body.classList.contains('drawer-open')); });
  $('#scrim').addEventListener('click', function () { drawer(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') drawer(false); });
  window.addEventListener('resize', function () { if (window.innerWidth >= 768) drawer(false); });

  buildCatList(); renderTasks(); renderStats(); render(); syncCat(); say(rand(LINES.idle));
})();
