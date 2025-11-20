# Testing Skills Analysis: Gaps, Strengths, and Recommendations

**Date**: November 20, 2025
**Reviewer**: Claude Code Analysis Agent
**Scope**: test-driven-development, testing-anti-patterns, run-the-tests, condition-based-waiting

## Executive Summary

The wrangler testing skills are **exceptionally strong for backend/unit testing** but have **critical gaps in frontend, E2E, and user behavior testing**. While enforcement mechanisms are robust for the TDD cycle, there are notable weaknesses in ensuring tests actually run and verify comprehensive behavior before completion claims.

**Key Findings:**
- TDD skill has excellent enforcement language but lacks verification that tests were actually executed
- No skills exist for frontend/UI testing (visual regression, accessibility, user interactions)
- No skills exist for E2E testing workflows
- Anti-patterns skill is strong but missing modern frontend testing pitfalls
- condition-based-waiting is excellent but narrow in scope (async timing only)

**Priority Recommendations:**
1. Create "comprehensive-test-coverage" skill to fill the "what to test" gap
2. Create "frontend-testing" skill covering user behavior, visual testing, accessibility
3. Create "e2e-testing" skill with framework-agnostic patterns
4. Enhance verification-before-completion to mandate test execution evidence
5. Add frontend anti-patterns to testing-anti-patterns skill

---

## 1. Test-Driven Development (TDD) Skill

**File**: `/Users/sam/code/wrangler/skills/test-driven-development/SKILL.md`

### What It Does Well

#### 1.1 Uncompromising Enforcement Language

The skill uses **absolute language** that leaves no room for rationalization:

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
Write code before the test? Delete it. Start over.
NO EXCEPTIONS
```

This is **excellent**. The skill doesn't say "prefer" or "consider" - it says "delete means delete."

#### 1.2 Comprehensive Rationalization Coverage

The skill anticipates **11 common rationalizations** and directly refutes them:

| Rationalization | Counter-Argument |
|----------------|------------------|
| "Too simple to test" | "Simple code breaks. Test takes 30 seconds." |
| "I'll test after" | "Tests passing immediately prove nothing." |
| "Already manually tested" | "Ad-hoc ≠ systematic. No record, can't re-run." |
| "Deleting X hours is wasteful" | "Sunk cost fallacy. Keeping unverified code is technical debt." |
| "It's about spirit not ritual" | "Tests-after answer 'What does this do?' Tests-first answer 'What should this do?'" |

This is **outstanding prevention design** - it names the exact excuses an LLM might generate and preemptively blocks them.

#### 1.3 Clear Red-Green-Refactor Process

The skill provides:
- Visual flowchart (dot syntax)
- Step-by-step verification requirements
- Specific commands to run
- Expected outcomes at each stage

This makes it **actionable and verifiable**.

#### 1.4 Good vs. Bad Examples

Each principle includes concrete code examples showing:
- What good tests look like (minimal, clear, real code)
- What bad tests look like (vague names, testing mocks)

### Gaps and Weaknesses

#### 1.5 No Verification That Tests Actually Run

**CRITICAL GAP**: The skill says "Watch it fail" and "Watch it pass" but doesn't enforce that the agent actually executes the test command and examines output.

**Problem Example:**
```
Agent writes test
Agent says: "I'll now watch it fail as required by TDD"
Agent writes implementation
Agent says: "Tests pass"
```

**Missing**: Evidence that `npm test` or `pytest` was actually executed. The skill trusts the agent to follow instructions but doesn't require proof.

**Impact**: An LLM could claim to follow TDD while skipping the verification steps entirely.

#### 1.6 No Guidance on "How Much Testing is Enough"

The skill says:
```
- [ ] Every new function/method has a test
- [ ] Edge cases and errors covered
```

But it doesn't define:
- What constitutes "edge cases"? (null, undefined, empty, negative, overflow, etc.)
- What is an appropriate number of test cases per function?
- When to test error paths vs. happy paths?

**Impact**: Agent might write ONE test per function (minimal compliance) and claim TDD was followed.

#### 1.7 Limited Scope: Unit Tests Only

The skill focuses exclusively on **unit testing**. It doesn't address:
- Integration tests (testing multiple components together)
- E2E tests (testing full user workflows)
- Visual regression tests (frontend UI testing)
- Accessibility tests (a11y compliance)
- Performance tests (load, stress, timing)

**Impact**: Agent might TDD a function perfectly but never test that it works in the actual application.

#### 1.8 No Framework-Specific Guidance

While the skill is framework-agnostic (good for portability), it doesn't provide:
- Best practices for React Testing Library (avoid testing implementation details)
- Playwright/Cypress patterns (page objects, test isolation)
- Mock service workers (MSW) for API mocking
- Database testing strategies (in-memory DB, fixtures, factories)

**Impact**: Agent might apply backend TDD patterns to frontend code incorrectly (e.g., mocking DOM instead of using real components).

#### 1.9 Missing: "What Real User Behavior Looks Like"

The skill doesn't emphasize:
- Tests should simulate real user interactions (clicks, form fills, navigation)
- Tests should verify user-visible outcomes (text appears, buttons enable, errors show)
- Tests should avoid implementation details (internal state, method calls)

**Impact**: Tests might verify code works technically but not that it delivers correct user experience.

### Specific Recommendations

#### Recommendation 1.1: Mandate Test Execution Evidence

**Add to "Verify RED - Watch It Fail" section:**

```markdown
**MANDATORY VERIFICATION:**

Before proceeding to GREEN phase:

1. Execute test command (npm test, pytest, etc.)
2. Copy full output showing test failure
3. Verify failure message matches expected reason:
   - ✅ CORRECT: "function retryOperation is not defined"
   - ❌ WRONG: "TypeError: Cannot read property 'X' of undefined" (syntax error)
4. If output doesn't match expected failure, fix test and re-run

**You must include test output in your message.** Claims without evidence violate verification-before-completion.
```

**Example of what agent MUST provide:**
```
Running: npm test -- retry.test.ts

FAIL tests/retry.test.ts
  ✕ retries failed operations 3 times (2 ms)

  ● retries failed operations 3 times

    ReferenceError: retryOperation is not defined

Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 total

This is the expected failure - function doesn't exist yet. Proceeding to GREEN.
```

#### Recommendation 1.2: Add "Comprehensive Testing Checklist"

**Create new section:**

```markdown
## Test Coverage Requirements

For each function/method, write tests covering:

### Input Variations
- [ ] Happy path (typical valid input)
- [ ] Empty/null/undefined inputs
- [ ] Boundary values (min, max, zero, one)
- [ ] Invalid types (string when number expected)
- [ ] Edge cases specific to domain

### Error Paths
- [ ] Expected errors thrown with correct messages
- [ ] Error handling doesn't swallow unexpected errors
- [ ] Cleanup occurs even when errors thrown

### State Changes
- [ ] Side effects occur correctly (files written, DB updated)
- [ ] State mutations are complete and consistent
- [ ] No unintended side effects

