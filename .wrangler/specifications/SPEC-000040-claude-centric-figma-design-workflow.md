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

---

## Research Findings

Research completed January 2026. Key findings that inform the technical approach.

### Finding 1: Better MCP Option Available

**Recommendation: Use `cursor-talk-to-figma-mcp` instead of `figma-mcp-write-server`**

| Project | Stars | Maintainer | Status |
|---------|-------|------------|--------|
| **cursor-talk-to-figma-mcp** | 6,100+ | Grab (major tech company) | Active, merged into official MCP registry |
| figma-mcp-write-server (oO) | 18 | Individual | Pre-release, small community |
| Figma-MCP-Write-Bridge | 1 | Individual | Too early-stage |

The Grab-maintained `cursor-talk-to-figma-mcp` is the clear winner:
- Largest community and most active development
- Production-validated at scale
- Well-documented with MCP prompts for complex tasks
- Features: text scanning, batch replacement, auto-layout, annotations, image export

**Architecture (all write-capable servers):**
```
AI Client --> MCP Server --> WebSocket (port 3055) --> Figma Plugin (Desktop)
```

### Finding 2: Figma API Limitations Are Significant

**BLOCKING Limitations:**

| Limitation | Impact |
|------------|--------|
| REST API is read-only | Cannot create/modify design elements via HTTP - Plugin API required |
| Plugin API requires Desktop | No headless/server-side execution possible - user must have Figma Desktop running |
| Variables API is Enterprise-only | Design token workflows blocked for non-Enterprise plans (~$45/editor/month) |
| Severe rate limits | Starter plan: 6 requests/MONTH; even Enterprise has per-minute limits |

**SIGNIFICANT Limitations:**

| Limitation | Impact |
|------------|--------|
| 2GB memory limit per file | Large files cause 500 errors and locks |
| Token overflow | Responses can exceed 350,000 tokens (typical limit ~25,000) |
| Dev Mode is read-only | Cannot edit design elements, only metadata |
| 85-90% inaccuracy rates | Reported by experienced developers using MCP |
| No sandbox environment | Must mock Figma API for testing |

**Implications:**
- Desktop dependency is unavoidable - users MUST have Figma Desktop running
- Token management is critical - need aggressive summarization/chunking
- Enterprise plan may be needed for full design token workflows
- Need robust error handling for rate limits and large files

### Finding 3: Anthropic's Frontend Aesthetics Prompt

Anthropic has an official ~400 token prompt that dramatically improves design output. Key elements:

**Typography Anti-Patterns (AVOID):**
- Inter, Roboto, Open Sans, Lato, system fonts
- Uniform sizing without hierarchy
- Safe middle weights (400 vs 600)

**Typography Best Practices:**
- Distinctive fonts: Playfair Display, JetBrains Mono, Space Grotesk, Bricolage Grotesque
- Extreme weights: 100/200 vs 800/900 (not 400 vs 600)
- Scale jumps: 3x+ differences (not 1.5x)
- High-contrast pairings: display + monospace, serif + geometric sans

**Color Best Practices:**
- 60/30/10 distribution (dominant + supporting + accent)
- Commit to cohesive aesthetic with CSS variables
- AVOID: purple gradients on white, evenly distributed palettes

**Layout Best Practices:**
- Stop centering everything - embrace asymmetry
- Treat whitespace as structural, not residual
- Dramatic scale contrast (4:1 heading-to-body ratios)

**Animation Best Practices:**
- Focus on high-impact page load moments
- Staggered reveals via `animation-delay`
- One well-orchestrated sequence > scattered micro-interactions

### Finding 4: Figma Make Problems (Why Build Our Own)

User complaints about Figma Make validate building our own approach:

| Problem | Severity |
|---------|----------|
| Unintended changes | High - modifies pages it wasn't asked to change |
| Quality degradation | High - performance gets worse over time |
| Generic output | Medium - template-like designs without strong UX |
| Hallucinations | High - makes unrequested layout/typography changes |
| Overwrites manual edits | Critical - loses user work without warning |
| Messy code structure | Medium - single-file output, not production-ready |

### Finding 5: Effective AI Design Patterns

**Prompting Frameworks:**

