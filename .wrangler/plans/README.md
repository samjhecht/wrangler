# Implementation Plans & Design Documents

This directory contains **optional** implementation plans and design documents created during the planning process.

## Purpose

Plan files serve as **architectural reference material** that complements MCP issues:

- **MCP issues** = Source of truth for implementation details (what to do, how to code it)
- **Plan files** = Optional architectural context (why this approach, component relationships)

## When to Create Plan Files

Plan files are **OPTIONAL**. Create them only when:

✅ **10+ issues/tasks** - Need architectural overview to understand big picture
✅ **Multiple interconnected components** - Need system diagram and component relationships
✅ **Significant design decisions** - Need to document rationale and alternatives considered
✅ **Complex patterns/conventions** - Need reference material that applies across multiple tasks
✅ **Onboarding context needed** - Future agents/sessions would struggle understanding issues in isolation

Skip plan files when:

❌ **< 5 simple tasks** - Straightforward implementation, issues are sufficient
❌ **No architectural complexity** - Changes are localized and self-explanatory
❌ **Obvious approach** - No design decisions requiring rationale

## File Types

### Implementation Plans
**Naming:** `YYYY-MM-DD-PLAN_<spec>.md`

Created by the `writing-plans` skill. Contains:
- Architecture overview
- Design decisions and rationale
- Technology choices
- Component relationships
- References to MCP issues (NOT duplicate content)

**Example:** `2025-11-21-PLAN_implement-skill.md`

### Design Documents
**Naming:** `YYYY-MM-DD-<topic>-design.md`

Created by the `brainstorming` skill. Contains:
- Design exploration results
- Approach alternatives evaluated
- Architecture diagrams
- Design validation outcomes

**Example:** `2025-11-18-authentication-system-design.md`

## What NOT to Include

**Plan files should NOT contain:**
- ❌ Detailed implementation steps (goes in MCP issues)
- ❌ Complete code examples (goes in MCP issues)
- ❌ Exact file paths for each task (goes in MCP issues)
- ❌ Granular acceptance criteria (goes in MCP issues)
- ❌ Task status tracking (tracked in MCP issues)

**Anti-pattern:** Duplicating information between plan files and issues creates synchronization problems and unclear source of truth.

## Content Separation Example

### ✅ Good: Plan File (Architecture Context)
```markdown
## Authentication Architecture

We're using JWT tokens with refresh token rotation for security.

**Design Decision:** Chose JWT over sessions because:
- Stateless scaling (no session store needed)
- Works across microservices
- Industry standard

**Components:**
- AuthService - token generation/validation
- RefreshTokenStore - rotation tracking
- Middleware - request authentication

See MCP issues #42-#48 for implementation details.
```

### ✅ Good: MCP Issue (Implementation Details)
```markdown
## Task: Implement JWT Token Generation

**Files:**
- Create: `src/auth/jwt-service.ts`
- Test: `src/auth/jwt-service.test.ts`

**Step 1: Write failing test**
\`\`\`typescript
describe('JWTService', () => {
  it('should generate valid JWT with user claims', () => {
    // exact test code here
  });
});
\`\`\`

**Step 2: Run test to verify it fails**
Run: `npm test -- src/auth/jwt-service.test.ts`
Expected: FAIL with "JWTService is not defined"

[... complete implementation steps ...]
```

### ❌ Bad: Duplicating Content in Both
Don't put the same code examples, file paths, or implementation steps in both plan file AND issues.

## Using Plan Files During Implementation

When executing a plan:

1. **Read plan file first** (if exists) - Get architectural context
2. **Load MCP issues** - Get implementation details
3. **Reference plan during work** - Understand design decisions
4. **Update issue status** - Track progress
5. **Don't modify plan file** - It's reference material, not a live document

Plan files are **read-only during execution**.

## Related Skills

- **`writing-plans`** - Creates optional plan files + MCP issues
- **`brainstorming`** - Creates design documents
- **`implementing`** - Loads plan files for architecture context
- **`executing-plans`** - Deprecated (replaced by `implementing`)

## Best Practices

1. **Reference, don't duplicate** - Link to issues instead of copying content
2. **Keep plan files evergreen** - Architectural context doesn't change during implementation
3. **Version control** - Commit plan files to git (they're in `.wrangler/` which is tracked)
4. **Clean up obsolete plans** - Archive or delete plans for completed/abandoned work

## Industry Context

This approach aligns with software engineering best practices:

- **Plan documents** = Technical specs/design docs (the "why" and "how")
- **Issue trackers** = Task management (the "what" and "when")

Both serve complementary purposes without competing. See research in `.wrangler/memos/` for detailed analysis of plan documentation best practices.

---

**Questions?** See `skills/writing-plans/SKILL.md` for complete guidance on creating plan files.
