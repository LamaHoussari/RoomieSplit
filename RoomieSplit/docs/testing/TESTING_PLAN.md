# RoomieSplit - Final QA Testing Pass Plan

**Project:** RoomieSplit (Vite + React + TypeScript + Supabase)  
**Date:** April 18, 2026  
**Goal:** Comprehensive final testing before release with minimal disruption  
**Current Coverage:** 26% (9/34 critical items)

---

## EXECUTIVE SUMMARY

### Testing Status
- **Hooks tested:** 6/9 (67%)  
  - ✅ useAuth, useExpenses, useSettlements, useChores, useGroups, usePagination
  - ❌ useAdminDashboard, useMembers, useProfile

- **Services tested:** 3/10 (30%)  
  - ✅ authService, profileService, expensesService  
  - ❌ adminService, avatarService, choreService, groupService, inviteService, memberService, settlementService

- **Pages tested:** 0/15 (0%)  
  - ❌ All page components lack integration tests

### Risk Priority
1. **CRITICAL (test first):** Member management, admin features, group operations, auth/permissions
2. **HIGH:** Page rendering, error states, loading reliability, async safety
3. **MEDIUM:** Workflows, pagination interactions, empty states
4. **LOWER:** Cosmetic checks, non-critical UI

### Key Findings
- **No page component tests** → integration risk
- **Missing member/group service tests** → core feature gap
- **Missing admin service tests** → permission/auth risk
- **Strong hook/service test foundation** → can extend with page tests

---

## TESTING OBJECTIVES

### 1. Critical User Flows (Happy Path + Failure + Misuse)
- [ ] **Auth Flow:** Login, logout, session recovery, permission rejection
- [ ] **Group Creation:** Create, join by code, invite members
- [ ] **Expense Management:** Create, split, archive, delete, edit
- [ ] **Settlement Flow:** Record payment, resolve balances, archive
- [ ] **Admin Functions:** View audit, manage users/groups, activate users

### 2. Async Reliability
- [ ] Loading state always terminates (success / error / empty)
- [ ] No stuck spinners on any code path
- [ ] Race conditions handled (out-of-order responses ignored)
- [ ] Retry behavior works where applicable

### 3. Error Distinction & Handling
- [ ] Auth errors (expired, invalid credentials)
- [ ] Permission errors (RLS denial, forbidden action)
- [ ] Validation errors (user input)
- [ ] Network errors (timeout, connection lost)
- [ ] Data errors (missing fields, constraint violations)
- [ ] Each surfaces correct user-facing message

### 4. Authorization & Permission Boundaries
- [ ] Non-admin cannot access admin pages
- [ ] Non-owner cannot edit/delete group or others' expenses
- [ ] Session expiry is handled gracefully
- [ ] Backend rejects forbidden actions even if UI hides controls

### 5. Data Persistence & Visibility
- [ ] After create → item appears in list immediately
- [ ] After update → latest value shows after refresh
- [ ] After delete → item removed from list
- [ ] Archive/restore works and list updates
- [ ] Pagination reflects changes correctly

### 6. Component & Page Rendering
- [ ] Main pages render without crashing
- [ ] Large components receive expected props
- [ ] Conditional rendering behaves (loading, empty, error, success)
- [ ] No blank UI from null/undefined assumptions
- [ ] Route navigation works (including invalid routes)
- [ ] Direct re-entry/refresh on protected pages behaves correctly

### 7. Feature-Complete Workflows
- [ ] **Expense:** Create with splits → display → mark paid → settle → archive
- [ ] **Group:** Create → add members → manage permissions → view balances
- [ ] **Chores:** Create → assign → mark complete → archive
- [ ] **Settlement:** Create → record payment → mark settled
- [ ] **Admin:** View users → activate → view audit log

---

## PROPOSED TEST ADDITIONS (Minimal, High-Value)

### PHASE 1: Service & Hook Tests (Closes 30% gap)
**Priority: CRITICAL** | **Effort: Medium** | **Coverage Impact: High**

#### A. Missing Hook Tests
1. **useMembers** (src/test/hooks/useMembers.test.ts)
   - Load members for single group
   - Load members across multiple groups with deduplication
   - Add member (success + failure + validation)
   - Error state handling
   - Loading always terminates

2. **useProfile** (src/test/hooks/useProfile.test.ts)
   - Load profile by user ID
   - Handle missing profile (graceful)
   - Avatar URL resolution
   - Error handling

3. **useAdminDashboard** (src/test/hooks/useAdminDashboard.test.ts)
   - Fetch admin dashboard snapshot
   - Aggregate data correctly
   - Error handling for permission denied
   - Loading state reliability

