# Implementation Workflow Improvements Proposal

**Date:** 2025-12-07
**Author:** Claude (analysis session)
**Goal:** Enable confident end-to-end spec implementation with full observability

## Executive Summary

You want to be able to say "go implement this spec" and have absolute confidence that:
1. A worktree gets created for isolation
2. Planning happens (writing-plans skill builds out MCP issues)
3. Main agent coordinates subagent implementation with code review
4. Tests are created and passing
5. You receive a GitHub PR link with comprehensive summary
6. You can verify afterwards that all expected steps actually happened

This memo proposes specific improvements to achieve this goal, with GitHub CLI integration as the centerpiece.

---

## Current State Assessment

### What Works Well

1. **Skill library is comprehensive** - We have skills for every phase
2. **Implement skill has solid autonomous execution** - Task loop, code review, auto-fix
3. **Worktree isolation protocol** - Just added, addresses bleeding issue
4. **MCP issues as source of truth** - Clean tracking mechanism

### Critical Gaps

| Gap | Impact | Severity |
|-----|--------|----------|
| No automated PR creation | Manual step at end, easy to forget | High |
| Implicit handoff between skills | Workflow can derail silently | High |
| No execution audit trail | Can't verify what happened | High |
| Verification relies on reports | Agent can claim success without evidence | Medium |
| No completion signal to user | Unclear when truly done | Medium |

---

## Proposed Solution: Orchestrated Implementation Flow

### Overview

Create a new **`implement-spec`** meta-skill that orchestrates the entire flow with explicit checkpoints, GitHub integration, and an audit trail.

```
User: "implement spec-auth.md"
          ↓
┌─────────────────────────────────────────────────────────┐
│  IMPLEMENT-SPEC (Orchestrator)                          │
│                                                          │
│  1. INIT: Create worktree, capture context              │
│  2. PLAN: Run writing-plans, get issue list             │
│  3. EXECUTE: Run implement skill on issues              │
│  4. VERIFY: Run verification gates                       │
│  5. PUBLISH: Create PR via gh, get URL                  │
│  6. REPORT: Present summary with PR link + audit trail  │
│                                                          │
│  [Audit Log: .wrangler/sessions/{id}/audit.jsonl]       │
└─────────────────────────────────────────────────────────┘
          ↓
User: "Here's your PR: https://github.com/org/repo/pull/123
       Audit trail: .wrangler/sessions/2025-12-07-abc123/"
```

### Phase 1: Initialization

**Actions:**
```bash
# 1. Generate session ID
SESSION_ID="$(date +%Y-%m-%d)-$(git rev-parse --short HEAD)"
SESSION_DIR=".wrangler/sessions/$SESSION_ID"
mkdir -p "$SESSION_DIR"

# 2. Create worktree
SPEC_NAME="auth-system"  # extracted from spec file
BRANCH_NAME="wrangler/$SPEC_NAME/$SESSION_ID"
WORKTREE_PATH=".worktrees/$SPEC_NAME"

git worktree add "$WORKTREE_PATH" -b "$BRANCH_NAME"
WORKTREE_ABSOLUTE="$(cd "$WORKTREE_PATH" && pwd -P)"

# 3. Initialize audit log
echo '{"phase": "init", "timestamp": "'$(date -Iseconds)'", "session_id": "'$SESSION_ID'", "worktree": "'$WORKTREE_ABSOLUTE'", "branch": "'$BRANCH_NAME'"}' >> "$SESSION_DIR/audit.jsonl"
```

**Checkpoint:**
- [ ] Worktree created and verified
- [ ] Session directory created
- [ ] Audit log initialized

**Output to next phase:**
```json
{
  "session_id": "2025-12-07-abc123",
  "worktree_path": "/abs/path/.worktrees/auth-system",
  "branch": "wrangler/auth-system/2025-12-07-abc123",
  "spec_file": ".wrangler/specifications/spec-auth-system.md"
}
```

### Phase 2: Planning

**Actions:**
1. Invoke `writing-plans` skill with spec file
2. Capture created issue IDs
3. Log to audit trail

**Audit entry:**
```json
{
  "phase": "plan",
  "timestamp": "...",
  "spec_file": "spec-auth-system.md",
  "issues_created": ["000042", "000043", "000044", "000045"],
  "plan_file": null,  // or path if architecture doc created
  "total_tasks": 4
}
```

