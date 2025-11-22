# Wrangler

Skills library and workflow system for AI coding assistants.

## What Wrangler Provides

### Skills Library

25 skills covering testing, debugging, collaboration, issue management, and workflow orchestration.

### Built-in MCP Server

Local issue and specification management system with 11 tools. Issues and specifications are stored as markdown files with YAML frontmatter in `issues/` and `specifications/` directories.

### Slash Commands

Three commands that activate corresponding skills:
- `/wrangler:brainstorm`
- `/wrangler:write-plan`
- `/wrangler:execute-plan`

### Automatic Initialization

Session start hook creates workspace directories and loads the `using-wrangler` skill.

## Installation

Install via Claude Code plugin system.

Verify installation:
```bash
/help
```

Expected output includes `/wrangler:brainstorm`, `/wrangler:write-plan`, and `/wrangler:execute-plan`.

## Skills

### Testing
- **test-driven-development** - RED-GREEN-REFACTOR cycle enforcement
- **condition-based-waiting** - Async test patterns replacing arbitrary timeouts
- **testing-anti-patterns** - Prevents testing mock behavior and test-only production methods

### Debugging
- **systematic-debugging** - Four-phase root cause investigation framework
- **root-cause-tracing** - Backward tracing through call stack with instrumentation
- **verification-before-completion** - Requires running verification commands before success claims
- **defense-in-depth** - Multi-layer validation to prevent invalid data propagation

### Collaboration
- **brainstorming** - Socratic design refinement through structured questioning
- **writing-plans** - Implementation plan creation with exact file paths and code examples
- **implement** - Autonomous implementation via subagents with TDD and code review
- **dispatching-parallel-agents** - Concurrent investigation of independent failures
- **requesting-code-review** - Pre-merge review workflow
- **receiving-code-review** - Technical rigor in responding to feedback

### Git Workflows
- **using-git-worktrees** - Isolated workspace creation with smart directory selection
- **finishing-a-development-branch** - Structured options for merge, PR, or cleanup

### Issue Management
- **create-new-issue** - Creates issues via MCP `issues_create` tool with proper metadata
- **writing-specifications** - Technical specification creation with comprehensive structure

### Workflows
- **housekeeping** - Multi-phase workflow coordinating three parallel agents:
  - Updates project roadmap
  - Reconciles open issues with implementation
  - Moves completed issues to archive
  - Detects documentation drift
  - Generates summary report with metrics

### Frontend
- **frontend-design** - Production-grade interface creation avoiding generic AI aesthetics

### Meta
- **writing-skills** - TDD approach to creating new skills
- **sharing-skills** - Contribution workflow via branch and PR
- **testing-skills-with-subagents** - Skill validation using RED-GREEN-REFACTOR
- **using-wrangler** - Skills discovery and mandatory workflow establishment

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

### Storage

Issues stored in `issues/` directory as markdown files:
- Filename format: `{counter}-{slug}.md` (e.g., `000001-add-authentication.md`)
- YAML frontmatter with metadata (id, title, status, priority, labels, etc.)
- Markdown body with issue content

Specifications stored in `specifications/` directory with same format but `type: "specification"`.

### Configuration

Environment variables in `.claude-plugin/plugin.json`:
- `WRANGLER_ISSUES_DIRECTORY` - Default: `issues`
- `WRANGLER_SPECIFICATIONS_DIRECTORY` - Default: `specifications`
- `WRANGLER_MCP_DEBUG` - Enable verbose logging

See [docs/MCP-USAGE.md](docs/MCP-USAGE.md) for complete documentation.

## Slash Commands

Located in `commands/` directory:

- **brainstorm.md** - Activates `brainstorming` skill
- **write-plan.md** - Activates `writing-plans` skill
- **implement.md** - Activates `implement` skill for autonomous execution

## Workflow System

Workflows coordinate multiple agents in parallel for complex tasks. See [docs/WORKFLOW-PATTERNS.md](docs/WORKFLOW-PATTERNS.md) for patterns and architecture.

Implemented workflows:
- **housekeeping** - Three-phase workflow with parallel reconciliation agents

Additional workflow ideas documented in [docs/WORKFLOW-IDEAS.md](docs/WORKFLOW-IDEAS.md).

## How It Works

1. SessionStart hook (`hooks/session-start.sh`) runs on session initialization
2. Creates `issues/` and `specifications/` directories if missing
3. Loads `using-wrangler` skill
4. Skills activate automatically when relevant to user's task
5. MCP server provides issue management tools
6. Workflow skills coordinate parallel agents for complex operations

## Directory Structure

```
wrangler/
├── skills/                  # 25 skills
├── commands/                # 3 slash commands
├── hooks/                   # session-start.sh
├── mcp/                     # MCP server implementation
├── docs/                    # Documentation
├── issues/                  # Issue tracking (created on first use)
├── specifications/          # Specifications (created on first use)
└── .claude-plugin/          # Plugin configuration
```

## Requirements

- Claude Code with plugin support
- Git repository (for workspace initialization)
- Node.js 20+ (for MCP server)

## Contributing

1. Fork repository
2. Create branch for new skill
3. Follow `writing-skills` skill guidelines
4. Validate with `testing-skills-with-subagents` skill
5. Submit pull request

See `skills/writing-skills/SKILL.md` for skill creation guide.

## Documentation

- [MCP Usage Guide](docs/MCP-USAGE.md) - Complete MCP server documentation
- [Workflow Patterns](docs/WORKFLOW-PATTERNS.md) - Multi-agent workflow architecture
- [Workflow Ideas](docs/WORKFLOW-IDEAS.md) - 20+ potential workflows
- [Implementation Summary](IMPLEMENTATION-SUMMARY.md) - MCP integration details
- [Technical Specification](SPEC-WRANGLER-MCP-INTEGRATION.md) - Original MCP spec

## License

MIT
