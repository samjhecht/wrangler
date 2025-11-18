---
id: "000000"
title: "Short, action-oriented title (verb + object)"
type: "issue"
status: "open"
priority: "medium"
labels: []
assignee: ""
project: ""
createdAt: "YYYY-MM-DDTHH:mm:ss.sssZ"
updatedAt: "YYYY-MM-DDTHH:mm:ss.sssZ"
wranglerContext:
  agentId: ""
  parentTaskId: ""
  estimatedEffort: ""
---

# [Title]

## Description

Clear, concise description of what needs to be done and why.

**Context**: [Why is this needed? What problem does it solve?]

**Background**: [Any relevant history or prior attempts]

## Acceptance Criteria

Define "done" - each criterion should be verifiable:

- [ ] **Criterion 1**: [Specific, measurable outcome]
- [ ] **Criterion 2**: [Specific, measurable outcome]
- [ ] **Criterion 3**: [Specific, measurable outcome]

## Technical Notes

**Implementation Approach**: [High-level approach if known]

**Files Likely Affected**:
- `path/to/file1.ts` - [What changes here]
- `path/to/file2.ts` - [What changes here]

**Dependencies**:
- Blocks: [List issue IDs this blocks]
- Blocked by: [List issue IDs blocking this]
- Related: [List related issue IDs]

**Constraints**:
- [Any technical constraints or limitations]
- [Performance requirements]
- [Security considerations]

## Testing Strategy

**Test Coverage Required**:
- [ ] Unit tests for [component/function]
- [ ] Integration tests for [workflow]
- [ ] Edge cases: [List specific edge cases]

**Testing Notes**: [Any special testing considerations]

## Labels Guide

**Category** (pick one or more):
- `frontend` - UI/UX work
- `backend` - Server/API work
- `infrastructure` - DevOps, deployment, tooling
- `documentation` - Docs, README, guides
- `testing` - Test coverage improvements

**Type** (pick one):
- `bug` - Something broken
- `feature` - New functionality
- `refactor` - Code quality improvements
- `technical-debt` - Accumulated debt paydown
- `plan-step` - Task from implementation plan

**Urgency** (optional):
- `blocking` - Blocks other work
- `time-sensitive` - Has deadline
- `quick-win` - <4 hours, high impact

**Roadmap Phase** (if applicable):
- `phase-1`, `phase-2`, `phase-3`, etc.

## References

**Specification**: [Link to specification file or ID if this implements a spec]

**Related Issues**:
- #[issue-id] - [Brief description]

**External Documentation**:
- [Link to relevant docs, RFCs, etc.]

---

## Template Usage Notes

### When Creating Issues

**For Bugs**:
1. Set `type: "issue"` and add `bug` label
2. Include reproduction steps in Description
3. Set priority based on severity
4. Add `blocking` label if it blocks other work

**For Features**:
1. Verify specification exists first (create if needed)
2. Link to spec via `project` field
3. Add constitutional alignment note if new feature
4. Add appropriate roadmap phase label

**For Plan Steps**:
1. Usually auto-created by `writing-plans` skill
2. Will have `plan-step` label
3. `project` field links to specification
4. `parentTaskId` links to parent task if subtask

### Priority Guidelines

- **critical**: System broken, security issue, data loss, blocking all work
- **high**: Important feature, significant bug, blocks some work
- **medium**: Standard work item, planned feature
- **low**: Nice to have, minor improvement, technical debt

### Estimated Effort Format

Use `wranglerContext.estimatedEffort` for planning:

**Examples**:
- "1 hour"
- "4 hours"
- "1 day"
- "2-3 days"
- "1 week"

**Guidelines**:
- Include research/testing time
- Round up for uncertainty
- If >1 week, consider breaking down further

### Status Workflow

**Lifecycle**:
```
open → in_progress → closed
         ↓
      cancelled (if no longer relevant)
```

**Status meanings**:
- `open`: Ready to work, not started
- `in_progress`: Actively being worked on
- `closed`: Completed, all acceptance criteria met
- `cancelled`: No longer needed or relevant

### Assignee Field

**Values**:
- `""` (empty) - Unassigned
- `"claude-code"` - AI assistant working on it
- `"[agent-name]"` - Specific subagent assigned
- `"[human-name]"` - Human team member assigned

**Note**: Assignee indicates current ownership, not who created the issue.

---

**Last Updated**: [YYYY-MM-DD]
