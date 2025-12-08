---
id: SPEC-000038
title: Orchestrated Spec Implementation with GitHub Integration and Audit Trail
type: specification
status: open
priority: critical
labels:
  - workflow-orchestration
  - github-integration
  - observability
  - implementation-automation
  - mcp-tools
createdAt: '2025-12-08T02:12:41.485Z'
updatedAt: '2025-12-08T02:12:41.485Z'
---
# Specification: Orchestrated Spec Implementation

## Executive Summary

**What:** A comprehensive orchestration system that takes a specification file and automatically produces a GitHub Pull Request containing the complete implementation, with full audit trail for post-execution verification. Uses MCP tools to track phase execution and enable session recovery.

**Why:** Currently, implementing a spec requires manual coordination of multiple skills (worktree creation, planning, implementation, code review, PR creation). The handoffs between skills are implicit, observability is limited, and there's no automated way to verify that all expected steps actually executed.

**Scope:**
- IN: Worktree management, planning orchestration, implementation coordination, GitHub PR automation, audit logging via MCP tools, post-execution verification, session recovery
- OUT: CI/CD integration, automated merging, multi-repo support, iteration/time limits

**Status:** Draft

## Goals and Non-Goals

### Goals

1. **Single-command spec implementation:** User says "implement this spec" and receives a PR link
2. **Guaranteed workflow execution:** Every expected step verifiably executes (tracked via MCP tools)
3. **Full audit trail:** Machine-readable log of all phases, decisions, and outcomes
4. **GitHub-native output:** PR with comprehensive summary, not just pushed commits
5. **Post-execution verification:** Ability to confirm all steps happened correctly
6. **Session recovery:** Ability to resume interrupted workflows from last checkpoint

### Non-Goals

- Automated PR merging (human review required)
- CI check monitoring/waiting (future enhancement)
- Multi-repository orchestration
- Parallel spec implementation
- Cost/token budgeting (future enhancement)
- Iteration or time limits (let agents work until done)

## Background & Context

### Problem Statement

When a user asks Claude to "implement spec X", the following should happen:
1. Worktree created for isolation
2. writing-plans skill creates MCP issues
3. implement skill executes all issues with subagents
4. Code review happens for each task
5. Tests pass
6. PR created with comprehensive summary

Currently:
- These steps happen but handoffs are implicit
- No guarantee all steps execute
- No audit trail to verify execution
- PR creation is manual
- No post-execution verification mechanism
- No way to resume if session is interrupted

### Current State

```
User: "implement spec-auth.md"
         |
[Agent decides which skills to use]
         |
[Skills execute in unclear order]
         |
[Some work happens]
         |
[User hopes it all worked]
         |
[Manual PR creation or branch left hanging]
```

### Proposed State

```
User: "implement spec-auth.md"
         |
+----------------------------------------------------------+
|  IMPLEMENT-SPEC (Orchestrator)                           |
|                                                          |
|  1. INIT    -> Create worktree, start session           |
|               MCP: session_start()                       |
|                                                          |
|  2. PLAN    -> Run writing-plans, capture issue IDs      |
|               MCP: session_phase(phase: "plan")          |
|                                                          |
|  3. EXECUTE -> Run implement on all issues               |
|               MCP: session_phase(phase: "execute")       |
|               MCP: session_checkpoint() after each task  |
|                                                          |
|  4. VERIFY  -> Fresh test run, requirements check        |
|               MCP: session_phase(phase: "verify")        |
|                                                          |
|  5. PUBLISH -> Push branch, create PR via gh            |
|               MCP: session_phase(phase: "publish")       |
|                                                          |
|  6. REPORT  -> Present summary with PR link             |
|               MCP: session_complete()                    |
|                                                          |
|  [Audit: .wrangler/sessions/{id}/audit.jsonl]           |
+----------------------------------------------------------+
         |
User: "PR: https://github.com/org/repo/pull/123
       Audit: .wrangler/sessions/2025-12-07-abc123/"
```

## Requirements

### Functional Requirements

#### Orchestration
- **FR-001:** System MUST execute phases in order: init -> plan -> execute -> verify -> publish -> report
- **FR-002:** System MUST halt and escalate if any phase fails verification gates
- **FR-003:** System MUST pass context (worktree path, session ID, branch) to all subagents
- **FR-004:** System MUST track all phase completions via MCP tools and audit log

