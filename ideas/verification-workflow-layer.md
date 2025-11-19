# Idea: Verification Workflow Layer (Quality Firewall)

**Status**: Brainstorming
**Created**: 2025-11-18
**Category**: Quality Assurance, Workflow Architecture, Verification

---

## Core Concept

Wrap every user-facing interaction in a **transparent verification workflow layer** that automatically dispatches parallel verification subagents to check critical quality gates before claiming work is complete. This creates a "quality firewall" that prevents common failure modes like forgetting to run tests, skipping verification steps, or claiming "production ready" without evidence.

## Problem Statement

**Current Pain Points**:
1. **Premature Completion Claims**: Claude Code often says "work is done" without running tests or verifying changes
2. **Forgotten Verification Steps**: Systematic checks (run tests, verify constitution, check requirements) get skipped under time pressure
3. **No Enforcement**: Quality guidelines exist but aren't systematically enforced
4. **User Frustration**: Users waste time discovering work wasn't actually complete
5. **Inconsistent Standards**: Quality varies based on which agent handles task

**What if**: We could guarantee that every piece of work passes a standard set of quality checks before completion is announced?

## Proposed Solution

Create a **Verification Workflow Layer** that:
1. Intercepts all user requests
2. Tracks what actions were taken (code changes, spec creation, etc.)
3. Automatically dispatches verification subagents in parallel
4. Prevents completion until all verifications pass
5. Provides transparent reporting to user

### Architecture

```
User Request
    ↓
┌───────────────────────────────────────┐
│  Verification Workflow Layer          │
│  (Transparent Wrapper)                │
└───────────────────────────────────────┘
    ↓
Primary Agent Executes Task
    ↓
    ├─ Track: Code changes? → Flag for verification
    ├─ Track: Spec created? → Flag for alignment check
    ├─ Track: Tests modified? → Flag for test run
    └─ Track: Requirements stated? → Flag for completeness check
    ↓
Work Complete (tentative)
    ↓
┌───────────────────────────────────────┐
│  Parallel Verification Dispatch       │
│  (Based on flags set)                 │
└───────────────────────────────────────┘
    ↓
    ├─ Subagent A: Test Runner (if code touched)
    ├─ Subagent B: Constitutional Compliance (if changes made)
    ├─ Subagent C: Requirements Fulfillment (always)
    └─ Subagent D: Code Review (if significant changes)
    ↓
All Verifications Complete
    ↓
    ├─ All Pass → ✅ Report completion to user
    ├─ Some Fail → ⚠️ Report failures + fix automatically
    └─ Critical Fail → ❌ Report failure + await user guidance
```

## Verification Subagents

### 1. Test Runner Subagent

**Trigger**: Code changes detected (src/, lib/, mcp/, etc.)

**Workflow**:
```markdown
## Test Runner Verification

### Checklist
- [ ] Identify test command (npm test, cargo test, pytest, etc.)
- [ ] Run full test suite
- [ ] Capture test output
- [ ] Parse results (pass/fail counts)
- [ ] Check coverage (if applicable)
- [ ] Verify no regressions

### Decision Logic
- All tests pass + coverage maintained → ✅ PASS
- Tests fail → ⚠️ FAIL (auto-fix or report)
- Tests don't exist → ⚠️ WARN (recommend adding)
- Can't run tests → ❌ ERROR (report to user)

### Output
{
  "result": "PASS" | "FAIL" | "WARN" | "ERROR",
  "testsRun": 233,
  "testsPassed": 233,
  "testsFailed": 0,
  "coverage": "87.11%",
  "message": "All 233 tests passing, coverage maintained",
  "evidence": "test-output.txt"
}
```

### 2. Constitutional Compliance Subagent

**Trigger**: Code changes OR spec creation OR architectural decision

