/* ===== crossword.js ===== */
/* DIGITAL MISSION — TTS Kelompok v3
   Semua anggota tim setara dan dapat mengajukan usulan.
   Usulan wajib ditanggapi anggota lain dengan Setuju/Tidak Setuju + alasan >40 karakter.
   Papan TTS bersifat bersama antartim: jawaban benar dari satu tim langsung terbuka untuk semua tim.
   Satu jawaban pembuka otomatis ditampilkan saat permainan dimulai sebagai Bantuan Awal.
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
  let busyGenerate=false,busyAction=false,busySubmit=false,autoFinishGuard=false;
  const staleEntryCleanup=new Set();
  const TEAM_COLORS=['#ef4444','#eab308','#3b82f6','#22c55e','#8b5cf6','#f97316'];

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

  function sharedSolved(){return cw().globalSolved||{}}
  function ownerInfo(record){
    if(!record)return {name:'',color:'#94a3b8',starter:false};
    if(record.source==='starter')return {name:'Bantuan Awal',color:'#94a3b8',starter:true};
    const idx=Number(record.colorIndex);
    const gid=record.teamId||'';
    const g=groups()[gid]||{};
    const safeIdx=Number.isFinite(idx)&&idx>=0?idx:Number(g.colorIndex||0);
    return {name:record.teamName||g.name||'Tim',color:TEAM_COLORS[((safeIdx%TEAM_COLORS.length)+TEAM_COLORS.length)%TEAM_COLORS.length],starter:false};
  }
  function ownerBadgeHtml(record){
    const info=ownerInfo(record);if(!info.name)return '';
    return `<span class="cw-owner-badge ${info.starter?'starter':''}" style="--cw-owner:${info.color}"><i></i>${esc(info.name)}</span>`;
  }
  function ownerDotHtml(record){
    if(!record)return '';
    const info=ownerInfo(record);
    return `<i class="cw-owner-dot ${info.starter?'starter':''}" style="--cw-owner:${info.color}" title="${esc(info.name)}"></i>`;
  }
  function sharedLegendHtml(){
    const records=Object.values(sharedSolved());
    if(!records.length)return '';
    const uniq=[];const seen=new Set();
    records.forEach(r=>{const key=r?.source==='starter'?'starter':`team:${r?.teamId||r?.teamName||''}`;if(!seen.has(key)){seen.add(key);uniq.push(r)}});
    return `<div class="cw-answer-legend"><span>Penanda jawaban</span>${uniq.map(ownerBadgeHtml).join('')}</div>`;
  }
  function pickStarterEntry(puzzle){
    const list=entriesArray(puzzle);if(!list.length)return null;
    const occupancy=new Map();
    list.forEach(e=>{for(let i=0;i<e.answer.length;i++){const r=e.row+(e.direction==='V'?i:0),c=e.col+(e.direction==='H'?i:0),k=cellKey(r,c);occupancy.set(k,(occupancy.get(k)||0)+1)}});
    return list.slice().sort((a,b)=>{
      const cross=e=>{let n=0;for(let i=0;i<e.answer.length;i++){const r=e.row+(e.direction==='V'?i:0),c=e.col+(e.direction==='H'?i:0);if((occupancy.get(cellKey(r,c))||0)>1)n++}return n};
      const ca=cross(a),cb=cross(b);if(cb!==ca)return cb-ca;
      const pa=(a.answer.length>=4&&a.answer.length<=9)?1:0,pb=(b.answer.length>=4&&b.answer.length<=9)?1:0;if(pb!==pa)return pb-pa;
      return a.answer.length-b.answer.length;
    })[0]||list[0];
  }

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
    const rows=Number(puzzle?.rows||0),cols=Number(puzzle?.cols||0),entries=entriesArray(puzzle),map=new Map(),solved=sharedSolved();
    entries.forEach(e=>{
      for(let i=0;i<e.answer.length;i++){
        const r=e.row+(e.direction==='V'?i:0),c=e.col+(e.direction==='H'?i:0),k=cellKey(r,c);
        let x=map.get(k)||{char:e.answer[i],entryIds:[],starts:[],number:null};
        x.char=e.answer[i];x.entryIds.push(e.id);if(i===0){x.number=e.number;x.starts.push(e.id)}map.set(k,x);
      }
    });
    const active=team?.activeEntryId||'';
    const cells=[];
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
      const x=map.get(cellKey(r,c));
      if(!x){cells.push({blank:true,r,c});continue}
      const solvedIds=x.entryIds.filter(id=>solved[id]);
      const anySolved=solvedIds.length>0;
      const startOwnerId=x.starts.find(id=>solved[id]);
      const selectId=x.entryIds.find(id=>!solved[id])||'';
      cells.push({...x,r,c,blank:false,letter:revealAll||anySolved?x.char:'',active:x.entryIds.includes(active)&&!solved[active],solved:anySolved,selectId,owner:startOwnerId?solved[startOwnerId]:null});
    }
    return {rows,cols,cells};
  }

  function boardHtml(puzzle,team=null,revealAll=false,interactive=false){
    if(!puzzle?.entries)return '<div class="cw-board-empty">Belum ada papan TTS. Generate TTS terlebih dahulu.</div>';
    const data=boardData(puzzle,team,revealAll);
    const board=`<div class="cw-board-wrap"><div class="cw-board" style="grid-template-columns:repeat(${data.cols},var(--cw-cell))">${data.cells.map(c=>{if(c.blank)return '<span class="cw-cell blank"></span>';const inner=`${c.number?`<i class="cw-num">${c.number}</i>`:''}<span>${esc(c.letter||'')}</span>${ownerDotHtml(c.owner)}`;return interactive&&c.selectId?`<button type="button" class="cw-cell ${c.active?'active':''} ${c.solved?'solved':''} selectable" onclick="window.DMCrossword.activateEntry('${esc(c.selectId)}')">${inner}</button>`:`<span class="cw-cell ${c.active?'active':''} ${c.solved?'solved':''}">${inner}</span>`}).join('')}</div></div>`;
    return revealAll?board:`${board}${sharedLegendHtml()}`;
  }


  function teacherCluePreviewHtml(puzzle){
    const list=entriesArray(puzzle);
    if(!list.length)return '';

    const renderGroup=(direction,label)=>{
      const items=list
        .filter(e=>e.direction===direction)
        .sort((a,b)=>Number(a.number||0)-Number(b.number||0));

      if(!items.length)return '';

      return `<section class="cw-teacher-clue-group">
        <div class="cw-teacher-clue-group-head">
          <strong>${esc(label)}</strong>
          <span>${items.length} pertanyaan</span>
        </div>
        <div class="cw-teacher-clue-list">
          ${items.map(e=>`
            <article class="cw-teacher-clue-item">
              <span class="cw-teacher-clue-number">${Number(e.number||0)}</span>
              <div class="cw-teacher-clue-text">
                <p>${esc(e.clue||'Petunjuk belum tersedia.')}</p>
                <small>${String(e.answer||'').length} huruf</small>
              </div>
            </article>`).join('')}
        </div>
      </section>`;
    };

    return `<div class="cw-teacher-clues">
      <div class="cw-teacher-clues-title">
        <div>
          <strong>Pertanyaan TTS</strong>
          <span>Daftar petunjuk yang sesuai dengan nomor pada papan.</span>
        </div>
        <span class="cw-teacher-clues-count">${list.length} soal</span>
      </div>
      <div class="cw-teacher-clues-grid">
        ${renderGroup('H','Mendatar')}
        ${renderGroup('V','Menurun')}
      </div>
    </div>`;
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
    const duration=Math.max(20,Math.min(60,Number(el('cwDuration')?.value||30)));
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
        globalSolved:null,
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
    const puzzle=cw().puzzle,meta=room()?.meta||{};
    if(!puzzle?.entries)return teacherNotice('Generate TTS terlebih dahulu.','warn');
    if(meta.teamPhase!=='released'||!Object.keys(groups()).length)return teacherNotice('Bentuk dan masukkan siswa ke tim terlebih dahulu.','warn');
    const duration=Math.max(20,Math.min(60,Number(el('cwDuration')?.value||cw().config?.durationMinutes||30)));
    const starter=pickStarterEntry(puzzle),starterSolved=starter?{[starter.id]:{answer:normalizeWord(starter.answer),source:'starter',teamId:'',teamName:'Bantuan Awal',colorIndex:-1,solvedAt:now(),solvedByUid:'',solvedByName:'Sistem',points:0}}:{};
    const updates={};Object.keys(groups()).forEach(gid=>updates[`${roomBase()}/crossword/teams/${gid}`]=initTeamState());
    updates[`${roomBase()}/crossword/globalSolved`]=starterSolved;
    updates[`${roomBase()}/crossword/state`]={status:'active',startedAt:now(),endsAt:now()+duration*60000,finishedAt:0};
    updates[`${roomBase()}/crossword/config/durationMinutes`]=duration;
    busyAction=true;try{await db().ref().update(updates);teacherNotice(`TTS dimulai. ${starter?`${starter.number} ${starter.direction==='H'?'Mendatar':'Menurun'} dibuka sebagai Bantuan Awal. `:''}Jawaban benar dari satu tim akan langsung terbuka untuk semua tim.`,'good')}catch(err){teacherNotice(err.message||String(err),'bad')}finally{busyAction=false}
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

  async function cleanupGloballySolvedActive(gid,entryId){
    if(!gid||!entryId)return;const key=`${gid}:${entryId}`;if(staleEntryCleanup.has(key))return;staleEntryCleanup.add(key);
    try{
      await db().ref(`${roomBase()}/crossword/teams/${gid}`).transaction(t=>{
        if(!t||t.activeEntryId!==entryId)return t;
        t.activeEntryId='';t.proposal=null;t.responses={};t.updatedAt=Date.now();return t;
      });
    }finally{setTimeout(()=>staleEntryCleanup.delete(key),1200)}
  }

  async function activateEntry(entryId){
    const st=student(),state=cw().state||{},puzzle=cw().puzzle,team=currentTeam(),solved=sharedSolved();
    if(!st?.groupId||state.status!=='active'||!puzzle?.entries?.[entryId])return;
    if(solved[entryId]){const info=ownerInfo(solved[entryId]);return alert(`Soal ini sudah terjawab oleh ${info.name}. Pilih soal lain.`)}
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
    if(sharedSolved()[entryId]){const info=ownerInfo(sharedSolved()[entryId]);await cleanupGloballySolvedActive(st.groupId,entryId);return alert(`Soal ini sudah lebih dulu dijawab oleh ${info.name}. Pilih soal lain.`)}
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
    await maybeAutoResolveProposal(st.groupId);
  }

  async function submitReview(decision,source='panel'){
    const st=student(),team=currentTeam(),entryId=team?.activeEntryId,proposal=team?.proposal;
    if(!st?.groupId||!entryId||!proposal)return;
    if(proposal.uid===user()?.uid)return alert('Kamu adalah pengusul. Tanggapan Setuju/Tidak Setuju diberikan oleh anggota lain.');
    if(!['yes','no'].includes(decision))return;

    const inputId=source==='inline'?'cwInlineReviewReason':'cwReviewReason';
    const fallbackId=source==='inline'?'cwReviewReason':'cwInlineReviewReason';
    const input=el(inputId)||el(fallbackId);
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

    // Jika tanggapan ini melengkapi persetujuan seluruh anggota,
    // jawaban langsung diperiksa dan diproses tanpa tombol tambahan.
    await maybeAutoResolveProposal(st.groupId);
  }


  async function maybeAutoResolveProposal(gid){
    if(!gid||busySubmit)return false;

    const teamRef=db().ref(`${roomBase()}/crossword/teams/${gid}`);
    const snap=await teamRef.once('value');
    const latestTeam=snap.val();
    const entryId=latestTeam?.activeEntryId;
    const proposal=latestTeam?.proposal;
    const entry=cw().puzzle?.entries?.[entryId];

    if(!latestTeam||!entryId||!proposal||!entry)return false;
    if(sharedSolved()[entryId])return false;

    const stats=reviewStats(gid,latestTeam);

    // "Semua anggota setuju" berarti semua reviewer selain pengusul
    // sudah memberikan tanggapan dan semuanya memilih Setuju.
    const unanimous=
      stats.allResponded &&
      stats.responseCount===stats.responseNeed &&
      stats.responded.every(([uid])=>stats.responses?.[uid]?.agree===true);

    if(!unanimous)return false;

    const proposed=normalizeWord(proposal.text);
    const correct=normalizeWord(entry.answer);

    // Ketika seluruh anggota sudah setuju, sistem memeriksa jawaban otomatis.
    // Jawaban benar langsung dimasukkan ke TTS. Jawaban salah langsung
    // diproses sebagai percobaan salah agar tim dapat mengusulkan jawaban baru.
    await submitAnswer({
      auto:true,
      teamSnapshot:latestTeam,
      expectedProposalText:proposed,
      knownCorrect:proposed===correct
    });
    return true;
  }

  function updateReviewCounter(source='panel'){
    const inputId=source==='inline'?'cwInlineReviewReason':'cwReviewReason';
    const counterId=source==='inline'?'cwInlineReviewCounter':'cwReviewCounter';
    const input=el(inputId),counter=el(counterId);
    if(!input||!counter)return;
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

  async function submitAnswer(options={}){
    if(busySubmit)return;
    const st=student();
    const team=options?.teamSnapshot||currentTeam();
    const entryId=team?.activeEntryId;
    const entry=cw().puzzle?.entries?.[entryId];
    if(!st?.groupId||!entryId||!entry||!team?.proposal)return;
    const already=sharedSolved()[entryId];
    if(already){const info=ownerInfo(already);await cleanupGloballySolvedActive(st.groupId,entryId);return alert(`Jawaban sudah lebih dulu ditemukan oleh ${info.name}.`)}
    const stats=reviewStats(st.groupId,team);
    if(!stats.allResponded)return alert(`Belum semua anggota lain menanggapi. Masih menunggu ${Math.max(0,stats.responseNeed-stats.responseCount)} tanggapan.`);
    if(!stats.accepted)return alert(`Usulan belum mencapai syarat persetujuan (${stats.agreeCount}/${stats.needAgree} setuju). Buka usulan baru setelah diskusi.`);
    const proposalSnapshot={...team.proposal};
    const proposed=normalizeWord(proposalSnapshot.text);
    const correct=normalizeWord(entry.answer);
    const teamRef=db().ref(`${roomBase()}/crossword/teams/${st.groupId}`);
    const autoMode=!!options?.auto;
    const creditedUid=autoMode?(proposalSnapshot.uid||user().uid):user().uid;
    const creditedName=autoMode?(proposalSnapshot.name||st.name||'Siswa'):(st.name||'Siswa');
    busySubmit=true;
    try{
      let preparedAttempts=1;
      const prep=await teamRef.transaction(t=>{
        if(!t||t.activeEntryId!==entryId)return;
        t.attempts=t.attempts||{};t.attempts[entryId]=Number(t.attempts[entryId]||0)+1;
        t.proposal=null;t.responses={};if(t.votes)delete t.votes;t.updatedAt=Date.now();return t;
      });
      if(!prep?.committed)return;
      preparedAttempts=Number(prep.snapshot.val()?.attempts?.[entryId]||1);
      if(proposed!==correct){
        await sendSystemChat('Jawaban belum tepat. Usulan dihapus agar semua anggota dapat mengajukan jawaban baru setelah berdiskusi.');
        return;
      }

      const g=groups()[st.groupId]||{},pts=Math.max(10,20-(preparedAttempts-1)*5),claimId=`${creditedUid}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
      const claim={answer:correct,source:'team',teamId:st.groupId,teamName:g.name||'Tim',colorIndex:Number(g.colorIndex||0),solvedAt:Date.now(),solvedByUid:creditedUid,solvedByName:creditedName,points:pts,claimId};
      const claimRef=db().ref(`${roomBase()}/crossword/globalSolved/${entryId}`);
      const claimed=await claimRef.transaction(current=>current||claim);
      const winner=claimed?.snapshot?.val();
      if(!claimed?.committed||winner?.claimId!==claimId){
        const info=ownerInfo(winner||sharedSolved()[entryId]);
        await teamRef.transaction(t=>{if(!t)return t;if(t.activeEntryId===entryId)t.activeEntryId='';t.proposal=null;t.responses={};t.updatedAt=Date.now();return t});
        await sendSystemChat(`${info.name||'Tim lain'} lebih dulu menyelesaikan ${entry.number} ${entry.direction==='H'?'Mendatar':'Menurun'} = ${correct}. Jawaban kini terbuka untuk semua tim.`);
        return;
      }

      await teamRef.transaction(t=>{
        t=t||initTeamState();t.solved=t.solved||{};
        if(!t.solved[entryId]){t.solved[entryId]={answer:correct,points:pts,solvedAt:Date.now(),submittedByUid:creditedUid,submittedByName:creditedName,global:true,autoSubmitted:autoMode};t.score=Number(t.score||0)+pts}
        if(t.activeEntryId===entryId)t.activeEntryId='';t.proposal=null;t.responses={};t.updatedAt=Date.now();return t;
      });
      await sendSystemChat(`Benar! ${entry.number} ${entry.direction==='H'?'Mendatar':'Menurun'} = ${correct}. +${pts} poin untuk ${g.name||'tim'}. Jawaban langsung terbuka untuk semua tim.`);
    }finally{busySubmit=false}
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
    if(!st?.groupId||!team?.activeEntryId||sharedSolved()[team.activeEntryId]||!proposal){host.classList.add('hidden');host.innerHTML='';return}
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
      action=`<div class="cw-review-question"><b>${myResponse?'Perbarui tanggapanmu':'Apakah kamu setuju dengan usulan ini?'}</b><p>Alasan wajib lebih dari 40 karakter. Jelaskan berdasarkan petunjuk, huruf silang, atau logika jawaban.</p><textarea id="cwReviewReason" maxlength="500" placeholder="Tulis alasan setuju atau tidak setuju..." oninput="window.DMCrossword.updateReviewCounter('panel')">${value}</textarea><div class="cw-review-actions"><span id="cwReviewCounter" class="cw-review-counter">${meaningfulReasonLength(myResponse?.reason||'')}/41 karakter minimum</span><div><button type="button" class="btn cw-disagree-btn" onclick="window.DMCrossword.submitReview('no','panel')">Tidak Setuju</button><button type="button" class="btn cw-agree-btn" onclick="window.DMCrossword.submitReview('yes','panel')">Setuju</button></div></div></div>`;
    }
    const unanimousPanel=
      stats.allResponded &&
      stats.responseCount===stats.responseNeed &&
      stats.responded.every(([uid])=>stats.responses?.[uid]?.agree===true);
    const status=unanimousPanel?'Semua setuju • diproses otomatis':stats.rejected?'Belum semua setuju':`Menunggu ${Math.max(0,stats.responseNeed-stats.responseCount)} tanggapan`;
    host.classList.remove('hidden');
    host.innerHTML=`<section class="cw-review-card"><div class="cw-review-head"><div><span>USULAN JAWABAN</span><strong>${esc(proposal.text)}</strong><small>Diajukan oleh ${esc(proposal.name||'anggota')}</small></div><b class="${unanimousPanel?'good':stats.rejected?'bad':'wait'}">${esc(status)}</b></div>${action}<div class="cw-review-list"><div class="cw-review-list-title">Tanggapan anggota lain <span>${stats.responseCount}/${stats.responseNeed}</span></div>${responseRows||'<div class="cw-review-solo">Tidak ada anggota lain. Sistem akan memeriksa usulan secara otomatis.</div>'}</div></section>`;
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
    const data=cw(),state=data.state||{},puzzle=data.puzzle,teamMap=data.teams||{},phase=room()?.meta?.teamPhase||'collecting',globalSolved=data.globalSolved||{};
    const total=entriesArray(puzzle).length||0,globalDone=Object.keys(globalSolved).length;
    if(el('cwTeacherStudentCount'))el('cwTeacherStudentCount').textContent=Object.keys(students()).length;
    if(el('cwTeacherTeamCount'))el('cwTeacherTeamCount').textContent=Object.keys(groups()).length;
    if(el('cwTeacherStatus'))el('cwTeacherStatus').textContent=state.status==='active'?'Berjalan':state.status==='finished'?'Selesai':state.status==='ready'?'Siap':'Belum dibuat';
    if(el('cwTeacherPuzzleCount'))el('cwTeacherPuzzleCount').textContent=puzzle?(state.status==='active'||state.status==='finished'?`${globalDone}/${total} terjawab`:`${total} kata`):'—';
    if(el('cwTeacherPreview')){
      el('cwTeacherPreview').innerHTML=puzzle
        ? `<div class="cw-teacher-preview-layout">
            <div class="cw-teacher-preview-board">${boardHtml(puzzle,null,true,false)}</div>
            ${teacherCluePreviewHtml(puzzle)}
          </div>`
        : boardHtml(puzzle,null,true,false);
    }
    const statusBtn=el('cwStartBtn');if(statusBtn){statusBtn.disabled=!puzzle||phase!=='released'||state.status==='active';statusBtn.textContent=state.status==='finished'?'Mulai Ulang TTS':'Mulai TTS'}
    if(el('cwFinishBtn'))el('cwFinishBtn').disabled=state.status!=='active';
    if(el('cwTeacherStatePill'))el('cwTeacherStatePill').textContent=state.status==='active'?`● ${globalDone}/${total} jawaban terbuka`:state.status==='finished'?'Selesai':state.status==='ready'?'Siap dimulai':'Belum dibuat';
    const progress=el('cwTeacherProgress');
    if(progress){
      progress.innerHTML=Object.entries(groups()).length?Object.entries(groups()).map(([gid,g])=>{const t=teamMap[gid]||{},contrib=Object.keys(t.solved||{}).length,pct=total?Math.round(contrib/total*100):0,active=puzzle?.entries?.[t.activeEntryId];return `<div class="cw-team-progress-row"><b>${esc(g.name||gid)}</b><small>${contrib} jawaban tim</small><div><div class="cw-mini-track"><i style="width:${pct}%"></i></div><small>${active&&!globalSolved[t.activeEntryId]?`Membahas ${active.number} ${active.direction==='H'?'Mendatar':'Menurun'}`:'Menunggu soal'}</small></div><b>${Number(t.score||0)} pt</b></div>`}).join(''):'<div class="cw-board-empty">Tim belum dibentuk.</div>';
    }
    if(state.status==='active'&&total&&globalDone>=total&&bridge().isHost?.()&&!autoFinishGuard){autoFinishGuard=true;db().ref(`${roomBase()}/crossword/state`).update({status:'finished',finishedAt:now(),endsAt:Math.min(Number(state.endsAt||now()),now())}).finally(()=>setTimeout(()=>autoFinishGuard=false,1500))}
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
    const team=data.teams?.[st.groupId]||initTeamState(),total=entriesArray(puzzle).length,done=Object.keys(data.globalSolved||{}).length,pct=total?Math.round(done/total*100):0;
    el('cwStudentWaiting')?.classList.add('hidden');el('cwStudentGame')?.classList.remove('hidden');
    if(el('cwStudentTitle'))el('cwStudentTitle').textContent=puzzle.title||'TTS Kelompok';
    if(el('cwStudentProgressText'))el('cwStudentProgressText').textContent=`${done}/${total} kata kelas`;
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
    const zone=el('cwActiveClue');if(!zone)return;const list=entriesArray(puzzle),solved=sharedSolved();
    const clueButtons=el('cwClueButtons');
    if(clueButtons)clueButtons.innerHTML=list.map(e=>{const rec=solved[e.id];return `<button type="button" class="cw-clue-button ${rec?'solved':''} ${team.activeEntryId===e.id&&!rec?'active':''}" ${state.status==='active'&&!rec?'': 'disabled'} onclick="window.DMCrossword.activateEntry('${esc(e.id)}')"><span>${e.number} ${e.direction==='H'?'Mendatar':'Menurun'}</span>${rec?ownerBadgeHtml(rec):''}</button>`}).join('');

    if(state.status==='finished'){
      const contribution=Object.keys(team.solved||{}).length;
      zone.className='cw-clue-zone waiting';zone.innerHTML=`<strong>Permainan selesai</strong><p>Semua tim membuka <b>${Object.keys(solved).length}/${list.length}</b> jawaban. Tim kamu memperoleh <b>${Number(team.score||0)} poin</b> dari ${contribution} jawaban.</p>`;return;
    }
    if(team.activeEntryId&&solved[team.activeEntryId]){
      const rec=solved[team.activeEntryId],info=ownerInfo(rec);cleanupGloballySolvedActive(st.groupId,team.activeEntryId);
      zone.className='cw-clue-zone waiting';zone.innerHTML=`<strong>Soal telah dijawab ${esc(info.name)}</strong><p>Jawabannya sekarang sudah terbuka untuk semua tim. Pilih nomor lain yang masih kosong.</p>`;return;
    }
    const entry=team.activeEntryId?puzzle.entries[team.activeEntryId]:null;
    if(!entry){
      const remaining=list.length-Object.keys(solved).length;
      zone.className='cw-clue-zone waiting';zone.innerHTML=remaining>0?'<strong>Pilih satu soal untuk dibahas bersama</strong><p>Klik nomor yang belum terjawab. Jawaban benar dari tim mana pun langsung muncul di papan semua tim.</p>':'<strong>Semua jawaban sudah terbuka</strong><p>Seluruh tim telah menyelesaikan papan TTS. Menunggu permainan ditutup.</p>';return
    }
    zone.className='cw-clue-zone';
    const proposal=team.proposal,stats=reviewStats(st.groupId,team);
    let action='';
    if(!proposal){
      action=`<div class="cw-proposal-line"><input id="cwProposalInput" maxlength="16" placeholder="Usulan jawaban…" onkeydown="if(event.key==='Enter')window.DMCrossword.submitProposal()"><button class="btn primary" type="button" onclick="window.DMCrossword.submitProposal()">Ajukan</button></div><span class="cw-inline-status">Semua anggota setara dan boleh mengajukan jawaban. Tim lain juga dapat mengerjakan nomor ini, jadi diskusikan dengan efektif.</span>`;
    }else{
      const unanimousNow=
        stats.allResponded &&
        stats.responseCount===stats.responseNeed &&
        stats.responded.every(([uid])=>stats.responses?.[uid]?.agree===true);

      const stateText=unanimousNow
        ?'Semua anggota sudah Setuju. Sistem memeriksa jawaban dan akan memasukkannya ke TTS secara otomatis jika benar.'
        :stats.rejected
          ?`Semua tanggapan sudah masuk, tetapi belum semua anggota Setuju (${stats.agreeCount}/${stats.needAgree}).`
          :`Menunggu ${Math.max(0,stats.responseNeed-stats.responseCount)} anggota lain memberikan pilihan Setuju/Tidak Setuju.`;

      const meUid=user()?.uid;
      const isProposer=proposal.uid===meUid;
      const myResponse=stats.responses[meUid]||null;
      const myReason=esc(myResponse?.reason||'');

      let inlineReview='';
      if(isProposer){
        inlineReview=stats.responseNeed>0
          ?`<div class="cw-inline-review-note proposer"><b>Kamu adalah pengusul jawaban ini.</b><span>Anggota lain akan memilih Setuju atau Tidak Setuju. Kamu tidak perlu menilai usulanmu sendiri.</span></div>`
          :`<div class="cw-inline-review-note solo"><b>Tidak ada anggota lain dalam tim.</b><span>Usulan tidak memerlukan voting anggota lain dan dapat langsung dilanjutkan sesuai aturan permainan.</span></div>`;
      }else{
        inlineReview=`<div class="cw-inline-review-box">
          <div class="cw-inline-review-title">
            <div>
              <b>${myResponse?'Perbarui pilihanmu':'Pilih tanggapanmu'}</b>
              <span>Apakah kamu setuju dengan jawaban <strong>${esc(proposal.text)}</strong>?</span>
            </div>
            ${myResponse?`<span class="cw-inline-my-vote ${myResponse.agree?'agree':'disagree'}">${myResponse.agree?'SETUJU':'TIDAK SETUJU'}</span>`:''}
          </div>
          <textarea id="cwInlineReviewReason" maxlength="500" placeholder="Tuliskan alasan lebih dari 40 karakter..." oninput="window.DMCrossword.updateReviewCounter('inline')">${myReason}</textarea>
          <div class="cw-inline-review-footer">
            <span id="cwInlineReviewCounter" class="cw-review-counter">${meaningfulReasonLength(myResponse?.reason||'')}/41 karakter minimum</span>
            <div class="cw-inline-vote-buttons">
              <button type="button" class="btn cw-disagree-btn" onclick="window.DMCrossword.submitReview('no','inline')">✕ Tidak Setuju</button>
              <button type="button" class="btn cw-agree-btn" onclick="window.DMCrossword.submitReview('yes','inline')">✓ Setuju</button>
            </div>
          </div>
        </div>`;
      }

      action=`<div class="cw-proposal-current"><div><small>Usulan dari ${esc(proposal.name||'anggota')}</small><strong>${esc(proposal.text)}</strong></div><span class="cw-inline-status ${unanimousNow?'good':stats.rejected?'bad':''}">${stats.responseCount}/${stats.responseNeed} tanggapan</span></div>${inlineReview}<div class="cw-submit-row">${unanimousNow?`<span class="cw-auto-submit-badge">⚡ Memeriksa otomatis…</span><button class="btn secondary cw-auto-fallback-btn" type="button" onclick="window.DMCrossword.submitAnswer()">Proses Sekarang</button>`:''}${stats.rejected?`<button class="btn secondary" type="button" onclick="window.DMCrossword.discussAgain()">Buka Usulan Baru</button>`:''}<span class="cw-inline-status ${unanimousNow?'good':stats.rejected?'bad':''}">${esc(stateText)}</span></div>`;
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

;

/* ===== teacher-ui.js ===== */
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

