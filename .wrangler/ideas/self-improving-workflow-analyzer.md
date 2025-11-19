# Idea: Self-Improving Workflow Analyzer

**Status**: Brainstorming
**Created**: 2025-11-18
**Category**: Meta-Improvement, Workflow Evolution, Learning System

---

## Core Concept

Create a `/analyze-session-gaps` command that analyzes the current conversation history to identify workflow failures, skill gaps, or process regressions, then automatically implements improvements to wrangler's skills and workflows to prevent recurrence. This creates a self-improving feedback loop where every user frustration becomes a permanent fix.

## Problem Statement

**Current Pain Points**:

1. **Repeated Failures**
   - Same problems occur across sessions
   - "Agent didn't run tests again" (recurring issue)
   - "Claimed it was done but left TODOs" (recurring issue)
   - "Said production ready but didn't verify" (recurring issue)
   - No systematic way to prevent recurrence

2. **Manual Workflow Evolution**
   - User identifies problem → tells maintainer → maintainer creates skill
   - Slow feedback loop (days/weeks)
   - Relies on user remembering to report issues
   - Many issues never get fixed

3. **Lost Context**
   - Conversation reveals workflow failure
   - Failure gets solved for current session
   - Next session: same failure happens again
   - No institutional memory

4. **Skill Gap Blindness**
   - Hard to know which skills are missing
   - Hard to know which skills need improvement
   - Hard to know which workflows are broken
   - Reactive (wait for problems) vs proactive (prevent them)

**What if**: Every user frustration automatically improved the system for everyone?

## Proposed Solution

### Architecture: Session Analysis → Automated Improvement

```
User runs: /analyze-session-gaps "description of problem"
    ↓
┌─────────────────────────────────────────────────────┐
│ Phase 1: Session History Analysis                   │
│                                                      │
│  1. Load conversation history                       │
│  2. Identify where workflow failed                  │
│  3. Trace through skills/commands used              │
│  4. Detect what SHOULD have happened                │
│  5. Identify root cause of gap                      │
└─────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────┐
│ Phase 2: Gap Classification                         │
│                                                      │
│  Classify gap as:                                   │
│  - Missing Skill (no skill exists for this)         │
│  - Broken Skill (skill exists but not working)      │
│  - Skill Not Invoked (skill exists but not used)    │
│  - Workflow Gap (skills exist but not connected)    │
│  - Prompt Gap (skill exists but prompt unclear)     │
│  - Verification Gap (no check to prevent issue)     │
└─────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────┐
│ Phase 3: Root Cause Analysis                        │
│                                                      │
│  Analyze:                                           │
│  - What was user's expectation?                     │
│  - What actually happened?                          │
│  - Why did the gap occur?                           │
│  - Which skill/workflow should have prevented it?   │
│  - What structural change would prevent recurrence? │
└─────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────┐
│ Phase 4: Solution Design                            │
│                                                      │
│  Design fix:                                        │
│  - New skill to create?                             │
│  - Existing skill to update?                        │
│  - Workflow wrapper to add?                         │
│  - Verification gate to enforce?                    │
│  - Constitutional principle to add?                 │
└─────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────┐
│ Phase 5: Automated Implementation                   │
│                                                      │
│  Spawn implementation subagent:                     │
│  1. Create/update skill file                        │
│  2. Write tests for new skill                       │
│  3. Update relevant workflows                       │
│  4. Update documentation                            │
│  5. Create issue for tracking                       │
└─────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────┐
│ Phase 6: Verification                               │
│                                                      │
│  Test the fix:                                      │
│  1. Replay session scenario with new skill          │
│  2. Verify gap would not recur                      │
│  3. Run skill tests                                 │
│  4. Update metrics                                  │
└─────────────────────────────────────────────────────┘
    ↓
User sees: "Gap fixed! New skill created: {skill-name}"
           "Future sessions will not have this problem."
```

### Command: `/analyze-session-gaps`

**Usage**: `/analyze-session-gaps "description of problem"`

