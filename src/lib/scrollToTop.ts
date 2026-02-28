/** Ease-out cubic: fast at start, slow at end */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Scroll the window to the top with an ease-out animation.
 * @param durationMs - Animation duration in milliseconds (default 600)
 */
export function scrollToTopEaseOut(durationMs = 600): void {
  const start = window.scrollY;
  if (start <= 0) return;
  const startTime = performance.now();

  function step(now: number) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / durationMs, 1);
    const eased = easeOutCubic(t);
    window.scrollTo(0, start * (1 - eased));
    if (t < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}
