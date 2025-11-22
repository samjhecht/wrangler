# Wrangler

Skills library and MCP server for AI coding assistants.

## Components

### Skills Library

46 skills across testing, debugging, collaboration, governance, and code analysis.

### MCP Server

Issue and specification tracking using markdown files with YAML frontmatter. Stored in `.wrangler/issues/` and `.wrangler/specifications/`. Provides 11 MCP tools for CRUD operations.

### Slash Commands

7 commands that activate skills:
- `/wrangler:brainstorm` - Design refinement
- `/wrangler:write-plan` - Implementation planning
- `/wrangler:implement` - Autonomous execution
- `/wrangler:run-tests` - Test execution
- `/wrangler:scan-dependencies` - Dependency analysis
- `/wrangler:update-yourself` - Version migration
- `/wrangler:analyze-session-gaps` - Workflow analysis

### Session Hooks

Automatic workspace initialization on session start creates `.wrangler/` directory structure and loads core skills.

## Installation

Install via Claude Code plugin system. Run `/help` to verify - should list `/wrangler:*` commands.

## Skills

### Testing
- **test-driven-development** - RED-GREEN-REFACTOR cycle enforcement
- **run-the-tests** - Test suite execution with failure fixing
- **condition-based-waiting** - Async test patterns replacing arbitrary timeouts
- **testing-anti-patterns** - Prevents testing mock behavior and test-only production methods

### Debugging
- **systematic-debugging** - Four-phase root cause investigation framework
- **root-cause-tracing** - Backward tracing through call stack with instrumentation
- **verification-before-completion** - Requires running verification commands before success claims
- **defense-in-depth** - Multi-layer validation to prevent invalid data propagation

### Collaboration
- **brainstorming** - Socratic design refinement
- **writing-plans** - Implementation plan creation with MCP issues
- **implement** - Autonomous implementation via subagents with TDD and code review
- **code-review** - Comprehensive code review framework
- **requesting-code-review** - Pre-merge review workflow
- **receiving-code-review** - Technical rigor in feedback responses
- **reviewing-implementation-progress** - Mid-implementation checkpoint
- **dispatching-parallel-agents** - Concurrent investigation of independent failures

### Git Workflows
- **using-git-worktrees** - Isolated workspace creation with smart directory selection
- **finishing-a-development-branch** - Structured options for merge, PR, or cleanup

### Issue Management
- **create-new-issue** - Creates issues via MCP `issues_create` tool
- **writing-specifications** - Technical specification creation

### Governance
- **housekeeping** - Updates roadmap, reconciles issues, detects drift
- **initialize-governance** - Creates constitution, roadmap, next steps
- **verify-governance** - Validates governance file structure
- **refresh-metrics** - Updates status counts
- **check-constitutional-alignment** - Validates feature alignment
- **validating-roadmap** - Checks specification consistency
- **refining-specifications** - Reviews specs for ambiguity

### Frontend Testing
- **frontend-design** - Production-grade interface creation
- **frontend-e2e-user-journeys** - End-to-end user flow testing
- **frontend-visual-regression-testing** - Visual diff testing
- **frontend-accessibility-verification** - A11y compliance checks

### Code Analysis
- **locating-code** - Finds files by topic/feature
- **analyzing-implementations** - Documents how code works
- **finding-code-patterns** - Finds similar implementations
- **analyzing-research-documents** - Extracts insights from research docs
- **researching-web-sources** - Strategic web research
- **dependency-opportunity-scanner** - Identifies replacement opportunities

### Wrangler System
- **using-wrangler** - Skills discovery and workflow establishment
- **migration-detector** - Version check on startup
- **migration-executor** - LLM-driven migrations
- **startup-checklist** - Session start validation

### Meta Skills
- **writing-skills** - TDD for creating skills
- **testing-skills-with-subagents** - Skill validation
- **sharing-skills** - Contribution workflow
- **organize-root-files** - Cleans up markdown files at root

## MCP Server

Provides 11 tools for issue and specification management:

- `issues_create` - Create new issues or specifications
- `issues_list` - List with filtering by status, priority, labels, project
- `issues_search` - Full-text search across title, description, labels
- `issues_get` - Retrieve single issue by ID
- `issues_update` - Update issue fields
- `issues_delete` - Delete issues with confirmation
- `issues_labels` - Manage labels
- `issues_metadata` - Manage wranglerContext metadata
- `issues_projects` - Manage project assignments
- `issues_mark_complete` - Mark issues as closed
- `issues_all_complete` - Check completion status

### Storage Format

Markdown files with YAML frontmatter:
- Location: `.wrangler/issues/`, `.wrangler/specifications/`
- Filename: `{counter}-{slug}.md` (e.g., `000001-add-auth.md`)
- Frontmatter: id, title, type, status, priority, labels, assignee, project, dates
- Body: Markdown content

See [docs/MCP-USAGE.md](docs/MCP-USAGE.md) for details.

## How It Works

1. Session start hook (`hooks/session-start.sh`) initializes workspace
2. Creates `.wrangler/` directory structure if missing
3. Loads `using-wrangler` skill
4. Skills activate when relevant to task
5. MCP server provides issue/spec tracking
6. Slash commands trigger specific workflows

## Directory Structure

```
wrangler/
├── skills/                  # 46 skills
├── commands/                # 7 slash commands
├── hooks/                   # Session hooks
├── mcp/                     # MCP server (TypeScript)
├── docs/                    # Documentation
├── .wrangler/               # Workspace (created on session start)
│   ├── issues/              # Issue tracking
│   ├── specifications/      # Specifications
│   ├── plans/               # Implementation plans (optional)
│   ├── memos/               # RCA, research, lessons learned
│   └── governance/          # Constitution, roadmap
└── .claude-plugin/          # Plugin config + MCP server registration
```

## Requirements

- Claude Code with plugin support
- Git repository (for workspace initialization)
- Node.js 20+ (for MCP server)

## Documentation

- [MCP Usage](docs/MCP-USAGE.md) - MCP server tools and usage
- [Governance](docs/GOVERNANCE.md) - Constitutional framework
- [Session Hooks](docs/SESSION-HOOKS.md) - Hook system and state management
- [Versioning](docs/VERSIONING.md) - Version tracking and migration
- [Slash Commands](docs/SLASH-COMMANDS.md) - Command reference
- [Workflow Patterns](docs/WORKFLOW-PATTERNS.md) - Multi-agent workflows
- [Workflow Ideas](docs/WORKFLOW-IDEAS.md) - Potential workflows

## Contributing

Use `writing-skills` and `testing-skills-with-subagents` skills to create new skills. Submit PRs via `sharing-skills` workflow.

## License

MIT
