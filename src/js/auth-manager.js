/**
 * ============================================
 * AUTH MANAGER - Zentrale Authentifizierungsverwaltung
 * ============================================
 * 
 * Verwaltet:
 * - Benutzer-Login/-Logout
 * - LocalStorage Persistierung
 * - Navigation UI Updates
 * - Toast Notifications
 */

class AuthManager {
  /**
   * Konstruktor - Initialisiert AuthManager
   */
  constructor() {
    this.storageKey = 'kernwerk_auth';  // LocalStorage Schlüssel
    this.user = null;                    // Aktueller Benutzer
    this.init();
  }

  /**
   * init() - Initialisiert den Auth Manager
   * - Lädt Benutzer aus localStorage
   * - Aktualisiert Navigation
   * - Registriert Event-Listener
   */
  init() {
    try {
      this.loadUser();
      this.updateNavigation();
      this.setupLogoutHandler();
      console.log('AuthManager initialized');
    } catch (e) {
      console.error('Auth manager initialization failed:', e);
    }
  }

  /**
   * loadUser() - Lädt Benutzerdaten aus localStorage
   */
  loadUser() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.user = JSON.parse(stored);
        console.log('User loaded from storage:', this.user.email);
      }
    } catch (e) {
      console.warn('Failed to load user from storage:', e);
      this.user = null;
    }
  }

  /**
   * saveUser() - Speichert Benutzerdaten in localStorage
   * @param {Object} userData - Benutzerdaten (name, email)
   * @returns {boolean} - Erfolgreich gespeichert
   */
  saveUser(userData) {
    try {
      this.user = {
        name: userData.name,
        email: userData.email,
        loginTime: new Date().toISOString()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(this.user));
      this.updateNavigation();
      console.log('User saved:', this.user.email);
      return true;
    } catch (e) {
      console.error('Failed to save user:', e);
      return false;
    }
  }

  /**
   * logout() - Meldet Benutzer ab
   * - Löscht Benutzerdaten
   * - Aktualisiert Navigation
   * - Zeigt Toast-Benachrichtigung
   * @returns {boolean} - Erfolgreich abgemeldet
   */
  logout() {
    try {
      this.user = null;
      localStorage.removeItem(this.storageKey);
      this.updateNavigation();
      this.showToast('Erfolgreich abgemeldet', 'success');
      console.log('User logged out');
      return true;
    } catch (e) {
      console.error('Logout failed:', e);
      return false;
    }
  }

  /**
   * isLoggedIn() - Prüft ob Benutzer angemeldet ist
   * @returns {boolean}
   */
  isLoggedIn() {
    return this.user !== null;
  }

  /**
   * getUser() - Gibt aktuellen Benutzer zurück
   * @returns {Object|null}
   */
  getUser() {
    return this.user;
  }

  /**
   * updateNavigation() - Aktualisiert Navigation basierend auf Login-Status
   * - Zeigt/versteckt Login/Register Buttons
   * - Zeigt/versteckt Profil/Logout Buttons
   */
  updateNavigation() {
    try {
      const loggedOutElements = document.querySelectorAll('.nav-auth-logged-out');
      const loggedInElements = document.querySelectorAll('.nav-auth-logged-in');
      
      if (this.isLoggedIn()) {
        // Benutzer angemeldet: Verstecke Login, zeige Profil
        loggedOutElements.forEach(el => el.style.display = 'none');
        loggedInElements.forEach(el => el.style.display = 'flex');
      } else {
        // Benutzer nicht angemeldet: Zeige Login, verstecke Profil
        loggedOutElements.forEach(el => el.style.display = 'flex');
        loggedInElements.forEach(el => el.style.display = 'none');
      }
      console.log('Navigation updated - isLoggedIn:', this.isLoggedIn());
    } catch (e) {
      console.warn('Navigation update failed:', e);
    }
  }

  /**
   * setupLogoutHandler() - Registriert Logout Button Event-Listener
   */
  setupLogoutHandler() {
    try {
      const logoutBtn = document.querySelector('a[href="/logout"]');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.logout();
        });
      }
    } catch (e) {
      console.warn('Logout handler setup failed:', e);
    }
  }

  /**
   * showToast() - Zeigt Toast-Benachrichtigung an
   * @param {string} message - Nachrichtentext
   * @param {string} type - Typ: 'info', 'success', 'error'
   */
  showToast(message, type = 'info') {
    try {
      const toast = document.createElement('div');
      toast.className = `auth-toast auth-toast--${type}`;
      toast.textContent = message;
      toast.setAttribute('role', 'alert');
      toast.setAttribute('aria-live', 'assertive');
      
      document.body.appendChild(toast);
      
      // Animation: Einblenden
      setTimeout(() => toast.classList.add('auth-toast--visible'), 10);
      
      // Animation: Ausblenden nach 3 Sekunden
      setTimeout(() => {
        toast.classList.remove('auth-toast--visible');
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    } catch (e) {
      console.warn('Toast error:', e);
    }
  }
}

// ============================================
// Global Instance
// ============================================
window.authManager = new AuthManager();
