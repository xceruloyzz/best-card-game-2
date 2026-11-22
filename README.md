# EMBER COURT — a duel of elemental cards

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/xceruloyzz/best-card-game-2/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/xceruloyzz/best-card-game-2/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

A complete, original card duel in vanilla JavaScript — no libraries, no
network, every card drawn and every sound synthesized from code. You face the
**Warden of Cinders** across a felt table: 30 life each, a hand of five, and a
deck of 42 elemental cards. Win the trick, deal the damage, take the Court.

## The game

- **A real duel, not a puzzle** — each round both sides play one card face up;
  the stronger card wins the trick and the loser takes damage equal to the gap.
- **A suit cycle you can read** — Flame burns Leaf, Leaf cracks Stone, Stone
  dams Tide, Tide douses Flame: a beating suit is +2 power. The suit that won
  the last trick keeps +1 momentum, so streaks matter.
- **Specials that change the hand** — Ember burns at power 10, Ward blocks all
  damage and mends 2, Mend heals 5. Two of each in the deck.
- **An opponent with a tell** — the Warden remembers the suit you led with,
  saves its Ember for when it is losing, and spends its smallest card that can
  still win. Bait the big card, then punish the small one.
- **Full game flow** — title screen, the table with your hand and the Warden's
  face-down hand, readable values and suits on every card, life bars, a duel
  log, and win and loss screens with final stats.
- **Feel** — cards lift on hover, dealt cards slide in, damage thuds, victory
  rings out. All sound is synthesized WebAudio; M mutes.
- **Deterministic** — a seeded shuffle (`?seed=N` replays it), so every duel
  can be replayed and every screenshot reproduced.

## How to play

Open `game/index.html` in a desktop browser (or serve `game/` with any
static server). No build step, no network request.

- Click a card, or press **1–5**, to play it.
- **Enter** starts the duel, **R** duels again, **M** mutes.
- Reduce the Warden to 0 life before yours runs out.

## Layout

- `game/index.html` — the table, styles and entry point
- `game/src/config.js` — suits, specials and duel rules
- `game/src/random.js` — seeded shuffle
- `game/src/deck.js` — the 42-card deck, draws and reshuffles
- `game/src/ai.js` — the Warden's card choice
- `game/src/state.js` — duel state and trick resolution
- `game/src/render.js` — the table, hands, life bars and overlays
- `game/src/audio.js` — synthesized WebAudio sounds
- `game/src/input.js` — mouse and keyboard
- `game/src/shots.js` — deterministic screenshot tableaus (`?shot=`)
- `game/src/main.js` — bootstrap
- `main.ts` — the make.fun entry program (copies `game/` + `screenshots/`,
  writes `dossier.json`)
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged
