/**
 * InfinityTV – main.js
 * Pure JS · No frameworks · requestAnimationFrame · IntersectionObserver
 */

(function () {
  'use strict';

  /* ============================================================
     Utilitários
  ============================================================ */

  /** Debounce: evita chamadas excessivas em eventos frequentes */
  function debounce(fn, wait) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  /** Easing functions customizadas */
  const ease = {
    outExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
    outCubic: t => 1 - Math.pow(1 - t, 3),
    outElastic: t => {
      if (t === 0 || t === 1) return t;
      return Math.pow(2, -10 * t) * Math.sin((t * 10 - .75) * (2 * Math.PI / 3)) + 1;
    }
  };

  /** Lerp */
  const lerp = (a, b, n) => (1 - n) * a + n * b;

  /* ============================================================
     Header – efeito scroll
  ============================================================ */
  const header = document.querySelector('header');

  function updateHeader() {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', debounce(updateHeader, 10), { passive: true });
  updateHeader();

  /* ============================================================
     Nav – destaque menu ativo ao rolar
  ============================================================ */
  const sections = document.querySelectorAll('section[id], div[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function highlightNav() {
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      if (window.scrollY >= top) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', debounce(highlightNav, 80), { passive: true });

  /* ============================================================
     Menu mobile
  ============================================================ */
  const mobileBtn  = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      mobileBtn.querySelector('i').className = isOpen ? 'fas fa-times' : 'fas fa-bars';
    });

    // Fechar ao clicar num link
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        mobileBtn.querySelector('i').className = 'fas fa-bars';
      });
    });
  }

  /* ============================================================
     Partículas – canvas no hero
  ============================================================ */
  const hero = document.querySelector('.hero');
  if (hero) {
    const canvas = document.createElement('canvas');
    canvas.id = 'particles-canvas';
    hero.insertBefore(canvas, hero.firstChild);

    const ctx    = canvas.getContext('2d');
    let   W, H;
    let   particles = [];
    const COUNT = 60;

    function resize() {
      W = canvas.width  = hero.offsetWidth;
      H = canvas.height = hero.offsetHeight;
    }

    function createParticle() {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.8 + .4,
        vx: (Math.random() - .5) * .4,
        vy: (Math.random() - .5) * .4,
        alpha: Math.random() * .6 + .2
      };
    }

    function initParticles() {
      resize();
      particles = Array.from({ length: COUNT }, createParticle);
    }

    function drawParticles() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,210,255,${p.alpha})`;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -5) p.x = W + 5;
        if (p.x > W + 5) p.x = -5;
        if (p.y < -5) p.y = H + 5;
        if (p.y > H + 5) p.y = -5;
      });

      // Linhas entre partículas próximas
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0,210,255,${.1 * (1 - dist / 100)})`;
            ctx.lineWidth = .5;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(drawParticles);
    }

    initParticles();
    drawParticles();
    window.addEventListener('resize', debounce(initParticles, 200));
  }

  /* ============================================================
     Typewriter
  ============================================================ */
  const twEl = document.getElementById('typewriter');

  if (twEl) {
    const phrases = [
      '+23.000 Títulos disponíveis',
      'Qualidade 4K Ultra HD',
      'Estabilidade máxima 24/7',
      'Suporte em tempo real',
      'Compatível com todos os dispositivos'
    ];
    let pi = 0, ci = 0, deleting = false;

  

    function type() {
      const phrase = phrases[pi];
      twEl.textContent = deleting
        ? phrase.slice(0, ci--)
        : phrase.slice(0, ci++);

      let delay = deleting ? 40 : 80;

      if (!deleting && ci > phrase.length) {
        delay = 1800;
        deleting = true;
      } else if (deleting && ci < 0) {
        deleting = false;
        ci = 0;
        pi = (pi + 1) % phrases.length;
        delay = 400;
      }

      setTimeout(type, delay);
    }

    setTimeout(type, 1200);
  }

  /* ============================================================
     IntersectionObserver – animações de scroll
  ============================================================ */
  const animEls = document.querySelectorAll('[data-anim]');

  if (animEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .15 });

    animEls.forEach(el => observer.observe(el));
  }

  /* ============================================================
     Contador animado – requestAnimationFrame + easing
  ============================================================ */
  const counters = document.querySelectorAll('[data-counter]');

  if (counters.length) {
    const cObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          cObs.unobserve(entry.target);
        }
      });
    }, { threshold: .5 });

    counters.forEach(el => cObs.observe(el));
  }

  function animateCounter(el) {
    const target   = parseFloat(el.dataset.counter);
    const prefix   = el.dataset.prefix  || '';
    const suffix   = el.dataset.suffix  || '';
    const duration = parseInt(el.dataset.duration) || 2000;
    const start    = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const val = target * ease.outExpo(progress);

      el.textContent = prefix + formatNum(val, target) + suffix;

      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  function formatNum(val, target) {
    if (target >= 1000) return '+' + Math.floor(val).toLocaleString('pt-BR');
    return Math.floor(val).toString();
  }

  /* ============================================================
     Cards 3D Tilt – plan-card + card-wrap
  ============================================================ */
  const tiltEls = document.querySelectorAll('.plan-card, .card-wrap');

  tiltEls.forEach(el => {
    // Adicionar glow div nos cards de plano
    if (el.classList.contains('plan-card') && !el.querySelector('.card-glow')) {
      const glow = document.createElement('div');
      glow.className = 'card-glow';
      el.appendChild(glow);
    }

    let rafId = null;
    let targetRx = 0, targetRy = 0;
    let currentRx = 0, currentRy = 0;

    function updateTilt() {
      currentRx = lerp(currentRx, targetRx, .12);
      currentRy = lerp(currentRy, targetRy, .12);

      const card = el.classList.contains('plan-card') ? el : el.querySelector('.card');
      if (card) {
        card.style.transform = `perspective(1000px) rotateX(${currentRx}deg) rotateY(${currentRy}deg)`;
      }

      const glow = el.querySelector('.card-glow');
      if (glow) {
        glow.style.setProperty('--mx', `${50 + currentRy * 3}%`);
        glow.style.setProperty('--my', `${50 - currentRx * 3}%`);
      }

      if (Math.abs(currentRx - targetRx) > .01 || Math.abs(currentRy - targetRy) > .01) {
        rafId = requestAnimationFrame(updateTilt);
      } else {
        rafId = null;
      }
    }

    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top)  / rect.height;
      targetRx = (my - .5) * -14;
      targetRy = (mx - .5) *  14;
      if (!rafId) rafId = requestAnimationFrame(updateTilt);
    });

    el.addEventListener('mouseleave', () => {
      targetRx = 0; targetRy = 0;
      if (!rafId) rafId = requestAnimationFrame(updateTilt);
    });
  });

  /* ============================================================
     Carrossel
  ============================================================ */
  const track    = document.querySelector('.carousel-track');
  const slides   = document.querySelectorAll('.carousel-slide');
  const prevBtn  = document.getElementById('prevBtn');
  const nextBtn  = document.getElementById('nextBtn');
  const indicWrap = document.getElementById('carouselIndicators');

  if (track && slides.length) {
    let current = 0;
    let autoTimer;

    // Criar indicadores
    slides.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => goTo(i));
      indicWrap.appendChild(dot);
    });

    function goTo(idx) {
      slides[current].classList.remove('active');
      current = (idx + slides.length) % slides.length;
      slides[current].classList.add('active');
      track.style.transform = `translateX(-${current * 100}%)`;
      updateDots();
      resetAuto();
    }

    function updateDots() {
      indicWrap.querySelectorAll('.carousel-dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    }

    function resetAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(() => goTo(current + 1), 5000);
    }

    if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

    resetAuto();
  }

  /* ============================================================
     Testimonials Slider
  ============================================================ */
  const testimCont  = document.getElementById('testim-content');
  const dots        = document.querySelectorAll('.dot');
  const leftArrow   = document.getElementById('left-arrow');
  const rightArrow  = document.getElementById('right-arrow');

  if (testimCont) {
    const items = Array.from(testimCont.children);
    let cur = 0;

    function showTestim(idx) {
      items.forEach((item, i) => {
        item.classList.remove('active', 'inactive');
        item.classList.add(i === idx ? 'active' : 'inactive');
      });
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
      cur = idx;
    }

    if (leftArrow)  leftArrow.addEventListener('click',  () => showTestim((cur - 1 + items.length) % items.length));
    if (rightArrow) rightArrow.addEventListener('click', () => showTestim((cur + 1) % items.length));
    dots.forEach((d, i) => d.addEventListener('click', () => showTestim(i)));

    // Auto-rotate
    setInterval(() => showTestim((cur + 1) % items.length), 6000);
  }

  /* ============================================================
     Back to top
  ============================================================ */
  const btt = document.getElementById('back-to-top');
  if (btt) {
    window.addEventListener('scroll', debounce(() => {
      btt.classList.toggle('visible', window.scrollY > 400);
    }, 80), { passive: true });

    btt.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============================================================
     Parallax leve no hero
  ============================================================ */
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    let lastY = 0;
    window.addEventListener('scroll', () => {
      const sy = window.scrollY;
      if (sy < window.innerHeight) {
        const offset = sy * .25;
        heroContent.style.transform = `translateY(${offset}px)`;
        heroContent.style.opacity = 1 - sy / (window.innerHeight * .8);
      }
    }, { passive: true });
  }

  /* ============================================================
     Scroll suave para âncoras
  ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

})();
