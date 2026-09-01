import { useEffect, useRef } from "react";

/**
 * Move keyboard focus to a stage's top element when that stage mounts, so a
 * keyboard or screen-reader user isn't stranded at <body> after each transition.
 * Attach the returned ref to a container with `tabIndex={-1}`.
 */
export function useStageFocus<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: false });
  }, []);
  return ref;
}
