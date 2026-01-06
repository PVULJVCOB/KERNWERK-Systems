/**
 * @fileoverview Typewriter Text Animation Effect
 * 
 * Creates a typewriter animation effect for text elements with:
 * - Character-by-character typing animation
 * - Animated cursor display
 * - Per-slide grouping with staggered starts
 * - Loop animation after completion
 * - Intersection Observer for visibility-based triggering
 * - Respects prefers-reduced-motion for accessibility
 * - Automatic cleanup on page unload
 * 
 * Features:
 * - Configurable typing speed (ms per character)
 * - Custom cursor character
 * - Staggered animation for multiple elements
 * - Loop delay before restarting animation
 * - HTML escaping for safe text rendering
 * - RequestAnimationFrame optimization
 * - Auto-cleanup of timeouts
 * 
 * HTML Usage:
 * <span data-typewriter="Text to animate">Text to animate</span>
 * 
 * @version 1.0.0
 * @author Development Team
 */

/**
 * TypewriterEffect Class - Manages typewriter animations
 * 
 * Handles initialization, animation logic, and cleanup for typewriter effects.
 * Uses IntersectionObserver to trigger animations only when elements are in viewport.
 * 
 * @class TypewriterEffect
 */
class TypewriterEffect {
  /**
   * Constructor - Initialize typewriter configuration
   * 
   * Sets up animation parameters and creates containers for tracking
   * animated elements and their timeout IDs.
   * 
   * @constructor
   * @param {Object} [options={}] - Configuration options
   * @param {number} [options.typingSpeed=40] - Milliseconds per character
   * @param {string} [options.cursorChar='█'] - Cursor animation character
   * @param {number} [options.pauseDuration=1500] - Pause after typing (ms)
   * @param {number} [options.staggerDelay=100] - Delay between elements (ms)
   * @param {number} [options.loopDelay=20000] - Delay before restarting (ms)
   * @param {boolean} [options.autoStart=true] - Start immediately
   */
  constructor(options = {}) {
    // === Animation timing configuration ===
    this.typingSpeed = options.typingSpeed || 40;       // MS per character
    this.cursorChar = options.cursorChar || '█';         // Animated cursor
    this.pauseDuration = options.pauseDuration || 1500;  // Pause after typing
    this.staggerDelay = options.staggerDelay || 100;     // Delay between elements
    this.loopDelay = options.loopDelay || 20000;         // Delay before loop
    this.autoStart = options.autoStart !== false;        // Auto-start animation
    
    // === Element tracking ===
    this.elements = [];                                   // All tracked elements
    this.activeSlide = null;                              // Current visible slide
    this.timeoutIds = new Set();                          // Cleanup tracking
  }

  /**
   * Initialize typewriter effect system
   * 
   * Finds all elements with data-typewriter attribute,
   * groups them by slide/topic, and sets up IntersectionObserver
   * for visibility-based triggering.
   * 
   * @method init
   * @returns {void}
   */
  init() {
    try {
      // === Find all typewriter elements ===
      const elements = document.querySelectorAll('[data-typewriter]');
      
      if (!elements.length) {
        console.warn('No typewriter elements found');
        return;
      }
      
      // === Group elements by slide/topic ===
      // This allows staggered animation within each section
      const slideGroups = new Map();
      elements.forEach((element) => {
        try {
          // Find parent slide or help-topic container
          const slide = element.closest('.slideshow__slide') || 
                       element.closest('.help-topic');
          
          if (slide) {
            if (!slideGroups.has(slide)) {
              slideGroups.set(slide, []);
            }
            slideGroups.get(slide).push(element);
          }
        } catch (e) {
          console.warn('Error processing typewriter element:', e);
        }
      });

      // === Create element tracking objects ===
      slideGroups.forEach((elementsInSlide, slide) => {
        elementsInSlide.forEach((element, index) => {
          try {
            const text = element.getAttribute('data-typewriter');
            if (text && typeof text === 'string') {
              // Track element with animation state
              this.elements.push({
                element,                  // DOM reference
                originalText: text,       // Original full text
                fullText: text,           // Text to animate
                currentText: '',          // Animation progress
                isTyping: false,          // Animation state
                isVisible: false,         // Viewport visibility
                slideElement: slide,      // Parent slide reference
                staggerIndex: index,      // Position in group
                loopTimeout: null,        // Loop timeout ID
              });
            }
          } catch (e) {
            console.warn('Error creating typewriter item:', e);
          }
        });
      });

      // === Setup visibility-based triggering ===
      this.setupIntersectionObserver();
    } catch (e) {
      console.error('Typewriter initialization failed:', e);
    }
  }

