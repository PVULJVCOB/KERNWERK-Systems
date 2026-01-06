/**
 * @fileoverview Parallax and Scroll-Reveal Animation System
 * 
 * Implements two key scroll-based effects:
 * 
 * 1. PARALLAX EFFECT:
 *    - Hero section micro-shift based on scroll position
 *    - Elements move at different speeds via data-parallax-speed attribute
 *    - Creates depth perception and visual interest
 * 
 * 2. SCROLL-REVEAL:
 *    - Fade-in animation for sections as they enter viewport
 *    - Uses IntersectionObserver for efficient detection
 *    - Supports prefers-reduced-motion accessibility setting
 * 
 * 3. DYNAMIC ART SYMBOL SWAPPER:
 *    - Swaps art window symbols based on nearby objectives
 *    - Matches with data-art-id attributes on objectives
 *    - Updates label text dynamically
 *    - Throttled to prevent excessive updates
 * 
 * Features:
 * - RequestAnimationFrame optimization to reduce repaints
 * - Passive scroll listeners for better performance
 * - Accessibility: respects prefers-reduced-motion
 * - Dynamic symbol loading with lazy loading
 * - Debounce/throttle for art symbol updates
 * - Safe DOM manipulation without innerHTML
 * 
 * @version 1.0.0
 * @author Development Team
 */

/**
 * IIFE - Initialize parallax and scroll-reveal effects
 * 
 * Sets up:
 * - Parallax scroll effect for hero elements
 * - Scroll-reveal animations for content sections
 * - Dynamic art symbol swapping based on scroll position
 * - Accessibility checks for reduced-motion preference
 * 
 * @function initParallaxAndReveal
 * @returns {void}
 */
