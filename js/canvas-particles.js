/**
 * Ambient Canvas Engine:
 * - Floating soft purple & golden stardust particles
 * - Drifting luminous white lily petals with natural swaying motion
 * - Lightweight, battery-optimized, 60fps
 */

(function () {
  const canvas = document.getElementById('ambientCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  let animationFrameId = null;
  let isTabVisible = true;

  // Configuration
  const isMobile = window.innerWidth < 768;
  const PARTICLE_COUNT = isMobile ? 35 : 65;
  const PETAL_COUNT = isMobile ? 12 : 22;

  const particles = [];
  const petals = [];

  // Resize handler with debouncing
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }, 150);
  });

  // Handle visibility to save battery on mobile
  document.addEventListener('visibilitychange', () => {
    isTabVisible = !document.hidden;
    if (isTabVisible && !animationFrameId) {
      animate();
    }
  });

  // --- Stardust Particle Class ---
  class Stardust {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.size = Math.random() * 2 + 0.6;
      this.speedY = Math.random() * 0.4 + 0.15;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.6 + 0.2;
      this.pulseSpeed = Math.random() * 0.02 + 0.008;
      this.pulse = Math.random() * Math.PI * 2;
      
      // Randomly lavender or warm golden stardust
      const isGold = Math.random() > 0.75;
      this.color = isGold
        ? `254, 240, 138` // soft gold
        : `216, 180, 254`; // soft lavender
    }

    update() {
      this.y -= this.speedY;
      this.x += this.speedX;
      this.pulse += this.pulseSpeed;

      if (this.y < -10 || this.x < -10 || this.x > width + 10) {
        this.reset();
      }
    }

    draw() {
      const currentAlpha = Math.max(0, this.opacity + Math.sin(this.pulse) * 0.25);
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${currentAlpha})`;
      ctx.shadowBlur = this.size * 4;
      ctx.shadowColor = `rgba(${this.color}, ${currentAlpha * 0.8})`;
      ctx.fill();
      ctx.restore();
    }
  }

  // --- Floating White Lily Petal Class ---
  class LilyPetal {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : -30;
      this.length = Math.random() * 14 + 10;
      this.width = this.length * (Math.random() * 0.3 + 0.38);
      this.speedY = Math.random() * 0.6 + 0.35;
      this.speedX = Math.random() * 0.3 + 0.1;
      this.angle = Math.random() * Math.PI * 2;
      this.spinSpeed = (Math.random() - 0.5) * 0.02;
      this.swaySpeed = Math.random() * 0.02 + 0.01;
      this.swayDistance = Math.random() * 1.5 + 0.8;
      this.swayPhase = Math.random() * Math.PI * 2;
      this.opacity = Math.random() * 0.45 + 0.25;
    }

    update() {
      this.y += this.speedY;
      this.swayPhase += this.swaySpeed;
      this.x += Math.sin(this.swayPhase) * this.swayDistance + this.speedX;
      this.angle += this.spinSpeed;

      if (this.y > height + 30 || this.x > width + 30 || this.x < -30) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);

      // Render delicate elliptical lily petal
      ctx.beginPath();
      ctx.ellipse(0, 0, this.width / 2, this.length / 2, 0, 0, Math.PI * 2);

      // Gradient for soft white-to-lavender petal look
      const grad = ctx.createLinearGradient(0, -this.length / 2, 0, this.length / 2);
      grad.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
      grad.addColorStop(0.6, `rgba(245, 240, 255, ${this.opacity * 0.9})`);
      grad.addColorStop(1, `rgba(216, 180, 254, ${this.opacity * 0.6})`);

      ctx.fillStyle = grad;
      ctx.shadowBlur = 6;
      ctx.shadowColor = `rgba(230, 215, 255, ${this.opacity * 0.5})`;
      ctx.fill();

      // Subtle mid-rib line down center of petal
      ctx.beginPath();
      ctx.moveTo(0, -this.length * 0.4);
      ctx.lineTo(0, this.length * 0.4);
      ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity * 0.5})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.restore();
    }
  }

  // Initialize particles & petals
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Stardust());
  }
  for (let i = 0; i < PETAL_COUNT; i++) {
    petals.push(new LilyPetal());
  }

  // Animation loop
  function animate() {
    if (!isTabVisible) {
      animationFrameId = null;
      return;
    }

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    for (let i = 0; i < petals.length; i++) {
      petals[i].update();
      petals[i].draw();
    }

    animationFrameId = requestAnimationFrame(animate);
  }

  // Start loop
  animate();
})();
