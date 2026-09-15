import { Navigate, Route, Routes } from "react-router-dom";
import { GuestRoute, ProtectedRoute, RequirePermission } from "@/app/routing";
import { DashboardLayout } from "@/components/layout";
import { ForgotPasswordPage, LoginPage, ResetPasswordPage } from "@/pages/auth";
import { HomePage } from "@/pages/home";
import { AvailableUsernamesPage } from "@/pages/available-usernames";
import { SpeedsPage } from "@/pages/speeds";
import { SupportPage } from "@/pages/support";
import { OnlineUsersPage } from "@/pages/online-users/OnlineUsersPage";
import { AddCustomerPage, CustomerProfilePage, CustomersPage } from "@/pages/customers";
import { ExpiringPage } from "@/pages/expiring/ExpiringPage";
import { FinancePage } from "@/pages/finance/FinancePage";
import { InvoicesPage } from "@/pages/finance/InvoicesPage";
import { SmsPage } from "@/pages/sms";
import { StoppedPage } from "@/pages/stopped";
import { StatisticsPage } from "@/pages/statistics/StatisticsPage";
import { SubscriberProfilePage, SubscribersPage } from "@/pages/subscribers";
import { UsagePage } from "@/pages/usage";
import { ActivityLogsPage } from "@/pages/activity-logs/ActivityLogsPage";
import { AdminUsersPage } from "@/pages/users/AdminUsersPage";
import {
  ExcelAvailableUsernamesPage,
  ExcelSubscribersPage,
  ExcelUsernameHistoryPage,
  ExcelToolsPage,
  SettingsDataPage,
  SettingsPage,
  SettingsRoutersPage,
  SettingsVpnPage,
} from "@/pages/settings";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<HomePage />} />

          <Route
            path="statistics"
            element={
              <RequirePermission anyOf={["dashboard.view", "subscription_statistics.view"]}>
                <StatisticsPage />
              </RequirePermission>
            }
          />
          <Route
            path="customers"
            element={
              <RequirePermission permission="customers.view" adminOnly>
                <CustomersPage />
              </RequirePermission>
            }
          />
          <Route
            path="customers/new"
            element={
              <RequirePermission permission="subscribers.create">
                <AddCustomerPage />
              </RequirePermission>
            }
          />
          <Route
            path="customers/:lineId"
            element={
              <RequirePermission permission="customers.view" adminOnly>
                <CustomerProfilePage />
              </RequirePermission>
            }
          />
          <Route
            path="subscribers"
            element={
              <RequirePermission permission="subscribers.view">
                <SubscribersPage />
              </RequirePermission>
            }
          />
          <Route
            path="subscribers/new"
            element={<Navigate to="/customers/new" replace />}
          />
          <Route
            path="subscribers/:lineId/:tab?"
            element={
              <RequirePermission permission="subscribers.view">
                <SubscriberProfilePage />
              </RequirePermission>
            }
          />
          <Route
            path="online-users"
            element={
              <RequirePermission permission="online_users.view">
                <OnlineUsersPage />
              </RequirePermission>
            }
          />
          <Route
            path="usage"
            element={
              <RequirePermission permission="subscribers.view">
                <UsagePage />
              </RequirePermission>
            }
          />
          <Route
            path="expiring"
            element={
              <RequirePermission permission="expired.view">
                <ExpiringPage />
              </RequirePermission>
            }
          />
          <Route
            path="stopped"
            element={
              <RequirePermission permission="disabled.view">
                <StoppedPage />
              </RequirePermission>
            }
          />
          <Route
            path="speeds"
            element={
              <RequirePermission permission="speeds.view">
                <SpeedsPage />
              </RequirePermission>
            }
          />
          <Route
            path="available-usernames"
            element={
              <RequirePermission permission="available_usernames.view">
                <AvailableUsernamesPage />
              </RequirePermission>
            }
          />
          <Route
            path="available-usernames/:speedValue"
            element={
              <RequirePermission permission="available_usernames.view">
                <AvailableUsernamesPage />
              </RequirePermission>
            }
          />
          <Route
            path="sms"
            element={
              <RequirePermission permission="sms.view">
                <SmsPage />
              </RequirePermission>
            }
          />
          <Route
            path="sms/:section"
            element={
              <RequirePermission permission="sms.view">
                <SmsPage />
              </RequirePermission>
            }
          />
          <Route
            path="support"
            element={
              <RequirePermission permission="support.view">
                <SupportPage />
              </RequirePermission>
            }
          />
          <Route
            path="finance/invoices"
            element={
              <RequirePermission permission="finance.view">
                <InvoicesPage />
              </RequirePermission>
            }
          />
          <Route
            path="finance"
            element={
              <RequirePermission permission="finance.view">
                <FinancePage />
              </RequirePermission>
            }
          />
          <Route
            path="settings"
            element={
              <RequirePermission permission="settings.view">
                <SettingsPage />
              </RequirePermission>
            }
          />
          <Route
            path="settings/data"
            element={
              <RequirePermission permission="settings.view">
                <SettingsDataPage />
              </RequirePermission>
            }
          />
          <Route
            path="settings/routers"
            element={
              <RequirePermission permission="settings.view">
                <SettingsRoutersPage />
              </RequirePermission>
            }
          />
          <Route
            path="settings/vpn"
            element={
              <RequirePermission permission="settings.view">
                <SettingsVpnPage />
              </RequirePermission>
            }
          />
          <Route
            path="settings/excel"
            element={
              <RequirePermission permission="settings.view">
                <ExcelToolsPage />
              </RequirePermission>
            }
          />
          <Route
            path="settings/excel/available-usernames"
            element={
              <RequirePermission permission="settings.view">
                <ExcelAvailableUsernamesPage />
              </RequirePermission>
            }
          />
          <Route
            path="settings/excel/subscribers"
            element={
              <RequirePermission permission="settings.view">
                <ExcelSubscribersPage />
              </RequirePermission>
            }
          />
          <Route
            path="settings/excel/username-history"
            element={
              <RequirePermission permission="settings.view">
                <ExcelUsernameHistoryPage />
              </RequirePermission>
            }
          />
          <Route
            path="users"
            element={
              <RequirePermission permission="users.view">
                <AdminUsersPage />
              </RequirePermission>
            }
          />
          <Route
            path="logs"
            element={
              <RequirePermission permission="logs.view">
                <ActivityLogsPage />
              </RequirePermission>
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
