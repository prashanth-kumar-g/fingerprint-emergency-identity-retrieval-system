import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import InstitutionRegistrationPage from './pages/InstitutionRegistrationPage';

// Super Admin Layouts and Pages
import SuperAdminLayout from './components/layout/SuperAdminLayout';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SuperAdminStatistics from './pages/SuperAdminStatistics';

// Institution Layouts and Pages
import InstitutionLayout from './components/layout/InstitutionLayout';
import InstitutionDashboard from './pages/InstitutionDashboard';
import InstitutionStatistics from './pages/InstitutionStatistics';

// Operator Layouts and Pages
import OperatorLayout from './components/layout/OperatorLayout';
import OperatorDashboard from './pages/OperatorDashboard';
import OperatorStatistics from './pages/OperatorStatistics';

import PlaceholderPage from './pages/PlaceholderPage';

import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login/:role" element={<LoginPage />} />
          <Route path="/register/institution" element={<InstitutionRegistrationPage />} />
          <Route path="/forgot-password/:role" element={<ForgotPassword />} />
          <Route path="/reset-password/:role" element={<ResetPassword />} />
        </Route>

        {/* Super Admin Protected Routes */}
        <Route element={<SuperAdminLayout />}>
          <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
          <Route path="/super-admin/registrations" element={<PlaceholderPage title="Pending Registrations" />} />
          <Route path="/super-admin/data-changes" element={<PlaceholderPage title="Data Change Requests" />} />
          <Route path="/super-admin/institutions" element={<PlaceholderPage title="Manage Registered Institutions" />} />
          <Route path="/super-admin/statistics" element={<SuperAdminStatistics />} />
          <Route path="/super-admin/settings" element={<PlaceholderPage title="Settings & Profile" />} />
        </Route>

        {/* Institution Protected Routes */}
        <Route element={<InstitutionLayout />}>
          <Route path="/institution/dashboard" element={<InstitutionDashboard />} />
          <Route path="/institution/enroll-operators" element={<PlaceholderPage title="Enroll Operators" />} />
          <Route path="/institution/manage-operators" element={<PlaceholderPage title="Manage Operators" />} />
          <Route path="/institution/data-change" element={<PlaceholderPage title="Request Data Change" />} />
          <Route path="/institution/statistics" element={<InstitutionStatistics />} />
          <Route path="/institution/settings" element={<PlaceholderPage title="Settings & Profile" />} />
        </Route>

        {/* Operator Protected Routes */}
        <Route element={<OperatorLayout />}>
          <Route path="/operator/dashboard" element={<OperatorDashboard />} />
          <Route path="/operator/enroll-citizens" element={<PlaceholderPage title="Enroll Citizens" />} />
          <Route path="/operator/manage-citizens" element={<PlaceholderPage title="Manage Citizens" />} />
          <Route path="/operator/emergency-scan" element={<PlaceholderPage title="Emergency Scan" />} />
          <Route path="/operator/statistics" element={<OperatorStatistics />} />
          <Route path="/operator/settings" element={<PlaceholderPage title="Settings & Profile" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
