# Wrangler Issues

This directory contains implementation issues for wrangler enhancements.

## Current Project: Testing & Verification Enhancement

**Parent Specification**: `../specifications/000001-testing-verification-enhancement.md`

**Goal**: Prevent agents from claiming work is "done" without proper testing and verification.

## All Issues (13 Total)

### Phase 1: Core Verification Strengthening (5 issues - CRITICAL)

| Issue | File | Focus | Effort | Status |
|-------|------|-------|--------|--------|
| #000001 | verification-add-test-evidence-requirements.md | Require showing actual test output | 2h | Open |
| #000002 | verification-add-tdd-compliance-certification.md | Explicit TDD attestation per function | 2h | Open |
| #000003 | verification-add-code-review-gate.md | Make code review mandatory | 2h | Open |
| #000004 | tdd-add-evidence-requirements.md | RED/GREEN phases must show output | 2h | Open |
| #000005 | finishing-branch-check-completeness.md | Check completeness (not just tests) | 2h | Open |

**Phase 1 Total**: ~10 hours

**Phase 1 Impact**:
- ✅ Agents must show test output before claiming "tests pass"
- ✅ TDD compliance requires explicit certification
- ✅ Code review becomes mandatory (not optional)
- ✅ Completeness verified before merge/PR

### Phase 2: Frontend Testing Foundation (3 issues - HIGH)

| Issue | File | Focus | Effort | Status |
|-------|------|-------|--------|--------|
| #000006 | create-frontend-visual-regression-testing-skill.md | Screenshot verification, DevTools checks | 4h | Open |
| #000007 | create-frontend-accessibility-verification-skill.md | axe-core, keyboard nav, WCAG compliance | 4h | Open |
| #000008 | update-verification-frontend-checklist.md | Frontend verification in completion skill | 2h | Open |

**Phase 2 Total**: ~10 hours

**Phase 2 Impact**:
- ✅ Visual regression testing guidance (screenshots, baselines)
- ✅ Accessibility testing mandatory (axe-core, keyboard, WCAG)
- ✅ Frontend-specific verification checklist

### Phase 3: Workflow Integration (3 issues - HIGH)

| Issue | File | Focus | Effort | Status |
|-------|------|-------|--------|--------|
| #000009 | update-executing-plans-mandatory-code-review.md | Code review after each batch | 2h | Open |
| #000010 | update-code-review-add-tdd-verification.md | TDD verification in Phase 4 | 2h | Open |
| #000011 | update-requesting-code-review-required.md | Change "optional" to "required" | 2h | Open |

**Phase 3 Total**: ~6 hours

**Phase 3 Impact**:
- ✅ Code review mandatory in all workflows (not just subagent-driven)
- ✅ Code reviewers check TDD compliance
- ✅ No ambiguity about when review required

### Phase 4: Anti-Patterns & E2E (2 issues - MEDIUM)

| Issue | File | Focus | Effort | Status |
|-------|------|-------|--------|--------|
| #000012 | update-testing-anti-patterns-frontend.md | 3 frontend anti-patterns | 3h | Open |
| #000013 | create-frontend-e2e-user-journeys-skill.md | Page Objects, user-centric selectors | 4h | Open |

**Phase 4 Total**: ~7 hours

**Phase 4 Impact**:
- ✅ Prevents common frontend testing mistakes
- ✅ E2E testing guidance (when to use, Page Objects)
- ✅ User-centric selector patterns

## Grand Total

- **All Phases**: 13 issues, ~33 hours estimated effort
- **Phase 1 (Critical)**: 5 issues, ~10 hours
- **Phases 2-4 (High/Medium)**: 8 issues, ~23 hours

## Issue Dependencies

### Phase 1 (Sequential - Foundation)
```
000001 (test evidence) ← Foundation
   ↓
000002 (TDD certification) ← Uses 000001
   ↓
000003 (code review gate) ← Uses 000001 & 000002
   ↓
000004 (TDD evidence) ← Complements 000002
   ↓
000005 (completeness) ← Uses ALL above
```

### Phase 2 (Can run in parallel after Phase 1)
```
000006 (visual regression) ← Independent
000007 (accessibility) ← Independent
000008 (frontend checklist) ← Uses 000006 & 000007
```

### Phase 3 (Can run in parallel after Phase 1)
```
000009 (executing-plans) ← Uses Phase 1 gates
000010 (code-review) ← Uses Phase 1 TDD certification
000011 (requesting-review) ← Uses Phase 1 gates
```

### Phase 4 (Can run in parallel after Phase 2)
```
000012 (anti-patterns) ← Uses Phase 2 patterns
000013 (E2E skill) ← Independent
```

## Recommended Implementation Order

### Option A: Sequential by Phase (Safest)
1. Complete all Phase 1 (000001-000005) - 10 hours
2. Complete all Phase 2 (000006-000008) - 10 hours
3. Complete all Phase 3 (000009-000011) - 6 hours
4. Complete all Phase 4 (000012-000013) - 7 hours

**Total time**: 33 hours (sequential)

### Option B: Parallel After Phase 1 (Fastest)
1. Complete Phase 1 sequentially (000001-000005) - 10 hours
2. Run Phases 2, 3, 4 in parallel - ~12 hours (if 3 agents)

**Total time**: 22 hours (with parallelization)

### Option C: Critical Path First
1. Phase 1 only (000001-000005) - 10 hours
2. Assess impact, then decide on Phases 2-4

