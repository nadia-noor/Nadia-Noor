/**
 * NADIA NOOR PORTFOLIO — main.js
 * Modules:
 *  1. Particles Background
 *  2. Header Scroll Behaviour
 *  3. Hamburger / Mobile Menu
 *  4. Active Nav Link on Scroll
 *  5. Typing Animation
 *  6. Scroll Reveal (IntersectionObserver)
 *  7. Skill Bar Animations
 *  8. Back-to-Top Button
 *  9. Contact Form
 * 10. Smooth Scroll (CSS fallback polyfill)
 */

'use strict';

/* ============================================================
   UTILITY HELPERS
   ============================================================ */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================================
   1. PARTICLES BACKGROUND
   ============================================================ */
(function initParticles() {
  const canvas = qs('#particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [], animId;

  /* Respect prefers-reduced-motion */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    canvas.style.display = 'none';
    return;
  }

  /* Config */
  const CFG = {
    count:       55,
    minRadius:   1,
    maxRadius:   2.2,
    minSpeed:    0.12,
    maxSpeed:    0.45,
    color:       '232, 121, 249',  /* RGB of #E879F9 */
    lineColor:   '232, 121, 249',
    connectDist: 140,
    opacity:     0.55,
  };

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(true); }

    reset(init = false) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : -10;
      this.r  = CFG.minRadius + Math.random() * (CFG.maxRadius - CFG.minRadius);
      const spd = CFG.minSpeed + Math.random() * (CFG.maxSpeed - CFG.minSpeed);
      const ang = Math.random() * Math.PI * 2;
      this.vx = Math.cos(ang) * spd;
      this.vy = Math.sin(ang) * spd;
      this.alpha = 0.2 + Math.random() * 0.6;
      this.pulse = Math.random() * Math.PI * 2; /* phase offset */
    }

    update(t) {
      this.x += this.vx;
      this.y += this.vy;
      this.pulse += 0.018;
      /* pulsing opacity */
      this.currentAlpha = this.alpha * (0.7 + 0.3 * Math.sin(this.pulse));
      /* wrap */
      if (this.x < -5) this.x = W + 5;
      if (this.x > W + 5) this.x = -5;
      if (this.y < -5) this.y = H + 5;
      if (this.y > H + 5) this.y = -5;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${CFG.color}, ${this.currentAlpha * CFG.opacity})`;
      ctx.fill();
    }
  }

  function buildParticles() {
    particles = Array.from({ length: CFG.count }, () => new Particle());
  }

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CFG.connectDist) {
          const lineAlpha = (1 - dist / CFG.connectDist) * 0.18 * CFG.opacity;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${CFG.lineColor}, ${lineAlpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  function loop(t) {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(t); p.draw(); });
    drawLines();
    animId = requestAnimationFrame(loop);
  }

  function init() {
    resize();
    buildParticles();
    loop(0);
  }

  window.addEventListener('resize', () => {
    resize();
    buildParticles();
  });

  init();
})();

/* ============================================================
   2. HEADER SCROLL BEHAVIOUR
   ============================================================ */
(function initHeader() {
  const header = qs('#header');
  if (!header) return;

  let lastY = 0;

  function onScroll() {
    const y = window.scrollY;
    /* Add scrolled class after 50px */
    header.classList.toggle('scrolled', y > 50);
    lastY = y;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); /* run once on load */
})();

/* ============================================================
   3. HAMBURGER / MOBILE MENU
   ============================================================ */
(function initMobileMenu() {
  const toggle  = qs('#nav-toggle');
  const menu    = qs('#nav-menu');
  const links   = qsa('.nav__mobile-link, .nav__mobile-hire');
  if (!toggle || !menu) return;

  function openMenu() {
    menu.classList.add('open');
    toggle.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menu.classList.remove('open');
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  /* Close when a link is clicked */
  links.forEach(link => link.addEventListener('click', closeMenu));

  /* Close on Escape */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) closeMenu();
  });

  /* Close on outside click */
  document.addEventListener('click', e => {
    if (
      menu.classList.contains('open') &&
      !menu.contains(e.target) &&
      !toggle.contains(e.target)
    ) closeMenu();
  });
})();

/* ============================================================
   4. ACTIVE NAV LINK ON SCROLL
   ============================================================ */
(function initActiveNav() {
  const sections  = qsa('section[id]');
  const navLinks  = qsa('.nav__link');
  if (!sections.length || !navLinks.length) return;

  const OFFSET = 120; /* px from top to trigger */

  function update() {
    const y = window.scrollY + OFFSET;

    let current = sections[0].id;
    sections.forEach(sec => {
      if (sec.offsetTop <= y) current = sec.id;
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      link.classList.toggle('active', href === current);
      if (href === current) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ============================================================
   5. TYPING ANIMATION
   ============================================================ */
(function initTyping() {
  const el = qs('#typed-text');
  if (!el) return;

  const words = [
    'MERN Stack Developer',
    'React.js Developer',
    'Full-Stack Engineer',
    'Node.js Developer',
    'UI/UX Enthusiast',
  ];

  let wordIdx  = 0;
  let charIdx  = 0;
  let deleting = false;
  let paused   = false;

  const TYPE_SPEED   = 70;
  const DELETE_SPEED = 35;
  const PAUSE_AFTER  = 2200;
  const PAUSE_BEFORE = 400;

  function type() {
    if (paused) return;

    const word = words[wordIdx];

    if (!deleting) {
      /* Typing forward */
      charIdx++;
      el.textContent = word.slice(0, charIdx);

      if (charIdx === word.length) {
        /* Finished typing — pause then delete */
        paused = true;
        setTimeout(() => { deleting = true; paused = false; tick(); }, PAUSE_AFTER);
        return;
      }
    } else {
      /* Deleting */
      charIdx--;
      el.textContent = word.slice(0, charIdx);

      if (charIdx === 0) {
        /* Finished deleting — move to next word */
        deleting = false;
        wordIdx  = (wordIdx + 1) % words.length;
        paused   = true;
        setTimeout(() => { paused = false; tick(); }, PAUSE_BEFORE);
        return;
      }
    }

    tick();
  }

  function tick() {
    const delay = deleting ? DELETE_SPEED : TYPE_SPEED;
    setTimeout(type, delay);
  }

  /* Small initial delay so page renders first */
  setTimeout(tick, 800);
})();

/* ============================================================
   6. SCROLL REVEAL  (IntersectionObserver)
   ============================================================ */
(function initScrollReveal() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* If motion is reduced, make everything visible immediately */
  if (prefersReduced) {
    qsa('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
      el.classList.add('visible');
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); /* fire once */
        }
      });
    },
    {
      threshold:  0.12,
      rootMargin: '0px 0px -60px 0px',
    }
  );

  qsa('.reveal-up, .reveal-left, .reveal-right').forEach(el => observer.observe(el));
})();

/* ============================================================
   7. SKILL BAR ANIMATIONS
   ============================================================ */
(function initSkillBars() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fills = qsa('.skill-card__fill');
  if (!fills.length) return;

  function animateFill(fill) {
    const pct = fill.style.getPropertyValue('--pct') || '0%';
    if (prefersReduced) {
      fill.style.width = pct;
      return;
    }
    /* Animate after a short delay so the card entrance animation completes first */
    setTimeout(() => {
      fill.style.width = pct;
    }, 200);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateFill(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  fills.forEach(fill => observer.observe(fill));
})();

/* ============================================================
   8. BACK-TO-TOP BUTTON
   ============================================================ */
(function initBackToTop() {
  const btn = qs('#back-to-top');
  if (!btn) return;

  function toggle() {
    btn.classList.toggle('visible', window.scrollY > 400);
  }

  window.addEventListener('scroll', toggle, { passive: true });
  toggle();

  btn.addEventListener('click', e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ============================================================
   9. CONTACT FORM
   ============================================================ */
(function initContactForm() {
  const form     = qs('#contact-form');
  const feedback = qs('#form-feedback');
  const submitBtn = qs('#submit-btn');
  if (!form || !feedback || !submitBtn) return;

  function setFeedback(msg, type) {
    feedback.textContent = msg;
    feedback.className   = `form__feedback ${type}`;
  }

  function clearFeedback() {
    feedback.textContent = '';
    feedback.className   = 'form__feedback';
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  function validateForm(data) {
    if (!data.name.trim())         return 'Please enter your name.';
    if (!validateEmail(data.email)) return 'Please enter a valid email address.';
    if (data.message.trim().length < 10)
      return 'Message must be at least 10 characters.';
    return null;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFeedback();

    const data = {
      name:    form.elements['name'].value,
      email:   form.elements['email'].value,
      subject: form.elements['subject'] ? form.elements['subject'].value : 'Portfolio message',
      message: form.elements['message'].value,
    };

    const error = validateForm(data);
    if (error) {
      setFeedback(error, 'error');
      return;
    }

    /* Simulate sending (replace with actual fetch/EmailJS call) */
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    const btnSpan = submitBtn.querySelector('span');
    const original = btnSpan ? btnSpan.textContent : 'Send';
    if (btnSpan) btnSpan.textContent = 'Sending...';

    try {
      await new Promise(res => setTimeout(res, 1800)); /* Simulate network delay */

      setFeedback(
        "✓ Message sent! I'll get back to you within 24 hours.",
        'success'
      );
      form.reset();
    } catch (err) {
      setFeedback('Something went wrong. Please try again.', 'error');
    } finally {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      if (btnSpan) btnSpan.textContent = original;
    }
  });

  /* Clear feedback on input */
  qsa('.form__input, .form__textarea', form).forEach(input => {
    input.addEventListener('input', clearFeedback);
  });
})();

/* ============================================================
   10. SMOOTH SCROLL — polyfill for older browsers
   ============================================================ */
(function initSmoothScroll() {
  /* CSS scroll-behavior handles most browsers — this handles edge cases */
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const id = anchor.getAttribute('href');
    if (id === '#') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const target = document.querySelector(id);
    if (!target) return;

    e.preventDefault();
    const headerH = 0; /* header is not sticky anymore */
    const top = target.getBoundingClientRect().top + window.scrollY - headerH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
})();


/* ============================================================
   HERO MOTION: paragraph word reveal, load counter, card tilt + holo
   ============================================================ */
(function initHeroMotion() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* paragraph: words reveal one by one (blur -> sharp) */
  const sub = document.querySelector('.hero__sub');
  if (sub && !reduce) {
    const words = sub.textContent.trim().split(/\s+/);
    sub.innerHTML = words
      .map((w, i) => `<span class="hx-w" style="animation-delay:${(0.55 + i * 0.035).toFixed(3)}s">${w}</span>`)
      .join(' ');
  }

  /* load counter 0 -> 100 */
  const cnt = document.querySelector('.hx-count');
  if (cnt && !reduce) {
    const t0 = performance.now(), dur = 1000;
    (function step(now) {
      const p = Math.min((now - t0) / dur, 1);
      cnt.textContent = Math.round(p * 100);
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* card: 3D tilt following the pointer + holographic foil */
  const card = document.querySelector('.pcard');
  if (!card || reduce || !window.matchMedia('(hover: hover)').matches) return;
  let raf = 0;
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      card.classList.add('is-tilting');
      card.style.transform =
        `perspective(900px) rotateX(${((0.5 - py) * 16).toFixed(2)}deg) rotateY(${((px - 0.5) * 18).toFixed(2)}deg) scale(1.04)`;
      card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      card.style.setProperty('--bx', (px * 100).toFixed(1) + '%');
      card.style.setProperty('--by', (py * 100).toFixed(1) + '%');
    });
  });
  card.addEventListener('pointerleave', () => {
    cancelAnimationFrame(raf);
    card.classList.remove('is-tilting');
    card.style.transform = '';
  });
})();


/* hero background reacts when the card is hovered (glow brightens like the reference) */
(function initHeroGlowHover() {
  const hero = document.querySelector('.hero');
  const card = document.querySelector('.pcard');
  if (!hero || !card) return;
  card.addEventListener('pointerenter', () => hero.classList.add('is-hot'));
  card.addEventListener('pointerleave', () => hero.classList.remove('is-hot'));
})();


/* ============================================================
   ABOUT MOTION: scroll reveal, word-by-word paragraph, draggable lanyard badge
   ============================================================ */
(function initAboutMotion() {
  const panel = document.querySelector('.ab-panel');
  if (!panel) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reduce) {
    /* paragraph: each word blurs in, one after another (continues across paragraphs) */
    let n = 0;
    panel.querySelectorAll('p').forEach(p => {
      const words = p.textContent.trim().split(/\s+/);
      p.innerHTML = words
        .map(w => `<span class="ab-w" style="--wd:${(0.45 + (n++) * 0.05).toFixed(2)}s">${w}</span>`)
        .join(' ');
    });
    panel.classList.add('ab-ready');
    const io = new IntersectionObserver((entries, ob) => {
      if (entries[0].isIntersecting) { panel.classList.add('is-in'); ob.disconnect(); }
    }, { threshold: 0.15 });
    io.observe(panel);
  }

  /* lanyard: mouse near the badge pulls it (no click needed); click-and-hold drags it fully;
     when the mouse stops or leaves, it swings back like a pendulum */
  const lan = document.getElementById('lanyard');
  if (!lan) return;
  let th = 0, w = 0, dragging = false, raf = 0, last = 0, vel = 0, lastT = 0;
  let hoverOn = false, hoverA = 0, lastMove = 0;
  const W0 = 4.5, Z = 0.5, KP = 40;     /* swing speed, damping, how strongly the mouse pulls */
  const canHover = window.matchMedia('(hover: hover)').matches;
  const set = () => { lan.style.transform = `rotate(${th}rad)`; };
  const pivot = () => {
    const r = lan.parentElement.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top };
  };
  const angleTo = (e) => {
    const p = pivot();
    const a = Math.atan2(-(e.clientX - p.x), e.clientY - p.y);
    return Math.max(-1.2, Math.min(1.2, a));
  };
  function loop(t) {
    const dt = Math.min((t - last) / 1000, 0.033); last = t;
    /* pull is strongest while the mouse is moving, fades out ~0.3s after it stops */
    const act = hoverOn ? Math.max(0, 1 - (t - lastMove) / 300) : 0;
    const target = Math.max(-0.9, Math.min(0.9, hoverA * 1.4));
    const a = -W0 * W0 * Math.sin(th) - 2 * Z * W0 * w + KP * act * (target - th);
    w += a * dt; th += w * dt; set();
    if (Math.abs(th) < 0.0008 && Math.abs(w) < 0.01 && act === 0) { th = 0; w = 0; set(); raf = 0; return; }
    raf = requestAnimationFrame(loop);
  }
  const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } };

  /* hover: mouse moving near the badge */
  if (canHover) {
    document.addEventListener('pointermove', (e) => {
      if (dragging) return;
      const r = lan.parentElement.getBoundingClientRect();
      const near = e.clientX > r.left - 70 && e.clientX < r.right + 70 &&
                   e.clientY > r.top - 20 && e.clientY < r.bottom + 50;
      hoverOn = near;
      if (near) { hoverA = angleTo(e); lastMove = performance.now(); kick(); }
    }, { passive: true });
  }

  /* click / touch and hold: full drag */
  function move(e) {
    const a = angleTo(e);
    const now = performance.now(), dt = Math.max((now - lastT) / 1000, 0.001);
    vel = vel * 0.6 + ((a - th) / dt) * 0.4; lastT = now;
    th = a; set();
  }
  lan.addEventListener('pointerdown', (e) => {
    dragging = true; cancelAnimationFrame(raf); raf = 0;
    lan.setPointerCapture(e.pointerId); lan.classList.add('is-drag');
    vel = 0; lastT = performance.now(); move(e);
  });
  lan.addEventListener('pointermove', (e) => { if (dragging) move(e); });
  const release = () => {
    if (!dragging) return;
    dragging = false; lan.classList.remove('is-drag');
    w = Math.max(-8, Math.min(8, vel));
    hoverOn = false; kick();
  };
  lan.addEventListener('pointerup', release);
  lan.addEventListener('pointercancel', release);
})();

/* ============================================================
   MENU CLICK SOUND (Web Audio API — no audio file needed)
   ============================================================ */
(function initMenuClickSound() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;

  let audioCtx = null;

  function playClick(freq = 880) {
    try {
      /* Create lazily — browsers allow audio only after a user gesture */
      if (!audioCtx) audioCtx = new AudioCtx();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const now  = audioCtx.currentTime;
      const osc  = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      /* Short, soft "pop": quick pitch drop + fast fade-out */
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.55, now + 0.09);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.13);
    } catch (_) { /* sound is optional — never break the site */ }
  }

  /* Desktop links, mobile links, logo */
  document.querySelectorAll('.nav__link, .nav__mobile-link, .nav__logo').forEach(el =>
    el.addEventListener('click', () => playClick(880))
  );

  /* Hamburger button — slightly lower tone */
  const toggle = document.querySelector('#nav-toggle');
  if (toggle) toggle.addEventListener('click', () => playClick(660));
})();

/* ============================================================
   CUSTOM CURSOR (dot + ring) — desktop mouse only
   ============================================================ */
(function initCustomCursor() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const dot  = document.createElement('div'); dot.className  = 'cur-dot';
  const ring = document.createElement('div'); ring.className = 'cur-ring';
  document.body.append(dot, ring);

  let mx = 0, my = 0, rx = 0, ry = 0;

  window.addEventListener('pointermove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px)`;
    document.body.classList.add('cur-on');
  });
  document.addEventListener('mouseleave', () => document.body.classList.remove('cur-on'));

  (function loop() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(loop);
  })();

  document.addEventListener('pointerover', e => {
    ring.classList.toggle('is-link', !!e.target.closest('a, button, .sk-item'));
    /* project cards: hide the custom dot/ring, show the normal cursor */
    document.body.classList.toggle('cur-hide', !!e.target.closest('.project-card'));
  });
})();

