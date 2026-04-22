# RoomieSplit

A full-stack application for managing shared housing expenses, chores, and financial settlements between roommates. Built with React, TypeScript, and Supabase with comprehensive testing and production-ready features.

## Overview

RoomieSplit simplifies the complexity of shared housing finances by automating expense tracking, chore management, and fair settlement calculations. The application provides an intuitive interface for users to manage group finances and maintain harmony among household members.

### Key Capabilities
- **Expense Management:** Track and split expenses among roommates
- **Smart Settlements:** Automatic calculation of who owes whom
- **Chore Tracking:** Assign, track, and manage household tasks
- **Group Management:** Create and manage multiple groups
- **Member Balances:** Real-time balance tracking and settlement recommendations
- **User Profiles:** Personalized user accounts with Supabase authentication
- **Admin Dashboard:** System administration and audit logging
- **Comprehensive Testing:** Full unit and integration test coverage

## Tech Stack

### Frontend
- **React** 19 - UI framework
- **TypeScript** - Type safety and developer experience
- **Vite** - Fast build tool and dev server
- **React Router DOM** v7 - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework

### Backend
- **Supabase** - Backend-as-a-service (PostgreSQL + Authentication + Real-time)

### Development & Testing
- **Vitest** - Unit and integration testing
- **React Testing Library** - Component testing utilities
- **ESLint** - Code quality and linting
- **TypeScript Compiler** - Type checking

### Utilities
- **date-fns** - Date manipulation and formatting
- **Lucide React** - Icon library
- **@dicebear** - Avatar generation

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AuthShell.tsx
│   ├── Avatar.tsx
│   ├── Badge.tsx
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── DatePicker.tsx
│   ├── FormField.tsx
│   ├── InviteMemberModal.tsx
│   ├── LoadingScreen.tsx
│   ├── MetricCard.tsx
│   ├── Modal.tsx
│   ├── Navbar.tsx
│   ├── PageHeader.tsx
│   ├── Pagination.tsx
│   ├── Sidebar.tsx
│   ├── Skeleton.tsx
│   └── TrackingCalendar.tsx
├── context/             # React Context for state management
│   └── ThemeContext.tsx
├── hooks/               # Custom React hooks
│   ├── useAdminDashboard.ts
│   ├── useAuth.ts
│   ├── useChores.ts
│   ├── useExpenses.ts
│   ├── useGroups.ts
│   ├── useMembers.ts
│   ├── usePagination.ts
│   ├── useProfile.ts
│   └── useSettlements.ts
├── layouts/             # Page layout components
│   └── MainLayout.tsx
├── lib/                 # Utility functions and helpers
│   ├── adminAuth.ts
│   ├── choreIcons.ts
│   ├── finance.ts
│   ├── friendlyError.ts
│   └── supabaseClient.ts
├── pages/               # Page components
│   ├── AdminAuditlogPage.tsx
│   ├── AdminDashboardPage.tsx
│   ├── AdminGroupsPage.tsx
│   ├── AdminUsersPage.tsx
│   ├── BalancesPage.tsx
│   ├── ChoresPage.tsx
│   ├── DashboardPage.tsx
│   ├── ExpensesPage.tsx
│   ├── GroupDetailPage.tsx
│   ├── GroupsPage.tsx
│   ├── LoginPage.tsx
│   └── ProfilePage.tsx
├── router/              # Routing configuration
├── services/            # API and business logic services
├── test/                # Test files
│   ├── pages/           # Page component tests
│   └── workflows/       # Workflow integration tests
├── types/               # TypeScript type definitions
├── App.tsx              # Main app component
├── main.tsx             # Application entry point
└── index.css            # Global styles
```

## Getting Started

### Prerequisites
- Node.js v16 or higher
- npm or yarn
- Supabase account (for database and auth)

### Installation

1. **Clone the repository**
```bash
git clone [REPOSITORY_URL]
cd project-RoomieSplit/RoomieSplit
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**

Create a `.env.local` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Obtain these from your Supabase project settings.

4. **Initialize Supabase database**

Run the SQL setup script in your Supabase dashboard:
```bash
# Copy contents from supabase-setup.sql
# Execute in Supabase SQL editor
```

5. **Start development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload

# Production
npm run build            # Build for production
npm run preview          # Preview production build locally

# Code Quality
npm run lint             # Run ESLint and check code quality

# Testing
npm run test             # Run tests in watch mode
npm run test -- --run    # Run tests once (CI mode)
npm run test:coverage    # Generate code coverage report

# Run specific test suites
npx vitest run src/test/pages              # Test pages only
npx vitest run src/test/workflows          # Test workflows only
npx vitest run src/test/pages src/test/workflows  # Both
```

## Core Features

### User Features

#### Dashboard
- Overview of financial status
- Recent activity feed
- Quick action buttons
- Group information

#### Expense Management
- Create and track expenses
- Split expenses among members
- View expense history
- Filter and search expenses
- Mark expenses as settled

#### Chore Management
- Assign chores to members
- Track chore completion
- Set frequency and deadlines
- View chore history
- Get reminders

#### Groups & Members
- Create and manage groups
- Invite members to groups
- Manage member roles
- View group settings
- Track member balances

#### Balances & Settlements
- Real-time balance calculations
- Settlement recommendations
- Payment history
- Outstanding balances
- Settlement notifications

#### User Profile
- Profile information management
- Account settings
- Preferences
- Theme selection

### Admin Features

#### Admin Dashboard
- System-wide overview
- Usage statistics
- User analytics
- Revenue metrics

#### User Management
- View all users
- User status management
- Account administration
- User activity tracking

#### Group Management
- View all groups
- Manage group settings
- Group administration
- Member oversight

#### Audit Logging
- Track system activities
- View audit trail
- Export audit logs
- Security monitoring

## Authentication

The application uses Supabase Authentication:

- Email/password registration and login
- Session management
- Password reset functionality
- Secure token handling
- Protected routes

### Default Admin Account
Created during database initialization. See `supabase-setup.sql` for details.

## Testing

### Test Coverage

The application includes comprehensive test coverage organized in phases:

- **Phase 1:** Hooks and services
- **Phase 2:** Page component integration
- **Phase 3:** Complete workflow scenarios

### Running Tests

```bash
# All tests
npm run test -- --run

