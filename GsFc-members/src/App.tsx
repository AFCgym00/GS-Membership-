import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/dashboard/DashboardLayout';
import RequireAuth from './components/dashboard/RequireAuth';
import DashboardOverview from './pages/DashboardOverview';
import MembersPage from './pages/MembersPage';
import PlansPage from './pages/PlansPage';
import RevenuePage from './pages/RevenuePage';
import { AuthProvider } from './lib/AuthProvider';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardLayout>
                  <DashboardOverview />
                </DashboardLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard/members"
            element={
              <RequireAuth>
                <DashboardLayout>
                  <MembersPage />
                </DashboardLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard/plans"
            element={
              <RequireAuth>
                <DashboardLayout>
                  <PlansPage />
                </DashboardLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard/revenue"
            element={
              <RequireAuth>
                <DashboardLayout>
                  <RevenuePage />
                </DashboardLayout>
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
