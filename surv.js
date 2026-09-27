/* ================= SURVIVAL (Don't Starve elements) ================= */
const ITEMS={
  berry:{n:"浆果",img:"item_0",food:[9,0,1]},
  grass:{n:"干草",img:"item_1",fuel:15},
  twig:{n:"树枝",img:"item_2",fuel:10},
  flint:{n:"燧石",img:"item_3"},
  stone:{n:"石头",img:"item_4"},
  log:{n:"木头",img:"item_5",fuel:35},
  torch:{n:"火把",img:"item_6",equip:"torch"},
  axe:{n:"斧头",img:"item_7",equip:"axe"},
  skewer:{n:"烤浆果",img:"item_9",food:[25,3,4]},
  mush:{n:"蘑菇",img:"item_10",food:[12,0,-8]},
  star:{n:"折纸星星",img:"item_11"},
};
const RECIPES=[
  {id:"torch",n:"火把",need:{grass:2,twig:2},desc:"照亮黑夜，可燃烧 80 秒"},
  {id:"axe",n:"斧头",need:{twig:1,flint:1},desc:"装备后对着树按 空格 砍树"},
  {id:"campfire",n:"营火",need:{grass:3,log:2},desc:"放在脚下。夜里没有光会被黑暗吞掉",place:true,img:"item_8"},
  {id:"skewer",n:"烤浆果",need:{berry:2},desc:"需要站在营火旁",fire:true},
];
const S={hp:100,hunger:120,san:90,day:1,clock:0.12,inv:[],equip:null,torchFuel:0,darkT:0,hurtT:0,cmd:0,cmdDone:0,starsGiven:0,dead:0,praise:0,flash:0};
const DAY_LEN=260; // seconds per full day
const fires=[]; // {x,y,fuel}
const gitems=[]; // ground items {x,y,id,n,z,vz}
const floats=[]; // floating texts
function invCount(id){ return S.inv.reduce((a,s)=>a+(s&&s.id===id?s.n:0),0); }
function invAdd(id,n=1){ for(const s of S.inv){ if(s&&s.id===id&&s.n<40){ const k=Math.min(n,40-s.n); s.n+=k; n-=k; if(!n)break; } }
  while(n>0){ let i=S.inv.findIndex(s=>!s); if(i<0){ if(S.inv.length<10){ S.inv.push(null); i=S.inv.length-1; } else break; } const k=Math.min(n,40); S.inv[i]={id,n:k}; n-=k; }
  if(n>0) drop(hero.x,hero.y,id,n); buildInv(); }
function invTake(id,n){ for(let i=S.inv.length-1;i>=0&&n>0;i--){ const s=S.inv[i]; if(s&&s.id===id){ const k=Math.min(n,s.n); s.n-=k; n-=k; if(!s.n){ S.inv[i]=null; if(S.equip===id&&!invCount(id)) S.equip=null; } } } buildInv(); }
function has(need){ return Object.entries(need).every(([k,v])=>invCount(k)>=v); }
function drop(x,y,id,n=1,pop=true){ gitems.push({x:x+(Math.random()-0.5)*0.8,y:y+(Math.random()-0.5)*0.8,id,n,z:pop?0.8:0,vz:pop?4:0}); }
function floatTxt(x,y,t){ floats.push({x,y,z:2.4,t:0,text:t}); }
function nearFire(r=4.5){ return fires.some(f=>f.fuel>0&&Math.hypot(f.x-hero.x,f.y-hero.y)<r); }
function craft(rc){ if(hero.form!=="human"){ say("hero","变回人形才能用手做东西……",1.6); return; }
  if(!has(rc.need)){ say("hero","材料不够……",1.2); return; }
  if(rc.fire&&!nearFire()){ say("hero","要在营火旁边才行。",1.6); return; }
  for(const [k,v] of Object.entries(rc.need)) invTake(k,v); paperSnd(0.3,2000,0.25);
  if(rc.id==="campfire"){ fires.push({x:hero.x+Math.sin(hero.face)*1.4,y:hero.y+Math.cos(hero.face)*1.4,fuel:90,max:120,mine:1}); floatTxt(hero.x,hero.y,"+ 营火"); onCommandEvent("fire"); }
  else { invAdd(rc.id,1); floatTxt(hero.x,hero.y,"+1 "+ITEMS[rc.id].n); if(rc.id==="torch"&&!S.equip){ equip("torch"); } }
  buildCraft(); }
