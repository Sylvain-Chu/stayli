'use strict';
(function () {
  // simple tooltip/popover for mini calendar
  function createPopover() {
    const el = document.createElement('div');
    el.className = 'mini-popover';
    el.style.position = 'fixed';
    el.style.zIndex = '50';
    el.style.maxWidth = '320px';
    el.style.background = 'rgba(18,26,47,0.98)';
    el.style.border = '1px solid rgba(255,255,255,0.08)';
    el.style.borderRadius = '8px';
    el.style.boxShadow = '0 6px 24px rgba(0,0,0,0.4)';
    el.style.padding = '10px 12px';
    el.style.color = '#e6ebff';
    el.style.fontSize = '12px';
    el.style.whiteSpace = 'pre-line';
    el.style.display = 'none';
    document.body.appendChild(el);
    return el;
  }
  const pop = createPopover();
  let hideTimer;
  function showPopover(target, text) {
    if (!text) return;
    pop.textContent = text;
    pop.style.display = 'block';
    const rect = target.getBoundingClientRect();
    const top = rect.top + window.scrollY - pop.offsetHeight - 8;
    let left = rect.left + window.scrollX + rect.width / 2 - pop.offsetWidth / 2;
    const minL = 8;
    const maxL = window.scrollX + window.innerWidth - pop.offsetWidth - 8;
    left = Math.max(minL, Math.min(maxL, left));
    pop.style.top = `${Math.max(8, top)}px`;
    pop.style.left = `${left}px`;
  }
  function scheduleHidePopover() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => (pop.style.display = 'none'), 280);
  }

  function initMiniCalendarInteractivity() {
    document.addEventListener('mouseover', (e) => {
      const cell = e.target.closest('.mini-cal-cell');
      if (!cell) return;
      const info = cell.getAttribute('data-info');
      if (info) showPopover(cell, info);
    });
    document.addEventListener('mousemove', (e) => {
      if (pop.style.display !== 'block') return;
      // keep pop visible if moving near it
    });
    document.addEventListener('mouseout', (e) => {
      const cell = e.target.closest('.mini-cal-cell');
      if (!cell) return;
      const toEl = e.relatedTarget;
      // if moving to another part of the same cell or into the popover, don't hide
      if (toEl && (cell.contains(toEl) || pop.contains(toEl))) return;
      scheduleHidePopover();
    });
    document.addEventListener('click', (e) => {
      const cell = e.target.closest('.mini-cal-cell');
      if (!cell) return;
      const info = cell.getAttribute('data-info');
      if (info) {
        showPopover(cell, info);
      }
    });
    pop.addEventListener('mouseenter', () => clearTimeout(hideTimer));
    pop.addEventListener('mouseleave', scheduleHidePopover);
  }

  // count-up animation for numbers
  function easeOutQuad(t) {
    return t * (2 - t);
  }
  function animateCountUp(el, to, duration = 800, formatter) {
    const from = 0;
    const start = performance.now();
    function step(now) {
      const p = Math.min(1, (now - start) / duration);
      const val = Math.round(from + (to - from) * easeOutQuad(p));
      el.textContent = formatter ? formatter(val) : val;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function initCountUps() {
    const nodes = document.querySelectorAll('.countup');
    nodes.forEach((el) => {
      const raw = el.getAttribute('data-count');
      const target = Number(raw || 0);
      const isCurrency = el.textContent.trim().startsWith('€');
      const format = isCurrency
        ? (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)
        : (n) => new Intl.NumberFormat('fr-FR').format(n);
      animateCountUp(el, target, 900, format);
    });
  }

  function onPostClick(e) {
    const btn = e.target.closest('[data-post]');
    if (!btn) return;
    const url = btn.getAttribute('data-url');
    const confirmMsg = btn.getAttribute('data-confirm');
    if (!url) return;
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    fetch(url, { method: 'POST' })
      .then((res) => {
        if (!res.ok) throw new Error('Action failed');
        window.location.reload();
      })
      .catch((err) => alert(err.message || 'Error'));
  }

  function onDeleteClick(e) {
    const btn = e.target.closest('[data-delete]');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    const base = btn.getAttribute('data-base');
    const confirmMsg = btn.getAttribute('data-confirm') || 'Delete?';
    if (!id || !base) return;
    if (!window.confirm(confirmMsg)) return;
    fetch(`${base}/${id}/delete`, { method: 'DELETE' })
      .then((res) => {
        if (!res.ok) throw new Error('Delete failed');
        window.location.reload();
      })
      .catch((err) => alert(err.message || 'Error'));
  }
  function onUserProfileClick(e) {
    const link = e.target.closest('.user-profile-link');
    if (!link) return;
    const href = link.getAttribute('href');
    if (href) {
      window.location.href = href;
    }
  }

  document.addEventListener('click', onDeleteClick);
  document.addEventListener('click', onPostClick);
  document.addEventListener('click', onUserProfileClick);
  initMiniCalendarInteractivity();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCountUps);
  } else {
    initCountUps();
  }
})();
