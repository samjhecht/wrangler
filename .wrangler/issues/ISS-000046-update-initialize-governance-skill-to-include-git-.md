---
id: ISS-000046
title: Update initialize-governance skill to include git hooks setup question
type: issue
status: open
priority: high
labels:
  - skill
  - integration
  - initialize-governance
createdAt: '2026-01-21T22:19:45.931Z'
updatedAt: '2026-01-21T22:19:45.931Z'
project: Wrangler Core Framework
wranglerContext:
  parentTaskId: SPEC-000041
  estimatedEffort: ~50 LOC
---
## Overview
Modify the existing initialize-governance skill to offer git hooks setup as part of the governance initialization workflow.

## Requirements
- Modify file: `skills/initialize-governance/SKILL.md`
- Add question in Phase 1 (Discovery and Planning):
  - Question: "Set up Git hooks for automated testing and code quality?"
  - Options:
    - "Yes (Recommended)" - Auto-format code, run tests before commits/pushes
    - "No, manual setup" - I'll configure hooks manually later
    - "Skip for now" - Don't set up hooks
  - Single select (not multi-select)
- If user selects "Yes", invoke Skill tool with skill="setup-git-hooks"
- Add to documentation that git hooks are optional but recommended
- Update skill version/changelog

## Implementation Details
Add after constitution/roadmap questions, before file creation:
```markdown
## Phase 1: Discovery and Planning

### Step X: Git Hooks Setup (Optional)

Ask the user if they want to set up Git hooks for code quality enforcement.

[AskUserQuestion with the question and options above]

If "Yes (Recommended)" selected:
- Invoke Skill tool with skill="setup-git-hooks"
- Wait for completion
- Continue with remaining governance setup
```

## Acceptance Criteria
- Question added to skill workflow
- Proper option structure
- Conditional skill invocation
- Updated documentation
- Tested with governance initialization flow
- Doesn't break existing functionality

## Dependencies
- Requires setup-git-hooks skill (ISS-000048)

## File Location
`skills/initialize-governance/SKILL.md`

## Estimated Effort
~50 LOC additions to existing skill
