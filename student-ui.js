(function(){
  const $=id=>document.getElementById(id);
  let currentTab='case';
  let originalRenderStudent=null;
  let toolOriginalParent=null;
  let toolPlaceholder=null;

  function escapeHtml(x){return String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function textOnly(html){const d=document.createElement('div');d.innerHTML=html||'';return (d.textContent||'').trim();}
  function getInitial(name){name=String(name||'?').trim();return name?name.charAt(0).toUpperCase():'?'}
  function roomState(){return window.DMStudentState?.getRoomState?.()||null}
  function roundLabel(){const meta=roomState()?.meta||{};const idx=Number(meta.roundIndex??-1)+1;const total=(window.missionCount?window.missionCount():0)||Number(meta.totalRounds||0)||0;return idx>0?`Ronde ${idx}/${total||'?'}`:'Menunggu ronde';}
  function teamCount(){
    try{
      const st=window.getStudent?.();
      const students=window.getStudents?.()||{};
      return Object.values(students).filter(x=>st&&x.groupId===st.groupId).length || 0;
    }catch(_){return 0}
  }
  function isWriter(){
    try{
      const st=window.getStudent?.();
      const idx=Number(window.roomState?.meta?.roundIndex??-1);
      if(!st||idx<0) return false;
      const role=window.studentRole?.(st,idx);
      const caps=window.roleCapabilities?.(role)||{};
      return !!caps.writer;
    }catch(_){return false}
  }
  function openTools(){
    const rt=$('roleToolbox');
    const host=$('studentToolsHost');
    if(!rt||!host) return;
    if(!toolPlaceholder){toolPlaceholder=document.createElement('div');toolPlaceholder.id='studentToolPlaceholder';}
    if(rt.parentNode!==host){
      toolOriginalParent=rt.parentNode;
      try{toolOriginalParent.insertBefore(toolPlaceholder,rt);}catch(_){ }
      host.appendChild(rt);
    }
    rt.classList.remove('hidden');
    document.body.classList.add('student-tools-open');
  }
  function closeTools(){
    const rt=$('roleToolbox');
    if(rt&&toolPlaceholder&&toolPlaceholder.parentNode){
      toolPlaceholder.parentNode.insertBefore(rt,toolPlaceholder);
      toolPlaceholder.remove();
      toolPlaceholder=null;
      rt.classList.add('hidden');
    }
    document.body.classList.remove('student-tools-open');
  }
  window.openStudentTools=openTools;
  window.closeStudentTools=closeTools;

  function ensureModal(){
    if($('studentToolsModal')) return;
    const backdrop=document.createElement('div');
    backdrop.id='studentToolsBackdrop';
    backdrop.className='student-tools-backdrop';
    backdrop.addEventListener('click',closeTools);
    const modal=document.createElement('div');
    modal.id='studentToolsModal';
    modal.className='student-tools-modal';
    modal.innerHTML=`<div class="student-tools-modal-head"><h3>Alat Tim</h3><button class="student-tools-close" type="button" aria-label="Tutup" onclick="closeStudentTools()">×</button></div><div id="studentToolsHost" class="student-tools-modal-body"></div>`;
    document.body.append(backdrop,modal);
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('student-tools-open'))closeTools()});
  }

  function activateTab(name){
    currentTab=name;
    document.querySelectorAll('#student .student-tab-btn').forEach(btn=>btn.classList.toggle('active',btn.dataset.tab===name));
    document.querySelectorAll('#student .student-tab-panel').forEach(panel=>panel.classList.toggle('active',panel.dataset.tab===name));
  }
  window.studentSwitchTab=activateTab;

  function ensureStructure(){
    const sec=$('student'), grid=$('studentGameGrid');
    if(!sec||!grid) return;
    sec.classList.add('student-ui-ready');
    ensureModal();

    if(!$('studentTopbar')){
      const top=document.createElement('div');
      top.id='studentTopbar';
      top.className='student-topbar';
      top.innerHTML=`<div class="student-brand"><div class="student-brand-logo"></div><div><h2>DIGITAL MISSION</h2><p>Game Diskusi Informatika Kelas VIII</p></div></div><div class="student-topchips"><div class="student-chip"><div class="k">Kelompok</div><div id="studentHeadGroup" class="v">-</div><div id="studentHeadMembers" class="k"></div></div><div class="student-chip"><div class="k">Status</div><div id="studentHeadRound" class="v">Menunggu</div></div><div class="student-chip timer"><div class="k">Waktu</div><div id="studentHeadTimer" class="v">--:--</div></div><div class="student-chip score"><div class="k">Poin</div><div id="studentHeadScore" class="v">0 Poin</div></div><button type="button" class="student-leave" onclick="leaveStudent()">Keluar</button></div>`;
      sec.insertBefore(top,$('studentWaitingPanel'));
    }
    const left=grid.children[0], right=grid.children[1];
    if(!left||!right) return;
    left.classList.add('student-stage-card');

    if(!$('studentTabs')){
      const sectionTitle=left.querySelector('.section-title');
      const role=$('studentRole'), roleTool=$('roleToolbox'), ai=$('studentAiCard'), mission=$('studentMission'), answer=$('studentAnswerArea');
      const tabs=document.createElement('div');
      tabs.id='studentTabs'; tabs.className='student-tabs';
      tabs.innerHTML=`<button class="student-tab-btn active" data-tab="case" onclick="studentSwitchTab('case')">Kasus</button><button class="student-tab-btn" data-tab="discussion" onclick="studentSwitchTab('discussion')">Diskusi &amp; Peran</button><button class="student-tab-btn" data-tab="answer" onclick="studentSwitchTab('answer')">Jawaban</button>`;

      const panelCase=document.createElement('div');
      panelCase.className='student-tab-panel student-case-panel active';panelCase.dataset.tab='case';
      panelCase.innerHTML=`<div class="student-stage-head"><div><h3>Kasus</h3><p>Baca situasi, pahami masalah, lalu siapkan diskusi tim.</p></div><div class="student-stage-badge" id="studentCaseBadge">Siap membaca</div></div>`;
      panelCase.appendChild(mission);

      const panelDiscussion=document.createElement('div');
      panelDiscussion.className='student-tab-panel';panelDiscussion.dataset.tab='discussion';
      panelDiscussion.innerHTML=`<div class="student-stage-head"><div><h3>Peranmu pada ronde ini</h3><p>Pahami tugas role, lalu gunakan alat tim untuk berdiskusi.</p></div></div><div class="student-discussion-shell"><div class="student-role-panel"><div id="studentRoleSummaryArea"></div><div class="student-role-tasks"><h4>Tugas utama</h4><ul id="studentRoleTaskList"></ul></div><div id="studentRoleStatus" class="student-role-status hidden"></div></div><div class="student-tools-panel"><h4>Alat Tim</h4><div class="tool-list" id="studentToolMiniList"></div><button type="button" class="btn soft-blue student-tools-open" onclick="openStudentTools()">Buka Alat Tim</button><div id="studentAiSlot"></div></div></div>`;

      const panelAnswer=document.createElement('div');
      panelAnswer.className='student-tab-panel';panelAnswer.dataset.tab='answer';
      panelAnswer.innerHTML=`<div class="student-answer-shell"><h3>Keputusan Kelompok</h3><div class="sub">Pilih satu jawaban berdasarkan hasil diskusi.</div></div>`;
      panelAnswer.querySelector('.student-answer-shell').appendChild(answer);

      // keep hidden placeholder for role toolbox in discussion card
      const placeholder=document.createElement('div');placeholder.id='studentRoleToolPlaceholder';placeholder.className='hidden';
      panelDiscussion.appendChild(placeholder); placeholder.appendChild(roleTool);
      const aiSlot=panelDiscussion.querySelector('#studentAiSlot'); aiSlot.appendChild(ai);

      Array.from(left.children).forEach(el=>{ if(el!==sectionTitle && el.id!=='studentRole' && el.id!=='studentRoleToolPlaceholder' && el.id!=='studentAiCard' && el.id!=='studentMission' && el.id!=='studentAnswerArea'){ if(!tabs.contains(el)) el.classList?.add?.('student-legacy-hidden'); }});
      left.append(tabs,panelCase,panelDiscussion,panelAnswer,role);
      role.style.display='none';
      activateTab(currentTab);
    }
  }

  function buildTaskList(roleName){
    const map={
      'Ketua':['Mengajak semua anggota untuk berpendapat','Mengarahkan diskusi sesuai topik','Memastikan keputusan diambil bersama'],
      'Pembaca Fakta':['Membacakan inti masalah dan informasi penting','Menunjukkan poin yang harus dipahami tim','Menjaga diskusi tetap berdasarkan isi kasus'],
      'Pencari Bahaya':['Mencari risiko atau dampak negatif','Menjelaskan siapa yang bisa terdampak','Mengingatkan tim tentang hal yang perlu dihindari'],
      'Pencari Solusi':['Mengusulkan solusi atau sikap terbaik','Menjelaskan alasan pilihan solusi','Membantu tim menilai kelebihan tiap solusi'],
      'Penulis Jawaban':['Merangkum hasil diskusi tim','Memilih jawaban akhir kelompok','Menulis alasan dan mengirim jawaban'],
      'Uji Argumen':['Mengkritisi argumen tim secara sehat','Mengajukan pertanyaan penantang','Menggunakan bantuan AI 1 kali bila diperlukan'],
      'Penanya':['Mengajukan pertanyaan kritis untuk tim','Menggunakan bantuan AI 1 kali bila diperlukan','Membawa petunjuk AI kembali ke diskusi']
    };
    return map[roleName]||['Pahami kasus dengan baik','Sampaikan pendapatmu di chat tim','Bantu kelompok menyusun keputusan'];
  }
  function roleColor(roleName){
    const map={'Ketua':'#e9f2ff','Pembaca Fakta':'#f1e9ff','Pencari Bahaya':'#fff0f0','Pencari Solusi':'#ebfaef','Penulis Jawaban':'#fff9e8','Penanya':'#efe8ff'};
    return map[roleName]||'#eef3ff';
  }

  function refreshStudentUi(){
    const sec=$('student'); if(!sec) return;
    ensureModal();

    const state=roomState();
    const st=window.getStudent?.()||null;
    const students=window.getStudents?.()||{};
    const meta=state?.meta||{};
    const phase=meta.teamPhase||'collecting';
    const released=phase==='released' && !!st?.groupId;

    // Lobby/waiting state: do not show the second Digital Mission header yet.
    sec.classList.toggle('student-game-active',released);
    const waitingCount=$('studentWaitingCount');
    if(waitingCount) waitingCount.textContent=`${Object.keys(students).length} siswa sudah masuk`;

    if(!released){
      closeTools();
      return;
    }

    ensureStructure();

    const groupName=$('studentGroup')?.textContent?.trim()||'-';
    const score=$('studentScore')?.textContent?.trim()||'0';
    const timer=$('studentTimer')?.textContent?.trim()||'--:--';
    if($('studentHeadGroup')) $('studentHeadGroup').textContent=groupName;
    if($('studentHeadMembers')) $('studentHeadMembers').textContent=`${teamCount()} anggota`;
    if($('studentHeadRound')) $('studentHeadRound').textContent=roundLabel();
    if($('studentHeadTimer')) $('studentHeadTimer').textContent=timer;
    if($('studentHeadScore')) $('studentHeadScore').textContent=`${score} Poin`;
    if($('studentCaseBadge')) $('studentCaseBadge').textContent=(Number(meta.roundIndex??-1)>=0?'Lihat slide':'Menunggu ronde');

    const roleEl=$('studentRole');
    const raw=roleEl?.textContent||'';
    let roleName='Anggota Tim', roleDesc='Ambil bagian aktif dalam diskusi kelompok.';
    const m=raw.match(/Peranmu:\s*([^\n]+)/i);
    if(m) roleName=m[1].trim();
    const parts=raw.split('\n').map(x=>x.trim()).filter(Boolean);
    if(parts.length>1) roleDesc=parts.slice(1).join(' ');
    const studentName=st?.name||'Kamu';
    const initial=getInitial(studentName);
    const roleArea=$('studentRoleSummaryArea');
    if(roleArea){
      roleArea.innerHTML=`<div class="student-role-summary"><div class="student-role-avatar" style="background:${roleColor(roleName)}">${escapeHtml(initial)}</div><div><div class="student-role-badge">${escapeHtml(roleName)}</div><h3>${escapeHtml(studentName)} (kamu)</h3><p>${escapeHtml(roleDesc)}</p></div></div><div class="student-role-note">Dengarkan semua pendapat, jaga diskusi tetap fokus pada soal, dan pastikan keputusan diambil bersama tim.</div>`;
    }

    const taskList=$('studentRoleTaskList');
    if(taskList){
      const tasks=buildTaskList(roleName);
      let activeCount=0,totalCount=0;
      try{
        const entries=window.currentRoundChatEntries?.()||[];
        const teammates=Object.entries(students).filter(([,x])=>x.groupId===st.groupId);
        totalCount=teammates.length;
        const counts={};
        entries.forEach(([,x])=>counts[x.uid]=(counts[x.uid]||0)+1);
        activeCount=teammates.filter(([uid])=>(counts[uid]||0)>0).length;
      }catch(_){}
      taskList.innerHTML=tasks.map((t,i)=>`<li class="${i===tasks.length-1?'done':''}">${escapeHtml(t)}</li>`).join('');
      const rs=$('studentRoleStatus');
      if(rs){
        rs.classList.toggle('hidden',!totalCount);
        if(totalCount) rs.textContent=`${activeCount}/${totalCount} anggota sudah aktif`;
      }
    }

    const mini=$('studentToolMiniList');
    if(mini){
      const tools=[
        ['Ringkasan Kasus','Lihat inti masalah'],
        ['Temuan Fakta','Catat informasi penting'],
        ['Pencari Bahaya','Identifikasi risiko'],
        ['Pencari Solusi','Usulkan solusi'],
        ['Uji Argumen (Hak AI)','1 kali per ronde'],
        ['Kartu Kejutan','Lihat kartu tambahan']
      ];
      mini.innerHTML=tools.map(([a,b])=>`<div class="student-tool-mini"><div><strong>${escapeHtml(a)}</strong><span>${escapeHtml(b)}</span></div><span>›</span></div>`).join('');
    }

    const rt=$('roleToolbox'), ph=$('studentRoleToolPlaceholder');
    if(rt && ph && rt.parentNode!==ph && !$('studentToolsHost')?.contains(rt)) ph.appendChild(rt);
    if(rt && rt.parentNode===ph) rt.classList.add('hidden');

    const btn=$('submitGroupAnswerBtn'); if(btn) btn.textContent='Kirim Jawaban Kelompok';
    const mark=$('markContributionBtn'); if(mark) mark.textContent='Saya sudah berkontribusi';
  }

  function patchRender(){
    if(typeof window.renderStudent!=='function' || window.renderStudent===originalRenderStudent) return;
    originalRenderStudent=window.renderStudent;
    window.renderStudent=function(){
      const result=originalRenderStudent.apply(this,arguments);
      requestAnimationFrame(refreshStudentUi);
      return result;
    };
  }

  document.addEventListener('DOMContentLoaded',()=>{
    patchRender();
    setTimeout(()=>{patchRender();refreshStudentUi();},300);
  });
})();