**Workflow**:
```markdown
## Constitutional Compliance Verification

### Checklist
- [ ] Read project constitution
- [ ] Identify all principles
- [ ] Check changes against each principle
- [ ] Apply decision framework (5 questions)
- [ ] Verify no anti-pattern violations
- [ ] Check for scope creep

### Decision Logic
- Fully aligned → ✅ APPROVE
- Minor concerns → ⚠️ REVISE (with recommendations)
- Major violations → ❌ REJECT (must fix)

### Output
{
  "result": "APPROVE" | "REVISE" | "REJECT",
  "principlesChecked": 8,
  "aligned": ["TDD", "Systematic over Ad-Hoc", "Simplicity"],
  "concerns": ["Complexity increased without justification"],
  "antiPatternViolations": [],
  "decisionFramework": {
    "alignsWithMission": true,
    "simplifiesOrComplicates": "complicates (unjustified)",
    "supportsPrinciples": true,
    "violatesAntiPatterns": false,
    "appropriateScope": true
  },
  "recommendation": "Add justification for increased complexity"
}
```

### 3. Requirements Fulfillment Subagent

**Trigger**: ALWAYS (for every user request)

**Workflow**:
```markdown
## Requirements Fulfillment Verification

### Checklist
- [ ] Extract all requirements from user's original request
- [ ] Identify explicit asks (stated directly)
- [ ] Identify implicit asks (implied by context)
- [ ] For each requirement, verify completion
- [ ] Check for partial implementations
- [ ] Verify quality of completion

### Question to Answer
"Did the user's request actually get completed? Will this be a completely satisfying answer
to a demanding user with high standards?"

### Thoroughness Check
- [ ] Review original request line-by-line
- [ ] Ensure no feature ideas slipped through cracks
- [ ] Verify all edge cases addressed
- [ ] Check for overlooked details
- [ ] Validate quality meets standards

### Decision Logic
- All requirements met + high quality → ✅ COMPLETE
- Most met, minor gaps → ⚠️ INCOMPLETE (list gaps)
- Major gaps → ❌ INCOMPLETE (must address)

### Output
{
  "result": "COMPLETE" | "INCOMPLETE",
  "totalRequirements": 12,
  "fulfilled": 10,
  "partiallyFulfilled": 2,
  "unfulfilled": 0,
  "details": [
    {
      "requirement": "Create versioning system",
      "status": "FULFILLED",
      "evidence": "Created CURRENT_VERSION, startup-checklist skill, update-yourself command"
    },
    {
      "requirement": "Ensure nothing slips through cracks",
      "status": "FULFILLED",
      "evidence": "All 7 implementation issues created, spec updated with all requirements"
    },
    {
      "requirement": "Delegate to subagents where appropriate",
      "status": "PARTIALLY_FULFILLED",
      "evidence": "Delegated Phase 1 implementation, but remaining issues not yet delegated",
      "recommendation": "Continue delegating remaining issues"
    }
  ],
  "overallQuality": "HIGH",
  "wouldSatisfyDemandingUser": true,
  "gaps": ["Remaining implementation issues not delegated yet"]
}
```

### 4. Code Review Subagent

**Trigger**: Significant code changes (>50 lines or complex logic)

**Workflow**:
```markdown
## Code Review Verification

### Checklist
- [ ] Review all changed files
- [ ] Check for code smells
- [ ] Verify error handling
- [ ] Check security issues (XSS, injection, etc.)
- [ ] Verify documentation/comments
- [ ] Check naming conventions
- [ ] Verify test coverage for changes

### Code Quality Checks
- [ ] Functions ≤50 lines (per constitution)
- [ ] Clear, descriptive names
- [ ] No magic numbers or strings
- [ ] Proper error handling
- [ ] Security best practices
- [ ] TypeScript strict mode compliance

### Decision Logic
- Clean, well-tested code → ✅ APPROVE
- Minor issues → ⚠️ APPROVE_WITH_SUGGESTIONS
- Major issues → ❌ REJECT (must fix)

### Output
{
  "result": "APPROVE" | "APPROVE_WITH_SUGGESTIONS" | "REJECT",
  "filesReviewed": 5,
  "linesChanged": 342,
  "issues": [
    {
      "severity": "MINOR",
      "file": "mcp/server.ts",
      "line": 123,
      "issue": "Magic number 3600 should be constant",
      "suggestion": "const DEFAULT_CACHE_TTL = 3600;"
    }
  ],
  "securityIssues": [],
  "testCoverage": "92%",
  "overallQuality": "HIGH"
}
```

