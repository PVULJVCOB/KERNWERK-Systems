/**
 * @fileoverview AuthModal - Login/Register Modal Component
 * Handles user authentication UI with form validation, error handling,
 * and integration with AuthManager for session persistence.
 * 
 * Features:
 * - Tab switching between login and register forms
 * - Form validation with comprehensive error messages
 * - Password confirmation and strength checking
 * - Terms of service acceptance verification
 * - Toast notifications for user feedback
 * - Keyboard shortcuts (ESC to close)
 * - Accessible ARIA attributes
 * 
 * @version 1.0.0
 * @author Development Team
 */

/**
 * AuthModal Class - Main modal component for authentication forms
 * 
 * Manages the login/register modal overlay with:
 * - Tab switching functionality
 * - Form validation and submission handling
 * - User feedback through toast notifications
 * - Keyboard event listeners
 * - Integration with global AuthManager instance
 * 
 * @class AuthModal
 */
class AuthModal {
  /**
   * Constructor - Initialize modal and event listeners
   * 
   * Sets up DOM element references and initializes event handlers.
   * Uses try-catch to gracefully handle initialization errors.
   * 
   * @constructor
   */
  constructor() {
    try {
      // Get reference to main modal container
      this.modal = document.getElementById('auth-modal');
      if (!this.modal) {
        console.warn('Auth modal element not found');
        return;
      }

      // Get modal child elements
      this.overlay = this.modal.querySelector('.auth-modal__overlay');
      this.closeBtn = this.modal.querySelector('.auth-modal__close');
      this.tabs = this.modal.querySelectorAll('.auth-modal__tab');
      this.forms = this.modal.querySelectorAll('.auth-modal__form');
      
      // Get specific form references
      this.loginForm = document.getElementById('login-form');
      this.registerForm = document.getElementById('register-form');

      // Validate required elements exist
      if (!this.overlay || !this.closeBtn) {
        console.warn('Auth modal: Missing required child elements');
        return;
      }

      this.init();
    } catch (e) {
      console.error('Auth modal initialization failed:', e);
    }
  }

