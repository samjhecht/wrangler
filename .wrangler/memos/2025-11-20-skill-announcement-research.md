# Skill/Plugin Announcement Pattern Research

**Date**: 2025-11-20
**Author**: Claude Code Research Agent
**Topic**: Best practices for plugin/skill announcement patterns in open-source agent frameworks and IDE extensions

## Executive Summary

This research analyzes how modern frameworks handle plugin/skill announcements, examining visual distinctiveness, terminal formatting, redundancy patterns, and the balance between structured logging and human-readable output. The research covers VS Code extensions, JetBrains plugins, GitHub CLI extensions, webpack/eslint plugins, and general CLI tool design patterns.

### Key Finding

**The industry trend is moving toward "silent by default, verbose on demand"** with structured logging for observability and minimal visual noise during normal operation. Announcement patterns vary by context:

1. **IDE Extensions (VS Code, JetBrains)**: Silent activation with notifications only for errors or important state changes
2. **CLI Tools**: Minimal output by default, with `--verbose` or `DEBUG=*` flags for detailed logging
3. **Modern Frameworks**: Structured JSON logs for machines, human-readable summaries for terminals

## Framework Analysis

### 1. VS Code Extensions

**Activation Pattern**: Silent by default

**Key Principles**:
- Extensions activate silently without user notification
- Only show notifications for errors or critical information
- Use specific activation events (avoid `*` event for performance)
- Minimize startup impact through lazy loading

**Notification Types**:
- `window.showInformationMessage` - General info (use sparingly)
- `window.showWarningMessage` - Warnings
- `window.showErrorMessage` - Errors

**Best Practices**:
- Defer non-critical operations after activation
- Use async/await to prevent blocking
- Track notification state to avoid duplication
- Progress indicators only as last resort

**Example Pattern**:
```typescript
// Silent activation
export async function activate(context: vscode.ExtensionContext) {
  // No announcement - just activate
  await initializeExtension();
}

// Only notify on errors
catch (error) {
  vscode.window.showErrorMessage(`Extension failed: ${error.message}`);
}
```

**Pros**:
- Zero visual noise
- Fast startup
- Professional UX

**Cons**:
- No confirmation extension loaded
- Harder to debug without verbose mode

---

### 2. JetBrains Plugins

**Activation Pattern**: Visual progress indicators during initialization

**Key Principles**:
- Show progress bars in modal dialogs for blocking operations
- Use status bar widgets for background tasks
- Reserve space for progress indicators to prevent layout shift
- Keep progress steps small for smoother UX

**Progress Types**:
- **Modal Progress**: Blocks UI, shows determinate/indeterminate bar
- **Background Progress**: Status bar indicator, non-blocking
- **Inline Progress**: Shows in specific UI components (e.g., input fields)

**Best Practices**:
- Use modal progress only for critical actions
- Switch from indeterminate to determinate when duration known
- Make progress steps as granular as possible
- Allow cancellation for long-running tasks

**Example Pattern**:
```kotlin
// Background task with progress
ProgressManager.getInstance().run(object : Task.Backgroundable(project, "Loading Plugin") {
  override fun run(indicator: ProgressIndicator) {
    indicator.text = "Initializing..."
    // work
  }
})
```

**Pros**:
- Clear feedback for long operations
- Non-blocking background tasks
- User can cancel

**Cons**:
- More complex implementation
- Visual overhead

---

### 3. GitHub CLI Extensions

**Activation Pattern**: Adaptive output based on context

**Key Principles**:
- Detect terminal vs. pipe output
- Apply colors only when output is to terminal
- Check for extension updates once per 24 hours
- Display upgrade notices on stderr (not stdout)

**Environment Variables**:
- `GH_NO_EXTENSION_UPDATE_NOTIFIER` - Disable update checks

**Output Adaptation**:
```bash
# Terminal output - colors, tables, interactive
gh extension-name

# Piped output - raw text, no colors
gh extension-name | jq

# Static output flag for non-interactive
gh extension-name -s
```

**Best Practices**:
- Check `isatty()` to detect terminal
- Strip colors for non-terminal output
- Use stderr for meta-information
- Use stdout only for data

**Pros**:
- Works well in scripts
- Respects Unix philosophy
- Progressive disclosure

