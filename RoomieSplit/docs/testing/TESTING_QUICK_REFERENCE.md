# RoomieSplit Testing - Quick Reference Guide

## Running Tests

```bash
# Run all tests
npm run test

# Run with coverage report
npm run test:coverage

# Watch mode (for development)
npm run test:watch

# Run specific test file
npm run test -- src/test/services/memberService.test.ts

# Run specific test suite
npm run test -- --grep "useMembers"
```

---

## Test Files & Coverage

### Phase 1 Tests (✅ COMPLETED)

| File | Type | Cases | Coverage |
|------|------|-------|----------|
| memberService.test.ts | Service | 9 | Get members, add member, remove member |
| groupService.test.ts | Service | 10 | Create, get, join, update groups |
| choreService.test.ts | Service | 10 | CRUD + archive chores |
| settlementService.test.ts | Service | 12 | Create, get, payment, archive |
| adminService.test.ts | Service | 9 | Dashboard, activate user, archive group |
| useMembers.test.ts | Hook | 11 | Load, add, dedupe, error handling |
| useProfile.test.ts | Hook | 8 | Load profile, avatar URL, errors |
| useAdminDashboard.test.ts | Hook | 8 | Load snapshot, refresh, errors |
| **TOTAL** | **68** | **Service+Hook Logic** |

### Existing Tests (Already Passing)

| File | Type | Cases | Coverage |
|------|------|-------|----------|
| authService.test.ts | Service | 8 | Auth operations |
| profileService.test.ts | Service | 5 | Profile CRUD |
| expensesService.test.ts | Service | 7 | Expense operations |
| useAuth.test.ts | Hook | 15 | Auth state management |
| useExpenses.test.ts | Hook | 10 | Expense state |
| useSettlements.test.ts | Hook | 12 | Settlement state |
| useChores.test.ts | Hook | 9 | Chore state |
| useGroups.test.ts | Hook | 10 | Group state |
| usePagination.test.ts | Hook | 11 | Pagination logic |
| + lib & routing tests | Various | 20+ | Utilities & routing |
| **EXISTING** | **~13** | **Established patterns** |

---

## Test Patterns & What They Verify

### Service Tests

Each service test verifies:

```typescript
// Happy Path
✅ Correct API called with right parameters
✅ Data returned successfully
✅ No errors

// Failure Path
✅ RLS/permission denials handled
✅ Validation errors caught
✅ Constraint violations handled (unique, foreign key)
✅ Network errors would be caught

// Misuse Path
✅ Invalid inputs rejected
✅ State violations detected (e.g., self-settlement)
✅ Permission boundaries enforced
✅ User-friendly error messages
```

### Hook Tests

Each hook test verifies:

```typescript
// Lifecycle
✅ Initial loading state
✅ Data loads correctly on mount
✅ Dependencies trigger reloads
✅ Cleanup functions run

// State Management
✅ Success state populated correctly
✅ Error state set on failure
✅ Empty state handled
✅ Stale state doesn't persist

// Async Safety
✅ Loading always terminates
✅ Timeouts clear messages
✅ No race conditions with dependencies
```

---

## Understanding Test Structure

### Example: memberService.test.ts

```typescript
describe("memberService", () => {                    // Test suite
  beforeEach(() => {
    vi.clearAllMocks();                              // Reset mocks
  });

  describe("getMembersByGroup", () => {              // Feature
    it("queries group_members with profile data", async () => {
      // Setup mock data
      const mockChain = { select: vi.fn()... };
      
      // Call function
      const result = await getMembersByGroup(TEST_GROUP_ID);
      
      // Verify
      expect(mockSupabase.from).toHaveBeenCalledWith("group_members");
      expect(result.data).toEqual(mockMembers);
      expect(result.error).toBeNull();
    });

    it("returns error when query fails", async () => {
      // Setup to return error
      mockChain.order.mockResolvedValue({
        data: null,
        error: { message: "permission denied" }
      });
      
      // Call and verify error
      const result = await getMembersByGroup(TEST_GROUP_ID);
      expect(result.error).toBeTruthy();
    });
  });
});
```

---

## Key Test Concepts

### Mocking Supabase

```typescript
// Mock the module
vi.mock("../../lib/supabaseClient", () => ({
  supabase: { from: vi.fn(), rpc: vi.fn() }
}));

// Use in tests
(mockSupabase.from as ReturnType<typeof vi.fn>)
  .mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({ data, error })
  });
```

### Fake Timers (for timeout tests)

```typescript
beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

// Later in test
act(() => {
  vi.advanceTimersByTime(5001);  // Skip past timeout
});

afterEach(() => {
  vi.useRealTimers();
});
```

### Three-Path Testing Pattern

