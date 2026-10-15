import Lenis from './assets/vendor/lenis.js';

const root = document.documentElement;
const header = document.querySelector('.site-header');
const hero = document.querySelector('.hero');
const processSteps = document.querySelector('.process-steps');
const gallery = document.querySelector('.stack-gallery');
const panels = [...document.querySelectorAll('.workshop-panel')];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const desktopInput = matchMedia('(min-width: 768px) and (pointer: fine)');
const clamp = value => Math.min(1, Math.max(0, value));
const activeImages = new Set();
let lenis;
let revealObserver;
let imageObserver;
let frame = 0;
let measureFrame = 0;
let geometry = { viewport: innerHeight, page: 1, hero: hero.offsetHeight, processTop: 0, processHeight: 1, panels: [], sticky: false };

// Preserve text nodes, spaces, highlighted spans and intentional line breaks.
function splitHeading(heading) {
  if (heading.classList.contains('word-reveal')) return;
  const name = heading.innerText.replace(/\s+/g, ' ').trim();
  const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  let order = 0;
  nodes.forEach(node => {
    const fragment = document.createDocumentFragment();
    (node.textContent.match(/\s+|\S+/g) || []).forEach(token => {
      if (/^\s+$/.test(token)) { fragment.append(document.createTextNode(token)); return; }
      const mask = document.createElement('span');
      const word = document.createElement('span');
      mask.className = 'word-mask';
      word.className = 'motion-word';
      word.textContent = token;
      word.style.setProperty('--word-delay', `${Math.min(order++ * 48, 480)}ms`);
      mask.setAttribute('aria-hidden', 'true');
      mask.append(word);
      fragment.append(mask);
    });
    node.replaceWith(fragment);
  });
  heading.setAttribute('aria-label', name);
  heading.classList.add('word-reveal');
}

document.querySelectorAll('h1, main h2, .workshop-panel h3').forEach(splitHeading);
document.querySelectorAll('.industry-grid, .process-steps').forEach(group => {
  [...group.children].forEach((element, index) => {
    element.classList.add('reveal');
    element.style.setProperty('--reveal-delay', `${index * 90}ms`);
  });
});
document.querySelectorAll('dialog').forEach(dialog => dialog.setAttribute('data-lenis-prevent', ''));

function setupReveals() {
  revealObserver?.disconnect();
  imageObserver?.disconnect();
  activeImages.clear();
  root.classList.toggle('js-motion', !reducedMotion.matches);
  if (reducedMotion.matches) {
    document.querySelectorAll('.word-reveal').forEach(heading => heading.classList.add('words-visible'));
    document.querySelectorAll('.reveal, .media-reveal').forEach(element => element.classList.add('visible'));
    panels.forEach(panel => { panel.inert = false; panel.style.removeProperty('--panel-scale'); panel.style.removeProperty('--panel-opacity'); });
    return;
  }
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      target.classList.add(target.classList.contains('word-reveal') ? 'words-visible' : 'visible');
      revealObserver.unobserve(target);
    });
  }, { threshold: .12, rootMargin: '0px 0px -35px 0px' });
  document.querySelectorAll('.reveal, .word-reveal, .media-reveal').forEach(element => revealObserver.observe(element));
  imageObserver = new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) activeImages.add(target);
      else activeImages.delete(target);
    });
    requestPaint();
  }, { rootMargin: '100px 0px' });
  document.querySelectorAll('[data-parallax]').forEach(image => imageObserver.observe(image));
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('hero-ready')));
}

function syncScrollLock() {
  if (!lenis) return;
  if (document.hidden || document.querySelector('dialog[open]')) lenis.stop();
  else lenis.start();
}

function setupSmoothScroll() {
  lenis?.destroy();
  lenis = undefined;
  if (!reducedMotion.matches && desktopInput.matches) {
    lenis = new Lenis({
      autoRaf: true,
      lerp: .085,
      smoothWheel: true,
      syncTouch: false,
      anchors: false,
      prevent: node => node.tagName === 'DIALOG' || node.hasAttribute?.('data-lenis-prevent'),
    });
    lenis.on('scroll', requestPaint);
    syncScrollLock();
  }
  requestMeasure();
}

// Native touch scrolling remains intact. Only desktop wheel motion is smoothed.
document.addEventListener('click', event => {
  if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const link = event.target.closest('a[href^="#"]');
  if (!link || link.classList.contains('skip-link')) return;
  const id = link.getAttribute('href').slice(1);
  const target = document.getElementById(id);
  if (!target || (!lenis && id !== 'top')) return;
  event.preventDefault();
  const destination = id === 'top' ? 0 : target;
  if (lenis) {
    lenis.scrollTo(destination, {
      offset: id === 'top' ? 0 : -112,
      duration: 1.15,
      lerp: 0,
      onComplete: () => { if (location.hash !== `#${id}`) history.pushState(null, '', `#${id}`); },
    });
  } else window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
});

