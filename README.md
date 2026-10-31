# GB Vel and the Shami Secret

A short top-down action-adventure in the general style of 8-bit NES adventure games (screen-by-screen rooms, hearts, sword, keys and doors).

**Play:** https://thepodemail-lgtm.github.io/gb-vel-shami-secret/

**Story:** Same Mahabharata-exile thread as *The Thirteenth Year*. Sanjaya narrates. Vel (Kathirvelan) and the Dog seek the weapons hidden in the **Shami tree** during the thirteenth year of exile. Vaka the rakshasa is the final boss.

## Controls

| Input | Action |
|---|---|
| Arrows / WASD | Move |
| Z / J | Sword (fires a beam only at full hearts) |
| X / K | Shield (blocks enemy projectiles from the front) |
| P / Esc | Pause |
| M | Mute |

On phones: angle-based D-pad on the left, SWORD / SHIELD on the right. First tap can enter fullscreen + landscape.

## Tuning

Every gameplay number lives in `js/tuning.js` with plain-English comments. Edit on GitHub and the Pages site updates in about a minute.

## Architecture

Vanilla JS, no build step. Load order is set in `index.html`:

`tuning → world → engine → audio → sprites → input → player → enemies → boss → ui → art → main`

Art from Daniel's pack in `assets/art/` (shared with The Thirteenth Year). Music is original WebAudio chiptune (overworld / dungeon / boss). Music volume ~0.20, SFX 1.0.

## Copyright

Genre mechanics only. No Nintendo characters, names, sprites, maps, music, or melodies.