#### MCP Session Tools
- **FR-005:** System MUST provide `session_start` MCP tool to initialize a session
- **FR-006:** System MUST provide `session_phase` MCP tool to record phase transitions
- **FR-007:** System MUST provide `session_checkpoint` MCP tool to save resumable state
- **FR-008:** System MUST provide `session_complete` MCP tool to finalize sessions
- **FR-009:** System MUST provide `session_get` MCP tool to retrieve session state (for recovery)

#### Worktree Management
- **FR-010:** System MUST create worktree with naming convention: `.worktrees/{spec-name}`
- **FR-011:** System MUST create branch with naming convention: `wrangler/{spec-name}/{session-id}`
- **FR-012:** System MUST capture and use absolute paths for all subagent operations
- **FR-013:** System MUST verify worktree isolation before proceeding to execute phase

#### Planning Integration
- **FR-020:** System MUST invoke writing-plans skill with spec file
- **FR-021:** System MUST capture all created issue IDs
- **FR-022:** System MUST log issue IDs to audit trail via MCP tool

#### Implementation Coordination
- **FR-030:** System MUST invoke implement skill with captured issue IDs
- **FR-031:** System MUST ensure all subagents receive worktree context
- **FR-032:** System MUST verify each task completion includes: tests passed, TDD certified, code reviewed
- **FR-033:** System MUST call `session_checkpoint` after each task completes

#### GitHub Integration
- **FR-040:** System MUST push branch to remote using `git push -u origin {branch}`
- **FR-041:** System MUST create PR using `gh pr create` with comprehensive body
- **FR-042:** System MUST capture and return PR URL
- **FR-043:** PR body MUST include: summary, changes list, test results, tasks completed, TDD compliance statement

#### Audit Trail
- **FR-050:** System MUST create session directory: `.wrangler/sessions/{session-id}/`
- **FR-051:** System MUST write audit.jsonl with one entry per phase/task (via MCP tools)
- **FR-052:** System MUST capture test output to `final-test-output.txt`
- **FR-053:** Audit entries MUST include: phase, timestamp, status, and phase-specific fields

#### Verification
- **FR-060:** System MUST run fresh test suite before publish phase
- **FR-061:** System MUST verify git working tree is clean before publish
- **FR-062:** System MUST NOT proceed to publish if verification fails

#### Recovery
- **FR-070:** Session hook MUST detect interrupted sessions on session start
- **FR-071:** System MUST allow resuming from last checkpoint via `session_get`
- **FR-072:** Checkpoint MUST capture: current phase, tasks completed, variables, resume instructions

### Non-Functional Requirements

- **Reliability:** Workflow MUST be resumable if interrupted (via checkpoint mechanism)
- **Observability:** All decisions and outcomes MUST be logged via MCP tools
- **Security:** No credentials stored in audit logs; use existing gh auth
- **Simplicity:** MCP tools should be lightweight (~400 LOC total)

## Architecture

### High-Level Architecture

```
+-------------------------------------------------------------+
|                    User Request                              |
|              "implement spec-auth.md"                        |
+-------------------------------------------------------------+
                            |
                            v
+-------------------------------------------------------------+
|               implement-spec Orchestrator                    |
|                                                              |
|  +----------+  +----------+  +----------+  +----------+     |
|  |   INIT   |->|   PLAN   |->| EXECUTE  |->|  VERIFY  |->...|
|  +----------+  +----------+  +----------+  +----------+     |
|       |             |             |             |            |
|       v             v             v             v            |
|  +-------------------------------------------------------+  |
|  |              MCP Session Tools                         |  |
|  |                                                        |  |
|  |  session_start() -> session_phase() -> session_checkpoint()
|  |                  -> session_complete()                 |  |
|  +-------------------------------------------------------+  |
|       |             |             |             |            |
|       v             v             v             v            |
|  +-------------------------------------------------------+  |
|  |              Audit Logger                              |  |
|  |         .wrangler/sessions/{id}/audit.jsonl           |  |
|  +-------------------------------------------------------+  |
+-------------------------------------------------------------+
                            |
            +---------------+---------------+
            v               v               v
     +------------+  +------------+  +------------+
     |   Skills   |  |    Git     |  |  GitHub    |
     |            |  |            |  |    CLI     |
     | - worktree |  | - branch   |  | - gh pr    |
     | - plans    |  | - commit   |  | - gh auth  |
     | - implement|  | - push     |  |            |
     +------------+  +------------+  +------------+
```

