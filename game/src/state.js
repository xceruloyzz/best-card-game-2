// EMBER COURT — the duel itself: state, trick resolution and the win/loss
// screens. One trick per round: both sides play a card face up, the stronger
// card wins, the loser takes damage equal to the gap. First to 0 HP loses.
import {
  START_HP, MAX_HP, HAND_SIZE, ADVANTAGE_BONUS, MOMENTUM_BONUS,
  MEND_HEAL, WARD_HEAL, SUITS, OPPONENT_NAME, PLAYER_NAME,
} from './config.js';
import { mulberry32 } from './random.js';
import { buildDeck, drawUpTo, sortHand } from './deck.js';
import { chooseCard, cardPower } from './ai.js';

export function createGame(seed) {
  const rng = mulberry32(seed);
  const deck = buildDeck(rng);
  const game = {
    seed,
    screen: 'title', // title | play | win | loss
    round: 1,
    playerHp: START_HP,
    aiHp: START_HP,
    playerHand: [],
    aiHand: [],
    deck,
    discard: [],
    playedPlayer: null,
    playedAi: null,
    resolving: false,
    momentumSuit: null,
    playerLastSuit: null,
    aiLastSuit: null,
    tricksWon: 0,
    tricksLost: 0,
    damageDealt: 0,
    damageTaken: 0,
    banner: '',
    log: ['The Warden shuffles the Ember deck. Choose a card to open the duel.'],
    winner: null,
  };
  drawUpTo(game.playerHand, game.deck, game.discard, rng);
  drawUpTo(game.aiHand, game.deck, game.discard, rng);
  sortHand(game.playerHand);
  game.rng = rng;
  return game;
}

export function startDuel(game) {
  game.screen = 'play';
  game.banner = 'Round 1 — play a card!';
  pushLog(game, 'The duel begins. Both sides hold 30 life.');
}

function pushLog(game, line) {
  game.log.unshift(line);
  if (game.log.length > 3) game.log.length = 3;
}

function describeCard(card) {
  if (card.kind === 'number') return `${card.value} of ${SUITS[card.suit].name}`;
  return card.name;
}

function trickPower(card, foeCard, momentumSuit) {
  if (card.kind === 'ward') return 0;
  let power = card.value;
  if (card.kind === 'ember') power += ADVANTAGE_BONUS;
  else if (foeCard && SUITS[card.suit] && SUITS[foeCard.suit] && SUITS[card.suit].beats === foeCard.suit) {
    power += ADVANTAGE_BONUS;
  }
  if (card.suit === momentumSuit) power += MOMENTUM_BONUS;
  return power;
}

// The player commits a card from their hand. The Warden has already chosen
// in secret; both are revealed together and the trick resolves.
export function playCard(game, handIndex) {
  if (game.screen !== 'play' || game.resolving) return false;
  if (handIndex < 0 || handIndex >= game.playerHand.length) return false;
  const playerCard = game.playerHand.splice(handIndex, 1)[0];
  const aiCard = chooseCard(game.aiHand, {
    playerLastSuit: game.playerLastSuit,
    playerHp: game.playerHp,
    aiHp: game.aiHp,
    momentumSuit: game.momentumSuit,
    round: game.round,
  });
  const aiIndex = game.aiHand.indexOf(aiCard);
  game.aiHand.splice(aiIndex, 1);
  game.playedPlayer = playerCard;
  game.playedAi = aiCard;
  game.resolving = true;
  resolveTrick(game, playerCard, aiCard);
  return true;
}

function resolveTrick(game, playerCard, aiCard) {
  const playerPower = trickPower(playerCard, aiCard, game.momentumSuit);
  const aiPower = trickPower(aiCard, playerCard, game.momentumSuit);
  let banner = '';
  let damage = 0;
  let winner = null;

  const playerWard = playerCard.kind === 'ward';
  const aiWard = aiCard.kind === 'ward';

  if (playerPower === aiPower) {
    banner = `Clash! ${describeCard(playerCard)} meets ${describeCard(aiCard)} — no damage.`;
  } else if (playerPower > aiPower) {
    winner = 'player';
    damage = Math.max(1, playerPower - aiPower);
    if (aiWard) {
      damage = 0;
      game.aiHp = Math.min(MAX_HP, game.aiHp + WARD_HEAL);
      banner = `Your ${describeCard(playerCard)} wins — but the Warden's Ward blocks it and mends 2.`;
    } else {
      game.aiHp = Math.max(0, game.aiHp - damage);
      game.damageDealt += damage;
      banner = `Your ${describeCard(playerCard)} (${playerPower}) beats ${describeCard(aiCard)} (${aiPower}) — the Warden takes ${damage}.`;
    }
    game.tricksWon++;
    game.momentumSuit = playerCard.suit;
  } else {
    winner = 'ai';
    damage = Math.max(1, aiPower - playerPower);
    if (playerWard) {
      damage = 0;
      game.playerHp = Math.min(MAX_HP, game.playerHp + WARD_HEAL);
      banner = `The Warden's ${describeCard(aiCard)} wins — but your Ward blocks it and mends 2.`;
    } else {
      game.playerHp = Math.max(0, game.playerHp - damage);
      game.damageTaken += damage;
      banner = `The Warden's ${describeCard(aiCard)} (${aiPower}) beats ${describeCard(playerCard)} (${playerPower}) — you take ${damage}.`;
    }
    game.tricksLost++;
    game.momentumSuit = aiCard.suit;
  }

  if (playerCard.kind === 'mend') {
    game.playerHp = Math.min(MAX_HP, game.playerHp + MEND_HEAL);
    banner += ' Your Mend heals 5.';
  }
  if (aiCard.kind === 'mend') {
    game.aiHp = Math.min(MAX_HP, game.aiHp + MEND_HEAL);
    banner += ' The Warden\'s Mend heals 5.';
  }

  game.banner = banner;
  pushLog(game, banner);
  game.playerLastSuit = playerCard.suit;
  game.aiLastSuit = aiCard.suit;
  game.discard.push(playerCard, aiCard);

  if (game.aiHp <= 0) {
    game.screen = 'win';
    game.winner = PLAYER_NAME;
    game.banner = 'The Warden falls. The Ember Court is yours!';
  } else if (game.playerHp <= 0) {
    game.screen = 'loss';
    game.winner = OPPONENT_NAME;
    game.banner = 'Your flame gutters out. The Warden keeps the Court.';
  }
}

export function nextRound(game) {
  if (game.screen !== 'play') return;
  game.playedPlayer = null;
  game.playedAi = null;
  game.resolving = false;
  game.round++;
  drawUpTo(game.playerHand, game.deck, game.discard, game.rng);
  drawUpTo(game.aiHand, game.deck, game.discard, game.rng);
  sortHand(game.playerHand);
  if (game.screen === 'play') game.banner = `Round ${game.round} — play a card!`;
}

export function restart(game) {
  const fresh = createGame((game.seed + 1) >>> 0);
  Object.assign(game, fresh);
  startDuel(game);
}

export { cardPower };
