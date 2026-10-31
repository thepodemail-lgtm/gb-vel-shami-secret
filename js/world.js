// Screen-by-screen maps: overworld, dungeon, boss, win. Original layouts (not from any Nintendo game).
'use strict';
const T=16, COLS=16, ROWS=11, VW=256, VH=224, HUDH=48, PLAYH=ROWS*T; // 176 playfield + 48 HUD
// Tile codes: 0 empty/grass, 1 wall/solid, 2 water, 3 bush (soft solid), 4 dungeon floor, 5 pillar, 6 tree, 7 sand/path, 8 door, 9 locked door, 10 stairs down, 11 stairs up, 12 shami trunk
function solid(t){return t===1||t===2||t===3||t===5||t===6||t===8||t===9||t===12}
function blocks(t){return t===1||t===2||t===5||t===6||t===12} // bush (3) is cuttable later; doors handled separately

// Helper: fill a room with border walls and a fill tile
function room(fill, exits){
  const m=[];
  for(let y=0;y<ROWS;y++){const r=[];for(let x=0;x<COLS;x++){
    if(y===0||y===ROWS-1||x===0||x===COLS-1)r.push(1);else r.push(fill);
  }m.push(r)}
  // carve exits: 'N','S','E','W' mid-edge openings
  if(exits){const midX=COLS>>1,midY=ROWS>>1;
    if(exits.includes('N')){m[0][midX-1]=fill;m[0][midX]=fill;m[0][midX+1]=fill}
    if(exits.includes('S')){m[ROWS-1][midX-1]=fill;m[ROWS-1][midX]=fill;m[ROWS-1][midX+1]=fill}
    if(exits.includes('W')){m[midY-1][0]=fill;m[midY][0]=fill;m[midY+1][0]=fill}
    if(exits.includes('E')){m[midY-1][COLS-1]=fill;m[midY][COLS-1]=fill;m[midY+1][COLS-1]=fill}
  }
  return m;
}
function put(m,x,y,t){if(y>=0&&y<ROWS&&x>=0&&x<COLS)m[y][x]=t}
function blob(m,cx,cy,r,t){for(let y=cy-r;y<=cy+r;y++)for(let x=cx-r;x<=cx+r;x++)if((x-cx)*(x-cx)+(y-cy)*(y-cy)<=r*r)put(m,x,y,t)}

// ---- Overworld rooms (forest / temple ruins). Original layout. ----
// Grid:
//   [OW0] [OW1] [OW2]
//   [OW3] [OW4] [OW5]
//         [OW6]
const OW={};
(function buildOW(){
  // OW0 NW forest start-ish west
  let m=room(0,'SE');blob(m,3,3,1,6);blob(m,12,2,1,6);blob(m,4,8,1,6);put(m,8,5,3);put(m,9,5,3);OW.OW0={map:m,theme:'over',exits:{E:'OW1',S:'OW3'},ents:[
    {k:'imp',x:10*T,y:4*T},{k:'heart',x:4*T,y:7*T}
  ],toast:null};
  // OW1 N forest
  m=room(0,'SWE');blob(m,3,2,1,6);blob(m,12,8,1,6);blob(m,8,3,1,6);put(m,5,6,3);put(m,11,4,3);OW.OW1={map:m,theme:'over',exits:{W:'OW0',E:'OW2',S:'OW4'},ents:[
    {k:'boar',x:9*T,y:5*T},{k:'imp',x:4*T,y:7*T}
  ]};
  // OW2 NE ruins edge
  m=room(0,'SW');for(let i=3;i<8;i++){put(m,i,3,5);put(m,i,7,5)}put(m,3,4,5);put(m,3,5,5);put(m,3,6,5);put(m,7,4,5);put(m,7,6,5);OW.OW2={map:m,theme:'over',exits:{W:'OW1',S:'OW5'},ents:[
    {k:'cobra',x:10*T,y:5*T},{k:'heart',x:5*T,y:5*T}
  ],toast:'Sanjaya: "Among the ruins, old lamps still burn."'};
  // OW3 W forest
  m=room(0,'NE');blob(m,4,4,1,6);blob(m,11,7,1,6);blob(m,12,3,1,6);put(m,7,6,3);OW.OW3={map:m,theme:'over',exits:{N:'OW0',E:'OW4'},ents:[
    {k:'vetala',x:8*T,y:5*T},{k:'imp',x:5*T,y:8*T}
  ]};
  // OW4 center - dungeon entrance
  m=room(0,'NEWS');blob(m,3,2,1,6);blob(m,12,2,1,6);blob(m,3,8,1,6);blob(m,12,8,1,6);
  // stone ring around stairs
  put(m,7,4,5);put(m,8,4,5);put(m,9,4,5);put(m,7,6,5);put(m,8,6,5);put(m,9,6,5);put(m,7,5,5);put(m,9,5,5);put(m,8,5,10);
  OW.OW4={map:m,theme:'over',exits:{N:'OW1',W:'OW3',E:'OW5',S:'OW6'},ents:[
    {k:'boar',x:4*T,y:5*T},{k:'cobra',x:12*T,y:5*T}
  ],toast:'Sanjaya: "A hollow under the stones. The forest keeps a door."'};
  // OW5 E ruins / key area
  m=room(0,'NWS');for(let i=4;i<12;i++)put(m,i,3,5);put(m,4,4,5);put(m,11,4,5);put(m,4,5,5);put(m,11,5,5);
  OW.OW5={map:m,theme:'over',exits:{N:'OW2',W:'OW4',S:null},ents:[
    {k:'vetala',x:8*T,y:7*T},{k:'key',x:8*T,y:5*T},{k:'heart',x:5*T,y:8*T}
  ],toast:'Sanjaya: "A key lies where a lamp once stood."'};
  // OW6 S approach / shami hint (later win teleports here-ish)
  m=room(0,'N');blob(m,4,7,1,6);blob(m,11,7,1,6);blob(m,8,3,1,6);put(m,6,5,3);put(m,9,5,3);
  // decorative shami sapling (not the secret yet)
  put(m,8,8,6);
  OW.OW6={map:m,theme:'over',exits:{N:'OW4'},ents:[
    {k:'boar',x:5*T,y:4*T},{k:'imp',x:11*T,y:5*T}
  ],toast:'Sanjaya: "Somewhere a Shami tree holds what a prince must reclaim."'};
})();

