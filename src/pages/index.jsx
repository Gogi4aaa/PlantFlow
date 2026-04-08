import Layout from "./Layout.jsx";
import AdminLayout from "./AdminLayout.jsx";
import Analytics from "./Analytics";
import Dashboard from "./Dashboard";
import PlantDetails from "./PlantDetails";
import Profile from "./Profile";
import Register from "./Register";
import Settings from "./Settings";
import SignIn from "./SignIn";
import LandingPage from "./LandingPage";
import AdminDashboard from "./AdminDashboard";
import AdminUsers from "./AdminUsers";
import AdminDevices from "./AdminDevices";
import AdminAlerts from "./AdminAlerts";
import AdminRoute from "@/components/auth/AdminRoute";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

export default function Pages() {
  return (
    <Router>
      <Routes>
        {/* Public routes (no layout) */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/signin" element={<SignIn />} />

        {/* Regular user routes (green layout) */}
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
        <Route path="/plant-details/:id" element={<Layout><PlantDetails /></Layout>} />
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
        <Route path="/settings" element={<Layout><Settings /></Layout>} />

        {/* Admin routes (dark purple admin layout) */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout><AdminDashboard /></AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/users" element={
          <AdminRoute>
            <AdminLayout><AdminUsers /></AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/devices" element={
          <AdminRoute>
            <AdminLayout><AdminDevices /></AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/alerts" element={
          <AdminRoute>
            <AdminLayout><AdminAlerts /></AdminLayout>
          </AdminRoute>
        } />
      </Routes>
    </Router>
  );
}