---
id: ISS-000037
title: Implement MCP session types and storage provider
type: issue
status: open
priority: high
labels:
  - mcp
  - types
  - session
  - SPEC-000038
createdAt: '2025-12-08T02:46:35.145Z'
updatedAt: '2025-12-08T02:46:35.145Z'
project: SPEC-000038
---
## Overview
Create TypeScript types and storage provider for session management.

## Requirements
1. Create `mcp/types/session.ts` with Session, SessionCheckpoint, and AuditEntry interfaces
2. Create `mcp/providers/session-storage.ts` with SessionStorageProvider class
3. Provider must handle:
   - Creating session directories in `.wrangler/sessions/{sessionId}/`
   - Reading/writing context.json (session state)
   - Appending to audit.jsonl (audit trail)
   - Reading/writing checkpoint.json
4. All paths must be validated against workspace boundaries

## Acceptance Criteria
- Types match spec's data model exactly
- Provider handles all CRUD operations
- Comprehensive test coverage (80%+)
- Path traversal protection in place