/* ============================================================
   PROJECT CARDS — 3D tilt on hover
   ============================================================ */
(function initProjectTilt() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width  - 0.5;
      const py = (e.clientY - r.top)  / r.height - 0.5;
      card.style.setProperty('--gx', ((px + 0.5) * 100).toFixed(1) + '%');
      card.style.setProperty('--ry', (px * 8).toFixed(2) + 'deg');
      card.style.setProperty('--rx', (-py * 8).toFixed(2) + 'deg');
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
})();

/* ============================================================
   CLICK BURST — particles scatter where you click (any section)
   ============================================================ */
(function initClickBurst() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!Element.prototype.animate) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const COLORS = ['#E879F9', '#f0abfc', '#c084fc', '#818cf8', '#f472b6', '#ffffff'];

  function burst(x, y) {
    /* expanding ring */
    const ring = document.createElement('div');
    ring.className = 'cb-ring';
    document.body.appendChild(ring);
    ring.animate(
      [
        { transform: `translate(${x}px, ${y}px) scale(1)`,  opacity: 1 },
        { transform: `translate(${x}px, ${y}px) scale(6)`,  opacity: 0 }
      ],
      { duration: 650, easing: 'cubic-bezier(.2,.7,.2,1)' }
    ).onfinish = () => ring.remove();

    /* scattering particles */
    const count = 16;
    for (let i = 0; i < count; i++) {
      const p     = document.createElement('div');
      const size  = 4 + Math.random() * 7;
      const color = COLORS[(Math.random() * COLORS.length) | 0];
      const ang   = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
      const dist  = 40 + Math.random() * 70;
      const dx    = Math.cos(ang) * dist;
      const dy    = Math.sin(ang) * dist;

      p.className = 'cb-p';
      p.style.width  = size + 'px';
      p.style.height = size + 'px';
      p.style.margin = (-size / 2) + 'px 0 0 ' + (-size / 2) + 'px';
      p.style.background = color;
      p.style.boxShadow  = `0 0 ${size * 2}px ${color}`;
      document.body.appendChild(p);

      p.animate(
        [
          { transform: `translate(${x}px, ${y}px) scale(1)`, opacity: 1 },
          { transform: `translate(${x + dx}px, ${y + dy + 22}px) scale(0)`, opacity: 0 }
        ],
        { duration: 600 + Math.random() * 400, easing: 'cubic-bezier(.15,.8,.3,1)' }
      ).onfinish = () => p.remove();
    }
  }

  document.addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch') return;                /* ignore touch / mobile scroll */
    if (e.button !== undefined && e.button > 0) return;   /* left click only */
    burst(e.clientX, e.clientY);
  });
})();