### Integration Points
- [ ] Works with real dependencies when practical
- [ ] Mocked dependencies behave realistically
- [ ] Error propagation from dependencies

**Minimum: 3 tests per function** (happy path + 2 error/edge cases)

**Complex functions: 5-10 tests** covering permutations
```

#### Recommendation 1.3: Add "Integration and E2E Testing" Section

```markdown
## Beyond Unit Tests

TDD applies to all test levels:

### Integration Tests
**Write before implementing integrations**

```typescript
// RED: Write test showing components working together
test('saves user profile to database', async () => {
  const db = new TestDatabase();
  const service = new UserService(db);

  await service.updateProfile('user-123', { name: 'Alice' });

  const saved = await db.users.findById('user-123');
  expect(saved.name).toBe('Alice');
});

// GREEN: Implement UserService.updateProfile()
// REFACTOR: Extract validation, add error handling
```

### E2E Tests
**Write before implementing user-facing features**

```typescript
// RED: Test user workflow end-to-end
test('user can complete checkout', async () => {
  await page.goto('/cart');
  await page.click('[data-testid="checkout-button"]');
  await page.fill('[name="email"]', 'test@example.com');
  await page.click('[data-testid="submit-order"]');

  await expect(page.locator('[data-testid="order-confirmation"]'))
    .toContainText('Order placed successfully');
});

// GREEN: Implement checkout flow
// REFACTOR: Extract payment logic
```

**TDD cycle applies at every level** - always RED first.
```

#### Recommendation 1.4: Add "Frontend Testing Patterns"

```markdown
## TDD for Frontend Components

### Component Testing (React/Vue/Svelte)

**Test user behavior, not implementation:**

```typescript
// ✅ GOOD: Tests what user sees and does
test('shows error when email is invalid', async () => {
  render(<LoginForm />);

  await userEvent.type(screen.getByLabelText('Email'), 'invalid-email');
  await userEvent.click(screen.getByRole('button', { name: /submit/i }));

  expect(screen.getByRole('alert')).toHaveTextContent('Invalid email address');
});

// ❌ BAD: Tests implementation details
test('sets emailError state when validation fails', () => {
  const { result } = renderHook(() => useLoginForm());

  result.current.setEmail('invalid-email');
  result.current.validate();

  expect(result.current.emailError).toBe('Invalid email address');
});
```

**Key principles:**
- Query by role/label (what users see)
- Interact via userEvent (realistic behavior)
- Assert on visible outcomes (text, aria attributes)
- Don't test state/props/hooks directly
```

---

## 2. Testing Anti-Patterns Skill

**File**: `/Users/sam/code/wrangler/skills/testing-anti-patterns/SKILL.md`

### What It Does Well

#### 2.1 Clear Iron Laws

Three absolute rules:
```
1. NEVER test mock behavior
2. NEVER add test-only methods to production classes
3. NEVER mock without understanding dependencies
```

These are **specific and enforceable**.

#### 2.2 Gate Functions

Each anti-pattern includes a "gate function" - a set of questions to ask BEFORE making a mistake:

```
BEFORE asserting on any mock element:
  Ask: "Am I testing real component behavior or just mock existence?"

  IF testing mock existence:
    STOP - Delete the assertion or unmock the component
```

This is **proactive prevention** - it stops bad behavior before it happens.

#### 2.3 Real Example from Debugging

Anti-Pattern 3 includes a real example from actual debugging:

```typescript
// ❌ BAD: Mock breaks test logic
test('detects duplicate server', () => {
  // Mock prevents config write that test depends on!
  vi.mock('ToolCatalog', () => ({ ... }));
  ...
});
```

Real examples from actual failures are **highly credible**.

### Gaps and Weaknesses

#### 2.4 Missing: Frontend Testing Anti-Patterns

The skill focuses on backend patterns (mocking, test-only methods) but doesn't cover **common frontend testing mistakes**:

**Missing Anti-Patterns:**

1. **Testing implementation details instead of user behavior:**
   ```typescript
   // ❌ BAD
   expect(component.state.count).toBe(5);

   // ✅ GOOD
   expect(screen.getByText('Count: 5')).toBeInTheDocument();
   ```

2. **Not testing accessibility:**
   ```typescript
   // ❌ BAD: Button exists but might not be accessible
   expect(screen.getByTestId('submit-button')).toBeInTheDocument();

   // ✅ GOOD: Verify button is accessible to screen readers
   expect(screen.getByRole('button', { name: /submit/i })).toBeEnabled();
   ```

3. **Over-reliance on test IDs:**
   ```typescript
   // ❌ BAD: Test IDs are invisible to users
   screen.getByTestId('user-name');

   // ✅ GOOD: Query by what users see
   screen.getByRole('heading', { name: /welcome, alice/i });
   ```

4. **Not testing loading and error states:**
   ```typescript
   // ❌ BAD: Only tests happy path
   test('displays user data', async () => {
     render(<UserProfile userId="123" />);
     expect(await screen.findByText('Alice')).toBeInTheDocument();
   });

   // ✅ GOOD: Tests loading, success, and error
   test('shows loading spinner while fetching', () => { ... });
   test('shows user data when loaded', () => { ... });
   test('shows error message when fetch fails', () => { ... });
   ```

5. **Snapshot testing as a crutch:**
   ```typescript
   // ❌ BAD: Snapshot hides what you're actually testing
   expect(rendered).toMatchSnapshot();

   // ✅ GOOD: Explicit assertions on important content
   expect(screen.getByRole('heading')).toHaveTextContent('Dashboard');
   expect(screen.getByRole('button', { name: /logout/i })).toBeEnabled();
   ```

#### 2.5 Missing: API Testing Anti-Patterns

For testing APIs and HTTP endpoints:

1. **Testing HTTP library instead of your code:**
   ```typescript
   // ❌ BAD: Tests that fetch() works
   test('calls API', async () => {
     fetch.mockResolvedValue({ json: () => ({ data: 'test' }) });
     await myFunction();
     expect(fetch).toHaveBeenCalledWith('/api/endpoint');
   });
   ```

2. **Not testing error responses:**
   ```typescript
   // ❌ BAD: Only tests 200 OK
   // ✅ GOOD: Test 400, 401, 403, 404, 500, network errors
   ```

3. **Not testing request/response structure:**
   ```typescript
   // ❌ BAD: Assumes API returns correct shape
   // ✅ GOOD: Validate response against schema (Zod, JSON Schema)
   ```

#### 2.6 Missing: Database Testing Anti-Patterns

For testing code that uses databases:

1. **Testing ORM instead of queries:**
   ```typescript
   // ❌ BAD: Tests Sequelize/Prisma works
   expect(User.findOne).toHaveBeenCalled();

   // ✅ GOOD: Tests data is correctly retrieved
   const user = await userService.getById('123');
   expect(user.name).toBe('Alice');
   ```

2. **Not cleaning up test data:**
   ```typescript
   // ❌ BAD: Tests pollute shared test database
   // ✅ GOOD: afterEach(() => db.cleanup()) or use transactions
   ```

3. **Mocking database instead of using test database:**
   ```typescript
   // ❌ BAD: Mock prevents finding SQL errors
   db.query = jest.fn().mockResolvedValue([...]);

   // ✅ GOOD: Use in-memory SQLite or test container
   const db = new TestDatabase();
   ```

### Specific Recommendations

#### Recommendation 2.1: Add "Anti-Pattern 6: Frontend Testing Mistakes"

```markdown
## Anti-Pattern 6: Testing Implementation Details (Frontend)

