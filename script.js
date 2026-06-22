/* ═══════════════════════════════════════════════
   RAIHAN MUZAFFAR — PORTFOLIO SCRIPT
   Vanilla JS · No dependencies
═══════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── State ────────────────────────────────────
  const state = {
    theme: 'dark',
    mobileOpen: false,
    scrollY: 0,
    rafId: null,
  };

  // ─── DOM refs ─────────────────────────────────
  const nav = document.getElementById('nav');
  const themeToggle = document.getElementById('themeToggle');
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  const navItems = document.querySelectorAll('.nav__item');
  const mobileLinks = document.querySelectorAll('.nav__mobile-link');
  const heroCard = document.getElementById('heroCard');
  const heroCanvas = document.getElementById('heroCanvas');
  const marqueeTrack = document.getElementById('marqueeTrack');

  // ─── Utility ──────────────────────────────────
  const qs = (s, root = document) => root.querySelector(s);
  const qsa = (s, root = document) => [...root.querySelectorAll(s)];
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const mapRange = (v, in0, in1, out0, out1) =>
    out0 + ((v - in0) / (in1 - in0)) * (out1 - out0);


  /* ═══════════════════════════════════════════════
     HERO CANVAS — PARTICLES
  ═══════════════════════════════════════════════ */
  function initCanvas() {
    const canvas = heroCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    function createParticles() {
      const count = Math.floor((W * H) / 14000);
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          size: Math.random() * 1.2 + 0.3,
          speedX: (Math.random() - 0.5) * 0.2,
          speedY: (Math.random() - 0.5) * 0.2,
          opacity: Math.random() * 0.4 + 0.05,
          pulse: Math.random() * Math.PI * 2,
        });
      }
    }

    let lastTime = 0;
    function draw(ts) {
      const dt = ts - lastTime;
      lastTime = ts;
      ctx.clearRect(0, 0, W, H);

      // Subtle grid
      const isDark = document.documentElement.dataset.theme !== 'light';
      const gridColor = isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.04)';
      const gridSize = 60;
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Particles
      const pColor = isDark ? '255,255,255' : '0,0,0';
      particles.forEach(p => {
        p.pulse += 0.008;
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        const o = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${pColor},${o})`;
        ctx.fill();
      });

      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', () => { resize(); createParticles(); });
    resize();
    createParticles();
    requestAnimationFrame(draw);
  }


  /* ═══════════════════════════════════════════════
     THEME TOGGLE
  ═══════════════════════════════════════════════ */
  function initTheme() {
    const saved = localStorage.getItem('rm-theme') || 'dark';
    setTheme(saved);

    themeToggle?.addEventListener('click', () => {
      setTheme(state.theme === 'dark' ? 'light' : 'dark');
    });
  }

  function setTheme(theme) {
    state.theme = theme;
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('rm-theme', theme);
  }


  /* ═══════════════════════════════════════════════
     MOBILE NAV
  ═══════════════════════════════════════════════ */
  function initMobileNav() {
    menuToggle?.addEventListener('click', toggleMobileNav);

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeMobileNav();
      });
    });
  }

  function toggleMobileNav() {
    state.mobileOpen ? closeMobileNav() : openMobileNav();
  }

  function openMobileNav() {
    state.mobileOpen = true;
    mobileNav?.classList.add('open');
    menuToggle?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    state.mobileOpen = false;
    mobileNav?.classList.remove('open');
    menuToggle?.classList.remove('open');
    document.body.style.overflow = '';
  }


  /* ═══════════════════════════════════════════════
     SCROLL — NAV STATE & ACTIVE SECTION
  ═══════════════════════════════════════════════ */
  const sections = qsa('[data-section]');

  function initScroll() {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function onScroll() {
    state.scrollY = window.scrollY;

    // Nav scrolled state
    if (state.scrollY > 20) {
      nav?.classList.add('scrolled');
    } else {
      nav?.classList.remove('scrolled');
    }

    // Active section
    updateActiveSection();
  }

  function updateActiveSection() {
    let current = '';
    const offset = 120;
    sections.forEach(sec => {
      const top = sec.getBoundingClientRect().top + offset;
      if (top <= offset) current = sec.dataset.section;
    });

    navItems.forEach(item => {
      if (item.dataset.section === current) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }


  /* ═══════════════════════════════════════════════
     SMOOTH ANCHOR SCROLL
  ═══════════════════════════════════════════════ */
  function initAnchorScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }


  /* ═══════════════════════════════════════════════
     INTERSECTION OBSERVER — REVEAL
  ═══════════════════════════════════════════════ */
  function initReveal() {
    const revealEls = qsa('[data-reveal]');
    const revealParents = qsa('[data-reveal-parent]');

    // Stagger reveals within same section
    revealEls.forEach((el, i) => {
      const parent = el.closest('section, div.status-strip');
      if (!parent._revealItems) parent._revealItems = [];
      parent._revealItems.push(el);
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const parent = el.closest('section');
          const siblings = parent?._revealItems || [];
          const idx = siblings.indexOf(el);
          const delay = idx >= 0 ? idx * 80 : 0;

          setTimeout(() => {
            el.classList.add('revealed');
          }, Math.min(delay, 400));

          observer.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(el => observer.observe(el));

    const parentObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          parentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    revealParents.forEach(el => parentObserver.observe(el));
  }


  /* ═══════════════════════════════════════════════
     HERO LOAD ANIMATION
  ═══════════════════════════════════════════════ */
  function initHeroLoad() {
    const hero = qs('.hero');
    if (!hero) return;

    // Wait for DOM paint
    requestAnimationFrame(() => {
      setTimeout(() => {
        hero.classList.add('loaded');

        // Stagger child reveals
        const children = qsa('[data-reveal]', hero);
        children.forEach((el, i) => {
          setTimeout(() => {
            el.classList.add('revealed');
          }, 400 + i * 120);
        });
      }, 100);
    });
  }


  /* ═══════════════════════════════════════════════
     3D TILT ON CARDS
  ═══════════════════════════════════════════════ */
  function initTilt() {
    const tiltEls = qsa('[data-tilt]');

    tiltEls.forEach(el => {
      let targetRX = 0, targetRY = 0;
      let currentRX = 0, currentRY = 0;
      let rafId;

      function animate() {
        currentRX = lerp(currentRX, targetRX, 0.12);
        currentRY = lerp(currentRY, targetRY, 0.12);
        el.style.transform = `perspective(800px) rotateX(${currentRX}deg) rotateY(${currentRY}deg)`;

        const dist = Math.abs(targetRX - currentRX) + Math.abs(targetRY - currentRY);
        if (dist > 0.01) rafId = requestAnimationFrame(animate);
        else el.style.transform = '';
      }

      el.addEventListener('mousemove', e => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);

        targetRY = dx * 8;
        targetRX = -dy * 8;

        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(animate);
      });

      el.addEventListener('mouseleave', () => {
        targetRX = 0;
        targetRY = 0;
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(animate);
      });
    });
  }


  /* ═══════════════════════════════════════════════
     3D TILT — HERO CARD (mouse follow across section)
  ═══════════════════════════════════════════════ */
  function initHeroCardTilt() {
    const card = heroCard;
    if (!card) return;

    const cardEl = qs('.hero__card', card);
    if (!cardEl) return;

    let targetRX = 0, targetRY = 0;
    let currentRX = 0, currentRY = 0;
    let rafId;

    function animate() {
      currentRX = lerp(currentRX, targetRX, 0.08);
      currentRY = lerp(currentRY, targetRY, 0.08);
      cardEl.style.transform = `rotateX(${currentRX}deg) rotateY(${currentRY}deg)`;
      rafId = requestAnimationFrame(animate);
    }

    document.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      if (!rect.width) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = clamp((e.clientX - cx) / 300, -1, 1);
      const dy = clamp((e.clientY - cy) / 400, -1, 1);
      targetRY = dx * 15;
      targetRX = -dy * 10;
    });

    rafId = requestAnimationFrame(animate);
  }


  /* ═══════════════════════════════════════════════
     MAGNETIC BUTTONS
  ═══════════════════════════════════════════════ */
  function initMagnetic() {
    const magneticEls = qsa('.magnetic');

    magneticEls.forEach(el => {
      let mx = 0, my = 0;
      let targetMX = 0, targetMY = 0;
      let rafId;

      function animateMagnetic() {
        mx = lerp(mx, targetMX, 0.14);
        my = lerp(my, targetMY, 0.14);
        el.style.setProperty('--mx', `${mx}px`);
        el.style.setProperty('--my', `${my}px`);
        rafId = requestAnimationFrame(animateMagnetic);
      }

      el.addEventListener('mouseenter', () => {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(animateMagnetic);
      });

      el.addEventListener('mousemove', e => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        targetMX = (e.clientX - cx) * 0.3;
        targetMY = (e.clientY - cy) * 0.3;
      });

      el.addEventListener('mouseleave', () => {
        targetMX = 0;
        targetMY = 0;
        // Let RAF continue to ease back
        setTimeout(() => cancelAnimationFrame(rafId), 600);
      });
    });
  }


  /* ═══════════════════════════════════════════════
     PARALLAX — BACKGROUND ELEMENTS
  ═══════════════════════════════════════════════ */
  function initParallax() {
    const orbs = qsa('.hero__card-orb');
    let scrollY = 0;
    let currentY = 0;

    function update() {
      currentY = lerp(currentY, scrollY, 0.08);

      orbs.forEach((orb, i) => {
        const speed = [0.08, 0.12, 0.05][i] || 0.08;
        orb.style.transform = `translateY(${currentY * speed}px)`;
      });

      requestAnimationFrame(update);
    }

    window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });
    requestAnimationFrame(update);
  }


  /* ═══════════════════════════════════════════════
     MARQUEE — PAUSE ON HOVER
  ═══════════════════════════════════════════════ */
  function initMarquee() {
    const track = marqueeTrack;
    if (!track) return;

    track.addEventListener('mouseenter', () => {
      track.style.animationPlayState = 'paused';
    });
    track.addEventListener('mouseleave', () => {
      track.style.animationPlayState = 'running';
    });
  }


  /* ═══════════════════════════════════════════════
     TOOLKIT STARS — STAGGER MICRO ANIMATION
  ═══════════════════════════════════════════════ */
  function initToolkitStars() {
    const cards = qsa('.toolkit-card');

    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        const stars = qsa('.toolkit-card__stars span:not(.dim)', card);
        stars.forEach((star, i) => {
          setTimeout(() => {
            star.style.transform = 'scale(1.5)';
            setTimeout(() => { star.style.transform = ''; }, 200);
          }, i * 40);
        });
      });
    });
  }


  /* ═══════════════════════════════════════════════
     STATUS STRIP — SUBTLE PULSING
  ═══════════════════════════════════════════════ */
  function initStatusStrip() {
    const dots = qsa('.status-strip__dot');
    dots.forEach((dot, i) => {
      dot.style.animationDelay = `${i * 0.6}s`;
    });
  }


  /* ═══════════════════════════════════════════════
     PHILOSOPHY CARDS — SVG ANIMATION
  ═══════════════════════════════════════════════ */
  function initPhilosophyCards() {
    const svg = qs('.philo-card__svg');
    if (!svg) return;

    const lines = qsa('line', svg);
    lines.forEach((line, i) => {
      const len = 300;
      line.style.strokeDasharray = len;
      line.style.strokeDashoffset = len;
      line.style.transition = `stroke-dashoffset 1.2s ${0.1 * i}s cubic-bezier(0.16,1,0.3,1)`;
    });

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          lines.forEach(line => { line.style.strokeDashoffset = '0'; });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    observer.observe(svg);
  }


  /* ═══════════════════════════════════════════════
     EXPERIENCE CARDS — COUNTER ANIMATION
  ═══════════════════════════════════════════════ */
  function initCounters() {
    const metricNums = qsa('.exp-card__metric-num');

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const text = el.textContent;
          const match = text.match(/^(\d+)/);
          if (!match) return;

          const target = parseInt(match[1]);
          const suffix = text.replace(/^\d+/, '');
          let current = 0;
          const increment = target / 30;
          const interval = setInterval(() => {
            current = Math.min(current + increment, target);
            el.textContent = Math.floor(current) + suffix;
            if (current >= target) clearInterval(interval);
          }, 30);

          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    metricNums.forEach(el => observer.observe(el));
  }


  /* ═══════════════════════════════════════════════
     TIMELINE — STAGGER
  ═══════════════════════════════════════════════ */
  function initTimeline() {
    const items = qsa('.timeline__item');

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          items.forEach((item, i) => {
            setTimeout(() => {
              item.style.opacity = '1';
              item.style.transform = 'translateX(0)';
            }, i * 80);
          });
          observer.disconnect();
        }
      });
    }, { threshold: 0.2 });

    items.forEach(item => {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-16px)';
      item.style.transition = 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)';
    });

    const wrap = qs('.timeline');
    if (wrap) observer.observe(wrap);
  }


  /* ═══════════════════════════════════════════════
     PROJECT PLATES — HOVER SHEEN
  ═══════════════════════════════════════════════ */
  function initProjectSheen() {
    const plates = qsa('.project-plate');

    plates.forEach(plate => {
      plate.addEventListener('mousemove', e => {
        const rect = plate.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        plate.style.setProperty('--sheen-x', `${x}%`);
        plate.style.setProperty('--sheen-y', `${y}%`);
      });
    });
  }


  /* ═══════════════════════════════════════════════
     CURSOR GLOW (subtle, non-intrusive)
  ═══════════════════════════════════════════════ */
  function initCursorGlow() {
    // Only on non-touch devices
    if ('ontouchstart' in window) return;

    const glow = document.createElement('div');
    glow.style.cssText = `
      position: fixed;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%);
      pointer-events: none;
      z-index: 0;
      transform: translate(-50%, -50%);
      transition: opacity 0.3s;
      top: 0; left: 0;
    `;
    document.body.appendChild(glow);

    let glowX = 0, glowY = 0;
    let targetX = 0, targetY = 0;

    document.addEventListener('mousemove', e => {
      targetX = e.clientX;
      targetY = e.clientY;
    });

    function animateGlow() {
      glowX = lerp(glowX, targetX, 0.08);
      glowY = lerp(glowY, targetY, 0.08);
      glow.style.left = glowX + 'px';
      glow.style.top = glowY + 'px';
      requestAnimationFrame(animateGlow);
    }

    requestAnimationFrame(animateGlow);
  }


  /* ═══════════════════════════════════════════════
     VITALS CARD — LIVE DATE
  ═══════════════════════════════════════════════ */
  function initVitals() {
    const nowEl = qs('.status-strip__now');
    if (nowEl) {
      const year = new Date().getFullYear();
      nowEl.textContent = `Now · ${year}`;
    }
  }


  /* ═══════════════════════════════════════════════
     NAV INDEX — SMOOTH UNDERLINE INDICATOR
  ═══════════════════════════════════════════════ */
  function initNavIndicator() {
    // Add active indicator line to nav
    const navIndex = document.getElementById('navIndex');
    if (!navIndex) return;

    const indicator = document.createElement('div');
    indicator.style.cssText = `
      position: absolute;
      bottom: 0;
      height: 2px;
      background: var(--accent-gold);
      transition: left 0.4s cubic-bezier(0.16,1,0.3,1), width 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.3s;
      pointer-events: none;
      opacity: 0;
    `;
    navIndex.style.position = 'relative';
    navIndex.appendChild(indicator);

    function updateIndicator() {
      const active = navIndex.querySelector('.nav__item.active');
      if (!active) {
        indicator.style.opacity = '0';
        return;
      }
      const parentRect = navIndex.getBoundingClientRect();
      const rect = active.getBoundingClientRect();
      indicator.style.left = (rect.left - parentRect.left) + 'px';
      indicator.style.width = rect.width + 'px';
      indicator.style.opacity = '1';
    }

    // Use MutationObserver to watch for class changes
    const mo = new MutationObserver(updateIndicator);
    navItems.forEach(item => mo.observe(item, { attributes: true, attributeFilter: ['class'] }));
  }


  /* ═══════════════════════════════════════════════
     INIT ALL
  ═══════════════════════════════════════════════ */
  function init() {
    initTheme();
    initMobileNav();
    initScroll();
    initAnchorScroll();
    initReveal();
    initHeroLoad();
    initCanvas();
    initHeroCardTilt();
    initTilt();
    initMagnetic();
    initParallax();
    initMarquee();
    initToolkitStars();
    initStatusStrip();
    initPhilosophyCards();
    initCounters();
    initTimeline();
    initProjectSheen();
    initCursorGlow();
    initVitals();
    initNavIndicator();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();