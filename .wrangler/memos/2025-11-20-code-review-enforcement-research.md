# Code Review Enforcement Research

**Date**: 2025-11-20
**Purpose**: Research how open-source projects and development frameworks enforce mandatory code review requirements to strengthen wrangler's enforcement mechanisms.

## Executive Summary

This research examined code review enforcement patterns across major open-source projects (Chromium, Linux Kernel, Kubernetes, LLVM) and development platforms (GitHub, GitLab, Gerrit). Key findings:

1. **Truly mandatory review requires system-level enforcement** - pre-commit hooks and policies can be bypassed; only platform-enforced gates (Gerrit, GitHub branch protection, GitLab approval rules) provide reliable enforcement.

2. **The bypass prevention hierarchy** (weakest to strongest):
   - Policy documentation (easily ignored)
   - Pre-commit hooks (can use `--no-verify`)
   - CI/CD checks (can be skipped with admin rights)
   - Branch protection with admin enforcement (strongest)
   - Gerrit-style ref restrictions (architectural enforcement)

3. **Emergency exceptions remain the hardest problem** - all systems struggle with balancing security and operational necessity. Best practice: require audit trail, post-incident review, and minimize blast radius.

4. **Self-approval prevention is critical** - all mature systems prevent authors from approving their own work.

---

## Platform-Specific Enforcement Mechanisms

### 1. GitHub Branch Protection Rules

**Enforcement Capabilities**:
- "Require a pull request before merging" - prevents direct pushes
- "Require approvals" - specify N reviewers (1-6)
- "Require review from Code Owners" - enforces CODEOWNERS file
- "Dismiss stale pull request approvals when new commits are pushed"
- "Require approval from someone other than the last pusher"
- "Include administrators" - critical for preventing bypass
- "Do not allow bypassing the above settings" - strictest mode

**Bypass Prevention**:
- Repository Rules (GA 2025) provide more flexible targeting and organization-level enforcement
- November 2025 update: "Required review by specific teams" added granular control
- Custom roles can grant "bypass branch protections" without full admin access
- Audit logging tracks when protections are overridden

**Weakness**:
- Administrators can temporarily disable protections (creates audit trail but allows bypass)
- "Break glass" scenarios require human judgment
- GitHub Apps cannot be listed in CODEOWNERS (automation gap)

**Example Configuration** (Chromium project):
```
Branch: main
✓ Require a pull request before merging
  ✓ Require approvals: 2
  ✓ Dismiss stale pull request approvals when new commits are pushed
✓ Require status checks to pass before merging
  ✓ Require branches to be up to date before merging
✓ Require conversation resolution before merging
✓ Include administrators
✓ Do not allow bypassing the above settings
```

---

### 2. GitLab Merge Request Approvals

**Enforcement Capabilities**:
- Approval rules define minimum N approvers
- Eligible approvers by role (Developer, Maintainer, Owner)
- Protected branch settings prevent direct pushes
- "Prevent editing approval rules in merge requests" locks project-level rules
- Merge request approval policies (Premium/Ultimate) enforce rules across all MRs

**Tier Differences**:
- **GitLab Free**: Approvals are optional (any number, but can merge with 0)
- **GitLab Premium/Ultimate**: Required rules enforced (N > 0 blocks merge)

**Configuration Pattern**:
```yaml
# Approval rules
Approvals required: 2  # 0 = optional, >0 = required
Prevent editing approval rules in merge requests: true
Eligible approvers: Maintainer role or higher
Reset approvals on new commits: true
```

**Strength**: More granular role-based approval than GitHub

---

### 3. Gerrit Code Review (Most Rigorous)

**Architectural Enforcement**:
- Prevents pushing directly to `refs/heads/*` (bypasses review)
- Requires pushing to `refs/for/*` (creates review)
- Label-based approval system (Code-Review, Verified)
- Default policy: +2 Code-Review vote AND +1 Verified vote required
- -2 vote acts as absolute veto (cannot be overridden)

**How It Works**:
```
Developer pushes to: refs/for/main
   ↓
Gerrit creates change in staging area
   ↓
Change visible for review (cannot merge yet)
   ↓
Reviewer votes: +2 (approve), +1 (looks good), 0 (neutral), -1 (concerns), -2 (veto)
   ↓
Automated system votes: +1 Verified (CI passes)
   ↓
Only when ALL requirements met: Change can be submitted
   ↓
Gerrit applies change to codebase
```

**Bypass Prevention**:
- Pushing to `refs/heads/*` can be blocked entirely at server level
- No concept of "administrator override" without explicit permission grant
- All changes flow through review, no exceptions
- Label thresholds (e.g., +2) restricted to maintainers

**Used By**: Android, Chromium (historically), LLVM, many Google projects

**Strength**: Architectural design makes bypass structurally difficult

---

### 4. Google Chromium (Case Study: Preventing Bypass)

**2021 Enforcement Overhaul**:
- **Before**: Committers could self-review, OWNERS enforcement was presubmit check (bypassable)
- **After**: Gerrit-level enforcement, self-review impossible, OWNERS now security model

**Specific Measures**:
1. **Gerrit-enforced OWNERS**: No longer just presubmit, now hard requirement
2. **Rubber Stamper Bot limitations**: Provides code review OR OWNERS approval, never both (prevents silent reverts of security patches)
3. **TBR (To Be Reviewed) eliminated**: Previously allowed bypassing OWNERS, now blocked
4. **No self-review**: Cannot provide your own Code-Review+2