(function initParallaxAndReveal() {
  try {
    // === Accessibility Check ===
    // Respect user's reduced-motion preference (disables animations)
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    
    // === Element Selection ===
    // Parallax items with data-parallax-speed attribute
    const parallaxItems = Array.from(document.querySelectorAll('[data-parallax-speed]'));
    
    // All sections except hero
    const sectionItems = Array.from(document.querySelectorAll('.section')).filter(
      (el) => !el.classList.contains('hero-section')
    );
    
    // Objectives in the router section (for art symbol swapping)
    const objectiveItems = Array.from(document.querySelectorAll('.router-section__list .objective'));
    
    // All items that should reveal on scroll
    const revealItems = [...sectionItems, ...objectiveItems];

    // === Art Symbol Swapper Setup ===
    // References to elements involved in dynamic symbol swapping
    const artLogo = document.querySelector('.art-window__logo');
    const artWindow = document.querySelector('.router-section .art-window');
    const artLabel = document.querySelector('.art-window__figure-label');
    
    // State tracking for symbol swapping
    let currentArtId = null;       // Currently displayed symbol
    let lastSwitchTs = 0;          // Last update timestamp (throttle)

    /**
     * Art Symbol Data Mapping
     * Maps art IDs to SVG sources and alt text
     * @type {Object<string, {src: string, alt: string}>}
     */
    const artSymbols = {
      split: { src: 'src/assets/svg/genetic-data-svgrepo-com.svg', alt: 'Zerlegung' },
      assist: { src: 'src/assets/svg/assist-support.svg', alt: 'Assistenzsystem' },
      audience: { src: 'src/assets/svg/audience-people.svg', alt: 'Audience' },
      architecture: { src: 'src/assets/svg/architecture-modules.svg', alt: 'Architektur' },
      ai: { src: 'src/assets/svg/ai-brain.svg', alt: 'AI' },
      time: { src: 'src/assets/svg/time-calendar.svg', alt: 'Zeit' },
    };

    /**
     * Art Label Data Mapping
     * Maps art IDs to display labels
     * @type {Object<string, string>}
     */
    const artLabels = {
      split: 'ATOM',
      assist: 'ASSIST',
      audience: 'AUDIENCE',
      architecture: 'ARCHITECTURE',
      ai: 'AI',
      time: 'KALENDER',
    };

    /**
     * Update art symbol and label display
     * 
     * Swaps SVG image in art logo and updates label text.
     * Uses safe DOM manipulation (createElement) instead of innerHTML.
     * Skips update if symbol already displayed (early return).
     * 
     * @function setArtSymbol
     * @param {string} id - Art symbol ID from artSymbols map
     * @returns {void}
     */
    const setArtSymbol = (id) => {
      if (!artLogo) return;
      
      // Get symbol data or fallback to 'split'
      const symbolData = artSymbols[id] || artSymbols.split;
      
      // Skip if same symbol already displayed
      if (currentArtId === id) return;
      currentArtId = id;
      
      // === Update art logo image ===
      // Safe DOM manipulation without innerHTML
      try {
        // Clear existing content
        artLogo.innerHTML = '';
        
        // Create new image element
        const img = document.createElement('img');
        img.src = symbolData.src;
        img.alt = symbolData.alt;
        img.loading = 'lazy';  // Lazy load SVG
        
        // Add to DOM
        artLogo.appendChild(img);
      } catch (e) {
        console.warn('Failed to set art symbol:', e);
      }
      
      // === Update label text ===
      if (artLabel) {
        const label = artLabels[id] || 'ATOM';
        artLabel.textContent = `[ ${label} ]`;
      }
    };

    // === Initialize with default symbol ===
    setArtSymbol('split');

    // === Initialize reveal baseline ===
    // Add reveal class and default animation to all items
    revealItems.forEach((el) => {
      el.classList.add('reveal');
      if (!el.dataset.scroll) el.dataset.scroll = 'fade-up';
    });

    // === Skip animations if prefers reduced motion ===
    if (prefersReducedMotion?.matches) {
      revealItems.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    let ticking = false; // RequestAnimationFrame throttle flag

    /**
     * Update parallax offsets based on scroll position
     * 
     * Calculates parallax offset for each element based on:
     * - Current scroll position (window.scrollY)
     * - Element's data-parallax-speed value
     * - Updates CSS custom property --parallax-offset
     * 
     * Also:
     * - Detects nearest objective in viewport
     * - Updates art symbol if objective is near reference center
     * - Throttles updates to prevent excessive symbol swaps
     * 
     * @function updateParallax
     * @returns {void}
     */
    const updateParallax = () => {
      try {
        // === Update parallax offsets ===
        const scrollY = window.scrollY;
        parallaxItems.forEach((el) => {
          // Get parallax speed multiplier from data attribute
          const speed = parseFloat(el.dataset.parallaxSpeed || '0');
          
          // Calculate offset and set CSS custom property
          el.style.setProperty('--parallax-offset', `${scrollY * speed}px`);
        });

        // === Update art symbol based on scroll position ===
        if (objectiveItems.length) {
          const vh = window.innerHeight;
          
          // Get reference center (middle of art window or viewport)
          const artRect = artWindow ? artWindow.getBoundingClientRect() : null;
          const referenceCenter = artRect ? 
            artRect.top + artRect.height * 0.5 : 
            vh * 0.5;
          const snapThreshold = 120; // Pixel distance to trigger swap
          
          let best = null; // Best matching objective

          // === Find objective nearest to reference center ===
          objectiveItems.forEach((el) => {
            const rect = el.getBoundingClientRect();
            
            // Calculate visible height ratio (0.0 to 1.0)
            const visibleHeight = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
            const ratio = Math.max(0, visibleHeight) / Math.max(1, rect.height);
            
            // Skip if less than 50% visible
            if (ratio < 0.5) return;
            
            // Calculate distance from center to reference
            const center = rect.top + rect.height * 0.5;
            const dist = Math.abs(center - referenceCenter);
            
            // Track closest objective
            if (!best || dist < best.dist) {
              best = { el, dist };
            }
          });

          // === Update symbol if close enough ===
          if (best && best.dist <= snapThreshold) {
            const now = Date.now();
            
            // Throttle updates to prevent excessive swaps (420ms min interval)
            if (now - lastSwitchTs > 420) {
              setArtSymbol(best.el.dataset.artId || 'split');
              lastSwitchTs = now;
            }
          }
        }
      } catch (e) {
        console.warn('Parallax update error:', e);
      }
      
      ticking = false;
    };

    /**
     * Scroll event handler with RequestAnimationFrame throttling
     * 
     * Ensures updateParallax runs at most once per frame (~60fps)
     * rather than firing on every scroll event.
     * 
     * @function onScroll
     * @returns {void}
     */
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    /**
     * IntersectionObserver - Detect elements entering viewport
     * 
     * Marks sections as visible when they become visible.
     * Uses CSS to animate fade-in transition.
     * Unobserves after first visibility to save resources.
     * 
     * threshold: Trigger at 8% visibility
     * rootMargin: Extend detection zone by 12% above, 6% below
     */
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Wait for intersection
          if (!entry.isIntersecting) return;
          
          // Mark as visible (CSS handles animation)
          entry.target.classList.add('is-visible');
          
          // Stop observing (animation complete, no need to watch)
          revealObserver.unobserve(entry.target);
        });
      },
      { 
        threshold: 0.08,           // Trigger at 8% visibility
        rootMargin: '12% 0px -6%'  // Extended detection zone
      }
    );

    // === Observe all reveal items ===
    revealItems.forEach((el) => revealObserver.observe(el));

    // === Attach scroll event listener ===
    // { passive: true } for better scroll performance
    window.addEventListener('scroll', onScroll, { passive: true });
    
    // === Attach resize event listener ===
    // Recalculate parallax on window resize
    window.addEventListener('resize', updateParallax);
    
    // === Initial update ===
    // Ensures parallax is set correctly on page load
    updateParallax();
  } catch (e) {
    console.error('Parallax and reveal initialization failed:', e);
  }
})();
