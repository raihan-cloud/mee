/* ============================================================
   RAIHAN MUZAFFAR — IMMERSIVE 3D PORTFOLIO ENGINE
   Pure Vanilla JS. No frameworks. No libraries.
   ============================================================ */

(function () {
  'use strict';

  // ─── CONFIG ───
  const ROOM_DEPTH = 5000;       // Z spacing between rooms
  const TOTAL_ROOMS = 7;
  const MAX_Z = (TOTAL_ROOMS - 1) * ROOM_DEPTH;
  const PERSPECTIVE = 1200;
  const MOUSE_ROT_X = 6;        // max degrees
  const MOUSE_ROT_Y = 8;
  const LERP = 0.07;

  // ─── ELEMENTS ───
  const world = document.getElementById('world');
  const viewport = document.getElementById('viewport');
  const proxy = document.getElementById('scrollProxy');
  const loader = document.getElementById('loader');
  const enterBtn = document.getElementById('enterBtn');
  const nav = document.getElementById('nav');
  const navLinks = document.querySelectorAll('.nav-link');
  const progressFill = document.querySelector('.nav-progress-fill');
  const coordZ = document.getElementById('coordZ');
  const scrollHint = document.getElementById('scrollHint');
  const marquee = document.getElementById('marqueeWrap');
  const cursorDot = document.getElementById('cursorDot');
  const cursorGlow = document.getElementById('cursorGlow');
  const rooms = document.querySelectorAll('.room');

  // Set proxy height
  proxy.style.height = (MAX_Z + window.innerHeight) + 'px';

  // ─── STATE ───
  let targetZ = 0, currentZ = 0;
  let targetRX = 0, targetRY = 0, currentRX = 0, currentRY = 0;
  let mx = 0, my = 0, glowX = 0, glowY = 0;
  let entered = false;
  let raf;

  // ─── ENTER EXPERIENCE ───
  enterBtn.addEventListener('click', function () {
    loader.classList.add('exit');
    entered = true;
    setTimeout(function () {
      loader.style.display = 'none';
      nav.classList.add('visible');
      scrollHint.classList.add('visible');
      marquee.classList.add('visible');
    }, 1200);
  });

  // ─── SCROLL → Z ───
  window.addEventListener('scroll', function () {
    if (!entered) return;
    targetZ = window.scrollY;
  });

  // ─── MOUSE ───
  document.addEventListener('mousemove', function (e) {
    mx = e.clientX;
    my = e.clientY;
    var nx = (mx / window.innerWidth) * 2 - 1;
    var ny = (my / window.innerHeight) * 2 - 1;
    targetRY = nx * MOUSE_ROT_Y;
    targetRX = ny * -MOUSE_ROT_X;
  });

  // ─── CURSOR ───
  function updateCursor() {
    if (!cursorDot) return;
    cursorDot.style.left = mx + 'px';
    cursorDot.style.top = my + 'px';
    glowX += (mx - glowX) * 0.15;
    glowY += (my - glowY) * 0.15;
    cursorGlow.style.left = glowX + 'px';
    cursorGlow.style.top = glowY + 'px';
  }

  // Hover detection
  var hoverTargets = document.querySelectorAll('a, button, .about-card, .project, .sys-module, .skill-node, .cmd-btn, .nav-link, .enter-btn');
  hoverTargets.forEach(function (el) {
    el.addEventListener('mouseenter', function () { document.body.classList.add('hovering'); });
    el.addEventListener('mouseleave', function () { document.body.classList.remove('hovering'); });
  });

  // ─── MAGNETIC BUTTONS ───
  var magnetics = document.querySelectorAll('.magnetic-btn');
  magnetics.forEach(function (btn) {
    btn.addEventListener('mousemove', function (e) {
      var rect = btn.getBoundingClientRect();
      var x = e.clientX - rect.left - rect.width / 2;
      var y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = 'translate(' + x * 0.25 + 'px,' + y * 0.25 + 'px)';
    });
    btn.addEventListener('mouseleave', function () {
      btn.style.transform = 'translate(0,0)';
    });
  });

  // ─── NAV LINKS ───
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      var roomIdx = parseInt(link.getAttribute('data-room'));
      var targetScroll = roomIdx * ROOM_DEPTH;
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    });
  });

  // ─── MAIN LOOP ───
  function tick() {
    // Lerp camera position
    currentZ += (targetZ - currentZ) * LERP;
    currentRX += (targetRX - currentRX) * LERP;
    currentRY += (targetRY - currentRY) * LERP;

    // Move world
    world.style.transform = 'translateZ(' + currentZ + 'px) rotateX(' + currentRX + 'deg) rotateY(' + currentRY + 'deg)';

    // Progress
    var pct = Math.min(100, Math.max(0, (currentZ / MAX_Z) * 100));
    if (progressFill) progressFill.style.height = pct + '%';
    if (coordZ) coordZ.textContent = 'Z: ' + String(Math.round(currentZ)).padStart(5, '0');

    // Room visibility & nav
    var activeRoom = 0;
    rooms.forEach(function (room, i) {
      var rz = parseInt(room.style.getPropertyValue('--room-z')) || 0;
      var dist = Math.abs(currentZ + rz);

      // Opacity: fade in as approach, fade out once passed
      var op = 1;
      if (currentZ + rz > 800) {
        op = 0; // behind camera
      } else if (dist > 2500) {
        op = Math.max(0, 1 - (dist - 2500) / 2000);
      }
      room.style.opacity = op;

      // Toggle class for CSS animations
      if (dist < 2500) {
        room.classList.add('room-visible');
        activeRoom = i;
      } else {
        room.classList.remove('room-visible');
      }
    });

    // Active nav
    navLinks.forEach(function (l, idx) {
      l.classList.toggle('active', idx === activeRoom);
    });

    // Hide scroll hint after scrolling
    if (currentZ > 200 && scrollHint) scrollHint.classList.remove('visible');

    // Cursor
    updateCursor();

    raf = requestAnimationFrame(tick);
  }
  tick();

  // ─── CANVAS: AMBIENT PARTICLES ───
  var canvas = document.getElementById('cosmos');
  var ctx = canvas.getContext('2d');
  var particles = [];
  var PARTICLE_COUNT = 120;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', function () {
    resizeCanvas();
    proxy.style.height = (MAX_Z + window.innerHeight) + 'px';
  });
  resizeCanvas();

  function Particle() {
    this.reset();
  }
  Particle.prototype.reset = function () {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.r = Math.random() * 1.5 + 0.3;
    this.dx = (Math.random() - 0.5) * 0.3;
    this.dy = (Math.random() - 0.5) * 0.3;
    this.alpha = Math.random() * 0.4 + 0.1;
  };
  Particle.prototype.update = function () {
    this.x += this.dx;
    this.y += this.dy;
    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
      this.reset();
    }
  };
  Particle.prototype.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(244,241,234,' + this.alpha + ')';
    ctx.fill();
  };

  for (var i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var j = 0; j < particles.length; j++) {
      particles[j].update();
      particles[j].draw();
    }
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  // ─── SKILLS CONSTELLATION ───
  var skills = [
    { name: 'HTML', group: 'frontend' },
    { name: 'CSS', group: 'frontend' },
    { name: 'JavaScript', group: 'frontend' },
    { name: 'Flutter', group: 'frontend' },
    { name: 'Go', group: 'backend' },
    { name: 'Django', group: 'backend' },
    { name: 'Laravel', group: 'backend' },
    { name: 'REST API', group: 'backend' },
    { name: 'MySQL', group: 'database' },
    { name: 'MariaDB', group: 'database' },
    { name: 'Firebase', group: 'database' },
    { name: 'ESP32', group: 'iot' },
    { name: 'RFID', group: 'iot' },
    { name: 'MQTT', group: 'iot' },
    { name: 'Linux', group: 'infra' },
    { name: 'Docker', group: 'infra' },
    { name: 'Cloud', group: 'infra' },
    { name: 'Networking', group: 'infra' },
  ];

  var constellation = document.getElementById('constellation');
  var cCanvas = document.getElementById('constellationCanvas');
  var cCtx = cCanvas ? cCanvas.getContext('2d') : null;
  var nodeEls = [];
  var nodePositions = [];

  function initSkills() {
    if (!constellation || !cCanvas) return;
    // Clear previous
    var existing = constellation.querySelectorAll('.skill-node');
    existing.forEach(function (e) { e.remove(); });
    nodeEls = [];
    nodePositions = [];

    var w = constellation.offsetWidth;
    var h = constellation.offsetHeight;
    cCanvas.width = w;
    cCanvas.height = h;

    skills.forEach(function (skill, idx) {
      var angle = (idx / skills.length) * Math.PI * 2;
      var radius = Math.min(w, h) * 0.3 + (Math.random() * Math.min(w, h) * 0.15);
      var cx = w / 2 + Math.cos(angle) * radius;
      var cy = h / 2 + Math.sin(angle) * radius;

      var node = document.createElement('div');
      node.className = 'skill-node';
      node.setAttribute('data-group', skill.group);
      node.textContent = skill.name;
      node.style.left = cx + 'px';
      node.style.top = cy + 'px';

      // Hover for cursor
      node.addEventListener('mouseenter', function () { document.body.classList.add('hovering'); });
      node.addEventListener('mouseleave', function () { document.body.classList.remove('hovering'); });

      constellation.appendChild(node);
      nodeEls.push(node);
      nodePositions.push({
        x: cx, y: cy,
        ox: cx, oy: cy,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3
      });
    });
  }

  function drawLines() {
    if (!cCtx || !cCanvas) return;
    cCtx.clearRect(0, 0, cCanvas.width, cCanvas.height);
    for (var a = 0; a < nodePositions.length; a++) {
      for (var b = a + 1; b < nodePositions.length; b++) {
        var dx = nodePositions[a].x - nodePositions[b].x;
        var dy = nodePositions[a].y - nodePositions[b].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          cCtx.beginPath();
          cCtx.moveTo(nodePositions[a].x, nodePositions[a].y);
          cCtx.lineTo(nodePositions[b].x, nodePositions[b].y);
          cCtx.strokeStyle = 'rgba(198,161,91,' + (0.15 - dist / 2000) + ')';
          cCtx.lineWidth = 0.5;
          cCtx.stroke();
        }
      }
    }
  }

  function animateSkills() {
    if (!constellation) return;
    var w = constellation.offsetWidth;
    var h = constellation.offsetHeight;
    nodePositions.forEach(function (n, idx) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 40 || n.x > w - 40) n.vx *= -1;
      if (n.y < 20 || n.y > h - 20) n.vy *= -1;
      nodeEls[idx].style.left = n.x + 'px';
      nodeEls[idx].style.top = n.y + 'px';
    });
    drawLines();
    requestAnimationFrame(animateSkills);
  }

  initSkills();
  if (window.innerWidth > 768) animateSkills();

  window.addEventListener('resize', initSkills);

  // ─── 3D TILT ON CARDS ───
  var tiltTargets = document.querySelectorAll('.about-card, .project, .sys-module, .id-card-inner');
  tiltTargets.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = 'perspective(800px) rotateX(' + (y * -8) + 'deg) rotateY(' + (x * 8) + 'deg) scale(1.01)';
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
    });
  });

})();