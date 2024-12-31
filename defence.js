// DOM Elements
const gameGrid = document.getElementById("game-grid");
const startButton = document.getElementById("start-game");
const startGameButton = document.getElementById("start-game-btn");
const scoreDisplay = document.getElementById("score");
const selectionContainer = document.getElementById("selection-container");
const gameContainer = document.getElementById("game-container");
const defenderOptions = document.querySelectorAll(".defender-option");

// Game State
let score = 0;
let isGameRunning = false;
let selectedDefender = null;
let spawnInterval = 2000;
let spawnIntervalID;
let enemySpeed = 5; 

// Defender Data
const defenders = {
    "robo-raccoon": {
        image: "robo-defender.png",
        projectileImage: "bullet.png",
    },
    "mage-raccoon": {
        image: "mage-defender.png",
        projectileImage: "fireball.png",
    },
    "ice-man-raccoon": {
        image: "ice-defender.png",
        projectileImage: "snowball.png",
    },
};

// Defender Selection Logic
defenderOptions.forEach((option) => {
    option.addEventListener("click", () => {
        // Highlight selected defender
        defenderOptions.forEach((opt) => opt.classList.remove("selected"));
        option.classList.add("selected");

        selectedDefender = option.dataset.type;
        startGameButton.disabled = false; 
    });
});

startGameButton.addEventListener("click", () => {
    if (!selectedDefender) return;

    selectionContainer.style.display = "none";
    gameContainer.style.display = "block";

    spawnDefender(100, 300, defenders[selectedDefender].image);
    isGameRunning = true;
    startGame();
});

// Start Game Logic
function startGame() {
    spawnEnemies();
}

function spawnEnemies() {
    spawnIntervalID = setInterval(spawnEnemy, spawnInterval);
}

// Spawn Defender
function spawnDefender(x, y, image) {
    const defender = document.createElement("div");
    defender.className = "defender";
    defender.style.left = `${x}px`;
    defender.style.top = `${y}px`;
    defender.style.backgroundImage = `url(${image})`;

    defender.addEventListener("mousedown", (e) => startDrag(e));
    document.addEventListener("keydown", (e) => {
        if (e.code === "Space") fireProjectile(defender);
    });

    gameGrid.appendChild(defender);
}

// Start dragging the defender
let currentDefender = null;
let isDragging = false;
let offsetX, offsetY;

function startDrag(e) {
    isDragging = true;
    currentDefender = e.target;
    offsetX = e.clientX - parseInt(currentDefender.style.left);
    offsetY = e.clientY - parseInt(currentDefender.style.top);
    document.addEventListener("mousemove", dragDefender);
    document.addEventListener("mouseup", stopDrag);
}

function dragDefender(e) {
    if (isDragging && currentDefender) {
        const newX = e.clientX - offsetX;
        const newY = e.clientY - offsetY;
        currentDefender.style.left = `${Math.max(0, Math.min(newX, 760))}px`;
        currentDefender.style.top = `${Math.max(0, Math.min(newY, 360))}px`;
    }
}

function stopDrag() {
    isDragging = false;
    currentDefender = null;
    document.removeEventListener("mousemove", dragDefender);
    document.removeEventListener("mouseup", stopDrag);
}

// Spawn Enemy
function spawnEnemy() {
    const enemy = document.createElement("div");
    enemy.className = "enemy";
    enemy.style.left = "800px";
    enemy.style.top = `${Math.random() * 360}px`;

    enemy.style.backgroundImage = "url('Reaper-raccoon.png')"; 
    enemy.style.backgroundSize = "cover";
    enemy.style.backgroundRepeat = "no-repeat";

    gameGrid.appendChild(enemy);
    moveEnemy(enemy);
}

// Move Enemy
function moveEnemy(enemy) {
    const interval = setInterval(() => {
        const currentLeft = parseInt(enemy.style.left);
        if (currentLeft <= 0) {
            clearInterval(interval);
            enemy.remove();
            endGame();
        } else if (!document.body.contains(enemy)) {
            clearInterval(interval);
        } else {
            enemy.style.left = `${currentLeft - enemySpeed}px`;
        }
    }, 50);
}

// Fire Projectile
function fireProjectile(defender) {
    const projectile = document.createElement("div");
    projectile.className = "projectile";
    projectile.style.left = defender.style.left;
    projectile.style.top = defender.style.top;
    projectile.style.backgroundImage = `url(${defenders[selectedDefender].projectileImage})`;

    gameGrid.appendChild(projectile);
    moveProjectile(projectile);
}

// Move Projectile
function moveProjectile(projectile) {
    const interval = setInterval(() => {
        projectile.style.left = `${parseInt(projectile.style.left) + 10}px`;

        // Check for collision
        const enemies = document.querySelectorAll(".enemy");
        enemies.forEach((enemy) => {
            if (checkCollision(projectile, enemy)) {
                enemy.remove();
                projectile.remove();
                clearInterval(interval);
                updateScore();
            }
        });

        if (parseInt(projectile.style.left) > 800) {
            projectile.remove();
            clearInterval(interval);
        }
    }, 50);
}

// Collision Detection
function checkCollision(obj1, obj2) {
    const rect1 = obj1.getBoundingClientRect();
    const rect2 = obj2.getBoundingClientRect();

    return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
    );
}

// Update Score
function updateScore() {
    score += 10;
    scoreDisplay.textContent = `Score: ${score}`;

    if (score % 100 === 0) {
        enemySpeed += 5;
        spawnInterval = Math.max(500, spawnInterval - 500); 
        clearInterval(spawnIntervalID);
        spawnEnemies();
    }
}

// End Game
function endGame() {
    alert("Game Over! Your score: " + score);
    window.location.reload();
}
