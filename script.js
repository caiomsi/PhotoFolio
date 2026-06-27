/* =============================================
   LAURA CAMPO FOTOGRAFIA
   Copyright protection + dynamic gallery
   ============================================= */

(function () {
  'use strict';

  /* ── Supabase ───────────────────────────────── */
  const sb = window.supabase.createClient(
    'https://hktzefkarulgoqueotun.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrdHplZmthcnVsZ29xdWVvdHVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NzY3ODcsImV4cCI6MjA5NzA1Mjc4N30.d7g936N33UldTwNg_HWYmLFH8YWhxhr0YNPNLpVCGbY'
  );

  /* ── Custom cursor ──────────────────────────── */
  const dot  = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  (function lerpRing() {
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(lerpRing);
  })();

  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });

  function addCursorListeners(el) {
    el.addEventListener('mouseenter', () => { dot.classList.add('hover'); ring.classList.add('hover'); });
    el.addEventListener('mouseleave', () => { dot.classList.remove('hover'); ring.classList.remove('hover'); });
  }

  document.querySelectorAll('a, button, select, input, textarea').forEach(addCursorListeners);

  /* ── Copyright protection ───────────────────── */
  const notice = document.getElementById('protection-notice');
  let noticeTimer;

  function showProtectionNotice() {
    clearTimeout(noticeTimer);
    notice.classList.add('show');
    noticeTimer = setTimeout(() => notice.classList.remove('show'), 3000);
  }

  document.addEventListener('contextmenu', e => {
    e.preventDefault();
    if (e.target.closest('.protected-wrap')) showProtectionNotice();
  });

  document.addEventListener('dragstart', e => {
    if (e.target.tagName === 'IMG') e.preventDefault();
  });

  document.addEventListener('keydown', e => {
    const ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && ['s', 'u', 'p'].includes(e.key.toLowerCase())) {
      e.preventDefault();
      showProtectionNotice();
      return;
    }
    if (ctrl && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase())) e.preventDefault();
    if (e.key === 'F12') e.preventDefault();
    if (e.key === 'PrintScreen') showProtectionNotice();
  });

  window.addEventListener('beforeprint', () => {
    document.body.style.display = 'none';
    showProtectionNotice();
  });
  window.addEventListener('afterprint', () => { document.body.style.display = ''; });

  /* ── Navigation ─────────────────────────────── */
  const nav    = document.getElementById('nav');
  const toggle = document.getElementById('nav-toggle');
  const links  = document.getElementById('nav-links');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  toggle.addEventListener('click', () => {
    const open = toggle.classList.toggle('open');
    links.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    toggle.classList.remove('open');
    links.classList.remove('open');
    document.body.style.overflow = '';
  }));

  /* ── Hero entrance ──────────────────────────── */
  const hero    = document.getElementById('hero');
  const heroEls = document.querySelectorAll('.hero-reveal');

  function triggerHeroReveal() {
    hero.classList.add('loaded');
    heroEls.forEach(el => el.classList.add('in'));
  }

  if (document.readyState === 'complete') triggerHeroReveal();
  else {
    window.addEventListener('load', triggerHeroReveal);
    setTimeout(triggerHeroReveal, 800);
  }

  /* ── Scroll reveal ──────────────────────────── */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -36px 0px' });

  document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));

  /* ── Gallery grid layout ────────────────────── */
  /* Repeating 6-item editorial block:
     [0] wide-tall (2col × 2row) | [1] portrait (1col × 2row)
     [2] small | [3] small | [4] small
     [5] full width (3col × 1row)
  */
  function applyGridLayout(items) {
    const ROWS_PER_BLOCK = 4; // rows consumed per 6-item block

    items.forEach((item, i) => {
      const block = Math.floor(i / 6);
      const pos   = i % 6;
      const r     = block * ROWS_PER_BLOCK + 1;

      switch (pos) {
        case 0:
          item.style.gridColumn = '1 / 3';
          item.style.gridRow    = `${r} / ${r + 2}`;
          break;
        case 1:
          item.style.gridColumn = '3';
          item.style.gridRow    = `${r} / ${r + 2}`;
          break;
        case 2:
          item.style.gridColumn = '1';
          item.style.gridRow    = `${r + 2}`;
          break;
        case 3:
          item.style.gridColumn = '2';
          item.style.gridRow    = `${r + 2}`;
          break;
        case 4:
          item.style.gridColumn = '3';
          item.style.gridRow    = `${r + 2}`;
          break;
        case 5:
          item.style.gridColumn = '1 / 4';
          item.style.gridRow    = `${r + 3}`;
          break;
      }
    });
  }

  /* ── Render gallery ─────────────────────────── */
  function renderGallery(photos) {
    const grid = document.getElementById('gallery-grid');
    grid.innerHTML = '';

    if (!photos || photos.length === 0) {
      grid.innerHTML = '<p class="gallery-empty">Nenhuma foto ainda. <a href="admin.html">Acesse o painel admin</a> para adicionar fotos.</p>';
      return;
    }

    photos.forEach((photo, i) => {
      const num  = String(i + 1).padStart(2, '0');
      const item = document.createElement('div');
      item.className = 'gallery-item reveal-up';
      item.innerHTML = `
        <div class="protected-wrap">
          <img src="${photo.image_url}"
               alt="${photo.title} — ${photo.category}"
               draggable="false" loading="lazy">
          <div class="image-shield" aria-hidden="true"></div>
          <div class="photo-watermark" aria-hidden="true">© LAURA CAMPO</div>
        </div>
        <div class="item-info">
          <span class="item-num">${num}</span>
          <div class="item-text">
            <p class="item-title">${photo.title}</p>
            <p class="item-cat">${photo.category}</p>
          </div>
          <span class="item-lock" aria-hidden="true">⊘</span>
        </div>
      `;
      grid.appendChild(item);
    });

    const items = grid.querySelectorAll('.gallery-item');
    applyGridLayout(Array.from(items));

    items.forEach(el => {
      observer.observe(el);
      addCursorListeners(el);
    });
  }

  /* ── Fetch photos from Supabase ─────────────── */
  async function loadGallery() {
    const { data, error } = await sb
      .from('laura_photos')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao carregar fotos:', error);
      document.getElementById('gallery-grid').innerHTML =
        '<p class="gallery-empty">Erro ao carregar fotos. Tente novamente.</p>';
      return;
    }

    renderGallery(data);
  }

  loadGallery();

  /* ── Contact form ────────────────────────────── */
  const form      = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const honeypot = form.querySelector('[name="company"]');
      if (honeypot && honeypot.value.trim()) return;

      const data = Object.fromEntries(new FormData(form));
      if (!data.name.trim() || !data.email.trim() || !data.message.trim()) return;

      submitBtn.textContent = 'Enviando…';
      submitBtn.disabled    = true;

      // Wired to MSI-Forms:
      // fetch('https://forms.caiomsi.com/api/submit', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ...data, _site: 'photofolio' })
      // })

      setTimeout(() => {
        submitBtn.textContent = 'Mensagem Enviada ✓';
        form.reset();
        setTimeout(() => {
          submitBtn.textContent = 'Enviar Mensagem';
          submitBtn.disabled    = false;
        }, 3500);
      }, 1200);
    });
  }

})();
