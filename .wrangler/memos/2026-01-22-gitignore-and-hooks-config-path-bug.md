# Critical Bug: hooks-config.json Path Inconsistency

**Date:** 2026-01-22
**Severity:** HIGH
**Status:** NEEDS FIX
**Impact:** Git hooks framework will create config in wrong location (gitignored directory)

## Problem Summary

The setup-git-hooks skill and its hook templates use **`.wrangler/config/hooks-config.json`** but ALL official documentation specifies **`.wrangler/hooks-config.json`** (at root of .wrangler/).

This is a critical bug because:
1. `.wrangler/config/` is in gitignorePatterns (will be gitignored)
2. Config file should be tracked by git (Pattern A) for consistency
3. All documentation contradicts the implementation

## Evidence

### Correct Location (17+ references)

**Specification (SPEC-000041):**
- Line 399: "Location: `.wrangler/hooks-config.json` (in user's project)"
- 17 total references to `.wrangler/hooks-config.json`
- 0 references to `.wrangler/config/hooks-config.json`

**Documentation:**
- `docs/git-hooks.md`: "Configuration is stored in `.wrangler/hooks-config.json`"
- `CLAUDE.md`: "Configuration stored in `.wrangler/hooks-config.json`"
- All other documentation uses `.wrangler/hooks-config.json`

### Incorrect Location (15+ references)

**Implementation Files:**
- `skills/setup-git-hooks/SKILL.md` - 9 occurrences of wrong path
- `skills/setup-git-hooks/templates/pre-commit.template.sh` - 3 occurrences
- `skills/setup-git-hooks/templates/pre-push.template.sh` - 3 occurrences
- `skills/setup-git-hooks/templates/commit-msg.template.sh` - 1 occurrence

## Why This Matters

### Pattern A Behavior (Current Spec)

```
.wrangler/
├── hooks-config.json          # Configuration (SHOULD be tracked)
└── config/                     # Runtime config directory (gitignored)
```

**Expected:**
- `hooks-config.json` at .wrangler/ root
- Tracked by git (team shares same config)
- Updated via update-git-hooks skill

### Current Broken Behavior (Implementation)

```
.wrangler/
└── config/
    └── hooks-config.json      # Configuration (GITIGNORED!)
```

**Actual:**
- `hooks-config.json` in gitignored directory
- Not tracked by git (lost on clone)
- Config disappears for team members

## Files Requiring Fix

### High Priority (Implementation)

1. **`skills/setup-git-hooks/SKILL.md`** (9 fixes)
   - Line 27: Description
   - Line 51: Check command
   - Line 115: Note
   - Line 132: Stub config location
   - Line 201: Pattern A description
   - Line 321: Write tool instruction
   - Line 473: Verification command
   - Line 476: Cat command
   - Line 505: File listing

2. **`skills/setup-git-hooks/templates/pre-commit.template.sh`** (3 fixes)
   - Line 4: Comment
   - Line 66: Check if exists
   - Line 67: Read setupComplete flag

3. **`skills/setup-git-hooks/templates/pre-push.template.sh`** (3 fixes)
   - Line 4: Comment
   - Line 67: Check if exists
   - Line 68: Read setupComplete flag
   - Line 82: Warning message

4. **`skills/setup-git-hooks/templates/commit-msg.template.sh`** (1 fix)
   - Line 4: Comment

### Medium Priority (Derived/Generated)

5. **`skills/update-git-hooks/SKILL.md`** - Verify consistency
6. **`commands/setup-git-hooks.md`** - Verify consistency
7. **`commands/update-git-hooks.md`** - Verify consistency

## Recommended Fix

### Search and Replace

Replace all instances of:
```
.wrangler/config/hooks-config.json
```

With:
```
.wrangler/hooks-config.json
```

### Files to Update

```bash
# Fix skill documentation
skills/setup-git-hooks/SKILL.md

# Fix templates
skills/setup-git-hooks/templates/pre-commit.template.sh
skills/setup-git-hooks/templates/pre-push.template.sh
skills/setup-git-hooks/templates/commit-msg.template.sh
```

### Verification After Fix

```bash
# Should return 0 results
grep -r "\.wrangler/config/hooks-config" skills/setup-git-hooks/

# Should return many results
grep -r "\.wrangler/hooks-config\.json" skills/setup-git-hooks/
```

## Impact Assessment

### If Not Fixed

1. **User runs `/wrangler:setup-git-hooks`**
   - Config created at `.wrangler/config/hooks-config.json`
   - Config is gitignored (in gitignorePatterns)
   - Config not shared with team

2. **Team member clones repo**
   - No hooks-config.json (was gitignored)
   - Hooks fail with "config not found"
   - Must re-run setup (defeats Pattern A purpose)

3. **User runs `/wrangler:update-git-hooks`**
   - Skill expects `.wrangler/hooks-config.json`
   - File doesn't exist (created in wrong location)
   - Update fails

### After Fix

1. **User runs `/wrangler:setup-git-hooks`**
   - Config created at `.wrangler/hooks-config.json`
   - Config is tracked by git
   - Team shares same config

2. **Team member clones repo**
   - hooks-config.json present
   - Can run hooks immediately (Pattern A)
   - Consistent across team

3. **User runs `/wrangler:update-git-hooks`**
   - Finds config at correct location
   - Updates successfully

## Related Issues

### .wrangler/.gitignore Template

The gitignore template is correct but creates confusion:

```gitignore
# Runtime data (don't commit)
cache/
config/
logs/
metrics/
```

**Key Point:** The `config/` pattern ignores `.wrangler/config/` directory, NOT `.wrangler/config` files at root.

This means:
- `.wrangler/config/` directory → IGNORED
- `.wrangler/hooks-config.json` → TRACKED (correct location)

### Pattern A vs Pattern B Confusion

**Pattern A:** Config at `.wrangler/hooks-config.json` (tracked)
**Pattern B:** Config at `.wrangler/hooks-config.json` (tracked) + hooks at `.wrangler/git-hooks/` (tracked)

Both patterns track the config file. The difference is where hooks themselves are stored:
- Pattern A: `.git/hooks/` (not tracked, generated from templates)
- Pattern B: `.wrangler/git-hooks/` (tracked, symlinked to `.git/hooks/`)

## Conclusion

This is a **critical documentation/implementation bug** that must be fixed before the git-hooks framework is usable.

**Action Required:**
1. Fix 4 files (SKILL.md + 3 templates)
2. Change 16 instances of wrong path
3. Test that hooks-config.json is created at `.wrangler/hooks-config.json`
4. Verify file is tracked by git

**Estimated Effort:** 15 minutes (simple search-replace)

**Risk if Not Fixed:** Git hooks framework completely broken for Pattern A (default)
