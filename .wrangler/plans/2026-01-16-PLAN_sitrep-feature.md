# Implementation Plan: `/wrangler:sitrep` Feature

## Overview

Create a `/wrangler:sitrep` command that generates personalized situational awareness reports, surfacing what's new since the user's last sitrep.

**Primary value:** Surface new memos that collaborators created, so you don't evaluate priorities without knowing the latest learnings.

---

## Files to Create

| File | Purpose | Size |
|------|---------|------|
| `commands/sitrep.md` | Thin wrapper command | ~20 lines |
| `skills/sitrep/SKILL.md` | Core workflow logic | ~450 lines |

---

## 1. Command: `commands/sitrep.md`

**Pattern:** Follow `brainstorm.md` (thin skill wrapper)

```yaml
---
description: Generate a situational report showing what's new since your last sitrep
argument-hint: "[--full]"
---
```

**Body:** Single skill invocation + argument passing

```markdown
# /wrangler:sitrep

Use the Skill tool to invoke the sitrep skill:

Skill: sitrep
Args: $ARGUMENTS

The skill handles state management, data gathering, and report generation.
```

**Arguments:**
- `--full` - Ignore cursor, show full report (useful for first day on project)

---

## 2. Skill: `skills/sitrep/SKILL.md`

### Frontmatter

```yaml
---
name: sitrep
description: Generate situational awareness report showing new memos, recent commits, decisions, questions, and roadmap work since user's last sitrep. ONLY invoke via /wrangler:sitrep command.
---
```

### Multi-Phase Workflow

```
Phase 1: User Detection & State Loading (Sequential)
    ↓
Phase 2: Data Gathering (3 Parallel Subagents)
    ↓
Phase 3: Analysis & Synthesis (Sequential)
    ↓
Phase 4: Report Generation (Sequential)
    ↓
Phase 5: State Update (Sequential)
```

---

## Phase 1: User Detection & State Loading

**Purpose:** Establish identity and load cursor position

**Steps:**
1. Detect user: `git config user.email` → extract username before `@`
2. Load state file: `.wrangler/cache/{username}-sitrep.json`
3. Handle first-run: No file → show last 7 days, announce "First sitrep"
4. Handle `--full` flag: Ignore cursor, treat as first-run

**State file format:**
```json
{
  "created_at": "2026-01-10T09:00:00Z",
  "updated_at": "2026-01-15T18:30:00Z",
  "cursor": {
    "commit": "7313e60"
  },
  "stats": {
    "runs": 12,
    "memos_surfaced": 47,
    "decisions_found": 23,
    "questions_found": 8
  }
}
```

---

## Phase 2: Data Gathering (Parallel Subagents)

Launch **3 Task tool calls in a single message** for true parallelism.

### Subagent A: Git History Analysis

**Input:** `cursor.commit` or "7 days ago"

**Commands:**
```bash
# With cursor:
git log {cursor}..HEAD --format="%H|%ae|%s|%ai" --no-merges

# First-run:
git log --since="7 days ago" --format="%H|%ae|%s|%ai" --no-merges
```

**Output:**
- Commits grouped by author
- Decisions extracted from commit messages
- Latest commit hash (for new cursor)

**Decision extraction keywords:** "decided", "chose", "switched to", "migrated", `feat:`, `fix:`

---

### Subagent B: Memo Surfacing (CRITICAL)

**Input:** `cursor.commit` timestamp or 7 days ago

**Steps:**
1. List memos with mtimes: `ls -lt .wrangler/memos/*.md`
2. Filter to newer than cursor
3. For each new memo:
   - Extract title (H1 or filename)
   - Extract 2-3 sentence summary
   - Extract decisions (`## Decision`, "we decided")
   - Extract questions (`## Open Questions`, `?` in headers, `TBD:`)

**Output:**
- New memo list with summaries
- Decisions from memos
- Open questions

---

### Subagent C: Issue & Roadmap Status

**MCP Tools:**
```typescript
issues_list({ status: ["open"] })
issues_list({ status: ["in_progress"] })
issues_list({ priority: ["critical", "high"], status: ["open"] })
```

**Files to read:**
- `.wrangler/ROADMAP_NEXT_STEPS.md` - Current phase, completion %