/* ============================================================
   DARK / LIGHT THEME TOGGLE (remembers choice)
   ============================================================ */
(function initThemeToggle() {
  const btn  = document.getElementById('theme-toggle');
  if (!btn) return;
  const root = document.documentElement;

  function current() { return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark'; }

  function apply(theme, save) {
    root.setAttribute('data-theme', theme);
    btn.setAttribute('aria-label', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
    const canvas = document.getElementById('particles-canvas');
    if (canvas) canvas.style.opacity = theme === 'light' ? '0.45' : '';
    if (save) { try { localStorage.setItem('theme', theme); } catch (_) {} }
  }

  apply(current(), false);

  btn.addEventListener('click', () => {
    root.classList.add('theme-anim');
    apply(current() === 'light' ? 'dark' : 'light', true);
    setTimeout(() => root.classList.remove('theme-anim'), 450);
  });
})();

/* ============================================================
   CHAT ROOM — UI placeholder (hook up Firebase / Google Auth here)
   ============================================================ */
(function initChatLogin() {
  const btn  = document.getElementById('chat-login');
  const hint = document.getElementById('chat-hint');
  if (!btn || !hint) return;
  btn.addEventListener('click', () => {
    /* TODO: replace with real Google sign-in (e.g. Firebase signInWithPopup) */
    hint.textContent = 'Chat is coming soon';
    hint.classList.add('is-note');
  });
})();

/* ============================================================
   SKILLS — cards: staggered entrance on scroll + mouse spotlight
   ============================================================ */
(function initSkillCards() {
  const grid = document.getElementById('sv-grid');
  if (!grid) return;
  const cards = [...grid.querySelectorAll('.sv-card')];

  /* mouse-follow spotlight */
  cards.forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* entrance animation when the grid scrolls into view */
  if (!('IntersectionObserver' in window)) { grid.classList.add('in'); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { grid.classList.add('in'); io.disconnect(); }
    });
  }, { threshold: 0.15 });
  io.observe(grid);
})();