**The violation:**
```typescript
// ❌ BAD: Testing internal state
test('counter increments', () => {
  const { result } = renderHook(() => useCounter());
  result.current.increment();
  expect(result.current.count).toBe(1);
});
```

**Why this is wrong:**
- Users don't see React state
- Test breaks when refactoring (state → context → external store)
- Doesn't verify UI actually updates

**The fix:**
```typescript
// ✅ GOOD: Testing user-visible behavior
test('counter increments when button clicked', async () => {
  render(<Counter />);
  expect(screen.getByText('Count: 0')).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: /increment/i }));

  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

### Gate Function

```
BEFORE querying component internals:
  Ask: "Can a user see this value on screen?"

  IF no (state, props, hooks, refs):
    STOP - Don't test it directly
    Test the visible outcome instead

  IF yes (rendered text, aria labels, enabled/disabled state):
    Test via user-facing queries (getByRole, getByLabelText)
```

**Query Priority (from most to least preferred):**
1. `getByRole` - Accessible to screen readers
2. `getByLabelText` - Form inputs
3. `getByText` - Visible text content
4. `getByTestId` - Last resort when nothing else works
5. ❌ NEVER: component.state, component.props, internal methods
```

#### Recommendation 2.2: Add "Anti-Pattern 7: Incomplete Test States"

```markdown
## Anti-Pattern 7: Testing Happy Path Only

**The violation:**
```typescript
// ❌ BAD: Only tests success case
test('loads user profile', async () => {
  render(<UserProfile userId="123" />);
  expect(await screen.findByText('Alice')).toBeInTheDocument();
});
```

**Why this is wrong:**
- Real users experience loading, errors, empty states
- Production bugs often occur in error paths
- Incomplete mental model of component behavior

**The fix:**
```typescript
// ✅ GOOD: Test all states users will see
test('shows loading spinner initially', () => {
  render(<UserProfile userId="123" />);
  expect(screen.getByRole('progressbar')).toBeInTheDocument();
});

test('shows user data when loaded', async () => {
  mockAPI.getUser.mockResolvedValue({ name: 'Alice', email: 'alice@example.com' });
  render(<UserProfile userId="123" />);
  expect(await screen.findByText('Alice')).toBeInTheDocument();
  expect(screen.getByText('alice@example.com')).toBeInTheDocument();
});

