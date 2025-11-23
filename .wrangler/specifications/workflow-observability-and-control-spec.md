---
id: spec-workflow-observability
title: "Workflow Observability and Control System for Wrangler"
type: specification
status: open
priority: high
labels: [architecture, observability, metrics, workflow-engine]
createdAt: "2025-11-22T00:00:00.000Z"
updatedAt: "2025-11-22T00:00:00.000Z"
wranglerContext:
  agentId: "claude-code"
  estimatedEffort: "2-3 weeks implementation"
---

# Workflow Observability and Control System for Wrangler

## Executive Summary

This specification proposes a comprehensive observability and control system for Wrangler that works entirely within Claude Code's plugin constraints. Instead of building a traditional workflow engine, we leverage LLM orchestration while adding structured instrumentation, metrics collection, loop detection, and data-driven optimization capabilities.

**Key Insight:** Wrangler replaces workflow execution engines (like traditional orchestrators with state machines) with prompt-driven LLM orchestration. However, this paradigm shift creates gaps in observability, control, and debugging. This spec fills those gaps using creative solutions that work within plugin limitations.

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Research Findings](#research-findings)
3. [Proposed Architecture](#proposed-architecture)
4. [Detailed Design](#detailed-design)
5. [Implementation Plan](#implementation-plan)
6. [Success Metrics](#success-metrics)
7. [Future Enhancements](#future-enhancements)

---

## Problem Statement

### The Paradigm Shift

**Traditional Workflow Engines:**
```typescript
// Explicit state machine with full observability
const workflow = new WorkflowEngine();
workflow.step('fetch_data', { timeout: 30s, retries: 3 });
workflow.step('transform', { depends: ['fetch_data'] });
workflow.step('validate', { depends: ['transform'] });
// Engine provides: metrics, DAG visualization, retry logic, timeouts, alerting
```

**Wrangler's LLM Orchestration:**
```markdown
## Workflow
1. Fetch data from API
2. Transform the data
3. Validate results

Follow these steps in order.
```

**What we lose:**
- No automatic step tracking
- No performance metrics per step
- No loop detection
- No automatic retry/timeout
- No execution visualization
- Difficult to debug "what actually happened?"

### Three Core Gaps

#### 1. Code Quality & Maintainability

**Problem:**
- Skills are text-heavy with duplication
- No compile-time validation
- Hard to debug "did the agent follow the skill?"
- Maintainer errors propagate silently

**Pain Points:**
- Announcement format duplicated 49+ times
- TDD workflow repeated across 8 skills with subtle variations
- No way to validate that skill instructions are being followed
- Changes require manual updates across many files

#### 2. Metrics and Observability

**Problem:**
- "Did all workflow steps execute in the right order?"
- "Which steps are slow? Which use too many tokens?"
- "Is my skill actually working or being ignored?"
- No data-driven optimization

**Pain Points:**
- Can't measure skill effectiveness
- Can't identify bottlenecks in multi-step workflows
- Can't track adherence to TDD/verification workflows
- Can't prove ROI of skill improvements

#### 3. Control & Safety

**Problem:**
- Agents can loop indefinitely (e.g., test → fix → test → fix → ...)
- No timeout mechanisms
- No detection of stuck patterns
- No automatic intervention

**Pain Points:**
- Infinite loops waste tokens and time
- Hard to detect when agent is thrashing
- No automatic circuit breakers
- Manual intervention required

---

## Research Findings

### What Claude Code Provides (For Free)

Through investigation of Claude Code's architecture, I've identified these built-in capabilities:

#### 1. Debug Logs (`~/.claude/debug/*.txt`)

**What's Available:**
- Timestamped event logs for every session
- Plugin loading events
- Skill discovery and loading
- MCP server initialization
- Hook execution
- Tool invocation metadata
- Session lifecycle events

**Example:**
```
2025-11-23T02:16:17.939Z [DEBUG] Loaded 35 skills from plugin wrangler
2025-11-23T02:16:18.328Z [DEBUG] Getting matching hook commands for SessionStart
2025-11-23T02:16:18.339Z [DEBUG] Getting matching hook commands for SubagentStart with query: Explore
```

**Limitations:**
- Plain text format (not structured)
- No skill execution tracking (only loading)
- No tool-level timing data
- Hard to query programmatically

#### 2. TodoWrite State (`~/.claude/todos/*.json`)

**What's Available:**
- Per-session JSON files with todo state
- Tracks: content, status (pending/in_progress/completed), id
- Survives across agent lifecycle
- Atomically written (safe concurrent access)

**Example:**
```json
[
  {
    "content": "Determine current issue using issue_current tool",
    "status": "completed",
    "id": "1"
  },
  {
    "content": "Mark current issue as complete",
    "status": "completed",
    "id": "2"
  }
]
```

**Observations:**
- This is essentially a workflow state tracker!
- Status transitions provide step completion events
- Can be parsed for workflow analysis
- Already used by agents for planning

#### 3. Session Environment (`~/.claude/session-env/{session-id}/`)

**What's Available:**
- Per-session directory for ephemeral data
- Persists for session duration
- Can store arbitrary files
- Cleaned up on session end

**Use Cases:**
- Workflow execution logs
- Performance metrics
- Intermediate checkpoints
- Loop detection state

#### 4. History Log (`~/.claude/history.jsonl`)

**What's Available:**
- JSONL file with all user prompts
- Includes: display text, timestamp, project path
- Chronological record of interactions

**Example:**
```json
{"display":"Go get yourself up to speed on the wingman project...","pastedContents":{},"timestamp":1759251056252,"project":"/Users/sam/code/wingman/wingman-mcp-server"}
```

**Use Cases:**
- User intent tracking
- Session correlation
- Usage analytics

### What Plugins Can Do

Based on research of plugin capabilities and existing plugins:

#### 1. Session Hooks

**Capabilities:**
- Execute arbitrary bash scripts on events
- Events: SessionStart, SessionEnd, UserPromptSubmit, SubagentStart
- Can write files, call APIs, launch background processes
- Return values injected into agent context

**Key Insight:** Session hooks are our instrumentation injection points.

#### 2. MCP Tools

**Capabilities:**
- Can be called by agents during workflow execution
- Return structured data (JSON)
- Can write to files, databases, or external APIs
- Fast invocation (<10ms for simple operations)

**Key Insight:** MCP tools can be explicit instrumentation checkpoints.

#### 3. Slash Commands

**Capabilities:**
- User-triggered workflow initiation
- Expand to full prompts
- Can include pre-computed context

**Key Insight:** Entry point for instrumented workflows.

#### 4. Skill System

**Constraints:**
- Skills are markdown files
- Loaded at session start
- Cannot dynamically update during session
- No callback/hook mechanism within skills

**Key Insight:** Skills define workflow structure but can't self-instrument.

---

## Proposed Architecture

### Design Philosophy

**Principles:**
1. **Leverage what exists** - Use Claude Code's built-in state/logs before building new infrastructure
2. **Structured instrumentation over parsing** - Emit structured data, not logs to parse
3. **Opt-in complexity** - Simple skills remain simple; complex workflows opt into observability
4. **Post-execution analysis** - Don't slow down agent during execution; analyze after
5. **Progressive enhancement** - Works without observability; better with it

### Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    LAYER 1: INSTRUMENTATION                  │
│  (How workflows emit observability data during execution)    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Skill        │  │ MCP          │  │ Session      │      │
│  │ Annotations  │  │ Checkpoint   │  │ Hooks        │      │
│  │              │  │ Tools        │  │              │      │
│  │ <!-- wf:... │  │              │  │ Pre/Post     │      │
│  │ -->          │  │ wf_step()    │  │ Instrumented │      │
│  │              │  │ wf_metric()  │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  LAYER 2: DATA COLLECTION                    │
│      (Where instrumentation data is captured/stored)         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Session Execution Log                                │  │
│  │  ~/.claude/session-env/{session-id}/workflow.jsonl    │  │
│  │                                                        │  │
│  │  {"event":"step_start","step":"fetch_data","ts":...}  │  │
│  │  {"event":"step_end","step":"fetch_data","dur":150}   │  │
│  │  {"event":"tool_call","tool":"Read","tokens":234}     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  TodoWrite State (already exists)                     │  │
│  │  ~/.claude/todos/{session-id}-agent-*.json            │  │
│  │                                                        │  │
│  │  [{"content":"...", "status":"completed", "id":"1"}]  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Loop Detection State                                 │  │
│  │  ~/.claude/session-env/{session-id}/loop-detector.json│  │
│  │                                                        │  │
│  │  {"pattern":"test-fix","count":5,"first_seen":...}    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    LAYER 3: ANALYSIS                         │
│        (Post-execution insights and optimization)            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Workflow     │  │ Performance  │  │ Loop         │      │
│  │ Compliance   │  │ Profiler     │  │ Detector     │      │
│  │              │  │              │  │              │      │
│  │ "Did TDD     │  │ Step         │  │ Pattern      │      │
│  │  happen?"    │  │ timings      │  │ recognition  │      │
│  │              │  │              │  │              │      │
│  │ "All steps?" │  │ Token usage  │  │ Auto-abort   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │ Dashboard / CLI                                     │     │
│  │                                                     │     │
│  │ $ wrangler workflow report {session-id}            │     │
│  │                                                     │     │
│  │ Workflow: test-driven-development                  │     │
│  │ Status: ✅ PASSED (all steps completed)            │     │
│  │ Duration: 2m 34s                                   │     │
│  │ Steps:                                             │     │
│  │   1. [RED] Write failing test      - 0:34 (567 tok)│     │
│  │   2. [GREEN] Implement feature     - 1:12 (1.2k tok│     │
│  │   3. [REFACTOR] Clean up           - 0:48 (389 tok)│     │
│  │                                                     │     │
│  │ Bottleneck: Step 2 (47% of time)                   │     │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Detailed Design

### Layer 1: Instrumentation

#### A. Skill Annotations (Invisible Metadata)

Skills can embed HTML comments that don't render but provide machine-readable workflow structure:

**Example (TDD Skill):**
```markdown
# Test-Driven Development

<!-- workflow:tdd -->
<!-- workflow:step:red -->
## Phase 1: RED - Write Failing Test

Write the test first...

<!-- workflow:checkpoint:red -->
<!-- workflow:step:green -->
## Phase 2: GREEN - Make It Pass

Implement minimum code...

<!-- workflow:checkpoint:green -->
<!-- workflow:step:refactor -->
## Phase 3: REFACTOR - Improve Code

Clean up...

<!-- workflow:checkpoint:refactor -->
<!-- workflow:end -->
```

**Schema:**
```html
<!-- workflow:{workflow-id} -->              - Start workflow definition
<!-- workflow:step:{step-id} -->             - Mark step boundary
<!-- workflow:checkpoint:{step-id} -->       - Expected checkpoint location
<!-- workflow:expect_tool:{tool-name} -->    - Expected tool usage
<!-- workflow:loop_warning:{pattern} -->     - Known loop risk pattern
<!-- workflow:end -->                        - End workflow definition
```

**Benefits:**
- Zero visual impact (invisible to agent)
- Parseable for analysis
- Defines expected execution graph
- Can be extracted by tooling

**Detection:**
Session hooks can extract workflow annotations from loaded skills and store expected structure for comparison against actual execution.

#### B. MCP Checkpoint Tools

New MCP tools for explicit workflow tracking:

**Tool: `workflow_step_start`**
```typescript
{
  name: "workflow_step_start",
  params: {
    workflow_id: string,  // e.g., "tdd"
    step_id: string,      // e.g., "red"
    metadata?: object     // Optional context
  }
}
```

**Tool: `workflow_step_end`**
```typescript
{
  name: "workflow_step_end",
  params: {
    workflow_id: string,
    step_id: string,
    outcome: "success" | "failure" | "skipped",
    metrics?: {
      tools_called?: string[],
      files_modified?: string[],
      tests_run?: number
    }
  }
}
```

**Tool: `workflow_metric`**
```typescript
{
  name: "workflow_metric",
  params: {
    metric_name: string,  // e.g., "test_count", "files_changed"
    value: number | string,
    tags?: Record<string, string>
  }
}
```

**Usage in Skills:**
```markdown
## Phase 1: RED - Write Failing Test

**Before starting:** Call `workflow_step_start(workflow_id="tdd", step_id="red")`

1. Write test
2. Run test (expect failure)

**After completion:** Call `workflow_step_end(workflow_id="tdd", step_id="red", outcome="success")`
```

**Benefits:**
- Explicit checkpoints
- Structured data emission
- Agent-controlled (follows skill instructions)
- Enables real-time tracking

**Trade-off:** Adds tool calls to workflow (slight overhead, but ~5-10ms each)

#### C. Session Hook Instrumentation

**SessionStart Hook:**
```bash
#!/bin/bash
# hooks/session-start-observability.sh

SESSION_ID="$AGENT_ID"
WORKFLOW_LOG="$HOME/.claude/session-env/$SESSION_ID/workflow.jsonl"
LOOP_STATE="$HOME/.claude/session-env/$SESSION_ID/loop-detector.json"

# Initialize workflow log
mkdir -p "$(dirname "$WORKFLOW_LOG")"
echo "{\"event\":\"session_start\",\"ts\":$(date +%s)}" >> "$WORKFLOW_LOG"

# Initialize loop detector
echo "{\"patterns\":{}}" > "$LOOP_STATE"

# Extract workflow annotations from loaded skills
python3 ~/.claude/wrangler-observability/extract-workflow-schemas.py \
  --skills-dir "$WRANGLER_SKILLS_DIR" \
  --output "$HOME/.claude/session-env/$SESSION_ID/expected-workflows.json"
```

**UserPromptSubmit Hook:**
```bash
#!/bin/bash
# hooks/user-prompt-observability.sh

SESSION_ID="$AGENT_ID"
WORKFLOW_LOG="$HOME/.claude/session-env/$SESSION_ID/workflow.jsonl"

# Log user prompt event
echo "{\"event\":\"user_prompt\",\"ts\":$(date +%s),\"prompt\":\"$USER_PROMPT\"}" >> "$WORKFLOW_LOG"

# Check for loop patterns
python3 ~/.claude/wrangler-observability/detect-loops.py \
  --session-id "$SESSION_ID" \
  --prompt "$USER_PROMPT"
```

**SessionEnd Hook:**
```bash
#!/bin/bash
# hooks/session-end-observability.sh

SESSION_ID="$AGENT_ID"

# Generate workflow report
python3 ~/.claude/wrangler-observability/generate-report.py \
  --session-id "$SESSION_ID" \
  --output "$HOME/.claude/session-env/$SESSION_ID/workflow-report.md"

# Archive to permanent storage (optional)
cp "$HOME/.claude/session-env/$SESSION_ID/workflow.jsonl" \
   "$HOME/.claude/workflow-archives/$SESSION_ID.jsonl"
```

### Layer 2: Data Collection

#### A. Workflow Execution Log Format

**File:** `~/.claude/session-env/{session-id}/workflow.jsonl`

**Schema:**
```typescript
type WorkflowEvent =
  | { event: "session_start", ts: number }
  | { event: "session_end", ts: number, duration_sec: number }
  | { event: "user_prompt", ts: number, prompt: string }
  | { event: "skill_loaded", ts: number, skill_name: string, workflow_id?: string }
  | { event: "step_start", ts: number, workflow_id: string, step_id: string, metadata?: object }
  | { event: "step_end", ts: number, workflow_id: string, step_id: string, outcome: string, duration_ms: number, metrics?: object }
  | { event: "tool_call", ts: number, tool_name: string, params?: object, duration_ms?: number }
  | { event: "loop_detected", ts: number, pattern: string, count: number, first_seen: number }
  | { event: "metric", ts: number, name: string, value: any, tags?: object };
```

**Benefits:**
- JSONL = streamable, appendable, parseable
- One line per event = easy to grep/tail
- Structured = machine-readable
- Timestamped = correlation and timelines

#### B. Loop Detection State

**File:** `~/.claude/session-env/{session-id}/loop-detector.json`

**Schema:**
```typescript
interface LoopDetectorState {
  patterns: {
    [pattern_id: string]: {
      signature: string;      // Hash of action sequence
      count: number;          // How many times seen
      first_seen: number;     // Timestamp of first occurrence
      last_seen: number;      // Timestamp of last occurrence
      actions: string[];      // Action sequence (e.g., ["test", "fix", "test"])
      threshold: number;      // Max allowed repetitions
      status: "ok" | "warning" | "critical";
    }
  };
  current_sequence: string[];  // Recent actions for pattern matching
  window_size: number;         // How many recent actions to track
}
```

**Detection Algorithm:**
```python
def detect_loop(state, new_action):
    # Add to sliding window
    state['current_sequence'].append(new_action)
    if len(state['current_sequence']) > state['window_size']:
        state['current_sequence'].pop(0)

    # Check for repeating subsequences
    for window_len in range(2, len(state['current_sequence']) // 2 + 1):
        pattern = state['current_sequence'][-window_len:]
        prev_pattern = state['current_sequence'][-2*window_len:-window_len]

        if pattern == prev_pattern:
            signature = hash(tuple(pattern))

            if signature not in state['patterns']:
                state['patterns'][signature] = {
                    'signature': signature,
                    'count': 1,
                    'first_seen': time.time(),
                    'actions': pattern,
                    'threshold': 3,  # Default: warn after 3 reps
                    'status': 'ok'
                }
            else:
                state['patterns'][signature]['count'] += 1
                state['patterns'][signature]['last_seen'] = time.time()

                # Update status based on threshold
                if state['patterns'][signature]['count'] >= 5:
                    state['patterns'][signature]['status'] = 'critical'
                    emit_warning(pattern, state['patterns'][signature])
                elif state['patterns'][signature]['count'] >= 3:
                    state['patterns'][signature]['status'] = 'warning'

    return state
```

**Loop Pattern Examples:**

1. **Test-Fix Loop:**
   ```
   Actions: [run_test, edit_file, run_test, edit_file, run_test, edit_file]
   Pattern: ["run_test", "edit_file"] × 3
   Status: WARNING after 3, CRITICAL after 5
   ```

2. **Search-Read Loop:**
   ```
   Actions: [grep, read, grep, read, grep, read]
   Pattern: ["grep", "read"] × 3
   Status: WARNING (probably searching for something not there)
   ```

3. **Build-Fix Loop:**
   ```
   Actions: [build, edit, build, edit, build, edit]
   Pattern: ["build", "edit"] × 3
   Status: WARNING (build errors not resolving)
   ```

**Intervention Strategies:**

When loop detected:
```markdown
<system-reminder>
⚠️ LOOP DETECTED

Pattern: [run_test, edit_file] repeated 5 times

This suggests the test is not passing despite multiple attempts.

Recommended actions:
1. Use systematic-debugging skill to investigate root cause
2. Add diagnostic logging to understand what's failing
3. Check if test expectations are correct
4. Consider asking user for clarification

Do NOT continue the same pattern. Break the loop.
</system-reminder>
```

### Layer 3: Analysis & Reporting

#### A. Workflow Compliance Checker

**Purpose:** Verify that executed workflow matches expected skill structure

**Algorithm:**
```python
def check_workflow_compliance(session_id):
    # Load expected workflow structure from skill annotations
    expected = load_json(f"~/.claude/session-env/{session_id}/expected-workflows.json")

    # Load actual execution events
    actual = parse_jsonl(f"~/.claude/session-env/{session_id}/workflow.jsonl")

    # Extract step sequence
    actual_steps = [
        e['step_id']
        for e in actual
        if e['event'] == 'step_start'
    ]

    expected_steps = expected['tdd']['steps']  # e.g., ['red', 'green', 'refactor']

    # Check compliance
    results = {
        'workflow_id': 'tdd',
        'expected_steps': expected_steps,
        'actual_steps': actual_steps,
        'compliance': 'PASS',
        'issues': []
    }

    # Check: All expected steps executed?
    missing_steps = set(expected_steps) - set(actual_steps)
    if missing_steps:
        results['compliance'] = 'FAIL'
        results['issues'].append({
            'type': 'missing_steps',
            'steps': list(missing_steps),
            'severity': 'error'
        })

    # Check: Steps in correct order?
    if actual_steps != expected_steps:
        results['compliance'] = 'WARNING'
        results['issues'].append({
            'type': 'out_of_order',
            'expected_order': expected_steps,
            'actual_order': actual_steps,
            'severity': 'warning'
        })

    # Check: Expected tools called?
    for step in expected['tdd']['steps']:
        if 'expected_tools' in expected['tdd'][step]:
            expected_tools = expected['tdd'][step]['expected_tools']
            actual_tools = [
                e['tool_name']
                for e in actual
                if e['event'] == 'tool_call' and is_in_step(e, step)
            ]
            missing_tools = set(expected_tools) - set(actual_tools)
            if missing_tools:
                results['issues'].append({
                    'type': 'missing_tools',
                    'step': step,
                    'tools': list(missing_tools),
                    'severity': 'warning'
                })

    return results
```

**Report Output:**
```
Workflow Compliance Report
==========================
Session: 03c5f668-8be0-41c7-b3c4-d1192a5257c1
Workflow: test-driven-development
Status: ⚠️ WARNING

Expected Steps: [red, green, refactor]
Actual Steps:   [red, green]

Issues:
  ❌ Missing step: 'refactor' (severity: error)
     The TDD cycle was not completed. Refactoring step skipped.

  ⚠️ Tool not called in 'red' step: 'Bash' (severity: warning)
     Expected to run tests, but Bash tool was not invoked.

Recommendation:
  Review the TDD skill requirements. Ensure all three phases are completed.
```

#### B. Performance Profiler

**Purpose:** Identify bottlenecks in workflow execution

**Metrics Collected:**
- Step duration (ms)
- Token usage per step (approximated from tool calls)
- File operations count
- Tool calls per step

**Algorithm:**
```python
def profile_workflow(session_id):
    events = parse_jsonl(f"~/.claude/session-env/{session_id}/workflow.jsonl")

    profile = {
        'total_duration_ms': 0,
        'steps': {}
    }

    step_stack = []  # Track nested steps

    for event in events:
        if event['event'] == 'step_start':
            step_stack.append({
                'step_id': event['step_id'],
                'start_ts': event['ts'],
                'tool_calls': [],
                'tokens_approx': 0
            })

        elif event['event'] == 'step_end':
            if step_stack:
                step = step_stack.pop()
                duration_ms = event['ts'] - step['start_ts']

                profile['steps'][step['step_id']] = {
                    'duration_ms': duration_ms,
                    'tool_calls': len(step['tool_calls']),
                    'tokens_approx': step['tokens_approx'],
                    'outcome': event['outcome']
                }

                profile['total_duration_ms'] += duration_ms

        elif event['event'] == 'tool_call' and step_stack:
            step_stack[-1]['tool_calls'].append(event['tool_name'])
            # Approximate token usage based on tool type
            step_stack[-1]['tokens_approx'] += estimate_tokens(event)

    # Calculate percentages
    for step_id, data in profile['steps'].items():
        data['pct_of_total'] = (data['duration_ms'] / profile['total_duration_ms']) * 100

    return profile
```

**Report Output:**
```
Performance Profile
===================
Session: 03c5f668-8be0-41c7-b3c4-d1192a5257c1
Workflow: test-driven-development
Total Duration: 2m 34s (154,000 ms)

Step Breakdown:
  1. red         -  34s (22.1%) - 12 tool calls, ~567 tokens
  2. green       -  1m 12s (46.8%) - 24 tool calls, ~1,234 tokens  ⚠️ BOTTLENECK
  3. refactor    -  48s (31.2%) - 8 tool calls, ~389 tokens

Bottleneck Analysis:
  Step 'green' took 46.8% of total time.

  Tool breakdown for 'green' step:
    - Edit: 8 calls (45s total)
    - Bash: 12 calls (18s total)
    - Read: 4 calls (9s total)

  Recommendation: Reduce edit iterations. Consider batching changes.

Token Usage:
  Total: ~2,190 tokens
  Most expensive step: 'green' (1,234 tokens, 56.4%)
```

#### C. CLI / Dashboard

**Command:** `wrangler workflow report [session-id]`

**Implementation:**
```bash
#!/bin/bash
# bin/wrangler-workflow-report.sh

SESSION_ID="$1"

if [ -z "$SESSION_ID" ]; then
    echo "Usage: wrangler workflow report <session-id>"
    exit 1
fi

# Run analysis scripts
python3 ~/.claude/wrangler-observability/check-compliance.py --session-id "$SESSION_ID"
python3 ~/.claude/wrangler-observability/profile-performance.py --session-id "$SESSION_ID"
python3 ~/.claude/wrangler-observability/detect-loops.py --session-id "$SESSION_ID" --report

# Generate combined report
python3 ~/.claude/wrangler-observability/generate-report.py --session-id "$SESSION_ID"
```

**Interactive Dashboard (Future):**
```
┌─ Wrangler Workflow Dashboard ─────────────────────────────────┐
│                                                                 │
│  Session: 03c5f668-8be0-41c7-b3c4-d1192a5257c1                │
│  Duration: 2m 34s                                              │
│  Status: ⚠️ WARNING (1 issue)                                  │
│                                                                 │
│  ┌─ Timeline ──────────────────────────────────────────────┐  │
│  │ [====red====][========green========][====refactor====]  │  │
│  │ 0s          34s                   1:46                 2:34 │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─ Steps ────────────────────────────────────────────────┐  │
│  │ ✅ red         34s  (22.1%)  12 tools    567 tokens     │  │
│  │ ✅ green       72s  (46.8%)  24 tools  1,234 tokens ⚠️  │  │
│  │ ✅ refactor    48s  (31.2%)   8 tools    389 tokens     │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─ Issues ───────────────────────────────────────────────┐  │
│  │ ⚠️ Bottleneck detected in step 'green' (46.8% of time)  │  │
│  │    → Consider batching Edit operations                  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  [R]erun  [E]xport  [C]ompare  [Q]uit                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Foundation (Week 1)

**Goal:** Basic instrumentation infrastructure

**Tasks:**
1. Create observability directory structure
   ```
   ~/.claude/wrangler-observability/
   ├── extract-workflow-schemas.py
   ├── detect-loops.py
   ├── generate-report.py
   ├── check-compliance.py
   └── profile-performance.py
   ```

2. Implement workflow event logging
   - Session hook that initializes `workflow.jsonl`
   - Basic event emission (session_start, session_end)

3. Add skill annotation parser
   - Extracts `<!-- workflow:... -->` from skills
   - Generates expected workflow schemas

**Deliverable:** Session hooks that create workflow logs

**Testing:**
- Run test session, verify `workflow.jsonl` created
- Check that skill annotations are extracted correctly

### Phase 2: MCP Checkpoint Tools (Week 1)

**Goal:** Add MCP tools for explicit workflow tracking

**Tasks:**
1. Implement MCP tools:
   - `workflow_step_start`
   - `workflow_step_end`
   - `workflow_metric`

2. Add tool invocation logging to `workflow.jsonl`

3. Update 2-3 skills to use checkpoint tools (pilot)
   - test-driven-development
   - systematic-debugging
   - brainstorming

**Deliverable:** Working MCP checkpoint tools, updated pilot skills

**Testing:**
- Call tools manually via Claude Code
- Verify events logged to `workflow.jsonl`
- Run pilot skills, check compliance

### Phase 3: Loop Detection (Week 2)

**Goal:** Detect and warn about infinite loops

**Tasks:**
1. Implement loop detection state management
   - `loop-detector.json` schema
   - Pattern recognition algorithm

2. Hook into UserPromptSubmit event
   - Track action sequences
   - Emit warnings when loops detected

3. Create intervention prompts
   - System reminder format
   - Actionable recommendations

**Deliverable:** Working loop detector with warnings

**Testing:**
- Simulate loop patterns (test → fix → test → fix...)
- Verify warnings emitted after threshold
- Validate intervention prompts are helpful

### Phase 4: Analysis & Reporting (Week 2-3)

**Goal:** Post-execution insights

**Tasks:**
1. Implement compliance checker
   - Compare expected vs. actual workflow
   - Generate compliance report

2. Implement performance profiler
   - Calculate step timings
   - Identify bottlenecks
   - Token usage analysis

3. Create unified report generator
   - Combine compliance + performance + loop data
   - Markdown report format

4. Build CLI command
   - `wrangler workflow report <session-id>`
   - Pretty formatting

**Deliverable:** Complete analysis toolchain, CLI

**Testing:**
- Run full workflow, generate report
- Verify accuracy of compliance checks
- Validate performance metrics
- Test CLI on historical sessions

### Phase 5: Skill Migration (Week 3)

**Goal:** Instrument key skills with observability

**Tasks:**
1. Add annotations to all skills
   - `<!-- workflow:... -->` metadata
   - Expected step sequences

2. Update high-value skills to use checkpoint tools
   - TDD workflows (test-driven-development, testing-anti-patterns)
   - Debugging (systematic-debugging, root-cause-tracing)
   - Planning (brainstorming, writing-plans)

3. Document best practices
   - When to add checkpoints
   - How to define workflow structure
   - Loop pattern examples

**Deliverable:** 10+ instrumented skills, documentation

**Testing:**
- Validate all updated skills
- Check compliance reports for accuracy
- Performance regression testing

### Phase 6: Optimization & Iteration (Week 3+)

**Goal:** Data-driven skill improvement

**Tasks:**
1. Collect metrics from real usage
   - Which skills are used most?
   - Which steps are slow?
   - Where do loops occur?

2. Analyze and optimize
   - Refactor slow skills
   - Add loop prevention hints
   - Improve checkpoint placement

3. Create feedback loop
   - Weekly reports on skill performance
   - Identify improvement opportunities
   - Track ROI of changes

**Deliverable:** Continuous improvement process

---

## Success Metrics

### Quantitative Metrics

**Observability Coverage:**
- [ ] 100% of skills have workflow annotations
- [ ] 50%+ of complex skills use checkpoint tools
- [ ] 90%+ sessions generate workflow logs

**Detection Accuracy:**
- [ ] Loop detection: <5% false positives
- [ ] Compliance checking: 100% accurate when skills followed
- [ ] Performance profiling: ±10% accuracy on timings

**Performance:**
- [ ] Checkpoint tool overhead: <10ms per call
- [ ] Session hook overhead: <200ms total
- [ ] Report generation: <5s for typical session

### Qualitative Metrics

**Developer Experience:**
- [ ] Can answer "Did the agent follow the TDD workflow?"
- [ ] Can identify which step is slow
- [ ] Can detect when agent is stuck
- [ ] Reports are actionable (clear next steps)

**Maintenance:**
- [ ] Skill updates include observability metadata
- [ ] Loop patterns documented and preventable
- [ ] Data-driven optimization is routine

---

## Future Enhancements

### Phase 2 Features

**Real-time Monitoring:**
- Live dashboard during session execution
- WebSocket connection to workflow log
- Alerts for critical loops

**Visual Workflow Graphs:**
- Mermaid/Graphviz DAG of executed workflow
- Compare expected vs. actual visually
- Timeline visualization

**Machine Learning:**
- Pattern recognition for common failures
- Predict workflow bottlenecks
- Suggest optimizations automatically

**Integration:**
- Export to external monitoring (Datadog, Prometheus)
- Slack/Discord alerts for critical loops
- GitHub Actions integration for CI workflows

### Phase 3 Features

**Workflow Templates:**
- Pre-defined workflow structures
- Validation against templates
- Template versioning

**A/B Testing:**
- Compare skill variations
- Measure performance impact
- Statistical significance testing

**Collaborative Workflows:**
- Multi-agent coordination tracking
- Subagent performance metrics
- Cross-session correlation

---

## Appendices

### Appendix A: Workflow Event Schema

Full JSON schema for `workflow.jsonl` events:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "oneOf": [
    {
      "properties": {
        "event": { "const": "session_start" },
        "ts": { "type": "number" },
        "session_id": { "type": "string" },
        "project": { "type": "string" }
      },
      "required": ["event", "ts"]
    },
    {
      "properties": {
        "event": { "const": "step_start" },
        "ts": { "type": "number" },
        "workflow_id": { "type": "string" },
        "step_id": { "type": "string" },
        "metadata": { "type": "object" }
      },
      "required": ["event", "ts", "workflow_id", "step_id"]
    },
    {
      "properties": {
        "event": { "const": "step_end" },
        "ts": { "type": "number" },
        "workflow_id": { "type": "string" },
        "step_id": { "type": "string" },
        "outcome": { "enum": ["success", "failure", "skipped"] },
        "duration_ms": { "type": "number" },
        "metrics": { "type": "object" }
      },
      "required": ["event", "ts", "workflow_id", "step_id", "outcome"]
    }
  ]
}
```

### Appendix B: Loop Detection Patterns

Common loop patterns and thresholds:

| Pattern | Actions | Threshold | Severity | Intervention |
|---------|---------|-----------|----------|--------------|
| Test-Fix Loop | `[run_test, edit_file]` | 3 | Warning | Use systematic-debugging |
| Search-Read Loop | `[grep, read]` | 4 | Warning | File likely doesn't exist |
| Build-Fix Loop | `[build, edit]` | 3 | Critical | Root cause investigation |
| API-Retry Loop | `[api_call, wait]` | 5 | Critical | Check API status |
| Git-Conflict Loop | `[git_pull, merge, git_pull]` | 2 | Critical | Manual conflict resolution |

### Appendix C: Example Session Report

```markdown
# Workflow Execution Report

**Session ID:** 03c5f668-8be0-41c7-b3c4-d1192a5257c1
**Date:** 2025-11-22 18:32:00
**Duration:** 2m 34s
**Project:** /Users/sam/medb/code/wrangler

---

## Summary

✅ **Status:** PASSED
**Workflow:** test-driven-development
**Compliance:** 100% (all steps completed)

---

## Timeline

```
[====red====][========green========][====refactor====]
0s          34s                   1:46                 2:34
```

---

## Step Details

### 1. RED - Write Failing Test (0:00 - 0:34)
- **Duration:** 34s (22.1% of total)
- **Outcome:** ✅ Success
- **Tool Calls:** 12
  - Write: 3
  - Bash: 6 (test execution)
  - Read: 3
- **Tokens:** ~567
- **Metrics:**
  - Tests created: 1
  - Test status: FAIL (expected)

### 2. GREEN - Make It Pass (0:34 - 1:46)
- **Duration:** 72s (46.8% of total) ⚠️ **BOTTLENECK**
- **Outcome:** ✅ Success
- **Tool Calls:** 24
  - Edit: 8
  - Bash: 12
  - Read: 4
- **Tokens:** ~1,234
- **Metrics:**
  - Files modified: 3
  - Test status: PASS

**Bottleneck Analysis:**
This step took 46.8% of total time. Primary time spent in Edit operations (45s).

**Recommendation:** Consider batching related changes together to reduce Edit iterations.

### 3. REFACTOR - Clean Up (1:46 - 2:34)
- **Duration:** 48s (31.2% of total)
- **Outcome:** ✅ Success
- **Tool Calls:** 8
  - Edit: 4
  - Bash: 3 (re-run tests)
  - Read: 1
- **Tokens:** ~389
- **Metrics:**
  - Refactoring changes: 2 files
  - Test status: PASS (still passing)

---

## Issues & Recommendations

### Performance
- ⚠️ **Bottleneck in 'green' step:** 46.8% of total time
  - **Action:** Review Edit operation patterns
  - **Suggestion:** Batch similar changes

### Compliance
- ✅ **All steps completed in order**
- ✅ **All expected tools used**
- ✅ **TDD cycle properly followed**

### Loop Detection
- ✅ **No loops detected**

---

## Token Usage

| Step | Tokens | % of Total |
|------|--------|------------|
| red | 567 | 25.9% |
| green | 1,234 | 56.4% ⚠️ |
| refactor | 389 | 17.8% |
| **Total** | **2,190** | **100%** |

---

## Optimization Opportunities

1. **Reduce Edit iterations in 'green' step**
   - Current: 8 Edit calls
   - Target: <5 Edit calls
   - Expected savings: ~20s, ~300 tokens

2. **Consider caching test results**
   - 21 Bash test executions total
   - Some may be redundant
   - Expected savings: ~10s

---

## Historical Comparison

| Metric | This Session | Previous Avg | Change |
|--------|--------------|--------------|--------|
| Total Duration | 2m 34s | 3m 12s | -19.8% ✅ |
| Token Usage | 2,190 | 2,450 | -10.6% ✅ |
| Tool Calls | 44 | 52 | -15.4% ✅ |

**Trend:** Performance improving! Keep it up.

---

_Generated by Wrangler Workflow Observability v1.0_
```

---

## Conclusion

This specification proposes a comprehensive observability and control system that:

1. **Leverages existing Claude Code infrastructure** (todos, debug logs, session state)
2. **Works entirely within plugin constraints** (no core changes required)
3. **Provides actionable insights** (compliance, performance, loop detection)
4. **Enables data-driven optimization** (measure, analyze, improve)
5. **Maintains simplicity** (opt-in for complex workflows)

The three-layer architecture (Instrumentation → Collection → Analysis) cleanly separates concerns and enables progressive enhancement. Skills can adopt observability incrementally without breaking existing functionality.

**Next Steps:**
1. Review and approve specification
2. Implement Phase 1 (foundation)
3. Pilot with 2-3 skills
4. Iterate based on feedback
5. Scale to all skills

**Estimated Effort:** 2-3 weeks for full implementation, 1 week for pilot.

**Expected ROI:**
- 50% reduction in debugging time (know what happened)
- 30% faster skill execution (identify bottlenecks)
- 90% reduction in stuck/looping sessions (auto-detection)
- Continuous improvement through data-driven optimization
