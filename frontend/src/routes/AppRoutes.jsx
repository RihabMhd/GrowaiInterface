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
import Status from "../pages/status";
import Products from "../pages/Products";
import Orders from "../pages/Orders";
import ClientsPage from "../pages/ClientsPage";
import CompaniesPage from "../pages/CompaniesPage";
import AffiliatesPage from "../pages/AffiliatesPage";
import ShopifyIntegrationPage from "../pages/ShopifyIntegrationPage";
import GoogleIntegrationPage from "../pages/GoogleIntegrationPage.";
import Parametre from "../pages/Parametre";
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
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/products" element={<Products />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/status" element={<Status />} />
          <Route path="/team" element={<Team />} />
          <Route path="/affilies" element={<AffiliatesPage />} />
          
          <Route path="/integrations/shopify" element={<ShopifyIntegrationPage />} />
          <Route path="/sources/google-sheets" element={<GoogleIntegrationPage />} />
          
          <Route path="/apps/whatsapp" element={<PlaceholderPage title="WhatsApp PRO" />} />
          <Route path="/apps/tarifs" element={<PlaceholderPage title="Tarifs" />} />

          <Route path="/settings" element={<Parametre />} />
          <Route path="/help" element={<Help />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}