# Watch mode for development
npm run test

# With coverage report
npm run test:coverage

# Specific test suite
npx vitest run src/test/pages/DashboardPage.test.tsx
```

### Test Documentation

Detailed testing documentation:
- [README_TESTING.md](./docs/testing/README_TESTING.md) - Setup and execution
- [TESTING_PLAN.md](./docs/testing/TESTING_PLAN.md) - Strategy and objectives
- [QA_EXECUTIVE_SUMMARY.md](./docs/testing/QA_EXECUTIVE_SUMMARY.md) - Summary
- [PHASE*_COMPLETION.md](./docs/testing/) - Phase results

## Deployment

### Build for Production

```bash
npm run build
```

Output is generated in the `dist/` folder.

### Deployment Platforms

#### Vercel (Recommended)
```bash
npm install -g vercel
vercel deploy --prod
```

#### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

#### Custom Server
1. Build: `npm run build`
2. Upload `dist/` folder to your server
3. Configure server to redirect routes to `index.html`

### Environment Configuration

Set environment variables in your deployment platform:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### Deployment URL
(https://roomie-split-p.netlify.app/)

See [DEPLOYMENT_CHECKLIST.md](./docs/DEPLOYMENT_CHECKLIST.md) for complete deployment instructions.

## Database Schema

The application uses a Supabase PostgreSQL database with the following main tables:

- `users` - User accounts and profiles
- `groups` - Roommate groups
- `members` - Group membership
- `expenses` - Shared expenses
- `expense_splits` - Individual expense allocations
- `chores` - Household tasks
- `chore_assignments` - Task assignments
- `settlements` - Payment history
- `audit_logs` - System activity logs

For full schema details, see `supabase-setup.sql`.

## API Integration

### Services Structure

Services handle all backend communication:

```typescript
// Example service calls
const { groups, loading } = useGroups();
const { createExpense } = useExpenses();
const { settlements } = useSettlements();
```

See individual hook files in `src/hooks/` for detailed documentation.

## Error Handling

The application includes user-friendly error handling:

- `friendlyError.ts` - Convert API errors to user-friendly messages
- Error boundaries for component failures
- Network error recovery
- Form validation feedback

## Code Quality

### ESLint Configuration

Run linting to check code quality:
```bash
npm run lint
```

### TypeScript

Full TypeScript support ensures type safety:
```bash
npm run build  # Includes TypeScript type checking
```

## Performance Optimization

- Code splitting and lazy loading
- Component memoization
- Efficient re-renders with React hooks
- Image optimization
- Database query optimization

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## File Size

Production build size:
- Bundle: ~250KB (gzipped)
- CSS: ~50KB (gzipped)
- JavaScript: ~200KB (gzipped)

## Contributing

1. Create a feature branch from `main`
2. Write tests for new features
3. Ensure all tests pass: `npm run test -- --run`
4. Run linter: `npm run lint`
5. Submit pull request with clear description

### Code Standards
- Use TypeScript for type safety
- Write tests for all features
- Follow ESLint rules
- Use descriptive variable and function names
- Comment complex logic
- Keep components small and focused

## Documentation

Comprehensive documentation in `docs/` folder:

### Testing
- `testing/TESTING_PLAN.md` - Full testing strategy
- `testing/README_TESTING.md` - How to run tests
- `testing/QA_EXECUTIVE_SUMMARY.md` - Testing summary

### Deployment
- `DEPLOYMENT_CHECKLIST.md` - Production checklist

### Architecture
- `architecture/` - Technical design (in progress)

## Support & Troubleshooting

### Common Issues

**Environment variables not loading:**
- Ensure `.env.local` exists in the root directory
- Restart dev server after changes
- Variables must start with `VITE_`

**Supabase connection errors:**
- Check URL and API key in `.env.local`
- Verify Supabase project is running
- Check internet connection

**Tests failing:**
- Run `npm install` to ensure dependencies are installed
- Clear node_modules: `rm -rf node_modules && npm install`
- Check database connection in tests

**Build errors:**
- Clear cache: `npm run build -- --force`
- Check TypeScript errors: `tsc --noEmit`
- Review eslint warnings

### Getting Help

- Review documentation in `docs/` folder
- Check test files for usage examples
- Review component implementations
- Check Supabase documentation at https://supabase.com/docs

## Roadmap

- [ ] Mobile app version
- [ ] Advanced expense reports and analytics
- [ ] Recurring expenses
- [ ] Receipt OCR integration
- [ ] Multi-currency support
- [ ] Payment platform integration
- [ ] Dark mode enhancement
- [ ] Offline mode
- [ ] Notification system
- [ ] API for third-party integrations

## Related Projects

- **Prototype:** See [../prototype/README.md](../prototype/README.md) for design reference
- **Documentation:** [docs/README.md](./docs/README.md)

## License

[LICENSE_PLACEHOLDER]

## Credits

Built with modern web technologies and best practices.

---

**Project Type:** Full-Stack Web Application
**Status:** Production Ready
**Last Updated:** April 2026
**Version:** 1.0.0

**Useful Commands Reference:**
```bash
npm run dev              # Quick start
npm run build            # Production build
npm run test -- --run    # Run tests
npm run lint             # Check code quality
```

