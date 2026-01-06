/**
 * ============================================
 * PROFILE POPUP - Benutzer-Profil Anzeige
 * ============================================
 * 
 * Zeigt Benutzer-Profil mit:
 * - Avatar mit Initialen
 * - Name und E-Mail
 * - Bio/Beschreibung
 * - Registrierungsdatum
 */

class ProfilePopup {
  /**
   * Konstruktor - Initialisiert Profile Popup
   */
  constructor() {
    try {
      this.popup = document.getElementById('profile-popup');
      if (!this.popup) {
        console.warn('Profile popup not found');
        return;
      }

      this.overlay = this.popup.querySelector('.auth-modal__overlay');
      this.closeBtn = this.popup.querySelector('.auth-modal__close');

      this.init();
    } catch (e) {
      console.error('ProfilePopup init error:', e);
    }
  }

  /**
   * init() - Registriert alle Event-Listener
   */
  init() {
    try {
      // Close button
      this.closeBtn?.addEventListener('click', () => this.close());
      
      // Overlay click to close
      this.overlay?.addEventListener('click', () => this.close());
      
      // ESC key to close
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.popup?.classList.contains('active')) {
          this.close();
        }
      });

      // Profile button from nav
      const profileBtn = document.querySelector('a[href="/profile"]');
      if (profileBtn) {
        profileBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.open();
        });
      }

      console.log('ProfilePopup initialized');
    } catch (e) {
      console.error('ProfilePopup init error:', e);
    }
  }

  /**
   * open() - Öffnet das Profil-Popup
   * - Füllt Benutzer-Daten
   * - Berechnet Avatar-Initialen
   * - Zeigt Popup an
   */
  open() {
    try {
      if (!window.authManager || !window.authManager.isLoggedIn()) {
        console.warn('User not logged in');
        return;
      }

      const user = window.authManager.getUser();
      
      // Fülle Benutzer-Daten
      const nameEl = document.getElementById('popup-name');
      const emailEl = document.getElementById('popup-email');
      const dateEl = document.getElementById('popup-date');
      const avatarEl = document.getElementById('popup-avatar');
      const bioEl = document.getElementById('popup-bio');

      if (nameEl) nameEl.textContent = user.name || 'Benutzer';
      if (emailEl) emailEl.textContent = user.email || '—';
      
      // Avatar mit Initialen
      if (avatarEl && user.name) {
        avatarEl.textContent = this.getInitials(user.name);
      }

      // Bio
      if (bioEl) {
        bioEl.textContent = user.bio || `Willkommen auf KERNWERK SYSTEMS! Ein kognitives Entlastungssystem für handlungsfähiges Arbeiten.`;
      }
      
      // Registrierungsdatum
      if (dateEl && user.loginTime) {
        const date = new Date(user.loginTime);
        const dateStr = date.toLocaleDateString('de-DE', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        dateEl.textContent = dateStr;
      }

      // Zeige Popup
      this.popup.classList.add('active');
      document.body.style.overflow = 'hidden';

      console.log('Profile popup opened');
    } catch (e) {
      console.warn('Error opening popup:', e);
    }
  }

  /**
   * close() - Schließt das Profil-Popup
   */
  close() {
    try {
      this.popup?.classList.remove('active');
      document.body.style.overflow = '';
      console.log('Profile popup closed');
    } catch (e) {
      console.warn('Error closing popup:', e);
    }
  }

  /**
   * getInitials() - Berechnet Avatar-Initialen aus Namen
   * @param {string} name - Benutzername
   * @returns {string} - Initialen oder Fallback
   */
  getInitials(name) {
    if (!name) return '👤';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
}

// ============================================
// Global Instance
// ============================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.profilePopup = new ProfilePopup();
  });
} else {
  window.profilePopup = new ProfilePopup();
}
