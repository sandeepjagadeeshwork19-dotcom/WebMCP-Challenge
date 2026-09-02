/**
 * Minimal typings for the WebMCP browser API.
 * https://webmachinelearning.github.io/webmcp/
 *
 * The object lives at `navigator.modelContext` in Chrome's early-preview build
 * and at `document.modelContext` in the editor's draft / ChatGPT's in-app
 * browser. We accept whichever the runtime provides.
 */

export interface WebMcpToolResult {
  content: Array<{ type: "text"; text: string }>;
  structuredContent?: unknown;
  isError?: boolean;
}

export interface WebMcpToolDefinition {
  name: string;
  title?: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  /** WebMCP's ToolAnnotations: readOnlyHint + untrustedContentHint. */
  annotations?: {
    readOnlyHint?: boolean;
    untrustedContentHint?: boolean;
    [key: string]: unknown;
  };
  execute: (
    input: unknown,
    context: { signal: AbortSignal },
  ) => WebMcpToolResult | Promise<WebMcpToolResult>;
}

export interface ModelContext {
  registerTool: (
    tool: WebMcpToolDefinition,
    options?: { signal?: AbortSignal },
  ) => Promise<unknown>;
}

declare global {
  interface Document {
    modelContext?: ModelContext;
  }
  interface Navigator {
    modelContext?: ModelContext;
  }
}

function usable(candidate: unknown): candidate is ModelContext {
  return (
    !!candidate &&
    typeof (candidate as ModelContext).registerTool === "function"
  );
}

/** The runtime's model context — `navigator.modelContext` (Chrome preview) or
 *  `document.modelContext` (editor draft / ChatGPT in-app browser). */
export function getModelContext(): ModelContext | null {
  if (typeof navigator !== "undefined" && usable(navigator.modelContext)) {
    return navigator.modelContext as ModelContext;
  }
  if (typeof document !== "undefined" && usable((document as Document).modelContext)) {
    return (document as Document).modelContext as ModelContext;
  }
  return null;
}

export function isWebMcpSupported(): boolean {
  return getModelContext() !== null;
}