  /**
   * Initialize event listeners and modal functionality
   * 
   * Sets up:
   * - Close button click handler
   * - Overlay click handler (click outside to close)
   * - Tab switching functionality
   * - Form submission handlers
   * - Keyboard shortcuts (ESC to close)
   * - Navigation button click handlers
   * 
   * @method init
   * @returns {void}
   */
  init() {
    try {
      // === Close Modal Handlers ===
      // Close when X button clicked
      this.closeBtn?.addEventListener('click', () => this.close());
      
      // Close when clicking on overlay (outside modal)
      this.overlay?.addEventListener('click', () => this.close());
      
      // === Keyboard Event Handler ===
      // Allow ESC key to close modal
      document.addEventListener('keydown', (e) => {
        try {
          if (e.key === 'Escape' && this.modal?.classList.contains('active')) {
            this.close();
          }
        } catch (err) {
          console.warn('Keyboard handler error:', err);
        }
      });

      // === Tab Switch Handlers ===
      // Handle tab buttons (login/register switching)
      this.tabs?.forEach(tab => {
        tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
      });

      // === Form Submit Handlers ===
      // Handle login form submission
      this.loginForm?.addEventListener('submit', (e) => this.handleLoginSubmit(e));
      
      // Handle register form submission
      this.registerForm?.addEventListener('submit', (e) => this.handleRegisterSubmit(e));

      // === Navigation Button Handlers ===
      // Trigger modal from login button in navigation
      const loginBtn = document.querySelector('a[href="/login"]');
      if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.open('login');
        });
      }

      // Trigger modal from register button in navigation
      const registerBtn = document.querySelector('a[href="/atomize"]');
      if (registerBtn) {
        registerBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.open('register');
        });
      }
    } catch (e) {
      console.error('Auth modal init error:', e);
    }
  }

  /**
   * Open modal and switch to specified tab
   * 
   * Shows the modal overlay and switches to requested tab.
   * Disables body scroll to prevent background scrolling.
   * 
   * @method open
   * @param {string} [tab='login'] - Tab to display ('login' or 'register')
   * @returns {void}
   */
  open(tab = 'login') {
    try {
      if (!this.modal) return;
      
      // Add active class to show modal
      this.modal.classList.add('active');
      
      // Switch to requested tab
      this.switchTab(tab);
      
      // Prevent body scrolling while modal is open
      if (document.body) {
        document.body.style.overflow = 'hidden';
      }
    } catch (e) {
      console.warn('Error opening modal:', e);
    }
  }

  /**
   * Close modal and restore scrolling
   * 
   * Hides the modal overlay and allows background scrolling again.
   * 
   * @method close
   * @returns {void}
   */
  close() {
    try {
      if (!this.modal) return;
      
      // Remove active class to hide modal
      this.modal.classList.remove('active');
      
      // Restore body scrolling
      if (document.body) {
        document.body.style.overflow = '';
      }
    } catch (e) {
      console.warn('Error closing modal:', e);
    }
  }

  /**
   * Switch between login and register tabs
   * 
   * Updates tab button active state and shows/hides corresponding form.
   * Uses CSS classes for visibility control.
   * 
   * @method switchTab
   * @param {string} tabName - Tab identifier ('login' or 'register')
   * @returns {void}
   */
  switchTab(tabName) {
    try {
      if (!tabName) return;
      
      // Update tab button active states
      this.tabs?.forEach(tab => {
        const isActive = tab.dataset.tab === tabName;
        tab.classList.toggle('auth-modal__tab--active', isActive);
      });

      // Update form visibility
      this.forms?.forEach(form => {
        const isActive = form.id === `${tabName}-form`;
        form.classList.toggle('auth-modal__form--active', isActive);
      });
    } catch (e) {
      console.warn('Error switching tabs:', e);
    }
  }

  /**
   * Display toast notification to user
   * 
   * Creates a temporary toast message that auto-dismisses after 3 seconds.
   * Includes ARIA attributes for accessibility.
   * Falls back to alert() if toast creation fails.
   * 
   * Types: 'success', 'error', 'warning', 'info'
   * 
   * @method showMessage
   * @param {string} message - Message to display
   * @param {string} [type='error'] - Message type for styling
   * @returns {void}
   */
  showMessage(message, type = 'error') {
    try {
      // Create toast element
      const toast = document.createElement('div');
      toast.className = `auth-toast auth-toast--${type}`;
      toast.textContent = message;
      
      // Add accessibility attributes
      toast.setAttribute('role', 'alert');
      toast.setAttribute('aria-live', 'assertive');
      
      // Add to DOM
      document.body.appendChild(toast);
      
      // Animate in
      setTimeout(() => toast.classList.add('auth-toast--visible'), 10);
      
      // Animate out and remove after 3 seconds
      setTimeout(() => {
        toast.classList.remove('auth-toast--visible');
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    } catch (e) {
      console.warn('Toast notification error:', e);
      // Fallback to alert if toast fails
      alert(message);
    }
  }

  /**
   * Validate email format
   * 
   * Uses regex pattern to check email validity.
   * Returns false for empty, non-string, or invalid formats.
   * 
   * Pattern: anything@anything.anything
   * 
   * @method isValidEmail
   * @param {string} email - Email address to validate
   * @returns {boolean} True if email is valid format
   */
  isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Handle login form submission
   * 
   * Validates:
   * - All fields filled
   * - Email format valid
   * - Password not empty
   * 
   * On success:
   * - Saves user to localStorage via AuthManager
   * - Shows success toast
   * - Closes modal after delay
   * 
   * TODO: Replace demo with actual API call to backend
   * 
   * @method handleLoginSubmit
   * @param {Event} e - Submit event from form
   * @returns {void}
   */
  handleLoginSubmit(e) {
    e.preventDefault();
    
    try {
      // Get form input elements
      const emailInput = document.getElementById('login-email');
      const passwordInput = document.getElementById('login-password');
      
      if (!emailInput || !passwordInput) {
        this.showMessage('Formular-Elemente nicht gefunden');
        return;
      }

      // Get and trim input values
      const email = emailInput.value.trim();
      const password = passwordInput.value;

      // === VALIDATION ===
      // Check all fields filled
      if (!email || !password) {
        this.showMessage('Bitte füllen Sie alle Felder aus');
        return;
      }

      // Check email format
      if (!this.isValidEmail(email)) {
        this.showMessage('Bitte geben Sie eine gültige E-Mail ein');
        return;
      }

      // TODO: Send actual login request to backend API
      console.log('Login attempt:', { email, password: '***' });
      
      // === DEMO MODE - Simulate successful login ===
      const userData = {
        name: email.split('@')[0], // Use email username as name
        email: email
      };
      
      // Save user to localStorage and update UI
      if (window.authManager) {
        window.authManager.saveUser(userData);
        this.showMessage(`Willkommen zurück, ${userData.name}!`, 'success');
        setTimeout(() => this.close(), 1500);
      } else {
        this.showMessage('Login submitted! (Demo - noch nicht implementiert)', 'success');
      }
      
    } catch (e) {
      console.error('Login submit error:', e);
      this.showMessage('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    }
  }

  /**
   * Handle register form submission
   * 
   * Validates:
   * - All fields filled
   * - Email format valid
   * - Password at least 8 characters
   * - Password and confirmation match
   * - Terms of service accepted
   * 
   * On success:
   * - Saves user to localStorage via AuthManager
   * - Shows success toast with username
   * - Closes modal after delay
   * 
   * TODO: Replace demo with actual API call to backend
   * 
   * @method handleRegisterSubmit
   * @param {Event} e - Submit event from form
   * @returns {void}
   */
  handleRegisterSubmit(e) {
    e.preventDefault();

    try {
      // Get form input elements
      const nameInput = document.getElementById('register-name');
      const emailInput = document.getElementById('register-email');
      const passwordInput = document.getElementById('register-password');
      const passwordConfirmInput = document.getElementById('register-password-confirm');
      const termsInput = document.getElementById('register-terms');

      // Validate form elements exist
      if (!nameInput || !emailInput || !passwordInput || !passwordConfirmInput || !termsInput) {
        this.showMessage('Formular-Elemente nicht gefunden');
        return;
      }

      // Get and trim input values
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const passwordConfirm = passwordConfirmInput.value;
      const terms = termsInput.checked;

      // === VALIDATION ===
      // Check all fields filled
      if (!name || !email || !password || !passwordConfirm) {
        this.showMessage('Bitte füllen Sie alle Felder aus');
        return;
      }

      // Check email format validity
      if (!this.isValidEmail(email)) {
        this.showMessage('Bitte geben Sie eine gültige E-Mail ein');
        return;
      }

      // Check password minimum length
      if (password.length < 8) {
        this.showMessage('Das Passwort muss mindestens 8 Zeichen lang sein');
        return;
      }

      // Check password confirmation matches
      if (password !== passwordConfirm) {
        this.showMessage('Die Passwörter stimmen nicht überein');
        return;
      }

      // Check terms of service accepted
      if (!terms) {
        this.showMessage('Bitte akzeptieren Sie die Bedingungen');
        return;
      }

      // TODO: Send actual registration request to backend API
      console.log('Register attempt:', { name, email, password: '***' });
      
      // === DEMO MODE - Simulate successful registration ===
      const userData = {
        name: name,
        email: email
      };
      
      // Save user to localStorage and update UI
      if (window.authManager) {
        window.authManager.saveUser(userData);
        this.showMessage(`Willkommen, ${name}! Ihr Konto wurde erstellt.`, 'success');
        setTimeout(() => this.close(), 1500);
      } else {
        this.showMessage('Registrierung submitted! (Demo - noch nicht implementiert)', 'success');
      }
      
    } catch (e) {
      console.error('Register submit error:', e);
      this.showMessage('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    }
  }
}

/**
 * IIFE - Initialize AuthModal when DOM is ready
 * 
 * Waits for DOM to load before instantiating AuthModal.
 * Handles both DOMContentLoaded and already-loaded states.
 * 
 * @function
 * @returns {void}
 */
(function initAuthModal() {
  try {
    const initFn = () => {
      try {
        new AuthModal();
      } catch (e) {
        console.error('Auth modal instantiation failed:', e);
      }
    };

    // Check if DOM is already loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initFn);
    } else {
      initFn();
    }
  } catch (e) {
    console.error('Auth modal init wrapper error:', e);
  }
})();
