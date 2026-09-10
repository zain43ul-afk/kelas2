/*
  DIGITAL MISSION — TEACHER UI SAFE
  Lapisan presentasi saja. Tidak mengamati subtree Firebase dan tidak mengubah game state.
*/
(() => {
  'use strict';
  if (window.__DM_TEACHER_UI_SAFE__) return;
  window.__DM_TEACHER_UI_SAFE__ = true;

  const q = (s, root = document) => root.querySelector(s);
  const qa = (s, root = document) => Array.from(root.querySelectorAll(s));
  let teacherObserver = null;
  let pressBound = false;

  function revealTeacherOnce() {
    const teacher = q('#teacher');
    if (!teacher || teacher.classList.contains('hidden')) return;
    if (teacher.dataset.teacherUiReady === '1') return;

    teacher.dataset.teacherUiReady = '1';
    qa('#teacher .grid > .card').forEach((card, index) => {
      card.classList.add('teacher-reveal');
      card.style.setProperty('--teacher-order', String(index));
    });
    qa('#teacher .stat').forEach((stat, index) => {
      stat.classList.add('teacher-stat-reveal');
      stat.style.setProperty('--teacher-order', String(index));
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!teacher.classList.contains('hidden')) teacher.classList.add('teacher-ui-enter');
      });
    });
  }

  function syncTeacherMode() {
    const teacher = q('#teacher');
    const active = !!teacher && !teacher.classList.contains('hidden');
    document.body.classList.toggle('teacher-shell-active', active);

    if (active) {
      revealTeacherOnce();
    } else if (teacher) {
      teacher.dataset.teacherUiReady = '';
      teacher.classList.remove('teacher-ui-enter');
    }
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
    syncTeacherMode();
    const teacher = q('#teacher');
    if (teacher) {
      teacherObserver = new MutationObserver(syncTeacherMode);
      teacherObserver.observe(teacher, { attributes: true, attributeFilter: ['class'] });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
