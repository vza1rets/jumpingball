document.addEventListener('DOMContentLoaded', () => {
    const ball = document.getElementById('ball');
    const gameContainer = document.getElementById('game-container');
    const scoreElement = document.getElementById('score');
    const gameOverElement = document.getElementById('game-over');
    const finalScoreElement = document.getElementById('final-score');
    const startScreen = document.getElementById('start-screen');
    const restartButton = document.getElementById('restart-button');

    // Настройки игры
    const settings = {
        jumpPower: 25,
        gravity: 0.8,
        ballStartBottom: 100,
        obstacleSpeed: 8,
        minObstacleHeight: 50,
        maxObstacleHeight: 100,
        spawnInterval: 2000
    };

    let isJumping = false;
    let isGameOver = false;
    let isGameStarted = false;
    let score = 0;
    let currentSpeed = settings.obstacleSpeed;
    let obstacles = [];
    let gameLoopId;
    let spawnIntervalId;

    // Инициализация мяча
    ball.style.bottom = `${settings.ballStartBottom}px`;

    function startGame() {
        // Сброс состояния игры
        isGameOver = false;
        isGameStarted = true;
        score = 0;
        currentSpeed = settings.obstacleSpeed;
        scoreElement.textContent = `Очки: ${score}`;
        
        // Очистка экрана
        startScreen.style.display = 'none';
        gameOverElement.style.display = 'none';
        document.querySelectorAll('.obstacle').forEach(obs => obs.remove());
        obstacles = [];
        
        // Сброс позиции мяча
        ball.style.bottom = `${settings.ballStartBottom}px`;
        ball.classList.remove('jumping');
        
        // Запуск игрового цикла
        gameLoopId = requestAnimationFrame(gameLoop);
        spawnIntervalId = setInterval(createObstacle, settings.spawnInterval);
    }

    function gameLoop() {
        if (isGameOver) return;
        
        updateObstacles();
        gameLoopId = requestAnimationFrame(gameLoop);
    }

    function jump() {
        if (isJumping || !isGameStarted) return;
        
        isJumping = true;
        ball.classList.add('jumping');
        
        let velocity = settings.jumpPower;
        let position = settings.ballStartBottom;
        
        const jumpInterval = setInterval(() => {
            // Применяем гравитацию
            velocity -= settings.gravity;
            position += velocity;
            
            // Останавливаем прыжок при достижении земли
            if (position <= settings.ballStartBottom) {
                position = settings.ballStartBottom;
                clearInterval(jumpInterval);
                isJumping = false;
                ball.classList.remove('jumping');
            }
            
            ball.style.bottom = `${position}px`;
        }, 16);
    }

    function createObstacle() {
        if (isGameOver) return;
        
        const obstacle = document.createElement('div');
        obstacle.className = 'obstacle';
        
        // Случайная высота препятствия в заданных пределах
        const height = Math.random() * 
                      (settings.maxObstacleHeight - settings.minObstacleHeight) + 
                      settings.minObstacleHeight;
        
        obstacle.style.height = `${height}px`;
        gameContainer.appendChild(obstacle);
        
        obstacles.push({
            element: obstacle,
            x: 800,
            height: height,
            passed: false
        });
    }

    function updateObstacles() {
        obstacles.forEach((obstacle, index) => {
            // Движение препятствия
            obstacle.x -= currentSpeed;
            obstacle.element.style.right = `${800 - obstacle.x}px`;
            
            // Удаление вышедших за границы
            if (obstacle.x < -40) {
                gameContainer.removeChild(obstacle.element);
                obstacles.splice(index, 1);
                score++;
                scoreElement.textContent = `Очки: ${score}`;
                
                // Увеличение скорости каждые 5 очков
                if (score % 5 === 0) {
                    currentSpeed += 0.5;
                }
                return;
            }
            
            // Проверка столкновения
            if (checkCollision(obstacle)) {
                gameOver();
            }
        });
    }

    function checkCollision(obstacle) {
        const ballRect = ball.getBoundingClientRect();
        const obstacleRect = obstacle.element.getBoundingClientRect();
        
        return !(
            ballRect.right < obstacleRect.left || 
            ballRect.left > obstacleRect.right || 
            ballRect.bottom < obstacleRect.top + 10 || // Небольшой зазор сверху
            ballRect.top > obstacleRect.bottom
        );
    }

    function gameOver() {
        isGameOver = true;
        isGameStarted = false;
        cancelAnimationFrame(gameLoopId);
        clearInterval(spawnIntervalId);
        finalScoreElement.textContent = score;
        gameOverElement.style.display = 'block';
    }

    // Управление
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            if (!isGameStarted) {
                startGame();
            } else {
                jump();
            }
        }
    });

    startScreen.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
});