---
id: ISS-000044
title: Create implement-spec orchestrator skill
type: issue
status: closed
priority: high
labels:
  - skill
  - orchestration
  - SPEC-000038
createdAt: '2025-12-08T02:46:36.426Z'
updatedAt: '2025-12-08T02:55:16.305Z'
project: SPEC-000038
---
## Overview
Create the main orchestrator skill that coordinates all phases.

## Requirements
1. Create `skills/implement/implement-spec/SKILL.md`
2. Skill must define 6 phases: INIT, PLAN, EXECUTE, VERIFY, PUBLISH, REPORT
3. Each phase must:
   - Call appropriate MCP session tools
   - Pass context to subagents
   - Handle errors appropriately
4. Include:
   - Worktree creation logic
   - Planning integration (writing-plans skill)
   - Implementation coordination (implement skill)
   - GitHub PR creation via gh CLI
   - Final report presentation

## Acceptance Criteria
- All 6 phases documented
- MCP tool usage shown for each phase
- Error handling for each phase
- PR body template included
- Recovery instructions included

---
**Completion Notes (2025-12-08T02:55:16.296Z):**
Created implement-spec orchestrator skill with full 6-phase workflow (INIT, PLAN, EXECUTE, VERIFY, PUBLISH, REPORT), worktree isolation guidance, session recovery instructions, and verification commands.