function equip(id){ if(S.equip===id){ S.equip=null; } else { S.equip=id; if(id==="torch"&&S.torchFuel<=0){ S.torchFuel=80; } } buildInv(); }
function useSlot(i){ const s=S.inv[i]; if(!s) return; const it=ITEMS[s.id];
  if(it.food){ if(hero.form!=="human"&&hero.form!=="dog"){ say("hero","这个样子吃不了……",1.2); return; } S.hunger=Math.min(150,S.hunger+it.food[0]); S.hp=Math.min(100,S.hp+it.food[1]); S.san=Math.max(0,Math.min(100,S.san+it.food[2])); invTake(s.id,1); floatTxt(hero.x,hero.y,"+"+it.food[0]+" 饱食"); paperSnd(0.2,900,0.2); if(s.id==="mush") say("hero","呜……头有点晕……",1.6); return; }
  if(it.equip){ if(hero.form!=="human"){ say("hero","要人形才能拿东西。",1.2); return; } equip(s.id); return; }
  // fuel into a fire
  if(it.fuel&&nearFire(3.2)){ const f=fires.filter(f=>f.fuel>0).sort((a,b)=>Math.hypot(a.x-hero.x,a.y-hero.y)-Math.hypot(b.x-hero.x,b.y-hero.y))[0]; f.fuel=Math.min(f.max,f.fuel+it.fuel); invTake(s.id,1); floatTxt(f.x,f.y,"火焰 +"+it.fuel); return; }
  say("hero",it.n+"……现在用不上。",1.2); }

/* ---- demon's commands (the "contract") ---- */
const CMDS=[
  {t:"去摘 4 个浆果献给我。",need:{berry:4},praise:"……嗯。乖。"},
  {t:"天黑之前，生一堆火。\n不是为你——我讨厌看不清书。",ev:"fire",praise:"勉强能看书了。……做得不坏。"},
  {t:"那三颗折纸星星，全部找来献给我。",need:{star:3},praise:"三颗都齐了。很好——\n你果然是条好用的狗。",big:1},
];
const CMD_POOL=[
  {t:"给我带 3 块木头来。",need:{log:3},praise:"嗯。放那儿。"},
  {t:"我要 2 块燧石。快点。",need:{flint:2},praise:"……还算快。"},
  {t:"去采 2 个蘑菇。别自己偷吃。",need:{mush:2},praise:"没偷吃？……很好。"},
  {t:"6 束干草。现在。",need:{grass:6},praise:"乖。"},
  {t:"去弄 2 块石头来。",need:{stone:2},praise:"嗯，好狗。"},
];
function curCmd(){ return S.cmd<CMDS.length?CMDS[S.cmd]:CMD_POOL[(S.cmd-CMDS.length+S.day)%CMD_POOL.length]; }
function cmdText(){ const c=curCmd(); let t=c.t.replace("\n"," "); if(c.need) t+="  （"+Object.entries(c.need).map(([k,v])=>ITEMS[k].n+" "+Math.min(invCount(k),v)+"/"+v).join("，")+"）"; return t; }
function completeCmd(){ const c=curCmd(); S.cmd++; S.cmdDone++; S.san=Math.min(100,S.san+18); S.praise=2.5;
  say("demon",c.praise,3.2); setTimeout(()=>say("hero",pick(["主人夸我了……！","是！为了主人！","嘿嘿……主人……"]),2),1800);
  if(c.big){ won=true; winT=0; }
  setTimeout(()=>{ say("demon",curCmd().t,3.6); updCmd(); },5200); updCmd(); chime(); }
