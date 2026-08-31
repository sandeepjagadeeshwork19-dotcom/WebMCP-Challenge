import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { StoreProvider, createStore, type Store } from "../state/store";

export function renderWithStore(ui: ReactElement, store?: Store) {
  const activeStore = store ?? createStore(undefined, () => "2026-08-31T12:00:00.000Z");
  return {
    store: activeStore,
    ...render(<StoreProvider store={activeStore}>{ui}</StoreProvider>),
  };
}