## Integration with `.wrangler/settings.json`

### Configuration

```json
{
  "mode": "BALANCED",
  "verificationLayer": {
    "enabled": true,
    "parallelVerification": true,
    "requiredVerifications": {
      "testRunner": {
        "enabled": true,
        "trigger": "code-changes",
        "required": true,
        "autoFix": true
      },
      "constitutionalCompliance": {
        "enabled": true,
        "trigger": "any-changes",
        "required": true,
        "autoFix": false
      },
      "requirementsFulfillment": {
        "enabled": true,
        "trigger": "always",
        "required": true,
        "autoFix": false
      },
      "codeReview": {
        "enabled": true,
        "trigger": "significant-changes",
        "required": false,
        "autoFix": false,
        "threshold": 50
      }
    },
    "completionCriteria": {
      "allRequired": true,
      "allowWarnings": true,
      "autoFixFailures": true
    },
    "reporting": {
      "verbose": true,
      "includeEvidence": true,
      "summaryOnly": false
    }
  }
}
```

### Mode-Specific Behavior

**DOUBLE_CHECK Mode**:
```json
{
  "requiredVerifications": {
    "testRunner": { "required": true, "autoFix": true },
    "constitutionalCompliance": { "required": true },
    "requirementsFulfillment": { "required": true },
    "codeReview": { "required": true }
  },
  "completionCriteria": {
    "allRequired": true,
    "allowWarnings": false,
    "autoFixFailures": true
  }
}
```

**BALANCED Mode** (default):
```json
{
  "requiredVerifications": {
    "testRunner": { "required": true, "autoFix": true },
    "constitutionalCompliance": { "required": true },
    "requirementsFulfillment": { "required": true },
    "codeReview": { "required": false }
  },
  "completionCriteria": {
    "allRequired": true,
    "allowWarnings": true,
    "autoFixFailures": true
  }
}
```

**FAST Mode**:
```json
{
  "requiredVerifications": {
    "testRunner": { "required": false },
    "constitutionalCompliance": { "required": false },
    "requirementsFulfillment": { "required": true },
    "codeReview": { "required": false }
  },
  "completionCriteria": {
    "allRequired": false,
    "allowWarnings": true,
    "autoFixFailures": false
  }
}
```

## Workflow Example

### User Request
```
User: "Implement user authentication system"
```

### Primary Agent Execution
```
Primary Agent:
1. Creates authentication spec
2. Implements auth middleware
3. Writes tests
4. Updates documentation
5. [TENTATIVE] Work complete

Tracked Actions:
- Code changes: YES (auth middleware added)
- Spec created: YES (auth spec)
- Tests modified: YES (new test suite)
- Requirements: "authentication system"
```

### Verification Layer Dispatch
```
Verification Layer: Dispatching 4 parallel verifications...

┌─ Subagent A: Test Runner
│  Running: npm test
│  Result: ❌ FAIL - 2 tests failing in auth.test.ts
│  Auto-fix: YES
│  [Fixing tests...]
│  Re-run: ✅ PASS - All 235 tests passing
│
├─ Subagent B: Constitutional Compliance
│  Checking: Auth implementation against 8 principles
│  Result: ⚠️ REVISE
│  Issue: Password storage doesn't use bcrypt (security principle)
│  Auto-fix: NO (requires decision)
│  [Flagged for user review]
│
├─ Subagent C: Requirements Fulfillment
│  Requirement: "Implement user authentication system"
│  Explicit asks:
│    ✅ Login endpoint
│    ✅ Registration endpoint
│    ✅ Password validation
│    ✅ Session management
│  Implicit asks:
│    ⚠️ Password reset (not implemented)
│    ⚠️ Email verification (not implemented)
│  Result: ⚠️ INCOMPLETE (2 implied features missing)
│
└─ Subagent D: Code Review
   Files: auth.ts, middleware/auth.ts, tests/auth.test.ts
   Issues:
     - MINOR: Magic number 3600 (session timeout)
     - MINOR: Error messages could be more specific
   Security:
     - ⚠️ WARNING: Plain text passwords in logs
   Result: ⚠️ APPROVE_WITH_SUGGESTIONS
```

