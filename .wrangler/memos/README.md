# Memos Directory

This directory contains reference material, lessons learned, and important documentation from development work. Memos serve as a permanent archive of valuable knowledge gained during project development.

## Purpose

Memos capture knowledge that:
- Would be valuable to reference in the future
- Documents important decisions or discoveries
- Prevents repeating past mistakes
- Provides context for future work

## When to Create a Memo

Create memos ONLY for these specific cases:

### 1. Upon Explicit User Request
User explicitly asks: "Create a memo about X" or "Document this as a memo"

### 2. Root Cause Analyses (RCA)
After resolving tricky, long-running debugging issues:
- Complex bugs that took significant investigation
- Issues with non-obvious root causes
- Problems that might recur
- Situations where the fix was non-intuitive

**Example**: `2025-11-20-database-deadlock-rca.md`

### 3. Important Design Decisions
Documenting why approach X was chosen over Y:
- Significant architectural decisions
- Trade-off analyses with long-term implications
- Technology selection rationale
- Design patterns adopted

**Example**: `2024-10-29-mcp-integration-summary.md`

### 4. Lessons Learned
Post-mortems, retrospectives, "what we learned from incident Z":
- Production incidents
- Major project milestones
- Retrospectives after completing features
- Process improvements discovered

### 5. Research Findings
Comprehensive research that informs future work:
- Technology evaluations
- Industry pattern analysis
- Performance benchmarking
- Best practice research

**Example**: `2025-11-20-frontend-testing-research.md`

### 6. Process Documentation
New workflows or patterns discovered during work:
- Workflow improvements
- Tool usage patterns
- Development techniques
- Integration procedures

## When NOT to Create a Memo

Do NOT create memos for:

### Feature Proposals
**Wrong**: Creating memo for new feature idea
**Right**: Create specification in `.wrangler/specifications/`

Proposals should go through the spec process, not become memos.

### Bug Fix Proposals
**Wrong**: Creating memo describing a bug fix approach
**Right**: Create issue in `.wrangler/issues/`

Use the issue tracking system for work items.

### Work Tracking
**Wrong**: Creating memo to track ongoing work
**Right**: Use issues in `.wrangler/issues/`

Memos are for reflection after work is complete, not for tracking active work.

### Temporary Notes
**Wrong**: Creating memo for scratch notes during development
**Right**: Don't persist, or add as comments in issues

Temporary notes should not clutter the permanent archive.

### Routine Meeting Notes
**Wrong**: Creating memo for every meeting
**Right**: Only create memo if meeting produced important decisions or lessons

Most meetings don't warrant permanent documentation.

## Naming Convention

All memos must follow this naming pattern:

```
YYYY-MM-DD-topic-slug.md
```

### Examples:
- `2025-11-20-directory-configuration-conflict-rca.md`
- `2024-10-29-mcp-integration-summary.md`
- `2025-11-18-constitution-research.md`

### Date Guidelines:
- Use the date the event/work occurred (not memo creation date)
- For RCAs: Use the date the issue was resolved
- For research: Use the date research was completed
- For retrospectives: Use the date of the retrospective
- If unsure: Use current date

## Memo Structure

While there's no strict template, good memos typically include:

### For RCAs:
```markdown
# [Issue Description]

**Date**: [When incident occurred]
**Impact**: [What was affected]
**Root Cause**: [What actually caused it]

## Timeline
[Chronological events]

## Investigation
[What was tried, what was learned]

## Root Cause
[The actual underlying issue]

## Resolution
[How it was fixed]

## Prevention
[How to prevent recurrence]

## Lessons Learned
[Key takeaways]
```

### For Research:
```markdown
# [Research Topic]

**Date**: [When research conducted]
**Author**: [Who performed research]

## Executive Summary
[Key findings in 2-3 paragraphs]

## Detailed Findings
[Comprehensive analysis]

## Recommendations
[What to do with this information]

## References
[Sources consulted]
```

### For Design Decisions:
```markdown
# [Decision Description]

**Date**: [When decision made]
**Context**: [Why this decision was needed]

## Options Considered
[List of alternatives]

## Decision
[What was chosen]

## Rationale
[Why this option was selected]

## Trade-offs
[What was gained/lost]

## Implications
[Long-term impact]
```

