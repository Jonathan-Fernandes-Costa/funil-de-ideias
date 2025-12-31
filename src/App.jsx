import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar, SidebarProvider, MobileMenuButton } from './components/Sidebar'; 
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
      
      {/* Container principal */}
      <div className="flex-1 lg:ml-64 transition-all duration-300">
        {/* Header mobile */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 sticky top-0 z-30">
          <MobileMenuButton />
          <h1 className="text-lg font-bold text-gray-800">Funil de Ideias</h1>
        </header>
        
        {/* Conteúdo */}
        <main className="p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
      <SidebarProvider>
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
      </SidebarProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
