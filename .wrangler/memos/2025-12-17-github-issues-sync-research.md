# Research: Syncing Local Markdown Issues with GitHub Project Management

**Date**: 2025-12-17
**Context**: Exploring options to integrate wrangler's local markdown-based issue tracking with GitHub's issues/project management UI while preserving local file functionality.

---

## Problem Statement

Wrangler stores issues as plain markdown files with YAML frontmatter in `.wrangler/issues/`. This provides:
- Version control via git
- Local editing with any text editor
- AI agent accessibility
- Full metadata in frontmatter

The goal is to **also** visualize and manage these issues in GitHub's UI (Issues, Projects boards) without losing the local-first approach.

---

## Research Findings

### Existing Bidirectional Sync Tools

#### github-project-todo-md
- **URL**: https://github.com/azu/github-project-todo-md
- **What it does**: Bidirectional sync between GitHub Project Boards and Markdown todo files
- **How it works**:
  - Export: GitHub Project Board -> Markdown sections with checkbox items
  - Import: Edit markdown checkboxes -> sync changes back to GitHub
- **Limitation**: Syncs with Project Boards as checkboxes, not individual issue files with full frontmatter

#### Linear/GitHub Sync Tools
- Linear has native bidirectional GitHub Issues sync
- SyncLinear (https://synclinear.com/) - open source Linear <-> GitHub sync
- Architecture reference for building custom sync

### One-Way Tools

#### Markdown -> GitHub Issues
| Tool | Type | Notes |
|------|------|-------|
| [gh-issue-bulk-create](https://github.com/ntsk/gh-issue-bulk-create) | gh CLI extension | Template + CSV based |
| [bulk-issue-creator](https://github.com/benbalter/bulk-issue-creator) | Ruby script | "Mail merge" for issues |
| [Issue Importer Action](https://github.com/marketplace/actions/issue-importer-action) | GitHub Action | CSV/JSON import |
| [github-import-issues-csv](https://github.com/aboutcode-org/github-import-issues-csv) | Python | Projects support |

#### GitHub Issues -> Markdown
| Tool | Type | Notes |
|------|------|-------|
| [gh2md](https://github.com/mattduck/gh2md) | Python CLI | Export issues/PRs to markdown |
| [Issue to Markdown](https://github.com/marketplace/actions/issue-to-markdown) | GitHub Action | Auto-converts on label |
| [offline-issues](https://github.com/jlord/offline-issues) | Node CLI | Offline viewing |

### GitHub APIs Available

#### GraphQL API (Projects V2)
- `createProjectV2` - Create projects
- `addProjectV2ItemById` - Add issues/PRs to projects
- `addProjectV2DraftIssue` - Create draft items
- `updateProjectV2ItemFieldValue` - Update fields
- `convertProjectV2DraftIssueItemToIssue` - Convert drafts to real issues

Supports: Text, Number, Date, Single Select, Iterations fields

#### REST API
- Full CRUD on issues
- Labels, milestones, assignees
- Comments and reactions

#### Webhooks
- `issues` event: opened, edited, closed, labeled, etc.
- 25 MB payload limit
- Need server/serverless function to receive
- Can't get historical data (use API for initial sync)

### Terraform GitHub Provider
- **Does NOT support managing Issues directly**
- Supports: Repositories, Teams, Files, Labels
- Not viable for issue sync

---

## Recommended Approaches

### Option A: Push-to-Sync (Simplest)

```
Local Markdown (source of truth)
        |
        v (on commit)
    GitHub Action
        |
        v
GitHub Issues + Projects (visualization only)
```

**Implementation**:
1. GitHub Action triggers on `.wrangler/issues/**/*.md` changes
2. Parse frontmatter, extract title/body/labels/status
3. Use `gh issue create/edit` or GraphQL API
4. Store GitHub issue number back in frontmatter
5. Optionally add to a GitHub Project for board view

**Pros**: Simple, local files are source of truth, no conflicts
**Cons**: One-way only, edits in GitHub UI don't sync back

### Option B: Full Bidirectional Sync

```
Local Markdown <--> Sync Service <--> GitHub Issues
```

**Implementation**:
1. Webhook receiver (serverless function) for GitHub -> local
2. GitHub Action for local -> GitHub
3. ID mapping (local ID <-> GitHub issue number)
4. Conflict resolution (timestamp or last-write-wins)

**Pros**: Edit anywhere, always in sync
**Cons**: Complex, need conflict resolution, need hosted service

### Option C: Extend github-project-todo-md

Fork the existing tool to support:
- Full frontmatter metadata (not just checkboxes)
- Individual issue files instead of single markdown
- Wrangler's file naming convention
- Project board integration

---

## Implementation Sketch (Option A)

### GitHub Action Workflow

```yaml
name: Sync Issues to GitHub
on:
  push:
    paths:
      - '.wrangler/issues/**/*.md'

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Sync issues
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          for file in .wrangler/issues/*.md; do
            # Parse frontmatter
            title=$(yq -f extract '.title' "$file")
            status=$(yq -f extract '.status' "$file")
            labels=$(yq -f extract '.labels | join(",")' "$file")
            gh_issue=$(yq -f extract '.githubIssue' "$file")

            # Extract body (everything after frontmatter)
            body=$(sed -n '/^---$/,/^---$/d; p' "$file")

            if [ -z "$gh_issue" ]; then
              # Create new issue
              gh issue create --title "$title" --body "$body" --label "$labels"
            else
              # Update existing issue
              gh issue edit "$gh_issue" --title "$title" --body "$body"
            fi
          done
```

### Frontmatter Extension

Add `githubIssue` field to track mapping:

```yaml
---
id: "000001"
title: "Implement feature X"
status: "open"
priority: "high"
labels: ["backend"]
githubIssue: 42  # <- GitHub issue number
githubProject: "PVT_xxx"  # <- Optional project ID
---
```

---

## Key Considerations

1. **Source of Truth**: Must decide - local files or GitHub? Recommend local files.

2. **ID Mapping**: Need reliable way to link local ID <-> GitHub issue number

3. **Conflict Resolution**: If bidirectional, what happens when both sides edit?

4. **Projects vs Issues**: GitHub Projects are a VIEW layer over Issues. Can add issues to projects for board visualization.

5. **Projects Classic Deprecation**: GitHub is deprecating Projects Classic (2025-04-01). Use Projects V2 API.

6. **Rate Limits**: GitHub API has rate limits. Batch operations carefully.

---

## Next Steps (If Implementing)

1. Decide on sync direction (one-way vs bidirectional)
2. Prototype GitHub Action for markdown -> GitHub Issues
3. Add `githubIssue` field to wrangler's issue schema
4. Test with a sample project
5. Consider adding to wrangler as optional feature

---

## Sources

- https://github.com/azu/github-project-todo-md
- https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/using-the-api-to-manage-projects
- https://docs.github.com/en/webhooks/webhook-events-and-payloads
- https://cli.github.com/manual/gh_issue_create
- https://github.com/marketplace/actions/issue-to-markdown
- https://github.com/ntsk/gh-issue-bulk-create
- https://github.com/mattduck/gh2md
- https://linear.app/integrations/github
- https://synclinear.com/
