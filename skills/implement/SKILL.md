---
name: implement
description: Autonomously implement tasks from specs, plans, or issues using subagents with TDD and code review
---

# Implement

## Overview

Autonomous implementation workflow that handles specifications, plans, issue ranges, or standalone issues.

**Core principle:** Dispatch subagent per task, automatic code review and fixes, only stop for genuine blockers

**Entry point:** `/wrangler:implement [scope]`

**Works in main branch OR worktree (no preference)**

**Headless mode:** Runs autonomously - does not stop for user checkpoints unless blocked

## When to Use

**Use this skill when:**
- Executing a complete specification or plan
- Implementing a range of related issues
- Working on a standalone issue that needs full implementation
- You want autonomous execution with quality gates

**Do NOT use this skill when:**
- Exploring or understanding code (use locating-code or analyzing-implementations)
- Answering questions about implementation (just answer directly)
- User wants manual control over each step (rare - ask user if unclear)

## Scope Parsing

The skill automatically determines what to implement based on your input.

### Supported Formats

**1. Specification files**

```bash
/wrangler:implement spec-auth-system.md
```

→ Loads spec from `.wrangler/specifications/`
→ Extracts linked MCP issues OR parses inline tasks
→ Executes all tasks sequentially

**2. Plan files**

```bash
/wrangler:implement plan-refactor.md
```

→ Loads plan from `plans/`
→ Extracts task list from plan
→ Executes all tasks sequentially

**3. Single issue**

```bash
/wrangler:implement issue #42
/wrangler:implement issue 42
```

→ Loads issue from MCP using issues_get
→ Treats entire issue as single task
→ Executes immediately

**4. Issue range**

```bash
/wrangler:implement issues 5-7
/wrangler:implement issues 5,6,7
```

→ Loads multiple issues from MCP
→ Executes sequentially (respects dependencies if specified)

**5. Context inference (no parameter)**

```bash
/wrangler:implement
```

→ Scans last 5 user messages for file or issue references
→ Uses most recent valid reference found
→ Error if nothing found: "Cannot infer scope. Specify file or issue."

### Parsing Algorithm

```
1. Check if scope parameter provided
   YES → Parse parameter (see format patterns above)
   NO → Go to step 2

2. Scan last 5 user messages in conversation
   - Look for file references (.md files)
   - Look for issue references (#N or "issue N")

3. Determine scope type:
   - Starts with "spec-" OR in .wrangler/specifications/ → Specification
   - Starts with "plan-" OR in plans/ → Plan
   - Contains "issue" or "#" → Issue reference

4. Load tasks:
   - Specification: Read file, extract linked issues via issues_list OR parse inline
   - Plan: Read file, extract task list
   - Issue(s): Load via MCP (issues_get or issues_list)

5. If nothing found:
   ERROR: "Cannot infer scope. Please specify:
   - Specification file (spec-name.md)
   - Plan file (plan-name.md)
   - Issue (#N or issue N)
   - Issue range (issues N-M)"
```

### Normalized Task Format

All scope types convert to standard task objects:

```typescript
interface Task {
  id: string;           // "spec-auth:task-1", "issue-42", "plan:task-3"
  title: string;        // Short task description
  description: string;  // Full requirements and context
  requirements: string; // What counts as "done" (acceptance criteria)
  relatedFiles: string[]; // Files likely to change (hints for subagent)
  dependencies: string[]; // IDs of tasks that must complete first
}
```

**Dependency handling:**
- Tasks with dependencies wait until prerequisite tasks complete
- If circular dependencies detected: ERROR and escalate to user
- If dependency references non-existent task: ERROR and escalate

## Task Executor Workflow

After scope is parsed and tasks are loaded, execute them in order.

### Setup Phase

1. **Create TodoWrite tracking**

   Create one todo per task:
   ```
   - Task 1: [title] (status: pending)
   - Task 2: [title] (status: pending)
   ...
   ```

2. **Verify working directory**

   Check current working directory:
   ```bash
   pwd
   git branch --show-current
   ```

   You can work in main branch OR worktree - no preference.
   If in worktree, subagents inherit that directory.

3. **Check dependencies**

   Build dependency graph:
   - If task has dependencies, mark as "blocked"
   - Only tasks with no pending dependencies are "ready"

### Execution Loop

For each task in "ready" state:

#### 1. Mark Task In Progress

```
TodoWrite: Mark task as in_progress
```

#### 2. Dispatch Implementation Subagent