**Impact**: Eliminated abuse vectors where single person could land changes without oversight

**Quote from announcement**:
> "Beginning on March 24, 2021, committers of Chromium are no longer able to circumvent code review and OWNERS approval on CLs. Previously, these were circumventable by self-code-review and because the enforcement was done by presubmit. Now, Gerrit will disallow both bypasses."

---

### 5. Linux Kernel (Hierarchical Trust Model)

**Enforcement Approach**: Chain of trust, not technical gates

**Process**:
1. Patch submitted to subsystem maintainer (email + mailing list review)
2. Subsystem maintainer reviews, applies to their tree
3. During merge window, maintainer sends pull request to Linus Torvalds
4. Linus reviews pull request (trusts maintainer judgment)
5. If acceptable, Linus merges into mainline

**Key Stats** (kernel 2.6.38):
- 9,500 patches merged
- Linus directly selected: 112 (1.3%)
- Rest: reviewed and approved by subsystem maintainers

**Review Standards**:
- Code reviewed both before and after merging
- No matter developer's skill, review invariably finds improvements
- Social enforcement: reputation-based system

**Recent Requirements** (October 2024):
- Linus demanded better commit messages in pull requests
- Active, imperative voice required

**Bypass Prevention**:
- Linus is sole gatekeeper for mainline (single point of control)
- Sending patches directly to Linus is "not normally the right way to go"
- Maintainer responsibility creates accountability

**Strength**: Social enforcement + single gatekeeper
**Weakness**: Relies on human judgment, no technical enforcement

---

### 6. Kubernetes (Two-Phase Approval)

**OWNERS File System**:
- Designates responsibility over different parts of codebase
- Two distinct roles: **Reviewers** and **Approvers**

**Two-Phase Review Process**:
1. **Phase 1 - LGTM (Looks Good To Me)**:
   - Reviewer types `/lgtm` in PR comment
   - Checks: code quality, correctness, software engineering practices, style
   - Binding: triggers automation, adds `lgtm` label

2. **Phase 2 - Approve**:
   - Approver types `/approve` in PR comment
   - Requires OWNERS approval from each affected OWNERS file
   - Once all approvers comment `/approve`, prow (@k8s-ci-robot) adds `approved` label

**Important Behaviors**:
- Approver's `/lgtm` is simultaneously interpreted as `/approve`
- If PR has `/lgtm` and approver adds `/lgtm`, **PR merges automatically**
- Commands: `/lgtm cancel`, `/approve cancel`, `/hold` (blocks merging)

**Automation**: Prow bot manages workflow and automatically merges when conditions met

**Strength**: Clear separation between technical review (LGTM) and ownership approval
**Weakness**: Automation can merge too quickly if approver uses wrong command

---

### 7. LLVM Code Review Policy

**Requirements**:
- Smaller patches or patches where developer owns component can be committed **prior** to explicit review
- Must meet "likely community consensus" criteria
- All other changes require pre-commit review

**Exception Pattern**:
- Tests should be added in same CL as production code **unless CL is handling an emergency**
- Emergency changes: expedited review focused solely on "does this resolve the emergency?"

**Post-Emergency Process**:
- After emergency release, conduct regular/thorough code review
- Address issues noticed during emergency review that weren't fixed due to urgency

---

## Enforcement Pattern Analysis

### Pattern 1: Branch Protection + Required Reviewers

**Used By**: GitHub-based projects, GitLab projects
**Mechanism**: Platform prevents merge until N approvals received

**Strengths**:
- Easy to configure
- Visible to all developers
- Audit trail in PR history

**Weaknesses**:
- Administrators can disable temporarily
- Requires "Include administrators" setting enabled
- Emergency scenarios require human override

**Effectiveness**: 8/10 (strong when configured correctly)

---

### Pattern 2: Gerrit-Style Ref Restrictions

**Used By**: Chromium, Android, LLVM
**Mechanism**: Server-side restrictions on which refs can be pushed

**Strengths**:
- Architectural enforcement (cannot bypass without server access)
- All changes flow through staging area
- Label system provides granular control
- Veto votes (-2) provide safety valve

**Weaknesses**:
- Higher learning curve
- Requires Gerrit infrastructure
- Migration from GitHub-style PRs challenging

**Effectiveness**: 10/10 (strongest technical enforcement)

---

### Pattern 3: OWNERS File + Automation

**Used By**: Kubernetes, Chromium
**Mechanism**: Code ownership files define required approvers, bot enforces

**Strengths**:
- Scales to large codebases
- Distributes approval responsibility
- Automated assignment of reviewers
- Clear accountability

**Weaknesses**:
- OWNERS file maintenance overhead
- Bot misconfiguration can allow bypass
- Automation can merge too quickly (Kubernetes `/lgtm` from approver)

**Effectiveness**: 8/10 (strong for large projects with clear ownership)

---

### Pattern 4: Pre-commit Hooks + CI/CD Gates

**Used By**: Many projects as supplementary enforcement
**Mechanism**: Hooks block commits locally, CI fails if hooks not run

**Strengths**:
- Fast feedback (local)
- Catches issues before CI/CD
- Developer-friendly

**Weaknesses**:
- Easily bypassed: `git commit --no-verify`
- Not enforceable for malicious actors
- Must duplicate in CI/CD for real enforcement

**Effectiveness**: 3/10 (guidance only, not enforcement)

---

