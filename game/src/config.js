// EMBER COURT — configuration: the suits, the special cards and the duel rules.
// Suits form a cycle: Flame burns Leaf, Leaf cracks Stone, Stone dams Tide,
// Tide douses Flame. Playing a suit that beats the other card's suit is +2 power.
// The same suit as the last trick's winning card carries +1 momentum.
export const START_HP = 30;
export const HAND_SIZE = 5;
export const MAX_HP = 30;
export const ADVANTAGE_BONUS = 2;
export const MOMENTUM_BONUS = 1;
export const EMBER_VALUE = 10;
export const MEND_HEAL = 5;
export const WARD_HEAL = 2;
export const TIE_DAMAGE = 0;

export const SUITS = {
  flame: { key: 'flame', name: 'Flame', glyph: '\u{1F525}', color: '#ff7a3d', ink: '#7c2d12', beats: 'leaf' },
  tide: { key: 'tide', name: 'Tide', glyph: '\u{1F4A7}', color: '#38bdf8', ink: '#0c4a6e', beats: 'flame' },
  leaf: { key: 'leaf', name: 'Leaf', glyph: '\u{1F343}', color: '#4ade80', ink: '#14532d', beats: 'stone' },
  stone: { key: 'stone', name: 'Stone', glyph: '\u{1FAA8}', color: '#d9a05b', ink: '#44403c', beats: 'tide' },
};

export const SUIT_KEYS = ['flame', 'tide', 'leaf', 'stone'];

// Special cards, two of each in the deck besides the numbered cards.
export const SPECIALS = {
  ember: { kind: 'ember', name: 'Ember', glyph: '\u{1F525}', value: EMBER_VALUE, text: 'Wild flame. Power 10.' },
  ward: { kind: 'ward', name: 'Ward', glyph: '\u{1F6E1}', value: 0, text: 'Blocks damage, heals 2.' },
  mend: { kind: 'mend', name: 'Mend', glyph: '\u{2728}', value: 1, text: 'Heals 5 after the trick.' },
};

export const OPPONENT_NAME = 'Warden of Cinders';
export const PLAYER_NAME = 'You';