### Consolidated Report to User
```
Primary Agent:

I've implemented the user authentication system. However, verification identified
some issues that need attention:

✅ Tests: All 235 tests passing (2 tests were failing, auto-fixed)

⚠️ Constitutional Compliance Issue:
   - Password storage doesn't use bcrypt (violates security principle)
   - Recommendation: Switch to bcrypt for password hashing

⚠️ Requirements Incomplete:
   Implemented:
   ✅ Login endpoint
   ✅ Registration endpoint
   ✅ Password validation
   ✅ Session management

   Missing (implied by "authentication system"):
   ⚠️ Password reset functionality
   ⚠️ Email verification

   Should I implement these as well, or is current scope sufficient?

⚠️ Code Review Findings:
   - Security: Plain text passwords appearing in logs (line 45, auth.ts)
   - Code quality: Magic number 3600 should be constant SESSION_TIMEOUT
   - Error messages could be more descriptive

Status: NEEDS_REVISION

Would you like me to:
1. Fix the bcrypt issue (critical)
2. Remove password logging (security)
3. Add password reset + email verification (scope question)
```

### Resolution Workflow
```
User: "Yes, fix security issues and add password reset. Skip email verification."

Primary Agent:
[Makes fixes]
[Re-triggers verification]

Verification Layer: All checks passing ✅

Primary Agent:
✅ All verification checks passed:
   - Tests: 237 passing
   - Constitutional compliance: Approved
   - Requirements: Fulfilled (password reset added, email verification deferred)
   - Code review: Approved

Work is complete and verified.
```

## Implementation Details

### 1. Request Interception

**Skill**: `skills/wrangler/verification-layer/SKILL.md`

```markdown
# Verification Workflow Layer

## MANDATORY PROTOCOL

This skill MUST be invoked at the end of EVERY user request before claiming completion.

### Activation
Automatically activates when:
- User request execution complete
- About to report "done" or "complete"
- Before final response to user

### Process
1. Analyze what actions were taken
2. Determine which verifications apply
3. Dispatch parallel verification subagents
4. Wait for all verifications
5. Synthesize results
6. Report to user OR auto-fix and re-verify
```

### 2. Action Tracking

**Mechanism**: Metadata collection during execution

```typescript
// In execution context
interface ActionTracker {
  codeChanges: {
    detected: boolean;
    files: string[];
    linesChanged: number;
  };
  specsCreated: {
    detected: boolean;
    specs: string[];
  };
  testsModified: {
    detected: boolean;
    testFiles: string[];
  };
  requirements: {
    original: string;
    parsed: Requirement[];
  };
}

// Track automatically via tool usage
function trackToolUse(tool: string, params: any) {
  if (tool === 'Write' || tool === 'Edit') {
    actionTracker.codeChanges.detected = true;
    actionTracker.codeChanges.files.push(params.file_path);
  }
  // ... more tracking
}
```

### 3. Parallel Dispatch

**Use existing Task tool**:

```typescript
// Pseudo-code for verification layer
async function dispatchVerifications(tracker: ActionTracker) {
  const verifications: Promise<VerificationResult>[] = [];

  // Determine which verifications to run
  if (tracker.codeChanges.detected) {
    verifications.push(
      runVerificationAgent('test-runner', tracker)
    );
    verifications.push(
      runVerificationAgent('code-review', tracker)
    );
  }

  if (tracker.specsCreated.detected || tracker.codeChanges.detected) {
    verifications.push(
      runVerificationAgent('constitutional-compliance', tracker)
    );
  }

  // ALWAYS run requirements check
  verifications.push(
    runVerificationAgent('requirements-fulfillment', tracker)
  );

  // Wait for all in parallel
  const results = await Promise.all(verifications);

  return synthesizeResults(results);
}
```