**Cons**:
- More complex implementation
- Need to handle multiple output modes

---

### 4. Webpack Plugin Logging

**Activation Pattern**: Hierarchical logging with severity levels

**Key Principles**:
- Use webpack's built-in logger API
- Different loggers for compilation vs. infrastructure
- User-configurable log levels
- Structured logging for Stats

**Logger Hierarchy**:
```javascript
// Compilation-related logging (stored in stats)
const logger = compilation.getLogger('plugin-name');

// Infrastructure logging (outside compilation)
const logger = compiler.getInfrastructureLogger('plugin-name');
```

**Log Levels**:
- `logger.info()` - Important messages (shown by default)
- `logger.log()` - Unimportant messages (opt-in)
- `logger.debug()` - Debug info (opt-in for specific modules)

**Best Practices**:
- Use compilation logger when related to build
- Use infrastructure logger for setup/teardown
- Default to info-level or higher
- Allow filtering by plugin name

**Pros**:
- Integrates with webpack ecosystem
- Granular control
- Stats integration

**Cons**:
- Webpack-specific API
- Requires understanding of compilation lifecycle

---

### 5. ESLint Plugin Loading

**Activation Pattern**: Silent by default, verbose via DEBUG environment variable

**Key Principles**:
- No output during normal operation
- Enable debug logging via environment variable
- Show file patterns, config searching, plugin loading
- Use `--print-config` to verify loaded plugins

**Debug Mode**:
```bash
DEBUG=eslint:* eslint file.js

# Output shows:
# Using file patterns: bin/eslint.js +0ms
# Searching for eslint.config.js +0ms
# Loading config from /path/to/eslint.config.js +5ms
```

**Best Practices**:
- Silent by default
- Environment variable for verbose mode
- Timestamp deltas for performance debugging
- JSON output for programmatic consumption

**Pros**:
- Zero overhead in production
- Powerful debugging when needed
- Standard DEBUG pattern

**Cons**:
- Requires knowledge of DEBUG variable
- Not discoverable without documentation

---

## Terminal Formatting Best Practices

### ANSI Colors

**Key Principles**:
- Use color sparingly (avoid everywhere)
- Reserve colors for semantic meaning
- Provide fallback for terminals without color support
- Allow users to disable colors

**Standard Color Semantics**:
- **Red**: Errors, failures, critical issues
- **Green**: Success, completion, passing tests
- **Yellow/Orange**: Warnings, deprecations
- **Cyan**: Informational, neutral status
- **Blue**: Links, references
- **Gray**: Less important details, timestamps

**Implementation**:
```javascript
// Using chalk
const chalk = require('chalk');
console.log(chalk.cyan('Info: Plugin loading'));
console.log(chalk.green('Success: Plugin loaded'));
console.log(chalk.red('Error: Plugin failed'));
```

**Best Practices**:
- Echo user input in different color for scanning
- Provide `--no-color` flag
- Check `NO_COLOR` environment variable
- Use `\e[0m` to reset attributes

---

### Box-Drawing Characters

**Available Options**:

1. **Simple ASCII** (`-`, `=`, `*`)
   ```
   ===================================
   Plugin Loading
   ===================================
   ```

2. **Unicode Light Box Drawing** (`─`, `│`, `┌`, `┐`, `└`, `┘`)
   ```
   ┌─────────────────────────────────┐
   │ Plugin Loading                  │
   └─────────────────────────────────┘
   ```

3. **Unicode Heavy Box Drawing** (`━`, `┃`, `┏`, `┓`, `┗`, `┛`)
   ```
   ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   ┃ Plugin Loading                  ┃
   ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   ```

4. **Double Lines** (`═`, `║`, `╔`, `╗`, `╚`, `╝`)
   ```
   ╔═════════════════════════════════╗
   ║ Plugin Loading                  ║
   ╚═════════════════════════════════╝
   ```

**Terminal Compatibility**:
- UTF-8 terminals support Unicode box-drawing
- Use `locale` to check encoding support
- VT100 escape codes (`\e(0`, `\e(B`) for legacy terminals
- Modern terminals (iTerm, Konsole, Gnome Terminal) support 24-bit color

