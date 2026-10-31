// Procedural top-down sprites + helpers. Art pack can replace hero/dog/boss/enemies.
'use strict';
const P={skin:'#c68642',skinD:'#8d5524',hair:'#1a1210',scarf:'#c8161e',scarfG:'#d8b24a',tunic:'#2a5a3a',tunicD:'#1a3a28',
 out:'#0d0710',wht:'#efeae0',gry:'#9a9aa8',gryD:'#5a5a68',gold:'#f2c632',shld:'#6a8aaa',shldD:'#3a5a7a',
 grass:'#7cbc5a',grassD:'#4a8a3a',dirt:'#c4a46a',dirtD:'#8a7040',stone:'#8a8a9a',stoneD:'#5a5a6a',
 water:'#5a9aba',waterD:'#3a6a8a',bush:'#3a8a2a',wood:'#8a5a2a',woodD:'#5a3a18',floor:'#6a5a4a',floorL:'#8a7a6a',
 heart:'#e03040',heartD:'#801020',keyC:'#f2c632',beam:'#f8f0a0'};

function Spr(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingEnabled=false;return{c,x,w,h}}
function px(s,x,y,w,h,col){s.x.fillStyle=col;s.x.fillRect(x|0,y|0,w,h)}
function outline(s){const d=s.x.getImageData(0,0,s.w,s.h),p=d.data,o=new Uint8ClampedArray(p);
 for(let y=0;y<s.h;y++)for(let x=0;x<s.w;x++){const i=(y*s.w+x)*4;if(p[i+3]<128)continue;
  for(const[dx,dy]of[[-1,0],[1,0],[0,-1],[0,1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=s.w||ny>=s.h){o[i]=13;o[i+1]=7;o[i+2]=16;o[i+3]=255;continue}
   const j=(ny*s.w+nx)*4;if(p[j+3]<128){o[i]=13;o[i+1]=7;o[i+2]=16;o[i+3]=255;break}}}
 s.x.putImageData(new ImageData(o,s.w,s.h),0,0)}

const SC={}; // sprite cache
function cache(k,fn){if(!SC[k])SC[k]=fn();return SC[k]}

// Top-down Vel: 16x16, four facings, optional shield, walk frames
function makeVel(dir,frame,shield,strike){
  return cache('vel_'+dir+'_'+frame+'_'+(shield?1:0)+'_'+(strike?1:0),()=>{
    const s=Spr(16,16);
    // body
    px(s,5,6,6,7,P.tunic);px(s,5,11,2,3,P.tunicD);px(s,9,11,2,3,P.tunicD);
    // head
    px(s,5,2,6,5,P.skin);px(s,5,2,6,2,P.hair);px(s,4,3,1,2,P.hair);px(s,11,3,1,2,P.hair);
    // scarf
    px(s,5,6,6,2,P.scarf);px(s,11,7,2,3,P.scarf);
    // facing cue (eyes / nose)
    if(dir==='d'){px(s,6,4,1,1,P.out);px(s,9,4,1,1,P.out);px(s,7,5,2,1,P.skinD)}
    else if(dir==='u'){px(s,5,2,6,4,P.hair)} // back of head
    else if(dir==='l'){px(s,6,4,1,1,P.out);px(s,5,5,1,1,P.skinD)}
    else{px(s,9,4,1,1,P.out);px(s,10,5,1,1,P.skinD)}
    // walk bob
    if(frame===1){px(s,4,13,3,2,P.tunicD);px(s,9,12,3,2,P.tunicD)}
    else{px(s,5,13,3,2,P.tunicD);px(s,8,12,3,2,P.tunicD)}
    // shield (held on non-sword side / front when shielding)
    if(shield){
      const sx=dir==='l'?1:(dir==='r'?11:5),sy=dir==='u'?1:(dir==='d'?10:5);
      if(dir==='l'||dir==='r'){px(s,sx,sy,4,7,P.shld);px(s,sx+1,sy+1,2,5,P.shldD);px(s,sx+1,sy+2,2,1,P.gold)}
      else{px(s,sx,sy,6,4,P.shld);px(s,sx+1,sy+1,4,2,P.shldD);px(s,sx+2,sy+1,2,1,P.gold)}
    }
    // sword swing
    if(strike){
      if(dir==='r'){px(s,12,7,4,2,P.gry);px(s,14,6,2,4,P.wht)}
      else if(dir==='l'){px(s,0,7,4,2,P.gry);px(s,0,6,2,4,P.wht)}
      else if(dir==='u'){px(s,7,0,2,4,P.gry);px(s,6,0,4,2,P.wht)}
      else{px(s,7,12,2,4,P.gry);px(s,6,14,4,2,P.wht)}
    }
    outline(s);return s.c;
  });
}

function makeDog(dir,frame,bark){
  return cache('dog_'+dir+'_'+frame+'_'+(bark?1:0),()=>{
    const s=Spr(14,12);
    px(s,3,4,8,6,P.gry);px(s,3,4,8,2,P.wht);px(s,2,5,2,3,P.gryD);px(s,10,5,2,3,P.gryD);
    // head
    if(dir==='l'){px(s,1,3,5,5,P.wht);px(s,1,5,2,1,P.out);px(s,0,6,2,1,P.gryD)}
    else if(dir==='r'){px(s,8,3,5,5,P.wht);px(s,11,5,2,1,P.out);px(s,12,6,2,1,P.gryD)}
    else if(dir==='u'){px(s,4,1,6,5,P.gry);px(s,4,1,6,2,P.wht)}
    else{px(s,4,2,6,5,P.wht);px(s,5,4,1,1,P.out);px(s,8,4,1,1,P.out);px(s,6,5,2,1,P.gryD)}
    // legs
    if(frame){px(s,3,10,2,2,P.gryD);px(s,9,9,2,2,P.gryD)}else{px(s,4,10,2,2,P.gryD);px(s,8,9,2,2,P.gryD)}
    if(bark){px(s,dir==='l'?0:12,4,2,2,P.wht)}
    // tail
    px(s,dir==='l'?11:1,5,2,2,P.gry);
    outline(s);return s.c;
  });
}

function makeBoar(frame){return cache('boar_'+frame,()=>{const s=Spr(18,14);px(s,3,4,12,8,P.wood);px(s,3,4,12,3,P.woodD);px(s,1,6,3,4,P.wht);px(s,0,7,2,2,P.wht);px(s,14,6,3,4,P.skin);px(s,15,5,2,2,P.out);if(frame)px(s,4,11,3,2,P.woodD);else px(s,5,11,3,2,P.woodD);outline(s);return s.c})}
function makeCobra(frame){return cache('cobra_'+frame,()=>{const s=Spr(14,16);px(s,5,8,4,7,P.tunic);px(s,4,2,6,8,P.tunic);px(s,3,3,8,4,P.tunicD);px(s,5,4,1,1,P.out);px(s,8,4,1,1,P.out);px(s,6,6,2,1,P.gold);if(frame)px(s,6,1,2,2,P.scarf);outline(s);return s.c})}
function makeImp(frame){return cache('imp_'+frame,()=>{const s=Spr(12,12);px(s,3,4,6,6,P.scarf);px(s,2,2,8,4,P.scarf);px(s,1,3,2,2,P.gold);px(s,9,3,2,2,P.gold);px(s,4,4,1,1,P.out);px(s,7,4,1,1,P.out);px(s,3,9,2,3,P.scarf);px(s,7,9,2,3,P.scarf);if(frame)px(s,5,1,2,2,P.scarf);outline(s);return s.c})}
function makeVetala(frame){return cache('vet_'+frame,()=>{const s=Spr(14,16);px(s,4,6,6,8,P.gryD);px(s,3,2,8,6,P.gry);px(s,4,3,2,2,P.heart);px(s,8,3,2,2,P.heart);px(s,5,8,4,2,P.wht);if(frame)px(s,2,10,3,2,P.gryD);else px(s,9,10,3,2,P.gryD);outline(s);return s.c})}
function makeVaka(frame){return cache('vaka_'+frame,()=>{const s=Spr(28,28);px(s,8,10,12,14,P.stoneD);px(s,6,4,16,12,P.stone);px(s,8,2,12,8,P.skinD);px(s,10,4,3,2,P.gold);px(s,15,4,3,2,P.gold);px(s,12,8,4,2,P.out);px(s,4,12,5,8,P.stone);px(s,19,12,5,8,P.stone);px(s,2,14,4,4,P.scarf);px(s,22,14,4,4,P.scarf);if(frame){px(s,8,22,4,4,P.stoneD);px(s,16,20,4,4,P.stoneD)}else{px(s,8,20,4,4,P.stoneD);px(s,16,22,4,4,P.stoneD)}outline(s);return s.c})}

function makeHeart(full){return cache('hrt_'+full,()=>{const s=Spr(8,8);if(full){px(s,1,2,2,2,P.heart);px(s,4,2,2,2,P.heart);px(s,1,3,5,3,P.heart);px(s,2,6,3,1,P.heart);px(s,2,2,1,1,P.wht)}else{px(s,1,2,2,2,P.heartD);px(s,4,2,2,2,P.heartD);px(s,1,3,5,3,P.heartD);px(s,2,6,3,1,P.heartD)}outline(s);return s.c})}
function makeKey(){return cache('key',()=>{const s=Spr(10,10);px(s,3,1,4,4,P.keyC);px(s,4,2,2,2,P.out);px(s,4,5,2,4,P.keyC);px(s,6,7,2,1,P.keyC);px(s,6,8,3,1,P.keyC);outline(s);return s.c})}
function makeBeam(){return cache('beam',()=>{const s=Spr(8,8);px(s,2,2,4,4,P.beam);px(s,3,1,2,6,P.wht);px(s,1,3,6,2,P.wht);outline(s);return s.c})}

// Tile draw colors
function drawTile(ctx,t,x,y,theme){
  const X=x*T,Y=y*T+HUDH;
  if(t===0){ // grass
    ctx.fillStyle=P.grass;ctx.fillRect(X,Y,T,T);
    ctx.fillStyle=P.grassD;ctx.fillRect(X+2,Y+3,2,2);ctx.fillRect(X+9,Y+10,2,2);ctx.fillRect(X+11,Y+4,2,1);
  }else if(t===7){ctx.fillStyle=P.dirt;ctx.fillRect(X,Y,T,T);ctx.fillStyle=P.dirtD;ctx.fillRect(X+3,Y+5,2,1)}
  else if(t===1){ // wall / rock
    ctx.fillStyle=theme==='dung'||theme==='boss'?P.stoneD:P.woodD;ctx.fillRect(X,Y,T,T);
    ctx.fillStyle=theme==='dung'||theme==='boss'?P.stone:P.wood;ctx.fillRect(X+1,Y+1,T-2,T-2);
    ctx.fillStyle=P.out;ctx.fillRect(X,Y+T-1,T,1);
  }else if(t===2){ctx.fillStyle=P.water;ctx.fillRect(X,Y,T,T);ctx.fillStyle=P.waterD;ctx.fillRect(X+2,Y+4,8,2);ctx.fillRect(X+6,Y+10,6,2)}
  else if(t===3){ctx.fillStyle=P.grass;ctx.fillRect(X,Y,T,T);ctx.fillStyle=P.bush;ctx.fillRect(X+2,Y+4,12,10);ctx.fillStyle=P.tunic;ctx.fillRect(X+4,Y+2,8,6);ctx.fillStyle=P.out;ctx.fillRect(X+7,Y+12,2,3)}
  else if(t===4){ctx.fillStyle=P.floor;ctx.fillRect(X,Y,T,T);ctx.fillStyle=P.floorL;ctx.fillRect(X+1,Y+1,6,1);ctx.fillRect(X+8,Y+8,5,1)}
  else if(t===5){ctx.fillStyle=P.stoneD;ctx.fillRect(X+3,Y+2,10,14);ctx.fillStyle=P.stone;ctx.fillRect(X+4,Y+3,8,10);ctx.fillStyle=P.gold;ctx.fillRect(X+6,Y+5,4,2)}
  else if(t===6){ctx.fillStyle=P.grass;ctx.fillRect(X,Y,T,T);ctx.fillStyle=P.woodD;ctx.fillRect(X+6,Y+10,4,6);ctx.fillStyle=P.bush;ctx.fillRect(X+1,Y+1,14,12);ctx.fillStyle=P.tunic;ctx.fillRect(X+3,Y+3,10,7)}
  else if(t===8){ctx.fillStyle=P.wood;ctx.fillRect(X,Y,T,T);ctx.fillStyle=P.woodD;ctx.fillRect(X+2,Y+2,T-4,T-4);ctx.fillStyle=P.gold;ctx.fillRect(X+7,Y+7,2,2)}
  else if(t===9){ctx.fillStyle=P.stoneD;ctx.fillRect(X,Y,T,T);ctx.fillStyle=P.stone;ctx.fillRect(X+2,Y+2,T-4,T-4);ctx.fillStyle=P.keyC;ctx.fillRect(X+6,Y+6,4,4)}
  else if(t===10){ctx.fillStyle=P.stoneD;ctx.fillRect(X,Y,T,T);ctx.fillStyle=P.out;ctx.fillRect(X+3,Y+3,10,10);ctx.fillStyle=P.gold;ctx.fillRect(X+5,Y+5,6,2);ctx.fillRect(X+7,Y+7,2,4)}
  else if(t===11){ctx.fillStyle=P.floor;ctx.fillRect(X,Y,T,T);ctx.fillStyle=P.gold;ctx.fillRect(X+3,Y+3,10,10);ctx.fillStyle=P.floorL;ctx.fillRect(X+5,Y+5,6,6)}
  else if(t===12){ctx.fillStyle=P.grass;ctx.fillRect(X,Y,T,T);ctx.fillStyle=P.woodD;ctx.fillRect(X+5,Y+4,6,12);ctx.fillStyle=P.wood;ctx.fillRect(X+6,Y+5,4,8);ctx.fillStyle=P.gold;ctx.fillRect(X+7,Y+8,2,2)}
  else{ctx.fillStyle=P.grass;ctx.fillRect(X,Y,T,T)}
}
