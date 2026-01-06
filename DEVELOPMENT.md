# KERNWERK SYSTEMS - Entwicklungs-Dokumentation

## Architektur & Best Practices

### 1. JavaScript-Module & Error Handling
Alle JS-Dateien verwenden:
- ✅ **IIFE-Wrapper** für sichere Namespacing und Error Handling
- ✅ **Try-Catch Blöcke** um Runtime-Fehler abzufangen
- ✅ **CSS.escape()** für sichere DOM-Queries
- ✅ **textContent statt innerHTML** wo möglich (XSS-Prevention)
- ✅ **Element-Null-Checks** vor DOM-Manipulation
- ✅ **Timeout-Cleanup** zur Memory-Leak-Prävention

### 2. CSS-Grid Breakpoints

```css
/* Mobile First Approach */
.grid-layout {
  grid-template-columns: repeat(8, 1fr);   /* 599px - 759px */
}

@media (min-width: 760px) {
  .grid-layout {
    grid-template-columns: repeat(16, 1fr); /* 760px - 959px */
  }
}

@media (min-width: 960px) {
  .grid-layout {
    grid-template-columns: repeat(24, 1fr); /* 960px + */
  }
}
```

**Breakpoint-Strategie:**
- **< 600px**: 8-Spalten Grid, optimiert für Mobile
- **600-759px**: Tablet-Portrait (noch 8 Spalten)
- **760-959px**: Tablet-Landscape (16 Spalten)
- **960px+**: Desktop (24 Spalten)

### 3. CSS Custom Properties

Definiert in [main.css](src/css/main.css):
```css
--accentColor: #FFD700          /* Primärer Accent */
--fontColor: #1e1e1e            /* Textfarbe */
--buttonColor: #1e1e1e33        /* Semi-transparent Button */
--spacing-*: 4px - 56px         /* Spacing Scale */
```

### 4. Performance-Optimierungen

- ✅ **Lazy Loading** für Bilder (`img.loading = 'lazy'`)
- ✅ **RequestAnimationFrame** für Scroll-Events
- ✅ **IntersectionObserver** für sichtbarkeits-basierte Animation
- ✅ **Passive Event Listeners** für Scroll/Resize
- ✅ **CSS Transform** statt Position für Parallax (GPU-Beschleunigung)

### 5. SEO & Strukturierte Daten

- ✅ **JSON-LD Schema.org** für SoftwareApplication
- ✅ **Open Graph Meta-Tags** für Social Sharing
- ✅ **Twitter Card** Integration
- ✅ **Canonical URL** zur Duplicate-Content Prevention
- ✅ **Sitemap.xml** und **robots.txt**
- ✅ **Proper lang-Attribute** (de) für Deutsch

### 6. Accessibility (a11y)

- ✅ **Semantic HTML** (nav, section, main)
- ✅ **ARIA Labels** auf interaktiven Elementen
- ✅ **prefers-reduced-motion** Respekt
- ✅ **Alt Text** auf Bildern
- ✅ **Keyboard Navigation** (Hotkeys)
- ✅ **Screen Reader** Support

### 7. Security Best Practices

- ✅ **innerHTML Vermeidung** → Element.createElement()
- ✅ **HTML-Escaping** für dynamische Texte
- ✅ **CSS.escape()** für dynamische Selektoren
- ✅ **CSP-Ready** (aber nicht forciert für GitHub Pages)
- ✅ **Keine Inline Scripts** im HTML

### 8. Git & Versionskontrolle

`.gitignore` schließt aus:
- OS Files (.DS_Store, Thumbs.db)
- Environment (.venv, .env)
- IDEs (.vscode, .idea)
- Build Outputs (dist, build)

## Testing & Validierung

### Lighthouse Audit
```bash
# Desktop (ideal)
- Performance: 95+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

# Mobile
- Performance: 80+ (due to animation complexity)
```

### Manuelle Tests
- ✅ Hotkeys: K, G, R, L, P auf verschiedenen Seiten testen
- ✅ Parallax: Scroll auf Desktop & Mobile validieren
- ✅ Typewriter: Animation in allen Browsern checken
- ✅ Responsive: Alle Breakpoints auf echten Geräten testen

### Browser-Kompatibilität
- Chrome/Edge: 100%
- Firefox: 100%
- Safari: 100% (iOS 12+)
- Mobile: Getestet auf iOS & Android

## Deployment Checkliste

- ✅ Minify CSS/JS für Production
- ✅ Optimize Bilder (WebP + Fallback)
- ✅ Setup GitHub Pages Deployment
- ✅ Enable HTTPS + HSTS
- ✅ Configure Custom Domain (CNAME)
- ✅ Test Hotlinks & relative Pfade
- ✅ Verify Sitemap & robots.txt

## Änderungsprotokoll (2026-01-06)

**v1.1 - Production Ready**
- Deduplizierung SVG-Icons + aria-hidden
- Security: innerHTML → createElement()
- Error Handling in allen JS-Modulen
- SEO: JSON-LD Schema.org + Sitemap
- .gitignore + robots.txt hinzugefügt
- Typewriter: HTML-Escaping + Timeout-Cleanup

## Kontakt & Support

- Repository: https://github.com/PVULJVCOB/KERNWERK-Systems
- Issues: Bitte via GitHub Issues melden
- Hosting: GitHub Pages + Custom Domain
