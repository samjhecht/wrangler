---
name: verification-before-completion
description: Use when about to claim work is complete, fixed, or passing, before committing or creating PRs - requires running verification commands and confirming output before making any success claims; evidence before assertions always
---

# Verification Before Completion

## Overview

Claiming work is complete without verification is dishonesty, not efficiency.

**Core principle:** Evidence before claims, always.

**Violating the letter of this rule is violating the spirit of this rule.**

## The Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

If you haven't run the verification command in this message, you cannot claim it passes.

## The Gate Function

```
BEFORE claiming any status or expressing satisfaction:

0. TDD COMPLIANCE: Have you followed test-driven-development skill?
   - See TDD Compliance Certification (below)
   - If NO: Stop. You violated TDD. Start over.

1. IDENTIFY: What command proves this claim?
2. RUN: Execute the FULL command (fresh, complete)
3. READ: Full output, check exit code, count failures
4. CAPTURE: Copy complete output to include in your message
5. VERIFY: Does output confirm the claim?
   - If NO: State actual status with evidence
   - If YES: State claim WITH evidence
6. REQUIREMENTS: Have you verified all requirements? (see checklist)
7. TDD CERTIFIED: Have you certified TDD compliance? (see below)
8. CODE REVIEW: Have you obtained code review approval? (see gate below)
9. ONLY THEN: Make the claim

Skip any step = lying, not verifying
```

## Common Failures

| Claim | Requires | Not Sufficient |
|-------|----------|----------------|
| Tests pass | Test command output: 0 failures | Previous run, "should pass" |
| Linter clean | Linter output: 0 errors | Partial check, extrapolation |
| Build succeeds | Build command: exit 0 | Linter passing, logs look good |
| Bug fixed | Test original symptom: passes | Code changed, assumed fixed |
| Regression test works | Red-green cycle verified | Test passes once |
| Agent completed | VCS diff shows changes | Agent reports "success" |
| Requirements met | Line-by-line checklist | Tests passing |

## TDD Compliance Certification

BEFORE claiming work complete, certify TDD compliance:

For each new function/method implemented:

- [ ] **Function name**: [function_name]
  - **Test name**: [test_function_name]
  - **Watched fail**: YES / NO (if NO, explain why)
  - **Failure reason**: [expected failure message you saw]
  - **Implemented minimal code**: YES / NO
  - **Watched pass**: YES / NO
  - **Refactored**: YES / NO / N/A

### Example Certification:

```
## TDD Compliance Certification

- [x] **Function name**: retryOperation
  - **Test name**: test_retries_failed_operations_3_times
  - **Watched fail**: YES
  - **Failure reason**: "ReferenceError: retryOperation is not defined"
  - **Implemented minimal code**: YES
  - **Watched pass**: YES
  - **Refactored**: YES (extracted delay logic)

- [x] **Function name**: validateEmail
  - **Test name**: test_validates_email_format
  - **Watched fail**: YES
  - **Failure reason**: "ReferenceError: validateEmail is not defined"
  - **Implemented minimal code**: YES
  - **Watched pass**: YES
  - **Refactored**: N/A (implementation already clean)
```

### Requirements:

- **If ANY "NO" answers**: Work is NOT complete. Delete and restart with TDD.
- **This certification MUST be included** in your completion message.
- **One entry required** for each new function/method.
- **"Watched fail" = NO is ONLY acceptable** if explicitly following receiving-code-review (fixing existing untested code).

### Why This Matters:

Making this certification explicit:
- Forces conscious attestation (not vague "I think I followed TDD")
- Creates audit trail of process followed
- Makes rationalization harder (explicit lying vs fuzzy thinking)
- Enables code reviewer to verify TDD compliance

## Code Review Gate

BEFORE claiming work complete:

### When Code Review is REQUIRED:

IF this work involves:
- New features (any size)
- Bug fixes (any severity)
- Refactoring (any scope)
- Changes to >50 lines of code
- Security-sensitive code
- Performance-critical code
- Public API changes

THEN code review IS REQUIRED.

### Code Review Checklist:

- [ ] **Code review requested**: Used requesting-code-review skill
- [ ] **Review completed**: code-reviewer subagent dispatched and finished
- [ ] **Critical issues**: 0 (MUST be zero)
- [ ] **Important issues**: 0 or explicitly acknowledged/deferred
- [ ] **Review status**: Approved / Approved with minor items
- [ ] **Review reference**: [link to review output or summary]

### EXCEPTIONS (code review NOT required):

- Documentation-only changes (no code logic)
- Configuration-only changes (no code logic)
- Changes <50 lines AND your human partner explicitly waived review
- Typo fixes in comments
- Test-only changes when adding tests to existing untested code

### Example Review Gate Completion:

```
## Code Review Gate

- [x] **Code review requested**: Used requesting-code-review skill
- [x] **Review completed**: code-reviewer subagent finished analysis
- [x] **Critical issues**: 0
- [x] **Important issues**: 1 acknowledged (will address in follow-up)
- [x] **Review status**: Approved with minor items
- [x] **Review reference**: See code review output below

Critical Issues: 0
Important Issues: 1
  - Missing error handling in edge case (acknowledged, will fix in issue #123)
Minor Issues: 3
  - All addressed

Review approved for merge with follow-up issue created.
```