**Best Practices**:
- Use simple ASCII for maximum compatibility
- Use Unicode only when UTF-8 locale confirmed
- Libraries like `boxen` handle compatibility automatically
- Test across multiple terminal emulators

---

### Popular CLI Formatting Libraries (npm)

#### 1. Chalk (133,825+ dependents)

**Purpose**: Terminal string styling (colors, bold, underline)

**Features**:
- Composable API (chain styles)
- No dependencies
- TypeScript support
- 256/Truecolor support
- Auto color detection

**Example**:
```javascript
const chalk = require('chalk');
console.log(chalk.blue.bold('Hello World'));
console.log(chalk.bgRed.white('Error'));
```

**Best Practice**: Use Chalk 4 for CommonJS, Chalk 5 for ESM

---

#### 2. Ora (Elegant Spinners)

**Purpose**: Loading spinners for long-running tasks

**Features**:
- Customizable spinner styles
- Text updates during spin
- Success/failure final states
- Promise integration

**Example**:
```javascript
const ora = require('ora');
const spinner = ora('Loading plugin...').start();
await loadPlugin();
spinner.succeed('Plugin loaded');
```

**Best Practice**: Use for indeterminate operations (API calls, file processing)

---

#### 3. Boxen (Create Boxes)

**Purpose**: Create styled boxes around text

**Features**:
- Multiple border styles
- Padding/margin control
- Title support
- Color options

**Example**:
```javascript
const boxen = require('boxen');
console.log(boxen('Plugin Loaded', {
  padding: 1,
  borderStyle: 'round',
  borderColor: 'green'
}));
```

**Best Practice**: Use for important announcements, not routine logging

---

## Structured Logging vs. Human-Readable

### The Modern Paradigm Shift

**Traditional (Human-First)**:
```
[INFO] 2025-11-20 10:00:00 - Plugin wrangler:brainstorm loading
[INFO] 2025-11-20 10:00:01 - Plugin wrangler:brainstorm loaded successfully
```

**Modern (Machine-First with Human Field)**:
```json
{
  "timestamp": "2025-11-20T10:00:00.000Z",
  "level": "info",
  "message": "Plugin loading",
  "plugin": "wrangler:brainstorm",
  "duration_ms": 1250,
  "context": {
    "version": "1.1.0",
    "agent_id": "claude-code"
  }
}
```

### Key Principles from Industry

1. **Machines are Primary Audience**: Design logs for querying, filtering, aggregating
2. **High Cardinality**: More attributes = more ways to slice data
3. **Contextual Enrichment**: Include trace IDs, request IDs, user IDs
4. **Semantic Conventions**: Use standard field names (OpenTelemetry)
5. **Human-Readable Field**: Include message field for browsing

### Observability Benefits

**Structured Logging Enables**:
- Fast searching by attributes
- Aggregation across services
- Correlation with traces/metrics
- Automated alerting
- Dashboard visualization

**Example Query**:
```
level="error" AND plugin="wrangler:*" AND duration_ms > 5000
```

### Implementation Patterns

**Best Practices**:
1. Start with structured format from day one
2. Include descriptive message field
3. Enforce standard schema across plugins
4. Use JSON for machine consumption
5. Provide pretty-print for terminal
6. Allow log level configuration
7. Include context (trace ID, session ID)

**Example Implementation**:
```javascript
// Structured logger
function logPluginLoad(pluginName, duration) {
  const log = {
    timestamp: new Date().toISOString(),
    level: 'info',
    event: 'plugin_loaded',
    plugin: pluginName,
    duration_ms: duration,
    message: `Plugin ${pluginName} loaded`
  };

  if (process.stdout.isTTY) {
    // Human-readable for terminal
    console.log(chalk.cyan(`Plugin ${pluginName} loaded (${duration}ms)`));
  } else {
    // JSON for pipes/logs
    console.log(JSON.stringify(log));
  }
}
```

---

## Plugin Lifecycle Patterns

### Common Lifecycle Stages

Based on analysis of JIRA, Qt Creator, Grafana, Apollo Server:

1. **Discovery**: Scan for available plugins
2. **Loading**: Load plugin code/libraries
3. **Initialization**: Execute setup code, register handlers
4. **Configuration**: Apply user settings
5. **Registration**: Register with framework
6. **Running**: Active execution
7. **Shutdown**: Cleanup, persist state

