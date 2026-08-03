/* ── script.js — Defined landing page ── */

/* ═══════════════════════════════════════════════
   PARTICLE NETWORK BACKGROUND
   • Dots drift slowly across the canvas
   • Lines drawn between dots within MAX_DIST px
   • Mouse repels nearby dots within REPEL_RADIUS px
   • Click sends a ripple that pushes all nearby dots
═══════════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas.getContext('2d');

  const CONFIG = {
    count:       90,
    maxDist:     145,
    repelRadius: 130,
    repelForce:  1.2,
    speed:       0.35,
    dotRadius:   1.6,
    dotOpacity:  0.45,
    lineOpacity: 0.18,   // max line alpha
    color:       '34, 197, 94',   // green accent
    clickBurst:  200,             // click ripple radius
    clickForce:  3.5,
  };

  let mouse = { x: -9999, y: -9999 };
  let particles = [];

  /* ── Resize ── */
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  /* ── Particle class ── */
  class Particle {
    constructor() { this.init(); }

    init() {
      this.x  = Math.random() * canvas.width;
      this.y  = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * CONFIG.speed;
      this.vy = (Math.random() - 0.5) * CONFIG.speed;
    }

    update() {
      const dx   = this.x - mouse.x;
      const dy   = this.y - mouse.y;
      const dist = Math.hypot(dx, dy);

      /* Repel from mouse */
      if (dist < CONFIG.repelRadius && dist > 0) {
        const force = ((CONFIG.repelRadius - dist) / CONFIG.repelRadius) * CONFIG.repelForce;
        this.vx += (dx / dist) * force * 0.06;
        this.vy += (dy / dist) * force * 0.06;
      }

      /* Dampen velocity */
      this.vx *= 0.97;
      this.vy *= 0.97;

      /* Clamp speed */
      const spd = Math.hypot(this.vx, this.vy);
      const max = CONFIG.speed * 3;
      if (spd > max) {
        this.vx = (this.vx / spd) * max;
        this.vy = (this.vy / spd) * max;
      }

      this.x += this.vx;
      this.y += this.vy;

      /* Wrap around edges */
      if (this.x < -10)                this.x = canvas.width  + 10;
      if (this.x > canvas.width  + 10) this.x = -10;
      if (this.y < -10)                this.y = canvas.height + 10;
      if (this.y > canvas.height + 10) this.y = -10;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, CONFIG.dotRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${CONFIG.color}, ${CONFIG.dotOpacity})`;
      ctx.fill();
    }

    /* Burst on click */
    burst(cx, cy) {
      const dx   = this.x - cx;
      const dy   = this.y - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < CONFIG.clickBurst && dist > 0) {
        const force = ((CONFIG.clickBurst - dist) / CONFIG.clickBurst) * CONFIG.clickForce;
        this.vx += (dx / dist) * force;
        this.vy += (dy / dist) * force;
      }
    }
  }

  /* ── Draw connection lines ── */
  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);

        if (dist < CONFIG.maxDist) {
          const alpha = (1 - dist / CONFIG.maxDist) * CONFIG.lineOpacity;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${CONFIG.color}, ${alpha})`;
          ctx.lineWidth   = 1;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  /* ── Draw mouse connection lines (brighter) ── */
  function drawMouseLines() {
    particles.forEach(p => {
      const dx   = p.x - mouse.x;
      const dy   = p.y - mouse.y;
      const dist = Math.hypot(dx, dy);

      if (dist < CONFIG.repelRadius * 1.4) {
        const alpha = (1 - dist / (CONFIG.repelRadius * 1.4)) * 0.28;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${CONFIG.color}, ${alpha})`;
        ctx.lineWidth   = 1;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    });
  }

  /* ── Init ── */
  function init() {
    resize();
    particles = Array.from({ length: CONFIG.count }, () => new Particle());
  }

  /* ── Animate loop ── */
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLines();
    drawMouseLines();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }

  /* ── Events ── */
  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  window.addEventListener('click', e => {
    particles.forEach(p => p.burst(e.clientX, e.clientY));
  });

  window.addEventListener('resize', () => {
    resize();
  });

  init();
  animate();
})();


/* ═══════════════════════════════════════════════
   NAVBAR — scroll state
═══════════════════════════════════════════════ */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });


/* ═══════════════════════════════════════════════
   HAMBURGER / MOBILE MENU
═══════════════════════════════════════════════ */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});


/* ═══════════════════════════════════════════════
   ACTION TABS
═══════════════════════════════════════════════ */
const tabs   = document.querySelectorAll('.atab');
const panels = document.querySelectorAll('.action-panel');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const panel = document.getElementById('tab-' + tab.dataset.tab);
    if (panel) panel.classList.add('active');
  });
});


/* ═══════════════════════════════════════════════
   SCROLL-REVEAL
═══════════════════════════════════════════════ */
const revealSelectors = [
  '.what-section .section-label',
  '.what-section .section-title',
  '.what-section .section-desc',
  '.pillar',
  '.features-section .section-label',
  '.features-section .section-title',
  '.feature-card',
  '.actions-section .section-label',
  '.actions-section .section-title',
  '.actions-section .section-desc',
  '.action-tabs-wrap',
  '.utilities-section .section-label',
  '.utilities-section .section-title',
  '.util-card',
  '.setup-section .section-label',
  '.setup-section .section-title',
  '.step',
  '.cta-section .section-label',
  '.cta-title',
  '.cta-desc',
  '.cta-btns',
];

const revealEls = revealSelectors.flatMap(sel =>
  Array.from(document.querySelectorAll(sel))
);

revealEls.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => observer.observe(el));

/* Stagger grid items */
document.querySelectorAll('.pillar').forEach((el, i) => {
  el.style.transitionDelay = `${i * 75}ms`;
});
document.querySelectorAll('.feature-card').forEach((el, i) => {
  el.style.transitionDelay = `${i * 70}ms`;
});
document.querySelectorAll('.util-card').forEach((el, i) => {
  el.style.transitionDelay = `${i * 80}ms`;
});
document.querySelectorAll('.step').forEach((el, i) => {
  el.style.transitionDelay = `${i * 100}ms`;
});


/* ═══════════════════════════════════════════════
   SMOOTH SCROLL for anchor links
═══════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
