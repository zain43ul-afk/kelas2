/* DIGITAL MISSION — TTS Kelompok v2
   Dibangun untuk Firebase Realtime Database yang sudah dipakai Digital Mission.
   Semua anggota tim setara: semua dapat mengajukan usulan.
   Usulan wajib ditanggapi anggota lain dengan Setuju/Tidak Setuju + alasan >40 karakter.
   AI hanya membuat bank kata + petunjuk. Grid dibuat lokal dengan algoritma crossword.
*/
(function(){
  'use strict';

  const FALLBACK=[
    ['PASSWORD','Kombinasi karakter rahasia yang digunakan untuk melindungi akses ke akun.'],
    ['PHISHING','Upaya penipuan digital untuk memperoleh data pribadi melalui pesan atau tautan palsu.'],
    ['PRIVASI','Hak untuk mengendalikan informasi pribadi agar tidak digunakan sembarangan.'],
    ['MALWARE','Perangkat lunak berbahaya yang dirancang untuk mengganggu atau merusak sistem.'],
    ['FIREWALL','Pelindung jaringan yang menyaring lalu lintas masuk dan keluar.'],
    ['BROWSER','Aplikasi yang digunakan untuk membuka dan menjelajahi halaman web.'],
    ['INTERNET','Jaringan global yang menghubungkan berbagai perangkat di seluruh dunia.'],
    ['ENKRIPSI','Proses mengubah data menjadi bentuk yang sulit dibaca tanpa kunci.'],
    ['VERIFIKASI','Proses memeriksa kebenaran identitas atau informasi sebelum dipercaya.'],
    ['ANTIVIRUS','Program yang membantu mendeteksi dan menangani perangkat lunak berbahaya.'],
    ['BACKUP','Salinan cadangan data yang disimpan untuk mengurangi risiko kehilangan.'],
    ['LOGIN','Proses masuk ke akun menggunakan identitas pengguna.'],
    ['AKUN','Identitas pengguna yang digunakan untuk mengakses sebuah layanan digital.'],
    ['VIRUS','Program berbahaya yang dapat menggandakan diri dan mengganggu perangkat.'],
    ['SPAM','Pesan digital yang dikirim massal dan biasanya tidak diinginkan penerima.'],
    ['COOKIE','Data kecil yang disimpan browser untuk mengingat informasi kunjungan situs.'],
    ['BLOKIR','Tindakan membatasi akun, kontak, atau akses yang dianggap berbahaya.'],
    ['LAPOR','Tindakan menyampaikan kejadian berbahaya kepada pihak yang bertanggung jawab.'],
    ['DATA','Informasi yang dapat disimpan, diproses, atau dikirim melalui sistem digital.'],
    ['AMAN','Kondisi ketika risiko terhadap data, akun, atau perangkat dapat dikendalikan.'],
    ['SANDI','Rahasia yang dipakai untuk membuktikan hak akses ke suatu akun.'],
    ['TAUTAN','Alamat yang dapat ditekan untuk membuka halaman atau sumber lain.'],
    ['HOAKS','Informasi palsu yang dibuat atau disebarkan seolah-olah benar.'],
    ['JEJAKDIGITAL','Rekaman aktivitas yang ditinggalkan seseorang ketika menggunakan layanan digital.']
  ];

  let chatRef=null,chatGroup='',chatMessages={};
  let busyGenerate=false,busyAction=false,autoFinishGuard=false;

  const bridge=()=>window.DMCrosswordBridge||{};
  const el=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const db=()=>bridge().getDb?.();
  const room=()=>bridge().getRoomState?.()||null;
  const user=()=>bridge().getCurrentUser?.()||null;
  const student=()=>bridge().getStudent?.()||null;
  const students=()=>bridge().getStudents?.()||{};
  const groups=()=>bridge().getGroups?.()||{};
  const code=()=>bridge().getCurrentCode?.()||'kelas-aktif';
  const now=()=>bridge().serverNow?.()||Date.now();
  const roomBase=()=>`rooms/${code()}`;
  const cw=()=>room()?.crossword||{};

  function normalizeWord(v){
    return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z]/g,'').slice(0,16);
  }
  function normalizeCandidates(raw){
    const list=Array.isArray(raw)?raw:[];
    const seen=new Set();
    return list.map((x,i)=>{
      const answer=normalizeWord(x?.answer||x?.word||x?.jawaban||'');
      const clue=String(x?.clue||x?.hint||x?.petunjuk||'').replace(/\s+/g,' ').trim().slice(0,220);
      return {answer,clue,id:`w${i+1}`};
    }).filter(x=>x.answer.length>=3&&x.answer.length<=16&&x.clue&& !seen.has(x.answer) && seen.add(x.answer));
  }
  function shuffled(arr){
    const out=arr.slice();
    for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}
    return out;
  }
  const cellKey=(r,c)=>`${r},${c}`;

  function boundsFor(entries,extra=null){
    const all=extra?[...entries,extra]:entries;
    if(!all.length)return {minR:0,maxR:0,minC:0,maxC:0,w:1,h:1,area:1};
    let minR=Infinity,maxR=-Infinity,minC=Infinity,maxC=-Infinity;
    all.forEach(e=>{
      const endR=e.row+(e.direction==='V'?e.answer.length-1:0);
      const endC=e.col+(e.direction==='H'?e.answer.length-1:0);
      minR=Math.min(minR,e.row,endR);maxR=Math.max(maxR,e.row,endR);
      minC=Math.min(minC,e.col,endC);maxC=Math.max(maxC,e.col,endC);
    });
    const w=maxC-minC+1,h=maxR-minR+1;
    return {minR,maxR,minC,maxC,w,h,area:w*h};
  }

  function makeCellMap(entries){
    const map=new Map();
    entries.forEach(e=>{
      for(let i=0;i<e.answer.length;i++){
        const r=e.row+(e.direction==='V'?i:0),c=e.col+(e.direction==='H'?i:0),k=cellKey(r,c);
        let x=map.get(k);if(!x)x={char:e.answer[i],dirs:new Set(),entryIds:[]};
        x.char=e.answer[i];x.dirs.add(e.direction);x.entryIds.push(e.id);map.set(k,x);
      }
    });
    return map;
  }

  function validatePlacement(word,row,col,direction,entries){
    const map=makeCellMap(entries);let crosses=0;
    for(let i=0;i<word.length;i++){
      const r=row+(direction==='V'?i:0),c=col+(direction==='H'?i:0),k=cellKey(r,c),existing=map.get(k);
      if(existing){
        if(existing.char!==word[i]||existing.dirs.has(direction))return null;
        crosses++;
      }else{
        const sideA=direction==='H'?cellKey(r-1,c):cellKey(r,c-1);
        const sideB=direction==='H'?cellKey(r+1,c):cellKey(r,c+1);
        if(map.has(sideA)||map.has(sideB))return null;
      }
    }
    const before=direction==='H'?cellKey(row,col-1):cellKey(row-1,col);
    const after=direction==='H'?cellKey(row,col+word.length):cellKey(row+word.length,col);
    if(map.has(before)||map.has(after))return null;
    if(entries.length&&crosses===0)return null;
    const candidate={answer:word,row,col,direction};
    const b=boundsFor(entries,candidate);
    if(b.w>24||b.h>24)return null;
    const compactPenalty=b.area*.20+Math.abs(b.w-b.h)*.8;
    return {crosses,bounds:b,score:crosses*120-compactPenalty};
  }

  function candidatePlacements(item,entries){
    if(!entries.length)return [{row:0,col:0,direction:'H',crosses:0,score:0}];
    const map=makeCellMap(entries),found=[];
    for(const [k,cell] of map.entries()){
      const [r,c]=k.split(',').map(Number);
      for(let wi=0;wi<item.answer.length;wi++){
        if(item.answer[wi]!==cell.char)continue;
        ['H','V'].forEach(direction=>{
          if(cell.dirs.has(direction))return;
          const row=r-(direction==='V'?wi:0),col=c-(direction==='H'?wi:0);
          const valid=validatePlacement(item.answer,row,col,direction,entries);
          if(valid)found.push({row,col,direction,...valid});
        });
      }
    }
    found.sort((a,b)=>b.score-a.score);
    return found.slice(0,20);
  }

  function layoutAttempt(pool,target){
    if(!pool.length)return [];
    let remaining=pool.slice();
    const top=remaining.slice().sort((a,b)=>b.answer.length-a.answer.length).slice(0,Math.min(6,remaining.length));
    const first=top[Math.floor(Math.random()*top.length)];
    let entries=[{...first,id:first.id,row:0,col:0,direction:'H'}];
    remaining=remaining.filter(x=>x!==first);
    while(entries.length<target&&remaining.length){
      const candidates=[];
      for(const item of remaining){
        const placements=candidatePlacements(item,entries);
        if(placements.length){
          const p=placements[Math.floor(Math.random()*Math.min(3,placements.length))];
          candidates.push({item,p,score:p.score+item.answer.length*.6+Math.random()*4});
        }
      }
      if(!candidates.length)break;
      candidates.sort((a,b)=>b.score-a.score);
      const chosen=candidates[0];
      entries.push({...chosen.item,row:chosen.p.row,col:chosen.p.col,direction:chosen.p.direction});
      remaining=remaining.filter(x=>x!==chosen.item);
    }
    return entries;
  }

  function finalizePuzzle(entries,title,topic){
    if(!entries.length)throw new Error('Tidak ada kata yang dapat ditempatkan.');
    const b=boundsFor(entries),rowShift=-b.minR,colShift=-b.minC;
    entries=entries.map(e=>({...e,row:e.row+rowShift,col:e.col+colShift}));
    const startMap=new Map(),ordered=entries.slice().sort((a,b)=>a.row-b.row||a.col-b.col||(a.direction==='H'?-1:1));let n=0;
    ordered.forEach(e=>{const k=cellKey(e.row,e.col);if(!startMap.has(k))startMap.set(k,++n);e.number=startMap.get(k)});
    const byId={};ordered.forEach((e,i)=>{byId[e.id]={...e,order:i}});
    const bb=boundsFor(ordered);
    return {id:`cw-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,title:title||'TTS Kelompok',topic:topic||'Informatika',rows:bb.h,cols:bb.w,entries:byId,createdAt:Date.now()};
  }

  function buildPuzzle(candidates,target,title,topic){
    const pool=normalizeCandidates(candidates);
    if(pool.length<4)throw new Error('Kandidat kata terlalu sedikit.');
    let best=[];let bestScore=-Infinity;
    const tries=90;
    for(let t=0;t<tries;t++){
      const source=t%3===0?shuffled(pool):pool.slice();
      const entries=layoutAttempt(source,target);
      const b=boundsFor(entries);
      const crosses=entries.reduce((sum,e)=>sum+Math.max(0,candidatePlacements(e,entries.filter(x=>x.id!==e.id)).length?1:0),0);
      const score=entries.length*1000-b.area+crosses*3;
      if(score>bestScore){bestScore=score;best=entries}
      if(best.length>=target&&b.area<250)break;
    }
    if(best.length<Math.min(5,target))throw new Error('Kata AI belum cukup saling berpotongan. Coba Generate ulang.');
    best=best.slice(0,target);
    return finalizePuzzle(best,title,topic);
  }

  function entriesArray(puzzle=cw().puzzle){return puzzle?.entries?Object.values(puzzle.entries).sort((a,b)=>Number(a.order||0)-Number(b.order||0)):[]}

  function boardData(puzzle,team=null,revealAll=false){
    const rows=Number(puzzle?.rows||0),cols=Number(puzzle?.cols||0),entries=entriesArray(puzzle),map=new Map();
    entries.forEach(e=>{
      for(let i=0;i<e.answer.length;i++){
        const r=e.row+(e.direction==='V'?i:0),c=e.col+(e.direction==='H'?i:0),k=cellKey(r,c);
        let x=map.get(k)||{char:e.answer[i],entryIds:[],number:null};
        x.char=e.answer[i];x.entryIds.push(e.id);if(i===0)x.number=e.number;map.set(k,x);
      }
    });
    const solved=team?.solved||{},active=team?.activeEntryId||'';
    const cells=[];
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
      const x=map.get(cellKey(r,c));
      if(!x){cells.push({blank:true,r,c});continue}
      const anySolved=x.entryIds.some(id=>solved[id]);
      cells.push({...x,r,c,blank:false,letter:revealAll||anySolved?x.char:'',active:x.entryIds.includes(active),solved:anySolved,selectId:x.entryIds.find(id=>!solved[id])||x.entryIds[0]});
    }
    return {rows,cols,cells};
  }

  function boardHtml(puzzle,team=null,revealAll=false,interactive=false){
    if(!puzzle?.entries)return '<div class="cw-board-empty">Belum ada papan TTS. Generate TTS terlebih dahulu.</div>';
    const data=boardData(puzzle,team,revealAll);
    return `<div class="cw-board-wrap"><div class="cw-board" style="grid-template-columns:repeat(${data.cols},var(--cw-cell))">${data.cells.map(c=>{if(c.blank)return '<span class="cw-cell blank"></span>';const inner=`${c.number?`<i class="cw-num">${c.number}</i>`:''}<span>${esc(c.letter||'')}</span>`;return interactive?`<button type="button" class="cw-cell ${c.active?'active':''} ${c.solved?'solved':''} selectable" onclick="window.DMCrossword.activateEntry('${esc(c.selectId)}')">${inner}</button>`:`<span class="cw-cell ${c.active?'active':''} ${c.solved?'solved':''}">${inner}</span>`}).join('')}</div></div>`;
  }

  function teacherNotice(text,type=''){
    const host=el('cwTeacherNotice');if(!host)return;host.className=`cw-notice ${type}`;host.textContent=text||'';
  }

  async function generateTeacherPuzzle(){
    if(busyGenerate||!bridge().isHost?.())return;
    const worker=window.DIGITAL_MISSION_AI_CONFIG?.workerUrl||'';
    const topic=(el('cwTopic')?.value||'Keamanan digital').trim();
    const difficulty=el('cwDifficulty')?.value||'sedang';
    const target=Math.max(6,Math.min(14,Number(el('cwWordCount')?.value||10)));
    const duration=Math.max(5,Math.min(40,Number(el('cwDuration')?.value||15)));
    const consensus=el('cwConsensus')?.value||'all';
    busyGenerate=true;if(el('cwGenerateBtn'))el('cwGenerateBtn').disabled=true;
    teacherNotice('AI sedang membuat bank kata dan sistem sedang menyusun grid TTS…','warn');
    let candidates=[],title=`TTS ${topic}`;
    try{
      if(!worker)throw new Error('URL Cloudflare Worker belum diatur.');
      const res=await fetch(worker,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:'generate_crossword',crossword:{topic,difficulty,count:Math.max(20,target+10)}})});
      const payload=await res.json().catch(()=>({}));
      if(!res.ok||payload?.error)throw new Error(payload?.error||`Worker gagal (${res.status})`);
      candidates=payload?.candidates||payload?.words||[];title=payload?.title||title;
      if(candidates.length<8)throw new Error('AI menghasilkan kandidat terlalu sedikit.');
    }catch(err){
      console.warn('Generate TTS AI fallback:',err);
      candidates=FALLBACK.map(([answer,clue])=>({answer,clue}));
      teacherNotice(`AI belum dapat dipakai (${err.message||err}). Menggunakan bank soal cadangan lalu menyusun grid dinamis.`,'warn');
    }
    try{
      const puzzle=buildPuzzle(candidates,target,title,topic);
      const actual=entriesArray(puzzle).length;
      await db().ref(`${roomBase()}/crossword`).set({
        config:{topic,difficulty,targetWords:target,durationMinutes:duration,consensus,title:puzzle.title,generatedAt:now()},
        puzzle,
        state:{status:'ready',startedAt:0,endsAt:0,finishedAt:0},
        teams:null
      });
      teacherNotice(`TTS siap: ${actual} kata berhasil ditempatkan. Periksa pratinjau lalu tekan Mulai TTS.`,'good');
    }catch(err){teacherNotice(err.message||String(err),'bad')}
    finally{busyGenerate=false;if(el('cwGenerateBtn'))el('cwGenerateBtn').disabled=false}
  }

  async function prepareTeams(){
    const count=Math.max(2,Math.min(6,Number(el('cwGroupCount')?.value||4)));
    try{await bridge().shuffleTeams?.(count);teacherNotice('Pembagian tim diacak. Periksa hasil lalu tekan Masukkan Siswa.','good')}catch(err){teacherNotice(err.message||String(err),'bad')}
  }
  async function releaseTeams(){try{await bridge().releaseTeams?.();teacherNotice('Tim telah dibuka untuk siswa.','good')}catch(err){teacherNotice(err.message||String(err),'bad')}}

  function initTeamState(){return {activeEntryId:'',proposal:null,responses:{},attempts:{},solved:{},score:0,finishedAt:0,updatedAt:now()}}
  async function startGame(){
    if(busyAction||!bridge().isHost?.())return;
    const state=cw().state||{},puzzle=cw().puzzle,meta=room()?.meta||{};
    if(!puzzle?.entries)return teacherNotice('Generate TTS terlebih dahulu.','warn');
    if(meta.teamPhase!=='released'||!Object.keys(groups()).length)return teacherNotice('Bentuk dan masukkan siswa ke tim terlebih dahulu.','warn');
    const duration=Math.max(5,Math.min(40,Number(el('cwDuration')?.value||cw().config?.durationMinutes||15)));
    const updates={};Object.keys(groups()).forEach(gid=>updates[`${roomBase()}/crossword/teams/${gid}`]=initTeamState());
    updates[`${roomBase()}/crossword/state`]={status:'active',startedAt:now(),endsAt:now()+duration*60000,finishedAt:0};
    updates[`${roomBase()}/crossword/config/durationMinutes`]=duration;
    busyAction=true;try{await db().ref().update(updates);teacherNotice('TTS dimulai. Semua tim dapat memilih satu soal aktif dan berdiskusi.','good')}catch(err){teacherNotice(err.message||String(err),'bad')}finally{busyAction=false}
  }
  async function finishGame(){
    if(!bridge().isHost?.())return;
    if(!confirm('Akhiri permainan TTS sekarang?'))return;
    await db().ref(`${roomBase()}/crossword/state`).update({status:'finished',finishedAt:now(),endsAt:Math.min(Number(cw().state?.endsAt||now()),now())});
  }
  async function resetGame(){
    if(!bridge().isHost?.())return;
    if(!confirm('Hapus puzzle dan progres TTS saat ini?'))return;
    await db().ref(`${roomBase()}/crossword`).remove();teacherNotice('TTS direset. Silakan Generate TTS baru.','good');
  }

  function teamMembers(gid){return Object.entries(students()).filter(([,s])=>s.groupId===gid).sort((a,b)=>Number(a[1].joinedAt||0)-Number(b[1].joinedAt||0)||a[0].localeCompare(b[0]))}
  function requiredAgreeCount(gid){
    const n=teamMembers(gid).length,mode=cw().config?.consensus||'all';
    if(n<=1)return 1;
    return mode==='majority'?Math.floor(n/2)+1:n;
  }
  function currentTeam(){const st=student();return st?.groupId?cw().teams?.[st.groupId]||null:null}
  function reviewStats(gid,team){
    const members=teamMembers(gid),proposal=team?.proposal||null,responses=team?.responses||{};
    const proposerUid=proposal?.uid||'';
    const reviewers=members.filter(([uid])=>uid!==proposerUid);
    const responded=reviewers.filter(([uid])=>responses[uid]&&typeof responses[uid].agree==='boolean');
    const agreeResponses=responded.filter(([uid])=>responses[uid]?.agree===true).length;
    const proposerCounts=proposal&&members.some(([uid])=>uid===proposerUid)?1:0;
    const agreeCount=proposerCounts+agreeResponses;
    const needAgree=requiredAgreeCount(gid);
    const allResponded=responded.length>=reviewers.length;
    return {
      members,reviewers,responses,responded,
      responseCount:responded.length,responseNeed:reviewers.length,
      agreeCount,needAgree,allResponded,
      accepted:!!proposal&&allResponded&&agreeCount>=needAgree,
      rejected:!!proposal&&allResponded&&agreeCount<needAgree
    };
  }
  function meaningfulReasonLength(text){return String(text||'').replace(/\s/g,'').length}

  async function activateEntry(entryId){
    const st=student(),state=cw().state||{},puzzle=cw().puzzle,team=currentTeam();
    if(!st?.groupId||state.status!=='active'||!puzzle?.entries?.[entryId]||team?.solved?.[entryId])return;
    const ref=db().ref(`${roomBase()}/crossword/teams/${st.groupId}`);
    await ref.transaction(t=>{
      t=t||initTeamState();
      if(t.activeEntryId&&t.activeEntryId!==entryId)return;
      t.activeEntryId=entryId;t.proposal=null;t.responses={};t.updatedAt=Date.now();return t;
    });
  }

  async function submitProposal(){
    const st=student(),team=currentTeam(),entryId=team?.activeEntryId;
    if(!st?.groupId||!entryId)return;
    if(team?.proposal)return alert('Sudah ada usulan yang sedang dibahas. Tanggapi usulan tersebut terlebih dahulu.');
    const input=el('cwProposalInput'),text=normalizeWord(input?.value||'');
    if(text.length<2)return alert('Masukkan usulan jawaban terlebih dahulu.');
    const ref=db().ref(`${roomBase()}/crossword/teams/${st.groupId}`);
    const tx=await ref.transaction(t=>{
      t=t||initTeamState();
      if(t.proposal)return;
      t.proposal={text,uid:user().uid,name:st.name||'Siswa',createdAt:Date.now()};
      t.responses={};
      if(t.votes)delete t.votes;
      t.updatedAt=Date.now();
      return t;
    });
    const savedProposal=tx?.snapshot?.val()?.proposal;
    if(!tx?.committed||savedProposal?.uid!==user()?.uid||normalizeWord(savedProposal?.text)!==text)return alert('Anggota lain lebih dulu mengirim usulan. Periksa usulan yang sedang dibahas.');
    if(input)input.value='';
    await sendSystemChat(`${st.name||'Seorang anggota'} mengusulkan jawaban "${text}". Anggota lain wajib memberi Setuju/Tidak Setuju beserta alasan lebih dari 40 karakter.`);
  }

  async function submitReview(decision){
    const st=student(),team=currentTeam(),entryId=team?.activeEntryId,proposal=team?.proposal;
    if(!st?.groupId||!entryId||!proposal)return;
    if(proposal.uid===user()?.uid)return alert('Kamu adalah pengusul. Tanggapan Setuju/Tidak Setuju diberikan oleh anggota lain.');
    if(!['yes','no'].includes(decision))return;
    const input=el('cwReviewReason');
    const reason=String(input?.value||'').trim().slice(0,500);
    const count=meaningfulReasonLength(reason);
    if(count<=40)return alert(`Alasan harus lebih dari 40 karakter nonspasi. Saat ini ${count} karakter.`);
    const record={agree:decision==='yes',reason,name:st.name||'Siswa',uid:user().uid,createdAt:now()};
    await db().ref(`${roomBase()}/crossword/teams/${st.groupId}/responses/${user().uid}`).set(record);
    await db().ref(chatPath(st.groupId)).push().set({
      uid:user().uid,name:st.name,
      text:`${decision==='yes'?'SETUJU':'TIDAK SETUJU'} — ${reason}`,
      game:'crossword',review:true,reviewAgree:decision==='yes',createdAt:firebase.database.ServerValue.TIMESTAMP
    });
  }

  function updateReviewCounter(){
    const input=el('cwReviewReason'),counter=el('cwReviewCounter');if(!input||!counter)return;
    const count=meaningfulReasonLength(input.value);
    counter.textContent=`${count}/41 karakter minimum`;
    counter.className=`cw-review-counter ${count>40?'ok':'warn'}`;
  }

  async function discussAgain(){
    const st=student(),team=currentTeam();if(!st?.groupId||!team?.proposal)return;
    const stats=reviewStats(st.groupId,team);
    if(!stats.allResponded)return alert('Tunggu semua anggota lain memberikan tanggapan terlebih dahulu.');
    await db().ref(`${roomBase()}/crossword/teams/${st.groupId}`).update({proposal:null,responses:{},updatedAt:now()});
    await sendSystemChat('Usulan belum disepakati. Tim membuka usulan baru setelah mendiskusikan alasan Setuju/Tidak Setuju.');
  }

  async function submitAnswer(){
    const st=student(),team=currentTeam(),entryId=team?.activeEntryId,entry=cw().puzzle?.entries?.[entryId];
    if(!st?.groupId||!entryId||!entry||!team?.proposal)return;
    const stats=reviewStats(st.groupId,team);
    if(!stats.allResponded)return alert(`Belum semua anggota lain menanggapi. Masih menunggu ${Math.max(0,stats.responseNeed-stats.responseCount)} tanggapan.`);
    if(!stats.accepted)return alert(`Usulan belum mencapai syarat persetujuan (${stats.agreeCount}/${stats.needAgree} setuju). Buka usulan baru setelah diskusi.`);
    const proposed=normalizeWord(team.proposal.text),correct=normalizeWord(entry.answer),ref=db().ref(`${roomBase()}/crossword/teams/${st.groupId}`);
    let outcome='';
    await ref.transaction(t=>{
      if(!t||t.activeEntryId!==entryId||t.solved?.[entryId])return;
      const attempts=Number(t.attempts?.[entryId]||0)+1;t.attempts=t.attempts||{};t.attempts[entryId]=attempts;
      if(proposed===correct){
        const pts=Math.max(10,20-(attempts-1)*5);
        t.solved=t.solved||{};
        t.solved[entryId]={answer:correct,points:pts,solvedAt:Date.now(),submittedByUid:user().uid};
        t.score=Number(t.score||0)+pts;
        t.activeEntryId='';
        t.proposal=null;
        t.responses={};
        if(t.votes)delete t.votes;
        if(Object.keys(t.solved).length>=entriesArray().length)t.finishedAt=Date.now();
        outcome=`correct:${pts}`;
      }else{
        t.proposal=null;
        t.responses={};
        if(t.votes)delete t.votes;
        outcome='wrong';
      }
      t.updatedAt=Date.now();return t;
    });
    if(outcome.startsWith('correct'))await sendSystemChat(`Benar! ${entry.number} ${entry.direction==='H'?'Mendatar':'Menurun'} = ${correct}. +${outcome.split(':')[1]} poin.`);
    else if(outcome==='wrong')await sendSystemChat('Jawaban belum tepat. Usulan dihapus agar semua anggota dapat mengajukan jawaban baru setelah berdiskusi.');
  }

  function chatPath(gid){return `groupChats/${code()}/${gid}`}
  function unsubscribeChat(){if(chatRef)chatRef.off();chatRef=null;chatGroup='';chatMessages={}}
  function ensureChat(gid){
    if(!db()||!gid)return;if(chatRef&&chatGroup===gid)return;unsubscribeChat();chatGroup=gid;chatRef=db().ref(chatPath(gid)).limitToLast(100);
    chatRef.on('value',snap=>{chatMessages=snap.val()||{};renderStudentChat()});
  }
  async function sendChat(){
    const st=student(),input=el('cwChatInput');if(!st?.groupId||!input)return;const text=String(input.value||'').trim().slice(0,500);if(!text)return;
    input.value='';await db().ref(chatPath(st.groupId)).push().set({uid:user().uid,name:st.name,text,game:'crossword',createdAt:firebase.database.ServerValue.TIMESTAMP});
  }
  async function sendSystemChat(text){
    const st=student();if(!st?.groupId)return;
    // Ditulis sebagai pesan siswa agar sesuai dengan security rules yang sudah ada.
    await db().ref(chatPath(st.groupId)).push().set({uid:user().uid,name:st.name,text:String(text).slice(0,500),game:'crossword',system:true,createdAt:firebase.database.ServerValue.TIMESTAMP});
  }
  function renderProposalReviewPanel(){
    const host=el('cwProposalReview');if(!host)return;
    const st=student(),team=currentTeam(),proposal=team?.proposal;
    if(!st?.groupId||!team?.activeEntryId||!proposal){host.classList.add('hidden');host.innerHTML='';return}
    const stats=reviewStats(st.groupId,team),meUid=user()?.uid,myResponse=stats.responses[meUid]||null,isProposer=proposal.uid===meUid;
    const responseRows=stats.reviewers.map(([uid,s])=>{
      const r=stats.responses[uid];
      if(!r)return `<div class="cw-review-member pending"><div><b>${esc(s.name||'Siswa')}</b><small>Belum menanggapi</small></div><span>Menunggu</span></div>`;
      return `<div class="cw-review-member ${r.agree?'agree':'disagree'}"><div><b>${esc(s.name||r.name||'Siswa')}</b><small>${r.agree?'Setuju':'Tidak setuju'}</small><p>${esc(r.reason||'')}</p></div><span>${r.agree?'SETUJU':'TIDAK'}</span></div>`;
    }).join('');
    let action='';
    if(isProposer){
      action=`<div class="cw-review-own-note"><b>Kamu mengajukan jawaban ini.</b><span>Tunggu anggota lain menilai usulan dan menulis alasan mereka.</span></div>`;
    }else{
      const value=esc(myResponse?.reason||'');
      action=`<div class="cw-review-question"><b>${myResponse?'Perbarui tanggapanmu':'Apakah kamu setuju dengan usulan ini?'}</b><p>Alasan wajib lebih dari 40 karakter. Jelaskan berdasarkan petunjuk, huruf silang, atau logika jawaban.</p><textarea id="cwReviewReason" maxlength="500" placeholder="Tulis alasan setuju atau tidak setuju..." oninput="window.DMCrossword.updateReviewCounter()">${value}</textarea><div class="cw-review-actions"><span id="cwReviewCounter" class="cw-review-counter">${meaningfulReasonLength(myResponse?.reason||'')}/41 karakter minimum</span><div><button type="button" class="btn cw-disagree-btn" onclick="window.DMCrossword.submitReview('no')">Tidak Setuju</button><button type="button" class="btn cw-agree-btn" onclick="window.DMCrossword.submitReview('yes')">Setuju</button></div></div></div>`;
    }
    const status=stats.accepted?'Usulan disepakati':stats.rejected?'Usulan belum disepakati':`Menunggu ${Math.max(0,stats.responseNeed-stats.responseCount)} tanggapan`;
    host.classList.remove('hidden');
    host.innerHTML=`<section class="cw-review-card"><div class="cw-review-head"><div><span>USULAN JAWABAN</span><strong>${esc(proposal.text)}</strong><small>Diajukan oleh ${esc(proposal.name||'anggota')}</small></div><b class="${stats.accepted?'good':stats.rejected?'bad':'wait'}">${esc(status)}</b></div>${action}<div class="cw-review-list"><div class="cw-review-list-title">Tanggapan anggota lain <span>${stats.responseCount}/${stats.responseNeed}</span></div>${responseRows||'<div class="cw-review-solo">Tidak ada anggota lain. Usulan dapat langsung dikirim.</div>'}</div></section>`;
    updateReviewCounter();
  }

  function renderStudentChat(){
    renderProposalReviewPanel();
    const host=el('cwChatMessages');if(!host)return;
    const list=Object.values(chatMessages||{}).filter(m=>m&&m.game==='crossword').sort((a,b)=>Number(a.createdAt||0)-Number(b.createdAt||0));
    host.innerHTML=list.length?list.map(m=>{
      const me=m.uid===user()?.uid,system=!!m.system;const time=m.createdAt?new Date(Number(m.createdAt)).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}):'';
      if(system)return `<div class="cw-chat-message system"><div class="cw-chat-bubble">${esc(m.text)}</div></div>`;
      const reviewClass=m.review?(m.reviewAgree?' review-agree':' review-disagree'):'';
      return `<div class="cw-chat-message ${me?'me':''}${reviewClass}"><div class="cw-chat-avatar">${esc((m.name||'?').slice(0,1).toUpperCase())}</div><div class="cw-chat-body"><b>${esc(m.name||'Siswa')}${me?' (kamu)':''}</b><time>${esc(time)}</time><div class="cw-chat-bubble">${esc(m.text||'')}</div></div></div>`;
    }).join(''):'<div class="cw-board-empty">Belum ada pesan. Diskusikan petunjuk bersama tim di sini.</div>';
    host.scrollTop=host.scrollHeight;
  }

  function renderTeacher(){
    const host=el('teacherGameWorkspaceCrossword');if(!host||host.classList.contains('hidden'))return;
    const data=cw(),state=data.state||{},puzzle=data.puzzle,teamMap=data.teams||{},phase=room()?.meta?.teamPhase||'collecting';
    if(el('cwTeacherStudentCount'))el('cwTeacherStudentCount').textContent=Object.keys(students()).length;
    if(el('cwTeacherTeamCount'))el('cwTeacherTeamCount').textContent=Object.keys(groups()).length;
    if(el('cwTeacherStatus'))el('cwTeacherStatus').textContent=state.status==='active'?'Berjalan':state.status==='finished'?'Selesai':state.status==='ready'?'Siap':'Belum dibuat';
    if(el('cwTeacherPuzzleCount'))el('cwTeacherPuzzleCount').textContent=puzzle?`${entriesArray(puzzle).length} kata`:'—';
    if(el('cwTeacherPreview'))el('cwTeacherPreview').innerHTML=boardHtml(puzzle,null,true,false);
    const statusBtn=el('cwStartBtn');if(statusBtn){statusBtn.disabled=!puzzle||phase!=='released'||state.status==='active';statusBtn.textContent=state.status==='finished'?'Mulai Ulang TTS':'Mulai TTS'}
    if(el('cwFinishBtn'))el('cwFinishBtn').disabled=state.status!=='active';
    if(el('cwTeacherStatePill'))el('cwTeacherStatePill').textContent=state.status==='active'?'● Sedang berlangsung':state.status==='finished'?'Selesai':state.status==='ready'?'Siap dimulai':'Belum dibuat';
    const progress=el('cwTeacherProgress');
    if(progress){
      const total=entriesArray(puzzle).length||0;
      progress.innerHTML=Object.entries(groups()).length?Object.entries(groups()).map(([gid,g])=>{const t=teamMap[gid]||{},done=Object.keys(t.solved||{}).length,pct=total?Math.round(done/total*100):0,active=puzzle?.entries?.[t.activeEntryId];return `<div class="cw-team-progress-row"><b>${esc(g.name||gid)}</b><small>${done}/${total} kata</small><div><div class="cw-mini-track"><i style="width:${pct}%"></i></div><small>${active?`Membahas ${active.number} ${active.direction==='H'?'Mendatar':'Menurun'}`:t.finishedAt?'Selesai':'Menunggu soal'}</small></div><b>${Number(t.score||0)} pt</b></div>`}).join(''):'<div class="cw-board-empty">Tim belum dibentuk.</div>';
    }
    updateTeacherTimer();
  }

  function updateTeacherTimer(){
    const host=el('cwTeacherTimer');if(!host)return;const state=cw().state||{};
    if(state.status!=='active'||!state.endsAt){host.textContent='--:--';return}
    const ms=Math.max(0,Number(state.endsAt)-now()),m=Math.floor(ms/60000),s=Math.floor(ms%60000/1000);host.textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    if(ms<=0&&bridge().isHost?.()&&!autoFinishGuard){autoFinishGuard=true;db().ref(`${roomBase()}/crossword/state`).update({status:'finished',finishedAt:now()}).finally(()=>setTimeout(()=>autoFinishGuard=false,1500))}
  }

  function renderStudent(){
    const ws=el('studentCrosswordWorkspace');if(!ws||ws.classList.contains('hidden'))return;
    const st=student(),data=cw(),state=data.state||{},puzzle=data.puzzle,meta=room()?.meta||{};
    if(!st){return}
    if(el('cwStudentTeam'))el('cwStudentTeam').textContent=st.groupId?(groups()[st.groupId]?.name||'Tim'):'Belum ada tim';
    if(meta.teamPhase!=='released'||!st.groupId){unsubscribeChat();showStudentWait('Tim belum dibentuk','Guru sedang menyiapkan pembagian tim. TTS akan terbuka setelah kamu masuk ke salah satu tim.');return}
    ensureChat(st.groupId);
    if(!puzzle||!['active','finished'].includes(state.status)){showStudentWait('TTS belum dimulai','Tim kamu sudah siap. Tunggu guru membuat dan memulai papan TTS.');return}
    const team=data.teams?.[st.groupId]||initTeamState(),total=entriesArray(puzzle).length,done=Object.keys(team.solved||{}).length,pct=total?Math.round(done/total*100):0;
    el('cwStudentWaiting')?.classList.add('hidden');el('cwStudentGame')?.classList.remove('hidden');
    if(el('cwStudentTitle'))el('cwStudentTitle').textContent=puzzle.title||'TTS Kelompok';
    if(el('cwStudentProgressText'))el('cwStudentProgressText').textContent=`${done}/${total} kata`;
    if(el('cwStudentProgressTextMirror'))el('cwStudentProgressTextMirror').textContent=`${pct}% selesai`;
    if(el('cwStudentProgressBar'))el('cwStudentProgressBar').style.width=`${pct}%`;
    if(el('cwStudentScore'))el('cwStudentScore').textContent=`${Number(team.score||0)} poin`;
    if(el('cwStudentBoard'))el('cwStudentBoard').innerHTML=boardHtml(puzzle,team,false,state.status==='active');
    updateStudentTimer();renderActiveClue(st,team,puzzle,state);renderStudentChat();
  }
  function showStudentWait(title,text){
    el('cwStudentGame')?.classList.add('hidden');const wait=el('cwStudentWaiting');wait?.classList.remove('hidden');if(el('cwWaitTitle'))el('cwWaitTitle').textContent=title;if(el('cwWaitText'))el('cwWaitText').textContent=text;
  }
  function updateStudentTimer(){
    const host=el('cwStudentTimer'),state=cw().state||{};if(!host)return;
    if(state.status==='finished'){host.textContent='Selesai';return}if(state.status!=='active'||!state.endsAt){host.textContent='--:--';return}
    const ms=Math.max(0,Number(state.endsAt)-now()),m=Math.floor(ms/60000),s=Math.floor(ms%60000/1000);host.textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
  function renderActiveClue(st,team,puzzle,state){
    const zone=el('cwActiveClue');if(!zone)return;const list=entriesArray(puzzle),entry=team.activeEntryId?puzzle.entries[team.activeEntryId]:null;
    const clueButtons=el('cwClueButtons');if(clueButtons)clueButtons.innerHTML=list.map(e=>`<button type="button" class="cw-clue-button ${team.solved?.[e.id]?'solved':''} ${team.activeEntryId===e.id?'active':''}" ${state.status==='active'&&!team.solved?.[e.id]?'': 'disabled'} onclick="window.DMCrossword.activateEntry('${esc(e.id)}')">${e.number} ${e.direction==='H'?'Mendatar':'Menurun'}${team.solved?.[e.id]?' ✓':''}</button>`).join('');
    if(state.status==='finished'){
      zone.className='cw-clue-zone waiting';zone.innerHTML=`<strong>Permainan selesai</strong><p>Tim memperoleh <b>${Number(team.score||0)} poin</b> dan menyelesaikan ${Object.keys(team.solved||{}).length}/${list.length} kata.</p>`;return;
    }
    if(!entry){zone.className='cw-clue-zone waiting';zone.innerHTML='<strong>Pilih satu soal untuk dibahas bersama</strong><p>Klik nomor pada papan atau daftar soal. Semua anggota tim memiliki hak yang sama untuk memilih dan mengajukan jawaban.</p>';return}
    zone.className='cw-clue-zone';
    const proposal=team.proposal,stats=reviewStats(st.groupId,team);
    let action='';
    if(!proposal){
      action=`<div class="cw-proposal-line"><input id="cwProposalInput" maxlength="16" placeholder="Usulan jawaban…" onkeydown="if(event.key==='Enter')window.DMCrossword.submitProposal()"><button class="btn primary" type="button" onclick="window.DMCrossword.submitProposal()">Ajukan</button></div><span class="cw-inline-status">Semua anggota setara dan boleh mengajukan jawaban. Satu usulan dibahas pada satu waktu.</span>`;
    }else{
      const stateText=stats.accepted
        ?`Semua tanggapan masuk dan usulan memenuhi syarat persetujuan (${stats.agreeCount}/${stats.needAgree}).`
        :stats.rejected
          ?`Semua tanggapan sudah masuk, tetapi persetujuan belum cukup (${stats.agreeCount}/${stats.needAgree}).`
          :`Menunggu ${Math.max(0,stats.responseNeed-stats.responseCount)} anggota lain menanggapi di panel Diskusi Kelompok.`;
      action=`<div class="cw-proposal-current"><div><small>Usulan dari ${esc(proposal.name||'anggota')}</small><strong>${esc(proposal.text)}</strong></div><span class="cw-inline-status ${stats.accepted?'good':stats.rejected?'bad':''}">${stats.responseCount}/${stats.responseNeed} tanggapan</span></div><div class="cw-submit-row">${stats.accepted?`<button class="btn primary" type="button" onclick="window.DMCrossword.submitAnswer()">Masukkan ke TTS</button>`:''}${stats.rejected?`<button class="btn secondary" type="button" onclick="window.DMCrossword.discussAgain()">Buka Usulan Baru</button>`:''}<span class="cw-inline-status ${stats.accepted?'good':stats.rejected?'bad':''}">${esc(stateText)}</span></div>`;
    }
    zone.innerHTML=`<span class="cw-clue-label">Soal Aktif</span><div class="cw-clue-title"><span class="cw-clue-no">${entry.number}</span><strong>${entry.direction==='H'?'Mendatar':'Menurun'} · ${entry.answer.length} huruf</strong></div><p class="cw-clue-text">${esc(entry.clue)}</p><div class="cw-equal-team-note"><b>Semua anggota setara</b><span>Siapa pun boleh memberi usulan. Anggota lain wajib menilai Setuju/Tidak Setuju dengan alasan lebih dari 40 karakter.</span></div><div class="cw-action-zone">${action}</div>`;
  }

  function refresh(){
    const mode=bridge().getMode?.();if(mode==='teacher')renderTeacher();if(mode==='student')renderStudent();
  }
  function openStudent(){refresh();const st=student();if(st?.groupId)ensureChat(st.groupId)}
  function closeStudent(){unsubscribeChat()}

  setInterval(()=>{updateTeacherTimer();updateStudentTimer()},1000);

  window.DMCrossword={
    refresh,openStudent,closeStudent,generateTeacherPuzzle,prepareTeams,releaseTeams,startGame,finishGame,resetGame,
    activateEntry,submitProposal,submitReview,updateReviewCounter,discussAgain,submitAnswer,sendChat,buildPuzzle
  };
})();
