/* =========================================================
   auth.js — account storage + page wiring for
   register.html (FR-02), signup.html (FR-03), signin.html (FR-04)

   NOTE: This is a front-end learning project. Accounts live in
   the browser's localStorage and passwords are SHA-256 hashed
   before saving. A production app would use a real backend.
   ========================================================= */
(function () {
  'use strict';
  var USERS = 'sb_users', SESSION = 'sb_session';

  function read(key, fallback) {
    try { var v = window.localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch (e) { return fallback; }
  }
  function write(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { return false; }
  }

  function hash(text) {
    var data = 'study-buddy:' + text;
    if (window.crypto && window.crypto.subtle && window.TextEncoder) {
      return window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(data)).then(function (buf) {
        return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
      });
    }
    return Promise.resolve(btoa(unescape(encodeURIComponent(data))));
  }

  var Auth = {
    session: function () { return read(SESSION, null); },
    logout: function () { try { window.localStorage.removeItem(SESSION); } catch (e) {} },
    guest: function () { write(SESSION, { name: 'Guest', guest: true }); },
    register: function (profile, password) {
      var users = read(USERS, []);
      var email = profile.email.toLowerCase();
      if (users.some(function (u) { return u.email === email; })) {
        return Promise.reject(new Error('An account with this email already exists.'));
      }
      return hash(password).then(function (h) {
        profile.email = email; profile.pass = h;
        users.push(profile);
        write(USERS, users);
        return profile;
      });
    },
    login: function (email, password) {
      var users = read(USERS, []);
      var user = users.filter(function (u) { return u.email === email.toLowerCase(); })[0];
      return hash(password).then(function (h) {
        if (!user || user.pass !== h) throw new Error('Invalid email or password.');
        write(SESSION, { name: user.name, email: user.email });
        return user;
      });
    }
  };
  window.Auth = Auth;

  function banner(el, msg, type) {
    if (!el) return;
    el.textContent = msg;
    el.className = 'alert ' + (type || 'alert-error');
    el.hidden = false;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var q = function (id) { return document.getElementById(id); };

    /* ---------- FR-02 register.html ---------- */
    var reg = q('registerForm');
    if (reg) {
      SBValidate.init(reg, function () {
        var f = reg.elements;
        Auth.register({ name: f.fullName.value.trim(), empId: f.empId.value.toUpperCase(),
          email: f.email.value.trim(), mobile: f.mobile.value, dept: f.dept.value }, f.password.value)
          .then(function () {
            banner(q('formAlert'), 'Account created! Taking you to sign in\u2026', 'alert-ok');
            setTimeout(function () { window.location.href = 'signin.html?registered=1'; }, 1200);
          })
          .catch(function (err) { banner(q('formAlert'), err.message); });
      });
    }

    /* ---------- FR-03 signup.html ---------- */
    var sign = q('signupForm');
    if (sign) {
      SBValidate.init(sign, function () {
        var f = sign.elements, email = f.email.value.trim();
        Auth.register({ name: email.split('@')[0], email: email, empId: '', mobile: '', dept: '' }, f.password.value)
          .then(function () { return Auth.login(email, f.password.value); })
          .then(function () {
            banner(q('formAlert'), 'Welcome to the caf\u00E9! Opening your study room\u2026', 'alert-ok');
            setTimeout(function () { window.location.href = 'home.html'; }, 900);
          })
          .catch(function (err) { banner(q('formAlert'), err.message); });
      });
    }

    /* ---------- FR-04 signin.html ---------- */
    var login = q('signinForm');
    if (login) {
      var pw = q('password'), eye = q('togglePw'), alertBox = q('formAlert');
      if (/registered=1/.test(window.location.search)) banner(alertBox, 'Registration complete \u2014 please sign in.', 'alert-ok');

      eye.addEventListener('click', function () {
        var hidden = pw.type === 'password';
        pw.type = hidden ? 'text' : 'password';
        eye.textContent = hidden ? '\uD83D\uDE48' : '\uD83D\uDC41';
        eye.setAttribute('aria-label', hidden ? 'Hide password' : 'Show password');
        eye.setAttribute('aria-pressed', hidden ? 'true' : 'false');
      });

      login.addEventListener('submit', function (e) {
        e.preventDefault();
        var email = login.elements.email.value.trim(), pass = pw.value;
        if (!SBValidate.RULES.email.re.test(email)) return banner(alertBox, 'Please enter a valid email address.');
        if (pass.length < 8) return banner(alertBox, 'Password must be at least 8 characters.');
        Auth.login(email, pass)
          .then(function () { window.location.href = 'home.html'; })
          .catch(function (err) { banner(alertBox, err.message); });
      });

      var guestBtn = q('guestBtn');
      if (guestBtn) guestBtn.addEventListener('click', function () { Auth.guest(); window.location.href = 'home.html'; });
    }
  });
})();