### Announcement Opportunities

**Where plugins typically announce**:
- **Post-Discovery**: List available plugins (verbose mode only)
- **Pre-Initialization**: Starting setup (verbose mode only)
- **Post-Initialization**: Confirm ready (optional, brief)
- **On-Error**: Always announce failures
- **On-Shutdown**: Cleanup confirmation (verbose mode only)

### Anti-Patterns to Avoid

1. **Double Announcement**: Don't announce both "loading" and "loaded"
2. **Redundant Information**: Don't repeat framework messages
3. **Visual Clutter**: Avoid boxes/separators for every plugin
4. **Blocking Announcements**: Don't require user acknowledgment
5. **Noisy Success**: Don't announce every successful operation

---

## Redundancy Analysis: Single vs. Double Announcement

### Pattern 1: Double Announcement (Loading + Loaded)

**Example**:
```
[INFO] wrangler:brainstorm skill is loading...
[INFO] wrangler:brainstorm skill loaded successfully
```

**Pros**:
- Clear state transitions
- Helpful for debugging slow loads
- Shows progress for long operations

**Cons**:
- Visual clutter for fast loads
- Redundant for typical use
- Doubles log volume

**Recommendation**: Only for long-running initializations (>2 seconds)

---

### Pattern 2: Single Announcement (Loaded Only)

**Example**:
```
[INFO] wrangler:brainstorm skill loaded
```

**Pros**:
- Concise
- Less noise
- Sufficient for most cases

**Cons**:
- No feedback during long loads
- Can't distinguish "starting" from "complete"

**Recommendation**: Default for fast loads (<2 seconds)

---

### Pattern 3: Spinner Pattern (Progressive)

**Example**:
```
⠋ Loading wrangler:brainstorm...
✓ wrangler:brainstorm loaded (1.2s)
```

**Pros**:
- Visual feedback without noise
- Shows duration
- Professional appearance

**Cons**:
- Requires TTY detection
- More complex implementation
- Doesn't work in logs

**Recommendation**: Best for interactive CLI tools

---

### Pattern 4: Silent by Default, Verbose on Demand

**Example**:
```bash
# Normal mode: silent
skill-tool run

# Verbose mode: detailed
DEBUG=* skill-tool run
# Output: Loading wrangler:brainstorm...
# Output: Loaded wrangler:brainstorm (1.2s)
```

**Pros**:
- Zero noise by default
- Full details when debugging
- Scales to many plugins
- Professional UX

**Cons**:
- Requires documentation
- Users must know about verbose mode

**Recommendation**: **BEST PRACTICE** for frameworks with multiple plugins

---

## Trade-Off Analysis

### Box Characters (═══) vs. Simple Lines (---) vs. No Separator

#### Option A: Fancy Box Characters
```
╔═══════════════════════════════════════╗
║  wrangler:brainstorm skill loading    ║
╚═══════════════════════════════════════╝
```

**Pros**:
- Very distinctive
- Hard to miss
- Professional appearance

**Cons**:
- Takes 3 lines per announcement
- Overwhelming with multiple plugins
- Harder to grep through logs
- UTF-8 required

**Verdict**: Only for critical announcements (errors, warnings)

---

#### Option B: Simple Line Separators
```
─────────────────────────────────────────
wrangler:brainstorm skill loading
─────────────────────────────────────────
```

**Pros**:
- Distinctive
- Less overhead than boxes
- Easy to implement

**Cons**:
- Still takes 3 lines
- Noise with multiple plugins
- UTF-8 required for nice characters

**Verdict**: Moderate use for section headers

---

#### Option C: Inline Prefix
```
[wrangler:brainstorm] Skill loading...
```

**Pros**:
- Single line
- Easy to grep
- Works with structured logging
- No special characters required

**Cons**:
- Less visually distinctive
- Can blend into other logs

**Verdict**: **BEST PRACTICE** for routine announcements

---

#### Option D: No Separator (Silent)
```
(no output)
```

**Pros**:
- Zero noise
- Fast startup perception
- Scales to unlimited plugins

**Cons**:
- No feedback
- Harder to debug

**Verdict**: Best for production, with verbose mode available

