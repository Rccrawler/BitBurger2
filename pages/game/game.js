const game = document.getElementById('game');
const player = document.getElementById('player');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');

let score = 0;
let lives = 3;
let playerX = window.innerWidth / 2;

const foods = ['comida1.png', 'comida2.png', 'comida3.png'];
const badItems = ['objeto1.png', 'objeto2.png'];

let fallSpeed = 3;           // Velocidad de caída inicial
let spawnInterval = 1000;    // Intervalo entre objetos (milisegundos)
let lastScoreLevel = 0;

function movePlayer(x) {
  playerX = Math.min(window.innerWidth - 40, Math.max(0, x - 40));
  player.style.left = `${playerX}px`;
}

document.addEventListener('mousemove', e => movePlayer(e.clientX));
document.addEventListener('touchmove', e => {
  e.preventDefault(); // Previene scroll al deslizar
  const touch = e.touches[0];
  movePlayer(touch.clientX);
}, { passive: false });

function spawnItem() {
  const isFood = Math.random() > 0.3;
  const item = document.createElement('img');
  item.classList.add('falling');
  item.src = `assets/${isFood ? randomFrom(foods) : randomFrom(badItems)}`;
  item.dataset.type = isFood ? 'food' : 'bad';
  item.style.left = `${Math.random() * (window.innerWidth - 40)}px`;
  item.style.top = '-50px';
  game.appendChild(item);

  let y = -50;
  const fallInterval = setInterval(() => {
    y += fallSpeed;
    item.style.top = `${y}px`;

    if (y > window.innerHeight) {
      clearInterval(fallInterval);
      item.remove();
    }

    const itemX = item.offsetLeft;
    const itemWidth = item.offsetWidth;
    const playerWidth = player.offsetWidth;

    if (y >= window.innerHeight - 180 &&
        itemX < playerX + playerWidth &&
        itemX + itemWidth > playerX) {

      if (item.dataset.type === 'food') {
        score++;
        scoreDisplay.textContent = `Puntos: ${score}`;
        updateDifficulty(score);
      } else {
        lives--;
        livesDisplay.textContent = `Vidas: ${lives}`;
        if (lives <= 0) {
          alert("¡Game Over!");
          location.reload();
        }
      }
      clearInterval(fallInterval);
      item.remove();
    }
  }, 30);
}

function updateDifficulty(currentScore) {
  if (currentScore >= lastScoreLevel + 10) {
    lastScoreLevel = currentScore;
    if (fallSpeed < 10) fallSpeed += 0.5;               // aumenta velocidad
    if (spawnInterval > 400) spawnInterval -= 50;       // reduce intervalo
  }
}

function randomFrom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function startSpawning() {
  spawnItem();
  setTimeout(startSpawning, spawnInterval);
}

// Iniciar el juego
startSpawning();