// ---- Dungeon rooms ----
const DN={};
(function buildDN(){
  // D0 entrance
  let m=room(4,'E');put(m,8,ROWS-2,11); // stairs up near south (exit to OW4)
  // clear south wall around stairs
  put(m,7,ROWS-1,4);put(m,8,ROWS-1,4);put(m,9,ROWS-1,4);
  put(m,3,3,5);put(m,12,3,5);put(m,3,7,5);put(m,12,7,5);
  DN.D0={map:m,theme:'dung',exits:{E:'D1',UP:'OW4'},ents:[
    {k:'imp',x:5*T,y:5*T},{k:'imp',x:11*T,y:5*T}
  ],toast:'Sanjaya: "Cool stone. The temple remembers its keepers."'};
  // D1 hall
  m=room(4,'WE');put(m,8,3,5);put(m,8,7,5);put(m,5,5,5);put(m,11,5,5);
  DN.D1={map:m,theme:'dung',exits:{W:'D0',E:'D2'},ents:[
    {k:'cobra',x:8*T,y:5*T},{k:'heart',x:8*T,y:8*T}
  ]};
  // D2 east chamber - mini challenge (kill all for chest already open heart)
  m=room(4,'WS');put(m,4,3,5);put(m,5,3,5);put(m,10,3,5);put(m,11,3,5);put(m,4,7,5);put(m,11,7,5);
  DN.D2={map:m,theme:'dung',exits:{W:'D1',S:'D3'},ents:[
    {k:'boar',x:8*T,y:4*T},{k:'vetala',x:5*T,y:6*T},{k:'vetala',x:11*T,y:6*T}
  ],toast:'Sanjaya: "Three guardians. Patience, then the way opens."'};
  // D3 crossroads
  m=room(4,'NES');put(m,4,4,5);put(m,11,4,5);put(m,4,6,5);put(m,11,6,5);
  DN.D3={map:m,theme:'dung',exits:{N:'D2',E:'D4',S:'D5'},ents:[
    {k:'cobra',x:8*T,y:5*T},{k:'imp',x:6*T,y:7*T}
  ]};
  // D4 key room
  m=room(4,'W');put(m,8,3,5);put(m,7,4,5);put(m,9,4,5);put(m,8,7,5);
  DN.D4={map:m,theme:'dung',exits:{W:'D3'},ents:[
    {k:'key',x:8*T,y:5*T},{k:'boar',x:5*T,y:5*T},{k:'heart',x:11*T,y:8*T}
  ],toast:'Sanjaya: "Iron for a door that will not yield to force alone."'};
  // D5 antechamber - locked door north to boss? Actually south wall has locked door to boss
  m=room(4,'N');
  // locked door on south center
  put(m,7,ROWS-1,9);put(m,8,ROWS-1,9);put(m,9,ROWS-1,9);
  put(m,4,5,5);put(m,11,5,5);
  DN.D5={map:m,theme:'dung',exits:{N:'D3',S:'BOSS'},locked:'S',ents:[
    {k:'vetala',x:6*T,y:4*T},{k:'cobra',x:10*T,y:4*T}
  ],toast:'Sanjaya: "Beyond this door, a rakshasa keeps the path to the Shami."'};
})();

// Boss room
(function(){
  const m=room(4,'');
  // open north exit back? no - one way fight. Stairs appear after win? We go to WIN room.
  for(let i=3;i<13;i++){put(m,i,2,5);put(m,i,8,5)}
  put(m,3,3,5);put(m,3,7,5);put(m,12,3,5);put(m,12,7,5);
  // clear center
  DN.BOSS={map:m,theme:'boss',exits:{},ents:[],boss:true,toast:'Vaka, armored rakshasa of the temple, blocks the way!'};
})();

// Win room - Shami tree clearing
(function(){
  const m=room(0,'');
  // open feel - remove some border for aesthetic? keep walls
  blob(m,8,5,0,0);
  put(m,8,4,12);put(m,7,5,6);put(m,9,5,6);put(m,8,6,6); // shami trunk + canopy tiles
  put(m,6,4,6);put(m,10,4,6);put(m,6,6,6);put(m,10,6,6);
  DN.WIN={map:m,theme:'over',exits:{},ents:[],win:true};
})();

const ROOMS=Object.assign({},OW,DN);

function tileAt(roomId,px,py){
  const R=ROOMS[roomId];if(!R)return 1;
  const tx=(px/T)|0,ty=(py/T)|0;
  if(ty<0||ty>=ROWS||tx<0||tx>=COLS)return 1;
  return R.map[ty][tx];
}
