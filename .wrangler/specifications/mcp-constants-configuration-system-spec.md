---
id: "mcp-constants-config"
title: "MCP-Based Constants & Configuration System for Wrangler"
type: "specification"
status: "open"
priority: "high"
labels: ["architecture", "mcp", "infrastructure"]
createdAt: "2025-11-22T00:00:00.000Z"
updatedAt: "2025-11-22T00:00:00.000Z"
wranglerContext:
  agentId: "claude-code"
  estimatedEffort: "5-7 days"
---

# MCP-Based Constants & Configuration System for Wrangler

**Version:** 1.0.0
**Status:** Specification
**Last Updated:** November 22, 2025

## Executive Summary

This specification proposes an MCP-based constants and configuration management system for wrangler to eliminate duplication across 49+ skills and establish a single source of truth for formats, patterns, and validation rules. The system will use MCP resources and tools to expose constants programmatically while maintaining backward compatibility with plain-text skill files.

**Key Benefits:**
- Single source of truth for announcement formats, file organization rules, and common patterns
- Programmatic access to constants via MCP tools
- Version-controlled constants with migration support
- Reduced maintenance burden (change announcement emoji once, not 49 times)
- Enables runtime validation and consistency checking

## 1. Current State Analysis

### 1.1 Duplication Inventory

**Announcement Format** (49 occurrences):
- Every skill contains identical announcement block:
  ```markdown
  ## Skill Usage Announcement

  **MANDATORY**: When using this skill, announce it at the start with:

  ```
  🔧 Using Skill: {skill-name} | [brief purpose based on context]
  ```
  ```
- Currently requires manual updates across 49 files
- Format defined in plain text, no programmatic access

**File Organization Rules** (121 occurrences across 14 files):
- `.wrangler/memos/` - Reference material, RCA archives
- `.wrangler/issues/` - Issue tracking
- `.wrangler/specifications/` - Feature specs
- `.wrangler/plans/` - Implementation plans (optional)
- `docs/` - User-facing documentation
- `devops/docs/` - Developer documentation

**TodoWrite Patterns** (4 files with detailed examples):
- Status states: `pending`, `in_progress`, `completed`
- Mandatory requirements for checklist skills
- Format requirements (content vs activeForm)

**Validation Rules:**
- Issue statuses: `open`, `in_progress`, `closed`, `cancelled`
- Issue priorities: `low`, `medium`, `high`, `critical`
- Artifact types: `issue`, `specification`
- Max title length: 200 characters
- File naming conventions

**Common Workflow Patterns:**
- TDD cycle (RED-GREEN-REFACTOR)
- Skill announcement format
- MCP issue creation patterns
- Git commit message formats

### 1.2 Problems with Current Approach

**Maintenance Burden:**
- Changing announcement emoji requires editing 49+ files
- Updating file organization rules requires grep/replace across skills
- No validation that all skills follow same format
- High risk of inconsistency over time

**No Programmatic Access:**
- Agent cannot query "what's the announcement format?"
- No runtime validation of patterns
- Skills rely on memorization/copy-paste
- Cannot evolve formats without mass file changes

**Versioning Challenges:**
- No way to track when format changes
- Migration requires manual updates
- No automated consistency checks
- Difficult to detect drift

**Discovery Problems:**
- New constants/patterns must be documented in multiple places
- No central registry of available formats
- Skills may use outdated patterns

## 2. Research Findings

### 2.1 MCP Capabilities Overview

**MCP Protocol Components:**

1. **Tools** - Functions for AI to execute
   - Can accept parameters (Zod validated)
   - Return structured responses
   - Ideal for: Formatting, validation, transformation

2. **Resources** - Read-only data exposure
   - URI-based access (RFC 3986)
   - Support templates (RFC 6570): `wrangler://constants/{category}/{name}`
   - Can expose JSON, text, binary
   - Ideal for: Configuration, schemas, reference data

3. **Prompts** - Templated messages for users
   - Not applicable for this use case