**Example 1: Test Verification Gap**
```
User: /analyze-session-gaps "Agent told me it fixed the issue and everything
is good to go, only for me to find out there's a major bug when I test the
feature and that the agent didn't run the tests again"

[Session Analysis Agent spawns]

📊 SESSION GAP ANALYSIS

Problem Identified: Agent claimed completion without running tests

Session Analysis:
- Message #15: User requested "Fix the login bug"
- Message #20: Agent said "Fixed! All tests pass."
- Message #25: User reports "Tests are actually failing"

Workflow Trace:
1. User requested bug fix
2. Agent modified src/auth/login.ts
3. Agent CLAIMED tests pass
4. Agent did NOT invoke verification-before-completion skill
5. Agent did NOT run npm test
6. Gap: No architectural enforcement of test requirement

Root Cause: VERIFICATION_GAP
- Missing: Mandatory test verification before claiming completion
- Should have: Workflow wrapper that FORCES test execution

Gap Classification:
- Type: Workflow Gap
- Severity: HIGH (causes user frustration, bugs in production)
- Frequency: RECURRING (happened 3 times in last 10 sessions)
- Impact: User must manually verify all agent claims

Proposed Solution:
CREATE: Universal Workflow Wrapper (from ideas/universal-workflow-wrapper.md)
- Wrap every completion with test verification subagent
- Block completion if tests not run
- Collect evidence of test execution
- Report discrepancies between claims and reality

Alternative Solutions Considered:
1. Update existing skills to emphasize testing (REJECTED: too easy to ignore)
2. Add reminder prompts (REJECTED: prompt engineering unreliable)
3. Constitutional principle about testing (REJECTED: not enforced)
4. Architectural enforcement via wrapper (APPROVED: can't be skipped)

Implementation Plan:
Phase 1: Create test-verification-enforcer skill
Phase 2: Integrate into workflow wrapper
Phase 3: Test with current session scenario
Phase 4: Deploy to prevent recurrence

Estimated Effort: 2-3 hours
Constitutional Alignment: ✅ APPROVED (Evidence over Claims principle)

Spawn implementation subagent? (y/n)
```

**Example 2: Skill Invocation Gap**
```
User: /analyze-session-gaps "Agent implemented a feature but didn't check
if it aligned with our constitution. We have a skill for that but it
wasn't used."

[Session Analysis Agent spawns]

📊 SESSION GAP ANALYSIS

Problem Identified: Constitutional alignment check not performed

Session Analysis:
- Message #8: User requested "Add caching layer"
- Message #15: Agent implemented Redis caching (300+ lines)
- Message #20: User asked "Does this align with our simplicity principle?"
- Message #22: Agent: "Good question, let me check..."
- Gap: Should have checked BEFORE implementation

Workflow Trace:
1. User requested feature
2. Agent implemented directly
3. Agent did NOT invoke check-constitutional-alignment skill
4. Skill exists: skills/governance/check-constitutional-alignment/SKILL.md
5. Gap: Skill not automatically triggered

Root Cause: SKILL_NOT_INVOKED
- Exists: check-constitutional-alignment skill
- Problem: Not triggered automatically for new features
- Should have: Automatic trigger when implementing features

Gap Classification:
- Type: Workflow Gap (trigger missing)
- Severity: MEDIUM (violates constitution, but caught by user)
- Frequency: OCCASIONAL (happened 2 times in last 20 sessions)
- Impact: Features implemented that violate principles

Proposed Solution:
UPDATE: Workflow wrapper to auto-trigger constitutional check
- When: Code changes detected + new feature added
- Check: Run check-constitutional-alignment skill automatically
- Block: If alignment check fails, block completion
- Report: Include alignment assessment in completion report

Implementation Plan:
Phase 1: Add feature detection to code-change-detector
Phase 2: Auto-trigger constitutional reviewer subagent
Phase 3: Integrate into workflow wrapper
Phase 4: Test with current session scenario

Estimated Effort: 1-2 hours
Constitutional Alignment: ✅ APPROVED (Constitutional Compliance principle)

Spawn implementation subagent? (y/n)
```

