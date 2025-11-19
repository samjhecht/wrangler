# Idea: Universal Workflow Wrapper with Parallel Verification

**Status**: Brainstorming
**Created**: 2025-11-18
**Category**: Quality Assurance, Workflow Architecture, Verification

---

## Core Concept

Wrap every user interaction loop in a transparent workflow abstraction layer that automatically spawns parallel verification subagents to check critical invariants (code changes → tests run, constitutional compliance, verification evidence) before allowing task completion. This eliminates the "says it's done but didn't actually verify" problem through architectural enforcement rather than prompt engineering.

## Problem Statement

**Current Pain Points**:

1. **The "Production Ready" Lie**
   - Claude Code says "All done! Production ready!"
   - But didn't actually run tests
   - Or ran tests but they failed
   - Or tests passed but didn't check coverage
   - User must manually verify every claim

2. **Constitutional Drift**
   - Changes made without checking constitution
   - Features added that violate principles
   - Anti-patterns introduced silently
   - Scope creep undetected

3. **Missing Verification Evidence**
   - "Tests pass" (but no output shown)
   - "Built successfully" (but no build log)
   - "No errors" (but no proof)
   - User must re-run everything to verify

4. **Inconsistent Quality Gates**
   - Sometimes code review happens, sometimes not
   - Sometimes tests run, sometimes skipped
   - Depends on how user phrases request
   - No systematic enforcement

