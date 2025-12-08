---
id: ISS-000040
title: Implement session_checkpoint MCP tool
type: issue
status: open
priority: high
labels:
  - mcp
  - session
  - tool
  - SPEC-000038
createdAt: '2025-12-08T02:46:35.687Z'
updatedAt: '2025-12-08T02:46:35.687Z'
project: SPEC-000038
---
## Overview
Create MCP tool to save resumable state for recovery.

## Requirements
1. Create `mcp/tools/session/checkpoint.ts`
2. Parameters: sessionId, tasksCompleted, tasksPending, lastAction, resumeInstructions, variables (optional)
3. Must:
   - Generate checkpoint ID (ULID or similar)
   - Create/update checkpoint.json with full resumable state
   - Append checkpoint entry to audit.jsonl
4. Return: checkpointId, savedAt, canResume, tasksCompleted count, tasksPending count

## Acceptance Criteria
- Checkpoint saved correctly
- Checkpoint entry in audit
- Can be loaded for resume
- Comprehensive tests
