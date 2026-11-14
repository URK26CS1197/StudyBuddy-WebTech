# ☕ Study Buddy Café: A Pixel Coffee-Shop Pomodoro Study Companion

Study Buddy Café is a responsive web portal that helps students stay focused while studying. It combines a Pomodoro timer, collectible pixel-cat study buddies, a task list, study statistics, a calculator and an AI doubt-solving chatbot (Grandma Biscuit) in one cozy, pixel coffee-themed website with light and dark modes.

Built as the **IA-3 Micro Project** for **25CS208: Web Technology** (2026-27, Odd Semester), School of Computer Science & Technology, Karunya Institute of Technology and Sciences (KITS). The idea is inspired by the *Study Bunny* app.

🔗 **Vercel link:** [https://studybuddy-rosy-two.vercel.app](https://studybuddy-gold-one.vercel.app/)
📦 **Github Repository:** https://urk26cs1197.github.io/StudyBuddy-WebTech/

---

## 📌 Problem Statement

Students often lose focus during long study sessions, and plain timer apps are boring enough that people stop using them. Study Buddy Café makes focused studying more enjoyable: a cat companion sits with you, rewards you for staying on task and unlocks new friends as you finish sessions. A friendly chatbot is also on hand to clear doubts, make quizzes and summarise notes. It needs no installation and works on desktop and mobile.

## ✨ Features

| Module | What it does |
|---|---|
| ⏱️ **Pomodoro Timer** | Focus (25 min), Short break (5 min) and Long break (15 min) modes with Start/Pause/Reset/Skip. Durations are customisable, a four-dot tracker shows your rounds, and the countdown also appears in the browser tab title. A pixel coffee mug fills and steams as time passes. |
| 🐱 **Cat Study Buddies** | Five pixel cats (Miso, Mocha, Espresso, Latte, Cookie) drawn on a canvas. They blink, nap during breaks, celebrate when you finish a session and look sad if you leave the tab for 30+ seconds. Click a cat to pet it. |
| 🔓 **Unlock & Rewards** | Earn fish treats for every focus session and unlock new cats (Mocha: 1 session, Espresso: 3, Latte: 6, Cookie: 10). |
| 🧶 **Chatbot (Grandma Biscuit)** | A floating chat panel that explains topics, runs interactive quizzes and summarises pasted notes. It uses live AI when a backend is available and falls back to a built-in keyword engine when offline. |
| ✅ **Task List** | Add, complete and delete study tasks, with a live "tasks left" counter. |
| 📊 **Study Statistics** | Sessions and minutes today, lifetime totals, fish treats and a 7-day focus bar chart. |
| 🧮 **Calculator** | Digits, `+ - * /`, brackets, `C` and `=`, with error handling for divide-by-zero and invalid input. |
| 🌧️ **Ambient Sound** | Optional rain sound and a completion chime, both generated in code with the Web Audio API. |
| 🌗 **Light / Dark Theme** | One-click toggle in the header. Your choice is remembered across sessions. |
| 🔐 **Authorisation Pages** | Registration, sign-up and sign-in pages with real-time form validation, plus a guest mode. |

Accounts, tasks, statistics, settings, selected cat and theme are stored in the browser's `localStorage`, so they survive a page refresh.

## 🗂️ Project Structure

```
study-buddy/
├── index.html          # Landing page (FR-01)
├── register.html       # Registration + detailed validation (FR-02)
├── signup.html         # Simple sign-up with Terms checkbox (FR-03)
├── signin.html         # Sign-in with show/hide password (FR-04)
├── home.html           # Dashboard (FR-05)
├── css/
│   ├── styles.css      # Design tokens, components, theme colours
│   └── layout.css      # CSS Grid (desktop) / Flexbox (mobile) layouts
├── js/
│   ├── theme.js        # Light/dark toggle + localStorage (FR-07)
│   ├── validation.js   # Regex validation rules (FR-02, 03)
│   ├── auth.js         # Accounts, sign-in logic, form wiring (FR-02, 03, 04)
│   ├── pomodoro.js     # Timer, cats, tasks, stats, sounds, drawer menu
│   ├── calculator.js   # Calculator module (FR-08)
│   ├── chatbot.js      # Floating chatbot (FR-06)
│   └── cats.js         # Pixel-cat sprite engine (canvas)
├── api/chat.js         # Serverless function for the live AI chatbot (Vercel)
├── server.js           # Optional local dev server
├── assets/             # Original pixel cat reference image
└── vercel.json, package.json, .env.example, .gitignore
```

## 🧩 Functional Requirements Coverage

| ID | Requirement | Where implemented |
|---|---|---|
| FR-01 | Landing page with header, theme toggle, hero banner, feature cards, page outline | `index.html` |
| FR-02 | Registration form with 7 fields, regex validation on `blur` and `submit`, error badges, disabled submit | `register.html`, `validation.js`, `auth.js` |
| FR-03 | Sign-up form with email, password, Terms consent | `signup.html`, `validation.js` |
| FR-04 | Sign-in with password eye toggle and error banner | `signin.html`, `auth.js` |
| FR-05 | Dashboard: CSS Grid on desktop, Flexbox plus hamburger drawer on mobile | `home.html`, `layout.css`, `pomodoro.js` |
| FR-06 | Floating chatbot with `.user-msg` / `.bot-msg`, keyword replies, auto-scroll | `chatbot.js` |
| FR-07 | Theme switcher with CSS custom properties and `localStorage` | `theme.js`, `styles.css` |
| FR-08 | JavaScript calculator with error handling | `calculator.js` |

## ✅ Form Validation Rules

| Field | Rule |
|---|---|
| Full Name | Letters and spaces only, 2-50 chars: `/^[a-zA-Z\s]{2,50}$/` |
| Register ID | 6-12 alphanumeric characters: `/^[A-Z0-9]{6,12}$/i` |
| Email | `/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/` |
| Mobile | 10 digits starting with 6-9: `/^[6-9]\d{9}$/` |
| Division | A selection is required |
| Password | Min 8 chars with uppercase, lowercase, number and a symbol from `@$!%*?&` |
| Confirm Password | Must match the password |

Fields are checked when you leave them (`blur`) and on `submit`. Invalid fields get a red border (`input.invalid`) and an inline `<span class="error-msg">`. The submit button stays **disabled** until every field is valid.

## 💬 Chatbot (Grandma Biscuit)

| Mode | When it is used | How it works |
|---|---|---|
| **Live AI** | When the site is hosted with the serverless function and an API key | Messages go to `/api/chat`, which calls the Claude API. The key stays on the server. |
| **Offline** | GitHub Pages, no API key, no internet, or opening `index.html` directly | A keyword-matching engine in `chatbot.js` answers topics, runs quizzes, summarises notes, gives study tips and solves quick sums. |

Try asking: `Explain CSS grid`, `Quiz me on web`, `Summarize: <your notes>`, `12*7` or `Give me a study tip`.

## 📱 Responsive Design

- **Desktop (≥ 768px):** the dashboard uses CSS Grid with `grid-template-columns: 250px 1fr 300px`: a left sidebar (cat buddies and timer settings), the centre study area (timer and cat), and a right panel (tasks, stats and calculator).
- **Mobile (< 768px):** a single-column **Flexbox** stack, with the sidebar moving into a **hamburger (☰) drawer**.

## 🛠️ Tech Stack

- **HTML5**: semantic structure
- **CSS3**: custom properties (design tokens), Grid, Flexbox, media queries, keyframe animations
- **JavaScript (ES6+)**: DOM manipulation, events, regex, `localStorage`, Canvas and Web Audio APIs
- **Serverless function (Node 18+)** and the **Claude API**: live chatbot
- **Git & GitHub**: version control and GitHub Pages hosting
- **Vercel**: optional hosting with HTTPS and the live chatbot

No frameworks, build tools or dependencies are required.

## 🚀 Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/URK26CS1197/StudyBuddy-WebTech.git
   cd StudyBuddy-WebTech
   ```
2. Open `index.html` in your browser, or use the VS Code **Live Server** extension. The chatbot runs in offline mode.
3. *(Optional, for live AI)* Copy `.env.example` to `.env`, add your `ANTHROPIC_API_KEY`, run `node server.js` and open http://localhost:3000.

## ☁️ Deployment

**GitHub Pages (static site):**
1. Push the project to GitHub with the `css/` and `js/` folders intact.
2. Go to **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, and save.

**Vercel (with live chatbot):**
1. In Vercel, choose **Add New → Project** and import the repository.
2. Set the framework preset to **Other**, leave the build settings empty, and click **Deploy**.
3. Add `ANTHROPIC_API_KEY` under **Settings → Environment Variables** and redeploy.

Every push to `main` redeploys automatically.

## ⚠️ Notes and Limitations

- Authentication is **client-side only**. Accounts are stored in the browser's `localStorage` with hashed passwords, so there is no real user database and accounts do not sync across devices.
- Data is stored per browser, so clearing site data resets the dashboard.
- GitHub Pages cannot run the serverless function, so the chatbot is in offline mode there. Deploy on Vercel with an API key for live AI.
- The pixel fonts load from Google Fonts, so an internet connection is needed to see them.

## 🔮 Future Scope (v2.0)

- Real authentication with a backend and database
- Sync across devices and shared study rooms
- More cats, accessories and a fish-treat shop
- Uploading notes for the chatbot to summarise and turn into flashcards
- Spaced-repetition reminders and weekly progress reports
- Installable PWA with notifications

## 👥 Team

| Name | Register No. |
|---|---|
| Reyna M | URK26CS1197 |

**Supervisor:** Dr. Titus I

## 📄 License

Created for academic purposes at KITS. Add a license here if you plan to share it publicly.
