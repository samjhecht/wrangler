---
id: ISS-000038
title: Implement session_start MCP tool
type: issue
status: open
priority: high
labels:
  - mcp
  - session
  - tool
  - SPEC-000038
createdAt: '2025-12-08T02:46:35.326Z'
updatedAt: '2025-12-08T02:46:35.326Z'
project: SPEC-000038
---
## Overview
Create MCP tool to initialize a new orchestration session.

## Requirements
1. Create `mcp/tools/session/start.ts`
2. Parameters: specFile (required), workingDirectory (optional)
3. Must:
   - Generate session ID: `{date}-{git-short-hash}-{random-hex}`
   - Create session directory `.wrangler/sessions/{sessionId}/`
   - Create worktree with naming: `.worktrees/{spec-name}`
   - Create branch: `wrangler/{spec-name}/{session-id}`
   - Initialize context.json and audit.jsonl
   - Log init entry to audit
4. Return: sessionId, status, currentPhase, auditPath, worktreePath, branchName

## Acceptance Criteria
- Tool creates all required directories/files
- Session ID format matches spec
- Worktree and branch created correctly
- Audit entry logged
- Comprehensive tests
