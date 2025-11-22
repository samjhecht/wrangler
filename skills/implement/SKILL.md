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