**Source:** [Model Context Protocol Specification 2024-11-05](https://modelcontextprotocol.info/specification/2024-11-05/)

### 2.2 MCP Resources for Configuration

**Resources are designed for:**
- Exposing context and data to AI models
- Read-only access patterns
- Structured information retrieval
- Change notifications

**Resource Structure:**
```typescript
{
  uri: "wrangler://constants/formats/announcement",
  name: "announcement-format",
  title: "Skill Announcement Format",
  description: "Standard format for skill usage announcements",
  mimeType: "application/json",
  annotations: {
    audience: ["agent"],
    priority: 1.0
  }
}
```

**Limitations for Configuration:**
- Primarily designed for data exposure, not config management
- No built-in validation/schema features
- Change notifications available but not config-specific
- Works better for read-heavy access patterns

**Source:** [MCP Resources Specification](https://modelcontextprotocol.io/specification/2025-06-18/server/resources)

### 2.3 MCP Tools for Formatting/Validation

**Tools are better suited for:**
- Active operations (format, validate, transform)
- Parameter-based invocations
- Runtime validation with Zod
- Error handling and remediation

**Example Tool Pattern:**
```typescript
export const formatAnnouncementSchema = z.object({
  skillName: z.string().min(1),
  purpose: z.string().optional()
});

export async function formatAnnouncement(params) {
  const { skillName, purpose } = params;
  return {
    content: [{
      type: 'text',
      text: `🔧 Using Skill: ${skillName} | ${purpose || '[brief purpose]'}`
    }],
    isError: false
  };
}
```

**Source:** [TypeScript MCP SDK Examples](https://github.com/modelcontextprotocol/typescript-sdk)

### 2.4 Existing MCP Server Patterns

**GitHub MCP Server Configuration:**
- Uses environment variables for constants (`GITHUB_DYNAMIC_TOOLSETS=1`)
- Config stored in JSON with `mcpServers` object
- Constants prefixed with namespace: `GITHUB_MCP_*`
- Read-only mode flag: `X-MCP-Readonly` header

**Common Patterns:**
- Constants in separate `constants.ts` file (current wrangler pattern)
- Environment variables for runtime config
- JSON Schema for validation
- Tool-based access for formatting

**Source:** [GitHub MCP Server](https://github.com/github/github-mcp-server)

### 2.5 Trade-offs Analysis

| Approach | Pros | Cons | Best For |
|----------|------|------|----------|
| **MCP Resources** | - Clean URI-based access<br>- Follows MCP patterns<br>- Discoverable | - Read-only<br>- No validation logic<br>- More boilerplate | Static reference data |
| **MCP Tools** | - Runtime validation<br>- Error handling<br>- Flexible logic | - More invocation overhead<br>- Less discoverable | Formatting, validation |
| **Hybrid** | - Best of both worlds<br>- Resources for data<br>- Tools for operations | - More complex<br>- Two APIs to maintain | Complex use cases |
| **TypeScript Constants** | - Zero overhead<br>- Type-safe<br>- Simple | - Not MCP-accessible<br>- No runtime queries | Server-side only |

## 3. Recommended Architecture

### 3.1 Hybrid Approach: Resources + Tools

**Strategy:** Use MCP resources for static constants and MCP tools for formatting/validation operations.

**Why Hybrid:**
1. Resources provide discoverability (agent can browse available constants)
2. Tools provide validation and transformation (runtime safety)
3. TypeScript constants remain for server-side efficiency
4. Backward compatible (skills can still embed constants)

### 3.2 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Claude Code Agent                         │
│  - Queries constants via MCP resources                      │
│  - Formats output via MCP tools                             │
│  - References skills (text + MCP constants)                 │
└────────────────────┬────────────────────────────────────────┘
                     │ MCP Protocol
┌────────────────────┴────────────────────────────────────────┐
│               Wrangler MCP Server                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Constants Manager (NEW)                        │ │
│  │  - Resources registry                                  │ │
│  │  - Tools registry                                      │ │
│  │  - Version tracking                                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                     │                   │                    │
│  ┌──────────────────┴─────┐  ┌─────────┴──────────────────┐ │
│  │   MCP Resources        │  │   MCP Tools                │ │
│  │  - Formats             │  │  - format_announcement     │ │
│  │  - FileOrg rules       │  │  - validate_file_path      │ │
│  │  - TodoWrite patterns  │  │  - format_todo             │ │
│  │  - Validation schemas  │  │  - validate_issue_status   │ │
│  └────────────────────────┘  └────────────────────────────┘ │
│                     │                                        │
└─────────────────────┼────────────────────────────────────────┘
                      │
┌─────────────────────┴────────────────────────────────────────┐
│               Constants Data Layer                           │
│  mcp/constants/                                              │
│    ├── formats.ts          # Announcement, commit, etc.      │
│    ├── file-org.ts         # Directory rules                 │
│    ├── todo-patterns.ts    # TodoWrite formats               │
│    ├── issue-schemas.ts    # Status, priority, type schemas  │
│    ├── workflows.ts        # TDD cycle, patterns             │
│    └── index.ts            # Aggregator + versioning         │
└──────────────────────────────────────────────────────────────┘
```

### 3.3 Integration Strategy

**Backward Compatibility:**
- Skills continue to work as plain text
- Gradually migrate to MCP tool calls
- Hybrid period with both approaches

**Migration Path:**
1. Phase 1: Add MCP resources (read-only, no skill changes)
2. Phase 2: Add MCP tools (skills can opt-in)
3. Phase 3: Update skill templates to use MCP tools
4. Phase 4: Deprecate embedded constants in skills

## 4. API Design

### 4.1 MCP Resources

**Resource URI Scheme:** `wrangler://constants/{category}/{name}`

**Categories:**
- `formats` - Announcement, commit, file naming
- `file-org` - Directory rules and conventions
- `todo` - TodoWrite patterns and states
- `validation` - Issue statuses, priorities, schemas
- `workflows` - TDD cycle, common patterns

**Resource Examples:**

```typescript
// wrangler://constants/formats/announcement
{
  uri: "wrangler://constants/formats/announcement",
  name: "announcement-format",
  mimeType: "application/json",
  content: {
    version: "1.0.0",
    format: "🔧 Using Skill: {skillName} | {purpose}",
    variables: {
      skillName: { type: "string", required: true },
      purpose: { type: "string", required: false }
    },
    examples: [
      "🔧 Using Skill: brainstorming | Refining authentication design",
      "🔧 Using Skill: test-driven-development | Implementing user service"
    ]
  }
}

// wrangler://constants/file-org/directories
{
  uri: "wrangler://constants/file-org/directories",
  name: "directory-rules",
  mimeType: "application/json",
  content: {
    version: "1.0.0",
    directories: {
      ".wrangler/memos": {
        purpose: "Reference material, RCA archives, lessons learned",
        fileTypes: ["RCA-*.md", "YYYY-MM-DD-*.md"],
        examples: ["2025-11-17-auth-failure-rca.md"]
      },
      ".wrangler/issues": {
        purpose: "Issue tracking (MCP-managed)",
        fileTypes: ["*.md"],
        managed: true
      },
      ".wrangler/specifications": {
        purpose: "Feature specifications (MCP-managed)",
        fileTypes: ["*.md"],
        managed: true
      },
      ".wrangler/plans": {
        purpose: "Implementation plans (optional)",
        fileTypes: ["YYYY-MM-DD-PLAN_*.md"],
        optional: true
      },
      "docs": {
        purpose: "User-facing documentation",
        fileTypes: ["*.md"],
        examples: ["getting-started.md"]
      },
      "devops/docs": {
        purpose: "Developer/maintainer documentation",
        fileTypes: ["*.md"],
        examples: ["deployment-guide.md"]
      }
    }
  }
}

// wrangler://constants/todo/states
{
  uri: "wrangler://constants/todo/states",
  name: "todo-states",
  mimeType: "application/json",
  content: {
    version: "1.0.0",
    states: {
      pending: { description: "Task not yet started" },
      in_progress: { description: "Currently working on (limit to ONE)" },
      completed: { description: "Task finished successfully" }
    },
    rules: [
      "Exactly ONE task must be in_progress at any time",
      "Tasks must have both 'content' and 'activeForm'",
      "Mark tasks complete IMMEDIATELY after finishing"
    ]
  }
}

// wrangler://constants/validation/issue-status
{
  uri: "wrangler://constants/validation/issue-status",
  name: "issue-status-schema",
  mimeType: "application/json",
  content: {
    version: "1.0.0",
    schema: {
      type: "enum",
      values: ["open", "in_progress", "closed", "cancelled"],
      default: "open"
    },
    completedStatuses: ["closed", "cancelled"]
  }
}
```

### 4.2 MCP Tools

**Tool: `constants_format_announcement`**
```typescript
export const formatAnnouncementSchema = z.object({
  skillName: z.string().min(1).describe("Name of the skill being used"),
  purpose: z.string().optional().describe("Brief purpose description")
});

export async function formatAnnouncementTool(
  params: z.infer<typeof formatAnnouncementSchema>,
  constantsManager: ConstantsManager
): Promise<CallToolResult> {
  const format = await constantsManager.getConstant('formats', 'announcement');

  const announcement = format.format
    .replace('{skillName}', params.skillName)
    .replace('{purpose}', params.purpose || '[brief purpose based on context]');

  return {
    content: [{ type: 'text', text: announcement }],
    isError: false,
    metadata: { version: format.version }
  };
}
```

**Tool: `constants_validate_file_path`**
```typescript
export const validateFilePathSchema = z.object({
  path: z.string().min(1).describe("File path to validate"),
  context: z.enum(['memo', 'issue', 'spec', 'plan', 'docs', 'devops-docs'])
    .describe("Context for validation")
});

export async function validateFilePathTool(
  params: z.infer<typeof validateFilePathSchema>,
  constantsManager: ConstantsManager
): Promise<CallToolResult> {
  const fileOrgRules = await constantsManager.getConstant('file-org', 'directories');

  // Validation logic
  const contextMap = {
    'memo': '.wrangler/memos',
    'issue': '.wrangler/issues',
    'spec': '.wrangler/specifications',
    'plan': '.wrangler/plans',
    'docs': 'docs',
    'devops-docs': 'devops/docs'
  };

  const expectedDir = contextMap[params.context];
  const isValid = params.path.startsWith(expectedDir);

  if (!isValid) {
    return {
      content: [{
        type: 'text',
        text: `Invalid path. ${params.context} files should be in ${expectedDir}/\n\nExpected: ${expectedDir}/[filename].md\nActual: ${params.path}`
      }],
      isError: true
    };
  }

  return {
    content: [{ type: 'text', text: `✓ Valid path for ${params.context}` }],
    isError: false
  };
}
```

**Tool: `constants_format_todo`**
```typescript
export const formatTodoSchema = z.object({
  content: z.string().min(1).describe("Task description (imperative form)"),
  status: z.enum(['pending', 'in_progress', 'completed']).describe("Task status"),
  activeForm: z.string().optional().describe("Present continuous form (auto-generated if not provided)")
});

export async function formatTodoTool(
  params: z.infer<typeof formatTodoSchema>,
  constantsManager: ConstantsManager
): Promise<CallToolResult> {
  const todoPatterns = await constantsManager.getConstant('todo', 'states');

  // Auto-generate activeForm if not provided
  let activeForm = params.activeForm;
  if (!activeForm) {
    // Simple heuristic: "Run tests" -> "Running tests"
    activeForm = params.content.replace(/^(\w+)/, (match) => {
      const ing = match.endsWith('e') ? match.slice(0, -1) + 'ing' : match + 'ing';
      return ing.charAt(0).toUpperCase() + ing.slice(1);
    });
  }

  const todo = {
    content: params.content,
    status: params.status,
    activeForm: activeForm
  };

  return {
    content: [{
      type: 'text',
      text: JSON.stringify(todo, null, 2)
    }],
    isError: false,
    metadata: { todo }
  };
}
```

**Tool: `constants_validate_issue_status`**
```typescript
export const validateIssueStatusSchema = z.object({
  status: z.string().describe("Status to validate")
});

export async function validateIssueStatusTool(
  params: z.infer<typeof validateIssueStatusSchema>,
  constantsManager: ConstantsManager
): Promise<CallToolResult> {
  const schema = await constantsManager.getConstant('validation', 'issue-status');

  const isValid = schema.schema.values.includes(params.status);

  if (!isValid) {
    return {
      content: [{
        type: 'text',
        text: `Invalid status: "${params.status}"\n\nValid statuses: ${schema.schema.values.join(', ')}`
      }],
      isError: true
    };
  }

  return {
    content: [{ type: 'text', text: `✓ Valid status: ${params.status}` }],
    isError: false,
    metadata: {
      isCompleted: schema.completedStatuses.includes(params.status)
    }
  };
}
```

**Tool: `constants_get_workflow_pattern`**
```typescript
export const getWorkflowPatternSchema = z.object({
  workflow: z.enum(['tdd', 'git-commit', 'skill-checklist'])
    .describe("Workflow pattern to retrieve")
});

export async function getWorkflowPatternTool(
  params: z.infer<typeof getWorkflowPatternSchema>,
  constantsManager: ConstantsManager
): Promise<CallToolResult> {
  const workflows = await constantsManager.getConstant('workflows', 'patterns');
  const pattern = workflows[params.workflow];

  if (!pattern) {
    return {
      content: [{
        type: 'text',
        text: `Workflow pattern not found: ${params.workflow}`
      }],
      isError: true
    };
  }

  return {
    content: [{
      type: 'text',
      text: JSON.stringify(pattern, null, 2)
    }],
    isError: false,
    metadata: { pattern }
  };
}
```

### 4.3 Constants Data Layer

**File: `mcp/constants/formats.ts`**
```typescript
/**
 * Standard formats for announcements, commits, file naming
 */

export const FORMATS = {
  announcement: {
    version: "1.0.0",
    format: "🔧 Using Skill: {skillName} | {purpose}",
    variables: {
      skillName: { type: "string", required: true },
      purpose: { type: "string", required: false }
    },
    examples: [
      "🔧 Using Skill: brainstorming | Refining authentication design",
      "🔧 Using Skill: test-driven-development | Implementing user service"
    ]
  },

  gitCommit: {
    version: "1.0.0",
    format: "{type}: {summary}\n\n{body}\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)\n\nCo-Authored-By: Claude <noreply@anthropic.com>",
    variables: {
      type: {
        type: "string",
        required: true,
        values: ["feat", "fix", "refactor", "test", "docs", "chore"]
      },
      summary: { type: "string", required: true, maxLength: 72 },
      body: { type: "string", required: false }
    }
  },

  fileNaming: {
    version: "1.0.0",
    patterns: {
      memo: "YYYY-MM-DD-topic-slug.md",
      rca: "YYYY-MM-DD-topic-rca.md",
      plan: "YYYY-MM-DD-PLAN_spec-name.md",
      design: "YYYY-MM-DD-topic-design.md"
    }
  }
} as const;
```

**File: `mcp/constants/file-org.ts`**
```typescript
/**
 * File organization rules and directory conventions
 */

export interface DirectoryRule {
  purpose: string;
  fileTypes: string[];
  examples?: string[];
  managed?: boolean;
  optional?: boolean;
}

export const FILE_ORG_RULES = {
  version: "1.0.0",

  directories: {
    ".wrangler/memos": {
      purpose: "Reference material, RCA archives, lessons learned",
      fileTypes: ["RCA-*.md", "YYYY-MM-DD-*.md"],
      examples: ["2025-11-17-auth-failure-rca.md"],
      managed: false,
      optional: false
    },

    ".wrangler/issues": {
      purpose: "Issue tracking (MCP-managed)",
      fileTypes: ["*.md"],
      managed: true,
      optional: false
    },

    ".wrangler/specifications": {
      purpose: "Feature specifications (MCP-managed)",
      fileTypes: ["*.md"],
      managed: true,
      optional: false
    },

    ".wrangler/plans": {
      purpose: "Implementation plans (optional reference docs)",
      fileTypes: ["YYYY-MM-DD-PLAN_*.md"],
      managed: false,
      optional: true,
      whenToCreate: [
        "10+ issues/tasks requiring architectural overview",
        "Multiple interconnected components",
        "Significant design decisions needing documentation",
        "Complex patterns/conventions across tasks"
      ],
      whenToSkip: [
        "< 5 simple tasks",
        "No architectural complexity",
        "Obvious approach with no design decisions"
      ]
    },

    "docs": {
      purpose: "User-facing documentation",
      fileTypes: ["*.md"],
      examples: ["getting-started.md", "api-reference.md"],
      managed: false,
      optional: false
    },

    "devops/docs": {
      purpose: "Developer/maintainer documentation",
      fileTypes: ["*.md"],
      examples: ["deployment-guide.md", "architecture.md"],
      managed: false,
      optional: false
    }
  },

  antiPatterns: [
    {
      pattern: "*.md at project root (except README, CHANGELOG, LICENSE)",
      fix: "Move to appropriate directory based on content"
    },
    {
      pattern: "Implementation details in plan files instead of MCP issues",
      fix: "Plan files are for architecture/design context only"
    }
  ]
} as const;
```

**File: `mcp/constants/todo-patterns.ts`**
```typescript
/**
 * TodoWrite patterns and state definitions
 */

export const TODO_PATTERNS = {
  version: "1.0.0",

  states: {
    pending: {
      description: "Task not yet started",
      color: "gray"
    },
    in_progress: {
      description: "Currently working on (limit to ONE task at a time)",
      color: "yellow"
    },
    completed: {
      description: "Task finished successfully",
      color: "green"
    }
  },

  rules: [
    "Exactly ONE task must be in_progress at any time (not less, not more)",
    "Tasks must have both 'content' (imperative) and 'activeForm' (present continuous)",
    "Mark tasks complete IMMEDIATELY after finishing (don't batch completions)",
    "Complete current tasks before starting new ones",
    "Remove tasks that are no longer relevant from the list entirely"
  ],

  taskCompletionRequirements: [
    "ONLY mark as completed when FULLY accomplished",
    "If errors/blockers occur, keep as in_progress",
    "When blocked, create new task for resolution",
    "Never mark complete if: tests failing, implementation partial, unresolved errors, missing dependencies"
  ],

  examples: {
    good: [
      {
        content: "Run tests",
        status: "in_progress",
        activeForm: "Running tests"
      },
      {
        content: "Fix authentication bug",
        status: "pending",
        activeForm: "Fixing authentication bug"
      }
    ],
    bad: [
      {
        content: "Running tests", // Should be imperative
        status: "pending",
        activeForm: "Running tests"
      },
      {
        content: "Fix bug", // Too vague
        status: "in_progress",
        activeForm: "Fix bug" // Should be present continuous
      }
    ]
  }
} as const;
```

**File: `mcp/constants/issue-schemas.ts`**
```typescript
/**
 * Issue validation schemas and enums
 */

export const ISSUE_SCHEMAS = {
  version: "1.0.0",

  status: {
    schema: {
      type: "enum",
      values: ["open", "in_progress", "closed", "cancelled"],
      default: "open"
    },
    completedStatuses: ["closed", "cancelled"],
    descriptions: {
      open: "Issue created but work not yet started",
      in_progress: "Actively working on this issue",
      closed: "Work completed successfully",
      cancelled: "Work cancelled or no longer needed"
    }
  },

  priority: {
    schema: {
      type: "enum",
      values: ["low", "medium", "high", "critical"],
      default: "medium"
    },
    descriptions: {
      low: "Nice to have, not urgent",
      medium: "Standard priority",
      high: "Important, should be done soon",
      critical: "Blocking, must be done immediately"
    }
  },

  artifactType: {
    schema: {
      type: "enum",
      values: ["issue", "specification"],
      default: "issue"
    },
    descriptions: {
      issue: "Implementation task or bug fix",
      specification: "Feature specification or design document"
    },
    directories: {
      issue: ".wrangler/issues",
      specification: ".wrangler/specifications"
    }
  },

  validation: {
    maxTitleLength: 200,
    minTitleLength: 1,
    minDescriptionLength: 1,
    maxListLimit: 1000,
    defaultListLimit: 100
  }
} as const;
```

**File: `mcp/constants/workflows.ts`**
```typescript
/**
 * Common workflow patterns and cycles
 */

export const WORKFLOW_PATTERNS = {
  version: "1.0.0",

  tdd: {
    name: "Test-Driven Development (RED-GREEN-REFACTOR)",
    steps: [
      {
        phase: "RED",
        action: "Write failing test",
        description: "Write one minimal test showing what should happen",
        verification: "Run test and verify it fails for the RIGHT reason"
      },
      {
        phase: "GREEN",
        action: "Write minimal code to pass",
        description: "Implement just enough code to make the test pass",
        verification: "Run test and verify it passes"
      },
      {
        phase: "REFACTOR",
        action: "Clean up code",
        description: "Improve code quality while keeping tests green",
        verification: "Run all tests and verify they still pass"
      }
    ],
    ironLaw: "NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST"
  },

  gitCommit: {
    name: "Git Commit Workflow",
    steps: [
      { action: "Stage changes", command: "git add <files>" },
      { action: "Review diff", command: "git diff --staged" },
      { action: "Commit with message", command: "git commit -m <message>" },
      { action: "Verify commit", command: "git log -1" }
    ],
    messageFormat: "See formats.gitCommit"
  },

  skillChecklist: {
    name: "Skills with Checklists → TodoWrite",
    rule: "If a skill has a checklist, MUST create TodoWrite todos for EACH item",
    antiPatterns: [
      "Working through checklist mentally",
      "Skipping TodoWrite 'to save time'",
      "Batching multiple items into one todo",
      "Marking complete without doing them"
    ],
    reason: "Checklists without TodoWrite tracking = steps get skipped"
  }
} as const;
```

**File: `mcp/constants/index.ts`**
```typescript
/**
 * Constants aggregator and version tracking
 */

import { FORMATS } from './formats.js';
import { FILE_ORG_RULES } from './file-org.js';
import { TODO_PATTERNS } from './todo-patterns.js';
import { ISSUE_SCHEMAS } from './issue-schemas.js';
import { WORKFLOW_PATTERNS } from './workflows.js';

export const WRANGLER_CONSTANTS = {
  version: "1.0.0",
  updated: "2025-11-22T00:00:00.000Z",

  categories: {
    formats: FORMATS,
    fileOrg: FILE_ORG_RULES,
    todo: TODO_PATTERNS,
    validation: ISSUE_SCHEMAS,
    workflows: WORKFLOW_PATTERNS
  }
} as const;

export * from './formats.js';
export * from './file-org.js';
export * from './todo-patterns.js';
export * from './issue-schemas.js';
export * from './workflows.js';

/**
 * Constants Manager - provides programmatic access to constants
 */
export class ConstantsManager {
  private constants = WRANGLER_CONSTANTS;

  /**
   * Get a constant by category and name
   */
  async getConstant(category: string, name: string): Promise<any> {
    const categoryData = this.constants.categories[category as keyof typeof this.constants.categories];
    if (!categoryData) {
      throw new Error(`Unknown constant category: ${category}`);
    }

    const constant = (categoryData as any)[name];
    if (!constant) {
      throw new Error(`Unknown constant: ${category}.${name}`);
    }

    return constant;
  }

  /**
   * Get all constants for a category
   */
  async getCategory(category: string): Promise<any> {
    const categoryData = this.constants.categories[category as keyof typeof this.constants.categories];
    if (!categoryData) {
      throw new Error(`Unknown constant category: ${category}`);
    }
    return categoryData;
  }

  /**
   * Get version info
   */
  getVersion(): string {
    return this.constants.version;
  }

  /**
   * List all available categories
   */
  listCategories(): string[] {
    return Object.keys(this.constants.categories);
  }
}
```

## 5. Usage Examples

### 5.1 Agent Using MCP Resources

**Query available constants:**
```typescript
// Agent discovers available constants
const resources = await mcpClient.listResources();
// Returns: wrangler://constants/formats/announcement, etc.

// Agent reads announcement format
const resource = await mcpClient.readResource("wrangler://constants/formats/announcement");
// Returns: JSON with format, variables, examples
```

**Use in skill:**
```markdown
## Skill Usage Announcement

**MANDATORY**: Use the MCP tool `constants_format_announcement` to generate the announcement, or query `wrangler://constants/formats/announcement` for the format.

Example:
```typescript
const result = await mcpClient.callTool('constants_format_announcement', {
  skillName: 'brainstorming',
  purpose: 'Refining authentication design'
});
// Returns: "🔧 Using Skill: brainstorming | Refining authentication design"
```
```

### 5.2 Agent Using MCP Tools

**Format announcement:**
```typescript
// Before starting a skill
const announcement = await mcpClient.callTool('constants_format_announcement', {
  skillName: 'test-driven-development',
  purpose: 'Implementing user authentication'
});

console.log(announcement.content[0].text);
// Output: "🔧 Using Skill: test-driven-development | Implementing user authentication"
```

**Validate file path:**
```typescript
// Before creating a memo file
const validation = await mcpClient.callTool('constants_validate_file_path', {
  path: '.wrangler/memos/2025-11-22-auth-refactor-rca.md',
  context: 'memo'
});

if (validation.isError) {
  console.error(validation.content[0].text);
  // Fix path
} else {
  // Proceed with file creation
}
```

**Format TodoWrite todo:**
```typescript
// When creating todos from skill checklist
const todo = await mcpClient.callTool('constants_format_todo', {
  content: 'Run tests',
  status: 'in_progress'
  // activeForm auto-generated as "Running tests"
});

const todoObj = todo.metadata.todo;
// Use in TodoWrite tool call
```

**Get workflow pattern:**
```typescript
// When following TDD workflow
const tdd = await mcpClient.callTool('constants_get_workflow_pattern', {
  workflow: 'tdd'
});

const pattern = tdd.metadata.pattern;
// Follow steps: RED -> GREEN -> REFACTOR
```

### 5.3 Skill Template Updates

**Old approach (embedded constants):**
```markdown
## Skill Usage Announcement

**MANDATORY**: When using this skill, announce it at the start with:

```
🔧 Using Skill: {skill-name} | [brief purpose based on context]
```

**Example:**
```
🔧 Using Skill: {skill-name} | [Provide context-specific example]
```
```

**New approach (reference MCP constants):**
```markdown
## Skill Usage Announcement

**MANDATORY**: When using this skill, announce it at the start.

Use MCP tool `constants_format_announcement` or query resource `wrangler://constants/formats/announcement` for the current format.

**Example:**
```typescript
await mcpClient.callTool('constants_format_announcement', {
  skillName: '{skill-name}',
  purpose: 'Your specific purpose here'
});
```
```

### 5.4 Backward Compatibility

**Transition period:**
- Skills can embed constants AND reference MCP
- Agents can use either approach
- Gradual migration over time

**Version check:**
```typescript
// Agent checks constants version
const version = constantsManager.getVersion();
if (version !== expectedVersion) {
  console.warn('Constants version mismatch');
}
```

## 6. Migration Strategy

### 6.1 Four-Phase Rollout

**Phase 1: Foundation (Week 1)**
- Implement constants data layer (`mcp/constants/*.ts`)
- Add ConstantsManager class
- Write comprehensive tests
- Document data structures

**Phase 2: MCP Resources (Week 2)**
- Implement resource handler in MCP server
- Register resources for all categories
- Add resource listing endpoint
- Test resource access

**Phase 3: MCP Tools (Week 3)**
- Implement formatting/validation tools
- Add tool handlers to MCP server
- Write tool tests
- Document tool usage

**Phase 4: Skill Migration (Week 4+)**
- Update skill template
- Create migration guide
- Gradually update high-traffic skills
- Deprecate embedded constants (future)

### 6.2 Migration Timeline

```
Week 1: Foundation
├── Day 1-2: Implement constants/*.ts files
├── Day 3-4: Write unit tests
└── Day 5: Documentation

Week 2: MCP Resources
├── Day 1-2: Resource handler implementation
├── Day 3: Resource listing and discovery
└── Day 4-5: Integration tests

Week 3: MCP Tools
├── Day 1-2: Implement 5 core tools
├── Day 3: Tool tests and validation
└── Day 4-5: Error handling and edge cases

Week 4: Skill Migration
├── Day 1: Update skill template
├── Day 2-3: Migrate 5 high-priority skills
└── Day 4-5: Migration documentation
```

### 6.3 Backward Compatibility Strategy

**Hybrid Period (6-12 months):**
- Skills contain embedded constants (current)
- Skills reference MCP constants (new)
- Both approaches valid
- No breaking changes

**Deprecation Path:**
1. Add deprecation warnings to skill template
2. Update all wrangler-maintained skills
3. Notify community of upcoming changes
4. Remove embedded constants after grace period

### 6.4 Version Management

**Constants Versioning:**
```typescript
export const FORMATS = {
  version: "1.0.0", // Semantic versioning
  // ...
};
```

**Breaking Changes:**
- Bump major version (1.0.0 -> 2.0.0)
- Maintain v1 compatibility for 6 months
- Provide migration tool

**Non-Breaking Changes:**
- Bump minor version (1.0.0 -> 1.1.0)
- Add new constants/tools
- Backward compatible

## 7. Performance Analysis

### 7.1 Latency Estimates

**MCP Resource Access:**
- Resource lookup: ~1-5ms (in-memory)
- JSON serialization: ~1ms
- Total: ~2-6ms per resource read

**MCP Tool Invocation:**
- Tool dispatch: ~1-2ms
- Validation (Zod): ~1-3ms
- Formatting logic: ~1-2ms
- Total: ~3-7ms per tool call

**TypeScript Constants (comparison):**
- Direct access: ~0.01ms (negligible)
- Import overhead: ~0.1ms (one-time)

**Conclusion:** MCP overhead is acceptable (~5ms) for infrequent operations (skill announcements, validation). Not suitable for hot paths.

### 7.2 Caching Strategy

**Server-Side Cache:**
```typescript
class ConstantsManager {
  private cache = new Map<string, any>();

  async getConstant(category: string, name: string) {
    const key = `${category}.${name}`;

    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    // Load and cache
    const value = this.loadConstant(category, name);
    this.cache.set(key, value);
    return value;
  }
}
```

**Cache Invalidation:**
- On server restart (rare)
- On version update (manual trigger)
- TTL: None (constants rarely change)

### 7.3 Memory Footprint

**Constants Data:**
- formats.ts: ~2 KB
- file-org.ts: ~3 KB
- todo-patterns.ts: ~2 KB
- issue-schemas.ts: ~2 KB
- workflows.ts: ~3 KB
- **Total: ~12 KB** (negligible)

**Runtime Overhead:**
- ConstantsManager instance: ~1 KB
- Cache (all constants): ~12 KB
- **Total: ~13 KB** (negligible)

### 7.4 Offline Behavior

**MCP Server Unavailable:**
- Agent falls back to embedded constants in skills
- No degradation during offline development
- Skills remain functional

**Graceful Degradation:**
```typescript
async function getAnnouncementFormat() {
  try {
    return await mcpClient.callTool('constants_format_announcement', {...});
  } catch (error) {
    // Fallback to hardcoded format
    return `🔧 Using Skill: ${skillName} | ${purpose}`;
  }
}
```

## 8. Testing Strategy

### 8.1 Test Coverage Requirements

**Unit Tests (80%+ coverage):**
- Constants data structures
- ConstantsManager methods
- Tool validation logic
- Resource serialization

**Integration Tests:**
- MCP resource endpoints
- MCP tool invocations
- Error handling
- Version compatibility

**End-to-End Tests:**
- Agent using resources
- Agent using tools
- Migration scenarios
- Backward compatibility

### 8.2 Test Examples

**Unit Test: ConstantsManager**
```typescript
describe('ConstantsManager', () => {
  it('should retrieve announcement format', async () => {
    const manager = new ConstantsManager();
    const format = await manager.getConstant('formats', 'announcement');

    expect(format.version).toBe('1.0.0');
    expect(format.format).toContain('🔧 Using Skill');
  });

  it('should throw error for unknown constant', async () => {
    const manager = new ConstantsManager();

    await expect(
      manager.getConstant('formats', 'nonexistent')
    ).rejects.toThrow('Unknown constant: formats.nonexistent');
  });
});
```

**Integration Test: MCP Tool**
```typescript
describe('constants_format_announcement', () => {
  it('should format announcement correctly', async () => {
    const result = await callTool('constants_format_announcement', {
      skillName: 'test-skill',
      purpose: 'Testing'
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].text).toBe('🔧 Using Skill: test-skill | Testing');
  });

  it('should use default purpose when not provided', async () => {
    const result = await callTool('constants_format_announcement', {
      skillName: 'test-skill'
    });

    expect(result.content[0].text).toContain('[brief purpose based on context]');
  });
});
```

## 9. Security Considerations

### 9.1 Input Validation

**All tool parameters validated with Zod:**
```typescript
export const formatAnnouncementSchema = z.object({
  skillName: z.string().min(1).max(100),
  purpose: z.string().max(500).optional()
});
```

**Prevent injection attacks:**
- No eval() or template string execution
- Sanitize user input
- Limit string lengths

### 9.2 Path Traversal Prevention

**File path validation:**
```typescript
async function validateFilePathTool(params) {
  // Prevent path traversal
  if (params.path.includes('..')) {
    throw new Error('Path traversal denied');
  }

  // Ensure within expected directory
  const normalized = path.normalize(params.path);
  // ... validation logic
}
```

### 9.3 Resource Access Control

**Resources are read-only:**
- No write operations
- No side effects
- Stateless access

**Tool access control:**
- Tools have limited scope
- No file system access (except validation)
- No network operations

## 10. Future Enhancements

### 10.1 Short-Term (3-6 months)

**Dynamic Configuration:**
- User-customizable announcement emoji
- Project-specific file org rules
- Custom validation schemas

**Validation Tools:**
- `constants_validate_commit_message`
- `constants_validate_todo_format`
- `constants_lint_skill_file`

**Discovery Tools:**
- `constants_search` - Full-text search across constants
- `constants_list_all` - List all available constants
- `constants_get_examples` - Get usage examples

### 10.2 Medium-Term (6-12 months)

**Versioned Migration:**
- Automatic migration tools
- Version conflict detection
- Rollback support

**Constants Inheritance:**
- Project overrides for global constants
- Namespace hierarchies
- Merge strategies

**Metrics & Analytics:**
- Track constant usage
- Identify deprecated patterns
- Usage reports

### 10.3 Long-Term (12+ months)

**Constants as Code:**
- Git-tracked constants
- PR-based changes
- Automated testing

**Multi-Language Support:**
- Constants in multiple languages
- Localization support
- Region-specific rules

**AI-Assisted Evolution:**
- Suggest constants based on usage patterns
- Detect drift and inconsistencies
- Auto-generate examples

## 11. Open Questions

### 11.1 Technical Questions

1. **Should constants be in separate MCP server or extend existing one?**
   - **Recommendation:** Extend existing wrangler MCP server
   - **Reasoning:** Simpler deployment, shared infrastructure, single client connection

2. **How to handle user customization?**
   - **Option A:** Environment variables (simple, limited)
   - **Option B:** Config file (flexible, more complex)
   - **Option C:** MCP tool: `constants_set_override` (programmatic)
   - **Recommendation:** Start with Option A, evolve to Option C

3. **Versioning strategy for breaking changes?**
   - **Recommendation:** Semantic versioning with 6-month deprecation period
   - **Migration:** Provide automated migration tool

### 11.2 Design Questions

1. **Should skills eventually remove embedded constants entirely?**
   - **Recommendation:** Yes, but after 6-12 month transition period
   - **Benefit:** Single source of truth
   - **Risk:** Offline development broken (mitigation: local MCP server)

2. **How to handle project-specific customization?**
   - **Recommendation:** Allow `.wrangler/config/constants.json` override file
   - **Merge strategy:** Project config overrides global defaults

3. **What constants should be MCPified first?**
   - **Phase 1:** Announcement format (highest duplication)
   - **Phase 2:** File org rules (frequently referenced)
   - **Phase 3:** TodoWrite patterns (skill-specific)
   - **Phase 4:** Validation schemas (already in TypeScript)

## 12. Success Metrics

### 12.1 Adoption Metrics

**Short-term (3 months):**
- 50% of skills reference MCP constants
- 10+ tool invocations per session
- Zero breaking changes reported

**Medium-term (6 months):**
- 80% of skills reference MCP constants
- 25+ tool invocations per session
- 5+ community contributions to constants

**Long-term (12 months):**
- 100% of skills use MCP constants exclusively
- Embedded constants deprecated
- 10+ external projects using wrangler constants

### 12.2 Quality Metrics

**Consistency:**
- 100% of skills use identical announcement format
- Zero file organization violations
- All TodoWrite calls validated

**Maintainability:**
- 90% reduction in skill update overhead
- <5 minutes to change global constant
- Automated drift detection

**Performance:**
- <10ms latency for tool calls
- <100ms for cold start
- Zero performance regressions

## 13. Conclusion

This specification proposes a hybrid MCP-based constants system that:

1. **Eliminates duplication** - Single source of truth for formats, rules, patterns
2. **Enables programmatic access** - MCP resources and tools for runtime queries
3. **Maintains backward compatibility** - Gradual migration, no breaking changes
4. **Scales efficiently** - Minimal overhead, caching, graceful degradation
5. **Future-proof** - Versioning, migration support, extensibility

**Recommended Next Steps:**
1. Review and approve specification
2. Implement Phase 1 (Foundation)
3. Write comprehensive tests
4. Deploy to staging environment
5. Migrate 5 pilot skills
6. Gather feedback and iterate

## References

### MCP Protocol
- [Model Context Protocol Specification](https://modelcontextprotocol.info/specification/2024-11-05/)
- [MCP Resources Documentation](https://modelcontextprotocol.io/specification/2025-06-18/server/resources)
- [MCP Best Practices](https://modelcontextprotocol.info/docs/best-practices/)

### Implementation Examples
- [GitHub MCP Server](https://github.com/github/github-mcp-server)
- [TypeScript MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Server Examples](https://modelcontextprotocol.io/examples)

### Wrangler Context
- [Wrangler MCP Integration Spec](/.wrangler/memos/2024-10-29-wrangler-mcp-integration-spec.md)
- [Wrangler MCP Server README](/mcp/README.md)
- [Wrangler CLAUDE.md](/CLAUDE.md)

---

**Document Status:** Draft for review
**Authors:** Claude Code (research and design)
**Reviewers:** [To be assigned]
**Approval Date:** [Pending]