### Pattern 5: Hierarchical Trust (Linux Kernel)

**Used By**: Linux kernel, some large open-source projects
**Mechanism**: Maintainer chain of trust, social pressure, reputation

**Strengths**:
- Scales to massive contributor base
- Maintainer accountability
- Flexible for different subsystems

**Weaknesses**:
- No technical enforcement
- Relies on human judgment
- Bottleneck at top (Linus)
- Difficult to audit systematically

**Effectiveness**: 7/10 (works for unique social structure of kernel development)

---

## Exception Handling Patterns

### Valid Exceptions (Commonly Accepted)

1. **Emergency hotfixes** (production down, security breach)
   - **Approach**: Allow bypass with audit trail
   - **Post-merge**: Mandatory retrospective review
   - **Tools**: PullApprove "emergency" label, temporary branch protection disable

2. **Documentation-only changes** (README, comments, docs/)
   - **Approach**: Reduced review requirements (1 instead of 2 approvers)
   - **Rationale**: Lower risk, faster iteration
   - **Caveat**: Still require review (typos, technical accuracy)

3. **Automated tool commits** (Dependabot, formatters, code generation)
   - **Approach**: Auto-merge with verified automation
   - **Requirements**: Passing CI/CD, limited scope
   - **Risk**: Can introduce vulnerabilities if automation compromised

4. **Reverts of bad commits**
   - **Approach**: Original author can revert without review (time-sensitive)
   - **Chromium approach**: Rubber Stamper provides review BUT NOT OWNERS approval (prevents silent security patch reverts)

5. **Cherry-picks to release branches**
   - **Approach**: Reduced review if already reviewed in main branch
   - **Requirements**: Link to original PR, passing tests

### Invalid Exceptions (Should Always Require Review)

1. **"I'm the only one who knows this code"** - Knowledge silos are technical debt
2. **"This is too urgent for review"** - Unless production is down, it can wait 30 minutes
3. **"This is a trivial change"** - Trivial changes cause non-trivial bugs
4. **"I'll get review after merging"** - Never happens in practice
5. **"I tested it locally"** - Not a substitute for peer review

---

## Bypass Prevention Strategies

### 1. Technical Enforcement

**Most Effective**:
- Gerrit ref restrictions (cannot push to protected refs)
- Branch protection with "Do not allow bypassing" + "Include administrators"
- CODEOWNERS enforcement with required approval

**Less Effective**:
- Pre-commit hooks (can use `--no-verify`)
- CI/CD checks without branch protection
- Policy documentation

### 2. Self-Approval Prevention

**Platform Defaults**:
- **GitHub**: PR authors cannot approve their own PRs (built-in)
- **GitLab**: Configurable, enable "Prevent author approval"
- **Gerrit**: Cannot provide +2 to your own change (built-in)

**Additional Safeguards**:
- "Require approval from someone other than the last pusher" (prevents commit-then-approve)
- GitHub Action to check if approver is also committer on PR
- Minimum 2 approvers (ensures diversity of review)

### 3. Audit Trail Requirements

**Best Practices**:
- Log all branch protection overrides
- Require justification in audit log (ticket number, incident link)
- Alert security team on bypass
- Weekly review of bypass events
- Compliance integration (SOC 2, ISO 27001)

**Tools**:
- GitHub Audit Log API
- GitLab Audit Events
- Gerrit system logs
- Custom webhooks to SIEM

### 4. Emergency Access Patterns

**"Break Glass" Approach**:
1. Normal flow: Branch protection enabled, no bypasses
2. Emergency: Admin temporarily disables protection (logged)
3. Fix merged with emergency label/tag
4. Protection re-enabled immediately
5. Post-incident review within 24 hours
6. Retrospective review of emergency fix within 48 hours

**Chromium Pattern** (No Break Glass):
- Rubber Stamper bot provides review for reverts
- Still requires OWNERS approval (prevents security patch reverts)
- No mechanism to bypass OWNERS completely

### 5. Organization-Level Policies

**Hierarchy of Control**:
1. Organization rules (most restrictive)
2. Repository rules (inherits org rules)
3. Branch protection (inherits repo rules)
4. Result: Most restrictive setting wins

**Example**:
- Org requires 1 approval
- Repo requires 2 approvals
- Branch requires 3 approvals
- **Effective requirement: 3 approvals** (most restrictive)

---

## Common Bypass Loopholes and Closures

### Loophole 1: Administrator Override

**How It Works**: Admin permissions allow disabling branch protection temporarily

**Closure**:
- Enable "Include administrators" in branch protection
- Enable "Do not allow bypassing the above settings"
- Create custom role with limited bypass permissions (not full admin)
- Audit and alert on protection changes

**Effectiveness**: High (but cannot prevent determined insider threat)

---

### Loophole 2: Self-Review

**How It Works**: Author approves their own PR (if platform allows)

**Closure**:
- Platform default: GitHub disables self-approval
- GitLab: Enable "Prevent author approval"
- Gerrit: Cannot +2 your own change (architectural)
- Add "Require approval from someone other than the last pusher"

**Effectiveness**: Very high (easily closed by configuration)

---

### Loophole 3: Pre-commit Hook Bypass

**How It Works**: `git commit --no-verify` skips hooks

**Closure**:
- Duplicate all pre-commit checks in CI/CD
- Make CI/CD checks required status checks
- Branch protection requires status checks to pass
- Pre-commit becomes developer convenience, CI is enforcement

**Effectiveness**: High (requires defense in depth)