function onCommandEvent(ev){ const c=curCmd(); if(c.ev===ev) completeCmd(); }
function tryDeliver(){ const c=curCmd(); if(!c.need) return false; if(!has(c.need)){ return false; } for(const [k,v] of Object.entries(c.need)) invTake(k,v); if(c.need.star) S.starsGiven=3; completeCmd(); return true; }
function updCmd(){ const el=document.getElementById("cmd"); if(el) el.innerHTML="<b>主人的命令</b><br>"+cmdText(); }

/* ---- UI: inventory + crafting ---- */
function buildInv(){ const box=document.getElementById("inv"); if(!box) return; while(S.inv.length<10) S.inv.push(null); box.innerHTML="";
  S.inv.forEach((s,i)=>{ const d=document.createElement("div"); d.className="slot"+(s&&S.equip===s.id?" eq":""); d.innerHTML=`<i>${(i+1)%10}</i>`+(s?`<img src="${ASSETS[ITEMS[s.id].img]}"><span>${s.n>1?s.n:""}</span>`:"");
    if(s) d.title=ITEMS[s.id].n+(ITEMS[s.id].food?"（点击吃掉）":ITEMS[s.id].equip?"（点击装备）":ITEMS[s.id].fuel?"（营火旁点击添柴）":"");
    d.onclick=()=>{ ac(); useSlot(i); }; box.appendChild(d); });
  updCmd(); buildCraft(); }
function buildCraft(){ const box=document.getElementById("craft"); if(!box) return; box.innerHTML="<b>制作</b>";
  for(const rc of RECIPES){ const ok=has(rc.need)&&(!rc.fire||nearFire()); const d=document.createElement("div"); d.className="rc"+(ok?" ok":"");
    d.innerHTML=`<img src="${ASSETS[rc.img||ITEMS[rc.id].img]}"><div><div class="rn">${rc.n}</div><div class="rq">${Object.entries(rc.need).map(([k,v])=>ITEMS[k].n+" "+invCount(k)+"/"+v).join(" · ")}</div><div class="rd">${rc.desc}</div></div>`;
    d.onclick=()=>{ ac(); craft(rc); }; box.appendChild(d); } }

/* ---- world resources ---- */
function setupResources(){
  for(const e of ents){ if(e.kind==="bush"){ e.res="berry"; e.ready=1; } else if(e.kind==="grass"){ e.res="grass"; e.ready=1; } else if(e.kind==="mush"){ e.res="mush"; e.ready=1; } else if(e.kind==="pine"||e.kind==="round"){ e.chop=3; } }
  const r=rng(321); for(let i=0;i<70;i++){ const x=(r()*2-1)*WORLD*0.9, y=(r()*2-1)*WORLD*0.9; if(y>RIVER.y0-1&&y<RIVER.y1+1) continue; gitems.push({x,y,id:r()<0.65?"twig":"flint",n:1,z:0,vz:0}); }
  // a few near the start so the first night is survivable
  [["twig",2,-1],["twig",-2,1],["flint",1.5,2.5],["twig",3,-3],["grass",-3,-2]].forEach(([id,x,y])=>gitems.push({x,y,id,n:1,z:0,vz:0}));
}
function nearestInteract(){ let best=null,bd=2.4;
  for(const g of gitems){ const d=Math.hypot(g.x-hero.x,g.y-hero.y); if(d<bd){bd=d;best={k:"item",o:g};} }
  for(const e of ents){ if(e.gone) continue; const d=Math.hypot(e.x-hero.x,e.y-hero.y)-(e.rad||0);
    if(e.res&&e.ready&&d<bd){ bd=d; best={k:"res",o:e}; }
    else if(e.chop&&S.equip==="axe"&&d<bd+0.4){ bd=d; best={k:"chop",o:e}; } }
  return best; }
