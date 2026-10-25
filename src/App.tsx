import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import { ProtectedRoute, PublicAuthRoute, AdminRoute } from './components/Auth/ProtectedRoute';

import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { ForgotPassword } from './pages/Auth/ForgotPassword';
import { DashboardPage } from './pages/DashboardPage';
import { AccountsPage } from './pages/AccountsPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { GoalsPage } from './pages/GoalsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminPage } from './pages/AdminPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FinanceProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route
              path="/login"
              element={
                <PublicAuthRoute>
                  <Login />
                </PublicAuthRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicAuthRoute>
                  <Register />
                </PublicAuthRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicAuthRoute>
                  <ForgotPassword />
                </PublicAuthRoute>
              }
            />

            {/* Protected SaaS Application Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/accounts"
              element={
                <ProtectedRoute>
                  <AccountsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <TransactionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/budgets"
              element={
                <ProtectedRoute>
                  <BudgetsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/goals"
              element={
                <ProtectedRoute>
                  <GoalsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPage defaultTab="accounts" />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/accounts"
              element={
                <AdminRoute>
                  <AdminPage defaultTab="accounts" />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/transactions"
              element={
                <AdminRoute>
                  <AdminPage defaultTab="transactions" />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/budgets"
              element={
                <AdminRoute>
                  <AdminPage defaultTab="budgets" />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/goals"
              element={
                <AdminRoute>
                  <AdminPage defaultTab="goals" />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <AdminRoute>
                  <AdminPage defaultTab="reports" />
                </AdminRoute>
              }
            />

            {/* Root and Catch-All Redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </FinanceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