---

### Loophole 4: TBR (To Be Reviewed) Abuse

**How It Works**: Developer commits with TBR flag, review never happens

**Closure**:
- Chromium: Eliminated TBR entirely in 2021 overhaul
- Alternative: Allow TBR but require review within 24 hours, automation reverts if not reviewed
- Better: Remove TBR, use draft PRs for work-in-progress

**Effectiveness**: High (requires removing feature)

---

### Loophole 5: Rubber Stamp Reviews

**How It Works**: Reviewer approves without actually reviewing

**Closure** (Hard Problem):
- Social: Code review training, review quality metrics
- Technical: Require minimum time between PR creation and approval (e.g., 1 hour)
- LGTM + Approve separation (Kubernetes pattern): different people for different checks
- Review depth metrics (comments per line changed)

**Effectiveness**: Medium (mostly social problem, hard to enforce technically)

---

### Loophole 6: Stale Approvals

**How It Works**: PR approved, then author adds more commits, merges without re-review

**Closure**:
- Enable "Dismiss stale pull request approvals when new commits are pushed"
- Require fresh approval after each push
- Gerrit: New patchset resets all votes

**Effectiveness**: Very high (easily closed by configuration)

---

### Loophole 7: GitHub Actions as Reviewers

**How It Works**: GitHub Action approves PR (2021 vulnerability)

**Closure**:
- Organization settings: Disallow Actions from approving pull requests
- GitHub Actions cannot be listed in CODEOWNERS (architectural)
- Use Actions for checks (status checks), not approvals

**Effectiveness**: High (closed by GitHub in 2021)

---

### Loophole 8: Direct Push to Protected Branch

**How It Works**: Force push or direct push if protections not configured

**Closure**:
- Enable "Require a pull request before merging"
- Restrict push permissions to branch
- Gerrit: Block `refs/heads/*` entirely, only allow `refs/for/*`

**Effectiveness**: Very high (architectural enforcement)

---

## Language Patterns That Prevent Rationalization

### Strong Language (Mandatory)

1. "MUST always" (not "should")
2. "Before ANY merge" (not "before most merges")
3. "Without exception" (explicitly state no exceptions)
4. "This is a blocking requirement" (clarify consequences)
5. "If X is not met, Y will not happen" (cause and effect)

### Example: Weak vs Strong

**Weak**:
> "It's a good practice to get code review before merging."

**Strong**:
> "ALL code changes MUST receive approval from at least one other developer before merging. This is a blocking requirement. PRs without approval CANNOT be merged."

---

### Explicit Exception Handling

**Pattern**:
```
RULE: [Mandatory requirement]
EXCEPTIONS: [Explicitly enumerated list]
EXCEPTION PROCESS: [How to request exception]
EXCEPTION APPROVAL: [Who can approve exception]
EXCEPTION AUDIT: [How exceptions are tracked]
```

**Example**:
> RULE: All production code changes MUST be reviewed by at least one developer who did not author the change.
>
> EXCEPTIONS:
> 1. Emergency hotfixes when production is down (P0 incidents)
> 2. Reverts of commits merged within last 24 hours
>
> EXCEPTION PROCESS:
> 1. Tag PR with "emergency" label
> 2. Merge with override (creates audit trail)
> 3. Post-incident review within 24 hours
> 4. Retrospective full review within 48 hours
>
> EXCEPTION APPROVAL: Engineering Director or on-call Principal Engineer
>
> EXCEPTION AUDIT: All exceptions reviewed in weekly engineering meeting

---

### Preventing Common Rationalizations

**Rationalization**: "This is too trivial to review"
**Prevention**: "No change is too trivial for review. Trivial changes have caused production incidents."

**Rationalization**: "I'm the expert, no one else can review"
**Prevention**: "Expert status does not exempt from review. Review is for catching blind spots, not testing expertise."

**Rationalization**: "We're too busy for review"
**Prevention**: "Review is not optional based on workload. If too busy for review, too busy to merge safely."

**Rationalization**: "I'll get review after merging"
**Prevention**: "Post-merge review is not acceptable. Review MUST occur before merge, without exception."

**Rationalization**: "The tests pass, that's enough"
**Prevention**: "Passing tests are necessary but not sufficient. Human review is required for all code changes."

---

### Verification Language

**Pattern**: "Before claiming [X], you must verify [Y]"

**Examples**:
- "Before claiming code is ready to merge, you must verify that approval has been granted."
- "Before marking task complete, you must verify that code review has occurred."
- "Before creating PR, you must verify that all tests pass."

---

### Consequence Language

**Pattern**: "If [X] is not done, [Y] will not happen"

**Examples**:
- "If code review is not completed, the PR will not be merged."
- "If approval is not granted, the build will fail."
- "If exceptions are not documented, the override will be rejected."

---

## Recommendations for Wrangler

### 1. Strengthen Language in `requesting-code-review` Skill

**Current Problem**: Skill uses suggestive language ("should", "consider")

**Recommended Changes**:

**Section 1: When Code Review Is MANDATORY**
```markdown
## When Code Review Is MANDATORY

Code review is MANDATORY (not optional, not suggested) for:

1. **ALL production code changes** - without exception
2. **ALL test code changes** - tests guard correctness
3. **ALL configuration changes** - configs control behavior
4. **ALL infrastructure changes** - affects deployments
5. **ALL database migrations** - affects data integrity

Code review is OPTIONAL ONLY for:

1. **Documentation-only changes** (README.md, docs/, comments) - but still recommended
2. **Whitespace/formatting changes** - if automated tool verified them

Note: "Documentation-only" means ZERO code changes. If code and docs change together, review is MANDATORY.
```

