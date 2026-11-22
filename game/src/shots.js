// EMBER COURT — screenshot states: deterministic tableaus of the real game,
// driven through the same playCard / nextRound calls a player makes, so every
// screenshot is a true render of the game's own code. ?shot=title|play|win|loss
// The page sets window.__shotReady once the tableau is rendered.
import { createGame, startDuel, playCard, nextRound } from './state.js';
import { mulberry32 } from './random.js';

function oneRound(game, rng) {
  if (game.screen !== 'play') return false;
  const index = Math.floor(rng() * game.playerHand.length);
  if (!playCard(game, index)) return false;
  if (game.screen !== 'play') return true;
  nextRound(game);
  return true;
}

// A full simulated duel, played to its end with the seeded chooser.
function playOut(game, rng, maxRounds = 80) {
  for (let i = 0; i < maxRounds; i++) {
    if (game.screen !== 'play') return game.screen;
    if (!oneRound(game, rng)) return game.screen;
  }
  return game.screen;
}

export function applyShot(game, shot, seed) {
  const rng = mulberry32(seed * 7919 + 13);
  if (shot === 'title') {
    game.screen = 'title';
    game.banner = '';
    return true;
  }
  if (shot === 'play') {
    startDuel(game);
    // Four real rounds with a greedy chooser (strongest card each round),
    // then one trick left on the table mid-resolution: a close, live duel.
    const greedy = () => {
      let best = 0;
      game.playerHand.forEach((c, i) => { if (c.value > game.playerHand[best].value) best = i; });
      return best;
    };
    for (let i = 0; i < 4; i++) {
      if (game.screen !== 'play') return false;
      playCard(game, greedy());
      if (game.screen !== 'play') return false;
      nextRound(game);
    }
    if (game.screen !== 'play') return false;
    playCard(game, greedy());
    return game.screen === 'play';
  }
  if (shot === 'win' || shot === 'loss') {
    // Replay duels with fresh seeds until the wanted ending appears.
    for (let attempt = 0; attempt < 12; attempt++) {
      const trial = createGame(seed + attempt * 101);
      startDuel(trial);
      const end = playOut(trial, mulberry32(seed + attempt * 977 + 5));
      if (end === shot) {
        Object.assign(game, trial);
        return true;
      }
    }
    return false;
  }
  return false;
}
