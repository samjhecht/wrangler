---
id: ISS-000043
title: Register session tools in MCP server
type: issue
status: closed
priority: high
labels:
  - mcp
  - session
  - integration
  - SPEC-000038
createdAt: '2025-12-08T02:46:36.233Z'
updatedAt: '2025-12-08T02:53:24.927Z'
project: SPEC-000038
---
## Overview
Integrate all 5 session tools into the MCP server.

## Requirements
1. Create `mcp/tools/session/index.ts` with tool registration
2. Update `mcp/server.ts` to:
   - Import session tools
   - Add to getAvailableTools() list
   - Add cases to switch statement in callTool()
3. Ensure tools use shared provider factory pattern

## Acceptance Criteria
- All 5 session tools registered
- Tools accessible via MCP protocol
- Integration tests pass
- Server tests updated

---
**Completion Notes (2025-12-08T02:53:24.917Z):**
Registered all 5 session tools (session_start, session_phase, session_checkpoint, session_complete, session_get) in the MCP server. Updated server tests to verify 16 tools total (11 issue + 5 session). All 257 tests pass.