**Section 2: Emergency Exception Process**
```markdown
## Emergency Exceptions (Rare)

If production is down (P0 incident), you MAY merge without review IF AND ONLY IF:

1. **Tag PR with "emergency" label** - creates audit trail
2. **Incident ticket linked in PR** - justification documented
3. **Post-incident review within 24 hours** - MANDATORY, not optional
4. **Retrospective full review within 48 hours** - address issues found

What constitutes P0 (production down):
- Revenue-generating functionality broken
- Security breach in progress
- Data loss occurring
- Service completely unavailable

What does NOT constitute P0:
- Feature not working as expected (that's P1)
- Performance degradation (that's P1)
- Non-critical bug (that's P2+)
- "This is really important to the CEO" (escalate, but still get review)

IMPORTANT: Emergency exceptions should be <1% of all merges. If >5%, your development process is broken.
```

**Section 3: Verification Requirements**
```markdown
## Verification Before Completion

Before claiming code review is complete, you MUST verify:

1. **At least one approval from a developer who did not author the code**
   - Run: `gh pr view [PR-NUMBER] --json reviews`
   - Verify: "state": "APPROVED" exists
   - Verify: Approver != PR author

2. **All review comments addressed**
   - Run: `gh pr view [PR-NUMBER] --json comments`
   - Verify: No unresolved threads
   - If unresolved threads exist: Address them, request re-review

3. **Branch protection requirements met**
   - Run: `gh pr checks [PR-NUMBER]`
   - Verify: All required status checks passed
   - Verify: Required approvals count met

4. **No force pushes after approval**
   - Check: PR timeline for force push events
   - If force pushed after approval: Request re-approval

DO NOT claim code review is complete until ALL verifications pass.
```

---

### 2. Create New Skill: `code-review-enforcement`

**Purpose**: Validate that code review requirements are met before merge

**File**: `skills/collaboration/code-review-enforcement/SKILL.md`

