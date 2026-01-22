---
id: ISS-000047
title: Integrate TESTING.md template into initialize-governance workflow
type: issue
status: open
priority: medium
labels:
  - skill
  - integration
  - testing
  - governance
createdAt: '2026-01-21T22:19:46.077Z'
updatedAt: '2026-01-21T22:19:46.077Z'
project: Wrangler Core Framework
wranglerContext:
  parentTaskId: SPEC-000041
  estimatedEffort: ~40 LOC
---
## Overview
Update initialize-governance skill to create .wrangler/TESTING.md as part of governance file creation, using the template created in ISS-000042.

## Requirements
- Modify file: `skills/initialize-governance/SKILL.md`
- Add TESTING.md to list of governance files created
- Copy template from `skills/initialize-governance/templates/TESTING.md`
- Place in `.wrangler/TESTING.md` in user's project
- Parameterize with project-specific test commands
- Update README.md references to mention TESTING.md

## Implementation Details
Add to Phase 2 (File Creation):
```markdown
### Create .wrangler/TESTING.md
- Copy template from skills/initialize-governance/templates/TESTING.md
- Parameterize with detected test commands
- Save to .wrangler/TESTING.md
```

Update .wrangler/README.md template to reference TESTING.md:
```markdown
## Testing Documentation
See [TESTING.md](TESTING.md) for comprehensive test documentation including:
- Test infrastructure setup
- Running tests
- Git hooks test enforcement
```

## Acceptance Criteria
- TESTING.md created during governance initialization
- Properly parameterized with project commands
- Referenced in README.md
- Integrated smoothly into workflow
- Doesn't break existing functionality
- Tested end-to-end

## Dependencies
- Requires TESTING.md template (ISS-000042)

## File Location
`skills/initialize-governance/SKILL.md`

## Estimated Effort
~40 LOC additions to existing skill
