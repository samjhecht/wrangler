# Wrangler Hooks System

This directory contains session hooks that automatically execute during Claude Code workflows.

## Overview

Wrangler uses Claude Code's hook system to:

1. **Initialize workspace** - Automatically create `.wrangler/` directory structure on session start
2. **Capture conversation logs** - Record every user message with timestamp and branch context

## Available Hooks

### 1. SessionStart Hook

**File**: `session-start.sh`

**When it runs**: Every time a Claude Code session starts (startup, resume, clear, compact)

**What it does**:
- Detects git repository root
- Creates `.wrangler/` directory structure if not present:
  - `.wrangler/issues/` - Issue tracking
  - `.wrangler/specifications/` - Feature specifications
  - `.wrangler/memos/` - Reference material and RCA archives
  - `.wrangler/logs/` - Conversation logs (JSONL format)
  - `.wrangler/governance/` - Constitution, roadmap, next steps
  - `.wrangler/docs/` - Auto-generated governance documentation
- Injects wrangler context into the session
- Exits successfully to allow Claude Code to proceed

**Configuration**: Registered in `hooks.json` with matcher `startup|resume|clear|compact`

### 2. UserPromptSubmit Hook

**File**: `user-prompt-submit.sh`

**When it runs**: Every time you submit a message to Claude Code (before processing)

**What it does**:
- Captures your message text
- Records current timestamp (ISO 8601 format)
- Detects git branch name (specification/feature context)
- Logs session ID (for multi-agent tracking)
- Appends JSON entry to `.wrangler/logs/messages.jsonl`

**Output format** (JSONL):
```json
{
  "session_id": "abc123-def456-...",
  "timestamp": "2025-11-20T10:30:45.000Z",
  "branch": "feature/authentication",
  "prompt": "Implement user login endpoint",
  "cwd": "/Users/sam/medb/code/wrangler"
}
```

**Configuration**: Registered in `hooks.json` with empty matcher (runs for all prompts)

## Hook Configuration

Hooks are registered in `hooks/hooks.json`:

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
    ],
    "UserPromptSubmit": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/user-prompt-submit.sh"
          }
        ]
      }
    ]
  }
}
```

**Variables**:
- `${CLAUDE_PLUGIN_ROOT}` - Absolute path to wrangler plugin directory

## Log Files

### Message Log

**Location**: `.wrangler/logs/messages.jsonl`

**Format**: JSONL (JSON Lines) - one JSON object per line

**Example**:
```jsonl
{"session_id":"abc123","timestamp":"2025-11-20T10:00:00.000Z","branch":"main","prompt":"Create new feature","cwd":"/Users/sam/project"}
{"session_id":"abc123","timestamp":"2025-11-20T10:05:12.000Z","branch":"main","prompt":"Add tests for it","cwd":"/Users/sam/project"}
{"session_id":"def456","timestamp":"2025-11-20T10:10:45.000Z","branch":"feature/auth","prompt":"Fix bug in auth","cwd":"/Users/sam/project"}
```

**Reading the log**:

```bash
# View all messages
cat .wrangler/logs/messages.jsonl | jq .

# Filter by branch
cat .wrangler/logs/messages.jsonl | jq 'select(.branch == "feature/auth")'

# Filter by session
cat .wrangler/logs/messages.jsonl | jq 'select(.session_id == "abc123")'

# Get messages from today
cat .wrangler/logs/messages.jsonl | jq 'select(.timestamp | startswith("2025-11-20"))'

# Count messages per branch
cat .wrangler/logs/messages.jsonl | jq -r '.branch' | sort | uniq -c
```

### Git Tracking

**IMPORTANT**: `.wrangler/logs/` is **gitignored** by default to prevent bloating your repository with conversation history.

If you want to track logs in git (e.g., for audit trail):

```bash
# Remove from .gitignore
sed -i '' '/\.wrangler\/logs/d' .gitignore

