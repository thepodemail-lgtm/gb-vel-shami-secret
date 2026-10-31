// Original generic chiptune (overworld, dungeon, boss) + SFX. Music ~0.20, SFX 1.0.
'use strict';
const SONG={
 over:{step:60/110/2,lead:[60,0,64,67,69,0,67,64,62,0,65,69,67,0,64,0,60,0,64,67,72,0,71,69,67,65,64,62,60,0,0,0],
  bass:[36,0,48,0,41,0,53,0,38,0,50,0,43,0,55,43],drum:[1,0,2,0,1,0,2,0],lt:'square',lv:0.055},
 dung:{step:60/100/2,lead:[57,0,60,0,64,0,60,57,55,0,58,0,62,0,58,55,57,60,64,67,64,60,57,0,55,58,62,65,62,58,55,0],
  bass:[33,33,45,33,36,36,48,36],drum:[1,0,0,2,1,0,2,0],lt:'triangle',lv:0.05},
 boss:{step:60/150/2,lead:[57,58,57,0,64,0,62,61,57,58,57,0,65,64,62,61,57,0,60,0,62,0,64,65,64,62,61,58,57,0,57,0],
  bass:[33,33,45,33,33,45,34,46],drum:[1,0,2,1,1,0,2,0],lt:'sawtooth',lv:0.045}};
let NB=null;
const AU={ctx:null,master:null,sfx:null,mus:null,cur:null,step:0,next:0,iv:0,want:null};
const mf=n=>440*Math.pow(2,(n-69)/12);
function mnote(type,n,t,dur,vol){const A=AU.ctx,o=A.createOscillator(),g=A.createGain();o.type=type;o.frequency.setValueAtTime(mf(n),t);g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+0.01);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(g);g.connect(AU.mus);o.start(t);o.stop(t+dur+0.02)}
function mdrum(k,t){const A=AU.ctx;if(k===1){const o=A.createOscillator(),g=A.createGain();o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(40,t+0.12);g.gain.setValueAtTime(0.18,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.14);o.connect(g);g.connect(AU.mus);o.start(t);o.stop(t+0.16)}
 else{if(!NB)return;const s=A.createBufferSource(),f=A.createBiquadFilter(),g=A.createGain();s.buffer=NB;f.type='highpass';f.frequency.value=6000;g.gain.setValueAtTime(0.04,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.05);s.connect(f);f.connect(g);g.connect(AU.mus);s.start(t);s.stop(t+0.06)}}
function seqTick(){const A=AU.ctx;if(!A||!AU.cur||A.state!=='running')return;const sg=SONG[AU.cur];while(AU.next<A.currentTime+0.15){const i=AU.step,t=AU.next;
 const l=sg.lead[i%sg.lead.length];if(l)mnote(sg.lt,l,t,sg.step*0.9,sg.lv);const b=sg.bass[i%sg.bass.length];if(b)mnote('triangle',b,t,sg.step*0.95,0.10);
 const d=sg.drum[i%sg.drum.length];if(d)mdrum(d,t);AU.step++;AU.next+=sg.step}}
function audioInit(){if(AU.ctx)return;try{const A=new (window.AudioContext||window.webkitAudioContext)();AU.ctx=A;AU.master=A.createGain();AU.master.gain.value=S.mute?0:1;AU.master.connect(A.destination);AU.sfx=A.createGain();AU.sfx.gain.value=TUNE.sfxVolume;AU.sfx.connect(AU.master);
 AU.mus=A.createGain();AU.mus.gain.value=0;AU.mus.connect(AU.master);noise(0.01,0.0001);AU.iv=setInterval(seqTick,30)}catch(e){AU.ctx=null}}
