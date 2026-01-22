---
id: ISS-000055
title: Create migration guide from Husky/other hook managers to wrangler hooks
type: issue
status: open
priority: low
labels:
  - documentation
  - migration
  - guide
createdAt: '2026-01-21T22:19:47.253Z'
updatedAt: '2026-01-21T22:19:47.253Z'
project: Wrangler Core Framework
wranglerContext:
  parentTaskId: SPEC-000041
  estimatedEffort: ~150 LOC
---
## Overview
Create documentation to help users migrate from existing hook management systems (Husky, pre-commit framework, custom scripts) to wrangler's git hooks framework.

## Requirements
- Create migration guide at `docs/git-hooks-migration.md`
- Cover common migration scenarios:
  - From Husky to wrangler hooks
  - From pre-commit framework to wrangler hooks
  - From custom bash scripts to wrangler hooks
  - From no hooks to wrangler hooks
- Step-by-step instructions for each scenario
- Configuration mapping (how to translate existing config)
- Common pitfalls and solutions
- Side-by-side comparison of approaches

## Key Migration Paths

### Husky Migration
1. Backup existing Husky config
2. Remove Husky: `npm uninstall husky`
3. Remove .husky/ directory
4. Map husky config to wrangler hooks-config.json
5. Run /wrangler:setup-git-hooks
6. Verify hooks working
7. Clean up package.json scripts

### Pre-commit Framework Migration
1. Backup .pre-commit-config.yaml
2. Remove pre-commit hooks: `pre-commit uninstall`
3. Map pre-commit hooks to wrangler config
4. Run /wrangler:setup-git-hooks
5. Verify equivalent functionality

### Custom Scripts Migration
1. Identify what custom hooks do
2. Map to wrangler hook templates
3. Decide: extend wrangler hooks or replace
4. Run setup
5. Manually merge custom logic if needed

## Acceptance Criteria
- Migration guide created
- Clear step-by-step instructions
- Examples for each scenario
- Comparison table (before/after)
- Troubleshooting section
- Links to relevant documentation
- Tested with real migration scenarios

## File Location
`docs/git-hooks-migration.md`

## Estimated Effort
~150 LOC documentation
