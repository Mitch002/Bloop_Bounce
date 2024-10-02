// Initialize the game
const config = {
    type: Phaser.AUTO,
    width: 500,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 }, // Gravity for Bloop
            debug: false
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
let topObstacleImg, bottomObstacleImg;

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

    // Create Bloop (Adjusted scale to make it smaller)
    bloop = this.physics.add.sprite(100, 300, 'bloop').setScale(0.1);  // Adjust scale as needed
    bloop.setCollideWorldBounds(true);  // Bloop won't go off-screen

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
    restartButton = this.add.image(250, 300, 'restartButton').setInteractive();
    restartButton.visible = false;
    restartButton.on('pointerdown', () => restartGame());
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
    const gapHeight = Phaser.Math.Between(150, 250);  // Larger gap size to allow Bloop to pass
    const obstacleX = 500;  // Start point for new obstacles
    const obstacleGapY = Phaser.Math.Between(200, 400);  // Random vertical position for the gap

    // Top obstacle (adjust scale for correct size)
    const topObstacle = obstacles.create(obstacleX, obstacleGapY - gapHeight, 'topObstacle').setScale(0.5);  // Adjust scale for the obstacle
    topObstacle.setOrigin(0, 1);  // Flip top obstacle
    topObstacle.body.allowGravity = false;
    topObstacle.setVelocityX(-250);  // Increased speed

    // Bottom obstacle (adjust scale for correct size)
    const bottomObstacle = obstacles.create(obstacleX, obstacleGapY + gapHeight, 'bottomObstacle').setScale(0.5);  // Adjust scale for the obstacle
    bottomObstacle.body.allowGravity = false;
    bottomObstacle.setVelocityX(-250);  // Increased speed

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
    let gameOverText = this.add.text(150, 250, 'Game Over', { fontSize: '48px', fill: '#ff0000' });
    let finalScoreText = this.add.text(170, 300, 'Score: ' + score, { fontSize: '32px', fill: '#000' });

    // Show the restart button
    restartButton.visible = true;
}

// Function to restart the game
function restartGame() {
    score = 0;
    gameOver = false;
    scoreText.setText('Score: 0');
    bloop.clearTint();
    this.scene.restart();  // Reset the scene
}
