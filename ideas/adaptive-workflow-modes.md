# Idea: Adaptive Workflow Modes via `.wrangler/settings.json`

**Status**: Brainstorming
**Created**: 2025-11-18
**Category**: Workflow Optimization, Quality Gates, Performance

---

## Core Concept

Use `.wrangler/settings.json` as a configuration layer to enable different operational modes (e.g., DOUBLE_CHECK, FAST, THOROUGH) that automatically inject quality gates, verification steps, or performance optimizations into workflows through intelligent subagent orchestration and tool call layering.

## Problem Statement

**Current Pain Points**:
1. **One-Size-Fits-All**: Same workflow for quick prototypes vs production code
2. **Manual Quality Gates**: User must remember to request code review, testing, etc.
3. **Latency vs Quality Tradeoff**: No systematic way to optimize for speed or thoroughness
4. **Inconsistent Rigor**: Quality depends on user remembering to ask for it
5. **Context Loss**: Agent doesn't know if "move fast" or "be careful" mode is active

**What if**: We could configure workflow behavior globally, with automatic quality gates based on context?

## Proposed Solution

### Architecture: Mode-Based Workflow Adaptation

**Configuration File**: `.wrangler/settings.json`

```json
{
  "wranglerVersion": "1.1.0",
  "mode": "DOUBLE_CHECK",
  "workflows": {
    "codeModification": {
      "requireCodeReview": true,
      "requireTests": true,
      "parallelVerification": true
    },
    "documentation": {
      "requireCodeReview": false,
      "requireTests": false
    },
    "exploration": {
      "maxDepth": 3,
      "thoroughness": "medium"
    }
  },
  "performance": {
    "maxParallelAgents": 5,
    "enableCaching": true,
    "prefetchStrategies": ["constitution", "recent-files"]
  },
  "qualityGates": {
    "autoReview": {
      "enabled": true,
      "triggers": ["code-change", "spec-creation"],
      "excludePatterns": ["*.md", "*.json"]
    },
    "autoTest": {
      "enabled": true,
      "triggers": ["code-change"],
      "testCommand": "npm test"
    },
    "verification": {
      "enabled": true,
      "triggers": ["task-completion"],
      "checks": ["build", "lint", "type-check"]
    }
  }
}
```

### Operational Modes

#### Mode 1: DOUBLE_CHECK (Maximum Quality)

**Purpose**: Production-grade code, critical features, compliance work

**Behavior**:
- Every code modification triggers automatic code review
- All changes require passing tests
- Verification runs after every task
- Parallel agents review different aspects simultaneously
- Constitutional alignment checked for all features

**Workflow Example**:
```
User: "Implement authentication system"
    ↓
[Mode: DOUBLE_CHECK detected]
    ↓
Main Agent: Creates implementation plan
    ↓
    ├─→ Agent A: Implements feature (TDD)
    ├─→ Agent B: Writes tests (parallel)
    └─→ Agent C: Reviews constitutional alignment (parallel)
    ↓
Main Agent: Waits for all agents to complete
    ↓
[All agents complete]
    ↓
Code Review Agent: Reviews Agent A's implementation
    ↓
[Review passes]
    ↓
Verification Agent: Runs build + tests + lint
    ↓
[Verification passes]
    ↓
Main Agent: Reports completion with verification proof
```

**Latency**: Higher (multiple sequential gates)
**Quality**: Maximum (every change reviewed + verified)

#### Mode 2: BALANCED (Default)

**Purpose**: General development, feature work, standard refactoring

**Behavior**:
- Code review after significant changes (not every line)
- Tests required for new functionality
- Verification on task completion
- Parallel agents for independent work
- Constitutional alignment for new features only

**Workflow Example**:
```
User: "Add new API endpoint"
    ↓
[Mode: BALANCED detected]
    ↓
Main Agent: Implements feature (TDD)
    ↓
[Code complete]
    ↓
Test Agent: Verifies tests pass (parallel with documentation)
Doc Agent: Updates API docs
    ↓
[Both complete]
    ↓
Code Review Agent: Reviews if >100 lines changed
    ↓
Main Agent: Reports completion
```

**Latency**: Moderate (selective gates)
**Quality**: High (key checkpoints)

#### Mode 3: FAST (Speed Priority)

**Purpose**: Prototyping, exploration, spike work, learning

**Behavior**:
- No automatic code review
- Tests optional (run if they exist)
- Minimal verification
- Maximum parallelization
- Skip constitutional alignment (log for later)

