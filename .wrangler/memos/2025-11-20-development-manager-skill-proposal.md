# Development Manager Skill - Proposal

**Created:** 2025-11-20
**Status:** Proposal
**Author:** Sam + Claude

## Problem Statement

Users need a way to give high-level goals (e.g., "finish the testing framework spec and implement the authentication feature") and have an AI agent act as both project manager and principal engineer to:

1. **Break down work** - Convert specifications into tracked issues and detailed plans
2. **Delegate efficiently** - Dispatch subagents for parallel/sequential execution
3. **Enforce quality** - Mandate TDD, code review, verification at every step
4. **See it through** - Not stop until everything is complete and verified
5. **Provide accountability** - Track progress, catch failures, ensure nothing slips through
6. **Audit trail** - Log all decisions, delegations, and verifications for review

## Current State Analysis

### What We Have (Strong Foundation)

#### Workflow Orchestration
- **executing-plans** - Batch execution with code review checkpoints
- **subagent-driven-development** - Fresh subagent per task with reviews
- **dispatching-parallel-agents** - Parallel execution for independent problems

#### Quality Gates
- **test-driven-development** - RED-GREEN-REFACTOR enforcement
- **code-review** - Comprehensive 6-phase review framework
- **requesting-code-review** - Dispatch review subagents
- **verification-before-completion** - Evidence-before-claims gate
- **testing-anti-patterns** - Prevent common testing mistakes

#### Planning & Tracking
- **writing-plans** - Create detailed implementation plans + MCP issues
- **brainstorming** - Design refinement before implementation
- **create-new-issue** - Issue creation workflow
- **MCP tools** - 11 tools for issue/spec tracking

#### Progress Review
- **reviewing-implementation-progress** - Mid-implementation checkpoints
- **finishing-a-development-branch** - Final completion workflow

### What We're Missing (Gaps)

#### 1. **High-Level Orchestration**
- No skill that coordinates ENTIRE feature lifecycle from spec → issues → plan → execution → review → completion
- No systematic "take a step back and review alignment with spec" checkpoints
- No automatic detection of when to switch between parallel vs sequential execution

#### 2. **Continuous Accountability Loop**
- Skills enforce TDD/review WITHIN a workflow, but nothing ensures workflow itself completes
- No "keep going until done" mechanism that handles blockers/failures
- No systematic re-verification that spec requirements are actually met

#### 3. **Audit Logging**
- Issue tracking exists, but no comprehensive execution log
- Can't easily review "what path did the agent take?"
- No decision log (why parallel vs sequential, why this approach, etc.)

#### 4. **Subagent Accountability**
- Subagents can claim success without verification
- No enforcement that subagents MUST run tests and show evidence
- No systematic check: "Did subagent actually follow TDD?"

## Proposed Solution: Development Manager Skill

### Core Concept

A "meta-skill" that orchestrates the entire development lifecycle using existing skills as building blocks, adding:
- **Persistence** - Won't stop until complete
- **Accountability** - Verifies every claim with evidence
- **Audit trail** - Logs all decisions and delegations
- **Spec alignment** - Regular checkpoints against requirements

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│             DEVELOPMENT MANAGER SKILL                       │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │ 1. INTAKE & PLANNING PHASE                         │   │
│  │   - Load spec (or create if missing)               │   │
│  │   - Use brainstorming if design unclear            │   │
│  │   - Use writing-plans to create plan + issues      │   │
│  │   - Create audit log entry: "Plan created"         │   │
│  └────────────────────────────────────────────────────┘   │
│                         ↓                                   │
│  ┌────────────────────────────────────────────────────┐   │
│  │ 2. EXECUTION PHASE                                 │   │
│  │   - Analyze issues for dependencies                │   │
│  │   - Decide: parallel or sequential                 │   │
│  │   - Dispatch subagents with STRICT requirements:   │   │
│  │     • MUST follow TDD                              │   │
│  │     • MUST show test evidence                      │   │
│  │     • MUST pass verification-before-completion     │   │
│  │   - Track: subagent ID → issue ID → outcome        │   │
│  │   - Create audit log for each delegation           │   │
│  └────────────────────────────────────────────────────┘   │
│                         ↓                                   │
│  ┌────────────────────────────────────────────────────┐   │
│  │ 3. VERIFICATION PHASE (per task)                   │   │
│  │   - Subagent returns with claim                    │   │
│  │   - Manager re-verifies independently:             │   │
│  │     • Run tests yourself                           │   │
│  │     • Check git diff                               │   │
│  │     • Verify TDD compliance certification          │   │
│  │   - Dispatch code-review subagent (mandatory)      │   │
│  │   - If review fails: retry or escalate             │   │
│  │   - Mark issue complete ONLY after verification    │   │
│  │   - Log: verification evidence                     │   │
│  └────────────────────────────────────────────────────┘   │
│                         ↓                                   │
│  ┌────────────────────────────────────────────────────┐   │
│  │ 4. ALIGNMENT CHECKPOINT (periodic)                 │   │
│  │   - Every N tasks (e.g., 3-5), STOP and:          │   │
│  │     • Re-read spec requirements                    │   │
│  │     • Check: are we on track?                      │   │
│  │     • Review implementation progress skill         │   │
│  │     • Identify any drift or missing requirements   │   │
│  │   - Log: alignment check result                    │   │
│  │   - Adjust course if needed                        │   │
│  └────────────────────────────────────────────────────┘   │
│                         ↓                                   │
│  ┌────────────────────────────────────────────────────┐   │
│  │ 5. COMPLETION PHASE                                │   │
│  │   - All issues marked complete                     │   │
│  │   - Use issues_all_complete MCP tool               │   │
│  │   - Re-read spec, verify ALL requirements met      │   │
│  │   - Run full test suite                            │   │
│  │   - Final code review of entire implementation     │   │
│  │   - Use finishing-a-development-branch             │   │
│  │   - Generate completion report with audit trail    │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │ 6. AUDIT LOG (throughout)                          │   │
│  │   - .wrangler/logs/YYYY-MM-DD-HH-MM-SS.jsonl       │   │
│  │   - Each entry: timestamp, phase, action, outcome  │   │
│  │   - Searchable, parseable, human-readable          │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Skill Integration Map

