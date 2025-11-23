---
name: wrangler:migration-detector
description: Detects when wrangler migration is needed and prompts user for approval with clear summary of changes
---

# Migration Detector Skill

## Skill Usage Announcement

**MANDATORY**: When using this skill, announce it at the start with:

```
🔧 Using Skill: wrangler:migration-detector | [brief purpose based on context]
```

**Example:**
```
🔧 Using Skill: wrangler:migration-detector | [Provide context-specific example of what you're doing]
```

This creates an audit trail showing which skills were applied during the session.



## Purpose

Automatically detect when a project needs to migrate to the new `.wrangler/` directory structure and prompt the user for approval with a clear summary of what will change.

## When to Use

This skill runs automatically on session start (invoked by session hook). DO NOT manually invoke unless debugging.

## Workflow

### Phase 1: Detect Migration Needs

**Check for legacy structure**:

```bash
# Find git root
GIT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)

# Check for legacy directories
LEGACY_ISSUES=$([ -d "$GIT_ROOT/issues" ] && echo "yes" || echo "no")
LEGACY_SPECS=$([ -d "$GIT_ROOT/specifications" ] && echo "yes" || echo "no")
LEGACY_MEMOS=$([ -d "$GIT_ROOT/memos" ] && echo "yes" || echo "no")

# Check if already migrated
ALREADY_MIGRATED=$([ -d "$GIT_ROOT/.wrangler/issues" ] && echo "yes" || echo "no")

# Check for opt-out flag
OPT_OUT=$([ -f "$GIT_ROOT/.wrangler/SKIP_AUTO_MIGRATION" ] && echo "yes" || echo "no")
```

**Decision logic**:
- If `ALREADY_MIGRATED=yes` → EXIT (already on v1.1.0)
- If `OPT_OUT=yes` → EXIT (user opted out)
- If `LEGACY_ISSUES=no` AND `LEGACY_SPECS=no` AND `LEGACY_MEMOS=no` → EXIT (nothing to migrate)
- Otherwise → MIGRATION_NEEDED

### Phase 2: Gather Migration Details

**If migration needed, collect information**:

```bash
# Count files in legacy directories
ISSUES_COUNT=$(find "$GIT_ROOT/issues" -type f 2>/dev/null | wc -l | tr -d ' ')
SPECS_COUNT=$(find "$GIT_ROOT/specifications" -type f 2>/dev/null | wc -l | tr -d ' ')
MEMOS_COUNT=$(find "$GIT_ROOT/memos" -type f 2>/dev/null | wc -l | tr -d ' ')

# Check for governance files
CONSTITUTION_EXISTS=$([ -f "$GIT_ROOT/specifications/_CONSTITUTION.md" ] && echo "yes" || echo "no")
ROADMAP_EXISTS=$([ -f "$GIT_ROOT/specifications/_ROADMAP.md" ] && echo "yes" || echo "no")
ROADMAP_NEXT_EXISTS=$([ -f "$GIT_ROOT/specifications/_ROADMAP__NEXT_STEPS.md" ] && echo "yes" || echo "no")

# Calculate total files
TOTAL_FILES=$((ISSUES_COUNT + SPECS_COUNT + MEMOS_COUNT))
if [ "$CONSTITUTION_EXISTS" = "yes" ]; then TOTAL_FILES=$((TOTAL_FILES + 1)); fi
if [ "$ROADMAP_EXISTS" = "yes" ]; then TOTAL_FILES=$((TOTAL_FILES + 1)); fi
if [ "$ROADMAP_NEXT_EXISTS" = "yes" ]; then TOTAL_FILES=$((TOTAL_FILES + 1)); fi

# Read current version from constitution (if exists)
if [ "$CONSTITUTION_EXISTS" = "yes" ]; then
  CURRENT_VERSION=$(grep 'wranglerVersion:' "$GIT_ROOT/specifications/_CONSTITUTION.md" | head -1 | sed 's/.*wranglerVersion: *"\(.*\)".*/\1/' || echo "1.0.0")
else
  CURRENT_VERSION="1.0.0"
fi
```

### Phase 3: Present Summary and Prompt User

**Generate migration summary**:

```markdown
🔄 WRANGLER UPDATE DETECTED

Current version: {CURRENT_VERSION}
Latest version: 1.1.0
Breaking changes detected.

Migration Required:
{if LEGACY_ISSUES=yes}├─ Move issues/ → .wrangler/issues/ ({ISSUES_COUNT} files)
{if LEGACY_SPECS=yes}├─ Move specifications/ → .wrangler/specifications/ ({SPECS_COUNT} files)
{if LEGACY_MEMOS=yes}├─ Move memos/ → .wrangler/memos/ ({MEMOS_COUNT} files)
{if CONSTITUTION_EXISTS=yes}├─ Move constitution → .wrangler/governance/CONSTITUTION.md
{if ROADMAP_EXISTS=yes}├─ Move roadmap → .wrangler/governance/ROADMAP.md
└─ Update constitution version to 1.1.0

Total: {TOTAL_FILES} files
Estimated time: <10 seconds
```

**Use AskUserQuestion tool**:

```typescript
AskUserQuestion({
  questions: [{
    question: "Wrangler needs to migrate your project to v1.1.0. Proceed with migration?",
    header: "Update",
    multiSelect: false,
    options: [
      {
        label: "Yes, migrate now",
        description: `Migrate ${TOTAL_FILES} files to .wrangler/ directory (recommended, ~10 seconds)`
      },
      {
        label: "Show detailed plan",
        description: "See exactly what files will move before deciding"
      },
      {
        label: "Skip for now",
        description: "Remind me next session (files stay in current locations)"
      },
      {
        label: "Never ask again",
        description: "I'll migrate manually or keep current structure"
      }
    ]
  }]
})
```

