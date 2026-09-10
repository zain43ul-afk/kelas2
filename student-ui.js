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
    if(caps.leader)out.push('Ajak semua anggota menyampaikan pendapat','Jaga diskusi tetap fokus dan adil');
    if(caps.reader)out.push('Ringkas inti kasus agar mudah dipahami tim');
    if(caps.detective)out.push('Temukan fakta atau petunjuk penting');
    if(caps.risk)out.push('Cari bahaya, akibat, dan pihak yang terdampak');
    if(caps.solution)out.push('Usulkan solusi dan jelaskan alasannya');
    if(caps.challenger)out.push('Ajukan pertanyaan yang menguji ide tim','Gunakan bantuan AI hanya bila benar-benar diperlukan');
    if(caps.writer)out.push('Satukan hasil diskusi menjadi jawaban akhir','Pastikan alasan mewakili keputusan kelompok');
    return out.length?out:['Baca kasus dengan teliti','Sampaikan pendapatmu melalui chat kelompok','Bantu tim mencapai keputusan bersama'];
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
    const area=$('studentRoleSummaryArea');
    if(area)area.innerHTML=`<div class="student-role-summary"><div class="student-role-avatar" style="background:${roleTint(caps)}">${escapeHtml(initial(st?.name))}</div><div><div class="student-role-badge">${escapeHtml(name)}</div><h3>${escapeHtml(st?.name||'Kamu')} (kamu)</h3><p>${escapeHtml(desc)}</p></div></div><div class="student-role-note">Kerjakan bagianmu, tanggapi pendapat teman, lalu bantu tim menyepakati keputusan bersama.</div>`;
    const task=$('studentRoleTaskList');if(task)task.innerHTML=roleTasks(caps).map(x=>`<li>${escapeHtml(x)}</li>`).join('');
    const mini=$('studentToolMiniList');if(mini){const tools=roleTools(caps);mini.innerHTML=tools.length?tools.map(([a,b])=>`<div class="student-tool-mini"><div><strong>${escapeHtml(a)}</strong><span>${escapeHtml(b)}</span></div><span class="student-tool-state">Tersedia</span></div>`).join(''):'<div class="student-tool-mini"><div><strong>Belum ada alat role</strong><span>Mulai ronde untuk mengaktifkannya.</span></div></div>'}

    const status=$('studentRoleStatus');if(status){
      let active=0,total=0;
      try{const entries=bridge().getRoundChatEntries?.()||[],all=students();const mates=Object.entries(all).filter(([,x])=>st&&x.groupId===st.groupId);total=mates.length;const counts={};entries.forEach(([,m])=>counts[m.uid]=(counts[m.uid]||0)+1);active=mates.filter(([uid])=>(counts[uid]||0)>0).length}catch(_){ }
      status.classList.toggle('hidden',!total);if(total)status.textContent=`${active}/${total} anggota sudah aktif`;
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
    ensureToolsModal();refreshHeader(st,room);
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

  window.studentSwitchTab=switchTab;
  window.openStudentTools=openTools;
  window.closeStudentTools=closeTools;
  window.DMStudentUI={refresh,reset,switchTab,openTools,closeTools};
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('student-tools-open'))closeTools()});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{ensureToolsModal();refresh()},{once:true});else{ensureToolsModal();refresh()}
})();
