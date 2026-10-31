// Boot: builds the game and returns the control API used by index.html.
'use strict';
function bootGame(h){
  Object.assign(hooks,h);
  // size canvas
  cv.width=VW;cv.height=VH;
  raf=requestAnimationFrame(frame);
  hooks.onMute(S.mute);
  loadArt();
  return{
    press,pressStart,
    setOpt,pauseSet:(on)=>pause(on),
    opts:()=>({inv:!!S.inv}),
    togglePause(){audioInit();if(state==='title'||state==='intro'||state==='win'||state==='over'){setMute(!S.mute);return}pause(state==='play')},
    toggleMute(){audioInit();setMute(!S.mute)},
    restart(){if(state==='pause')pause(false);newGame();state='play';music('over',0.5)},
    stop(){cancelAnimationFrame(raf);removeEventListener('keydown',onKD);removeEventListener('keyup',onKU);document.removeEventListener('visibilitychange',onVis);if(AU.iv)clearInterval(AU.iv);if(AU.ctx)AU.ctx.close().catch(()=>{})}
  };
}
