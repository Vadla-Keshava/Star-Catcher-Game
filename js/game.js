const gameArea = document.getElementById('gameArea');
const player = document.getElementById('player');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayText = document.getElementById('overlayText');
const startBtn = document.getElementById('startBtn');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const livesEl = document.getElementById('lives');

let score = 0;
let lives = 3;
let playerX = 50;
let running = false;
let items = [];
let spawnTimer = 0;
let lastTime = 0;
let animationId = null;
let best = Number(localStorage.getItem('starCatcherBest') || 0);

bestEl.textContent = best;

function updatePlayer() {
  player.style.left = `calc(${playerX}% - 21px)`;
}

function move(direction) {
  if (!running) return;
  playerX = Math.max(5, Math.min(95, playerX + direction * 5));
  updatePlayer();
}

document.addEventListener('keydown', (event) => {
  if (['ArrowLeft', 'ArrowRight'].includes(event.key)) event.preventDefault();
  if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') move(-1);
  if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') move(1);
  if (event.key === ' ' && !running) startGame();
});

document.getElementById('leftBtn').addEventListener('click', () => move(-1));
document.getElementById('rightBtn').addEventListener('click', () => move(1));

function createItem() {
  const isBomb = Math.random() < 0.22;
  const element = document.createElement('div');
  element.className = 'falling';
  element.textContent = isBomb ? '💣' : '⭐';
  const x = 5 + Math.random() * 90;
  element.style.left = `${x}%`;
  gameArea.appendChild(element);
  items.push({ element, x, y: -35, speed: 105 + Math.random() * 75 + score * 0.35, isBomb });
}

function endGame() {
  running = false;
  cancelAnimationFrame(animationId);
  if (score > best) {
    best = score;
    localStorage.setItem('starCatcherBest', best);
    bestEl.textContent = best;
  }
  overlayTitle.textContent = 'Game over!';
  overlayText.textContent = `You scored ${score} points. Want another round?`;
  startBtn.innerHTML = 'Play Again <span>↻</span>';
  overlay.classList.remove('hidden');
}

function startGame() {
  if (running) return;
  items.forEach(item => item.element.remove());
  items = [];
  score = 0;
  lives = 3;
  playerX = 50;
  spawnTimer = 0;
  scoreEl.textContent = score;
  livesEl.textContent = '❤️❤️❤️';
  updatePlayer();
  overlay.classList.add('hidden');
  running = true;
  lastTime = performance.now();
  animationId = requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
  if (!running) return;
  const delta = Math.min((timestamp - lastTime) / 1000, 0.04);
  lastTime = timestamp;
  spawnTimer += delta;

  if (spawnTimer > Math.max(0.38, 0.9 - score * 0.004)) {
    createItem();
    spawnTimer = 0;
  }

  const areaHeight = gameArea.clientHeight;
  const playerRect = player.getBoundingClientRect();
  const areaRect = gameArea.getBoundingClientRect();
  const playerCenter = playerRect.left + playerRect.width / 2;

  items = items.filter(item => {
    item.y += item.speed * delta;
    item.element.style.top = `${item.y}px`;
    const itemCenter = areaRect.left + (item.x / 100) * areaRect.width;
    const caught = item.y + 25 >= areaHeight - 60 &&
      item.y + 25 <= areaHeight - 5 &&
      Math.abs(itemCenter - playerCenter) < 34;

    if (caught) {
      if (item.isBomb) {
        lives--;
        livesEl.textContent = '❤️'.repeat(lives) + '🖤'.repeat(3 - lives);
        if (lives <= 0) {
          item.element.remove();
          endGame();
          return false;
        }
      } else {
        score += 10;
        scoreEl.textContent = score;
      }
      item.element.remove();
      return false;
    }

    if (item.y > areaHeight) {
      item.element.remove();
      return false;
    }
    return true;
  });

  animationId = requestAnimationFrame(gameLoop);
}

startBtn.addEventListener('click', startGame);
updatePlayer();
