---
wranglerVersion: "1.2.0"
lastUpdated: "2026-01-25"
---

# Wrangler Constitution

**Version**: 1.0.0
**Ratified**: 2026-01-25
**Last Amended**: 2026-01-25

---

## Our North Star

Establish and maintain perfect alignment between AI coding assistants and their human partners through systematic governance, without getting in the way of what Claude Code does best.

---

## Core Design Principles

### 1. Determinism Through Verification, Not Prescription

**Principle**: Reliable outcomes come from verifying results, not prescribing steps.

**In Practice**:
- Check that tests pass, not that the agent followed 47 prescribed steps
- External enforcement (git hooks, GitHub checks) is authoritative
- Phase boundaries have hard gates that verify outcomes
- Session tools track what happened passively for audit and recovery

**Anti-patterns** (What NOT to do):
- Writing 1000+ line skills with prescriptive step-by-step instructions
- Micromanaging the order of operations when order doesn't matter
- Adding checkpoints that don't verify anything meaningful
- Trusting agent self-reports over external verification

**Examples**:
- **Good**: Git pre-commit hook verifies tests pass before allowing commit
- **Bad**: Skill says "Step 1: Run tests. Step 2: Check output. Step 3: If pass, proceed..."

---

### 2. Stay Out of Claude Code's Way

**Principle**: Don't add friction to what the LLM naturally does well.

**In Practice**:
- Let the LLM decide how to implement features
- Let the LLM choose which files to read and in what order
- Let the LLM make judgment calls about code structure
- Only add gates where verification genuinely matters

**Anti-patterns** (What NOT to do):
- Prescribing exact implementation approaches in skills
- Requiring specific file read order or exploration patterns
- Adding bureaucratic checkpoints that slow down work without adding value
- Creating skills so complex they can't be followed reliably

**Examples**:
- **Good**: "Implement this feature using TDD. Tests must pass (verified by pre-commit hook)."
- **Bad**: "First read file A, then file B, then create file C with exactly this structure..."

---

### 3. External Enforcement Over Internal Compliance

**Principle**: Gates that can't be bypassed are more reliable than promises to follow rules.

**In Practice**:
- Git hooks run automatically; the agent can't skip them
- GitHub required checks block merging; no exceptions
- Environment-based bypasses (WRANGLER_SKIP_HOOKS) are only available to humans
- Session tools are passive trackers, not active enforcers

**Anti-patterns** (What NOT to do):
- Relying on the LLM to self-report TDD compliance
- Trusting "I ran the tests and they passed" without evidence
- Creating enforcement that the agent can rationalize around
- Making session tools block progress (they should only track)

**Examples**:
- **Good**: Pre-commit hook fails if tests don't pass; commit is blocked
- **Bad**: Skill asks agent to "verify tests pass" and trust the response

---

### 4. Outcome-Focused Skills

**Principle**: Skills should define what success looks like, not how to achieve it.

**In Practice**:
- State the required outcomes clearly
- Specify hard gates that verify outcomes
- Let the agent choose its approach
- Keep skills short and focused

**Anti-patterns** (What NOT to do):
- Writing verbose, prescriptive step-by-step instructions
- Duplicating Claude Code's natural capabilities in skill text
- Adding "nice to have" guidance that dilutes critical requirements
- Making skills so long the agent can't process them reliably

**Examples**:
- **Good**: "Requirements: tests exist, tests pass, code reviewed, git clean"
- **Bad**: "Step 1: Create test file. Step 2: Write failing test. Step 3: Run test..."

---

### 5. Minimal Gate Set

**Principle**: Add only the gates that genuinely matter; every gate has a cost.

**In Practice**:
- Tests must pass (core quality)
- Git state must be clean (enables recovery)
- Code review should happen (second perspective)
- PR checks must pass (external verification)
- Everything else is guidance, not enforcement

**Anti-patterns** (What NOT to do):
- Adding gates for "nice to have" quality attributes
- Creating phase transitions with complex verification logic
- Blocking progress for cosmetic issues
- Requiring human approval for routine operations

**Examples**:
- **Good**: Four hard gates total (tests, git clean, review, PR checks)
- **Bad**: 15 gates including "documentation updated", "changelog written", etc.

---

## Decision Framework

When evaluating wrangler features or design decisions, ask:

1. **Does this add friction to what Claude Code does well?** If yes, reconsider.
2. **Is this enforcement or guidance?** Enforcement must be external; guidance should be minimal.
3. **Does this gate verify a meaningful outcome?** If not, remove it.
4. **Is this skill outcome-focused or prescriptive?** Prescriptive skills should be simplified.
5. **Can this be bypassed by the LLM?** If yes, it's guidance, not enforcement.

**If unsure, err toward less structure, not more.**

---

## Examples of Constitutional Compliance

### Good: Git Hooks Enforcement

**Decision**: Use git hooks (pre-commit, pre-push) as the primary enforcement mechanism for test quality.

**Alignment**:
- **Principle 3 (External Enforcement)**: Git hooks run automatically; can't be skipped by LLM
- **Principle 2 (Stay Out of the Way)**: Hooks are invisible when tests pass
- **Principle 5 (Minimal Gates)**: Only enforces the one thing that matters most: tests pass

**Outcome**: Approved as core enforcement mechanism.

---

### Bad: 1200-Line Prescriptive Implement Skill

**Proposed**: Detailed skill with 47 steps, TDD compliance certification tables, subagent dispatch templates, error handling flowcharts.

**Conflicts**:
- **Principle 1 (Verification over Prescription)**: Prescribes steps instead of verifying outcomes
- **Principle 2 (Stay Out of the Way)**: Micromanages what the LLM does naturally
- **Principle 4 (Outcome-Focused)**: Way too long and prescriptive

**Decision**: Simplify to outcome-focused skill: "Implement using TDD. Hard gates: tests pass, git clean, code reviewed."

---

## Evolution of Principles

### Amendment Process

1. **Proposal**: Create issue with label `constitutional-amendment`
2. **Justification**: Explain why amendment serves our North Star better
3. **Impact Analysis**: How does this affect existing skills and workflows?
4. **Testing**: Validate the change doesn't add friction
5. **Approval**: Owner decision with documented rationale
6. **Implementation**: Update this document, increment version

### Version History

- **1.0.0** (2026-01-25): Initial constitution ratified with five core principles

---

## Governance Rules

1. **Constitution is Supreme Law**: These principles override all other practices
2. **Less is More**: When in doubt, add less structure
3. **External Verification**: Trust git hooks and GitHub over agent self-reports
4. **Outcome Focus**: Define success, not the path to it
5. **Continuous Simplification**: Regularly review and simplify skills

---

**For AI Assistants**: Before proposing any wrangler feature, verify it doesn't violate these principles. The default answer to "should we add this gate/step/requirement?" is NO unless there's a compelling reason.