### 4. Auto-Fix Logic

**Strategy**: Fix failures automatically when safe

```markdown
## Auto-Fix Decision Tree

### Test Failures
- Can auto-fix? → YES (if test code issue, not impl logic)
- Strategy: Analyze failure, update test or impl, re-run
- Fallback: Report to user if can't determine fix

### Constitutional Violations
- Can auto-fix? → SOMETIMES (minor issues only)
- Strategy: Apply constitutional principles, refactor
- Fallback: Report to user for major violations

### Requirements Gaps
- Can auto-fix? → NO (requires user decision)
- Strategy: Ask user for clarification
- Fallback: N/A (always ask)

### Code Review Issues
- Can auto-fix? → YES (for code quality issues)
- Strategy: Apply best practices, refactor
- Fallback: Report security issues to user
```

## Benefits

### For Users

1. **Guaranteed Quality**: Work is always verified before completion
2. **No More "Oops"**: Catches forgotten test runs, missing requirements
3. **Transparent**: See what checks were run and results
4. **Saves Time**: Don't discover issues after claiming completion
5. **Higher Standards**: Consistent quality across all interactions

### For Claude Code

1. **Fail-Safe**: Prevents embarrassing "production ready" claims without tests
2. **Systematic**: Verification isn't optional or memory-dependent
3. **Parallel**: Verifications run concurrently, minimal latency impact
4. **Learning**: Auto-fix improves over time
5. **Trust**: Users can rely on verification layer

### For Project Quality

1. **Constitutional Adherence**: Every change checked against principles
2. **Test Coverage**: Code changes always verified with tests
3. **Completeness**: Requirements systematically checked
4. **Code Quality**: Automatic review catches issues early
5. **Documentation**: Verification evidence provides audit trail

## Challenges & Mitigations

### Challenge 1: Latency

**Risk**: Parallel verifications add time to every request

**Mitigation**:
- Run verifications in parallel (not sequential)
- Only run applicable verifications (not all 4 every time)
- Cache verification results (if code unchanged, skip test run)
- Show progress indicators to user
- Mode-specific: FAST mode skips optional verifications

**Estimated Impact**:
- Best case: +5 seconds (requirements check only)
- Typical: +15-30 seconds (2-3 verifications in parallel)
- Worst case: +60 seconds (all 4 verifications + auto-fixes)

### Challenge 2: False Positives

**Risk**: Verification layer flags non-issues

**Mitigation**:
- High-confidence thresholds for auto-fix
- User can override verification (FAST mode)
- Learn from overrides (track false positives)
- Configurable sensitivity per project

### Challenge 3: Complexity

**Risk**: Adds another layer of abstraction