### Phase 4: Handle User Response

**Based on user selection**:

**If "Yes, migrate now"**:
```bash
# Invoke migration executor skill
Use Skill tool to execute: wrangler:migration-executor
```

**If "Show detailed plan"**:
```markdown
# Migration Plan: v{CURRENT_VERSION} → v1.1.0

## Changes

{for each legacy directory that exists}
### {Directory Name}
- From: {absolute path to legacy}
- To: {absolute path to .wrangler/}
- Files: {count}
- Action: Move directory

{if governance files exist}
### Governance Files
- Constitution: specifications/_CONSTITUTION.md → .wrangler/governance/CONSTITUTION.md
- Roadmap: specifications/_ROADMAP.md → .wrangler/governance/ROADMAP.md
- Roadmap Next: specifications/_ROADMAP__NEXT_STEPS.md → .wrangler/governance/ROADMAP__NEXT_STEPS.md
- Version update: {CURRENT_VERSION} → 1.1.0

## New Structure

After migration:
```
.wrangler/
├── issues/ ({ISSUES_COUNT} files)
├── specifications/ ({SPECS_COUNT} files)
├── memos/ ({MEMOS_COUNT} files)
├── governance/
│   ├── CONSTITUTION.md (v1.1.0)
│   ├── ROADMAP.md
│   └── ROADMAP__NEXT_STEPS.md
├── cache/ (created, empty)
├── config/ (created, empty)
└── docs/ (created, empty)
```

## Safety

- ✅ Backup created before migration
- ✅ File count validation
- ✅ Automatic rollback on failure
- ✅ All operations logged

## Estimated Time

**{estimate based on TOTAL_FILES}** seconds

---

Proceed with migration? (Respond "yes" to migrate, "no" to skip)
```

Then wait for user response and proceed accordingly.

**If "Skip for now"**:
```bash
# Create reminder flag
mkdir -p "$GIT_ROOT/.wrangler"
touch "$GIT_ROOT/.wrangler/REMIND_NEXT_SESSION"

echo "✓ Skipped migration - you'll be reminded next session"
```

**If "Never ask again"**:
```bash
# Create opt-out flag
mkdir -p "$GIT_ROOT/.wrangler"
touch "$GIT_ROOT/.wrangler/SKIP_AUTO_MIGRATION"

echo "✓ Auto-migration disabled"
echo "  Created .wrangler/SKIP_AUTO_MIGRATION"
echo ""
echo "  To migrate manually later, run: /wrangler:migrate"
```

## Error Handling

**If git root not found**:
```
⚠️ Migration detection skipped (not in git repository)
```
Exit gracefully.

**If unable to count files**:
```
⚠️ Migration detection failed (unable to scan directories)
Details: {error message}

To migrate manually, run: /wrangler:migrate
```
Exit gracefully.

**If AskUserQuestion fails**:
```
⚠️ Unable to prompt for migration approval

To migrate manually, run: /wrangler:migrate
```
Exit gracefully.

## Integration

**Invoked by**: `hooks/session-start.sh` (automatically)
**Invokes**: `skills/wrangler/migration-executor/SKILL.md` (if user approves)

## Example Output

### Example 1: User Approves Immediately

```
🔄 WRANGLER UPDATE DETECTED

Current version: 1.0.0
Latest version: 1.1.0

Migration Required:
├─ Move issues/ → .wrangler/issues/ (42 files)
├─ Move specifications/ → .wrangler/specifications/ (7 files)
├─ Move memos/ → .wrangler/memos/ (15 files)
├─ Move constitution → .wrangler/governance/CONSTITUTION.md
└─ Update constitution version to 1.1.0

Total: 65 files
Estimated time: <10 seconds

[User selects: "Yes, migrate now"]

Invoking migration executor...
[Migration executes - see migration-executor skill output]
```

### Example 2: User Wants Details

```
🔄 WRANGLER UPDATE DETECTED

[Summary shown]

[User selects: "Show detailed plan"]

# Migration Plan: v1.0.0 → v1.1.0

[Detailed plan shown]

Proceed with migration? (yes/no)

[User responds: "yes"]

Invoking migration executor...
```

### Example 3: User Skips

```
🔄 WRANGLER UPDATE DETECTED

[Summary shown]

[User selects: "Skip for now"]

✓ Skipped migration - you'll be reminded next session

[Session continues with legacy structure]
```

### Example 4: User Opts Out

```
🔄 WRANGLER UPDATE DETECTED

[Summary shown]

[User selects: "Never ask again"]

✓ Auto-migration disabled
  Created .wrangler/SKIP_AUTO_MIGRATION

  To migrate manually later, run: /wrangler:migrate

[Session continues, no future prompts]
```

## Testing

**Test Cases**:
1. Fresh project (no legacy dirs) → Should exit without prompting
2. Legacy structure exists → Should prompt with accurate counts
3. Already migrated (.wrangler/ exists) → Should exit without prompting
4. Opt-out flag exists → Should exit without prompting
5. User approves → Should invoke migration-executor
6. User skips → Should create REMIND_NEXT_SESSION flag
7. User opts out → Should create SKIP_AUTO_MIGRATION flag

## Notes

- This skill is DETECTION only, not execution
- Actual migration happens in migration-executor skill
- Prompts appear once per session (if needed)
- User can always run `/wrangler:migrate` manually to bypass prompts