The development manager skill **orchestrates** these existing skills:

| Phase | Uses These Skills | Why |
|-------|------------------|-----|
| **Intake** | brainstorming | Refine vague requirements into clear design |
| **Planning** | writing-plans | Create detailed plan + MCP issues |
| **Execution** | subagent-driven-development OR executing-plans | Choose based on task dependencies |
| **Parallel** | dispatching-parallel-agents | For independent failures/tasks |
| **Per-Task Review** | requesting-code-review → code-review | Mandatory after each task |
| **Checkpoint** | reviewing-implementation-progress | Periodic spec alignment check |
| **Final Verification** | verification-before-completion | Evidence before claiming done |
| **Completion** | finishing-a-development-branch | Merge/PR/cleanup workflow |
| **Throughout** | test-driven-development | Enforced on every subagent |

### Key Differentiators

#### 1. **Strict Subagent Contracts**

When dispatching subagents, the manager enforces:

```markdown
You are implementing [Task N] from [plan].

MANDATORY REQUIREMENTS:
1. Follow test-driven-development skill (RED-GREEN-REFACTOR)
2. Provide TDD Compliance Certification (see verification-before-completion)
3. Run tests and show COMPLETE output
4. Do NOT claim success without evidence
5. Report back with:
   - What you implemented
   - Test evidence (full output)
   - TDD certification (watched fail, watched pass)
   - Files changed
   - Any blockers

IF YOU SKIP TDD OR VERIFICATION: Your work will be rejected and you'll be re-dispatched.
```

#### 2. **Manager Re-Verification**

The manager NEVER trusts subagent claims. After subagent returns:

```bash
# 1. Verify tests actually pass
npm test 2>&1 | tee test-output.log

# 2. Check git diff
git diff --stat
git diff [files]

# 3. Review TDD certification
# - Did they watch test fail first?
# - Did they show failure message?
# - Did they show passing output?

# 4. Dispatch code review
# (mandatory, no exceptions)

# 5. ONLY THEN mark issue complete
```

#### 3. **Audit Log Format**

`.wrangler/logs/2025-11-20-14-30-00-auth-feature.jsonl`

