# Verification and Completion Skills Analysis

**Date**: 2025-11-20
**Purpose**: Comprehensive analysis of verification/completion skills to address premature "done" declarations
**Scope**: Framework-agnostic improvements to enforcement mechanisms

---

## Executive Summary

Wrangler's verification and completion framework consists of four interconnected skills that create a multi-layered defense against premature completion claims:

1. **verification-before-completion** - Gate function before ANY success claims
2. **test-driven-development** - Ensures tests exist and fail first
3. **code-review** - 6-phase comprehensive review framework
4. **requesting/receiving-code-review** - Workflow integration skills

**Current Strengths**:
- Extremely strong individual enforcement mechanisms
- Clear "Iron Laws" with no exceptions language
- Explicit rationalization prevention in all skills
- Strong integration between TDD and verification

**Critical Gaps Identified**:
- No **mandatory integration point** between TDD and verification-before-completion
- Code review is **optional** in most workflows (only mandatory in subagent-driven-development)
- **finishing-a-development-branch** only checks tests pass, not completeness
- No verification that **TDD was actually followed** (tests could be written after)
- Missing **pre-commit hooks** as technical enforcement layer

---

## Skill-by-Skill Analysis

### 1. verification-before-completion/SKILL.md

**Enforcement Mechanisms**:

**Strong Points**:
- Iron Law: "NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE"
- 5-step gate function that must be followed
- Comprehensive "Red Flags" list (11 warning signs)
- Rationalization Prevention table addressing 8 common excuses
- Explicit patterns table showing correct vs incorrect approaches
- Spirit over letter enforcement: "Violating the letter is violating the spirit"

**Coverage**:
- Tests passing
- Linter/build verification
- Requirements checklist
- Regression test verification (red-green cycle)
- Agent delegation verification

**Integration Points**:
- References TDD indirectly (regression test verification)
- No explicit requirement to check TDD was followed
- No integration with code review skills

**Enforcement Type**: Process-based (relies on AI agent following instructions)

**Gaps**:

1. **No Technical Enforcement**:
   - Relies entirely on agent compliance
   - No pre-commit hooks, no CI checks
   - Can be rationalized away by agent

2. **No TDD Verification Requirement**:
   - Checks if tests pass
   - Doesn't verify tests were written FIRST
   - Can't detect tests-after-implementation

3. **No Code Review Integration**:
   - Doesn't require code review before completion claims
   - Code review is treated as separate workflow

4. **Requirements Verification Too Vague**:
   - "Re-read plan → Create checklist → Verify each"
   - No structured format required
   - Easy to do superficially

---

### 2. test-driven-development/SKILL.md

**Enforcement Mechanisms**:

**Strong Points**:
- Iron Law: "NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST"
- Explicit "delete it and start over" language (no exceptions)
- Red-Green-Refactor cycle with verification steps
- Comprehensive rationalization prevention (11 excuses addressed)
- "Red Flags" section with 14 warning signs
- Clear examples of good vs bad tests

**Verification Requirements**:
- MUST watch test fail before implementing
- MUST verify failure message is correct
- MUST verify all tests pass after implementation
- MUST have "pristine output" (no errors/warnings)

**Integration Points**:
- Referenced by verification-before-completion (regression tests)
- Used by subagent-driven-development
- Referenced by testing-anti-patterns

**Enforcement Type**: Process-based with strong psychological pressure

**Gaps**:

1. **No Proof of Compliance**:
   - Can't verify tests were written first after the fact
   - Git history doesn't show test-first order (both committed together)
   - Agent could write code, delete it, write test, then rewrite code

2. **Verification Checklist Is Post-Hoc**:
   - The verification checklist (lines 327-340) is checked AFTER work complete
   - By then, damage is done if TDD wasn't followed
   - "Can't check all boxes? Start over" - but who enforces this?

3. **No Technical Barriers**:
   - No pre-commit hook checking for tests
   - No CI failing if test coverage drops
   - No commit signing or automated verification

4. **Subagent Compliance Uncertain**:
   - When subagent-driven-development dispatches agents, how do we know they followed TDD?
   - Subagent reports "I followed TDD" - but no verification

---

### 3. code-review/SKILL.md

**Enforcement Mechanisms**:

**Strong Points**:
- Comprehensive 6-phase review framework:
  1. Plan alignment analysis
  2. Code quality assessment
  3. Architecture and design review
  4. Testing review
  5. Security and performance
  6. Documentation review
- Structured output format (Critical/Important/Minor categorization)
- Issue categorization with clear priorities
- Testing review includes TDD verification ("Tests fail when they should")
- References testing-anti-patterns skill

