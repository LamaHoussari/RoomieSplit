import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout      from '../layouts/MainLayout';
import LoginPage       from '../pages/LoginPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import DashboardPage   from '../pages/DashboardPage';
import GroupsPage      from '../pages/GroupsPage';
import GroupDetailPage from '../pages/GroupDetailPage';
import ExpensesPage    from '../pages/ExpensesPage';
import BalancesPage    from '../pages/BalancesPage';
import ChoresPage      from '../pages/ChoresPage';
import TrackingPage    from '../pages/TrackingPage';
import ProfilePage     from '../pages/ProfilePage';
import Users from '../pages/AdminUsersPage';
import Groups from '../pages/AdminGroupsPage';
import AuditLog from '../pages/AdminAuditlogPage';



import { useAuth } from "../hooks/useAuth";
import { useState } from 'react';

function AnimatedRoutes() {
  
  const [chosenGroup, setChosenGroup] = useState<string>("");

  const {
    user, // current user
    loading, // auth loading state
    error, // auth error
    successMessage, // auth success feedback
    clearFeedback, // clear auth feedback
    signUp, // signup action
    signIn, // signin action
    signOut, // signout action
  } = useAuth();
  
  return (
    <div className="page-transition">
      <Routes>
        <Route path="/" element={<Navigate to={user ? (user.isAdmin ? "/admin" : "/dashboard") : "/login"} replace />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/login" element={user ? (
          <Navigate to={user.isAdmin ? "/admin" : "/dashboard"} replace />
        ) : (
          <LoginPage 
            onSignUp={signUp}
            onSignIn={signIn}
            error={error}
            successMessage={successMessage}
            onClearFeedback={clearFeedback}
            loading={loading}
          />
        )} />
        {user && (
        <Route element={<MainLayout onSignOut={signOut} user={user}/>}>
          {user.isAdmin ? (
            <>
              <Route path="/admin" element={<AdminDashboardPage user={user} />} />
              <Route path="/admin/users" element={<Users />} />
              <Route path="/admin/groups" element={<Groups />} />
              <Route path="/admin/audit" element={<AuditLog />} />
              <Route path="/*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            <>
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
              <Route path="/tracking"   element={<TrackingPage userId={user.id}
              chosenGroup={chosenGroup} setChosenGroup={setChosenGroup}/>} />
              <Route path="/profile"    element={<ProfilePage user={user} />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </>
          )}
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
