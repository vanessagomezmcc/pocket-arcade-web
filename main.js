// main.js (bundled) — no imports, single file, robust boot

// === Embedded games ===
// snake.js — canvas snake with 16x16 grid and a Dash power
export function startSnake(root, onEnd) {
  const W = 320, H = 320, GRID = 16, CELL = W / GRID;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  root.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const ui = document.createElement('div');
  ui.className = 'info';
  ui.textContent = 'Arrow keys to move · Dash to phase through your body (cooldown 10s)';
  root.appendChild(ui);

  const controls = document.createElement('div');
  controls.className = 'controls';
  const dashBtn = document.createElement('button');
  dashBtn.textContent = 'DASH';
  controls.appendChild(dashBtn);
  root.appendChild(controls);

  let dir = {x:1, y:0};
  let snake = [{x:8, y:8}];
  let food = spawnFood();
  let score = 0;
  let alive = true;
  let tickMs = 120;
  let last = performance.now();
  let acc = 0;

  let dashCooldown = 10000, dashDuration = 600;
  let dashUntil = 0, lastDash = -dashCooldown;

  const keyHandler = (e)=>{
    if (e.key === 'ArrowUp') turn(0,-1);
    else if (e.key === 'ArrowDown') turn(0,1);
    else if (e.key === 'ArrowLeft') turn(-1,0);
    else if (e.key === 'ArrowRight') turn(1,0);
    else if (e.key === ' ' || e.key === 'Enter') dash();
  };
  dashBtn.addEventListener('click', dash);
  window.addEventListener('keydown', keyHandler);

  let raf = requestAnimationFrame(loop);

  function loop(ts){
    const dt = ts - last; last = ts; acc += dt;
    while (acc >= tickMs) { step(); acc -= tickMs; }
    draw();
    raf = requestAnimationFrame(loop);
  }

  function step(){
    if (!alive) return;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    // wall
    if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) return end();
    // self
    const phase = performance.now() < dashUntil;
    if (!phase && snake.some((s,i)=> i>0 && s.x===head.x && s.y===head.y)) return end();
    // move
    const ate = (head.x === food.x && head.y === food.y);
    snake.unshift(head);
    if (!ate) snake.pop(); else { score += 10; food = spawnFood(); }
  }

  function draw(){
    ctx.fillStyle = '#111'; ctx.fillRect(0,0,W,H);
    // food
    ctx.fillStyle = '#ff2d55'; ctx.fillRect(food.x*CELL, food.y*CELL, CELL, CELL);
    // snake
    for (let i=snake.length-1;i>=0;i--){
      ctx.fillStyle = (i===0) ? '#aaff00' : '#39ff14';
      ctx.fillRect(snake[i].x*CELL, snake[i].y*CELL, CELL, CELL);
    }
    // cooldown text
    const cd = Math.max(0, Math.ceil((dashCooldown - (performance.now()-lastDash))/1000));
    ui.textContent = `Score ${score} · Dash ${cd}s`;
  }

  function turn(x,y){
    // prevent reversal into neck
    if (snake.length > 1) {
      const neck = snake[1];
      if (snake[0].x + x === neck.x && snake[0].y + y === neck.y) return;
    }
    dir = {x,y};
  }

  function dash(){
    const now = performance.now();
    if (now - lastDash < dashCooldown) return;
    lastDash = now;
    dashUntil = now + dashDuration;
  }

  function spawnFood(){
    while (true){
      const x = (Math.random()*GRID)|0, y = (Math.random()*GRID)|0;
      if (!snake.some(s=>s.x===x && s.y===y)) return {x,y};
    }
  }

  function end(){
    alive = false;
    cleanup();
    const stars = score >= 1500 ? 3 : score >= 800 ? 2 : score >= 300 ? 1 : 0;
    onEnd && onEnd({ score, stars, coins: stars });
  }

  function cleanup(){
    cancelAnimationFrame(raf);
    window.removeEventListener('keydown', keyHandler);
  }

  return cleanup; // dispose function
}