/* ============================================================
   SCROLL ANIMATIONS — footer trigger
   (Skills, Projects and Contact reuse the existing observers;
   only the footer needs its own "in view" switch.)
   ============================================================ */
(function initFooterAnimation() {
  const foot = document.querySelector('.cfoot');
  if (!foot) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)) { foot.classList.add('in-view'); return; }
  document.documentElement.classList.add('fx-on');
  const io = new IntersectionObserver((entries, ob) => {
    entries.forEach(en => {
      if (en.isIntersecting) { foot.classList.add('in-view'); ob.disconnect(); }
    });
  }, { threshold: 0.2 });
  io.observe(foot);
})();


/* ============================================================
   INTRO / HELLO SCREEN controller
   ============================================================ */
(function initIntro() {
  const root  = document.documentElement;
  const intro = document.getElementById('intro');
  if (!intro) return;
  if (!root.classList.contains('intro-on')) { intro.remove(); return; }

  const SHOW = 2200;   /* ms before the screen starts to open (typing ends ≈1.2s, cursor blinks after) */
  let closing = false;
  const timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  function close() {
    if (closing) return; closing = true;
    timers.forEach(clearTimeout);
    intro.classList.add('intro--out');
    later(() => root.classList.remove('intro-on'), 900);              /* hero starts as the halves slide away */
    later(() => { root.classList.remove('intro-on'); intro.remove(); }, 1700);
  }

  intro.addEventListener('click', close);   /* click anywhere to skip */
  later(close, SHOW);
})();


