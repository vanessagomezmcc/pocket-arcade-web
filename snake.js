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
