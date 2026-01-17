---
description: Generate a situational report showing what's new since your last sitrep
argument-hint: "[--full]"
---

## Invoke Skill

Use the Skill tool to load the sitrep skill:

```
Skill: sitrep
Args: $ARGUMENTS
```

The skill handles state management, data gathering, and report generation.

**Arguments:**
- `--full` - Ignore cursor, show full report (useful for first day on project)