**Example 3: Missing Skill**
```
User: /analyze-session-gaps "Agent kept making the same formatting
mistakes across multiple files because there's no skill to check
consistency"

[Session Analysis Agent spawns]

📊 SESSION GAP ANALYSIS

Problem Identified: Inconsistent formatting across files

Session Analysis:
- Message #5: User requested "Refactor auth module"
- Messages #10-30: Agent modified 8 files
- Message #35: User reports inconsistent formatting
  - Some files use tabs, some use spaces
  - Some files use single quotes, some double quotes
  - Inconsistent import ordering
- Gap: No skill to enforce code style consistency

Workflow Trace:
1. User requested refactoring
2. Agent modified multiple files
3. Agent did NOT check formatting consistency
4. No skill exists for this
5. Gap: Missing skill

Root Cause: MISSING_SKILL
- Missing: code-style-consistency-checker skill
- Should have: Skill that verifies consistent formatting
- Integration: Run after multi-file changes

Gap Classification:
- Type: Missing Skill
- Severity: LOW (annoying but not breaking)
- Frequency: RECURRING (happened 5 times in last 15 sessions)
- Impact: Code quality, team friction

Proposed Solution:
CREATE: skills/code-quality/style-consistency-checker/SKILL.md

Skill Requirements:
- Detect: When multiple files modified
- Check: Formatting consistency across files
  - Indentation (tabs vs spaces)
  - Quotes (single vs double)
  - Import ordering
  - Line endings
- Report: Inconsistencies found
- Fix: Offer to auto-fix with tool (prettier, eslint --fix)

Implementation Plan:
Phase 1: Create skill file
Phase 2: Integrate with workflow wrapper
Phase 3: Add tests
Phase 4: Document in governance

Estimated Effort: 2 hours
Constitutional Alignment: ✅ APPROVED (Code Quality principle)

Spawn implementation subagent? (y/n)
```

### Session Analysis Algorithm

```typescript
interface SessionAnalysis {
  // Input
  userDescription: string;
  conversationHistory: Message[];

  // Analysis
  problemIdentified: string;
  sessionTrace: {
    messageId: number;
    summary: string;
    skillsInvoked: string[];
    commandsRun: string[];
  }[];

  // Gap Detection
  gapType: 'MISSING_SKILL' | 'BROKEN_SKILL' | 'SKILL_NOT_INVOKED' |
           'WORKFLOW_GAP' | 'PROMPT_GAP' | 'VERIFICATION_GAP';
  rootCause: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  frequency: 'ONCE' | 'OCCASIONAL' | 'RECURRING' | 'CONSTANT';
  impact: string;

  // Solution
  proposedSolution: {
    type: 'CREATE_SKILL' | 'UPDATE_SKILL' | 'ADD_WORKFLOW' |
          'UPDATE_CONSTITUTION' | 'ADD_VERIFICATION_GATE';
    description: string;
    files: string[];
    estimatedEffort: string;
    constitutionalAlignment: boolean;
  };

  // Alternatives
  alternativesSconsidered: {
    option: string;
    reason: string;
    rejected: boolean;
  }[];
}

async function analyzeSessionGaps(
  userDescription: string
): Promise<SessionAnalysis> {
  // Phase 1: Load conversation history
  const history = await loadConversationHistory();

  // Phase 2: Identify problem location in history
  const problemMessages = identifyProblemMessages(history, userDescription);

  // Phase 3: Trace workflow execution
  const workflowTrace = traceWorkflowExecution(problemMessages);

  // Phase 4: Detect what SHOULD have happened
  const expectedBehavior = detectExpectedBehavior(userDescription);

  // Phase 5: Identify gap
  const gap = identifyGap(workflowTrace, expectedBehavior);

  // Phase 6: Classify gap type
  const gapType = classifyGap(gap);

  // Phase 7: Root cause analysis
  const rootCause = analyzeRootCause(gap, workflowTrace);

  // Phase 8: Design solution
  const solution = designSolution(gapType, rootCause);

  // Phase 9: Validate constitutional alignment
  const aligned = await checkConstitutionalAlignment(solution);

  return {
    problemIdentified: userDescription,
    sessionTrace: workflowTrace,
    gapType,
    rootCause,
    severity: calculateSeverity(gap),
    frequency: estimateFrequency(gap, historicalData),
    impact: describeImpact(gap),
    proposedSolution: solution,
    alternativesConsidered: generateAlternatives(solution),
  };
}
```

### Implementation Subagent Workflow

**Once analysis complete, spawn implementation subagent**:

```markdown
## Implementation Subagent Protocol

You are implementing a fix for a workflow gap identified by session analysis.

### Your Task

Gap Type: {gapType}
Root Cause: {rootCause}
Proposed Solution: {proposedSolution.description}

### Implementation Steps

1. **Create/Update Files**
   Files to modify: {proposedSolution.files}

   For each file:
   - If CREATE_SKILL: Use skill template from skills/meta/writing-skills/
   - If UPDATE_SKILL: Read existing skill, identify section to update
   - If ADD_WORKFLOW: Update workflow wrapper configuration
   - If UPDATE_CONSTITUTION: Add new principle with examples
   - If ADD_VERIFICATION_GATE: Update verification subagents

2. **Write Tests**
   - Create test file for new skill
   - Test: Replay original session scenario
   - Verify: Gap would not recur with new skill
   - Assert: Expected behavior enforced

3. **Update Documentation**
   - Update relevant README files
   - Add to skills reference in docs/
   - Document new workflow in governance

4. **Create Tracking Issue**
   - Use MCP issues_create tool
   - Title: "Fix workflow gap: {problemIdentified}"
   - Description: Analysis + solution + implementation notes
   - Labels: ["workflow-improvement", "auto-generated", "{severity}"]

5. **Verification**
   - Run all wrangler tests
   - Test new skill in isolation
   - Test integration with existing workflows
   - Verify constitutional alignment

### Success Criteria

- ✅ New skill/workflow created and tested
- ✅ Session scenario replayed successfully
- ✅ Gap would not recur
- ✅ Documentation updated
- ✅ Issue created for tracking
- ✅ All tests passing

### Output Format

Report back:
1. Files created/updated (with paths)
2. Test results
3. Issue ID created
4. Verification status
5. Next steps (if any)
```

### Integration with Workflow Wrapper

**Synergy**: This idea complements `ideas/universal-workflow-wrapper.md`

```json
{
  "workflowWrapper": {
    "sessionAnalysis": {
      "enabled": true,
      "autoDetectGaps": true,
      "trackFailurePatterns": true,
      "suggestImprovements": true
    },
    "verificationSubagents": {
      "gapDetector": {
        "enabled": true,
        "triggers": ["task-completion", "user-frustration"],
        "autoAnalyze": false,  // Requires user to run /analyze-session-gaps
        "logPatterns": true    // But always log for future analysis
      }
    }
  }
}
```

**Workflow**:
1. Universal Wrapper detects verification failure
2. Logs failure pattern to `.wrangler/cache/failure-patterns.jsonl`
3. User frustrated, runs `/analyze-session-gaps`
4. Analysis reads failure log + conversation history
5. Identifies root cause, proposes fix
6. User approves, subagent implements
7. Future sessions: gap prevented by new skill/workflow

---

## Benefits

### For Users

1. **Frustration → Permanent Fix**
   - Every complaint becomes a systematic improvement
   - "This happened again" triggers auto-fix
   - No need to remember to report issues

2. **Compound Improvement**
   - Each session makes wrangler better
   - Fewer repeated failures over time
   - System learns from every user

3. **Zero Effort**
   - One command: `/analyze-session-gaps "description"`
   - System does the analysis and implementation
   - User just approves or rejects

### For Wrangler Project

1. **Self-Improving**
   - Automatically evolves based on real usage
   - Closes skill gaps discovered in practice
   - Workflow improvements driven by actual failures

2. **Data-Driven**
   - Track failure patterns
   - Prioritize by frequency and severity
   - Metrics: gap types, resolution rate, recurrence prevention

3. **Institutional Memory**
   - Every fix is permanent
   - Knowledge accumulated over time
   - New users benefit from past sessions' learnings

### For AI Development

1. **Feedback Loop**
   - Fast cycle: problem → analysis → fix → deploy
   - Learn what prompts fail (and fix structurally)
   - Identify prompt engineering limits (need architectural solutions)

2. **Best Practices Extraction**
   - Patterns emerge from many sessions
   - Common gaps become new skills
   - Workflows codify successful patterns

---

## Challenges & Mitigations

### Challenge 1: Analysis Accuracy

**Risk**: Misidentifies root cause, implements wrong fix

**Mitigation**:
- Show analysis to user before implementing
- User approves/rejects/modifies solution
- Track fix success rate (did it prevent recurrence?)
- Learn from rejected analyses

### Challenge 2: Over-Engineering

**Risk**: Creates too many skills for edge cases

**Mitigation**:
- Severity threshold (only fix HIGH/CRITICAL)
- Frequency threshold (only fix RECURRING issues)
- User control (user chooses what to fix)
- Constitutional alignment check (reject if too complex)

### Challenge 3: Conversation Privacy

**Risk**: Users may not want session analysis

**Mitigation**:
- Opt-in (user explicitly runs command)
- Local analysis only (no data sent anywhere)
- User sees full analysis before implementation
- User can redact sensitive parts of history

### Challenge 4: Implementation Quality

**Risk**: Auto-generated fixes might be low quality

**Mitigation**:
- Use TDD (test first, then implement)
- Run full test suite before committing
- Constitutional alignment check required
- Code review by user before merging

