---
id: ISS-000041
title: Implement session_complete MCP tool
type: issue
status: open
priority: high
labels:
  - mcp
  - session
  - tool
  - SPEC-000038
createdAt: '2025-12-08T02:46:35.865Z'
updatedAt: '2025-12-08T02:46:35.865Z'
project: SPEC-000038
---
## Overview
Create MCP tool to finalize a session.

## Requirements
1. Create `mcp/tools/session/complete.ts`
2. Parameters: sessionId, status, prUrl (optional), prNumber (optional), summary (optional)
3. Must:
   - Update session status and completedAt
   - Append complete entry to audit.jsonl
   - Calculate duration
4. Return: sessionId, status, startedAt, completedAt, durationMs, phasesCompleted, tasksCompleted, prUrl

## Acceptance Criteria
- Session finalized correctly
- Duration calculated
- PR info captured if provided
- Comprehensive tests
