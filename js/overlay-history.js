/*
 * OverlayHistory — окна (просмотр PDF, лайтбокс) закрываются системным «назад».
 * push(id, closeFn) — окно открылось: добавляем запись в историю.
 * release(id)      — окно закрыли кнопкой/Esc: убираем свою запись (history.back()), чтобы записи не копились.
 * Системный «назад» (popstate) вызывает closeFn верхнего окна.
 */
(function () {
  "use strict";
  var stack = [], queue = [], pendingBack = 0;

  /* после перезагрузки с открытым окном в state остаётся метка — сбрасываем, страница открывается без окна */
  try { if (history.state && history.state.ov) history.replaceState(null, ""); } catch (e) {}

  function doPush(entry) {
    try { history.pushState({ ov: entry.id }, ""); entry.pushed = true; } catch (e) {}
  }

  function push(id, closeFn) {
    var entry = { id: id, close: closeFn, pushed: false };
    stack.push(entry);
    /* если предыдущее окно ещё «откатывает» свою запись — ждём popstate, иначе записи перепутаются */
    if (pendingBack) queue.push(entry); else doPush(entry);
  }

  function release(id) {
    var i = -1;
    for (var k = stack.length - 1; k >= 0; k--) if (stack[k].id === id) { i = k; break; }
    if (i < 0) return;
    var entry = stack.splice(i, 1)[0];
    var q = queue.indexOf(entry);
    if (q >= 0) { queue.splice(q, 1); return; }
    if (entry.pushed) { pendingBack++; history.back(); }
  }

  window.addEventListener("popstate", function () {
    if (pendingBack) {
      pendingBack--;
      if (!pendingBack && queue.length) queue.splice(0).forEach(doPush);
      return;
    }
    var top = stack.pop();
    if (top) { top.close(); return; }
    /* «вперёд» на запись закрытого окна — просто убираем метку */
    try { if (history.state && history.state.ov) history.replaceState(null, ""); } catch (e) {}
  });

  window.OverlayHistory = { push: push, release: release };
})();
