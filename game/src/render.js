// EMBER COURT — the table: every pixel the player sees, built from the state.
// The layout is a felt table: the Warden's hand across the top (face down),
// the played cards in the middle, your hand along the bottom (face up, big
// and readable), life bars on both sides and the duel log on the right.
import { SUITS, SPECIALS, OPPONENT_NAME, PLAYER_NAME, MAX_HP, HAND_SIZE } from './config.js';

function esc(text) {
  return String(text).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

export function cardFaceHtml(card, opts = {}) {
  const suit = SUITS[card.suit];
  const isSpecial = card.kind !== 'number';
  const glyph = isSpecial ? SPECIALS[card.kind].glyph : suit.glyph;
  const color = isSpecial ? '#f59e0b' : suit.color;
  const suitName = isSpecial ? card.name : suit.name;
  const bigValue = isSpecial ? card.name : String(card.value);
  const sub = isSpecial ? card.text : `${suit.name} · power ${card.value}`;
  const playable = opts.playable ? ' playable' : '';
  const indexAttr = opts.index !== undefined ? ` data-index="${opts.index}"` : '';
  const keyHint = opts.index !== undefined ? `<span class="key-hint">${opts.index + 1}</span>` : '';
  const bottomCorner = isSpecial
    ? `<div class="card-corner bottom"><span class="card-glyph-small">${glyph}</span></div>`
    : `<div class="card-corner bottom"><span class="card-value">${esc(bigValue)}</span></div>`;
  return `<div class="card${playable}" style="--suit:${color}"${indexAttr} role="button" tabindex="0" aria-label="${esc(bigValue)} of ${esc(suitName)}">
    <div class="card-corner top"><span class="card-value">${esc(bigValue)}</span><span class="card-glyph-small">${glyph}</span></div>
    <div class="card-center"><span class="card-glyph">${glyph}</span><span class="card-suit-name">${esc(suitName)}</span></div>
    <div class="card-sub">${esc(sub)}</div>
    ${bottomCorner}
    ${keyHint}
  </div>`;
}

export function cardBackHtml(key) {
  return `<div class="card back" key="${key}"><div class="card-back-inner"><span class="back-glyph">\u{1F525}</span><span class="back-text">EMBER COURT</span></div></div>`;
}

function hpBarHtml(hp, label) {
  const pct = Math.max(0, Math.min(100, (hp / MAX_HP) * 100));
  const cls = pct > 50 ? 'hp-high' : pct > 25 ? 'hp-mid' : 'hp-low';
  return `<div class="hp-wrap"><span class="hp-label">${esc(label)}</span>
    <div class="hp-bar"><div class="hp-fill ${cls}" style="width:${pct}%"></div></div>
    <span class="hp-num">${hp} / ${MAX_HP}</span></div>`;
}

function playedSlotHtml(card, who) {
  if (!card) return `<div class="played-slot empty"><span>${who === 'ai' ? 'Warden plays…' : 'Play a card'}</span></div>`;
  return `<div class="played-slot"><div class="played-tag">${who === 'ai' ? 'Warden' : PLAYER_NAME}</div>${cardFaceHtml(card)}</div>`;
}

export function renderAll(game, root) {
  const isTitle = game.screen === 'title';
  const isEnd = game.screen === 'win' || game.screen === 'loss';
  const aiBacks = Array.from({ length: game.aiHand.length }, (_, i) => cardBackHtml(i)).join('');
  const playerCards = game.playerHand.map((card, i) =>
    cardFaceHtml(card, { playable: game.screen === 'play' && !game.resolving, index: i })).join('');
  const logLines = game.log.map((line) => `<li>${esc(line)}</li>`).join('');

  root.innerHTML = `
  <header class="topbar">
    <div class="brand"><span class="brand-glyph">\u{1F525}</span> EMBER COURT</div>
    <div class="top-stats">
      <span>Round <b>${game.round}</b></span>
      <span>Tricks <b>${game.tricksWon} – ${game.tricksLost}</b></span>
      <span>Deck <b>${game.deck.length}</b></span>
      <span class="mute-hint">M mute · R restart</span>
    </div>
  </header>
  <main class="table">
    <section class="opponent-row">
      <div class="side-info">
        <div class="side-name">${esc(OPPONENT_NAME)}</div>
        ${hpBarHtml(game.aiHp, 'Life')}
        <div class="side-note">${game.aiHand.length} cards in hand</div>
      </div>
      <div class="hand backs">${aiBacks}</div>
    </section>
    <section class="middle">
      <div class="played">${playedSlotHtml(game.playedAi, 'ai')}<div class="versus">VS</div>${playedSlotHtml(game.playedPlayer, 'player')}</div>
      <div class="banner-col">
        <div class="banner ${game.resolving ? 'show' : ''}">${esc(game.banner)}</div>
        ${game.screen === 'play' && game.resolving && !isEnd ? `<button class="next-btn" id="next-round">Next round →</button>` : ''}
      </div>
      <aside class="duel-log"><div class="log-title">Duel log</div><ul>${logLines}</ul>
        <div class="rules-note">Flame &gt; Leaf &gt; Stone &gt; Tide &gt; Flame: +2 power.<br>Last trick's suit keeps +1 momentum.</div>
      </aside>
    </section>
    <section class="player-row">
      <div class="side-info">
        <div class="side-name">${esc(PLAYER_NAME)}</div>
        ${hpBarHtml(game.playerHp, 'Life')}
        <div class="side-note">Click a card or press 1–${HAND_SIZE}</div>
      </div>
      <div class="hand mine">${playerCards}</div>
    </section>
  </main>
  ${isTitle ? titleOverlayHtml() : ''}
  ${isEnd ? endOverlayHtml(game) : ''}`;
}

function titleOverlayHtml() {
  return `<div class="overlay title-screen">
    <div class="overlay-card">
      <div class="title-glyph">\u{1F525}</div>
      <h1>EMBER COURT</h1>
      <p class="tagline">A duel of elemental cards against the Warden of Cinders.</p>
      <div class="howto">
        <div><b>1.</b> Play a card from your hand each round.</div>
        <div><b>2.</b> Higher power wins the trick — the loser takes the difference in damage.</div>
        <div><b>3.</b> Suits beat each other in a cycle: Flame &gt; Leaf &gt; Stone &gt; Tide &gt; Flame (+2).</div>
        <div><b>4.</b> Ember burns at power 10 · Ward blocks · Mend heals 5. First to 0 life loses.</div>
      </div>
      <button class="big-btn" id="start-btn">Enter the Court — Enter</button>
      <p class="foot">Click a card or press 1–5 · 30 life each · deck of 42</p>
    </div>
  </div>`;
}

function endOverlayHtml(game) {
  const won = game.screen === 'win';
  return `<div class="overlay ${won ? 'win-screen' : 'loss-screen'}">
    <div class="overlay-card">
      <div class="title-glyph">${won ? '\u{1F3C6}' : '\u{1F525}'}</div>
      <h1>${won ? 'THE COURT IS YOURS!' : 'THE WARDEN PREVAILS'}</h1>
      <p class="tagline">${esc(game.banner)}</p>
      <div class="final-stats">
        <div><span>Rounds</span><b>${game.round}</b></div>
        <div><span>Tricks won</span><b>${game.tricksWon} – ${game.tricksLost}</b></div>
        <div><span>Damage dealt</span><b>${game.damageDealt}</b></div>
        <div><span>Damage taken</span><b>${game.damageTaken}</b></div>
        <div><span>Life left</span><b>${game.playerHp} / ${MAX_HP}</b></div>
      </div>
      <button class="big-btn" id="again-btn">Duel again — R</button>
    </div>
  </div>`;
}
