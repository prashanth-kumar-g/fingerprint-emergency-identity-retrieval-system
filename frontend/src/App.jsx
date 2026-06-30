import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import InstitutionRegistrationPage from './pages/InstitutionRegistrationPage';

// Super Admin Layouts and Pages
import SuperAdminLayout from './components/layout/SuperAdminLayout';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SuperAdminStatistics from './pages/SuperAdminStatistics';
import SuperAdminProfile from './pages/SuperAdminProfile';
import PendingRegistrations from './pages/PendingRegistrations';
import PendingRegistrationDetails from './pages/PendingRegistrationDetails';
import DataChangeRequests from './pages/DataChangeRequests';
import ReviewDataChangeRequest from './pages/ReviewDataChangeRequest';
import ManageInstitutionsList from './pages/ManageInstitutionsList';
import ManageInstitutionDetails from './pages/ManageInstitutionDetails';

// Institution Layouts and Pages
import InstitutionLayout from './components/layout/InstitutionLayout';
import InstitutionDashboard from './pages/InstitutionDashboard';
import InstitutionStatistics from './pages/InstitutionStatistics';
import InstitutionProfile from './pages/InstitutionProfile';
import EnrollOperator from './pages/EnrollOperator';
import ManageOperators from './pages/ManageOperators';
import OperatorConfiguration from './pages/OperatorConfiguration';
import RequestDataChange from './pages/RequestDataChange';

// Operator Layouts and Pages
import OperatorLayout from './components/layout/OperatorLayout';
import OperatorDashboard from './pages/OperatorDashboard';
import OperatorStatistics from './pages/OperatorStatistics';
import OperatorProfile from './pages/OperatorProfile';
import EnrollCitizens from './pages/EnrollCitizens';
import ManageCitizensGateway from './pages/ManageCitizensGateway';
import ManageCitizenDetails from './pages/ManageCitizenDetails';
import EmergencyScanGateway from './pages/EmergencyScanGateway';
import EmergencyCitizenDetails from './pages/EmergencyCitizenDetails';

import PlaceholderPage from './pages/PlaceholderPage';

import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ActivateAccount from './pages/ActivateAccount';

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
          <Route path="/activate-account/:role" element={<ActivateAccount />} />
        </Route>

        {/* Super Admin Protected Routes */}
        <Route element={<SuperAdminLayout />}>
          <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
          <Route path="/super-admin/pending-registrations" element={<PendingRegistrations />} />
          <Route path="/super-admin/pending-registrations/:id" element={<PendingRegistrationDetails />} />
          <Route path="/super-admin/data-change-requests" element={<DataChangeRequests />} />
          <Route path="/super-admin/data-change-requests/:id" element={<ReviewDataChangeRequest />} />
          <Route path="/super-admin/manage-institutions" element={<ManageInstitutionsList />} />
          <Route path="/super-admin/manage-institutions/:id" element={<ManageInstitutionDetails />} />
          <Route path="/super-admin/statistics" element={<SuperAdminStatistics />} />
          <Route path="/super-admin/settings" element={<SuperAdminProfile />} />
        </Route>

        {/* Institution Protected Routes */}
        <Route element={<InstitutionLayout />}>
          <Route path="/institution/dashboard" element={<InstitutionDashboard />} />
          <Route path="/institution/enroll-operators" element={<EnrollOperator />} />
          <Route path="/institution/manage-operators" element={<ManageOperators />} />
          <Route path="/institution/manage-operators/:id" element={<OperatorConfiguration />} />
          <Route path="/institution/request-data-change" element={<RequestDataChange />} />
          <Route path="/institution/statistics" element={<InstitutionStatistics />} />
          <Route path="/institution/settings" element={<InstitutionProfile />} />
        </Route>

        {/* Operator Protected Routes */}
        <Route element={<OperatorLayout />}>
          <Route path="/operator/dashboard" element={<OperatorDashboard />} />
          <Route path="/operator/enroll-citizens" element={<EnrollCitizens />} />
          <Route path="/operator/manage-citizens" element={<ManageCitizensGateway />} />
          <Route path="/operator/manage-citizens/:id" element={<ManageCitizenDetails />} />
          <Route path="/operator/emergency-scan" element={<EmergencyScanGateway />} />
          <Route path="/operator/emergency-scan/:id" element={<EmergencyCitizenDetails />} />
          <Route path="/operator/statistics" element={<OperatorStatistics />} />
          <Route path="/operator/settings" element={<OperatorProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