Use the Task tool (general-purpose subagent):

```markdown
Tool: Task
Description: "Implement Task [N]: [title]"
Prompt: |
  You are implementing Task [N] from [scope reference].

  ## Task Requirements

  [Full task description from task.description]

  ## Acceptance Criteria

  [task.requirements]

  ## Related Files

  [task.relatedFiles]

  ## Your Job

  1. **Follow TDD** (test-driven-development skill):
     - RED: Write failing test first
     - GREEN: Implement minimal code to pass
     - REFACTOR: Improve code quality

  2. **Create TDD Compliance Certification**
     For each function you implement, document:
     - Function name and signature
     - Test file path
     - Whether you followed RED-GREEN-REFACTOR
     - Any deviations justified

     Format (from test-driven-development skill):
     ```
     | Function | Test File | Watched Fail? | Watched Pass? | Notes |
     |----------|-----------|---------------|---------------|-------|
     | funcName | test.ts:L | YES/NO        | YES/NO        | ...   |
     ```

  3. **Verify implementation works**
     - Run tests
     - Check for errors/warnings
     - Ensure requirements met

  4. **Commit your work**
     ```bash
     git add [files]
     git commit -m "[type]: [description]"
     ```

  5. **Report back**
     Provide:
     - Summary of what you implemented
     - Test results (pass/fail counts, output)
     - TDD Compliance Certification table
     - Files changed
     - Any issues or blockers encountered

  Work from: [current directory]

  IMPORTANT: If you encounter unclear requirements or missing information,
  STOP and report the blocker. Do not guess or make assumptions.
```

#### 3. Verify Subagent Response

Check subagent's report for:

- ✅ Implementation summary provided
- ✅ Test results provided (all passing)
- ✅ TDD Compliance Certification included
- ✅ Files changed list provided
- ✅ Work committed to git

**If certification missing:**
→ STOP and request: "Please provide TDD Compliance Certification for functions implemented"

**If tests failing:**
→ Continue to code review (reviewer will catch issues)

**If blocker reported:**
→ ESCALATE to user immediately with blocker details

#### 4. Update Dependencies

After task completes:

1. Mark this task's ID as "complete" in dependency tracker
2. Check all "blocked" tasks
3. For each blocked task, remove this task from its dependency list
4. If blocked task now has zero dependencies, mark as "ready"

#### 5. Continue to Code Review

(This will be added in next task - code review automation)

### Dependency Resolution Example

```
Task graph:
- Task A: no dependencies → "ready"
- Task B: depends on [A] → "blocked"
- Task C: depends on [A, B] → "blocked"

Execution:
1. Execute Task A
2. Task A completes → mark "complete"
3. Task B: remove A from dependencies → [empty] → "ready"
4. Task C: remove A from dependencies → [B] → still "blocked"
5. Execute Task B
6. Task B completes → mark "complete"
7. Task C: remove B from dependencies → [empty] → "ready"
8. Execute Task C
```

### Error Handling

**Subagent fails to complete:**
- First attempt: Dispatch another subagent with same prompt (fresh context)
- Second attempt: ESCALATE to user with failure details

**Subagent reports blocker:**
- ESCALATE immediately (unclear requirements, missing deps, etc.)

**Tests fail after implementation:**
- Continue to code review (will be fixed in review automation)

**Circular dependencies detected:**
- ERROR: "Circular dependency detected: [A → B → C → A]"
- ESCALATE to user

## Code Review Automation

After each task's implementation subagent completes, automatically request and handle code review.

### Step 1: Dispatch Code Reviewer

Use the Task tool with requesting-code-review template:

```markdown
Tool: Task
Description: "Code review for Task [N]"
Prompt: |
  You are reviewing code for Task [N] from [scope reference].

  ## What Was Implemented

  [Implementation subagent's summary]

  ## Requirements

  Task [N]: [task.title]

  [task.description]

  ## Acceptance Criteria

  [task.requirements]

  ## Code Changes

  Base commit: [git SHA before task]
  Head commit: [git SHA after task]

  ## Your Job

  Follow the code-review skill framework:

  1. **Review the implementation** against requirements
  2. **Identify issues** and categorize:
     - **Critical**: Must fix (breaks functionality, security issue, tests fail)
     - **Important**: Should fix (doesn't meet requirements, poor design, missing edge cases)
     - **Minor**: Nice to fix (style, naming, comments)

  3. **Provide assessment**:
     - Strengths: What was done well
     - Issues: List with category and specific fix instructions
     - Overall: Approved / Needs Revision

  4. **Return structured report**

  See requesting-code-review skill for full template.
```

