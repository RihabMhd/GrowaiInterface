import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Dashboard from "../pages/Dashboard";
import AuthCallback from "../pages/AuthCallback";
import ProtectedRoute from "../auth/ProtectedRoute";
import DashboardLayout from "../components/DashboardLayout";
import PlaceholderPage from "../pages/PlaceholderPage";
import Team from "../pages/Team";
import Help from "../pages/Help";

import Orders from "../pages/Orders";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Authenticated Layout Routes */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/commandes/toutes" element={<Orders />} />
          <Route path="/commandes/abandonnees" element={<Orders />} />
          <Route path="/commandes" element={<Orders />} />
          <Route path="/clients" element={<PlaceholderPage title="Clients" />} />
          <Route path="/products" element={<PlaceholderPage title="Products" />} />
          <Route path="/companies" element={<PlaceholderPage title="Companies" />} />
          <Route path="/status" element={<PlaceholderPage title="Status" />} />
          <Route path="/team" element={<Team />} />
          <Route path="/affilies" element={<PlaceholderPage title="Affiliés" />} />
          
          <Route path="/sources/shopify" element={<PlaceholderPage title="Shopify Integration" />} />
          <Route path="/sources/google-sheets" element={<PlaceholderPage title="Google Sheets Integration" />} />
          
          <Route path="/apps/whatsapp" element={<PlaceholderPage title="WhatsApp PRO" />} />
          <Route path="/apps/tarifs" element={<PlaceholderPage title="Tarifs" />} />

          <Route path="/settings" element={<PlaceholderPage title="Paramètres" />} />
          <Route path="/help" element={<Help />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}