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

// Academy category tabs + "Tout"
const academyTabs = document.querySelectorAll('.academy-tab');
const academyPanels = document.querySelectorAll('.academy-panel');
if (academyTabs.length) {
  academyTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      academyTabs.forEach(t => {
        t.classList.remove('academy-tab--active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('academy-tab--active');
      tab.setAttribute('aria-selected', 'true');

      if (tab.dataset.target === '__all') {
        academyPanels.forEach(p => p.classList.remove('hidden'));
      } else {
        academyPanels.forEach(p => p.classList.add('hidden'));
        const target = document.getElementById(tab.dataset.target);
        if (target) target.classList.remove('hidden');
      }
    });
  });
}

// Tabs scroll arrows
const tabsScrollEl = document.getElementById('academy-tabs-scroll');
const arrowLeft    = document.getElementById('tabs-arrow-left');
const arrowRight   = document.getElementById('tabs-arrow-right');
if (tabsScrollEl && arrowLeft && arrowRight) {
  arrowLeft.addEventListener('click', () => tabsScrollEl.scrollBy({ left: -200, behavior: 'smooth' }));
  arrowRight.addEventListener('click', () => tabsScrollEl.scrollBy({ left: 200, behavior: 'smooth' }));
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

// Mobile nav drawer
const navBurger      = document.getElementById('nav-burger');
const navDrawer      = document.getElementById('nav-drawer');
const navOverlay     = document.getElementById('nav-overlay');
const navDrawerClose = document.getElementById('nav-drawer-close');

function openDrawer() {
  navDrawer.classList.add('nav-drawer--open');
  navOverlay.classList.add('nav-overlay--open');
  document.body.style.overflow = 'hidden';
}
function closeDrawer() {
  navDrawer.classList.remove('nav-drawer--open');
  navOverlay.classList.remove('nav-overlay--open');
  document.body.style.overflow = '';
}

if (navBurger)      navBurger.addEventListener('click', openDrawer);
if (navDrawerClose) navDrawerClose.addEventListener('click', closeDrawer);
if (navOverlay)     navOverlay.addEventListener('click', closeDrawer);
