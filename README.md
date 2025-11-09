# Pocket Arcade 

A zero-build, zero-terminal mini-arcade for the web. Pure HTML/CSS/JS. Host it on **GitHub Pages** or any static host. Two games included:

- **Turbo Snake** (with a one-press Dash)
- **Tic‑Tac‑Toe Gauntlet** (win 3 boards under 90s)

Shared progression (XP/Stars/Coins) is saved in **localStorage**.

## Use this repository
1. Click the green **Use this template** (or **Upload files**) on GitHub and create your repo.
2. Put these files at the repo root.
3. Enable GitHub Pages: Settings → Pages → Deploy from **/ (root)** or **main branch** → save.
4. Your site goes live at `https://<your-username>.github.io/<repo-name>/`.

## Run locally (optional)
Just double-click `index.html` in a browser.

## Add more games
- Copy `js/games/snake.js` or `tictactoe.js` as a starting point.
- Export a `startGame(root, onEnd)` function like the others.
- Register it in `js/main.js` inside the `GAMES` object with a unique key and a display name.
