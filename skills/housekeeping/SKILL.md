---
name: housekeeping
description: Perform comprehensive project housekeeping - update roadmap, reconcile issues with implementation reality, organize completed work, and identify drift. This is a workflow skill that coordinates multiple parallel subagents for efficiency.
---

You are the housekeeping workflow coordinator. Your job is to ensure the project's documentation and issue tracking accurately reflects reality, organize completed work, and provide a clear snapshot of current state and next steps.

## Core Responsibilities

- Update PROJ_ROADMAP__NEXT_STEPS.md to reflect current reality
- Reconcile open issues with actual implementation
- Move completed issues to organized archive
- Identify documentation drift or missing updates
- Generate housekeeping summary report with metrics

## Execution Strategy: Multi-Phase Workflow

This is a **workflow skill** - it coordinates multiple subagents in parallel for maximum efficiency.

### **Phase 1: Roadmap Update (Sequential)**

**Why sequential:** Need current state understanding before dispatching parallel agents.

**Task:** Update PROJ_ROADMAP__NEXT_STEPS.md

**Approach:**
1. Read current PROJ_ROADMAP__NEXT_STEPS.md (or create if doesn't exist)
2. Review recent git commits (last 20-30 commits) to understand what's been completed
3. Review open and recently closed issues to understand current work
4. Update roadmap with:
   - **Completed Recently:** What's been finished since last housekeeping
   - **Current State:** Clear snapshot of where we are now
   - **In Progress:** What's actively being worked on
   - **Next Steps:** Prioritized list of what comes next
   - **Blockers:** Any impediments or open questions

**Output:** Updated roadmap file with accurate current state

---

### **Phase 2: Parallel Issue Reconciliation (Parallel)**

**Why parallel:** Three independent tasks with no dependencies - run simultaneously for speed.

Launch **three parallel subagents** using the Task tool:

#### **Agent A: Open Issues Reconciliation**

**Task:** Review all open issues and ensure they match implementation reality

**Approach:**
1. List all open issues (`issues_list` with `status: ["open", "in_progress"]`)
2. For each open issue:
   - Read the issue content
   - Check if described work has actually been completed
   - Check if requirements have changed during implementation
   - Identify issues that should be closed but weren't
   - Identify issues that need updates due to design changes
3. Take action:
   - **If completed but not closed:** Use `issues_mark_complete` or `issues_update` to close
   - **If requirements drifted:** Use `issues_update` to reflect actual implementation
   - **If blocked/cancelled:** Use `issues_update` to mark status appropriately
4. Track metrics:
   - Issues reviewed: [count]
   - Issues closed: [count]
   - Issues updated: [count]
   - Issues with drift: [count]

**Output:** List of actions taken and current state summary

---

#### **Agent B: Completed Issues Organization**

**Task:** Move completed/closed issues to `issues/completed/` directory for archival

**Approach:**
1. List all closed issues (`issues_list` with `status: ["closed", "cancelled"]`)
2. Check if `issues/completed/` directory exists, create if not
3. For each closed issue:
   - Check if still in `issues/` root directory
   - If yes, move to `issues/completed/`
   - Preserve filename (don't rename)
4. Track metrics:
   - Completed issues found: [count]
   - Issues moved: [count]
   - Already organized: [count]

**Output:** Organization summary with file counts

---

#### **Agent C: Documentation Drift Detection**

**Task:** Identify areas where documentation may not reflect implementation reality

**Approach:**
1. Read key documentation files:
   - README.md
   - CLAUDE.md (or equivalent project documentation)
   - Any SPEC-*.md files
2. Review recent git commits for major changes
3. Look for signs of drift:
   - Features mentioned in docs but not implemented
   - Features implemented but not documented
   - API changes not reflected in docs
   - Configuration changes not updated
   - File structure changes not documented
4. Create list of documentation updates needed
5. Track metrics:
   - Documentation files reviewed: [count]
   - Drift issues found: [count]
   - Severity: High/Medium/Low

**Output:** List of documentation drift issues with recommendations

---

### **Phase 3: Summary Report (Sequential)**

**Why sequential:** Needs results from all Phase 2 agents.

**Task:** Compile comprehensive housekeeping report

**Approach:**
1. Wait for all Phase 2 agents to complete
2. Aggregate metrics from all agents
3. Create summary report showing:
   - Roadmap status (updated/current)
   - Issues reconciled (count, actions taken)
   - Files organized (count, location)
   - Documentation drift (issues found, severity)
   - Time taken per phase (if trackable)
   - Recommendations for follow-up work

**Output:** Housekeeping summary report

---

## Workflow Execution Plan

### **Step 1: Start Phase 1 (Roadmap Update)**

Execute roadmap update task yourself (don't delegate this one).

### **Step 2: Launch Phase 2 Parallel Agents**

Use **three separate Task tool calls in a single message** to dispatch parallel agents:

```
I'm launching three parallel housekeeping agents:

[Use Task tool - Agent A: Open Issues Reconciliation]
[Use Task tool - Agent B: Completed Issues Organization]
[Use Task tool - Agent C: Documentation Drift Detection]
```

**CRITICAL:** All three Task tool calls must be in a **single response** to execute truly in parallel.

### **Step 3: Collect Results & Generate Report**

Wait for all agents to complete, then compile summary report.

---

## Housekeeping Report Template

```markdown
# Housekeeping Report - [Date]

## Summary

Housekeeping workflow completed successfully.

**Duration:** [X] minutes total
- Phase 1 (Roadmap): [X] minutes
- Phase 2 (Parallel reconciliation): [X] minutes
- Phase 3 (Report generation): [X] minutes

## Roadmap Update

✅ PROJ_ROADMAP__NEXT_STEPS.md updated

**Completed since last housekeeping:**
- [Item 1]
- [Item 2]

**Current priorities:**
- [Priority 1]
- [Priority 2]

**Blockers identified:**
- [Blocker 1 if any]

## Issue Reconciliation

**Agent A - Open Issues:**
- Issues reviewed: [count]
- Issues closed: [count]
- Issues updated for drift: [count]
- Status: ✅ Complete

**Agent B - Completed Issues Organization:**
- Completed issues found: [count]
- Issues moved to archive: [count]
- Status: ✅ Complete

**Agent C - Documentation Drift:**
- Documentation files reviewed: [count]
- Drift issues found: [count]
  - High severity: [count]
  - Medium severity: [count]
  - Low severity: [count]
- Status: ✅ Complete

## Actions Taken

### Issues Closed
- #000XXX - [Issue title] - Reason: [completed/cancelled]

### Issues Updated
- #000XXX - [Issue title] - Change: [what was updated]

### Files Organized
- Moved [X] issues to `issues/completed/`

### Documentation Drift Issues

**High Priority:**
- [ ] [Issue 1 description]

**Medium Priority:**
- [ ] [Issue 2 description]

**Low Priority:**
- [ ] [Issue 3 description]

## Recommendations

1. [Recommendation 1]
2. [Recommendation 2]

## Metrics

- Total issues in system: [count]
- Open issues: [count]
- In progress: [count]
- Completed: [count]
- Issue completion rate: [X]%
- Documentation coverage: [assessment]

---

*Housekeeping workflow v1.0 - Generated by wrangler:housekeeping*
```

---

## Usage Examples

### **Example 1: Regular Housekeeping**

**User:** "Run housekeeping"

**Agent Response:**
1. "Starting housekeeping workflow..."
2. "Phase 1: Updating PROJ_ROADMAP__NEXT_STEPS.md..."
3. "Phase 2: Launching three parallel reconciliation agents..."
   - Dispatches Agent A (issues)
   - Dispatches Agent B (organization)
   - Dispatches Agent C (drift detection)
4. Waits for completion
5. "Phase 3: Generating housekeeping report..."
6. Presents summary report

---

### **Example 2: Post-Sprint Housekeeping**

**User:** "We just finished the authentication feature sprint, run housekeeping"

**Agent Response:**
1. Updates roadmap with authentication feature completion
2. Reconciles auth-related issues
3. Moves completed auth issues to archive
4. Checks if auth documentation is up to date
5. Reports on sprint completion status

---

## Workflow Metrics & Observability

Track these metrics for workflow optimization:

**Efficiency Metrics:**
- Total housekeeping time
- Time per phase
- Parallel speedup factor (Phase 2 time vs. sequential equivalent)

**Action Metrics:**
- Issues reconciled
- Files organized
- Drift issues found
- Documentation updates needed

**Health Metrics:**
- Issue staleness (open issues > 30 days)
- Documentation drift severity
- Roadmap currency (last update date)

These metrics help identify:
- Bottlenecks in workflow
- Areas needing more frequent housekeeping
- Project health indicators

---

## Important Implementation Notes

### **Parallel Execution**

To run Phase 2 agents in **true parallel**, you MUST:
1. Use the Task tool **three times** in a **single response**
2. Do NOT wait for Agent A to finish before launching Agent B
3. All three tool calls should be in the same message

**Example (correct parallel execution):**
```
I'm launching three parallel agents for Phase 2 housekeeping:

[Task tool call for Agent A]
[Task tool call for Agent B]
[Task tool call for Agent C]

All three agents are now running in parallel...
```

**Example (incorrect - sequential execution):**
```
Launching Agent A...
[Wait for Agent A]
Now launching Agent B...
[Wait for Agent B]
Now launching Agent C...
```

### **State Isolation**

Each Phase 2 agent operates on independent data:
- Agent A: Open issues (won't touch closed)
- Agent B: Closed issues (won't touch open)
- Agent C: Documentation (won't touch issues)

This ensures no conflicts or race conditions.

### **Idempotency**

Housekeeping is idempotent - running it multiple times is safe:
- Roadmap: Last update wins (always reflects current)
- Issues: Already-closed issues stay closed
- Organization: Already-moved files stay moved
- Drift: Re-detection is harmless

---

## Extensibility

Future enhancements could add more parallel agents:

**Agent D: Dependency Updates**
- Check for outdated dependencies
- Identify security vulnerabilities

**Agent E: Test Coverage Analysis**
- Identify untested code
- Generate test coverage report

**Agent F: Performance Regression Detection**
- Run benchmarks
- Compare to baseline

**Agent G: Code Quality Metrics**
- Run linters
- Check complexity metrics

The workflow framework is designed to scale to arbitrary parallel agents.

---

## Success Criteria

Housekeeping is successful when:

✅ Roadmap accurately reflects current state and next steps
✅ All completed issues are marked as closed
✅ All closed issues are archived in `issues/completed/`
✅ Issue descriptions match implementation reality
✅ Documentation drift is identified and catalogued
✅ Summary report provides actionable insights
✅ Workflow completes in reasonable time (< 5 minutes for typical project)

---

## Frequency Recommendations

**When to run housekeeping:**
- After completing major features
- Weekly for active projects
- Before starting new sprints/milestones
- Before creating release
- When project feels "messy" or out of sync

**Automation potential:**
- Could be triggered by git hooks (post-merge)
- Could run on schedule (weekly cron)
- Could be part of CI/CD pipeline
