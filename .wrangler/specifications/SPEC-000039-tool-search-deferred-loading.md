---
id: "SPEC-000039"
title: "Tool Search and Deferred Loading for MCP Tools"
type: "specification"
status: "open"
priority: "medium"
labels: ["mcp", "performance", "scalability", "blocked"]
createdAt: "2024-12-07T00:00:00.000Z"
updatedAt: "2024-12-07T00:00:00.000Z"
---

# Tool Search and Deferred Loading for MCP Tools

## Status: Blocked

**Blocker**: Claude Code does not yet support the `defer_loading: true` MCP capability.

**Tracking**: [Claude Code GitHub Issue #12836](https://github.com/anthropics/claude-code/issues/12836)

Once Claude Code adds support for deferred loading, this spec should be implemented.

## Overview

Adopt Anthropic's Tool Search + `defer_loading: true` pattern for MCP tools to improve scalability without ballooning prompt size.

**Reference**: [Anthropic's Best Practices Guide](https://www.anthropic.com/engineering/code-execution-with-mcp)

## Problem Statement

Currently, all MCP tools (16 tools as of Dec 2024) are loaded upfront into Claude's context. As we add more tools, this:

1. **Increases prompt token usage** - Every tool description counts against context
2. **Reduces available context** - Less room for actual conversation and code
3. **Slows tool selection** - Claude must evaluate all tools for each request

## Proposed Solution

### Tool Search Pattern

Expose a single "search" tool that returns relevant tools based on the task:

```typescript
// Instead of loading all 16+ tools upfront
const allTools = [issues_create, issues_list, issues_search, ...];

// Load one search tool that returns relevant tools on-demand
const searchTool = {
  name: "search_tools",
  description: "Search for available tools based on task description",
  defer_loading: true,
  // Returns tool definitions matching the query
};
```

### Deferred Loading

Mark tools with `defer_loading: true` so they're only loaded when needed:

```typescript
{
  name: "issues_create",
  description: "Create a new Wrangler issue...",
  defer_loading: true,  // <-- Key flag
  inputSchema: {...}
}
```

## Implementation Plan

### Phase 1: Tool Categorization

Group existing tools into categories for efficient search:

| Category | Tools | Use Case |
|----------|-------|----------|
| Issue CRUD | create, get, update, delete | Basic issue management |
| Issue Query | list, search, all_complete | Finding/filtering issues |
| Issue Metadata | labels, metadata, projects | Issue organization |
| Session | start, phase, checkpoint, complete, get | Workflow orchestration |

### Phase 2: Search Tool Implementation

Create `tools_search` MCP tool:

```typescript
export const toolsSearchSchema = z.object({
  query: z.string().describe("What task are you trying to accomplish?"),
  category: z.enum(["issues", "session", "all"]).optional(),
  limit: z.number().default(5),
});

export async function toolsSearchTool(params: ToolsSearchParams) {
  // Return tool definitions matching the query
  // Use semantic similarity or keyword matching
}
```

### Phase 3: Deferred Loading Integration

Once Claude Code supports it:

1. Update `server.ts` to mark tools with `defer_loading: true`
2. Implement tool definition caching
3. Add lazy tool registration
4. Update plugin.json capabilities

### Phase 4: Documentation

- Update MCP-USAGE.md with new patterns
- Document search tool usage
- Add troubleshooting for deferred loading

## Technical Considerations

### Backwards Compatibility

- Keep non-deferred mode for clients that don't support it
- Feature-flag the deferred loading behavior
- Graceful fallback to upfront loading

### Performance

- Cache tool definitions to avoid repeated parsing
- Use efficient search algorithm (keyword matching initially)
- Consider indexing for large tool catalogs (>50 tools)

### Testing

- Unit tests for search tool
- Integration tests for deferred loading
- Performance benchmarks (token savings)

## Success Metrics

- **Prompt reduction**: 50%+ reduction in tool definition tokens
- **Latency**: No increase in tool invocation time
- **Accuracy**: Search returns correct tools 95%+ of time

## Dependencies

- Claude Code support for `defer_loading: true` (BLOCKED)
- MCP SDK version supporting deferred loading

## Related Work

- Anthropic's [Tool Search Tool documentation](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool)
- Current wrangler MCP implementation in `mcp/server.ts`

## Notes

This spec serves as a reminder to implement Tool Search + deferred loading once Claude Code adds support. The pattern is already documented by Anthropic and is a known best practice for scaling MCP tools.

When implementing, reference:
- The original best practices article
- Claude's tool search implementation details
- Any new capabilities added to Claude Code for this feature