### Step 2: Parse Review Feedback

Extract from code reviewer's response:

```typescript
interface ReviewFeedback {
  strengths: string[];
  issues: {
    category: "Critical" | "Important" | "Minor";
    description: string;
    fixInstructions: string;
  }[];
  assessment: "Approved" | "Needs Revision";
}
```

Count issues by category:
- `criticalCount = issues.filter(i => i.category === "Critical").length`
- `importantCount = issues.filter(i => i.category === "Important").length`
- `minorCount = issues.filter(i => i.category === "Minor").length`

### Step 3: Handle Critical Issues (AUTO-FIX)

**If criticalCount > 0:**

For each Critical issue:

1. **First fix attempt**

   Dispatch fix subagent:
   ```markdown
   Tool: Task
   Description: "Fix Critical issue: [issue.description]"
   Prompt: |
     You are fixing a Critical code review issue from Task [N].

     ## Issue

     [issue.description]

     ## Fix Instructions

     [issue.fixInstructions]

     ## Your Job

     1. Implement the fix
     2. Run tests to verify fix works
     3. Commit the fix
     4. Report: What you changed, test results

     IMPORTANT: This is a Critical issue - must be fixed before proceeding.
   ```

2. **Verify fix**

   Check fix subagent's report:
   - ✅ Fix implemented
   - ✅ Tests passing
   - ✅ Committed

3. **If fix fails: Second attempt**

   Dispatch fresh fix subagent with "start from scratch" instruction:
   ```markdown
   Prompt: |
     PREVIOUS FIX ATTEMPT FAILED.

     ## Original Issue

     [issue.description]

     ## What Was Tried

     [first subagent's report]

     ## Your Job

     Start from scratch. Analyze the problem fresh and implement a different approach.

     1. Read the code to understand current state
     2. Implement fix using a DIFFERENT approach than previous attempt
     3. Run tests
     4. Commit
     5. Report
   ```

4. **If second fix fails: ESCALATE**

   ```markdown
   BLOCKER: Unable to fix Critical issue after 2 attempts

   ## Issue

   [issue.description]

   ## Fix Attempts

   Attempt 1: [summary]
   Attempt 2: [summary]

   ## Current State

   [test output, error messages]

   I need your help to resolve this issue before proceeding.
   ```

   STOP execution and wait for user response.

### Step 4: Handle Important Issues (AUTO-FIX)

**If importantCount > 0:**

Same process as Critical issues:
- Dispatch fix subagent (attempt 1)
- If fails: Fresh subagent (attempt 2)
- If fails again: ESCALATE with blocker

**Important issues MUST be resolved before continuing to next task.**

### Step 5: Handle Minor Issues (DOCUMENT)

**If minorCount > 0:**

Do NOT auto-fix. Instead, document for reference:

```markdown
## Minor Issues Noted (not fixed automatically)

- [issue 1 description]
- [issue 2 description]
...

These can be addressed in a future refactoring pass if desired.
```

Continue to next task without fixing Minor issues.

### Step 6: Verify All Critical/Important Fixed

Before proceeding to next task, verify:

```
criticalCount === 0 AND importantCount === 0
```

If false: STOP (should never happen - means fix logic failed)
If true: Continue to next task

### Auto-Fix Retry Example

```
Task 5 implementation complete

Code review dispatched
→ Review returns:
  - Critical: 1 (missing null check in parseUser())
  - Important: 1 (error not logged in catch block)
  - Minor: 2 (naming suggestions)

Fix Critical issue (null check):
→ Attempt 1: Dispatch fix subagent
  → Subagent adds null check but tests fail (wrong logic)
→ Attempt 2: Dispatch fresh fix subagent with "start from scratch"
  → Subagent uses different approach (early return), tests pass ✓

Fix Important issue (logging):
→ Attempt 1: Dispatch fix subagent
  → Subagent adds logging, tests pass ✓

Document Minor issues (naming):
→ "Minor issues noted: [list]"

Verify: 0 Critical, 0 Important → Continue to Task 6
```

### Integration with Task Executor

After code review completes and all Critical/Important issues fixed:

1. Mark task as "completed" in TodoWrite
2. Update dependency graph (see task executor workflow)
3. Move to next ready task
4. Repeat process
