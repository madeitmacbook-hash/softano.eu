/* Softano.eu homepage concept: interactions */
(function () {
  'use strict';

  const eur = (n) => '€' + n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /* ---------- Mobile menu ---------- */
  const burger = document.querySelector('.burger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (burger && mobileMenu) {
    const setOpen = (open) => {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      burger.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
      mobileMenu.hidden = !open;
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', () => setOpen(burger.getAttribute('aria-expanded') !== 'true'));
    mobileMenu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !mobileMenu.hidden) { setOpen(false); burger.focus(); }
    });
    window.matchMedia('(min-width: 1101px)').addEventListener('change', (m) => { if (m.matches) setOpen(false); });
  }

  /* ---------- Language switcher (visual only for this concept) ---------- */
  document.querySelectorAll('.lang button').forEach((btn, _, all) => {
    btn.addEventListener('click', () => all.forEach((b) => b.setAttribute('aria-pressed', String(b === btn))));
  });

  /* ---------- Search box ---------- */
  const q = document.getElementById('q');
  document.querySelectorAll('[data-fill]').forEach((chip) => {
    chip.addEventListener('click', () => { q.value = chip.dataset.fill; q.focus(); });
  });
  document.querySelectorAll('[data-focus-search]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      setTimeout(() => q && q.focus({ preventScroll: true }), 300);
    });
  });

  /* ---------- Showcase: condition picker updates the order summary ---------- */
  const cond = document.querySelector('[data-showcase]');
  if (cond) {
    const opts = cond.querySelectorAll('.cond-opt');
    const name = document.querySelector('[data-sum-name]');
    const base = document.querySelector('[data-sum-base]');
    const disc = document.querySelector('[data-sum-disc]');
    const total = document.querySelector('[data-sum-total]');
    opts.forEach((opt) => opt.addEventListener('click', () => {
      opts.forEach((o) => o.setAttribute('aria-pressed', String(o === opt)));
      const price = parseFloat(opt.dataset.price);
      const discount = Math.round(price * 10) / 100; // 10% business discount
      const isNew = opt === opts[0];
      name.textContent = 'Windows Server 2025 Std, ' + (isNew ? 'New' : 'Pre-Owned');
      base.textContent = eur(price);
      disc.textContent = '−' + eur(discount);
      total.textContent = eur(Math.round((price - discount) * 100) / 100);
    }));
  }

  /* ---------- New / Pre-Owned toggle ---------- */
  const seg = document.querySelectorAll('.seg button');
  const status = document.querySelector('[data-cond-status]');
  const applyCondition = (mode) => {
    document.querySelectorAll('[data-products] .product').forEach((p) => {
      const nw = parseFloat(p.dataset.new);
      const pre = p.dataset.pre ? parseFloat(p.dataset.pre) : null;
      const priceEl = p.querySelector('[data-price]');
      const wasEl = p.querySelector('[data-was]');
      const saveEl = p.querySelector('[data-save]');
      const label = p.querySelector('[data-label]');
      if (pre === null) {
        // Available new only: keep the note visible in both modes
        priceEl.textContent = eur(nw);
        label.textContent = p.dataset.newLabel;
        if (saveEl) saveEl.hidden = mode !== 'pre';
        return;
      }
      if (mode === 'pre') {
        priceEl.textContent = eur(pre);
        wasEl.textContent = eur(nw);
        wasEl.hidden = false;
        saveEl.textContent = 'Save ' + Math.round((1 - pre / nw) * 100) + '%';
        saveEl.hidden = false;
        label.textContent = p.dataset.preLabel;
      } else {
        priceEl.textContent = eur(nw);
        wasEl.hidden = true;
        saveEl.hidden = true;
        label.textContent = p.dataset.newLabel;
      }
      priceEl.classList.remove('price-flash');
      void priceEl.offsetWidth;
      priceEl.classList.add('price-flash');
    });
    if (status) status.textContent = mode === 'pre' ? 'Showing pre-owned prices.' : 'Showing new prices.';
  };
  seg.forEach((btn) => btn.addEventListener('click', () => {
    seg.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    applyCondition(btn.dataset.cond);
  }));

  /* ---------- Tabs (WAI-ARIA tabs pattern) ---------- */
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  const selectTab = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', (e) => {
      let next = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') next = tabs[0];
      if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); selectTab(next, true); }
    });
  });
  // Links to #hardware from the menu also open the hardware tab
  document.querySelectorAll('a[href="#hardware"]').forEach((a) => a.addEventListener('click', () => {
    const hw = document.getElementById('tab-hw');
    if (hw) selectTab(hw);
  }));

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('[data-accordion] .acc-item button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      document.getElementById(btn.getAttribute('aria-controls')).hidden = open;
    });
  });

  /* ---------- Quote form (concept: not connected to a backend yet) ---------- */
  const form = document.querySelector('[data-quote]');
  if (form) {
    const msg = form.querySelector('.form-status');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let firstBad = null;
      ['f-name', 'f-email'].forEach((id) => {
        const el = document.getElementById(id);
        const ok = el.value.trim() !== '' && (el.type !== 'email' || /.+@.+\..+/.test(el.value));
        el.setAttribute('aria-invalid', String(!ok));
        if (!ok && !firstBad) firstBad = el;
      });
      if (firstBad) {
        msg.textContent = 'Please add your name and a valid email address.';
        msg.classList.add('err');
        firstBad.focus();
        return;
      }
      msg.classList.remove('err');
      msg.textContent = 'Thank you. This is a design concept, so the form is not connected yet.';
      form.reset();
    });
  }

  /* ---------- Scroll reveal ---------- */
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach((el) => io.observe(el));
  }
})();