---

### Emojis vs. Text-Only

#### With Emojis
```
📦 Loading wrangler:brainstorm...
✅ wrangler:brainstorm loaded
```

**Pros**:
- Visually distinctive
- Quick semantic meaning
- Modern appearance

**Cons**:
- Not universally supported
- Inconsistent rendering across terminals
- Unprofessional in some contexts
- Hard to grep
- Accessibility issues

**Verdict**: Avoid in framework code, allow in user-facing apps

---

#### Text-Only
```
[INFO] Loading wrangler:brainstorm...
[INFO] wrangler:brainstorm loaded
```

**Pros**:
- Universal compatibility
- Professional
- Easy to grep
- Accessibility-friendly

**Cons**:
- Less visually distinctive
- Requires semantic keywords

**Verdict**: **BEST PRACTICE** for frameworks

---

### Inline vs. Block Formatting

#### Inline (Single Line)
```
[INFO] wrangler:brainstorm loaded (1.2s)
```

**Pros**:
- Concise
- Easy to grep
- Minimal scrollback
- Good for logs

**Cons**:
- Less prominent
- Limited space for details

**Verdict**: Default for routine operations

---

#### Block (Multi-Line)
```
╔════════════════════════════════════════╗
║ Skill Loaded: wrangler:brainstorm     ║
║ Duration: 1.2s                         ║
║ Version: 1.1.0                         ║
╚════════════════════════════════════════╝
```

**Pros**:
- Very prominent
- Can show detailed info
- Professional appearance

**Cons**:
- 5+ lines per announcement
- Overwhelming with multiple plugins
- Wastes scrollback
- Harder to parse

**Verdict**: Only for critical events (errors, first-run welcome)

---

## Recommendations for Wrangler

Based on comprehensive analysis of industry patterns, here are specific recommendations:

### 1. Default Behavior: Silent Activation

**Pattern**:
```javascript
// No announcement by default
async function loadSkill(skillName) {
  const skill = await import(`./skills/${skillName}/SKILL.md`);
  registerSkill(skillName, skill);
  // Silent - no console output
}
```

**Rationale**:
- Matches VS Code pattern (most successful plugin ecosystem)
- Scales to dozens/hundreds of skills
- Professional UX
- Fast perceived startup

---

### 2. Verbose Mode: Structured + Human-Readable

**Pattern**:
```javascript
// When WRANGLER_DEBUG=true or --verbose
function announceSkillLoad(skillName, duration) {
  const log = {
    timestamp: new Date().toISOString(),
    level: 'info',
    event: 'skill_loaded',
    skill: skillName,
    duration_ms: duration,
    version: '1.1.0'
  };

  if (process.env.WRANGLER_DEBUG) {
    // Human-readable for terminal
    if (process.stdout.isTTY) {
      console.log(chalk.cyan(`[wrangler] ${skillName} loaded (${duration}ms)`));
    } else {
      // JSON for pipes/logs
      console.log(JSON.stringify(log));
    }
  }
}
```

**Rationale**:
- Provides debugging capability
- Structured for observability
- Human-readable when interactive
- Machine-parseable when piped

---

### 3. Error Announcements: Always Visible

**Pattern**:
```javascript
function announceSkillError(skillName, error) {
  // Always show errors, regardless of verbose mode
  console.error(chalk.red(`[wrangler] Failed to load ${skillName}: ${error.message}`));

  // Log structured error for observability
  logStructured({
    timestamp: new Date().toISOString(),
    level: 'error',
    event: 'skill_load_failed',
    skill: skillName,
    error: error.message,
    stack: error.stack
  });
}
```

**Rationale**:
- Errors always need visibility
- Users need actionable information
- Supports debugging

---

### 4. First-Run Welcome: One-Time Box

**Pattern**:
```javascript
// On first run or version upgrade
if (isFirstRun() || isVersionUpgrade()) {
  console.log(boxen(
    `Wrangler v1.1.0\n\nSkills framework loaded.\nRun with --help for options.`,
    {
      padding: 1,
      borderStyle: 'round',
      borderColor: 'cyan'
    }
  ));
}
```

**Rationale**:
- One-time event worth highlighting
- Helps discoverability
- Professional appearance

---

