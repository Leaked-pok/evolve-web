// Evolve Poker Academy — main.js

// Disable right-click
document.addEventListener('contextmenu', e => e.preventDefault());

// Disable image drag
document.querySelectorAll('img').forEach(img => {
  img.addEventListener('dragstart', e => e.preventDefault());
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Academy category tabs
const academyTabs = document.querySelectorAll('.academy-tab');
if (academyTabs.length) {
  academyTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      academyTabs.forEach(t => {
        t.classList.remove('academy-tab--active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('academy-tab--active');
      tab.setAttribute('aria-selected', 'true');
      document.querySelectorAll('.academy-panel').forEach(p => p.classList.add('hidden'));
      const target = document.getElementById(tab.dataset.target);
      if (target) target.classList.remove('hidden');
    });
  });
}

// Nav border on scroll
const nav = document.querySelector('.nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.style.borderBottomColor = window.scrollY > 20
      ? 'var(--color-border-light)'
      : 'var(--color-border)';
  }, { passive: true });
}
