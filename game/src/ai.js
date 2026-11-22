// EMBER COURT — the opponent's mind. The Warden picks before seeing your card,
// from what it has learned: it remembers the suit you played last and the suit
// that won the last trick, saves its Ember for when it is losing, and spends
// its smallest card that can still win. You can read it and bait it.
import { SUITS, EMBER_VALUE } from './config.js';

function suitBeats(a, b) {
  if (!a || !b || !SUITS[a] || !SUITS[b]) return false;
  return SUITS[a].beats === b;
}

function cardPower(card, vsSuit, momentumSuit) {
  let power = card.value;
  if (card.kind === 'ember') power = EMBER_VALUE + 2;
  else if (SUITS[card.suit] && suitBeats(card.suit, vsSuit)) power += 2;
  if (card.suit === momentumSuit) power += 1;
  return power;
}

export function chooseCard(hand, ctx) {
  const { playerLastSuit, playerHp, aiHp, momentumSuit, round } = ctx;
  const playable = hand.slice();
  if (playable.length === 0) return null;

  // Desperate: low health and the player is ahead — burn the Ember now.
  const ember = playable.find((c) => c.kind === 'ember');
  if (ember && aiHp <= 12 && playerHp > aiHp) return ember;

  // Hurt and holding a Mend: heal instead of fighting this trick.
  const mend = playable.find((c) => c.kind === 'mend');
  if (mend && aiHp <= 10 && round > 2) return mend;

  // About to lose the trick anyway: shield it with a Ward when the player
  // has been hitting hard.
  const ward = playable.find((c) => c.kind === 'ward');
  if (ward && playerHp >= 20 && aiHp <= 15) return ward;

  // Otherwise play the cheapest card that beats what the player usually
  // leads with, preferring a suit that counters their last suit.
  const scored = playable.map((card) => {
    let score = cardPower(card, playerLastSuit, momentumSuit);
    // Spending a big card on a small read is wasteful: prefer the smallest
    // card that still clears the bar.
    score -= card.value * 0.15;
    if (card.kind === 'ember') score -= 6; // save the Ember
    if (card.kind === 'mend' || card.kind === 'ward') score -= 3; // save the specials
    return { card, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0].card;
}

export { suitBeats, cardPower };
