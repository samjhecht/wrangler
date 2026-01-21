# Git Hooks Enforcement Framework - Test Plan

**Document ID:** TEST-PLAN-GIT-HOOKS
**Created:** 2026-01-21
**Status:** Ready for Execution

## Overview

This document provides a comprehensive testing plan for the Git Hooks Enforcement Framework. It covers all scenarios from the specification and should be executed before release.

## Test Scope

### In Scope

1. Hook installation (Pattern A and B)
2. Pre-commit hook functionality
3. Pre-push hook functionality
4. Commit-msg hook functionality
5. Bypass mechanism
6. Configuration management
7. Cross-project-type support (JS, Python, Go)
8. Integration with governance workflow

### Out of Scope

1. Windows Git Bash (requires Windows environment)
2. Performance benchmarking (requires real test suites)
3. CI/CD integration testing

## Test Scenarios

### Scenario 1: First-Time Setup on Fresh Repository

**Description:** Set up hooks on a project with no existing hooks.

**Prerequisites:**
- Fresh git repository
- No `.wrangler/hooks-config.json`
- No `.git/hooks/pre-commit`

**Steps:**
1. Run `/wrangler:setup-git-hooks`
2. Answer configuration prompts
3. Verify hooks installed

**Expected Results:**
- [ ] `.wrangler/hooks-config.json` created
- [ ] `.git/hooks/pre-commit` exists and is executable
- [ ] `.git/hooks/pre-push` exists and is executable
- [ ] Hooks contain correct test commands

**Test Command:**
```bash
ls -la .git/hooks/pre-commit .git/hooks/pre-push
cat .wrangler/hooks-config.json
```

---

### Scenario 2: Commit with Passing Tests

**Description:** Normal commit where all tests pass.

**Prerequisites:**
- Hooks installed
- All tests passing

**Steps:**
1. Make a code change
2. Stage changes
3. Run `git commit -m "test: verify passing commit"`

**Expected Results:**
- [ ] Pre-commit hook runs
- [ ] Formatter runs (if configured)
- [ ] Linter runs (if configured)
- [ ] Unit tests run
- [ ] All checks pass
- [ ] Commit succeeds

---

### Scenario 3: Commit with Failing Tests

**Description:** Commit blocked when tests fail.

**Prerequisites:**
- Hooks installed
- Introduce failing test

**Steps:**
1. Write failing test
2. Stage changes
3. Run `git commit -m "test: should fail"`

**Expected Results:**
- [ ] Pre-commit hook runs
- [ ] Unit tests run
- [ ] Tests fail
- [ ] Clear error message shown
- [ ] Commit blocked (exit code 1)
- [ ] Remediation steps shown

---

### Scenario 4: User Bypass Enabled

**Description:** Bypass hooks using environment variable.

**Prerequisites:**
- Hooks installed
- Failing test present

**Steps:**
1. Set bypass environment variable
2. Run `WRANGLER_SKIP_HOOKS=1 git commit -m "WIP: bypass test"`

**Expected Results:**
- [ ] Warning message about bypass shown
- [ ] Hooks skipped
- [ ] Commit succeeds despite failing tests

---

### Scenario 5: Agent Cannot Bypass

**Description:** Verify AI agents face enforcement.

**Prerequisites:**
- Hooks installed
- Failing test present

**Steps:**
1. Run commit without setting environment variable
2. Observe behavior

**Expected Results:**
- [ ] Pre-commit hook runs
- [ ] Tests fail
- [ ] Commit blocked
- [ ] Agent cannot set environment variable persistently

**Note:** This scenario is verified by the hook design - agents cannot set persistent environment variables.

---

### Scenario 6: Push to Protected Branch

**Description:** Full tests run when pushing to protected branch.

**Prerequisites:**
- Hooks installed
- `main` is protected branch
- All tests passing

**Steps:**
1. Create commit
2. Run `git push origin main`

**Expected Results:**
- [ ] Pre-push hook runs
- [ ] Full test suite runs
- [ ] All tests pass
- [ ] Push succeeds

---

### Scenario 7: Push to Non-Protected Branch

**Description:** Skip full tests for non-protected branches.

**Prerequisites:**
- Hooks installed
- `feature/test` is not protected

**Steps:**
1. Create commit
2. Run `git push origin feature/test`

**Expected Results:**
- [ ] Pre-push hook runs
- [ ] Detects non-protected branch
- [ ] Full tests skipped
- [ ] Push succeeds

---

### Scenario 8: Docs-Only Changes

**Description:** Skip tests when only documentation changed.

