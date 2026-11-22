// EMBER COURT — bootstrap: read the seed and screenshot mode from the URL,
// build the duel, render the table, wire input, and expose the game for
// play-testing. ?seed=N fixes the shuffle; ?shot=title|play|win|loss renders
// a deterministic tableau and sets window.__shotReady when it is painted.
import { createGame } from './state.js';
import { renderAll } from './render.js';
import { wireInput } from './input.js';
import { applyShot } from './shots.js';
import { sfx } from './audio.js';

const params = new URLSearchParams(window.location.search);
const seedParam = Number(params.get('seed'));
const seed = Number.isFinite(seedParam) && seedParam > 0 ? Math.floor(seedParam) : (Date.now() % 2147483647);
const shot = params.get('shot');

const game = createGame(seed);
const root = document.getElementById('app');
const status = document.getElementById('status');

let lastScreen = game.screen;

function rerender() {
  renderAll(game, root);
  status.textContent = game.screen === 'title'
    ? 'Ember Court title screen. Press Enter to start the duel.'
    : game.screen === 'play'
      ? `Round ${game.round}. Your life ${game.playerHp}, Warden life ${game.aiHp}. ${game.banner}`
      : game.banner;
  if (game.screen !== lastScreen) {
    if (game.screen === 'win') sfx.win();
    if (game.screen === 'loss') sfx.lose();
  }
  lastScreen = game.screen;
}

let shotOk = true;
if (shot) {
  document.body.classList.add('shot-mode');
  shotOk = applyShot(game, shot, seed);
}

wireInput(game, root, rerender);
rerender();

window.__game = game;
window.__shotReady = shotOk === true;
if (!shotOk) console.error('shot failed:', shot);