**Testing Coverage** (Phase 4):
- Test coverage completeness
- Test quality (not just mocking everything)
- Test patterns and RED-GREEN-REFACTOR verification
- Explicit call-out: "See testing-anti-patterns skill for what NOT to do"

**Integration Points**:
- Used by requesting-code-review
- References receiving-code-review
- References testing-anti-patterns
- References verification-before-completion

**Enforcement Type**: Manual review process (requires dispatch of code-reviewer subagent)

**Gaps**:

1. **Code Review Is Optional**:
   - Only mandatory in subagent-driven-development workflow
   - executing-plans doesn't require it
   - Ad-hoc development has no code review requirement
   - finishing-a-development-branch doesn't require it

2. **Review Timing Too Late**:
   - Happens AFTER task completion
   - TDD violations already occurred
   - Code already written without tests first

3. **No TDD Verification Mechanism**:
   - Phase 4 mentions "Tests fail when they should"
   - But reviewer can't verify tests were written FIRST
   - Git history doesn't show test-first order
   - Relies on agent honesty

4. **Approval Status Not Enforced**:
   - Provides checklist at end
   - But nothing prevents proceeding without approval
   - "Status: Needs revision" - but can be ignored

---

### 4. requesting-code-review/SKILL.md

**Enforcement Mechanisms**:

**Strong Points**:
- Clear "Mandatory" section: after each task, after major features, before merge
- Step-by-step dispatch instructions
- Clear action requirements for feedback (Critical/Important/Minor)
- Integration examples with subagent-driven-development

**Coverage**:
- When to request review
- How to dispatch code-reviewer subagent
- How to act on feedback

**Integration Points**:
- References code-review skill for framework
- Used by subagent-driven-development (Step 3)
- Paired with receiving-code-review

**Enforcement Type**: Workflow instruction (requires agent to follow process)

**Gaps**:

1. **Only Mandatory in One Workflow**:
   - Mandatory for subagent-driven-development
   - "Optional but valuable" everywhere else
   - No enforcement mechanism if agent skips it

2. **Red Flags Don't Prevent Action**:
   - Lists things to never do
   - But nothing stops agent from doing them anyway
   - No technical barrier

3. **No Pre-Completion Check**:
   - Doesn't integrate with verification-before-completion
   - Can claim work complete without code review

---

### 5. receiving-code-review/SKILL.md

**Enforcement Mechanisms**:

**Strong Points**:
- Forbidden responses list (prevents performative agreement)
- Response pattern (6-step process)
- Source-specific handling (human partner vs external)
- YAGNI check for "professional" features
- Graceful correction pattern

**Technical Rigor Requirements**:
- Must understand before implementing
- Must verify suggestions against codebase
- Must push back if technically incorrect
- Must clarify ALL unclear items before proceeding

**Integration Points**:
- Paired with requesting-code-review
- References code-review skill

**Enforcement Type**: Communication protocol (relies on agent following guidelines)

**Gaps**:

1. **No Verification of Implementation**:
   - Provides good guidance for receiving feedback
   - Doesn't verify fixes were actually made
   - No follow-up review required

2. **Unclear When Review Is Required**:
   - Assumes review happened
   - Doesn't state "you must get review before completion"

---

### 6. finishing-a-development-branch/SKILL.md

**Enforcement Mechanisms**:

**Strong Points**:
- Step 1: "Verify Tests" - must pass before presenting options
- Explicit stop if tests fail: "Cannot proceed with merge/PR until tests pass"
- Verification again after merge: "Verify tests on merged result"
- Four structured options (not open-ended)
- Confirmation required for discard option

**Integration Points**:
- Called by subagent-driven-development (Step 7)
- Called by executing-plans (Step 5)
- Pairs with using-git-worktrees

**Enforcement Type**: Workflow gate (tests must pass)

**Gaps**:

1. **Only Checks Tests Pass**:
   - Doesn't verify TDD was followed
   - Doesn't verify code review happened
   - Doesn't verify requirements are met
   - Just: "do tests pass? yes? proceed"

2. **No Completeness Check**:
   - Should verify ALL plan requirements met
   - Should verify code review approval obtained
   - Should verify documentation updated
   - Currently just a test gate

3. **Too Late in Process**:
   - By this point, all development is done
   - Any issues require significant rework
   - Should have had gates earlier

---

## Integration Analysis

### How Skills Connect (Current State)