1. **WIRE+FRAME Framework** (from Smashing Magazine):
   - W (Who & What): Define AI persona and deliverable
   - I (Input Context): Background framing the task
   - R (Rules & Constraints): Boundaries and exclusions
   - E (Expected Output): Format and deliverable structure
   - F (Flow of Tasks): Break into ordered steps
   - R (Reference Voice/Style): Desired tone and mood
   - A (Ask for Clarification): Invite AI to question unclear instructions
   - M (Memory): Reference earlier conversation
   - E (Evaluate & Iterate): Prompt for self-critique

2. **Three-Solution Framework**:
   - Option A (Conservative): Minimal modifications, low risk
   - Option B (Bold): Complete redesigns breaking constraints
   - Option C (Ideal): Unlimited-resource optimal UX

3. **10 Aesthetic Archetypes** (force selection upfront):
   - Editorial/Magazine, Swiss/International, Brutalist/Raw
   - Minimalist/Refined, Maximalist/Expressive, Retro-Futuristic
   - Organic/Natural, Industrial/Utilitarian, Art Deco/Geometric, Lo-Fi/Zine

**Critical Success Factors:**
1. Explicit anti-patterns - what NOT to do is as important as what to do
2. Design token enforcement - output must use semantic CSS variables
3. Self-critique loops - AI evaluates and refines its own output
4. Verification checklist - archetype fidelity, token coherence, no generic scaffolding
5. Context gathering before generation - purpose, users, domain, content density

**Open-Source Resources to Incorporate:**
- `claude-code-ui-agents` - curated UI/UX prompts collection
- `frontend-design` skill - 10 archetypes with design tokens
- `claude-designer-skill` - three-solution framework implementation
- `claude-design-engineer` - design direction inference + enforcement

### Finding 6: Design System Integration Architecture

```
Design System (JSON tokens) --> MCP/API --> LLM --> Generated Code
                                  ^
                          NOT Figma drawings
```

**Key insight:** The source of truth should be structured data (JSON tokens), not Figma drawings. LLMs work best with structured data.

**Token Export Formats to Support:**
- CSS Variables: `:root { --color-primary: #3B82F6; }`
- Tailwind Config: `colors: { primary: '#3B82F6' }`
- Design Tokens JSON (W3C format)

### Finding 7: Verification and Quality Checks

**Pre-Delivery Checklist:**
- [ ] Archetype fidelity across all visual choices
- [ ] Differentiator implemented (not merely described)
- [ ] Token coherence throughout typography, spacing, color
- [ ] Responsive behavior intentional on mobile/tablet/desktop
- [ ] No generic scaffolding remaining

**Anti-Pattern Radar (ensure design does NOT have):**
- [ ] System font stacks or generic typefaces
- [ ] Uniform sizing without hierarchy
- [ ] Purple-on-white gradients
- [ ] Evenly distributed color (should be 60/30/10)
- [ ] Low contrast
- [ ] Everything centered
- [ ] Generic hero -> cards -> testimonials -> footer layout
- [ ] Linear easing on animations
- [ ] Stock illustrations

---

## Technical Approach

### 1. Figma MCP Server (Write Capabilities)

**Problem:** The official `@figma/mcp-server-figma` is read-only.