**Checkpoint:**
- [ ] All issues created in MCP
- [ ] Issues have proper dependencies marked
- [ ] Audit log updated

### Phase 3: Execution

**Actions:**
1. Invoke `implement` skill with issue range
2. Pass worktree context explicitly
3. Capture per-task results

**Subagent context (enhanced):**
```markdown
## Session Context

Session ID: {session_id}
Worktree: {worktree_absolute}
Branch: {branch}
Audit log: {session_dir}/audit.jsonl

## Logging Requirement

After completing your task, append this to the audit log:
```bash
cd {worktree_absolute} && echo '{"phase": "task", "task_id": "{task_id}", "status": "complete", "tests_passed": true, "commit": "'$(git rev-parse HEAD)'"}' >> {session_dir}/audit.jsonl
```
```

**Audit entries (one per task):**
```json
{"phase": "task", "task_id": "000042", "status": "complete", "tests_passed": true, "commit": "abc1234", "tdd_certified": true, "code_review": "approved"}
{"phase": "task", "task_id": "000043", "status": "complete", "tests_passed": true, "commit": "def5678", "tdd_certified": true, "code_review": "approved"}
```

**Checkpoint:**
- [ ] All tasks completed
- [ ] All code reviews approved
- [ ] All tests passing
- [ ] All commits in worktree branch

### Phase 4: Verification

**Actions:**
1. Run full test suite (fresh, not cached)
2. Verify all requirements from spec
3. Aggregate TDD certifications
4. Check git status clean

**Commands:**
```bash
cd "$WORKTREE_ABSOLUTE" && npm test 2>&1 | tee "$SESSION_DIR/final-test-output.txt"
TEST_EXIT_CODE=$?

cd "$WORKTREE_ABSOLUTE" && git status --short > "$SESSION_DIR/git-status.txt"
GIT_CLEAN=$(test -s "$SESSION_DIR/git-status.txt" && echo "false" || echo "true")

echo '{"phase": "verify", "timestamp": "'$(date -Iseconds)'", "tests_exit_code": '$TEST_EXIT_CODE', "git_clean": '$GIT_CLEAN'}' >> "$SESSION_DIR/audit.jsonl"
```

**Checkpoint:**
- [ ] Test exit code = 0
- [ ] Git working tree clean
- [ ] All requirements verified

**GATE:** If verification fails, STOP and escalate. Do not proceed to publish.

### Phase 5: Publish (GitHub Integration)

**Actions:**
```bash
cd "$WORKTREE_ABSOLUTE" && \
  git push -u origin "$BRANCH_NAME" && \
  gh pr create \
    --title "feat: $SPEC_NAME" \
    --body "$(cat <<EOF
## Summary

Implements specification: \`$SPEC_FILE\`

### Changes
$(git log main.."$BRANCH_NAME" --oneline | sed 's/^/- /')

### Test Results
- Exit code: $TEST_EXIT_CODE
- All tests passing

### Tasks Completed
$(cat "$SESSION_DIR/audit.jsonl" | jq -r 'select(.phase == "task") | "- [x] \(.task_id): \(.status)"')

### TDD Compliance
All implementations followed RED-GREEN-REFACTOR.
See audit trail for per-function certification.

### Code Review
All tasks received code review with 0 Critical and 0 Important issues.

---
Session ID: \`$SESSION_ID\`
Audit trail: \`.wrangler/sessions/$SESSION_ID/\`

Generated with [Claude Code](https://claude.com/claude-code)
EOF
)" \
    --base main \
    --head "$BRANCH_NAME"
```

**Capture PR URL:**
```bash
PR_URL=$(gh pr view --json url -q '.url')
echo '{"phase": "publish", "timestamp": "'$(date -Iseconds)'", "pr_url": "'$PR_URL'", "pr_number": "'$(gh pr view --json number -q '.number')'"}' >> "$SESSION_DIR/audit.jsonl"
```

**Checkpoint:**
- [ ] Branch pushed
- [ ] PR created
- [ ] PR URL captured

### Phase 6: Report

**Final output to user:**