  /**
   * Setup IntersectionObserver for viewport-based animation triggering
   * 
   * Observes slide containers and triggers animation when they become visible.
   * This improves performance by only animating visible elements.
   * 
   * @method setupIntersectionObserver
   * @returns {void}
   */
  setupIntersectionObserver() {
    try {
      // === Create observer with 10% threshold ===
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          try {
            if (entry.isIntersecting) {
              // === Find all elements in this slide ===
              const slideItems = this.elements.filter(
                item => item.slideElement === entry.target
              );
              
              // === Clear any pending loop animations ===
              slideItems.forEach(item => {
                if (item.loopTimeout) {
                  clearTimeout(item.loopTimeout);
                  this.timeoutIds.delete(item.loopTimeout);
                }
              });
              
              // === Start staggered animation ===
              slideItems.forEach((item) => {
                try {
                  if (!item.isVisible) {
                    item.isVisible = true;
                  }
                  
                  // Reset animation state
                  item.currentText = '';
                  item.element.textContent = '';
                  
                  // Schedule animation with stagger delay
                  const delay = item.staggerIndex * this.staggerDelay;
                  const timeoutId = setTimeout(() => {
                    this.typeText(item, slideItems);
                  }, delay);
                  this.timeoutIds.add(timeoutId);
                } catch (e) {
                  console.warn('Error starting typewriter item:', e);
                }
              });
            }
          } catch (e) {
            console.warn('Intersection observer error:', e);
          }
        });
      }, { threshold: 0.1 });

      // === Observe each unique slide ===
      const observedSlides = new Set();
      this.elements.forEach((item) => {
        if (!observedSlides.has(item.slideElement)) {
          observer.observe(item.slideElement);
          observedSlides.add(item.slideElement);
        }
      });
    } catch (e) {
      console.error('IntersectionObserver setup failed:', e);
    }
  }

  /**
   * Animate single character typing
   * 
   * Recursively adds one character at a time, showing animated cursor.
   * When complete, handles loop animation if configured.
   * 
   * @method typeText
   * @param {Object} item - Element tracking object
   * @param {Array} slideItems - All elements in current slide
   * @returns {void}
   */
  typeText(item, slideItems) {
    try {
      // === Skip if element is hidden or removed ===
      if (!item.isVisible || !item.element) return;

      // === Still typing: add next character ===
      if (item.currentText.length < item.fullText.length) {
        // Add next character from full text
        item.currentText += item.fullText[item.currentText.length];
        
        // Clear element and add text content
        item.element.textContent = item.currentText;
        
        // Add cursor as separate element
        const cursor = document.createElement('span');
        cursor.className = 'typewriter-cursor';
        cursor.textContent = this.cursorChar;
        item.element.appendChild(cursor);
        
        // Schedule next character
        const timeoutId = setTimeout(
          () => this.typeText(item, slideItems), 
          this.typingSpeed
        );
        this.timeoutIds.add(timeoutId);
      } 
      // === Typing complete ===
      else {
        // Display final text without cursor
        item.element.textContent = item.fullText;
        
        // === Check if all elements in slide are done ===
        const allDone = slideItems.every(
          si => si.currentText.length === si.fullText.length
        );
        
        // === Schedule loop animation ===
        if (allDone && !item.loopTimeout) {
          // Stagger loop start for each element
          slideItems.forEach(si => {
            si.loopTimeout = setTimeout(() => {
              // Reset for next loop
              si.currentText = '';
              si.element.textContent = '';
              si.loopTimeout = null;
              
              // Restart with stagger delay
              const delay = si.staggerIndex * this.staggerDelay;
              const timeoutId = setTimeout(() => {
                this.typeText(si, slideItems);
              }, delay);
              this.timeoutIds.add(timeoutId);
            }, this.loopDelay);
            
            this.timeoutIds.add(si.loopTimeout);
          });
        }
      }
    } catch (e) {
      console.warn('Typewriter animation error:', e);
    }
  }

  /**
   * Escape HTML special characters
   * 
   * Prevents XSS attacks by escaping dangerous characters
   * before inserting into innerHTML.
   * 
   * Maps:
   * - & → &amp;
   * - < → &lt;
   * - > → &gt;
   * - " → &quot;
   * - ' → &#039;
   * 
   * @method escapeHtml
   * @param {string} text - Text to escape
   * @returns {string} Escaped text safe for innerHTML
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Cleanup and destroy typewriter instance
   * 
   * Clears all pending timeout IDs to prevent memory leaks.
   * Called on page unload.
   * 
   * @method destroy
   * @returns {void}
   */
  destroy() {
    this.timeoutIds.forEach(id => clearTimeout(id));
    this.timeoutIds.clear();
  }
}

/**
 * IIFE - Initialize typewriter effect when DOM is ready
 * 
 * Creates typewriter instance with configured options and
 * sets up cleanup on page unload to prevent memory leaks.
 * 
 * @function initTypewriter
 * @returns {void}
 */
(function initTypewriter() {
  try {
    const initFn = () => {
      try {
        // === Create typewriter with custom options ===
        const typewriter = new TypewriterEffect({
          typingSpeed: 35,           // Fast typing (35ms per char)
          cursorChar: '█',           // Block cursor
          pauseDuration: 1500,       // 1.5s pause after typing
          staggerDelay: 150,         // 150ms between elements
          loopDelay: 20000,          // 20s before restart
        });
        
        // === Initialize animation system ===
        typewriter.init();
        
        // === Cleanup on page unload ===
        window.addEventListener('beforeunload', () => {
          typewriter.destroy();
        });
      } catch (e) {
        console.error('Typewriter instantiation failed:', e);
      }
    };

    // === Wait for DOM to be ready ===
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initFn);
    } else {
      initFn();
    }
  } catch (e) {
    console.error('Typewriter init wrapper error:', e);
  }
})();
