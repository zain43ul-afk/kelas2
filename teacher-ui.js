(function(){
  'use strict';
  if(window.__DM_TEACHER_UI_V8__)return;
  window.__DM_TEACHER_UI_V8__=true;

  const $=id=>document.getElementById(id);
  const bridge=()=>window.DMTeacherState||{};
  let selectedView=null;
  let lastAutoView='pre';
  let lastResultsKey='';
  let difficulty='sedang';
  let activePanel='answers';
  let requestedRounds=null;

  function room(){return bridge().getRoomState?.()||null}
  function meta(){return room()?.meta||{}}
  function roundIndex(){return Number(meta().roundIndex??-1)}
  function isLocked(){const m=meta();return roundIndex()>=0&&(m.locked||m.roundStatus==='locked')}
  function isActive(){const m=meta();return roundIndex()>=0&&!isLocked()&&m.roundStatus==='active'}
  function finalReady(){const total=Number(bridge().getMissionCount?.()||0);return isLocked()&&total>0&&roundIndex()>=total-1}
  function autoView(){return isLocked()?'results':isActive()?'active':'pre'}
  function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function escAttr(v){return escapeHtml(v)}
  function show(el,yes){if(el)el.classList.toggle('hidden',!yes)}
  function smoothFocus(el){if(!el)return;try{el.scrollIntoView({behavior:'smooth',block:'start'})}catch(_){}}

  function available(view){
    const idx=roundIndex();
    if(view==='ai')return true;
    if(view==='pre')return idx<0;
    if(view==='active')return isActive();
    if(view==='results')return isLocked();
    if(view==='final')return finalReady();
    return false;
  }

  function applyView(view){
    const teacher=$('teacher');if(!teacher)return;
    if(!available(view)&&view!=='ai')view=autoView();
    teacher.dataset.view=view;
    show($('teacherAiInlineView'),view==='ai');
    show($('teacherOperationalView'),view!=='ai'&&view!=='final');
    show($('teacherRoundDurationCard'),view==='pre');
    show($('teacherFinalView'),view==='final');
    document.querySelectorAll('#teacherStageSwitcher button[data-view]').forEach(btn=>{
      const v=btn.dataset.view;
      btn.classList.toggle('active',v===view);
      btn.disabled=!available(v)&&v!=='ai';
      btn.classList.toggle('done',v==='pre'&&roundIndex()>=0 || v==='active'&&isLocked());
      btn.setAttribute('aria-current',v===view?'page':'false');
    });
    if(view==='ai')refreshAiPanel();
    if(view==='active')switchActivePanel(activePanel);
    if(view==='results'){
      const key=String(bridge().getRoundKey?.()||roundIndex());
      if(key&&key!==lastResultsKey){lastResultsKey=key;toggleAnalysis(true)}
    }
    if(view==='final'){
      if(typeof window.renderFinalScores==='function')window.renderFinalScores();
      smoothFocus($('teacherFinalView'));
    }
  }

  function switchView(view){
    if(bridge().getMode?.()!=='teacher')return;
    if(view!=='ai'&&!available(view))return;
    selectedView=view;
    applyView(view);
  }

  function refresh(){
    if(bridge().getMode?.()!=='teacher')return;
    const a=autoView();
    if(a!==lastAutoView){
      lastAutoView=a;
      if(selectedView!=='ai'||roundIndex()>=0)selectedView=null;
    }
    if(selectedView&&selectedView!=='ai'&&!available(selectedView))selectedView=null;
    if(selectedView==='ai'&&roundIndex()>=0)selectedView=null;
    applyView(selectedView||a);
    updateDateChip();
  }

  function switchActivePanel(panel){
    activePanel=panel==='slides'?'slides':'answers';
    const answerBtn=$('teacherAnswerTabBtn'),slideBtn=$('teacherSlideTabBtn');
    const answerPanel=$('teacherAnswerTabPanel'),slidePanel=$('teacherSlideTabPanel');
    answerBtn?.classList.toggle('active',activePanel==='answers');
    slideBtn?.classList.toggle('active',activePanel==='slides');
    show(answerPanel,activePanel==='answers');
    show(slidePanel,activePanel==='slides');
    if(activePanel==='slides'){
      const idx=roundIndex(),mission=idx>=0?bridge().getMission?.(idx):null;
      if(mission&&typeof window.renderMissionSlides==='function')window.renderMissionSlides('teacherActiveMission',mission,'teacher');
    }
  }

  function toggleAnswers(force){
    const card=$('teacherAnswersCard');if(!card)return;
    const body=document.body;
    const open=typeof force==='boolean'?force:!body.classList.contains('teacher-answers-open');
    body.classList.toggle('teacher-answers-open',open);
    card.classList.toggle('hidden',false);
    if(open){switchActivePanel('answers');smoothFocus(card);}
  }
  function toggleCaseViewer(force){
    const card=$('teacherCaseViewer');if(!card)return;
    const next=typeof force==='boolean'?force:card.classList.contains('hidden');
    show(card,next);if(next)smoothFocus(card);
  }
  function toggleAnalysis(force){
    const card=$('teacherAnalysisCard'),btn=$('toggleAnalysisBtn');if(!card)return;
    const next=typeof force==='boolean'?force:card.classList.contains('collapsed');
    card.classList.toggle('collapsed',!next);
    if(btn)btn.textContent=next?'⌃':'⌄';
  }
  function focusLeaderboard(){smoothFocus($('teacherLeaderboardCard'))}
  function openScores(){
    if(finalReady()){switchView('final');return}
    toggleAnswers(true);
  }

  function downloadFinalScores(){
    const table=$('teacherFinalScoresCard')?.querySelector('table');if(!table)return;
    const rows=[...table.querySelectorAll('tr')].map(tr=>[...tr.children].map(cell=>`"${String(cell.innerText||'').replace(/"/g,'""').replace(/\n+/g,' ')}"`).join(','));
    const blob=new Blob(["\uFEFF"+rows.join("\n")],{type:'text/csv;charset=utf-8'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='digital-mission-nilai-final.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);
  }
  function printFinalScores(){window.print()}
  function focusFinalAnalysis(){smoothFocus($('teacherFinalAnalysis'))}

  function updateDateChip(){
    const chip=$('teacherDateChip');if(!chip)return;
    const target=chip.querySelector('span')||chip;
    const now=new Date();
    target.textContent=now.toLocaleString('id-ID',{weekday:'long',day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
  }

  function sourceControl(id){return document.getElementById(id)}
  function inlineControl(id){return document.getElementById(id)}
  function setVal(id,val){const el=inlineControl(id);if(el&&val!==undefined&&val!==null)el.value=val}
  function firstMission(){return bridge().getMissions?.()?.[0]||null}
  function missionSlides(m){return Array.isArray(m?.slides)&&m.slides.length?m.slides:[{title:m?.title||'Kasus',text:m?.text||''}]}

  function setDifficulty(value){
    difficulty=value||'sedang';
    document.querySelectorAll('#teacherAiDifficulty button').forEach(b=>b.classList.toggle('active',b.dataset.value===difficulty));
  }

  function syncInlineFromConfig(){
    const r=room(),cfg=r?.meta?.missionConfig||{};
    if(requestedRounds===null){
      requestedRounds=Math.max(2,Math.min(5,Number(cfg.rounds||bridge().getMissionCount?.()||5)));
    }
    const control=$('teacherAiRoundCount');
    if(control)control.value=String(requestedRounds);
  }

  function syncInlineToGenerator(){
    const rounds=Math.max(2,Math.min(5,Number($('teacherAiRoundCount')?.value||requestedRounds||5)));
    requestedRounds=rounds;
    const hidden=sourceControl('caseRoundCount');
    if(hidden)hidden.value=String(rounds);
  }

  function updateCounters(){}

  function previewTag(i,total){
    if(i===0)return '▧ Membaca & Memahami';
    if(i===total-1)return '♟ Keputusan & Solusi';
    return '⚖ Analisis & Diskusi';
  }

  function renderPreview(){
    const box=$('teacherAiPreviewCards'),badge=$('teacherAiPreviewBadge'),ready=$('teacherAiReadyTitle');
    if(!box)return;

    const missions=bridge().getMissions?.()||[];
    const requested=Math.max(2,Math.min(5,Number(requestedRounds||$('teacherAiRoundCount')?.value||missions.length||5)));
    const visible=missions.slice(0,requested);
    const mode=bridge().getMissionSourceMode?.()||'default';

    const totalSlides=visible.reduce((sum,m)=>sum+missionSlides(m).length,0);
    if(ready)ready.textContent=mode==='bank'?`${visible.length} ronde dari bank lokal siap digunakan`:`${visible.length} ronde siap digunakan`;
    if(badge)badge.textContent=visible.length?`${visible.length} ronde • ${totalSlides} slide`:`${requested} ronde`;

    if(!visible.length){
      box.innerHTML='<div class="teacher-ai-preview-empty">Belum ada paket kasus. Klik “Acak Kasus” untuk menyiapkan ronde.</div>';
      return;
    }

    box.innerHTML=visible.map((m,roundIdx)=>{
      const slides=missionSlides(m);
      const cleanTitle=String(m?.title||`Ronde ${roundIdx+1}`).replace(/^Ronde\s+\d+\s*[—-]\s*/i,'');
      const topic=String(m?.topic||m?.kicker||'Kasus pembelajaran');
      const cards=slides.map((sl,i)=>{
        const sharedImage=String(m?.imageUrl||sl?.imageUrl||'');
        const image=sharedImage
          ?`<img src="${escAttr(sharedImage)}" alt="Ilustrasi Ronde ${roundIdx+1}" loading="lazy">`
          :`<div class="teacher-ai-preview-placeholder"><span>${i+1}</span></div>`;
        const text=String(sl?.text||'');
        return `<article class="teacher-ai-slide-card">
          <div class="teacher-ai-slide-image"><span class="teacher-ai-slide-number">${i+1}</span>${image}</div>
          <h4>Slide ${i+1}: ${escapeHtml(sl?.title||`Bagian ${i+1}`)}</h4>
          <p>${escapeHtml(text)}</p>
          <span class="teacher-ai-slide-tag">${previewTag(i,slides.length)}</span>
        </article>`;
      }).join('');

      return `<section class="teacher-round-preview-section">
        <div class="teacher-round-preview-head">
          <div>
            <span class="teacher-round-eyebrow">RONDE ${roundIdx+1}</span>
            <h4>${escapeHtml(cleanTitle)}</h4>
            <p>${escapeHtml(topic)}</p>
          </div>
          <span class="teacher-round-slide-count">${slides.length} slide</span>
        </div>
        <div class="teacher-round-slide-grid">${cards}</div>
      </section>`;
    }).join('');

    if(visible.length<requested){
      box.insertAdjacentHTML('beforeend',`<div class="teacher-round-preview-note">Paket aktif baru berisi ${visible.length} ronde. Klik <b>Acak Kasus</b> untuk membuat paket ${requested} ronde.</div>`);
    }
  }

  function refreshAiPanel(){
    syncInlineFromConfig();
    renderPreview();
    const disabled=roundIndex()>=0;
    const rounds=$('teacherAiRoundCount');
    if(rounds)rounds.disabled=disabled;
    const gen=$('teacherAiGenerateBtn');
    if(gen){gen.disabled=disabled;gen.textContent=disabled?'Kasus Terkunci':'↻ Acak Kasus'}
  }

  async function generateCases(){
    if(roundIndex()>=0)return;
    syncInlineToGenerator();
    const n=$('teacherAiInlineNotice');if(n){n.className='teacher-ai-inline-notice wait';n.textContent='Sistem sedang memilih dan menyusun paket dari bank kasus lokal…'}
    try{
      if(typeof window.generateCasesAI!=='function')throw new Error('Fungsi generator kasus tidak ditemukan.');
      const result=await window.generateCasesAI();
      if(result?.ok===false)throw new Error(result.error||'Pembuatan kasus belum berhasil.');
      if(n){n.className='teacher-ai-inline-notice good';n.textContent=`Paket kasus lokal berhasil diperbarui: ${Number(result?.cases?.length||result?.imageCount||0)} ronde siap digunakan.`}
      setTimeout(()=>{syncInlineFromConfig();renderPreview()},250);
    }catch(err){if(n){n.className='teacher-ai-inline-notice bad';n.textContent=err?.message||String(err)}}
  }

  function resetAiForm(){
    const cfg=room()?.meta?.missionConfig||{};
    const rounds=$('teacherAiRoundCount');
    requestedRounds=Math.max(2,Math.min(5,Number(cfg.rounds||bridge().getMissionCount?.()||5)));
    if(rounds)rounds.value=String(requestedRounds);
    renderPreview();
  }

  function bindAiInputs(){
    const rounds=$('teacherAiRoundCount');
    if(rounds&&!rounds.dataset.bound){
      rounds.dataset.bound='1';
      rounds.addEventListener('change',()=>{
        requestedRounds=Math.max(2,Math.min(5,Number(rounds.value||5)));
        syncInlineToGenerator();
        renderPreview();
      });
    }
  }

  function setMode(mode){if(mode!=='teacher'){selectedView=null;document.body.classList.remove('teacher-answers-open')}}

  window.DMTeacherUI={refresh,switchView,switchActivePanel,toggleAnswers,toggleCaseViewer,toggleAnalysis,focusLeaderboard,openScores,downloadFinalScores,printFinalScores,focusFinalAnalysis,updateDateChip,setDifficulty,generateCases,resetAiForm,setMode};
  document.addEventListener('keydown',e=>{if(e.key==='Escape')document.body.classList.remove('teacher-answers-open')});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{bindAiInputs();refresh()},{once:true});else{bindAiInputs();refresh()}
})();
