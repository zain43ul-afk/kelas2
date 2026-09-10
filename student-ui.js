/* DIGITAL MISSION — Student dashboard controller
   Deliberately event-driven: no MutationObserver, no polling, no render monkey-patching. */
(function(){
  'use strict';
  if(window.__DM_STUDENT_UI_V3__)return;
  window.__DM_STUDENT_UI_V3__=true;

  const $=id=>document.getElementById(id);
  const bridge=()=>window.DMStudentState||{};
  let currentTab='case';
  let lastRoundMarker='';
  let movedToolbox=false,movedAi=false;

  function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function initial(name){const v=String(name||'?').trim();return (v[0]||'?').toUpperCase()}
  function state(){return bridge().getRoomState?.()||null}
  function student(){return bridge().getStudent?.()||null}
  function students(){return bridge().getStudents?.()||{}}

  function switchTab(name){
    if(!['case','discussion','answer'].includes(name))name='case';
    currentTab=name;
    document.querySelectorAll('#student .student-tab-btn').forEach(btn=>btn.classList.toggle('active',btn.dataset.tab===name));
    document.querySelectorAll('#student .student-tab-panel').forEach(panel=>panel.classList.toggle('active',panel.dataset.tab===name));
  }

  function ensureToolsModal(){
    if($('studentToolsModal'))return;
    const backdrop=document.createElement('div');backdrop.id='studentToolsBackdrop';backdrop.className='student-tools-backdrop';backdrop.addEventListener('click',closeTools);
    const modal=document.createElement('div');modal.id='studentToolsModal';modal.className='student-tools-modal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');
    modal.innerHTML='<div class="student-tools-modal-head"><h3>Alat Tim</h3><button type="button" class="student-tools-close" aria-label="Tutup">×</button></div><div id="studentToolsHost" class="student-tools-modal-body"></div>';
    modal.querySelector('.student-tools-close').addEventListener('click',closeTools);
    document.body.append(backdrop,modal);
  }

  function openTools(){
    ensureToolsModal();
    const host=$('studentToolsHost'),store=$('studentRoleToolStore'),box=$('roleToolbox'),ai=$('studentAiCard');
    if(!host||!store)return;
    host.innerHTML='';
    let count=0;
    if(box){host.appendChild(box);box.classList.remove('hidden');movedToolbox=true;count++}
    if(ai&&!ai.classList.contains('hidden')){host.appendChild(ai);movedAi=true;count++}
    if(!count)host.innerHTML='<div class="student-tools-empty">Alat khusus role akan tersedia setelah ronde dimulai.</div>';
    document.body.classList.add('student-tools-open');
  }
  function closeTools(){
    const store=$('studentRoleToolStore'),box=$('roleToolbox'),ai=$('studentAiCard');
    if(store&&movedToolbox&&box){store.appendChild(box);box.classList.add('hidden')}
    if(store&&movedAi&&ai)store.appendChild(ai);
    movedToolbox=false;movedAi=false;
    document.body.classList.remove('student-tools-open');
  }

  function roleData(){
    const st=student(),meta=state()?.meta||{},idx=Number(meta.roundIndex??-1);
    if(!st||idx<0)return {role:['Anggota Tim','Peran akan diberikan saat ronde dimulai.'],caps:{}};
    const role=bridge().getRole?.(st,idx)||['Anggota Tim','Bantu kelompok berdiskusi.'];
    const caps=bridge().getRoleCaps?.(role)||{};
    return {role,caps};
  }
  function roleTasks(caps){
    const out=[];
    if(caps.leader){
      out.push({id:'leader-participation',label:'Ajak semua anggota menyampaikan pendapat'});
      out.push({id:'leader-focus',label:'Jaga diskusi tetap fokus dan adil'});
    }
    if(caps.reader)out.push({id:'reader-summary',label:'Ringkas inti kasus agar mudah dipahami tim'});
    if(caps.detective)out.push({id:'detective-fact',label:'Temukan fakta atau petunjuk penting'});
    if(caps.risk)out.push({id:'risk-analysis',label:'Cari bahaya, akibat, dan pihak yang terdampak'});
    if(caps.solution)out.push({id:'solution-proposal',label:'Usulkan solusi dan jelaskan alasannya'});
    if(caps.challenger){
      out.push({id:'challenger-question',label:'Ajukan pertanyaan yang menguji ide tim'});
      out.push({id:'challenger-ai',label:'Gunakan bantuan AI hanya bila benar-benar diperlukan'});
    }
    if(caps.writer){
      out.push({id:'writer-draft',label:'Satukan hasil diskusi menjadi jawaban akhir'});
      out.push({id:'writer-submit',label:'Pastikan alasan mewakili keputusan kelompok'});
    }
    return out.length?out:[
      {id:'generic-message',label:'Sampaikan pendapatmu melalui chat kelompok'},
      {id:'generic-teamwork',label:'Bantu tim mencapai keputusan bersama'}
    ];
  }

  function taskEvidence(){
    const st=student();
    const currentUser=bridge().getCurrentUser?.();
    const uid=currentUser?.uid||'';
    const entries=bridge().getRoundChatEntries?.()||[];
    const myEntries=entries.filter(([,m])=>m?.uid===uid);
    const myTexts=myEntries.map(([,m])=>String(m?.text||''));
    const answer=bridge().getCurrentAnswer?.()||null;
    const submission=answer?.submission||null;
    const draft=String(document.getElementById('reasonInput')?.value||'').trim();
    const teammates=Object.entries(students()).filter(([,x])=>st&&x.groupId===st.groupId);
    const activeUids=new Set(entries.map(([,m])=>m?.uid).filter(Boolean));
    const allMembersActive=teammates.length>0&&teammates.every(([memberUid])=>activeUids.has(memberUid));
    const hasPrefix=prefix=>myTexts.some(t=>t.startsWith(prefix));
    const aiUsage=bridge().getAIUsageMarker?.()||null;
    return {
      myMessageCount:myEntries.length,
      allMembersActive,
      leaderNote:hasPrefix('👑 Arahan Ketua'),
      readerSummary:hasPrefix('📖 Ringkasan Kasus'),
      detectiveFact:hasPrefix('🔎 Temuan Fakta'),
      riskAnalysis:hasPrefix('⚠️ Analisis Risiko'),
      solutionProposal:hasPrefix('💡 Usulan Solusi'),
      challengerQuestion:hasPrefix('⚖️ Uji Argumen'),
      aiUsed:!!aiUsage,
      draftReady:draft.length>=20||String(submission?.reason||'').trim().length>=20,
      submitted:!!submission,
      submittedByMe:!!submission&&submission.submittedByUid===uid,
      teamHasMessages:entries.length>=2
    };
  }

  function isTaskDone(task,e){
    switch(task.id){
      case 'leader-participation': return e.allMembersActive;
      case 'leader-focus': return e.leaderNote||e.myMessageCount>=2;
      case 'reader-summary': return e.readerSummary;
      case 'detective-fact': return e.detectiveFact;
      case 'risk-analysis': return e.riskAnalysis;
      case 'solution-proposal': return e.solutionProposal;
      case 'challenger-question': return e.challengerQuestion;
      case 'challenger-ai': return e.aiUsed;
      case 'writer-draft': return e.draftReady;
      case 'writer-submit': return e.submittedByMe||e.submitted;
      case 'generic-message': return e.myMessageCount>0;
      case 'generic-teamwork': return e.teamHasMessages;
      default: return false;
    }
  }

  function roleTools(caps){
    const out=[];
    if(caps.leader)out.push(['Kontrol Ketua','Pantau dan arahkan partisipasi tim']);
    if(caps.reader)out.push(['Ringkasan Kasus','Kirim inti masalah ke chat tim']);
    if(caps.detective)out.push(['Temuan Fakta','Catat informasi penting']);
    if(caps.risk)out.push(['Pencari Bahaya','Catat risiko dan akibat']);
    if(caps.solution)out.push(['Pencari Solusi','Usulkan solusi dan alasan']);
    if(caps.challenger)out.push(['Uji Argumen & AI','Hak AI 1 kali per ronde']);
    if(caps.writer)out.push(['Penulis Jawaban','Susun keputusan akhir kelompok']);
    return out;
  }
  function roleTint(caps){
    if(caps.leader)return '#e8f2ff';if(caps.reader||caps.detective)return '#f1ebff';if(caps.risk)return '#fff0f2';if(caps.solution)return '#eaf9ef';if(caps.challenger)return '#fff7df';if(caps.writer)return '#fff8e6';return '#eef3ff';
  }

  function roleAccent(caps){
    if(caps.leader)return '#60a5fa';
    if(caps.reader||caps.detective)return '#a78bfa';
    if(caps.risk)return '#fb7185';
    if(caps.solution)return '#6edb91';
    if(caps.challenger)return '#f6c85f';
    if(caps.writer)return '#f2c94c';
    return '#93a4c7';
  }
  function shortRoleDescription(role,caps){
    if(caps.leader&&caps.reader)return 'Arahkan diskusi dan pahami kasus';
    if(caps.leader)return 'Mengarahkan diskusi tim';
    if(caps.reader&&caps.detective)return 'Baca kasus dan cari fakta';
    if(caps.reader)return 'Membaca inti kasus';
    if(caps.detective&&caps.risk)return 'Cari fakta dan bahaya';
    if(caps.detective)return 'Mencari fakta penting';
    if(caps.risk)return 'Mencari risiko dan dampak';
    if(caps.solution&&caps.challenger)return 'Usulkan solusi dan uji ide';
    if(caps.solution)return 'Mengusulkan solusi terbaik';
    if(caps.challenger)return 'Uji argumen dan akses AI';
    if(caps.writer)return 'Merumuskan jawaban akhir';
    return String(role?.[1]||'Bantu diskusi kelompok').slice(0,58);
  }
  function refreshRoleStrip(){
    const box=$('studentRoleStrip'),room=state(),st=student(),meta=room?.meta||{},idx=Number(meta.roundIndex??-1);
    if(!box||!st)return;
    const mates=Object.entries(students()).filter(([,x])=>x.groupId===st.groupId).sort((a,b)=>Number(a[1].joinedAt||0)-Number(b[1].joinedAt||0));
    if(idx<0){
      box.innerHTML=mates.map(([uid,x],i)=>`<div class="student-role-card ${uid===bridge().getCurrentUser?.()?.uid?'mine':''}" style="--role-accent:#93a4c7"><strong>Anggota ${i+1}</strong><span>Peran diberikan saat ronde dimulai</span><small>${escapeHtml(x.name||'Anggota')}</small></div>`).join('');
      return;
    }
    box.innerHTML=mates.map(([uid,x])=>{
      const role=bridge().getRoleForUid?.(uid,st.groupId,idx)||['Anggota Tim','Bantu diskusi kelompok'];
      const caps=bridge().getRoleCaps?.(role)||{};
      const mine=uid===bridge().getCurrentUser?.()?.uid;
      return `<div class="student-role-card ${mine?'mine':''}" style="--role-accent:${roleAccent(caps)}"><strong>${escapeHtml(role[0]||'Anggota Tim')}</strong><span>${escapeHtml(shortRoleDescription(role,caps))}</span><small>${escapeHtml(x.name||'Anggota')}${mine?' • kamu':''}</small></div>`;
    }).join('');
  }

  function refreshHeader(st,room){
    const meta=room?.meta||{},all=students(),group=st?.groupId?room?.groups?.[st.groupId]:null;
    const teammates=st?.groupId?Object.values(all).filter(x=>x.groupId===st.groupId):[];
    if($('studentHeaderMembers'))$('studentHeaderMembers').textContent=st?.groupId?`${teammates.length} anggota`:`${Object.keys(all).length} siswa masuk`;
    const idx=Number(meta.roundIndex??-1),total=bridge().getMissionCount?.()||0;
    if($('studentHeaderRound'))$('studentHeaderRound').textContent=idx>=0?`Ronde ${idx+1}/${total||'?'}`:(st?.groupId?'Menunggu ronde':'Menunggu tim');
    if($('brandTagline'))$('brandTagline').textContent='Game Diskusi Informatika Kelas VIII';
    if(st?.groupId&&$('studentGroup'))$('studentGroup').textContent=group?.name||$('studentGroup').textContent||'-';
  }

  function refreshRole(){
    const st=student(),{role,caps}=roleData(),name=role[0]||'Anggota Tim',desc=role[1]||'';
    refreshRoleStrip();
    const chatSub=$('groupChatSubtitle');if(chatSub&&Number(state()?.meta?.roundIndex??-1)>=0)chatSub.textContent=`Peranmu: ${name}`;
    const area=$('studentRoleSummaryArea');
    if(area)area.innerHTML=`<div class="student-role-summary"><div class="student-role-avatar" style="background:${roleTint(caps)}">${escapeHtml(initial(st?.name))}</div><div><div class="student-role-badge">${escapeHtml(name)}</div><h3>${escapeHtml(st?.name||'Kamu')} (kamu)</h3><p>${escapeHtml(desc)}</p></div></div><div class="student-role-note">Kerjakan bagianmu, tanggapi pendapat teman, lalu bantu tim menyepakati keputusan bersama.</div>`;
    const task=$('studentRoleTaskList');
    const tasks=roleTasks(caps),evidence=taskEvidence();
    const completed=tasks.filter(t=>isTaskDone(t,evidence)).length;
    if(task)task.innerHTML=tasks.map(t=>`<li class="${isTaskDone(t,evidence)?'done':''}" data-task="${escapeHtml(t.id)}"><span class="student-task-label">${escapeHtml(t.label)}</span></li>`).join('');
    const mini=$('studentToolMiniList');if(mini){const tools=roleTools(caps);mini.innerHTML=tools.length?tools.map(([a,b])=>`<div class="student-tool-mini"><div><strong>${escapeHtml(a)}</strong><span>${escapeHtml(b)}</span></div><span class="student-tool-state">Tersedia</span></div>`).join(''):'<div class="student-tool-mini"><div><strong>Belum ada alat role</strong><span>Mulai ronde untuk mengaktifkannya.</span></div></div>'}

    const status=$('studentRoleStatus');if(status){
      let active=0,total=0;
      try{const entries=bridge().getRoundChatEntries?.()||[],all=students();const mates=Object.entries(all).filter(([,x])=>st&&x.groupId===st.groupId);total=mates.length;const counts={};entries.forEach(([,m])=>counts[m.uid]=(counts[m.uid]||0)+1);active=mates.filter(([uid])=>(counts[uid]||0)>0).length}catch(_){ }
      status.classList.toggle('hidden',!total);
      if(total)status.innerHTML=`<strong>${completed}/${tasks.length} tugas selesai</strong><span> • ${active}/${total} anggota sudah aktif</span>`;
    }
  }

  function refreshAnswer(){
    const room=state(),meta=room?.meta||{},area=$('studentAnswerArea'),waiting=$('studentAnswerWaiting');if(!area||!waiting)return;
    const open=!area.classList.contains('hidden');waiting.classList.toggle('hidden',open);
    if(open)return;
    if(Number(meta.roundIndex??-1)<0)waiting.textContent='Jawaban akan tersedia setelah guru memulai ronde.';
    else if(meta.locked||meta.roundStatus!=='active')waiting.textContent='Ronde sudah ditutup. Tunggu guru memulai ronde berikutnya.';
    else waiting.textContent='Jawaban belum tersedia.';
  }

  function refresh(){
    if(bridge().getMode?.()!=='student')return;
    const room=state(),st=student();if(!room||!st)return;
    ensureToolsModal();bindChecklistLiveInputs();refreshHeader(st,room);
    const released=(room.meta?.teamPhase||'collecting')==='released'&&!!st.groupId;
    if(!released){closeTools();return}
    const marker=String(room.meta?.currentRoundKey||room.meta?.roundIndex||'lobby');
    if(marker!==lastRoundMarker){lastRoundMarker=marker;switchTab('case')}
    refreshRole();refreshAnswer();switchTab(currentTab);
  }

  function reset(){
    closeTools();currentTab='case';lastRoundMarker='';
    if($('brandTagline'))$('brandTagline').textContent='Think • Discuss • Decide • Defend';
  }

  function bindChecklistLiveInputs(){
    const reason=document.getElementById('reasonInput');
    if(reason&&!reason.dataset.checklistBound){
      reason.dataset.checklistBound='1';
      reason.addEventListener('input',()=>refreshRole());
    }
  }

  window.studentSwitchTab=switchTab;
  window.openStudentTools=openTools;
  window.closeStudentTools=closeTools;
  window.DMStudentUI={refresh,reset,switchTab,openTools,closeTools};
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('student-tools-open'))closeTools()});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{ensureToolsModal();refresh()},{once:true});else{ensureToolsModal();refresh()}
})();
