# RoomieSplit

A comprehensive application for managing shared housing expenses, chores, and settlements between roommates. RoomieSplit streamlines the process of splitting bills, tracking chores, and maintaining fair financial balance among household members.

## Project Structure

This repository contains two main implementations of RoomieSplit:

### `/prototype`
An initial prototype implementation built with React and Tailwind CSS. This folder contains the early design and feature exploration phase of the application.

**Tech Stack:**
- React 18
- Tailwind CSS
- Vite
- React Router DOM

**Use:** Reference implementation, design mockups, and feature exploration

### `/RoomieSplit`
The production-ready main application with full backend integration, comprehensive testing, and TypeScript support.

**Tech Stack:**
- React 19 with TypeScript
- Vite
- Supabase (Backend & Database)
- Tailwind CSS
- React Router DOM v7
- Vitest (Unit & Integration Testing)
- ESLint

**Features:**
- User authentication with Supabase
- Group management
- Expense tracking and settlement calculations
- Chore management and tracking
- Member profiles and balance management
- Admin dashboard (with audit logs)
- Comprehensive test coverage

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone [REPOSITORY_URL]
cd project-RoomieSplit
```

2. **Choose which version to run:**

#### Running the Prototype
```bash
cd prototype
npm install
npm run dev
```

#### Running the Main Application
```bash
cd RoomieSplit
npm install
npm run dev
```

3. **Environment Setup (for RoomieSplit)**

Create a `.env.local` file in the `RoomieSplit` folder with your Supabase credentials:
```
VITE_SUPABASE_URL=[YOUR_SUPABASE_URL]
VITE_SUPABASE_ANON_KEY=[YOUR_SUPABASE_ANON_KEY]
```

## Development

### Available Scripts

#### Prototype
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

#### RoomieSplit
```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run preview       # Preview production build
npm run lint          # Run ESLint
npm run test          # Run tests in watch mode
npm run test -- --run # Run tests once
npm run test:coverage # Generate coverage report
```

## Deployment

See [docs/DEPLOYMENT_CHECKLIST.md](./RoomieSplit/docs/DEPLOYMENT_CHECKLIST.md) for detailed deployment instructions.

### Deployment URL
[DEPLOYMENT_URL_PLACEHOLDER]

## Testing

The RoomieSplit application includes comprehensive unit and integration tests.

```bash
cd RoomieSplit

# Run all tests
npm run test -- --run

# Watch mode
npm run test

# Coverage report
npm run test:coverage

# Run specific test suites
npx vitest run src/test/pages src/test/workflows
```

For detailed testing documentation, see [docs/testing/README_TESTING.md](./RoomieSplit/docs/testing/README_TESTING.md).

## Documentation

Comprehensive documentation is available in the `RoomieSplit/docs` folder:

- **Architecture** - System design and technical decisions
- **Testing** - Testing strategy, coverage, and execution guides
- **Deployment** - Production deployment checklist and guidelines

## Features

### Core Features
- **User Management** - Registration, authentication, and profile management
- **Group Management** - Create and manage roommate groups
- **Expense Tracking** - Log expenses and automatic settlement calculation
- **Chore Management** - Assign and track household chores
- **Balance Tracking** - Real-time balance calculations and settlements
- **Reports & Analytics** - Financial summaries and expense breakdown

### Admin Features
- **User Management** - Manage users and permissions
- **Audit Logs** - Track system activities
- **Group Administration** - Manage groups and members
- **Analytics Dashboard** - System-wide insights

## Technologies

- **Frontend Framework:** React 19 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Real-time)
- **Testing:** Vitest with React Testing Library
- **Routing:** React Router DOM v7
- **Icons:** Lucide React
- **Date Handling:** date-fns
- **Linting:** ESLint

## Project Links

- **Main Application:** [DEPLOYMENT_URL_PLACEHOLDER]
- **Prototype Reference:** [PROTOTYPE_URL_PLACEHOLDER]
- **Documentation:** See `/RoomieSplit/docs` folder
- **Issues & Feature Requests:** [ISSUES_URL_PLACEHOLDER]

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Create a feature branch from `main`
2. Write tests for new features
3. Ensure all tests pass: `npm run test -- --run`
4. Run linter: `npm run lint`
5. Submit a pull request with clear description

## License

[LICENSE_PLACEHOLDER]

## Support

For issues, questions, or support:
- Check existing documentation in `/docs` folders
- Review test files for usage examples
- Check issue tracker at [ISSUES_URL_PLACEHOLDER]

## Roadmap

- [ ] Mobile app version
- [ ] Advanced analytics and reporting
- [ ] Recurring expenses
- [ ] Receipt OCR integration
- [ ] Multi-currency support
- [ ] Integration with payment platforms

---

**Last Updated:** April 2026
**Version:** 1.0.0
