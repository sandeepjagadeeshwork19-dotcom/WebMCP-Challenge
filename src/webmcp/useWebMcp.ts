/** React hook that registers the WebMCP tools for the lifetime of the app. */

import { useEffect, useState } from "react";
import { useStore } from "../state/store";
import { registerWebMcpTools } from "./register";
import { isWebMcpSupported } from "./types";

export type WebMcpStatus = "detecting" | "unsupported" | "registered" | "error";

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

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    registerWebMcpTools(store)
      .then((result) => {
        if (cancelled) {
          result.unregister();
          return;
        }
        cleanup = result.unregister;
        setState({
          status: result.registeredTools.length > 0 ? "registered" : "error",
          registeredTools: result.registeredTools,
        });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error", registeredTools: [] });
      });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [store]);

  return state;
}
