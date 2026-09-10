/*
  DIGITAL MISSION — TEACHER UI
  Small presentation layer only. It does not change Firebase/game logic.
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

  function normalizeButton(selector, fallback) {
    const el = $(selector);
    if (!el) return;
    const current = stripLeadingDecorativeSymbols(el.textContent || '');

    // Keep dynamic round numbers supplied by the main app.
    if (selector === '#nextRoundBtn') {
      el.textContent = stripLeadingDecorativeSymbols(el.textContent || 'Mulai Ronde 1');
      return;
    }

    if (selector === '#generateCasesBtn' && /membuat kasus/i.test(current)) {
      el.textContent = 'Membuat kasus…';
      return;
    }

    if (selector === '#openCaseGeneratorBtn' && /kasus terkunci/i.test(current)) {
      el.textContent = 'Kasus Terkunci';
      return;
    }

    el.textContent = fallback || current;
  }

  function cleanTeacherCopy() {
    Object.entries(labels).forEach(([selector, label]) => normalizeButton(selector, label));
    normalizeButton('#nextRoundBtn');

    const launcherIcon = $('.case-launcher-icon');
    if (launcherIcon) launcherIcon.textContent = 'AI';

    const activityTitle = $('#teacher .activity-eval-toolbar h3');
    if (activityTitle) activityTitle.textContent = 'Analisis Keaktifan Chat Siswa';

    const drawerTitle = $('#caseDrawerTitle');
    if (drawerTitle) drawerTitle.textContent = 'Generator Kasus AI';

    const drawerSections = $$('#caseDrawer .case-drawer-section-title h4');
    drawerSections.forEach((el) => {
      el.textContent = stripLeadingDecorativeSymbols(el.textContent);
    });

    const advanced = $('#caseDrawer details > summary');
    if (advanced) advanced.innerHTML = 'Pengaturan Lanjutan <span style="font-weight:600;color:var(--muted)">(opsional)</span>';
  }

  function prepareRevealAnimation() {
    const teacher = $('#teacher');
    if (!teacher || teacher.classList.contains('hidden')) return;

    document.body.classList.add('teacher-shell-active');

    const cards = $$('#teacher .grid > .card');
    cards.forEach((card, index) => {
      card.classList.add('teacher-reveal');
      card.style.setProperty('--teacher-order', index);
    });

    const stats = $$('#teacher .stat');
    stats.forEach((stat, index) => {
      stat.classList.add('teacher-stat-reveal');
      stat.style.setProperty('--teacher-order', index);
    });

    // Restart only when entering teacher mode, not on every realtime render.
    if (!teacher.dataset.teacherAnimated) {
      teacher.dataset.teacherAnimated = '1';
      teacher.classList.remove('teacher-ui-enter');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => teacher.classList.add('teacher-ui-enter'));
      });
    }
  }

  function syncMode() {
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

  function addPressFeedback() {
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
    syncMode();
    addPressFeedback();

    const teacher = $('#teacher');
    if (teacher) {
      new MutationObserver(() => {
        syncMode();
        cleanTeacherCopy();
      }).observe(teacher, { attributes: true, attributeFilter: ['class'], childList: true, subtree: true });
    }

    const drawer = $('#caseDrawer');
    if (drawer) {
      new MutationObserver(cleanTeacherCopy).observe(drawer, { childList: true, subtree: true, characterData: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