### 5. Progress Indicators: For Long Operations Only

**Pattern**:
```javascript
// Only for operations >2 seconds
async function loadLargeSkillSet() {
  const spinner = ora('Loading skill library...').start();
  try {
    await loadAllSkills();
    spinner.succeed(`Loaded ${count} skills (${duration}ms)`);
  } catch (error) {
    spinner.fail(`Failed to load skills: ${error.message}`);
  }
}
```

**Rationale**:
- Provides feedback for long operations
- Doesn't clutter fast operations
- Professional appearance

---

### 6. Recommended Format for Skill Announcements

#### Production (Default - Silent)
```
(no output)
```

#### Debug Mode (WRANGLER_DEBUG=true)
```
[wrangler] Loading skill: wrangler:brainstorm
[wrangler] Loaded skill: wrangler:brainstorm (45ms)
[wrangler] Loading skill: wrangler:test-driven-development
[wrangler] Loaded skill: wrangler:test-driven-development (32ms)
```

#### Verbose Mode (--verbose flag)
```json
{"timestamp":"2025-11-20T10:00:00.000Z","level":"info","event":"skill_loading","skill":"wrangler:brainstorm"}
{"timestamp":"2025-11-20T10:00:00.045Z","level":"info","event":"skill_loaded","skill":"wrangler:brainstorm","duration_ms":45}
```

#### Error (Always Shown)
```
[wrangler] ERROR: Failed to load skill wrangler:brainstorm
  Reason: Invalid YAML frontmatter
  File: /path/to/skills/collaboration/brainstorm/SKILL.md:15
  Fix: Check skill file format
```

---

### 7. Environment Variables

**Recommended Configuration**:

- `WRANGLER_DEBUG` - Enable debug logging (human-readable)
- `WRANGLER_VERBOSE` - Enable verbose logging (structured JSON)
- `WRANGLER_LOG_LEVEL` - Set log level (error, warn, info, debug)
- `NO_COLOR` - Disable color output
- `WRANGLER_SILENT` - Suppress all non-error output

**Example Usage**:
```bash
# Normal mode (silent)
wrangler run

# Debug mode (human-readable)
WRANGLER_DEBUG=true wrangler run

# Verbose mode (structured JSON)
WRANGLER_VERBOSE=true wrangler run

# Specific log level
WRANGLER_LOG_LEVEL=debug wrangler run

# Silent mode (errors only)
WRANGLER_SILENT=true wrangler run
```

---

### 8. Terminal Rendering Considerations

**Implementation Checklist**:

1. **Detect TTY**: Use `process.stdout.isTTY` to detect interactive terminal
2. **Check Color Support**: Respect `NO_COLOR` environment variable
3. **Encoding Detection**: Check `process.env.LANG` for UTF-8 support
4. **Width Awareness**: Respect terminal width for box drawing
5. **Graceful Degradation**: Fall back to ASCII if Unicode unsupported

**Example Implementation**:
```javascript
function shouldUseColors() {
  return process.stdout.isTTY &&
         !process.env.NO_COLOR &&
         process.env.TERM !== 'dumb';
}

function shouldUseUnicode() {
  const lang = process.env.LANG || '';
  return lang.toLowerCase().includes('utf-8') ||
         lang.toLowerCase().includes('utf8');
}

function formatSkillAnnouncement(skillName, useColors, useUnicode) {
  if (!shouldShowAnnouncements()) return '';

  const prefix = '[wrangler]';
  const message = `${skillName} loaded`;

  if (useColors) {
    return chalk.cyan(`${prefix} ${message}`);
  }

  return `${prefix} ${message}`;
}
```

---

### 9. Structured Logging for Audit Trails

**Schema Definition**:
```typescript
interface SkillEvent {
  timestamp: string;        // ISO 8601
  level: 'debug' | 'info' | 'warn' | 'error';
  event: 'skill_loading' | 'skill_loaded' | 'skill_failed';
  skill: string;            // e.g., "wrangler:brainstorm"
  duration_ms?: number;     // Load duration
  version?: string;         // Skill version
  context?: {
    agent_id?: string;      // Agent identifier
    session_id?: string;    // Session identifier
    parent_skill?: string;  // If invoked by another skill
  };
  error?: {
    message: string;
    code: string;
    stack?: string;
  };
}
```