## Memo Lifecycle

### Active Memos
Most memos remain permanently relevant and should be kept indefinitely.

### Superseded Memos
If a memo's content is superseded by later work:
- Add note at top: `**Note: Superseded by [link-to-newer-memo]**`
- Do NOT delete (historical value)

### Rejected Proposals
If a memo described a proposal that was rejected:
- Add note at top: `**Note: This proposal was not adopted. See [reason/link]**`
- Do NOT delete (shows what was considered)

### Archiving
Memos are rarely deleted. If a memo is truly obsolete:
1. Consider if it has historical value (usually yes)
2. If deleting, document why in commit message
3. Git history preserves deleted memos if needed later

## Common Mistakes

### Mistake 1: Proposal as Memo
**Wrong**:
```
.wrangler/memos/2025-11-20-development-manager-skill-proposal.md
```

**Right**:
```
.wrangler/specifications/000XXX-development-manager-skill.md
```

**Why**: Proposals should go through specification process with proper tracking.

### Mistake 2: Missing Date Prefix
**Wrong**: `database-deadlock-rca.md`
**Right**: `2025-11-20-database-deadlock-rca.md`

**Why**: Date prefix enables chronological sorting and context.

### Mistake 3: Too Granular
**Wrong**: Creating memo for every small decision
**Right**: Create memo only for significant, reusable knowledge

**Why**: Too many memos dilutes the archive and makes it harder to find valuable content.

### Mistake 4: Incomplete Context
**Wrong**: Memo assumes reader knows background
**Right**: Memo provides sufficient context for future readers

**Why**: Future readers (including your future self) may not remember the context.

## Finding Memos

### By Date
```bash
ls -lt .wrangler/memos/  # Most recent first
```

### By Topic
```bash
ls .wrangler/memos/ | grep database
```

### By Content
```bash
grep -r "deadlock" .wrangler/memos/
```

### In Editor
Most IDEs support fuzzy search across files.

## Integration with Other Systems

### Memos vs. Issues
- **Issues**: Track work to be done (forward-looking)
- **Memos**: Document work completed and lessons learned (backward-looking)

### Memos vs. Specifications
- **Specifications**: Define what should be built (prescriptive)
- **Memos**: Explain what was built and why (descriptive)

### Memos vs. Documentation
- **Documentation** (`docs/`): User-facing, maintained, current state
- **Memos**: Developer-facing, point-in-time, historical record

## Best Practices

1. **Write for Future You**: Assume you'll forget the context in 6 months
2. **Be Specific**: Include dates, version numbers, specific errors
3. **Include Links**: Link to relevant code, issues, specs
4. **Keep It Focused**: One topic per memo
5. **Update Rarely**: Memos are historical snapshots, not living documents
6. **Add Cross-References**: If related memos exist, link them

## Examples of Good Memos

### Good: RCA After Tricky Bug
`2025-11-20-directory-configuration-conflict-rca.md`
- Documents complex issue
- Explains investigation process
- Provides solution and prevention
- Valuable for future similar issues

### Good: Research Summary
`2025-11-20-frontend-testing-research.md`
- Comprehensive industry research
- Actionable recommendations
- Referenced by specs and issues
- Prevents re-researching same topic

### Good: Design Decision
`2024-10-29-mcp-integration-summary.md`
- Explains why MCP was integrated
- Documents alternatives considered
- Describes implementation approach
- Provides context for future maintainers

## Questions?

If unsure whether to create a memo:
1. Is this explicitly requested by user? → Yes, create memo
2. Is this a proposal for new work? → No, create spec instead
3. Is this tracking ongoing work? → No, create issue instead
4. Is this documenting important knowledge? → Yes, create memo
5. Is this temporary or trivial? → No, don't persist

When in doubt, err on the side of NOT creating a memo. Memos should be high-value archives, not dumping grounds for every thought.

---

**Last Updated**: 2025-11-21
**Related**: See `.wrangler/issues/README.md` and `.wrangler/specifications/README.md` for other documentation types