**Workflow Example**:
```
User: "Try implementing feature X quickly"
    ↓
[Mode: FAST detected]
    ↓
Main Agent: Implements directly (no subagents)
    ↓
[Code complete]
    ↓
Main Agent: Reports completion (no verification)
```

**Latency**: Minimum (direct execution)
**Quality**: Basic (user responsible for verification)

#### Mode 4: EXPLORATION (Research/Learning)

**Purpose**: Understanding codebase, investigating bugs, research

**Behavior**:
- Read-only operations (no code changes)
- Deep exploration enabled
- Parallel search agents
- Caching optimizations
- Summary reports instead of changes

**Workflow Example**:
```
User: "How does authentication work in this codebase?"
    ↓
[Mode: EXPLORATION detected]
    ↓
    ├─→ Agent A: Search for auth-related files
    ├─→ Agent B: Trace auth flow through code
    └─→ Agent C: Find tests for auth
    ↓
[All agents complete]
    ↓
Main Agent: Synthesizes findings into report
```

**Latency**: Low (read-only, heavily parallelized)
**Quality**: N/A (no code changes)

### Workflow Triggers & Gates

**Trigger System**:

```json
{
  "triggers": {
    "code-change": {
      "patterns": ["**/*.ts", "**/*.js", "**/*.py"],
      "gates": ["code-review", "auto-test"],
      "modes": ["DOUBLE_CHECK", "BALANCED"]
    },
    "spec-creation": {
      "patterns": [".wrangler/specifications/**/*.md"],
      "gates": ["constitutional-alignment"],
      "modes": ["DOUBLE_CHECK", "BALANCED"]
    },
    "task-completion": {
      "patterns": ["*"],
      "gates": ["verification"],
      "modes": ["DOUBLE_CHECK", "BALANCED"]
    },
    "documentation-change": {
      "patterns": ["**/*.md", "!.wrangler/specifications/**"],
      "gates": [],
      "modes": ["DOUBLE_CHECK", "BALANCED", "FAST"]
    }
  }
}
```

**Gate Implementation**:

Each gate is a skill that runs automatically when triggered:

1. **code-review Gate**
   - Skill: `wrangler:code-reviewer`
   - Runs: After code changes
   - Input: Changed files list
   - Output: APPROVE / REQUEST_CHANGES / BLOCK
   - Action: If not APPROVE, halt and report issues

2. **auto-test Gate**
   - Skill: `wrangler:verification-before-completion`
   - Runs: After code changes
   - Input: Test command from settings.json
   - Output: PASS / FAIL + details
   - Action: If FAIL, halt and report failures

3. **constitutional-alignment Gate**
   - Skill: `wrangler:check-constitutional-alignment`
   - Runs: After spec creation or feature implementation
   - Input: Specification or feature description
   - Output: ✅ APPROVE / ⚠️ REVISE / ❌ REJECT
   - Action: If REJECT, halt and explain misalignment

4. **verification Gate**
   - Skill: `wrangler:verification-before-completion`
   - Runs: After task completion
   - Input: Verification commands (build, lint, type-check)
   - Output: Success + evidence OR failure + details
   - Action: If failure, report and offer to fix

### Performance Optimizations

#### Optimization 1: Intelligent Parallelization

**Strategy**: Identify independent work units and dispatch to parallel agents

**Example**:
```javascript
// Analyze task dependencies
const task = "Implement user authentication + update docs + write tests";

// Dependency graph
const graph = {
  "implement-auth": { deps: [] },
  "write-tests": { deps: ["implement-auth"] },  // Needs code first
  "update-docs": { deps: [] }                   // Independent
};

// Execution plan
parallel([
  spawn("implement-auth"),
  spawn("update-docs")      // Run in parallel
]).then(() => {
  spawn("write-tests")      // Run after implement-auth completes
});
```

**Latency Reduction**: 40-60% for tasks with independent components

#### Optimization 2: Prefetching & Caching

**Strategy**: Predict likely needed files and load proactively

```json
{
  "prefetchStrategies": {
    "constitution": {
      "when": "session-start",
      "files": [".wrangler/governance/CONSTITUTION.md"],
      "cache": true
    },
    "recent-files": {
      "when": "session-start",
      "files": "git diff --name-only HEAD~10..HEAD",
      "cache": true,
      "ttl": 3600
    },
    "test-files": {
      "when": "code-change",
      "files": "**/*.test.ts matching changed file",
      "cache": false
    }
  }
}
```

**Latency Reduction**: 20-30% for repeated operations

