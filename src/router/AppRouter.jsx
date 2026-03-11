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

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<MainLayout />}>
          <Route path="/dashboard"  element={<DashboardPage />} />
          <Route path="/groups"     element={<GroupsPage />} />
          <Route path="/groups/:id" element={<GroupDetailPage />} />
          <Route path="/expenses"   element={<ExpensesPage />} />
          <Route path="/balances"   element={<BalancesPage />} />
          <Route path="/chores"     element={<ChoresPage />} />
          <Route path="/profile"    element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