function gather(it){ const o=it.o;
  if(it.k==="item"){ gitems.splice(gitems.indexOf(o),1); invAdd(o.id,o.n); floatTxt(o.x,o.y,"+"+o.n+" "+ITEMS[o.id].n); paperSnd(0.15,3000,0.15); return; }
  if(it.k==="res"){ o.ready=0; o.regrow=o.res==="mush"?120:o.res==="berry"?90:60; const n=o.res==="berry"?2:1; invAdd(o.res,n); floatTxt(o.x,o.y,"+"+n+" "+ITEMS[o.res].n); paperSnd(0.2,2400,0.2); if(o.res==="mush") o.gone=true, o.respawn=150; return; }
  if(it.k==="chop"){ o.chop--; o.shake=0.3; thud(); shards(o.x,o.y,1.2,5,3,"#e8dfcc");
    if(o.chop<=0){ o.gone=true; const st=addProp("stump",o.x,o.y,1); st.alpha=1; drop(o.x,o.y,"log",1); drop(o.x,o.y,"log",1); if(Math.random()<0.5) drop(o.x,o.y,"twig",1); say("hero","倒啦！",1); } }
}

/* ---- per-frame survival tick ---- */
function darkness(){ const c=S.clock; if(c<0.55) return 0; if(c<0.7) return (c-0.55)/0.15*0.55; if(c<0.93) return 0.55+Math.min(1,(c-0.7)/0.05)*0.4; return 0.95*(1-(c-0.93)/0.07); }
function phaseName(){ const c=S.clock; return c<0.55?"白天":c<0.7?"黄昏":c<0.93?"夜晚":"黎明"; }
function lightAt(x,y){ let best=0; for(const f of fires){ if(f.fuel<=0) continue; const r=fireR(f); const d=Math.hypot(f.x-x,f.y-y); best=Math.max(best,1-d/r); }
  if(S.equip==="torch"&&S.torchFuel>0&&hero.form==="human"){ best=Math.max(best,1-Math.hypot(hero.x-x,hero.y-y)/5); } return best; }
