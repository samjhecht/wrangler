# Skill Announcement Format Standard

**Created:** 2025-11-20
**Status:** Active
**Applies to:** All wrangler skills

## Problem

Skill usage was not visually distinct in terminal output, making it difficult for users to:
- Quickly identify when a skill was being used
- Scan conversation history for skill activations
- Verify that Claude actually read and applied the skill

## Solution

Standardized visual format for skill announcements that is highly visible in terminal output.

## Format Specification

```
═══════════════════════════════════════════════════════════
🎯 SKILL: [skill-name]
═══════════════════════════════════════════════════════════
[Brief description of what you're doing with this skill]
```

### Components

1. **Top separator:** 59 equal signs (`═`) for clear visual boundary
2. **Emoji prefix:** 🎯 (target/bullseye) for instant recognition
3. **Skill identifier:** `SKILL: [skill-name]` using the exact skill directory name
4. **Bottom separator:** Matching 59 equal signs
5. **Description:** Brief 1-2 sentence explanation of what the skill is doing

### Character choice rationale

- **`═` (Box Drawing Double Horizontal):**
  - Visually distinct from regular text
  - Different from code block backticks
  - Renders correctly in all terminals
  - Creates strong visual separation

- **🎯 Emoji:**
  - Universal recognition (target = hitting the mark)
  - Color contrast in most terminals
  - Searchable in logs (grep for "🎯")

## Examples

### Example 1: TDD Skill
```
═══════════════════════════════════════════════════════════
🎯 SKILL: test-driven-development
═══════════════════════════════════════════════════════════
Writing failing test first, then implementing minimum code
to pass, following RED-GREEN-REFACTOR cycle.
```

### Example 2: Brainstorming Skill
```
═══════════════════════════════════════════════════════════
🎯 SKILL: brainstorming
═══════════════════════════════════════════════════════════
Refining your idea into a fully-formed design through
structured Socratic questioning before any code is written.
```

### Example 3: Debugging Skill
```
═══════════════════════════════════════════════════════════
🎯 SKILL: systematic-debugging
═══════════════════════════════════════════════════════════
Investigating bug through four-phase framework: root cause
investigation, pattern analysis, hypothesis testing, implementation.
```

## Usage Guidelines

### When to announce

Announce **immediately** when you invoke a skill, before any other output from that skill.

### Where to place

The announcement should be the **first text output** after the Skill tool invocation.

### Description guidelines

- Keep it 1-2 sentences
- Focus on **what** the skill does, not **why** (the user already asked for it)
- Use active voice and present continuous tense
- Be specific about the skill's immediate action

**Good:**
- "Writing failing test first, then implementing feature"
- "Investigating root cause through systematic analysis"
- "Breaking down plan into executable batches with review checkpoints"

**Bad:**
- "I'm going to use TDD" (too vague)
- "This will help ensure code quality" (focuses on why, not what)
- "Implementing feature" (missing the skill-specific approach)

## Implementation

### Location

Updated in `skills/using-wrangler/SKILL.md` in the "Announcing Skill Usage" section.

### Enforcement

The `using-wrangler` skill is loaded at session start via hooks, making this format mandatory for all skill usage.

## Benefits

1. **Instant visibility** - The separator lines create strong visual breaks
2. **Easy scanning** - Users can quickly find skill activations in long conversations
3. **Searchable** - Can grep for "🎯 SKILL:" to find all skill usages
4. **Professional** - Consistent format across all skills
5. **Verification** - Proves Claude read and activated the skill
6. **Context** - Description reminds user what the skill does

## Future Enhancements

Potential improvements to consider:

1. **Skill parameters** - Add a line for skill-specific parameters if needed
2. **Skill status** - Show completion when skill finishes
3. **Nested skills** - Visual indication when one skill invokes another
4. **Skill metrics** - Track skill usage statistics

## Related Files

- `skills/using-wrangler/SKILL.md` - Main skill usage instructions
- All skills in `skills/*/SKILL.md` - Should follow this format when announcing usage
