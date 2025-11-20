---
name: executing-plans
description: Use when partner provides a complete implementation plan to execute in controlled batches with review checkpoints - loads plan, reviews critically, executes tasks in batches, reports for review between batches
---

# Executing Plans

## Overview

Load plan, review critically, execute tasks in batches, report for review between batches.

**Core principle:** Batch execution with checkpoints for architect review and mandatory code review.

**Announce at start:** "I'm using the executing-plans skill to implement this plan."

## The Process

### Step 1: Load and Review Plan

1. Read plan file
2. Review critically - identify any questions or concerns about the plan
3. If concerns: Raise them with your human partner before starting
4. If no concerns: Create TodoWrite and proceed

### Step 2: Execute Batch

**Default: First 3 tasks**

For each task in current batch:

#### 2.1: Pre-Implementation Check

Before starting each task:
- [ ] Understand requirement completely
- [ ] Know what tests to write
- [ ] Will follow TDD (test-driven-development)
- [ ] Will request code review after batch

See pre-implementation-checklist skill for full checklist.

#### 2.2: Implement with TDD

**MUST follow test-driven-development for each task:**

1. **RED**: Write failing test
2. **GREEN**: Implement minimal code to pass
3. **REFACTOR**: Improve code quality

**Before moving to next task:**
- [ ] Watched test fail first
- [ ] Watched test pass after implementation
- [ ] All tests still passing (no regressions)

#### 2.3: Verify Task Complete

Use verification-before-completion for each task:
- [ ] Tests pass
- [ ] No errors or warnings
- [ ] Requirements met
- [ ] Evidence captured

Move to next task only when current task verified complete.

### Step 3: Report, Review, and Code Review

When batch complete:

#### 3.1: Report Batch Completion

Show what was implemented in this batch:

```markdown
## Batch N Complete

### Tasks Completed
- [Task 1 description] - Implemented, tests passing
- [Task 2 description] - Implemented, tests passing

### Verification Output
```
[Test execution output showing all passing]
```

### Files Changed
- src/auth.ts (modified)
- src/users.ts (new)
- tests/auth.test.ts (modified)
```

#### 3.2: Request Code Review (MANDATORY)

**Code review is REQUIRED after each batch:**

```markdown
I've completed batch N and need code review before proceeding.

Files for review:
- src/auth.ts
- src/users.ts
- tests/auth.test.ts

Context:
- Implemented tasks [X, Y, Z] from plan
- All tests passing
- Ready for review
```

**Dispatch code-reviewer subagent:**

See requesting-code-review skill for full instructions.

#### 3.3: Address Review Feedback

**BEFORE proceeding to next batch:**

- [ ] Review completed
- [ ] Critical issues: 0 (must fix all)
- [ ] Important issues: 0 or acknowledged
- [ ] Minor issues: Noted for future

**If Critical or Important issues found:**
1. STOP - Do not proceed to next batch
2. Fix issues in current batch
3. Re-run tests
4. Request follow-up review if needed
5. Only proceed when review status: "Approved"

#### 3.4: Announce Batch Ready

Only after code review approved:

"Batch N complete and reviewed. Ready for feedback or next batch."

## Code Review Gate

```
BEFORE proceeding to next batch or completion:

  IF code changes made in this batch:
    Have you requested code review?
      NO → STOP - Request review now
      YES → Continue

    Has review been completed?
      NO → STOP - Wait for review
      YES → Continue

    Are there Critical issues?
      YES → STOP - Fix before proceeding
      NO → Continue

    Are there Important issues?
      YES → STOP - Fix or acknowledge with plan
      NO → Continue

  ONLY THEN: Proceed to next batch
```

### Step 4: Continue or Complete

After batch reviewed and feedback received:

**Option A: More batches remain**

```markdown
"Batch N complete and reviewed. Starting batch N+1."

[Return to Step 1 with next batch]
```

**Option B: All batches complete**

