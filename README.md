# ☕ Study Buddy Café

A cozy pixel-coffee **Pomodoro timer** with cat study buddies and **Grandma Biscuit**, an AI study chatbot that clears doubts, makes quizzes and summarises notes.
Pure HTML + CSS + vanilla JavaScript front end, plus one tiny serverless function for the live chatbot.

## Project structure

```
study-buddy/
├── index.html        FR-01  Landing page
├── register.html     FR-02  Full registration (Regex validation)
├── signup.html       FR-03  Quick sign-up (email, password, ToS)
├── signin.html       FR-04  Sign in (eye toggle, error banner, guest mode)
├── home.html         FR-05  Dashboard (Grid on desktop, Flexbox + drawer on mobile)
├── css/
│   ├── styles.css    Design tokens, pixel components, chatbot, calculator
│   └── layout.css    Page layouts + responsive breakpoints
├── js/
│   ├── theme.js      FR-07  Light/Dark toggle + localStorage
│   ├── validation.js FR-02/03  Regex rules, blur/submit validation
│   ├── auth.js       Account storage + form wiring (register/signup/signin)
│   ├── chatbot.js    FR-06  FAB, chat panel, offline keyword engine + live AI
│   ├── calculator.js FR-08  Calculator with zero-division/invalid handling
│   ├── pomodoro.js   Timer, tasks, stats, sounds, mobile drawer
│   └── cats.js       Pixel-cat sprite engine (canvas)
├── api/chat.js       Vercel serverless function (calls Claude; key stays secret)
├── server.js         Zero-dependency local dev server
├── vercel.json, package.json, .env.example, .gitignore
└── assets/miso-siamese.png   Your original pixel cat reference
```

## Run it locally

**Option A, instant (offline chatbot):** just double-click `index.html`.
Everything works except live AI; Grandma automatically falls back to her built-in "recipe book" (keyword answers, quizzes, summariser).

**Option B, full (live AI chatbot):** needs Node 18+.

```bash
cp .env.example .env        # then paste your Anthropic API key into .env
node server.js              # open http://localhost:3000
```

Get an API key at https://console.anthropic.com.

## Deploy free on Vercel (about 5 minutes)

1. Create a GitHub account → **New repository** → upload all files in this folder (keep the folder layout).
2. Go to https://vercel.com → sign in with GitHub → **Add New → Project** → import the repo.
3. Framework preset: **Other**. Leave build/output settings empty → **Deploy**.
4. In **Project → Settings → Environment Variables** add `ANTHROPIC_API_KEY` (and optionally `ANTHROPIC_MODEL`), then **Redeploy**.
5. Open your `https://<project>.vercel.app` link. Grandma's header shows **● live · AI** once the key works.

Without the key the site still works: the badge reads **○ offline mode**.

Alternative: Netlify/GitHub Pages host the static pages fine, but the live chatbot needs the `api/chat.js` function (Vercel, or adapt it to Netlify Functions).

## Technical checklist coverage

| ID | Requirement | Where |
|----|-------------|-------|
| FR-01 | Landing page, nav, hero, features, responsive outline | `index.html` |
| FR-02 | Register form, Regex rules, error spans, disabled submit | `register.html`, `validation.js` |
| FR-03 | Sign-up with email/password/ToS | `signup.html`, `validation.js` |
| FR-04 | Sign-in, eye toggle, error banner | `signin.html`, `auth.js` |
| FR-05 | Grid 250px / 1fr / 300px desktop; Flexbox column + drawer mobile | `home.html`, `layout.css`, `pomodoro.js` |
| FR-06 | Chatbot FAB, panel, keyword engine, auto-scroll | `chatbot.js`, `styles.css` |
| FR-07 | Light/Dark with CSS variables + localStorage | `theme.js`, `styles.css` |
| FR-08 | Calculator, `C` and `=`, div-by-zero handling | `calculator.js` |

## Notes

- Accounts are stored in the browser's `localStorage` (passwords are SHA-256 hashed). This is a front-end learning project; a real product would use a server database.
- The cat sprites are drawn in code (`cats.js`), so there are no image files to load.
- Unlock cats by completing focus sessions: Mocha 1, Espresso 3, Latte 6, Cookie 10.
- If you leave the tab for 30+ seconds during a focus session, your cat gets sad and you earn fewer treats.