# Add and commit
git add .wrangler/logs/messages.jsonl
git commit -m "Add conversation logs"
```

**Recommendation**: Only commit logs for important sessions (e.g., architecture decisions, critical debugging).

## Multi-Agent Tracking

### Session IDs

Each Claude Code session receives a unique `session_id`. When running multiple agents in parallel, each agent has its own session ID:

```jsonl
{"session_id":"agent-1-abc","timestamp":"...","branch":"main","prompt":"..."}
{"session_id":"agent-2-def","timestamp":"...","branch":"feature/auth","prompt":"..."}
{"session_id":"agent-1-abc","timestamp":"...","branch":"main","prompt":"..."}
```

**Querying by agent**:
```bash
cat .wrangler/logs/messages.jsonl | jq 'select(.session_id == "agent-1-abc")'
```

### Git Worktrees

If you use git worktrees (recommended for parallel development), each worktree has its own `.wrangler/logs/` directory:

```
~/project/                          # Main worktree
  .wrangler/logs/messages.jsonl     # Agent 1 messages (main branch)

~/project-worktrees/feature-auth/   # Worktree 1
  .wrangler/logs/messages.jsonl     # Agent 2 messages (feature/auth branch)

~/project-worktrees/bug-fix/        # Worktree 2
  .wrangler/logs/messages.jsonl     # Agent 3 messages (bug-fix branch)
```

This provides natural isolation - each worktree's conversation log is separate.

## Privacy & Security

### What Gets Logged

**Logged**:
- Your message text (the prompt you send to Claude)
- Timestamp of message submission
- Git branch name
- Session ID
- Working directory path

**NOT logged**:
- Claude's responses
- Tool use (Bash commands, file edits, etc.)
- Thinking content
- Error messages

### Sensitive Information

**WARNING**: The message log contains the **full text** of every prompt you send. If you include sensitive information (API keys, passwords, credentials) in your messages, they will be logged.

**Best practices**:
1. Never paste credentials directly into prompts
2. Use environment variables or config files for secrets
3. Review `.wrangler/logs/messages.jsonl` before committing to git
4. Add `.wrangler/logs/` to `.gitignore` (done by default)

### Disabling Logging

To disable message logging:

1. **Remove the hook registration**:
   ```bash
   # Edit hooks/hooks.json and remove the UserPromptSubmit section
   ```

2. **Or delete the hook script**:
   ```bash
   rm hooks/user-prompt-submit.sh
   ```

3. **Or make it non-executable**:
   ```bash
   chmod -x hooks/user-prompt-submit.sh
   ```

## Troubleshooting

### Hook Not Running

**Check hook is executable**:
```bash
ls -la hooks/user-prompt-submit.sh
# Should show: -rwxr-xr-x (executable)
```

**Make it executable**:
```bash
chmod +x hooks/user-prompt-submit.sh
```

**Verify hook registration**:
```bash
cat hooks/hooks.json | jq '.hooks.UserPromptSubmit'
```

### No Log File Created

**Check directory exists**:
```bash
ls -la .wrangler/logs/
# If missing, run: mkdir -p .wrangler/logs
```

**Check permissions**:
```bash
touch .wrangler/logs/test.txt
# If error, check directory write permissions
```

**Check for errors in hook**:
```bash
# Run hook manually
echo '{"session_id":"test","prompt":"test","cwd":"'"$(pwd)"'"}' | bash hooks/user-prompt-submit.sh

# Check if file was created
cat .wrangler/logs/messages.jsonl
```

### Malformed JSON in Log

**Validate JSONL**:
```bash
# Check each line is valid JSON
cat .wrangler/logs/messages.jsonl | while read line; do echo "$line" | jq . > /dev/null || echo "Invalid: $line"; done
```

**Fix malformed log**:
```bash
# Backup original
cp .wrangler/logs/messages.jsonl .wrangler/logs/messages.jsonl.bak

# Filter valid JSON lines only
cat .wrangler/logs/messages.jsonl.bak | while read line; do
  echo "$line" | jq . > /dev/null 2>&1 && echo "$line"
