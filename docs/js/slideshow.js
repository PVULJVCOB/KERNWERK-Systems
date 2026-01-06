// Slider mit Pfeilen und Mehrfach-Highlight der sichtbaren Karten
function initSlideshow({ sliderId, dotsId, prevId, nextId }) {
  const slider = document.getElementById(sliderId);
  const dotsContainer = document.getElementById(dotsId);
  const prevBtn = document.getElementById(prevId);
  const nextBtn = document.getElementById(nextId);
  if (!slider || !dotsContainer || !prevBtn || !nextBtn) return;

  const slides = Array.from(slider.querySelectorAll('.slideshow__slide'));
  if (!slides.length) return;

  dotsContainer.innerHTML = '';
  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'slideshow__dot';
    dot.setAttribute('aria-label', `Karte ${index + 1} anzeigen`);
    dot.addEventListener('click', () => {
      slides[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    });
    dotsContainer.appendChild(dot);
  });

  const updateDots = () => {
    const sliderRect = slider.getBoundingClientRect();
    const dots = dotsContainer.querySelectorAll('.slideshow__dot');
    let anyActive = false;

    slides.forEach((slide, index) => {
      const rect = slide.getBoundingClientRect();
      const visibleWidth = Math.min(rect.right, sliderRect.right) - Math.max(rect.left, sliderRect.left);
      const ratio = visibleWidth / rect.width;
      const isVisible = ratio >= 0.5;
      dots[index].classList.toggle('active', isVisible);
      if (isVisible) anyActive = true;
    });

    // Fallback: wenn nichts aktiv, nächstliegende Karte markieren
    if (!anyActive) {
      const sliderCenter = sliderRect.left + sliderRect.width / 2;
      let closestIndex = 0;
      let smallestDistance = Infinity;
      slides.forEach((slide, index) => {
        const rect = slide.getBoundingClientRect();
        const distance = Math.abs(sliderCenter - (rect.left + rect.width / 2));
        if (distance < smallestDistance) {
          smallestDistance = distance;
          closestIndex = index;
        }
      });
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === closestIndex);
      });
    }

    const maxScrollLeft = Math.max(0, slider.scrollWidth - slider.clientWidth - 4);
    prevBtn.disabled = slider.scrollLeft <= 4;
    nextBtn.disabled = slider.scrollLeft >= maxScrollLeft;
  };

  const scrollByPage = (direction) => {
    const distance = slider.clientWidth * 0.9;
    slider.scrollBy({ left: direction * distance, behavior: 'smooth' });
  };

  prevBtn.addEventListener('click', () => scrollByPage(-1));
  nextBtn.addEventListener('click', () => scrollByPage(1));
  slider.addEventListener('scroll', () => window.requestAnimationFrame(updateDots));
  window.addEventListener('resize', updateDots);

  updateDots();
}

// Initialize KERNWERK slideshow
initSlideshow({
  sliderId: 'KernwerkSlider',
  dotsId: 'kernwerkDots',
  prevId: 'kernwerkPrev',
  nextId: 'kernwerkNext',
});
