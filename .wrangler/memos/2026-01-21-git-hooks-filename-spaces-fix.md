# Git Hooks: Filename Spaces and Validation Fixes

**Date**: 2026-01-21
**Type**: Bug Fix
**Severity**: Critical (filename spaces), Medium (git root validation)

## Summary

Fixed critical bugs in git hook templates discovered through cross-project audit comparing wrangler implementation with medb project deployment.

## Issues Found and Fixed

### 1. CRITICAL: Unquoted Variable Expansion in File Loops

**Problem**: `for file in $variable` syntax breaks on filenames with spaces.

**Example failure**:
```bash
# File: ".wrangler/issues/ISS-000001-add new feature.md"
for file in $originally_staged_files; do  # Splits on space
    # Loop sees: ".wrangler/issues/ISS-000001-add", "new", "feature.md"
    if [ -f "$file" ]; then  # Always false
        git add "$file"      # Never executes
    fi
done
# Result: Original file doesn't get re-staged after formatting!
```

**Locations**:
- `pre-commit.template.sh:84` - Docs-only check loop
- `pre-commit.template.sh:128` - Re-staging loop after formatting

**Fix**:
```bash
# BEFORE
for file in $originally_staged_files; do
    if [ -f "$file" ]; then
        git add "$file"
    fi
done

# AFTER
echo "$originally_staged_files" | while IFS= read -r file; do
    if [ -z "$file" ]; then
        continue
    fi
    if [ -f "$file" ]; then
        git add "$file"
    fi
done
```

**Why this matters**:
- Wrangler issue/spec files often have spaces: `ISS-000001-implement user authentication.md`
- Without fix: Formatter changes wouldn't be committed
- User would see "working tree clean" but changes missing from commit

### 2. MEDIUM: Missing Git Root Validation

**Problem**: Hooks assumed they were running from git root without explicit verification.

**Risk**: If hook runs from subdirectory, relative paths fail silently.

**Fix**: Added git root validation to both `pre-commit` and `pre-push`:
```bash
# Ensure we're at git repository root
GIT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo "")
if [ -z "$GIT_ROOT" ]; then
    echo "[pre-commit] ERROR: Not in a git repository" >&2
    exit 1
fi
cd "$GIT_ROOT" || exit 1
```

### 3. LOW: Unclear Deleted File Handling

**Problem**: Comment said "re-stage originally staged files" but didn't explain `-f` check.

**Fix**: Added clarifying comment:
```bash
# Re-stage only the originally staged files (not all modified files)
# Note: We check if file exists (-f) to handle deleted files gracefully.
# Deleted files don't need re-staging; their deletion is already staged.
```

## Issues NOT Present in Wrangler

### Re-staging Directory Context Bug (medb had this)

**Good news**: Wrangler hooks don't use `cd` to change directories, so no context confusion.

**Medb issue**: Script did `cd backend/`, then re-staging loop assumed git root context.

**Why wrangler avoided it**: All operations happen from git root, no directory changes.

### Error Suppression with 2>/dev/null

**Good news**: Wrangler templates don't suppress errors unnecessarily.

**Why this matters**: Error messages help users debug hook failures.

## Testing Recommendations

### Manual Test Cases

```bash
# Test 1: File with spaces in name
touch ".wrangler/issues/ISS-999999-test with spaces.md"
echo "content" > ".wrangler/issues/ISS-999999-test with spaces.md"
git add ".wrangler/issues/ISS-999999-test with spaces.md"
echo "change" >> ".wrangler/issues/ISS-999999-test with spaces.md"
git commit -m "test: filename with spaces"
# Expected: File should be re-staged after formatting and committed

# Test 2: Multiple files with spaces
touch "file one.md" "file two.md"
git add "file one.md" "file two.md"
echo "change" >> "file one.md"
echo "change" >> "file two.md"
git commit -m "test: multiple files with spaces"
# Expected: Both files re-staged and committed

# Test 3: Hook from subdirectory
mkdir -p test/subdir
cd test/subdir
touch "../../test.md"
git add "../../test.md"
git commit -m "test: commit from subdirectory"
cd ../..
# Expected: Hook should cd to git root and work correctly

# Test 4: Deleted file with spaces
touch "delete me.md"
git add "delete me.md"
git commit -m "add file"
rm "delete me.md"
git add "delete me.md"
git commit -m "delete file with spaces"
# Expected: Deletion committed, no error about missing file
```

### Automated Testing

Future enhancement: Add integration tests that:
1. Set up temporary git repo
2. Install hooks with test config
3. Create files with spaces
4. Verify correct behavior
5. Clean up

## Files Modified

- `skills/setup-git-hooks/templates/pre-commit.template.sh`
  - Added git root validation (lines 8-17)
  - Fixed docs-only check loop (line 94)
  - Fixed re-staging loop (line 145)
  - Added deleted file comment (lines 142-143)

- `skills/setup-git-hooks/templates/pre-push.template.sh`
  - Added git root validation (lines 8-17)

## Migration Impact

**Existing installations**: Need to run `/wrangler:update-git-hooks` to get fixes.

**New installations**: Get fixed templates automatically.

**Backward compatibility**: 100% - no breaking changes, only bug fixes.

## Validation

- Bash syntax check: `bash -n <file>` - PASSED
- Logic review: Manual inspection - PASSED
- Cross-reference with medb audit findings - COMPLETE

## Related Issues

- Original git hooks PR: #11
- Medb project audit: Identified same unquoted variable expansion bug
- Future: Consider adding shellcheck to CI for template validation

## Lessons Learned

1. **Cross-project audits are valuable** - Medb audit caught bug in wrangler templates
2. **Filenames with spaces are common** - Especially in wrangler's issue/spec naming
3. **Quote all variable expansions** - Even in loops
4. **Explicit validation > implicit assumptions** - Git root check prevents subtle bugs
5. **Comments explain non-obvious logic** - Deleted file handling wasn't clear

## Next Steps

1. Merge this fix
2. Update documentation to mention filename space safety
3. Consider adding automated integration tests
4. Add shellcheck to CI for template validation