```markdown
"All batches complete. Verifying full plan completion..."
```

**Before claiming plan complete, verify:**

- [ ] All batches completed
- [ ] All batches received code review
- [ ] All Critical/Important issues resolved
- [ ] All tests passing
- [ ] Full plan requirements met

**Use verification-before-completion for final check.**

Then:
- Use finishing-a-development-branch skill
- Options: Merge to main, Create PR, Continue work, or Discard

### Step 5: Complete Development

After all tasks complete and verified:
- Announce: "I'm using the finishing-a-development-branch skill to complete this work."
- **REQUIRED SUB-SKILL:** Use wrangler:finishing-a-development-branch
- Follow that skill to verify tests, present options, execute choice

## When to Stop and Ask for Help

**STOP executing immediately when:**
- Hit a blocker mid-batch (missing dependency, test fails, instruction unclear)
- Plan has critical gaps preventing starting
- You don't understand an instruction
- Verification fails repeatedly
- Code review returns Critical issues (must fix before proceeding)

**Ask for clarification rather than guessing.**

## When to Revisit Earlier Steps

**Return to Review (Step 1) when:**
- Partner updates the plan based on your feedback
- Fundamental approach needs rethinking
- Code review identifies architectural issues

**Don't force through blockers** - stop and ask.

## Red Flags - STOP IMMEDIATELY

If you catch yourself:

**Execution red flags:**
- Skipping plan review
- Executing more than 3 tasks without checkpoint
- Continuing when blocked
- Guessing what an unclear instruction means
- Skipping verifications

**Code review red flags:**
- Thinking "I'll do code review at the end"
- Skipping code review for "small changes"
- Proceeding to next batch with unresolved Critical issues
- Claiming batch complete without requesting review
- Not waiting for review approval before next batch

## Integration with Other Skills

**Integration with:**
- writing-plans: Receives plan to execute
- test-driven-development: MANDATORY for each task
- verification-before-completion: Use after each task AND after full plan
- requesting-code-review: MANDATORY after each batch
- code-review: Framework for reviewing batch changes
- finishing-a-development-branch: Use when all batches complete
- pre-implementation-checklist: Use before starting each task

## Example: Executing Plan with Code Review

```
Plan has 6 tasks, split into 2 batches:
- Batch 1: Tasks 1-3 (auth system)
- Batch 2: Tasks 4-6 (user management)

## Batch 1 Execution

1. Split tasks: [Tasks 1-3]
2. Execute each task with TDD:
   - Task 1: Write test → Fail → Implement → Pass
   - Task 2: Write test → Fail → Implement → Pass
   - Task 3: Write test → Fail → Implement → Pass
3. Report batch 1 complete:
   - Show: 3 tasks done, tests passing
   - Request code review (dispatch code-reviewer)
4. Review feedback received:
   - Critical: 0
   - Important: 1 (missing error handling in auth)
   - Minor: 2 (naming suggestions)
5. Fix Important issue:
   - Add error handling
   - Write test for error path
   - Re-run all tests → Pass
6. Announce: "Batch 1 complete and reviewed. Starting batch 2."

## Batch 2 Execution

1. Split tasks: [Tasks 4-6]
2. Execute each task with TDD: [same process]
3. Report batch 2 complete
4. Request code review
5. Review feedback: All approved
6. Announce: "Batch 2 complete and reviewed."

## Final Verification

1. All batches complete: ✓
2. All batches reviewed: ✓
3. All issues resolved: ✓
4. Use verification-before-completion: ✓
5. Use finishing-a-development-branch: ✓

"Plan execution complete. All batches implemented, tested, and reviewed."
```

## Remember

- Review plan critically first
- Follow plan steps exactly
- Don't skip verifications
- Reference skills when plan says to
- Between batches: report, request code review, wait for approval
- Stop when blocked, don't guess
- Code review is mandatory after each batch - no exceptions
