import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import DashboardLayout from "@/components/DashboardLayout";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import ProductsPage from "@/pages/ProductsPage";
import OrdersPage from "@/pages/OrdersPage";
import StorePage from "@/pages/StorePage";
import DueToExpiryPage from "@/pages/DueToExpiryPage";
import ExpiredItemsPage from "@/pages/ExpiredItemsPage";
import ExpensesPage from "@/pages/ExpensesPage";
import SalesPage from "@/pages/SalesPage";
import ReportPage from "@/pages/ReportPage";
import FinancePage from "@/pages/FinancePage";
import NotesPage from "@/pages/NotesPage";
import EditProfilePage from "@/pages/EditProfilePage";
import EmployeesPage from "@/pages/EmployeesPage";

import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/store" element={<StorePage />} />
                <Route path="/store/due-to-expiry" element={<DueToExpiryPage />} />
                <Route path="/store/expired" element={<ExpiredItemsPage />} />
                <Route path="/expenses" element={<ExpensesPage />} />
                <Route path="/sales" element={<SalesPage />} />
                <Route path="/finance" element={<FinancePage />} />
                <Route path="/notes" element={<NotesPage />} />
                <Route path="/report" element={<ReportPage />} />
                <Route path="/edit-profile" element={<EditProfilePage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
