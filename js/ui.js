// Outlined text, title, HUD, intro, win/lose cards.
'use strict';
function drawText(str,x,y,center,col,size){
  ctx.font='bold '+(size||10)+'px monospace';ctx.textAlign=center?'center':'left';ctx.textBaseline='middle';
  ctx.fillStyle='#0d0710';ctx.fillText(str,x+1,y+1);ctx.fillStyle=col||'#efeae0';ctx.fillText(str,x,y);
}
function drawHUD(){
  ctx.fillStyle='#1e1420';ctx.fillRect(0,0,VW,HUDH);
  ctx.fillStyle='#d8b24a';ctx.fillRect(0,HUDH-2,VW,2);
  // hearts
  for(let i=0;i<G.maxHp;i++)ctx.drawImage(makeHeart(i<G.hp),6+i*10,8);
  // keys
  drawText('KEY '+G.keys,6,30,0,'#f2c632',9);
  // lives
  drawText('REST '+(G.lives-1),70,14,0,'#efeae0',9);
  drawText('SCORE '+G.score,70,28,0,'#a9a2c0',9);
  // room / status
  ctx.textAlign='right';ctx.fillStyle='#a9a2c0';ctx.font='bold 8px monospace';
  ctx.fillText(roomId,VW-6,14);ctx.textAlign='left';
  if(G.shield)drawText('SHIELD',200,30,0,'#6a8aaa',8);
  else if(G.hp>=G.maxHp)drawText('BEAM RDY',190,30,0,'#f2c632',8);
}
function drawToast(){
  const lines=wrap(toast.msg,34);
  const h=14+lines.length*12;const y=VH-h-6;
  ctx.fillStyle='rgba(20,12,24,0.82)';ctx.fillRect(8,y,VW-16,h);
  ctx.strokeStyle='#d8b24a';ctx.strokeRect(8.5,y+0.5,VW-17,h-1);
  lines.forEach((ln,i)=>drawText(ln,VW/2,y+12+i*12,1,'#efeae0',9));
}
function wrap(s,n){const o=[],w=s.split(' ');let cur='';for(const t of w){if((cur+' '+t).trim().length>n){o.push(cur.trim());cur=t}else cur=(cur+' '+t).trim()}if(cur)o.push(cur);return o}

function drawTitle(){
  // light forest wash
  ctx.fillStyle='#c8d8a8';ctx.fillRect(0,0,VW,VH);
  for(let i=0;i<40;i++){ctx.fillStyle=i%2?P.bush:P.tunic;ctx.fillRect((i*37+10)%VW,(i*53+20)%VH,12,10)}
  if(ART.title){const tw=Math.min(VW-20,ART.title.width),th=tw*(ART.title.height/ART.title.width);
    ctx.drawImage(ART.title,(VW-tw)/2,8,tw,Math.min(th,70))}
  drawText('GB VEL',VW/2,88,1,'#f2c632',22);
  drawText('AND THE SHAMI SECRET',VW/2,108,1,'#efeae0',11);
  drawText('A short forest adventure',VW/2,126,1,'#5a4a3a',9);
  drawText('PRESS START',VW/2,155,1,((tt*2)|0)%2?'#c8161e':'#f2c632',12);
  drawText('Arrows/WASD move  Z/J sword  X/K shield  P pause',VW/2,178,1,'#5a4a3a',7);
  drawText('M mute',VW/2,190,1,'#5a4a3a',7);
}
function drawIntro(){
  ctx.fillStyle='#1a1220';ctx.fillRect(0,0,VW,VH);
  drawText('SANJAYA SPEAKS',VW/2,36,1,'#f2c632',12);
  const lines=[
    'The thirteenth year of exile ends.',
    'In a Shami tree the Pandavas hid',
    'their weapons - bows, blades, and',
    'the hope of a rightful return.',
    '',
    'Prince Vel walks the temple road',
    'with a sword, a shield, and a dog.',
    'Vaka the rakshasa guards the way.',
    '',
    'Find the key. Open the door.',
    'Claim what was hidden.'
  ];
  lines.forEach((ln,i)=>drawText(ln,VW/2,58+i*12,1,'#efeae0',9));
  drawText('PRESS START TO BEGIN',VW/2,200,1,((tt*2)|0)%2?'#c8161e':'#d8b24a',10);
}
function drawWin(){
  ctx.fillStyle='rgba(20,30,18,0.72)';ctx.fillRect(0,0,VW,VH);
  drawText('THE SHAMI SECRET',VW/2,50,1,'#f2c632',14);
  drawText('Beneath the Shami leaves,',VW/2,78,1,'#efeae0',10);
  drawText('the hidden weapons shine again.',VW/2,92,1,'#efeae0',10);
  drawText('',VW/2,106,1,'#efeae0',10);
  drawText('Sanjaya: "A prince with nothing still',VW/2,120,1,'#d8b24a',9);
  drawText('protects others. Patience is not waiting -',VW/2,134,1,'#d8b24a',9);
  drawText('it is staying true while the years pass."',VW/2,148,1,'#d8b24a',9);
  drawText('LESSON: PATIENCE',VW/2,172,1,'#f2c632',12);
  drawText('SCORE '+G.score,VW/2,190,1,'#efeae0',10);
  if(tt>1.2)drawText('PRESS START',VW/2,210,1,'#c8161e',10);
}
function drawOver(){
  ctx.fillStyle='rgba(24,10,16,0.78)';ctx.fillRect(0,0,VW,VH);
  drawText('THE FOREST IS PATIENT',VW/2,70,1,'#c8161e',14);
  drawText('Sanjaya: "Even Arjuna earned his weapons',VW/2,100,1,'#efeae0',9);
  drawText('through patience. Rise, and walk again."',VW/2,114,1,'#efeae0',9);
  drawText('LESSON: PATIENCE',VW/2,150,1,'#f2c632',12);
  drawText('SCORE '+(G?G.score:0),VW/2,170,1,'#a9a2c0',10);
  if(tt>1.2)drawText('PRESS START',VW/2,200,1,'#d8b24a',10);
}
function setOpt(k,v){S[k]=v;saveS()}
