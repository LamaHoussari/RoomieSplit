import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import { useState } from 'react';

function AnimatedRoutes() {
  
  const [chosenGroup, setChosenGroup] = useState<string>("");

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
    <div className="page-transition">
      <Routes>
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
        <Route path="/login" element={<LoginPage 
          onSignUp={signUp}
          onSignIn={signIn}
          error={error}
          successMessage={successMessage}
          loading={loading}
        />} />
        {user && (
        <Route element={<MainLayout onSignOut={signOut}/>}>
          <Route path="/dashboard"  element={<DashboardPage userId={user.id} 
          chosenGroup={chosenGroup} setChosenGroup={setChosenGroup} />} />
          <Route path="/groups"     element={<GroupsPage userId={user.id} />} />
          <Route path="/groups/:id" element={<GroupDetailPage userId={user.id} />} />
          <Route path="/expenses"   element={<ExpensesPage userId={user.id} 
          chosenGroup={chosenGroup} setChosenGroup={setChosenGroup}/>} />
          <Route path="/balances"   element={<BalancesPage userId={user.id} 
          chosenGroup={chosenGroup} setChosenGroup={setChosenGroup}/>} />
          <Route path="/chores"     element={<ChoresPage userId={user.id} 
          chosenGroup={chosenGroup} setChosenGroup={setChosenGroup}/>} />
          <Route path="/profile"    element={<ProfilePage user={user} />} />
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
