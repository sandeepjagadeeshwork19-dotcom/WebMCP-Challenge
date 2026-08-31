import type { WebMcpState } from "../webmcp/useWebMcp";

export function UnsupportedWebMcpNotice({ webmcp }: { webmcp: WebMcpState }) {
  if (webmcp.status !== "unsupported" && webmcp.status !== "error") return null;

  return (
    <aside className="unsupported-notice" role="note">
      <h2>Agent tools unavailable</h2>
      <p>
        Agent tools are unavailable in this browser; the full manual workspace still works. Every
        resident priority, selection, locking, validation, review, finalisation and reset flow is
        fully functional. No project or constraint information is hidden, and no tool registration
        is claimed.
      </p>
    </aside>
  );
}
