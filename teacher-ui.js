/*
  DIGITAL MISSION — TEACHER UI (responsive/performance fix)
  Presentation layer only. It does not change Firebase/game logic.
*/
(() => {
  'use strict';

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));

  const labels = {
    '#shuffleTeamsBtn': 'Acak Tim',
    '#releaseTeamsBtn': 'Masukkan Siswa ke Tim',
    '#reopenCollectingBtn': 'Kumpulkan Lagi',
    '#addTimeBtn': '+ 1 Menit',
    '#challengeBtn': 'Kartu Kejutan',
    '#lockBtn': 'Kunci & Nilai',
    '#openCaseGeneratorBtn': 'Generate Kasus AI',
    '#generateCasesBtn': 'Generate Sekarang',
    '#defaultCasesBtn': 'Kasus Bawaan'
  };

  const stripLeadingDecorativeSymbols = (text = '') => text
    .replace(/^\s*[✨🤖🎯⚙️👀🎲➡️↩️▶️▶🎴🔒📚🧠]+\s*/u, '')
    .trim();

  let syncFrame = 0;
  let initializedPressFeedback = false;

  function setTextIfChanged(el, value) {
    if (!el || typeof value !== 'string') return;
    if ((el.textContent || '') !== value) el.textContent = value;
  }

  function normalizeButton(selector, fallback) {
    const el = $(selector);
    if (!el) return;

    const raw = el.textContent || '';
    const current = stripLeadingDecorativeSymbols(raw);
    let desired = fallback || current;

    if (selector === '#nextRoundBtn') {
      desired = stripLeadingDecorativeSymbols(raw || 'Mulai Ronde 1');
    } else if (selector === '#generateCasesBtn' && /membuat kasus/i.test(current)) {
      desired = 'Membuat kasus…';
    } else if (selector === '#openCaseGeneratorBtn' && /kasus terkunci/i.test(current)) {
      desired = 'Kasus Terkunci';
    }

    setTextIfChanged(el, desired);
  }

  function cleanTeacherCopy() {
    Object.entries(labels).forEach(([selector, label]) => normalizeButton(selector, label));
    normalizeButton('#nextRoundBtn');

    const launcherIcon = $('.case-launcher-icon');
    setTextIfChanged(launcherIcon, 'AI');

    const activityTitle = $('#teacher .activity-eval-toolbar h3');
    setTextIfChanged(activityTitle, 'Analisis Keaktifan Chat Siswa');

    const drawerTitle = $('#caseDrawerTitle');
    setTextIfChanged(drawerTitle, 'Generator Kasus AI');

    $$('#caseDrawer .case-drawer-section-title h4').forEach((el) => {
      const desired = stripLeadingDecorativeSymbols(el.textContent || '');
      setTextIfChanged(el, desired);
    });

    const advanced = $('#caseDrawer details > summary');
    if (advanced) {
      const desired = 'Pengaturan Lanjutan <span style="font-weight:600;color:var(--muted)">(opsional)</span>';
      if (advanced.innerHTML !== desired) advanced.innerHTML = desired;
    }
  }

  function prepareRevealAnimation() {
    const teacher = $('#teacher');
    if (!teacher || teacher.classList.contains('hidden')) return;

    const cards = $$('#teacher .grid > .card');
    cards.forEach((card, index) => {
      if (!card.classList.contains('teacher-reveal')) card.classList.add('teacher-reveal');
      if (card.style.getPropertyValue('--teacher-order') !== String(index)) {
        card.style.setProperty('--teacher-order', index);
      }
    });

    const stats = $$('#teacher .stat');
    stats.forEach((stat, index) => {
      if (!stat.classList.contains('teacher-stat-reveal')) stat.classList.add('teacher-stat-reveal');
      if (stat.style.getPropertyValue('--teacher-order') !== String(index)) {
        stat.style.setProperty('--teacher-order', index);
      }
    });

    if (!teacher.dataset.teacherAnimated) {
      teacher.dataset.teacherAnimated = '1';
      teacher.classList.remove('teacher-ui-enter');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (!teacher.classList.contains('hidden')) teacher.classList.add('teacher-ui-enter');
      }));
    }
  }

  function syncModeNow() {
    const teacher = $('#teacher');
    const active = !!teacher && !teacher.classList.contains('hidden');
    document.body.classList.toggle('teacher-shell-active', active);

    if (active) {
      cleanTeacherCopy();
      prepareRevealAnimation();
    } else if (teacher) {
      teacher.dataset.teacherAnimated = '';
      teacher.classList.remove('teacher-ui-enter');
    }
  }

  function scheduleSync() {
    if (syncFrame) return;
    syncFrame = requestAnimationFrame(() => {
      syncFrame = 0;
      syncModeNow();
    });
  }

  function addPressFeedback() {
    if (initializedPressFeedback) return;
    initializedPressFeedback = true;

    document.addEventListener('pointerdown', (event) => {
      const button = event.target.closest('#teacher .btn, #caseDrawer .btn, #caseDrawer .case-drawer-close');
      if (!button || button.disabled) return;
      button.classList.add('teacher-button-pressed');
    }, { passive: true });

    const clear = () => {
      $$('.teacher-button-pressed').forEach((el) => el.classList.remove('teacher-button-pressed'));
    };
    document.addEventListener('pointerup', clear, { passive: true });
    document.addEventListener('pointercancel', clear, { passive: true });
  }

  function initialize() {
    addPressFeedback();
    scheduleSync();

    const teacher = $('#teacher');
    if (teacher) {
      // Critical fix: observe class changes directly, and batch dynamic UI changes
      // into a single animation frame instead of mutating repeatedly inside the observer.
      const observer = new MutationObserver(scheduleSync);
      observer.observe(teacher, {
        attributes: true,
        attributeFilter: ['class'],
        childList: true,
        subtree: true
      });
    }

    const drawer = $('#caseDrawer');
    if (drawer) {
      const drawerObserver = new MutationObserver(scheduleSync);
      drawerObserver.observe(drawer, {
        attributes: true,
        attributeFilter: ['class'],
        childList: true,
        subtree: true
      });
    }

    window.addEventListener('resize', scheduleSync, { passive: true });
    window.addEventListener('orientationchange', scheduleSync, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
