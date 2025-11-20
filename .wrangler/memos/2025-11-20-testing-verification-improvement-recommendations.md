# Testing & Verification Skills: Comprehensive Improvement Recommendations

**Date**: 2025-11-20
**Purpose**: Address premature "done" declarations by strengthening verification enforcement and adding frontend testing guidance
**Context**: Deep review of testing, verification, and code review skills to prevent agents from claiming completion without proper testing

---

## Executive Summary

I've identified **the root cause** of agents claiming "done" without proper testing: **verification gaps**, not skill quality. Your existing skills are excellent but have integration gaps that allow premature completion claims.

### Key Findings

**What's Working Well:**
- TDD skill has exceptional enforcement (11 rationalization refutations, "delete means delete")
- verification-before-completion has strong gate functions
- Code review framework is comprehensive (6-phase process)
- Testing anti-patterns skill prevents common mistakes

**Critical Gaps Identified:**

1. **No proof tests actually ran** - Skills say "run tests" but don't require showing output
2. **No verification that TDD was followed** - Can't detect test-after-implementation
3. **Code review is optional** in most workflows (only mandatory in subagent-driven-development)
4. **Zero frontend testing guidance** - No skills for UI, visual regression, E2E, or accessibility
5. **finishing-a-development-branch only checks tests pass** - Not completeness or TDD compliance

---

## Recommended Improvements

### PRIORITY 1: Immediate Fixes (High Impact, Low Effort)

These close the most critical gaps without requiring new skills:

#### 1.1: Add Test Evidence Requirements to `verification-before-completion`

**Problem**: Agents can claim "tests pass" without proof.

**Fix**: Add mandatory evidence format:

```markdown
## Test Verification Requirements

When claiming tests pass, you MUST provide:

**Required Evidence**:
1. **Exact command executed**: `npm test` (copy-paste)
2. **Complete output showing**:
   - Test count: "147 tests passed"
   - Failure count: "0 failed"
   - Exit code: 0
   - Duration

**Example of VALID verification**:
```
$ npm test

PASS tests/auth.test.ts
  ✓ login with valid credentials (231ms)
  ✓ logout successfully (8ms)

Test Suites: 2 passed, 2 total
Tests:       147 passed, 147 total
Time:        6.376s
Exit code: 0
```

**If you cannot provide complete output, you have NOT verified.**
```

**Impact**: Makes "tests pass" claims verifiable, prevents unsubstantiated claims.

---

#### 1.2: Add TDD Compliance Certification to `verification-before-completion`

**Problem**: Can't verify TDD was followed after the fact.

**Fix**: Require explicit attestation:

```markdown
## TDD Compliance Certification

BEFORE claiming work complete, certify TDD compliance:

For each new function/method:
- [ ] Test name: [test_function_name]
- [ ] Watched fail: YES / NO
- [ ] Failure reason: [expected message]
- [ ] Implemented minimal code: YES
- [ ] Watched pass: YES

If ANY "NO" answers: Work is NOT complete.

This certification must be included in your completion message.
```

**Impact**: Forces conscious attestation, makes rationalization explicit lying (not fuzzy thinking).

---

#### 1.3: Make Code Review Mandatory in `executing-plans` and `finishing-a-development-branch`

**Problem**: Code review only required in subagent-driven-development.

**Fix**: Add code review gate to both skills:

```markdown
## Code Review Gate

BEFORE claiming work complete:

IF this work involves code changes:
  - [ ] Code review completed
  - [ ] Critical issues: 0
  - [ ] Important issues: 0 or acknowledged
  - [ ] Review approval obtained

EXCEPTIONS (review NOT required):
  - Documentation-only changes
  - Your human partner explicitly waived review

Cannot claim completion without code review or explicit exception.
```

**Impact**: Makes code review non-optional for all workflows.

---

### PRIORITY 2: New Skills for Frontend Testing

Create 3 essential frontend testing skills:

#### 2.1: `frontend-visual-regression-testing`

**Purpose**: Guide agents to verify UI correctness through screenshot comparison.

**Key Content**:
- TDD cycle for UI (RED: no baseline → GREEN: create baseline → REFACTOR: catch regressions)
- Element-level over full-page screenshots
- DevTools verification before completion
- Baseline management (when to update vs. flag regression)

**Gate Function**:
```
BEFORE claiming UI work complete:
  1. Take screenshot of changed UI element
  2. Compare against baseline (if exists)
  3. IF differences: review manually, determine if intentional
  4. Open DevTools Console - verify NO errors
  5. Test responsive breakpoints (mobile, tablet, desktop)
  6. Include screenshot in completion evidence
```

---

#### 2.2: `frontend-accessibility-verification`

**Purpose**: Ensure all UI is accessible (legal requirement + better UX).

**Key Content**:
- Run axe-core automated tests (finds ~57% of WCAG issues)
- Test keyboard navigation (Tab, Enter, Escape)
- Verify screen reader announcements
- Lighthouse accessibility audit (target: 95%+ score)

**Gate Function**:
```
BEFORE claiming UI complete:
  1. Run axe-core test: expect 0 violations
  2. Tab through all interactive elements
  3. Verify Enter/Space activates buttons
  4. Verify Escape closes modals/dialogs
  5. Run Lighthouse: verify score ≥95
  6. Include accessibility audit in completion evidence
```

---

#### 2.3: `frontend-e2e-user-journeys`

**Purpose**: Test critical user workflows end-to-end.

**Key Content**:
- Page Object Model pattern (encapsulate selectors)
- User-centric selectors (accessible roles/labels, not CSS classes)
- Condition-based waiting (not arbitrary timeouts)
- When to use E2E vs. component tests (10-15% of tests only)

**Gate Function**:
```
BEFORE writing E2E test:
  Is this a critical business flow? (login, checkout, signup)
    YES → E2E appropriate
    NO → Should this be component test instead?

  Does test use Page Objects? (not raw selectors)
  Does test use accessible selectors? (not CSS classes)
  Does test wait for conditions? (not setTimeout)
```

---

### PRIORITY 3: Strengthen Existing Skills

#### 3.1: Update `test-driven-development` - Add Evidence Requirements

**Current weakness**: Says "watch it fail" but doesn't require proof.

**Enhancement**:

```markdown
### RED Phase - Mandatory Evidence

BEFORE proceeding to GREEN:

1. Execute test command
2. **Copy full output showing failure**
3. Verify failure message matches expected reason

**You must include test output in your message:**

```
$ npm test -- retry.test.ts

FAIL tests/retry.test.ts
  ✕ retries failed operations 3 times

  ● ReferenceError: retryOperation is not defined

Exit code: 1

This is the expected failure. Proceeding to GREEN.
```

**Claims without evidence violate verification-before-completion.**
```

---

#### 3.2: Update `testing-anti-patterns` - Add Frontend Patterns

**Current weakness**: Focuses on backend (mocking), missing frontend mistakes.

**Enhancement**: Add 3 new anti-patterns:

**Anti-Pattern 6: Testing Implementation Details (Frontend)**
```
❌ BAD: Testing internal state
expect(component.state.count).toBe(1)

✅ GOOD: Testing visible output
expect(screen.getByText('Count: 1')).toBeInTheDocument()
```

**Anti-Pattern 7: No Accessibility Testing**
```
❌ BAD: Shipping without a11y verification
await page.click('.icon-button') // Is this accessible?

✅ GOOD: Include accessibility verification
await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled()
await injectAxe(page)
await checkA11y(page)
```

**Anti-Pattern 8: Testing Happy Path Only**
```
❌ BAD: Only tests success
test('loads user') // What about loading state? Error state?

✅ GOOD: Test all states
test('shows loading spinner')
test('shows user data when loaded')
test('shows error when fetch fails')
test('shows empty state when no data')
```

