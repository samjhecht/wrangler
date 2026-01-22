---
id: ISS-000049
title: Update existing testing skills documentation for git hooks integration
type: issue
status: open
priority: medium
labels:
  - documentation
  - integration
  - testing-skills
createdAt: '2026-01-21T22:19:46.330Z'
updatedAt: '2026-01-21T22:19:46.330Z'
project: Wrangler Core Framework
wranglerContext:
  parentTaskId: SPEC-000041
  estimatedEffort: ~60 LOC
---
## Overview
Update documentation in existing testing-related skills to reference git hooks and clarify how they interact with the enforcement framework.

## Skills to Update

### 1. run-the-tests skill
- Add note about git hooks running tests automatically
- Clarify when to use skill vs. letting hooks handle it
- Reference bypass mechanism for debugging

### 2. test-driven-development skill
- Add note about RED phase and git hooks
- Clarify that hooks may block commits with failing tests
- Explain bypass for TDD workflow (write failing test, bypass commit, then fix)
- Document expected workflow with hooks enabled

### 3. verification-before-completion skill
- Reference git hooks as automated verification layer
- Note that hooks provide first-line verification
- Clarify that skill adds human verification on top
- Update completion checklist to include "hooks passing"

## Requirements
- Modify skill SKILL.md files with additional sections
- Add "Git Hooks Integration" subsection to each
- Provide clear guidance on interaction
- Update examples if needed
- Maintain backward compatibility for projects without hooks

## Key Messages
- **run-the-tests**: Hooks automate testing, but skill is for manual/debugging scenarios
- **test-driven-development**: Hooks support TDD but may require bypass for RED phase commits
- **verification-before-completion**: Hooks provide automated verification baseline

## Acceptance Criteria
- All three skills updated
- New sections added with clear guidance
- Examples updated if applicable
- No breaking changes to existing workflows
- Documentation clear and helpful

## File Locations
- `skills/run-the-tests/SKILL.md`
- `skills/test-driven-development/SKILL.md`
- `skills/verification-before-completion/SKILL.md`

## Estimated Effort
~60 LOC additions (20 LOC per skill)
