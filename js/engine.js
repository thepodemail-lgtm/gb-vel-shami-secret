// Canvas, helpers, game state, main loop, world drawing.
'use strict';
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
ctx.imageSmoothingEnabled=false;
const hooks={touch:false,onMute(){},onPause(){},music:null};
let state='title',tt=0,raf=0,last=0;
let S={mute:0,inv:0};try{Object.assign(S,JSON.parse(localStorage['gbvel-shami']||'{}'))}catch(_){}
function saveS(){try{localStorage['gbvel-shami']=JSON.stringify(S)}catch(_){}}

let G=null; // run state
let roomId='OW0';
let ents=[]; // active entities in current room
let beams=[];
let toast={t:0,msg:''};
let particles=[];

function clamp(v,a,b){return v<a?a:v>b?b:v}
function aabb(ax,ay,aw,ah,bx,by,bw,bh){return ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by}
function dist(ax,ay,bx,by){return Math.hypot(ax-bx,ay-by)}

function showToast(msg,dur){toast={t:dur||3.2,msg:msg}}

const MAP0={};
function snapshotMaps(){for(const id in ROOMS){MAP0[id]=ROOMS[id].map.map(r=>r.slice())}}
function restoreMaps(){for(const id in MAP0){ROOMS[id].map=MAP0[id].map(r=>r.slice())}}
snapshotMaps();

function newGame(){restoreMaps();
  G={score:0,lives:TUNE.lives,keys:0,maxHp:TUNE.hearts,hp:TUNE.hearts,inv:0,
     taken:new Set(),cleared:new Set(),doorsOpen:new Set(),visited:new Set(),
     dir:'d',shield:0,strikeT:0,beamCD:0,strikeCD:0,
     dog:{x:0,y:0,dir:'d',barkT:0,atkCD:0,leap:0,lx:0,ly:0},
     boss:null,fade:0,fadeTo:null};
  roomId='OW0';
  startInRoom('OW0',8*T,8*T);
  showToast('Year Thirteen. Exiled, Vel seeks the weapons hidden in the Shami tree.',3.8);
}

function startInRoom(id,px,py){
  roomId=id;G.visited.add(id);
  const R=ROOMS[id];
  G.x=px;G.y=py;G.vx=0;G.vy=0;G.inv=Math.max(G.inv,0.4);
  G.dog.x=px-12;G.dog.y=py;G.dog.leap=0;G.dog.atkCD=1;
  beams=[];particles=[];
  ents=[];
  if(R.ents){for(const e of R.ents){
    const tag=id+':'+e.k+':'+((e.x/T)|0)+','+((e.y/T)|0);
    if((e.k==='heart'||e.k==='key')&&G.taken.has(tag))continue;
    const o=Object.assign({},e,{tag,hp:hpFor(e.k),hurt:0,cd:0,alive:1,ai:0,vx:0,vy:0,dir:1});
    ents.push(o);
  }}
  if(R.boss&&!G.cleared.has(id))startBoss();
  if(R.win){state='win';tt=0;musicStop();sfx('win')}
  else if(R.toast&&!G.visited.has(id+'~toast')){G.visited.add(id+'~toast');showToast(R.toast,3.4)}
  // open locked doors already unlocked
  if(G.doorsOpen.has(id))unlockDoors(R);
  sfx('room');
  const th=R.theme||'over';music(th==='boss'?'boss':th==='dung'?'dung':'over',0.6);
}

function hpFor(k){const e=TUNE.enemies[k];if(e)return e.hp;return 1}

function unlockDoors(R){
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(R.map[y][x]===9)R.map[y][x]=8;
}

function tryUseKey(){
  const R=ROOMS[roomId];if(!R||!R.locked)return false;
  if(G.keys<=0)return false;
  // check if player is near locked tiles
  const tx=((G.x+8)/T)|0,ty=((G.y+8)/T)|0;
  let near=false;
  for(let y=ty-1;y<=ty+1;y++)for(let x=tx-1;x<=tx+1;x++){
    if(y>=0&&y<ROWS&&x>=0&&x<COLS&&R.map[y][x]===9)near=true;
  }
  // also if pushing against south/north locked exit
  if(R.locked==='S'&&G.y>PLAYH-28)near=true;
  if(R.locked==='N'&&G.y<12)near=true;
  if(!near)return false;
  G.keys--;G.doorsOpen.add(roomId);unlockDoors(R);sfx('door');showToast('The lock yields.',2);return true;
}

function collideWorld(x,y,w,h){
  const x0=((x)/T)|0,y0=((y)/T)|0,x1=((x+w-1)/T)|0,y1=((y+h-1)/T)|0;
  const R=ROOMS[roomId];
  for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){
    if(ty<0||ty>=ROWS||tx<0||tx>=COLS)return true;
    const t=R.map[ty][tx];
    if(t===9)return true; // locked
    if(t===8)return false; // open door - walkable
    if(t===10||t===11)return false; // stairs walkable
    if(blocks(t)||t===3)return true;
  }
  return false;
}

function moveBox(ent,dx,dy,w,h){
  if(dx){ent.x+=dx;if(collideWorld(ent.x,ent.y,w,h)){ent.x-=dx;dx=0}}
  if(dy){ent.y+=dy;if(collideWorld(ent.x,ent.y,w,h)){ent.y-=dy;dy=0}}
  return {dx,dy};
}