**Content**:
```markdown
---
name: code-review-enforcement
category: collaboration
description: Validates code review requirements are met before merge
required_when: Before any PR merge, before marking implementation complete
skill_version: 1.0.0
---

# Code Review Enforcement

## Purpose

This skill provides systematic validation that code review requirements have been met before merging code. Use this skill IMMEDIATELY BEFORE merging any pull request.

## When to Use This Skill

MANDATORY before:
- Merging any pull request
- Marking any implementation task as complete
- Claiming "code review is done"

Do NOT skip this skill. If you're about to merge, you MUST run these checks first.

## Enforcement Checklist

Run the following checks IN ORDER. If any check fails, STOP and address the issue before proceeding.

### Check 1: Approval Received

**Command**:
```bash
gh pr view [PR-NUMBER] --json reviews,author --jq '{author: .author.login, reviews: [.reviews[] | {reviewer: .author.login, state: .state}]}'
```

**Validation**:
- At least one review with "state": "APPROVED"
- Approver is NOT the same as PR author
- If approval state is "CHANGES_REQUESTED" or "COMMENTED" only: FAIL

**Failure Action**:
- Request review from appropriate team member
- Wait for approval before proceeding
- Do NOT self-approve
- Do NOT merge without approval

### Check 2: Review Freshness

**Command**:
```bash
gh pr view [PR-NUMBER] --json commits,reviews --jq '{last_commit: .commits[-1].committedDate, last_review: (.reviews | sort_by(.submittedAt) | .[-1].submittedAt)}'
```

**Validation**:
- Last review timestamp is AFTER last commit timestamp
- If commits pushed after approval: approval is stale, FAIL

**Failure Action**:
- Request re-review from original approver
- Explain: "New commits pushed after approval, please re-review"
- Wait for fresh approval

### Check 3: Required Status Checks

**Command**:
```bash
gh pr checks [PR-NUMBER]
```

**Validation**:
- All required checks show: "pass" or "success"
- No checks show: "fail", "error", "cancelled"
- All required checks have completed (not "pending")

**Failure Action**:
- Fix failing tests/checks
- Re-push code
- Return to Check 1 (approval may be stale after new commits)

### Check 4: Review Comments Resolved

**Command**:
```bash
gh pr view [PR-NUMBER] --json reviewThreads --jq '.reviewThreads | map(select(.isResolved == false)) | length'
```

**Validation**:
- Result is 0 (no unresolved threads)
- If result > 0: unresolved review comments exist, FAIL

**Failure Action**:
- Address each unresolved comment
- Push fixes or respond with explanation
- Request re-review if code changed
- Reviewer must mark thread as resolved

### Check 5: Branch Protection Status

**Command**:
```bash
gh api repos/{owner}/{repo}/branches/{branch}/protection --jq '{required_reviews: .required_pull_request_reviews.required_approving_review_count, enforce_admins: .enforce_admins.enabled, required_status_checks: [.required_status_checks.contexts[]]}'
```

**Validation**:
- If branch protection enabled: all requirements met
- If enforce_admins: false: WARNING (admins can bypass)

**Failure Action**:
- If protection disabled: Enable branch protection
- If requirements not met: Complete missing requirements
- If enforce_admins false: Consider enabling (prevents admin bypass)

### Check 6: Exception Justification (if skipping review)

**If any checks above were bypassed**:

MANDATORY documentation in PR description:
- [X] Emergency exception (P0 incident)
- [X] Incident ticket: [LINK]
- [X] Approved by: [NAME] [ROLE]
- [X] Post-incident review scheduled: [DATE]

**Validation**:
- All checkboxes checked
- Incident ticket exists and confirms P0 severity
- Approver has authority (Engineering Director or Principal Engineer)
- Post-incident review scheduled within 24 hours

**Failure Action**:
- If not P0: STOP, get proper review, do not bypass
- If P0 but missing documentation: Add documentation before proceeding
- If P0 but no approval: Get emergency approval on record first

## Final Verification

Before marking code review as complete, state explicitly:

"Code review enforcement checks completed:
- [X] Approval received from: [REVIEWER NAME]
- [X] Approval is fresh (after last commit)
- [X] Required status checks passed
- [X] Review comments resolved
- [X] Branch protection requirements met
- [ ] Exception documented (if applicable)

Code review is VERIFIED COMPLETE. Proceeding with merge."

## Common Failure Modes

### Failure Mode 1: "I can't find a reviewer"

**Symptoms**: No one available to review, tempted to skip

**Correct Action**:
- Check CODEOWNERS file for appropriate reviewer
- Post in team channel requesting review
- If truly urgent: Escalate to team lead
- If no one available: Wait (code can wait, bugs cannot be unshipped)

**Incorrect Action**:
- Self-approving (if platform allows)
- Merging without review
- Claiming "I'll get review later"

### Failure Mode 2: "This is too trivial for review"

**Symptoms**: One-line change, whitespace only, "obvious" fix

**Correct Action**:
- Request review anyway (takes 2 minutes for reviewer)
- Trivial changes have caused production incidents
- Fast review != no review

**Incorrect Action**:
- Skipping review because "it's trivial"
- Self-approving
- Merging without approval

### Failure Mode 3: "Reviewer is slow, I'm blocked"

**Symptoms**: PR open for hours, no review yet, need to move forward

**Correct Action**:
- Ping reviewer in PR comment
- If urgent: DM reviewer directly
- If truly blocked: Work on different task
- If reviewer unavailable: Find alternate reviewer

**Incorrect Action**:
- Merging without review
- Self-approving
- Force-pushing after approval to bypass freshness check

### Failure Mode 4: "I pushed a tiny fix after approval"

**Symptoms**: Approval received, then pushed one-line fix, tempted to merge

**Correct Action**:
- Request re-review, even for one line
- Explain in comment: "Pushed one-line fix for [X], please re-review"
- Wait for fresh approval

**Incorrect Action**:
- Merging with stale approval (freshness check fails)
- Claiming "it's too small to matter"
- Force-pushing to hide the new commit (audit trail violation)

## Anti-Patterns

### Anti-Pattern 1: Post-Merge Review

**What it looks like**:
- "I'll merge now and get review later"
- "We can review this after it's in prod"
- "Let's merge and file a follow-up issue for review"

**Why it's wrong**:
- Post-merge review never happens in practice
- Bugs shipped to prod are expensive to fix
- Bypasses entire purpose of review

**Correct approach**: Review BEFORE merge, always

### Anti-Pattern 2: Rubber Stamp Review

**What it looks like**:
- Reviewer approves in 10 seconds for 500-line PR
- Reviewer comments "LGTM" with no specific feedback
- Reviewer didn't actually read the code

**Why it's wrong**:
- Defeats purpose of review (finding issues)
- Creates false sense of security
- Review quality matters, not just approval checkmark

**Correct approach**: If reviewer didn't read code, find different reviewer

### Anti-Pattern 3: Self-Approval Gaming

**What it looks like**:
- Creating second account to review own PRs
- Asking colleague to approve without looking
- "I reviewed my own code, that counts"

**Why it's wrong**:
- Violates spirit of independent review
- Author has blind spots that author cannot see
- Security and compliance violation

**Correct approach**: Get genuine review from someone who will find issues

## Integration with Other Skills

**Before using this skill**:
- `requesting-code-review` - How to request review properly

**After using this skill**:
- `verification-before-completion` - Final checks before marking task done

**Related skills**:
- `receiving-code-review` - How to respond to feedback
- `systematic-debugging` - If review finds issues, debug systematically

## Skill Metadata

- **Skill Type**: Verification
- **Phase**: Pre-merge validation
- **Frequency**: Every PR merge
- **Bypass Allowed**: Only for P0 incidents with documented exception
- **Estimated Time**: 2-5 minutes
- **Prerequisites**: PR created, code pushed, review requested
```

---

### 3. Update `verification-before-completion` Skill

**Add to checklist**:
```markdown
## Code Review Verification

Before marking any implementation task complete:

- [ ] Run `wrangler:code-review-enforcement` skill
- [ ] Verify all checks passed
- [ ] Verify PR has been merged (not just approved)
- [ ] Verify merge commit exists in target branch

**Commands**:
```bash
# Verify PR merged
gh pr view [PR-NUMBER] --json state,mergedAt --jq '{state: .state, merged_at: .mergedAt}'

# Verify merge commit in branch
git log origin/main --oneline --grep="Merge pull request #[PR-NUMBER]" -n 1
```

**Expected Results**:
- state: "MERGED" (not "OPEN" or "CLOSED")
- merged_at: [timestamp] (not null)
- Merge commit found in branch history

If any verification fails: Task is NOT complete.
```