#### B. Missing Service Tests
1. **memberService** (src/test/services/memberService.test.ts)
   - Add group member
   - Get members by group
   - Get members by multiple groups
   - Permission/RLS error handling

2. **groupService** (src/test/services/groupService.test.ts)
   - Create group with unique code
   - Get groups by user
   - Join group by code
   - Handle duplicate code error
   - Handle invalid code error

3. **choreService** (src/test/services/choreService.test.ts)
   - Create chore
   - Get chores by group
   - Mark complete/incomplete
   - Archive chore
   - Delete chore

4. **settlementService** (src/test/services/settlementService.test.ts)
   - Create settlement
   - Get settlements by group
   - Record settlement payment
   - Archive settlement

5. **adminService** (src/test/services/adminService.test.ts)
   - Get admin dashboard snapshot
   - Activate user
   - Archive group
   - Permission denial (non-admin user)

### PHASE 2: Page Integration Tests (Closes 70% gap total)
**Priority: HIGH** | **Effort: High** | **Coverage Impact: Very High**

#### Scope: Test 4 critical pages with minimal mocking
1. **LoginPage** (authentication + feedback)
2. **GroupsPage** (list + create + join)
3. **ExpensesPage** (list + create + management)
4. **AdminDashboardPage** (admin-only access + data display)

Each page test covers:
- Happy path rendering
- Error state display
- Loading state
- User interaction (forms, buttons)
- Empty state (no data)
- Permission rejection (where applicable)

### PHASE 3: Workflow Tests (Closes 85% gap total)
**Priority: HIGH** | **Effort: Medium** | **Coverage Impact: High**

#### Complete end-to-end flows:
1. **Auth + Dashboard:** Sign up → Sign in → See dashboard → Sign out
2. **Group + Members:** Create group → Add member → View balances
3. **Expense + Settlement:** Create expense → Mark paid → Record settlement
4. **Admin Audit:** Admin login → View audit log → Activate user

---

## PRODUCTION CODE CHANGES (Minimal)

### Assessment: Can current code be tested reliably?
**YES** - Current architecture is well-structured for testing.

### Optional Improvements (if time permits):
1. **Supabase Client Export** - Currently only used via import. OK for testing.
2. **Hooks Export from index** - Would reduce import noise. NICE-TO-HAVE.
3. **Service Layer Abstraction** - Not needed; mocking works fine.

**Recommendation:** NO production code changes required. Mocking strategy is sound.

---

## RISK ANALYSIS BY AREA

### Auth & Sessions (Medium Risk → Low after tests)
**Current:** useAuth hook tested, but:
- [ ] Session expiry not explicitly tested
- [ ] Permission rejection path incomplete
- [ ] Admin check race conditions possible

**Plan:** Add session expiry edge case test + permission denial scenarios

### Group & Member Management (High Risk → Medium after tests)
**Current:** useGroups tested, but:
- [ ] Member operations NOT tested
- [ ] Group creation edge cases incomplete (duplicate code)
- [ ] Member deduplication logic untested

**Plan:** Create memberService + useMembers tests

### Expense & Settlement (Low Risk → Very Low after tests)
**Current:** Well-covered (useExpenses, useSettlements, expensesService tested)
- Settlement payment workflow needs page integration test

**Plan:** Add workflow integration test

### Admin Features (High Risk → Medium after tests)
**Current:** NOT tested at all
- [ ] Admin dashboard query untested
- [ ] User activation untested
- [ ] Permission checks not verified
- [ ] Audit log access untested

**Plan:** Create adminService tests + AdminDashboardPage test

### Page Rendering (High Risk → Low after tests)
**Current:** Routing tested; pages not tested
- [ ] Large components not verified
- [ ] Empty states not checked
- [ ] Error rendering not verified
- [ ] Loading states not checked

**Plan:** Add 4 critical page tests in Phase 2

---

## TESTING EXECUTION PLAN

### Phase 1: Services & Hooks (Days 1-2, ~6 test files)
```
✓ memberService.test.ts
✓ groupService.test.ts
✓ choreService.test.ts
✓ settlementService.test.ts
✓ adminService.test.ts
✓ useMembers.test.ts
✓ useProfile.test.ts
✓ useAdminDashboard.test.ts
```
**Estimated Time:** 4-6 hours
**Expected Coverage Gain:** 30%