5. **Agent Rationalization**
   - "Tests probably still pass" (didn't check)
   - "This is a small change" (skips verification)
   - "User seems in a hurry" (cuts corners)
   - LLM optimizes for completion speed, not correctness

**What if**: We made verification architecturally impossible to skip, with zero prompt engineering burden?

## Proposed Solution

### Architecture: Universal Workflow Wrapper

**Core Idea**: Intercept every user request at the framework level, wrap it in a workflow that enforces verification checks before returning control.

```
User Request
    ↓
┌─────────────────────────────────────────────────┐
│ Universal Workflow Wrapper (Transparent)        │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │ Phase 1: Execution                         │ │
│  │   Main Agent: Execute user request         │ │
│  └────────────────────────────────────────────┘ │
│                ↓                                 │
│  ┌────────────────────────────────────────────┐ │
│  │ Phase 2: Parallel Verification (Automatic) │ │
│  │   ├─→ Subagent A: Code Change Detector    │ │
│  │   ├─→ Subagent B: Test Verification       │ │
│  │   ├─→ Subagent C: Constitutional Review   │ │
│  │   ├─→ Subagent D: User Satisfaction       │ │
│  │   └─→ Subagent E: Evidence Collector      │ │
│  └────────────────────────────────────────────┘ │
│                ↓                                 │
│  ┌────────────────────────────────────────────┐ │
│  │ Phase 3: Gate Enforcement                  │ │
│  │   If any verification fails → BLOCK        │ │
│  │   Require fixes before completion          │ │
│  └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
    ↓
Task Complete (with proof)
```

### Verification Subagents (The "Final Check Brigade")

#### Subagent A: Code Change Detector

**Purpose**: Detect if code was modified during task execution

**Workflow**:
```bash
# Before task execution
BEFORE_HASH=$(git ls-files -s | sha256sum)

# After main agent completes
AFTER_HASH=$(git ls-files -s | sha256sum)

if [ "$BEFORE_HASH" != "$AFTER_HASH" ]; then
  echo "CODE_CHANGED: true"
  git diff --stat $BEFORE_COMMIT..HEAD
  # Triggers: Test Verification + Constitutional Review
else
  echo "CODE_CHANGED: false"
  # Skip code-specific checks
fi
```

**Output**:
- `CODE_CHANGED`: true/false
- Changed files list
- Diff stats (lines added/removed)

**Triggers**: If code changed → activate Test Verification & Constitutional Review

#### Subagent B: Test Verification Enforcer

**Purpose**: FORCE tests to run if code changed, collect proof of results

**Workflow**:
```markdown
## Test Verification Protocol

### Phase 1: Detect Test Command
1. Check `.wrangler/settings.json` for `testCommand`
2. Fallback: Check `package.json` scripts for "test"
3. Fallback: Detect test framework (jest, pytest, cargo test, go test)
4. If none found: WARN but don't block

### Phase 2: Run Tests (MANDATORY if code changed)
```bash
# Run test command, capture FULL output
TEST_OUTPUT=$(npm test 2>&1)
EXIT_CODE=$?

# Save output to evidence
echo "$TEST_OUTPUT" > .wrangler/cache/test-run-$(date +%s).log

# Parse results
if [ $EXIT_CODE -eq 0 ]; then
  RESULT="PASS"
else
  RESULT="FAIL"
fi
```

### Phase 3: Analyze Results
- Extract: Tests run, passed, failed
- Extract: Coverage % (if available)
- Extract: New test files created
- Flag: If main agent claimed "tests pass" but didn't actually run them

### Phase 4: Report
**Format**:
```
✅ TEST VERIFICATION COMPLETE

Command: npm test
Exit Code: 0 (PASS)
Tests Run: 245
Tests Passed: 245
Tests Failed: 0
Coverage: 87.3%
Duration: 12.4s

Evidence: .wrangler/cache/test-run-1731917200.log

⚠️ NOTE: Main agent did not run tests before claiming completion.
         This verification caught the gap.
```
```

**Blocking Conditions**:
- If tests FAIL → BLOCK completion, require fix
- If coverage drops below threshold → WARN (configurable: block or allow)
- If new code added but no tests → WARN (configurable)

**Output**:
- Test results summary
- Path to full test output log
- Coverage metrics
- Flag if main agent skipped testing

#### Subagent C: Constitutional Compliance Reviewer

**Purpose**: Verify changes align with constitutional principles

**Workflow**:
```markdown
## Constitutional Review Protocol

### Phase 1: Identify Changes
1. Read changed files from Code Change Detector
2. Categorize: new features, refactors, bug fixes, docs
3. Extract: function signatures, class definitions, key changes

### Phase 2: Constitutional Alignment Check
For each significant change:
1. **Load Constitution**: Read `.wrangler/governance/CONSTITUTION.md`
2. **Apply Decision Framework**:
   - Does this align with project mission?
   - Does it simplify or add complexity?
   - Does it support core principles?
   - Are there anti-pattern violations?
   - Is scope appropriate?
3. **Score Each Principle**: ✅ ALIGNED / ⚠️ BORDERLINE / ❌ VIOLATED

### Phase 3: Traditional Software Engineering Review
Check against timeless principles:
- **SOLID Principles** (Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion)
- **DRY** (Don't Repeat Yourself)
- **KISS** (Keep It Simple, Stupid)
- **YAGNI** (You Aren't Gonna Need It)
- **Separation of Concerns**
- **Principle of Least Surprise**

### Phase 4: Report
**Format**:
```
📜 CONSTITUTIONAL COMPLIANCE REVIEW

Files Changed: 3
- src/auth/login.ts (new feature)
- src/auth/middleware.ts (refactor)
- tests/auth.test.ts (new tests)

Constitutional Alignment:
✅ Systematic over Ad-Hoc: New auth flow is systematic
✅ Test-Driven Development: Tests written first
⚠️ Complexity Reduction: Adds 200 LOC (justified by security needs)
✅ Evidence over Claims: Comprehensive test coverage
✅ All principles upheld

Traditional Engineering Principles:
✅ SOLID: Single responsibility maintained
✅ DRY: No code duplication detected
✅ KISS: Simple, understandable implementation
✅ Separation of Concerns: Auth logic properly isolated
⚠️ Function Length: login() is 75 lines (consider breaking up)

Overall Assessment: ✅ APPROVED
- 0 constitutional violations
- 1 minor complexity concern (documented/justified)
- 1 refactoring suggestion (non-blocking)

In keeping with the finest traditions of software engineering.
```
```

**Blocking Conditions**:
- Constitutional principle VIOLATED → BLOCK
- Anti-pattern detected → BLOCK
- Multiple complexity warnings → BLOCK (configurable threshold)

**Output**:
- Constitutional alignment scores per principle
- Traditional engineering principle checks
- Overall assessment: APPROVED / NEEDS_REVISION / REJECTED
- Detailed reasoning for each finding

#### Subagent D: User Satisfaction Validator

**Purpose**: Objectively verify that the user's original request was ACTUALLY fulfilled to high standards

**Workflow**:
```markdown
## User Satisfaction Validation Protocol

### Phase 1: Capture Original Intent
1. **Extract User Request**:
   - Original user message verbatim
   - Implied requirements (read between the lines)
   - Context from conversation history
   - User's stated or implied quality standards

2. **Identify Success Criteria**:
   - Explicit: What did user explicitly ask for?
   - Implicit: What would a demanding user expect?
   - Quality bar: What does "high standards" mean for this task?

### Phase 2: Evaluate Completeness
Ask the critical question:

**"Did the user's request actually get completed? Will this be a completely satisfying answer to a demanding user with high standards?"**

Evaluation criteria:
```typescript
interface SatisfactionCheck {
  originalRequest: string;
  explicitRequirements: string[];
  implicitExpectations: string[];

  // For each requirement
  requirements: {
    stated: string;
    fulfilled: boolean;
    evidence: string;
    qualityLevel: 'exceeds' | 'meets' | 'below' | 'missing';
    gap?: string;  // If not fully satisfied
  }[];

  // High standards checklist
  highStandardsChecklist: {
    functionallyComplete: boolean;
    edgeCasesHandled: boolean;
    errorHandlingRobust: boolean;
    codeQualityExcellent: boolean;
    documentationClear: boolean;
    testsComprehensive: boolean;
    performanceAcceptable: boolean;
    securityConsidered: boolean;
  };

  // Overall assessment
  overallSatisfaction: 'delighted' | 'satisfied' | 'acceptable' | 'disappointed' | 'unsatisfied';
  confidence: number;  // 0-100%
}
```

### Phase 3: Apply "Demanding User" Lens

**Perspective**: Pretend you are a demanding, detail-oriented user with high standards. Would YOU be satisfied?

**Questions to Ask**:
1. **Completeness**: Did they actually do what I asked, or just part of it?
2. **Quality**: Is this production-ready or a quick hack?
3. **Edge Cases**: Did they think through error cases?
4. **Documentation**: Can I understand and maintain this?
5. **Testing**: How do I know this actually works?
6. **Performance**: Will this scale/perform well?
7. **Security**: Are there obvious vulnerabilities?
8. **User Experience**: If this were for me, would I be happy?

**Red Flags** (demanding user would notice):
- ❌ "I think this should work" (not verified)
- ❌ "Probably handles edge cases" (not tested)
- ❌ "Should be fast enough" (not measured)
- ❌ "Security seems okay" (not analyzed)
- ❌ Partial implementation (left TODOs)
- ❌ Claimed tests pass but didn't run them
- ❌ No error handling
- ❌ No documentation
- ❌ Quick and dirty solution when clean solution was feasible

### Phase 4: Gap Analysis

If satisfaction < "satisfied", identify gaps:

```markdown
## Satisfaction Gap Analysis

**User Request**: "Implement user authentication with JWT tokens"

**What Was Delivered**:
- ✅ Basic JWT token generation
- ✅ Login endpoint
- ⚠️ Password hashing (bcrypt used, but rounds not configurable)
- ❌ Token refresh mechanism (MISSING)
- ❌ Logout functionality (MISSING)
- ❌ Session management (MISSING)
- ⚠️ Error handling (basic, but doesn't cover all cases)

**High Standards Checklist**:
- ✅ Functionally complete: NO (missing refresh, logout, sessions)
- ⚠️ Edge cases handled: PARTIAL (some edge cases not covered)
- ⚠️ Error handling robust: PARTIAL (basic error handling only)
- ✅ Code quality excellent: YES (clean, readable)
- ⚠️ Documentation clear: PARTIAL (inline comments, but no usage guide)
- ⚠️ Tests comprehensive: PARTIAL (happy path tested, edge cases missing)
- ❓ Performance acceptable: UNKNOWN (not measured)
- ⚠️ Security considered: PARTIAL (no rate limiting, no account lockout)

**Demanding User Would Say**:
"This is a good start, but it's not a complete authentication system. I asked for authentication, not just a login endpoint. Where's the logout? Where's token refresh? What happens when tokens expire? What about rate limiting to prevent brute force? This needs more work before I'd call it done."

**Overall Satisfaction**: DISAPPOINTED (40/100)

**Gaps**:
1. Missing core functionality (refresh, logout, session mgmt)
2. Incomplete security (no rate limiting, no lockout)
3. Incomplete testing (edge cases not covered)
4. No performance validation
5. Minimal documentation

**Recommendation**: ❌ NOT SATISFIED
Main agent should continue working until ALL gaps addressed.
```

### Phase 5: Report to Main Agent

**If Satisfied** (≥80% confidence):
```
✅ USER SATISFACTION VALIDATION: SATISFIED

Original Request: "{user's request}"

Completeness: ✅ All explicit requirements met
Quality: ✅ Meets high standards
High Standards Checklist: 8/8 passed

A demanding user would be satisfied with this work.

Confidence: 95%
```

**If Not Satisfied** (<80% confidence):
```
❌ USER SATISFACTION VALIDATION: NOT SATISFIED

Original Request: "{user's request}"

Completeness: ⚠️ Partial (3/5 requirements met)
Quality: ⚠️ Below standards (4/8 high standards checks passed)

A demanding user would NOT be satisfied. Gaps identified:
1. Missing token refresh mechanism (explicit requirement)
2. No logout functionality (implicit expectation)
3. Incomplete security measures (high standards)
4. Edge cases not tested (high standards)

Recommendation: Continue work until gaps addressed.

Confidence: 85%
```
```

**Blocking Condition**: If overall satisfaction < "satisfied" AND confidence > 70% → BLOCK completion

**Output**:
- Original request analysis
- Requirement fulfillment checklist
- High standards evaluation
- Gap analysis (if gaps exist)
- Overall satisfaction score
- Recommendation: SATISFIED / CONTINUE_WORK

#### Subagent E: Evidence Collector

**Purpose**: Aggregate proof of all verifications for user transparency

**Workflow**:
```markdown
## Evidence Collection Protocol

### Phase 1: Gather Artifacts
Collect from all previous subagents:
- Code change detector: Diff stats, changed files
- Test verifier: Test output log, coverage report
- Constitutional reviewer: Compliance report
- Main agent: What was claimed vs. what was verified

### Phase 2: Cross-Reference Claims
Compare main agent's completion message with actual evidence:
```typescript
interface ClaimVerification {
  claim: string;           // What main agent said
  verified: boolean;       // Did we verify it?
  evidence: string;        // Path to proof
  discrepancy?: string;    // If claim doesn't match reality
}

// Example
const verifications: ClaimVerification[] = [
  {
    claim: "All tests pass",
    verified: true,
    evidence: ".wrangler/cache/test-run-1731917200.log",
    discrepancy: "Main agent didn't actually run tests; verification caught this"
  },
  {
    claim: "Production ready",
    verified: false,
    evidence: null,
    discrepancy: "No build verification performed"
  }
];
```

### Phase 3: Generate Verification Report
**Format**:
```markdown
# Task Completion Verification Report

**Task**: Implement user authentication
**Completed**: 2025-11-18 10:30:00
**Main Agent**: Claude Sonnet 4.5

---

## Verification Summary

✅ 4/4 verification checks passed

### Code Changes
✅ Detected: 3 files modified
- src/auth/login.ts (+125 lines)
- src/auth/middleware.ts (+50 lines)
- tests/auth.test.ts (+200 lines)

Evidence: `git diff main..HEAD`

### Test Verification
✅ All tests pass (245/245)
- Coverage: 87.3% (+2.1%)
- Duration: 12.4s
- New tests: 15

Evidence: `.wrangler/cache/test-run-1731917200.log`

⚠️ Note: Main agent claimed tests passed but didn't run them.
        Verification subagent caught this and ran tests.

### Constitutional Compliance
✅ Fully aligned with project principles
- 0 violations detected
- 1 minor complexity concern (justified)

Evidence: `.wrangler/cache/constitutional-review-1731917200.md`

### Traditional Engineering
✅ Upholds software engineering best practices
- SOLID principles maintained
- No code duplication
- Separation of concerns preserved

Evidence: `.wrangler/cache/engineering-review-1731917200.md`

---

## Discrepancy Alert

⚠️ Main agent's completion message included claims that were not verified:

1. **Claim**: "All tests pass"
   **Reality**: Main agent didn't run tests
   **Resolution**: Verification subagent ran tests and confirmed they pass

2. **Claim**: "Production ready"
   **Reality**: No build verification performed
   **Resolution**: Blocked completion until build verified

---

## Evidence Archive

All verification artifacts stored in:
`.wrangler/cache/verification-1731917200/`
├── test-run.log
├── constitutional-review.md
├── engineering-review.md
├── code-diff.patch
└── coverage-report.json

Verification hash: a3f5b8c9d2e1f4a7b6c5d8e9f0a1b2c3

---

## Final Status

✅ Task verified complete with evidence
✅ Ready for production deployment
✅ All claims substantiated
```
```

**Output**:
- Comprehensive verification report
- Archive of all evidence
- Discrepancy analysis (claims vs. reality)
- Verification hash for audit trail

### Workflow Execution Engine

**Implementation**: Hook into Claude Code's request/response loop

```typescript
// Pseudocode: Universal Workflow Wrapper

class UniversalWorkflowWrapper {
  async executeUserRequest(request: UserRequest): Promise<Response> {
    // Phase 1: Capture initial state
    const initialState = await this.captureState();

    // Phase 2: Execute main agent (user's request)
    const mainResponse = await this.executeMainAgent(request);

    // Phase 3: Spawn parallel verification subagents
    const verifications = await Promise.all([
      this.spawnCodeChangeDetector(initialState),
      // Only spawn if code changed:
      conditionalSpawn(() => this.spawnTestVerifier()),
      conditionalSpawn(() => this.spawnConstitutionalReviewer()),
      this.spawnUserSatisfactionValidator(request, mainResponse),
      this.spawnEvidenceCollector()
    ]);

    // Phase 4: Enforce gates
    const gatePassed = this.enforceGates(verifications);

    if (!gatePassed) {
      return this.blockCompletion(verifications);
    }

    // Phase 5: Augment response with verification report
    return this.augmentResponse(mainResponse, verifications);
  }

  private enforceGates(verifications: Verification[]): boolean {
    const testVerification = verifications.find(v => v.type === 'TEST');
    const constitutionalVerification = verifications.find(v => v.type === 'CONSTITUTIONAL');
    const satisfactionVerification = verifications.find(v => v.type === 'USER_SATISFACTION');

    // Gate 1: Tests must pass if code changed
    if (testVerification?.codeChanged && testVerification?.result === 'FAIL') {
      return false; // BLOCK
    }

    // Gate 2: Constitutional violations block
    if (constitutionalVerification?.violations > 0) {
      return false; // BLOCK
    }

    // Gate 3: User satisfaction must be high
    if (satisfactionVerification?.overallSatisfaction < 'satisfied' &&
        satisfactionVerification?.confidence > 70) {
      return false; // BLOCK - demanding user would not be satisfied
    }

    // Gate 4: Coverage threshold (configurable)
    if (testVerification?.coverage < this.settings.minCoverage) {
      if (this.settings.blockOnLowCoverage) {
        return false; // BLOCK
      }
      // else WARN but allow
    }

    return true; // PASS
  }

  private async blockCompletion(verifications: Verification[]): Promise<Response> {
    const failures = verifications.filter(v => v.status === 'FAIL');

    return {
      status: 'BLOCKED',
      message: 'Task cannot complete due to verification failures',
      failures: failures.map(f => ({
        type: f.type,
        reason: f.reason,
        evidence: f.evidence,
        remediation: f.suggestedFix
      })),
      nextSteps: [
        'Review verification failures above',
        'Fix issues identified',
        'Re-run verification',
        'Task will complete once all gates pass'
      ]
    };
  }
}
```

### Configuration in `.wrangler/settings.json`

```json
{
  "workflowWrapper": {
    "enabled": true,
    "verificationSubagents": {
      "codeChangeDetector": {
        "enabled": true,
        "sensitivity": "medium"  // low/medium/high
      },
      "testVerifier": {
        "enabled": true,
        "testCommand": "npm test",
        "blockOnFailure": true,
        "blockOnLowCoverage": false,
        "minCoverage": 80,
        "requireTestsForNewCode": true
      },
      "constitutionalReviewer": {
        "enabled": true,
        "blockOnViolation": true,
        "blockOnComplexity": false,
        "reviewDepth": "thorough"  // quick/thorough/exhaustive
      },
      "userSatisfactionValidator": {
        "enabled": true,
        "demandingUserMode": true,
        "blockOnUnsatisfied": true,
        "confidenceThreshold": 70,
        "requireExplicitAndImplicit": true
      },
      "evidenceCollector": {
        "enabled": true,
        "archivePath": ".wrangler/cache/verifications",
        "generateReport": true,
        "highlightDiscrepancies": true
      }
    },
    "gates": {
      "testsMustPass": true,
      "constitutionalCompliance": true,
      "userSatisfaction": true,
      "evidenceRequired": true
    },
    "transparency": {
      "showVerificationReport": true,
      "highlightSubagentWork": true,
      "logDiscrepancies": true
    }
  }
}
```

### User Experience

**Transparent to User** (until verification fails):

```
User: "Implement user authentication"

[Main Agent works...]

Main Agent: "I've implemented user authentication with JWT tokens..."

[Behind the scenes: Universal Workflow Wrapper activates]
[Parallel subagents spawn: Code Change Detector, Test Verifier, Constitutional Reviewer, Evidence Collector]
[All gates pass]

Main Agent: "✅ Task complete and verified

**Verification Summary**:
- ✅ Code changes detected (3 files)
- ✅ Tests passed (245/245, 87.3% coverage)
- ✅ Constitutional compliance verified
- ✅ Evidence archived

See full verification report: .wrangler/cache/verification-1731917200/report.md"
```

**Visible When Verification Fails**:

```
User: "Fix the login bug"

[Main Agent works...]

Main Agent: "Fixed the login bug! Should be good to go."

[Behind the scenes: Universal Workflow Wrapper activates]
[Test Verifier runs tests]

❌ VERIFICATION FAILED - Task Blocked

Test Verification:
- ❌ Tests FAILED (3/245 failed)
- Failed tests:
  1. auth.test.ts: Login with invalid credentials
  2. auth.test.ts: Session expiry handling
  3. auth.test.ts: Concurrent login attempts

Main Agent Claim: "Should be good to go"
Reality: Tests are failing

Evidence: .wrangler/cache/test-run-1731917200.log

Task cannot complete until tests pass.

Next Steps:
1. Review test failures in evidence log
2. Fix failing tests
3. Re-run verification
```

### Parallel Execution Optimization

**Key Insight**: All verification subagents can run in parallel after main agent completes

```typescript
// Sequential (SLOW) - 15s total
await codeChangeDetector();      // 2s
await testVerifier();             // 10s
await constitutionalReviewer();   // 2s
await evidenceCollector();        // 1s

// Parallel (FAST) - 10s total
await Promise.all([
  codeChangeDetector(),           // 2s
  testVerifier(),                 // 10s (longest)
  constitutionalReviewer(),       // 2s
  evidenceCollector()             // 1s (depends on others, starts early)
]);
```

**Latency Impact**: ~10-15s added to every task (dominated by test execution)

**Mitigation**:
- Tests already should run before completion (we're enforcing existing expectation)
- Parallel execution minimizes overhead
- User sees progress: "Running verification checks..." with live updates
- Can be disabled for FAST mode (but still logged for later review)

### Integration with Adaptive Workflow Modes

**Synergy with `ideas/adaptive-workflow-modes.md`**:

```json
{
  "mode": "DOUBLE_CHECK",
  "workflowWrapper": {
    "enabled": true,
    "verificationSubagents": {
      "testVerifier": { "blockOnFailure": true },
      "constitutionalReviewer": { "blockOnViolation": true }
    }
  }
}

{
  "mode": "FAST",
  "workflowWrapper": {
    "enabled": false,  // Skip verification wrapper entirely
    // OR
    "verificationSubagents": {
      "testVerifier": { "blockOnFailure": false },  // Log but don't block
      "constitutionalReviewer": { "enabled": false }
    }
  }
}

{
  "mode": "BALANCED",
  "workflowWrapper": {
    "enabled": true,
    "verificationSubagents": {
      "testVerifier": { "blockOnFailure": true },
      "constitutionalReviewer": { "blockOnViolation": true },
      "evidenceCollector": { "generateReport": "summary" }  // Condensed
    }
  }
}
```

### Verification Modes

**Mode 1: STRICT (DOUBLE_CHECK)**
- All subagents enabled
- Block on any failure
- Comprehensive evidence collection
- Detailed discrepancy analysis

**Mode 2: STANDARD (BALANCED)**
- Core subagents enabled (code change, tests, constitutional)
- Block on critical failures only
- Summary evidence reports
- Highlight major discrepancies

**Mode 3: RELAXED (FAST)**
- Minimal verification (code change detection only)
- Log but don't block
- No evidence archive
- User responsible for verification

**Mode 4: AUDIT (Special)**
- Maximum verification depth
- Every claim requires proof
- Full evidence archive with checksums
- Compliance report generation

---

## Benefits

### For Users

1. **No More "Production Ready" Lies**
   - System forces verification
   - Can't claim tests pass without proof
   - Constitutional compliance required

2. **Transparent Evidence**
   - Full test output archived
   - Code changes documented
   - Constitutional review saved
   - Audit trail for every task

3. **Catch Mistakes Before Deployment**
   - Tests actually run
   - Coverage checked
   - Principles verified
   - No silent quality degradation

4. **Zero Prompt Engineering Burden**
   - Don't need to remember to ask for tests
   - Don't need to request code review
   - Don't need to verify claims
   - System handles it automatically

### For AI Agents

1. **Clear Quality Contract**
   - Know exactly what verification will happen
   - Can't accidentally skip critical steps
   - Forced to provide evidence

2. **Reduced Cognitive Load**
   - Don't need to remember to run tests
   - Verification is systematic, not ad-hoc
   - Focus on implementation, system handles verification

3. **Learning from Discrepancies**
   - When claims don't match reality, logged
   - Patterns emerge (e.g., "always forgets to run tests before feature X")
   - Future improvements based on data

### For Code Quality

1. **Architectural Enforcement**
   - Quality gates can't be rationalized away
   - Constitutional principles systematically applied
   - Tests must pass (not just "probably pass")

2. **Institutional Memory**
   - Every task has verification report
   - Evidence archived for audit
   - Patterns of issues tracked over time

3. **Finest Traditions of Software Engineering**
   - SOLID, DRY, KISS, YAGNI enforced
   - Code review automated
   - Best practices become defaults

---

## Challenges & Mitigations

### Challenge 1: Latency Overhead

**Risk**: Verification adds 10-15s to every task

**Mitigation**:
- Parallel execution (all subagents run simultaneously)
- Tests should already be running (we're enforcing existing expectation)
- User sees progress indicators
- Can be disabled for FAST mode
- Asynchronous reporting (task "completes" immediately, verification in background)

### Challenge 2: False Positives

**Risk**: Verification blocks valid work

**Mitigation**:
- Configurable thresholds (coverage %, complexity limits)
- Override mechanism (user can force completion with confirmation)
- Learn from overrides (track when users override, improve detection)
- Graduated severity (BLOCK vs WARN vs INFO)

### Challenge 3: Complexity

**Risk**: Universal wrapper adds system complexity

**Mitigation**:
- Wrapper is transparent when gates pass
- Clear error messages when gates fail
- Can be disabled entirely
- Gradual rollout (opt-in initially)

### Challenge 4: Test Reliability

**Risk**: Flaky tests cause spurious blocks

**Mitigation**:
- Retry logic for flaky tests (3 attempts)
- Track test stability over time
- Flag consistently flaky tests
- Allow bypass with confirmation if tests flaky

### Challenge 5: Performance Impact

**Risk**: Running tests on every completion slows development

**Mitigation**:
- Intelligent test selection (only affected tests)
- Parallel test execution
- Cached results (if code unchanged, reuse previous test results)
- Progressive verification (quick checks first, slow checks async)

---

## Implementation Phases

### Phase 1: Evidence Collector (v1.3.0)

**Goal**: Start collecting evidence without blocking

- Implement Evidence Collector subagent
- Run after every task (non-blocking)
- Generate verification reports
- Store in `.wrangler/cache/verifications/`
- NO blocking yet, just transparency

**Benefit**: Users see what verification would check

### Phase 2: Code Change Detector (v1.4.0)

**Goal**: Detect when code changes, trigger appropriate checks

- Implement Code Change Detector subagent
- Integrate with git
- Trigger test verification only when code changed
- Still non-blocking, but recommendations

**Benefit**: Smarter verification (don't check tests if no code changed)

### Phase 3: Test Verifier (v1.5.0)

**Goal**: Enforce test execution when code changes

- Implement Test Verifier subagent
- Make blocking (BLOCK if tests fail)
- Capture full test output
- Report discrepancies (claimed vs verified)

**Benefit**: "Tests pass" requires proof

### Phase 4: Constitutional Reviewer (v1.6.0)

**Goal**: Ensure constitutional compliance

- Implement Constitutional Reviewer subagent
- Check changes against principles
- Traditional engineering review (SOLID, DRY, etc.)
- Blocking on violations

**Benefit**: Code quality enforcement

### Phase 5: Universal Wrapper (v2.0.0)

**Goal**: Full integration, all gates enforced

- Integrate all subagents into wrapper
- Hook into request/response loop
- Parallel execution optimization
- Mode-based configuration
- Full transparency + enforcement

**Benefit**: Complete verification system

---

## Success Metrics

**Quality Improvement**:
- % of tasks with "production ready" claim that actually verified
- Reduction in post-deployment bugs
- Test coverage trend over time
- Constitutional compliance rate

**Discrepancy Detection**:
- % of tasks where main agent claims didn't match verification
- Most common discrepancies (e.g., "didn't run tests")
- Time saved by catching issues pre-deployment

**User Satisfaction**:
- % of users who enable workflow wrapper
- Override rate (how often users bypass gates)
- Feedback on transparency vs overhead tradeoff

**Performance**:
- Average verification overhead (target: <15s)
- Parallel execution efficiency
- Cache hit rate (skipped redundant checks)

---

## Examples

### Example 1: Bug Fix (Verification Catches Failure)

```
User: "Fix the authentication timeout bug"

Main Agent: "Fixed! The session now properly expires after 30 minutes."

[Workflow Wrapper activates]

Code Change Detector: ✅ Detected changes in src/auth/session.ts

Test Verifier: Running tests...
❌ FAILED: 2/245 tests failing
- auth.test.ts: Session expiry edge case
- auth.test.ts: Concurrent session handling

❌ VERIFICATION FAILED

Main Agent claimed fix was complete, but tests are failing.

Evidence: .wrangler/cache/test-run-1731917200.log

Next Steps:
1. Review failing tests
2. Fix the edge cases
3. Verify tests pass
```

**Result**: Bug caught before deployment, not after

### Example 2: Feature Addition (Constitutional Compliance)

```
User: "Add a caching layer to speed up API responses"

Main Agent: "Added Redis caching! API is now 10x faster."

[Workflow Wrapper activates]

Code Change Detector: ✅ Detected changes in 5 files

Test Verifier: ✅ All tests pass (260/260, 88.1% coverage)

Constitutional Reviewer: ⚠️ COMPLEXITY CONCERN

Changes Analysis:
- Added 300 lines of caching logic
- Introduced new dependency (Redis)
- Complexity increased significantly

Constitutional Alignment:
✅ Systematic over Ad-Hoc: Caching is systematic
⚠️ Complexity Reduction: FAILED - Added significant complexity
  - Cache invalidation logic is complex
  - Redis dependency adds operational burden
  - Alternative: HTTP caching headers (simpler)

Traditional Engineering:
⚠️ YAGNI: Is caching premature optimization?
  - Current API response time: 50ms (already fast)
  - No user complaints about speed
  - Adding complexity without proven need

Recommendation: ⚠️ REVISE
- Measure current performance first
- Consider simpler alternatives (HTTP cache, CDN)
- If caching needed, start with in-memory (simpler than Redis)

Constitutional Review: Request revision before approval
```

**Result**: Catches premature optimization, suggests simpler approach

### Example 3: Refactor (All Gates Pass)

```
User: "Refactor the authentication middleware to be more testable"

Main Agent: "Refactored! Extracted dependencies, added interfaces, improved testability."

[Workflow Wrapper activates]

Code Change Detector: ✅ Detected changes in src/auth/middleware.ts

Test Verifier: ✅ All tests pass (265/265, 91.2% coverage)
- Coverage increased by 3.1%
- 15 new tests added

Constitutional Reviewer: ✅ FULLY ALIGNED

Changes Analysis:
- Refactored 1 file (-50 lines, net reduction)
- Extracted interfaces for dependencies
- Added comprehensive tests

Constitutional Alignment:
✅ Systematic over Ad-Hoc: Systematic refactoring
✅ Complexity Reduction: Net -50 lines, clearer structure
✅ Test-Driven Development: Tests added during refactor
✅ Evidence over Claims: Coverage increased, tests prove correctness

Traditional Engineering:
✅ SOLID: Dependency Inversion Principle applied
✅ DRY: Eliminated duplication
✅ Testability: Much improved

Overall: ✅ APPROVED - Exemplary refactoring

In keeping with the finest traditions of software engineering.

Evidence: .wrangler/cache/verification-1731917200/
```

**Result**: Quality work recognized and documented

---

## Related Ideas

- **Adaptive Workflow Modes** (`ideas/adaptive-workflow-modes.md`)
  - Integration: Verification gates adapt to mode
  - DOUBLE_CHECK: All gates enforced
  - FAST: Gates disabled or logged only

- **Self-Healing MCP Plugin** (`ideas/self-healing-mcp-plugin.md`)
  - Integration: Verification wrapper catches MCP bugs
  - Evidence collector logs MCP errors
  - Triggers self-healing workflow

---

## Open Questions

1. **Blocking vs Warning**: Which gates should BLOCK vs WARN?
   - Tests failing: BLOCK (critical)
   - Coverage drop: WARN or BLOCK? (configurable)
   - Constitutional borderline: WARN or BLOCK?
   - Complexity increase: WARN or BLOCK?

2. **User Override**: Should users be able to force completion?
   - YES: Allows progress when verification is wrong
   - NO: Enforces quality strictly
   - COMPROMISE: Require confirmation + reason logged

3. **Verification Depth**: How thorough should checks be?
   - Quick: Only critical checks (~5s overhead)
   - Standard: Full test suite (~15s overhead)
   - Exhaustive: All checks + static analysis (~30s overhead)

4. **Evidence Retention**: How long to keep verification reports?
   - Forever: Full audit trail (storage cost)
   - 30 days: Recent verification history
   - Until next deployment: Discard after shipped

5. **Integration Point**: Where to hook in?
   - Claude Code core: Requires upstream change
   - Wrangler plugin: Hook via MCP or skills
   - Session hook: Run after every interaction

---

## Next Steps

1. **Prototype Evidence Collector**: Start logging verification data non-blocking
2. **Measure Overhead**: Benchmark verification subagent execution time
3. **User Feedback**: Survey users on pain points with current verification
4. **Design Blocking UX**: How to communicate verification failures clearly
5. **Constitutional Alignment**: Review this idea against wrangler principles

---

## Implementation Notes

### Hooking into Claude Code Request Loop

**Option 1: Session Hook (Simplest)**
```bash
# In hooks/session-end.sh (if exists)
# Or create a new hook: hooks/task-complete.sh

# Run verification wrapper after each task
if [ "$WRANGLER_WORKFLOW_WRAPPER_ENABLED" = "true" ]; then
  # Spawn verification subagents in parallel
  spawn_subagent "code-change-detector" &
  spawn_subagent "test-verifier" &
  spawn_subagent "constitutional-reviewer" &
  spawn_subagent "evidence-collector" &

  # Wait for all to complete
  wait

  # Check if any blocked
  if check_gates_failed; then
    echo "❌ Verification failed - task blocked"
    exit 1
  fi
fi
```

**Option 2: Skill-Based (More Control)**
```markdown
# Create skill: skills/workflow-wrapper/SKILL.md

This skill runs automatically after every user request.

## Workflow
1. Detect if code changed
2. If yes:
   - Spawn test verifier
   - Spawn constitutional reviewer
3. Always:
   - Spawn evidence collector
4. Enforce gates
5. Report results
```

**Option 3: MCP Tool (Most Integrated)**
```typescript
// Add new MCP tool: workflow_verify

export async function workflowVerify(
  params: WorkflowVerifyParams,
  providerFactory: ProviderFactory
): Promise<CallToolResult> {
  // Detect changes
  const codeChanged = await detectCodeChanges();

  // Spawn verification subagents
  const verifications = await Promise.all([
    codeChanged ? verifyTests() : null,
    codeChanged ? reviewConstitutional() : null,
    collectEvidence()
  ].filter(Boolean));

  // Enforce gates
  const gatePassed = enforceGates(verifications);

  if (!gatePassed) {
    return createErrorResponse(
      MCPErrorCode.VERIFICATION_FAILED,
      "Task blocked due to verification failures",
      { verifications }
    );
  }

  return createSuccessResponse(
    "Verification complete",
    { verifications }
  );
}
```

---

**This idea addresses the core problem**: Claude Code often says "done" without actually verifying. By making verification architectural (not prompt-based), we eliminate the ability to skip quality gates while maintaining transparency and user control.