**Output:**
- Issue counts by status
- High-priority open items
- Roadmap status

---

## Phase 3: Analysis & Synthesis

**Steps:**
1. Aggregate results from all 3 subagents
2. Deduplicate decisions (same decision may appear in commit and memo)
3. Apply priority re-evaluation heuristics:

| Trigger | Suggested Change |
|---------|------------------|
| New RCA memo about component X | Related issues → higher priority |
| Spec closed | Child issues → review for obsolescence |
| Critical bug committed | Related issues → blocked |

4. Calculate stats for state file

**Note:** Sitrep SUGGESTS priority changes. Human decides.

---

## Phase 4: Report Generation

**Template structure (reuses housekeeping patterns):**

```markdown
# Sitrep Report - {date}

**User:** {username} | **Period:** {cursor_date} → now ({N} days)

---

## 🆕 New Memos (READ FIRST)

{For each new memo:}
- **{date}** [{type}] **{title}**
  > {2-3 sentence summary}

---

## 📝 Recent Activity

**Who did what:**
- **{author}**: {N} commits - {representative messages}

---

## ✅ Decisions Made

{For each decision:}
- **{summary}** (from {source: commit/memo})

---

## ❓ Open Questions

{For each question:}
- {question} (from {source})

---

## 📊 Roadmap Status

**Phase:** {name} | **Completion:** ~{N}%

| Priority | Issue | Title | Status |
|----------|-------|-------|--------|
| 🔴 | #001 | ... | open |

### ⚠️ Priority Re-evaluation Suggested

- **#{id}**: {current} → Consider {suggested} because {reason}

---

## Quick Stats

| Metric | Value | Delta |
|--------|-------|-------|
| Open Issues | {N} | {+/-} |
| Memos | {N} | +{new} |
```

---

## Phase 5: State Update

**Write to:** `.wrangler/cache/{username}-sitrep.json`

**Updates:**
- `updated_at` → now
- `cursor.commit` → latest commit hash
- `stats.runs` → increment
- `stats.memos_surfaced` → add count
- `stats.decisions_found` → add count
- `stats.questions_found` → add count

---

## Reuse Points (DRY)

| What | From | How |
|------|------|-----|
| Parallel subagent dispatch | `housekeeping/SKILL.md` | Same Task tool pattern |
| Report template structure | `housekeeping/SKILL.md` | Markdown tables, sections |
| MCP tool queries | `refresh-metrics/SKILL.md` | `issues_list` with filters |
| Thin command wrapper | `brainstorm.md` | Exact pattern |

**NOT invoking `refresh-metrics`:** Sitrep is read-only. It doesn't update governance files.

---

## Edge Cases

| Case | Handling |
|------|----------|
| No state file | First-run: show last 7 days |
| `--full` flag | Ignore cursor |
| No git repo | Skip git analysis, warn user |
| No memos | "No memos in workspace" |
| No issues | "No issues tracked yet" |
| Username detection fails | Fallback to `anonymous` |
| Cursor commit rebased away | Fall back to last 30 days |
| State file corrupted | Delete and treat as first-run |

---

## Verification

After implementation, test these scenarios:

1. **First-run:** No state file → shows 7 days, creates state file
2. **Incremental:** Add memo, run sitrep → only new memo appears
3. **--full flag:** Ignores cursor, shows everything
4. **Multi-user:** Switch git user → separate state files
5. **Decision extraction:** Memo with `## Decision` → appears in report
6. **Empty workspace:** No errors, graceful messages

---

## Implementation Order

1. Create `commands/sitrep.md` (thin wrapper, ~5 min)
2. Create `skills/sitrep/SKILL.md` skeleton with phases
3. Implement Phase 1 (user detection, state loading)
4. Implement Phase 2 subagents (parallel data gathering)
5. Implement Phase 3 (analysis, priority re-evaluation)
6. Implement Phase 4 (report template)
7. Implement Phase 5 (state persistence)
8. Test all scenarios

---

## Files to Reference During Implementation

- `commands/brainstorm.md` - Thin wrapper pattern
- `skills/housekeeping/SKILL.md` - Multi-phase, parallel subagents, report template
- `skills/refresh-metrics/SKILL.md` - MCP tool usage patterns
- `.wrangler/workspace-schema.json` - Cache directory definition
