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
