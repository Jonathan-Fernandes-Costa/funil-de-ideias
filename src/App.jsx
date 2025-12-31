import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar'; 
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { IdeiasProvider } from './context/IdeiasContext';
import { ToastProvider } from './components/Toast';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Ideias } from './pages/Ideias';
import { NovaIdeia } from './pages/NovaIdeia';
import { Avaliacao } from './pages/Avaliacao';
import { DetalhesIdeia } from './pages/DetalhesIdeia';

function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 transition-all duration-300">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
      <AuthProvider>
        <IdeiasProvider>
          <Routes>
            {/* Rota pública */}
            <Route path="/login" element={<Login />} />
            
            {/* Rotas protegidas */}
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout><Dashboard /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/ideias" element={
              <ProtectedRoute>
                <AppLayout><Ideias /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/ideias/nova" element={
              <ProtectedRoute>
                <AppLayout><NovaIdeia /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/ideias/:id" element={
              <ProtectedRoute>
                <AppLayout><DetalhesIdeia /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/avaliacao" element={
              <ProtectedRoute>
                <AppLayout><Avaliacao /></AppLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </IdeiasProvider>
      </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