### Components

#### Component 1: Orchestrator Skill (`implement-spec`)

**Responsibility:** Coordinate all phases, manage session state, handle errors

**Interfaces:**
- Input: Spec file path (or spec ID)
- Output: PR URL, session ID, completion summary

**Key behaviors:**
- Creates session context via `session_start`
- Invokes child skills in order
- Passes context to all children
- Logs all phase transitions via `session_phase`
- Saves checkpoints via `session_checkpoint`
- Halts on verification failures

#### Component 2: MCP Session Tools

**Responsibility:** Track session state, enable recovery, write audit log

**Location:** `mcp/tools/session/`

**Tools:**

| Tool | Purpose | Key Return |
|------|---------|------------|
| `session_start` | Initialize session | `{ sessionId, auditPath }` |
| `session_phase` | Record phase entry | `{ phase, timestamp, eventLogged }` |
| `session_checkpoint` | Save resumable state | `{ checkpointId, canResume }` |
| `session_complete` | Finalize session | `{ sessionId, status, prUrl }` |
| `session_get` | Retrieve session state | `{ session, checkpoint, recentEvents }` |

**Key behaviors:**
- Creates session directory on start
- Appends entries atomically to audit.jsonl
- Stores checkpoint for recovery
- Returns session state for resume

#### Component 3: GitHub PR Creator

**Responsibility:** Create PR with comprehensive summary

**Interfaces:**
- Input: Branch name, PR title, body content
- Output: PR URL, PR number

**Key behaviors:**
- Pushes branch to remote
- Creates PR via gh CLI
- Generates body from audit data
- Returns URL for user

### Data Model

#### Session Directory

```
.wrangler/sessions/{session-id}/
+-- audit.jsonl           # Phase-by-phase execution log
+-- checkpoint.json       # Latest checkpoint for recovery
+-- final-test-output.txt # Complete test suite output
+-- git-status.txt        # Final git status
+-- context.json          # Session configuration
```

#### Session State

```typescript
interface Session {
  id: string;                    // e.g., "2025-12-07-abc123-f8d2"
  specFile: string;              // e.g., "spec-auth.md"
  status: "running" | "paused" | "completed" | "failed";
  currentPhase: string;          // Current phase ID

  // Context
  worktreePath: string;          // Absolute path to worktree
  branchName: string;            // e.g., "wrangler/auth/2025-12-07-abc123"

  // Tracking
  phasesCompleted: string[];     // ["init", "plan", "execute"]
  tasksCompleted: string[];      // Issue IDs completed
  tasksPending: string[];        // Issue IDs remaining

  // Timing
  startedAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
  completedAt?: string;          // ISO timestamp

  // Output
  prUrl?: string;                // PR URL when published
  prNumber?: number;             // PR number when published
}
```

#### Checkpoint State

```typescript
interface SessionCheckpoint {
  sessionId: string;
  checkpointId: string;          // ULID
  createdAt: string;

  // Resumable state
  currentPhase: string;
  tasksCompleted: string[];
  tasksPending: string[];
  variables: Record<string, any>;

  // Context for Claude
  lastAction: string;            // What was being done
  resumeInstructions: string;    // How to continue
}
```

#### Audit Entry Schema

```typescript
interface AuditEntry {
  phase: "init" | "plan" | "execute" | "task" | "verify" | "publish" | "complete" | "error" | "checkpoint";
  timestamp: string;  // ISO-8601
  status: "started" | "complete" | "failed";
  // Phase-specific fields below
}

interface InitEntry extends AuditEntry {
  phase: "init";
  session_id: string;
  worktree: string;
  branch: string;
  spec_file: string;
}

interface PlanEntry extends AuditEntry {
  phase: "plan";
  issues_created: string[];
  total_tasks: number;
}

interface TaskEntry extends AuditEntry {
  phase: "task";
  task_id: string;
  tests_passed: boolean;
  commit: string;
  tdd_certified: boolean;
  code_review: "approved" | "changes_requested";
  files_changed: string[];
}

interface VerifyEntry extends AuditEntry {
  phase: "verify";
  tests_exit_code: number;
  tests_total: number;
  tests_passed: number;
  git_clean: boolean;
}

interface PublishEntry extends AuditEntry {
  phase: "publish";
  pr_url: string;
  pr_number: number;
  branch_pushed: boolean;
}

interface CheckpointEntry extends AuditEntry {
  phase: "checkpoint";
  checkpoint_id: string;
  tasks_completed: number;
  tasks_pending: number;
}
```

