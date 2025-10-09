'use strict';
(function () {
  function onDeleteClick(e) {
    const btn = e.target.closest('[data-delete]');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    const base = btn.getAttribute('data-base');
    const confirmMsg = btn.getAttribute('data-confirm') || 'Supprimer ?';
    if (!id || !base) return;
    if (!window.confirm(confirmMsg)) return;
    fetch(`${base}/${id}/delete`, { method: 'DELETE' })
      .then((res) => {
        if (!res.ok) throw new Error('Delete failed');
        window.location.reload();
      })
      .catch((err) => alert(err.message || 'Erreur'));
  }
  document.addEventListener('click', onDeleteClick);
})();
