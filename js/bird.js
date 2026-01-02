/**
 * Flappy Cat - Bird (Cat) Character
 * Sprite animasyonlu kedi karakteri
 */

class Bird {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Position & Physics - Orijinal Flappy Bird tarzı
        this.x = canvas.width * 0.25;
        this.y = canvas.height / 2;
        this.width = 55;
        this.height = 45;
        this.velocity = 0;
        this.gravity = 0.5; // Daha hızlı düşüş
        this.jumpForce = -9; // Keskin zıplama
        this.maxVelocity = 10;
        this.rotation = 0;
        this.targetRotation = 0;

        // Sprite Animation
        this.sprite = new Image();
        this.sprite.crossOrigin = 'anonymous';
        this.sprite.src = 'assets/sprites/cat.png';
        this.spriteLoaded = false;
        this.processedSprite = null;
        this.sprite.onload = () => {
            this.processSprite();
            this.calculateFrames();
            this.spriteLoaded = true;
        };

        // Animation frames - 4 sütun, 2 satır = 8 frame (sprite sheet'e göre)
        this.frameWidth = 0;
        this.frameHeight = 0;
        this.currentFrame = 0;
        this.frameCount = 8;
        this.frameTimer = 0;
        this.frameInterval = 100; // ms
        this.frames = [];

        // Visual Effects
        this.glowIntensity = 0;
        this.wingPhase = 0;
    }

    // Gri/beyaz arka planı şeffaf yap
    processSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = this.sprite.width;
        canvas.height = this.sprite.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(this.sprite, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Gri/beyaz pikselleri şeffaf yap (checkered background pattern)
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Gri tonları ve beyazı tespit et (checkered pattern için)
            const isGray = Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && Math.abs(r - b) < 15;
            const isLight = r > 180 && g > 180 && b > 180;
            const isMidGray = r > 100 && r < 200 && isGray;

            // Checkered pattern renkleri (açık gri ve koyu gri)
            if ((isLight && isGray) || (isMidGray)) {
                data[i + 3] = 0; // Alpha = 0 (şeffaf)
            }
        }

        ctx.putImageData(imageData, 0, 0);

        // Processed sprite'ı kaydet
        this.processedSprite = canvas;
    }

    calculateFrames() {
        // Sprite sheet: 2 sütun x 4 satır görünüyor
        const cols = 2;
        const rows = 4;
        this.frameWidth = this.sprite.width / cols;
        this.frameHeight = this.sprite.height / rows;
        this.frameCount = cols * rows;

        // Frame koordinatlarını hesapla
        this.frames = [];
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this.frames.push({
                    x: col * this.frameWidth,
                    y: row * this.frameHeight,
                    w: this.frameWidth,
                    h: this.frameHeight
                });
            }
        }
    }

    reset() {
        this.y = this.canvas.height / 2;
        this.velocity = 0;
        this.rotation = 0;
        this.targetRotation = 0;
        this.currentFrame = 0;
        this.glowIntensity = 0;
    }

    jump() {
        this.velocity = this.jumpForce;
        this.glowIntensity = 1;
        this.wingPhase = 0;

        // Parçacık efekti
        particleSystem.emitJump(this.x, this.y + this.height / 2);

        // Ses
        audioManager.playJump();
        audioManager.playWingFlap();
    }

    update(deltaTime) {
        // Gravity
        this.velocity += this.gravity;
        this.velocity = Math.min(this.velocity, this.maxVelocity);
        this.y += this.velocity;

        // Rotation based on velocity
        if (this.velocity < 0) {
            this.targetRotation = -25 * (Math.PI / 180);
        } else {
            this.targetRotation = Math.min(this.velocity * 3, 70) * (Math.PI / 180);
        }

        // Smooth rotation
        this.rotation += (this.targetRotation - this.rotation) * 0.1;

        // Wing animation (faster when jumping)
        this.wingPhase += deltaTime * 0.02;

        // Frame animation
        this.frameTimer += deltaTime;
        const animSpeed = this.velocity < 0 ? this.frameInterval * 0.5 : this.frameInterval;
        if (this.frameTimer >= animSpeed) {
            this.frameTimer = 0;
            this.currentFrame = (this.currentFrame + 1) % this.frameCount;
        }

        // Glow decay
        this.glowIntensity *= 0.95;

        // Trail particles
        particleSystem.emitTrail(this.x - this.width / 2, this.y);

        // Bounds check
        if (this.y < -this.height) this.y = -this.height;
        if (this.y > this.canvas.height) this.y = this.canvas.height;
    }

    draw() {
        this.ctx.save();

        // Translate to cat center
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate(this.rotation);

        // Glow effect
        if (this.glowIntensity > 0.1) {
            this.ctx.shadowColor = 'rgba(139, 92, 246, 0.8)';
            this.ctx.shadowBlur = 30 * this.glowIntensity;
        }

        // Draw sprite or fallback
        if (this.spriteLoaded && this.processedSprite && this.frames.length > 0) {
            const frame = this.frames[this.currentFrame];
            this.ctx.drawImage(
                this.processedSprite,
                frame.x, frame.y, frame.w, frame.h,
                -this.width / 2, -this.height / 2, this.width, this.height
            );
        } else {
            // Fallback: Draw a simple cat
            this.drawFallbackCat();
        }

        this.ctx.restore();
    }

    drawFallbackCat() {
        // Body
        this.ctx.fillStyle = '#f4a261';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, this.width / 2, this.height / 2.5, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Head
        this.ctx.beginPath();
        this.ctx.arc(this.width / 4, -this.height / 4, this.height / 3, 0, Math.PI * 2);
        this.ctx.fill();

        // Ears
        this.ctx.beginPath();
        this.ctx.moveTo(this.width / 4 - 10, -this.height / 2);
        this.ctx.lineTo(this.width / 4 - 5, -this.height / 2 - 10);
        this.ctx.lineTo(this.width / 4, -this.height / 2);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.moveTo(this.width / 4 + 5, -this.height / 2);
        this.ctx.lineTo(this.width / 4 + 10, -this.height / 2 - 10);
        this.ctx.lineTo(this.width / 4 + 15, -this.height / 2);
        this.ctx.fill();

        // Wings
        this.ctx.fillStyle = '#ffd166';
        const wingOffset = Math.sin(this.wingPhase * 10) * 5;

        // Left wing
        this.ctx.beginPath();
        this.ctx.ellipse(-this.width / 4, -10 + wingOffset, 15, 25, -0.3, 0, Math.PI * 2);
        this.ctx.fill();

        // Eye
        this.ctx.fillStyle = '#2d3436';
        this.ctx.beginPath();
        this.ctx.arc(this.width / 3, -this.height / 4, 4, 0, Math.PI * 2);
        this.ctx.fill();

        // Eye shine
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(this.width / 3 + 1, -this.height / 4 - 1, 1.5, 0, Math.PI * 2);
        this.ctx.fill();
    }

    getBounds() {
        // Hitbox slightly smaller than visual for fairness
        const padding = 8;
        return {
            x: this.x - this.width / 2 + padding,
            y: this.y - this.height / 2 + padding,
            width: this.width - padding * 2,
            height: this.height - padding * 2
        };
    }

    isOutOfBounds() {
        // Only die when hitting the ground (bottom) - not when going above screen
        // This matches original Flappy Bird behavior
        return this.y + this.height / 2 > this.canvas.height;
    }
}