;

/* ===== student-ui.js ===== */
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
      short:'Penanya',mark:'PN',tone:'orange',summary:'Menguji kelemahan argumen dan menggunakan Petunjuk Tim secara terbatas.',
      purpose:'Membuat tim memeriksa kembali keputusan sebelum jawaban dikirim.',
      steps:[
        'Dengarkan keputusan sementara kelompok.',
        'Cari bagian yang belum jelas atau masih lemah.',
        'Ajukan pertanyaan yang membuat tim berpikir ulang.',
        'Gunakan Petunjuk Tim hanya setelah ada kontribusi awal anggota lain.',
        'Bawa petunjuk kembali ke diskusi, bukan sebagai jawaban final.'
      ],
      good:'“Kalau aplikasinya sudah dihapus, apakah data yang sebelumnya mendapat izin akses otomatis aman?”',
      avoid:'Pertanyaan yang tidak berkaitan dengan kasus atau membuka petunjuk sebelum tim berdiskusi.',
      done:'Checklist pertanyaan selesai setelah Uji Argumen relevan. Petunjuk Tim hanya satu kali per tim per ronde.'
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
      out.push({id:'challenger-ai',label:'Buka Petunjuk Tim hanya bila benar-benar diperlukan'});
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
    const aiUsage=bridge().getPetunjukUsageMarker?.()||null;
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
    if(caps.challenger)out.push(['Uji Argumen & Petunjuk','Petunjuk Tim 1 kali per ronde']);
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
    if(caps.challenger)return 'Uji argumen dan Petunjuk Tim';
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

