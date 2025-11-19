---
name: wrangler:migration-executor
description: Safely executes wrangler project migration to .wrangler/ directory structure with backup, validation, and rollback
---

# Migration Executor Skill

## Purpose

Safely execute the migration of a wrangler project from legacy directory structure to the new `.wrangler/` directory structure. Includes backup creation, validation, and automatic rollback on failure.

## When to Use

This skill is invoked automatically by the migration-detector skill when the user approves migration. Can also be invoked manually via `/wrangler:migrate` command.

## Workflow

### Phase 1: Pre-Migration Validation

**Checks before starting**:

```bash
# Find git root
if ! GIT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null); then
  echo "❌ ERROR: Not in a git repository"
  echo "Migration requires git for safety. Initialize git first:"
  echo "  git init && git add . && git commit -m 'Initial commit'"
  exit 1
fi

# Check if git working directory is clean
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "⚠️  WARNING: Git working directory is not clean"
  echo ""
  echo "Uncommitted changes detected. For safety, please commit or stash changes before migrating:"
  echo "  git add ."
  echo "  git commit -m 'Pre-migration commit'"
  echo ""
  echo "Or to proceed anyway (not recommended):"
  echo "  Set WRANGLER_FORCE_MIGRATION=true"

  if [ "$WRANGLER_FORCE_MIGRATION" != "true" ]; then
    exit 1
  fi
fi

# Check if already migrated
if [ -d "$GIT_ROOT/.wrangler/issues" ] && [ -d "$GIT_ROOT/.wrangler/specifications" ]; then
  echo "✓ Already migrated to .wrangler/ structure"
  echo "  Nothing to do"
  exit 0
fi

# Check if legacy directories exist
LEGACY_EXISTS=false
if [ -d "$GIT_ROOT/issues" ] || [ -d "$GIT_ROOT/specifications" ] || [ -d "$GIT_ROOT/memos" ]; then
  LEGACY_EXISTS=true
fi

if [ "$LEGACY_EXISTS" = "false" ]; then
  echo "ℹ️  No legacy directories found"
  echo "  Creating .wrangler/ structure for new project..."
  # Continue to create structure
fi
```

### Phase 2: Backup Creation

**Create timestamped backup**:

```bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$GIT_ROOT/.wrangler-migration-backup-$TIMESTAMP"

echo "📦 Creating backup..."

mkdir -p "$BACKUP_DIR"

# Backup legacy directories (if they exist)
if [ -d "$GIT_ROOT/issues" ]; then
  cp -R "$GIT_ROOT/issues" "$BACKUP_DIR/issues"
  ISSUES_BACKUP_COUNT=$(find "$BACKUP_DIR/issues" -type f | wc -l | tr -d ' ')
  echo "  ✓ Backed up issues/ ($ISSUES_BACKUP_COUNT files)"
fi

if [ -d "$GIT_ROOT/specifications" ]; then
  cp -R "$GIT_ROOT/specifications" "$BACKUP_DIR/specifications"
  SPECS_BACKUP_COUNT=$(find "$BACKUP_DIR/specifications" -type f | wc -l | tr -d ' ')
  echo "  ✓ Backed up specifications/ ($SPECS_BACKUP_COUNT files)"
fi

if [ -d "$GIT_ROOT/memos" ]; then
  cp -R "$GIT_ROOT/memos" "$BACKUP_DIR/memos"
  MEMOS_BACKUP_COUNT=$(find "$BACKUP_DIR/memos" -type f | wc -l | tr -d ' ')
  echo "  ✓ Backed up memos/ ($MEMOS_BACKUP_COUNT files)"
fi

echo "  Backup location: $BACKUP_DIR"
```

### Phase 3: Directory Structure Creation

**Create .wrangler/ directory structure**:

```bash
echo ""
echo "📁 Creating .wrangler/ structure..."

mkdir -p "$GIT_ROOT/.wrangler/issues"
mkdir -p "$GIT_ROOT/.wrangler/specifications"
mkdir -p "$GIT_ROOT/.wrangler/memos"
mkdir -p "$GIT_ROOT/.wrangler/governance"
mkdir -p "$GIT_ROOT/.wrangler/cache"
mkdir -p "$GIT_ROOT/.wrangler/config"
mkdir -p "$GIT_ROOT/.wrangler/docs"

echo "  ✓ Created directory structure"
```

### Phase 4: File Migration

**Move files to new locations**:

```bash
echo ""
echo "🚚 Migrating files..."

# Track counts for validation
EXPECTED_ISSUES=0
EXPECTED_SPECS=0
EXPECTED_MEMOS=0
EXPECTED_GOVERNANCE=0

# Migrate issues
if [ -d "$GIT_ROOT/issues" ]; then
  EXPECTED_ISSUES=$(find "$GIT_ROOT/issues" -type f | wc -l | tr -d ' ')

  # Move all files from issues/ to .wrangler/issues/
  find "$GIT_ROOT/issues" -type f -exec sh -c '
    file="$1"
    relative="${file#'"$GIT_ROOT"'/issues/}"
    mkdir -p "$(dirname '"$GIT_ROOT"'/.wrangler/issues/$relative)"
    mv "$file" "'"$GIT_ROOT"'/.wrangler/issues/$relative"
  ' _ {} \;

  # Remove empty legacy directory
  rmdir "$GIT_ROOT/issues" 2>/dev/null || rm -rf "$GIT_ROOT/issues"

  echo "  ✓ Migrated issues/ ($EXPECTED_ISSUES files)"
fi

# Migrate specifications (except governance files)
if [ -d "$GIT_ROOT/specifications" ]; then
  # First, move governance files separately
  if [ -f "$GIT_ROOT/specifications/_CONSTITUTION.md" ]; then
    mv "$GIT_ROOT/specifications/_CONSTITUTION.md" "$GIT_ROOT/.wrangler/governance/CONSTITUTION.md"
    EXPECTED_GOVERNANCE=$((EXPECTED_GOVERNANCE + 1))
    echo "  ✓ Migrated CONSTITUTION.md"
  fi

  if [ -f "$GIT_ROOT/specifications/_ROADMAP.md" ]; then
    mv "$GIT_ROOT/specifications/_ROADMAP.md" "$GIT_ROOT/.wrangler/governance/ROADMAP.md"
    EXPECTED_GOVERNANCE=$((EXPECTED_GOVERNANCE + 1))
    echo "  ✓ Migrated ROADMAP.md"
  fi

  if [ -f "$GIT_ROOT/specifications/_ROADMAP__NEXT_STEPS.md" ]; then
    mv "$GIT_ROOT/specifications/_ROADMAP__NEXT_STEPS.md" "$GIT_ROOT/.wrangler/governance/ROADMAP__NEXT_STEPS.md"
    EXPECTED_GOVERNANCE=$((EXPECTED_GOVERNANCE + 1))
    echo "  ✓ Migrated ROADMAP__NEXT_STEPS.md"
  fi

  # Count remaining spec files
  EXPECTED_SPECS=$(find "$GIT_ROOT/specifications" -type f | wc -l | tr -d ' ')

  if [ "$EXPECTED_SPECS" -gt 0 ]; then
    # Move remaining specification files
    find "$GIT_ROOT/specifications" -type f -exec sh -c '
      file="$1"
      relative="${file#'"$GIT_ROOT"'/specifications/}"
      mkdir -p "$(dirname '"$GIT_ROOT"'/.wrangler/specifications/$relative)"
      mv "$file" "'"$GIT_ROOT"'/.wrangler/specifications/$relative"
    ' _ {} \;

    echo "  ✓ Migrated specifications/ ($EXPECTED_SPECS files)"
  fi

  # Remove empty legacy directory
  rmdir "$GIT_ROOT/specifications" 2>/dev/null || rm -rf "$GIT_ROOT/specifications"
fi

# Migrate memos
if [ -d "$GIT_ROOT/memos" ]; then
  EXPECTED_MEMOS=$(find "$GIT_ROOT/memos" -type f | wc -l | tr -d ' ')

  # Move all files from memos/ to .wrangler/memos/
  find "$GIT_ROOT/memos" -type f -exec sh -c '
    file="$1"
    relative="${file#'"$GIT_ROOT"'/memos/}"
    mkdir -p "$(dirname '"$GIT_ROOT"'/.wrangler/memos/$relative)"
    mv "$file" "'"$GIT_ROOT"'/.wrangler/memos/$relative"
  ' _ {} \;

  # Remove empty legacy directory
  rmdir "$GIT_ROOT/memos" 2>/dev/null || rm -rf "$GIT_ROOT/memos"

  echo "  ✓ Migrated memos/ ($EXPECTED_MEMOS files)"
fi

EXPECTED_TOTAL=$((EXPECTED_ISSUES + EXPECTED_SPECS + EXPECTED_MEMOS + EXPECTED_GOVERNANCE))
```

### Phase 5: Validation

**Verify migration success**:

```bash
echo ""
echo "🔍 Validating migration..."

VALIDATION_PASSED=true

# Count files in new locations
ACTUAL_ISSUES=$(find "$GIT_ROOT/.wrangler/issues" -type f 2>/dev/null | wc -l | tr -d ' ')
ACTUAL_SPECS=$(find "$GIT_ROOT/.wrangler/specifications" -type f 2>/dev/null | wc -l | tr -d ' ')
ACTUAL_MEMOS=$(find "$GIT_ROOT/.wrangler/memos" -type f 2>/dev/null | wc -l | tr -d ' ')
ACTUAL_GOVERNANCE=$(find "$GIT_ROOT/.wrangler/governance" -type f 2>/dev/null | wc -l | tr -d ' ')

ACTUAL_TOTAL=$((ACTUAL_ISSUES + ACTUAL_SPECS + ACTUAL_MEMOS + ACTUAL_GOVERNANCE))

# Validate counts
if [ "$ACTUAL_ISSUES" -ne "$EXPECTED_ISSUES" ]; then
  echo "  ❌ Issues count mismatch (expected $EXPECTED_ISSUES, found $ACTUAL_ISSUES)"
  VALIDATION_PASSED=false
fi

if [ "$ACTUAL_SPECS" -ne "$EXPECTED_SPECS" ]; then
  echo "  ❌ Specifications count mismatch (expected $EXPECTED_SPECS, found $ACTUAL_SPECS)"
  VALIDATION_PASSED=false
fi

if [ "$ACTUAL_MEMOS" -ne "$EXPECTED_MEMOS" ]; then
  echo "  ❌ Memos count mismatch (expected $EXPECTED_MEMOS, found $ACTUAL_MEMOS)"
  VALIDATION_PASSED=false
fi

if [ "$ACTUAL_GOVERNANCE" -ne "$EXPECTED_GOVERNANCE" ]; then
  echo "  ❌ Governance count mismatch (expected $EXPECTED_GOVERNANCE, found $ACTUAL_GOVERNANCE)"
  VALIDATION_PASSED=false
fi

if [ "$VALIDATION_PASSED" = "false" ]; then
  echo ""
  echo "❌ VALIDATION FAILED - File count mismatch detected"
  echo ""
  echo "Rolling back to backup..."

  # ROLLBACK
  rm -rf "$GIT_ROOT/.wrangler"

  if [ -d "$BACKUP_DIR/issues" ]; then
    cp -R "$BACKUP_DIR/issues" "$GIT_ROOT/issues"
  fi

  if [ -d "$BACKUP_DIR/specifications" ]; then
    cp -R "$BACKUP_DIR/specifications" "$GIT_ROOT/specifications"
  fi

  if [ -d "$BACKUP_DIR/memos" ]; then
    cp -R "$BACKUP_DIR/memos" "$GIT_ROOT/memos"
  fi

  echo "✓ Restored from backup"
  echo ""
  echo "Your files are safe in their original locations."
  echo ""
  echo "Please report this issue:"
  echo "https://github.com/wrangler-marketplace/wrangler/issues"

  exit 1
fi

echo "  ✓ File counts validated ($ACTUAL_TOTAL files)"

# Check for leftover files in legacy locations
LEFTOVER=false
if [ -d "$GIT_ROOT/issues" ] && [ -n "$(find "$GIT_ROOT/issues" -type f)" ]; then
  echo "  ⚠️  Leftover files in issues/"
  LEFTOVER=true
fi

if [ -d "$GIT_ROOT/specifications" ] && [ -n "$(find "$GIT_ROOT/specifications" -type f)" ]; then
  echo "  ⚠️  Leftover files in specifications/"
  LEFTOVER=true
fi

if [ -d "$GIT_ROOT/memos" ] && [ -n "$(find "$GIT_ROOT/memos" -type f)" ]; then
  echo "  ⚠️  Leftover files in memos/"
  LEFTOVER=true
fi

if [ "$LEFTOVER" = "true" ]; then
  echo ""
  echo "⚠️  WARNING: Some files may not have migrated"
  echo "Check legacy directories before deleting backup"
fi
```

### Phase 6: Constitution Version Update

**Update wranglerVersion in constitution**:

```bash
echo ""
echo "📝 Updating constitution version..."

CONSTITUTION_FILE="$GIT_ROOT/.wrangler/governance/CONSTITUTION.md"

if [ -f "$CONSTITUTION_FILE" ]; then
  # Check if wranglerVersion field exists
  if grep -q "wranglerVersion:" "$CONSTITUTION_FILE"; then
    # Update existing version
    sed -i.bak 's/wranglerVersion: *".*"/wranglerVersion: "1.1.0"/' "$CONSTITUTION_FILE"
    rm -f "$CONSTITUTION_FILE.bak"
    echo "  ✓ Updated wranglerVersion to 1.1.0"
  else
    # Add wranglerVersion field to frontmatter
    # Find the closing --- of frontmatter and insert before it
    awk '/^---$/ && NR>1 {print "wranglerVersion: \"1.1.0\""; print "lastUpdated: \"'$(date +%Y-%m-%d)'\""} {print}' "$CONSTITUTION_FILE" > "$CONSTITUTION_FILE.tmp"
    mv "$CONSTITUTION_FILE.tmp" "$CONSTITUTION_FILE"
    echo "  ✓ Added wranglerVersion: 1.1.0 to constitution"
  fi
else
  echo "  ℹ️  No constitution found (will be created when governance initialized)"
fi
```

### Phase 7: Create Migration Marker

**Mark migration as complete**:

```bash
echo ""
echo "✅ Creating migration marker..."

cat > "$GIT_ROOT/.wrangler/MIGRATION_COMPLETE" <<EOF
Migration completed successfully
Date: $(date)
Version: 1.1.0
Files migrated: $ACTUAL_TOTAL
Backup location: $BACKUP_DIR
EOF

echo "  ✓ Created MIGRATION_COMPLETE marker"
```

### Phase 8: Generate .gitignore

**Create .wrangler/.gitignore**:

```bash
echo ""
echo "📄 Creating .gitignore..."

cat > "$GIT_ROOT/.wrangler/.gitignore" <<'EOF'
# Wrangler gitignore

# Runtime data (don't commit)
cache/
config/
metrics/

# Backup directories (temporary)
../.wrangler-migration-backup-*/

# Migration markers (local)
SKIP_AUTO_MIGRATION
REMIND_NEXT_SESSION
EOF

echo "  ✓ Created .wrangler/.gitignore"
```

### Phase 9: Completion Report

**Final report to user**:

```bash
echo ""
echo "════════════════════════════════════════"
echo "✅ MIGRATION COMPLETE"
echo "════════════════════════════════════════"
echo ""
echo "Files Migrated: $ACTUAL_TOTAL"
echo "  - Issues: $ACTUAL_ISSUES"
echo "  - Specifications: $ACTUAL_SPECS"
echo "  - Memos: $ACTUAL_MEMOS"
echo "  - Governance: $ACTUAL_GOVERNANCE"
echo ""
echo "New Structure:"
echo "  .wrangler/"
echo "  ├── issues/"
echo "  ├── specifications/"
echo "  ├── memos/"
echo "  ├── governance/"
echo "  ├── cache/"
echo "  ├── config/"
echo "  └── docs/"
echo ""
echo "Constitution Version: 1.1.0"
echo "Backup Location: $BACKUP_DIR"
echo ""
echo "✅ Your project is now on wrangler v1.1.0!"
echo ""
echo "Next Steps:"
echo "  1. Review migrated files in .wrangler/"
echo "  2. Commit changes: git add .wrangler && git commit -m 'Migrate to .wrangler/ structure'"
echo "  3. Backup can be deleted: rm -rf $BACKUP_DIR"
echo ""
```

## Error Handling

### Error: Not in Git Repository

```
❌ ERROR: Not in a git repository

Migration requires git for safety. Initialize git first:
  git init
  git add .
  git commit -m "Initial commit"
```

### Error: Uncommitted Changes

```
⚠️  WARNING: Git working directory is not clean

Uncommitted changes detected. For safety, please commit or stash changes:
  git add .
  git commit -m "Pre-migration commit"

Or to proceed anyway (not recommended):
  Set WRANGLER_FORCE_MIGRATION=true
```

### Error: Validation Failed

```
❌ VALIDATION FAILED - File count mismatch

Expected: 65 files
Found: 64 files

Rolling back to backup...
✓ Restored from backup

Your files are safe in their original locations.

Please report this issue:
https://github.com/wrangler-marketplace/wrangler/issues
```

## Manual Invocation

This skill can be invoked manually via:

```bash
# Use Skill tool
wrangler:migration-executor

# Or create slash command /wrangler:migrate that invokes this skill
```

## Testing

**Test Cases**:
1. Clean git repo, legacy structure → Should migrate successfully
2. Dirty git repo → Should warn and block (unless FORCE)
3. Already migrated → Should exit gracefully
4. Partial legacy (only issues/) → Should migrate what exists
5. Simulated file loss → Should detect and rollback
6. No constitution → Should complete but note it's missing

## Notes

- Migration is all-or-nothing (validates before committing)
- Backup is created before any changes
- Automatic rollback on validation failure
- Constitution version automatically updated
- .gitignore created to exclude runtime directories