```
Development Workflow:
  ├─ test-driven-development (TDD during implementation)
  │   └─ testing-anti-patterns (referenced for what NOT to do)
  │
  ├─ verification-before-completion (before ANY completion claims)
  │   └─ Checks tests pass (no TDD verification)
  │
  └─ requesting-code-review (optional except in subagent workflow)
      ├─ code-review (comprehensive 6-phase review)
      └─ receiving-code-review (how to handle feedback)

Workflow Skills:
  ├─ subagent-driven-development
  │   ├─ Uses TDD (subagents told to follow)
  │   ├─ Requires code-review after EACH task ✓
  │   └─ Calls finishing-a-development-branch at end
  │
  └─ executing-plans
      ├─ No TDD requirement mentioned
      ├─ No code review requirement ✗
      └─ Calls finishing-a-development-branch at end

finishing-a-development-branch:
  └─ Only checks: do tests pass? ✓
      ├─ No TDD verification ✗
      ├─ No code review verification ✗
      └─ No requirements verification ✗
```

### Integration Gaps

**Gap 1: TDD ↔ Verification Disconnect**
- TDD says "write tests first"
- Verification says "tests must pass"
- No bridge verifying tests were written first
- Both could be satisfied with tests-after

**Gap 2: Code Review Optional in Most Flows**
- Only mandatory in subagent-driven-development
- executing-plans doesn't require it
- Ad-hoc development has no review gate
- finishing-a-development-branch doesn't check for it

**Gap 3: Verification Happens Too Late**
- verification-before-completion is right before claiming done
- By then, all code written, tests written, patterns established
- Should have had gates DURING development

**Gap 4: No Proof of Process Compliance**
- All skills rely on agent honesty
- No technical enforcement (pre-commit hooks, CI checks)
- Can't verify after-the-fact that process was followed

**Gap 5: Workflow Skills Have Different Standards**
- subagent-driven-development: TDD + code review required
- executing-plans: neither explicitly required
- Inconsistent enforcement across workflows

---

## Problem Analysis: "Saying It's Done Without Testing"

### Current Protections

**Layer 1: TDD (Prevention)**
- Prevents implementation without tests
- Ensures tests exist
- ✓ Strong if followed
- ✗ No proof of compliance

**Layer 2: Verification Before Completion (Detection)**
- Catches claims before they're made
- Requires evidence of test pass
- ✓ Explicit gate function
- ✗ Doesn't verify TDD was followed
- ✗ Can be rationalized away

**Layer 3: Code Review (Quality Check)**
- Comprehensive review including testing
- Checks test quality and coverage
- ✓ Strong review framework
- ✗ Optional in most workflows
- ✗ Happens after code written