```markdown
## Implementation Complete

**Specification:** spec-auth-system.md
**PR:** https://github.com/org/repo/pull/123
**Branch:** wrangler/auth-system/2025-12-07-abc123

### Summary

| Metric | Value |
|--------|-------|
| Tasks completed | 4/4 |
| Tests | 47 passing |
| Code reviews | 4 approved |
| TDD compliance | 100% |

### Audit Trail

Session directory: `.wrangler/sessions/2025-12-07-abc123/`

Files:
- `audit.jsonl` - Machine-readable execution log
- `final-test-output.txt` - Complete test output
- `git-status.txt` - Final git status

### Verification Command

To verify this implementation followed all expected steps:

```bash
cat .wrangler/sessions/2025-12-07-abc123/audit.jsonl | jq -s '
  {
    phases: [.[].phase] | unique,
    tasks_completed: [.[] | select(.phase == "task")] | length,
    all_tests_passed: [.[] | select(.phase == "task") | .tests_passed] | all,
    verification_passed: [.[] | select(.phase == "verify") | .tests_exit_code == 0] | all,
    pr_created: [.[] | select(.phase == "publish") | .pr_url] | length > 0
  }
'
```

Expected output:
```json
{
  "phases": ["init", "plan", "task", "verify", "publish"],
  "tasks_completed": 4,
  "all_tests_passed": true,
  "verification_passed": true,
  "pr_created": true
}
```
```

---

## Audit Trail Schema

### audit.jsonl Format

Each line is a JSON object with at minimum:
```json
{
  "phase": "init|plan|task|verify|publish|error",
  "timestamp": "ISO-8601",
  ...phase-specific fields
}
```

### Phase-Specific Fields

**init:**
```json
{
  "phase": "init",
  "timestamp": "2025-12-07T10:30:00-05:00",
  "session_id": "2025-12-07-abc123",
  "worktree": "/abs/path/.worktrees/auth-system",
  "branch": "wrangler/auth-system/2025-12-07-abc123",
  "spec_file": ".wrangler/specifications/spec-auth-system.md"
}
```

**plan:**
```json
{
  "phase": "plan",
  "timestamp": "...",
  "issues_created": ["000042", "000043", "000044", "000045"],
  "plan_file": null,
  "total_tasks": 4
}
```

**task:**
```json
{
  "phase": "task",
  "timestamp": "...",
  "task_id": "000042",
  "status": "complete",
  "tests_passed": true,
  "commit": "abc1234def5678",
  "tdd_certified": true,
  "code_review": "approved",
  "files_changed": ["src/auth.ts", "src/auth.test.ts"],
  "duration_seconds": 120
}
```

**verify:**
```json
{
  "phase": "verify",
  "timestamp": "...",
  "tests_exit_code": 0,
  "tests_total": 47,
  "tests_passed": 47,
  "tests_failed": 0,
  "git_clean": true,
  "requirements_verified": true
}
```

**publish:**
```json
{
  "phase": "publish",
  "timestamp": "...",
  "pr_url": "https://github.com/org/repo/pull/123",
  "pr_number": 123,
  "branch_pushed": true
}
```

**error:**
```json
{
  "phase": "error",
  "timestamp": "...",
  "error_type": "verification_failed|task_blocked|gh_error",
  "message": "Test suite failed with exit code 1",
  "context": {...}
}
```

---

## Post-Execution Verification

### Command: Verify Session Compliance

```bash
# Verify all expected phases completed
wrangler-verify-session .wrangler/sessions/2025-12-07-abc123/

# Output:
# ✓ Phase: init - Worktree created
# ✓ Phase: plan - 4 issues created
# ✓ Phase: task (000042) - Complete, tests passed, TDD certified, reviewed
# ✓ Phase: task (000043) - Complete, tests passed, TDD certified, reviewed
# ✓ Phase: task (000044) - Complete, tests passed, TDD certified, reviewed
# ✓ Phase: task (000045) - Complete, tests passed, TDD certified, reviewed
# ✓ Phase: verify - Tests passed (47/47), git clean
# ✓ Phase: publish - PR #123 created
#
# Session Status: COMPLETE
# All expected phases executed successfully.
```

### Manual Verification Queries