;

/* ===== login-ui.js ===== */
(function(){
  const $=id=>document.getElementById(id);
  function setMode(mode){
    const teacher=$('teacherModeBtn'),student=$('studentModeBtn');
    teacher?.classList.toggle('active',mode==='teacher');
    student?.classList.toggle('active',mode==='student');
    const card=document.querySelector('#home .login-card');
    if(card)card.dataset.mode=mode;
  }
  window.setLoginVisualMode=setMode;
  window.toggleTeacherPassword=function(){
    const input=$('teacherPassword');
    if(!input)return;
    input.type=input.type==='password'?'text':'password';
    const btn=input.parentElement?.querySelector('.password-toggle');
    if(btn)btn.textContent=input.type==='password'?'◉':'◎';
    input.focus();
  };
  document.addEventListener('DOMContentLoaded',()=>{
    document.body.classList.add('login-shell-active');
    setMode('student');
    const user=$('teacherUsername'),pass=$('teacherPassword'),name=$('studentName');
    user?.addEventListener('keydown',e=>{if(e.key==='Enter')pass?.focus()});
    pass?.addEventListener('keydown',e=>{if(e.key==='Enter')window.teacherLoginAndOpen?.()});
    name?.addEventListener('keydown',e=>{if(e.key==='Enter')window.joinRoom?.()});
  });
})();