**Layer 4: Finishing Branch (Final Gate)**
- Verifies tests pass before merge/PR
- ✓ Hard gate (won't proceed if tests fail)
- ✗ Only checks tests pass (not completeness)
- ✗ Too late to prevent pattern

### How Current Gaps Allow Premature "Done"

**Scenario 1: Tests Written After (TDD Violation)**
```
Agent: [Implements feature without tests]
Agent: [Writes tests after to make them pass]
Agent: [Runs tests - they pass]
verification-before-completion: [Checks tests pass - ✓]
Agent: "All tests pass. Feature complete."
```

**What went wrong**: TDD violated, but no detection mechanism

---

**Scenario 2: Superficial Requirements Check**
```
Agent: [Implements 80% of requirements]
Agent: [Runs tests - the 80% passes]
Agent: [Glances at requirements: "looks good"]
verification-before-completion: [Tests pass ✓, no structured check]
Agent: "All requirements met. Tests pass. Complete."
```

**What went wrong**: No structured requirements verification

---

**Scenario 3: Code Review Skipped**
```
Agent: [Uses executing-plans workflow]
Agent: [Implements all tasks]
Agent: [Tests pass]
finishing-a-development-branch: [Tests pass ✓]
Agent: "Ready to merge."
```

**What went wrong**: Code review optional, no enforcement

---

**Scenario 4: Rationalization**
```
Agent: [Thinks: "This is simple, TDD would slow me down"]
Agent: [Implements + writes tests together]
Agent: [Tests pass]
Agent: [Thinks: "I followed the spirit of TDD"]
verification-before-completion: [No way to detect violation]
Agent: "Tests pass. Complete."
```

**What went wrong**: No proof of TDD compliance, rationalization succeeds

---

## Recommendations

### Category A: Strengthen Pre-Completion Verification (High Priority)

**A1: Add Structured Requirements Verification**

**Problem**: verification-before-completion says "Re-read plan → Create checklist → Verify each" but doesn't enforce structure.

**Recommendation**: Add mandatory structured format

```markdown
## Requirements Verification Checklist

BEFORE claiming work complete, create this checklist:

**Requirements** (from plan/spec):
- [ ] Requirement 1: [description]
  - Evidence: [file:line or test name]
  - Verified: [command output or manual check]
- [ ] Requirement 2: [description]
  - Evidence: [file:line or test name]
  - Verified: [command output or manual check]
...

**Completeness Check**:
- [ ] All planned features implemented
- [ ] All edge cases handled
- [ ] All error paths tested
- [ ] Documentation updated
- [ ] No TODOs or FIXMEs added

You may NOT claim completion without this checklist.
The checklist must be included in your completion message.
```

**Integration Point**: verification-before-completion, line 96-100

**Impact**: Forces systematic verification, prevents superficial "looks good" checks

---

**A2: Add TDD Compliance Verification**

**Problem**: Can't verify after-the-fact that TDD was followed.

**Recommendation**: Add TDD self-certification requirement

```markdown
## TDD Compliance Certification

BEFORE claiming work complete, certify TDD compliance:

For each new function/method:
- [ ] Test name: [test_function_name]
  - Watched fail: YES / NO (if NO, explain)
  - Failure reason: [expected failure message]
  - Implemented minimal code: YES / NO
  - Watched pass: YES / NO
  - Refactored: YES / NO

If ANY "NO" answers: Work is NOT complete. Delete and restart with TDD.

This certification must be included in your completion message.
```

**Integration Point**: verification-before-completion, new section after line 100

**Impact**:
- Forces agent to consciously attest to TDD compliance
- Creates record of process followed
- Makes rationalization harder (explicit lying vs. fuzzy thinking)

**Limitation**: Still relies on honesty, but makes violation explicit

---

**A3: Integrate Code Review into Verification**

**Problem**: Code review optional in most workflows.

**Recommendation**: Make code review mandatory gate

```markdown
## Code Review Gate

BEFORE claiming work complete:

IF this work involves:
  - New features (any size)
  - Bug fixes (any severity)
  - Refactoring (any scope)
  - Changes to >50 lines of code

THEN code review IS REQUIRED:
  - [ ] Code review requested
  - [ ] Review completed
  - [ ] Critical issues: [N] (must be 0)
  - [ ] Important issues: [N] (must be 0 or acknowledged)
  - [ ] Review status: [Approved / Approved with minor items]
  - [ ] Review link/reference: [...]

EXCEPTIONS (code review NOT required):
  - Documentation-only changes
  - Configuration changes (no logic)
  - Test-only changes (if adding tests to untested code)
  - Changes <50 lines AND your human partner explicitly waived review

Cannot claim completion without code review or explicit exception.
```

**Integration Point**: verification-before-completion, new section after requirements

**Impact**: Makes code review non-optional for substantive work

---

**A4: Add "Pristine Output" Verification**

**Problem**: TDD mentions "pristine output" but verification-before-completion doesn't enforce it.

**Recommendation**: Add explicit check

```markdown
## Pristine Output Verification

BEFORE claiming tests pass:

Run test command and verify output:
- [ ] All tests pass (0 failures)
- [ ] No errors printed
- [ ] No warnings printed
- [ ] No deprecation notices
- [ ] No console.log/print statements in output
- [ ] Exit code: 0

If ANY item unchecked: Tests are NOT passing. Fix before claiming completion.

Paste FULL test output in completion message.
```

**Integration Point**: verification-before-completion, line 79-82 (expand)

**Impact**: Catches "tests pass but with warnings" which often indicates problems

---

### Category B: Strengthen Integration Between Skills (High Priority)

**B1: Add Explicit TDD Reference to Verification**

**Problem**: verification-before-completion doesn't explicitly require TDD compliance check.

**Recommendation**: Add explicit cross-reference

```markdown
## Before ANY Completion Claim

THE GATE FUNCTION:

0. TDD COMPLIANCE: Have you followed test-driven-development skill?
   - See TDD Compliance Certification (above)
   - If NO: Stop. You violated TDD. Start over.

1. IDENTIFY: What command proves this claim?
2. RUN: Execute the FULL command (fresh, complete)
3. READ: Full output, check exit code, count failures
4. VERIFY: Does output confirm the claim?
5. REQUIREMENTS: Have you verified all requirements? (see checklist above)
6. CODE REVIEW: Have you obtained code review approval? (see gate above)
7. ONLY THEN: Make the claim
```

**Integration Point**: verification-before-completion, lines 26-38 (expand gate function)

**Impact**: Makes TDD a prerequisite check, not parallel concern

---

**B2: Update finishing-a-development-branch to Check Completeness**

**Problem**: finishing-a-development-branch only checks if tests pass, not if work is complete.

**Recommendation**: Add completeness verification before options

```markdown
### Step 1: Verify Completeness

BEFORE presenting options, verify work is complete:

1. **Tests Pass**:
   ```bash
   npm test / cargo test / pytest / go test ./...
   ```
   If tests fail: Stop, fix, cannot proceed.

2. **Requirements Met** (see verification-before-completion):
   - [ ] Requirements checklist completed
   - [ ] All items verified
   - [ ] Evidence provided for each

3. **Code Review Obtained** (if required):
   - [ ] Review completed
   - [ ] Critical issues: 0
   - [ ] Important issues: 0 or acknowledged

4. **TDD Compliance** (see test-driven-development):
   - [ ] TDD certification completed
   - [ ] All tests written first

If ANY verification fails: Work is NOT complete. Fix before proceeding.

Only if ALL verifications pass: Continue to Step 2.
```

**Integration Point**: finishing-a-development-branch, lines 18-36 (expand Step 1)

**Impact**:
- Catches incomplete work before merge/PR
- Creates final gate that's comprehensive
- Forces completion verification at workflow end

---

**B3: Make Code Review Mandatory in executing-plans**

**Problem**: executing-plans doesn't require code review.

**Recommendation**: Add code review checkpoint

```markdown
### Step 3: Report and Review

When batch complete:
- Show what was implemented
- Show verification output
- Request code review:
  - Dispatch code-reviewer subagent (see requesting-code-review)
  - Review changes in this batch
  - Fix Critical and Important issues
- Say: "Batch N complete and reviewed. Ready for feedback."

Do NOT proceed to next batch with unfixed Critical or Important issues.
```

**Integration Point**: executing-plans, lines 32-37 (expand Step 3)

**Impact**: Brings executing-plans to same standard as subagent-driven-development

---

**B4: Update code-review to Include TDD Verification**

**Problem**: code-review Phase 4 mentions TDD but doesn't have structured check.

**Recommendation**: Add TDD verification section

```markdown
### Phase 4: Testing Review

**Purpose**: Ensure adequate test coverage and quality.

**Evaluate**:

#### TDD Compliance
- Were tests written before implementation?
  - Check: Can author attest to RED-GREEN-REFACTOR cycle?
  - Check: Does git history suggest test-first? (not definitive but helpful)
  - Check: Do tests actually fail when implementation removed? (verify if suspicious)
- Are there any files with implementation but no tests?
- Are there any functions/methods without corresponding tests?

**If TDD violated**: Flag as Important issue, recommend rewriting with TDD.

#### Test Coverage
[existing content...]
```

**Integration Point**: code-review, lines 108-133 (add TDD section)

**Impact**: Makes reviewers explicitly check for TDD compliance

---

### Category C: Add New Checkpoints (Medium Priority)

**C1: Create "pre-implementation-checklist" Skill**

**Problem**: All current skills activate DURING or AFTER implementation. Need gate BEFORE starting.

**Recommendation**: New skill that must be used before implementing any feature/fix

```markdown
---
name: pre-implementation-checklist
description: Use BEFORE implementing any feature, bugfix, or refactoring - verifies you understand requirements, have tests planned, and are ready to use TDD; prevents starting work without clear plan
---

# Pre-Implementation Checklist

BEFORE writing ANY production code:

## 1. Requirements Understanding
- [ ] I have read the requirements/plan/issue completely
- [ ] I understand what "done" looks like
- [ ] I can describe the acceptance criteria
- [ ] I have asked clarifying questions if anything unclear

## 2. Test Plan
- [ ] I have identified what tests I will write
- [ ] I know what the tests will assert
- [ ] I have identified edge cases to test
- [ ] I will write tests FIRST (TDD)

## 3. Dependencies
- [ ] I have identified what dependencies this needs
- [ ] I have verified dependencies are available
- [ ] I have identified what I will mock (if anything)

## 4. Commitment to Process
- [ ] I will follow test-driven-development skill
- [ ] I will NOT write implementation before tests
- [ ] I will use verification-before-completion before claiming done
- [ ] I will request code review before merging

If you cannot check ALL boxes: You are not ready to implement. Stop and clarify.

You must announce use of this skill before starting implementation.
```

**Integration**: Reference from TDD, executing-plans, subagent-driven-development

**Impact**: Prevents "jump straight to coding" without planning

---

**C2: Create "mid-implementation-check" Skill**

**Problem**: Long implementations can drift from requirements without realizing until the end.

**Recommendation**: Checkpoint skill for use during implementation

```markdown
---
name: mid-implementation-check
description: Use during long implementations (>2 hours or >200 lines) - verifies you're still on track, haven't violated TDD, and work is progressing toward requirements; prevents drift and accumulated process violations
---

# Mid-Implementation Check

For implementations taking >2 hours or >200 lines, STOP periodically and verify:

## Progress Check
- [ ] I am implementing requirements as specified (not adding scope)
- [ ] I have not added "nice to have" features
- [ ] My approach is working (not hitting dead ends)

## TDD Check
- [ ] I have been following RED-GREEN-REFACTOR for every function
- [ ] I have NOT written implementation before tests
- [ ] All my tests have failed first, then passed

## Quality Check
- [ ] Tests are passing
- [ ] No errors or warnings in output
- [ ] Code is readable and maintainable
- [ ] No TODO or FIXME comments added

## Next Steps
- [ ] I know what I'm implementing next
- [ ] I am not blocked
- [ ] I do not need to ask for help

If you cannot check ALL boxes in any section:
- STOP implementing
- Address the issue
- Do not continue until boxes are checked

Use this check every 2 hours or 200 lines, whichever comes first.
```

**Integration**: Reference from TDD, executing-plans (during task execution)

**Impact**: Catches process violations and drift before completion

---

**C3: Create "post-code-review-verification" Skill**

**Problem**: receiving-code-review explains how to receive feedback, but doesn't verify fixes were made correctly.

**Recommendation**: New skill for verifying review feedback was properly addressed

```markdown
---
name: post-code-review-verification
description: Use after implementing code review feedback - verifies all Critical/Important issues fixed, changes don't break tests, and reviewer's concerns addressed; prevents incomplete fix implementation
---

# Post-Code-Review Verification

After implementing code review feedback:

## 1. Issues Addressed Check
- [ ] All Critical issues fixed
- [ ] All Important issues fixed or explicitly acknowledged/deferred
- [ ] For each issue, I can point to specific changes made

## 2. Testing Verification
- [ ] All tests still pass
- [ ] No new warnings or errors
- [ ] Added tests for any new code written during fixes

## 3. Regression Check
- [ ] Fixes don't break existing functionality
- [ ] Changes are minimal and targeted
- [ ] No new issues introduced

## 4. Reviewer Intent
- [ ] I understand WHY reviewer flagged each issue
- [ ] My fixes address the underlying concern (not just symptoms)
- [ ] If I disagreed, I discussed with reviewer before proceeding

## 5. Documentation
- [ ] Can describe what I changed in response to review
- [ ] Can explain how each fix addresses the concern
- [ ] Ready to show reviewer the changes

If ANY check fails: Fixes are incomplete. Continue addressing feedback.

If ALL checks pass: Ready to notify reviewer or proceed with completion.
```

**Integration**: Reference from receiving-code-review, requesting-code-review

**Impact**: Closes loop on review feedback, ensures issues actually fixed

---

### Category D: Technical Enforcement (Low Priority for AI Agents, High for Future)

**D1: Pre-Commit Hook Template**

**Problem**: All current enforcement is process-based. No technical barriers.

**Recommendation**: Provide pre-commit hook template (for projects that want it)

```bash
#!/bin/bash
# .git/hooks/pre-commit
# Wrangler verification pre-commit hook

echo "Running Wrangler pre-commit verification..."

# Check 1: Tests exist for all source files
echo "Checking test coverage..."
# [implementation: verify test files exist for all source files]

# Check 2: Tests pass
echo "Running tests..."
npm test || (echo "ERROR: Tests must pass before commit" && exit 1)

# Check 3: No test-only methods in production code
echo "Checking for test-only pollution..."
grep -r "forTesting" "destroyForTesting" src/ && \
  (echo "ERROR: Found test-only methods in production code" && exit 1)

# Check 4: No TODO/FIXME in committed code
echo "Checking for TODO/FIXME..."
git diff --cached | grep -E "TODO|FIXME" && \
  (echo "ERROR: Cannot commit TODO/FIXME comments" && exit 1)

echo "Pre-commit checks passed!"
exit 0
```

**Status**: Low priority for AI agents (can't install hooks), but valuable for:
- Projects using wrangler
- When AI agents work with human developers
- Future integration with git workflows

---

**D2: CI/CD Verification Template**

**Problem**: No automated verification in CI/CD pipelines.

**Recommendation**: Provide CI/CD configuration template

```yaml
# .github/workflows/wrangler-verification.yml
name: Wrangler Verification

on: [pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Run tests
        run: npm test

      - name: Check test coverage
        run: |
          npm test -- --coverage
          # Fail if coverage below threshold

      - name: Verify no test-only methods
        run: |
          grep -r "forTesting" "destroyForTesting" src/ && exit 1 || exit 0

      - name: Check for TODO/FIXME
        run: |
          git diff origin/main | grep -E "TODO|FIXME" && exit 1 || exit 0
```

**Status**: Low priority for AI agents, high for human-AI collaboration

---

### Category E: Make Verification Steps Non-Optional (High Priority)

**E1: Change Workflow Skill Language from "Optional" to "Required"**

**Problem**: requesting-code-review says code review is "Optional but valuable" except in subagent workflow.

**Recommendation**: Make it required everywhere

```markdown
## When to Request Review

**Mandatory:**
- After each task in subagent-driven development
- After completing ANY feature (major or minor)
- After ANY bug fix
- Before merge to main
- Before creating pull request
- Before claiming work complete

**Exceptions** (code review NOT required):
- Documentation-only changes
- Configuration changes (no logic)
- Changes explicitly waived by your human partner

If unsure whether review required: Request it. Better to over-review than under-review.
```

**Integration Point**: requesting-code-review, lines 16-24

**Impact**: Removes ambiguity about when code review is required

---

**E2: Add "Cannot Proceed Without" Language**

**Problem**: Current language is instruction-based. Add enforcement language.

**Recommendation**: Add explicit blocking language throughout skills

Example changes:

**verification-before-completion**:
```markdown
## The Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

You CANNOT:
- Claim work complete without running verification
- Proceed to merge/PR without verification
- Mark tasks complete without verification
- Say "done" without verification

If you attempt to claim completion without verification:
- Your claim will be rejected
- You will be required to start verification process
- Your human partner will lose trust in you

This is non-negotiable and has no exceptions.
```

**verification-before-completion (lines 19-23)**:
- Change "If you haven't run" → "You CANNOT claim"
- Change "you cannot claim" → "You are FORBIDDEN from claiming"
- Add consequences

**Impact**: Stronger psychological pressure against violations

---

**E3: Add Verification to TodoWrite Integration**

**Problem**: TodoWrite lets tasks be marked complete without verification.

**Recommendation**: Add verification requirement to task completion

```markdown
When using TodoWrite tool:

BEFORE marking any task as "completed":
1. Follow verification-before-completion skill
2. Ensure all verification steps passed
3. Include verification evidence in task notes
4. Only then mark complete

Marking task complete without verification is lying about status.
```

**Integration**: Add to all workflow skills (subagent-driven-development, executing-plans)

**Impact**: Connects task tracking with verification requirement

---

**E4: Update "Red Flags" Sections to Be More Forceful**

**Problem**: Red flags sections list warning signs but don't mandate action.

**Recommendation**: Change from "watch out for" to "stop immediately"

Example changes:

**verification-before-completion** (lines 52-62):
```markdown
## Red Flags - STOP IMMEDIATELY

If you catch yourself doing ANY of these:
- Using "should", "probably", "seems to"
- Expressing satisfaction before verification
- About to commit/push/PR without verification
- Trusting agent success reports
- Relying on partial verification
- Thinking "just this once"
- Tired and wanting work over
- ANY wording implying success without verification

THEN:
1. STOP what you're doing
2. Do NOT proceed with completion claim
3. Go back and run full verification
4. This is an error that requires correction

Proceeding anyway is dishonesty and will damage trust.
```

**Impact**: Makes red flags into stop signs, not just warnings

---

## Summary of Recommendations

### Immediate Actions (Can Implement Now)

**High Priority** (Addresses core problem):
1. **A1**: Add structured requirements verification checklist
2. **A2**: Add TDD compliance certification
3. **A3**: Integrate code review into verification gate
4. **B1**: Add explicit TDD reference to verification gate function
5. **B2**: Update finishing-a-development-branch completeness check
6. **B3**: Make code review mandatory in executing-plans
7. **E1**: Change code review from "optional" to "required"
8. **E2**: Add "cannot proceed without" enforcement language

**Medium Priority** (Prevents drift during implementation):
9. **A4**: Add pristine output verification
10. **B4**: Update code-review to include TDD verification section
11. **C1**: Create pre-implementation-checklist skill
12. **C2**: Create mid-implementation-check skill
13. **E3**: Add verification requirement to TodoWrite integration

**Lower Priority** (Nice to have):
14. **C3**: Create post-code-review-verification skill
15. **E4**: Update red flags sections to be more forceful

### Future Considerations (Technical Enforcement)

**When working with human developers**:
- **D1**: Pre-commit hook template
- **D2**: CI/CD verification template

---

## Implementation Plan

### Phase 1: Strengthen Core Verification (Week 1)

**Skills to update**:
1. verification-before-completion/SKILL.md
   - Add structured requirements checklist (A1)
   - Add TDD compliance certification (A2)
   - Add code review gate (A3)
   - Expand gate function with TDD reference (B1)
   - Add pristine output verification (A4)
   - Add enforcement language (E2)

2. test-driven-development/SKILL.md
   - Cross-reference pre-implementation-checklist when ready (C1)
   - Add note about TDD certification in verification-before-completion

**Impact**: Closes largest gap (verification doesn't check TDD or completeness)

---

### Phase 2: Update Workflow Skills (Week 2)

**Skills to update**:
1. finishing-a-development-branch/SKILL.md
   - Expand Step 1 to check completeness (B2)
   - Require verification-before-completion certification

2. executing-plans/SKILL.md
   - Add code review checkpoint (B3)
   - Reference pre-implementation-checklist (C1)

3. requesting-code-review/SKILL.md
   - Change "optional" to "required" (E1)
   - Add cannot-proceed-without language (E2)

4. code-review/SKILL.md
   - Add TDD verification to Phase 4 (B4)
   - Strengthen approval requirement

**Impact**: Makes all workflows consistent with strong verification

---

### Phase 3: Add New Checkpoint Skills (Week 3)

**New skills to create**:
1. pre-implementation-checklist/SKILL.md (C1)
   - Use before starting implementation
   - Referenced by TDD, executing-plans, subagent-driven

2. mid-implementation-check/SKILL.md (C2)
   - Use during long implementations
   - Catches drift and violations early

3. post-code-review-verification/SKILL.md (C3)
   - Use after implementing review feedback
   - Closes review loop

**Impact**: Adds checkpoints throughout development lifecycle

---

### Phase 4: Strengthen Enforcement Language (Week 4)

**All skills**:
1. Update red flags sections (E4)
2. Add TodoWrite integration (E3)
3. Review all rationalization prevention tables
4. Ensure consistent "cannot proceed" language

**Impact**: Makes violations psychologically harder to rationalize

---

## Success Criteria

### How to Know These Changes Work

**Metric 1: Verification Completeness**
- ✓ Agent provides structured requirements checklist before "done" claim
- ✓ Agent provides TDD compliance certification before "done" claim
- ✓ Agent obtains code review before merge/PR
- ✗ Agent says "done" without any of the above

**Metric 2: TDD Compliance**
- ✓ Agent can attest to watching each test fail first
- ✓ Agent can describe failure message for each test
- ✓ Code review verifies TDD patterns present
- ✗ Agent writes implementation without tests
- ✗ Agent writes tests after implementation

**Metric 3: Workflow Consistency**
- ✓ All workflows (subagent-driven, executing-plans, ad-hoc) require code review
- ✓ All workflows require verification before completion
- ✓ All workflows use TDD
- ✗ Different standards for different workflows

**Metric 4: Early Detection**
- ✓ Pre-implementation checklist prevents starting without plan
- ✓ Mid-implementation check catches drift during work
- ✓ Issues caught before "done" claim (not after)
- ✗ Issues discovered only at finishing-a-development-branch

**Metric 5: Rationalization Prevention**
- ✓ Agent explicitly states when using skills
- ✓ Agent provides evidence (not assertions)
- ✓ Agent follows gate functions (not shortcuts)
- ✗ Agent uses "should work", "probably", "seems to"

---

## Framework-Agnostic Nature

All recommendations above are framework-agnostic:

**Language-Independent**:
- No assumptions about test framework (works with Jest, pytest, RSpec, etc.)
- No assumptions about language (TypeScript, Python, Ruby, Go, etc.)
- Concepts apply to any testing paradigm

**Tool-Independent**:
- Gate functions work with any verification command
- Checklists don't assume specific tools
- Process applies to any development workflow

**Project-Independent**:
- Requirements verification works with any requirement format
- TDD certification works with any test structure
- Code review phases apply to any codebase

**Only Dependencies**:
- Tests must exist (any framework)
- Tests must be runnable via command (any test runner)
- Version control must exist (git assumed, but adaptable)
- Some form of requirements documentation (plan, spec, issue, etc.)

---

## Conclusion

The current verification and completion framework is **strong individually** but has **critical integration gaps**:

**Primary Gap**: verification-before-completion checks if tests pass, but not if TDD was followed or requirements are fully met.

**Secondary Gap**: Code review is optional in most workflows, only mandatory in subagent-driven-development.

**Tertiary Gap**: finishing-a-development-branch only checks tests pass, not completeness.

**Root Cause**: All enforcement is process-based (relies on agent honesty) with no technical barriers and unclear integration points between skills.

**Solution**:
1. Add structured checklists to verification (requirements, TDD compliance)
2. Make code review mandatory in all workflows
3. Update finishing-a-development-branch to check completeness
4. Add new checkpoint skills (pre-implementation, mid-implementation)
5. Strengthen enforcement language throughout

**Impact of Changes**:
- Makes violations require conscious lying (not just fuzzy thinking)
- Creates comprehensive gate at completion time
- Adds checkpoints throughout development lifecycle
- Consistent standards across all workflows
- Framework-agnostic (works with any language/tools)

**Limitations**:
- Still process-based (no technical enforcement like pre-commit hooks)
- Relies on agent following instructions
- Can't prevent determined rationalization
- But: Makes violations much more obvious and harder to justify

**Next Step**: Implement Phase 1 changes (strengthen core verification skill) and test with real development work.
