// Vaka the rakshasa: final boss of the short adventure.
'use strict';
function startBoss(){
  G.boss={x:8*T-6,y:4*T,hp:TUNE.bossHP,max:TUNE.bossHP,alive:1,hurt:0,cd:1.5,phase:0,vx:0,vy:0,charge:0,tele:0,frame:0};
  music('boss',0.5);sfx('roar');
  showToast('Vaka, armored rakshasa of the temple, blocks the way!',3.2);
}
function hurtBoss(dmg){
  const b=G.boss;if(!b||!b.alive||b.hurt>0)return;
  b.hp-=dmg;b.hurt=0.3;sfx('bhit');spark(b.x+12,b.y+12,8,P.gold);G.score+=50;
  if(b.hp<=b.max/2&&b.phase===0){b.phase=1;showToast('Vaka snarls - the temple shakes!',2.5);sfx('roar')}
  if(b.hp<=0){b.alive=0;sfx('bdie');G.score+=1000;G.cleared.add(roomId);spark(b.x+12,b.y+12,24,P.heart);
    showToast('Vaka falls. The Shami tree waits.',3);
    setTimeout(()=>{if(state==='play')startInRoom('WIN',8*T,8*T)},2200);
  }
}
function updateBoss(dt){
  const b=G.boss;if(!b||!b.alive)return;
  if(b.hurt>0)b.hurt-=dt;b.cd-=dt;b.frame+=dt;
  const px=G.x+7,py=G.y+7,cx=b.x+12,cy=b.y+12;
  const dx=px-cx,dy=py-cy,D=Math.hypot(dx,dy)||1;

  if(b.charge>0){
    b.charge-=dt;moveBox(b,b.vx*dt,b.vy*dt,24,24);
    if(aabb(b.x,b.y,24,24,G.x,G.y,14,14))hurtVel(1,b.x,b.y);
    if(b.charge<=0)b.cd=b.phase?0.7:1.1;
    return;
  }
  // stalk
  const sp=TUNE.bossWalk*(b.phase?1.25:1);
  b.vx=dx/D*sp;b.vy=dy/D*sp;moveBox(b,b.vx*dt,b.vy*dt,24,24);
  if(aabb(b.x+4,b.y+4,16,16,G.x,G.y,14,14))hurtVel(1,b.x,b.y);

  if(b.cd<=0){
    // choose attack
    if(Math.random()<0.55){
      // charge (telegraph)
      if(!b.tele){b.tele=0.5;spark(b.x+12,b.y,5,P.heart);sfx('thud')}
      else{b.tele-=dt;if(b.tele<=0){b.tele=0;b.charge=0.6;const s=TUNE.bossCharge*(b.phase?1.2:1);b.vx=dx/D*s;b.vy=dy/D*s}}
    }else{
      // throw rocks
      b.cd=b.phase?1.0:1.6;sfx('spit');
      const n=b.phase?3:1;
      for(let i=0;i<n;i++){
        const ang=Math.atan2(dy,dx)+(i-(n-1)/2)*0.35;
        ents.push({k:'spit',x:b.x+10,y:b.y+10,vx:Math.cos(ang)*TUNE.bossRockSpeed,vy:Math.sin(ang)*TUNE.bossRockSpeed,alive:1,life:2.5,w:8,h:8,hp:1,rock:1});
      }
    }
  }else if(b.tele>0){b.tele-=dt;if(b.tele<=0){b.tele=0;b.charge=0.6;const s=TUNE.bossCharge;b.vx=dx/D*s;b.vy=dy/D*s}}
}
function drawBoss(){
  const b=G.boss;if(!b||!b.alive)return;
  const fr=((b.frame*4)|0)%2;
  if(b.hurt>0)ctx.globalAlpha=0.5;
  ctx.drawImage(vakaSprite(fr),b.x|0,(b.y+HUDH-4)|0);
  ctx.globalAlpha=1;
  // HP bar
  const bw=80,bx=(VW-bw)/2,by=HUDH+4;
  ctx.fillStyle='#1a1010';ctx.fillRect(bx-1,by-1,bw+2,6);
  ctx.fillStyle='#801020';ctx.fillRect(bx,by,bw,4);
  ctx.fillStyle='#e03040';ctx.fillRect(bx,by,bw*(b.hp/b.max),4);
  // telegraph
  if(b.tele>0){ctx.fillStyle='#e03040';ctx.font='bold 12px monospace';ctx.fillText('!',b.x+10,b.y+HUDH-2)}
}
function vakaSprite(f){return makeVaka(f)}
