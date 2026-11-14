/* =========================================================
   chatbot.js — FR-06 Grandma Biscuit study chatbot
   - Floating Action Button (position: fixed, bottom-right)
   - Expandable panel with .user-msg and .bot-msg nodes
   - LIVE mode: POSTs to /api/chat (Claude on Vercel)
   - OFFLINE mode: built-in keyword-matching reply engine,
     local quizzes and an extractive summariser
   - Log auto-scrolls: log.scrollTop = log.scrollHeight
   ========================================================= */
(function () {
  'use strict';

  /* ---------- offline knowledge ---------- */
  var KB = [
    { k: ['pomodoro', 'technique'], a: 'The **Pomodoro Technique**: study for 25 minutes, rest for 5, and after four rounds take a longer 15\u201330 minute break. Short sprints keep your brain fresh, dearie.' },
    { k: ['html'], a: '**HTML** (HyperText Markup Language) gives a web page its structure: headings, paragraphs, links, forms and images, all written as tags like `<h1>` and `<p>`.' },
    { k: ['flexbox', 'flex'], a: '**Flexbox** lays items out along one axis. Try `display:flex; flex-direction:column;` for a stacked mobile layout, and `justify-content` / `align-items` to position things.' },
    { k: ['grid'], a: '**CSS Grid** is a two-dimensional layout system. `grid-template-columns: 250px 1fr 300px;` makes a fixed sidebar, a flexible centre and a fixed right column.' },
    { k: ['css'], a: '**CSS** styles HTML: colours, fonts, spacing and layout. Use `display:grid` for two-dimensional layouts and `display:flex` for one-dimensional rows or columns.' },
    { k: ['javascript', 'js'], a: '**JavaScript** makes pages interactive. It reacts to events (clicks, typing), changes the DOM and talks to servers with `fetch()`.' },
    { k: ['dom'], a: 'The **DOM** (Document Object Model) is the live tree of a page that JavaScript can read and change, e.g. `document.querySelector(".btn").textContent = "Hi"`.' },
    { k: ['regex', 'regular expression'], a: 'A **regex** describes a text pattern. `/^[6-9]\\d{9}$/` means: start, a digit 6\u20139, then nine more digits, end. Perfect for validating phone numbers.' },
    { k: ['localstorage', 'local storage'], a: '**localStorage** saves small key/value strings in the browser even after it closes: `localStorage.setItem("theme","dark")`.' },
    { k: ['git', 'github'], a: '**Git** tracks changes to your code, and **GitHub** hosts the repository online. Remember: `git add .` \u2192 `git commit -m "message"` \u2192 `git push`.' },
    { k: ['vercel', 'deploy'], a: '**Vercel** hosts your site for free over HTTPS. Push to GitHub, import the repo in Vercel and every push redeploys automatically.' },
    { k: ['photosynthesis'], a: '**Photosynthesis**: plants turn light + water + CO\u2082 into glucose and oxygen, mostly in the chloroplasts. 6CO\u2082 + 6H\u2082O \u2192 C\u2086H\u2081\u2082O\u2086 + 6O\u2082.' },
    { k: ['newton', 'laws of motion'], a: '**Newton\u2019s laws**: (1) objects keep their motion unless a force acts; (2) F = ma; (3) every action has an equal and opposite reaction.' },
    { k: ['derivative'], a: 'A **derivative** is the rate of change of a function. For f(x) = x\u00B2, the derivative is f\u2032(x) = 2x: the slope at each point.' },
    { k: ['recursion'], a: '**Recursion** is when a function calls itself on a smaller problem until it reaches a base case, like a factorial: n! = n \u00D7 (n\u22121)!, with 0! = 1.' }
  ];

  var TIPS = [
    'Put your phone in another room. Even a face-down phone steals attention.',
    'Test yourself instead of re-reading. Recalling an answer beats reading it again.',
    'Study one topic per Pomodoro. Single-tasking is a superpower.',
    'Sleep is when your brain files today\u2019s notes. Don\u2019t skip it before an exam.',
    'Start with the hardest subject while your energy is fresh.',
    'Explain the idea out loud to your cat. Seriously, it works!'
  ];

  var QUIZ = {
    web: { title: 'Web Technology', q: [
      { q: 'Which tag holds the main heading of a page?', o: ['<p>', '<h1>', '<div>', '<span>'], a: 1 },
      { q: 'Which CSS property makes a Flexbox container?', o: ['display: flex', 'position: flex', 'float: flex', 'flex: container'], a: 0 },
      { q: 'Which method saves data in the browser permanently?', o: ['alert()', 'console.log()', 'localStorage.setItem()', 'document.write()'], a: 2 },
      { q: 'Which regex matches exactly 10 digits?', o: ['/\\d{10}/', '/^\\d{10}$/', '/^\\d*$/', '/[10]/'], a: 1 },
      { q: 'What does `position: fixed` do?', o: ['Keeps an element at one spot in the viewport', 'Hides the element', 'Makes text bold', 'Centres the element'], a: 0 },
      { q: 'Which JS event fires when a field loses focus?', o: ['click', 'input', 'blur', 'submit'], a: 2 }
    ] },
    science: { title: 'Science', q: [
      { q: 'What gas do plants take in for photosynthesis?', o: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Helium'], a: 1 },
      { q: 'What is the chemical symbol for water?', o: ['CO\u2082', 'O\u2082', 'H\u2082O', 'NaCl'], a: 2 },
      { q: 'Which planet is closest to the Sun?', o: ['Venus', 'Earth', 'Mars', 'Mercury'], a: 3 },
      { q: 'Force equals mass times what?', o: ['Speed', 'Acceleration', 'Time', 'Distance'], a: 1 },
      { q: 'What is the powerhouse of the cell?', o: ['Nucleus', 'Ribosome', 'Mitochondria', 'Membrane'], a: 2 }
    ] },
    math: { title: 'Maths', q: [
      { q: 'What is 12 \u00D7 8?', o: ['86', '96', '108', '98'], a: 1 },
      { q: 'What is the derivative of x\u00B2?', o: ['x', '2x', 'x\u00B3', '2'], a: 1 },
      { q: 'What is the value of \u03C0 to 2 decimals?', o: ['3.12', '3.14', '3.41', '3.16'], a: 1 },
      { q: 'What is 15% of 200?', o: ['20', '25', '30', '35'], a: 2 },
      { q: 'The square root of 144 is?', o: ['10', '11', '12', '14'], a: 2 }
    ] }
  };

  var STOP = 'a an the and or but if of to in on at for with is are was were be been it this that these those as by from not so than then there their they we you i he she his her its our your do does did can could will would should have has had'.split(' ');

  function summarise(text) {
    var sentences = text.replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+/g) || [text];
    if (sentences.length <= 2) return null;
    var freq = {};
    text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).forEach(function (w) {
      if (w.length > 2 && STOP.indexOf(w) === -1) freq[w] = (freq[w] || 0) + 1;
    });
    var scored = sentences.map(function (s, i) {
      var score = 0, words = s.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
      words.forEach(function (w) { score += freq[w] || 0; });
      return { s: s.trim(), i: i, score: score / Math.max(words.length, 8) };
    });
    var top = scored.slice().sort(function (a, b) { return b.score - a.score; })
      .slice(0, Math.min(3, Math.ceil(sentences.length / 3))).sort(function (a, b) { return a.i - b.i; });
    return top.map(function (t) { return '- ' + t.s; }).join('\n');
  }

  var quiz = null; // active offline quiz

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function has(t, words) { return words.some(function (w) { return t.indexOf(w) !== -1; }); }

  function askQuestion() {
    var item = quiz.items[quiz.n];
    var letters = ['A', 'B', 'C', 'D'];
    return '**Question ' + (quiz.n + 1) + ' of ' + quiz.items.length + '**\n' + item.q + '\n' +
      item.o.map(function (o, i) { return letters[i] + ') ' + o; }).join('\n') + '\n\nAnswer with A, B, C or D, sweetie.';
  }
  function startQuiz(topic) {
    var bank = QUIZ[topic];
    var items = bank.q.slice().sort(function () { return Math.random() - 0.5; }).slice(0, 5);
    quiz = { items: items, n: 0, score: 0, title: bank.title };
    return 'Lovely, let\u2019s do a **' + bank.title + '** quiz. Sharpen those whiskers!\n\n' + askQuestion();
  }
  function answerQuiz(text) {
    var m = /^\s*\(?([a-d])\)?[\s.)!]*$/i.exec(text);
    if (!m) return null;
    var item = quiz.items[quiz.n], guess = m[1].toUpperCase().charCodeAt(0) - 65, out;
    if (guess === item.a) { quiz.score++; out = 'Purrfect! \u2713 That\u2019s right.'; }
    else { out = 'Not quite, dear. The answer was **' + String.fromCharCode(65 + item.a) + ') ' + item.o[item.a] + '**.'; }
    quiz.n++;
    if (quiz.n >= quiz.items.length) {
      var s = quiz.score, t = quiz.items.length;
      out += '\n\n**Quiz finished! You scored ' + s + '/' + t + '.** ' + (s === t ? 'Absolutely brilliant, my clever kitten!' : s >= t / 2 ? 'Very nice. A little more practice and you\u2019ll be perfect.' : 'Don\u2019t fret. Every mistake is a lesson. Shall we go again?');
      quiz = null;
    } else { out += '\n\n' + askQuestion(); }
    return out;
  }

  function localReply(raw) {
    var text = raw.trim(), t = text.toLowerCase();

    if (quiz) {
      var r = answerQuiz(text);
      if (r) return r;
      if (has(t, ['stop', 'quit', 'cancel', 'end'])) { quiz = null; return 'Alright dear, we\u2019ll stop the quiz. Come back whenever you like.'; }
      return 'Please answer with **A, B, C or D**, or say "stop" to end the quiz.';
    }

    var arith = /^[\d\s+\-*/().x\u00D7\u00F7]+$/.test(t) && /\d/.test(t) && /[+\-*/x\u00D7\u00F7]/.test(t);
    var cleaned = t.replace(/^(what is|what's|calculate|solve|compute)\s+/, '').replace(/[?=]+$/, '').trim();
    if (window.Calc && (arith || /^[\d\s+\-*/().x\u00D7\u00F7]+$/.test(cleaned)) && /\d/.test(cleaned) && /[+\-*/x\u00D7\u00F7]/.test(cleaned)) {
      try { return 'That comes to **' + window.Calc.evaluate(cleaned.replace(/x/g, '*')) + '**, dearie.'; }
      catch (e) { return e.message === 'DIV0' ? 'Oh my, we can\u2019t divide by zero, sweetie!' : 'Hmm, that sum doesn\u2019t look right to me.'; }
    }

    if (/^(hi|hello|hey|hiya|good (morning|evening|afternoon))\b/.test(t)) return pick(['Hello, my dear! Grandma Biscuit at your service. What are we studying today?', 'Well hello there, little scholar! Fancy a quiz, a summary, or an explanation?']);
    if (has(t, ['thank'])) return pick(['You\u2019re very welcome, sweetie. Now back to the books!', 'Anytime, dear. Purr-fect work today.']);
    if (has(t, ['who are you', 'your name', 'about you'])) return 'I\u2019m **Grandma Biscuit**, the oldest and wisest cat at the caf\u00E9. I can explain topics, quiz you and summarise your notes.';
    if (has(t, ['help', 'what can you do', 'commands'])) return 'I can help with:\n- **Explain** a topic (try "explain CSS grid")\n- **Quiz** you (say "quiz me on web, science or maths")\n- **Summarise** notes (say "summarize:" and paste your text)\n- **Study tips**, and quick **sums** like 12*7';

    if (/^(quiz|test me|question)/.test(t) || has(t, ['quiz me', 'make a quiz', 'test me'])) {
      if (has(t, ['web', 'html', 'css', 'javascript', 'js', 'tech'])) return startQuiz('web');
      if (has(t, ['science', 'biology', 'physics', 'chemistry'])) return startQuiz('science');
      if (has(t, ['math', 'maths', 'algebra', 'calculus'])) return startQuiz('math');
      return 'Which topic, dear? Say **quiz me on web**, **science** or **maths**.';
    }

    if (/^summari[sz]e/.test(t) || has(t, ['tl;dr', 'tldr'])) {
      var body = text.replace(/^summari[sz]e( this| the following)?[:\s-]*/i, '').trim();
      if (body.length < 120) return 'Paste the notes you want summarised right after the word "summarize:", sweetie. A few sentences at least.';
      var s = summarise(body);
      return s ? 'Here are the key points, dear:\n' + s : 'That\u2019s already nice and short. I couldn\u2019t trim it any further!';
    }

    if (has(t, ['tip', 'focus', 'concentrate', 'distract', 'procrastinat', 'motivat', 'exam', 'memor', 'sleep', 'bored', 'tired'])) return '\uD83D\uDCA1 ' + pick(TIPS);
    if (has(t, ['break', 'rest'])) return 'Breaks are part of studying! Stretch, drink water and look out of a window. Then we go again.';
    if (has(t, ['joke', 'funny'])) return pick(['Why did the cat sit on the computer? To keep an eye on the mouse!', 'What do cats study? Mice-ology, of course.']);

    for (var i = 0; i < KB.length; i++) {
      for (var j = 0; j < KB[i].k.length; j++) {
        var key = KB[i].k[j];
        var re = new RegExp('(^|[^a-z])' + key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^a-z]|$)');
        if (re.test(t)) return KB[i].a;
      }
    }
    return 'Oh dear, my recipe book has no page for that. In offline mode I can **explain** common topics, **quiz** you, **summarise** notes and give **study tips**. With live mode switched on I can answer almost anything!';
  }

  /* ---------- UI ---------- */
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function render(s) {
    var h = esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>');
    return h.split('\n').map(function (l) { return /^\s*[-*] /.test(l) ? '\u2022 ' + l.replace(/^\s*[-*] /, '') : l; }).join('<br>');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var fab = document.createElement('button');
    fab.id = 'chat-fab'; fab.type = 'button';
    fab.setAttribute('aria-label', 'Open chat with Grandma Biscuit'); fab.setAttribute('aria-expanded', 'false');
    var fabCat = document.createElement('span'); fab.appendChild(fabCat);
    var fabLabel = document.createElement('span'); fabLabel.className = 'fab-label'; fabLabel.textContent = 'Ask Grandma'; fab.appendChild(fabLabel);

    var panel = document.createElement('section');
    panel.id = 'chat-panel'; panel.setAttribute('aria-label', 'Chat with Grandma Biscuit'); panel.hidden = true;
    panel.innerHTML =
      '<header class="chat-head"><span class="chat-avatar"></span><div><strong>Grandma Biscuit</strong>' +
      '<small id="chat-mode">\u25CF connecting\u2026</small></div><button type="button" id="chat-close" aria-label="Close chat">\u2715</button></header>' +
      '<div id="chat-log" class="chat-log" aria-live="polite"></div>' +
      '<div class="chat-chips"><button type="button" data-say="Quiz me on web">\uD83C\uDFAF Quiz me</button>' +
      '<button type="button" data-say="Summarize: ">\uD83D\uDCDD Summarize</button>' +
      '<button type="button" data-say="Explain CSS grid">\uD83D\uDCA1 Explain</button>' +
      '<button type="button" data-say="Give me a study tip">\u2615 Tip</button></div>' +
      '<form id="chat-form" autocomplete="off"><input id="chat-input" type="text" maxlength="1500" placeholder="Ask Grandma anything\u2026" aria-label="Your message">' +
      '<button type="submit" class="btn btn-small">Send</button></form>';

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    if (window.Cats) {
      Cats.mount(fabCat, 'grandma', { scale: 3 });
      Cats.mount(panel.querySelector('.chat-avatar'), 'grandma', { scale: 2, blink: false });
    }

    var log = panel.querySelector('#chat-log'), form = panel.querySelector('#chat-form'),
        input = panel.querySelector('#chat-input'), modeEl = panel.querySelector('#chat-mode');
    var history = [], liveOK = null, busy = false;

    function add(text, who) {
      var d = document.createElement('div');
      d.className = who === 'user' ? 'user-msg' : 'bot-msg';
      d.innerHTML = who === 'user' ? esc(text) : render(text);
      log.appendChild(d);
      log.scrollTop = log.scrollHeight;
      return d;
    }
    function setMode(live) {
      liveOK = live;
      modeEl.textContent = live ? '\u25CF live \u00B7 AI' : '\u25CB offline mode';
      modeEl.className = live ? 'mode-live' : 'mode-off';
    }

    function open() {
      panel.hidden = false; panel.classList.add('open');
      fab.setAttribute('aria-expanded', 'true'); fab.classList.add('is-open');
      if (!log.children.length) {
        add('Well hello, dearie! \uD83E\uDDF6 I\u2019m **Grandma Biscuit**. Ask me to **explain** a topic, **quiz** you or **summarise** your notes.', 'bot');
      }
      setTimeout(function () { input.focus(); }, 50);
    }
    function close() {
      panel.hidden = true; panel.classList.remove('open');
      fab.setAttribute('aria-expanded', 'false'); fab.classList.remove('is-open'); fab.focus();
    }
    fab.addEventListener('click', function () { panel.hidden ? open() : close(); });
    panel.querySelector('#chat-close').addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) close(); });

    panel.querySelector('.chat-chips').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var say = b.dataset.say;
      if (say.slice(-1) === ' ') { input.value = say; input.focus(); } else { send(say); }
    });

    function live(text) {
      if (window.location.protocol === 'file:') return Promise.reject(new Error('no server'));
      var ctrl = new AbortController(), timer = setTimeout(function () { ctrl.abort(); }, 25000);
      return fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctrl.signal,
        body: JSON.stringify({ messages: history.slice(-12) })
      }).then(function (r) {
        clearTimeout(timer);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      }).then(function (d) {
        if (!d || !d.reply) throw new Error('empty');
        return d.reply;
      });
    }

    function send(text) {
      text = text.trim();
      if (!text || busy) return;
      busy = true;
      add(text, 'user'); input.value = '';
      history.push({ role: 'user', content: text });
      var typing = add('Grandma is knitting a reply\u2026', 'bot'); typing.classList.add('typing');

      var offlineQuiz = !!quiz;
      var run = offlineQuiz || liveOK === false && history.length % 6 !== 1
        ? Promise.reject(new Error('use local'))
        : live(text);

      run.then(function (reply) { setMode(true); return reply; })
        .catch(function () { if (!offlineQuiz) setMode(false); return localReply(text); })
        .then(function (reply) {
          typing.remove();
          history.push({ role: 'assistant', content: reply });
          add(reply, 'bot');
          busy = false;
        });
    }

    form.addEventListener('submit', function (e) { e.preventDefault(); send(input.value); });
    setMode(false);
    modeEl.textContent = '\u25CF ready';
  });

  window.GrandmaLocal = { reply: localReply, summarise: summarise };
})();