```jsonl
{"timestamp":"2025-11-20T14:30:00Z","phase":"intake","action":"loaded_spec","spec":"specifications/auth-system.md","requirements_count":12}
{"timestamp":"2025-11-20T14:31:15Z","phase":"planning","action":"created_plan","plan":"plans/2025-11-20-auth-system.md","issues_created":[1,2,3,4,5]}
{"timestamp":"2025-11-20T14:32:00Z","phase":"execution","action":"dispatch_subagent","issue":"000001","task":"Implement JWT token generation","subagent_id":"agent-abc123","mode":"sequential"}
{"timestamp":"2025-11-20T14:35:30Z","phase":"verification","action":"subagent_returned","issue":"000001","subagent_id":"agent-abc123","claim":"complete","tdd_certified":true}
{"timestamp":"2025-11-20T14:35:45Z","phase":"verification","action":"manager_verify_tests","issue":"000001","command":"npm test","result":"15/15 pass","exit_code":0}
{"timestamp":"2025-11-20T14:36:00Z","phase":"verification","action":"dispatch_code_review","issue":"000001","reviewer_id":"review-def456"}
{"timestamp":"2025-11-20T14:38:20Z","phase":"verification","action":"code_review_complete","issue":"000001","status":"approved","critical_issues":0,"important_issues":0}
{"timestamp":"2025-11-20T14:38:30Z","phase":"verification","action":"mark_issue_complete","issue":"000001","verified":true}
{"timestamp":"2025-11-20T14:40:00Z","phase":"checkpoint","action":"alignment_check","tasks_complete":3,"spec_requirements_met":3,"drift_detected":false}
```

#### 4. **Alignment Checkpoints**

Every 3-5 tasks (configurable), the manager:

```markdown
## Alignment Checkpoint (After Task 5)

### Re-reading Specification
[Load spec, extract requirements]

### Requirements Status
- [✓] Requirement 1: JWT token generation → Task 1 (complete)
- [✓] Requirement 2: Token validation → Task 2 (complete)
- [✓] Requirement 3: Token refresh → Task 3 (complete)
- [⚠] Requirement 4: Rate limiting → Not in plan! DRIFT DETECTED
- [ ] Requirement 5: Password hashing → Task 4 (pending)

### Drift Analysis
ISSUE: Requirement 4 (rate limiting) is missing from implementation plan.

### Corrective Action
1. Create new issue: "Add rate limiting to auth endpoints"
2. Insert into task queue before Task 6
3. Update plan document
4. Log drift + correction

### Continue Execution: YES / NO
```

#### 5. **Completion Report**

When all issues complete, generate:

`.wrangler/memos/2025-11-20-auth-feature-completion-report.md`

```markdown
# Auth Feature - Completion Report

**Feature**: Authentication System
**Specification**: specifications/auth-system.md
**Plan**: plans/2025-11-20-auth-system.md
**Started**: 2025-11-20 14:30:00
**Completed**: 2025-11-20 18:45:30
**Duration**: 4h 15m 30s

## Summary

✓ All 12 requirements met
✓ All 8 issues completed
✓ All code reviewed and approved
✓ Full test suite passing (45/45 tests)
✓ Zero alignment drift detected

## Issues Completed

| Issue | Task | Subagent | TDD? | Review | Status |
|-------|------|----------|------|--------|--------|
| 000001 | JWT generation | agent-abc123 | ✓ | Approved | Complete |
| 000002 | Token validation | agent-def456 | ✓ | Approved | Complete |
| 000003 | Token refresh | agent-ghi789 | ✓ | Approved | Complete |
| 000004 | Password hashing | agent-jkl012 | ✓ | Approved | Complete |
| 000005 | Rate limiting | agent-mno345 | ✓ | Approved (1 minor) | Complete |
| 000006 | Login endpoint | agent-pqr678 | ✓ | Approved | Complete |
| 000007 | Logout endpoint | agent-stu901 | ✓ | Approved | Complete |
| 000008 | Integration tests | agent-vwx234 | ✓ | Approved | Complete |

## Alignment Checkpoints

- Checkpoint 1 (after task 3): ✓ On track
- Checkpoint 2 (after task 5): ⚠ Drift detected (rate limiting), corrected
- Checkpoint 3 (after task 8): ✓ On track

## Test Evidence

```
$ npm test

PASS tests/auth/token.test.ts (4.2s)
PASS tests/auth/validation.test.ts (2.1s)
PASS tests/auth/refresh.test.ts (3.5s)
PASS tests/auth/password.test.ts (1.8s)
PASS tests/auth/rateLimit.test.ts (2.3s)
PASS tests/auth/login.test.ts (5.1s)
PASS tests/auth/logout.test.ts (1.2s)
PASS tests/auth/integration.test.ts (8.7s)

