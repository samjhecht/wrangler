---
id: ISS-000058
title: Auto-archive closed issues/specs to subdirectories
type: issue
status: open
priority: medium
labels:
  - enhancement
  - mcp
  - file-organization
  - user-experience
createdAt: "2026-01-22T20:40:18.378Z"
updatedAt: "2026-01-22T20:44:41.379Z"
---

## Problem

Currently, when issues or specifications are marked as closed via MCP tools, they remain in the root `issues/` and `specifications/` directories. This clutters these directories with completed work, making it harder to quickly see active items.

## Proposed Solution

When an issue or spec is marked as closed or cancelled (via `issues_mark_complete` or `issues_update` with `status: "closed"` or `status: "cancelled"`), automatically move the file to an `archived/` subdirectory within the respective directory.

**Directory structure:**

```
.wrangler/
├── issues/
│   ├── 000001-active-issue.md
│   ├── 000002-another-active.md
│   └── archived/
│       ├── 000003-completed-issue.md
│       └── 000004-cancelled-issue.md
└── specifications/
    ├── 000001-active-spec.md
    └── archived/
        └── 000002-completed-spec.md
```

## Requirements

### 1. Auto-archive on Close/Cancel

- When `issues_mark_complete` is called, move file to `issues/archived/` or `specifications/archived/`
- When `issues_update` sets `status: "closed"` or `status: "cancelled"`, move file to appropriate `archived/` directory
- Create `archived/` subdirectory if it doesn't exist
- Update file references/IDs as needed

### 2. Include Archived Items in Listings

All listing and search tools should include archived items from subdirectories:

- `issues_list` - Include archived items when listing (with filter option)
- `issues_search` - Search across both root and `archived/` subdirectories
- `issues_get` - Retrieve from either location

### 3. Reopening Behavior

If an archived issue/spec is reopened (`status` changed from `closed`/`cancelled` to `open` or `in_progress`):

- Move file back to root directory
- Maintain all metadata and history

### 4. Backward Compatibility

- Handle existing closed/cancelled issues at root level gracefully
- Optionally provide migration tool to move existing closed items to archived/

## Implementation Considerations

### File Provider Changes (markdown.ts)

- Update `updateIssue()` to detect status changes
- Implement file move logic when status transitions to/from closed/cancelled
- Update file scanning to include `archived/` subdirectories
- Ensure path resolution works for both locations

### Affected Tools

- `issues_mark_complete` - Primary trigger for auto-archive
- `issues_update` - Detect status change to closed/cancelled
- `issues_list` - Scan both root and archived/ subdirectories
- `issues_search` - Search both locations
- `issues_get` - Check both locations for file

### Edge Cases

1. What if file already exists in destination? (Handle collision)
2. What if move operation fails? (Rollback transaction)
3. What about symlinks or references to the file? (Update or document)
4. Performance impact of scanning multiple directories? (Benchmark)

### Testing Requirements

- Test auto-archive on close
- Test auto-archive on cancel
- Test move back on reopen
- Test listing includes archived items
- Test search across subdirectories
- Test get operation finds files in both locations
- Test concurrent operations (race conditions)
- Test migration of existing closed issues

## User Experience

### Benefits

- Cleaner active directories (only open/in_progress items visible)
- Preserved history (archived items still accessible)
- Automatic organization (no manual file management)
- Consistent behavior across all MCP tools
- Aligns with industry standard "archive" terminology (email, file systems)

### Configuration

Consider adding workspace-schema.json option:

```json
{
  "archiveClosedItems": true, // default: true
  "archivedSubdirectory": "archived" // default: "archived"
}
```

## Alternative Approaches

1. **Status-based subdirectories**: `open/`, `in_progress/`, `archived/` (more complex)
2. **Archive command**: Manual archiving instead of automatic (less convenient)
3. **Archive directory at workspace root**: `.wrangler/archive/` instead of subdirectories (loses context)
4. **No archiving**: Keep everything at root with better filtering (current behavior)

## Success Criteria

- [ ] Closed/cancelled issues/specs automatically move to `archived/` subdirectory
- [ ] All listing/search tools include archived items by default
- [ ] Reopening moves items back to root directory
- [ ] Existing tests pass
- [ ] New tests cover all scenarios
- [ ] Documentation updated
- [ ] Migration guide for existing closed items

## Priority Justification

**Medium** - Quality of life improvement that enhances organization without blocking functionality. Current behavior works, but this makes the system more maintainable for users with many issues/specs.

## Terminology Rationale

Using "archived" instead of "closed" because:

- **Semantic separation**: Status is "closed"/"cancelled", location is "archived"
- **Universal concept**: Email systems have trained users on archive = remove from view, keep accessible
- **Inclusive**: Works for both closed AND cancelled items
- **Intent-aligned**: We're archiving for historical reference, not just marking as done
