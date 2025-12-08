---
id: SPEC-000005
title: >-
  Create /validate-session-adherence command for skill/workflow compliance
  checking
type: specification
status: open
priority: high
labels:
  - commands
  - quality-assurance
  - compliance
  - documentation
createdAt: '2025-11-24T02:51:57.274Z'
updatedAt: '2025-11-24T02:51:57.274Z'
---
## Overview

Create a new slash command `/wrangler:validate-session-adherence` that analyzes the preceding conversation to verify whether:
1. Appropriate skills were invoked when they should have been
2. Skills that were invoked followed their documented workflows correctly
3. Subagents were used when specified by workflows
4. Required tool calls were made per workflow steps
5. Evidence/verification requirements were met

## User Need

User wants to validate that I (the AI agent) actually followed wrangler's intended workflows and skill guidelines during a session, not just check for missing capabilities. This is about **compliance auditing** vs **gap analysis**.

## Requirements

### Command Interface

**Command**: `/wrangler:validate-session-adherence`

**Optional parameter**: User can express specific suspicions/concerns to focus the analysis

**Example usages**:
- `/wrangler:validate-session-adherence` (general audit)
- `/wrangler:validate-session-adherence I don't think TDD was actually followed`
- `/wrangler:validate-session-adherence Did the implement skill use subagents correctly?`

### Analysis Scope

The command should analyze:

1. **Skill Invocation Compliance**
   - Which skills SHOULD have been invoked based on the task?
   - Were they actually invoked?
   - If not, why not?

2. **Workflow Step Compliance**
   - For skills that were invoked, did they follow all required steps?
   - Were mandatory tool calls made?
   - Were subagents dispatched when required?
   - Was evidence collected when required?

3. **TDD Compliance** (special focus)
   - Were tests written FIRST?
   - Was RED phase verified (test failed)?
   - Was GREEN phase verified (test passed)?
   - Was output actually shown or just claimed?

4. **Verification Compliance**
   - Were verification steps completed?
   - Was evidence provided or just claimed?
   - Were all tests run before completion claims?

5. **Subagent Usage**
   - Were subagents used when workflows specified them?
   - Were parallel agents dispatched when possible?
   - Were agent results actually used?

### Documentation Sources

The command must reference and validate against:

1. **Skill definitions**: `skills/**\/SKILL.md` files
2. **Workflow documentation**: TBD - need to create `docs/workflows.md`
3. **Verification requirements**: TBD - need to create `docs/verification-requirements.md`
4. **TDD guidelines**: Already in `skills/testing/test-driven-development/SKILL.md`

### Output Format

The command should produce a structured compliance report:

```markdown
# SESSION ADHERENCE VALIDATION REPORT

## Summary
- **Overall Compliance**: PASS / PARTIAL / FAIL
- **Skills Analyzed**: {count}
- **Violations Found**: {count}
- **Severity**: LOW / MEDIUM / HIGH / CRITICAL

## Conversation Analysis
- **Messages Analyzed**: {range}
- **Tasks Identified**: {list}
- **Skills Expected**: {list}
- **Skills Actually Used**: {list}

## Compliance Findings

### {Skill Name 1}
- **Status**: COMPLIANT / VIOLATED
- **Expected Workflow**: {summary}
- **Actual Execution**: {what happened}
- **Issues**:
  - [CRITICAL/HIGH/MEDIUM/LOW] {specific violation}
  - [CRITICAL/HIGH/MEDIUM/LOW] {specific violation}
- **Evidence**: {references to conversation messages}

### {Skill Name 2}
... (repeat for each skill)

## TDD Compliance Check
- **Tests Written First**: YES / NO / PARTIAL
- **RED Phase Evidence**: PROVIDED / MISSING / INSUFFICIENT
- **GREEN Phase Evidence**: PROVIDED / MISSING / INSUFFICIENT
- **Violations**: {list if any}

## Verification Compliance
- **Completion Claims**: {count}
- **Evidence Provided**: {count}
- **Missing Evidence**: {list}

## Recommendations
1. {Specific action to improve compliance}
2. {Specific action to improve compliance}
...

## Conversation References
- Message #{N}: {violation description}
- Message #{M}: {violation description}
...
```

## Implementation Tasks

### Phase 1: Documentation (Prerequisites)
1. Create `docs/workflows.md` - Document all major workflows
   - TDD workflow
   - Code review workflow
   - Verification workflow
   - Subagent dispatch workflow
   - Implementation workflow

2. Create `docs/verification-requirements.md` - What evidence is required
   - Test execution evidence
   - Build output evidence
   - Code review evidence
   - Constitutional alignment evidence

3. Create `docs/skill-invocation-patterns.md` - When skills should auto-trigger
   - Task type → skill mapping
   - Keyword → skill mapping
   - Context → skill mapping

### Phase 2: Command Implementation
1. Create `commands/validate-session-adherence.md`
2. Implement conversation parsing logic (in prompt)
3. Implement skill matching logic (detect which skills should have run)
4. Implement workflow step validation (check if steps were followed)
5. Implement evidence verification (check if proof was provided)
6. Implement report generation

### Phase 3: Testing
1. Test with historical session where TDD was violated
2. Test with session where skills were skipped
3. Test with session where subagents weren't used
4. Test with session where everything was compliant (should pass)

### Phase 4: Integration
1. Add to wrangler command list
2. Update CLAUDE.md with command documentation
3. Add to README as quality assurance tool

## Acceptance Criteria

- [ ] Command can be invoked with `/wrangler:validate-session-adherence`
- [ ] Command accepts optional user suspicion parameter
- [ ] Command analyzes last 30-50 messages of conversation
- [ ] Command validates against skill definitions
- [ ] Command validates against workflow docs
- [ ] Command detects TDD violations
- [ ] Command detects missing evidence
- [ ] Command detects skipped subagent usage
- [ ] Command produces structured compliance report
- [ ] Report includes specific message references
- [ ] Report includes severity ratings
- [ ] Report includes actionable recommendations
- [ ] All documentation prerequisites created

## Success Metrics

- User can quickly validate whether wrangler guidelines were followed
- Violations are clearly identified with evidence
- User can use this for "trust but verify" workflow
- False positives are minimal
- Report is actionable

## Related Work

- `/wrangler:analyze-session-gaps` - Identifies missing capabilities
- This command - Validates adherence to existing capabilities