**Audit Trail Benefits**:
- Track which skills loaded
- Measure load performance
- Debug skill conflicts
- Analyze skill usage patterns
- Correlate with agent behavior

**Storage Options**:
- Write to `.wrangler/logs/skill-events.jsonl` (newline-delimited JSON)
- Send to observability platform (Datadog, Grafana, etc.)
- Store in SQLite for querying
- Rotate logs daily/weekly

---

## Final Recommendation: Three-Tier Approach

### Tier 1: Silent by Default
- No announcements during normal operation
- Fastest perceived startup
- Professional UX
- Scales to unlimited skills

### Tier 2: Debug Mode (Human-Friendly)
- Enable via `WRANGLER_DEBUG=true`
- Single-line announcements with color
- Timestamps and duration
- Easy to scan in terminal

### Tier 3: Verbose Mode (Machine-Friendly)
- Enable via `WRANGLER_VERBOSE=true`
- Structured JSON logs
- All context fields populated
- Suitable for observability platforms

### Error Handling: Always Visible
- Show errors regardless of mode
- Clear, actionable messages
- Include file paths and line numbers
- Suggest fixes when possible

---

## Example Implementation

```javascript
// wrangler/lib/skill-loader.js

const chalk = require('chalk');
const ora = require('ora');

class SkillLoader {
  constructor(options = {}) {
    this.debug = process.env.WRANGLER_DEBUG === 'true' || options.debug;
    this.verbose = process.env.WRANGLER_VERBOSE === 'true' || options.verbose;
    this.silent = process.env.WRANGLER_SILENT === 'true' || options.silent;
    this.useColors = process.stdout.isTTY && !process.env.NO_COLOR;
  }

  async loadSkill(skillName) {
    const startTime = Date.now();

    try {
      // Log start (debug mode only)
      this.logDebug('skill_loading', { skill: skillName });

      // Load the skill
      const skill = await import(`./skills/${skillName}/SKILL.md`);

      // Calculate duration
      const duration = Date.now() - startTime;

      // Log success
      this.logDebug('skill_loaded', {
        skill: skillName,
        duration_ms: duration
      });

      return skill;

    } catch (error) {
      // Always log errors
      this.logError('skill_failed', {
        skill: skillName,
        error: {
          message: error.message,
          code: error.code,
          stack: error.stack
        }
      });

      throw error;
    }
  }

  logDebug(event, data) {
    if (this.silent && event !== 'skill_failed') return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      level: event === 'skill_failed' ? 'error' : 'info',
      event,
      ...data
    };

    if (this.verbose) {
      // Structured JSON for machines
      console.log(JSON.stringify(logEntry));

    } else if (this.debug || event === 'skill_failed') {
      // Human-readable for terminal
      const color = event === 'skill_failed' ? chalk.red : chalk.cyan;
      const prefix = this.useColors ? color('[wrangler]') : '[wrangler]';

      if (event === 'skill_loading') {
        console.log(`${prefix} Loading skill: ${data.skill}`);
      } else if (event === 'skill_loaded') {
        console.log(`${prefix} Loaded skill: ${data.skill} (${data.duration_ms}ms)`);
      } else if (event === 'skill_failed') {
        console.error(`${prefix} ERROR: Failed to load skill ${data.skill}`);
        console.error(`  Reason: ${data.error.message}`);
      }
    }
  }

  logError(event, data) {
    // Always show errors
    this.logDebug(event, data);
  }
}

module.exports = { SkillLoader };
```

---

## Testing Recommendations

### Visual Testing Checklist

Test the announcement pattern across:

1. **Terminal Emulators**:
   - iTerm2 (macOS)
   - Terminal.app (macOS)
   - GNOME Terminal (Linux)
   - Windows Terminal (Windows)
   - VS Code integrated terminal

2. **Output Modes**:
   - Interactive terminal (TTY)
   - Piped output (`wrangler run | less`)
   - Redirected output (`wrangler run > log.txt`)
   - Background job (`wrangler run &`)

3. **Color Support**:
   - 24-bit color (truecolor)
   - 256-color
   - 16-color (basic ANSI)
   - No color (`NO_COLOR=1`)

