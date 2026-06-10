/* Joko Production — interactions
   Lightweight, no framework. Lenis (optional via CDN) for smooth scroll. */

(() => {
  'use strict';

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Page loader ---------- */
  window.addEventListener('load', () => {
    setTimeout(() => document.body.classList.remove('is-loading'), 600);
  });

  /* ---------- Lenis smooth scroll ---------- */
  window.addEventListener('DOMContentLoaded', () => {
    if (typeof window.Lenis !== 'function' || reduceMotion) return;
    const lenis = new window.Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1,
      smoothWheel: true,
    });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    // Hook anchor links
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (!id || id === '#') return;
        const el = document.querySelector(id);
        if (!el) return;
        e.preventDefault();
        lenis.scrollTo(el, { offset: -80, duration: 1.2 });
      });
    });
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          entry.target.style.setProperty('--reveal-delay', `${i * 60}ms`);
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-in'));
  }

  /* ---------- Year ---------- */
  const y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Hero HUD timecode ---------- */
  const tc = document.querySelector('[data-timecode]');
  if (tc) {
    const start = performance.now();
    const tick = () => {
      const elapsed = (performance.now() - start) / 1000;
      const h = Math.floor(elapsed / 3600);
      const m = Math.floor((elapsed % 3600) / 60);
      const s = Math.floor(elapsed % 60);
      const f = Math.floor((elapsed % 1) * 24); // 24fps
      tc.textContent =
        `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}:${String(f).padStart(2,'0')}`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- Work hover preview ---------- */
  const previewVideo = document.querySelector('.work__preview-video');
  const previewTitle = document.querySelector('[data-preview-title]');
  const previewTag = document.querySelector('[data-preview-tag]');
  const workItems = document.querySelectorAll('.work-item');

  if (previewVideo && workItems.length) {
    let currentSrc = '';
    const swapTo = (item) => {
      const src = item.dataset.poster;
      const title = item.dataset.title || '';
      const tag = item.dataset.tag || '';
      if (src && src !== currentSrc) {
        previewVideo.style.opacity = '0';
        setTimeout(() => {
          previewVideo.src = src;
          previewVideo.load();
          previewVideo.play().catch(() => {});
          previewVideo.style.opacity = '1';
          currentSrc = src;
        }, 200);
      }
      if (previewTitle) previewTitle.textContent = title;
      if (previewTag) previewTag.textContent = `— ${tag}`;
      workItems.forEach(i => i.classList.toggle('is-active', i === item));
    };

    workItems.forEach(item => {
      item.addEventListener('mouseenter', () => swapTo(item));
      item.addEventListener('focus', () => swapTo(item));
      item.setAttribute('tabindex', '0');
    });

    // Autoplay first item's preview when work section enters viewport
    if ('IntersectionObserver' in window) {
      const workSection = document.querySelector('.work');
      if (workSection) {
        const wio = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            swapTo(workItems[0]);
            wio.disconnect();
          }
        }, { threshold: 0.2 });
        wio.observe(workSection);
      }
    }
  }

  /* ---------- Header frosted glass after hero ---------- */
  const siteHeader = document.querySelector('.site-header');
  const heroSection = document.querySelector('.hero');
  if (siteHeader && heroSection && 'IntersectionObserver' in window) {
    const hio = new IntersectionObserver((entries) => {
      siteHeader.classList.toggle('is-scrolled', !entries[0].isIntersecting);
    }, { threshold: 0 });
    hio.observe(heroSection);
  }

  /* ---------- Mobile menu ---------- */
  const navToggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (navToggle && mobileMenu) {
    const setMenu = (open) => {
      navToggle.classList.toggle('is-active', open);
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      mobileMenu.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };
    navToggle.addEventListener('click', () =>
      setMenu(!mobileMenu.classList.contains('is-open')));
    mobileMenu.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) setMenu(false);
    });
  }

  /* ---------- Work inline expand (mobile) ---------- */
  const mqTouch = matchMedia('(max-width: 880px)');
  workItems.forEach(item => {
    item.addEventListener('click', () => {
      if (!mqTouch.matches) return;
      const willOpen = !item.classList.contains('is-open');

      // Close any other open item and pause its video
      workItems.forEach(other => {
        if (other !== item && other.classList.contains('is-open')) {
          other.classList.remove('is-open');
          const v = other.querySelector('.work-item__expand video');
          if (v) v.pause();
        }
      });

      if (!willOpen) {
        item.classList.remove('is-open');
        const v = item.querySelector('.work-item__expand video');
        if (v) v.pause();
        return;
      }

      // Lazily build the inline video
      let exp = item.querySelector('.work-item__expand');
      if (!exp) {
        exp = document.createElement('div');
        exp.className = 'work-item__expand';
        const inner = document.createElement('div');
        inner.className = 'work-item__expand-inner';
        const v = document.createElement('video');
        v.muted = true;
        v.loop = true;
        v.playsInline = true;
        v.setAttribute('playsinline', '');
        v.preload = 'metadata';
        v.src = item.dataset.poster || '';
        inner.appendChild(v);
        exp.appendChild(inner);
        item.appendChild(exp);
      }
      item.classList.add('is-open');
      const v = exp.querySelector('video');
      if (v) v.play().catch(() => {});
    });
  });

  /* ---------- Pricing category tabs + mobile slider ---------- */
  const priceTabs = Array.from(document.querySelectorAll('.pricing__tab'));
  const priceGroups = Array.from(document.querySelectorAll('.pricing__group'));
  const priceDots = document.querySelector('.pricing__dots');
  if (priceTabs.length && priceGroups.length) {
    const mqSlider = matchMedia('(max-width: 600px)');

    // Build/refresh the slider dots for the active group (mobile only)
    const buildDots = () => {
      if (!priceDots) return;
      const group = priceGroups.find(g => !g.classList.contains('is-hidden'));
      if (!group || !mqSlider.matches) { priceDots.innerHTML = ''; return; }
      const cards = Array.from(group.querySelectorAll('.pricing__card'));
      priceDots.innerHTML = cards.map((_, i) =>
        `<button class="pricing__dot" type="button" aria-label="Plan ${i + 1}"></button>`).join('');
      const dots = Array.from(priceDots.querySelectorAll('.pricing__dot'));
      const sync = () => {
        const stride = group.scrollWidth / cards.length;
        const idx = Math.min(cards.length - 1, Math.round(group.scrollLeft / stride));
        dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
      };
      group.onscroll = sync;
      dots.forEach((d, i) => d.addEventListener('click', () =>
        cards[i].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })));
      sync();
    };

    const activate = (cat) => {
      priceTabs.forEach(t => {
        const on = t.dataset.category === cat;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      priceGroups.forEach(g => {
        const show = g.dataset.category === cat;
        g.classList.toggle('is-hidden', !show);
        g.hidden = !show;
        if (show) {
          g.scrollLeft = 0;
          // Newly revealed cards may carry an un-triggered reveal — show them now
          g.querySelectorAll('.pricing__card').forEach(c => c.classList.add('is-in'));
        }
      });
      buildDots();
    };

    priceTabs.forEach((tab, i) => {
      tab.addEventListener('click', () => activate(tab.dataset.category));
      tab.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        const dir = e.key === 'ArrowRight' ? 1 : -1;
        const next = priceTabs[(i + dir + priceTabs.length) % priceTabs.length];
        next.focus();
        activate(next.dataset.category);
      });
    });

    if (mqSlider.addEventListener) mqSlider.addEventListener('change', buildDots);
    buildDots();
  }

  /* ---------- Hero video resilience ----------
     If hosted /assets/media/hero.mp4 is missing or external sources fail,
     keep poster visible (already styled). Also retry play after user gesture. */
  const heroVid = document.querySelector('.hero__video');
  if (heroVid) {
    const tryPlay = () => heroVid.play().catch(() => {});
    heroVid.addEventListener('canplay', tryPlay, { once: true });
    document.addEventListener('click', tryPlay, { once: true });
    document.addEventListener('touchstart', tryPlay, { once: true, passive: true });
  }

})();
