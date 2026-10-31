// Enemy AI and damage for overworld/dungeon foes.
'use strict';
function hurtFoe(e,dmg){
  if(!e.alive||e.hurt>0)return;e.hp-=dmg;e.hurt=0.25;sfx('ehit');spark(e.x+6,e.y+6,5,P.gold);
  if(e.hp<=0){e.alive=0;sfx('edie');G.score+=100;spark(e.x+6,e.y+6,10,P.heart);
    // chance to drop heart if low
    if(G.hp<=2&&Math.random()<0.35){ents.push({k:'heart',x:e.x,y:e.y,tag:roomId+':drop:'+e.x,alive:1,hp:1,w:10,h:10})}}
}

function updateEnemies(dt){
  for(const e of ents){
    if(!e.alive||e.k==='heart'||e.k==='key')continue;
    if(e.hurt>0)e.hurt-=dt;
    e.ai=(e.ai||0)+dt;e.cd=(e.cd||0)-dt;
    const cx=e.x+(e.w||14)/2,cy=e.y+(e.h||14)/2;
    const px=G.x+7,py=G.y+7;
    const dx=px-cx,dy=py-cy,D=Math.hypot(dx,dy)||1;

    if(e.k==='boar'){
      e.w=16;e.h=12;
      const tun=TUNE.enemies.boar;
      if(e.charge>0){e.charge-=dt;moveBox(e,e.vx*dt,e.vy*dt,e.w,e.h);
        if(e.charge<=0){e.vx=0;e.vy=0;e.cd=1.2}}
      else if(D<tun.aggro&&e.cd<=0){ // telegraph then charge
        if(!e.tele){e.tele=0.45;spark(e.x+8,e.y,3,P.heart)} // red warn
        else{e.tele-=dt;if(e.tele<=0){e.tele=0;e.charge=0.55;e.vx=dx/D*tun.chargeSpeed;e.vy=dy/D*tun.chargeSpeed;sfx('thud')}}}
      else{ // wander
        if(e.ai>1.2){e.ai=0;const a=Math.random()*Math.PI*2;e.vx=Math.cos(a)*tun.walkSpeed;e.vy=Math.sin(a)*tun.walkSpeed}
        moveBox(e,e.vx*dt,e.vy*dt,e.w,e.h)}
    }
    else if(e.k==='cobra'){
      e.w=12;e.h=14;const tun=TUNE.enemies.cobra;
      if(e.ai>2){e.ai=0;const a=Math.random()*Math.PI*2;e.vx=Math.cos(a)*tun.walkSpeed;e.vy=Math.sin(a)*tun.walkSpeed}
      moveBox(e,e.vx*dt,e.vy*dt,e.w,e.h);
      if(D<100&&e.cd<=0){e.cd=tun.spitCD;sfx('spit');
        ents.push({k:'spit',x:e.x+4,y:e.y+4,vx:dx/D*tun.spitSpeed,vy:dy/D*tun.spitSpeed,alive:1,life:2,w:6,h:6,hp:1})}
    }
    else if(e.k==='spit'){
      e.life-=dt;e.x+=e.vx*dt;e.y+=e.vy*dt;
      if(e.life<=0||collideWorld(e.x,e.y,6,6)){e.alive=0;continue}
      // shield can block
      if(aabb(e.x,e.y,6,6,G.x,G.y,14,14)){hurtVel(1,e.x,e.y);e.alive=0}
      continue;
    }
    else if(e.k==='imp'){
      e.w=12;e.h=12;const tun=TUNE.enemies.imp;
      if(e.ai>0.8){e.ai=0;e.vx=(Math.random()-0.5)*tun.hopSpeed*2;e.vy=(Math.random()-0.5)*tun.hopSpeed*2}
      moveBox(e,e.vx*dt,e.vy*dt,e.w,e.h);e.vx*=0.96;e.vy*=0.96;
    }
    else if(e.k==='vetala'){
      e.w=12;e.h=14;const tun=TUNE.enemies.vetala;
      // drift toward player slowly
      e.vx=dx/D*tun.walkSpeed;e.vy=dy/D*tun.walkSpeed;
      moveBox(e,e.vx*dt,e.vy*dt,e.w,e.h);
    }

    // contact damage
    if(e.k!=='spit'&&aabb(e.x,e.y,e.w||14,e.h||14,G.x,G.y,14,14))hurtVel(1,e.x,e.y);
  }
}

function drawEnt(e){
  const fr=(((performance.now()/160)|0)%2);
  let img=null;
  if(e.k==='boar')img=boarSprite(fr);
  else if(e.k==='cobra')img=cobraSprite(fr);
  else if(e.k==='imp')img=impSprite(fr);
  else if(e.k==='vetala')img=vetalaSprite(fr);
  else if(e.k==='heart'){ctx.drawImage(makeHeart(1),e.x|0,(e.y+HUDH)|0);return}
  else if(e.k==='key'){ctx.drawImage(makeKey(),e.x|0,(e.y+HUDH)|0);return}
  else if(e.k==='spit'){ctx.fillStyle='#70d050';ctx.beginPath();ctx.arc(e.x+3,e.y+HUDH+3,3,0,6.28);ctx.fill();return}
  if(img){if(e.hurt>0)ctx.globalAlpha=0.5;ctx.drawImage(img,e.x|0,(e.y+HUDH)|0);ctx.globalAlpha=1}
}
function boarSprite(f){return makeBoar(f)}
function cobraSprite(f){return makeCobra(f)}
function impSprite(f){return makeImp(f)}
function vetalaSprite(f){return makeVetala(f)}
