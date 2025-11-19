#!/usr/bin/env bash
# SessionStart hook for wrangler plugin

set -euo pipefail

# Determine plugin root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
PLUGIN_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Initialize .wrangler/ directory structure
initialize_workspace() {
    # Find git repository root
    if ! GIT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null); then
        # Not in a git repo - skip initialization gracefully
        return 0
    fi

    # Check if already initialized (either legacy or new structure)
    if [ -d "${GIT_ROOT}/.wrangler/issues" ] || [ -d "${GIT_ROOT}/issues" ]; then
        # Already initialized - skip
        return 0
    fi

    # Create new .wrangler/ directory structure (v1.1.0)
    mkdir -p "${GIT_ROOT}/.wrangler/issues"
    mkdir -p "${GIT_ROOT}/.wrangler/specifications"
    mkdir -p "${GIT_ROOT}/.wrangler/memos"
    mkdir -p "${GIT_ROOT}/.wrangler/governance"
    mkdir -p "${GIT_ROOT}/.wrangler/cache"
    mkdir -p "${GIT_ROOT}/.wrangler/config"
    mkdir -p "${GIT_ROOT}/.wrangler/docs"

    # Add .gitkeep files
    touch "${GIT_ROOT}/.wrangler/issues/.gitkeep"
    touch "${GIT_ROOT}/.wrangler/specifications/.gitkeep"
    touch "${GIT_ROOT}/.wrangler/memos/.gitkeep"
    touch "${GIT_ROOT}/.wrangler/governance/.gitkeep"
    touch "${GIT_ROOT}/.wrangler/docs/.gitkeep"

    # Create .gitignore for runtime directories
    cat > "${GIT_ROOT}/.wrangler/.gitignore" <<'GITIGNORE'
# Wrangler gitignore

# Runtime data (don't commit)
cache/
config/
metrics/

# Backup directories (temporary)
../.wrangler-migration-backup-*/

# Migration markers (local)
SKIP_AUTO_MIGRATION
REMIND_NEXT_SESSION
GITIGNORE

    echo "✓ Initialized .wrangler/ directory structure (v1.1.0) at ${GIT_ROOT}" >&2
}

# Run workspace initialization
initialize_workspace

# Check for migration needs
check_migration_needed() {
    # Find git repository root
    if ! GIT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null); then
        # Not in a git repo - skip migration check
        echo ""
        return 0
    fi

    # Check if already migrated
    if [ -d "${GIT_ROOT}/.wrangler/issues" ] && [ -d "${GIT_ROOT}/.wrangler/specifications" ]; then
        # Already migrated
        echo ""
        return 0
    fi

    # Check for opt-out flag
    if [ -f "${GIT_ROOT}/.wrangler/SKIP_AUTO_MIGRATION" ]; then
        # User opted out
        echo ""
        return 0
    fi

    # Check for legacy directories
    LEGACY_EXISTS=false
    if [ -d "${GIT_ROOT}/issues" ] || [ -d "${GIT_ROOT}/specifications" ] || [ -d "${GIT_ROOT}/memos" ]; then
        LEGACY_EXISTS=true
    fi

    if [ "$LEGACY_EXISTS" = "false" ]; then
        # No legacy structure to migrate
        echo ""
        return 0
    fi

    # Migration needed - output instruction
    echo "\n\n<important-reminder>MIGRATION REQUIRED: This project needs to migrate to wrangler v1.1.0 structure. You MUST invoke the migration-detector skill using the Skill tool IMMEDIATELY in your first response: Use Skill tool with skill='wrangler:migration-detector'</important-reminder>"
}

migration_reminder=$(check_migration_needed)

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

# Escape migration reminder for JSON
migration_escaped=$(echo "$migration_reminder" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | awk '{printf "%s\\n", $0}')

# Output context injection as JSON
cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "<EXTREMELY_IMPORTANT>\nYou have wrangler.\n\n**The content below is from skills/using-wrangler/SKILL.md - your introduction to using skills:**\n\n${using_wrangler_escaped}\n\n${migration_escaped}${warning_escaped}\n</EXTREMELY_IMPORTANT>"
  }
}
EOF

exit 0
