import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MainLayout      from '../layouts/MainLayout';
import LoginPage       from '../pages/LoginPage';
import DashboardPage   from '../pages/DashboardPage';
import GroupsPage      from '../pages/GroupsPage';
import GroupDetailPage from '../pages/GroupDetailPage';
import ExpensesPage    from '../pages/ExpensesPage';
import BalancesPage    from '../pages/BalancesPage';
import ChoresPage      from '../pages/ChoresPage';
import ProfilePage     from '../pages/ProfilePage';

import { useAuth } from "../hooks/useAuth";

function AnimatedRoutes() {
  const location = useLocation(); // to know where they are in the app and how they got there
  
    const {
    user, // current user
    loading, // auth loading state
    error, // auth error
    successMessage, // auth success feedback
    signUp, // signup action
    signIn, // signin action
    signOut, // signout action
  } = useAuth();
  
  return (
    <div key={location.pathname} className="page-transition">
      <Routes location={location}>
        <Route path="/login" element={<LoginPage 
          onSignUp={signUp}
          onSignIn={signIn}
          error={error}
          successMessage={successMessage}
          loading={loading}
        />} />
        {user && (
        <Route element={<MainLayout onSignOut={signOut}/>}>
          <Route path="/dashboard"  element={<DashboardPage />} />
          <Route path="/groups"     element={<GroupsPage />} />
          <Route path="/groups/:id" element={<GroupDetailPage />} />
          <Route path="/expenses"   element={<ExpensesPage />} />
          <Route path="/balances"   element={<BalancesPage />} />
          <Route path="/chores"     element={<ChoresPage />} />
          <Route path="/profile"    element={<ProfilePage />} />
        </Route>
        )}
        {!user && !loading && (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
