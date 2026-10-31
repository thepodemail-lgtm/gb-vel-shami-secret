// =====================================================================
//  GB VEL AND THE SHAMI SECRET - TUNING
//  Every number here can be changed on github.com: open this file, click
//  the pencil icon, change a number, then "Commit changes". The site
//  updates about a minute later. Keep the commas and brackets as they are.
//  Speeds are in pixels per second (the screen is 256 pixels wide and one
//  tile is 16 pixels). Times are in seconds.
// =====================================================================
'use strict';
const TUNING = {
  // ---------- Vel: moving ----------
  run: 78,           // walking speed on the overworld and in the dungeon
  acc: 900,          // how fast Vel speeds up / stops (higher = snappier)

  // ---------- Weapons ----------
  strikeCD: 0.28,    // wait between sword swings
  strikeDur: 0.18,   // how long the sword hitbox stays out
  strikeReach: 22,   // how far the sword reaches from Vel's center
  strikeW: 14,       // sword hitbox width
  strikeH: 14,       // sword hitbox height
  beamSpeed: 160,    // sword-beam speed (only fires at full hearts)
  beamCD: 0.45,      // wait between beams
  shieldHold: true,  // X/K holds the shield up while pressed

  // ---------- Vel: health ----------
  hearts: 5,         // hearts (hit points) per life
  lives: 3,          // lives (REST) at the start
  inv: 1.2,          // invincible time after being hit
  heartsLostPerHit: 1,

  // ---------- Enemies ----------
  enemies: {
    boar:   { hp: 3, walkSpeed: 28, chargeSpeed: 110, aggro: 70 },
    cobra:  { hp: 2, walkSpeed: 22, spitSpeed: 100, spitCD: 1.8 },
    imp:    { hp: 1, hopSpeed: 55 },
    vetala: { hp: 2, walkSpeed: 30 },
  },

  // ---------- Boss (Vaka) ----------
  bossHP: 24,        // Vaka's health in this short adventure
  bossWalk: 36,      // stalking speed
  bossCharge: 120,   // charge attack speed
  bossRockSpeed: 90, // thrown rock speed

  // ---------- Dog ----------
  dog: {
    followDist: 18,      // how far behind Vel the dog tries to stay
    barkGap: 3,          // min seconds between barks when an enemy is near
    idleBarkRate: 0.06,  // chance per second of a random bark
    attackRange: 50,     // how close an enemy must be before the dog leaps
    attackRate: 1.8,     // chance per second to leap when in range
    attackCooldown: 3.5, // min seconds between leaps
    leapSpeed: 140,
  },

  // ---------- Pickups ----------
  heartHeal: 1,      // hearts restored by a heart pickup
  keyNeeded: 1,      // keys needed to open a locked door

  // ---------- Sound ----------
  musicVolume: 0.20, // music loudness (kept quieter than SFX)
  sfxVolume: 1.0,    // sound-effect loudness

  // ---------- Action buffer ----------
  actBuf: 0.15,      // sword/shield press still counts this early
};
const TUNE = TUNING;
