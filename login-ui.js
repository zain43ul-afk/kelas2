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