### Challenge 5: Skill Bloat

**Risk**: Too many hyper-specific skills

**Mitigation**:
- Consolidate related skills
- Generalize when patterns emerge
- Archive rarely-used skills
- Track skill usage metrics

---

## Implementation Phases

### Phase 1: Analysis Engine (v1.3.0)

**Goal**: Build session analysis capability

- Load conversation history from Claude Code
- Parse user description of problem
- Identify problem messages in history
- Trace workflow execution
- Classify gap type

**Deliverable**: `/analyze-session-gaps` command that produces analysis report

### Phase 2: Solution Design (v1.4.0)

**Goal**: Propose fixes for identified gaps

- Design solution based on gap type
- Generate skill templates
- Check constitutional alignment
- Produce implementation plan

**Deliverable**: Analysis includes proposed solution + implementation plan

### Phase 3: Automated Implementation (v1.5.0)

**Goal**: Spawn subagent to implement fixes

- Create/update skill files
- Write tests
- Update documentation
- Create tracking issues
- Verify fix works

**Deliverable**: One-command gap fixing (analysis + implementation)

### Phase 4: Pattern Learning (v1.6.0)

**Goal**: Learn from multiple sessions

- Track failure patterns across sessions
- Identify recurring gaps
- Suggest proactive improvements
- Prioritize high-impact fixes

**Deliverable**: Proactive gap detection

### Phase 5: Integration with Wrapper (v2.0.0)

**Goal**: Full integration with workflow wrapper

- Auto-detect gaps during execution
- Log failure patterns
- Suggest improvements in real-time
- Self-healing workflow complete

**Deliverable**: Fully autonomous improvement loop

---

## Success Metrics

**Gap Detection**:
- % of user frustrations successfully analyzed
- Accuracy of root cause identification
- Time to analyze session (target: <30s)

**Solution Quality**:
- % of proposed solutions approved by user
- % of implemented fixes that prevent recurrence
- Reduction in repeated failures over time

**System Improvement**:
- Number of gaps fixed per month
- Reduction in workflow failures over time
- Skill coverage improvement (fewer gaps)

**User Satisfaction**:
- % of users who use /analyze-session-gaps
- Feedback on implemented fixes
- Reduction in user frustration reports

---

## Examples

### Example 1: Test Verification Gap → Workflow Wrapper Created

**Input**:
```
/analyze-session-gaps "Agent didn't run tests before saying it was done"
```

**Analysis Output**:
```
Gap Type: VERIFICATION_GAP
Root Cause: No architectural enforcement of test requirement
Severity: HIGH
Frequency: RECURRING (3 times in last 10 sessions)

Proposed Solution: Create test-verification-enforcer subagent
Files to create:
- skills/verification/test-enforcement/SKILL.md
- .wrangler/cache/verification-config.json

Implementation Plan:
1. Create skill that FORCES test execution
2. Integrate into workflow wrapper
3. Block completion if tests not run
4. Collect evidence of test results

Constitutional Alignment: ✅ APPROVED
```

**User**: "y (approve implementation)"

**Implementation Subagent**:
```
✅ Implementation Complete

Created:
- skills/verification/test-enforcement/SKILL.md (245 lines)
- Updated: workflow wrapper to include test enforcer
- Created: tests/skills/test-enforcement.test.ts

Tests: ✅ All passing (5/5)

Issue Created: #000042 "Fix workflow gap: Test verification enforcement"

Verification:
✅ Replayed session scenario - gap no longer occurs
✅ Tests must be run before completion claim
✅ Evidence collected automatically

Next Steps:
- Test in next session with code changes
- Monitor for effectiveness
```

### Example 2: Missing Skill → Style Consistency Checker Created

**Input**:
```
/analyze-session-gaps "Files have inconsistent formatting after refactoring"
```

**Analysis Output**:
```
Gap Type: MISSING_SKILL
Root Cause: No skill to check code style consistency
Severity: MEDIUM
Frequency: RECURRING (5 times in last 15 sessions)

Proposed Solution: Create code-style-consistency-checker skill
Files to create:
- skills/code-quality/style-consistency-checker/SKILL.md

Skill Requirements:
- Check: Indentation, quotes, imports across files
- Fix: Offer to run prettier/eslint --fix
- Trigger: After multi-file modifications

Constitutional Alignment: ✅ APPROVED
```

**User**: "y"

