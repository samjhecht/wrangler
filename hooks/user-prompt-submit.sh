#!/bin/bash

# Wrangler Message Capture Hook
# Fires on every UserPromptSubmit event to log messages with context
#
# This hook captures:
# - User prompt text
# - Timestamp (ISO 8601)
# - Session ID (for multi-agent tracking)
# - Git branch name (active specification context)
# - Working directory
#
# Output: Appends JSON entries to .wrangler/logs/messages.jsonl

# Read hook input from stdin
input=$(cat)

# Extract fields from hook input
session_id=$(echo "$input" | jq -r '.session_id // "unknown"')
prompt=$(echo "$input" | jq -r '.prompt // ""')
cwd=$(echo "$input" | jq -r '.cwd // ""')

# Generate timestamp (ISO 8601 format)
timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")

# Get current git branch (specification context)
if [ -n "$cwd" ] && [ -d "$cwd" ]; then
  branch=$(cd "$cwd" && git symbolic-ref --short HEAD 2>/dev/null || echo "unknown")
else
  branch="unknown"
fi

# Ensure log directory exists
log_dir="$cwd/.wrangler/logs"
mkdir -p "$log_dir"

# Create JSON entry (compact, single line for JSONL)
json_entry=$(jq -n -c \
  --arg session_id "$session_id" \
  --arg prompt "$prompt" \
  --arg timestamp "$timestamp" \
  --arg branch "$branch" \
  --arg cwd "$cwd" \
  '{
    session_id: $session_id,
    timestamp: $timestamp,
    branch: $branch,
    prompt: $prompt,
    cwd: $cwd
  }')

# Append to messages log (JSONL format)
echo "$json_entry" >> "$log_dir/messages.jsonl"

# Exit successfully (hook should not block Claude Code)
exit 0
