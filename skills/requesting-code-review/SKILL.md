---
name: requesting-code-review
description: Use when completing tasks, implementing major features, or before merging to verify work meets requirements - dispatches code-review subagent to review implementation against plan or requirements before proceeding
---

# Requesting Code Review

Dispatch a subagent using the `code-review` skill to catch issues before they cascade.

**Core principle:** Review early, review often.

**Review Framework**: See `code-review` skill for comprehensive review process (6 phases: plan alignment, code quality, architecture, testing, security/performance, documentation).

## When to Request Review

**Mandatory:**
- After each task in subagent-driven development
- After completing major feature
- Before merge to main

**Optional but valuable:**
- When stuck (fresh perspective)
- Before refactoring (baseline check)
- After fixing complex bug

## How to Request

**1. Get git SHAs:**
```bash
BASE_SHA=$(git rev-parse HEAD~1)  # or origin/main
HEAD_SHA=$(git rev-parse HEAD)
```

**2. Dispatch code-review subagent:**

Use Task tool with `general-purpose` subagent type, instructing it to use the `code-review` skill.

**Provide to subagent:**
- What was implemented (feature/task description)
- Plan or requirements it should meet (file path or description)
- Git range to review (BASE_SHA..HEAD_SHA)
- Any specific concerns to focus on

**3. Act on feedback:**
- Fix Critical issues immediately
- Fix Important issues before proceeding
- Note Minor issues for later
- Push back if reviewer is wrong (with reasoning)

## Example

```
[Just completed Task 2: Add verification function]

You: Let me request code review before proceeding.

BASE_SHA=$(git log --oneline | grep "Task 1" | head -1 | awk '{print $1}')
HEAD_SHA=$(git rev-parse HEAD)

[Use Task tool with general-purpose subagent:]
"Use the code-review skill to review my implementation of Task 2 from
docs/plans/deployment-plan.md. Review changes from a7981ec..3df7661.

I implemented verification and repair functions for conversation index
(verifyIndex() and repairIndex() with 4 issue types). Please check if
implementation meets plan requirements and identify any quality issues."

[Subagent returns structured review]:
  Overall Assessment: Ready to merge with minor fixes

  Strengths:
  - Clean architecture with proper separation
  - Real integration tests, not just mocks
  - Comprehensive issue type detection

  Critical Issues: 0
  Important Issues: 1
    - Missing progress indicators for long-running operations
  Minor Issues: 1
    - Magic number (100) for reporting interval should be constant

  Recommendation: Fix Important issue, Minor can be deferred

You: [Fix progress indicators]
You: [Continue to Task 3]
```

## Integration with Workflows

**Subagent-Driven Development:**
- Review after EACH task
- Catch issues before they compound
- Fix before moving to next task

**Executing Plans:**
- Review after each batch (3 tasks)
- Get feedback, apply, continue

**Ad-Hoc Development:**
- Review before merge
- Review when stuck

## Red Flags

**Never:**
- Skip review because "it's simple"
- Ignore Critical issues
- Proceed with unfixed Important issues
- Argue with valid technical feedback

**If reviewer wrong:**
- Push back with technical reasoning
- Show code/tests that prove it works
- Request clarification

See `code-review` skill for detailed review framework and output format.
