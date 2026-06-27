/* =============================================
   IRIS VANCE PHOTOGRAPHY
   Copyright protection + UI interactions
   ============================================= */

(function () {
  'use strict';

  /* ── Custom cursor ──────────────────────── */
  const dot  = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');

  let mx = 0, my = 0;   // mouse target
  let rx = 0, ry = 0;   // ring position (lerped)

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
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

  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });

  // Enlarge cursor on interactive elements
  document.querySelectorAll('a, button, select, input, textarea, .gallery-item').forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.classList.add('hover');
      ring.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
      dot.classList.remove('hover');
      ring.classList.remove('hover');
    });
  });


  /* ── Copyright protection ───────────────── */
  const notice = document.getElementById('protection-notice');
  let noticeTimer;

  function showProtectionNotice() {
    clearTimeout(noticeTimer);
    notice.classList.add('show');
    noticeTimer = setTimeout(() => notice.classList.remove('show'), 3000);
  }

  // Block context menu sitewide; show notice when on a protected image
  document.addEventListener('contextmenu', e => {
    e.preventDefault();
    if (e.target.closest('.protected-wrap')) {
      showProtectionNotice();
    }
  });

  // Block image drag-and-drop
  document.addEventListener('dragstart', e => {
    if (e.target.tagName === 'IMG') {
      e.preventDefault();
    }
  });

  // Block common browser save / print / source shortcuts
  document.addEventListener('keydown', e => {
    const ctrl = e.ctrlKey || e.metaKey;

    // Save page, view source
    if (ctrl && ['s', 'u'].includes(e.key.toLowerCase())) {
      e.preventDefault();
      showProtectionNotice();
      return;
    }

    // Print (Ctrl+P / Cmd+P)
    if (ctrl && e.key.toLowerCase() === 'p') {
      e.preventDefault();
      showProtectionNotice();
      return;
    }

    // DevTools shortcuts (best-effort deterrent; not a hard security boundary)
    if (ctrl && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase())) {
      e.preventDefault();
    }
    if (e.key === 'F12') {
      e.preventDefault();
    }
    if (e.key === 'PrintScreen') {
      showProtectionNotice();
    }
  });

  // Block print dialog triggered any other way (File → Print, etc.)
  window.addEventListener('beforeprint', () => {
    document.body.style.display = 'none';
    showProtectionNotice();
  });
  window.addEventListener('afterprint', () => {
    document.body.style.display = '';
  });


  /* ── Navigation ─────────────────────────── */
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

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      toggle.classList.remove('open');
      links.classList.remove('open');
      document.body.style.overflow = '';
    });
  });


  /* ── Hero entrance animation ─────────────── */
  const hero       = document.getElementById('hero');
  const heroEls    = document.querySelectorAll('.hero-reveal');

  function triggerHeroReveal() {
    hero.classList.add('loaded');
    heroEls.forEach(el => el.classList.add('in'));
  }

  if (document.readyState === 'complete') {
    triggerHeroReveal();
  } else {
    window.addEventListener('load', triggerHeroReveal);
    // Fallback in case load fires late
    setTimeout(triggerHeroReveal, 800);
  }


  /* ── Scroll reveal (IntersectionObserver) ── */
  const revealEls = document.querySelectorAll('.reveal-up');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold:  0.07,
    rootMargin: '0px 0px -36px 0px'
  });

  revealEls.forEach(el => observer.observe(el));


  /* ── Contact form ────────────────────────── */
  const form      = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();

      // Honeypot spam check
      const honeypot = form.querySelector('[name="company"]');
      if (honeypot && honeypot.value.trim()) return;

      const data = Object.fromEntries(new FormData(form));

      // Basic validation
      if (!data.name.trim() || !data.email.trim() || !data.message.trim()) {
        return;
      }

      submitBtn.textContent = 'Sending…';
      submitBtn.disabled    = true;

      // Wire to MSI-Forms when ready:
      // fetch('https://forms.caiomsi.com/api/submit', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ...data, _site: 'photofolio' })
      // }).then(() => { ... });

      // Demo simulation
      setTimeout(() => {
        submitBtn.textContent = 'Message Sent ✓';
        form.reset();
        setTimeout(() => {
          submitBtn.textContent = 'Send Inquiry';
          submitBtn.disabled    = false;
        }, 3500);
      }, 1200);
    });
  }

})();
