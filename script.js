const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;

let score = 0;
let gameOver = false;
let isPaused = false;
let scores = [];

const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");
const leftButton = document.getElementById("leftButton");
const rightButton = document.getElementById("rightButton");

startButton.addEventListener("click", startGame);
pauseButton.addEventListener("click", togglePause);

const ball = {
  x: canvas.width / 2,
  y: canvas.height - 100,
  radius: 15,
  speed: 4,
  dx: 4,
  dy: -4,
  rotation: 0,
  rotationSpeed: 0,
  image: new Image()
};
ball.image.src = 'face1.jpg';

const block = {
  rowCount: 10,
  columnCount: 20,
  width: canvas.width / 20,
  height: 30,
  offsetTop: 40,
  startX: 0,
  images: [],
  points: [1, 2, 3, 4, 5]
};

const paddle = {
  width: 100,
  height: 10,
  x: canvas.width / 2 - 50,
  y: canvas.height - 30,
  speed: 10,
  dx: 0
};

// ブロックの画像を読み込み
for (let i = 2; i <= 6; i++) {
  const img = new Image();
  img.src = `face${i}.jpg`;
  block.images.push(img);
}

let blocks;

// スマホ用の左右ボタンのタッチイベント設定
leftButton.addEventListener("touchstart", (e) => {
  e.preventDefault();
  paddle.dx = -paddle.speed;
});
leftButton.addEventListener("touchend", () => paddle.dx = 0);

rightButton.addEventListener("touchstart", (e) => {
  e.preventDefault();
  paddle.dx = paddle.speed;
});
rightButton.addEventListener("touchend", () => paddle.dx = 0);

function drawScore() {
  ctx.font = "24px Arial";
  ctx.fillStyle = "#0095dd";
  ctx.textAlign = "center";
  ctx.fillText(`Score: ${score}`, canvas.width / 2, 30);
}

function drawBlockInfo() {
  const scorePanel = document.getElementById('scorePanel');
  scorePanel.innerHTML = ''; // リセット
  
  block.images.forEach((img, index) => {
    const points = block.points[index];
    const scoreItem = document.createElement('div');
    scoreItem.innerHTML = `<img src="${img.src}" width="30" height="30"><br>${points}点`;
    scorePanel.appendChild(scoreItem);
  });
}

function drawBlocks() {
  for (let i = 0; i < block.rowCount; i++) {
    for (let j = 0; j < block.columnCount; j++) {
      const b = blocks[i][j];
      if (b.status === 1) {
        const blockX = block.startX + j * block.width;
        const blockY = block.offsetTop + i * block.height;
        b.x = blockX;
        b.y = blockY;
        ctx.drawImage(b.image, blockX, blockY, block.width, block.height);
      }
    }
  }
}

function drawBall() {
  ctx.save();
  ctx.translate(ball.x, ball.y);
  ctx.rotate(ball.rotation * Math.PI / 180);
  ctx.beginPath();
  ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(ball.image, -ball.radius, -ball.radius, ball.radius * 2, ball.radius * 2);
  ctx.restore();
}

function drawPaddle() {
  ctx.fillStyle = "#0095dd";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function collisionDetection() {
  for (let i = 0; i < block.rowCount; i++) {
    for (let j = 0; j < block.columnCount; j++) {
      const b = blocks[i][j];
      if (b.status === 1) {
        if (
          ball.x + ball.radius > b.x &&
          ball.x - ball.radius < b.x + block.width &&
          ball.y + ball.radius > b.y &&
          ball.y - ball.radius < b.y + block.height
        ) {
          ball.dy *= -1;
          b.status = 0;
          score += b.points;
        }
      }
    }
  }

  if (
    ball.x > paddle.x &&
    ball.x < paddle.x + paddle.width &&
    ball.y + ball.radius > paddle.y
  ) {
    ball.dy *= -1;

    const hitPos = (ball.x - paddle.x) / paddle.width;
    const maxSpin = 10;
    ball.rotationSpeed = maxSpin * (hitPos - 0.5);
  } else if (ball.y + ball.radius > canvas.height) {
    gameOver = true;
  }

  if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
    ball.dx *= -1;
  }
  if (ball.y - ball.radius < 0) {
    ball.dy *= -1;
  }
}

function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;
  ball.rotation += ball.rotationSpeed;
}

function movePaddle() {
  paddle.x += paddle.dx;
  if (paddle.x < 0) paddle.x = 0;
  if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;
}

function draw() {
  if (gameOver) {
    showGameOver();
    return;
  }

  if (!isPaused) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBall();
    drawBlocks();
    drawPaddle();
    drawScore();
    collisionDetection();
    moveBall();
    movePaddle();
  }

  requestAnimationFrame(draw);
}

function startGame() {
  drawBlockInfo();
  
  gameOver = false;
  score = 0;
  isPaused = false;
  
  ball.x = canvas.width / 2;
  ball.y = canvas.height - 100;
  ball.dx = 4;
  ball.dy = -4;
  ball.rotation = 0;
  ball.rotationSpeed = 0;
  paddle.x = canvas.width / 2 - paddle.width / 2;

  blocks = [];
  for (let i = 0; i < block.rowCount; i++) {
    blocks[i] = [];
    for (let j = 0; j < block.columnCount; j++) {
      const imageIndex = Math.floor(Math.random() * block.images.length);
      blocks[i][j] = {
        x: 0,
        y: 0,
        status: 1,
        image: block.images[imageIndex],
        points: block.points[imageIndex]
      };
    }
  }

  draw();
}

function togglePause() {
  isPaused = !isPaused;
  pauseButton.textContent = isPaused ? "再開" : "ポーズ";
}

// タッチ操作対応（スマホでのパドル移動）
canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  const touchX = e.touches[0].clientX - canvas.offsetLeft;
  paddle.x = touchX - paddle.width / 2;
});

// PC用のキーボード操作対応
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") {
    paddle.dx = paddle.speed;
  } else if (e.key === "ArrowLeft") {
    paddle.dx = -paddle.speed;
  }
});

document.addEventListener("keyup", () => {
  paddle.dx = 0;
});
