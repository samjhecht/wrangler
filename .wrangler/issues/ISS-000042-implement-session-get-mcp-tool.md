---
id: ISS-000042
title: Implement session_get MCP tool
type: issue
status: open
priority: high
labels:
  - mcp
  - session
  - tool
  - SPEC-000038
createdAt: '2025-12-08T02:46:36.049Z'
updatedAt: '2025-12-08T02:46:36.049Z'
project: SPEC-000038
---
## Overview
Create MCP tool to retrieve session state for recovery or status check.

## Requirements
1. Create `mcp/tools/session/get.ts`
2. Parameters: sessionId (optional - if omitted, find most recent incomplete)
3. Must:
   - If no sessionId, find most recent session with status "running" or "paused"
   - Load session state, checkpoint, and recent audit events
   - Return with resume guidance if applicable
4. Return: session, checkpoint, recentEvents, canResume, resumeInstructions

## Acceptance Criteria
- Can retrieve specific session by ID
- Can find most recent incomplete session
- Returns checkpoint and resume info
- Comprehensive tests
