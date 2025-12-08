---
id: ISS-000039
title: Implement session_phase MCP tool
type: issue
status: open
priority: high
labels:
  - mcp
  - session
  - tool
  - SPEC-000038
createdAt: '2025-12-08T02:46:35.508Z'
updatedAt: '2025-12-08T02:46:35.508Z'
project: SPEC-000038
---
## Overview
Create MCP tool to record phase transitions.

## Requirements
1. Create `mcp/tools/session/phase.ts`
2. Parameters: sessionId, phase, status, metadata (optional)
3. Must:
   - Load session state
   - Update currentPhase
   - If status is "complete", add phase to phasesCompleted
   - Append audit entry with phase-specific metadata
   - Save session state
4. Return: phase, status, timestamp, eventLogged, phasesCompleted

## Acceptance Criteria
- Phase transitions logged correctly
- Session state updated atomically
- Metadata captured in audit
- Comprehensive tests
