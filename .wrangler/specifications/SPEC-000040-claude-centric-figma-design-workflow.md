---
id: SPEC-000040
title: Claude-Centric Figma Design Workflow
type: specification
status: open
priority: medium
labels:
  - design
  - figma
  - ux
  - research-spike
  - mcp
createdAt: '2026-01-16T18:37:18.186Z'
updatedAt: '2026-01-16T18:41:27.601Z'
---
## Problem Statement

Frontend design/UX is one of the areas where we're least AI-enabled currently. While Figma Make exists, its shortcomings make it not worth the investment. The real value would be extracting whatever prompts and skills make it good at UI design and turning those into Claude skills.

## Key Goals

### Goal 1: AI-Assisted Design Ideation and Iteration

Make it easier for users to come up with designs and iterate on them with Claude's help and guidance. The user shouldn't need to be a designer to produce quality UI/UX. Claude should:
- Ask the right questions to understand what the user is trying to achieve
- Suggest design approaches and alternatives
- Generate wireframes and mockups based on the conversation
- Guide iteration with constructive feedback and options
- Help the user arrive at a design they're happy with efficiently

### Goal 2: Design Artifacts Drive Implementation Quality

The design systems and wireframes created in Figma become first-class inputs to the implementation workflow:
- Wireframes serve as the visual specification for what gets built
- Implementation agents reference wireframes to ensure spec adherence
- Code review verifies pixel-perfect alignment with approved designs
- Design tokens (colors, typography, spacing) flow from Figma to code
- The result is higher quality implementation output that matches the user's vision

## Vision

A Claude-centric approach to design that enables:
1. Claude to talk directly to a Figma project - e.g., "build out our design framework based on what we're doing in the app now"
2. Interactive wireframe generation for specs involving UI changes (e.g., `/generate-wireframes-for-spec`)
3. Tight integration with spec/plan/issues workflow - wireframes get referenced in implementation artifacts
4. Implementation guidance that achieves pixel-perfect alignment with wireframes

## Key Success Criteria

1. **Users produce better designs faster** - Non-designers can create quality UI/UX with Claude's guidance
2. **Fast iteration cycles** - The wireframe iteration step is quick, not a bottleneck
3. **Implementation matches design** - Built output adheres closely to approved wireframes
4. **Design system consistency** - Tokens and components stay in sync between Figma and code

## Technical Approach

### 1. Figma MCP Server (Write Capabilities)

**Problem:** The official `@figma/mcp-server-figma` is read-only.

**Solution:** Use and improve the forked write-capable server: https://github.com/samjhecht/figma-mcp-write-server

**Known Issues to Address:**
- Context flooding - Figma responses are very token-heavy
- May need additional improvements for reliable operation
- Previous removal was due to "requires Figma Desktop plugin and local server that's not reliably available"

**Tasks:**
- [ ] Assess current state of forked MCP server
- [ ] Implement context/token management strategies (summarization, selective data fetching, pagination)
- [ ] Document reliable setup/operation requirements
- [ ] Package appropriately for wrangler distribution

### 2. Research Spikes

**Spike A: Extract Skills from Claude Figma Plugin**
- Investigate what skills/prompts power the Claude Figma plugin
- Attempt to reverse-engineer or learn from its capabilities
- Document findings for adaptation into wrangler skills

**Spike B: External Resources for Figma + AI**
- Survey existing resources, guides, prompts for AI-assisted design in Figma
- Look for design system best practices that translate to AI workflows
- Identify patterns that make AI design output higher quality

### 3. Resurrect and Enhance Design Skills

**Skills to restore from `reference_prompts/skills/`:**

1. **design__design-system-setup/**
   - Full skill + 3 design templates (minimal, modern, vibrant)
   - Enables: "build out our design framework based on what we're doing in the app now"

2. **design__design-system-governance/**
   - Token drift detection between Figma and code
   - Ensures design system stays in sync

3. **figma-design-workflow/**
   - Mockup generation from specifications
   - Hierarchical file structure (master design system + child feature files)
   - Approval tracking in wrangler metadata

### 4. New Skill: generate-wireframes-for-spec

**Workflow:**
1. User invokes on a spec with UI changes
2. Claude initiates interactive Q&A to clarify requirements:
   - What's the user goal?
   - What data needs to be displayed?
   - What actions are available?
   - What's the information hierarchy?
   - Any constraints (mobile, accessibility, etc.)?
3. Claude generates initial wireframes in Figma
4. User reviews in Figma, provides feedback
5. Iterate until satisfied
6. Lock wireframes and update spec/plan/issues with references

**Key Design Considerations:**
- Q&A should be efficient - ask the right questions, not endless questions
- Wireframe generation should be fast (seconds, not minutes)
- Iteration feedback loop should be tight

### 5. Implementation Workflow Integration

Once wireframes are locked:
- Spec gets updated with `figmaWireframeUrl` in metadata
- Plan tasks reference specific frames/components
- Implementation issues include visual references
- Code review includes pixel-perfect verification against wireframes
- `implement` skill guides agents to match wireframes exactly

## Workflow Overview

```
Spec with UI changes
        |
        v
/generate-wireframes-for-spec
        |
        v
Interactive Q&A (clarify requirements)
        |
        v
Generate initial wireframes in Figma
        |
        v
Review & iterate <----+
        |             |
        v             |
    Satisfied? --No---+
        |
       Yes
        |
        v
Lock wireframes
        |
        v
Update spec/plan/issues with references
        |
        v
Implementation (pixel-perfect guided by wireframes)
        |
        v
Code review verifies design adherence
```

## Open Questions

1. **MCP Distribution:** Should the figma-mcp-write-server be bundled with wrangler (like wrangler-mcp) or remain a separate install?

2. **Figma Desktop Dependency:** The previous removal cited needing "Figma Desktop plugin and local server." Is this still a hard requirement? Can we work around it?

3. **Token Management:** What's the best strategy for managing Figma's verbose responses? Options:
   - Aggressive summarization
   - Selective field fetching
   - Caching/memoization
   - Chunked operations

4. **Design Quality:** What makes AI design output actually good? This is the core question the research spikes need to answer.

## Dependencies

- Working figma-mcp-write-server with write capabilities
- `FIGMA_ACCESS_TOKEN` environment variable
- Research spike findings

## Implementation Constraints

**Non-interference requirement:** This must be implemented in a way that does not impact or interfere with existing spec writing and implementation workflows in wrangler. Until proven to work satisfactorily:
- Design workflow should be opt-in, invoked explicitly by the user
- Should NOT be automatically woven into existing spec-driven dev prompts/flows
- Existing `brainstorming`, `writing-specifications`, `writing-plans`, and `implement` skills remain unchanged

**Future Phase: Workflow Integration**
Once the design workflow is proven effective:
- Integrate design system detection into spec creation flow
- Auto-prompt for wireframes when specs have UI components
- Wire design references into implementation agents automatically
- This integration is explicitly deferred to a future phase

## Out of Scope (for now)

- Visual regression testing
- Automated design-to-code generation
- Design system versioning
- Multi-designer collaboration workflows
- **Automatic integration with existing wrangler workflows** (deferred to future phase)

## References

- Forked MCP server: https://github.com/samjhecht/figma-mcp-write-server
- Archived skills: `reference_prompts/skills/design__*`, `reference_prompts/skills/figma-design-workflow/`
- Previous Figma integration commits: d620367, 24c2189, b163a43
