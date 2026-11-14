/* =========================================================
   theme.js — FR-07 Light / Dark mode toggle
   - Switches CSS custom-property tokens via [data-theme]
   - Persists the choice with window.localStorage
   - Loaded in <head> so the saved theme paints with no flash
   ========================================================= */
(function () {
  'use strict';
  var KEY = 'sb_theme';

  function saved() {
    try { return window.localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function systemPreference() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function current() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }
  function paintButton(theme) {
    var btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.textContent = theme === 'dark' ? '\u2600 Light' : '\u263E Dark';
    btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  }
  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    paintButton(theme);
  }
  function toggle() {
    var next = current() === 'dark' ? 'light' : 'dark';
    apply(next);
    try { window.localStorage.setItem(KEY, next); } catch (e) { /* private mode */ }
  }

  apply(saved() || systemPreference());

  document.addEventListener('DOMContentLoaded', function () {
    paintButton(current());
    var btn = document.getElementById('themeToggle');
    if (btn) btn.addEventListener('click', toggle);
  });

  window.SBTheme = { apply: apply, toggle: toggle, current: current };
})();
