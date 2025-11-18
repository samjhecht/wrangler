---
name: writing-plans
description: Use when design is complete and you need detailed implementation tasks - creates comprehensive implementation plans with exact file paths, complete code examples, and verification steps. Creates both markdown plan file AND tracked issues via MCP tools for full traceability.
---

# Writing Plans

## Overview

Write comprehensive implementation plans assuming the engineer has zero context for our codebase. Document everything they need to know: which files to touch for each task, code, testing, docs they might need to check, how to test it. Give them the whole plan as bite-sized tasks. DRY. YAGNI. TDD. Frequent commits.

Create both:
1. **Plan file** (`plans/YYYY-MM-DD-PLAN_<spec>.md`) - Detailed implementation guide
2. **MCP issues** (via `issues_create`) - Tracked tasks in issue system

**Announce at start:** "I'm using the writing-plans skill to create the implementation plan."

**Context:** This should be run in a dedicated worktree (created by brainstorming skill).

**Headless mode:** If run as subagent, do not stop to ask for feedback during execution.

## Bite-Sized Task Granularity

**Each step is one action (2-5 minutes):**

- "Write the failing test" - step
- "Run it to make sure it fails" - step
- "Implement the minimal code to make the test pass" - step
- "Run the tests and make sure they pass" - step
- "Commit" - step

## Plan Document Header

**Every plan MUST start with this header:**

```markdown
# [Feature Name] Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use wrangler:executing-plans to implement this plan task-by-task.

**Goal:** [One sentence describing what this builds]

**Architecture:** [2-3 sentences about approach]

**Tech Stack:** [Key technologies/libraries]

---
```

## Task Structure

````markdown
### Task N: [Component Name]

**Files:**

- Create: `exact/path/to/file.py`
- Modify: `exact/path/to/existing.py:123-145`
- Test: `tests/exact/path/to/test.py`

**Step 1: Write the failing test**

```python
def test_specific_behavior():
    result = function(input)
    assert result == expected
```
````

**Step 2: Run test to verify it fails**

Run: `pytest tests/path/test.py::test_name -v`
Expected: FAIL with "function not defined"

**Step 3: Write minimal implementation**

```python
def function(input):
    return expected
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/path/test.py::test_name -v`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/path/test.py src/path/file.py
git commit -m "feat: add specific feature"
```

```

## Remember
- Exact file paths always
- Complete code in plan (not "add validation")
- Exact commands with expected output
- Reference relevant skills with @ syntax
- DRY, YAGNI, TDD, frequent commits

## Planning Process

### Phase 1: Read and Analyze Specification

1. Read the specification file completely
2. Review existing codebase to understand:
   - What's already implemented
   - Existing patterns to follow
   - Where new code should live
3. Think deeply about best implementation approach
4. Consider architecture, design patterns, maintainability

### Phase 2: Draft Plan Document

1. Create draft plan at `plans/.drafts/YYYY-MM-DD-PLAN_<spec>.md`
2. Break specification into logical tasks
3. For each task, document:
   - Exact files to create/modify
   - Complete code examples
   - Test requirements
   - Verification steps
   - Commit message

**Think deeply** about task ordering:
- Tasks should build on each other incrementally
- Each task should be small (<250 LOC when implemented)
- No gaps - every step builds on earlier work

3. Review draft and refine task breakdown
4. Ensure tasks are right-sized and ordered correctly
5. Save final draft (this refreshes your memory during issue creation)

### Phase 3: Create MCP Issues

For each task in the plan, call `issues_create` with:

```typescript
{
  title: "Task N: [Short action-oriented title]",
  description: `## Description
[What this task implements - refer to specification]

## Context
Reference: [specification filename]
[Relevant context from spec]

## Files
- Create: \`path/to/new/file.ts\`
- Modify: \`path/to/existing.ts:45-67\`
- Test: \`path/to/test.ts\`

## Implementation Steps
1. Write failing test
2. Implement minimal code to pass
3. Verify tests pass
4. Commit changes

## Code Examples
[Include key code snippets from plan]

## Acceptance Criteria
- [ ] Test written and failing (RED)
- [ ] Implementation passes test (GREEN)
- [ ] Code refactored if needed (REFACTOR)
- [ ] All tests passing
- [ ] Committed with clear message

## Dependencies
- Requires completion of: Task [N-1]
`,
  type: "issue",
  status: "open",
  priority: "medium", // or high/low based on criticality
  labels: ["plan-step", "implementation"],
  project: "[specification filename]",
  wranglerContext: {
    agentId: "plan-executor",
    parentTaskId: "", // if breaking down larger issue
    estimatedEffort: "[time estimate if known]"
  }
}
```

**Important**: Use `issues_update` if you need to refine an issue after creation (don't create duplicates).

### Phase 4: Verify and Report

1. Use `issues_list` filtered by `project: [specification filename]` to verify all issues created
2. Review issue list to ensure:
   - All tasks from plan are present
   - Issues are in correct order
   - No duplicates or gaps
   - Task sizes are appropriate
3. Make any necessary adjustments using `issues_update`

## Execution Handoff

After creating plan and issues, offer execution choice:

**"Plan complete:**
- **Plan file**: `plans/YYYY-MM-DD-PLAN_<spec>.md`
- **Issues created**: [N] tasks in issue tracker (project: [spec])

**Execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?"**

**If Subagent-Driven chosen:**
- **REQUIRED SUB-SKILL:** Use `subagent-driven-development`
- Stay in this session
- Fresh subagent per task + code review

**If Parallel Session chosen:**
- Guide them to open new session in worktree
- **REQUIRED SUB-SKILL:** New session uses `executing-plans`

## Issue Update Pattern

If you discover during planning that a task needs refinement:

```typescript
// Instead of creating new issue
issues_update({
  id: "[issueId]",
  priority: "high", // change priority
  description: "[updated description]", // add more detail
  labels: ["plan-step", "implementation", "complex"] // add label
})
```

## Checklist Before Completion

- [ ] Specification fully read and analyzed
- [ ] Existing codebase reviewed for patterns
- [ ] Draft plan created and refined
- [ ] Every task in plan has corresponding MCP issue
- [ ] All issues reference the specification
- [ ] Issue list reviewed and verified (using `issues_list`)
- [ ] Tasks are ordered correctly
- [ ] No gaps in implementation steps
- [ ] Plan covers entire specification without overscoping

## Integration with Specifications

When working from a specification created with `writing-specifications` skill:
- Reference spec filename in all issues
- Follow any implementation notes in spec
- Honor constraints documented in spec
- Use architecture decisions from spec
- Create issues that map to spec's acceptance criteria
```
