import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import AddMember from "./pages/AddMember";
import MemberProfile from "./pages/MemberProfile";
import AddMedicine from "./pages/AddMedicine";
import EmergencyCard from "./pages/EmergencyCard";
import Placeholder from "./pages/Placeholder";
import Today from "./pages/Today";
import History from "./pages/History";
import Doctors from "./pages/Doctors";
import Settings from "./pages/Settings";
import Medicines from "./pages/Medicines";
import MedicineProfile from "./pages/MedicineProfile";

import Register from "./pages/Register";
import RegisterMember from "./pages/RegisterMember";
import PendingApproval from "./pages/PendingApproval";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import SuperAdminOverview from "./pages/SuperAdminOverview";
import SuperAdminFamilies from "./pages/SuperAdminFamilies";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-member" element={<RegisterMember />} />
        <Route path="/pending" element={<ProtectedRoute><PendingApproval /></ProtectedRoute>} />

        {/* Super Admin Layout */}
        <Route
          element={
            <ProtectedRoute requireSuperAdmin>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/superadmin/dashboard" element={<SuperAdminOverview />} />
          <Route path="/superadmin/approvals" element={<SuperAdminDashboard />} />
          <Route path="/superadmin/families" element={<SuperAdminFamilies />} />
        </Route>

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/members" element={<Members />} />
          <Route path="/members/new" element={<AddMember />} />
          <Route path="/members/:id/edit" element={<AddMember />} />
          <Route path="/members/:id/medicines/new" element={<AddMedicine />} />
          <Route path="/members/:id" element={<MemberProfile />} />
          <Route path="/emergency-card/:id" element={<EmergencyCard />} />
          <Route path="/medicines" element={<Medicines />} />
          <Route path="/medicines/:id" element={<MedicineProfile />} />
          <Route path="/medicines/:id/edit" element={<AddMedicine />} />
          <Route path="/today" element={<Today />} />
          <Route path="/history" element={<History />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/emergency-card" element={<EmergencyCard />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
