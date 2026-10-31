// Loads Daniel's art pack from assets/art. Falls back to procedural sprites.
'use strict';
const ART={ready:0,title:null,vel:null,dog:null,boar:null,vaka:null,frames:null};
function loadImg(src){return new Promise(res=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>res(null);i.src=src})}
async function loadArt(){
  try{
    const base='assets/art/';
    const [frames,vel,dog,boar,vaka,title]=await Promise.all([
      fetch(base+'frames.json').then(r=>r.ok?r.json():null).catch(()=>null),
      loadImg(base+'vel.png'),loadImg(base+'dog.png'),loadImg(base+'boar.png'),
      loadImg(base+'vaka.png'),loadImg(base+'title.png')
    ]);
    ART.frames=frames;ART.vel=vel;ART.dog=dog;ART.boar=boar;ART.vaka=vaka;ART.title=title;ART.ready=1;
    // wrap sprite getters to prefer cut-outs when available
    if(vel&&frames&&frames.vel){
      const _h=heroSprite;
      heroSprite=function(dir,fr,sh,st){
        const key=st?'strike':(fr?'run1':'idle');
        const f=frames.vel[key]||frames.vel.idle;
        if(!f)return _h(dir,fr,sh,st);
        const c=document.createElement('canvas');c.width=16;c.height=16;
        const x=c.getContext('2d');x.imageSmoothingEnabled=false;
        // draw scaled side-view into top-down slot; flip for left
        const dw=14,dh=14;const ox=1,oy=1;
        x.save();
        if(dir==='l'){x.translate(16,0);x.scale(-1,1)}
        try{x.drawImage(vel,f[0],f[1],f[2],f[3],ox,oy,dw,dh)}catch(_){x.restore();return _h(dir,fr,sh,st)}
        x.restore();
        // paint a small shield overlay when shielding
        if(sh){x.fillStyle='#6a8aaa';
          if(dir==='l')x.fillRect(1,5,4,6);else if(dir==='r')x.fillRect(11,5,4,6);
          else if(dir==='u')x.fillRect(5,1,6,4);else x.fillRect(5,11,6,4);
          x.fillStyle='#f2c632';x.fillRect(dir==='l'||dir==='r'? (dir==='l'?2:12):7, dir==='u'||dir==='d'?(dir==='u'?2:12):7,2,2)}
        if(st){x.fillStyle='#efeae0';
          if(dir==='r')x.fillRect(13,7,3,2);else if(dir==='l')x.fillRect(0,7,3,2);
          else if(dir==='u')x.fillRect(7,0,2,3);else x.fillRect(7,13,2,3)}
        return c;
      };
    }
    if(dog&&frames&&frames.dog){
      const _d=dogSprite;
      dogSprite=function(dir,fr,bk){
        const key=bk?'bark':(fr?'run1':'stand');
        const f=frames.dog[key]||frames.dog.stand;if(!f)return _d(dir,fr,bk);
        const c=document.createElement('canvas');c.width=14;c.height=12;
        const x=c.getContext('2d');x.imageSmoothingEnabled=false;
        x.save();if(dir==='l'){x.translate(14,0);x.scale(-1,1)}
        try{x.drawImage(dog,f[0],f[1],f[2],f[3],0,0,14,12)}catch(_){x.restore();return _d(dir,fr,bk)}
        x.restore();return c;
      };
    }
    if(boar&&frames&&frames.boar){
      const _b=boarSprite;
      boarSprite=function(fr){
        const f=frames.boar[fr?'w1':'stand']||frames.boar.stand;if(!f)return _b(fr);
        const c=document.createElement('canvas');c.width=18;c.height=14;
        const x=c.getContext('2d');x.imageSmoothingEnabled=false;
        try{x.drawImage(boar,f[0],f[1],f[2],f[3],0,0,18,14)}catch(_){return _b(fr)}
        return c;
      };
    }
    if(vaka){
      const _v=vakaSprite;
      vakaSprite=function(fr){
        const c=document.createElement('canvas');c.width=28;c.height=28;
        const x=c.getContext('2d');x.imageSmoothingEnabled=false;
        try{x.drawImage(vaka,0,0,vaka.width,vaka.height,0,0,28,28)}catch(_){return _v(fr)}
        return c;
      };
    }
  }catch(err){console.warn('art load failed, using procedural',err)}
}