**Mitigation**:
- Transparent reporting (user sees what's happening)
- Opt-out available (disable in settings.json)
- Progressive disclosure (summary first, details on request)
- Clear documentation

### Challenge 4: Verification Failures

**Risk**: What if verification subagent itself fails?

**Mitigation**:
- Graceful degradation (report failure, don't block completion)
- Retry logic for transient failures
- Fallback to manual verification
- Log failures for improvement

## Implementation Phases

### Phase 1: Core Infrastructure (v1.2.0)
- Create verification-layer skill
- Implement action tracking
- Add settings.json configuration
- Basic requirements fulfillment subagent

### Phase 2: Test Runner Integration (v1.3.0)
- Implement test runner subagent
- Auto-fix failing tests
- Support multiple test frameworks
- Cache test results

### Phase 3: Constitutional Compliance (v1.4.0)
- Implement constitutional compliance subagent
- Integration with existing check-alignment skill
- Auto-fix minor violations
- Report major violations

### Phase 4: Code Review (v1.5.0)
- Implement code review subagent
- Static analysis integration
- Security scanning
- Auto-fix code quality issues

### Phase 5: Auto-Fix Intelligence (v2.0.0)
- Learn from fixes
- Improve auto-fix accuracy
- Predictive verification (run before issues occur)
- Smart caching

## Configuration Examples

### Strict Project (Maximum Quality)
```json
{
  "mode": "DOUBLE_CHECK",
  "verificationLayer": {
    "enabled": true,
    "completionCriteria": {
      "allRequired": true,
      "allowWarnings": false,
      "autoFixFailures": true
    }
  }
}
```

### Rapid Prototyping (Speed Focus)
```json
{
  "mode": "FAST",
  "verificationLayer": {
    "enabled": true,
    "requiredVerifications": {
      "requirementsFulfillment": { "required": true }
    },
    "completionCriteria": {
      "allowWarnings": true
    }
  }
}
```

### Research Project (Exploration)
```json
{
  "mode": "EXPLORATION",
  "verificationLayer": {
    "enabled": false
  }
}
```

## Open Questions

1. **Verification Timing**: Run verifications before or after reporting tentative completion?
   - **Option A**: Before (user only sees verified results)
   - **Option B**: After (user sees work, then verification results)
   - **Option C**: Streaming (show work + verification in parallel)

2. **Override Mechanism**: How should users skip verification when needed?
   - **Option A**: Environment variable (WRANGLER_SKIP_VERIFICATION=true)
   - **Option B**: Inline flag ("implement auth --skip-verification")
   - **Option C**: Mode switch (FAST mode disables most checks)

3. **Verification Evidence**: Where to store verification outputs?
   - **Option A**: `.wrangler/verification/` directory
   - **Option B**: Inline in response
   - **Option C**: Both (summary inline, full output in file)

4. **Failed Auto-Fix**: What happens if auto-fix fails?
   - **Option A**: Report to user, await guidance
   - **Option B**: Retry with different strategy
   - **Option C**: Escalate to human maintainer

5. **Verification Versioning**: How to evolve verification logic?
   - **Option A**: Versioned verification skills (check-v1, check-v2)
   - **Option B**: Single skill with version detection
   - **Option C**: Release notes track verification changes

## Success Metrics

**Quality Impact**:
- % of completions that pass all verifications first try
- Reduction in post-completion bug reports
- Increase in test coverage

**User Satisfaction**:
- User trust in "work complete" claims
- Reduction in "forgot to run tests" incidents
- User feedback on verification value vs latency

**Performance**:
- Average verification latency
- Auto-fix success rate
- Verification cache hit rate

**Learning**:
- Auto-fix accuracy improvement over time
- False positive rate reduction
- New verification types added

## Related Ideas

- **Adaptive Workflow Modes** (`ideas/adaptive-workflow-modes.md`): Verification layer is core component
- **Self-Healing MCP Plugin** (`ideas/self-healing-mcp-plugin.md`): Similar verification approach for MCP errors

## Next Steps

1. **Validate Concept**: Discuss with users + maintainers
2. **Prototype**: Implement basic requirements-fulfillment subagent
3. **Measure**: Benchmark latency impact of parallel verifications
4. **Iterate**: Refine based on user feedback
5. **Integrate**: Add to adaptive workflow modes system

---

## Appendix: Verification Layer Checklist

When implementing, ensure:

- [ ] Verifications run in parallel (not sequential)
- [ ] User sees progress indicators
- [ ] Auto-fix attempts safe changes only
- [ ] Failures reported clearly with recommendations
- [ ] Evidence preserved for audit trail
- [ ] Configuration respects user preferences
- [ ] Graceful degradation if verification fails
- [ ] Mode-specific behavior (FAST vs DOUBLE_CHECK)
- [ ] Learning from false positives
- [ ] Clear documentation for users

---

**Last Updated**: 2025-11-18
**Status**: Brainstorming (Pending constitutional alignment review)
