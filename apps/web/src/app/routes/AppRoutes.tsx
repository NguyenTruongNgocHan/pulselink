import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AppLayout } from "../../components/layout/AppLayout";
import { ProtectedRoute } from "../../features/auth/ProtectedRoute";
import { LandingPage } from "../../pages/landing/LandingPage";
import { LoginPage } from "../../pages/auth/LoginPage";
import { NotFoundPage } from "../../pages/NotFoundPage";
import { RegisterPage } from "../../pages/auth/RegisterPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
 

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