#### Optimization 3: Lazy Verification

**Strategy**: Run cheap checks first, expensive checks only if needed

```
Code Change Detected
    ↓
Tier 1 (Fast): TypeScript compilation (~1s)
    ↓
  Pass? → Continue
  Fail? → Report immediately (skip remaining)
    ↓
Tier 2 (Medium): Lint check (~2s)
    ↓
  Pass? → Continue
  Fail? → Report immediately
    ↓
Tier 3 (Slow): Full test suite (~10s)
    ↓
  Pass? → Success
  Fail? → Report failures
```

**Latency Reduction**: 50-80% when early tiers catch issues

#### Optimization 4: Streaming Subagent Results

**Strategy**: Don't wait for full subagent completion, stream partial results

```
Main Agent: "Search codebase for authentication logic"
    ↓
Spawn Search Agent
    ↓
Search Agent: Starts streaming results as found
    ├─→ Found: src/auth/login.ts
    ├─→ Found: src/auth/middleware.ts
    └─→ Found: tests/auth.test.ts
    ↓
Main Agent: Begins analysis while search continues
```

**Latency Reduction**: 30-50% for large search/analysis tasks

### Adaptive Workflow Engine

**Core Idea**: Workflow steps auto-adjust based on mode + context

**Implementation**:

```typescript
interface WorkflowStep {
  name: string;
  required: boolean;      // Always run
  conditional?: {         // Run if condition met
    modes: Mode[];
    triggers: Trigger[];
  };
  parallel?: boolean;     // Can run in parallel with other steps
  dependencies: string[]; // Must wait for these steps
}

const codeModificationWorkflow: WorkflowStep[] = [
  {
    name: "plan",
    required: true,
    parallel: false,
    dependencies: []
  },
  {
    name: "implement",
    required: true,
    parallel: false,
    dependencies: ["plan"]
  },
  {
    name: "write-tests",
    required: false,
    conditional: {
      modes: ["DOUBLE_CHECK", "BALANCED"],
      triggers: ["code-change"]
    },
    parallel: true,  // Can run while reviewing
    dependencies: ["implement"]
  },
  {
    name: "code-review",
    required: false,
    conditional: {
      modes: ["DOUBLE_CHECK"],
      triggers: ["code-change"]
    },
    parallel: true,  // Can run while testing
    dependencies: ["implement"]
  },
  {
    name: "verify",
    required: false,
    conditional: {
      modes: ["DOUBLE_CHECK", "BALANCED"],
      triggers: ["task-completion"]
    },
    parallel: false,
    dependencies: ["write-tests", "code-review"]
  }
];

// Execution engine
async function executeWorkflow(
  workflow: WorkflowStep[],
  mode: Mode,
  triggers: Trigger[]
): Promise<Result> {
  const graph = buildDependencyGraph(workflow, mode, triggers);
  const results = await executeDAG(graph, { parallel: true });
  return aggregateResults(results);
}
```

**Benefits**:
- Declarative workflow definition
- Automatic parallelization
- Mode-aware execution
- Easy to add new steps or modes

### Mode Switching

**Manual Mode Switch**:
```
User: "Switch to FAST mode"
  → Updates .wrangler/settings.json: "mode": "FAST"
  → Future tasks use FAST mode

User: "Implement feature X"
  → Executes in FAST mode (no code review, minimal verification)
```

**Temporary Mode Override**:
```
User: "In DOUBLE_CHECK mode: implement authentication"
  → Temporarily uses DOUBLE_CHECK for this task only
  → Returns to configured mode after completion
```

**Context-Aware Mode**:
```
User: "Quick prototype of idea X"
  → Detects "quick prototype" → suggests FAST mode
  → "I'll use FAST mode for rapid prototyping. Switch?"
```

**Per-File Mode**:
```json
{
  "filePatterns": {
    "src/core/**/*.ts": "DOUBLE_CHECK",
    "src/experimental/**/*.ts": "FAST",
    "docs/**/*.md": "BALANCED"
  }
}
```

---

## Low-Latency Strategies

### Strategy 1: Optimistic Execution + Background Verification

**Concept**: Start next step while previous step verifies in background

```
User: "Implement feature + write tests"
    ↓
Main Agent: Implements feature
    ↓
[Code complete]
    ↓
    ├─→ Spawn: Code Review Agent (background)
    └─→ Spawn: Test Writing Agent (foreground)
    ↓
Test Writing Agent: Completes tests
    ↓
Main Agent: Reports "Tests written, code review in progress..."
    ↓
Code Review Agent: Finishes review
    ↓
Main Agent: "Code review complete: APPROVED"
```

