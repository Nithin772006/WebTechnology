// =============================================
// TRENDPULSE — MAIN JAVASCRIPT
// main.js
// =============================================

document.addEventListener('DOMContentLoaded', () => {

  // ---- NAVBAR SCROLL EFFECT ----
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // ---- HAMBURGER MENU ----
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const spans = hamburger.querySelectorAll('span');
      spans.forEach(s => s.style.background = navLinks.classList.contains('open') ? '#ff3b5c' : '');
    });
  }

  // ---- HERO PARTICLES ----
  const particlesContainer = document.getElementById('heroParticles');
  if (particlesContainer) {
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDuration = (8 + Math.random() * 18) + 's';
      particle.style.animationDelay = (Math.random() * 15) + 's';
      particle.style.width = (1 + Math.random() * 3) + 'px';
      particle.style.height = particle.style.width;
      const colors = ['#ff3b5c', '#ff8c42', '#ffd166', '#4361ee', '#0dcaf0'];
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];
      particlesContainer.appendChild(particle);
    }
  }

  // ---- COUNTER ANIMATION ----
  const counters = document.querySelectorAll('[data-target]');
  const observerCb = (entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-target'));
      let current = 0;
      const step = target / 60;
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          el.textContent = target;
          clearInterval(timer);
        } else {
          el.textContent = Math.floor(current);
        }
      }, 20);
      counterObserver.unobserve(el);
    });
  };
  const counterObserver = new IntersectionObserver(observerCb, { threshold: 0.5 });
  counters.forEach(c => counterObserver.observe(c));

  // ---- RISK BAR ANIMATION ----
  const riskBars = document.querySelectorAll('.risk-bar-fill');
  const riskObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const targetW = bar.style.getPropertyValue('--target-w');
        bar.style.width = targetW;
        riskObserver.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });
  riskBars.forEach(b => riskObserver.observe(b));

  // ---- WW3 GAUGE ANIMATION ----
  const gauge = document.getElementById('ww3Gauge');
  const needle = document.getElementById('gaugeNeedle');
  if (gauge && needle) {
    const gaugeObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setTimeout(() => {
          // 34% -> needle rotates from -90 to ~-90 + (34/100)*180 = -90 + 61.2 = -28.8deg
          needle.style.transform = 'translateX(-50%) rotate(-29deg)';
        }, 400);
        gaugeObserver.unobserve(gauge);
      }
    }, { threshold: 0.5 });
    gaugeObserver.observe(gauge);
  }

  // ---- OUTCOME BARS ANIMATION (Analysis page) ----
  const outcomeBars = document.querySelectorAll('.outcome-bar-fill');
  if (outcomeBars.length) {
    const outcomeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const w = bar.getAttribute('data-width');
          setTimeout(() => { bar.style.width = w; }, 100);
          outcomeObserver.unobserve(bar);
        }
      });
    }, { threshold: 0.3 });
    outcomeBars.forEach(b => {
      b.style.width = '0%';
      b.style.transition = 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
      outcomeObserver.observe(b);
    });
  }

  // ---- TIMELINE SCROLL ANIMATION ----
  const timelineItems = document.querySelectorAll('.timeline-item');
  if (timelineItems.length) {
    const tlObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          tlObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    timelineItems.forEach((item, i) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(30px)';
      item.style.transition = `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`;
      tlObserver.observe(item);
    });
  }

  // ---- UPDATE ITEMS ANIMATION ----
  const updateItems = document.querySelectorAll('.update-item');
  const updateObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateX(0)';
        }, i * 80);
        updateObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  updateItems.forEach((item, i) => {
    item.style.opacity = '0';
    item.style.transform = 'translateX(-20px)';
    item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    updateObserver.observe(item);
  });

  // ---- ACTIVE NAV LINK ----
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (href && href.includes(currentPage)) {
      link.classList.add('active');
    }
    if (currentPage === '' || currentPage === 'index.html') {
      const homeLink = document.querySelector('.nav-link[href="index.html"]');
      if (homeLink) homeLink.classList.add('active');
    }
  });

  // ---- RESEARCH CARDS HOVER GLOW ----
  document.querySelectorAll('.research-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.background = `radial-gradient(200px circle at ${x}px ${y}px, rgba(255, 140, 66, 0.06), transparent 70%), var(--bg-card)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.background = '';
    });
  });

  // ---- OPEN CHAT FROM NAV ----
  const openChatNavBtn = document.getElementById('openChatNavBtn');
  const openChatBtn = document.getElementById('openChatBtn');
  const chatbotFab = document.getElementById('chatbotFab');
  const openChatWindow = () => {
    const w = document.getElementById('chatbotWindow');
    if (w) { w.classList.add('open'); }
  };
  if (openChatNavBtn) openChatNavBtn.addEventListener('click', (e) => { e.preventDefault(); openChatWindow(); });
  if (openChatBtn) openChatBtn.addEventListener('click', openChatWindow);
  if (chatbotFab) chatbotFab.addEventListener('click', openChatWindow);

  // ---- SMOOTH SCROLL FOR ANCHOR LINKS ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ---- LIVE CLOCK on breaking bar ----
  function updateTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
    const doc = document.getElementById('liveClock');
    if (doc) doc.textContent = `IST ${timeStr}`;
  }
  setInterval(updateTime, 1000);

  // ---- CARD APPEAR ANIMATION on load ----
  const cards = document.querySelectorAll('.research-card, .conflict-card, .analysis-card');
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, 60);
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(24px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    cardObserver.observe(card);
  });

});
