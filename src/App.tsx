// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast'; // <-- 1. Importar Toaster
import { LoginPage } from "./pages/LoginPage/LoginPage";
import { HomePage } from "./pages/HomePage/HomePage";
import { SettingsPage } from "./pages/SettingsPage/SettingsPage";
import { InventoryPage } from "./pages/InventoryPage/InventoryPage";
import { DebtsPage } from "./pages/DebtsPage/DebtsPage";
import { ReportsPage } from "./pages/ReportsPage/ReportsPage";
import { RemindersPage } from "./pages/RemindersPage/RemindersPage";
import { InvoicingPage } from "./pages/InvoicingPage/InvoicingPage";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { Layout } from "./components/common/Layout";

function App() {
  return (
    <BrowserRouter>
      {/* 2. Añadir el componente Toaster aquí */}
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<ProtectedRoute><Layout><HomePage /></Layout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Layout><SettingsPage /></Layout></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><Layout><InventoryPage /></Layout></ProtectedRoute>} />
        <Route path="/debts" element={<ProtectedRoute><Layout><DebtsPage /></Layout></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Layout><ReportsPage /></Layout></ProtectedRoute>} />
        <Route path="/reminders" element={<ProtectedRoute><Layout><RemindersPage /></Layout></ProtectedRoute>} />
        <Route path="/invoicing" element={<ProtectedRoute><Layout><InvoicingPage /></Layout></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;