function fireR(f){ return 2.5+Math.min(5.5,f.fuel/16); }
let lastPhase="";
function survivalStep(dt){
  S.clock+=dt/DAY_LEN; if(S.clock>=1){ S.clock-=1; S.day++; say("hero","第 "+S.day+" 天……天亮了！",2); }
  const ph=phaseName(); if(ph!==lastPhase){ if(ph==="黄昏"){ say("demon",fires.some(f=>f.fuel>0)?"……天要黑了。":"天要黑了。\n没火的话，你会被黑暗里的东西吃掉。\n……与我无关。",3.6); } if(ph==="夜晚"&&!fires.some(f=>f.fuel>0)&&!(S.equip==="torch")) say("hero","好黑……主人……？",2); lastPhase=ph; }
  // hunger & health
  S.hunger=Math.max(0,S.hunger-dt*0.42); if(S.hunger<=0){ S.hp-=dt*1.2; if(Math.random()<dt*0.2) say("hero","肚子……好饿……",1.4); }
  // sanity: drains at dusk/night away from light; restored slowly near fire
  const dk=darkness(), lit=lightAt(hero.x,hero.y);
  if(dk>0.3&&lit<0.1) S.san-=dt*0.55; else if(lit>0.2&&dk>0.3) S.san+=dt*0.15;
  if(Math.hypot(demon.x-hero.x,demon.y-hero.y)<3.5&&dk<0.3) S.san+=dt*0.05; // being near her master calms her (the contract)
  S.san=Math.max(0,Math.min(100,S.san));
  if(S.san<30&&Math.random()<dt*0.05){ say("hero",pick(["我……以前是谁……？","扫帚……我的扫帚是做什么用的……","……主人？"]),2); setTimeout(()=>say("demon",pick(["别想多余的事。","你是我的。仅此而已。","……看着我。"]),2.4),1600); setTimeout(()=>{S.san=Math.min(100,S.san+6);},2000); }
  if(S.san<15) S.hp-=dt*0.4;
  // darkness monster
  if(dk>0.85&&lit<0.05){ S.darkT+=dt; if(S.darkT>2.2){ S.hurtT-=dt; if(S.hurtT<=0){ S.hurtT=2; S.hp-=16; S.flash=0.6; shake=0.3; thud(); say("hero",pick(["呀啊！有东西在咬我！","好痛！火……要火……！"]),1.6); } } }
  else { S.darkT=0; S.hurtT=0.4; }
  // torch
  if(S.equip==="torch"&&hero.form==="human"){ S.torchFuel-=dt; if(S.torchFuel<=0){ invTake("torch",1); S.equip=null; S.torchFuel=0; say("hero","火把烧完了……",1.4); if(invCount("torch")) { S.torchFuel=80; S.equip="torch"; } buildInv(); } }
  // fires
  for(const f of fires){ if(f.fuel>0){ f.fuel-=dt; if(Math.random()<dt*6) parts.push({x:f.x+(Math.random()-0.5)*0.4,y:f.y+(Math.random()-0.5)*0.4,z:0.6,vx:(Math.random()-0.5)*0.4,vy:(Math.random()-0.5)*0.4,vz:2+Math.random()*1.5,life:1,rot:0,vr:0,sz:0.07,kind:"ember"}); } }
  // regrowth
  for(const e of ents){ if(e.regrow>0){ e.regrow-=dt; if(e.regrow<=0){ e.ready=1; } } if(e.respawn>0){ e.respawn-=dt; if(e.respawn<=0){ e.gone=false; e.ready=1; } } if(e.shake>0) e.shake-=dt; }
  // ground items physics
  for(const g of gitems){ if(g.vz||g.z>0){ g.z+=g.vz*dt; g.vz-=14*dt; if(g.z<=0){ g.z=0; g.vz=0; } } }
  for(let i=floats.length-1;i>=0;i--){ floats[i].t+=dt; if(floats[i].t>1.4) floats.splice(i,1); }
  if(S.praise>0) S.praise-=dt; if(S.flash>0) S.flash-=dt;
  // death
  if(S.hp<=0&&!S.dead){ S.dead=1; S.hp=0; say("hero","主……人……",2); setTimeout(()=>{ say("demon","……没用的东西。起来。\n我还没允许你倒下。",3.4); S.hp=50; S.hunger=Math.max(S.hunger,60); S.san=Math.max(S.san,40); hero.x=demon.x+1.2; hero.y=demon.y; S.dead=0; // lose half of each stack
      S.inv=S.inv.map(s=>s&&s.id!=="star"?(s.n>1?{id:s.id,n:Math.ceil(s.n/2)}:null):s); buildInv(); if(darkness()>0.5&&!fires.some(f=>f.fuel>0)) fires.push({x:demon.x-1,y:demon.y+1,fuel:60,max:120}); },2200); }
  S._t=(S._t||0)+dt; if(S._t>0.5){ S._t=0; buildCraftLite(); }
}
let _craftKey=""; function buildCraftLite(){ const k=RECIPES.map(rc=>has(rc.need)&&(!rc.fire||nearFire())?1:0).join("")+S.inv.map(s=>s?s.id+s.n:"_").join(); if(k!==_craftKey){ _craftKey=k; buildCraft(); updCmd(); } }

/* ---- drawing: ground items, fires, darkness, HUD ---- */
function drawGItem(g){ const p=proj(g.x,g.y,g.z); if(!p) return; const p0=proj(g.x,g.y,0); shadow(p0,0.25); sprite(IMG[ITEMS[g.id].img],p,0.55,false,1,1,1,Math.sin(g.x*3)*0.3); }
function drawFire(f){ const p=proj(f.x,f.y,0); if(!p) return; const lit=f.fuel>0; sprite(IMG.item_8,p,1.1,false,lit?1:0.7,1,lit?1+Math.sin(time*9)*0.04:0.5);
  if(lit){ const fl=Math.min(1,f.fuel/40); cx.save(); cx.globalCompositeOperation="lighter"; const g=cx.createRadialGradient(p.x,p.y-p.s*0.5,0,p.x,p.y-p.s*0.5,p.s*1.4*(0.7+fl*0.5)); g.addColorStop(0,"rgba(255,230,170,0.35)"); g.addColorStop(1,"rgba(255,200,120,0)"); cx.fillStyle=g; cx.beginPath(); cx.arc(p.x,p.y-p.s*0.5,p.s*1.6,0,6.3); cx.fill(); cx.restore(); } }
