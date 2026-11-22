// EMBER COURT — the deck: 4 suits x values 1..9 plus two of each special card,
// 42 cards in all. Draws refill a hand to five; when the deck runs dry the
// discard pile is shuffled back in, so a duel never stalls.
import { SUIT_KEYS, SPECIALS, HAND_SIZE } from './config.js';
import { shuffle } from './random.js';

let nextId = 1;

export function makeCard(suit, value, kind, name, text) {
  return { id: nextId++, suit, value, kind, name, text };
}

export function buildDeck(rng) {
  const deck = [];
  for (const suit of SUIT_KEYS) {
    for (let value = 1; value <= 9; value++) {
      deck.push(makeCard(suit, value, 'number', String(value), ''));
    }
  }
  for (const key of ['ember', 'ember', 'ward', 'ward', 'mend', 'mend']) {
    const spec = SPECIALS[key];
    deck.push(makeCard(key, spec.value, key, spec.name, spec.text));
  }
  return shuffle(deck, rng);
}

export function drawUpTo(hand, deck, discard, rng) {
  while (hand.length < HAND_SIZE) {
    if (deck.length === 0) {
      if (discard.length === 0) return;
      deck.push(...shuffle(discard.splice(0), rng));
    }
    hand.push(deck.pop());
  }
}

export function sortHand(hand) {
  const suitOrder = { flame: 0, tide: 1, leaf: 2, stone: 3, ember: 4, ward: 5, mend: 6 };
  hand.sort((a, b) => (suitOrder[a.suit] ?? 9) - (suitOrder[b.suit] ?? 9) || b.value - a.value);
}