```typescript
// Happy Path
it("returns data on success", async () => {
  mockFn.mockResolvedValue({ data: mockData, error: null });
  const result = await function();
  expect(result.data).toEqual(mockData);
});

// Failure Path
it("returns error on backend failure", async () => {
  mockFn.mockResolvedValue({ data: null, error: { message: "..." } });
  const result = await function();
  expect(result.error).toBeTruthy();
});

// Misuse Path
it("rejects unauthorized access", async () => {
  mockFn.mockResolvedValue({ 
    data: null, 
    error: { message: "permission denied" } 
  });
  const result = await function();
  expect(result.error).toBeTruthy();
});
```

---

## Test Data & Fixtures

Located in: `src/test/fixtures.ts`

```typescript
// Constants
export const TEST_USER_ID = "user-001";
export const TEST_USER_ID_2 = "user-002";
export const TEST_GROUP_ID = "group-001";

// Mock Objects
export const mockUser: AppUser;
export const mockGroup: Group;
export const mockMembers: GroupMember[];
export const mockExpenses: Expense[];
export const mockSettlements: Settlement[];
export const mockChores: Chore[];
```

**Usage:** Import and use in tests:
```typescript
import { mockMembers, TEST_GROUP_ID } from "../fixtures";
```

---

## Debugging Failed Tests

### Common Issues & Solutions

#### Issue: "Cannot read property 'mockReturnValue' of undefined"
**Cause:** Mock not set up before use
**Solution:** Ensure `vi.mock()` is called before imports

#### Issue: "Timeout exceeded in jest.useFakeTimers"
**Cause:** Forgot to advance timers or switch back to real timers
**Solution:** Add `vi.advanceTimersByTime()` or `vi.useRealTimers()`

#### Issue: "Expected mock to have been called"
**Cause:** Function not called or called with different params
**Solution:** Check mock setup matches actual call, use `mockFn.mock.calls` to debug

#### Issue: "Test is flaky (passes sometimes, fails others)"
**Cause:** Using real timers or race conditions
**Solution:** Use `vi.useFakeTimers()` for async tests

### Debugging Commands

```bash
# Run single test with verbose output
npm run test -- --reporter=verbose src/test/services/memberService.test.ts

# Run with debugging info
node --inspect-brk ./node_modules/vitest/vitest.mjs run

# Check what mockFn received
console.log(mockFn.mock.calls);
console.log(mockFn.mock.lastCall);
```

---

## Test Coverage Report

```bash
# Generate coverage report
npm run test:coverage

# Output will show:
# - Line coverage: % of lines executed
# - Statement coverage: % of statements executed
# - Function coverage: % of functions executed
# - Branch coverage: % of branches executed

# View HTML report
# Coverage report generated in: coverage/
```

**Target Coverage (After Phase 1):**
- Overall: 50%
- Services: 80%
- Hooks: 100%

---

## Adding New Tests

### To add a new service test:

```bash
# 1. Create file
touch src/test/services/newService.test.ts

# 2. Copy template
# Use memberService.test.ts as template

# 3. Update imports and mock data
# Change vi.mock() path
# Update imported functions
# Use appropriate fixtures

# 4. Add test cases
# Follow three-path pattern (happy, failure, misuse)

# 5. Run test
npm run test -- src/test/services/newService.test.ts
```

### To add a new hook test:

```bash
# 1. Create file
touch src/test/hooks/useNewHook.test.ts

# 2. Copy template
# Use useMembers.test.ts as template

# 3. Update mocks for services hook depends on
# 4. Test full lifecycle (loading → success/error/empty)
# 5. Run test
npm run test -- src/test/hooks/useNewHook.test.ts
```

---

## Next Phase: Page Integration Tests

### What to test:

```typescript
// Example: LoginPage.test.tsx
render(<LoginPage />);

// User interaction
userEvent.type(emailInput, "test@example.com");
userEvent.type(passwordInput, "password123");
userEvent.click(submitButton);

// Verify state updates
await waitFor(() => {
  expect(screen.getByText("Success")).toBeInTheDocument();
});

// Verify navigation
expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
```

### Key things to verify:

- ✅ Component renders without crashing
- ✅ User interactions trigger callbacks
- ✅ Loading states display
- ✅ Error messages show correctly
- ✅ Redirects happen on auth state change
- ✅ Empty states display
- ✅ Permissions enforce UI restrictions

---

## CI/CD Integration

### In your CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Run tests
  run: npm run test

- name: Generate coverage
  run: npm run test:coverage

- name: Check coverage threshold
  run: |
    # Fail if coverage below 50%
    coverage=$(npm run test:coverage | grep "Statements")
    if [ $coverage -lt 50 ]; then
      exit 1
    fi
```

---

## Resources

- **Testing Library Docs:** https://testing-library.com/docs/react-testing-library/intro/
- **Vitest Docs:** https://vitest.dev/
- **React Testing Patterns:** https://kentcdodds.com/blog/common-mistakes-with-react-testing-library

---

## Contact & Support

For questions about:
- **Test writing:** Refer to existing test files as templates
- **Mocking:** Check src/test/mockSupabase.ts
- **Fixtures:** Check src/test/fixtures.ts
- **Architecture:** See TESTING_PLAN.md

---

**Last Updated:** April 18, 2026  
**Status:** Phase 1 Tests Available
