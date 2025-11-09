// main.js — routes, meta progression, simple results UI

import { startSnake } from './games/snake.js';
import { startTicTacToe } from './games/tictactoe.js';

const els = {
  home: document.getElementById('home'),
  play: document.getElementById('play'),
  results: document.getElementById('results'),
  gameRoot: document.getElementById('game-root'),
  xp: document.getElementById('xp'),
  stars: document.getElementById('stars'),
  coins: document.getElementById('coins'),
  btnExit: document.getElementById('btn-exit'),
  btnAgain: document.getElementById('btn-again'),
  btnHome: document.getElementById('btn-home'),
  resultTitle: document.getElementById('result-title'),
  resultScore: document.getElementById('result-score'),
  resultStars: document.getElementById('result-stars'),
};

// global progression stored in localStorage
const STATE = loadState();
updateMeta();

const GAMES = {
  snake: { name: 'Turbo Snake', start: startSnake },
  tictactoe: { name: 'Tic‑Tac‑Toe Gauntlet', start: startTicTacToe },
};

// wire home cards
document.querySelectorAll('.card').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.game;
    start(id);
  });
});

let currentGameId = null;
let disposeGame = null;

function start(id) {
  currentGameId = id;
  routeTo('play');
  els.gameRoot.innerHTML = ''; // clear
  const onEnd = (result) => {
    // result: { score, stars, coins }
    awardRun(result);
    showResults(id, result);
  };
  disposeGame = GAMES[id].start(els.gameRoot, onEnd);
}

function awardRun({ score = 0, stars = 0, coins = 0 }) {
  STATE.xp += Math.floor(score / 10);
  STATE.stars += stars;
  STATE.coins += coins;
  saveState();
  updateMeta();
}

function updateMeta() {
  els.xp.textContent = `XP ${STATE.xp}`;
  els.stars.textContent = `Stars ${STATE.stars}`;
  els.coins.textContent = `Coins ${STATE.coins}`;
}

function showResults(id, { score, stars }) {
  els.resultTitle.textContent = `${GAMES[id].name} — Results`;
  els.resultScore.textContent = `Score: ${score}`;
  els.resultStars.textContent = `Stars earned: ${stars}`;
  routeOverlay('results', true);
}

function routeTo(screen) {
  els.home.classList.toggle('hidden', screen !== 'home');
  els.play.classList.toggle('hidden', screen !== 'play');
}

function routeOverlay(overlay, show) {
  els.results.classList.toggle('hidden', !(overlay === 'results' && show));
}

els.btnExit.addEventListener('click', () => {
  if (disposeGame) try { disposeGame(); } catch {}
  routeTo('home');
});

els.btnHome.addEventListener('click', () => {
  if (disposeGame) try { disposeGame(); } catch {}
  routeOverlay('results', false);
  routeTo('home');
});

els.btnAgain.addEventListener('click', () => {
  routeOverlay('results', false);
  if (currentGameId) start(currentGameId);
});

function loadState() {
  try {
    const raw = localStorage.getItem('pocket_arcade_state');
    if (raw) return JSON.parse(raw);
  } catch {}
  return { xp: 0, stars: 0, coins: 0 };
}
function saveState() {
  localStorage.setItem('pocket_arcade_state', JSON.stringify(STATE));
}

// expose for debugging
window._PA = { start };
