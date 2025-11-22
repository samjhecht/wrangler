---
id: "000035"
title: "Task 9: Update references to deprecated skills across codebase"
type: "issue"
status: "open"
priority: "high"
labels: ["implementation", "plan-step", "cleanup"]
assignee: "claude-code"
project: "implement-skill-unification"
createdAt: "2025-11-21T00:00:00.000Z"
updatedAt: "2025-11-21T00:00:00.000Z"
wranglerContext:
  agentId: "implementation-agent"
  parentTaskId: "000034"
  estimatedEffort: "25 minutes"
---

## Description

Find and update all references to `executing-plans` and `subagent-driven-development` skills across the codebase (other skills, docs, plan files) to point to the new unified `implement` skill.

## Context

Reference: `plans/2025-11-21-PLAN_implement-skill.md`

After deleting the deprecated skills, any references to them will break. We need to:
1. Find all references
2. Update them to point to `implement`
3. Adjust wording if needed (autonomous vs. batch execution)

Common reference locations:
- Other skill files (writing-plans, finishing-a-development-branch, etc.)
- Documentation files (README, MCP-USAGE, etc.)
- Plan file templates
- CLAUDE.md project instructions

## Files

- Modify: Various (identified via grep)

## Implementation Steps

**Step 1: Find all references to executing-plans**

```bash
grep -r "executing-plans" --include="*.md" . | grep -v ".wrangler/memos" | grep -v "node_modules"
```

Capture output to identify files needing updates.

**Step 2: Find all references to subagent-driven-development**

```bash
grep -r "subagent-driven-development" --include="*.md" . | grep -v ".wrangler/memos" | grep -v "node_modules"
```

Capture output to identify files needing updates.

**Step 3: Update writing-plans skill**

File: `skills/writing-plans/SKILL.md`

Find section about "Execution Handoff" (likely references both skills).

**OLD:**
```markdown
**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?"**
```

**NEW:**
```markdown
**Execution:**

Use `/wrangler:implement` to execute this plan autonomously.

The implement skill will:
- Dispatch subagent per task
- Handle code review automatically
- Fix issues with retry logic (2 attempts max)
- Only stop for genuine blockers
- Present completion summary when done
```

**Step 4: Update README.md if it references old skills**

File: `README.md` (check if exists at root)

```bash
grep -E "executing-plans|subagent-driven" README.md
```

If found, update references to `implement`.

**Step 5: Update CLAUDE.md if it references old skills**

File: `CLAUDE.md`

```bash
grep -E "executing-plans|subagent-driven" CLAUDE.md
```

If found, update to reference `implement` skill.

**Step 6: Update docs/ directory files**

```bash
grep -r "executing-plans\|subagent-driven" docs/*.md
```

Update any documentation references to point to new skill.

Common docs that might reference:
- `docs/MCP-USAGE.md`
- `docs/GOVERNANCE.md`
- `docs/SLASH-COMMANDS.md`

**Step 7: Check for slash command references**

```bash
grep -r "/wrangler:execute-plan" --include="*.md" . | grep -v ".wrangler/memos"
```

Update any references to `/wrangler:implement`

**Step 8: Update plan file templates (if any exist)**

```bash
find . -name "*template*.md" -o -name "*TEMPLATE*.md" | xargs grep -l "executing-plans\|subagent-driven"
```

Update templates to reference `/wrangler:implement`.

**Step 9: Verify no broken references remain**

```bash
# Should return no results (except in archived files)
grep -r "executing-plans" --include="*.md" . | grep -v ".wrangler/memos" | grep -v "node_modules" | grep -v "DEPRECATED"

grep -r "subagent-driven-development" --include="*.md" . | grep -v ".wrangler/memos" | grep -v "node_modules" | grep -v "DEPRECATED"
```

Expected: No matches (or only in archived content)

**Step 10: Commit all reference updates**

```bash
git add skills/ docs/ commands/ README.md CLAUDE.md
git commit -m "refactor: update skill references to use unified implement skill

Replace all references to deprecated skills:
- executing-plans → implement
- subagent-driven-development → implement
- /wrangler:execute-plan → /wrangler:implement

Updated files:
- skills/writing-plans/SKILL.md (execution handoff)
- docs/*.md (documentation references)
- CLAUDE.md (project instructions)
- Other skills referencing old workflows

All references now point to unified autonomous implementation workflow.

Part of unified implement skill
"
```

## Acceptance Criteria

- [ ] All references to `executing-plans` found via grep
- [ ] All references to `subagent-driven-development` found via grep
- [ ] writing-plans skill updated (execution handoff section)
- [ ] README.md updated (if contains references)
- [ ] CLAUDE.md updated (if contains references)
- [ ] docs/ files updated (all references)
- [ ] Plan templates updated (if exist)
- [ ] Slash command references updated (/execute-plan → /implement)
- [ ] Verified no broken references remain (except archives)
- [ ] All updates maintain context and flow
- [ ] Committed with comprehensive message listing all changes

## Dependencies

- Requires completion of: Task 000034 (deprecated skills must be deleted first)
