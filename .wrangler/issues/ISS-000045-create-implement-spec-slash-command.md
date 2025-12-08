---
id: ISS-000045
title: Create implement-spec slash command
type: issue
status: closed
priority: medium
labels:
  - command
  - SPEC-000038
createdAt: '2025-12-08T02:46:36.611Z'
updatedAt: '2025-12-08T02:55:47.446Z'
project: SPEC-000038
---
## Overview
Create slash command entry point for the orchestrator.

## Requirements
1. Create `commands/implement-spec.md`
2. Command should:
   - Accept spec file as parameter
   - Load and invoke implement-spec skill
   - Present completion summary

## Acceptance Criteria
- Command registered in commands/
- Invokes skill correctly
- Clear usage documentation

---
**Completion Notes (2025-12-08T02:55:47.435Z):**
Updated the existing implement slash command to route to implement-spec skill when user explicitly requests PR creation. Added skill selection guidance table.