### Cannot Proceed Without:

You **CANNOT** claim completion without:
1. Code review completed (unless explicit exception applies)
2. Critical issues fixed (MUST be 0)
3. Important issues fixed OR explicitly documented why deferred

**Attempting to skip code review without valid exception violates verification-before-completion.**

## Red Flags - STOP

- Using "should", "probably", "seems to"
- Expressing satisfaction before verification ("Great!", "Perfect!", "Done!", etc.)
- About to commit/push/PR without verification
- Trusting agent success reports
- Relying on partial verification
- Thinking "just this once"
- Tired and wanting work over
- **ANY wording implying success without having run verification**
- Claiming tests pass without showing output
- Paraphrasing test results instead of showing raw output
- Showing partial output (truncated, filtered)
- Claiming "followed TDD" without certification
- Vague about whether tests failed first
- Can't describe failure messages seen
- Wrote tests and implementation "together"
- Skipping code review because "it's simple"
- Planning to "get review later"
- Claiming exception without explicit approval
- Proceeding with unfixed Critical or Important issues

## Rationalization Prevention

| Excuse | Reality |
|--------|---------|
| "Should work now" | RUN the verification |
| "I'm confident" | Confidence ≠ evidence |
| "Just this once" | No exceptions |
| "Linter passed" | Linter ≠ compiler |
| "Agent said success" | Verify independently |
| "I'm tired" | Exhaustion ≠ excuse |
| "Partial check is enough" | Partial proves nothing |
| "Different words so rule doesn't apply" | Spirit over letter |
| "I followed the spirit of TDD" | Spirit = Letter. If you didn't watch tests fail first, you didn't follow TDD. Provide certification or start over. |
| "These tests are simple, TDD would slow me down" | Simple tests take 30 seconds. Complex tests NEED TDD. No exceptions. |
| "I wrote tests and implementation together" | That's not TDD. Tests FIRST. Delete implementation and restart. |
| "This is too small for code review" | Size doesn't matter. Code review is mandatory. See exceptions list for ONLY valid reasons to skip. |
| "I'll get review after merge" | No. Review BEFORE merge. Reversing changes post-merge is expensive and risky. |
| "Code review would slow me down" | Code review catches bugs before they reach users. Slowdown now prevents crisis later. |

## Key Patterns

**Tests:**
```
✅ [Run test command] [See: 34/34 pass] "All tests pass"
❌ "Should pass now" / "Looks correct"
```

## Test Verification Requirements

When claiming tests pass, you MUST provide:

**Required Evidence**:

1. **Exact command executed**:
   ```bash
   npm test
   # or
   pytest
   # or
   cargo test
   # or
   go test ./...
   ```

2. **Complete output showing**:
   - Test count: "X tests passed"
   - Failure count: "0 failed"
   - Duration: "Time: X.XXXs"
   - Exit code: 0

3. **Coverage (if available)**:
   - Statement coverage: X%
   - Branch coverage: X%
   - Function coverage: X%
   - Line coverage: X%

### Example of VALID verification:

```
I've verified all tests pass. Here's the output:

$ npm test

PASS tests/auth.test.ts (4.231s)
  ✓ login with valid credentials (231ms)
  ✓ login with invalid credentials (12ms)
  ✓ logout successfully (8ms)

PASS tests/users.test.ts (2.145s)
  ✓ creates new user (145ms)
  ✓ updates existing user (98ms)
  ✓ deletes user (76ms)

Test Suites: 2 passed, 2 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        6.376s

Process exited with code 0

All 6 tests pass successfully.
```

### Example of INVALID verification:

```
❌ "I ran the tests and they pass."
❌ "Tests are green."
❌ "Everything looks good."
❌ [Shows only 1 test when there are 50]
❌ [Shows truncated output without pass/fail counts]
```

**If you cannot provide the complete output above, you have not verified.**

**Regression tests (TDD Red-Green):**
```
✅ Write → Run (pass) → Revert fix → Run (MUST FAIL) → Restore → Run (pass)
❌ "I've written a regression test" (without red-green verification)
```

**Build:**
```
✅ [Run build] [See: exit 0] "Build passes"
❌ "Linter passed" (linter doesn't check compilation)
```

**Requirements:**
```
✅ Re-read plan → Create checklist → Verify each → Report gaps or completion
❌ "Tests pass, phase complete"
```

**Agent delegation:**
```
✅ Agent reports success → Check VCS diff → Verify changes → Report actual state
❌ Trust agent report
```

## Why This Matters

From 24 failure memories:
- your human partner said "I don't believe you" - trust broken
- Undefined functions shipped - would crash
- Missing requirements shipped - incomplete features
- Time wasted on false completion → redirect → rework
- Violates: "Honesty is a core value. If you lie, you'll be replaced."

## When To Apply

**ALWAYS before:**
- ANY variation of success/completion claims
- ANY expression of satisfaction
- ANY positive statement about work state
- Committing, PR creation, task completion
- Moving to next task
- Delegating to agents

**Rule applies to:**
- Exact phrases
- Paraphrases and synonyms
- Implications of success
- ANY communication suggesting completion/correctness

## The Bottom Line

**No shortcuts for verification.**

Run the command. Read the output. THEN claim the result.

This is non-negotiable.