function screenExit(){
  const R=ROOMS[roomId];if(!R||!R.exits)return;
  const mid=8*T;
  // stairs
  const t=tileAt(roomId,G.x+8,G.y+8);
  if(t===10&&R.exits&&true){ // down to dungeon
    if(roomId==='OW4'){startInRoom('D0',8*T,8*T);return}
  }
  if(t===11){ // up
    if(roomId==='D0'){startInRoom('OW4',8*T,5*T+4);return}
  }
  // edge flips
  if(G.x<2&&R.exits.W){const n=R.exits.W;if(n==='BOSS'){if(!G.doorsOpen.has(roomId)&&ROOMS[roomId].locked){G.x=2;return}startInRoom(n,mid,mid);return}startInRoom(n,(COLS-2)*T-4,G.y);return}
  if(G.x>COLS*T-18&&R.exits.E){startInRoom(R.exits.E,4,G.y);return}
  if(G.y<2&&R.exits.N){startInRoom(R.exits.N,G.x,(ROWS-2)*T-4);return}
  if(G.y>ROWS*T-18&&R.exits.S){
    const n=R.exits.S;
    if(n==='BOSS'){
      if(!G.doorsOpen.has(roomId)){ // need key
        if(G.keys>0){tryUseKey();if(!G.doorsOpen.has(roomId)){G.y=ROWS*T-18;return}}
        else{G.y=ROWS*T-18;showToast('Locked. A key is needed.',2);return}
      }
      startInRoom('BOSS',8*T,3*T);return;
    }
    if(n)startInRoom(n,G.x,4);
  }
}

function pause(on){
  if(on&&state==='play'){state='pause';if(AU.ctx)AU.ctx.suspend();hooks.onPause(true)}
  else if(!on&&state==='pause'){state='play';if(AU.ctx)AU.ctx.resume();sfx('blip');hooks.onPause(false)}
}
function onVis(){if(document.hidden&&state==='play')pause(true)}
document.addEventListener('visibilitychange',onVis);

function pressStart(){
  audioInit();if(AU.ctx&&AU.ctx.state==='suspended')AU.ctx.resume();
  if(state==='title'){sfx('sel');state='intro';tt=0;return}
  if(state==='intro'){sfx('sel');newGame();state='play';music('over',0.8);return}
  if(state==='win'||state==='over'){if(tt>1.0){state='title';tt=0;musicStop()}}
}

function update(dt){
  tt+=dt;
  if(BUF.strike>0)BUF.strike-=dt;if(BUF.shoot>0)BUF.shoot-=dt;
  if(state==='intro'){return}
  if(state!=='play')return;
  if(toast.t>0)toast.t-=dt;
  updatePlayer(dt);
  updateDog(dt);
  updateEnemies(dt);
  updateBoss(dt);
  updateBeams(dt);
  // particles
  for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.t-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.t<=0)particles.splice(i,1)}
  screenExit();
  // clear KP one-shots at end of frame
  KP.strike=0;KP.shoot=0;KP.jump=0;
}

function updateBeams(dt){
  for(let i=beams.length-1;i>=0;i--){
    const b=beams[i];b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
    if(b.life<=0||collideWorld(b.x,b.y,6,6)){beams.splice(i,1);continue}
    // hit enemies
    for(const e of ents){if(!e.alive||e.k==='heart'||e.k==='key')continue;
      if(aabb(b.x,b.y,6,6,e.x,e.y,e.w||14,e.h||14)){hurtFoe(e,2);beams.splice(i,1);break}}
    if(G.boss&&G.boss.alive&&aabb(b.x,b.y,6,6,G.boss.x,G.boss.y,24,24)){hurtBoss(2);beams.splice(i,1)}
  }
}

function spark(x,y,n,col){
  for(let i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-0.5)*80,vy:(Math.random()-0.5)*80,t:0.3+Math.random()*0.3,col:col||P.gold});
}

function render(){
  ctx.fillStyle='#d8e0c8';ctx.fillRect(0,0,VW,VH); // light wash background
  if(state==='title'){drawTitle();return}
  if(state==='intro'){drawIntro();return}
  drawHUD();
  drawRoom();
  // entities
  for(const e of ents){if(!e.alive)continue;drawEnt(e)}
  if(G.boss&&G.boss.alive)drawBoss();
  // dog
  drawDog();
  // player
  drawPlayer();
  // beams
  for(const b of beams){ctx.drawImage(makeBeam(),b.x|0,(b.y+HUDH)|0)}
  // particles
  for(const p of particles){ctx.globalAlpha=clamp(p.t*3,0,1);ctx.fillStyle=p.col;ctx.fillRect(p.x|0,(p.y+HUDH)|0,2,2);ctx.globalAlpha=1}
  // toast
  if(toast.t>0&&toast.msg)drawToast();
  if(state==='pause'){ctx.fillStyle='rgba(20,10,20,0.45)';ctx.fillRect(0,HUDH,VW,PLAYH);drawText('PAUSED',VW/2,VH/2,1,'#f2c632')}
  if(state==='win')drawWin();
  if(state==='over')drawOver();
}

function drawRoom(){
  const R=ROOMS[roomId];if(!R)return;
  const theme=R.theme||'over';
  // light background wash per theme
  ctx.fillStyle=theme==='dung'||theme==='boss'?'#c8bca8':'#d0e0b8';
  ctx.fillRect(0,HUDH,VW,PLAYH);
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)drawTile(ctx,R.map[y][x],x,y,theme);
}

function frame(now){
  const dt=Math.min(0.05,(now-last)/1000||0.016);last=now;
  if(state!=='pause')update(dt);
  render();
  raf=requestAnimationFrame(frame);
}