---

### 4. Add Branch Protection Verification to Session Hooks

**File**: `hooks/session-start.sh`

**Add before initialization complete**:
```bash
# Check branch protection on main branch
echo "Checking branch protection settings..."

if command -v gh &> /dev/null; then
  REPO_INFO=$(gh repo view --json nameWithOwner -q '.nameWithOwner')

  if [ -n "$REPO_INFO" ]; then
    PROTECTION=$(gh api repos/$REPO_INFO/branches/main/protection 2>/dev/null)

    if [ $? -eq 0 ]; then
      # Branch protection exists, check settings
      REQUIRED_REVIEWS=$(echo "$PROTECTION" | jq -r '.required_pull_request_reviews.required_approving_review_count // 0')
      ENFORCE_ADMINS=$(echo "$PROTECTION" | jq -r '.enforce_admins.enabled // false')

      if [ "$REQUIRED_REVIEWS" -lt 1 ]; then
        echo "WARNING: Branch protection enabled but requires 0 approvals"
        echo "  Recommendation: Set required approving reviews to at least 1"
      fi

      if [ "$ENFORCE_ADMINS" = "false" ]; then
        echo "WARNING: Branch protection does not enforce for administrators"
        echo "  Recommendation: Enable 'Include administrators' to prevent bypass"
      fi

      echo "Branch protection: $REQUIRED_REVIEWS required reviews, enforce_admins=$ENFORCE_ADMINS"
    else
      echo "WARNING: No branch protection found on main branch"
      echo "  Recommendation: Enable branch protection with required reviews"
    fi
  fi
fi
```

---

### 5. Create Governance Policy Document

**File**: `.wrangler/governance/_CODE_REVIEW_POLICY.md`

