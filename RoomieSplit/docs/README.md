# RoomieSplit Documentation

This folder contains all project documentation including architecture, testing, and deployment guides.

## Folders

### `/testing`
Complete QA testing documentation including:
- **TESTING_PLAN.md** - Comprehensive testing strategy and objectives
- **README_TESTING.md** - Testing setup and execution guide
- **PHASE1_COMPLETION.md** - Phase 1 (hooks & services) test results
- **PHASE1_FINAL_STATUS.md** - Phase 1 final metrics and summary
- **TESTING_QUICK_REFERENCE.md** - Quick reference for running tests
- **QA_EXECUTIVE_SUMMARY.md** - High-level QA summary
- **DELIVERABLES_SUMMARY.md** - Complete deliverables checklist
- **PHASE2_COMPLETION.md** - Phase 2 (page integration) test results
- **PHASE3_COMPLETION.md** - Phase 3 (workflow) test results

### `/architecture`
Architecture and technical design documentation (future).

## Quick Links

### Testing
- Run all tests: `npm run test -- --run`
- Run Phase 2 & 3 only: `npx vitest run src/test/pages src/test/workflows`
- Watch mode: `npm run test`
