/*
  DIGITAL MISSION — TEACHER UI STABLE
  Hanya lapisan presentasi ringan. Tidak memakai MutationObserver,
  interval, resize loop, atau pengamatan subtree Firebase.
*/
(() => {
  'use strict';
  if (window.__DM_TEACHER_UI_STABLE__) return;
  window.__DM_TEACHER_UI_STABLE__ = true;

  const q = (selector, root = document) => root.querySelector(selector);
  const qa = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  let pressBound = false;

  function setMode(id) {
    const teacher = q('#teacher');
    const active = id === 'teacher' && !!teacher && !teacher.classList.contains('hidden');
    document.body.classList.toggle('teacher-shell-active', active);
    if (teacher) teacher.classList.toggle('teacher-ui-active', active);
  }

  function bindPressFeedback() {
    if (pressBound) return;
    pressBound = true;
    document.addEventListener('pointerdown', event => {
      const button = event.target.closest('#teacher .btn, #caseDrawer .btn, #caseDrawer .case-drawer-close');
      if (button && !button.disabled) button.classList.add('teacher-button-pressed');
    }, { passive: true });
    const clear = () => qa('.teacher-button-pressed').forEach(el => el.classList.remove('teacher-button-pressed'));
    document.addEventListener('pointerup', clear, { passive: true });
    document.addEventListener('pointercancel', clear, { passive: true });
  }

  function init() {
    bindPressFeedback();
    const teacher = q('#teacher');
    setMode(teacher && !teacher.classList.contains('hidden') ? 'teacher' : 'home');
  }

  window.DMTeacherUI = { setMode };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
