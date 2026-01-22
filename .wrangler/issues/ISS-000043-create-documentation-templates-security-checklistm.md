---
id: ISS-000043
title: >-
  Create documentation templates (SECURITY_CHECKLIST.md, PR template,
  DEFINITION_OF_DONE.md)
type: issue
status: open
priority: medium
labels:
  - templates
  - documentation
  - security
  - governance
createdAt: '2026-01-21T22:19:45.466Z'
updatedAt: '2026-01-21T22:19:45.466Z'
project: Wrangler Core Framework
wranglerContext:
  parentTaskId: SPEC-000041
  estimatedEffort: ~150 LOC
---
## Overview
Create three documentation templates that will be installed in user projects to guide security review, PRs, and completion criteria.

## Requirements

### SECURITY_CHECKLIST.md
- Location: `skills/setup-git-hooks/templates/SECURITY_CHECKLIST.md`
- Target: `.wrangler/templates/SECURITY_CHECKLIST.md` in user project
- Content:
  - Pre-commit security verification steps
  - Secret scanning checklist
  - Credentials audit
  - Environment variable validation
  - API key management
  - Sensitive data handling

### pull_request_template.md
- Location: `skills/setup-git-hooks/templates/pull_request_template.md`
- Target: `.github/pull_request_template.md` in user project
- Content:
  - Test verification requirements
  - Evidence of passing tests
  - Link to test output (CI)
  - Breaking changes checklist
  - Security considerations
  - Review checklist

### DEFINITION_OF_DONE.md
- Location: `skills/setup-git-hooks/templates/DEFINITION_OF_DONE.md`
- Target: `.wrangler/templates/DEFINITION_OF_DONE.md` in user project
- Content:
  - Completion criteria for tasks
  - Code quality standards
  - Testing requirements
  - Documentation requirements
  - Review requirements
  - Git hooks compliance

## Acceptance Criteria
- All three templates created
- Clear, actionable checklist format
- Aligned with wrangler governance principles
- Referenced in hook setup process
- Markdown formatting standards followed
- Parameterized where needed

## File Locations
- `skills/setup-git-hooks/templates/SECURITY_CHECKLIST.md`
- `skills/setup-git-hooks/templates/pull_request_template.md`
- `skills/setup-git-hooks/templates/DEFINITION_OF_DONE.md`

## Estimated Effort
~150 LOC total (50 LOC each template)
