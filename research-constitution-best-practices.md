# Constitution Documents in AI Coding Assistant Projects: Comprehensive Research Report

**Research Date**: 2025-11-18
**Focus**: Best practices for constitution/governance documents in AI coding assistants (Claude Code, GitHub Spec-Kit)

---

## Executive Summary

This report synthesizes research on best practices for creating "constitution" documents in AI coding assistant projects. Two primary patterns emerged:

1. **CLAUDE.md** - Anthropic's project-specific configuration file for Claude Code
2. **constitution.md** - GitHub Spec-Kit's governance framework for spec-driven development

Both serve as "constitutional" documents that define non-negotiable principles, but differ in scope and enforcement mechanisms.

---

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [CLAUDE.md Best Practices](#claudemd-best-practices)
3. [GitHub Spec-Kit Constitution Pattern](#github-spec-kit-constitution-pattern)
4. [Making Principles Actionable and Enforceable](#making-principles-actionable-and-enforceable)
5. [Structure and Organization](#structure-and-organization)
6. [What to Include vs Exclude](#what-to-include-vs-exclude)
7. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
8. [Evolution and Maintenance](#evolution-and-maintenance)
9. [Integration with Development Workflows](#integration-with-development-workflows)
10. [Real-World Examples](#real-world-examples)
11. [Key Recommendations](#key-recommendations)
12. [Sources and Links](#sources-and-links)

---

## Core Concepts

### What is a "Constitution" for AI Coding Assistants?

A constitution for AI coding assistants is a foundational document that:

- **Defines non-negotiable principles** that the AI must respect during all development activities
- **Establishes architectural standards** and coding conventions
- **Codifies team practices** and workflow requirements
- **Provides project-specific context** to improve AI assistance quality
- **Acts as a "source of truth"** for how a repository works

### Two Primary Patterns

#### 1. CLAUDE.md (Anthropic Claude Code)

- **Location**: Project root or `~/.claude/CLAUDE.md` for global settings
- **Purpose**: Project configuration and context for Claude Code
- **Enforcement**: Automatic ingestion on session start; treated as immutable system rules
- **Scope**: Project-specific commands, conventions, patterns, anti-patterns
- **Format**: Markdown with sections; supports imports via `@path/to/file`

**Official Description**: "The CLAUDE.md file is the agent's 'constitution,' its primary source of truth for how your specific repository works."

#### 2. constitution.md (GitHub Spec-Kit)

- **Location**: `.specify/memory/constitution.md`
- **Purpose**: Governance framework for spec-driven development
- **Enforcement**: Multi-phase validation (specification, planning, implementation)
- **Scope**: Architectural principles, development methodology, quality gates
- **Format**: Markdown with YAML frontmatter; versioned with semantic versioning

**Official Description**: "A set of non-negotiable principles for your project—constraints that you want to be universally applicable, that the LLM cannot skip out on under any circumstances."

---

## CLAUDE.md Best Practices

### What Makes CLAUDE.md Effective

Based on research from Anthropic's official best practices and community practitioners:

#### 1. **Keep it Concise and Context-Efficient**

- **Under 100 lines is ideal** - Every piece of information should be context-efficient
- **Treat like expensive ad space** - Professional teams maintain 13KB files with strict token budgets
- **A focused 150-line CLAUDE.md that Claude can fully process is far more effective than a 300-line document** that gets only partial attention

**Rationale**: Avoid crowding the context window, which leads to poor performance and higher cost.

#### 2. **Be Specific and Actionable**

**Bad Example**:
```markdown
# Code Style
- Keep models clean
```

**Good Example**:
```markdown
# Code Style
- Use ES modules syntax, not CommonJS
- Models should include only validations, associations, scopes, and database configs
- Business logic goes in app/services or app/commands
```

**Key Insight**: "Clear directives consistently outperform lengthy explanations."

#### 3. **Include Explicit Anti-Patterns**

```markdown
# Anti-Patterns to Avoid
- Do NOT use our legacy auth system, use the new middleware instead
- Do NOT edit any files in the `src/legacy` directory
- Do NOT commit directly to the `main` branch
- Do NOT wrap framework features in unnecessary abstractions
```

**Why This Works**: AI can verify concrete patterns/anti-patterns, but cannot assess abstract concepts like "cleanliness" without definition.

#### 4. **Treat as a Living Document**

- **Build iteratively**: Add a new instruction → Give Claude a task → Observe result → Refine instruction
- **Use the `#` key frequently** during coding to have Claude auto-incorporate guidelines
- **Occasionally run through prompt improver** for better adherence
- **Include changes in commits** so team members benefit

#### 5. **Use Standard Markdown Structure**

```markdown
# Project Overview
Brief description of purpose and key goals

## Tech Stack
- Languages, frameworks, tools used

## Code Style & Conventions
- Import standards
- Formatting guidelines
- Naming conventions

## Development Workflow
- Branch strategy
- Commit message format
- PR requirements

## Testing Strategy
- Test frameworks
- Coverage requirements
- Test naming conventions

## Things Not to Do
- Protected areas and prohibited actions

## Common Commands
- `npm run build` - Build the project
- `npm test` - Run tests
```

#### 6. **Strategic File Placement**

**Option 1: Project Root** (Most Common)
- File: `CLAUDE.md`
- Action: Check into git
- Benefit: Shared across sessions and team members

**Option 2: Home Directory** (Global)
- File: `~/.claude/CLAUDE.md`
- Action: Apply to all sessions
- Benefit: Personal preferences across projects

**Option 3: Monorepo Structure**
- File: Multiple `CLAUDE.md` in subdirectories
- Action: All load automatically
- Benefit: Context-specific guidance

**Option 4: Local Overrides**
- File: `CLAUDE.local.md`
- Action: Add to `.gitignore`
- Benefit: Personal preferences not shared with team

#### 7. **Use Imports for Modularity**

```markdown
# My Project

@README
@docs/git-instructions.md
@~/.claude/my-project-instructions.md

## Code Style
...
```

**Rules**:
- Maximum recursive depth: 5 hops
- Imports don't work inside code blocks
- Use for referencing docs, configs, READMEs

#### 8. **Anchor Comments for Contextual Guidance**

**In Code**:
```typescript
// ANCHOR: auth-pattern
export function authenticateUser(token: string) {
  // This is the correct auth pattern
  return verifyJWT(token);
}
```

**In CLAUDE.md**:
```markdown
## Authentication
See `// ANCHOR: auth-pattern` in src/auth.ts for the standard approach.
All new auth code must follow this pattern.
```

#### 9. **Add Emphasis for Critical Rules**

Use terms like **IMPORTANT**, **YOU MUST**, **NEVER**, **ALWAYS** to boost adherence:

```markdown
# Critical Rules

IMPORTANT: Always run tests before committing.
YOU MUST use TypeScript strict mode.
NEVER expose API keys in client-side code.
ALWAYS validate user input on the server.
```

#### 10. **Explicitly Prompt Claude to Reference It**

**Critical Finding**: Claude requires explicit prompting to reference CLAUDE.md effectively.

**Less Effective**:
```
Implement authentication.
```

**More Effective**:
```
Review our CLAUDE.md file before proceeding, then implement authentication.
```

---

## GitHub Spec-Kit Constitution Pattern

### The Nine Articles Framework

GitHub Spec-Kit's constitution defines **nine immutable articles** that shape every aspect of specification-driven development. Each article addresses specific architectural concerns with concrete enforcement mechanisms.

#### Complete Nine Articles

**Article I: Library-First Principle**
- **Rule**: Every feature implementation must begin as a standalone library with clear boundaries and minimal dependencies
- **Enforcement**: Features cannot be implemented directly in applications; must extract to library first
- **Rationale**: Enforces modular design from inception, prevents monolithic implementations

**Article II: CLI Interface Mandate**
- **Rule**: All library functionality must be accessible through text-based command-line interfaces
- **Requirements**:
  - Accept text as input (via stdin, arguments, or files)
  - Produce text as output (via stdout)
  - Support JSON format for structured data exchange
- **Enforcement**: No library can be considered complete without a CLI
- **Rationale**: Ensures observability, verifiability, and composability

**Article III: Test-First Imperative** (Most Critical)
- **Rule**: No implementation code before tests exist and fail
- **Requirements**:
  1. Unit tests are written
  2. Tests are validated and approved by the user
  3. Tests are confirmed to FAIL (Red phase)
- **Enforcement**: Implementation blocked until tests pass TDD verification
- **Rationale**: Inverts traditional AI code generation; ensures tests actually verify behavior

**Article IV-VI**: *(Not fully documented in available sources)*

**Article VII: Simplicity Gate**
- **Rule**: Initial implementations limited to three projects maximum
- **Enforcement**: Additional projects require documented justification
- **Rationale**: Combats over-engineering through structural constraints

**Article VIII: Anti-Abstraction Gate**
- **Rule**: Use framework features directly rather than wrapping in custom abstractions
- **Enforcement**: Single model representations preferred; minimize indirection
- **Rationale**: Prevents unnecessary complexity from premature abstraction

**Article IX: Integration-First Testing**
- **Rule**: Tests must use realistic environments
- **Requirements**:
  - Real databases over mocks
  - Actual service instances over stubs
  - Mandatory contract tests before implementation
- **Enforcement**: Mock-heavy test suites rejected
- **Rationale**: Ensures tests reflect production behavior

### Constitution Structure

**File Format**:
```markdown
---
version: "1.0.0"
ratified: "2025-01-15T10:00:00.000Z"
lastAmended: "2025-01-15T10:00:00.000Z"
---

# [PROJECT_NAME] Constitution

## Core Principles

### [PRINCIPLE_1_NAME]
[PRINCIPLE_1_DESCRIPTION]

### [PRINCIPLE_2_NAME]
[PRINCIPLE_2_DESCRIPTION]

...

## [SECTION_2_NAME]
[SECTION_2_CONTENT]

## Governance
[GOVERNANCE_RULES]

---
Version: [CONSTITUTION_VERSION] | Ratified: [RATIFICATION_DATE] | Last Amended: [LAST_AMENDED_DATE]
```

### Semantic Versioning for Constitutions

**MAJOR** (e.g., 1.0.0 → 2.0.0):
- Backward-incompatible governance changes
- Principle removals or redefinitions
- Fundamental architectural shifts

**MINOR** (e.g., 1.0.0 → 1.1.0):
- New principles added
- Materially expanded guidance
- New sections or governance rules

**PATCH** (e.g., 1.0.0 → 1.0.1):
- Clarifications
- Typo fixes
- Non-semantic refinements

### Multi-Phase Enforcement

The constitution is enforced through a **multi-layer system**:

1. **Specification Phase**: Specs validated against constitutional principles
2. **Planning Phase**: Plans checked for constitutional compliance
3. **Implementation Phase**: Code generation must align with constitution
4. **Review Phase**: Changes verified against constitutional requirements

**Key Innovation**: These aren't guidelines; they're compile-time checks for architectural principles.

### Creating a Constitution with Spec-Kit

**Command**:
```bash
/speckit.constitution [your governance focus areas]
```

**Example Prompt**:
```
/speckit.constitution Set project law for a web app. Keep the current stack.
Library first. Simplicity over abstraction. Integration-first testing.
Enforce auth on all routes. No PII in logs.
```

**Workflow**:
1. **Load & Identify**: Locate existing template, map all placeholder tokens
2. **Collect Values**: Gather information from user input, repo context, or prior versions
3. **Draft Content**: Replace placeholders with concrete text; maintain structure
4. **Propagate Changes**: Update dependent templates (plan, spec, tasks, commands)
5. **Generate Report**: Document version changes, modified principles, affected files
6. **Validate**: Confirm no unexplained tokens remain; verify ISO dates
7. **Finalize**: Write back to `.specify/memory/constitution.md`; output summary

---

## Making Principles Actionable and Enforceable

### The Core Problem

**Challenge**: "Constitutions, by nature, are open to interpretation, and translating these principles into machine-understandable rules or guidelines can be challenging."

**AI Limitation**: "Fine-tuned models might perform best with clear, action-based rules, likely because they lack human-like reasoning and cannot adjust for context or intent—unlike humans, who interpret and adapt principles flexibly, models follow rules rigidly."

### Three Techniques to Eliminate Ambiguity

#### 1. **Positive Examples with Real Code**

**Bad** (Abstract):
```markdown
Controllers should be thin.
```

**Good** (Concrete):
```markdown
Controllers should only:
1. Parse request parameters
2. Call service layer methods
3. Format responses

Example (from src/api/users_controller.ts):
```typescript
async create(req: Request, res: Response) {
  const params = UserSchema.parse(req.body);
  const user = await this.userService.create(params);
  res.json({ user });
}
```
```

#### 2. **Explicit Anti-Patterns with Context**

**Bad** (Vague):
```markdown
Don't mix concerns in models.
```

**Good** (Specific):
```markdown
ANTI-PATTERN: Models with business logic

❌ BAD:
```typescript
class Post extends Model {
  async publish() {
    this.status = 'published';
    await this.save();
    await sendEmail(this.author, 'Post published');
    await updateStatsCounter('posts_published');
    await notifyExternalService(this.id);
  }
}
```

✅ GOOD:
```typescript
// Model: Only data and relationships
class Post extends Model {
  // Just validations, associations, scopes
}

// Service: Business logic
class PublishPostCommand {
  async execute(post: Post) {
    await post.update({ status: 'published' });
    await this.emailService.sendPublished(post);
    await this.statsService.increment('posts_published');
    await this.webhookService.notify(post);
  }
}
```
```

#### 3. **Context-Specific Rules with Boundaries**

**Bad** (Absolute):
```markdown
Always use commands for business logic.
```

**Good** (Bounded):
```markdown
Use commands for any operation that:
- Changes system state
- Involves multiple models
- Has side effects (emails, external APIs)
- Requires authorization checks

Do NOT use commands for:
- Simple data queries
- Read-only operations
- Single-attribute updates (use model methods)

Example: Use command for "PublishPost" (sends emails, updates stats)
Example: Don't use command for "Post.find(id)" (simple query)
```

### Making Principles Measurable and Testable

**Unmeasurable**:
```markdown
Keep code clean and maintainable.
```

**Measurable**:
```markdown
Code Quality Requirements:
- Test coverage ≥ 80% for new code
- Cyclomatic complexity ≤ 10 per function
- No functions longer than 50 lines
- Maximum nesting depth: 3 levels
- All public APIs must have TSDoc comments
```

### Enforcement Mechanisms

#### For CLAUDE.md

**1. Explicit Verification Prompts**:
```markdown
# Review Checklist

Before marking work complete, verify:
✅ All tests pass (`npm test`)
✅ No TypeScript errors (`npm run type-check`)
✅ Code follows patterns in CLAUDE.md
✅ Anti-patterns from CLAUDE.md avoided
✅ Changes documented in commit message
```

**2. Deterministic Shell Hooks**:
```json
// .mcp.json
{
  "hooks": {
    "pre-commit": "npm run lint && npm run type-check",
    "pre-push": "npm test"
  }
}
```

**3. MCP Tools Integration**:
```markdown
# Verification Commands

BEFORE committing, run:
- `npm run verify` - Runs linting, type-check, and tests
- Tool will fail if any check fails
- YOU MUST fix all failures before committing
```

#### For Spec-Kit Constitutions

**1. Phase Gates**:
- Phase -1: Constitution validation
- Phase 0: Specification compliance
- Phase 1: Planning alignment
- Phase 2: Implementation verification

**2. Automated Validation**:
```markdown
Article III Enforcement:
- Spec generation blocked until tests written
- Tests must be approved by user
- Tests must fail (Red phase verified)
- Only then can implementation proceed
```

**3. Template Propagation**:
- Constitution changes auto-update dependent templates
- Plan templates reference constitutional articles
- Task templates include compliance checks
- Command templates enforce governance rules

---

## Structure and Organization

### Recommended Section Hierarchy

Based on community best practices and professional teams:

```markdown
# [Project Name]

## Project Overview
- Purpose and key goals (2-3 sentences)
- Link to full documentation

## Tech Stack
- Languages: TypeScript, Python
- Frameworks: React, FastAPI
- Tools: Docker, PostgreSQL
- Key Libraries: Zod, Prisma

## Code Style & Conventions

### Imports
- Use absolute imports from @/
- Group: external, internal, types
- Sort alphabetically within groups

### TypeScript
- Strict mode enabled
- Explicit return types for public APIs
- Use Zod for runtime validation

### Naming
- Files: kebab-case.ts
- Components: PascalCase
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE

### Patterns to Follow
[Examples with code snippets]

### Anti-Patterns to Avoid
[Examples with code snippets]

## Development Workflow

### Branch Strategy
- main: production
- develop: integration
- feature/*: new features
- fix/*: bug fixes

### Commit Messages
- Format: type(scope): message
- Types: feat, fix, docs, test, refactor, chore

### Pull Requests
- Must pass CI
- Requires 1 approval
- Squash and merge

## Testing Strategy

### Frameworks
- Unit: Jest
- Integration: Supertest
- E2E: Playwright

### Coverage Requirements
- Overall: ≥ 80%
- New code: ≥ 90%
- Critical paths: 100%

### Test Naming
- describe('ModuleName', ...)
- it('should do something when condition', ...)

## Environment Setup

### Prerequisites
- Node 20+
- Docker
- PostgreSQL 15+

### Setup Commands
```bash
npm install
cp .env.example .env
docker-compose up -d
npm run db:migrate
npm run dev
```

### Environment Variables
- DATABASE_URL: PostgreSQL connection
- API_KEY: External service key
- LOG_LEVEL: debug|info|warn|error

## Common Commands

- `npm run dev` - Start development server
- `npm test` - Run all tests
- `npm run build` - Build for production
- `npm run db:migrate` - Run database migrations
- `npm run type-check` - Check TypeScript types
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

## Protected Areas

NEVER modify:
- `src/legacy/**` - Old code being phased out
- `migrations/**` - Historical database migrations
- `config/security.ts` - Security configuration
- `.github/workflows/**` - CI/CD pipelines

## Review Checklist

Before submitting PR:
- ✅ All tests pass
- ✅ No TypeScript errors
- ✅ Code formatted (Prettier)
- ✅ No console.log statements
- ✅ Updated relevant documentation
- ✅ Follows patterns in CLAUDE.md

## Team Policies

### Test Files
- Never delete tests without team approval
- Refactor tests alongside implementation
- Keep test coverage above threshold

### Code Review
- Respond to feedback within 24 hours
- Request re-review after changes
- Resolve all conversations before merge

### Context Investment
- Document non-obvious decisions in code comments
- Update CLAUDE.md when patterns evolve
- Share learnings in team meetings
```

### Organizational Best Practices

#### 1. **Use Clear Markdown Hierarchy**

```markdown
# Top Level - Project Name
## Major Sections
### Subsections
#### Specific Details
```

**Why**: Prevents "instruction bleeding" between different functional areas; maintains clear boundaries.

#### 2. **Modular Organization**

**Option A: Single File with Sections**
- Best for: Small to medium projects
- Benefit: Everything in one place
- Risk: Can become too large

**Option B: Import-Based Modularity**
```markdown
# CLAUDE.md
@docs/tech-stack.md
@docs/code-style.md
@docs/workflow.md
@docs/testing.md
```
- Best for: Large projects or monorepos
- Benefit: Organized, maintainable
- Risk: Need to manage multiple files

#### 3. **Bullet Points Over Paragraphs**

**Less Effective**:
```markdown
When writing TypeScript code, you should always enable strict mode because it helps catch type errors at compile time, which is important for maintaining code quality. Additionally, you should provide explicit return types for all public API functions to improve code readability and documentation.
```

**More Effective**:
```markdown
TypeScript Rules:
- Enable strict mode
- Explicit return types for public APIs
- Use Zod for runtime validation
- Avoid `any` type
```

#### 4. **Progressive Disclosure**

Start broad, link to details:

```markdown
## Testing
- Framework: Jest
- Coverage: ≥ 80%
- TDD required for new features

See @docs/testing-guide.md for detailed patterns and examples.
```

---

## What to Include vs Exclude

### ✅ What to Include

Based on Anthropic's official guidance and community consensus:

#### 1. **Common Commands with Descriptions**

```markdown
## Common Commands
- `npm run build` - Build the project for production
- `npm test` - Run all tests with coverage
- `npm run dev` - Start development server with hot reload
- `npm run db:migrate` - Apply pending database migrations
```

**Why**: Commands that actually work and are frequently used.

#### 2. **Code Style Guidelines**

```markdown
## Code Style
- Use ES modules syntax, not CommonJS
- Functional components with hooks (no class components)
- State management: Zustand (see src/stores for examples)
```

**Why**: Reduces back-and-forth corrections.

#### 3. **Key Architectural Patterns**

```markdown
## Architecture
- State management: Zustand
- API calls: src/services/*
- Shared components: src/components/common/*
- Types: src/types/*
```

**Why**: Helps Claude understand project structure.

#### 4. **Testing Instructions**

```markdown
## Testing
- Framework: Jest + Testing Library
- TDD required for new features
- Coverage threshold: 80%
- Run tests: `npm test`
```

**Why**: Ensures proper test practices.

#### 5. **Repository Etiquette**

```markdown
## Git Workflow
- Branch naming: feature/description or fix/description
- Commits: Conventional Commits format
- PRs: Require 1 approval, pass CI
- Merge strategy: Squash and merge
```

**Why**: Maintains consistent team practices.

#### 6. **Developer Environment Setup**

```markdown
## Environment
- Node version: 20+ (use pyenv/nvm)
- Required: Docker, PostgreSQL 15+
- Compiler: Use clang (gcc has issues)
```

**Why**: Prevents environment-related issues.

#### 7. **Unexpected Behaviors or Warnings**

```markdown
## Known Issues
- Legacy auth system in src/auth/legacy/* - DO NOT USE
- API rate limits reset at midnight UTC
- Hot reload breaks on config changes - restart dev server
```

**Why**: Saves time debugging common pitfalls.

#### 8. **Explicit Anti-Patterns**

```markdown
## Anti-Patterns to Avoid
- ❌ Do NOT use class components (use functional + hooks)
- ❌ Do NOT put business logic in controllers
- ❌ Do NOT mock database in integration tests
- ❌ Do NOT wrap framework features unnecessarily
```

**Why**: AI can verify concrete rules; prevents common mistakes.

#### 9. **Framework-Specific Patterns**

```markdown
## React Patterns
- Data fetching: Use React Query
- Forms: React Hook Form + Zod validation
- Styling: Tailwind CSS utility classes
- Icons: lucide-react library
```

**Why**: Especially valuable for frameworks emerged after Claude's training cutoff (e.g., Svelte 5, Next.js 15).

#### 10. **Important File Locations**

```markdown
## Key Files
- API routes: src/pages/api/*
- Schemas: src/schemas/*
- Utilities: src/lib/utils.ts
- Constants: src/constants/*
```

**Why**: Helps Claude navigate codebase efficiently.

### ❌ What to Exclude

#### 1. **Extensive Content Without Iteration**

**Mistake**: Dumping large llms.txt files from documentation.

**Why Avoid**: Crowds context window, reduces effectiveness, increases cost.

**Better Approach**: Add focused excerpts; link to docs for details.

#### 2. **Complex, Long-List Slash Commands**

**Mistake**: Creating 50+ custom slash commands for every possible task.

**Why Avoid**: Defeats the purpose of AI agents; you should be able to type naturally.

**Better Approach**: Create a few high-value slash commands for truly complex workflows.

#### 3. **Super-Specific Subtask Instructions**

**Mistake**:
```markdown
When adding a new user to the database, first validate the email format using
regex /^[^\s@]+@[^\s@]+\.[^\s@]+$/, then check if the email already exists by
querying SELECT * FROM users WHERE email = ?, then hash the password using
bcrypt with 12 rounds, then insert...
```

**Why Avoid**: Burns tokens on edge cases; over-specifies implementation.

**Better Approach**: Define high-level patterns; trust Claude to handle details.

#### 4. **Lengthy Explanations**

**Mistake**:
```markdown
We use TypeScript because it provides static type checking which helps us catch
errors at compile time rather than runtime. This is especially important in large
codebases where refactoring can be risky...
```

**Why Avoid**: Verbose, low information density.

**Better Approach**: Be concise; focus on "what" and "how," not "why."

#### 5. **Overly Granular Style Sections**

**Mistake**: Documenting every ESLint rule, Prettier setting, etc.

**Why Avoid**: Automated tools handle this better.

**Better Approach**: Use `.prettierrc`, `eslint.config.js`, and shell hooks; reference them in CLAUDE.md.

#### 6. **Information Not Actually Enforced**

**Mistake**: Including "rules" that aren't followed in practice.

**Why Avoid**: Creates confusion; Claude follows documentation, finds conflicting code.

**Better Approach**: Document only what you truly enforce; keep aligned with reality.

#### 7. **Generic Best Practices**

**Mistake**:
```markdown
Write clean code.
Use meaningful variable names.
Keep functions small.
```

**Why Avoid**: Not specific to your project; Claude already knows these.

**Better Approach**: Document project-specific patterns, not universal principles.

---

## Anti-Patterns to Avoid

### 1. **Content Overload**

**Problem**: Adding extensive content without iterating on effectiveness.

**Example**: Copying entire framework documentation into CLAUDE.md.

**Solution**:
- Start minimal
- Add incrementally
- Test effectiveness
- Remove what doesn't help

**Quote**: "Take time to experiment and determine what produces the best instruction following from the model."

### 2. **Complex Slash Command Proliferation**

**Problem**: Creating dozens of highly specific slash commands.

**Example**:
```markdown
/add-user-with-email-validation
/add-user-with-phone-validation
/add-admin-user
/add-guest-user
...
```

**Solution**: Use natural language instead; leverage Claude's flexibility.

**Quote**: "If you have a long list of complex, custom slash commands, you've created an anti-pattern. The entire point of an agent like Claude is that you can type almost whatever you want and get a useful, mergable result."

### 3. **Vague, Unmeasurable Principles**

**Problem**: Abstract guidelines without concrete criteria.

**Bad Examples**:
- "Keep models clean"
- "Write maintainable code"
- "Follow best practices"

**Why It Fails**: AI cannot verify compliance; too subjective.

**Solution**: Make principles specific, measurable, testable:
- "Models: only validations, associations, scopes, database configs"
- "Functions: ≤ 50 lines, cyclomatic complexity ≤ 10"
- "Test coverage: ≥ 80% for all new code"

### 4. **Ignoring Context Window Limits**

**Problem**: 300-line CLAUDE.md that Claude can't fully process.

**Solution**:
- Keep under 100-150 lines
- Use imports for modularity
- Prioritize high-value information
- Remove redundant content

**Quote**: "A focused 150-line CLAUDE.md that Claude can fully process is far more effective than a 300-line document."

### 5. **Set-and-Forget Mentality**

**Problem**: Creating CLAUDE.md once, never updating.

**Why It Fails**: Projects evolve; patterns change; new learnings emerge.

**Solution**: Treat as living document:
- Update when patterns change
- Add learnings from mistakes
- Refine based on Claude's behavior
- Include updates in commits

**Quote**: "Treat your claude.md as a living document - it is not a 'set it and forget it' file."

### 6. **Assuming Automatic Adherence**

**Problem**: Expecting Claude to automatically follow CLAUDE.md without prompting.

**Research Finding**: "Claude requires explicit prompting to reference CLAUDE.md effectively."

**Solution**: Include explicit instructions in prompts:
```
Review our CLAUDE.md file before proceeding, then implement the authentication system.
```

### 7. **Mixing Personal and Team Standards**

**Problem**: Including personal preferences in shared CLAUDE.md.

**Solution**: Use two files:
- `CLAUDE.md` - Team standards (checked into git)
- `CLAUDE.local.md` - Personal preferences (gitignored)

### 8. **Over-Abstraction in Constitutions**

**Problem**: Creating meta-principles that are too abstract to enforce.

**Example**: "Follow the spirit of simplicity in all implementations."

**Why It Fails**: "Spirit" is unverifiable; open to interpretation.

**Solution**: Concrete constraints (Article VII: "Maximum 3 projects for initial implementation").

### 9. **Mock-Heavy Testing in Constitutions**

**Problem**: Allowing extensive mocking in test suites.

**Why It Fails**: Tests don't reflect production behavior; false confidence.

**Solution**: Article IX pattern - "Real databases over mocks, actual service instances over stubs."

### 10. **Premature Abstraction**

**Problem**: Creating custom wrappers around framework features.

**Why It Fails**: Adds complexity without clear benefit.

**Solution**: Article VIII pattern - "Use framework features directly rather than wrapping."

---

## Evolution and Maintenance

### Versioning Strategies

#### For Spec-Kit Constitutions

**Semantic Versioning Rules**:

```markdown
# Version: 2.1.0

## Changelog

### 2.1.0 (2025-03-15) - MINOR
- Added Article X: Security-First Design
- Expanded Article III with mutation testing requirements
- New section: Compliance Requirements

### 2.0.0 (2025-02-01) - MAJOR
- BREAKING: Removed Article IV (Database-First)
- Redefined Article I to include API-as-library pattern
- Changed governance: Now requires 2 approvals for constitutional changes

### 1.0.1 (2025-01-20) - PATCH
- Clarified Article VII: Examples of justified complexity
- Fixed typo in Article II CLI requirements
- Reformatted for consistency
```

#### For CLAUDE.md Files

**Timestamp-Based Approach**:

```markdown
# MyProject CLAUDE.md
Last Updated: 2025-11-18

## Recent Changes
- 2025-11-18: Added React Query patterns
- 2025-11-10: Updated testing requirements (coverage 80% → 90%)
- 2025-11-01: Migrated from Redux to Zustand
```

### Maintenance Workflows

#### 1. **Continuous Refinement**

**Process**:
1. Add new instruction to CLAUDE.md
2. Give Claude a task that relies on it
3. Observe the result
4. If it doesn't work as expected, refine
5. Commit successful refinements

**Tools**:
- Use `#` key during coding to auto-add guidelines
- Include CLAUDE.md changes in regular commits
- Review effectiveness weekly

#### 2. **Prompt Improvement Cycles**

**Process**:
```
1. Run CLAUDE.md through Anthropic's prompt improver
2. Review suggested changes
3. Test improved version
4. Merge improvements that increase adherence
```

**Frequency**: Monthly or when adherence drops

#### 3. **Team Synchronization**

**Process**:
- Code review includes CLAUDE.md changes
- Team discusses constitutional amendments
- Vote on major changes
- Document rationale for changes

**Example PR Description**:
```markdown
## CLAUDE.md Update: Switch to Zustand

### Rationale
- Redux is overkill for our use cases
- Zustand is simpler, less boilerplate
- Migration complete in #234

### Changes
- Updated state management section
- Added Zustand examples
- Removed Redux anti-patterns
- Added migration guide link
```

#### 4. **Deprecation Strategy**

**For Outdated Patterns**:
```markdown
## State Management

### Current Approach: Zustand
[Details...]

### Deprecated: Redux (Being Phased Out)
⚠️ DO NOT use Redux for new code.
Legacy code in src/redux/* is being migrated.
See [Migration Guide](link) before touching Redux code.
```

#### 5. **Constitutional Amendments (Spec-Kit)**

**Workflow**:
```bash
# Propose amendment
/speckit.constitution propose "Add Article X: Security-First Design"

# Review impact
/speckit.constitution impact

# If approved, update
/speckit.constitution amend

# Propagate to dependent templates
/speckit.constitution propagate
```

**Governance** (Example):
```markdown
## Constitutional Amendment Process

1. Proposal Phase
   - Any team member can propose
   - Must include rationale and examples

2. Review Phase
   - Team reviews for 1 week
   - Impact analysis performed

3. Approval Phase
   - MAJOR changes: 2/3 majority vote
   - MINOR changes: Simple majority
   - PATCH changes: Any maintainer

4. Propagation Phase
   - Automated template updates
   - Documentation refresh
   - Team notification
```

### Preventing Constitution Dilution

**Challenge**: "Constitutional AI faces issues with constitutional dilution, as constitutions may reflect orthodox values and miss international perspectives."

**Solutions**:

#### 1. **Periodic Review**

- Quarterly constitutional review meetings
- Assess if principles still serve project
- Update for changing context

#### 2. **Diverse Input**

- Crowdsource from entire team
- Include perspectives from:
  - Junior developers
  - Senior architects
  - Product managers
  - Security team
  - Accessibility experts

#### 3. **Principle Testing**

- Validate principles against real scenarios
- Ask: "Did this principle help or hinder?"
- Remove principles that don't add value

#### 4. **Clear Escalation Path**

```markdown
## When Constitutional Principles Conflict

1. Document the conflict
2. Bring to team discussion
3. Temporarily prioritize based on:
   - Security > Performance
   - User Experience > Developer Convenience
   - Simplicity > Flexibility
4. Schedule constitutional review
```

---

## Integration with Development Workflows

### CLAUDE.md Integration Patterns

#### 1. **Session Start Hook**

```bash
#!/bin/bash
# .claude/hooks/session-start.sh

echo "📋 Loading project context..."
cat CLAUDE.md | head -20
echo ""
echo "✅ CLAUDE.md loaded. Review full file with: cat CLAUDE.md"
```

#### 2. **Pre-Commit Hook**

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Verify code follows CLAUDE.md patterns
echo "Checking compliance with CLAUDE.md standards..."

# Example: Check for anti-patterns
if git diff --cached | grep -q "import.*CommonJS"; then
  echo "❌ CLAUDE.md violation: Use ES modules, not CommonJS"
  exit 1
fi

# Run automated checks
npm run lint || exit 1
npm run type-check || exit 1
```

#### 3. **MCP Server Integration**

```json
// .mcp.json
{
  "tools": [
    {
      "name": "verify_claude_compliance",
      "description": "Verify code follows CLAUDE.md standards",
      "script": "./scripts/verify-compliance.sh"
    }
  ]
}
```

#### 4. **CI/CD Pipeline**

```yaml
# .github/workflows/claude-compliance.yml
name: CLAUDE.md Compliance

on: [pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Verify patterns from CLAUDE.md
        run: |
          # Extract anti-patterns from CLAUDE.md
          # Check if PR introduces any anti-patterns
          ./scripts/check-anti-patterns.sh
```

### Spec-Kit Constitution Integration

#### 1. **Phase Gate System**

```markdown
## Development Phases with Constitutional Checks

Phase -1: Constitution
├── Define constitutional principles
├── Version and commit
└── Propagate to templates

Phase 0: Specification
├── Article I: Verify library-first design
├── Article II: Ensure CLI interfaces planned
├── Article III: Require test specifications
└── Approval gate

Phase 1: Planning
├── Article VII: Check complexity (≤3 projects)
├── Article VIII: Verify no premature abstraction
├── Article IX: Validate integration test approach
└── Approval gate

Phase 2: Implementation
├── Article III: Tests written and failing
├── User approval of tests
├── Implement minimum code to pass
├── Article IX: Integration tests pass
└── Approval gate

Phase 3: Review
├── Constitutional compliance verification
├── All articles satisfied
└── Merge gate
```

#### 2. **Template Propagation**

When constitution changes, auto-update:

**Plan Template**:
```markdown
# Implementation Plan

## Constitutional Compliance

Article I (Library-First): ✅
- Feature extracted to libs/user-auth
- Clear boundaries defined
- Minimal dependencies

Article III (Test-First): ✅
- Unit tests: spec/user-auth.test.ts
- Tests approved by @user
- Tests failing (Red phase confirmed)
...
```

**Task Template**:
```markdown
# Task: Implement User Authentication

## Pre-Implementation Checklist
- [ ] Article III: Tests written
- [ ] Article III: Tests approved by user
- [ ] Article III: Tests confirmed failing
- [ ] Article IX: Integration test environment ready

## Implementation
[Details...]

## Post-Implementation Checklist
- [ ] Article III: Tests passing
- [ ] Article II: CLI interface implemented
- [ ] Constitutional compliance verified
```

#### 3. **Validation Scripts**

```bash
#!/bin/bash
# scripts/validate-constitution.sh

echo "🔍 Validating constitutional compliance..."

# Article I: Library-First
if [ ! -d "libs/" ]; then
  echo "❌ Article I: No libs/ directory found"
  exit 1
fi

# Article III: Test-First
TEST_COUNT=$(find spec -name "*.test.ts" | wc -l)
IMPL_COUNT=$(find src -name "*.ts" ! -name "*.test.ts" | wc -l)

if [ $TEST_COUNT -lt $IMPL_COUNT ]; then
  echo "❌ Article III: More implementation files than test files"
  exit 1
fi

# Article VII: Simplicity
PROJECT_COUNT=$(find libs -maxdepth 1 -type d | wc -l)
if [ $PROJECT_COUNT -gt 3 ]; then
  echo "⚠️  Article VII: More than 3 projects (requires justification)"
fi

echo "✅ Constitutional compliance verified"
```

### Workflow Integration Examples

#### Example 1: TDD Workflow with Constitution

```markdown
## TDD Workflow (Article III Enforcement)

1. User describes feature
2. Claude generates test specification
3. User reviews and approves tests
4. Claude verifies tests FAIL (Red phase)
5. Only after Red phase: Claude generates implementation
6. Tests pass (Green phase)
7. Claude refactors if needed
8. Constitutional compliance verified
```

#### Example 2: Pull Request Template

```markdown
## Pull Request Checklist

### CLAUDE.md Compliance
- [ ] Code follows patterns documented in CLAUDE.md
- [ ] Anti-patterns from CLAUDE.md avoided
- [ ] All commands from "Common Commands" work
- [ ] Protected areas not modified

### Constitutional Compliance (Spec-Kit)
- [ ] Article I: Feature implemented as library
- [ ] Article II: CLI interface provided
- [ ] Article III: Tests written before implementation
- [ ] Article VII: Complexity justified if >3 projects
- [ ] Article VIII: No unnecessary abstractions
- [ ] Article IX: Integration tests use real services

### General
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

#### Example 3: Code Review Prompt

```markdown
# Code Review with Constitutional Context

Context: Review PR #123 against our CLAUDE.md and constitution.

Review Process:
1. Load CLAUDE.md: @CLAUDE.md
2. Load constitution: @.specify/memory/constitution.md
3. Check PR diff: @pr-diff.txt

Verification:
- Code style matches CLAUDE.md guidelines
- Anti-patterns from CLAUDE.md avoided
- Constitutional articles satisfied
- Tests follow documented patterns

Provide detailed feedback referencing specific CLAUDE.md sections or constitutional articles.
```

---

## Real-World Examples

### Example 1: TypeScript + Node.js API (CLAUDE.md)

```markdown
# API Service - CLAUDE.md

## Tech Stack
- TypeScript 5.3 (strict mode)
- Node.js 20 LTS
- Fastify (web framework)
- Prisma (ORM)
- Zod (validation)
- Jest (testing)

## Code Style

### TypeScript
- Strict mode enabled (no implicit any)
- Explicit return types for public functions
- Use Zod for runtime validation
- Prefer type over interface (except for declaration merging)

### Imports
```typescript
// Order: external, internal, types
import fastify from 'fastify';          // external
import { userService } from '@/services'; // internal
import type { User } from '@/types';     // types
```

### Error Handling
```typescript
// Always use custom error classes
throw new ValidationError('Invalid email format', { email });

// Never throw raw strings
// ❌ throw 'Invalid email';
```

## Architecture

### Directory Structure
```
src/
├── routes/       # HTTP endpoints
├── services/     # Business logic
├── repositories/ # Data access
├── schemas/      # Zod schemas
├── types/        # TypeScript types
└── utils/        # Shared utilities
```

### Layer Responsibilities
- **Routes**: Parse request, call service, format response
- **Services**: Business logic, orchestration
- **Repositories**: Database queries only
- **Schemas**: Validation and type generation

## Testing

### TDD Required
- Write tests BEFORE implementation
- Run test (verify it fails)
- Write minimal code to pass
- Refactor

### Test Structure
```typescript
describe('UserService', () => {
  describe('create', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = { email: 'test@example.com', name: 'Test' };

      // Act
      const user = await userService.create(userData);

      // Assert
      expect(user.email).toBe('test@example.com');
    });
  });
});
```

### Coverage Requirements
- Overall: ≥ 80%
- Services: ≥ 90%
- Critical paths: 100%

## Anti-Patterns to Avoid

❌ **Business Logic in Routes**
```typescript
// Bad
app.post('/users', async (req, res) => {
  const user = await prisma.user.create({ data: req.body });
  await sendEmail(user.email);
  await updateAnalytics('user_created');
  res.send(user);
});
```

✅ **Use Services**
```typescript
// Good
app.post('/users', async (req, res) => {
  const data = UserCreateSchema.parse(req.body);
  const user = await userService.create(data);
  res.send(user);
});
```

❌ **Throwing Generic Errors**
```typescript
throw new Error('Something went wrong');
```

✅ **Use Custom Error Classes**
```typescript
throw new ValidationError('Invalid email format', { email });
```

## Common Commands

- `npm run dev` - Start development server (port 3000)
- `npm test` - Run all tests with coverage
- `npm run build` - Build for production
- `npm run type-check` - Check TypeScript types
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with test data

## Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for signing JWTs
- `SMTP_URL` - Email service connection

Optional:
- `LOG_LEVEL` - debug|info|warn|error (default: info)
- `PORT` - Server port (default: 3000)

## Protected Areas

NEVER modify:
- `prisma/migrations/**` - Historical migrations
- `src/auth/legacy/**` - Old auth system (being phased out)
- `.github/workflows/**` - CI/CD configuration

## Review Checklist

Before committing:
- ✅ Tests pass (`npm test`)
- ✅ No TypeScript errors (`npm run type-check`)
- ✅ Follows layer architecture
- ✅ Custom error classes used
- ✅ Zod schemas for validation
- ✅ No business logic in routes
```

### Example 2: React Application (CLAUDE.md)

```markdown
# E-Commerce Frontend - CLAUDE.md
Last Updated: 2025-11-18

## Tech Stack
- React 18.3
- TypeScript 5.3
- Vite (build tool)
- TanStack Query (data fetching)
- Zustand (state management)
- React Router v6
- Tailwind CSS
- Shadcn/ui (component library)

## Code Style

### Components
```typescript
// Functional components with hooks (no class components)
// Explicit typing for props

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
}

export function UserCard({ user, onEdit }: UserCardProps) {
  return (
    <div className="card">
      <h2>{user.name}</h2>
      <button onClick={() => onEdit(user)}>Edit</button>
    </div>
  );
}
```

### File Naming
- Components: `PascalCase.tsx` (e.g., `UserCard.tsx`)
- Hooks: `camelCase.ts` (e.g., `useAuth.ts`)
- Utils: `kebab-case.ts` (e.g., `format-date.ts`)
- Constants: `UPPER_SNAKE_CASE.ts` (e.g., `API_ENDPOINTS.ts`)

### State Management
- Server state: TanStack Query
- Global client state: Zustand
- Local component state: useState
- Form state: React Hook Form

## Patterns to Follow

### Data Fetching
```typescript
// Use TanStack Query for all API calls
function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => api.users.list(),
  });
}

// In component
function UsersList() {
  const { data: users, isLoading } = useUsers();

  if (isLoading) return <Spinner />;
  return <ul>{users.map(u => <UserCard key={u.id} user={u} />)}</ul>;
}
```

### Forms
```typescript
// React Hook Form + Zod validation
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema } from '@/schemas';

function UserForm() {
  const form = useForm({
    resolver: zodResolver(userSchema),
  });

  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
}
```

### Styling
```typescript
// Tailwind utility classes (avoid custom CSS)
<button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
  Click me
</button>

// For complex styling, use cn() helper
import { cn } from '@/lib/utils';

<div className={cn(
  'base-styles',
  isActive && 'active-styles',
  className
)}>
```

## Anti-Patterns to Avoid

❌ **Class Components**
```typescript
// Don't use
class UserCard extends React.Component { ... }
```

✅ **Functional Components**
```typescript
// Use this
function UserCard(props: UserCardProps) { ... }
```

❌ **Prop Drilling**
```typescript
// Avoid passing props through many levels
<Parent user={user}>
  <Child user={user}>
    <GrandChild user={user}>
```

✅ **Context or State Management**
```typescript
// Use Zustand or Context
const user = useAuthStore(state => state.user);
```

❌ **Inline API Calls**
```typescript
// Don't
const handleClick = async () => {
  const res = await fetch('/api/users');
  const users = await res.json();
};
```

✅ **TanStack Query Hooks**
```typescript
// Use
const { data: users, refetch } = useUsers();
const handleClick = () => refetch();
```

## Testing

### Testing Library
- Framework: Vitest + Testing Library
- E2E: Playwright

### Test Structure
```typescript
import { render, screen } from '@testing-library/react';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  it('should display user name', () => {
    const user = { id: 1, name: 'Alice' };
    render(<UserCard user={user} onEdit={() => {}} />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
  });
});
```

### Coverage
- Overall: ≥ 80%
- Critical paths (checkout, auth): 100%

## Common Commands

- `npm run dev` - Start dev server (http://localhost:5173)
- `npm test` - Run unit tests
- `npm run test:e2e` - Run Playwright E2E tests
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Check TypeScript

## Directory Structure

```
src/
├── components/
│   ├── common/      # Reusable components
│   ├── features/    # Feature-specific components
│   └── layouts/     # Layout components
├── hooks/           # Custom hooks
├── lib/             # Utilities
├── pages/           # Route components
├── services/        # API clients
├── stores/          # Zustand stores
└── types/           # TypeScript types
```

## Protected Areas

NEVER modify:
- `src/components/legacy/**` - Old components (being migrated)
- `public/assets/**` - Static assets from design team

## Known Issues

- Hot reload breaks when editing Tailwind config - restart dev server
- TanStack Query devtools only work in development mode
- Image optimization requires Sharp (already installed)

## Review Checklist

- ✅ Functional components (no class components)
- ✅ TanStack Query for API calls
- ✅ React Hook Form for forms
- ✅ Tailwind for styling (no custom CSS)
- ✅ Tests written and passing
- ✅ TypeScript strict mode (no `any`)
```

### Example 3: Spec-Kit Constitution (Full Example)

```markdown
---
version: "2.1.0"
ratified: "2025-01-15T10:00:00.000Z"
lastAmended: "2025-03-15T14:30:00.000Z"
---

# E-Commerce Platform Constitution

## Preamble

This constitution establishes the foundational principles for the E-Commerce Platform. All specifications, plans, and implementations must adhere to these articles. Violations are grounds for rejection at any phase gate.

## Article I: Library-First Principle

Every feature implementation MUST begin as a standalone library with clear boundaries and minimal dependencies.

**Requirements**:
- Feature extracted to `libs/{feature-name}`
- Public API defined in `libs/{feature-name}/index.ts`
- Internal implementation in `libs/{feature-name}/src/`
- Maximum 3 external dependencies per library

**Enforcement**: Specification phase - verify library structure planned

**Example**:
```
libs/
├── user-auth/
│   ├── index.ts          # Public API
│   ├── src/
│   │   ├── authenticate.ts
│   │   └── validate.ts
│   └── package.json      # Local dependencies
```

## Article II: CLI Interface Mandate

All library functionality MUST be accessible through text-based command-line interfaces.

**Requirements**:
- CLI accepts text input (stdin, arguments, or files)
- CLI produces text output (stdout)
- Supports JSON format for structured data
- Implements `--help` flag

**Enforcement**: Planning phase - verify CLI design included

**Example**:
```bash
# Text input/output
$ user-auth validate --email alice@example.com
Valid: true

# JSON format
$ user-auth validate --email alice@example.com --json
{"valid": true, "reason": null}
```

## Article III: Test-First Imperative

No implementation code shall be written before:
1. Unit tests are written
2. Tests are validated and approved by the user
3. Tests are confirmed to FAIL (Red phase)

**Requirements**:
- Test files in `{library}/spec/`
- Test coverage ≥ 90% for libraries
- User approval required before implementation
- Red phase confirmation mandatory

**Enforcement**: Implementation phase - blocked until tests approved and failing

**Example Workflow**:
```
1. Write spec/user-auth.test.ts
2. Submit for user approval
3. Run tests (verify FAIL - Red phase)
4. User approves
5. Implement src/user-auth.ts (Green phase)
6. Tests pass
7. Refactor (if needed)
```

## Article IV: Security-First Design

All features handling sensitive data MUST implement defense-in-depth.

**Requirements**:
- Input validation at every layer
- Authentication required for protected resources
- Authorization checks before data access
- Audit logging for sensitive operations
- No PII in application logs

**Enforcement**: Specification and implementation phases

**Example**:
```typescript
// Validation at API layer
const data = UserSchema.parse(req.body);

// Validation at service layer
if (!data.email.includes('@')) throw new ValidationError('Invalid email');

// Validation at repository layer
if (!userId || typeof userId !== 'string') throw new Error('Invalid userId');
```

## Article V: API-First Integration

All services MUST expose well-defined APIs before UI implementation.

**Requirements**:
- OpenAPI 3.0 specification required
- Contract tests mandatory
- API versioning (v1, v2, etc.)
- Backward compatibility or deprecation notice

**Enforcement**: Planning phase - API spec required before UI design

## Article VI: Performance Budgets

All features MUST meet performance budgets.

**Requirements**:
- API response time: p95 < 200ms
- Page load time: < 2s (3G network)
- Lighthouse score: ≥ 90
- Bundle size increase: < 50KB per feature

**Enforcement**: Implementation phase - performance tests mandatory

## Article VII: Simplicity Gate

Initial implementations limited to **three projects maximum**.

**Requirements**:
- Maximum 3 libraries/services for new features
- Additional projects require documented justification
- Justification includes: complexity analysis, alternatives considered, approval

**Enforcement**: Planning phase - reject plans with >3 projects without justification

**Example Justification**:
```markdown
## Complexity Justification: Payment System (5 projects)

### Proposed Structure
1. payment-gateway (external API client)
2. payment-processor (business logic)
3. payment-webhooks (event handling)
4. payment-ui (user interface)
5. payment-reconciliation (accounting)

### Why 5 Projects?
- **Regulatory requirement**: PCI-DSS requires separation of payment data handling
- **Alternatives considered**: Monolithic approach rejected due to compliance risk
- **Complexity analysis**: Each project has distinct security and compliance requirements

### Approval: @tech-lead, @security-team (2025-03-10)
```

## Article VIII: Anti-Abstraction Gate

Framework features MUST be used directly rather than wrapped in custom abstractions.

**Requirements**:
- Use framework APIs directly
- Abstraction requires strong justification
- Single model representations (no unnecessary mapping layers)
- Minimize indirection

**Enforcement**: Code review phase

**Example**:

❌ **Prohibited** (Unnecessary Abstraction):
```typescript
// Custom wrapper around React Query
class DataFetcher {
  fetch(key, fn) {
    return useQuery({ queryKey: key, queryFn: fn });
  }
}
```

✅ **Allowed** (Direct Usage):
```typescript
// Use React Query directly
const { data } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers
});
```

## Article IX: Integration-First Testing

Tests MUST use realistic environments.

**Requirements**:
- Real databases over mocks (use test containers)
- Actual service instances over stubs
- Contract tests mandatory before integration
- End-to-end tests for critical paths

**Enforcement**: Implementation phase - test strategy review

**Example**:
```typescript
// ✅ Integration test with real database
import { setupTestDB } from '@/test-utils';

describe('UserRepository', () => {
  let db: TestDatabase;

  beforeAll(async () => {
    db = await setupTestDB(); // Real PostgreSQL in Docker
  });

  it('should create user', async () => {
    const user = await userRepo.create({ email: 'test@example.com' });
    expect(user.id).toBeDefined();
  });
});

// ❌ Avoid mock-heavy tests
// const mockDB = { create: jest.fn() };
```

## Governance

### Amendment Process

**MAJOR Changes** (e.g., 2.0.0):
- Requires: 2/3 majority vote from tech leads
- Approval: CTO sign-off
- Notice: 2 weeks before implementation

**MINOR Changes** (e.g., 2.1.0):
- Requires: Simple majority from tech leads
- Approval: Any senior engineer
- Notice: 1 week before implementation

**PATCH Changes** (e.g., 2.1.1):
- Requires: Any maintainer
- Approval: Code review
- Notice: Immediate

### Conflict Resolution

When constitutional articles conflict:

1. Document the specific conflict
2. Escalate to tech lead
3. Temporary prioritization:
   - Security > Performance
   - User Experience > Developer Convenience
   - Simplicity > Flexibility
4. Schedule constitutional review within 1 sprint

### Compliance Verification

**Automated Checks**:
- Pre-commit hooks verify test coverage
- CI/CD pipeline validates article compliance
- Lighthouse tests enforce performance budgets

**Manual Reviews**:
- Specification review: Articles I, II, IV, V, VII, VIII
- Planning review: Articles III, VI, VII, IX
- Implementation review: All articles
- Code review: Articles IV, VIII, IX

### Exceptions

Exceptions to constitutional articles require:
- Written justification
- Risk analysis
- Approval from tech lead + security team (for security-related articles)
- Documentation in decision log
- Sunset date (maximum 1 year)

---

**Version**: 2.1.0
**Ratified**: 2025-01-15T10:00:00.000Z
**Last Amended**: 2025-03-15T14:30:00.000Z

## Changelog

### 2.1.0 (2025-03-15) - MINOR
- Added Article IV: Security-First Design
- Expanded Article VI with Lighthouse score requirement
- Added Compliance Verification section
- Added Exceptions process

### 2.0.0 (2025-02-01) - MAJOR
- BREAKING: Removed Article X (Database-First) - superseded by Article I
- Redefined Article I to include API-as-library pattern
- Changed governance: Now requires CTO approval for MAJOR changes

### 1.0.0 (2025-01-15) - INITIAL
- Established Nine Articles framework
- Defined governance process
- Ratified by founding team
```

---

## Key Recommendations

Based on comprehensive research across official documentation, community best practices, and real-world implementations:

### For All Constitution Documents

1. **Start Small, Iterate**
   - Begin with 50-100 lines
   - Add incrementally based on observed needs
   - Remove what doesn't improve AI behavior
   - Validate effectiveness before expanding

2. **Be Specific, Not Abstract**
   - Bad: "Keep code clean"
   - Good: "Functions ≤ 50 lines; cyclomatic complexity ≤ 10"
   - Use concrete, measurable, testable principles

3. **Show, Don't Just Tell**
   - Include code examples for patterns
   - Include code examples for anti-patterns
   - Reference actual files from your codebase
   - Use anchor comments for contextual guidance

4. **Make It Enforceable**
   - Integrate with pre-commit hooks
   - Add CI/CD validation
   - Use MCP tools for verification
   - Include review checklists

5. **Treat as Living Document**
   - Update when patterns change
   - Add learnings from mistakes
   - Refine based on AI behavior
   - Include updates in commits
   - Review effectiveness regularly

### For CLAUDE.md Specifically

6. **Context Efficiency is Critical**
   - Keep under 100-150 lines
   - Every word should add value
   - Use imports for modularity
   - Avoid verbose explanations

7. **Use Emphasis for Critical Rules**
   - IMPORTANT, NEVER, ALWAYS, YOU MUST
   - Increases adherence to key principles
   - Use sparingly for maximum impact

8. **Explicitly Prompt Claude to Reference It**
   - Don't assume automatic adherence
   - Include "Review CLAUDE.md before proceeding" in prompts
   - Reference specific sections when relevant

9. **Separate Personal from Team Standards**
   - `CLAUDE.md` for team (checked into git)
   - `CLAUDE.local.md` for personal (gitignored)
   - Keep team file focused on shared standards

10. **Use the `#` Key During Development**
    - Let Claude auto-incorporate guidelines
    - Iteratively build documentation
    - Capture patterns as you discover them

### For Spec-Kit Constitutions Specifically

11. **Nine Articles Framework Works**
    - Library-First prevents monoliths
    - CLI-First ensures observability
    - Test-First inverts AI code generation
    - Simplicity Gate prevents over-engineering
    - Anti-Abstraction prevents premature optimization
    - Integration-First ensures realistic testing

12. **Multi-Phase Enforcement is Key**
    - Specification phase: verify design alignment
    - Planning phase: check compliance early
    - Implementation phase: block non-compliant code
    - Review phase: final verification

13. **Semantic Versioning for Governance**
    - MAJOR: breaking constitutional changes
    - MINOR: new principles added
    - PATCH: clarifications only
    - Track amendments with rationale

14. **Template Propagation Automates Compliance**
    - Constitution changes flow to plan templates
    - Task templates include compliance checks
    - Command templates enforce governance
    - Reduces manual verification burden

### Universal Best Practices

15. **Balance Clarity with Flexibility**
    - Clear enough for AI to verify
    - Flexible enough for edge cases
    - Document exception process
    - Include conflict resolution

16. **Measure What Matters**
    - Test coverage thresholds
    - Performance budgets
    - Complexity limits
    - Quality gates

17. **Learn from Failures**
    - When AI violates principles, ask why
    - Was principle unclear?
    - Was it unmeasurable?
    - Was it unrealistic?
    - Update constitution based on learnings

18. **Share and Collaborate**
    - Include constitution changes in PRs
    - Discuss amendments as team
    - Document rationale for changes
    - Crowdsource improvements

19. **Automate Verification**
    - Pre-commit hooks catch violations early
    - CI/CD enforces standards
    - MCP tools provide on-demand checks
    - Automated tests verify compliance

20. **Review and Evolve**
    - Quarterly constitution reviews
    - Assess if principles still serve
    - Remove outdated constraints
    - Add new learnings
    - Prevent constitutional dilution

---

## Sources and Links

### Official Documentation

1. **Anthropic - Claude Code Best Practices**
   - https://www.anthropic.com/engineering/claude-code-best-practices
   - Official guidance on CLAUDE.md files, what to include, structure recommendations

2. **Anthropic - Claude's Constitution**
   - https://www.anthropic.com/news/claudes-constitution
   - Background on Constitutional AI and Anthropic's approach

3. **GitHub - Spec-Kit Repository**
   - https://github.com/github/spec-kit
   - Official repository with constitution templates and documentation

4. **GitHub - Spec-Kit Constitution Template**
   - https://github.com/github/spec-kit/blob/main/templates/commands/constitution.md
   - Template for creating constitution.md files

5. **GitHub - Spec-Kit Constitution Example**
   - https://github.com/github/spec-kit/blob/main/memory/constitution.md
   - Example constitution from the spec-kit project itself

### Community Best Practices

6. **Brandon Casci - Teaching Claude Code Consistency**
   - https://www.brandoncasci.com/2025/07/30/from-chaos-to-control-teaching-claude-code-consistency.html
   - Detailed guide on writing clear, actionable principles; anti-pattern examples

7. **callmephilip - CLAUDE.md Structure and Best Practices**
   - https://callmephilip.com/posts/notes-on-claude-md-structure-and-best-practices/
   - Import structure, organizational patterns, advanced techniques

8. **Maxitect - Building an Effective CLAUDE.md**
   - https://www.maxitect.blog/posts/maximising-claude-code-building-an-effective-claudemd
   - Comprehensive guide on structure, what to include/exclude, size guidelines

9. **Nikiforov - Claude Code Usage Best Practices**
   - https://nikiforovall.blog/productivity/2025/06/13/claude-code-rules.html
   - Practical recommendations from professional usage

10. **eesel AI - 7 Essential Claude Code Best Practices**
    - https://www.eesel.ai/blog/claude-code-best-practices
    - Production-ready AI best practices for 2025

### Technical Deep Dives

11. **Medium - Beyond Vibe Coding: Spec Kit and the Constitution**
    - https://medium.com/@mcraddock/beyond-vibe-coding-spec-kit-and-the-constitution-for-consistent-gds-compliant-ai-development-e4b2693a241f
    - Nine Articles framework, enforcement mechanisms

12. **Microsoft - Diving Into Spec-Driven Development**
    - https://developer.microsoft.com/blog/spec-driven-development-spec-kit
    - Overview of Spec-Kit philosophy and constitution role

13. **InfoWorld - Spec-driven AI coding with Spec Kit**
    - https://www.infoworld.com/article/4062524/spec-driven-ai-coding-with-githubs-spec-kit.html
    - Technical overview of spec-driven development

14. **LogRocket - Exploring Spec-Driven Development**
    - https://blog.logrocket.com/github-spec-kit/
    - Comprehensive guide to Spec-Kit features

### GitHub Repositories with Examples

15. **awesome-claude-code**
    - https://github.com/hesreallyhim/awesome-claude-code
    - Curated collection of CLAUDE.md examples from real projects

16. **ArthurClune/claude-md-examples**
    - https://github.com/ArthurClune/claude-md-examples
    - Repository of sample CLAUDE.md files

17. **ruvnet/claude-flow - CLAUDE.md Templates**
    - https://github.com/ruvnet/claude-flow/wiki/CLAUDE-MD-Templates
    - Templates for Web, Mobile, API, and AI/ML projects

18. **Cranot/claude-code-guide**
    - https://github.com/Cranot/claude-code-guide
    - Comprehensive guide with examples

### Research and Academic

19. **Anthropic Research - Constitutional AI: Harmlessness from AI Feedback**
    - https://www.anthropic.com/research/constitutional-ai-harmlessness-from-ai-feedback
    - Original Constitutional AI research paper

20. **arXiv - Constitutional AI Paper**
    - https://arxiv.org/abs/2212.08073
    - Technical details on Constitutional AI methodology

### AI Governance

21. **IBM - What is AI Governance?**
    - https://www.ibm.com/think/topics/ai-governance
    - Principles for AI governance frameworks

22. **GitHub Resources - Creating an AI Governance Framework**
    - https://resources.github.com/learn/pathways/copilot/essentials/empower-developers-with-ai-policy-and-governance/
    - Enterprise governance for AI coding assistants

23. **Nightfall AI - Constitutional AI: The Essential Guide**
    - https://www.nightfall.ai/ai-security-101/constitutional-ai
    - Security perspective on Constitutional AI

### Additional Resources

24. **Apidog - What's a Claude.md File? 5 Best Practices**
    - https://apidog.com/blog/claude-md/
    - Practical guide to Claude.md usage

25. **Shipyard - Your CLAUDE.md file: Developer's Guide**
    - https://shipyard.build/blog/your-claude-md-file-developer-guide/
    - Developer-focused best practices

26. **GitHub Spec-Kit Issue #609 - Claude.md vs constitution.md**
    - https://github.com/github/spec-kit/issues/609
    - Community discussion on differences and integration

27. **DeepWiki - Spec-Kit Documentation**
    - https://deepwiki.com/github/spec-kit/
    - Comprehensive documentation of Spec-Kit features

---

## Conclusion

Constitution documents for AI coding assistants represent a paradigm shift in how we guide AI development workflows. The research reveals two complementary approaches:

**CLAUDE.md** excels at project-specific context, patterns, and team conventions. It's lightweight, flexible, and integrates seamlessly into daily development.

**Spec-Kit constitutions** provide rigorous architectural governance with multi-phase enforcement. The Nine Articles framework offers battle-tested principles that prevent common AI code generation pitfalls.

**Key Insight**: Both patterns succeed when they make principles **specific, measurable, and enforceable**. Abstract guidelines like "keep code clean" fail; concrete rules like "functions ≤ 50 lines" succeed.

**For Wrangler Implementation**: Consider a hybrid approach:
- **CLAUDE.md** for project conventions, commands, and patterns
- **constitution.md** for non-negotiable architectural principles (TDD, security, simplicity)
- **Skill integration** to ensure constitutional principles are followed in skill execution
- **MCP tools** for automated compliance verification

The future of AI-assisted development depends on clear, unambiguous governance documents that AI agents can reliably follow. This research provides a comprehensive foundation for building that system in wrangler.

---

**Report Compiled**: 2025-11-18
**Total Sources Referenced**: 27+
**Research Methodology**: Web search, documentation analysis, community best practices synthesis
**Recommended Next Steps**: Create wrangler constitution framework based on Spec-Kit Nine Articles + CLAUDE.md best practices