```bash
# Did all tasks complete?
cat audit.jsonl | jq -s '[.[] | select(.phase == "task")] | length'

# Did any task fail tests?
cat audit.jsonl | jq -s '[.[] | select(.phase == "task" and .tests_passed == false)]'

# Was TDD followed for all tasks?
cat audit.jsonl | jq -s '[.[] | select(.phase == "task" and .tdd_certified == false)]'

# What was the final verification status?
cat audit.jsonl | jq -s '.[] | select(.phase == "verify")'

# Get the PR URL
cat audit.jsonl | jq -s '.[] | select(.phase == "publish") | .pr_url'
```

---

## Implementation Plan

### Phase 1: GitHub CLI Integration (1-2 days)

1. **Create `github-pr-workflow` skill**
   - Push branch to remote
   - Create PR with comprehensive body
   - Return PR URL
   - Handle errors (auth, permissions)

2. **Update `finishing-a-development-branch` skill**
   - Add "Create PR via gh" as explicit option
   - Call new github-pr-workflow skill
   - Capture and return PR URL

### Phase 2: Audit Trail Infrastructure (2-3 days)

1. **Create session directory structure**
   - `.wrangler/sessions/{session-id}/`
   - `audit.jsonl` format
   - Helper functions for logging

2. **Create audit logging skill**
   - `audit-log-entry` - Append entry to session log
   - `audit-verify-session` - Verify session compliance

3. **Update existing skills to log**
   - `using-git-worktrees` → log init phase
   - `writing-plans` → log plan phase
   - `implement` → log task phases
   - `finishing-a-development-branch` → log verify/publish phases

### Phase 3: Orchestrator Skill (2-3 days)

1. **Create `implement-spec` orchestrator skill**
   - Coordinates all phases
   - Manages session context
   - Handles errors and rollback
   - Produces final report

2. **Create `/wrangler:implement-spec` command**
   - Entry point for users
   - Parses spec file argument
   - Invokes orchestrator skill

### Phase 4: Verification Tooling (1-2 days)

1. **Create session verification script**
   - Parse audit.jsonl
   - Check all phases complete
   - Report compliance status

2. **Add to skill library**
   - `verify-session-compliance` skill
   - Can be run anytime after session

---

## Alternative: Lighter-Weight Approach

If full audit trail is too heavy, a simpler approach:

### Session Context File

Instead of JSONL audit log, use a single markdown file:

**.wrangler/sessions/{session-id}/CONTEXT.md**
```markdown
# Session: 2025-12-07-abc123

## Status: COMPLETE

## Configuration
- Spec: spec-auth-system.md
- Worktree: .worktrees/auth-system
- Branch: wrangler/auth-system/2025-12-07-abc123

## Progress
- [x] Init: Worktree created
- [x] Plan: 4 issues created (000042-000045)
- [x] Task 000042: Complete
- [x] Task 000043: Complete
- [x] Task 000044: Complete
- [x] Task 000045: Complete
- [x] Verify: Tests passing (47/47)
- [x] Publish: PR #123 created

## Result
PR: https://github.com/org/repo/pull/123

## Notes
[Any issues, blockers, or observations]
```

**Pros:** Human-readable, easy to update, familiar format
**Cons:** Not machine-queryable, manual checkbox management

---

## Recommendation

Start with **Phase 1 (GitHub CLI Integration)** as it provides immediate value:
- Automates the manual PR creation step
- Gives you the PR link you want
- Low risk, high reward

Then implement **Phase 2 (Audit Trail)** as it enables:
- Post-execution verification
- Debugging failed sessions
- Confidence that steps executed

**Phase 3 (Orchestrator)** can wait until Phases 1-2 prove the pattern works.

---

## Questions for You

1. **Session directory location:** `.wrangler/sessions/` or elsewhere?
2. **Audit format:** JSONL (machine-readable) or Markdown (human-readable)?
3. **PR body format:** What should be included? Current proposal has summary, changes, test results, tasks, TDD compliance.
4. **Worktree cleanup:** After PR created, should worktree be automatically removed?
5. **Error handling:** If a phase fails, should we auto-rollback (delete branch/worktree) or leave for debugging?

---

## Appendix: GitHub CLI Commands Reference

```bash
# Create PR
gh pr create --title "..." --body "..." --base main --head branch

# Get PR URL
gh pr view --json url -q '.url'

# Get PR number
gh pr view --json number -q '.number'

# Check PR status
gh pr checks

# Wait for checks
gh pr checks --watch

# Merge PR
gh pr merge --squash

# Close PR (discard)
gh pr close --delete-branch
```