**Solution:** Fork and adapt `cursor-talk-to-figma-mcp` (Grab's implementation)
- Repository: https://github.com/grab/cursor-talk-to-figma-mcp
- 6,100+ stars, active community, production-validated
- Already merged into official MCP servers registry

**Hard Requirements (from research):**
- User MUST have Figma Desktop running (no workaround - Plugin API requires it)
- WebSocket bridge architecture: MCP Server <-> WebSocket (3055) <-> Figma Plugin
- Enterprise plan recommended for full Variables API access

**Known Issues to Address:**
- Context flooding - responses can exceed 350K tokens; need aggressive summarization
- Rate limits - implement exponential backoff and request batching
- Large file handling - 2GB memory limit; need chunked operations
- Error handling - robust recovery from 429s and 500s

**Tasks:**
- [ ] Fork cursor-talk-to-figma-mcp and evaluate for wrangler integration
- [ ] Implement token management (summarization, selective fetching, response truncation)
- [ ] Add rate limit handling with exponential backoff
- [ ] Document setup requirements (Figma Desktop, plugin installation, auth)
- [ ] Decide: bundle with wrangler or separate install with clear prerequisites

### 2. Design Quality Skills (Informed by Research)

**Incorporate Anthropic's Frontend Aesthetics Approach:**
- Add anti-pattern enforcement (no Inter/Roboto, no purple gradients, no centered-everything)
- Require aesthetic archetype selection before generation
- Implement self-critique loops for quality improvement
- Add verification checklists to skill outputs

**Skills to Build/Enhance:**
- `avoiding-ai-slop` - explicit anti-patterns and distinctive design guidance
- `design-verification` - automated visual/token compliance checking
- `design-token-enforcement` - post-generation validation

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

### Answered by Research

1. ~~**MCP Distribution:** Should the figma-mcp-write-server be bundled with wrangler or separate install?~~
   - **ANSWER:** TBD based on complexity. cursor-talk-to-figma-mcp requires Bun and has more dependencies. Likely separate install with clear prerequisites documented.

2. ~~**Figma Desktop Dependency:** Is this still a hard requirement? Can we work around it?~~
   - **ANSWER:** YES, hard requirement. NO workaround. Figma's REST API is read-only; Plugin API is the only write path and requires Desktop app. Users MUST have Figma Desktop running.

3. ~~**Token Management:** Best strategy for managing verbose responses?~~
   - **ANSWER:** Multiple strategies needed:
     - Aggressive summarization of node trees
     - Selective field fetching (request only needed properties)
     - Response truncation with continuation tokens
     - Chunked operations for large files
     - Caching for repeated queries

4. ~~**Design Quality:** What makes AI design output actually good?~~
   - **ANSWER:** See Research Finding 5. Key factors:
     - Explicit anti-patterns (what NOT to do)
     - Aesthetic archetype selection upfront
     - Self-critique loops
     - Verification checklists
     - Design token enforcement

### Remaining Questions

5. **Enterprise Plan Barrier:** Variables API requires Enterprise (~$45/editor/month). Should we:
   - Design around this limitation for non-Enterprise users?
   - Make Enterprise a hard requirement for full functionality?
   - Provide degraded experience for non-Enterprise?

6. **MCP Fork Strategy:** Should we:
   - Fork cursor-talk-to-figma-mcp and maintain separately?
   - Contribute improvements upstream?
   - Create a wrangler-specific wrapper?

7. **Skill vs MCP Boundary:** Where should design logic live?
   - MCP server (closer to Figma, better performance)?
   - Wrangler skills (easier to iterate, more visible)?
   - Hybrid approach?

## Dependencies

**Hard Dependencies:**
- Figma Desktop application (must be running during design sessions)
- Figma account with Dev or Full seat (for MCP server access)
- `FIGMA_ACCESS_TOKEN` environment variable
- cursor-talk-to-figma-mcp (or fork) with Figma plugin installed

**Soft Dependencies (for full functionality):**
- Figma Enterprise plan (for Variables API / design token access)
- Bun package manager (required by cursor-talk-to-figma-mcp)

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

### MCP Servers
- **Recommended:** https://github.com/grab/cursor-talk-to-figma-mcp (6,100+ stars)
- Alternative: https://github.com/oO/figma-mcp-write-server (18 stars)
- Official (read-only): https://developers.figma.com/docs/figma-mcp-server/

### Figma Documentation
- [Figma REST API](https://developers.figma.com/docs/rest-api/)
- [Figma Plugin API](https://www.figma.com/plugin-docs/)
- [Figma Variables API](https://developers.figma.com/docs/rest-api/variables/)
- [Figma Rate Limits](https://developers.figma.com/docs/rest-api/rate-limits/)
- [MCP Server Tools and Prompts](https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/)

### Design Quality Resources
- [Anthropic: Improving Frontend Design Through Skills](https://claude.com/blog/improving-frontend-design-through-skills)
- [Claude Platform Cookbook: Frontend Aesthetics](https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics)
- [Smashing Magazine: WIRE+FRAME Prompting Framework](https://www.smashingmagazine.com/2025/08/prompting-design-act-brief-guide-iterate-ai/)
- [NN/g: AI Prototyping Research](https://www.nngroup.com/articles/ai-prototyping/)

### Open-Source Skills/Tools
- [claude-code-ui-agents](https://github.com/mustafakendiguzel/claude-code-ui-agents) - UI/UX prompts
- [frontend-design skill](https://github.com/Ilm-Alan/frontend-design) - 10 archetypes
- [claude-designer-skill](https://github.com/joeseesun/claude-designer-skill) - three-solution framework
- [claude-design-engineer](https://github.com/Dammyjay93/claude-design-engineer) - design enforcement

### Wrangler Internal
- Archived skills: `reference_prompts/skills/design__*`, `reference_prompts/skills/figma-design-workflow/`
- Previous Figma integration commits: d620367, 24c2189, b163a43
