# Session Hooks System

**Version**: 1.0.0
**Last Updated**: 2025-11-18

This document explains wrangler's session hooks system and how it manages plugin state across Claude Code sessions.

---

## Table of Contents

- [Overview](#overview)
- [Session Start Hook](#session-start-hook)
- [Workspace Initialization](#workspace-initialization)
- [Context Injection](#context-injection)
- [State Management](#state-management)
- [Hook Configuration](#hook-configuration)
- [Troubleshooting](#troubleshooting)

---

## Overview

Wrangler uses Claude Code's **session hooks system** to automatically initialize project workspaces and inject critical context when sessions start. This ensures every interaction begins with proper setup and awareness of wrangler's capabilities.

### What Are Session Hooks?

Session hooks are shell scripts or commands that execute when specific Claude Code events occur:
- **SessionStart**: Fires when starting Claude Code, resuming from compact mode, or clearing conversation history
- **UserPromptSubmit**: Fires after each user message (not used by wrangler)
- **AssistantResponse**: Fires after each assistant response (not used by wrangler)

Wrangler only uses **SessionStart** hooks.

### Why Session Hooks?

Session hooks enable:
1. **Automatic workspace initialization** - Create required directories without user intervention
2. **Context injection** - Load critical skills and reminders into conversation context
3. **State persistence** - Ensure consistent environment across sessions
4. **User notifications** - Alert users to important configuration issues

---

## Session Start Hook

**Location**: `hooks/session-start.sh`

**Triggers**: Session startup, resume from compact mode, clearing history

**Execution**: Runs before first user interaction in session

### Hook Workflow

```
Claude Code Session Starts
    ↓
SessionStart hook triggered
    ↓
hooks/session-start.sh executes
    ↓
├─ Initialize workspace directories (issues/, specifications/)
├─ Check for legacy configuration warnings
├─ Read using-wrangler skill content
└─ Inject context via JSON response
    ↓
Context available in conversation
    ↓
User's first message processed with wrangler context loaded
```

### Hook Implementation

The session start hook performs three main functions:

#### 1. Workspace Initialization

```bash
initialize_workspace() {
    # Find git repository root
    if ! GIT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null); then
        # Not in a git repo - skip initialization gracefully
        return 0
    fi

    # Check if directories already exist
    if [ -d "${GIT_ROOT}/issues" ] && [ -d "${GIT_ROOT}/specifications" ]; then
        # Already initialized - skip
        return 0
    fi

    # Create directory structure
    mkdir -p "${GIT_ROOT}/issues"
    mkdir -p "${GIT_ROOT}/specifications"

    # Add .gitkeep files
    touch "${GIT_ROOT}/issues/.gitkeep"
    touch "${GIT_ROOT}/specifications/.gitkeep"

    echo "✓ Initialized issues and specifications directories at ${GIT_ROOT}" >&2
}
```

**Behavior**:
- Detects git repository root
- Creates `issues/` and `specifications/` directories if missing
- Adds `.gitkeep` files to track empty directories in git
- Idempotent (safe to run multiple times)
- Gracefully skips if not in git repository

#### 2. Legacy Configuration Check

```bash
legacy_skills_dir="${HOME}/.config/wrangler/skills"
if [ -d "$legacy_skills_dir" ]; then
    warning_message="⚠️ **WARNING:** Wrangler now uses Claude Code's skills system.
    Custom skills in ~/.config/wrangler/skills will not be read.
    Move custom skills to ~/.claude/skills instead."
fi
```

**Purpose**: Alert users who have outdated wrangler configurations from pre-plugin era

#### 3. Context Injection

```bash
# Read using-wrangler content
using_wrangler_content=$(cat "${PLUGIN_ROOT}/skills/using-wrangler/SKILL.md")

# Output as JSON for Claude Code
cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "<EXTREMELY_IMPORTANT>
You have wrangler.

**The content below is from skills/using-wrangler/SKILL.md:**

${using_wrangler_content}
</EXTREMELY_IMPORTANT>"
  }
}
EOF
```

**Injects**:
- Entire `using-wrangler` skill content (mandatory first response protocol)
- Legacy warnings if applicable
- Wrapped in `<EXTREMELY_IMPORTANT>` tags for visibility

---

## Workspace Initialization

### What Gets Initialized

On first session start in a git repository, wrangler creates:

```
project-root/              # Git repository root
├── issues/
│   └── .gitkeep
└── specifications/
    └── .gitkeep
```

### Initialization Logic

**Detection**:
1. Check if current directory is in a git repository (`git rev-parse --show-toplevel`)
2. If not in git repo → Skip gracefully (no error)
3. If in git repo → Proceed with initialization

**Creation**:
1. Check if `issues/` and `specifications/` already exist
2. If both exist → Skip (already initialized)
3. If missing → Create directories + `.gitkeep` files

**Idempotency**:
- Safe to run multiple times
- No duplicate directories created
- No errors if already initialized

### Why `.gitkeep` Files?

Git doesn't track empty directories. The `.gitkeep` file ensures:
- Empty `issues/` directory appears in git
- Empty `specifications/` directory appears in git
- Users can commit initial project structure
- Directories survive `git clone` even when empty

**Note**: `.gitkeep` is a convention, not a git feature. Any file would work, but `.gitkeep` clearly communicates intent.

### Future: `.wrangler/` Migration

**Current State** (v1.0.0): Directories at project root
- `project-root/issues/`
- `project-root/specifications/`

**Planned State** (v1.1.0): Centralized `.wrangler/` directory
- `.wrangler/issues/`
- `.wrangler/specifications/`
- `.wrangler/memos/`
- `.wrangler/governance/`
- `.wrangler/cache/` (gitignored)
- `.wrangler/config/` (gitignored)

See [Specification #000001](../specifications/000001-centralized-wrangler-directory.md) for migration plan.

---

## Context Injection

### Purpose

Context injection ensures Claude Code **always** knows:
1. Wrangler is available
2. How to discover and use skills
3. Mandatory workflows (brainstorming before coding, TDD, etc.)
4. Where to find documentation

### Injection Mechanism

**Hook Output Format**:
```json
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "<EXTREMELY_IMPORTANT>...</EXTREMELY_IMPORTANT>"
  }
}
```

**Claude Code Behavior**:
- Parses JSON from hook output
- Extracts `additionalContext` field
- Injects as system-level context in conversation
- Available for entire session (until next SessionStart)

### What Gets Injected

**Primary Content**: `skills/using-wrangler/SKILL.md`
- Mandatory first response protocol
- Skills discovery checklist
- Anti-rationalization warnings
- Constitutional principles enforcement

**Secondary Content**: Warnings and reminders
- Legacy configuration alerts
- Version update notifications (future)
- Important announcements

### Context Visibility

**For Claude Code**:
- Context appears in system-level messages
- Wrapped in `<EXTREMELY_IMPORTANT>` tags
- Highly visible and prioritized

**For Users**:
- Context injection is invisible
- No clutter in conversation
- Effects visible through Claude's behavior (uses skills correctly)

---

## State Management

Wrangler manages state across multiple layers:

### 1. Session State (Transient)

**Lifetime**: Single Claude Code session

**Storage**: In-memory conversation context

**Contents**:
- Injected skill content
- Loaded governance documents
- Conversation history

**Reset**: Every SessionStart event

### 2. Workspace State (Persistent)

**Lifetime**: Permanent (git-tracked)

**Storage**: Files in project repository

**Contents**:
- `issues/*.md` - Issue tracking
- `specifications/*.md` - Feature specifications
- `memos/*.md` - Reference material (future)
- `.wrangler/governance/` - Constitution, roadmap (future)

**Versioned**: Yes (git commit history)

### 3. Plugin State (Static)

**Lifetime**: Until plugin update

**Storage**: Plugin installation directory

**Contents**:
- Skills (`skills/`)
- Templates (`templates/`)
- Hooks (`hooks/`)
- Release notes (`skills/.wrangler-releases/`)

**Updated**: Only when plugin version changes

### 4. Cache State (Ephemeral)

**Lifetime**: Until manually cleared

**Storage**: `.wrangler/cache/` (future, gitignored)

**Contents**:
- MCP issue index
- Search optimization data
- Performance metrics
- Temporary fix workspaces

**Versioned**: No (gitignored)

### State Persistence Strategy

| State Type | Persistence | Git Tracked | Shared Across Sessions |
|------------|-------------|-------------|------------------------|
| Session Context | In-memory | No | No (reset each session) |
| Issues | File-based | Yes | Yes |
| Specifications | File-based | Yes | Yes |
| Governance | File-based | Yes | Yes |
| Memos | File-based | Yes | Yes |
| Cache | File-based | No | Yes |
| Config | File-based | No | Yes |

---

## Hook Configuration

### Configuration File

**Location**: `hooks/hooks.json`

**Format**:
```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|resume|clear|compact",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/session-start.sh"
          }
        ]
      }
    ]
  }
}
```

### Configuration Fields

**`matcher`**: Regex pattern matching session start triggers
- `startup` - Fresh Claude Code launch
- `resume` - Resuming from compact mode
- `clear` - After clearing conversation history
- `compact` - After compacting conversation

**`type`**: Hook execution type
- `command` - Execute shell command/script
- `inline` - Execute inline code (not used)

**`command`**: Shell command to execute
- `${CLAUDE_PLUGIN_ROOT}` - Automatically replaced with plugin directory path
- Relative paths resolved from plugin root

### Environment Variables

Available in hook execution context:

| Variable | Description | Example |
|----------|-------------|---------|
| `CLAUDE_PLUGIN_ROOT` | Plugin installation directory | `/Users/sam/.claude/plugins/wrangler` |
| `PWD` | Current working directory | `/Users/sam/code/myproject` |
| `HOME` | User home directory | `/Users/sam` |

**Custom Variables** (set by wrangler):
| Variable | Description | Set By |
|----------|-------------|--------|
| `SCRIPT_DIR` | Hook script directory | `session-start.sh` |
| `PLUGIN_ROOT` | Plugin root (computed) | `session-start.sh` |
| `GIT_ROOT` | Git repository root | `session-start.sh` |

---

## Troubleshooting

### Hook Not Running

**Symptom**: No workspace initialization, no context injection

**Causes**:
1. **Hook file missing**: `hooks/session-start.sh` deleted or corrupted
2. **Hook not executable**: Missing execute permission
3. **Invalid JSON**: `hooks/hooks.json` syntax error
4. **Claude Code version**: Hooks not supported in old versions

**Solutions**:
```bash
# Verify hook file exists
ls -la ~/.claude/plugins/wrangler/hooks/session-start.sh

# Check execute permission
chmod +x ~/.claude/plugins/wrangler/hooks/session-start.sh

# Validate JSON syntax
cat ~/.claude/plugins/wrangler/hooks/hooks.json | jq .

# Check Claude Code version (hooks require v2.0+)
/help
```

### Workspace Not Initialized

**Symptom**: No `issues/` or `specifications/` directories created

**Causes**:
1. **Not in git repository**: Hook skips initialization outside git repos
2. **Permission denied**: User lacks write permission to repository root
3. **Hook failed silently**: Error suppressed by `set -euo pipefail`

**Solutions**:
```bash
# Verify you're in a git repository
git rev-parse --show-toplevel

# Check write permissions
ls -ld $(git rev-parse --show-toplevel)

# Manually run hook to see errors
~/.claude/plugins/wrangler/hooks/session-start.sh

# Manually initialize if needed
mkdir -p $(git rev-parse --show-toplevel)/{issues,specifications}
```

### Context Not Injected

**Symptom**: Claude doesn't know about wrangler skills

**Causes**:
1. **Hook succeeded but JSON malformed**: Context not parsed
2. **Skill file missing**: `skills/using-wrangler/SKILL.md` not found
3. **Escape sequence error**: Special characters broke JSON

**Solutions**:
```bash
# Test hook output manually
~/.claude/plugins/wrangler/hooks/session-start.sh | jq .

# Verify skill file exists
cat ~/.claude/plugins/wrangler/skills/using-wrangler/SKILL.md

# Check for JSON escaping issues (look for unescaped quotes)
~/.claude/plugins/wrangler/hooks/session-start.sh | grep -o '"' | wc -l
```

### Legacy Warning Persists

**Symptom**: Warning about `~/.config/wrangler/skills` appears every session

**Cause**: Old skills directory still exists

**Solution**:
```bash
# Remove legacy directory (backup first if needed)
mv ~/.config/wrangler/skills ~/.config/wrangler/skills.backup
# Or delete permanently
rm -rf ~/.config/wrangler/skills
```

### Hook Runs But No Effect

**Symptom**: Hook executes successfully but changes not visible

**Causes**:
1. **Already initialized**: Directories existed, hook skipped creation
2. **Wrong directory**: Initialized different git repo than expected
3. **Cached state**: Claude Code using stale session state

**Solutions**:
```bash
# Verify initialization location
git rev-parse --show-toplevel

# Check if directories exist
ls -la $(git rev-parse --show-toplevel)/{issues,specifications}

# Restart Claude Code to clear cached state
# (Exit and restart application)
```

---

## Advanced Topics

### Custom Hook Modifications

**Warning**: Modifying hook files can break wrangler functionality. Proceed with caution.

**To modify session-start hook**:
1. Copy original to backup: `cp hooks/session-start.sh hooks/session-start.sh.backup`
2. Edit `hooks/session-start.sh`
3. Test thoroughly: `./hooks/session-start.sh | jq .`
4. Verify JSON output is valid
5. Restart Claude Code to test

**To add additional hooks**:
1. Create new script in `hooks/` directory
2. Make executable: `chmod +x hooks/my-hook.sh`
3. Update `hooks/hooks.json` to reference new hook
4. Test manually before relying on it

### Hook Debugging

**Enable verbose output**:
```bash
# Add to top of session-start.sh (after set -euo pipefail)
set -x  # Print commands as they execute

# Run manually to see trace
bash -x ./hooks/session-start.sh
```

**Capture hook output**:
```bash
# Redirect stderr to file
./hooks/session-start.sh 2> /tmp/hook-debug.log

# View captured errors
cat /tmp/hook-debug.log
```

**Test JSON validity**:
```bash
# Pipe hook output to jq for validation
./hooks/session-start.sh | jq . > /dev/null && echo "Valid JSON" || echo "Invalid JSON"
```

### Performance Considerations

**Hook execution time**:
- Typical: <100ms
- Reading skill file: ~20ms
- JSON escaping: ~10ms
- Directory creation: ~5ms (if needed)

**Optimization opportunities**:
- Cache skill content (avoid re-reading every session)
- Skip legacy checks after first warning
- Lazy initialization (only create directories when first needed)

**Current decision**: Prioritize simplicity over micro-optimizations. 100ms is acceptable for session start.

---

## Related Documentation

- [MCP Server Usage](MCP-USAGE.md) - How MCP interacts with workspace directories
- [Governance Framework](GOVERNANCE.md) - How governance files use workspace structure
- [Specification #000001](../specifications/000001-centralized-wrangler-directory.md) - Future `.wrangler/` migration

---

## Changelog

### v1.0.0 (2025-11-18)
- Initial documentation of session hooks system
- Documented workspace initialization workflow
- Explained context injection mechanism
- Added troubleshooting guide

---

**Last Updated**: 2025-11-18
**Maintainer**: Wrangler Team
**Status**: Current
