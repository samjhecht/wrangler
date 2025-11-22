---
name: wrangler:implement
description: Autonomously implement tasks from specs, plans, or issues using subagents with TDD and code review
---

You are implementing work using the implement skill.

## Parse Scope

Analyze the user's message to determine what to implement:

**If they specified a file:**
- Pattern: `*.md` file reference
- Examples: `spec-auth.md`, `plan-refactor.md`, `plans/plan-feature.md`
- Extract: file path

**If they specified issue(s):**
- Pattern: `issue #N`, `issue N`, `issues N-M`, `issues N,M,O`
- Examples: `issue #42`, `issues 5-7`, `issues 3,5,8`
- Extract: issue ID(s)

**If no scope specified:**
- User just typed `/wrangler:implement`
- Skill will infer from conversation context
- No extraction needed

## Load Skill

Invoke the implement skill using the Skill tool:

```
Skill: wrangler:implement
```

The skill will:
1. Parse the scope (using your analysis above or infer from context)
2. Load tasks from spec/plan/issues
3. Create TodoWrite tracking
4. Execute all tasks autonomously via subagents
5. Handle code review and fixes automatically
6. Only stop for genuine blockers
7. Present completion summary when done

## Important

You MUST complete all tasks in the scope before returning to the user, unless you hit a genuine blocker (unclear requirements, flummoxed agents, missing dependencies).

Do NOT stop to ask "should I continue?" between tasks - that's the whole point of autonomous execution.
