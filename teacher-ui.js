(function(){
  function $(id){ return document.getElementById(id) }

  function show(el, yes){
    if(!el) return
    el.classList.toggle('hidden', !yes)
  }

  function smoothFocus(el){
    if(!el) return
    try{ el.scrollIntoView({behavior:'smooth', block:'start'}) }catch(_){ }
  }

  function toggleAnswers(force){
    const card = $('teacherAnswersCard')
    if(!card) return
    const next = typeof force === 'boolean' ? force : card.classList.contains('hidden')
    show(card, next)
    if(next) smoothFocus(card)
  }

  function toggleCaseViewer(force){
    const card = $('teacherCaseViewer')
    if(!card) return
    const next = typeof force === 'boolean' ? force : card.classList.contains('hidden')
    show(card, next)
    if(next) smoothFocus(card)
  }

  function toggleAnalysis(force){
    const card = $('teacherAnalysisCard')
    const btn = $('toggleAnalysisBtn')
    if(!card) return
    const next = typeof force === 'boolean' ? force : card.classList.contains('collapsed')
    card.classList.toggle('collapsed', !next)
    if(btn) btn.textContent = next ? '⌃' : '⌄'
    if(next) smoothFocus(card)
  }

  function updateDateChip(){
    const chip = $('teacherDateChip')
    if(!chip) return
    const now = new Date()
    chip.textContent = now.toLocaleString('id-ID', {
      weekday:'long', day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'
    })
  }

  function setMode(mode){
    if(mode !== 'teacher') {
      toggleAnswers(false)
      toggleCaseViewer(false)
    }
  }

  window.DMTeacherUI = {
    toggleAnswers,
    toggleCaseViewer,
    toggleAnalysis,
    updateDateChip,
    setMode
  }

  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') {
      toggleAnswers(false)
      toggleCaseViewer(false)
    }
  })
})();