**Latency**: User sees tests immediately, review completes async

### Strategy 2: Speculative Execution

**Concept**: Predict likely next task and pre-start agents

```
User: "Implement authentication"
    ↓
Main Agent: Starts implementation
    ↓
[Speculative: Likely to need tests]
    ↓
Spawn Test Agent (paused, waiting for code completion)
    ↓
Main Agent: Completes implementation
    ↓
Test Agent: Unpauses, immediately starts writing tests
```

**Latency**: Eliminates agent spawn delay (~500ms saved)

### Strategy 3: Smart Batching

**Concept**: Batch related operations to reduce round trips

**Bad (Sequential)**:
```
1. Read file A (200ms)
2. Read file B (200ms)
3. Read file C (200ms)
Total: 600ms
```

**Good (Parallel)**:
```
1. Read [A, B, C] in parallel (200ms)
Total: 200ms
```

**Implementation**:
```typescript
// Detect related file reads
const task = "Understand authentication flow";
const relatedFiles = [
  "src/auth/login.ts",
  "src/auth/middleware.ts",
  "src/auth/session.ts"
];

// Batch read
await Promise.all(relatedFiles.map(f => read(f)));
// vs
// for (const f of relatedFiles) await read(f);  // ❌ Slow
```

### Strategy 4: Progressive Enhancement

**Concept**: Deliver quick results, then enhance with more detail

```
User: "What does this codebase do?"
    ↓
Main Agent: Quick scan (README + package.json) → 5s
    ↓
Report: "High-level summary: {overview}"
    ↓
Background Agent: Deep analysis (full codebase) → 30s
    ↓
Report: "Detailed analysis: {comprehensive breakdown}"
```

**Latency**: User gets quick answer, can interrupt if satisfied

### Strategy 5: Cached Decision Trees

**Concept**: Cache common decision patterns to skip re-analysis

```json
{
  "decisionCache": {
    "add-new-feature": {
      "mode": "DOUBLE_CHECK",
      "workflow": "plan → implement → test → review → verify",
      "lastUsed": "2025-11-18T10:00:00Z"
    },
    "fix-typo": {
      "mode": "FAST",
      "workflow": "edit → done",
      "lastUsed": "2025-11-18T09:30:00Z"
    }
  }
}
```

**Latency**: Skip workflow planning step (~1-2s saved)

---

## Mode-Specific Workflows

### DOUBLE_CHECK Mode Workflows

**Workflow: Feature Implementation**
```
1. Plan (required)
   └─→ Constitutional alignment check
2. Implement (required) [TDD]
   ├─→ Write failing test first
   ├─→ Implement minimal code
   └─→ Verify test passes
3. Parallel Quality Gates:
   ├─→ Code Review Agent: Reviews implementation
   ├─→ Test Agent: Expands test coverage
   └─→ Documentation Agent: Updates docs
4. Verification (required)
   ├─→ Build check
   ├─→ Lint check
   ├─→ Type check
   └─→ Full test suite
5. Report (required)
   └─→ Evidence-based completion report
```

**Workflow: Bug Fix**
```
1. Diagnose (required)
   └─→ Systematic debugging skill
2. Root Cause Analysis (required)
   └─→ Identify exact failure point
3. Implement Fix (required) [TDD]
   ├─→ Write test reproducing bug
   ├─→ Implement fix
   └─→ Verify bug resolved
4. Regression Check (required)
   └─→ Run full test suite
5. Code Review (required)
   └─→ Verify fix quality
6. Report (required)
   └─→ RCA + fix explanation
```

### BALANCED Mode Workflows

**Workflow: Feature Implementation**
```
1. Plan (required)
2. Implement (required)
3. Test (required for new code, optional for changes)
4. Code Review (conditional: >100 lines changed)
5. Verification (required)
```

### FAST Mode Workflows

**Workflow: Feature Implementation**
```
1. Implement (required)
2. Done
```

### EXPLORATION Mode Workflows

**Workflow: Understand Codebase**
```
1. Parallel Search:
   ├─→ Agent A: Find entry points
   ├─→ Agent B: Map dependencies
   └─→ Agent C: Identify key abstractions
2. Synthesize findings
3. Report
```

---

## Configuration Examples

### Example 1: High-Stakes Production Project