### Phase 2: Page Integration Tests (Days 2-3, ~4 test files)
```
✓ LoginPage.test.tsx
✓ GroupsPage.test.tsx
✓ ExpensesPage.test.tsx
✓ AdminDashboardPage.test.tsx
```
**Estimated Time:** 6-8 hours
**Expected Coverage Gain:** 40%

### Phase 3: Workflow Tests (Day 3, ~4 test files)
```
✓ authFlow.integration.test.ts
✓ groupMemberFlow.integration.test.ts
✓ expenseSettlementFlow.integration.test.ts
✓ adminFlow.integration.test.ts
```
**Estimated Time:** 4-6 hours
**Expected Coverage Gain:** 15%

**Total Estimated Effort:** 14-20 hours
**Final Coverage Expected:** ~85%

---

## TEST EXECUTION CHECKLIST

### Before Running Tests
- [ ] Vitest environment configured (already done)
- [ ] Supabase client mocked (already done)
- [ ] Test fixtures complete (already done)
- [ ] Auth mocks functional (already done)

### Running Tests
```bash
# All tests
npm run test

# With coverage
npm run test:coverage

# Watch mode during development
npm run test:watch
```

### Success Criteria
- All tests pass
- No console errors or warnings
- No skipped/pending tests
- Coverage report generated
- No sensitive data logged

---

## FEATURE COVERAGE MAP

### Happy Path / Failure Path / Misuse Path

#### Authentication
- **Happy:** User signs up → signs in → sees authenticated content
- **Failure:** Invalid credentials → error message shown
- **Misuse:** Try to access /admin as non-admin → redirected to /dashboard

#### Group Management
- **Happy:** Create group → appears in list → join successful
- **Failure:** Duplicate code → error "Code already exists"
- **Misuse:** User tries to delete group they don't own → 403 forbidden

#### Expense Workflow
- **Happy:** Create split expense → payment recorded → settlement marked
- **Failure:** Invalid split amounts → "Total must equal amount" message
- **Misuse:** Non-payer tries to mark expense as paid → rejected by RLS

#### Admin Dashboard
- **Happy:** Admin signs in → sees audit log and user list → can activate user
- **Failure:** User tries to access /admin → redirected to /dashboard
- **Misuse:** Activate non-existent user → error "User not found"

#### Member Management
- **Happy:** Add existing user by email → appears in group → can manage balances
- **Failure:** Email not registered → error "User account does not exist"
- **Misuse:** User tries to add member to group they don't own → 403 forbidden

---

## HIGH-RISK UNVERIFIED BEHAVIORS

These should be verified before release:

1. **Session Expiry Edge Cases**
   - What happens when token expires mid-operation?
   - Does refresh re-authenticate correctly?
   - Are cached lists still valid?

2. **Concurrent Operations**
   - Two users create expense simultaneously
   - Member added while group being deleted
   - Settlement payment recorded during settlement archival

3. **Permission Boundary at Scale**
   - RLS policies hold for all scenarios
   - Non-owners truly cannot modify others' data
   - Admin access controls work across all endpoints

4. **Data Consistency**
   - Expense + settlements always in sync
   - Split totals never exceed amount
   - Archival cascades correctly (expense → settlements)

5. **Loading State Extremes**
   - Very large lists (1000+ items)
   - Network timeout during pagination
   - Loading interrupted by navigation

6. **Error Recovery**
   - Failed create + retry = no duplicates
   - Failed update + retry = consistent state
   - Failed delete + retry = idempotent

---

## SUCCESS METRICS

### Coverage Targets
- **Hooks:** 100% (currently 67%)
- **Services:** 80%+ (currently 30%)
- **Pages:** 50%+ (currently 0%)
- **Overall:** 75%+ (currently 26%)

### Quality Gates
- ✅ All critical flows covered (happy + failure + misuse)
- ✅ No async stuck states
- ✅ Auth/permission boundaries verified
- ✅ Error messages user-friendly and accurate
- ✅ Data persistence verified
- ✅ No flaky tests (100% pass rate)

### Documentation
- ✅ Test files have clear describe blocks
- ✅ Each test documents expected behavior
- ✅ Edge cases and assumptions documented
- ✅ Mock setup clear and maintainable

---

## NEXT STEPS

1. **Review this plan** with team
2. **Execute Phase 1** (services & hooks)
3. **Run coverage report** and adjust priorities
4. **Execute Phase 2** (page tests)
5. **Execute Phase 3** (workflow tests)
6. **Final verification** against success metrics
7. **Document discoveries** in release notes
8. **Deploy with confidence**

---

**Plan Owner:** QA Testing Pass  
**Status:** Ready to Execute  
**Last Updated:** April 18, 2026
