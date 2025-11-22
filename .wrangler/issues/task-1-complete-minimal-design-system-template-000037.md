---
id: '000037'
title: 'Task 1: Complete minimal design system template'
type: issue
status: open
priority: high
labels:
  - plan-step
  - implementation
  - templates
createdAt: '2025-11-22T04:23:19.451Z'
updatedAt: '2025-11-22T04:23:19.451Z'
project: 000037-figma-design-workflow-integration-for-wrangler.md
wranglerContext:
  agentId: plan-executor
  parentTaskId: '000037'
  estimatedEffort: 30 minutes
---
## Description
Complete the minimal design system template with all required files (tokens, components, preview image, README, Figma template structure).

## Context
Reference: `000037-figma-design-workflow-integration-for-wrangler.md`
This is the first of three design system templates bundled with the plugin. The minimal template provides essential design foundations without overwhelming small projects.

## Files
- Already created: `skills/design-workflow/design-system-setup/templates/minimal/README.md`
- Already created: `skills/design-workflow/design-system-setup/templates/minimal/tokens.json`
- Already created: `skills/design-workflow/design-system-setup/templates/minimal/components.json`
- Create: `skills/design-workflow/design-system-setup/templates/minimal/figma-template.json`
- Create: `skills/design-workflow/design-system-setup/templates/minimal/preview.png`

## Implementation Steps

**Step 1: Create Figma template structure (figma-template.json)**

This JSON defines how the Figma file should be structured when created via MCP.

```json
{
  "name": "Minimal Design System",
  "description": "Clean, focused design system for projects that need essential foundations",
  "pages": [
    {
      "name": "🎨 Colors",
      "frames": [
        {
          "name": "Primary",
          "type": "color-swatch",
          "tokens": ["color.primary"]
        },
        {
          "name": "Neutrals",
          "type": "color-palette",
          "tokens": ["color.neutral.white", "color.neutral.100", "color.neutral.300", "color.neutral.500", "color.neutral.700", "color.neutral.black"]
        },
        {
          "name": "Semantic",
          "type": "color-palette",
          "tokens": ["color.semantic.success", "color.semantic.warning", "color.semantic.error"]
        }
      ]
    },
    {
      "name": "📝 Typography",
      "frames": [
        {
          "name": "Font Families",
          "type": "text-specimen",
          "tokens": ["typography.fontFamily.sans", "typography.fontFamily.mono"]
        },
        {
          "name": "Font Sizes",
          "type": "type-scale",
          "tokens": ["typography.fontSize.xs", "typography.fontSize.sm", "typography.fontSize.base", "typography.fontSize.lg", "typography.fontSize.xl"]
        },
        {
          "name": "Font Weights",
          "type": "text-specimen",
          "tokens": ["typography.fontWeight.regular", "typography.fontWeight.medium", "typography.fontWeight.bold"]
        }
      ]
    },
    {
      "name": "📏 Spacing",
      "frames": [
        {
          "name": "Spacing Scale",
          "type": "spacing-visualization",
          "tokens": ["spacing.xs", "spacing.sm", "spacing.md", "spacing.lg", "spacing.xl"]
        }
      ]
    },
    {
      "name": "🧩 Components",
      "frames": [
        {
          "name": "Buttons",
          "type": "component-showcase",
          "components": ["button.variants.primary", "button.variants.secondary", "button.variants.ghost"]
        },
        {
          "name": "Inputs",
          "type": "component-showcase",
          "components": ["input.default"]
        },
        {
          "name": "Cards",
          "type": "component-showcase",
          "components": ["card.default"]
        },
        {
          "name": "Badges",
          "type": "component-showcase",
          "components": ["badge.variants.success", "badge.variants.warning", "badge.variants.error"]
        }
      ]
    }
  ]
}
```

**Step 2: Create preview image placeholder**

Since we can't generate actual images yet, create a simple SVG placeholder that will be replaced with real preview later:

```bash
cat > skills/design-workflow/design-system-setup/templates/minimal/preview.png << 'EOF'
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#F3F4F6"/>
  <text x="200" y="140" text-anchor="middle" font-family="sans-serif" font-size="24" fill="#374151" font-weight="bold">Minimal</text>
  <text x="200" y="170" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#6B7280">Clean & Focused</text>
  <circle cx="80" cy="240" r="15" fill="#3B82F6"/>
  <rect x="120" y="225" width="30" height="30" rx="4" fill="#F3F4F6" stroke="#D1D5DB"/>
  <rect x="160" y="225" width="30" height="30" rx="15" fill="#10B981"/>
</svg>
EOF
```

**Step 3: Verify template structure**

Run: `ls -la skills/design-workflow/design-system-setup/templates/minimal/`
Expected: 5 files (README.md, tokens.json, components.json, figma-template.json, preview.png)

**Step 4: Commit**

```bash
git add skills/design-workflow/design-system-setup/templates/minimal/
git commit -m "feat(templates): complete minimal design system template

- Add Figma template structure (pages, frames, tokens)
- Add preview image placeholder
- Template includes colors, typography, spacing, components
- Follows W3C design tokens format"
```

## Acceptance Criteria
- [ ] figma-template.json defines complete Figma file structure
- [ ] preview.png placeholder created
- [ ] All 5 template files present
- [ ] Template follows specification requirements (FR-003)
- [ ] Committed with clear message

## Dependencies
- None (first task)
