/**
 * Flappy Cat - Particle System
 * Premium parçacık efektleri
 */

class Particle {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;
        this.vx = options.vx || (Math.random() - 0.5) * 4;
        this.vy = options.vy || (Math.random() - 0.5) * 4;
        this.size = options.size || Math.random() * 4 + 2;
        this.color = options.color || `hsl(${Math.random() * 60 + 30}, 100%, 70%)`;
        this.alpha = options.alpha || 1;
        this.decay = options.decay || 0.02;
        this.gravity = options.gravity || 0;
        this.type = options.type || 'circle';
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
        this.life = 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.alpha -= this.decay;
        this.life -= this.decay;
        this.rotation += this.rotationSpeed;
        this.size *= 0.99;
        return this.alpha > 0 && this.life > 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        switch (this.type) {
            case 'feather':
                this.drawFeather(ctx);
                break;
            case 'star':
                this.drawStar(ctx);
                break;
            case 'sparkle':
                this.drawSparkle(ctx);
                break;
            case 'trail':
                this.drawTrail(ctx);
                break;
            default:
                this.drawCircle(ctx);
        }

        ctx.restore();
    }

    drawCircle(ctx) {
        // Retro Pixel
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size, -this.size, this.size * 2, this.size * 2);
    }

    drawFeather(ctx) {
        // Pixel Feather
        ctx.fillStyle = this.color;
        const w = this.size * 3;
        const h = this.size;
        ctx.fillRect(-w / 2, -h / 2, w, h);
    }

    drawStar(ctx) {
        // Retro Star
        ctx.fillStyle = this.color;
        const s = this.size;
        ctx.fillRect(-s, -s, s * 2, s * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillRect(-s / 2, -s / 2, s, s);
    }

    drawSparkle(ctx) {
        // Retro Cross
        ctx.fillStyle = this.color;
        const s = this.size;
        ctx.fillRect(-s / 2, -s * 1.5, s, s * 3);
        ctx.fillRect(-s * 1.5, -s / 2, s * 3, s);
    }

    drawTrail(ctx) {
        // Retro Square Trail
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size, -this.size, this.size * 2, this.size * 2);
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 200;
    }

    emit(x, y, count, options = {}) {
        for (let i = 0; i < count && this.particles.length < this.maxParticles; i++) {
            this.particles.push(new Particle(x, y, { ...options }));
        }
    }

    // Zıplama efekti
    emitJump(x, y) {
        // Ana parçacıklar - 6 tüy
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 4) + (Math.random() * Math.PI / 2);
            const speed = Math.random() * 2.5 + 1.5;
            this.particles.push(new Particle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: -Math.sin(angle) * speed,
                size: Math.random() * 4 + 2,
                color: `hsl(${45 + Math.random() * 30}, 100%, ${60 + Math.random() * 20}%)`,
                decay: 0.035,
                type: 'feather'
            }));
        }

        // Sparkles
        for (let i = 0; i < 2; i++) {
            this.particles.push(new Particle(x + (Math.random() - 0.5) * 20, y + (Math.random() - 0.5) * 15, {
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                size: Math.random() * 3 + 1,
                color: `rgba(255, 255, 255, 0.6)`,
                decay: 0.06,
                type: 'sparkle'
            }));
        }
    }

    // Uçuş izi efekti
    emitTrail(x, y) {
        if (Math.random() > 0.3) return;

        this.particles.push(new Particle(x, y, {
            vx: -1,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 8 + 4,
            color: `rgba(139, 92, 246, ${Math.random() * 0.3 + 0.1})`,
            decay: 0.02,
            type: 'trail'
        }));
    }

    // Puan efekti
    emitScore(x, y) {
        const colors = ['#fbbf24', '#f59e0b', '#d97706', '#ffffff'];

        for (let i = 0; i < 15; i++) {
            const angle = (Math.PI * 2 * i) / 15;
            const speed = Math.random() * 4 + 2;
            this.particles.push(new Particle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 6 + 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                decay: 0.025,
                type: 'star'
            }));
        }

        // Center burst
        for (let i = 0; i < 8; i++) {
            this.particles.push(new Particle(x, y, {
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                size: Math.random() * 4 + 2,
                color: '#ffffff',
                decay: 0.04,
                type: 'sparkle'
            }));
        }
    }

    // Çarpışma efekti
    emitHit(x, y) {
        // Tüyler
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            this.particles.push(new Particle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 8 + 4,
                color: `hsl(${35 + Math.random() * 20}, 80%, ${50 + Math.random() * 30}%)`,
                decay: 0.015,
                gravity: 0.15,
                type: 'feather'
            }));
        }

        // Kırmızı parçacıklar
        for (let i = 0; i < 10; i++) {
            this.particles.push(new Particle(x, y, {
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                size: Math.random() * 6 + 3,
                color: `hsl(${0 + Math.random() * 20}, 100%, ${50 + Math.random() * 20}%)`,
                decay: 0.02,
                type: 'circle'
            }));
        }
    }

    // Sürekli arka plan efekti
    emitAmbient(canvasWidth, canvasHeight) {
        if (Math.random() > 0.02) return;

        this.particles.push(new Particle(
            Math.random() * canvasWidth,
            Math.random() * canvasHeight,
            {
                vx: -0.5,
                vy: 0,
                size: Math.random() * 3 + 1,
                color: `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1})`,
                decay: 0.005,
                type: 'circle'
            }
        ));
    }

    update() {
        this.particles = this.particles.filter(p => p.update());
    }

    draw(ctx) {
        this.particles.forEach(p => p.draw(ctx));
    }

    clear() {
        this.particles = [];
    }
}

// Global instance
const particleSystem = new ParticleSystem();
