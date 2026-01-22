# Figma React-to-Design Workflow Research

**Date**: January 20, 2026
**Author**: ChatGPT (external research), curated by Claude
**Type**: Research / Workflow Analysis
**Status**: Reference Material

## Summary

External research conducted with ChatGPT exploring the optimal workflow for generating Figma design assets from existing React UIs. The analysis builds on wrangler's November 2025 Figma MCP migration work and proposes a three-pipeline architecture for maintainable design automation.

## Context

This research addresses the question:

> "Given an existing React UI, how do we generate useful Figma design pages + assets with minimal manual work, ending up with something maintainable (components/tokens), not just a one-off screenshot dump?"

The key unlock identified in prior wrangler documentation (November 2025): switching from read-only MCP (`figma-developer-mcp`) to plugin-based write MCP (`figma-mcp-write-server`) enables actual generation of Figma pages/assets programmatically.

**Critical constraint**: Figma Desktop only, one active file at a time, plugin must be running.

## Proposed Architecture: Three Pipelines

### Pipeline A: Create Design System Foundation

Create tokens + components in Figma before generating UI screens.

**Why this matters**: If you don't lay this foundation first, the code-to-Figma generator ends up hardcoding colors/typography/spacing, producing an unmaintainable Figma file.

Wrangler already has this via design system templates (minimal, modern, vibrant) that define:
- Pages: Colors, Typography, Spacing, Components
- Frames tied to token names and component keys
- Token-driven structure intended for Tokens Studio import

### Pipeline B: Extract Structured UI Requirements from React

This is the **missing translation layer**. Wrangler's mock generator consumes specs describing pages, sections, components, and flows—but nothing automatically derives that from React source.

**Recommended workflow**:
```
React code → intermediate UI description (JSON/Markdown) → Figma generation
```

**Sources for intermediate description**:
- Storybook index (best if available)
- Route-level renders (running Vite app)
- Lightweight DOM/computed-style extraction pass

The description doesn't need to be perfect—it needs to be **consistent** so the Figma generator can:
- Decide what becomes frames
- Decide what becomes instances of design-system components
- Decide what needs bespoke "feature components"

### Pipeline C: Generate Figma Pages from UI Description

This is where the write MCP shines with tools for layout, components, variables, exports, and annotations.

Wrangler's `figma-design-workflow` skill already supports:
- Creating feature files
- Linking master design system as a library
- Creating frames for each page
- Generating flows + annotations
- Tracking approval status / verification baseline

## Concrete Recommendations

### 1. Standardize on Hierarchical Files

**Master design system + child feature files** (linked as a library).

This matches wrangler's mock workflow and maintains sanity long-term.

### 2. Use Templates to Bootstrap Tokens/Components

Don't try to infer a design system from React. Use wrangler's template JSON as a blueprint for pages/frames in the design system file.

**Key benefit**: The generator can map CSS/Tailwind values to *known token names* instead of inventing new ones.

### 3. Make React Extractor Output Match Mock Generator Input

The mock generator expects: **pages → sections → components → interactions/flows**

The React-to-UI-description step should output:
- `pages[]` with names ("Dashboard Home", "Settings", etc.)
- `sections[]` per page ("Header", "Sidebar", "Content", "Table")
- `components[]` (Button, Input, Card, Table, Modal, etc.)
- `interactions[]` / flows (clicks, modal open/close, drill-down)

This enables reuse of existing generation strategy rather than writing a new "DOM → Figma" generator.

### 4. Prefer Instances Over Unique Nodes

**Scaling issue**: Bulk creation operations return huge responses and consume context.

Example from wrangler RCA: 50 stars produced ~11.6k tokens.

**Mitigations** (align with design-system best practice):
- Use **component instances** rather than duplicating nodes
- Batch operations when necessary
- Use `detail: "minimal"` parameter (forked write server feature)

The forked write server with `detail` parameter for create operations is **not optional** for generating entire apps worth of screens—it prevents automation from eating its own context.

### 5. Treat Figma Pages as Build Artifacts with Approval Gate

Generated mocks require review before becoming canonical reference:
- "Generated from code" is *not* "correct by definition"
- Review step ensures Figma file becomes the authoritative design source
- Matches wrangler's approval status / verification baseline tracking

## Recommended Stack

Based on wrangler's existing capabilities:

1. **Write-capable MCP** via `figma-mcp-write-server` (or fork with `detail` support for create ops)
2. **Design-system templates** (minimal/modern/vibrant) as canonical schema for tokens/components/pages
3. **React → UI-requirements extractor** emitting the same structure the mock generator consumes
4. **Existing spec/mock generation workflow** to create frames using design-system instances and auto layout patterns

## Tool Name Mismatch Callout

Wrangler's `figma-design-workflow` skill references tool calls like:
- `figma_create_frame`
- `figma_create_file`

But the write server actually exposes tool groups like:
- `figma_nodes`
- `figma_pages`
- `figma_components`
- `figma_instances`
- `figma_variables`

**Action needed**: Normalize skill implementation to actual tool surface area and add capability checks (per migration memo recommendations).

## Next Steps

Potential follow-up work:
1. Define minimal viable UI-description schema that:
   - Maps cleanly to design-system template tokens/components
   - Drives Figma generator to produce acceptable frames without hand-tweaking
2. Build React extractor outputting that schema
3. Update skills to use actual write server tool names

## References

### Related Wrangler Documentation

- `2025-11-22-figma-mcp-write-server-migration.md` - Migration from read-only to write MCP
- `2025-11-22-figma-mcp-bulk-operations-response-size.md` - Context flooding issues and `detail` parameter
- `SPEC-000040-claude-centric-figma-design-workflow.md` - Comprehensive Figma workflow research
- `SPEC-000007-figma-design-workflow-integration.md` - Original design workflow specification
- `docs/FIGMA-WRITE-MCP-SETUP.md` - Write MCP setup guide

### Skills

- `design-system-setup` - Initialize design systems from templates
- `figma-design-workflow` - Generate mockups from specifications
- `design-system-governance` - Detect token drift between Figma and code

---

**Origin**: External research session with ChatGPT
**Purpose**: Inform wrangler's React-to-Figma workflow development
