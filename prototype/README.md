# RoomieSplit Prototype

An interactive prototype of the RoomieSplit expense and chore management application. This is a design reference implementation showcasing the user interface, user flows, and core features of the platform.

## Overview

The RoomieSplit Prototype provides a visual and functional representation of how roommates can manage shared expenses, track chores, and maintain balance in household finances. This prototype serves as a design reference and proof-of-concept for the full-featured application.

## Features

### User Features
- **Dashboard** - Overview of current balances and recent activities
- **Expenses Management** - Log, view, and track shared expenses
- **Chore Assignment** - Create and track household tasks
- **Group Management** - Join and manage roommate groups
- **User Profiles** - View and manage user information
- **Balance Tracking** - See who owes whom in real-time
- **Login Interface** - User authentication flow

### UI Components
- Responsive navbar with navigation
- Sidebar for quick access to main sections
- Custom buttons and form fields
- Card-based layout for organizing information
- Modal dialogs for confirmations and data entry
- Avatar and badge components
- Page headers and section organization

## Tech Stack

- **Frontend Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Router:** React Router DOM v6
- **CSS Processing:** PostCSS & Autoprefixer
- **Package Manager:** npm

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Navigate to prototype directory
cd prototype

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173` (or the next available port).

## Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Avatar.jsx
│   ├── Badge.jsx
│   ├── Button.jsx
│   ├── Card.jsx
│   ├── FormField.jsx
│   ├── Modal.jsx
│   ├── Navbar.jsx
│   ├── PageHeader.jsx
│   └── Sidebar.jsx
├── context/             # React Context for state management
│   └── ThemeContext.jsx
├── data/                # Mock data for prototyping
│   └── mockData.js
├── layouts/             # Page layout components
│   └── MainLayout.jsx
├── pages/               # Page components
│   ├── BalancesPage.jsx
│   ├── ChoresPage.jsx
│   ├── DashboardPage.jsx
│   ├── ExpensesPage.jsx
│   ├── GroupDetailPage.jsx
│   ├── GroupsPage.jsx
│   ├── LoginPage.jsx
│   └── ProfilePage.jsx
├── router/              # Routing configuration
│   └── AppRouter.jsx
├── App.jsx              # Main app component
├── main.jsx             # Entry point
└── index.css            # Global styles
```

## Core Pages

### Login Page (`LoginPage.jsx`)
Entry point with user authentication interface.

### Dashboard Page (`DashboardPage.jsx`)
Main overview showing:
- Current balances
- Quick statistics
- Recent activities
- Links to main features

### Expenses Page (`ExpensesPage.jsx`)
- View all expenses
- Add new expenses
- Filter and sort expenses
- Settlement status

### Chores Page (`ChoresPage.jsx`)
- View assigned chores
- Create new chores
- Mark chores as complete
- Track completion history

### Groups Page (`GroupsPage.jsx`)
- View all groups
- Create new groups
- Join groups
- Group details and settings

### Balances Page (`BalancesPage.jsx`)
- View financial balances between members
- Settlement recommendations
- Transaction history

### Profile Page (`ProfilePage.jsx`)
- User profile information
- Settings
- Account management

## Styling

This prototype uses **Tailwind CSS** for styling with a consistent design system:

- **Color Scheme:** Purple (#6366f1) and dark tones
- **Responsive Design:** Mobile-first approach
- **Components:** Pre-built Tailwind utilities and custom components

### Configuration Files
- `tailwind.config.cjs` - Tailwind configuration
- `postcss.config.cjs` - PostCSS configuration
- `index.css` - Global styles and CSS variables

## Mock Data

The prototype uses mock data defined in `src/data/mockData.js`. This allows testing the UI without a backend server.

To integrate with a real backend:
1. Replace mock data with API calls
2. Implement state management (Redux, Zustand, or Context API)
3. Add error handling and loading states

## Navigation Flow

```
Login Page
    ↓
Dashboard
    ├─→ Expenses Page
    ├─→ Chores Page
    ├─→ Groups Page
    ├─→ Balances Page
    └─→ Profile Page
```

## Color Scheme

- **Primary:** `#6366f1` (Indigo)
- **Secondary:** `#a855f7` (Purple)
- **Background:** `#ffffff` / `#f8fafc`
- **Text:** `#1e293b` / `#64748b`
- **Accent:** `#ec4899` (Pink)

## Customization

### Adding New Pages
1. Create a new component in `src/pages/`
2. Add route in `src/router/AppRouter.jsx`
3. Add navigation link in `src/components/Sidebar.jsx` or `Navbar.jsx`

### Adding New Components
1. Create component in `src/components/`
2. Export and use in pages
3. Follow existing component patterns for consistency

### Theming
Modify `src/context/ThemeContext.jsx` to add dark mode or custom themes.

## Known Limitations

As a prototype, this implementation:
- Uses mock data (no real backend)
- Does not persist data between sessions
- Has limited error handling
- Does not include real authentication
- Performance optimizations not applied

## Next Steps

For the production application, see the main [RoomieSplit folder](../RoomieSplit/README.md) which includes:
- Real backend with Supabase
- TypeScript support
- Comprehensive testing
- Full authentication
- Production deployment

## Deployment

### Build for Production
```bash
npm run build
```

Output will be in `dist/` folder.

### Deployment Options
- **Vercel:** `vercel deploy`
- **Netlify:** `netlify deploy --prod`
- **Manual:** Upload `dist/` to any static hosting

### Deployment URL Placeholder
[DEPLOYMENT_URL_PLACEHOLDER]

## Debugging & Development

### Browser DevTools
Use React DevTools browser extension for inspecting component state and props.

### Vite DevTools
Automatic hot module reloading (HMR) for instant feedback during development.

## Performance Tips

- Components use lazy loading where applicable
- Images should be optimized before production
- Consider implementing code splitting for large pages

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing to the Prototype

1. Follow React best practices
2. Keep components reusable
3. Maintain consistent styling with Tailwind CSS
4. Comment complex logic
5. Test in multiple screen sizes

## Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [React Router Documentation](https://reactrouter.com)

## Support

For questions about the prototype:
- Check existing component implementations
- Review Tailwind CSS documentation
- Refer to main [RoomieSplit documentation](../RoomieSplit/README.md)

---

**Project Type:** UI/UX Prototype
**Status:** Reference Implementation
**Last Updated:** April 2026
**Version:** 1.0.0

**Note:** This is a prototype for design reference. For production use, see the main RoomieSplit application with full backend integration.