**Total time**: 10 hours (minimum viable improvement)

## Research Foundation

All issues based on 5,733 lines of research:

- `.wrangler/memos/2025-11-20-testing-skills-analysis.md` (2,089 lines)
- `.wrangler/memos/2025-11-20-verification-completion-skills-analysis.md` (1,311 lines)
- `.wrangler/memos/2025-11-20-frontend-testing-research.md` (1,692 lines)
- `.wrangler/memos/2025-11-20-testing-verification-improvement-recommendations.md` (641 lines)

## Issue Quality Standards

All 13 issues follow the same comprehensive format:

### Frontmatter
```yaml
---
id: "NNNNNN"
title: "Brief description"
type: "issue"
status: "open" | "in_progress" | "closed"
priority: "critical" | "high" | "medium"
labels: ["phase-N", "category"]
project: "Testing & Verification Enhancement"
wranglerContext:
  parentTaskId: "000001"
  estimatedEffort: "X hours"
---
```

### Content Structure
1. **Objective** - What we're achieving
2. **Problem** - Why it's needed
3. **Solution** - High-level approach
4. **Implementation Steps** - Step-by-step with exact file paths, line numbers, complete code
5. **Acceptance Criteria** - Comprehensive checklist
6. **Verification** - How to verify correctness
7. **References** - Links to research memos and spec

### Quality Features
- ✅ Copy-paste ready code blocks
- ✅ Framework-agnostic examples
- ✅ Exact file paths and line numbers
- ✅ Complete skill content to add
- ✅ Multiple language examples (npm/pytest/cargo/go)
- ✅ Cross-references to other skills
- ✅ Evidence requirements
- ✅ Mandatory language (MUST, CANNOT, not SHOULD)

## Implementation Notes

### For Phase 1:
- All changes backwards compatible
- No breaking changes to existing skills
- Foundation for all other phases
- Closes most critical gaps

### For Phase 2:
- Addresses legally critical gap (accessibility)
- Provides first-ever frontend testing guidance
- Requires Phase 1 verification-before-completion updates

### For Phase 3:
- Makes all workflows consistent
- Requires Phase 1 gates to reference
- Brings executing-plans to same standard as subagent-driven

### For Phase 4:
- Prevents common mistakes
- Benefits from Phase 2 frontend patterns
- Can be done independently of Phase 3

## Success Metrics

After full implementation (all 13 issues):

**Metric 1: Verification Completeness** (Target: 100%)
- ✓ Agent provides test output before "done" claim
- ✓ Agent provides TDD certification
- ✓ Agent obtains code review approval
- ✓ Agent provides visual evidence for UI work
- ✓ Agent provides accessibility audit for UI work

**Metric 2: TDD Compliance** (Target: 100%)
- ✓ Agent can attest to watching each test fail first
- ✓ Tests written before implementation
- ✓ Code reviewers verify TDD compliance

**Metric 3: Frontend Quality** (Target: 95%+)
- ✓ UI changes include screenshot evidence
- ✓ Accessibility tests passing (0 violations)
- ✓ DevTools console shows no errors

**Metric 4: Early Detection** (Target: >80%)
- ✓ Issues caught during implementation (not at end)
- ✓ Code review happens before merge (not after)

**Metric 5: Consistency** (Target: 100%)
- ✓ All workflows require code review
- ✓ All workflows use same verification gates
- ✓ Frontend and backend testing standards aligned

## Getting Started

### To implement Phase 1 (Critical):

1. Review specification: `../specifications/000001-testing-verification-enhancement.md`
2. Start with issue #000001 (foundation)
3. Follow implementation steps exactly
4. Verify acceptance criteria before marking complete
5. Move to next issue sequentially (000002 → 000003 → 000004 → 000005)

Each issue is self-contained with:
- Exact file locations
- Exact line numbers to modify
- Complete code/text to add
- Clear acceptance criteria
- Verification steps

### To implement Phases 2-4:

After Phase 1 complete:
- Phase 2: Can start immediately (independent)
- Phase 3: Can start immediately (uses Phase 1 gates)
- Phase 4: Can start immediately (independent)

Or run all three in parallel with separate agents/sessions.

## Files Modified by Issues

### New Skills Created (4):
- skills/frontend-testing/visual-regression-testing/SKILL.md (000006)
- skills/frontend-testing/accessibility-verification/SKILL.md (000007)
- skills/frontend-testing/e2e-user-journeys/SKILL.md (000013)

### Skills Updated (8):
- skills/verification-before-completion/SKILL.md (000001, 000002, 000003, 000008)
- skills/test-driven-development/SKILL.md (000004)
- skills/finishing-a-development-branch/SKILL.md (000005)
- skills/executing-plans/SKILL.md (000009)
- skills/code-review/SKILL.md (000010)
- skills/requesting-code-review/SKILL.md (000011)
- skills/testing-anti-patterns/SKILL.md (000012)

### Skills Referenced (no changes):
- skills/using-wrangler/SKILL.md (add new skills to list)
- skills/systematic-debugging/SKILL.md (cross-reference)
- skills/condition-based-waiting/SKILL.md (cross-reference)

## Questions?

Refer to:
- **Specification**: `../specifications/000001-testing-verification-enhancement.md`
- **Research Memos**: `.wrangler/memos/2025-11-20-*.md`
- **Implementation Summary**: `../IMPLEMENTATION-SUMMARY.md`
- **Original Skills**: `../skills/` directory
