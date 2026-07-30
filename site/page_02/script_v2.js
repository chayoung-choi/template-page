const v2MenuButton = document.querySelector('.menu-toggle');
const v2MobileMenu = document.querySelector('.mobile-menu');

v2MenuButton.addEventListener('click', () => {
  const isOpen = v2MenuButton.getAttribute('aria-expanded') !== 'true';
  v2MenuButton.setAttribute('aria-expanded', String(isOpen));
  v2MobileMenu.classList.toggle('open', isOpen);
  v2MobileMenu.setAttribute('aria-hidden', String(!isOpen));
});

v2MobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  v2MenuButton.setAttribute('aria-expanded', 'false');
  v2MobileMenu.classList.remove('open');
  v2MobileMenu.setAttribute('aria-hidden', 'true');
}));

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const reveals = document.querySelectorAll('.reveal');

if (motionPreference.matches) {
  reveals.forEach((element) => element.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  reveals.forEach((element) => revealObserver.observe(element));
}
