---
id: ISS-000058
title: >-
  Simplify verify-governance to use workspace-schema.json as single source of
  truth
type: issue
status: open
priority: medium
labels:
  - enhancement
  - governance
  - user-experience
  - maintenance
createdAt: '2026-01-22T23:09:14.552Z'
updatedAt: '2026-01-22T23:09:14.552Z'
---
## Problem

The current `verify-governance` skill has grown complex with 8 phases and hardcoded structure expectations that duplicate what's already defined in `workspace-schema.json` and skill templates. This creates maintenance burden and drift risk.

## Proposed Solution

Simplify `verify-governance` to focus on **structure and existence validation only**, using `workspace-schema.json` as the single source of truth.

### Scope (Simplified)

**What it SHOULD check**:
1. Directory structure matches `workspace-schema.json`
2. Subdirectories exist (e.g., `archived/`)
3. `.wrangler/.gitignore` exists with correct patterns from schema
4. Key governance files exist (CONSTITUTION.md, ROADMAP.md, etc.)
5. Files in correct locations (e.g., `config/hooks-config.json` not at root)

**What it should NOT check** (for now):
- File content quality or template compliance
- Governance file sections/structure
- Template version mismatches
- Cross-document link validation

### Workflow

```markdown
1. Load workspace-schema.json (canonical structure)
2. Compare current .wrangler/ state to schema
3. Report drift:
   - Missing directories
   - Missing files
   - Wrong locations (renamed/moved)
   - Missing gitignore patterns
4. Ask permission: "Fix all?" / "Show commands?" / "Let me choose?" / "Cancel"
5. Apply fixes based on user choice
6. Re-verify to confirm fixes worked
```

### Example Drift Detection

```markdown
## Drift Report

### Missing Directories (2)
- .wrangler/issues/archived/ (required by schema)
- .wrangler/specifications/archived/ (required by schema)

### Wrong Locations (2)
- .wrangler/issues/complete/ exists but should be .wrangler/issues/archived/
  - Fix: Rename directory (12 files affected)
- .wrangler/hooks-config.json exists but should be at .wrangler/config/hooks-config.json
  - Fix: Move file

### Missing Files (1)
- .wrangler/.gitignore (required by schema)
  - Fix: Create with patterns: cache/, logs/, sessions/

### Missing Gitignore Patterns (1)
- .wrangler/.gitignore missing pattern: sessions/
  - Fix: Add to .gitignore
```

### Permission Model

User gets 4 options:
1. **Fix all automatically** - Apply all fixes (recommended)
2. **Show me the commands** - Display bash commands, user runs manually
3. **Let me choose** - Review each fix individually for approval
4. **Cancel** - No changes

### Implementation Requirements

1. **Load workspace-schema.json** as single source of truth
2. **Detect directory drift**:
   - Missing canonical directories
   - Renamed directories (e.g., complete/ → archived/)
   - Missing subdirectories
3. **Detect file drift**:
   - Missing governance files
   - Files in wrong locations
4. **Detect .gitignore drift**:
   - Missing .gitignore file
   - Missing patterns from schema.gitignorePatterns
5. **Report clearly** with specific fixes
6. **Get permission** before making changes
7. **Apply fixes** based on user choice:
   - Create directories: `mkdir -p`
   - Move files: `mv`
   - Rename directories: `mv`
   - Create .gitignore from schema patterns
8. **Backup before changes** (optional safety feature)
9. **Re-verify after fixes** to confirm success

### Design Principles

**Single Source of Truth**:
- Use `workspace-schema.json` for structure definitions
- Use templates in `skills/*/templates/` for content (future)
- Don't duplicate structure knowledge in skill text

**Simplicity**:
- Focus on structure/existence only (not content quality)
- Remove complex bash validation logic
- Reduce from 8 phases to simple compare-report-fix workflow

**Maintainability**:
- When wrangler structure changes, only update workspace-schema.json
- Skill automatically adapts to new schema
- No hardcoded expectations to update

### Files to Modify

1. `skills/verify-governance/SKILL.md` - Simplify to new workflow
2. Test the skill on projects with known drift patterns

### Success Criteria

- [ ] Loads workspace-schema.json as canonical structure
- [ ] Detects missing directories from schema
- [ ] Detects renamed directories (complete/ → archived/)
- [ ] Detects missing subdirectories
- [ ] Detects missing .gitignore file
- [ ] Detects missing gitignore patterns
- [ ] Detects missing governance files
- [ ] Detects files in wrong locations
- [ ] Reports drift clearly with specific fixes
- [ ] Asks for user permission (4 options)
- [ ] Applies fixes based on user choice
- [ ] Re-verifies after fixes
- [ ] No hardcoded structure expectations in skill
- [ ] Works on projects with drift from v1.0 → v1.2 migration

### Migration from Old verify-governance

This is a **simplification** of the existing skill:
- Keep the skill name `verify-governance`
- Remove Phases 1-8 complex validation logic
- Replace with simple schema-based comparison
- Content validation can be added back later as Phase 2 if needed

### Future Enhancements (Out of Scope)

- Content/template compliance checking
- Governance file section validation
- Template version drift detection
- Cross-document link validation
- Automated content migration
