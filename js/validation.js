/* =========================================================
   validation.js — FR-02 / FR-03 real-time Regex validation
   - Rules run on field `blur` and on form `submit`
   - Invalid fields get .invalid + a <span class="error-msg">
   - Valid fields get .valid
   - Submit button stays disabled until every rule passes
   Usage: add data-rule="name|empId|email|mobile|dept|password|confirm|terms"
          to inputs inside <form data-validate>
   ========================================================= */
(function () {
  'use strict';

  var RULES = {
    name:     { re: /^[a-zA-Z\s]{2,50}$/, msg: 'Use 2\u201350 letters and spaces only.' },
    empId:    { re: /^[A-Z0-9]{6,12}$/i, msg: 'Enter 6\u201312 letters or digits (no symbols).' },
    email:    { re: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, msg: 'Enter a valid email, e.g. you@example.com.' },
    mobile:   { re: /^[6-9]\d{9}$/, msg: 'Enter 10 digits starting with 6, 7, 8 or 9.' },
    dept:     { test: function (v) { return v !== ''; }, msg: 'Please choose your division.' },
    password: { re: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                msg: 'Min 8 chars with uppercase, lowercase, number and a symbol (@$!%*?&).' },
    confirm:  { test: function (v, form) {
                  var pw = form.querySelector('[data-rule="password"]');
                  return v !== '' && pw && v === pw.value;
                }, msg: 'Passwords do not match.' },
    terms:    { test: function (v, form, el) { return el.checked; }, msg: 'Please accept the Terms of Service.' }
  };

  function errorSpan(el) {
    var holder = el.closest('.field') || el.parentNode;
    var span = holder.querySelector('.error-msg');
    if (!span) {
      span = document.createElement('span');
      span.className = 'error-msg';
      span.setAttribute('role', 'alert');
      holder.appendChild(span);
    }
    return span;
  }

  function check(el, form, show) {
    var rule = RULES[el.dataset.rule];
    if (!rule) return true;
    var value = el.type === 'checkbox' ? '' : el.value;
    var ok = rule.re ? rule.re.test(value) : !!rule.test(value, form, el);
    if (show) {
      el.classList.toggle('invalid', !ok);
      el.classList.toggle('valid', ok);
      el.setAttribute('aria-invalid', ok ? 'false' : 'true');
      errorSpan(el).textContent = ok ? '' : rule.msg;
    }
    return ok;
  }

  function init(form, onValid) {
    var fields = Array.prototype.slice.call(form.querySelectorAll('[data-rule]'));
    var submit = form.querySelector('button[type="submit"]');
    var touched = new Set();

    function allValid() {
      return fields.every(function (f) { return check(f, form, false); });
    }
    function refresh() { if (submit) submit.disabled = !allValid(); }

    fields.forEach(function (f) {
      var evt = f.type === 'checkbox' || f.tagName === 'SELECT' ? 'change' : 'input';
      f.addEventListener('blur', function () { touched.add(f); check(f, form, true); refresh(); });
      f.addEventListener(evt, function () {
        if (touched.has(f) || f.type === 'checkbox' || f.tagName === 'SELECT') { touched.add(f); check(f, form, true); }
        if (f.dataset.rule === 'password') {
          var c = form.querySelector('[data-rule="confirm"]');
          if (c && touched.has(c)) check(c, form, true);
        }
        refresh();
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      fields.forEach(function (f) { touched.add(f); if (!check(f, form, true)) ok = false; });
      refresh();
      if (ok && typeof onValid === 'function') onValid(form);
    });

    refresh();
  }

  window.SBValidate = { RULES: RULES, init: init, check: check };
})();
