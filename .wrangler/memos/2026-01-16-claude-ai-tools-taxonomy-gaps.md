# Claude AI Tools Taxonomy: Wrangler Gap Analysis

**Date:** 2026-01-16
**Context:** Conversation exploring sitrep feature revealed fundamental confusion about Claude AI tool types
**Status:** Analysis complete, action items identified

---

## Executive Summary

During exploration of a proposed `/wrangler:sitrep` feature, it became clear that wrangler conflates three distinct Claude AI tool types: **skills**, **agents**, and **slash commands**. This confusion is reflected in both the codebase structure and in AI assistant behavior (incorrectly claiming `/wrangler:issues` was available when it wasn't).

The `validate-claude-tools` skill documents authoritative Anthropic schemas that wrangler should align with.

---

## The Three Claude AI Tool Types

Per Anthropic best practices documented in `.claude/commands/validate-claude-tools.md`:

### 1. Skills (`.claude/skills/*/SKILL.md`)

**Purpose:** Reusable knowledge/process patterns that Claude loads into context

**Frontmatter schema:**
```yaml
---
name: skill-name                    # Required (max 64 chars, gerund form)
description: What and when          # Required (max 1024 chars)
allowed-tools: ["Read", "Write"]    # Optional - constrain tool access
---
```

**Key characteristics:**
- Live in directories (not flat files)
- Name uses gerund form: `writing-documentation` not `docs-writer`
- Description must include WHAT it does AND WHEN to use it
- Body contains the actual skill instructions
- Uses `allowed-tools:` (NOT `tools:`)

### 2. Agents (`.claude/agents/*.md`)

**Purpose:** Autonomous subprocesses that can be spawned via Task tool

**Frontmatter schema:**
```yaml
---
name: lowercase-with-hyphens        # Required (max 64 chars)
description: What this agent does   # Required (max 1024 chars)
tools: Read, Write, Bash            # Optional - tools agent can use
model: sonnet | opus | haiku | inherit  # Optional
permissionMode: default | acceptEdits | bypassPermissions | plan | ignore
skills: skill1, skill2              # Optional - skills to auto-load
---
```

**Key characteristics:**
- Flat markdown files (not directories)
- Uses `tools:` field (NOT `allowed-tools:`)
- Can specify model override
- Can auto-load skills
- Invoked via Task tool with `subagent_type` parameter

### 3. Slash Commands (`.claude/commands/*.md`)

**Purpose:** User-invocable shortcuts that expand into prompts

**Frontmatter schema:**
```yaml
---
description: What this command does # Required
argument-hint: <arg1> [arg2]        # Optional
allowed-tools: Read, Write          # Optional
model: sonnet | opus | haiku        # Optional
---
```

**Key characteristics:**
- Flat markdown files
- No `name:` field required (filename is the name)
- Uses `$ARGUMENTS` placeholder for user input
- Uses `allowed-tools:` (NOT `tools:`)
- Invoked with `/command-name` syntax

---

## Critical Distinction

| Aspect | Skills | Agents | Commands |
|--------|--------|--------|----------|
| Location | `.claude/skills/*/SKILL.md` | `.claude/agents/*.md` | `.claude/commands/*.md` |
| Structure | Directory with SKILL.md | Flat file | Flat file |
| Tool field | `allowed-tools:` | `tools:` | `allowed-tools:` |
| Invocation | Skill tool or auto-loaded | Task tool | `/command-name` |
| Purpose | Knowledge/process | Autonomous work | User shortcuts |

---

## Wrangler's Current State

### Directory Structure Mismatch

Wrangler uses:
```
wrangler/
├── skills/           # Skills (correct location concept)
│   └── {name}/
│       └── SKILL.md
├── commands/         # Commands (but at repo root, not .claude/)
│   └── {name}.md
```

Anthropic standard expects:
```
.claude/
├── skills/
│   └── {name}/
│       └── SKILL.md
├── agents/
│   └── {name}.md
├── commands/
│   └── {name}.md
```

### Specific Issues Found

1. **`commands/issues.md` exists but isn't functional**
   - File is present at `commands/issues.md`
   - Not registered in the Skill tool's available list
   - AI incorrectly claimed it was available

2. **No `.claude/agents/` directory**
   - Wrangler has agent-like patterns (subagent dispatch in housekeeping)
   - But no formal agent definitions per Anthropic schema

3. **Skills at non-standard location**
   - Wrangler skills are at `skills/` (repo root)
   - Standard is `.claude/skills/`
   - May affect discoverability

4. **Unclear registration mechanism**
   - How do commands get from `commands/*.md` to being invocable?
   - Why is `housekeeping` available but `issues` is not?
   - Registration process not documented

---

## Recommendations

### Immediate (Documentation)

1. **Document the tool type distinction in CLAUDE.md**
   - Add section explaining skills vs agents vs commands
   - Reference the validate-claude-tools skill

2. **Audit commands/ directory**
   - Which commands are actually registered?
   - Why are some available and others not?
   - Document the registration mechanism

### Short-term (Alignment)

3. **Consider `.claude/` standard structure**
   - Evaluate moving to `.claude/skills/`, `.claude/commands/`
   - Or document why wrangler diverges from standard

4. **Create agents for subagent patterns**
   - Housekeeping dispatches 4 subagents
   - These could be formal `.claude/agents/*.md` definitions

### For Sitrep Feature

5. **Decide: skill, agent, or command?**
   - If user-invoked shortcut → command (`/wrangler:sitrep`)
   - If autonomous subprocess → agent
   - If process knowledge → skill
   - Likely: command that orchestrates agents

---

## Original Conversation Context

The user was exploring a `/wrangler:sitrep` feature that would:
1. Check latest merged PRs and commits on GitHub
2. Check recently changed wrangler files
3. Summarize latest decisions
4. Announce new questions
5. Show upcoming roadmap work
6. Re-evaluate priority ranking

Gap analysis found:
- No GitHub API integration
- No session delta tracking ("what changed since last time")
- No automatic decision aggregation
- No priority re-evaluation logic

The `/wrangler:issues` command was referenced as existing functionality, but turned out to be non-functional—highlighting the broader issue of unclear tool registration and conflated terminology.

---

## Action Items

- [ ] Audit which commands are actually registered and why
- [ ] Document skill vs agent vs command distinction in CLAUDE.md
- [ ] Decide on sitrep implementation type (command vs skill vs agent)
- [ ] Consider alignment with `.claude/` standard structure
- [ ] Run `/validate-claude-tools` on wrangler's own `.claude/` directory

---

## References

- `.claude/commands/validate-claude-tools.md` - Authoritative schema documentation
- `skills/using-wrangler/SKILL.md` - Current skill usage guidance
- `commands/issues.md` - Example of non-functional command
- `skills/housekeeping/SKILL.md` - Example of subagent dispatch pattern
