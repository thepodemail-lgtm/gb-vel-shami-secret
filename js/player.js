// Vel movement, sword, shield, beam (full hearts only), hurt, dog AI.
'use strict';
function updatePlayer(dt){
  if(!G)return;
  if(G.inv>0)G.inv-=dt;
  if(G.strikeCD>0)G.strikeCD-=dt;
  if(G.beamCD>0)G.beamCD-=dt;
  if(G.strikeT>0)G.strikeT-=dt;

  // shield: hold X/K
  const wantShield=!!K.shoot;
  if(wantShield&&!G.shield)sfx('shield');
  G.shield=wantShield?1:0;

  // movement (no move while striking briefly, can move while shielding slowly)
  let ix=(K.r?1:0)-(K.l?1:0),iy=(K.d?1:0)-(K.u?1:0);
  if(ix&&iy){ix*=0.707;iy*=0.707}
  if(G.strikeT>0.05){ix=0;iy=0}
  const spd=TUNE.run*(G.shield?0.55:1);
  const tx=ix*spd,ty=iy*spd;
  G.vx+=(tx-G.vx)*Math.min(1,TUNE.acc*dt/Math.max(1,Math.abs(G.vx)+40));
  G.vy+=(ty-G.vy)*Math.min(1,TUNE.acc*dt/Math.max(1,Math.abs(G.vy)+40));
  if(!ix&&!iy){G.vx*=Math.pow(0.02,dt);G.vy*=Math.pow(0.02,dt)}
  if(ix||iy){if(Math.abs(ix)>Math.abs(iy))G.dir=ix>0?'r':'l';else G.dir=iy>0?'d':'u'}

  moveBox(G,G.vx*dt,G.vy*dt,14,14);
  G.x=clamp(G.x,0,COLS*T-14);G.y=clamp(G.y,0,ROWS*T-14);

  // sword
  if((KP.strike||BUF.strike>0)&&G.strikeCD<=0&&!G.shield){
    BUF.strike=0;G.strikeCD=TUNE.strikeCD;G.strikeT=TUNE.strikeDur;sfx('sword');
    doStrike();
    // beam at full health
    if(G.hp>=G.maxHp&&G.beamCD<=0){
      G.beamCD=TUNE.beamCD;sfx('beam');
      const sp=TUNE.beamSpeed;let vx=0,vy=0;
      if(G.dir==='r')vx=sp;else if(G.dir==='l')vx=-sp;else if(G.dir==='u')vy=-sp;else vy=sp;
      beams.push({x:G.x+4,y:G.y+4,vx,vy,life:0.9});
    }
  }

  // try key on locked door when pressing toward it or strike near it
  if(K.d||K.u||KP.strike)tryUseKey();

  // pickups
  for(const e of ents){
    if(!e.alive)continue;
    if(e.k==='heart'||e.k==='key'){
      if(aabb(G.x,G.y,14,14,e.x,e.y,12,12)){
        e.alive=0;G.taken.add(e.tag);
        if(e.k==='heart'){G.hp=Math.min(G.maxHp,G.hp+TUNE.heartHeal);sfx('heart');spark(e.x,e.y,6,P.heart)}
        else{G.keys++;sfx('key');spark(e.x,e.y,8,P.keyC);showToast('Got a key!',2)}
      }
    }
  }
}

function doStrike(){
  const r=TUNE.strikeReach,w=TUNE.strikeW,h=TUNE.strikeH;
  let sx=G.x+7,sy=G.y+7,bx=sx,by=sy,bw=w,bh=h;
  if(G.dir==='r'){bx=sx;by=sy-h/2;bw=r;bh=h}
  else if(G.dir==='l'){bx=sx-r;by=sy-h/2;bw=r;bh=h}
  else if(G.dir==='u'){bx=sx-w/2;by=sy-r;bw=w;bh=r}
  else{bx=sx-w/2;by=sy;bw=w;bh=r}
  for(const e of ents){
    if(!e.alive||e.k==='heart'||e.k==='key')continue;
    const ew=e.w||14,eh=e.h||14;
    if(aabb(bx,by,bw,bh,e.x,e.y,ew,eh))hurtFoe(e,2);
  }
  // cut bushes
  const R=ROOMS[roomId];
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(R.map[y][x]===3){
    const tx=x*T,ty=y*T;if(aabb(bx,by,bw,bh,tx,ty,T,T)){R.map[y][x]=0;spark(tx+8,ty+8,4,P.bush);sfx('thud')}
  }
  if(G.boss&&G.boss.alive&&aabb(bx,by,bw,bh,G.boss.x,G.boss.y,24,24))hurtBoss(2);
}

