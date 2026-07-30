const menu = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  mobileMenu.classList.toggle('open', open);
  mobileMenu.setAttribute('aria-hidden', String(!open));
});
mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menu.setAttribute('aria-expanded', 'false');
  mobileMenu.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden', 'true');
}));

const motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealItems = document.querySelectorAll('.reveal');
if (motionReduced) revealItems.forEach((item) => item.classList.add('is-visible'));
else {
  const observer = new IntersectionObserver((entries, activeObserver) => entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); activeObserver.unobserve(entry.target); }
  }), { threshold: .12 });
  revealItems.forEach((item) => observer.observe(item));
}

const toast = document.querySelector('.toast');
document.querySelector('#booking-form').addEventListener('submit', (event) => {
  event.preventDefault();
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 3800);
});