4. **Encoding**:
   - UTF-8 locale
   - ASCII locale
   - Non-English locales

5. **Edge Cases**:
   - Very narrow terminals (80 chars)
   - Very wide terminals (200+ chars)
   - Multiple skills loading simultaneously
   - Skill load failures
   - Slow network/disk (>2s loads)

---

## References

### Documentation Reviewed

1. **VS Code Extension API**: Activation events, notifications, best practices
2. **JetBrains Plugin SDK**: Progress indicators, lifecycle, UX guidelines
3. **GitHub CLI**: Extension patterns, output formatting, update notifications
4. **Webpack**: Plugin logging API, infrastructure logger, stats integration
5. **ESLint**: Debug mode, plugin loading, config verification
6. **Docker**: Log formatting, verbose output, container logs
7. **Kubernetes**: kubectl plugin best practices, output formatting

### Key Articles

1. "Why Structured Logging is Fundamental to Observability" (Better Stack)
2. "UX patterns for CLI tools" (Lucas Costa)
3. "How to Design a CLI Tool That Developers Actually Love Using" (HackerNoon)
4. "Build your own Command Line with ANSI escape codes" (Li Haoyi)
5. "Polish Node.js CLI Output with Chalk and Ora" (egghead.io)

### Libraries Analyzed

1. **chalk**: Terminal string styling (133,825+ dependents)
2. **ora**: Elegant terminal spinners
3. **boxen**: Create styled boxes in terminal
4. **webpack-log**: Webpack-specific logging
5. **cli-format**: General CLI formatting utilities

---

## Conclusion

The overwhelming consensus from industry research is:

**"Silent by default, verbose on demand, structured for observability."**

For wrangler specifically:

1. **Do not announce skill loading by default** - silent activation like VS Code
2. **Provide debug mode** via `WRANGLER_DEBUG=true` with human-readable output
3. **Provide verbose mode** via `WRANGLER_VERBOSE=true` with structured JSON
4. **Always show errors** with clear, actionable messages
5. **Use simple formatting** - inline prefixes, not boxes
6. **Avoid emojis** - use text-only for compatibility
7. **Detect terminal context** - colors for TTY, plain text for pipes
8. **Log structured events** to `.wrangler/logs/` for audit trails

This approach balances:
- Professional UX (silent by default)
- Developer experience (debug mode available)
- Observability (structured logging)
- Compatibility (works everywhere)
- Scalability (handles many skills)

---

## Appendix: Example Output Across Modes

### Normal Mode (Silent)
```bash
$ wrangler run task.js
# (no skill announcements)
Task completed successfully.
```

### Debug Mode (Human-Readable)
```bash
$ WRANGLER_DEBUG=true wrangler run task.js
[wrangler] Loading skill: wrangler:brainstorm
[wrangler] Loaded skill: wrangler:brainstorm (45ms)
[wrangler] Loading skill: wrangler:test-driven-development
[wrangler] Loaded skill: wrangler:test-driven-development (32ms)
Task completed successfully.
```

### Verbose Mode (Structured JSON)
```bash
$ WRANGLER_VERBOSE=true wrangler run task.js
{"timestamp":"2025-11-20T10:00:00.000Z","level":"info","event":"skill_loading","skill":"wrangler:brainstorm"}
{"timestamp":"2025-11-20T10:00:00.045Z","level":"info","event":"skill_loaded","skill":"wrangler:brainstorm","duration_ms":45}
{"timestamp":"2025-11-20T10:00:00.045Z","level":"info","event":"skill_loading","skill":"wrangler:test-driven-development"}
{"timestamp":"2025-11-20T10:00:00.077Z","level":"info","event":"skill_loaded","skill":"wrangler:test-driven-development","duration_ms":32}
{"timestamp":"2025-11-20T10:00:01.200Z","level":"info","event":"task_completed","duration_ms":1200}
```

### Error Mode (Always Shown)
```bash
$ wrangler run task.js
[wrangler] ERROR: Failed to load skill wrangler:brainstorm
  Reason: Invalid YAML frontmatter
  File: /Users/sam/wrangler/skills/collaboration/brainstorm/SKILL.md:15
  Fix: Check skill file format and ensure valid YAML syntax

Task failed.
```