---

#### 3.3: Update `finishing-a-development-branch` - Check Completeness

**Current weakness**: Only checks if tests pass, not if work is complete.

**Enhancement**:

```markdown
### Step 1: Verify Completeness (Enhanced)

BEFORE presenting options:

1. **Tests Pass**:
   ```bash
   npm test
   ```
   Exit code: 0, all tests passing

2. **Requirements Met**:
   - [ ] Requirements checklist completed
   - [ ] All items verified with evidence

3. **Code Review Obtained** (if required):
   - [ ] Review completed
   - [ ] Critical issues: 0

4. **TDD Compliance**:
   - [ ] TDD certification completed
   - [ ] All tests written first

If ANY fails: Work is NOT complete. Fix before proceeding.
```

---

### PRIORITY 4: New Cross-Cutting Skill

#### 4.1: Create `verification-gates`

**Purpose**: Reusable checkpoints referenced by all implementation workflows.

**Why**: Instead of duplicating verification logic across multiple skills, create one canonical gate skill.

**Gate 1: Before Marking Task Complete**
```
- [ ] Code changes implemented
- [ ] Tests written BEFORE implementation (TDD)
- [ ] Watched tests fail (RED)
- [ ] Watched tests pass (GREEN)
- [ ] Full test suite passing (with output)
- [ ] No errors or warnings
```

**Gate 2: Before Requesting Code Review**
```
- [ ] All Gate 1 requirements met
- [ ] TDD evidence available
- [ ] Git commits clean
- [ ] Test coverage adequate (>80%)
```

**Gate 3: Before Merge/PR**
```
- [ ] All Gate 2 requirements met
- [ ] Code review approved
- [ ] Tests re-run after feedback
- [ ] No conflicts with main branch
```

**Gate 4: After Bug Fix**
```
- [ ] Root cause identified
- [ ] Regression test exists
- [ ] Watched regression test fail
- [ ] Watched regression test pass
- [ ] Full suite passing
```

---

## Implementation Plan

### Week 1: Core Verification Strengthening

**Update these 3 skills**:
1. `verification-before-completion` - Add test evidence, TDD certification, code review gate
2. `test-driven-development` - Add evidence requirements to RED/GREEN phases
3. `finishing-a-development-branch` - Add completeness check (not just tests pass)

**Impact**: Closes the biggest gap (no proof tests ran, no TDD verification).

---

### Week 2: Frontend Testing Foundation

**Create these 2 skills**:
1. `frontend-visual-regression-testing` - Screenshot verification, DevTools checks
2. `frontend-accessibility-verification` - axe-core, keyboard nav, screen readers

**Update 1 skill**:
3. `verification-before-completion` - Add frontend verification checklist

**Impact**: Addresses complete absence of frontend testing guidance.

---

### Week 3: Workflow Integration

**Update these 3 skills**:
1. `executing-plans` - Make code review mandatory
2. `code-review` - Add TDD verification to Phase 4
3. `requesting-code-review` - Change "optional" to "required"

**Impact**: Makes all workflows consistent (code review always required).

---

### Week 4: Anti-Patterns & E2E

**Update 1 skill**:
1. `testing-anti-patterns` - Add 3 frontend anti-patterns

**Create 1 skill**:
2. `frontend-e2e-user-journeys` - Page Objects, user-centric selectors, condition-based waiting

**Impact**: Prevents common frontend mistakes, guides E2E testing strategy.

---

## Success Metrics

**How to measure if improvements work**:

1. **Verification Completeness** (Target: 100%)
   - ✓ Agent provides test output before "done" claim
   - ✓ Agent provides TDD certification
   - ✓ Agent obtains code review approval

2. **TDD Compliance** (Target: 100%)
   - ✓ Agent can attest to watching each test fail first
   - ✓ Tests written before implementation (commit evidence)

