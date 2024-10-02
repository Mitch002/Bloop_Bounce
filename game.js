// Initialize the game
const config = {
    type: Phaser.AUTO,
    width: 500,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 }, // Gravity for Bloop
            debug: false  // Turn off debug mode
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let bloop;
let cursors;
let obstacles;
let score = 0;
let scoreText;
let gameOver = false;
let restartText;
let gameOverText, finalScoreText;
let gameOverBox;
let obstacleEvent;

function preload() {
    // Load images with correct paths
    this.load.image('background', 'assets/bloop_background.png');
    this.load.image('bloop', 'assets/bloop_rocket.png');
    this.load.image('topObstacle', 'assets/redcandle.png');
    this.load.image('bottomObstacle', 'assets/greencandle.png');
}

function create() {
    // Start the game setup
    setupGame(this);
}

function setupGame(scene) {
    // Add background
    scene.add.image(250, 300, 'background');  // Background image

    // Create Bloop (Adjusted scale and size for collision)
    bloop = scene.physics.add.sprite(100, 300, 'bloop').setScale(0.1);
    bloop.setCollideWorldBounds(true);  // Bloop won't go off-screen
    bloop.body.setSize(bloop.width * 0.6, bloop.height * 0.8);  // Adjust collision box size for Bloop
    bloop.body.setOffset(10, 10);  // Fine-tune the offset

    // Create obstacles group
    obstacles = scene.physics.add.group();

    // Add keyboard input for jump
    cursors = scene.input.keyboard.createCursorKeys();

    // Display score
    scoreText = scene.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });

    // Add obstacle generation loop
    obstacleEvent = scene.time.addEvent({
        delay: 1500,  // Delay for obstacle creation
        callback: addObstacles,
        callbackScope: scene,
        loop: true
    });

    // Check for collision
    scene.physics.add.collider(bloop, obstacles, hitObstacle, null, scene);

    // Add game over box for better visibility
    gameOverBox = scene.add.graphics();
    gameOverBox.fillStyle(0xffffff, 0.8);  // White background with some transparency
    gameOverBox.fillRect(100, 200, 300, 200);  // Positioned to cover Game Over text and restart button
    gameOverBox.visible = false;  // Initially hidden

    // Game Over text placeholders (hidden initially)
    gameOverText = scene.add.text(250, 220, 'Game Over', { fontSize: '48px', fill: '#ff0000' });
    gameOverText.setOrigin(0.5);
    gameOverText.visible = false;  // Initially hidden

    finalScoreText = scene.add.text(250, 270, '', { fontSize: '32px', fill: '#000' });
    finalScoreText.setOrigin(0.5);
    finalScoreText.visible = false;  // Initially hidden

    // Add restart text (hidden initially)
    restartText = scene.add.text(250, 320, 'Click to Restart', { fontSize: '32px', fill: '#000' });
    restartText.setOrigin(0.5);  // Center the text
    restartText.setInteractive();  // Make the text interactive (clickable)
    restartText.visible = false;  // Initially hidden

    // On click, restart the game
    restartText.on('pointerdown', function () {
        resetGame(scene);  // Call resetGame when restart is clicked
    });
}

function update() {
    if (gameOver) {
        return;
    }

    // Jump when space is pressed or mouse is clicked
    if (cursors.space.isDown || this.input.activePointer.isDown) {
        bloop.setVelocityY(-300);  // Jump power
    }

    // Game over if Bloop hits the top or bottom of the screen
    if (bloop.y <= 0 || bloop.y >= config.height) {
        hitObstacle();
    }

    // Increment score when passing obstacles
    obstacles.getChildren().forEach(function (obstacle) {
        if (obstacle.x < bloop.x && !obstacle.scored) {
            obstacle.scored = true;
            score += 1;
            scoreText.setText('Score: ' + score);
        }
    });
}

function addObstacles() {
    const gapHeight = 150;  // Fixed gap size
    const bloopHeight = bloop.height * 0.8;  // Bloop's actual height with adjusted collision box
    const minimumGapHeight = bloopHeight + 30;  // Ensure the gap is always bigger than Bloop by 30 pixels
    const obstacleX = 500;  // Start position for new obstacles

    // Random height for the bottom obstacle
    const bottomObstacleHeight = Phaser.Math.Between(100, config.height - gapHeight - 100);  // Leave room for the gap
    // Random height for the bottom obstacle, ensuring enough space for the gap
    const bottomObstacleHeight = Phaser.Math.Between(100, config.height - minimumGapHeight - 100);

    // Calculate the top obstacle height
    const topObstacleHeight = config.height - bottomObstacleHeight - gapHeight;
    // Calculate top obstacle height
    const topObstacleHeight = config.height - bottomObstacleHeight - minimumGapHeight;

    // Create the bottom obstacle and position it at the bottom of the screen
    const bottomObstacle = obstacles.create(obstacleX, config.height - bottomObstacleHeight, 'bottomObstacle');
    bottomObstacle.setDisplaySize(60, bottomObstacleHeight);  // Set obstacle size dynamically
    bottomObstacle.setVelocityX(-300);  // Move the obstacle leftward
    bottomObstacle.body.allowGravity = false;  // Ensure gravity does not affect the obstacle
    bottomObstacle.body.immovable = true;  // Prevent movement by external forces
    bottomObstacle.body.allowGravity = false;
    bottomObstacle.body.immovable = true;  // Prevent vertical movement

    // Create the top obstacle and position it at the top of the screen
    const topObstacle = obstacles.create(obstacleX, 0, 'topObstacle');
    topObstacle.setDisplaySize(60, topObstacleHeight);  // Set obstacle size dynamically
    topObstacle.setVelocityX(-300);  // Move the obstacle leftward
    topObstacle.body.allowGravity = false;  // Ensure gravity does not affect the obstacle
    topObstacle.body.immovable = true;  // Prevent movement by external forces
    topObstacle.body.allowGravity = false;
    topObstacle.body.immovable = true;  // Prevent vertical movement

    // Ensure the obstacles are destroyed when they leave the screen
    topObstacle.checkWorldBounds = true;
    topObstacle.outOfBoundsKill = true;
    bottomObstacle.checkWorldBounds = true;
    bottomObstacle.outOfBoundsKill = true;
}





function hitObstacle() {
    this.physics.pause();  // Stop the game
    bloop.setTint(0xff0000);  // Set red tint on collision
    gameOver = true;  // End game

    // Display Game Over Text and Restart Button
    gameOverBox.visible = true;
    gameOverText.setText('Game Over');
    gameOverText.visible = true;

    finalScoreText.setText('Score: ' + score);
    finalScoreText.visible = true;

    restartText.visible = true;
}

function resetGame(scene) {
    // Destroy existing game objects
    bloop.destroy();
    obstacles.clear(true, true);
    scoreText.destroy();
    gameOverText.destroy();
    finalScoreText.destroy();
    restartText.destroy();
    gameOverBox.destroy();

    // Remove existing obstacle event
    if (obstacleEvent) {
        obstacleEvent.remove(false);  // Remove the existing obstacle event
    }

    // Reset score and game variables
    score = 0;
    gameOver = false;

    // Recreate the game elements
    setupGame(scene);

    // Resume the game physics
    scene.physics.resume();
}
