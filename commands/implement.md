---
name: wrangler:implement
description: Autonomously implement tasks from specs, plans, or issues using subagents with TDD and code review
---

## Parse User Input

Extract scope from user message if provided:
- File references (*.md) - pass as scope
- Issue references (#N, issue N, issues N-M) - pass as scope
- No scope - skill will infer from context

## Workflow

Use the Skill tool to load the implement skill:

```
Skill: implement
```

The skill contains all workflow logic for autonomous execution with TDD and code review.
