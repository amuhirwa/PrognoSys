import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LayOut from "./pages/LayOut";
import TestResults from "./components/Patients/TestResults";
import TreatmentRecommendations from "./components/TreatmentRecommendations/TreatmentRecommendations";
import PredictionResults from "./components/Predictions/PredictionResults";
import PatientRecords from "./components/PatientRecords";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { store } from "@/app/store";
import AuthPages from "./components/Auth/AuthPages";
import DoctorDashboard from "./components/Dashboard/DoctorDashboard";
import { PatientList } from "./components/PatientsProfiles";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./components/Dashboard/Dashboard";
import { NotificationProvider } from '@/contexts/NotificationContext';
import PredictionsList from "./components/Predictions/PredictionsList";
import TestResultsList from "./components/Patients/TestResultsList";
import AdminDashboard from "./components/Admin/AdminDashboard";
import AdminLayout from "./layouts/AdminLayout";
import UserManagement from "./components/Admin/UserManagement";
import ModelManagement from "./components/Admin/ModelManagement";
import ResourceAllocation from "./components/Admin/ResourceAllocation";

function App() {
  return (
    <NotificationProvider>
      <Toaster />
      <Provider store={store}>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<AuthPages />} />
            <Route path="/register" element={<AuthPages />} />
            <Route path="/" element={<LandingPage />} />

            {/* Admin routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="models" element={<ModelManagement />} />
              <Route path="resources" element={<ResourceAllocation />} />
            </Route>

            {/* Doctor/Patient routes */}
            <Route path="/" element={<LayOut />}>
              <Route path="dashboard" element={<DoctorDashboard />} />
              <Route path="patients" element={<PatientList />} />
              <Route path="patient/:patientId" element={<PatientRecords />} />
              <Route path="patient/:patientId/test-results" element={<TestResults />} />
              <Route path="predictions/:testId" element={<PredictionResults />} />
              <Route path="treatments" element={<TreatmentRecommendations />} />
              <Route path="treatments/:predictionId" element={<TreatmentRecommendations />} />
              <Route path="predictions" element={<PredictionsList />} />
              <Route path="patient/:patientId/test-results-list" element={<TestResultsList />} />
              <Route path="dash" element={<Dashboard />} />
            </Route>

            {/* Catch all route - redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </Provider>
    </NotificationProvider>
  );
}

export default App;