function chip(k,fade=1.2){if(!AU.ctx||AU.cur===k)return;const A=AU.ctx,t=A.currentTime,g=AU.mus.gain;g.cancelScheduledValues(t);g.setValueAtTime(0.0001,t);g.linearRampToValueAtTime(TUNE.musicVolume*4.5,t+Math.min(fade,0.6));AU.cur=k;AU.step=0;AU.next=t+0.05}
function chipStop(){if(!AU.ctx)return;const t=AU.ctx.currentTime,g=AU.mus.gain;g.cancelScheduledValues(t);g.setValueAtTime(g.value||0.0001,t);g.linearRampToValueAtTime(0.0001,t+0.4);AU.cur=null}
function setMute(v){S.mute=v;saveS();if(AU.ctx)AU.master.gain.setTargetAtTime(v?0:1,AU.ctx.currentTime,0.03);hooks.onMute(S.mute)}
function tone(type,f0,f1,dur,vol=0.3,delay=0){const A=AU.ctx;if(!A)return;const t=A.currentTime+delay,o=A.createOscillator(),g=A.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);if(f1!==f0)o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);o.connect(g);g.connect(AU.sfx);o.start(t);o.stop(t+dur+0.02)}
function noise(dur,vol=0.3,fc=2000,q=1,delay=0,f1){const A=AU.ctx;if(!A)return;if(!NB){NB=A.createBuffer(1,A.sampleRate,A.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
 const t=A.currentTime+delay,s=A.createBufferSource(),f=A.createBiquadFilter(),g=A.createGain();s.buffer=NB;f.type='bandpass';f.frequency.setValueAtTime(fc,t);if(f1)f.frequency.exponentialRampToValueAtTime(f1,t+dur);f.Q.value=q;g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);s.connect(f);f.connect(g);g.connect(AU.sfx);s.start(t);s.stop(t+dur+0.02)}
const SFX={
 sword(){noise(0.12,0.28,3500,2,0,1200);tone('sawtooth',1100,480,0.07,0.07)},
 beam(){tone('square',880,1400,0.1,0.12);tone('triangle',1320,1800,0.12,0.08,0.02)},
 shield(){tone('triangle',300,200,0.08,0.12);noise(0.06,0.1,800,1)},
 block(){tone('square',400,180,0.1,0.2);noise(0.08,0.2,600,1.5)},
 ehit(){tone('square',220,90,0.1,0.22);noise(0.08,0.25,1200,1)},
 edie(){tone('square',300,40,0.3,0.2);noise(0.25,0.25,700,0.8)},
 hurt(){tone('sawtooth',380,110,0.25,0.25);tone('square',190,80,0.22,0.14,0.04)},
 pick(){tone('square',880,880,0.06,0.15);tone('square',1320,1320,0.09,0.15,0.06)},
 heart(){[523,659,784].forEach((f,i)=>tone('triangle',f,f,0.12,0.2,i*0.06))},
 key(){[660,880,1100].forEach((f,i)=>tone('square',f,f,0.1,0.16,i*0.07))},
 door(){tone('triangle',200,120,0.2,0.18);noise(0.15,0.15,400,0.8)},
 bark(){tone('sawtooth',520,300,0.07,0.2);noise(0.06,0.15,900,2);tone('sawtooth',560,320,0.07,0.18,0.12)},
 roar(){tone('sawtooth',140,50,1.0,0.3);noise(0.9,0.3,400,0.6)},
 bhit(){tone('square',160,70,0.14,0.28);noise(0.12,0.3,600,1)},
 bdie(){for(let i=0;i<5;i++){noise(0.35,0.28,500-i*60,0.7,i*0.16);tone('sawtooth',200-i*25,40,0.35,0.16,i*0.16)}},
 win(){[523,659,784,1046,784,1046,1318].forEach((f,i)=>tone('square',f,f,0.18,0.14,i*0.12))},
 lose(){[392,349,311,262].forEach((f,i)=>tone('triangle',f,f*0.97,0.32,0.18,i*0.22))},
 blip(){tone('square',660,660,0.05,0.12)},
 sel(){tone('square',880,1320,0.1,0.14)},
 spit(){noise(0.12,0.18,2500,3,0,900)},
 thud(){noise(0.12,0.3,200,0.8);tone('sine',90,40,0.12,0.25)},
 step(){noise(0.03,0.06,400,1)},
 room(){tone('triangle',440,330,0.08,0.08)}
};
function sfx(n){if(AU.ctx&&!S.mute&&SFX[n])try{SFX[n]()}catch(e){}}
function music(k,fade=1.2){if(!AU.ctx||AU.want===k)return;AU.want=k;if(!k){chipStop();return}chip(k,fade)}
function musicStop(){AU.want=null;chipStop()}
