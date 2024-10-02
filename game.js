// Initialize the game
const config = {
    type: Phaser.AUTO,
    width: 500,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 }, // Increased gravity for more difficulty
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

function preload() {
    // Load images with correct paths
    this.load.image('background', 'assets/bloop_background.png');
    this.load.image('bloop', 'assets/bloop_rocket.png');
    this.load.image('topObstacle', 'assets/redcandle.png');
    this.load.image('bottomObstacle', 'assets/greencandle.png');
}

function create() {
    // Add background
    this.add.image(250, 300, 'background');  // Background image

    // Create Bloop (Adjusted scale and size for collision)
    bloop = this.physics.add.sprite(100, 300, 'bloop').setScale(0.1);
    bloop.setCollideWorldBounds(true);  // Bloop won't go off-screen
    bloop.body.setSize(bloop.width * 0.6, bloop.height * 0.8);  // Adjust collision box size for Bloop
    bloop.body.setOffset(10, 10);  // Fine-tune the offset

    // Create obstacles group
    obstacles = this.physics.add.group();

    // Add keyboard input for jump
    cursors = this.input.keyboard.createCursorKeys();

    // Display score
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });

    // Add obstacle generation loop
    this.time.addEvent({
        delay: 1000,  // Adjusted delay for obstacle creation
        callback: addObstacles,
        callbackScope: this,
        loop: true
    });

    // Check for collision
    this.physics.add.collider(bloop, obstacles, hitObstacle, null, this);

    // Add game over box for better visibility
    gameOverBox = this.add.graphics();
    gameOverBox.fillStyle(0xffffff, 0.8);  // White background with some transparency
    gameOverBox.fillRect(100, 200, 300, 200);  // Positioned to cover Game Over text and restart button
    gameOverBox.visible = false;  // Initially hidden

    // Game Over text placeholders (hidden initially)
    gameOverText = this.add.text(250, 220, 'Game Over', { fontSize: '48px', fill: '#ff0000' });
    gameOverText.setOrigin(0.5);
    gameOverText.visible = false;  // Initially hidden

    finalScoreText = this.add.text(250, 270, '', { fontSize: '32px', fill: '#000' });
    finalScoreText.setOrigin(0.5);
    finalScoreText.visible = false;  // Initially hidden

    // Add restart text (hidden initially)
    restartText = this.add.text(250, 320, 'Click to Restart', { fontSize: '32px', fill: '#000' });
    restartText.setOrigin(0.5);  // Center the text
    restartText.setInteractive();  // Make the text interactive (clickable)
    restartText.visible = false;  // Initially hidden

    // On click, restart the game
    restartText.on('pointerdown', () => restartGame());
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
    const gapHeight = Phaser.Math.Between(150, 200);  // Smaller gap for more difficulty
    const obstacleX = 500;  // Start point for new obstacles
    const obstacleGapY = Phaser.Math.Between(150, 450);  // Random vertical position for the gap

    // Top obstacle
    const topObstacle = obstacles.create(obstacleX, obstacleGapY - gapHeight, 'topObstacle').setScale(0.4);  // Smaller scale
    topObstacle.setOrigin(0, 1);  // Flip top obstacle
    topObstacle.body.allowGravity = false;
    topObstacle.setVelocityX(-300);  // Faster obstacle speed

    // Bottom obstacle (increased size)
    const bottomObstacle = obstacles.create(obstacleX, obstacleGapY + gapHeight, 'bottomObstacle').setScale(0.5);  // Slightly larger scale
    bottomObstacle.body.allowGravity = false;
    bottomObstacle.setVelocityX(-300);  // Faster obstacle speed

    // Destroy obstacles after they leave the screen
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

function restartGame() {
    // Reset game variables
    score = 0;
    gameOver = false;

    // Clear all obstacles
    obstacles.clear(true, true);

    // Reset display text
    scoreText.setText('Score: 0');
    gameOverText.setText('');
    finalScoreText.setText('');

    // Clear tint from Bloop
    bloop.clearTint();

    // Hide game over box and restart button
    gameOverBox.visible = false;
    gameOverText.visible = false;
    finalScoreText.visible = false;
    restartText.visible = false;

    // Re-enable Bloop's physics and position it in the middle of the screen
    bloop.setPosition(100, 300);
    bloop.setVelocity(0, 0);

    // Restart the obstacle generation loop by resetting the delay timer
    addObstacles();
    this.physics.resume();  // Resume the physics
}
