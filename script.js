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

  /* ---------- Search bar (drops down under the nav) ---------- */
  const q = document.getElementById('q');
  const bar = document.getElementById('searchbar');
  const toggle = document.querySelector('[data-search-toggle]');
  const setSearch = (open) => {
    bar.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (open) q.focus();
  };
  toggle.addEventListener('click', () => setSearch(bar.hidden));
  const q2 = document.getElementById('q2');
  const inlineSearchVisible = () => q2 && q2.offsetParent !== null;
  document.querySelectorAll('[data-focus-search]').forEach((el) => el.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    if (inlineSearchVisible()) setTimeout(() => q2.focus({ preventScroll: true }), 300);
    else setSearch(true);
  }));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !bar.hidden) { setSearch(false); toggle.focus(); }
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

  /* ---------- New / Pre-Owned toggle: swaps each product to its New or Pre-Owned SKU ---------- */
  const seg = document.querySelectorAll('.seg button');
  const status = document.querySelector('[data-cond-status]');
  const setText = (el, text) => { if (!el) return; el.textContent = text || ''; el.hidden = !text; };
  const applyCondition = (mode) => {
    document.querySelectorAll('[data-products] .product').forEach((p) => {
      const v = JSON.parse(p.dataset.variants);
      const only = !v[mode];
      const d = v[mode] || v.new || v.pre;
      const label = p.querySelector('[data-label]');
      label.textContent = d.label + (only ? (v.new ? ' only' : ' only') : '');
      label.className = 'p-badge ' + (d.label === 'New' ? 'new' : 'pre');
      p.querySelector('[data-name]').textContent = d.name;
      p.querySelector('[data-sku]').textContent = d.sku;
      const img = p.querySelector('[data-img]');
      if (img.getAttribute('src') !== d.img) img.setAttribute('src', d.img);
      const price = p.querySelector('[data-price]');
      price.textContent = d.price;
      setText(p.querySelector('[data-was]'), d.was);
      setText(p.querySelector('[data-low]'), d.low ? 'Lowest price in 30 days: ' + d.low : '');
      p.classList.toggle('is-other', only);
      price.classList.remove('price-flash'); void price.offsetWidth; price.classList.add('price-flash');
    });
    if (status) status.textContent = mode === 'pre' ? 'Showing pre-owned licences.' : 'Showing new licences.';
  };
  seg.forEach((btn) => btn.addEventListener('click', () => {
    seg.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    applyCondition(btn.dataset.cond);
  }));
  const initial = document.querySelector('.seg [aria-pressed="true"]');
  if (initial) applyCondition(initial.dataset.cond);

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

})();
