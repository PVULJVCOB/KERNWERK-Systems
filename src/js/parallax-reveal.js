// Parallax (hero micro-shift) und Scroll-Reveal für Sections
(function initParallaxAndReveal() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const parallaxItems = Array.from(document.querySelectorAll('[data-parallax-speed]'));
  const sectionItems = Array.from(document.querySelectorAll('.section')).filter(
    (el) => !el.classList.contains('hero-section')
  );
  const objectiveItems = Array.from(document.querySelectorAll('.router-section__list .objective'));
  const revealItems = [...sectionItems, ...objectiveItems];

  // Symbol swap for the art window based on nearest objective in view
  const artLogo = document.querySelector('.art-window__logo');
  const artWindow = document.querySelector('.router-section .art-window');
  const artLabel = document.querySelector('.art-window__figure-label');
  let currentArtId = null;
  let lastSwitchTs = 0;

  const artSymbols = {
    split: '<img src="src/assets/svg/genetic-data-svgrepo-com.svg" alt="Zerlegung" />',
    assist: '<img src="src/assets/svg/assist-support.svg" alt="Assistenzsystem" />',
    audience: '<img src="src/assets/svg/audience-people.svg" alt="Audience" />',
    architecture: '<img src="src/assets/svg/architecture-modules.svg" alt="Architektur" />',
    ai: '<img src="src/assets/svg/ai-brain.svg" alt="AI" />',
    time: '<img src="src/assets/svg/time-calendar.svg" alt="Zeit" />',
  };

  const artLabels = {
    split: 'ATOM',
    assist: 'ASSIST',
    audience: 'AUDIENCE',
    architecture: 'ARCHITECTURE',
    ai: 'AI',
    time: 'KALENDER',
  };

  const setArtSymbol = (id) => {
    if (!artLogo) return;
    const img = artSymbols[id] || artSymbols.split;
    if (currentArtId === id) return;
    currentArtId = id;
    artLogo.innerHTML = img;
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
