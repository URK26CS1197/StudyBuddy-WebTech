/* =========================================================
   calculator.js — FR-08 JavaScript Calculator module
   - Key grid: 0-9, + - * /, decimal point, C, =
   - Uses a small recursive-descent parser (no eval)
   - Errors: division by zero and invalid expressions
   - Also exposed as window.Calc.evaluate() for the chatbot
   ========================================================= */
(function () {
  'use strict';

  function tokenize(src) {
    var tokens = [], i = 0, m;
    src = String(src).replace(/\s+/g, '').replace(/\u00D7/g, '*').replace(/\u00F7/g, '/');
    while (i < src.length) {
      var ch = src[i];
      if (/[0-9.]/.test(ch)) {
        m = /^\d*\.?\d+|^\d+\.?/.exec(src.slice(i));
        if (!m) throw new Error('ERR');
        tokens.push({ t: 'n', v: parseFloat(m[0]) });
        i += m[0].length;
      } else if ('+-*/()'.indexOf(ch) !== -1) {
        tokens.push({ t: ch }); i++;
      } else {
        throw new Error('ERR');
      }
    }
    return tokens;
  }

  function evaluate(src) {
    var tokens = tokenize(src), pos = 0;
    if (!tokens.length) throw new Error('ERR');
    function peek() { return tokens[pos]; }
    function next() { return tokens[pos++]; }

    function factor() {
      var tk = next();
      if (!tk) throw new Error('ERR');
      if (tk.t === 'n') return tk.v;
      if (tk.t === '-') return -factor();
      if (tk.t === '+') return factor();
      if (tk.t === '(') {
        var v = expr();
        if (!peek() || next().t !== ')') throw new Error('ERR');
        return v;
      }
      throw new Error('ERR');
    }
    function term() {
      var v = factor();
      while (peek() && (peek().t === '*' || peek().t === '/')) {
        var op = next().t, r = factor();
        if (op === '/') {
          if (r === 0) throw new Error('DIV0');
          v = v / r;
        } else { v = v * r; }
      }
      return v;
    }
    function expr() {
      var v = term();
      while (peek() && (peek().t === '+' || peek().t === '-')) {
        var op = next().t, r = term();
        v = op === '+' ? v + r : v - r;
      }
      return v;
    }
    var result = expr();
    if (pos !== tokens.length) throw new Error('ERR');
    if (!isFinite(result)) throw new Error('ERR');
    return Number(result.toPrecision(12));
  }

  var KEYS = [
    ['C', 'clear'], ['(', 'op'], [')', 'op'], ['/', 'op'],
    ['7'], ['8'], ['9'], ['*', 'op'],
    ['4'], ['5'], ['6'], ['-', 'op'],
    ['1'], ['2'], ['3'], ['+', 'op'],
    ['0'], ['.'], ['\u232B', 'back'], ['=', 'equals']
  ];

  function mount(root) {
    if (!root) return;
    var display = root.querySelector('#calc-display');
    var grid = root.querySelector('.calc-grid');
    var expression = '', justEvaluated = false;

    KEYS.forEach(function (k) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = k[0];
      b.className = 'calc-key' + (k[1] ? ' ' + k[1] : '');
      b.dataset.key = k[0];
      b.setAttribute('aria-label', { '/': 'divide', '*': 'multiply', '-': 'minus', '+': 'plus', '=': 'equals', 'C': 'clear', '\u232B': 'backspace' }[k[0]] || k[0]);
      grid.appendChild(b);
    });

    function show(text, isError) {
      display.textContent = text === '' ? '0' : text;
      display.classList.toggle('calc-error', !!isError);
    }
    function press(key) {
      if (display.classList.contains('calc-error')) { expression = ''; display.classList.remove('calc-error'); }
      if (key === 'C') { expression = ''; justEvaluated = false; return show('0'); }
      if (key === '\u232B') { expression = expression.slice(0, -1); return show(expression); }
      if (key === '=') {
        if (!expression) return;
        try {
          var r = evaluate(expression);
          expression = String(r); justEvaluated = true; show(expression);
        } catch (e) {
          expression = ''; justEvaluated = false;
          show(e.message === 'DIV0' ? 'Cannot divide by 0' : 'Invalid expression', true);
        }
        return;
      }
      var isOp = '+-*/'.indexOf(key) !== -1;
      if (justEvaluated && !isOp && key !== ')') expression = '';
      justEvaluated = false;
      if (isOp && /[+\-*/]$/.test(expression) && key !== '-') expression = expression.slice(0, -1);
      if (expression.length >= 18) return;
      expression += key;
      show(expression);
    }

    grid.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (b) press(b.dataset.key);
    });
    root.addEventListener('keydown', function (e) {
      if (/^[0-9+\-*/().]$/.test(e.key)) { e.preventDefault(); press(e.key); }
      else if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); press('='); }
      else if (e.key === 'Backspace') { e.preventDefault(); press('\u232B'); }
      else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') { e.preventDefault(); press('C'); }
    });
    show('0');
  }

  window.Calc = { evaluate: evaluate, mount: mount };
  document.addEventListener('DOMContentLoaded', function () { mount(document.getElementById('calculator')); });
})();
