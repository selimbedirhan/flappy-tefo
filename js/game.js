/**
 * Flappy Cat - Main Game Engine
 * Premium oyun motoru
 */

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Game state
        this.state = 'start'; // start, playing, paused, gameOver
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.lastTime = 0;
        this.animationId = null;

        // Game objects
        this.bird = null;
        this.pipeManager = null;

        // Background layers for parallax
        this.bgLayers = [];

        // UI Elements
        this.startScreen = document.getElementById('startScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.pauseScreen = document.getElementById('pauseScreen');
        this.gameUI = document.getElementById('gameUI');
        this.scoreDisplay = document.getElementById('scoreDisplay');
        this.finalScore = document.getElementById('finalScore');
        this.finalHighScore = document.getElementById('finalHighScore');
        this.highScoreValue = document.getElementById('highScoreValue');
        this.newRecord = document.getElementById('newRecord');
        this.pauseBtn = document.getElementById('pauseBtn');

        // Initialize
        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.createStars();
        this.createBackgroundLayers();
        this.updateHighScoreDisplay();

        // Create preview cat for start screen
        this.createCatPreview();

        // Start animation loop (for background effects)
        this.animate(0);
    }

    setupCanvas() {
        const resize = () => {
            // Full screen dimensions
            const displayWidth = window.innerWidth;
            const displayHeight = window.innerHeight;

            // Target logical height for "Zoomed" feel (cat looks bigger)
            // Smaller logical height = Bigger objects relative to screen
            const logicalHeight = 600;
            const scale = displayHeight / logicalHeight;
            const logicalWidth = displayWidth / scale;

            // Set canvas resolution to match display for sharpness
            // BUT we will need to scale rendering context, or handle logic differently.
            // Simplified approach for consistency with previous logic:
            // Set canvas.width/height to logical resolution and let CSS scale it up.
            // This is "Retro" style upscaling (pixels become bigger).

            this.canvas.width = logicalWidth;
            this.canvas.height = logicalHeight;

            // Recreate game objects on resize
            if (this.bird) {
                this.bird.canvas = this.canvas;
                this.bird.ctx = this.ctx;
                // Re-center bird roughly
                this.bird.x = this.canvas.width * 0.2;
                if (this.bird.y > this.canvas.height) this.bird.y = this.canvas.height / 2;
            }
            if (this.pipeManager) {
                this.pipeManager.canvas = this.canvas;
            }

            this.createBackgroundLayers();
        };

        resize();
        window.addEventListener('resize', resize);
    }

    setupEventListeners() {
        // Keyboard
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                this.handleInput();
            }
            if (e.code === 'Escape') {
                this.togglePause();
            }
        });

        // Touch/Click on canvas
        this.canvas.addEventListener('click', () => this.handleInput());
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleInput();
        }, { passive: false });

        // Buttons
        document.getElementById('startBtn').addEventListener('click', () => {
            audioManager.init();
            audioManager.playClick();
            this.startGame();
        });

        document.getElementById('restartBtn').addEventListener('click', () => {
            audioManager.playClick();
            this.startGame();
        });

        document.getElementById('shareBtn').addEventListener('click', () => {
            audioManager.playClick();
            this.shareScore();
        });

        document.getElementById('pauseBtn').addEventListener('click', () => {
            audioManager.playClick();
            this.togglePause();
        });

        document.getElementById('resumeBtn').addEventListener('click', () => {
            audioManager.playClick();
            this.togglePause();
        });

        // Audio toggle
        document.getElementById('audioToggle').addEventListener('click', () => {
            audioManager.init();
            const enabled = audioManager.toggle();
            document.querySelector('.audio-on').classList.toggle('hidden', !enabled);
            document.querySelector('.audio-off').classList.toggle('hidden', enabled);
        });
    }

    createStars() {
        const starsContainer = document.getElementById('stars');
        starsContainer.innerHTML = '';

        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.setProperty('--duration', `${2 + Math.random() * 3}s`);
            star.style.setProperty('--delay', `${Math.random() * 3}s`);
            star.style.setProperty('--opacity', `${0.3 + Math.random() * 0.7}`);
            starsContainer.appendChild(star);
        }
    }

    createBackgroundLayers() {
        this.bgLayers = [
            { // Far mountains
                color: 'rgba(99, 102, 241, 0.3)',
                y: this.canvas.height * 0.5,
                height: this.canvas.height * 0.5,
                speed: 0.2,
                offset: 0,
                peaks: this.generatePeaks(5, 30)
            },
            { // Mid mountains
                color: 'rgba(139, 92, 246, 0.4)',
                y: this.canvas.height * 0.6,
                height: this.canvas.height * 0.4,
                speed: 0.5,
                offset: 0,
                peaks: this.generatePeaks(7, 50)
            },
            { // Near hills
                color: 'rgba(167, 139, 250, 0.5)',
                y: this.canvas.height * 0.75,
                height: this.canvas.height * 0.25,
                speed: 1,
                offset: 0,
                peaks: this.generatePeaks(10, 30)
            },
            { // Ground
                color: 'rgba(88, 28, 135, 0.8)',
                y: this.canvas.height * 0.92,
                height: this.canvas.height * 0.08,
                speed: 2,
                offset: 0,
                isGround: true
            }
        ];

        // Clouds
        this.clouds = [];
        for (let i = 0; i < 5; i++) {
            this.clouds.push({
                x: Math.random() * this.canvas.width,
                y: 30 + Math.random() * 100,
                size: 30 + Math.random() * 50,
                speed: 0.3 + Math.random() * 0.3,
                opacity: 0.1 + Math.random() * 0.2
            });
        }
    }

    generatePeaks(count, variance) {
        const peaks = [];
        for (let i = 0; i <= count; i++) {
            peaks.push(Math.random() * variance);
        }
        return peaks;
    }

    createCatPreview() {
        const preview = document.getElementById('catPreview');
        preview.innerHTML = ''; // Clear existing content
        const img = new Image();
        img.src = 'assets/sprites/tefo-preview.png';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        preview.appendChild(img);
    }

    handleInput() {
        switch (this.state) {
            case 'start':
                audioManager.init();
                audioManager.playClick();
                this.startGame();
                break;
            case 'playing':
                this.bird.jump();
                break;
            case 'paused':
                this.togglePause();
                break;
            case 'gameOver':
                audioManager.playClick();
                this.startGame();
                break;
        }
    }

    startGame() {
        this.state = 'playing';
        this.score = 0;

        // Create game objects
        this.bird = new Bird(this.canvas);
        this.pipeManager = new PipeManager(this.canvas);
        particleSystem.clear();

        // Update UI
        this.startScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.pauseScreen.classList.add('hidden');
        this.gameUI.classList.remove('hidden');
        this.pauseBtn.classList.remove('hidden');
        this.scoreDisplay.textContent = '0';

        // Orijinal Flappy Bird gibi - ilk boru hemen spawn olur
        this.pipeManager.spawn();
    }

    togglePause() {
        if (this.state === 'playing') {
            this.state = 'paused';
            this.pauseScreen.classList.remove('hidden');
            this.pauseBtn.textContent = '▶';
        } else if (this.state === 'paused') {
            this.state = 'playing';
            this.pauseScreen.classList.add('hidden');
            this.pauseBtn.textContent = '⏸';
        }
    }

    gameOver() {
        this.state = 'gameOver';

        // Play sounds
        audioManager.playHit();
        setTimeout(() => audioManager.playFall(), 200);

        // Emit hit particles
        particleSystem.emitHit(this.bird.x, this.bird.y);

        // Check for new high score
        const isNewRecord = this.score > this.highScore;
        if (isNewRecord) {
            this.highScore = this.score;
            this.saveHighScore();
            setTimeout(() => audioManager.playNewRecord(), 500);
        }

        // Update UI
        this.gameUI.classList.add('hidden');
        this.pauseBtn.classList.add('hidden');

        // Delay showing game over screen for effect
        setTimeout(() => {
            this.finalScore.textContent = this.score;
            this.finalHighScore.textContent = this.highScore;
            this.newRecord.classList.toggle('hidden', !isNewRecord);
            this.gameOverScreen.classList.remove('hidden');
            this.updateHighScoreDisplay();
        }, 1000);
    }

    addScore() {
        this.score++;
        this.scoreDisplay.textContent = this.score;
        this.scoreDisplay.style.animation = 'none';
        this.scoreDisplay.offsetHeight; // Trigger reflow
        this.scoreDisplay.style.animation = 'scorePopIn 0.3s ease';

        // Play sound
        audioManager.playScore();

        // Emit particles at gap position
        const lastPipe = this.pipeManager.pipes.find(p => p.passed);
        if (lastPipe) {
            particleSystem.emitScore(lastPipe.x + lastPipe.width, lastPipe.gapY);
        }

        // Increase difficulty every 5 points
        if (this.score % 5 === 0) {
            this.pipeManager.increaseDifficulty();
        }
    }

    loadHighScore() {
        return parseInt(localStorage.getItem('flappyCatHighScore')) || 0;
    }

    saveHighScore() {
        localStorage.setItem('flappyCatHighScore', this.highScore);
    }

    updateHighScoreDisplay() {
        this.highScoreValue.textContent = this.highScore;
    }

    shareScore() {
        const text = `🐱✨ Flappy Cat'te ${this.score} puan yaptım! En yüksek skorun: ${this.highScore}. Sen de dene!`;

        if (navigator.share) {
            navigator.share({
                title: 'Flappy Cat',
                text: text,
                url: window.location.href
            }).catch(() => { });
        } else {
            // Fallback to clipboard
            navigator.clipboard.writeText(text + ' ' + window.location.href).then(() => {
                alert('Skor panoya kopyalandı!');
            }).catch(() => {
                alert(text);
            });
        }
    }

    update(deltaTime) {
        // Update background
        this.updateBackground(deltaTime);

        // Update clouds
        this.clouds.forEach(cloud => {
            cloud.x -= cloud.speed;
            if (cloud.x + cloud.size < 0) {
                cloud.x = this.canvas.width + cloud.size;
                cloud.y = 30 + Math.random() * 100;
            }
        });

        // Ambient particles
        particleSystem.emitAmbient(this.canvas.width, this.canvas.height);
        particleSystem.update();

        if (this.state !== 'playing') return;

        // Update game objects
        this.bird.update(deltaTime);
        this.pipeManager.update(deltaTime);

        // Check scoring
        if (this.pipeManager.checkScore(this.bird.x)) {
            this.addScore();
        }

        // Check collision
        if (this.pipeManager.checkCollision(this.bird.getBounds())) {
            this.gameOver();
            return;
        }

        // Check bounds
        if (this.bird.isOutOfBounds()) {
            this.gameOver();
            return;
        }
    }

    updateBackground(deltaTime) {
        if (this.state === 'playing') {
            this.bgLayers.forEach(layer => {
                layer.offset += layer.speed;
            });
        }
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw premium purple gradient sky
        const skyGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        skyGradient.addColorStop(0, '#0f0f23');
        skyGradient.addColorStop(0.3, '#1a1a3e');
        skyGradient.addColorStop(0.6, '#2d1b69');
        skyGradient.addColorStop(1, '#44318d');
        this.ctx.fillStyle = skyGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw stars in background
        this.drawStars();

        // Draw clouds
        this.drawClouds();

        // Draw background layers (parallax)
        this.drawBackgroundLayers();

        // Draw game objects
        if (this.state === 'playing' || this.state === 'paused' || this.state === 'gameOver') {
            this.pipeManager.draw();
            particleSystem.draw(this.ctx);
            this.bird.draw();
        }

        // Draw vignette
        this.drawVignette();
    }

    drawStars() {
        this.ctx.fillStyle = 'white';
        const starCount = 50;
        const time = Date.now() * 0.001;

        for (let i = 0; i < starCount; i++) {
            const x = (i * 73.5) % this.canvas.width;
            const y = (i * 91.3) % (this.canvas.height * 0.6);
            const twinkle = Math.sin(time * 2 + i) * 0.5 + 0.5;
            const size = 1 + twinkle * 1.5;

            this.ctx.globalAlpha = 0.3 + twinkle * 0.7;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.globalAlpha = 1;
    }

    drawClouds() {
        this.clouds.forEach(cloud => {
            this.ctx.globalAlpha = cloud.opacity;

            const gradient = this.ctx.createRadialGradient(
                cloud.x, cloud.y, 0,
                cloud.x, cloud.y, cloud.size
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
            this.ctx.fill();

            // Second blob
            this.ctx.beginPath();
            this.ctx.arc(cloud.x + cloud.size * 0.5, cloud.y - cloud.size * 0.2, cloud.size * 0.7, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
    }

    drawBackgroundLayers() {
        this.bgLayers.forEach(layer => {
            this.ctx.fillStyle = layer.color;

            if (layer.isGround) {
                // Simple ground
                this.ctx.fillRect(0, layer.y, this.canvas.width, layer.height);

                // Ground pattern
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                const patternWidth = 50;
                const offset = layer.offset % patternWidth;
                for (let x = -offset; x < this.canvas.width; x += patternWidth) {
                    this.ctx.fillRect(x, layer.y, patternWidth / 2, 3);
                }
            } else if (layer.peaks) {
                // Mountains/hills
                this.ctx.beginPath();
                this.ctx.moveTo(0, this.canvas.height);

                const segmentWidth = this.canvas.width / (layer.peaks.length - 1);
                const offset = layer.offset % segmentWidth;

                for (let i = 0; i < layer.peaks.length + 1; i++) {
                    const x = i * segmentWidth - offset;
                    const peakIndex = i % layer.peaks.length;
                    const y = layer.y - layer.peaks[peakIndex];

                    if (i === 0) {
                        this.ctx.lineTo(x, y);
                    } else {
                        // Smooth curve between peaks
                        const prevX = (i - 1) * segmentWidth - offset;
                        const prevPeakIndex = (i - 1) % layer.peaks.length;
                        const prevY = layer.y - layer.peaks[prevPeakIndex];
                        const cpX = (prevX + x) / 2;

                        this.ctx.quadraticCurveTo(cpX, prevY, x, y);
                    }
                }

                this.ctx.lineTo(this.canvas.width, this.canvas.height);
                this.ctx.closePath();
                this.ctx.fill();
            }
        });
    }

    drawVignette() {
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.height * 0.3,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.height * 0.8
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    animate(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.draw();

        this.animationId = requestAnimationFrame((time) => this.animate(time));
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