done > .wrangler/logs/messages.jsonl
```

### Hook Blocking Claude Code

If the hook script hangs or times out, it can block Claude Code from processing your message.

**Common causes**:
- `jq` not installed
- Git command hanging
- Filesystem issues (disk full, permissions)

**Solution**: Ensure hook exits quickly (< 1 second). Current implementation includes:
- Fallback values (`"unknown"` for branch if git fails)
- `2>/dev/null` to suppress errors
- `exit 0` to always succeed

## Performance Considerations

### Hook Overhead

The `UserPromptSubmit` hook adds ~50-100ms overhead to each message submission:
- JSON parsing: ~10ms
- Git branch detection: ~20-50ms
- File append: ~10-20ms

For typical usage (10-50 messages per session), this is negligible.

### Log File Size

Assuming average message length of 200 characters, JSONL overhead of ~150 bytes:

- **1 message**: ~350 bytes
- **100 messages**: ~35 KB
- **1,000 messages**: ~350 KB
- **10,000 messages**: ~3.5 MB

**Recommendation**: Archive or clean up old logs periodically:

```bash
# Archive messages older than 30 days
jq -c 'select(.timestamp | fromdateiso8601 > (now - (30 * 86400)))' \
  .wrangler/logs/messages.jsonl > .wrangler/logs/messages.jsonl.tmp
mv .wrangler/logs/messages.jsonl.tmp .wrangler/logs/messages.jsonl
```

## Advanced Usage

### Custom Log Processing

**Example 1: Generate daily summaries**:
```bash
#!/bin/bash
# scripts/daily-summary.sh

today=$(date -u +"%Y-%m-%d")
cat .wrangler/logs/messages.jsonl | \
  jq -r "select(.timestamp | startswith(\"$today\")) | \"[\(.timestamp)] \(.branch): \(.prompt)\"" > \
  .wrangler/logs/summary-$today.txt
```

**Example 2: Export to CSV**:
```bash
echo "timestamp,branch,session_id,prompt" > messages.csv
cat .wrangler/logs/messages.jsonl | \
  jq -r '[.timestamp, .branch, .session_id, .prompt] | @csv' >> messages.csv
```

**Example 3: Search by keyword**:
```bash
# Find all messages mentioning "authentication"
cat .wrangler/logs/messages.jsonl | jq 'select(.prompt | contains("authentication"))'
```

### Integration with Other Tools

**Ship logs to observability platform**:
```bash
# Example: Send to Elasticsearch
cat .wrangler/logs/messages.jsonl | while read line; do
  curl -X POST "http://localhost:9200/claude-logs/_doc" \
    -H 'Content-Type: application/json' \
    -d "$line"
done
```

**Generate metrics**:
```bash
# Messages per hour
cat .wrangler/logs/messages.jsonl | \
  jq -r '.timestamp[0:13]' | \
  sort | uniq -c

# Most active branches
cat .wrangler/logs/messages.jsonl | \
  jq -r '.branch' | \
  sort | uniq -c | sort -rn
```

## Reference

### Hook Input Schema

The `UserPromptSubmit` hook receives JSON input via stdin:

```typescript
interface UserPromptSubmitInput {
  session_id: string;          // Unique session identifier
  transcript_path: string;     // Path to full conversation transcript (JSONL)
  cwd: string;                 // Current working directory
  permission_mode: string;     // Permission mode (default, allow_all, etc.)
  hook_event_name: string;     // "UserPromptSubmit"
  prompt: string;              // User's message text
}
```

### Log Entry Schema

Each entry in `.wrangler/logs/messages.jsonl`:

```typescript
interface MessageLogEntry {
  session_id: string;          // Session identifier
  timestamp: string;           // ISO 8601 timestamp (UTC)
  branch: string;              // Git branch name (or "unknown")
  prompt: string;              // User's message text
  cwd: string;                 // Working directory path
}
```

## See Also

- **[Session Hooks Documentation](https://code.claude.com/docs/en/hooks)** - Official Claude Code hooks reference
- **[Wrangler MCP Usage Guide](../docs/MCP-USAGE.md)** - Issue and specification tracking
- **[Wrangler Governance Guide](../docs/GOVERNANCE.md)** - Constitution and roadmap system
- **[Git Worktrees Skill](../skills/using-git-worktrees/SKILL.md)** - Parallel development workflow
