---
id: '000037'
title: 'Task 2: Create modern design system template'
type: issue
status: open
priority: high
labels:
  - plan-step
  - implementation
  - templates
createdAt: '2025-11-22T04:23:51.066Z'
updatedAt: '2025-11-22T04:23:51.066Z'
project: 000037-figma-design-workflow-integration-for-wrangler.md
wranglerContext:
  agentId: plan-executor
  parentTaskId: '000037'
  estimatedEffort: 1 hour
---
## Description
Create the modern design system template with comprehensive color palette, typography, spacing, and component library. This is the recommended default template.

## Context
Reference: `000037-figma-design-workflow-integration-for-wrangler.md`
The modern template provides a full-featured design system suitable for most projects, with a comprehensive component library and design tokens.

## Files
- Create: `skills/design-workflow/design-system-setup/templates/modern/README.md`
- Create: `skills/design-workflow/design-system-setup/templates/modern/tokens.json`
- Create: `skills/design-workflow/design-system-setup/templates/modern/components.json`
- Create: `skills/design-workflow/design-system-setup/templates/modern/figma-template.json`
- Create: `skills/design-workflow/design-system-setup/templates/modern/preview.png`

## Implementation Steps

**Step 1: Create README.md**

```markdown
# Modern Design System Template

A comprehensive, production-ready design system for modern web applications.

## Philosophy

Professional and polished. This template provides everything needed for a complete design system without overwhelming complexity.

## What's Included

### Colors
- **Primary**: Full 9-step color scale (50-900)
- **Secondary**: Complementary 9-step scale
- **Neutral**: 10-step grayscale
- **Semantic**: Success, warning, error, info (each with 9-step scales)

### Typography
- **Font Families**:
  - Display: Inter (headings, hero text)
  - Body: Inter (paragraphs, UI text)
  - Code: JetBrains Mono (code blocks)
- **Scale**: 9 sizes (2xs, xs, sm, base, lg, xl, 2xl, 3xl, 4xl)
- **Weights**: Light (300), Regular (400), Medium (500), Semibold (600), Bold (700)

### Spacing
- **Scale**: 8-step based on 4px base unit (1, 2, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128px)

### Components
- Button (primary, secondary, tertiary, ghost, danger variants + sizes)
- Input (text, email, password, textarea, select)
- Card (default, elevated, outlined)
- Badge/Chip (status variants)
- Modal/Dialog
- Toast/Alert
- Table
- Navigation (header, sidebar, tabs)

## Best For

- Production web applications
- SaaS products
- Admin dashboards
- Marketing websites
- Projects requiring comprehensive component library

## Not Ideal For

- Highly branded products requiring custom design language
- Minimalist/experimental interfaces
```

**Step 2: Create tokens.json with comprehensive design tokens**

File: `skills/design-workflow/design-system-setup/templates/modern/tokens.json`

Complete W3C design tokens JSON with:
- Primary color scale (blue 50-900)
- Secondary color scale (purple 50-900)
- Full neutral scale (10 steps)
- Semantic colors (success/warning/error/info, each 9 steps)
- Typography (3 font families, 9 sizes, 5 weights, 3 line heights)
- Spacing (12-step scale)
- Border radius (5 values)
- Shadows (4 elevation levels)
- Transitions (duration + easing)

(Full JSON content approximately 300 lines - following same structure as minimal but expanded)

**Step 3: Create components.json**

Define 20+ components with variants, states, and size options.

**Step 4: Create figma-template.json**

Figma file structure with 6 pages:
- 🎨 Colors (primary, secondary, neutrals, semantic)
- 📝 Typography (families, scale, weights, specimens)
- 📏 Spacing & Layout (spacing scale, grid system)
- 🧩 Components (all 20+ components)
- 📱 Patterns (common UI patterns like forms, tables, navigation)
- 📖 Documentation (usage guidelines)

**Step 5: Create preview.png placeholder**

SVG preview showing modern aesthetic with gradients and comprehensive palette.

**Step 6: Commit**

```bash
git add skills/design-workflow/design-system-setup/templates/modern/
git commit -m "feat(templates): add modern design system template

- Comprehensive color system (primary, secondary, semantic scales)
- Full typography scale with 3 font families
- 20+ production-ready components
- Modern aesthetic with gradients and elevation
- Recommended default template"
```

## Acceptance Criteria
- [ ] All 5 template files created
- [ ] Tokens include full color scales (9 steps each)
- [ ] 20+ components defined
- [ ] Figma template has 6 pages
- [ ] Preview image created
- [ ] Committed

## Dependencies
- Task 1 completed (establishes template structure pattern)