let darkC=null;
function drawDarkness(){ const dk=darkness(); if(dk<=0.01) return; if(!darkC){ darkC=document.createElement("canvas"); } if(darkC.width!==Math.ceil(W/2)){ darkC.width=Math.ceil(W/2); darkC.height=Math.ceil(H/2); }
  const g=darkC.getContext("2d"); g.setTransform(0.5,0,0,0.5,0,0); g.globalCompositeOperation="source-over"; g.clearRect(0,0,W,H); g.fillStyle=`rgba(14,12,18,${dk})`; g.fillRect(0,0,W,H);
  g.globalCompositeOperation="destination-out";
  const hole=(x,y,r,a)=>{ const p=proj(x,y,0.3); if(!p) return; const R=r*p.s; g.save(); g.translate(p.x,p.y-R*0.1); g.scale(1,0.62); const gr=g.createRadialGradient(0,0,R*0.15,0,0,R); gr.addColorStop(0,`rgba(0,0,0,${a})`); gr.addColorStop(0.6,`rgba(0,0,0,${a*0.75})`); gr.addColorStop(1,"rgba(0,0,0,0)"); g.fillStyle=gr; g.beginPath(); g.arc(0,0,R,0,6.3); g.fill(); g.restore(); };
  for(const f of fires) if(f.fuel>0) hole(f.x,f.y,fireR(f)*(1+Math.sin(time*11+f.x)*0.03),1);
  if(S.equip==="torch"&&S.torchFuel>0&&hero.form==="human") hole(hero.x,hero.y,5*(1+Math.sin(time*13)*0.03),1);
  hole(hero.x,hero.y,1.6,0.35); // she can always see herself a little
  cx.drawImage(darkC,0,0,W,H);
  // the demon's eyes glow in the dark
  const pd=proj(demon.x,demon.y,SHEETS[DEMON].h[PROP_MODE]*0.78); if(pd&&dk>0.5&&lightAt(demon.x,demon.y)<0.3){ cx.fillStyle=`rgba(255,240,230,${(dk-0.5)*1.6})`; for(const o of [-1,1]){ cx.beginPath(); cx.ellipse(pd.x+o*pd.s*0.12,pd.y,pd.s*0.05,pd.s*0.02,0,0,6.3); cx.fill(); } }
  // shadow things circling when she is in the dark
  if(S.darkT>0.5){ const hp=proj(hero.x,hero.y,1); if(hp){ cx.strokeStyle=`rgba(0,0,0,${Math.min(0.8,S.darkT/3)})`; cx.lineWidth=2; for(let i=0;i<5;i++){ const a=time*1.3+i*1.26, r=hp.s*(1.6+Math.sin(time*2+i)*0.3); cx.beginPath(); for(let k=0;k<12;k++){ const aa=a+k*0.05; const x=hp.x+Math.cos(aa)*r+Math.sin(k*3+time*9)*4, y=hp.y+Math.sin(aa)*r*0.5+Math.cos(k*2+time*7)*4; k?cx.lineTo(x,y):cx.moveTo(x,y); } cx.stroke(); } } }
}
function drawFloats(){ cx.font="bold 15px "+getComputedStyle(document.body).fontFamily; cx.textAlign="center"; for(const f of floats){ const p=proj(f.x,f.y,f.z+f.t*1.2); if(!p) continue; cx.globalAlpha=Math.max(0,1-f.t/1.4); cx.fillStyle="#2a2622"; cx.fillText(f.text,p.x,p.y); } cx.globalAlpha=1; }
function meter(x,y,r,v,max,label,ico){ const f=v/max; cx.save(); cx.lineWidth=2; cx.strokeStyle="#2a2622"; cx.fillStyle="#f7f3ea"; cx.beginPath(); cx.arc(x,y,r,0,6.3); cx.fill();
  cx.save(); cx.beginPath(); cx.arc(x,y,r-3,0,6.3); cx.clip(); const top=y+r-(2*r)*f; cx.fillStyle=f<0.25?"#6b5a52":"#8a8378"; cx.fillRect(x-r,top,2*r,2*r);
  cx.strokeStyle="rgba(247,243,234,0.5)"; cx.lineWidth=1; for(let i=-r;i<r;i+=5){ cx.beginPath(); cx.moveTo(x+i,top); cx.lineTo(x+i+r,top+r*2); cx.stroke(); } cx.restore();
  cx.beginPath(); cx.arc(x,y,r,0,6.3); cx.stroke(); if(f<0.25&&Math.sin(time*8)>0){ cx.strokeStyle="#2a2622"; cx.lineWidth=3; cx.beginPath(); cx.arc(x,y,r+3,0,6.3); cx.stroke(); }
  cx.fillStyle=f>0.5?"#fff":"#2a2622"; cx.font="bold 16px "+getComputedStyle(document.body).fontFamily; cx.textAlign="center"; cx.textBaseline="middle"; cx.fillText(Math.round(v),x,y+1);
  cx.fillStyle="#2a2622"; cx.font="12px "+getComputedStyle(document.body).fontFamily; cx.fillText(label,x,y+r+11); cx.restore(); }
