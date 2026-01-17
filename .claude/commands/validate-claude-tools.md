---
description: Validate Claude tools in .claude/ against Anthropic best practices. Optionally pass a specific path to validate.
---

Validate Claude AI tools against Anthropic's official documentation and best practices.

**Target:** $ARGUMENTS (if empty, validate all of `.claude/`)

## Setup

1. If `$ARGUMENTS` is provided, validate only that path
2. If `$ARGUMENTS` is empty, validate the entire `.claude/` directory
3. Create output file: `CLAUDE_MEMO_AI_TOOLS_REVIEW.md` in the project root

## Frontmatter Schemas

**IMPORTANT:** Each tool type has different valid frontmatter fields. Use these authoritative schemas.

### Subagents (`.claude/agents/*.md`)
```yaml
---
name: lowercase-with-hyphens        # Required (max 64 chars)
description: What this agent does   # Required (max 1024 chars)
tools: Read, Write, Bash            # Optional - tools the agent can use
model: sonnet | opus | haiku | inherit  # Optional - defaults to inherit
permissionMode: default | acceptEdits | bypassPermissions | plan | ignore  # Optional
skills: skill1, skill2              # Optional - skills to auto-load
---
```

### Skills (`.claude/skills/*/SKILL.md`)
```yaml
---
name: skill-name                    # Required (max 64 chars)
description: What and when          # Required (max 1024 chars)
allowed-tools: ["Read", "Write"]    # Optional - constrain tool access
---
```

### Commands (`.claude/commands/*.md`)
```yaml
---
description: What this command does # Required
argument-hint: <arg1> [arg2]        # Optional
allowed-tools: Read, Write          # Optional
model: sonnet | opus | haiku        # Optional - override model for this command
---
```

**Key distinction:** Agents use `tools:` field. Skills and commands use `allowed-tools:` field. Do not confuse these.

---

## Validation Framework

For each tool type, check the applicable rules below.

### Skills (`.claude/skills/*/SKILL.md`)

**Structure validation:**
- [ ] SKILL.md exists in skill directory
- [ ] YAML frontmatter has opening and closing `---` delimiters
- [ ] Required field: `name` (lowercase, numbers, hyphens only, max 64 chars)
- [ ] Required field: `description` (non-empty, max 1024 chars, no XML tags)
- [ ] No reserved words in name: "anthropic", "claude"

**Naming convention:**
- [ ] Directory name matches `name` field in frontmatter
- [ ] Name uses gerund form (verb + -ing): e.g., `writing-documentation` not `docs-writer`

**Best practices:**
- [ ] Description includes both what the skill does AND when to use it
- [ ] Description includes trigger phrases/keywords users would say
- [ ] SKILL.md body is under 500 lines
- [ ] Progressive disclosure: explicit "Read X when Y" instructions for bundled files
- [ ] References to other files use forward slashes (not backslashes)
- [ ] If scripts exist, SKILL.md explains when to run vs read them
- [ ] Feedback loops documented if validation scripts exist
- [ ] No time-sensitive information that will become outdated

**File validation:**
- [ ] All internal markdown links resolve to existing files
- [ ] All referenced scripts exist and have valid syntax
- [ ] No placeholder text: `[TODO]`, `[PLACEHOLDER]`, `TBD`, `xxx`
- [ ] Code blocks have language hints

### Agents (`.claude/agents/*.md`)

**Structure validation:**
- [ ] YAML frontmatter has opening and closing `---` delimiters
- [ ] Required field: `name` (lowercase, numbers, hyphens only, max 64 chars)
- [ ] Required field: `description` (max 1024 chars, no XML tags)
- [ ] No examples or XML tags in description field (must be in body)

**Field validation (agents use different fields than skills/commands):**
- [ ] If present, `tools:` field lists valid tool names (NOT `allowed-tools:`)
- [ ] If `model:` is present, value must be one of: `sonnet`, `opus`, `haiku`, `inherit`
- [ ] `inherit` is valid and means "use the same model as main conversation"
- [ ] If `model:` is absent, agent inherits by default (this is valid)

