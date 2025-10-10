'use strict';
(function () {
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
  document.addEventListener('click', onDeleteClick);
  document.addEventListener('click', onPostClick);
})();