## MCP Tools Implementation

### Tool: session_start

**Purpose:** Initialize a new orchestration session

**Parameters:**
```typescript
{
  specFile: string;       // Path to spec file
  workingDirectory?: string; // Override working directory
}
```

**Response:**
```typescript
{
  sessionId: string;
  status: "running";
  currentPhase: "init";
  auditPath: string;      // Path to audit.jsonl
  worktreePath: string;   // Absolute path to worktree
  branchName: string;     // Git branch name
}
```

**Behavior:**
1. Generate session ID: `{date}-{git-short-hash}-{random-hex}`
2. Create session directory: `.wrangler/sessions/{sessionId}/`
3. Extract spec name, create worktree and branch
4. Initialize context.json and audit.jsonl
5. Log init entry to audit

### Tool: session_phase

**Purpose:** Record phase transition

**Parameters:**
```typescript
{
  sessionId: string;
  phase: string;          // "plan" | "execute" | "verify" | "publish"
  status: "started" | "complete" | "failed";
  metadata?: Record<string, any>;  // Phase-specific data
}
```

**Response:**
```typescript
{
  phase: string;
  status: string;
  timestamp: string;
  eventLogged: true;
  phasesCompleted: string[];  // All completed phases so far
}
```

**Behavior:**
1. Load session state
2. Update currentPhase
3. If status is "complete", add phase to phasesCompleted
4. Append audit entry with phase-specific metadata
5. Save session state

### Tool: session_checkpoint

**Purpose:** Save resumable state for recovery

**Parameters:**
```typescript
{
  sessionId: string;
  tasksCompleted: string[];
  tasksPending: string[];
  lastAction: string;         // What was just done
  resumeInstructions: string; // How to continue if interrupted
  variables?: Record<string, any>;
}
```

**Response:**
```typescript
{
  checkpointId: string;
  savedAt: string;
  canResume: true;
  tasksCompleted: number;
  tasksPending: number;
}
```

**Behavior:**
1. Generate checkpoint ID (ULID)
2. Create checkpoint.json with full resumable state
3. Append checkpoint entry to audit.jsonl
4. Return confirmation

### Tool: session_complete

**Purpose:** Finalize session

**Parameters:**
```typescript
{
  sessionId: string;
  status: "completed" | "failed";
  prUrl?: string;
  prNumber?: number;
  summary?: string;
}
```

**Response:**
```typescript
{
  sessionId: string;
  status: string;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  phasesCompleted: string[];
  tasksCompleted: number;
  prUrl?: string;
}
```

**Behavior:**
1. Update session status and completedAt
2. Append complete entry to audit.jsonl
3. Return final session summary

### Tool: session_get

**Purpose:** Retrieve session state (for recovery or status check)

**Parameters:**
```typescript
{
  sessionId?: string;     // Specific session, or omit for most recent incomplete
}
```

**Response:**
```typescript
{
  session: Session;
  checkpoint?: SessionCheckpoint;
  recentEvents: AuditEntry[];  // Last 20 events
  canResume: boolean;
  resumeInstructions?: string;
}
```

**Behavior:**
1. If no sessionId, find most recent session with status "running" or "paused"
2. Load session state, checkpoint, and recent audit events
3. Return with resume guidance if applicable

## Implementation Details

### Phase 1: INIT

```markdown
## INIT Phase

1. Call `session_start`:
   ```
   session_start(specFile: "{SPEC_FILE}")
   ```

   Capture response:
   - sessionId
   - worktreePath (absolute)
   - branchName
   - auditPath

2. Store these values for all subsequent phases:
   - SESSION_ID = response.sessionId
   - WORKTREE_ABSOLUTE = response.worktreePath
   - BRANCH_NAME = response.branchName
   - AUDIT_PATH = response.auditPath

3. Verify worktree exists:
   ```bash
   cd {WORKTREE_ABSOLUTE} && pwd && git branch --show-current
   ```

4. Log phase complete:
   ```
   session_phase(sessionId: SESSION_ID, phase: "init", status: "complete")
   ```
```

### Phase 2: PLAN

