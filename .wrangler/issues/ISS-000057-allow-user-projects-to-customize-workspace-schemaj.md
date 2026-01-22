---
id: ISS-000057
title: Allow user projects to customize workspace-schema.json
type: issue
status: open
priority: medium
labels:
  - enhancement
  - user-experience
  - configuration
createdAt: '2026-01-22T20:14:09.674Z'
updatedAt: '2026-01-22T20:14:09.674Z'
---
## Problem

Currently all projects use the builtin schema from the wrangler installation. This creates several limitations:

- Users cannot customize directory structure or paths for their specific needs
- Schema is at `.wrangler/config/workspace-schema.json` in the wrangler project but not exposed to user projects
- All projects must conform to wrangler's opinionated structure, even when project-specific conventions would be more appropriate

## Proposed Solution

Copy the builtin schema to user's project `.wrangler/config/workspace-schema.json` during initialization:

1. **Schema Precedence Chain**: 
   - Project schema (`.wrangler/config/workspace-schema.json`) - highest priority
   - Builtin schema (wrangler installation) - fallback
   - Hardcoded defaults - last resort

2. **Initialization Flow**:
   - On first session start, copy builtin schema to project `.wrangler/config/`
   - Allow users to customize as needed
   - MCP and session hooks should prefer project schema over builtin

3. **Benefits**:
   - Projects can organize governance files according to their needs
   - Preserves wrangler's defaults for those who want them
   - Clear upgrade path when users want to customize

## Challenges

### 1. Schema Versioning
- How do users get updates when wrangler's builtin schema evolves?
- Need to detect schema version mismatches
- Should we auto-merge updates or require manual intervention?

### 2. Migration Strategy
- Existing projects don't have `.wrangler/config/workspace-schema.json`
- Need to handle upgrade path for existing installations
- Should migration be automatic or opt-in?

### 3. Breaking Changes
- Moving schema location is a breaking change for v1.2.0 users
- Need careful documentation and migration guide
- Consider deprecation warning period

### 4. Documentation Requirements
- Clear guide on customizing schema safely
- Document which fields are safe to change vs. which are required
- Examples of common customizations
- Troubleshooting guide for schema validation errors

## Implementation Considerations

### Code Changes Required

1. **session-start.sh**:
   - Check for project schema first before falling back to builtin
   - Copy builtin schema on initialization if not present
   - Add version compatibility checking

2. **MCP Server**:
   - `findSchemaPath()` already walks up directory tree (good foundation)
   - Update to prefer project schema over builtin
   - Add schema validation on load

3. **Validation**:
   - Need schema version compatibility checking
   - Validate project schema against required fields
   - Warn on deprecated/unknown fields

4. **Migration Tool**:
   - Create `/wrangler:migrate-schema` command
   - Handle old → new location moves
   - Merge user customizations with new schema fields

### Testing Requirements

- Test schema precedence (project > builtin > defaults)
- Test initialization with missing schema
- Test schema version mismatch detection
- Test migration from old to new location
- Test invalid schema handling

### Documentation Required

- Update docs/SESSION-HOOKS.md with schema precedence
- Create docs/schema-customization.md guide
- Update CLAUDE.md with schema location info
- Add migration guide to VERSIONING.md

## Acceptance Criteria

- [ ] Project schema takes precedence over builtin schema
- [ ] Builtin schema copied to project on initialization
- [ ] Schema version compatibility checking implemented
- [ ] Migration tool created for existing projects
- [ ] Comprehensive documentation written
- [ ] Tests cover all schema precedence scenarios
- [ ] Breaking change documented with migration path
