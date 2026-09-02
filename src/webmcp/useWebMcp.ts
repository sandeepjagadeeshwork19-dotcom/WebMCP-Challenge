/** React hook that registers the WebMCP tools for the lifetime of the app. */

import { useEffect, useState } from "react";
import { useStore } from "../state/store";
import { TOOL_NAMES } from "./contracts";
import { registerWebMcpTools } from "./register";
import { isWebMcpSupported } from "./types";

export type WebMcpStatus = "detecting" | "unsupported" | "registered" | "degraded" | "error";

export interface WebMcpState {
  status: WebMcpStatus;
  registeredTools: string[];
}

export function useWebMcp(): WebMcpState {
  const store = useStore();
  const [state, setState] = useState<WebMcpState>(() => ({
    status: isWebMcpSupported() ? "detecting" : "unsupported",
    registeredTools: [],
  }));

  useEffect(() => {
    if (!isWebMcpSupported()) return;

    const controller = new AbortController();
    let started = false;

    // Defer one tick so StrictMode's setup / cleanup / setup collapses to a
    // single real registration pass — the cleanup below clears this timer
    // before it fires on the first (discarded) setup.
    const timer = setTimeout(() => {
      started = true;
      registerWebMcpTools(store, controller.signal)
        .then((names) => {
          if (controller.signal.aborted) return;
          setState({
            status: names.length === TOOL_NAMES.length ? "registered" : names.length > 0 ? "degraded" : "error",
            registeredTools: names,
          });
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setState({ status: "error", registeredTools: [] });
          }
        });
    }, 0);

    return () => {
      clearTimeout(timer);
      if (started) controller.abort();
    };
  }, [store]);

  return state;
}