```markdown
## PLAN Phase

1. Log phase start:
   ```
   session_phase(sessionId: SESSION_ID, phase: "plan", status: "started")
   ```

2. Invoke writing-plans skill with:
   - Spec file: {SPEC_FILE}
   - Working directory: {WORKTREE_ABSOLUTE}
   - Session context: {SESSION_ID}

3. Capture output:
   - Issue IDs created (e.g., ["000042", "000043"])
   - Total task count

4. Log phase complete with metadata:
   ```
   session_phase(
     sessionId: SESSION_ID,
     phase: "plan",
     status: "complete",
     metadata: {
       issues_created: ["000042", "000043"],
       total_tasks: 2
     }
   )
   ```

5. Save checkpoint:
   ```
   session_checkpoint(
     sessionId: SESSION_ID,
     tasksCompleted: [],
     tasksPending: ["000042", "000043"],
     lastAction: "Created implementation plan with 2 tasks",
     resumeInstructions: "Continue with execute phase, implement issues 000042 and 000043"
   )
   ```
```

### Phase 3: EXECUTE

```markdown
## EXECUTE Phase

1. Log phase start:
   ```
   session_phase(sessionId: SESSION_ID, phase: "execute", status: "started")
   ```

2. Invoke implement skill with:
   - Scope: issues {issue_ids from plan phase}
   - Working directory context: {WORKTREE_ABSOLUTE}
   - Branch: {BRANCH_NAME}
   - Session ID: {SESSION_ID}

3. For each task that completes, save checkpoint:
   ```
   session_checkpoint(
     sessionId: SESSION_ID,
     tasksCompleted: [...previously_completed, current_task_id],
     tasksPending: [...remaining_task_ids],
     lastAction: "Completed task {task_id}: {task_title}",
     resumeInstructions: "Continue with next task {next_task_id} or proceed to verify if all done"
   )
   ```

4. When all tasks complete, log phase complete:
   ```
   session_phase(
     sessionId: SESSION_ID,
     phase: "execute",
     status: "complete",
     metadata: {
       tasks_completed: [...all_task_ids],
       total_commits: N
     }
   )
   ```
```

### Phase 4: VERIFY

```markdown
## VERIFY Phase

1. Log phase start:
   ```
   session_phase(sessionId: SESSION_ID, phase: "verify", status: "started")
   ```

2. Run fresh test suite:
   ```bash
   cd "{WORKTREE_ABSOLUTE}" && npm test 2>&1 | tee "{SESSION_DIR}/final-test-output.txt"
   ```
   Capture: TEST_EXIT_CODE, TESTS_TOTAL, TESTS_PASSED

3. Check git status:
   ```bash
   cd "{WORKTREE_ABSOLUTE}" && git status --short
   ```
   Capture: GIT_CLEAN (true if empty)

4. Log phase complete:
   ```
   session_phase(
     sessionId: SESSION_ID,
     phase: "verify",
     status: "complete",
     metadata: {
       tests_exit_code: TEST_EXIT_CODE,
       tests_total: TESTS_TOTAL,
       tests_passed: TESTS_PASSED,
       git_clean: GIT_CLEAN
     }
   )
   ```

5. GATE: If TEST_EXIT_CODE != 0 or GIT_CLEAN == false:
   - Log error and escalate to user
   - Do NOT proceed to publish
```

### Phase 5: PUBLISH

```markdown
## PUBLISH Phase

1. Log phase start:
   ```
   session_phase(sessionId: SESSION_ID, phase: "publish", status: "started")
   ```

2. Push branch:
   ```bash
   cd "{WORKTREE_ABSOLUTE}" && git push -u origin "{BRANCH_NAME}"
   ```

3. Generate PR body from audit data (see PR Body Template below)

4. Create PR:
   ```bash
   cd "{WORKTREE_ABSOLUTE}" && gh pr create \
     --title "feat({SPEC_NAME}): implement specification" \
     --body "{PR_BODY}" \
     --base main \
     --head "{BRANCH_NAME}"
   ```
   Capture: PR_URL, PR_NUMBER

5. Log phase complete:
   ```
   session_phase(
     sessionId: SESSION_ID,
     phase: "publish",
     status: "complete",
     metadata: {
       pr_url: PR_URL,
       pr_number: PR_NUMBER,
       branch_pushed: true
     }
   )
   ```
```

### Phase 6: REPORT