test('shows error message when fetch fails', async () => {
  mockAPI.getUser.mockRejectedValue(new Error('Network error'));
  render(<UserProfile userId="123" />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Failed to load profile');
});

test('shows empty state when user not found', async () => {
  mockAPI.getUser.mockResolvedValue(null);
  render(<UserProfile userId="123" />);
  expect(await screen.findByText('User not found')).toBeInTheDocument();
});
```

### Gate Function

```
BEFORE writing component test:
  List all possible UI states:
  - Loading (fetching data)
  - Success (data loaded)
  - Error (network failure, 500, timeout)
  - Empty (no data available)
  - Partial (some data missing)

  Write one test per state.

  If you only wrote one test, you're testing incompletely.
```
```

---

## 3. Run-the-Tests Skill

**File**: `/Users/sam/code/wrangler/skills/run-the-tests/SKILL.md`

### What It Does Well

#### 3.1 Comprehensive Infrastructure Setup

The skill provides **detailed setup instructions** for multiple languages:
- JavaScript/TypeScript (Vitest/Jest)
- Python (pytest)
- Go (built-in)
- Rust (Cargo)

Each includes:
- Installation commands
- Configuration files
- Example tests
- Package.json scripts

This is **extremely thorough** and framework-agnostic.

#### 3.2 Four-Phase Execution Strategy

The skill breaks test running into clear phases:
1. **Detect infrastructure** (or set up if missing)
2. **Run tests** (capture output)
3. **Fix failures** (diagnose and repair)
4. **Verify and report** (confirm success)

This is a **complete workflow** that ensures tests actually run and pass.

#### 3.3 Specific Fix Guidance

Phase 3 (Fix Test Failures) provides decision tree:
- Is test broken? → Update expectations
- Is implementation broken? → Use systematic-debugging
- Is dependency issue? → Install/update

This prevents agents from blindly changing code.

#### 3.4 Example Scenarios

The skill includes 4 concrete examples:
1. Existing tests with failures
2. New project with no tests
3. Python project with failures
4. Cascading failures from shared utility

Real-world scenarios make the skill **immediately applicable**.

### Gaps and Weaknesses

#### 3.5 No Enforcement That Tests Run BEFORE Completion

**CRITICAL GAP**: The skill says to run tests but doesn't mandate that output is shown.

**Problem:**
```
Agent: "I've run the tests and they all pass."
[No test output shown]
```

**Missing**: Integration with verification-before-completion to require evidence.

#### 3.6 No Guidance on "What Makes a Good Test"

The skill explains **how to run tests** but not **how to evaluate test quality**:

Missing criteria:
- Are tests testing real behavior or mocks?
- Are tests covering edge cases?
- Are tests fragile (break on refactoring)?
- Are tests readable and maintainable?

**Impact**: Agent might run 100 tests and they all pass, but tests are low-quality (only happy paths, full of mocks).

#### 3.7 Limited to Running Existing Tests

The skill assumes tests already exist or creates minimal example tests. It doesn't guide:
- What tests should exist for this codebase?
- What critical paths need coverage?
- What's the right balance of unit/integration/E2E?

**Impact**: Agent might run the test suite but miss that important features have zero coverage.

#### 3.8 No E2E Test Setup

The skill sets up unit test infrastructure but doesn't mention:
- Playwright/Cypress for E2E tests
- Browser automation setup
- Test database configuration
- Mock service worker (MSW) for API mocking

**Impact**: Backend projects get good test setup, frontend projects get incomplete setup.

### Specific Recommendations

#### Recommendation 3.1: Integrate with Verification-Before-Completion

**Update Phase 4 (Verification & Reporting) to mandate evidence:**

```markdown
### Phase 4: Verification & Reporting

**MANDATORY: Test output must be captured and included in report.**

1. **Run full test suite one final time:**
   ```bash
   # With coverage if available
   npm run test:coverage
   # or
   pytest --cov
   ```

2. **Capture complete output:**
   - Total test count
   - Pass/fail/skipped counts
   - Execution time
   - Coverage percentages
   - Any warnings or errors

3. **Include output in report:**

   ```markdown
   ## Test Execution Output

   ```
   npm test

   PASS tests/auth.test.ts
   PASS tests/users.test.ts
   PASS tests/api.test.ts

   Test Suites: 3 passed, 3 total
   Tests:       42 passed, 42 total
   Snapshots:   0 total
   Time:        4.231 s

   Coverage:
   Statements   : 87.5% ( 210/240 )
   Branches     : 82.3% ( 95/115 )
   Functions    : 90.1% ( 64/71 )
   Lines        : 88.2% ( 201/228 )
   ```
   ```

**You cannot claim tests pass without including this output.**

This enforces the verification-before-completion principle.
```

#### Recommendation 3.2: Add "Test Quality Checklist"

```markdown
### Phase 4B: Test Quality Review

After confirming all tests pass, evaluate test quality:

**For each test file reviewed:**

#### Behavior vs. Implementation
- [ ] Tests assert on outcomes (return values, visible effects)
- [ ] Tests don't assert on implementation (method calls, internal state)
- [ ] Mocks are minimal (only external dependencies like API/DB)

#### Coverage Breadth
- [ ] Happy path tested
- [ ] Error paths tested (invalid input, exceptions)
- [ ] Edge cases tested (null, empty, boundary values)
- [ ] Integration points tested

#### Test Readability
- [ ] Test names clearly describe what they verify
- [ ] Arrange-Act-Assert structure evident
- [ ] No excessive setup (suggests design issue)

**Red flags (report these):**
- Tests that only assert mocks were called
- Zero error path testing
- Cryptic test names ("test1", "works")
- Setup longer than test logic

If quality issues found, report them even if tests pass.
```

#### Recommendation 3.3: Add E2E Test Setup Guidance

```markdown
### Phase 1C: E2E Test Infrastructure Setup (Frontend/Full-Stack Projects)

**Only execute if project has UI components or exposes web endpoints.**

#### Playwright (Recommended for Modern Projects)

**Setup steps:**

1. **Install Playwright:**
   ```bash
   npm init playwright@latest
   # Installs Playwright, creates playwright.config.ts, example tests
   ```

2. **Verify configuration (playwright.config.ts):**
   ```typescript
   export default defineConfig({
     testDir: './e2e',
     fullyParallel: true,
     forbidOnly: !!process.env.CI,
     retries: process.env.CI ? 2 : 0,
     workers: process.env.CI ? 1 : undefined,
     use: {
       baseURL: 'http://localhost:3000',
       trace: 'on-first-retry',
     },
     webServer: {
       command: 'npm run dev',
       url: 'http://localhost:3000',
       reuseExistingServer: !process.env.CI,
     },
   });
   ```

3. **Create example E2E test:**
   ```typescript
   // e2e/login.spec.ts
   import { test, expect } from '@playwright/test';

   test('user can log in', async ({ page }) => {
     await page.goto('/login');

     await page.fill('[name="email"]', 'test@example.com');
     await page.fill('[name="password"]', 'password123');
     await page.click('button[type="submit"]');

     await expect(page.locator('[data-testid="user-profile"]')).toContainText('Welcome');
   });
   ```

4. **Add scripts to package.json:**
   ```json
   {
     "scripts": {
       "test:e2e": "playwright test",
       "test:e2e:ui": "playwright test --ui",
       "test:e2e:debug": "playwright test --debug"
     }
   }
   ```

#### Cypress (Alternative for Legacy Projects)

**Setup steps:**

1. **Install Cypress:**
   ```bash
   npm install -D cypress
   npx cypress open  # Creates cypress/ directory structure
   ```

2. **Create example test:**
   ```typescript
   // cypress/e2e/login.cy.ts
   describe('Login', () => {
     it('allows user to log in', () => {
       cy.visit('/login');
       cy.get('[name="email"]').type('test@example.com');
       cy.get('[name="password"]').type('password123');
       cy.get('button[type="submit"]').click();
       cy.get('[data-testid="user-profile"]').should('contain', 'Welcome');
     });
   });
   ```

**When to set up E2E tests:**
- Project has web UI
- Project exposes HTTP API endpoints
- Project has critical user workflows (checkout, signup, etc.)

**When to skip:**
- Pure library (no UI)
- CLI tool (different testing approach)
- Early prototype (unit tests sufficient)
```

---

## 4. Condition-Based Waiting Skill

**File**: `/Users/sam/code/wrangler/skills/condition-based-waiting/SKILL.md`

### What It Does Well

#### 4.1 Solves Specific Problem Excellently

The skill targets **one specific anti-pattern**: arbitrary timeouts in async tests.

```typescript
// ❌ BEFORE
await new Promise(r => setTimeout(r, 50));

// ✅ AFTER
await waitFor(() => getResult() !== undefined);
```

This is **laser-focused** and provides immediate value.

#### 4.2 Provides Reusable Implementation

The skill includes a complete `waitFor` implementation that can be copy-pasted:

```typescript
async function waitFor<T>(
  condition: () => T | undefined | null | false,
  description: string,
  timeoutMs = 5000
): Promise<T> {
  const startTime = Date.now();

  while (true) {
    const result = condition();
    if (result) return result;

    if (Date.now() - startTime > timeoutMs) {
      throw new Error(`Timeout waiting for ${description} after ${timeoutMs}ms`);
    }

    await new Promise(r => setTimeout(r, 10)); // Poll every 10ms
  }
}
```

This is **immediately actionable** - agent can copy/paste and use.

#### 4.3 Addresses "When Timeouts ARE Correct"

The skill acknowledges that sometimes timeouts are legitimate:

```typescript
// Tool ticks every 100ms - need 2 ticks to verify partial output
await waitForEvent(manager, 'TOOL_STARTED'); // First: wait for condition
await new Promise(r => setTimeout(r, 200));   // Then: wait for timed behavior
// 200ms = 2 ticks at 100ms intervals - documented and justified
```

This prevents **false positives** (agent replacing legitimate timeouts).

#### 4.4 Real-World Impact Metrics

```
From debugging session (2025-10-03):
- Fixed 15 flaky tests across 3 files
- Pass rate: 60% → 100%
- Execution time: 40% faster
- No more race conditions
```

**Credibility boost** - shows the skill was used successfully in production.

### Gaps and Weaknesses

#### 4.5 Narrow Scope: Only Async Timing

The skill only addresses **timing-related flakiness**. It doesn't cover:

**Other sources of test flakiness:**
- Shared state between tests (one test pollutes another)
- Uncleared timers (setTimeout/setInterval not cleaned up)
- Event listener leaks (addEventListener without removeEventListener)
- Random data (Math.random(), Date.now() in tests)
- External dependencies (real API calls, filesystem state)
- Parallel execution conflicts (tests touching same resources)

**Impact**: Agent might fix timing issues but leave other flakiness causes untouched.

#### 4.6 No Integration with Test Infrastructure

The skill doesn't mention:
- Most test frameworks have built-in `waitFor` (Testing Library, Playwright)
- Custom implementation only needed if framework doesn't provide one
- Framework-specific best practices

**Impact**: Agent might write custom `waitFor` when `@testing-library/react` already provides one.

#### 4.7 Missing: Preventing Flakiness at Design Level

The skill is **reactive** (fix flaky tests) but doesn't guide **proactive** design:

**Proactive patterns:**
- Design for testability (inject time, use fake timers)
- Isolate side effects (make code deterministic)
- Use test doubles instead of real time

**Example:**
```typescript
// ❌ FLAKY: Depends on real time
function retry(fn, maxAttempts = 3, delayMs = 100) {
  // Uses setTimeout internally
}

// ✅ TESTABLE: Time is injected
function retry(fn, maxAttempts = 3, clock = realClock) {
  // Uses clock.delay() which can be faked in tests
}

// Test with fake clock - no waiting, no flakiness
test('retries 3 times', async () => {
  const clock = new FakeClock();
  await retry(fn, 3, clock);
  expect(fn).toHaveBeenCalledTimes(3);
  // Runs instantly, always passes
});
```

#### 4.8 No Guidance on Debugging Flaky Tests

The skill shows how to **fix** flakiness but not how to **identify** it:

**Missing:**
- How to reproduce flaky tests (run 100 times, check pass rate)
- How to isolate the cause (comment out sections)
- How to verify fix (run repeatedly until confident)

### Specific Recommendations

#### Recommendation 4.1: Expand Scope to "Eliminating Test Flakiness"

**Rename skill to "eliminating-test-flakiness" and add sections:**

```markdown
## Sources of Test Flakiness

Flaky tests fail intermittently. Common causes:

### 1. Timing Issues (Use waitFor)
**Symptom:** Test passes locally, fails in CI or under load

```typescript
// ❌ FLAKY: Guesses timing
await new Promise(r => setTimeout(r, 50));

// ✅ STABLE: Waits for condition
await waitFor(() => element.isVisible());
```

### 2. Shared State (Isolate tests)
**Symptom:** Test passes alone, fails when run with others

```typescript
// ❌ FLAKY: Tests share global state
let currentUser = null;

test('sets user', () => {
  currentUser = { id: 1 };
  expect(currentUser.id).toBe(1);
});

test('user is set', () => {
  expect(currentUser.id).toBe(1); // Depends on previous test!
});

// ✅ STABLE: Each test sets up own state
test('sets user', () => {
  const user = { id: 1 };
  setCurrentUser(user);
  expect(getCurrentUser().id).toBe(1);
});

afterEach(() => {
  clearCurrentUser(); // Clean up after each test
});
```

### 3. Uncleaned Resources (Use cleanup)
**Symptom:** First test run passes, subsequent runs fail

```typescript
// ❌ FLAKY: Timers/listeners not cleaned up
test('shows notification', async () => {
  showNotification('Hello');
  // setTimeout not cleared - keeps running after test
});

// ✅ STABLE: Cleanup after each test
test('shows notification', async () => {
  const cleanup = showNotification('Hello');
  // ... assertions
});

afterEach(() => {
  jest.clearAllTimers();
  cleanup();
});
```

### 4. Non-Deterministic Data (Use fixed data)
**Symptom:** Test passes sometimes, fails randomly

```typescript
// ❌ FLAKY: Random data
test('generates user ID', () => {
  const id = generateUserId(); // Uses Math.random()
  expect(id).toMatch(/^user-\d+$/); // Passes but what if random() returns same value twice?
});

// ✅ STABLE: Fixed data
test('generates user ID', () => {
  const id = generateUserId(12345); // Inject seed
  expect(id).toBe('user-12345');
});
```

### 5. External Dependencies (Mock or isolate)
**Symptom:** Test fails when network is slow or API changes

```typescript
// ❌ FLAKY: Depends on real API
test('fetches user', async () => {
  const user = await api.getUser('123'); // Real HTTP request!
  expect(user.name).toBe('Alice');
});

// ✅ STABLE: Mock API
test('fetches user', async () => {
  mockAPI.getUser.mockResolvedValue({ name: 'Alice' });
  const user = await api.getUser('123');
  expect(user.name).toBe('Alice');
});
```

### 6. Parallel Execution Conflicts (Isolate resources)
**Symptom:** Tests pass when run serially, fail when parallel

```typescript
// ❌ FLAKY: Tests write to same file
test('saves report A', async () => {
  await saveReport('report.json', dataA);
  expect(fs.existsSync('report.json')).toBe(true);
});

test('saves report B', async () => {
  await saveReport('report.json', dataB); // Overwrites report A!
  expect(fs.existsSync('report.json')).toBe(true);
});

// ✅ STABLE: Each test uses unique file
test('saves report A', async () => {
  const filename = `report-${Date.now()}-${Math.random()}.json`;
  await saveReport(filename, dataA);
  expect(fs.existsSync(filename)).toBe(true);
  fs.unlinkSync(filename); // Cleanup
});
```

## Debugging Flaky Tests

When you encounter a flaky test:

1. **Reproduce consistently:**
   ```bash
   # Run test 100 times, count failures
   for i in {1..100}; do npm test -- flaky.test.ts || echo "FAIL $i"; done
   ```

2. **Isolate the test:**
   - Run test alone: `npm test -- flaky.test.ts`
   - Run with one other test at a time
   - Identify which combination causes failure

3. **Add logging:**
   ```typescript
   test('flaky test', () => {
     console.log('State before:', getState());
     doSomething();
     console.log('State after:', getState());
     expect(getState()).toBe('expected');
   });
   ```

4. **Check for async timing:**
   - Add `await waitFor(() => condition)` before assertions
   - Check that promises are awaited

5. **Check for cleanup:**
   - Add `afterEach(() => cleanup())`
   - Verify timers/listeners removed
   - Check that test runs twice successfully

6. **Verify fix:**
   ```bash
   # Run 100 times - should pass every time
   for i in {1..100}; do npm test -- fixed.test.ts || exit 1; done
   echo "100/100 passed ✓"
   ```
```

---

## 5. Verification-Before-Completion Skill

**File**: `/Users/sam/code/wrangler/skills/verification-before-completion/SKILL.md`

### What It Does Well

#### 5.1 Absolute Language

The skill uses **maximum enforcement**:

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE

If you haven't run the verification command in this message,
you cannot claim it passes.
```

This is **zero-tolerance** language.

#### 5.2 Gate Function Before Every Claim

```
BEFORE claiming any status or expressing satisfaction:

1. IDENTIFY: What command proves this claim?
2. RUN: Execute the FULL command (fresh, complete)
3. READ: Full output, check exit code, count failures
4. VERIFY: Does output confirm the claim?
5. ONLY THEN: Make the claim
```

This is **step-by-step** and cannot be skipped without violating the rule.

#### 5.3 Red Flag Detection

The skill lists **warning signs** that agent is about to violate:

```
- Using "should", "probably", "seems to"
- Expressing satisfaction before verification ("Great!", "Perfect!", "Done!")
- About to commit/push/PR without verification
- Thinking "just this once"
```

These catch **intent to violate** before it happens.

### Gaps and Weaknesses

#### 5.4 Doesn't Mandate Format of Evidence

**GAP**: The skill says "provide evidence" but doesn't specify **what evidence looks like**.

**Problem:**
```
Agent: "I've verified the tests pass."
[No output shown]
```

vs.

```
Agent: "I've verified the tests pass. Here's the output:"
[Shows actual test command output]
```

The second is verifiable, the first is not.

#### 5.5 No Integration with Test-Specific Verification

The skill is **generic** (applies to builds, tests, linters, etc.) but doesn't have **test-specific guidance**:

**Missing:**
- Must show test count (X passed, Y failed)
- Must show exit code (exit 0 = success)
- Must show coverage if available
- Must show test duration (performance check)

#### 5.6 Doesn't Address "Partial Verification"

**GAP**: What if agent runs some tests but not all?

```
Agent: "I ran the login tests and they all pass."
[Doesn't mention that 50 other tests weren't run]
```

**Missing rule:** Verification must be **complete**, not selective.

### Specific Recommendations

#### Recommendation 5.1: Add Test-Specific Verification Format

```markdown
## Test Verification Requirements

When claiming tests pass, you MUST provide:

### Required Evidence

1. **Exact command executed:**
   ```bash
   npm test
   # or
   pytest
   # or
   npm test -- path/to/specific.test.ts
   ```

2. **Complete output showing:**
   - Test count: "X tests passed"
   - Failure count: "0 failed"
   - Duration: "Time: 4.231s"
   - Exit code: 0 (success)

3. **Coverage (if available):**
   - Statement coverage: X%
   - Branch coverage: X%
   - Function coverage: X%
   - Line coverage: X%

### Example of VALID verification:

```
I've verified all tests pass. Here's the output:

$ npm test

PASS tests/auth.test.ts (4.231s)
  ✓ login with valid credentials (231ms)
  ✓ login with invalid credentials (12ms)
  ✓ logout successfully (8ms)

PASS tests/users.test.ts (2.145s)
  ✓ creates new user (145ms)
  ✓ updates existing user (98ms)
  ✓ deletes user (76ms)

Test Suites: 2 passed, 2 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        6.376s

Process exited with code 0

All 6 tests pass successfully.
```

### Example of INVALID verification:

```
❌ "I ran the tests and they pass."
❌ "Tests are green."
❌ "Everything looks good."
❌ [Shows only 1 test when there are 50]
❌ [Shows truncated output without pass/fail counts]
```

**If you cannot provide the complete output above, you have not verified.**
```

#### Recommendation 5.2: Add "Complete vs. Partial Verification" Section

```markdown
## Complete Verification

Verification must cover **all affected code**, not a subset.

### RED FLAGS (Partial verification):

```
❌ "I ran the login tests and they pass."
   → What about other tests? Did you run the FULL suite?

❌ "I tested the happy path and it works."
   → What about error paths? Edge cases?

❌ "The new feature tests pass."
   → Did you run EXISTING tests to check for regressions?

❌ "Unit tests pass."
   → What about integration tests? E2E tests?
```

### CORRECT verification:

```
✓ "I ran the full test suite (npm test) and all 142 tests pass."
✓ "I ran unit tests (67 passed) and integration tests (24 passed)."
✓ "I ran the specific test (login.test.ts) AND the full suite to check for regressions."
```

### Decision tree:

```
Changed code?
  ↓
  Run tests for changed code
  ↓
  Did they pass?
  ↓
  Run FULL test suite (all tests)
  ↓
  Did they pass?
  ↓
  Show complete output
  ↓
  THEN claim verification
```

**If you skipped any step above, you have not verified.**
```

---

## Missing Skills: Critical Gaps

### Gap 1: No "Comprehensive Test Coverage" Skill

**Problem**: Agents know **HOW** to write tests (TDD) but not **WHAT** to test.

**Missing skill: "comprehensive-test-coverage"**

**Purpose**: Define what "thoroughly tested" means.

**Key sections:**

```markdown
# Comprehensive Test Coverage

## Overview

Writing tests is not enough - you must test the RIGHT things.

**Core principle:** Every user-facing behavior, error path, and integration point must be tested.

## Test Coverage Dimensions

### 1. Behavior Coverage (Most Important)

**Every user-visible behavior needs a test:**

- [ ] User can complete primary workflows (happy paths)
- [ ] User sees correct error messages when operations fail
- [ ] User sees loading states while operations progress
- [ ] User sees empty states when no data available
- [ ] User cannot perform invalid operations (buttons disabled, validation)

**Example: User registration**

```typescript
// Required tests
test('user can register with valid email');
test('shows error when email already exists');
test('shows error when email is invalid format');
test('shows error when password too short');
test('shows error when passwords do not match');
test('shows success message after registration');
test('sends confirmation email after registration');
test('disables submit button while registering');
```

### 2. Edge Case Coverage

**Test boundaries and unusual inputs:**

- [ ] Null/undefined/empty values
- [ ] Maximum length inputs
- [ ] Minimum/zero/negative numbers
- [ ] Special characters in strings
- [ ] Concurrent operations
- [ ] Operations on deleted/nonexistent resources

### 3. Error Path Coverage

**Every error that can occur needs a test:**

- [ ] Network failures (timeout, offline, 500 error)
- [ ] Validation errors (client and server)
- [ ] Authorization failures (401, 403)
- [ ] Resource not found (404)
- [ ] Conflicts (409)
- [ ] Rate limiting (429)

### 4. Integration Coverage

**Every external dependency needs integration tests:**

- [ ] Database queries return correct data
- [ ] API calls send correct requests
- [ ] File operations work correctly
- [ ] Third-party services integrate correctly

### 5. State Coverage (Frontend)

**Every UI state needs a test:**

- [ ] Initial/loading state
- [ ] Success state
- [ ] Error state
- [ ] Empty state
- [ ] Partial/intermediate states

## Test Pyramid

```
        /\
       /E2E\       (Few) - Full user workflows
      /------\
     /Integration\  (Some) - Components working together
    /------------\
   /    Unit      \ (Many) - Individual functions/components
  /--------------\
```

**Recommended ratio: 70% unit, 20% integration, 10% E2E**

## Coverage Checklist

Before claiming feature complete:

- [ ] All user-facing behaviors have E2E tests
- [ ] All edge cases have unit tests
- [ ] All error paths have tests
- [ ] All integrations have tests
- [ ] All UI states have tests
- [ ] Code coverage >80% (lines, branches, functions)
- [ ] No skipped tests (or documented WHY skipped)

**If you cannot check all boxes, testing is incomplete.**
```

---

### Gap 2: No "Frontend Testing" Skill

**Problem**: No guidance on testing UI components, user interactions, visual appearance, accessibility.

**Missing skill: "frontend-testing"**

**Purpose**: Framework-agnostic patterns for testing user interfaces.

**Key sections:**

```markdown
# Frontend Testing

## Overview

Frontend tests verify what **users see and do**, not how code works internally.

**Core principle:** Test user behavior, not implementation details.

## Query Priority

Always prefer queries that match how users find elements:

```typescript
// 1. BEST: Accessible to everyone (including screen readers)
screen.getByRole('button', { name: /submit/i });
screen.getByRole('heading', { name: /welcome/i });
screen.getByLabelText('Email address');

// 2. GOOD: Visible text
screen.getByText('Click here to continue');
screen.getByPlaceholderText('Enter your email');

// 3. ACCEPTABLE: Test IDs (when nothing else works)
screen.getByTestId('submit-button');

// 4. NEVER: Implementation details
component.state.isSubmitting;
component.props.onClick;
wrapper.find('.submit-button');
```

## User Interaction Testing

**Use userEvent, not fireEvent (more realistic):**

```typescript
import { userEvent } from '@testing-library/user-event';

// ✅ GOOD: Simulates real user behavior
test('submits form when user clicks button', async () => {
  const user = userEvent.setup();
  render(<LoginForm />);

  await user.type(screen.getByLabelText('Email'), 'test@example.com');
  await user.type(screen.getByLabelText('Password'), 'password123');
  await user.click(screen.getByRole('button', { name: /submit/i }));

  expect(await screen.findByText('Login successful')).toBeInTheDocument();
});

// ❌ BAD: Unrealistic, synchronous events
test('submits form', () => {
  render(<LoginForm />);
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' }});
  fireEvent.click(screen.getByRole('button'));
  // Missing await, missing intermediate events (focus, blur, keydown, keyup)
});
```

## Testing All UI States

Every component has multiple states - test them all:

```typescript
// Loading state
test('shows spinner while fetching data', () => {
  render(<UserProfile userId="123" />);
  expect(screen.getByRole('progressbar')).toBeInTheDocument();
});

// Success state
test('shows user data when loaded', async () => {
  mockAPI.getUser.mockResolvedValue({ name: 'Alice' });
  render(<UserProfile userId="123" />);
  expect(await screen.findByText('Alice')).toBeInTheDocument();
});

// Error state
test('shows error when fetch fails', async () => {
  mockAPI.getUser.mockRejectedValue(new Error('Network error'));
  render(<UserProfile userId="123" />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Failed to load');
});

// Empty state
test('shows empty message when user not found', async () => {
  mockAPI.getUser.mockResolvedValue(null);
  render(<UserProfile userId="123" />);
  expect(await screen.findByText('User not found')).toBeInTheDocument();
});
```

## Accessibility Testing

**Always test that UI is accessible:**

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

test('has no accessibility violations', async () => {
  const { container } = render(<LoginForm />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

// Verify interactive elements are keyboard accessible
test('can navigate form with keyboard', async () => {
  const user = userEvent.setup();
  render(<LoginForm />);

  await user.tab(); // Focus email input
  expect(screen.getByLabelText('Email')).toHaveFocus();

  await user.tab(); // Focus password input
  expect(screen.getByLabelText('Password')).toHaveFocus();

  await user.tab(); // Focus submit button
  expect(screen.getByRole('button', { name: /submit/i })).toHaveFocus();

  await user.keyboard('{Enter}'); // Submit with Enter
  // Verify form submitted
});
```

## Visual Regression Testing

**Use snapshot testing sparingly (prefer explicit assertions):**

```typescript
// ❌ BAD: Snapshot hides what you're testing
expect(container).toMatchSnapshot();

// ✅ GOOD: Explicit assertions on important content
test('renders user profile correctly', () => {
  render(<UserProfile user={{ name: 'Alice', email: 'alice@example.com' }} />);

  expect(screen.getByRole('heading', { name: /alice/i })).toBeInTheDocument();
  expect(screen.getByText('alice@example.com')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /edit profile/i })).toBeEnabled();
});

// ✅ ACCEPTABLE: Snapshot for complex rendered output
test('renders chart correctly', () => {
  const { container } = render(<LineChart data={mockData} />);
  expect(container.querySelector('svg')).toMatchSnapshot();
});
```

## Framework-Specific Patterns

### React Testing Library

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('example', async () => {
  const user = userEvent.setup();
  render(<Component />);

  await user.click(screen.getByRole('button'));

  await waitFor(() => {
    expect(screen.getByText('Updated')).toBeInTheDocument();
  });
});
```

### Vue Testing Library

```typescript
import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';

test('example', async () => {
  const user = userEvent.setup();
  render(Component);

  await user.click(screen.getByRole('button'));

  expect(screen.getByText('Updated')).toBeInTheDocument();
});
```

### Svelte Testing Library

```typescript
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';

test('example', async () => {
  const user = userEvent.setup();
  render(Component);

  await user.click(screen.getByRole('button'));

  expect(screen.getByText('Updated')).toBeInTheDocument();
});
```

## Red Flags

- Testing component state/props directly
- Using `.find()` or CSS selectors instead of semantic queries
- Not waiting for async updates
- Not testing loading/error states
- Mocking components instead of using real components
- Not testing keyboard navigation
- No accessibility testing
```

---

### Gap 3: No "E2E Testing" Skill

**Problem**: No guidance on testing full user workflows across pages, APIs, databases.

**Missing skill: "e2e-testing"**

**Purpose**: Framework-agnostic patterns for end-to-end testing.

**Key sections:**

```markdown
# End-to-End (E2E) Testing

## Overview

E2E tests verify complete user workflows from start to finish, including:
- Multiple pages/screens
- API requests
- Database state
- External services
- Authentication/authorization

**Core principle:** Test the system as a user would use it.

## When to Write E2E Tests

**E2E tests should cover:**
- Critical user workflows (signup, login, checkout)
- Happy paths (successful completion)
- Common error scenarios (payment failure, validation errors)

**E2E tests should NOT cover:**
- Every edge case (use unit tests)
- Internal implementation details (use integration tests)
- Variations of same workflow (use parameterized tests)

**Rule of thumb:** If a bug here would be catastrophic, write an E2E test.

## Test Structure

**Pattern: Arrange-Act-Assert-Cleanup**

```typescript
test('user can complete checkout', async () => {
  // ARRANGE: Set up test data
  const testUser = await createTestUser();
  const testProduct = await createTestProduct();

  // ACT: Perform user workflow
  await page.goto('/login');
  await page.fill('[name="email"]', testUser.email);
  await page.fill('[name="password"]', testUser.password);
  await page.click('button[type="submit"]');

  await page.goto(`/products/${testProduct.id}`);
  await page.click('[data-testid="add-to-cart"]');
  await page.click('[data-testid="checkout"]');

  await page.fill('[name="cardNumber"]', '4242424242424242');
  await page.fill('[name="expiry"]', '12/25');
  await page.fill('[name="cvc"]', '123');
  await page.click('[data-testid="place-order"]');

  // ASSERT: Verify outcome
  await expect(page.locator('[data-testid="order-confirmation"]'))
    .toContainText('Order placed successfully');

  // Verify database state
  const order = await db.orders.findByUserId(testUser.id);
  expect(order.status).toBe('confirmed');
  expect(order.total).toBe(testProduct.price);

  // CLEANUP: Remove test data
  await db.orders.delete(order.id);
  await db.users.delete(testUser.id);
  await db.products.delete(testProduct.id);
});
```

## Test Data Management

**Use factories or fixtures:**

```typescript
// ✅ GOOD: Reusable test data factories
async function createTestUser(overrides = {}) {
  return await db.users.create({
    email: `test-${Date.now()}@example.com`,
    password: 'password123',
    name: 'Test User',
    ...overrides
  });
}

// ✅ GOOD: Each test creates its own data
test('user can update profile', async () => {
  const user = await createTestUser();
  // ... test
  await db.users.delete(user.id); // Cleanup
});

// ❌ BAD: Tests share data (causes flakiness)
const sharedUser = await createTestUser();

test('user can update profile', async () => {
  // Uses sharedUser - what if another test modified it?
});
```

## Page Object Pattern

**Encapsulate page interactions:**

```typescript
// pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.fill('[name="email"]', email);
    await this.page.fill('[name="password"]', password);
    await this.page.click('button[type="submit"]');
  }

  async getErrorMessage() {
    return await this.page.locator('[role="alert"]').textContent();
  }
}

// tests/login.spec.ts
test('user can log in', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login('test@example.com', 'password123');

  await expect(page).toHaveURL('/dashboard');
});

test('shows error for invalid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login('test@example.com', 'wrongpassword');

  const error = await loginPage.getErrorMessage();
  expect(error).toContain('Invalid credentials');
});
```

## API Mocking (When Needed)

**Mock external services, not your own API:**

```typescript
// ✅ GOOD: Mock external payment provider
test('handles payment failure', async ({ page }) => {
  await page.route('https://api.stripe.com/v1/charges', route => {
    route.fulfill({
      status: 400,
      body: JSON.stringify({ error: { message: 'Card declined' }})
    });
  });

  // ... attempt checkout

  await expect(page.locator('[role="alert"]'))
    .toContainText('Payment failed: Card declined');
});

// ❌ BAD: Mocking your own API (defeats purpose of E2E)
test('shows user profile', async ({ page }) => {
  await page.route('/api/users/123', route => {
    route.fulfill({ body: JSON.stringify({ name: 'Alice' })});
  });
  // Not testing real API integration!
});
```

## Waiting Strategies

**Always wait for conditions, not arbitrary times:**

```typescript
// ✅ GOOD: Wait for specific element
await page.waitForSelector('[data-testid="user-profile"]');

// ✅ GOOD: Wait for navigation
await page.click('a[href="/dashboard"]');
await page.waitForURL('/dashboard');

// ✅ GOOD: Wait for network
await Promise.all([
  page.waitForResponse(resp => resp.url().includes('/api/users')),
  page.click('[data-testid="load-more"]')
]);

// ❌ BAD: Arbitrary timeout
await page.waitForTimeout(2000); // Flaky!
```

## Test Isolation

**Each test should be independent:**

```typescript
// ✅ GOOD: Each test sets up and tears down
test('test A', async () => {
  const user = await createTestUser();
  // ... test
  await deleteTestUser(user.id);
});

test('test B', async () => {
  const user = await createTestUser();
  // ... test
  await deleteTestUser(user.id);
});

// ❌ BAD: Tests depend on order
test('creates user', async () => {
  await createTestUser(); // No cleanup!
});

test('updates user', async () => {
  // Assumes user from previous test exists
});
```

## Framework Examples

### Playwright

```typescript
import { test, expect } from '@playwright/test';

test('user workflow', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Get Started');
  await expect(page).toHaveURL('/signup');
});
```

### Cypress

```typescript
describe('user workflow', () => {
  it('completes signup', () => {
    cy.visit('/');
    cy.contains('Get Started').click();
    cy.url().should('include', '/signup');
  });
});
```

### Puppeteer

```typescript
test('user workflow', async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:3000');
  await page.click('text=Get Started');
  expect(page.url()).toContain('/signup');

  await browser.close();
});
```

## Red Flags

- Mocking your own backend in E2E tests
- Not cleaning up test data
- Tests depending on execution order
- No waiting (arbitrary timeouts)
- Testing every variation end-to-end (use unit tests)
- No page objects (duplicated selectors everywhere)
```

---

## Summary of Recommendations

### Priority 1: Immediate Improvements (High Impact, Low Effort)

1. **Add verification evidence requirements to TDD skill**
   - Mandate showing test output in RED and GREEN phases
   - Prevent agents from claiming "tests pass" without proof

2. **Add test execution evidence to verification-before-completion**
   - Define exact format of test verification (pass counts, exit codes)
   - Distinguish complete vs. partial verification

3. **Expand testing-anti-patterns to include frontend patterns**
   - Add "Anti-Pattern 6: Testing Implementation Details"
   - Add "Anti-Pattern 7: Testing Happy Path Only"

### Priority 2: New Skills (High Impact, Medium Effort)

4. **Create "comprehensive-test-coverage" skill**
   - Define what "thoroughly tested" means
   - Provide coverage checklists for behavior, edge cases, errors, integrations

5. **Create "frontend-testing" skill**
   - Framework-agnostic UI testing patterns
   - User behavior testing (not implementation details)
   - Accessibility testing requirements
   - Visual regression testing guidelines

6. **Create "e2e-testing" skill**
   - When to write E2E tests (critical workflows only)
   - Page object pattern
   - Test data management
   - Test isolation strategies

### Priority 3: Enhancements (Medium Impact, Medium Effort)

7. **Expand condition-based-waiting to "eliminating-test-flakiness"**
   - Cover all sources of flakiness (shared state, uncleaned resources, etc.)
   - Debugging flaky tests workflow
   - Proactive design for testability

8. **Add integration and E2E sections to TDD skill**
   - Show TDD applies at all test levels
   - Provide examples of integration test TDD
   - Provide examples of E2E test TDD

---

## Conclusion

The wrangler testing skills are **world-class for backend unit testing** with exceptional enforcement mechanisms and rationalization prevention. However, they have **critical blind spots**:

1. **No verification that tests actually run** - agents can claim compliance without evidence
2. **No guidance on "what to test"** - agents might write minimal tests and claim thorough coverage
3. **Zero frontend/UI testing guidance** - agents will apply backend patterns incorrectly to frontend
4. **Zero E2E testing guidance** - agents won't test complete user workflows
5. **Narrow scope for flakiness** - only addresses timing, not other common causes

The recommendations above would:
- **Eliminate verification loopholes** (Priority 1)
- **Provide comprehensive testing guidance** (Priority 2)
- **Cover modern testing needs** (Priority 3)

With these additions, wrangler would have the **most comprehensive testing skill library** for AI agents, covering unit, integration, E2E, frontend, and accessibility testing with strong enforcement.