Test Suites: 8 passed, 8 total
Tests:       45 passed, 45 total
Time:        29.1s
```

## Code Review Summary

- Total reviews: 8
- Critical issues: 0
- Important issues: 1 (fixed)
- Minor issues: 3 (noted, deferred)
- Approval rate: 100%

## Audit Trail

Full execution log: `.wrangler/logs/2025-11-20-14-30-00-auth-feature.jsonl`
Total log entries: 127
Phases executed: intake → planning → execution (8 tasks) → checkpoints (3) → completion

## Files Changed

```
 src/auth/token.ts              | 145 ++++++++++++++++++
 src/auth/validation.ts         |  89 +++++++++++
 src/auth/refresh.ts            |  67 ++++++++
 src/auth/password.ts           |  43 ++++++
 src/auth/rateLimit.ts          |  71 +++++++++
 src/routes/login.ts            | 123 +++++++++++++++
 src/routes/logout.ts           |  34 ++++
 tests/auth/token.test.ts       | 234 ++++++++++++++++++++++++++++
 tests/auth/validation.test.ts  | 156 ++++++++++++++++++
 tests/auth/refresh.test.ts     | 178 ++++++++++++++++++++
 tests/auth/password.test.ts    |  89 +++++++++++
 tests/auth/rateLimit.test.ts   | 145 ++++++++++++++++++
 tests/auth/login.test.ts       | 267 ++++++++++++++++++++++++++++++++
 tests/auth/logout.test.ts      |  67 ++++++++
 tests/auth/integration.test.ts | 389 ++++++++++++++++++++++++++++++++++++++++++++
 15 files changed, 2097 insertions(+)
```

## Next Steps

✓ Feature complete and ready for merge
✓ Used finishing-a-development-branch skill
→ Branch: feature/auth-system
→ Ready for PR creation or direct merge

## Certification

I certify that:
- ✓ All requirements from specification met
- ✓ All tasks followed TDD (RED-GREEN-REFACTOR)
- ✓ All code reviewed and approved
- ✓ All tests passing
- ✓ No shortcuts taken
- ✓ Audit trail complete
```

## Implementation Details

### Skill File Structure

```
skills/development-manager/
├── SKILL.md                    # Main skill
├── templates/
│   ├── subagent-contract.md   # Template for subagent requirements
│   ├── alignment-checkpoint.md # Template for spec review
│   └── completion-report.md   # Template for final report
└── examples/
    ├── simple-feature.md      # Example: single feature
    └── multi-spec.md          # Example: multiple specs
```

### Audit Log Schema

```typescript
type AuditLogEntry = {
  timestamp: string;           // ISO 8601
  phase: "intake" | "planning" | "execution" | "verification" | "checkpoint" | "completion";
  action: string;              // dispatch_subagent, verify_tests, etc.

  // Context (varies by action)
  issue?: string;              // Issue ID
  spec?: string;               // Spec file path
  plan?: string;               // Plan file path
  task?: string;               // Task description
  subagent_id?: string;        // Subagent identifier
  reviewer_id?: string;        // Reviewer identifier

  // Outcomes
  result?: "success" | "failure" | "blocked";
  claim?: string;              // What subagent claimed
  verified?: boolean;          // Did manager verify?
  evidence?: string;           // Path to evidence file

  // Metadata
  command?: string;            // Command run
  exit_code?: number;          // Command exit code
  drift_detected?: boolean;    // Alignment drift?
  requirements_met?: number;   // Count of met requirements
};
```

### Configuration

The skill could accept parameters:

```markdown
## Configuration

**Checkpoint frequency**: Every N tasks (default: 3)
**Parallelization**: Auto-detect or user-specified
**Audit log format**: JSONL (default) | JSON | Markdown
**Strictness level**:
  - Strict (default): Reject any verification failure
  - Lenient: Allow manager override for minor issues
```

## Usage Examples

### Example 1: Single Spec

```
User: "Finish implementing the authentication spec"

Manager:
═══════════════════════════════════════════════════════════
🎯 SKILL: development-manager
═══════════════════════════════════════════════════════════
Managing complete implementation of authentication spec from
requirements through verified completion with full audit trail.

[Phase 1: Intake]
- Loading spec: specifications/auth-system.md
- Requirements found: 12
- Existing issues: 0
- Need planning: YES

[Phase 2: Planning]
- Using writing-plans skill to create implementation plan
- Created plan: plans/2025-11-20-auth-system.md
- Created issues via MCP: 000001-000008 (8 issues)

[Phase 3: Execution]
- Analyzing dependencies: 8 tasks, 2 can run parallel
- Dispatching subagents with strict TDD requirements...

[Task 1: JWT generation]
- Dispatched: agent-abc123
- Contract: MUST follow TDD, provide certification
- Waiting for completion...
[agent returns]
- Claim: "Complete, tests passing"
- Manager verification:
  $ npm test tests/auth/token.test.ts
  ✓ 8/8 tests pass
  ✓ TDD certification provided
  ✓ Watched tests fail first
- Dispatching code review...
- Review: Approved (0 critical, 0 important)
- ✓ Issue 000001 marked complete

[Task 2-3: Running in parallel...]
[...]

[Checkpoint after Task 3]
- Re-reading spec requirements
- Status: 3/12 requirements met
- Drift: NONE
- Continue: YES

[...]

[Phase 5: Completion]
- All 8 issues complete: ✓
- Re-reading spec: all 12 requirements met ✓
- Full test suite: 45/45 passing ✓
- Final code review: Approved ✓
- Using finishing-a-development-branch
- Generated completion report

✓ Authentication feature complete and verified
→ Report: .wrangler/memos/2025-11-20-auth-completion-report.md
→ Audit log: .wrangler/logs/2025-11-20-14-30-00-auth-feature.jsonl
```

