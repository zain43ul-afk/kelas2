(function(){
  'use strict';
  if(window.__DM_TEACHER_UI_V7__)return;
  window.__DM_TEACHER_UI_V7__=true;

  const $=id=>document.getElementById(id);
  const bridge=()=>window.DMTeacherState||{};
  let selectedView=null;
  let lastAutoView='pre';
  let lastResultsKey='';
  let difficulty='sedang';

  function room(){return bridge().getRoomState?.()||null}
  function meta(){return room()?.meta||{}}
  function roundIndex(){return Number(meta().roundIndex??-1)}
  function isLocked(){const m=meta();return roundIndex()>=0&&(m.locked||m.roundStatus==='locked')}
  function isActive(){const m=meta();return roundIndex()>=0&&!isLocked()&&m.roundStatus==='active'}
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
    return false;
  }

  function applyView(view){
    const teacher=$('teacher');if(!teacher)return;
    if(!available(view)&&view!=='ai')view=autoView();
    teacher.dataset.view=view;
    show($('teacherAiInlineView'),view==='ai');
    show($('teacherOperationalView'),view!=='ai');
    document.querySelectorAll('#teacherStageSwitcher button[data-view]').forEach(btn=>{
      const v=btn.dataset.view;
      btn.classList.toggle('active',v===view);
      btn.disabled=!available(v)&&v!=='ai';
      btn.classList.toggle('done',v==='pre'&&roundIndex()>=0 || v==='active'&&isLocked());
      btn.setAttribute('aria-current',v===view?'page':'false');
    });
    if(view==='ai')refreshAiPanel();
    if(view==='results'){
      const key=String(bridge().getRoundKey?.()||roundIndex());
      if(key&&key!==lastResultsKey){lastResultsKey=key;toggleAnalysis(true)}
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

  function toggleAnswers(force){
    const card=$('teacherAnswersCard');if(!card)return;
    const body=document.body;
    const open=typeof force==='boolean'?force:!body.classList.contains('teacher-answers-open');
    body.classList.toggle('teacher-answers-open',open);
    card.classList.toggle('hidden',false);
    if(open)smoothFocus(card);
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
  function toggleQuickMenu(){
    const m=$('teacherQuickMenu');if(!m)return;m.classList.toggle('hidden');
  }
  function focusLeaderboard(){smoothFocus($('teacherLeaderboardCard'))}

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
    const r=room(),cfg=r?.meta?.missionConfig||{},m=firstMission();
    const title=$('teacherAiTitle');
    if(title&&!title.matches(':focus'))title.value=m?.title||title.value||'Kota Pintar, Warga Bahagia?';
    const topic=cfg.topic||sourceControl('caseTopic')?.value||'Keamanan dan etika digital';
    const focus=cfg.skill||sourceControl('caseSkill')?.value||'campuran';
    const rounds=Number(cfg.rounds||sourceControl('caseRoundCount')?.value||bridge().getMissionCount?.()||5);
    const slides=Number(cfg.slidesPerCase||sourceControl('caseSlideCount')?.value||3);
    const diff=cfg.difficulty||sourceControl('caseDifficulty')?.value||'sedang';
    let guide=String(cfg.teacherNote||sourceControl('caseTeacherNote')?.value||'');
    guide=guide.replace(/^Gunakan judul utama yang mencerminkan:\s*"[^"]+"\.\s*/i,'');
    setVal('teacherAiTopic',topic);setVal('teacherAiFocus',focus);setVal('teacherAiRoundCount',rounds);setVal('teacherAiSlideCount',slides);setVal('teacherAiGuide',guide);
    setDifficulty(diff);
    updateCounters();
  }

  function syncInlineToGenerator(){
    const pairs=[['teacherAiTopic','caseTopic'],['teacherAiFocus','caseSkill'],['teacherAiRoundCount','caseRoundCount'],['teacherAiSlideCount','caseSlideCount']];
    pairs.forEach(([a,b])=>{const x=$(a),y=sourceControl(b);if(x&&y)y.value=x.value});
    const diff=sourceControl('caseDifficulty');if(diff)diff.value=difficulty;
    const guide=String($('teacherAiGuide')?.value||'').trim();
    const title=String($('teacherAiTitle')?.value||'').trim();
    const note=[title?`Gunakan judul utama yang mencerminkan: "${title}".`:'',guide].filter(Boolean).join(' ');
    const target=sourceControl('caseTeacherNote');if(target)target.value=note.slice(0,500);
  }

  function updateCounters(){
    const t=$('teacherAiTitle'),tc=$('teacherAiTitleCount');if(t&&tc)tc.textContent=`${t.value.length}/100`;
    const g=$('teacherAiGuide'),gc=$('teacherAiGuideCount');if(g&&gc)gc.textContent=`${g.value.length}/300`;
  }

  function previewTag(i){return i===0?'▧ Membaca & Memahami':i===1?'⚖ Analisis & Diskusi':'♟ Argumen & Solusi'}
  function renderPreview(){
    const box=$('teacherAiPreviewCards'),badge=$('teacherAiPreviewBadge'),ready=$('teacherAiReadyTitle');if(!box)return;
    const missions=bridge().getMissions?.()||[];const m=missions[0];
    const mode=bridge().getMissionSourceMode?.()||'default';
    const count=missions.length||bridge().getMissionCount?.()||0;
    if(ready)ready.textContent=mode==='ai'?`${count} kasus AI siap digunakan`:`${count} kasus siap digunakan`;
    const slides=m?missionSlides(m):[];if(badge)badge.textContent=`${slides.length||Number($('teacherAiSlideCount')?.value||3)} slide`;
    if(!slides.length){box.innerHTML='<div class="teacher-ai-preview-empty">Preview akan muncul setelah kasus tersedia.</div>';return}
    box.innerHTML=slides.map((sl,i)=>{
      const image=sl.imageUrl?`<img src="${escAttr(sl.imageUrl)}" alt="Ilustrasi slide ${i+1}" loading="lazy">`:`<div class="teacher-ai-preview-placeholder"><span>${i+1}</span></div>`;
      const text=String(sl.text||'');
      return `<article class="teacher-ai-slide-card"><div class="teacher-ai-slide-image"><span class="teacher-ai-slide-number">${i+1}</span>${image}</div><h4>Slide ${i+1}: ${escapeHtml(sl.title||`Bagian ${i+1}`)}</h4><p>${escapeHtml(text.slice(0,210))}${text.length>210?'…':''}</p><span class="teacher-ai-slide-tag">${previewTag(i)}</span></article>`;
    }).join('');
  }

  function refreshAiPanel(){
    syncInlineFromConfig();renderPreview();
    const disabled=roundIndex()>=0;
    ['teacherAiTitle','teacherAiTopic','teacherAiRoundCount','teacherAiSlideCount','teacherAiFocus','teacherAiGuide'].forEach(id=>{const el=$(id);if(el)el.disabled=disabled});
    document.querySelectorAll('#teacherAiDifficulty button').forEach(b=>b.disabled=disabled);
    const gen=$('teacherAiGenerateBtn');if(gen){gen.disabled=disabled;gen.textContent=disabled?'Kasus Terkunci':'✦ Generate Kasus AI'}
  }

  async function generateCases(){
    if(roundIndex()>=0)return;
    syncInlineToGenerator();
    const n=$('teacherAiInlineNotice');if(n){n.className='teacher-ai-inline-notice wait';n.textContent='AI sedang membuat paket kasus dan ilustrasi…'}
    try{
      if(typeof window.generateCasesAI!=='function')throw new Error('Fungsi generator kasus tidak ditemukan.');
      await window.generateCasesAI();
      if(n){n.className='teacher-ai-inline-notice good';n.textContent='Paket kasus berhasil diperbarui. Preview akan mengikuti hasil terbaru.'}
      setTimeout(()=>{syncInlineFromConfig();renderPreview()},250);
    }catch(err){if(n){n.className='teacher-ai-inline-notice bad';n.textContent=err?.message||String(err)}}
  }

  function resetAiForm(){
    const cfg=room()?.meta?.missionConfig||{};
    setVal('teacherAiTitle',firstMission()?.title||'Kota Pintar, Warga Bahagia?');
    setVal('teacherAiTopic',cfg.topic||'Keamanan dan etika digital');
    setVal('teacherAiFocus',cfg.skill||'campuran');
    setVal('teacherAiRoundCount',cfg.rounds||5);setVal('teacherAiSlideCount',cfg.slidesPerCase||3);
    setVal('teacherAiGuide','Arahkan siswa untuk melihat berbagai sudut pandang, menggunakan data, dan memberikan solusi yang realistis.');
    setDifficulty(cfg.difficulty||'sedang');updateCounters();
  }

  function bindAiInputs(){
    ['teacherAiTitle','teacherAiGuide'].forEach(id=>{const el=$(id);if(el&&!el.dataset.bound){el.dataset.bound='1';el.addEventListener('input',updateCounters)}});
    ['teacherAiSlideCount'].forEach(id=>{const el=$(id);if(el&&!el.dataset.previewBound){el.dataset.previewBound='1';el.addEventListener('change',()=>{const badge=$('teacherAiPreviewBadge');if(badge)badge.textContent=`${el.value} slide`})}});
  }

  function setMode(mode){if(mode!=='teacher'){selectedView=null;document.body.classList.remove('teacher-answers-open');show($('teacherQuickMenu'),false)}}

  window.DMTeacherUI={refresh,switchView,toggleAnswers,toggleCaseViewer,toggleAnalysis,toggleQuickMenu,focusLeaderboard,updateDateChip,setDifficulty,generateCases,resetAiForm,setMode};
  document.addEventListener('click',e=>{const menu=$('teacherQuickMenu');if(menu&&!menu.classList.contains('hidden')&&!menu.contains(e.target)&&!e.target.closest('.teacher-overflow-btn'))show(menu,false)});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.body.classList.remove('teacher-answers-open');show($('teacherQuickMenu'),false)}});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{bindAiInputs();refresh()},{once:true});else{bindAiInputs();refresh()}
})();
