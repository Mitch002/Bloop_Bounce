// Initialize the game
const config = {
    type: Phaser.AUTO,
    width: 500,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 }, // Gravity for Bloop
            debug: true  // Enable debug mode to visualize the collision boxes
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
let restartButton;
let gameOverText, finalScoreText;

function preload() {
    // Load images with correct paths
    this.load.image('background', 'assets/bloop_background.png');
    this.load.image('bloop', 'assets/bloop_rocket.png');
    this.load.image('topObstacle', 'assets/redcandle.png');
    this.load.image('bottomObstacle', 'assets/greencandle.png');
    this.load.image('restartButton', 'assets/restart_button.png'); // Placeholder for restart button
}

function create() {
    // Add background
    this.add.image(250, 300, 'background');  // Background image

    // Create Bloop (Adjusted scale and size for collision)
    bloop = this.physics.add.sprite(100, 300, 'bloop').setScale(0.1);  // Adjust scale as needed
    bloop.setCollideWorldBounds(true);  // Bloop won't go off-screen

    // Adjust Bloop's collision box to fit within the rocket
    bloop.body.setSize(bloop.width * 0.6, bloop.height * 0.8);  // Adjust collision box size for Bloop
    bloop.body.setOffset(10, 10);  // Fine-tune the offset to match the visual appearance

    // Create obstacles group
    obstacles = this.physics.add.group();

    // Add keyboard input for jump
    cursors = this.input.keyboard.createCursorKeys();

    // Display score
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });

    // Add obstacle generation loop (reduce delay for faster gameplay)
    this.time.addEvent({
        delay: 1200,  // Adjusted delay for obstacle creation
        callback: addObstacles,
        callbackScope: this,
        loop: true
    });

    // Check for collision
    this.physics.add.collider(bloop, obstacles, hitObstacle, null, this);

    // Game Over Restart Button (hidden initially)
    restartButton = this.add.image(250, 400, 'restartButton').setInteractive();
    restartButton.visible = false;
    restartButton.on('pointerdown', () => restartGame());

    // Game over and final score text placeholders (hidden initially)
    gameOverText = this.add.text(150, 250, '', { fontSize: '48px', fill: '#ff0000' });
    finalScoreText = this.add.text(170, 300, '', { fontSize: '32px', fill: '#000' });
}

function update() {
    if (gameOver) {
        return;
    }

    // Jump when space is pressed or mouse is clicked
    if (cursors.space.isDown || this.input.activePointer.isDown) {
        bloop.setVelocityY(-300);  // Jump power (adjust as needed)
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
    const gapHeight = Phaser.Math.Between(180, 250);  // Larger gap size to allow Bloop to pass
    const obstacleX = 500;  // Start point for new obstacles
    const obstacleGapY = Phaser.Math.Between(200, 400);  // Random vertical position for the gap

    // Top obstacle (adjust scale and collision size)
    const topObstacle = obstacles.create(obstacleX, obstacleGapY - gapHeight, 'topObstacle').setScale(0.4);  // Smaller scale for the obstacle
    topObstacle.setOrigin(0, 1);  // Flip top obstacle
    topObstacle.body.allowGravity = false;
    topObstacle.setVelocityX(-250);  // Increased speed for faster gameplay
    topObstacle.body.setSize(topObstacle.width, topObstacle.height * 0.8);  // Adjust the collision box size

    // Bottom obstacle (adjust scale and collision size)
    const bottomObstacle = obstacles.create(obstacleX, obstacleGapY + gapHeight, 'bottomObstacle').setScale(0.4);  // Smaller scale for the obstacle
    bottomObstacle.body.allowGravity = false;
    bottomObstacle.setVelocityX(-250);  // Increased speed for faster gameplay
    bottomObstacle.body.setSize(bottomObstacle.width, bottomObstacle.height * 0.8);  // Adjust the collision box size

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
    gameOverText.setText('Game Over');
    finalScoreText.setText('Score: ' + score);

    // Show the restart button
    restartButton.visible = true;
}

function restartGame() {
    // Reset game variables
    score = 0;
    gameOver = false;

    // Reset display text
    scoreText.setText('Score: 0');
    gameOverText.setText('');
    finalScoreText.setText('');

    // Clear tint from Bloop
    bloop.clearTint();

    // Hide restart button
    restartButton.visible = false;

    // Restart the scene
    this.scene.restart();
}