**Content**:
```markdown
---
title: Code Review Policy
type: governance
version: 1.0.0
status: active
---

# Code Review Policy

## Policy Statement

ALL code changes merged into protected branches MUST receive approval from at least one developer who did not author the code. This policy is mandatory and non-negotiable except for documented emergencies.

## Scope

This policy applies to:
- All production code (application logic, libraries, services)
- All test code (unit tests, integration tests, E2E tests)
- All configuration files (CI/CD, infrastructure, deployment)
- All database migrations (schema changes, data migrations)
- All build scripts (Makefiles, build configs, Docker files)

This policy does NOT apply to:
- Documentation-only changes (README.md, docs/ directory, inline comments) - review recommended but optional
- Automated tool commits (Dependabot, code formatters, generated code) - if verified by CI/CD

## Requirements

### Minimum Requirements (All PRs)

1. **One Approval Required**:
   - At least one developer who did not author the code must approve
   - Approver must have read and understood the changes
   - Self-approval is not permitted

2. **Fresh Approval Required**:
   - Approval must be AFTER the most recent commit
   - If commits pushed after approval, re-approval required
   - Force pushing to hide new commits is prohibited

3. **All Comments Resolved**:
   - Reviewer must mark all comment threads as resolved
   - If changes requested, author must address before merge
   - "Will fix in follow-up PR" is not acceptable

4. **Required Checks Passed**:
   - All CI/CD checks must pass
   - All tests must pass
   - All linting and formatting checks must pass
   - No failing required status checks permitted

### Enhanced Requirements (High-Risk PRs)

PRs that meet ANY of the following criteria require TWO approvals:
- Changes to authentication or authorization logic
- Changes to payment processing or financial calculations
- Changes to database migrations affecting production data
- Changes to security-sensitive code (crypto, secrets management, access control)
- PRs larger than 500 lines of code (excluding tests and generated code)

## Emergency Exception Process

### When Emergency Exception is Permitted

An emergency exception to bypass code review is permitted ONLY when ALL of the following are true:

1. **P0 Incident**: Production is down or security breach in progress
   - Revenue-generating functionality completely broken
   - Data loss actively occurring
   - Service completely unavailable (not degraded, unavailable)
   - Active security breach requiring immediate patching

2. **Time-Critical**: Every minute of delay causes significant harm
   - Customer impact: revenue loss, data loss, security exposure
   - Not applicable for: "CEO wants this today", "customer demo tomorrow"

3. **No Reviewer Available**: Genuine inability to get timely review
   - All on-call engineers pinged, no response
   - Escalation to engineering leadership attempted
   - Not applicable if: reviewer available within 30 minutes

### Emergency Exception Process

If emergency exception is necessary:

1. **Before Merge**:
   - Add "emergency" label to PR
   - Document in PR description:
     - Incident ticket link
     - Severity justification (why P0)
     - Why reviewer not available
     - Emergency approver name and role
   - Get emergency approval from Engineering Director or on-call Principal Engineer
   - Merge with override (creates audit trail)

2. **Within 24 Hours**:
   - Create post-incident review ticket
   - Conduct incident retrospective
   - Determine if emergency process was correctly followed
   - Identify improvements to prevent future emergencies

3. **Within 48 Hours**:
   - Conduct full code review of emergency merge
   - Create follow-up PRs for any issues found
   - Update documentation if needed
   - Close incident review ticket

### Emergency Exception Audit

- All emergency exceptions logged in monthly engineering metrics
- Target: <1% of merges use emergency exception
- If >5% of merges are emergencies: development process is broken, investigate root cause
- Emergency exceptions reviewed in weekly engineering meeting

## Enforcement

### Technical Enforcement

Branch protection is configured as follows:

```yaml
Branch: main (and all release/* branches)
- Require a pull request before merging: YES
- Required approving reviews: 1 (2 for high-risk)
- Dismiss stale pull request approvals when new commits are pushed: YES
- Require review from Code Owners: YES (if CODEOWNERS file exists)
- Require approval from someone other than the last pusher: YES
- Require status checks to pass before merging: YES
  - Required checks: CI tests, lint, format check, security scan
  - Require branches to be up to date before merging: YES
- Require conversation resolution before merging: YES
- Include administrators: YES
- Do not allow bypassing the above settings: YES
```

### Verification Process

Before any merge, the `wrangler:code-review-enforcement` skill MUST be run to verify:
1. Approval received from non-author
2. Approval is fresh (after last commit)
3. Required status checks passed
4. Review comments resolved
5. Branch protection requirements met
6. Exception documented (if applicable)

### Compliance Monitoring

- Weekly audit of merged PRs
- Random sampling of 10% of merges
- Verify all policy requirements met
- Report violations to engineering leadership

## Consequences of Violation

### Unintentional Violations

If developer accidentally bypasses review due to misconfiguration:
1. Revert the merge immediately
2. Create new PR with proper review
3. Fix branch protection configuration
4. Document incident in post-mortem

### Intentional Violations

If developer deliberately bypasses review without valid emergency:
1. Revert the merge immediately
2. Required code review training
3. Escalation to engineering leadership
4. Potential disciplinary action

### Pattern of Violations

If team/individual shows pattern of violations (3+ in 90 days):
1. Mandatory process improvement plan
2. Additional oversight required
3. Loss of merge permissions (temporary)
4. Escalation to engineering director

## Frequently Asked Questions

### Q: What if I'm the only person who knows this code?

A: This indicates a knowledge silo problem (technical debt). Request review from anyone on the team - they will learn and provide fresh perspective. Knowledge silos are not valid exceptions.

### Q: What if this is a critical bug fix and no one is available?

A: If not P0, it can wait for review (even high-priority bugs). If P0 (production down), follow emergency exception process. "Critical" is not the same as "emergency."

### Q: What if the reviewer is taking too long?

A: Ping the reviewer, escalate if needed, or find alternate reviewer. Slow review is not valid reason to skip review. Set expectations: reviews should happen within 4 business hours.

### Q: Can I merge and get review afterward?

A: No. Post-merge review never happens in practice and defeats the purpose of catching issues before production. Review BEFORE merge, always.

### Q: What if I just pushed a tiny fix after approval?

A: Request re-review, even for one line. Approvals must be fresh (after last commit). "Too small to matter" has caused production incidents.

### Q: What if this change is too trivial to review?

A: No change is too trivial. One-line changes have caused production incidents. If truly trivial, review will take 2 minutes. Fast review != no review.

## Policy Review

This policy is reviewed annually or after significant incidents. Proposed changes require:
- Engineering Director approval
- Review by at least 3 senior engineers
- Comment period for all engineers (2 weeks)
- Constitutional alignment check

Last reviewed: [DATE]
Next review: [DATE + 1 year]
Policy owner: Engineering Director
```

---

## Summary of Recommendations

### Immediate Actions (High Impact, Low Effort)

1. **Update `requesting-code-review` skill** with mandatory language and explicit exceptions
2. **Create `code-review-enforcement` skill** for pre-merge validation
3. **Update `verification-before-completion` skill** to reference enforcement skill
4. **Add branch protection check to session hooks** to warn about misconfigurations

### Medium-Term Actions (High Impact, Medium Effort)

5. **Create governance policy document** in `.wrangler/governance/_CODE_REVIEW_POLICY.md`
6. **Update all collaboration skills** to reference mandatory review requirements
7. **Add pre-merge checklist template** to PR templates

### Long-Term Actions (Medium Impact, High Effort)

8. **Create automated compliance checking** (weekly audit of merged PRs)
9. **Build enforcement metrics dashboard** (% of PRs with proper review)
10. **Develop review quality metrics** (time to review, comments per line, etc.)

---

## Conclusion

The most effective code review enforcement combines:

1. **Technical enforcement** (branch protection, Gerrit-style restrictions)
2. **Process enforcement** (skills that verify requirements before merge)
3. **Clear policy** (explicit rules with enumerated exceptions)
4. **Audit trail** (all bypasses logged and reviewed)
5. **Strong language** (mandatory, not suggestive)

Wrangler should adopt patterns from Chromium (strongest technical enforcement), Kubernetes (clear two-phase process), and GitHub best practices (comprehensive branch protection).

Key insight: **Prevention is architectural, not aspirational.** Successful enforcement requires making bypasses difficult through system design, not relying on developer discipline alone.

---

## References

- GitHub Branch Protection: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches
- GitLab Merge Request Approvals: https://docs.gitlab.com/user/project/merge_requests/approvals/
- Gerrit Code Review: https://gerrit-review.googlesource.com/Documentation/
- Chromium Code Review: https://chromium.googlesource.com/chromium/src/+/main/docs/code_review_owners.md
- Kubernetes OWNERS: https://www.kubernetes.dev/docs/guide/owners/
- Linux Kernel Process: https://docs.kernel.org/process/2.Process.html
- LLVM Code Review: https://llvm.org/docs/CodeReview.html

---

**Research conducted**: 2025-11-20
**Researcher**: Claude (Sonnet 4.5)
**For**: Wrangler Project Governance Improvements
