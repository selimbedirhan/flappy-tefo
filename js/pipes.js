/**
 * Flappy Cat - Pipe System
 * Premium engel sistemi
 */

class Pipe {
    constructor(canvas, x, gapY, gapSize, speed) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.x = x;
        this.width = 80;
        this.gapY = gapY;
        this.gapSize = gapSize;
        this.speed = speed;
        this.passed = false;

        // Visual properties
        this.topHeight = gapY - gapSize / 2;
        this.bottomY = gapY + gapSize / 2;
        this.bottomHeight = canvas.height - this.bottomY;

        // Glow animation
        this.glowPhase = Math.random() * Math.PI * 2;
        this.hue = 260 + Math.random() * 40; // Purple to blue range
    }

    update(deltaTime) {
        this.x -= this.speed;
        this.glowPhase += deltaTime * 0.003;
    }

    draw() {
        const glowIntensity = 0.3 + Math.sin(this.glowPhase) * 0.1;

        // Draw top pipe
        this.drawPipe(this.x, 0, this.width, this.topHeight, true, glowIntensity);

        // Draw bottom pipe
        this.drawPipe(this.x, this.bottomY, this.width, this.bottomHeight, false, glowIntensity);
    }

    drawPipe(x, y, width, height, isTop, glowIntensity) {
        if (height <= 0) return;

        const ctx = this.ctx;
        const capHeight = 35;
        const capWidth = width + 24;
        const capX = x - 12;
        const capRadius = 6;

        // Ensure we have enough height for the cap
        const effectiveCapHeight = Math.min(capHeight, height);
        const bodyHeight = Math.max(0, height - effectiveCapHeight);

        // Main pipe body gradient
        const bodyGradient = ctx.createLinearGradient(x, 0, x + width, 0);
        bodyGradient.addColorStop(0, `hsl(${this.hue}, 60%, 20%)`);
        bodyGradient.addColorStop(0.15, `hsl(${this.hue}, 70%, 35%)`);
        bodyGradient.addColorStop(0.35, `hsl(${this.hue}, 80%, 50%)`);
        bodyGradient.addColorStop(0.5, `hsl(${this.hue}, 85%, 55%)`);
        bodyGradient.addColorStop(0.65, `hsl(${this.hue}, 80%, 50%)`);
        bodyGradient.addColorStop(0.85, `hsl(${this.hue}, 70%, 35%)`);
        bodyGradient.addColorStop(1, `hsl(${this.hue}, 60%, 20%)`);

        // Glow effect
        ctx.save();
        ctx.shadowColor = `hsla(${this.hue}, 100%, 60%, ${glowIntensity})`;
        ctx.shadowBlur = 25;

        // Draw main body
        if (bodyHeight > 0) {
            ctx.fillStyle = bodyGradient;
            if (isTop) {
                // Top pipe: body from top, cap at bottom
                ctx.fillRect(x, y, width, bodyHeight);
            } else {
                // Bottom pipe: cap at top, body below
                ctx.fillRect(x, y + effectiveCapHeight, width, bodyHeight);
            }
        }

        // Cap gradient - slightly brighter
        const capGradient = ctx.createLinearGradient(capX, 0, capX + capWidth, 0);
        capGradient.addColorStop(0, `hsl(${this.hue}, 55%, 25%)`);
        capGradient.addColorStop(0.15, `hsl(${this.hue}, 65%, 45%)`);
        capGradient.addColorStop(0.35, `hsl(${this.hue}, 75%, 58%)`);
        capGradient.addColorStop(0.5, `hsl(${this.hue}, 80%, 65%)`);
        capGradient.addColorStop(0.65, `hsl(${this.hue}, 75%, 58%)`);
        capGradient.addColorStop(0.85, `hsl(${this.hue}, 65%, 45%)`);
        capGradient.addColorStop(1, `hsl(${this.hue}, 55%, 25%)`);

        ctx.fillStyle = capGradient;

        // Draw cap with rounded corners at the correct position
        let capY;
        if (isTop) {
            // Top pipe: cap is at the BOTTOM (mouth of pipe)
            capY = y + height - effectiveCapHeight;
        } else {
            // Bottom pipe: cap is at the TOP (mouth of pipe)
            capY = y;
        }

        // Draw rounded cap
        this.roundRect(capX, capY, capWidth, effectiveCapHeight, capRadius);
        ctx.fill();

        // Cap inner lip effect
        ctx.fillStyle = `hsla(${this.hue}, 100%, 75%, 0.4)`;
        const lipHeight = 4;
        if (isTop) {
            ctx.fillRect(capX + 3, capY, capWidth - 6, lipHeight);
        } else {
            ctx.fillRect(capX + 3, capY + effectiveCapHeight - lipHeight, capWidth - 6, lipHeight);
        }

        // Highlight line on pipe body
        if (bodyHeight > 0) {
            ctx.strokeStyle = `hsla(${this.hue}, 100%, 80%, 0.6)`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            if (isTop) {
                ctx.moveTo(x + 8, y);
                ctx.lineTo(x + 8, y + bodyHeight);
            } else {
                ctx.moveTo(x + 8, y + effectiveCapHeight);
                ctx.lineTo(x + 8, y + height);
            }
            ctx.stroke();
        }

        // Inner shadow for depth on body
        if (bodyHeight > 0) {
            const innerGradient = ctx.createLinearGradient(x, 0, x + width, 0);
            innerGradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
            innerGradient.addColorStop(0.1, 'rgba(0, 0, 0, 0)');
            innerGradient.addColorStop(0.9, 'rgba(0, 0, 0, 0)');
            innerGradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');

            ctx.fillStyle = innerGradient;
            if (isTop) {
                ctx.fillRect(x, y, width, bodyHeight);
            } else {
                ctx.fillRect(x, y + effectiveCapHeight, width, bodyHeight);
            }
        }

        // Pipe end rim effect (3D look)
        ctx.strokeStyle = `hsla(${this.hue}, 70%, 30%, 0.8)`;
        ctx.lineWidth = 2;
        this.roundRect(capX, capY, capWidth, effectiveCapHeight, capRadius);
        ctx.stroke();

        ctx.restore();
    }

    roundRect(x, y, width, height, radius) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    getTopBounds() {
        return {
            x: this.x - 12, // Include cap (capX = x - 12)
            y: 0,
            width: this.width + 24, // Cap width is width + 24
            height: this.topHeight
        };
    }

    getBottomBounds() {
        return {
            x: this.x - 12, // Include cap (capX = x - 12)
            y: this.bottomY,
            width: this.width + 24, // Cap width is width + 24
            height: this.bottomHeight
        };
    }

    isOffScreen() {
        return this.x + this.width + 24 < 0; // Include cap width
    }

    isPassed(birdX) {
        if (!this.passed && this.x + this.width / 2 < birdX) {
            this.passed = true;
            return true;
        }
        return false;
    }
}

class PipeManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.pipes = [];
        this.spawnTimer = 0; // Start at 0 since first spawn is manual
        this.spawnInterval = 2200; // Slightly faster spawn
        this.minGap = 160; // Consistent gap values
        this.maxGap = 200; // Consistent gap values
        this.speed = 3.5; // Slightly slower for fairer gameplay
        this.difficulty = 1;
    }

    reset() {
        this.pipes = [];
        this.spawnTimer = 0;
        this.minGap = 160;
        this.maxGap = 200;
        this.speed = 3.5;
        this.difficulty = 1;
    }

    increaseDifficulty() {
        // Gradual difficulty increase - not too aggressive
        this.difficulty += 0.08;
        // Speed increases slightly (max 4.5)
        this.speed = Math.min(3.5 + this.difficulty * 0.15, 4.5);
        // Gap shrinks slightly (min 130 for minGap, 140 for maxGap)
        this.minGap = Math.max(160 - this.difficulty * 3, 130);
        this.maxGap = Math.max(200 - this.difficulty * 3, 145);
    }

    spawn() {
        const minY = 100;
        const maxY = this.canvas.height - 100;
        const gapY = minY + Math.random() * (maxY - minY);
        const gapSize = this.minGap + Math.random() * (this.maxGap - this.minGap);

        const pipe = new Pipe(
            this.canvas,
            this.canvas.width + 50,
            gapY,
            gapSize,
            this.speed
        );

        this.pipes.push(pipe);
    }

    update(deltaTime) {
        // Spawn new pipes
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this.spawn();
        }

        // Update existing pipes
        this.pipes.forEach(pipe => {
            pipe.speed = this.speed; // Update speed in case of difficulty change
            pipe.update(deltaTime);
        });

        // Remove off-screen pipes
        this.pipes = this.pipes.filter(pipe => !pipe.isOffScreen());
    }

    draw() {
        this.pipes.forEach(pipe => pipe.draw());
    }

    checkCollision(birdBounds) {
        for (const pipe of this.pipes) {
            const topBounds = pipe.getTopBounds();
            const bottomBounds = pipe.getBottomBounds();

            if (this.intersects(birdBounds, topBounds) ||
                this.intersects(birdBounds, bottomBounds)) {
                return true;
            }
        }
        return false;
    }

    checkScore(birdX) {
        for (const pipe of this.pipes) {
            if (pipe.isPassed(birdX)) {
                return true;
            }
        }
        return false;
    }

    intersects(a, b) {
        return a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y;
    }

    getScorePosition() {
        // Return position of the last scored pipe for particle effect
        for (const pipe of this.pipes) {
            if (pipe.passed) {
                return { x: pipe.x + pipe.width, y: pipe.gapY };
            }
        }
        return null;
    }
}
