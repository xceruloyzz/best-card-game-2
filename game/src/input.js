// EMBER COURT — input: mouse clicks on cards and buttons, keyboard 1–5 to
// play, Enter to start, R to duel again, M to mute. One handler, wired once.
import { playCard, nextRound, startDuel, restart } from './state.js';
import { sfx, toggleMute } from './audio.js';

export function wireInput(game, root, rerender) {
  root.addEventListener('click', (event) => {
    const cardEl = event.target.closest('.card.playable');
    if (cardEl) {
      const index = Number(cardEl.dataset.index);
      if (playCard(game, index)) {
        sfx.play();
        rerender();
      }
      return;
    }
    if (event.target.closest('#start-btn')) {
      sfx.click();
      startDuel(game);
      rerender();
      return;
    }
    if (event.target.closest('#again-btn')) {
      sfx.click();
      restart(game);
      rerender();
      return;
    }
    if (event.target.closest('#next-round')) {
      sfx.flip();
      nextRound(game);
      rerender();
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.code;
    if (key === 'Enter' && game.screen === 'title') {
      startDuel(game);
      sfx.click();
      rerender();
      return;
    }
    if (key === 'KeyR' && (game.screen === 'win' || game.screen === 'loss')) {
      restart(game);
      sfx.click();
      rerender();
      return;
    }
    if (key === 'KeyM') {
      const nowMuted = toggleMute();
      game.banner = nowMuted ? 'Sound muted.' : 'Sound on.';
      rerender();
      return;
    }
    if (game.screen === 'play' && !game.resolving && /^Digit[1-5]$/.test(key)) {
      const index = Number(key.slice(5)) - 1;
      if (playCard(game, index)) {
        sfx.play();
        rerender();
      }
    }
  });
}
