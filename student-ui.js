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

  const LOBBY_ROLES={
    leader:{
      short:'Ketua',mark:'K',tone:'blue',summary:'Mengatur arah diskusi dan memastikan semua anggota mendapat kesempatan.',
      purpose:'Menjaga diskusi berjalan tertib, fokus, dan melibatkan seluruh anggota.',
      steps:[
        'Baca pertanyaan kelompok terlebih dahulu.',
        'Minta setiap anggota mengerjakan bagian sesuai perannya.',
        'Pastikan tidak hanya satu orang yang berbicara.',
        'Arahkan kembali jika diskusi keluar dari kasus.',
        'Sebelum jawaban dikirim, cek apakah tim sudah mencapai kesepakatan.'
      ],
      good:'“Pencari Fakta, sebutkan dulu informasi pentingnya. Setelah itu Pencari Bahaya jelaskan risikonya.”',
      avoid:'“Cepat jawab semuanya, yang penting selesai.”',
      done:'Checklist Ketua selesai jika arahan relevan tervalidasi dan partisipasi anggota benar-benar muncul.'
    },
    reader:{
      short:'Pembaca',mark:'PB',tone:'purple',summary:'Membantu tim memahami inti kasus sebelum mengambil keputusan.',
      purpose:'Mengubah bacaan kasus menjadi ringkasan yang mudah dipahami anggota lain.',
      steps:[
        'Baca seluruh slide, bukan hanya judul atau pertanyaan.',
        'Identifikasi siapa yang terlibat dan apa yang terjadi.',
        'Cari masalah utama yang harus diselesaikan tim.',
        'Ringkas dengan kalimatmu sendiri.',
        'Kirim ringkasan melalui Alat Tim agar dapat divalidasi.'
      ],
      good:'“Inti kasusnya, Rian memasang game modifikasi dari sumber tidak resmi lalu aplikasi meminta akses sensitif.”',
      avoid:'Menyalin seluruh teks kasus atau hanya menulis “kasusnya berbahaya”.',
      done:'Checklist selesai setelah Ringkasan Kasus dinilai relevan dengan isi misi.'
    },
    detective:{
      short:'Pencari Fakta',mark:'PF',tone:'indigo',summary:'Memisahkan fakta dalam kasus dari dugaan atau asumsi.',
      purpose:'Menemukan informasi yang benar-benar disebutkan dan dapat dipakai tim sebagai dasar alasan.',
      steps:[
        'Cari siapa, melakukan apa, dan menggunakan apa.',
        'Catat petunjuk, tindakan, pesan, izin, atau bukti yang disebutkan.',
        'Bedakan fakta dari dugaan pribadi.',
        'Pilih fakta yang paling membantu menjawab pertanyaan.',
        'Kirim melalui Temuan Fakta di Alat Tim.'
      ],
      good:'“Aplikasi meminta akses kontak, galeri foto, dan SMS setelah dipasang.”',
      avoid:'“Game itu pasti dibuat hacker.” jika kasus tidak pernah menyebutkannya.',
      done:'Checklist selesai jika fakta yang dikirim sesuai isi kasus dan lolos validasi.'
    },
    risk:{
      short:'Pencari Bahaya',mark:'BH',tone:'red',summary:'Mencari risiko, akibat, dan pihak yang mungkin terdampak.',
      purpose:'Menjelaskan mengapa suatu tindakan dapat menimbulkan masalah.',
      steps:[
        'Pilih tindakan penting dari kasus.',
        'Tentukan risiko yang mungkin muncul.',
        'Jelaskan akibat dari risiko tersebut.',
        'Sebutkan siapa atau apa yang bisa terkena dampak.',
        'Gunakan pola Tindakan → Risiko → Dampak.'
      ],
      good:'“Akses SMS berisiko membuka informasi OTP sehingga akun dan data keluarga Rian dapat terdampak.”',
      avoid:'Hanya menulis “berbahaya” tanpa menjelaskan risiko dan akibatnya.',
      done:'Checklist selesai jika Analisis Risiko memuat risiko dan dampak yang relevan.'
    },
    solution:{
      short:'Pencari Solusi',mark:'SO',tone:'green',summary:'Mengusulkan tindakan yang aman, masuk akal, dan memiliki alasan.',
      purpose:'Mengubah temuan fakta dan risiko menjadi tindakan penyelesaian yang dapat dilakukan.',
      steps:[
        'Dengarkan temuan fakta dan bahaya dari anggota lain.',
        'Usulkan tindakan yang benar-benar bisa dilakukan.',
        'Jelaskan mengapa tindakan tersebut dipilih.',
        'Pertimbangkan apakah solusi mengurangi risiko.',
        'Kirim solusi melalui Alat Tim agar diperiksa.'
      ],
      good:'“Rian sebaiknya menghapus aplikasi, memeriksa izin, lalu mengganti kata sandi akun penting karena perangkat sudah menunjukkan aktivitas mencurigakan.”',
      avoid:'“Hapus saja.” tanpa alasan atau langkah lanjutan.',
      done:'Checklist selesai jika solusi relevan serta memuat tindakan dan alasan.'
    },
    challenger:{
      short:'Penanya',mark:'PN',tone:'orange',summary:'Menguji kelemahan argumen dan menggunakan bantuan AI secara terbatas.',
      purpose:'Membuat tim memeriksa kembali keputusan sebelum jawaban dikirim.',
      steps:[
        'Dengarkan keputusan sementara kelompok.',
        'Cari bagian yang belum jelas atau masih lemah.',
        'Ajukan pertanyaan yang membuat tim berpikir ulang.',
        'Gunakan AI hanya setelah ada kontribusi awal anggota lain.',
        'Bawa petunjuk AI kembali ke diskusi, bukan sebagai jawaban final.'
      ],
      good:'“Kalau aplikasinya sudah dihapus, apakah data yang sebelumnya mendapat izin akses otomatis aman?”',
      avoid:'Pertanyaan yang tidak berkaitan dengan kasus atau menggunakan AI sebelum tim berdiskusi.',
      done:'Checklist pertanyaan selesai setelah Uji Argumen relevan. Hak AI hanya satu kali per tim per ronde.'
    },
    writer:{
      short:'Penulis Jawaban',mark:'PJ',tone:'yellow',summary:'Menyatukan hasil diskusi menjadi keputusan akhir kelompok.',
      purpose:'Menulis jawaban yang mewakili kesepakatan tim, bukan pendapat pribadi.',
      steps:[
        'Baca hasil fakta, risiko, solusi, dan pertanyaan tim.',
        'Pastikan kelompok sudah menentukan keputusan.',
        'Tulis keputusan dengan alasan yang jelas.',
        'Gunakan bukti atau informasi dari kasus.',
        'Periksa draft lalu kirim jawaban setelah mewakili diskusi tim.'
      ],
      good:'“Kelompok kami menilai tindakan itu berisiko karena aplikasi berasal dari sumber tidak resmi dan meminta akses sensitif. Rian perlu menghapus aplikasi dan mengamankan akun yang terdampak.”',
      avoid:'Menyalin satu pendapat anggota tanpa memeriksa kesepakatan kelompok.',
      done:'Checklist selesai setelah draft lolos validasi dan jawaban kelompok berhasil dikirim.'
    }
  };
  let lobbyRoleKey='leader';
  let teamLobbyRoleKey='leader';

  function renderLobbyRoleDetail(key){
    const role=LOBBY_ROLES[key]||LOBBY_ROLES.leader;
    lobbyRoleKey=key in LOBBY_ROLES?key:'leader';
    document.querySelectorAll('#studentLobbyRoleCards .student-lobby-role-btn').forEach(btn=>{
      const active=btn.dataset.role===lobbyRoleKey;
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-pressed',active?'true':'false');
    });
    const box=$('studentLobbyRoleDetail');if(!box)return;
    box.innerHTML=`
      <div class="student-lobby-detail-head">
        <div class="student-lobby-role-mark ${escapeHtml(role.tone)}">${escapeHtml(role.mark)}</div>
        <div>
          <span class="student-lobby-eyebrow">PANDUAN PERAN</span>
          <h4>${escapeHtml(role.short)}</h4>
          <p>${escapeHtml(role.summary)}</p>
        </div>
      </div>
      <div class="student-lobby-detail-grid">
        <section>
          <h5>Tujuan peran</h5>
          <p>${escapeHtml(role.purpose)}</p>
          <h5 class="student-lobby-subtitle">Cara menjalankannya</h5>
          <ol class="student-lobby-role-steps">${role.steps.map((x,i)=>`<li><span>${i+1}</span><p>${escapeHtml(x)}</p></li>`).join('')}</ol>
        </section>
        <section class="student-lobby-detail-examples">
          <div class="student-lobby-example good">
            <strong>Contoh yang baik</strong>
            <span>${escapeHtml(role.good)}</span>
          </div>
          <div class="student-lobby-example bad">
            <strong>Yang harus dihindari</strong>
            <span>${escapeHtml(role.avoid)}</span>
          </div>
          <div class="student-lobby-complete">
            <strong>Kapan dianggap selesai?</strong>
            <span>${escapeHtml(role.done)}</span>
          </div>
        </section>
      </div>`;
  }

  function refreshLobbyOrientation(){
    const grid=$('studentLobbyRoleCards');if(!grid)return;
    if(!grid.dataset.ready){
      grid.innerHTML=Object.entries(LOBBY_ROLES).map(([key,role])=>`
        <button type="button" class="student-lobby-role-btn" data-role="${escapeHtml(key)}" aria-pressed="false" onclick="selectStudentLobbyRole('${escapeHtml(key)}')">
          <span class="student-lobby-role-mark ${escapeHtml(role.tone)}">${escapeHtml(role.mark)}</span>
          <span class="student-lobby-role-btn-copy"><strong>${escapeHtml(role.short)}</strong><small>${escapeHtml(role.summary)}</small></span>
        </button>`).join('');
      grid.dataset.ready='1';
    }
    renderLobbyRoleDetail(lobbyRoleKey);
  }

  function renderTeamLobbyRoleDetail(key){
    const role=LOBBY_ROLES[key]||LOBBY_ROLES.leader;
    teamLobbyRoleKey=key in LOBBY_ROLES?key:'leader';
    document.querySelectorAll('#studentTeamRoleCards .student-lobby-role-btn').forEach(btn=>{
      const active=btn.dataset.role===teamLobbyRoleKey;
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-pressed',active?'true':'false');
    });
    const box=$('studentTeamRoleDetail');if(!box)return;
    box.innerHTML=`
      <div class="student-lobby-detail-head">
        <div class="student-lobby-role-mark ${escapeHtml(role.tone)}">${escapeHtml(role.mark)}</div>
        <div>
          <span class="student-lobby-eyebrow">PANDUAN PERAN</span>
          <h4>${escapeHtml(role.short)}</h4>
          <p>${escapeHtml(role.summary)}</p>
        </div>
      </div>
      <div class="student-lobby-detail-grid">
        <section>
          <h5>Tujuan peran</h5>
          <p>${escapeHtml(role.purpose)}</p>
          <h5 class="student-lobby-subtitle">Cara menjalankannya</h5>
          <ol class="student-lobby-role-steps">${role.steps.map((x,i)=>`<li><span>${i+1}</span><p>${escapeHtml(x)}</p></li>`).join('')}</ol>
        </section>
        <section class="student-lobby-detail-examples">
          <div class="student-lobby-example good">
            <strong>Contoh yang baik</strong>
            <span>${escapeHtml(role.good)}</span>
          </div>
          <div class="student-lobby-example bad">
            <strong>Yang harus dihindari</strong>
            <span>${escapeHtml(role.avoid)}</span>
          </div>
          <div class="student-lobby-complete">
            <strong>Kapan dianggap selesai?</strong>
            <span>${escapeHtml(role.done)}</span>
          </div>
        </section>
      </div>`;
  }

  function refreshTeamLobbyOrientation(){
    const grid=$('studentTeamRoleCards');if(!grid)return;
    if(!grid.dataset.ready){
      grid.innerHTML=Object.entries(LOBBY_ROLES).map(([key,role])=>`
        <button type="button" class="student-lobby-role-btn" data-role="${escapeHtml(key)}" aria-pressed="false" onclick="selectStudentTeamLobbyRole('${escapeHtml(key)}')">
          <span class="student-lobby-role-mark ${escapeHtml(role.tone)}">${escapeHtml(role.mark)}</span>
          <span class="student-lobby-role-btn-copy"><strong>${escapeHtml(role.short)}</strong><small>${escapeHtml(role.summary)}</small></span>
        </button>`).join('');
      grid.dataset.ready='1';
    }
    renderTeamLobbyRoleDetail(teamLobbyRoleKey);
  }


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
    const validated=myEntries.filter(([,m])=>m?.type==='roleValidated'&&m?.validationValid===true);
    const validatedTaskIds=new Set(validated.map(([,m])=>m.taskId).filter(Boolean));
    const answer=bridge().getCurrentAnswer?.()||null;
    const submission=answer?.submission||null;
    const teammates=Object.entries(students()).filter(([,x])=>st&&x.groupId===st.groupId);
    const activeUids=new Set(entries.filter(([,m])=>m?.validationValid===true||m?.type==='helpOffer').map(([,m])=>m?.uid).filter(Boolean));
    const allMembersActive=teammates.length>0&&teammates.every(([memberUid])=>activeUids.has(memberUid));
    const aiUsage=bridge().getAIUsageMarker?.()||null;
    return {
      validatedTaskIds,
      allMembersActive,
      aiUsed:!!aiUsage,
      writerDraft:validatedTaskIds.has('writer-draft'),
      submitted:!!submission&&submission.validationValid===true,
      submittedByMe:!!submission&&submission.validationValid===true&&submission.submittedByUid===uid,
      peerHelpGiven:entries.some(([,m])=>m?.type==='helpOffer'&&m?.uid===uid),
      peerHelpConfirmed:entries.some(([,m])=>m?.type==='helpConfirm'&&m?.helperUid===uid)
    };
  }

  function isTaskDone(task,e){
    switch(task.id){
      case 'leader-participation': return e.allMembersActive;
      case 'leader-focus': return e.validatedTaskIds.has('leader-focus');
      case 'reader-summary': return e.validatedTaskIds.has('reader-summary');
      case 'detective-fact': return e.validatedTaskIds.has('detective-fact');
      case 'risk-analysis': return e.validatedTaskIds.has('risk-analysis');
      case 'solution-proposal': return e.validatedTaskIds.has('solution-proposal');
      case 'challenger-question': return e.validatedTaskIds.has('challenger-question');
      case 'challenger-ai': return e.aiUsed;
      case 'writer-draft': return e.writerDraft;
      case 'writer-submit': return e.submittedByMe||e.submitted;
      case 'generic-message': return e.validatedTaskIds.size>0;
      case 'generic-teamwork': return e.peerHelpConfirmed||e.allMembersActive;
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
    if(!released){closeTools();refreshLobbyOrientation();return}
    const marker=String(room.meta?.currentRoundKey||room.meta?.roundIndex||'lobby');
    if(marker!==lastRoundMarker){lastRoundMarker=marker;switchTab('case')}
    if(Number(room.meta?.roundIndex??-1)<0)refreshTeamLobbyOrientation();
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

  window.selectStudentLobbyRole=renderLobbyRoleDetail;
  window.selectStudentTeamLobbyRole=renderTeamLobbyRoleDetail;
  window.studentSwitchTab=switchTab;
  window.openStudentTools=openTools;
  window.closeStudentTools=closeTools;
  window.DMStudentUI={refresh,reset,switchTab,openTools,closeTools};
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('student-tools-open'))closeTools()});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{ensureToolsModal();refresh()},{once:true});else{ensureToolsModal();refresh()}
})();
