import { useEffect, useRef } from "react";

/** Flips true once any stage has mounted — the very first paint must not scroll. */
let appHasMounted = false;

/**
 * Move keyboard focus to a stage's top element when that stage mounts, so a
 * keyboard or screen-reader user isn't stranded at <body> after a transition.
 * On the first paint it focuses without scrolling, so the masthead stays in
 * view; on later transitions it scrolls the new stage into view.
 * Attach the returned ref to a container with `tabIndex={-1}`.
 */
export function useStageFocus<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const firstPaint = !appHasMounted;
    appHasMounted = true;
    ref.current?.focus({ preventScroll: firstPaint });
  }, []);
  return ref;
}
