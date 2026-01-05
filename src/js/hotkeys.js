// Hotkey Navigation
document.addEventListener('keydown', function(e) {
  // Ignore if user is typing in an input field
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    return;
  }
  
  const key = e.key.toLowerCase();
  const link = document.querySelector(`a[data-hotkey="${key}"]`);
  
  if (link && link.style.display !== 'none') {
    e.preventDefault();
    link.click();
  }
});