function drawHUD(){ const fam=getComputedStyle(document.body).fontFamily;
  meter(36,40,24,S.hp,100,"生命"); meter(94,40,24,S.hunger,150,"饱食"); meter(152,40,24,S.san,100,"理智");
  // clock dial
  const x=W-58,y=46,r=32; cx.save(); cx.lineWidth=2; cx.strokeStyle="#2a2622";
  const seg=(a0,a1,col)=>{ cx.fillStyle=col; cx.beginPath(); cx.moveTo(x,y); cx.arc(x,y,r,-Math.PI/2+a0*6.283,-Math.PI/2+a1*6.283); cx.closePath(); cx.fill(); };
  seg(0,0.55,"#f3eee2"); seg(0.55,0.7,"#b8ae9c"); seg(0.7,0.93,"#3a3530"); seg(0.93,1,"#b8ae9c"); cx.beginPath(); cx.arc(x,y,r,0,6.3); cx.stroke();
  const a=-Math.PI/2+S.clock*6.283; cx.lineWidth=3; cx.beginPath(); cx.moveTo(x,y); cx.lineTo(x+Math.cos(a)*(r-4),y+Math.sin(a)*(r-4)); cx.stroke();
  cx.fillStyle="#2a2622"; cx.font="bold 15px "+fam; cx.textAlign="center"; cx.fillText("第 "+S.day+" 天",x,y+r+16); cx.font="12px "+fam; cx.fillText(phaseName(),x,y+r+31); cx.restore();
  if(S.flash>0){ cx.fillStyle=`rgba(20,10,10,${S.flash*0.5})`; cx.fillRect(0,0,W,H); }
  if(S.san<30){ const k=(30-S.san)/30; const vg=cx.createRadialGradient(W/2,H/2,Math.min(W,H)*0.25,W/2,H/2,Math.max(W,H)*0.7); vg.addColorStop(0,"rgba(0,0,0,0)"); vg.addColorStop(1,`rgba(10,8,12,${0.55*k})`); cx.fillStyle=vg; cx.fillRect(0,0,W,H); }
  if(S.dead){ cx.fillStyle="rgba(10,8,8,0.55)"; cx.fillRect(0,0,W,H); cx.fillStyle="#f3efe6"; cx.font="bold 40px "+fam; cx.textAlign="center"; cx.fillText("她倒下了……",W/2,H*0.42); }
}