```json
{
  "mode": "DOUBLE_CHECK",
  "workflows": {
    "codeModification": {
      "requireCodeReview": true,
      "requireTests": true,
      "requireConstitutionalAlignment": true,
      "parallelVerification": true,
      "minTestCoverage": 90
    }
  },
  "qualityGates": {
    "autoReview": {
      "enabled": true,
      "triggers": ["code-change", "spec-creation"],
      "reviewers": 2,
      "blockOnFail": true
    },
    "autoTest": {
      "enabled": true,
      "triggers": ["code-change"],
      "testCommand": "npm run test:ci",
      "coverageThreshold": 90
    },
    "security": {
      "enabled": true,
      "checks": ["secret-scan", "dependency-audit"],
      "blockOnFail": true
    }
  },
  "performance": {
    "maxParallelAgents": 10,
    "enableCaching": true,
    "prefetchStrategies": ["constitution", "recent-files", "tests"]
  }
}
```

### Example 2: Rapid Prototyping Project

```json
{
  "mode": "FAST",
  "workflows": {
    "codeModification": {
      "requireCodeReview": false,
      "requireTests": false,
      "parallelVerification": false
    }
  },
  "qualityGates": {
    "autoReview": { "enabled": false },
    "autoTest": { "enabled": false },
    "verification": { "enabled": false }
  },
  "performance": {
    "maxParallelAgents": 3,
    "enableCaching": true,
    "prefetchStrategies": []
  }
}
```

### Example 3: Learning/Research Project

```json
{
  "mode": "EXPLORATION",
  "workflows": {
    "codeModification": {
      "requireConfirmation": true  // Warn before any changes
    }
  },
  "qualityGates": {
    "autoReview": { "enabled": false },
    "autoTest": { "enabled": false }
  },
  "performance": {
    "maxParallelAgents": 5,
    "enableCaching": true,
    "prefetchStrategies": ["recent-files"],
    "explorationDepth": "deep"
  }
}
```

---

## Benefits

### Latency Optimization
- **Parallelization**: 40-60% faster for multi-step tasks
- **Caching**: 20-30% faster for repeated operations
- **Lazy Verification**: 50-80% faster when early checks catch issues
- **Streaming**: 30-50% faster for search/analysis tasks

### Quality Assurance
- **Automatic Gates**: Never forget code review or tests
- **Mode-Appropriate**: FAST mode for prototypes, DOUBLE_CHECK for production
- **Constitutional Compliance**: Automatic alignment checking
- **Evidence-Based**: Verification required before claiming completion

### User Experience
- **Explicit Control**: User chooses speed vs quality tradeoff
- **Context Awareness**: System suggests appropriate mode
- **Progressive Results**: Quick results, enhanced later
- **Transparent**: Clear indication of which gates are active

---

## Implementation Phases

### Phase 1: Settings Schema + Mode Detection (v1.2.0)
- Define settings.json schema
- Implement mode detection
- Add mode display to session start
- Manual mode switching

### Phase 2: Basic Quality Gates (v1.3.0)
- Implement code-review gate
- Implement auto-test gate
- Implement verification gate
- Trigger system for gates

### Phase 3: Parallel Workflow Engine (v1.4.0)
- Dependency graph builder
- DAG execution engine
- Parallel agent orchestration
- Streaming results

### Phase 4: Performance Optimizations (v1.5.0)
- Prefetching system
- Caching layer
- Lazy verification
- Smart batching

### Phase 5: Advanced Modes (v2.0.0)
- Per-file mode configuration
- Context-aware mode switching
- Speculative execution
- Learning from user patterns

---

## Success Metrics

**Performance**:
- Average task latency by mode
- Parallelization efficiency (actual vs theoretical speedup)
- Cache hit rate
- Time saved via prefetching

**Quality**:
- % of tasks with all gates passed
- Code review approval rate
- Test pass rate
- Verification failure rate

**Adoption**:
- Mode distribution (% users in each mode)
- Mode switches per session
- Custom gate configuration adoption

---

## Related Ideas

- **Adaptive Learning**: System learns optimal mode for task types
- **Workflow Marketplace**: Share custom workflow configurations
- **Mode Recommendations**: AI suggests mode based on task description
- **Quality Metrics**: Track quality over time by mode

---

## Next Steps

1. **Design Settings Schema**: Finalize JSON structure
2. **Prototype Mode Detection**: Implement in session hook
3. **Build Workflow Engine**: DAG execution + parallelization
4. **Test Performance**: Benchmark latency improvements
5. **User Feedback**: Iterate on mode definitions