3. **Frontend Quality** (Target: 95%+)
   - ✓ UI changes include screenshot evidence
   - ✓ Accessibility tests passing (0 violations)
   - ✓ DevTools console shows no errors

4. **Early Detection** (Target: >80%)
   - ✓ Issues caught during implementation (not at end)
   - ✓ Code review happens before merge (not after)

---

## Why These Recommendations

All recommendations are **framework-agnostic**:
- **No language assumptions**: Work with TypeScript, Python, Go, Rust, etc.
- **No framework assumptions**: Work with React, Vue, Angular, Web Components, vanilla JS
- **No tool assumptions**: Concepts apply to Playwright, Selenium, Cypress, Jest, pytest, etc.

**Focus on process, not technology**:
- Gate functions based on behavior verification (tests pass, UI works)
- Evidence requirements (show output, not "it works")
- Structured checklists (not vague "verify completeness")

**Solves your stated problem**:
> "Main problem: agents say 'done' only for me to hit immediate error"

**Root cause**: Agents claim completion without running verification.

**Solution**:
1. Require evidence (test output, screenshot, accessibility audit)
2. Structured checklists (can't claim complete without all boxes checked)
3. Code review mandatory (second pair of eyes)
4. TDD certification (explicit attestation)

These changes make violations require **conscious lying**, not fuzzy thinking.

---

## Detailed Research Findings

This document synthesizes findings from three comprehensive research analyses:

1. **Testing Skills Analysis** (memos/2025-11-20-testing-skills-analysis.md)
   - TDD skill: Exceptional enforcement, but no verification that tests ran
   - Testing anti-patterns: Strong backend coverage, missing frontend patterns
   - run-the-tests: Good infrastructure setup, no quality evaluation
   - condition-based-waiting: Excellent for timing, narrow scope (only async)

2. **Verification & Completion Skills Analysis** (memos/2025-11-20-verification-completion-skills-analysis.md)
   - verification-before-completion: Strong gate functions, but no TDD integration
   - code-review: Comprehensive 6 phases, but optional in most workflows
   - finishing-a-development-branch: Only checks tests pass, not completeness
   - No mandatory integration between TDD and verification

3. **Frontend Testing Research** (memos/2025-11-20-frontend-testing-research.md)
   - Modern testing trophy: 40-50% integration/component tests (highest ROI)
   - Visual regression now standard practice (Playwright built-in)
   - Accessibility testing mandatory (axe-core, 57% automated WCAG coverage)
   - Page Object Model pattern (framework-agnostic)
   - User-centric selectors (accessible roles/labels)

---

## Additional Recommendations (Lower Priority)

### 5.1: Create `frontend-component-testing` skill

**Purpose**: Test components in isolation with real browser rendering.

**Key Content**:
- Mount component without full app context
- Test user interactions (click, type, keyboard nav)
- Verify rendered output (DOM, visibility, accessibility)
- Testing trophy: 40-50% of frontend tests should be component level

**When to use**: Building reusable UI components, testing user interactions.

---

### 5.2: Create `frontend-testing-pyramid-balance` skill

**Purpose**: Help agents evaluate and rebalance test distribution.

**Key Content**:
- Calculate current distribution (% E2E, % integration, % component, % unit)
- Identify "ice cream cone" anti-pattern (too many E2E tests)
- Recommend optimal distribution for frontend (5-10% E2E, 40-50% integration/component, 30-40% unit)
- Cost-benefit analysis (E2E: high cost/slow, Component: high ROI/fast)

**When to use**: Planning test strategy, reviewing test coverage.

---

### 5.3: Expand `condition-based-waiting` to `eliminating-test-flakiness`

**Purpose**: Address all sources of test flakiness, not just timing.

**Current coverage**: Async timing issues (arbitrary timeouts).

**Additional coverage needed**:
1. Shared state between tests (one test pollutes another)
2. Uncleaned resources (timers, event listeners)
3. Non-deterministic data (Math.random(), Date.now())
4. External dependencies (real API calls)
5. Parallel execution conflicts (shared resources)

**Enhancement pattern**:
```markdown
## Sources of Test Flakiness

### 1. Timing Issues (Use waitFor) ← Already covered

### 2. Shared State (Isolate tests)
```typescript
// ❌ FLAKY: Tests share global state
let currentUser = null;
test('sets user', () => { currentUser = { id: 1 }; });
test('user is set', () => { expect(currentUser.id).toBe(1); }); // Depends on previous!

// ✅ STABLE: Each test sets up own state
afterEach(() => { clearCurrentUser(); });
```

### 3. Uncleaned Resources (Use cleanup)
```typescript
// ❌ FLAKY: Timers not cleaned up
test('shows notification', () => { showNotification('Hello'); });

// ✅ STABLE: Cleanup after each test
afterEach(() => { jest.clearAllTimers(); cleanup(); });
```
```

---

## Framework-Agnostic Implementation Notes

All skills should work across:

**Languages**: TypeScript, JavaScript, Python, Go, Rust, Ruby, Java, etc.

**Frontend Frameworks**: React, Vue, Angular, Svelte, Web Components, vanilla JS

**Testing Tools**:
- E2E: Playwright, Selenium, Cypress, Puppeteer
- Component: Storybook, Cypress Component, Vitest Browser Mode
- Unit: Jest, Vitest, pytest, Mocha, RSpec, etc.
- Visual: Playwright screenshots, Chromatic, Percy
- Accessibility: axe-core, Lighthouse, WAVE

**Key Principles** (work everywhere):
1. Test user behavior, not implementation
2. Use semantic selectors (accessible roles/labels)
3. Wait for conditions, not time
4. Test pyramid balance (distribution by ROI)
5. Accessibility is non-negotiable
6. Visual verification for UI changes

---

## Next Steps

Priority order for implementation:

**Phase 1** (Week 1): Core verification strengthening
- High impact, immediate value
- Closes biggest gap (no proof tests ran)

**Phase 2** (Week 2): Frontend testing foundation
- Addresses complete absence of frontend guidance
- Legal requirement (accessibility)

**Phase 3** (Week 3): Workflow integration
- Makes all workflows consistent
- Code review becomes mandatory everywhere

**Phase 4** (Week 4): Anti-patterns & E2E
- Prevents common mistakes
- Guides E2E testing strategy

**Optional Enhancements**: Additional frontend skills (component testing, pyramid balance, expanded flakiness coverage)

---

## References

**Research Documents**:
- memos/2025-11-20-testing-skills-analysis.md (2,089 lines)
- memos/2025-11-20-verification-completion-skills-analysis.md (1,311 lines)
- memos/2025-11-20-frontend-testing-research.md (1,692 lines)

**Skills Reviewed**:
- test-driven-development/SKILL.md
- testing-anti-patterns/SKILL.md
- run-the-tests/SKILL.md
- condition-based-waiting/SKILL.md
- verification-before-completion/SKILL.md
- code-review/SKILL.md
- requesting-code-review/SKILL.md
- receiving-code-review/SKILL.md
- finishing-a-development-branch/SKILL.md
- executing-plans/SKILL.md
- subagent-driven-development/SKILL.md
- systematic-debugging/SKILL.md

**External Research**:
- Playwright official documentation (visual regression, screenshot comparison)
- Testing Trophy concept (Kent C. Dodds, Meticulous.ai)
- axe-core documentation (automated accessibility testing)
- Page Object Model pattern (BrowserStack, LambdaTest guides)
- Testing Library philosophy (user-centric testing)
- Storybook 9 updates (interaction tests, a11y testing)
- Modern frontend testing practices (2024-2025 sources)

---

**Last Updated**: 2025-11-20
**Status**: Ready for implementation
**Recommended Starting Point**: Phase 1 (Week 1) - Core verification strengthening
