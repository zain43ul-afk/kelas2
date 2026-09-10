/*
  DIGITAL MISSION — TEACHER DASHBOARD UI
  Presentational helpers only. No MutationObserver, Firebase listener,
  DOM polling, or recurring layout work.
*/
(() => {
  'use strict';
  if (window.__DM_TEACHER_REFERENCE_UI__) return;
  window.__DM_TEACHER_REFERENCE_UI__ = true;

  const q = (s, root = document) => root.querySelector(s);
  const qa = (s, root = document) => Array.from(root.querySelectorAll(s));
  let pressBound = false;

  function setMode(id) {
    const teacher = q('#teacher');
    const active = id === 'teacher' && teacher && !teacher.classList.contains('hidden');
    document.body.classList.toggle('teacher-shell-active', !!active);
    teacher?.classList.toggle('teacher-ui-active', !!active);
    q('#teacherHeaderProfile')?.classList.toggle('hidden', !active);
    if (!active) {
      document.body.classList.remove('teacher-answers-open');
      q('#teacherCaseViewer')?.classList.add('hidden');
    }
    if (active) updateDateChip();
  }

  function updateDateChip() {
    const el = q('#teacherDateChip');
    if (!el) return;
    const now = new Date();
    const date = new Intl.DateTimeFormat('id-ID', {
      weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
    }).format(now);
    const time = new Intl.DateTimeFormat('id-ID', {hour: '2-digit', minute: '2-digit'}).format(now);
    el.textContent = `${date} • ${time}`;
  }

  function toggleAnalysis(force) {
    const card = q('#teacherAnalysisCard');
    if (!card) return;
    const shouldOpen = typeof force === 'boolean' ? force : card.classList.contains('collapsed');
    card.classList.toggle('collapsed', !shouldOpen);
    const btn = q('#toggleAnalysisBtn');
    if (btn) btn.setAttribute('aria-expanded', String(shouldOpen));
    if (shouldOpen) setTimeout(() => card.scrollIntoView({behavior:'smooth', block:'nearest'}), 120);
  }

  function toggleCaseViewer(force) {
    const panel = q('#teacherCaseViewer');
    if (!panel) return;
    const shouldOpen = typeof force === 'boolean' ? force : panel.classList.contains('hidden');
    panel.classList.toggle('hidden', !shouldOpen);
    if (shouldOpen) setTimeout(() => panel.scrollIntoView({behavior:'smooth', block:'nearest'}), 80);
  }

  function toggleAnswers(force) {
    const card = q('#teacherAnswersCard');
    if (!card) return;
    const shouldOpen = typeof force === 'boolean' ? force : !document.body.classList.contains('teacher-answers-open');
    document.body.classList.toggle('teacher-answers-open', shouldOpen);
    card.setAttribute('aria-hidden', String(!shouldOpen));
    const openBtn = q('#viewLockedAnswersBtn');
    if (openBtn) openBtn.setAttribute('aria-expanded', String(shouldOpen));
    if (shouldOpen) {
      setTimeout(() => {
        card.scrollTo({top:0, behavior:'auto'});
        q('.teacher-answers-close', card)?.focus({preventScroll:true});
      }, 20);
    }
  }

  function bindPressFeedback() {
    if (pressBound) return;
    pressBound = true;

    /* Robust modal closing: when the answer dialog is open, clicks outside the
       card close it in capture phase and are not allowed to hit controls behind it. */
    document.addEventListener('pointerdown', event => {
      if (!document.body.classList.contains('teacher-answers-open')) return;
      const card = q('#teacherAnswersCard');
      const openBtn = q('#viewLockedAnswersBtn');
      if (card && !card.contains(event.target) && !(openBtn && openBtn.contains(event.target))) {
        event.preventDefault();
        event.stopPropagation();
        toggleAnswers(false);
      }
    }, true);

    q('.teacher-answers-close')?.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      toggleAnswers(false);
    });

    document.addEventListener('pointerdown', event => {
      const button = event.target.closest('#teacher button, #caseDrawer button');
      if (button && !button.disabled) button.classList.add('teacher-button-pressed');
    }, {passive:true});
    const clear = () => qa('.teacher-button-pressed').forEach(el => el.classList.remove('teacher-button-pressed'));
    document.addEventListener('pointerup', clear, {passive:true});
    document.addEventListener('pointercancel', clear, {passive:true});
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        document.body.classList.remove('teacher-answers-open');
        q('#teacherCaseViewer')?.classList.add('hidden');
      }
    });
  }

  function init() {
    bindPressFeedback();
    const teacher = q('#teacher');
    setMode(teacher && !teacher.classList.contains('hidden') ? 'teacher' : 'home');
  }

  window.DMTeacherUI = {setMode, updateDateChip, toggleAnalysis, toggleCaseViewer, toggleAnswers};
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