function measure() {
  measureFrame = 0;
  const scroll = window.scrollY;
  const galleryTop = gallery.getBoundingClientRect().top + scroll;
  let naturalTop = galleryTop;
  geometry = {
    viewport: innerHeight,
    page: Math.max(1, root.scrollHeight - innerHeight),
    hero: hero.offsetHeight,
    processTop: processSteps.getBoundingClientRect().top + scroll,
    processHeight: processSteps.offsetHeight,
    sticky: !reducedMotion.matches && getComputedStyle(panels[0]).position === 'sticky',
    panels: panels.map(panel => {
      const style = getComputedStyle(panel);
      const record = { panel, top: naturalTop, height: panel.offsetHeight, pin: parseFloat(style.top) || 0 };
      naturalTop += record.height + (parseFloat(style.marginBottom) || 0);
      return record;
    }),
  };
  lenis?.resize();
  requestPaint();
}

function requestMeasure() { if (!measureFrame) measureFrame = requestAnimationFrame(measure); }
function requestPaint() { if (!frame) frame = requestAnimationFrame(paint); }

function paint() {
  frame = 0;
  const scroll = window.scrollY;
  // Read visible image bounds before writing transforms, avoiding layout thrashing.
  const images = reducedMotion.matches ? [] : [...activeImages].map(image => ({ image, box: image.parentElement.getBoundingClientRect() }));
  header.classList.toggle('is-scrolled', scroll > 35);
  root.style.setProperty('--scroll-progress', clamp(scroll / geometry.page));
  if (reducedMotion.matches) return;

  const heroProgress = clamp(scroll / geometry.hero);
  const mobile = innerWidth < 768;
  root.style.setProperty('--hero-shift', `${(Math.min(scroll, geometry.hero) * (mobile ? .12 : .25)).toFixed(2)}px`);
  root.style.setProperty('--hero-scale', (1.08 + heroProgress * .1).toFixed(4));
  root.style.setProperty('--hero-text-shift', `${(Math.min(scroll, geometry.hero) * .1).toFixed(2)}px`);
  root.style.setProperty('--hero-opacity', (1 - clamp((heroProgress - .2) / .65)).toFixed(4));
  root.style.setProperty('--process-progress', clamp((scroll + geometry.viewport * .7 - geometry.processTop) / geometry.processHeight));

  images.forEach(({ image, box }) => {
    const progress = clamp((geometry.viewport - box.top) / (geometry.viewport + box.height));
    const distance = Math.min(box.height * .045, mobile ? 15 : 28);
    image.style.setProperty('--image-shift', `${((progress - .5) * distance * 2).toFixed(2)}px`);
  });

  geometry.panels.forEach(({ panel, height, pin }, index) => {
    const next = geometry.panels[index + 1];
    // Fade the pinned card as the following card travels over it.
    const cover = geometry.sticky && next ? clamp((scroll + pin + height - next.top) / height) : 0;
    panel.style.setProperty('--panel-scale', (1 - cover * .035).toFixed(4));
    panel.style.setProperty('--panel-opacity', (1 - cover).toFixed(4));
    panel.inert = cover > .98;
  });
}

// Service photographs dissolve and settle when a different service is selected.
document.querySelectorAll('[data-service]').forEach(button => button.addEventListener('click', () => {
  if (reducedMotion.matches) return;
  document.querySelector('#service-image').animate([
    { opacity: .15, transform: 'scale(1.055)' },
    { opacity: 1, transform: 'scale(1)' },
  ], { duration: 750, easing: 'cubic-bezier(.22,1,.36,1)' });
  document.querySelector('.service-detail-content').animate([
    { opacity: 0, translate: '0 12px' },
    { opacity: 1, translate: '0 0' },
  ], { duration: 550, easing: 'cubic-bezier(.22,1,.36,1)' });
}));

const navigationObserver = new IntersectionObserver(entries => {
  const active = entries.find(entry => entry.isIntersecting);
  if (!active) return;
  document.querySelectorAll('.desktop-nav a, .mobile-nav a').forEach(link => {
    if (link.hash === `#${active.target.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}, { rootMargin: '-15% 0px -60% 0px' });
document.querySelectorAll('main section[id]').forEach(section => navigationObserver.observe(section));

new MutationObserver(syncScrollLock).observe(document.body, { attributes: true, attributeFilter: ['class'] });
document.addEventListener('visibilitychange', syncScrollLock);
window.addEventListener('scroll', requestPaint, { passive: true });
window.addEventListener('resize', requestMeasure, { passive: true });
window.addEventListener('pageshow', requestMeasure);
new ResizeObserver(requestMeasure).observe(document.body);
document.fonts.ready.then(requestMeasure);
reducedMotion.addEventListener('change', () => { setupReveals(); setupSmoothScroll(); requestMeasure(); });
desktopInput.addEventListener('change', setupSmoothScroll);
setupReveals();
setupSmoothScroll();
measure();
