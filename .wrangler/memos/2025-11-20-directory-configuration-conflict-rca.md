# Root Cause Analysis: Directory Configuration Conflicts

**Date:** November 20, 2025
**Issue:** Claude Code creating files in legacy directories (`issues/`, `specifications/`, `memos/`) instead of new `.wrangler/` structure
**Impact:** Files being created at project root instead of centralized `.wrangler/` directory
**Status:** Identified root causes, proposed fixes

---

## Executive Summary

Claude Code is creating files in the wrong directories due to **three conflicting configuration sources**:

1. **MCP Server hardcoded defaults** pointing to legacy directories
2. **CLAUDE.md documentation** referencing legacy directory structure
3. **Environment variables in plugin.json** using legacy paths

The v1.1.0 migration to `.wrangler/` was incomplete, leaving multiple configuration points still pointing to the old structure.

---

## Root Causes

### Root Cause #1: MCP Server Hardcoded Defaults

**Location:** `mcp/server.ts:74-84`

**Issue:**
```typescript
const providerConfig: WranglerMCPConfig = {
  ...this.config,
  issues: this.config.issues || {
    provider: 'markdown',
    settings: {
      basePath: this.config.workspaceRoot || process.cwd(),
      issuesDirectory: '.wrangler/issues',  // ✅ CORRECT
    },
  },
};
```

The server code has the **correct** hardcoded default (`.wrangler/issues`), BUT this is being **overridden** by environment variables from `plugin.json`.

**Why this is a problem:**
- Hardcoded defaults never take effect because env vars always override them
- Developers might update server.ts thinking it will change behavior, but it won't

---

### Root Cause #2: Environment Variables in plugin.json

**Location:** `.claude-plugin/plugin.json:15-18`

**Issue:**
```json
"env": {
  "WRANGLER_MCP_DEBUG": "false",
  "WRANGLER_ISSUES_DIRECTORY": "issues",          // ❌ WRONG - should be ".wrangler/issues"
  "WRANGLER_SPECIFICATIONS_DIRECTORY": "specifications"  // ❌ WRONG - should be ".wrangler/specifications"
}
```

**Why this is the primary cause:**
- These environment variables are read by the MCP server on startup
- They override any hardcoded defaults in `server.ts`
- This is what's actually controlling where files are created

**Evidence:**
The MCP provider uses these env vars to determine directory paths.

---

### Root Cause #3: CLAUDE.md Documentation References

**Location:** `CLAUDE.md:94-100`

**Issue:**
```markdown
├── issues/                        # Issue tracking (git-tracked)
├── specifications/                # Feature specs (git-tracked)
│
├── memos/                         # Reference material, lessons learned, RCA archives
├── docs/                          # User-facing product documentation
```

**Why this is a problem:**
- Documentation shows legacy structure at project root
- Claude Code reads CLAUDE.md as authoritative guidance
- Creates cognitive confusion about "correct" directory structure
- Global `~/.claude/CLAUDE.md` and project `CLAUDE.md` both have similar guidance about `memos/`, `docs/`, etc. at root

**Impact:**
Even if MCP tools create issues in `.wrangler/issues/`, the documentation instructs creating memos in `memos/` (not `.wrangler/memos/`).

---

### Root Cause #4: Session Hook Creates Both Structures

**Location:** `hooks/session-start.sh:19-31`

**Issue:**
```bash
# Check if already initialized (either legacy or new structure)
if [ -d "${GIT_ROOT}/.wrangler/issues" ] || [ -d "${GIT_ROOT}/issues" ]; then
    # Already initialized - skip
    return 0
fi

# Create new .wrangler/ directory structure (v1.1.0)
mkdir -p "${GIT_ROOT}/.wrangler/issues"
mkdir -p "${GIT_ROOT}/.wrangler/specifications"
mkdir -p "${GIT_ROOT}/.wrangler/memos"
```

**Why this is a problem:**
- Creates `.wrangler/` directories automatically
- But doesn't prevent or migrate existing legacy directories
- If legacy directories already exist, initialization is skipped
- Creates **both** structures in some projects

**Impact:**
- Ambiguity about which directory structure to use
- Files can end up in either location depending on when they're created

---

## Configuration Flow Analysis

### Current (Broken) Flow

```
1. session-start.sh runs
   └─> Creates .wrangler/issues, .wrangler/specifications, .wrangler/memos

2. MCP server starts
   └─> Reads plugin.json env vars
       └─> WRANGLER_ISSUES_DIRECTORY = "issues" (legacy)
       └─> WRANGLER_SPECIFICATIONS_DIRECTORY = "specifications" (legacy)
   └─> Ignores hardcoded defaults in server.ts
   └─> Creates provider pointing to {workspaceRoot}/issues/

3. Claude Code reads CLAUDE.md
   └─> Sees: "memos/ - Reference material"
   └─> Thinks: memos go in {projectRoot}/memos/

4. File creation
   ✅ MCP tools (issues_create) → issues/ (legacy, because of env vars)
   ❌ Direct file writes (memos) → memos/ (legacy, because of CLAUDE.md)
   ❌ Direct file writes (specs) → specifications/ (legacy)
```

### Desired (Fixed) Flow

```
1. session-start.sh runs
   └─> Creates .wrangler/ structure
   └─> Migrates legacy directories if they exist

2. MCP server starts
   └─> Reads plugin.json env vars
       └─> WRANGLER_ISSUES_DIRECTORY = ".wrangler/issues" ✅
       └─> WRANGLER_SPECIFICATIONS_DIRECTORY = ".wrangler/specifications" ✅
   └─> Creates provider pointing to {workspaceRoot}/.wrangler/issues/

3. Claude Code reads CLAUDE.md
   └─> Sees: ".wrangler/memos/ - Reference material"
   └─> Thinks: memos go in {projectRoot}/.wrangler/memos/

4. File creation
   ✅ MCP tools (issues_create) → .wrangler/issues/
   ✅ Direct file writes (memos) → .wrangler/memos/
   ✅ Direct file writes (specs) → .wrangler/specifications/
```

---

## Evidence

### Evidence 1: Git Status Shows Legacy Files

```
?? issues/
?? specifications/
```

These directories exist at project root, indicating files are being created there.

### Evidence 2: Plugin Configuration Uses Legacy Paths

From `.claude-plugin/plugin.json`:
```json
"WRANGLER_ISSUES_DIRECTORY": "issues",
"WRANGLER_SPECIFICATIONS_DIRECTORY": "specifications"
```

These are relative paths without `.wrangler/` prefix.

### Evidence 3: Documentation Inconsistency

**CLAUDE.md shows both structures:**
- Architecture diagram: Shows `issues/`, `specifications/`, `memos/` at root
- Session hook description: Says it "Auto-initializes `.wrangler/`"

**This creates confusion.**

---

## Impact Assessment

### Current Impact

**High Priority:**
- Files created in wrong locations (root instead of `.wrangler/`)
- Scattered file organization
- Migration confusion for existing projects
- Inconsistent developer experience

**Medium Priority:**
- Documentation confusion
- Harder to maintain .gitignore rules
- Projects end up with both directory structures

**Low Priority:**
- Aesthetic/organizational preferences

### User Experience Impact

**For new projects:**
- Session hook creates `.wrangler/` structure
- MCP tools create issues in legacy `issues/` directory
- Manual file creation follows CLAUDE.md guidance → legacy `memos/`
- **Result:** Mixed structure, confusing

**For existing projects (pre-v1.1.0):**
- Already have legacy `issues/`, `specifications/`, `memos/`
- Session hook skips initialization
- Migration never happens
- **Result:** Stuck on legacy structure forever

---

## Proposed Fixes

### Fix #1: Update plugin.json Environment Variables (CRITICAL)

**File:** `.claude-plugin/plugin.json`

**Change:**
```diff
  "env": {
    "WRANGLER_MCP_DEBUG": "false",
-   "WRANGLER_ISSUES_DIRECTORY": "issues",
+   "WRANGLER_ISSUES_DIRECTORY": ".wrangler/issues",
-   "WRANGLER_SPECIFICATIONS_DIRECTORY": "specifications"
+   "WRANGLER_SPECIFICATIONS_DIRECTORY": ".wrangler/specifications"
  }
```

**Priority:** P0 (Critical)
**Impact:** Fixes MCP tool file creation immediately
**Risk:** Low - backward compatible if migration runs first

---

### Fix #2: Update CLAUDE.md Documentation

**File:** `CLAUDE.md`

**Changes needed:**

1. **Architecture diagram** (lines 58-100):
```diff
  wrangler/
+ ├── .wrangler/                   # Centralized wrangler workspace (v1.1.0+)
+ │   ├── issues/                  # Issue tracking (git-tracked)
+ │   ├── specifications/          # Feature specs (git-tracked)
+ │   ├── memos/                   # Reference material, RCA archives
+ │   ├── governance/              # Constitution, roadmap, next steps
+ │   ├── docs/                    # Auto-generated governance docs
+ │   ├── cache/                   # Runtime cache (gitignored)
+ │   └── config/                  # Runtime config (gitignored)
+ │
  ├── skills/                      # Skills library
- ├── issues/                      # Issue tracking (LEGACY - use .wrangler/issues)
- ├── specifications/              # Feature specs (LEGACY - use .wrangler/specifications)
- ├── memos/                       # LEGACY - use .wrangler/memos
```

2. **File Organization Guidelines** (lines 120-200):
```diff
- **`memos/` - Reference Material & Lessons Learned**
+ **`.wrangler/memos/` - Reference Material & Lessons Learned**
```

Update all examples to use `.wrangler/memos/` prefix.

**Priority:** P0 (Critical)
**Impact:** Prevents Claude Code from creating files in wrong locations
**Risk:** Low - documentation only

---

### Fix #3: Update Global CLAUDE.md (~/.claude/CLAUDE.md)

**File:** `~/.claude/CLAUDE.md`

**Changes needed:**

Same as Fix #2 - update all references from:
- `memos/` → `.wrangler/memos/`
- `docs/` → keep at root (user-facing docs should stay visible)
- `devops/docs/` → keep at root (or clarify this is project-level, not wrangler-level)