function hurtVel(n,fromX,fromY){
  if(G.inv>0||S.inv)return;
  // shield blocks projectiles / hits from the front
  if(G.shield&&fromX!=null){
    const dx=fromX-(G.x+7),dy=fromY-(G.y+7);
    let front=false;
    if(G.dir==='r'&&dx>0&&Math.abs(dx)>=Math.abs(dy))front=true;
    if(G.dir==='l'&&dx<0&&Math.abs(dx)>=Math.abs(dy))front=true;
    if(G.dir==='d'&&dy>0&&Math.abs(dy)>=Math.abs(dx))front=true;
    if(G.dir==='u'&&dy<0&&Math.abs(dy)>=Math.abs(dx))front=true;
    if(front){sfx('block');spark(G.x+7,G.y+7,4,P.shld);return}
  }
  G.hp-=n||TUNE.heartsLostPerHit;G.inv=TUNE.inv;sfx('hurt');spark(G.x+7,G.y+7,8,P.heart);
  // knockback
  if(fromX!=null){const dx=G.x-fromX,dy=G.y-fromY,l=Math.hypot(dx,dy)||1;moveBox(G,(dx/l)*10,(dy/l)*10,14,14)}
  if(G.hp<=0){G.hp=0;G.lives--;if(G.lives<=0){state='over';tt=0;musicStop();sfx('lose')}
    else{showToast('Vel rises again. Patience.',2.5);G.hp=G.maxHp;G.inv=2;
      // respawn in current room center-ish
      G.x=8*T;G.y=5*T;if(G.boss){G.boss.hp=Math.max(G.boss.hp,8)}}}
}

function updateDog(dt){
  const d=G.dog,td=TUNE.dog;
  if(d.atkCD>0)d.atkCD-=dt;
  if(d.barkT>0)d.barkT-=dt;
  // find nearest enemy
  let near=null,nd=1e9;
  for(const e of ents){if(!e.alive||e.k==='heart'||e.k==='key')continue;const dd=dist(d.x,d.y,e.x,e.y);if(dd<nd){nd=dd;near=e}}
  if(G.boss&&G.boss.alive){const dd=dist(d.x,d.y,G.boss.x,G.boss.y);if(dd<nd){nd=dd;near=G.boss}}

  if(d.leap>0){
    d.leap-=dt;d.x+=d.lx*dt;d.y+=d.ly*dt;
    if(near&&aabb(d.x,d.y,12,10,near.x,near.y,near.w||14,near.h||14)){
      if(near===G.boss)hurtBoss(1);else hurtFoe(near,1);
      d.leap=0;spark(d.x,d.y,5,P.wht);
    }
    return;
  }
  // follow Vel
  const tx=G.x-(G.dir==='r'?td.followDist:G.dir==='l'?-td.followDist:0);
  const ty=G.y-(G.dir==='d'?td.followDist:G.dir==='u'?-td.followDist:0);
  const dx=tx-d.x,dy=ty-d.y,L=Math.hypot(dx,dy);
  if(L>8){const sp=Math.min(TUNE.run*1.05,L*3);d.x+=dx/L*sp*dt;d.y+=dy/L*sp*dt;
    if(Math.abs(dx)>Math.abs(dy))d.dir=dx>0?'r':'l';else d.dir=dy>0?'d':'u'}
  // bark
  if(near&&nd<90&&d.barkT<=0){sfx('bark');d.barkT=td.barkGap+Math.random()*2}
  else if(!near&&Math.random()<td.idleBarkRate*dt&&d.barkT<=0){sfx('bark');d.barkT=td.barkGap}
  // attack
  if(near&&nd<td.attackRange&&d.atkCD<=0&&Math.random()<td.attackRate*dt){
    d.atkCD=td.attackCooldown+Math.random()*2;d.leap=0.35;
    const ang=Math.atan2(near.y-d.y,near.x-d.x);d.lx=Math.cos(ang)*td.leapSpeed;d.ly=Math.sin(ang)*td.leapSpeed;sfx('bark');
  }
}

function drawPlayer(){
  if(!G)return;
  if(G.inv>0&&((G.inv*20)|0)%2===0)return;
  const moving=Math.hypot(G.vx,G.vy)>12;const fr=moving?(((performance.now()/120)|0)%2):0;
  const img=heroSprite(G.dir,fr,!!G.shield,G.strikeT>0);
  ctx.drawImage(img,(G.x)|0,(G.y+HUDH-2)|0);
}
function drawDog(){
  if(!G)return;const d=G.dog;const fr=(((performance.now()/140)|0)%2);
  const img=dogSprite(d.dir,fr,d.barkT>2.5);ctx.drawImage(img,d.x|0,(d.y+HUDH)|0);
}
// overridable by art.js
function heroSprite(dir,fr,sh,st){return makeVel(dir,fr,sh,st)}
function dogSprite(dir,fr,bk){return makeDog(dir,fr,bk)}
