// Parallax (hero micro-shift) und Scroll-Reveal für Sections
(function initParallaxAndReveal() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const parallaxItems = Array.from(document.querySelectorAll('[data-parallax-speed]'));
  const sectionItems = Array.from(document.querySelectorAll('.section')).filter(
    (el) => !el.classList.contains('hero-section')
  );
  const objectiveItems = Array.from(document.querySelectorAll('.router-section__list .objective'));
  const revealItems = [...sectionItems, ...objectiveItems];

  const debugLogLayout = () => {
    const hero = document.querySelector('.hero-section');
    const stats = document.querySelector('.statistics-section');
    if (!hero || !stats) return;
    const hRect = hero.getBoundingClientRect();
    const sRect = stats.getBoundingClientRect();
    const gap = sRect.top - hRect.bottom;
    // Only log on small viewports to track the reported issue
    if (window.innerWidth <= 600) {
      console.debug('[layout-debug] viewport', window.innerWidth, 'x', window.innerHeight,
        'hero h:', Math.round(hRect.height), 'gap hero→stats:', Math.round(gap),
        'stats top:', Math.round(sRect.top));
    }
  };

  // Symbol swap for the art window based on nearest objective in view
  const artLogo = document.querySelector('.art-window__logo');
  const artWindow = document.querySelector('.router-section .art-window');
  const artLabel = document.querySelector('.art-window__figure-label');
  let currentArtId = null;
  let lastSwitchTs = 0;

  const artSymbols = {
    split: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="currentColor" stroke-width="2.5" opacity="0.9"><ellipse cx="50" cy="50" rx="35" ry="12" transform="rotate(0 50 50)"/><ellipse cx="50" cy="50" rx="35" ry="12" transform="rotate(60 50 50)"/><ellipse cx="50" cy="50" rx="35" ry="12" transform="rotate(-60 50 50)"/></g><g fill="currentColor" opacity="0.9"><circle cx="50" cy="50" r="8"/><circle cx="15" cy="50" r="4"/><circle cx="67.5" cy="19.7" r="4"/><circle cx="67.5" cy="80.3" r="4"/></g></svg>',
    assist: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"><circle cx="60" cy="60" r="42"/><path d="M60 18v24"/><path d="M60 78v24"/><path d="M18 60h24"/><path d="M78 60h24"/><circle cx="60" cy="60" r="12"/></g></svg>',
    audience: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"><circle cx="60" cy="44" r="18"/><path d="M30 96c4-16 16-24 30-24s26 8 30 24"/><circle cx="26" cy="76" r="8"/><circle cx="94" cy="76" r="8"/></g></svg>',
    architecture: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"><rect x="22" y="38" width="76" height="52" rx="6"/><path d="M22 54h76"/><path d="M42 38v-8h36v8"/><path d="M42 90v12"/><path d="M78 90v12"/><path d="M54 70h12"/></g></svg>',
    ai: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"><rect x="30" y="30" width="60" height="60" rx="10"/><circle cx="46" cy="46" r="6"/><circle cx="74" cy="46" r="6"/><path d="M42 70c6 6 30 6 36 0"/><path d="M18 60h14"/><path d="M88 60h14"/><path d="M60 18v14"/><path d="M60 88v14"/></g></svg>',
    time: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"><circle cx="60" cy="60" r="44"/><path d="M60 30v34l18 12"/><path d="M60 10v10"/><path d="M60 100v10"/><path d="M10 60h10"/><path d="M100 60h10"/></g></svg>',
  };

  const artLabels = {
    split: 'ATOM',
    assist: 'ASSIST',
    audience: 'AUDIENCE',
    architecture: 'ARCHITECTURE',
    ai: 'AI',
    time: 'TIME',
  };

  const setArtSymbol = (id) => {
    if (!artLogo) return;
    const svg = artSymbols[id] || artSymbols.split;
    if (currentArtId === id) return;
    currentArtId = id;
    artLogo.innerHTML = svg;
    if (artLabel) {
      const label = artLabels[id] || 'ATOM';
      artLabel.textContent = `[ ${label} ]`;
    }
  };

  // Default to atom symbol on load
  setArtSymbol('split');

  // init reveal baseline
  revealItems.forEach((el) => {
    el.classList.add('reveal');
    if (!el.dataset.scroll) el.dataset.scroll = 'fade-up';
  });

  // Initial layout debug and on resize for small viewports
  debugLogLayout();
  window.addEventListener('resize', debugLogLayout, { passive: true });

  if (prefersReducedMotion.matches) {
    revealItems.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  let ticking = false;

  const updateParallax = () => {
    const scrollY = window.scrollY;
    parallaxItems.forEach((el) => {
      const speed = parseFloat(el.dataset.parallaxSpeed || '0');
      el.style.setProperty('--parallax-offset', `${scrollY * speed}px`);
    });

    // Pick objective whose center is nearest the viewport center
    if (objectiveItems.length) {
      const vh = window.innerHeight;
      const artRect = artWindow ? artWindow.getBoundingClientRect() : null;
      const referenceCenter = artRect ? artRect.top + artRect.height * 0.5 : vh * 0.5;
      const snapThreshold = 120; // px Abstand erlaubt zwischen Zentren (grosszügiger, damit untere Karten greifen)
      let best = null;

      objectiveItems.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const visibleHeight = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
        const ratio = Math.max(0, visibleHeight) / Math.max(1, rect.height);
        if (ratio < 0.5) return; // erst wechseln wenn ~50% sichtbar
        const center = rect.top + rect.height * 0.5;
        const dist = Math.abs(center - referenceCenter);
        if (!best || dist < best.dist) best = { el, dist };
      });

      if (best && best.dist <= snapThreshold) {
        const now = Date.now();
        if (now - lastSwitchTs > 420) {
          setArtSymbol(best.el.dataset.artId || 'split');
          lastSwitchTs = now;
        }
      }
    }
    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  };

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        // Fast, uniform reveal for all items
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: '12% 0px -6%' }
  );

  revealItems.forEach((el) => revealObserver.observe(el));

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateParallax);
  updateParallax();
})();