**Prerequisites:**
- Hooks installed
- `skipDocsOnlyChanges: true` in config

**Steps:**
1. Modify only `README.md`
2. Stage changes
3. Run `git commit -m "docs: update readme"`

**Expected Results:**
- [ ] Pre-commit hook runs
- [ ] Docs-only change detected
- [ ] Tests skipped
- [ ] Commit succeeds

---

### Scenario 9: Update Configuration

**Description:** Update existing hook configuration.

**Prerequisites:**
- Hooks already installed

**Steps:**
1. Run `/wrangler:update-git-hooks`
2. Change test command
3. Verify hooks regenerated

**Expected Results:**
- [ ] Current config displayed
- [ ] New values accepted
- [ ] Config file updated
- [ ] Hooks regenerated
- [ ] New test command used in hooks

---

### Scenario 10: Initialize Governance with Hooks

**Description:** Hooks offered during governance initialization.

**Prerequisites:**
- No governance files
- No hooks

**Steps:**
1. Run `/wrangler:initialize-governance`
2. Select "Yes" for git hooks
3. Complete governance setup

**Expected Results:**
- [ ] Git hooks question asked
- [ ] setup-git-hooks skill invoked
- [ ] Hooks installed
- [ ] Governance files created
- [ ] TESTING.md created

---

### Scenario 11: Pattern B Installation

**Description:** Version-controlled hooks pattern.

**Prerequisites:**
- Fresh repository

**Steps:**
1. Run `/wrangler:setup-git-hooks`
2. Select Pattern B
3. Run install script

**Expected Results:**
- [ ] `.wrangler/git-hooks/` directory created
- [ ] Hooks files created in git-hooks directory
- [ ] `scripts/install-hooks.sh` created
- [ ] Symlinks created in `.git/hooks/`
- [ ] Hooks work via symlinks

---

## Project Type Testing

### JavaScript/TypeScript Project

**Test commands:**
- `testCommand: "npm test"`
- `formatCommand: "npm run format"`
- `lintCommand: "npm run lint"`

**Verification:**
- [ ] package.json detected
- [ ] Correct defaults suggested
- [ ] npm commands work in hooks

---

### Python Project

**Test commands:**
- `testCommand: "pytest"`
- `formatCommand: "black ."`
- `lintCommand: "flake8"`

**Verification:**
- [ ] pyproject.toml or setup.py detected
- [ ] Correct defaults suggested
- [ ] pytest commands work in hooks

---

### Go Project

**Test commands:**
- `testCommand: "go test ./..."`
- `formatCommand: "go fmt ./..."`
- `lintCommand: "golangci-lint run"`

**Verification:**
- [ ] go.mod detected
- [ ] Correct defaults suggested
- [ ] go commands work in hooks

---

## Platform Compatibility

### macOS

**Verification:**
- [ ] Hooks execute correctly
- [ ] Permissions work
- [ ] Symlinks work (Pattern B)

### Linux

**Verification:**
- [ ] Hooks execute correctly
- [ ] Permissions work
- [ ] Symlinks work (Pattern B)

### Windows Git Bash

**Verification:**
- [ ] Hooks execute correctly
- [ ] Permissions work
- [ ] Symlinks may require admin/developer mode

---

## Performance Targets

| Hook | Target | Acceptable |
|------|--------|------------|
| Pre-commit | < 15 seconds | < 30 seconds |
| Pre-push | < 5 minutes | < 10 minutes |
| Commit-msg | < 1 second | < 2 seconds |

---

## Error Handling

### Missing Test Command

**Expected:** Hook warns but continues if test command not configured.

### Invalid Configuration

**Expected:** Setup skill validates before saving.

### Permission Issues

**Expected:** Clear error message with `chmod +x` instructions.

---

## Test Execution Record

| Scenario | Status | Date | Notes |
|----------|--------|------|-------|
| 1. Fresh setup | PENDING | | |
| 2. Passing commit | PENDING | | |
| 3. Failing commit | PENDING | | |
| 4. User bypass | PENDING | | |
| 5. Agent no bypass | PENDING | | |
| 6. Protected push | PENDING | | |
| 7. Non-protected push | PENDING | | |
| 8. Docs-only | PENDING | | |
| 9. Update config | PENDING | | |
| 10. Governance init | PENDING | | |
| 11. Pattern B | PENDING | | |

---

## Sign-Off

**Prepared by:** Claude (AI Assistant)
**Date:** 2026-01-21

**Reviewed by:** _________________
**Date:** _________________

**Approved by:** _________________
**Date:** _________________

---

*This test plan should be executed in a sandboxed environment before production deployment.*
