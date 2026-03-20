(function () {
  // --- Setup Canvas untuk efek partikel ---
  const canvas = document.getElementById("fireworks-canvas");
  let ctx = canvas.getContext("2d");
  let width = window.innerWidth;
  let height = window.innerHeight;

  // Resize canvas
  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }
  window.addEventListener("resize", () => {
    resizeCanvas();
  });
  resizeCanvas();

  // Array partikel
  let particles = [];

  // Kelas Partikel
  class Particle {
    constructor(x, y, color, size = 4) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 7;
      this.vy = (Math.random() - 0.5) * 7 - 1.5;
      this.gravity = 0.2;
      this.alpha = 1.0;
      this.fade = 0.018 + Math.random() * 0.02;
      this.color = color;
      this.size = size * (0.6 + Math.random() * 0.8);
    }

    update() {
      this.vx *= 0.99;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.fade;
      this.size *= 0.99;
      return this.alpha > 0.01 && this.size > 0.2;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.shadowBlur = 6;
      ctx.shadowColor = this.color === "#FFD966" ? "#FFD700" : "#FFF5E0";
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
    }
  }

  // Fungsi membuat ledakan partikel
  function createFirework(x, y) {
    const colors = [
      "#F7D44A",
      "#E5B83C",
      "#FFE484",
      "#FFF2C9",
      "#FFFFFF",
      "#FFECB3",
      "#FFD966",
    ];
    const particleCount = 42 + Math.floor(Math.random() * 30);

    for (let i = 0; i < particleCount; i++) {
      const finalColor = colors[Math.floor(Math.random() * colors.length)];
      const sizeBase = 3 + Math.random() * 4;
      const particle = new Particle(x, y, finalColor, sizeBase);
      particle.vx += (Math.random() - 0.5) * 2.2;
      particle.vy += (Math.random() - 1) * 3.5;
      particles.push(particle);
    }

    // Efek percikan ekstra
    for (let i = 0; i < 10; i++) {
      let spark = new Particle(x, y, "#FFEA9E", 2.5);
      spark.vx = (Math.random() - 0.5) * 9;
      spark.vy = (Math.random() - 0.8) * 7;
      spark.gravity = 0.18;
      particles.push(spark);
    }
  }

  // Animasi loop partikel
  let animationId = null;
  function animateParticles() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    let keepAnim = false;
    for (let i = 0; i < particles.length; i++) {
      const alive = particles[i].update();
      if (alive) {
        particles[i].draw(ctx);
        keepAnim = true;
      } else {
        particles.splice(i, 1);
        i--;
      }
    }
    if (keepAnim) {
      animationId = requestAnimationFrame(animateParticles);
    } else {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      ctx.clearRect(0, 0, width, height);
    }
  }

  // Trigger ledakan di titik klik
  function triggerFireworkAt(e) {
    let clientX, clientY;
    if (e.touches) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      e.preventDefault();
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    if (clientX && clientY) {
      createFirework(clientX, clientY);
      if (!animationId) {
        animateParticles();
      } else {
        if (animationId) cancelAnimationFrame(animationId);
        animationId = requestAnimationFrame(animateParticles);
      }
    }
  }

  // Event listeners untuk klik dan touch
  document.body.addEventListener("click", triggerFireworkAt);
  document.body.addEventListener("touchstart", triggerFireworkAt, {
    passive: false,
  });

  // ---- Efek Parallax halus ----
  const parallaxElement = document.getElementById("parallaxBg");
  let targetX = 0,
    targetY = 0;

  function updateParallax() {
    const moveX = (targetX / window.innerWidth) * 12 - 6;
    const moveY = (targetY / window.innerHeight) * 8 - 4;
    parallaxElement.style.transform = `translate(${moveX * 0.5}px, ${moveY * 0.5}px) scale(1.02)`;
  }

  window.addEventListener("mousemove", (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    updateParallax();
  });

  // Device orientation untuk mobile
  if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", function (event) {
      let gamma = event.gamma;
      let beta = event.beta;
      if (gamma !== null && beta !== null) {
        let normX = (gamma / 45) * 10;
        let normY = (beta / 45) * 8;
        if (normX > 15) normX = 15;
        if (normY > 12) normY = 12;
        parallaxElement.style.transform = `translate(${normX * 0.6}px, ${normY * 0.4}px) scale(1.02)`;
      }
    });
  }

  // Efek kembang api selamat datang saat load
  setTimeout(() => {
    const centerX = width / 2;
    const centerY = height / 2.5;
    createFirework(centerX, centerY);
    if (!animationId) animateParticles();
    setTimeout(() => {
      if (width && height) {
        createFirework(centerX + 40, centerY - 20);
        if (!animationId) animateParticles();
      }
    }, 300);
  }, 300);

  // Resize handler untuk menjaga canvas
  window.addEventListener("resize", () => {
    setTimeout(() => {
      resizeCanvas();
    }, 100);
  });
})();