**Best practices:**
- [ ] Name uses gerund form matching the activity
- [ ] Description explains when the agent should be invoked
- [ ] Body includes concrete examples of appropriate use
- [ ] If agent references skills, those skills exist
- [ ] Clear scope definition (what it handles vs what it doesn't)

### Slash Commands (`.claude/commands/*.md`)

**Structure validation:**
- [ ] YAML frontmatter has `description` field
- [ ] Description is concise (1-2 sentences)

**Best practices:**
- [ ] Uses `$ARGUMENTS` if command accepts input
- [ ] Handles empty `$ARGUMENTS` case (asks user or uses default)
- [ ] Clear step-by-step instructions
- [ ] No ambiguous decision points left to Claude

### CLAUDE.md / Memory Files

**Structure validation:**
- [ ] Valid markdown syntax
- [ ] No broken internal links

**Best practices:**
- [ ] Clear section organization
- [ ] Actionable instructions (not vague guidance)
- [ ] No contradictory rules

### Reference Files (`references/*.md`)

**Validation:**
- [ ] Valid markdown syntax
- [ ] Referenced by parent SKILL.md or agent
- [ ] No orphaned files (exist but never referenced)

### Scripts (`scripts/*.py`, `scripts/*.sh`, etc.)

**Validation:**
- [ ] Valid syntax for language (parse check)
- [ ] Referenced in SKILL.md or agent
- [ ] Has usage documentation (docstring or header comment)
- [ ] Executable permissions if shell script

---

## Cross-Reference Validation

Tools reference each other. Broken references are real bugs this validator must catch.

### Agent → Skill references
- [ ] If agent has `skills:` field, each skill name exists in `.claude/skills/`
- [ ] Skill names in frontmatter match actual directory names

### Command → Agent references
- [ ] If command body mentions "use the X agent" or "invoke X agent", agent X exists in `.claude/agents/`
- [ ] If command references `/other-command`, that command exists in `.claude/commands/`

### Skill → File references
- [ ] If SKILL.md references `scripts/foo.py`, that file exists in the skill directory
- [ ] If SKILL.md references `references/bar.md`, that file exists in the skill directory
- [ ] If SKILL.md references `templates/baz.md`, that file exists in the skill directory

### Orphan detection
- [ ] No files in skill `scripts/` subdirectory that aren't referenced by SKILL.md
- [ ] No files in skill `references/` subdirectory that aren't referenced by SKILL.md
- [ ] No files in skill `templates/` subdirectory that aren't referenced by SKILL.md

### Related Tools table validation
- [ ] If tool has "Related Tools" section, verify each referenced tool exists
- [ ] Check that command names match actual filenames (e.g., `/fix-issue-status` → `fix-issue-status.md`)
- [ ] Check that agent names match actual filenames (e.g., `issues-housekeeper` → `issues-housekeeper.md`)

---

## Common False Positives to Avoid

**Do NOT flag these as errors:**

| Situation | Why it's valid |
|-----------|----------------|
| Agent using `tools:` instead of `allowed-tools:` | Agents correctly use `tools:` field |
| Agent with `model: inherit` | Valid value meaning "use same model as main conversation" |
| Skill without `model:` field | Skills don't use model fields |
| Command without `name:` field | Commands don't require name (description is the key field) |
| Agent without `allowed-tools:` field | Agents use `tools:`, not `allowed-tools:` |
| Skill using `allowed-tools:` instead of `tools:` | Skills correctly use `allowed-tools:` field |

**Before flagging a field as incorrect:**
1. Verify which tool type the file is (agent vs skill vs command) based on file path
2. Consult the Frontmatter Schemas section above for the correct fields
3. Only flag if the field is genuinely wrong for that specific tool type

---

## Analysis Process

0. **Verify schemas**: Before validating any field names, consult the Frontmatter Schemas section above. Do NOT rely on assumptions or patterns from other tools in the codebase. Each tool type has its own valid fields.
1. **Inventory**: List all tools found in `.claude/`
2. **Classify**: Determine each tool's type based on file path (`.claude/agents/` = agent, `.claude/skills/` = skill, `.claude/commands/` = command)
3. **Validate**: Run all applicable checks for each tool, using the correct schema for that tool type
4. **Categorize findings**:
   - **ERRORS**: Broken functionality (missing required fields, invalid syntax, broken links)
   - **WARNINGS**: Functional but non-conforming to best practices
   - **SUGGESTIONS**: Optimization opportunities
5. **Prioritize**: For each tool, identify top 3 highest-ROI improvements

## Output Format

### Console Summary

Provide a brief summary to the user:

````markdown
## Validation Results

Scanned: X skills, Y agents, Z commands, W other files

### Errors (must fix)

| Tool | Issue | Suggested Fix |
|------|-------|---------------|
| [tool-name] | [description of error] | [specific fix instruction] |

Example:
| my-agent | Uses `allowed-tools:` instead of `tools:` | Change line 4: `allowed-tools:` → `tools:` |
| my-skill | Missing `description` field | Add `description: Brief summary of what this does and when to use it` |

### Warnings (should fix)

| Tool | Issue | Suggested Fix |
|------|-------|---------------|
| [tool-name] | [description of issue] | [specific fix instruction] |

### Cross-Reference Issues (if any)

| Source | References | Problem |
|--------|------------|---------|
| [tool-name] | [referenced item] | [missing/broken/orphaned] |

### Top Improvements
1. [highest impact change]
2. [second highest]
3. [third highest]

Full analysis written to: CLAUDE_MEMO_AI_TOOLS_REVIEW.md
````

### Technical Memo (CLAUDE_MEMO_AI_TOOLS_REVIEW.md)

Create a detailed markdown file with this structure:

````markdown
# Claude AI Tools Review

**Generated:** [timestamp]
**Scope:** [path validated]

## Executive Summary

[2-3 sentence overview of findings]

## Inventory

| Type | Count | With Errors | With Warnings |
|------|-------|-------------|---------------|
| Skills | X | Y | Z |
| Agents | X | Y | Z |
| Commands | X | Y | Z |
| Other | X | Y | Z |

## Detailed Findings

### Skills

#### [skill-name]
**Status:** [PASS | WARNINGS | ERRORS]

**Errors:**
- [list any errors]

**Warnings:**
- [list any warnings]

**Top 3 Improvements:**
1. [improvement + why it matters]
2. [improvement + why it matters]
3. [improvement + why it matters]

[Repeat for each skill]

### Agents

[Same format as skills]

### Commands

[Same format as skills]

## Global Recommendations

[Cross-cutting improvements that affect multiple tools]

## Checklist for Fixes

- [ ] [specific action item]
- [ ] [specific action item]
- [ ] [specific action item]
````

## Common Fix Templates

Include these copy-paste ready fixes in the memo when applicable:

### Missing description (for skills/agents)
```yaml
description: [What it does]. Use when [trigger conditions/keywords].
```

### Convert allowed-tools to tools (for agents)
```diff
- allowed-tools: Read, Write
+ tools: Read, Write
```

### Convert tools to allowed-tools (for skills/commands)
```diff
- tools: Read, Write
+ allowed-tools: Read, Write
```

### Add missing Source section (for issues)
```markdown
## Source
This issue is part of the work defined in: `../specs/SPEC_{name}.md`
```

### Fix model field (invalid value)
```diff
- model: gpt-4
+ model: sonnet
```
Valid values: `sonnet`, `opus`, `haiku`, `inherit`

### Add argument handling (for commands)
```markdown
**Input:** `$ARGUMENTS` — [description of expected input]

If `$ARGUMENTS` is empty, [ask user for input OR use default behavior].
```

---

## Future Enhancement: Auto-Fix Mode

> **Not yet implemented.** When available, `/validate-claude-tools --fix` will automatically correct:
> - Field name mismatches (`allowed-tools` ↔ `tools`)
> - Missing required fields (with templates)
> - Format inconsistencies (array vs comma-separated)
> - Broken cross-references (suggest closest match)

---

## Validation

After creating the memo, confirm:
1. `CLAUDE_MEMO_AI_TOOLS_REVIEW.md` exists in project root
2. All errors are clearly actionable with specific fix instructions
3. Summary was provided to user with tabular format
4. Cross-reference issues are identified and reported