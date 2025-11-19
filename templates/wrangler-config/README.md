# Wrangler Configuration Templates

Templates for `.wrangler/` directory configuration files.

## Templates

### cache-settings.json

Default cache configuration for the wrangler MCP server.

**Target location**: `.wrangler/cache/settings.json`

**Purpose**: Configure caching behavior for issue indexing, search optimization, and performance tracking.

**Fields**:

- `issueIndexing.enabled` (boolean): Enable/disable automatic issue indexing
- `issueIndexing.rebuildInterval` (number): Seconds between cache rebuilds (default: 3600 = 1 hour)
- `issueIndexing.maxCacheAge` (number): Maximum cache age in seconds (default: 86400 = 24 hours)
- `searchOptimization.enabled` (boolean): Enable/disable search optimization
- `searchOptimization.minQueryLength` (number): Minimum query length for search (default: 3 characters)
- `performanceTracking.enabled` (boolean): Enable/disable performance metrics collection
- `performanceTracking.sampleRate` (number): Sample rate for performance tracking (0.0-1.0, default: 0.1 = 10%)

**Usage**:

The session hook (`hooks/session-start.sh`) will automatically create this file at `.wrangler/cache/settings.json` if it doesn't exist.

**Customization**:

To customize cache settings for a project, edit `.wrangler/cache/settings.json` after initialization.

**Example**:

```json
{
  "issueIndexing": {
    "enabled": true,
    "rebuildInterval": 1800,
    "maxCacheAge": 43200
  },
  "searchOptimization": {
    "enabled": true,
    "minQueryLength": 2
  },
  "performanceTracking": {
    "enabled": true,
    "sampleRate": 0.5
  }
}
```

## Adding New Templates

When adding new configuration templates:

1. Create the template file in this directory
2. Document the target location in `.wrangler/`
3. Update session hook to auto-generate the file if needed
4. Add documentation to this README