// tictactoe.js — win as many boards as you can under 90 seconds
export function startTicTacToe(root, onEnd){
  const info = document.createElement('div');
  info.className = 'info';
  info.textContent = 'Win 3 boards in 90s. You are X.';
  root.appendChild(info);

  const grid = document.createElement('div');
  grid.className = 'grid';
  root.appendChild(grid);

  const controls = document.createElement('div');
  controls.className = 'info';
  root.appendChild(controls);

  let cells, board, turn, wins = 0, time = 90, timerId;

  setup();

  function setup(){
    grid.innerHTML='';
    cells = Array.from({length:9}, (_,i)=>{
      const c = document.createElement('button');
      c.className = 'cell';
      c.textContent = '';
      c.addEventListener('click', ()=>play(i));
      grid.appendChild(c);
      return c;
    });
    board = Array(9).fill('');
    turn = 'X';
    controls.textContent = `Wins ${wins}/3 · ${time}s`;
    if (!timerId) timerId = setInterval(()=>{
      time--; controls.textContent = `Wins ${wins}/3 · ${time}s`;
      if (time<=0) finish();
    }, 1000);
  }

  function play(i){
    if (board[i] || turn!=='X') return;
    board[i] = 'X'; cells[i].textContent = 'X';
    if (check('X')) { wins++; resetBoard(); return; }
    if (board.every(v=>v)) { resetBoard(); return; }
    turn = 'O'; ai();
  }

  function ai(){
    // try to win
    let mv = bestMove('O'); if (mv===-1) mv = bestMove('X'); if (mv===-1) mv = board.findIndex(v=>!v);
    setTimeout(()=>{
      if (mv>=0){ board[mv]='O'; cells[mv].textContent='O'; }
      if (check('O')) { resetBoard(); return; }
      if (board.every(v=>v)) { resetBoard(); return; }
      turn='X';
    }, 200);
  }

  function lines(){
    return [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  }

  function check(sym){
    return lines().some(([a,b,c])=> board[a]===sym && board[b]===sym && board[c]===sym);
  }

  function bestMove(sym){
    // try each empty cell
    for (let i=0;i<9;i++){
      if (!board[i]){
        board[i]=sym; const win = check(sym); board[i]='';
        if (win) return i;
      }
    }
    return -1;
  }

  function resetBoard(){
    if (wins >= 3) return finish();
    board = Array(9).fill(''); cells.forEach(c=>c.textContent=''); turn='X';
  }

  function finish(){
    clearInterval(timerId);
    const score = wins * 500 + Math.max(0,time) * 5;
    const stars = wins>=3 ? 3 : wins>=2 ? 2 : wins>=1 ? 1 : 0;
    cleanup();
    onEnd && onEnd({ score, stars, coins: stars });
  }

  function cleanup(){
    // nothing persistent to detach here
  }

  return cleanup;
}


// === App logic ===
(function(){

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

  const STATE = loadState(); updateMeta();

  const GAMES = {
    snake: { name: 'Turbo Snake', start: startSnake },
    tictactoe: { name: 'Tic-Tac-Toe Gauntlet', start: startTicTacToe },
  };

  document.querySelectorAll('.card').forEach(btn => {
    btn.addEventListener('click', () => start(btn.dataset.game));
  });

  let currentGameId = null;
  let disposeGame = null;

  // initial route
  hideResults();
  routeTo('home');

  function start(id) {
    if (!GAMES[id]) return console.error('Unknown game', id);
    currentGameId = id;
    hideResults();
    routeTo('play');
    els.gameRoot.innerHTML = '';
    const onEnd = (result) => { awardRun(result); showResults(id, result); };
    try { disposeGame = GAMES[id].start(els.gameRoot, onEnd); }
    catch(e) { console.error(e); alert('Could not start game. Refresh and try again.'); routeTo('home'); }
  }

  els.btnExit.addEventListener('click', () => { safeDispose(); routeTo('home'); });
  els.btnHome.addEventListener('click', () => { safeDispose(); hideResults(); routeTo('home'); });
  els.btnAgain.addEventListener('click', () => { hideResults(); if (currentGameId) start(currentGameId); });

  function awardRun({ score=0, stars=0, coins=0 }) { 
    STATE.xp += Math.floor(score/10);
    STATE.stars += stars; STATE.coins += coins;
    saveState(STATE); updateMeta();
  }
  function updateMeta() { els.xp.textContent = `XP ${STATE.xp}`; els.stars.textContent = `Stars ${STATE.stars}`; els.coins.textContent = `Coins ${STATE.coins}`; }
  function showResults(id, {score, stars}) {
    els.resultTitle.textContent = `${GAMES[id].name} — Results`;
    els.resultScore.textContent = `Score: ${score}`; els.resultStars.textContent = `Stars earned: ${stars}`;
    els.results.classList.remove('hidden'); els.results.style.display='flex';
  }
  function hideResults() { els.results.classList.add('hidden'); els.results.style.display='none'; }
  function routeTo(screen) { els.home.classList.toggle('hidden', screen!=='home'); els.play.classList.toggle('hidden', screen!=='play'); }
  function safeDispose(){ if(disposeGame){ try{disposeGame();}catch{} disposeGame=null; } }

  function loadState(){ try{ const raw=localStorage.getItem('pocket_arcade_state'); if(raw) return JSON.parse(raw); }catch{} return {xp:0,stars:0,coins:0}; }
  function saveState(s){ try{ localStorage.setItem('pocket_arcade_state', JSON.stringify(s)); }catch{} }

})();
