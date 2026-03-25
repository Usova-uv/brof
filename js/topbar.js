(function(){
  var btn=document.getElementById('topbarSearchToggle');
  var panel=document.getElementById('topbarSearchPanel');
  if(!btn||!panel)return;
  btn.addEventListener('click',function(e){
    e.stopPropagation();
    var willOpen=panel.hidden;
    panel.hidden=!willOpen;
    btn.setAttribute('aria-expanded',willOpen?'true':'false');
  });
  document.addEventListener('click',function(e){
    if(panel.hidden)return;
    if(btn.contains(e.target)||panel.contains(e.target))return;
    panel.hidden=true;
    btn.setAttribute('aria-expanded','false');
  });
  document.addEventListener('keydown',function(e){
    if(e.key!=='Escape'||panel.hidden)return;
    panel.hidden=true;
    btn.setAttribute('aria-expanded','false');
  });
})();