```markdown
## REPORT Phase

1. Complete session:
   ```
   session_complete(
     sessionId: SESSION_ID,
     status: "completed",
     prUrl: PR_URL,
     prNumber: PR_NUMBER,
     summary: "Implemented {N} tasks from {SPEC_FILE}"
   )
   ```

2. Present summary to user:

## Implementation Complete

**Specification:** {SPEC_FILE}
**PR:** {PR_URL}
**Session:** {SESSION_ID}

### Summary

| Metric | Value |
|--------|-------|
| Tasks completed | {N}/{N} |
| Tests passing | {TESTS_TOTAL} |
| Code reviews | {N} approved |

### Audit Trail

Location: `.wrangler/sessions/{SESSION_ID}/`

**Verify execution:**
```bash
cat .wrangler/sessions/{SESSION_ID}/audit.jsonl | jq -s '{
  phases: [.[].phase] | unique,
  tasks: [.[] | select(.phase == "task")] | length,
  all_passed: [.[] | select(.phase == "task") | .tests_passed] | all,
  pr_created: ([.[] | select(.phase == "publish")] | length) > 0
}'
```
```

### PR Body Template

```markdown
## Summary

Implements specification: `{SPEC_FILE}`

### Changes

{git log main..HEAD --oneline formatted as bullet list}

### Test Results

- All tests passing ({TESTS_TOTAL} tests)

### Tasks Completed

{For each task from audit.jsonl:}
- [x] {task_id}: {task_title} ({commit_hash})

### Implementation Details

- TDD compliance: All functions certified
- Code review: All tasks approved

---

**Session ID:** `{SESSION_ID}`
**Audit trail:** `.wrangler/sessions/{SESSION_ID}/`

Generated with [Claude Code](https://claude.com/claude-code)
```

## Session Recovery

### Detection Hook

On session start, a hook checks for interrupted sessions:

```bash
#!/bin/bash
# hooks/session-recovery-check.sh

SESSIONS_DIR=".wrangler/sessions"

# Find sessions with status "running"
for session_dir in "$SESSIONS_DIR"/*/; do
  if [ -f "$session_dir/context.json" ]; then
    STATUS=$(jq -r '.status' "$session_dir/context.json" 2>/dev/null)
    if [ "$STATUS" = "running" ]; then
      SESSION_ID=$(basename "$session_dir")
      CHECKPOINT=$(cat "$session_dir/checkpoint.json" 2>/dev/null)

      if [ -n "$CHECKPOINT" ]; then
        RESUME_INSTRUCTIONS=$(echo "$CHECKPOINT" | jq -r '.resumeInstructions')
        CURRENT_PHASE=$(echo "$CHECKPOINT" | jq -r '.currentPhase')
        TASKS_COMPLETED=$(echo "$CHECKPOINT" | jq -r '.tasksCompleted | length')
        TASKS_PENDING=$(echo "$CHECKPOINT" | jq -r '.tasksPending | length')

        echo "<session-recovery>"
        echo "Detected interrupted session: $SESSION_ID"
        echo "Current phase: $CURRENT_PHASE"
        echo "Progress: $TASKS_COMPLETED tasks completed, $TASKS_PENDING pending"
        echo ""
        echo "To resume: Call session_get(sessionId: \"$SESSION_ID\") and follow resumeInstructions"
        echo "Instructions: $RESUME_INSTRUCTIONS"
        echo "</session-recovery>"

        # Only report first interrupted session
        break
      fi
    fi
  fi
done
```

### Resume Flow

When Claude sees the `<session-recovery>` message:

1. Call `session_get(sessionId: "{SESSION_ID}")`
2. Read checkpoint.resumeInstructions
3. Continue from the indicated phase/task
4. All subsequent MCP calls use the existing sessionId

## File Structure

```
mcp/
+-- tools/
|   +-- session/
|   |   +-- index.ts              # Tool registration
|   |   +-- start.ts              # session_start
|   |   +-- phase.ts              # session_phase
|   |   +-- checkpoint.ts         # session_checkpoint
|   |   +-- complete.ts           # session_complete
|   |   +-- get.ts                # session_get
|   +-- issues/
|       +-- ... (existing)
+-- providers/
|   +-- session-storage.ts        # Session persistence
|   +-- markdown.ts (existing)
+-- types/
|   +-- session.ts                # Type definitions
+-- __tests__/
    +-- tools/
        +-- session/
            +-- start.test.ts
            +-- phase.test.ts
            +-- checkpoint.test.ts
            +-- ...

skills/
+-- implement/
    +-- SKILL.md                  # Original (unchanged)
    +-- implement-spec/
        +-- SKILL.md              # New orchestrator skill

commands/
+-- implement-spec.md             # Slash command for orchestrator
```

