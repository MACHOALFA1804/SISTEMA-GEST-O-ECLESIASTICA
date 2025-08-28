import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import LoginDashboard from "./components/LoginDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PastorDashboard from "./pages/PastorDashboard";
import RecepcaoDashboard from "./pages/RecepcaoDashboard";
import DizimistaDashboard from "./pages/DizimistaDashboard";
// import ProtectedRoute from './components/security/ProtectedRoute'; // Removido

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginDashboard />} />

          {/* Rota do admin sem proteção */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Rota do pastor sem proteção */}
          <Route path="/pastor" element={<PastorDashboard />} />

          {/* Rota da recepção sem proteção */}
          <Route path="/recepcao" element={<RecepcaoDashboard />} />

          {/* Rota do dizimista sem proteção */}
          <Route path="/dizimista" element={<DizimistaDashboard />} />

          {/* Rota padrão para páginas não encontradas */}
          <Route path="*" element={<LoginDashboard />} />

          {/* Sub-rotas do admin também sem proteção */}
          <Route path="/admin/visitantes" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminDashboard />} />
          <Route path="/admin/cultos" element={<AdminDashboard />} />
          <Route path="/admin/msgs" element={<AdminDashboard />} />
          <Route path="/admin/pdf" element={<AdminDashboard />} />
          <Route path="/admin/api" element={<AdminDashboard />} />
          <Route path="/admin/backup" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