**Note:** The global CLAUDE.md file organization guidelines are meant for **project-level** directories (not wrangler's internal structure).

**Recommendation:**
- Keep `docs/` and `devops/docs/` in global CLAUDE.md (these are project-level)
- Remove `memos/` from global CLAUDE.md (or clarify it's project-specific, not wrangler-specific)
- Add note: "If using wrangler, wrangler-specific files go in `.wrangler/`"

**Priority:** P1 (High)
**Impact:** Clarifies wrangler-specific vs project-specific file organization
**Risk:** Medium - affects all projects using global config

---

### Fix #4: Update Session Hook to Prevent Legacy Structure

**File:** `hooks/session-start.sh`

**Change logic:**
```diff
  # Check if already initialized (either legacy or new structure)
- if [ -d "${GIT_ROOT}/.wrangler/issues" ] || [ -d "${GIT_ROOT}/issues" ]; then
+ if [ -d "${GIT_ROOT}/.wrangler/issues" ]; then
      # Already initialized - skip
      return 0
  fi
+
+ # Check for legacy structure - trigger migration
+ if [ -d "${GIT_ROOT}/issues" ] || [ -d "${GIT_ROOT}/specifications" ] || [ -d "${GIT_ROOT}/memos" ]; then
+     # Migration needed - output instruction
+     echo "<important-reminder>MIGRATION REQUIRED</important-reminder>"
+     return 0
+ fi
```

**Already implemented!** The session hook already does this (lines 87-99).

**No action needed.**

---

### Fix #5: Update organize-root-files Skill

**File:** `skills/organize-root-files/SKILL.md`

**Current behavior:**
- Moves files from project root to `memos/`, `docs/`, `devops/docs/`

**Needed change:**
- For **wrangler projects specifically**, move to `.wrangler/memos/`
- For **general projects**, keep `memos/` at root (as specified in global CLAUDE.md)

**Recommendation:**
- Add detection: "Is this a wrangler-enabled project?"
- If yes: use `.wrangler/memos/`
- If no: use `memos/` at root

**Priority:** P2 (Medium)
**Impact:** Prevents creating legacy directories during cleanup
**Risk:** Low - skill-specific

---

## Recommended Implementation Order

### Phase 1: Immediate Fixes (Today)

1. **Update `.claude-plugin/plugin.json`** (Fix #1)
   - Change env vars to point to `.wrangler/` directories
   - Rebuild MCP server: `npm run build:mcp`

2. **Update `CLAUDE.md`** (Fix #2)
   - Update architecture diagram
   - Update file organization examples
   - Mark legacy directories as deprecated

### Phase 2: Global Configuration (This Week)

3. **Update `~/.claude/CLAUDE.md`** (Fix #3)
   - Clarify wrangler-specific vs project-specific organization
   - Add note about `.wrangler/` for wrangler projects

4. **Update `organize-root-files` skill** (Fix #5)
   - Add wrangler project detection
   - Use `.wrangler/memos/` for wrangler projects

### Phase 3: Testing & Validation

5. **Test new project initialization**
   - Create fresh project
   - Verify `.wrangler/` directories created
   - Verify MCP tools create files in correct location
   - Verify manual file creation follows guidance

6. **Test migration scenario**
   - Project with legacy `issues/`, `specifications/`, `memos/`
   - Run migration
   - Verify files moved to `.wrangler/`

---

## Verification Plan

### After Fix #1 (plugin.json)

**Test:**
```bash
# Clean rebuild
npm run build:mcp

# Start fresh session
# Create issue via MCP tool
# Verify file location
ls -la .wrangler/issues/
```

**Expected:** Issue file appears in `.wrangler/issues/`, not `issues/`

### After Fix #2 (CLAUDE.md)

**Test:**
- Ask Claude Code to create a memo
- Verify it creates in `.wrangler/memos/`

**Expected:** File created at `.wrangler/memos/YYYY-MM-DD-topic.md`

### Full Integration Test

**Scenario:**
1. Fresh project (no wrangler directories)
2. Start Claude Code session
3. Create issue via MCP tool
4. Create specification via MCP tool
5. Ask Claude Code to create a memo

**Expected:**
```
.wrangler/
├── issues/000001-test-issue.md
├── specifications/000001-test-spec.md
└── memos/2025-11-20-test-memo.md
```

**No files at root** (except standard files like README.md)

---

## Lessons Learned

### Lesson 1: Environment Variables Override Everything

**What happened:**
- Updated hardcoded defaults in `server.ts`
- Forgot to update `plugin.json` env vars
- Env vars silently overrode defaults

**Prevention:**
- Document configuration precedence clearly
- Add comments in code: "// Note: Overridden by WRANGLER_ISSUES_DIRECTORY env var"
- Consider removing hardcoded defaults entirely if env vars always override

### Lesson 2: Documentation is Code

**What happened:**
- Updated code for v1.1.0
- Forgot to update CLAUDE.md documentation
- Claude Code followed outdated documentation

**Prevention:**
- Treat documentation updates as part of feature implementation
- Include "Update CLAUDE.md" in migration checklist
- Automated checks for documentation consistency

### Lesson 3: Multiple Sources of Truth Create Confusion

**What happened:**
- Three places defined directory structure:
  1. `server.ts` hardcoded defaults
  2. `plugin.json` environment variables
  3. `CLAUDE.md` documentation
- They disagreed after v1.1.0 migration

**Prevention:**
- Single source of truth for configuration
- Other places reference or override, never duplicate
- Configuration hierarchy documentation

### Lesson 4: Migration Requires Complete Coordination

**What happened:**
- Created migration skill
- Created new directory structure
- Forgot to update configuration to use new structure

**Prevention:**
- Migration checklist must include:
  - [ ] Code changes
  - [ ] Configuration updates
  - [ ] Documentation updates
  - [ ] Skill updates
  - [ ] Environment variable updates
  - [ ] Testing

---

## Related Issues

- **Migration detector skill** (exists) - Detects need for migration
- **Migration executor skill** (exists) - Performs migration
- **Session hook** (exists) - Initializes `.wrangler/` structure

**Gap:** Even with migration completed, new files created in legacy locations due to configuration conflicts.

---

## Next Steps

1. **Implement Fix #1** (plugin.json) - IMMEDIATE
2. **Implement Fix #2** (CLAUDE.md) - IMMEDIATE
3. **Test in fresh session** - Verify fixes work
4. **Implement Fix #3** (global CLAUDE.md) - Within 24 hours
5. **Implement Fix #5** (organize-root-files) - Within week
6. **Document configuration hierarchy** - For future reference

---

## Appendix: Configuration Hierarchy

### Current Precedence (Actual Behavior)

```
1. Environment variables (plugin.json)       [HIGHEST PRIORITY]
2. Hardcoded defaults (server.ts)           [NEVER USED - always overridden]
3. Documentation (CLAUDE.md)                 [Used for manual file creation]
```

### Recommended Precedence (Post-Fix)

```
1. Environment variables (plugin.json)       [HIGHEST PRIORITY]
   → Set to ".wrangler/issues", ".wrangler/specifications"

2. Documentation (CLAUDE.md)                 [MEDIUM PRIORITY]
   → Updated to match env vars

3. Hardcoded defaults (server.ts)           [FALLBACK ONLY]
   → Kept for safety, but should match env vars
```

---

**Document Version:** 1.0
**Author:** Claude Code (Root Cause Analysis)
**Status:** Analysis Complete, Fixes Proposed
