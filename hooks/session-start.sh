#!/usr/bin/env bash
# SessionStart hook for wrangler plugin

set -euo pipefail

# Determine plugin root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
PLUGIN_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Verify MCP bundle exists, rebuild if missing
# This handles cases where plugin was updated but npm install wasn't run
MCP_BUNDLE="${PLUGIN_ROOT}/mcp/dist/bundle.cjs"
if [ ! -f "$MCP_BUNDLE" ]; then
    echo "MCP bundle missing, rebuilding..." >&2
    (cd "$PLUGIN_ROOT" && npm install 2>/dev/null) || true
fi

# Path to the canonical workspace schema
SCHEMA_PATH="${PLUGIN_ROOT}/.wrangler/workspace-schema.json"

# Initialize .wrangler/ directory structure based on workspace-schema.json
initialize_workspace() {
    # Find git repository root
    if ! GIT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null); then
        # Not in a git repo - skip initialization gracefully
        return 0
    fi

    # Check if already initialized
    if [ -d "${GIT_ROOT}/.wrangler/issues" ]; then
        # Already initialized - skip
        return 0
    fi

    # Read directories from workspace-schema.json if it exists
    if [ -f "$SCHEMA_PATH" ]; then
        # Extract directory paths from schema using lightweight parsing
        # Create git-tracked directories
        for dir in issues specifications ideas memos plans docs templates; do
            dir_path=$(cat "$SCHEMA_PATH" | grep -A2 "\"$dir\":" | grep '"path"' | head -1 | sed 's/.*"path": *"\([^"]*\)".*/\1/' || echo "")
            if [ -n "$dir_path" ]; then
                mkdir -p "${GIT_ROOT}/${dir_path}"
                touch "${GIT_ROOT}/${dir_path}/.gitkeep"
            fi
        done

        # Create runtime directories (not git-tracked)
        for dir in cache config logs; do
            dir_path=$(cat "$SCHEMA_PATH" | grep -A2 "\"$dir\":" | grep '"path"' | head -1 | sed 's/.*"path": *"\([^"]*\)".*/\1/' || echo "")
            if [ -n "$dir_path" ]; then
                mkdir -p "${GIT_ROOT}/${dir_path}"
            fi
        done

        # Create completed subdirectory for issues
        mkdir -p "${GIT_ROOT}/.wrangler/issues/completed"
    else
        # Fallback to hardcoded defaults if schema not found
        mkdir -p "${GIT_ROOT}/.wrangler/issues"
        mkdir -p "${GIT_ROOT}/.wrangler/issues/completed"
        mkdir -p "${GIT_ROOT}/.wrangler/specifications"
        mkdir -p "${GIT_ROOT}/.wrangler/ideas"
        mkdir -p "${GIT_ROOT}/.wrangler/memos"
        mkdir -p "${GIT_ROOT}/.wrangler/plans"
        mkdir -p "${GIT_ROOT}/.wrangler/docs"
        mkdir -p "${GIT_ROOT}/.wrangler/templates"
        mkdir -p "${GIT_ROOT}/.wrangler/cache"
        mkdir -p "${GIT_ROOT}/.wrangler/config"
        mkdir -p "${GIT_ROOT}/.wrangler/logs"

        # Add .gitkeep files for git-tracked directories
        touch "${GIT_ROOT}/.wrangler/issues/.gitkeep"
        touch "${GIT_ROOT}/.wrangler/specifications/.gitkeep"
        touch "${GIT_ROOT}/.wrangler/ideas/.gitkeep"
        touch "${GIT_ROOT}/.wrangler/memos/.gitkeep"
        touch "${GIT_ROOT}/.wrangler/plans/.gitkeep"
        touch "${GIT_ROOT}/.wrangler/docs/.gitkeep"
        touch "${GIT_ROOT}/.wrangler/templates/.gitkeep"
    fi

    # Create .gitignore for runtime directories (read patterns from schema if available)
    if [ -f "$SCHEMA_PATH" ]; then
        # Extract gitignore patterns from schema
        gitignore_patterns=$(cat "$SCHEMA_PATH" | grep -A10 '"gitignorePatterns"' | grep '"' | sed 's/.*"\([^"]*\)".*/\1/' | grep -v 'gitignorePatterns' || echo "")
    else
        gitignore_patterns="cache/
config/
logs/
metrics/"
    fi

    cat > "${GIT_ROOT}/.wrangler/.gitignore" <<GITIGNORE
# Wrangler gitignore - generated from workspace-schema.json

# Runtime data (don't commit)
${gitignore_patterns}

# Backup directories (temporary)
../.wrangler-migration-backup-*/

# Migration markers (local)
SKIP_AUTO_MIGRATION
REMIND_NEXT_SESSION
GITIGNORE

    echo "✓ Initialized .wrangler/ directory structure (v1.2.0) at ${GIT_ROOT}" >&2
}

# Run workspace initialization
initialize_workspace

# Check if legacy skills directory exists and build warning
warning_message=""
legacy_skills_dir="${HOME}/.config/wrangler/skills"
if [ -d "$legacy_skills_dir" ]; then
    warning_message="\n\n<important-reminder>IN YOUR FIRST REPLY AFTER SEEING THIS MESSAGE YOU MUST TELL THE USER:⚠️ **WARNING:** Wrangler now uses Claude Code's skills system. Custom skills in ~/.config/wrangler/skills will not be read. Move custom skills to ~/.claude/skills instead. To make this message go away, remove ~/.config/wrangler/skills</important-reminder>"
fi

# Read using-wrangler content
using_wrangler_content=$(cat "${PLUGIN_ROOT}/skills/using-wrangler/SKILL.md" 2>&1 || echo "Error reading using-wrangler skill")

# Escape outputs for JSON
using_wrangler_escaped=$(echo "$using_wrangler_content" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | awk '{printf "%s\\n", $0}')
warning_escaped=$(echo "$warning_message" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | awk '{printf "%s\\n", $0}')

# Output context injection as JSON
cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "<EXTREMELY_IMPORTANT>\nYou have wrangler.\n\n**The content below is from skills/using-wrangler/SKILL.md - your introduction to using skills:**\n\n${using_wrangler_escaped}\n\n${warning_escaped}\n</EXTREMELY_IMPORTANT>"
  }
}
EOF

exit 0
