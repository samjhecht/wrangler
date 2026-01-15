---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*), Bash(git push:*), Bash(git branch:*), Bash(git log:*), Bash(git diff:*), Bash(gh pr create:*), Bash(gh pr view:*)
description: Commit changes, push to remote, and create a pull request
---

## Context

- Current git status: !`git status`
- Current git diff (staged and unstaged changes): !`git diff HEAD`
- Current branch: !`git branch --show-current`
- Recent commits: !`git log --oneline -10`
- Remote tracking: !`git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo "No upstream branch"`

## Your task

Based on the above context, complete the following workflow:

### 1. Stage and Commit

- Review the changes shown in the diff
- Stage all relevant changes (use `git add -A` or selectively add files)
- Create a clear, descriptive commit message that:
  - Summarizes the "why" not just the "what"
  - Uses conventional commit format if the project uses it
  - Is concise (1-2 sentences)
- End the commit message with: `Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>`

### 2. Push to Remote

- If on main/master branch, create a new feature branch first
- Push the branch to origin with `-u` flag to set upstream tracking
- If the branch already exists on remote, just push

### 3. Create Pull Request

Create a PR using `gh pr create` with the following structure:

```
gh pr create --title "Brief descriptive title" --body "$(cat <<'EOF'
## Summary

<2-4 bullet points describing what changed and why>

## Changes

<List the key files/components modified>

## Test Plan

<How to verify these changes work - manual steps or test commands>

---
Generated with Claude Code
EOF
)"
```

### 4. Return the PR Link

After creating the PR, output the PR URL so the user can access it directly.

If the PR already exists for this branch, use `gh pr view --web` to open it instead.

## Important Notes

- Never force push to main/master
- Never commit files that contain secrets (.env, credentials, API keys)
- If there are no changes to commit, inform the user and skip the workflow
- If commit fails due to pre-commit hooks, fix issues and retry
