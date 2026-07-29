const v4MenuButton = document.querySelector('.menu-button');
const v4MobileMenu = document.querySelector('.mobile-nav');
v4MenuButton.addEventListener('click', () => { const isOpen = v4MenuButton.getAttribute('aria-expanded') !== 'true'; v4MenuButton.setAttribute('aria-expanded', String(isOpen)); v4MobileMenu.classList.toggle('open', isOpen); v4MobileMenu.setAttribute('aria-hidden', String(!isOpen)); });
v4MobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => { v4MenuButton.setAttribute('aria-expanded', 'false'); v4MobileMenu.classList.remove('open'); v4MobileMenu.setAttribute('aria-hidden', 'true'); }));
