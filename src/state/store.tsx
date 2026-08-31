/**
 * The single in-memory store. One instance is created per app mount and shared,
 * by reference, between the React tree and the WebMCP handlers.
 */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { reducer } from "./reducer";
import { createInitialState, type AppState } from "./appState";
import type { AppAction } from "./actions";

export type Clock = () => string;

export interface Store {
  getState: () => AppState;
  dispatch: (action: AppAction) => AppState;
  subscribe: (listener: () => void) => () => void;
}

export function createStore(
  initialState: AppState = createInitialState(),
  clock: Clock = () => new Date().toISOString(),
): Store {
  let state = initialState;
  const listeners = new Set<() => void>();

  return {
    getState: () => state,
    dispatch: (action) => {
      const stamped: AppAction =
        "timestamp" in action && action.timestamp
          ? action
          : ({ ...action, timestamp: clock() } as AppAction);
      const next = reducer(state, stamped);
      if (next !== state) {
        state = next;
        for (const listener of listeners) listener();
      }
      return state;
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({
  children,
  store,
}: {
  children: ReactNode;
  store?: Store;
}) {
  const [fallback] = useState(() => createStore());
  const value = store ?? fallback;
  useEffect(() => {
    if (import.meta.env.DEV && typeof window !== "undefined") {
      (window as unknown as { __nd?: Store }).__nd = value;
    }
  }, [value]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used within a StoreProvider");
  return store;
}

export function useAppState(): AppState {
  const store = useStore();
  return useSyncExternalStore(store.subscribe, store.getState, store.getState);
}

export function useAppSelector<T>(selector: (state: AppState) => T): T {
  const state = useAppState();
  return useMemo(() => selector(state), [selector, state]);
}

export function useDispatch(): Store["dispatch"] {
  return useStore().dispatch;
}