## Testing Strategy

### Test Scenarios

1. **Happy path:** Spec with 3 tasks, all pass, PR created
2. **Planning failure:** Spec has ambiguous requirements, planning escalates
3. **Task failure:** One task fails, fix subagent resolves it, continues
4. **Verification failure:** Tests fail on final run, workflow halts before PR
5. **GitHub auth failure:** gh not authenticated, clear error message
6. **Resume after interrupt:** Session partially complete, resumes from checkpoint
7. **Multiple interrupted sessions:** Most recent incomplete session offered for resume

### Verification Commands

```bash
# Verify all phases completed
jq -s '[.[].phase] | unique | sort' .wrangler/sessions/{id}/audit.jsonl
# Expected: ["checkpoint","complete","execute","init","plan","publish","task","verify"]

# Verify all tasks passed
jq -s '[.[] | select(.phase == "task" and .tests_passed == false)]' audit.jsonl
# Expected: []

# Verify PR created
jq -s '.[] | select(.phase == "publish") | .pr_url' audit.jsonl
# Expected: "https://github.com/..."

# Get session summary
jq -s '{
  session_id: .[0].session_id,
  phases: [.[].phase] | unique,
  tasks: [.[] | select(.phase == "task")] | length,
  checkpoints: [.[] | select(.phase == "checkpoint")] | length,
  duration_sec: ((.[length-1].timestamp | fromdateiso8601) - (.[0].timestamp | fromdateiso8601))
}' audit.jsonl
```

## Success Criteria

### Launch Criteria

- [ ] All 5 MCP session tools implemented with tests
- [ ] All 6 phases execute in order
- [ ] Audit log captures all phases and tasks
- [ ] Checkpoints saved after each task
- [ ] PR created with comprehensive body
- [ ] Session recovery works from checkpoint
- [ ] Post-execution verification commands work

### Success Metrics

- User can verify workflow executed correctly via audit log
- PR body contains all required information
- No manual steps required between "implement spec" and "here's your PR"
- Interrupted sessions can resume without losing progress

## Implementation Estimate

- **MCP Session Tools:** ~400 LOC TypeScript
- **Session Storage Provider:** ~150 LOC TypeScript
- **implement-spec Skill:** ~500 lines markdown
- **Session Hook:** ~50 lines bash
- **Tests:** ~600 LOC TypeScript

**Total:** ~1,700 LOC

## Open Questions & Decisions

### Resolved Decisions

| Decision | Options | Chosen | Rationale |
|----------|---------|--------|-----------|
| Audit format | Markdown vs JSONL | JSONL | Machine-queryable, enables tooling |
| Session ID format | UUID vs date-hash | date-hash | Human-readable, sortable |
| Worktree cleanup | Auto vs manual | Manual | User may want to inspect after PR |
| Limits/enforcement | Hard limits vs none | None | Let agents work until done |
| Tool prefix | `workflow_` vs `session_` | `session_` | More accurate - tracks sessions not abstract workflows |

### Open Questions

- [ ] **Q1:** Should we wait for CI checks before declaring success?
  - Impact: Changes "done" criteria
  - Options: Ignore CI, wait with timeout, notify when CI completes
  - Recommendation: V1 ignores CI, V2 adds optional `--wait-for-ci`

- [ ] **Q2:** Should worktree be auto-cleaned after PR merge?
  - Impact: Orphaned worktrees accumulate
  - Options: Auto-clean, remind user, add cleanup command
  - Recommendation: Add `/wrangler:cleanup-worktrees` command

- [ ] **Q3:** Should session data be committed to repo?
  - Impact: Audit trails in git history vs gitignored
  - Options: Commit, gitignore, configurable
  - Recommendation: Commit audit.jsonl for traceability, gitignore large files

## References

### Related Specifications

- Workflow Observability and Control Spec - Provides broader observability framework
- Modular Skills Composition System - May affect how orchestrator invokes skills

### Related Skills

- `using-git-worktrees` - Worktree creation
- `worktree-isolation` - Subagent context management
- `writing-plans` - Task breakdown
- `implement` - Task execution
- `finishing-a-development-branch` - Completion options

### External Resources

- [continuous-claude](https://github.com/AnandChowdhary/continuous-claude) - Inspiration for audit trail and GitHub integration patterns
- [gh CLI documentation](https://cli.github.com/manual/) - GitHub CLI reference
