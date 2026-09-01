/**
 * Minimal typings for the WebMCP browser API as described in the 26 August 2026
 * published draft: https://webmachinelearning.github.io/webmcp/
 *
 * Tools are registered on `document.modelContext` (not `navigator`).
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
  annotations?: {
    readOnlyHint?: boolean;
    destructiveHint?: boolean;
    idempotentHint?: boolean;
    openWorldHint?: boolean;
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
}

export function getModelContext(): ModelContext | null {
  if (typeof document === "undefined") return null;
  const candidate = (document as Document).modelContext;
  if (candidate && typeof candidate.registerTool === "function") {
    return candidate;
  }
  return null;
}

export function isWebMcpSupported(): boolean {
  return getModelContext() !== null;
}