**Implementation Subagent**:
```
✅ Implementation Complete

Created:
- skills/code-quality/style-consistency-checker/SKILL.md (180 lines)
- Created: tests/skills/style-consistency.test.ts

Tests: ✅ All passing (8/8)

Issue Created: #000043 "Add code style consistency checker skill"

Verification:
✅ Detects inconsistent formatting
✅ Offers auto-fix via prettier
✅ Integrates with workflow wrapper

Next Steps:
- Test with real refactoring
- Consider adding to DOUBLE_CHECK mode
```

---

## Related Ideas

- **Universal Workflow Wrapper** (`ideas/universal-workflow-wrapper.md`)
  - Integration: Gap detector logs failures
  - Improvement: Analysis identifies missing verification gates

- **Adaptive Workflow Modes** (`ideas/adaptive-workflow-modes.md`)
  - Integration: Different modes enable different gap detection levels
  - Improvement: Analysis suggests which mode features to add

- **Self-Healing MCP Plugin** (`ideas/self-healing-mcp-plugin.md`)
  - Integration: Same pattern (detect → analyze → fix → PR)
  - Difference: This fixes workflows/skills, that fixes MCP code

---

## Open Questions

1. **Privacy**: How much conversation history to analyze?
   - **Option A**: Full session history
   - **Option B**: User selects relevant messages
   - **Option C**: Last N messages only

2. **Auto-Implementation**: Should fixes auto-apply or require approval?
   - **Option A**: Always require approval (safe)
   - **Option B**: Auto-apply low-risk fixes (fast)
   - **Option C**: User preference in settings

3. **Scope**: What types of gaps to support?
   - **Option A**: Skills only (narrow scope)
   - **Option B**: Skills + workflows (broader)
   - **Option C**: Skills + workflows + constitution (comprehensive)

4. **Historical Analysis**: Should it analyze past sessions?
   - **Option A**: Current session only
   - **Option B**: All sessions for this project
   - **Option C**: All sessions across all projects (aggregate learning)

5. **Sharing Improvements**: Should fixes be contributed upstream?
   - **Option A**: Keep local (user-specific)
   - **Option B**: Suggest to wrangler repo (community benefit)
   - **Option C**: Automatic PR creation (like self-healing MCP)

---

## Next Steps

1. **Prototype**: Build basic session analysis engine
2. **Test**: Analyze real session with known gap
3. **Validate**: Check if root cause correctly identified
4. **Implement**: Create skill/workflow fix
5. **Verify**: Replay scenario, confirm gap prevented
6. **Iterate**: Refine analysis algorithm based on learnings

---

## Implementation Notes

### Accessing Conversation History

```typescript
// How to access Claude Code conversation history?
// Option 1: Via MCP tool (if available)
const history = await getConversationHistory();

// Option 2: Via file system (if logged)
const historyFile = '.claude/conversation-history.jsonl';
const history = await readConversationLog(historyFile);

// Option 3: Via user copy-paste (fallback)
const history = prompt("Paste relevant conversation messages");
```

### Gap Pattern Database

```json
// .wrangler/cache/gap-patterns.json
{
  "patterns": [
    {
      "id": "test-verification-gap",
      "type": "VERIFICATION_GAP",
      "description": "Agent claims tests pass without running them",
      "frequency": 12,
      "severity": "HIGH",
      "lastOccurrence": "2025-11-18T10:30:00Z",
      "solution": "skills/verification/test-enforcement/SKILL.md",
      "status": "FIXED"
    },
    {
      "id": "constitutional-check-missing",
      "type": "SKILL_NOT_INVOKED",
      "description": "Feature implemented without constitutional alignment check",
      "frequency": 5,
      "severity": "MEDIUM",
      "lastOccurrence": "2025-11-17T14:20:00Z",
      "solution": "AUTO_TRIGGER_IN_WORKFLOW",
      "status": "FIXED"
    },
    {
      "id": "incomplete-implementation",
      "type": "MISSING_VERIFICATION",
      "description": "Agent says done but missing implicit requirements",
      "frequency": 8,
      "severity": "HIGH",
      "lastOccurrence": "2025-11-18T11:00:00Z",
      "solution": "skills/verification/user-satisfaction-validator/SKILL.md",
      "status": "PENDING"
    }
  ]
}
```

---

**This idea creates a self-improving feedback loop**: User frustration → Session analysis → Automated fix → Gap prevented forever. Combined with the Universal Workflow Wrapper, this creates a system that learns from every failure and gets better over time.