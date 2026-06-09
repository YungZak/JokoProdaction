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
