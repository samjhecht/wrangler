# Git Worktree Pitfalls with Claude Code

This document explains why changes can "bleed" from worktrees back to the main branch and how to prevent it.

## The Root Cause

Claude Code's Bash tool resets the working directory between calls. This is a fundamental characteristic:

```bash
# Call 1
cd /path/to/worktree
# Shell exits, directory change is lost

# Call 2 - starts in ORIGINAL directory, not worktree
git status  # This runs in main repo!
```

## Why This Causes Bleeding

### Scenario: Implementation in Worktree

1. You create a worktree at `.worktrees/feature-auth`
2. You dispatch a subagent to implement a feature
3. Subagent runs `git commit -m "Add auth"`
4. **Commit lands in main branch** because subagent's Bash call started in main repo directory

### The Invisible Problem

The subagent might report success:
```
Committed: abc123
All tests passing
```

But if you check main branch, you'll find those commits there instead of in the worktree.

## The Solution: Command Chaining

### Wrong (commands in separate Bash calls)

```bash
cd /path/to/worktree
```

```bash
git add .
```

```bash
git commit -m "message"
```

Each call starts fresh. Only the first one is in the worktree.

### Right (commands chained with &&)

```bash
cd /path/to/worktree && git add . && git commit -m "message"
```

All commands execute in the worktree because they're in the same shell session.

### Alternative: git -C flag

```bash
git -C /path/to/worktree add .
git -C /path/to/worktree commit -m "message"
```

The `-C` flag tells git which directory to operate in.

## Subagent Context Loss

Subagents spawned via the Task tool have zero inherited context. This text in a prompt:

```
Work from: /path/to/worktree
```

Is just documentation. It doesn't make the subagent actually work there.

### Solution: Explicit Verification

Include in every subagent prompt:

```markdown
## Working Directory (CRITICAL)

**Location:** /absolute/path/to/worktree
**Branch:** feature-name

### Verify First (RUN THIS BEFORE ANY WORK)

```bash
cd /absolute/path/to/worktree && \
  echo "Directory: $(pwd)" && \
  echo "Branch: $(git branch --show-current)" && \
  test "$(pwd)" = "/absolute/path/to/worktree" && echo "VERIFIED" || echo "FAILED - STOP"
```

**If verification fails, STOP and report.**

### Command Pattern

ALL commands must use:
```bash
cd /absolute/path/to/worktree && [command]
```
```

## Verification Checklist

### Before Creating Worktree

- [ ] Worktree directory in `.gitignore` (if project-local)
- [ ] Branch not already checked out elsewhere
- [ ] Clean working directory in main repo

### After Creating Worktree

- [ ] Capture absolute path: `WORKTREE="$(pwd -P)"`
- [ ] Store branch name: `BRANCH="$(git branch --show-current)"`
- [ ] Verify with `git worktree list`

### Before Dispatching Subagent

- [ ] Include absolute worktree path in prompt
- [ ] Include expected branch name in prompt
- [ ] Include verification commands with expected output
- [ ] Include command pattern requirement (`cd $PATH && ...`)

### After Subagent Returns

- [ ] Check for "VERIFIED" in output
- [ ] Verify commits are in worktree: `git -C $WORKTREE log --oneline -5`
- [ ] Verify main branch unchanged: `git log --oneline -5`

## Common Mistakes

### Mistake 1: Assuming cd persists

```bash
cd /worktree  # Works
git status    # WRONG - back in main directory
```

### Mistake 2: Relative paths

```bash
cd .worktrees/feature && git status  # Might work
# But if pwd changes, it won't
```

### Mistake 3: Trusting subagent context

```
Work from: /worktree  # Just text, not enforced
```

### Mistake 4: Not verifying after subagent

Subagent says "committed successfully" but you don't verify WHERE.

## Quick Reference

| Do This | Not This |
|---------|----------|
| `cd /path && git status` | `cd /path` then `git status` |
| `git -C /path status` | `git status` (in wrong dir) |
| Absolute paths | Relative paths |
| Include verification in subagent prompts | "Work from: /path" |
| Verify commits landed in right place | Trust subagent reports |

## Related Skills

- **worktree-isolation** - Full protocol for worktree isolation
- **using-git-worktrees** - Creating and managing worktrees
- **implement** - Implementation with worktree support

## Environment Variables

Git uses these to determine context:

- `GIT_DIR` - Path to .git directory
- `GIT_WORK_TREE` - Root of working tree
- `GIT_COMMON_DIR` - Shared repo data (worktrees only)

**Don't set these manually.** Use `cd && command` or `git -C` instead.

## Testing Your Setup

Run this to verify your understanding:

```bash
# Create test worktree
git worktree add /tmp/test-worktree -b test-branch

# Wrong way - this will NOT work
cd /tmp/test-worktree
pwd  # Shows original directory, not worktree!

# Right way - this WILL work
cd /tmp/test-worktree && pwd  # Shows worktree path

# Clean up
git worktree remove /tmp/test-worktree
```

## Summary

1. **Chain commands:** `cd /worktree && git [command]`
2. **Use absolute paths:** Never relative
3. **Verify in subagents:** Include verification commands
4. **Check after subagents:** Verify commits landed correctly
5. **Don't trust context:** Always verify explicitly