/* ============================================================
   3D CYLINDRICAL CAROUSEL (FEATURED PROJECTS) CONTROLLER
   Motion Study 3D Curved Ribbon with Inertia & Spotlight
   ============================================================ */
(function init3DCylinder() {
  const stage     = document.getElementById('cylinder-stage');
  const viewport  = document.getElementById('cylinder-viewport');
  const ring      = document.getElementById('cylinder-ring');
  if (!stage || !viewport || !ring) return;

  const cards     = Array.from(ring.querySelectorAll('.cylinder-card'));
  const prevBtn   = document.getElementById('cyl-prev');
  const nextBtn   = document.getElementById('cyl-next');
  const thumb     = document.getElementById('cyl-thumb');
  const spotTag   = document.getElementById('spot-tag');
  const spotTitle = document.getElementById('spot-title');
  const spotDesc  = document.getElementById('spot-desc');
  const spotTech  = document.getElementById('spot-tech');
  const spotLive  = document.getElementById('spot-live');
  const spotGit   = document.getElementById('spot-github');

  const btn3D     = document.getElementById('btn-view-3d');
  const btnGrid   = document.getElementById('btn-view-grid');
  const gridView  = document.getElementById('portfolio-grid');

  const PROJECTS_DATA = [
    {
      tag: "01 // STORE ARCHITECTURE",
      title: "E-Commerce Platform",
      desc: "Full-stack shopping app with product catalog, cart, secure checkout, and admin dashboard. Features JWT auth and real-time order tracking.",
      tech: ["React", "Node.js", "MongoDB", "Express"],
      live: "#",
      github: "#"
    },
    {
      tag: "02 // COLLABORATIVE FLOW",
      title: "Task Manager App",
      desc: "Collaborative project management tool with real-time updates, drag-and-drop boards, user roles, and deadline notifications.",
      tech: ["React", "Express", "MongoDB", "REST API"],
      live: "#",
      github: "#"
    },
    {
      tag: "03 // CONTENT ENGINE",
      title: "Blog Platform",
      desc: "Full-featured blogging platform with rich text editing, categories, commenting system, and JWT-based author authentication.",
      tech: ["React", "Node.js", "MongoDB", "JWT"],
      live: "#",
      github: "#"
    },
    {
      tag: "04 // DATA VISUALIZATION",
      title: "Dashboard Analytics",
      desc: "Admin analytics dashboard with real-time charts, user management, data filtering, and MongoDB aggregation pipelines.",
      tech: ["React", "MongoDB", "Express", "Charts"],
      live: "#",
      github: "#"
    },
    {
      tag: "05 // REAL-TIME NETWORK",
      title: "Real-Time Chat App",
      desc: "Real-time messaging with private and group chats, online status indicators, and message history stored in MongoDB.",
      tech: ["Socket.io", "Node.js", "React", "MongoDB"],
      live: "#",
      github: "#"
    },
    {
      tag: "06 // CAREER PLATFORM",
      title: "Job Board App",
      desc: "Job listing platform where employers post opportunities and candidates apply, with filtering, search, and profile management.",
      tech: ["React", "Express", "MongoDB", "REST API"],
      live: "#",
      github: "#"
    }
  ];

  const TOTAL_CARDS = cards.length || 12;
  const STEP_ANGLE  = 360 / TOTAL_CARDS;

  let currentRotY   = 0;
  let targetRotY    = 0;
  let autoSpeed     = 0.12;
  let isDragging    = false;
  let isHovered     = false;
  let startX        = 0;
  let lastX         = 0;
  let dragVelocity  = 0;
  let activeProjIdx = -1;
  let animId        = null;

  /* View switch toggle */
  if (btn3D && btnGrid && gridView) {
    btn3D.addEventListener('click', () => {
      btn3D.classList.add('is-active');
      btn3D.setAttribute('aria-pressed', 'true');
      btnGrid.classList.remove('is-active');
      btnGrid.setAttribute('aria-pressed', 'false');
      stage.style.display = 'block';
      gridView.style.display = 'none';
      targetRotY += 15; /* subtle spin on view activate */
    });

    btnGrid.addEventListener('click', () => {
      btnGrid.classList.add('is-active');
      btnGrid.setAttribute('aria-pressed', 'true');
      btn3D.classList.remove('is-active');
      btn3D.setAttribute('aria-pressed', 'false');
      stage.style.display = 'none';
      gridView.style.display = 'grid';
    });
  }

  /* Pointer Drag Events (mouse + touch with inertia) */
  viewport.addEventListener('pointerdown', e => {
    isDragging   = true;
    startX       = e.clientX;
    lastX        = e.clientX;
    dragVelocity = 0;
    try { viewport.setPointerCapture(e.pointerId); } catch(_) {}
  });

  viewport.addEventListener('pointermove', e => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastX;
    lastX = e.clientX;
    targetRotY += deltaX * 0.36;
    dragVelocity = deltaX * 0.36;
  });

  function endDrag(e) {
    if (!isDragging) return;
    isDragging = false;
    try { viewport.releasePointerCapture(e.pointerId); } catch(_) {}
  }

  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);

  /* Hover pause / slow */
  stage.addEventListener('mouseenter', () => { isHovered = true; });
  stage.addEventListener('mouseleave', () => { isHovered = false; });

  /* Mouse Wheel / Trackpad Scroll interaction */
  viewport.addEventListener('wheel', e => {
    const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
    if (Math.abs(delta) > 3) {
      e.preventDefault();
      targetRotY -= delta * 0.16;
      dragVelocity = -delta * 0.08;
    }
  }, { passive: false });

  /* Arrow Buttons */
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      targetRotY += STEP_ANGLE;
      dragVelocity = 0;
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      targetRotY -= STEP_ANGLE;
      dragVelocity = 0;
    });
  }

  /* Card Click to Center */
  cards.forEach((card, idx) => {
    card.addEventListener('click', () => {
      /* base angle of card idx is idx * STEP_ANGLE */
      const baseAngle = idx * STEP_ANGLE;
      /* we want (baseAngle + targetRotY) % 360 == 0 */
      let diff = (-baseAngle - targetRotY) % 360;
      if (diff > 180)  diff -= 360;
      if (diff < -180) diff += 360;
      targetRotY += diff;
      dragVelocity = 0;
    });
  });

  /* Update Spotlight Content */
  function updateSpotlight(projIdx) {
    if (projIdx === activeProjIdx) return;
    activeProjIdx = projIdx;
    const data = PROJECTS_DATA[projIdx % PROJECTS_DATA.length];
    if (!data) return;

    if (spotTag)   spotTag.textContent   = data.tag;
    if (spotTitle) spotTitle.textContent = data.title;
    if (spotDesc)  spotDesc.textContent  = data.desc;
    if (spotLive)  spotLive.href         = data.live;
    if (spotGit)   spotGit.href          = data.github;

    if (spotTech) {
      spotTech.innerHTML = data.tech.map(t => `<li>${t}</li>`).join('');
    }
  }

  /* Main Animation Loop */
  function tick() {
    /* Apply inertia velocity or auto-rotation */
    if (isDragging) {
      /* manually driven by pointer */
    } else if (Math.abs(dragVelocity) > 0.04) {
      targetRotY += dragVelocity;
      dragVelocity *= 0.94;
    } else if (!isHovered) {
      targetRotY -= autoSpeed;
    }

    /* Lerp current towards target */
    currentRotY += (targetRotY - currentRotY) * 0.1;

    /* Update CSS transform on the ring */
    ring.style.transform = `rotateX(var(--cyl-tilt)) rotateY(${currentRotY}deg)`;

    /* Scrubber thumb position (wraps 0 to 100%) */
    if (thumb) {
      const normalizedAngle = ((-currentRotY % 360) + 360) % 360;
      const progress = (normalizedAngle / 360) * 300;
      thumb.style.transform = `translateX(${progress}%)`;
    }

    /* Depth shading & active card calculation */
    let minDiff = Infinity;
    let closestCardIdx = 0;

    cards.forEach((card, i) => {
      const baseAngle = i * STEP_ANGLE;
      /* Current screen-facing angle */
      let screenAngle = (baseAngle + currentRotY) % 360;
      if (screenAngle > 180)  screenAngle -= 360;
      if (screenAngle < -180) screenAngle += 360;

      const absAngle = Math.abs(screenAngle);
      if (absAngle < minDiff) {
        minDiff = absAngle;
        closestCardIdx = i;
      }

      /* Depth calculations: 0deg = front, 180deg = rear */
      const depthRatio = 1 - (absAngle / 180); /* 1 at front, 0 at back */
      const brightness = 0.35 + (depthRatio * 0.65);
      const opacity    = 0.42 + (depthRatio * 0.58);

      card.style.filter  = `brightness(${brightness.toFixed(3)})`;
      card.style.opacity = opacity.toFixed(3);

      if (absAngle < 16) {
        card.classList.add('is-active');
      } else {
        card.classList.remove('is-active');
      }
    });

    /* Sync active card's project to spotlight */
    const activeCard = cards[closestCardIdx];
    if (activeCard && activeCard.dataset.project !== undefined) {
      const pIdx = parseInt(activeCard.dataset.project, 10);
      updateSpotlight(pIdx);
    }

    animId = requestAnimationFrame(tick);
  }

  /* Start loop */
  tick();
})();

