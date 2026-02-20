import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';
import { PusherProvider } from './contexts/PusherContext';
import ScrollToTop from './components/common/ScrollToTop';
import PageLoader from './components/common/PageLoader';
import PublicLayout from './layouts/PublicLayout';
import AuthLayout from './layouts/AuthLayout';
import AdminRoute from './components/admin/common/AdminRoute';
import CommissionerRoute from './components/common/CommissionerRoute';

const Landing = lazy(() => import('./pages/Landing'));
const SquarePools = lazy(() => import('./pages/SquarePools'));
const PoolDetail = lazy(() => import('./pages/PoolDetail'));
const PoolJoin = lazy(() => import('./pages/PoolJoin'));
const MarchMadness = lazy(() => import('./pages/MarchMadness'));
const LiveAuction = lazy(() => import('./pages/LiveAuction'));
const Commissioner = lazy(() => import('./pages/Commissioner'));
const CommissionerDashboard = lazy(() => import('./pages/CommissionerDashboard'));
const PaymentSettings = lazy(() => import('./pages/PaymentSettings'));
const PaymentHistory = lazy(() => import('./pages/PaymentHistory'));
const SignIn = lazy(() => import('./pages/SignIn'));
const SignUp = lazy(() => import('./pages/SignUp'));
// Admin pages
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ManagePools = lazy(() => import('./pages/admin/ManagePools'));
const CreatePool = lazy(() => import('./pages/CreatePool'));
const AdminCreatePool = lazy(() => import('./pages/admin/CreatePool'));
const ManageAuctions = lazy(() => import('./pages/admin/ManageAuctions'));
const LiveBidding = lazy(() => import('./pages/admin/LiveBidding'));
const ManageTeams = lazy(() => import('./pages/admin/ManageTeams'));
const ManageGames = lazy(() => import('./pages/admin/ManageGames'));
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers'));
const ManageBanners = lazy(() => import('./pages/admin/ManageBanners'));
const ManagePayouts = lazy(() => import('./pages/admin/ManagePayouts'));
const ManageApplications = lazy(() => import('./pages/admin/ManageApplications'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

const V4App = () => {
  return (
    <ThemeProvider>
      <UserProvider>
        <PusherProvider>
          <ScrollToTop />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public pages — top nav + footer */}
              <Route element={<PublicLayout />}>
                <Route index element={<Landing />} />
                <Route path="pools" element={<SquarePools />} />
                <Route path="pools/create" element={<CreatePool />} />
                <Route path="pools/join" element={<PoolJoin />} />
                <Route path="pools/:poolNumber" element={<PoolDetail />} />
                <Route path="march-madness" element={<MarchMadness />} />
                <Route path="march-madness/live" element={<LiveAuction />} />
                <Route path="commissioner" element={<Commissioner />} />
                <Route path="commissioner-dashboard" element={<CommissionerRoute><CommissionerDashboard /></CommissionerRoute>} />
                <Route path="settings/payment" element={<PaymentSettings />} />
                <Route path="settings/winnings" element={<PaymentHistory />} />
              </Route>

              {/* Auth pages — 2-column layout */}
              <Route element={<AuthLayout />}>
                <Route path="sign-in/*" element={<SignIn />} />
                <Route path="sign-up/*" element={<SignUp />} />
              </Route>

              {/* Admin pages — sidebar layout (Superadmin only) */}
              <Route path="admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="pools" element={<ManagePools />} />
                <Route path="pools/create" element={<AdminCreatePool />} />
                <Route path="auctions" element={<ManageAuctions />} />
                <Route path="auctions/live" element={<LiveBidding />} />
                <Route path="teams" element={<ManageTeams />} />
                <Route path="games" element={<ManageGames />} />
                <Route path="users" element={<ManageUsers />} />
                <Route path="banners" element={<ManageBanners />} />
                <Route path="applications" element={<ManageApplications />} />
                <Route path="payouts" element={<ManagePayouts />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="" replace />} />
            </Routes>
          </Suspense>
        </PusherProvider>
      </UserProvider>
    </ThemeProvider>
  );
};

export default V4App;
