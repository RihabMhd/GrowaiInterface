import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Dashboard from "../pages/Dashboard";
import AuthCallback from "../pages/AuthCallback";
import ProtectedRoute from "../auth/ProtectedRoute";
import DashboardLayout from "../components/DashboardLayout";
import PlaceholderPage from "../pages/PlaceholderPage";

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
          <Route path="/commandes/toutes" element={<PlaceholderPage title="Toutes les commandes" />} />
          <Route path="/commandes/abandonnees" element={<PlaceholderPage title="Commandes abandonnées" />} />
          <Route path="/commandes" element={<PlaceholderPage title="Commandes" />} />
          <Route path="/clients" element={<PlaceholderPage title="Clients" />} />
          <Route path="/products" element={<PlaceholderPage title="Products" />} />
          <Route path="/companies" element={<PlaceholderPage title="Companies" />} />
          <Route path="/status" element={<PlaceholderPage title="Status" />} />
          <Route path="/team" element={<PlaceholderPage title="Team" />} />
          <Route path="/affilies" element={<PlaceholderPage title="Affiliés" />} />
          
          <Route path="/sources/shopify" element={<PlaceholderPage title="Shopify Integration" />} />
          <Route path="/sources/google-sheets" element={<PlaceholderPage title="Google Sheets Integration" />} />
          
          <Route path="/apps/whatsapp" element={<PlaceholderPage title="WhatsApp PRO" />} />
          <Route path="/apps/tarifs" element={<PlaceholderPage title="Tarifs" />} />

          <Route path="/settings" element={<PlaceholderPage title="Paramètres" />} />
          <Route path="/help" element={<PlaceholderPage title="Centre d'aide" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}