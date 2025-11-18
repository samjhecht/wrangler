Activate the `dependency-opportunity-scanner` skill to analyze the codebase for opportunities to replace custom implementations with well-maintained open source libraries. The workflow will:

1. Scan codebase in parallel (patterns, dependencies, code quality)
2. Research best library options for identified opportunities
3. Present top opportunities with cost/benefit analysis for your selection
4. Create isolated git worktree and implement the refactoring
5. Submit PR to GitHub with comprehensive analysis

This is a multi-phase workflow that ends with a PR ready for your review.