### Example 2: Multiple Goals

```
User: "Finish the testing framework spec AND implement the user management feature"

Manager:
═══════════════════════════════════════════════════════════
🎯 SKILL: development-manager
═══════════════════════════════════════════════════════════
Managing multiple goals: testing framework spec, user management
feature. Will orchestrate sequentially with full accountability.

[Multi-Goal Planning]
Goal 1: Testing framework spec (specifications/testing-framework.md)
Goal 2: User management feature (specifications/user-management.md)

Strategy: Sequential (Goal 1 must complete before Goal 2)

[Goal 1: Testing Framework]
[... same flow as above ...]
✓ Complete

[Transition Checkpoint]
- Goal 1 verified complete
- Starting Goal 2
- No dependency conflicts

[Goal 2: User Management]
[... same flow ...]
✓ Complete

[Final Multi-Goal Report]
Goals completed: 2/2
Total issues: 15
Total duration: 8h 23m
All audit logs: .wrangler/logs/2025-11-20-multi-goal-*.jsonl
```

## Benefits

### 1. **Complete Automation**
User gives goals, manager handles end-to-end execution without intervention (unless blocked).

### 2. **Iron-Clad Quality**
- TDD enforced on every task
- Code review mandatory
- Manager re-verification (don't trust subagents)
- Periodic spec alignment checks

### 3. **Full Accountability**
- Every decision logged
- Every delegation tracked
- Every verification recorded
- Audit trail for debugging "what happened?"

### 4. **Handles Complexity**
- Automatically detects parallel vs sequential
- Recovers from subagent failures
- Detects and corrects alignment drift
- Scales from 1 spec to multiple goals

### 5. **Principal Engineer Oversight**
- Strategic checkpoints (not just tactical)
- "Step back and review" built-in
- Ensures work aligns with requirements
- Catches scope creep / drift early

## Open Questions

### 1. **Checkpoint Frequency**
- Every 3 tasks? 5 tasks? User-configurable?
- Time-based (every 30 min) vs task-based (every N tasks)?

### 2. **Parallel Execution Limits**
- Max N subagents at once?
- Resource constraints?

### 3. **Failure Handling**
- Subagent fails 3 times → escalate to user?
- Automatic retry with different approach?

### 4. **Audit Log Storage**
- JSONL vs structured DB?
- Rotation/archival policy?
- Searchable index?

### 5. **Integration with Existing Workflows**
- Should this REPLACE executing-plans + subagent-driven-development?
- Or sit above them as orchestrator?

## Recommendation

**Implement this skill in phases:**

### Phase 1: Core Orchestration (MVP)
- Intake → Planning → Sequential Execution → Completion
- Manager re-verification
- Basic audit log (JSONL)
- Use existing skills (no new workflows)

### Phase 2: Advanced Features
- Parallel execution support
- Alignment checkpoints
- Drift detection and correction
- Completion report generation

### Phase 3: Multi-Goal Support
- Handle multiple specs/features
- Dependency analysis
- Resource optimization

### Phase 4: Enhanced Audit
- Searchable logs
- Web UI for log review
- Metrics and analytics

## Next Steps

If you approve this direction:

1. **Create the skill** - Write `skills/development-manager/SKILL.md`
2. **Create templates** - Subagent contract, checkpoint, completion report
3. **Test with real scenario** - Pick a medium-complexity spec and run through it
4. **Iterate based on findings** - Adjust checkpoints, verification, etc.
5. **Document in wrangler CLAUDE.md** - Add to skills library overview

## Summary

This skill fills a critical gap: **end-to-end orchestration with accountability**. It leverages our strong foundation (TDD, code review, verification skills) and adds:
- Strategic oversight (alignment checkpoints)
- Strict subagent contracts (no claiming without evidence)
- Manager re-verification (trust but verify)
- Complete audit trail (full transparency)

The result: You can give high-level goals and have confidence that work will be done correctly, completely, and with full traceability.
