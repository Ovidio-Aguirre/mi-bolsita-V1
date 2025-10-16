// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage/LoginPage";
import { HomePage } from "./pages/HomePage/HomePage";
import { SettingsPage } from "./pages/SettingsPage/SettingsPage";
import { InventoryPage } from "./pages/InventoryPage/InventoryPage";
import { DebtsPage } from "./pages/DebtsPage/DebtsPage";
import { ReportsPage } from "./pages/ReportsPage/ReportsPage";
import { RemindersPage } from "./pages/RemindersPage/RemindersPage";
import { InvoicingPage } from "./pages/InvoicingPage/InvoicingPage"; // <-- 1. Importar
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { Layout } from "./components/common/Layout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<ProtectedRoute><Layout><HomePage /></Layout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Layout><SettingsPage /></Layout></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><Layout><InventoryPage /></Layout></ProtectedRoute>} />
        <Route path="/debts" element={<ProtectedRoute><Layout><DebtsPage /></Layout></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Layout><ReportsPage /></Layout></ProtectedRoute>} />
        <Route path="/reminders" element={<ProtectedRoute><Layout><RemindersPage /></Layout></ProtectedRoute>} />
        <Route path="/invoicing" element={<ProtectedRoute><Layout><InvoicingPage /></Layout></ProtectedRoute>} /> {/* <-- 2. Añadir */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;