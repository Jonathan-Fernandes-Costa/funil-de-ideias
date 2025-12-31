import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usuariosService } from '../services/ideiasService';
import { useToast } from './Toast';

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const toast = useToast();
  
  const [perfil, setPerfil] = useState(null);
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [nome, setNome] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (user?.id) {
      carregarPerfil();
    }
  }, [user?.id]);

  const carregarPerfil = async () => {
    try {
      const data = await usuariosService.buscarPorId(user.id);
      setPerfil(data);
      setNome(data?.nome || '');
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
    }
  };

  const handleSalvarNome = async () => {
    if (!nome.trim()) return;
    try {
      setSalvando(true);
      await usuariosService.atualizarPerfil(user.id, { nome: nome.trim() });
      await carregarPerfil();
      setEditandoPerfil(false);
      toast.success('Nome atualizado!');
    } catch (err) {
      console.error('Erro ao salvar nome:', err);
      toast.error('Erro ao atualizar nome');
    } finally {
      setSalvando(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast.info('Até logo!');
    navigate('/login');
  };

  // Função auxiliar para destacar o link ativo
  const isActive = (path) => {
    return location.pathname === path 
      ? "bg-blue-700 text-white shadow-sm" 
      : "text-blue-100 hover:bg-blue-800 hover:text-white";
  };

  return (
    <aside className="w-64 bg-blue-900 min-h-screen flex flex-col shadow-xl fixed left-0 top-0 z-50">
      
      {/* Logo da Empresa */}
      <div className="p-6 border-b border-blue-800">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Funil de Ideias 🚀
        </h1>
        <p className="text-xs text-blue-300 mt-1">Gestão de Inovação</p>
      </div>

      {/* Menu de Navegação */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        
        <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${isActive('/')}`}>
          <span>🏠</span> Dashboard
        </Link>

        <Link to="/ideias" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${isActive('/ideias')}`}>
          <span>💡</span> Mural de Ideias
        </Link>

        <Link to="/avaliacao" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${isActive('/avaliacao')}`}>
          <span>⚖️</span> Avaliação
        </Link>

      </nav>

      {/* Botão Nova Ideia */}
      <div className="px-4 pb-4">
        <Link to="/ideias/nova" className="flex items-center justify-center w-full bg-white text-blue-900 font-bold py-3 rounded-lg hover:bg-gray-100 transition shadow-lg">
          + Nova Ideia
        </Link>
      </div>

      {/* Perfil do Usuário e Logout */}
      <div className="p-4 border-t border-blue-800">
        {editandoPerfil ? (
          <div className="space-y-2">
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome"
              className="w-full px-3 py-2 rounded-lg text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSalvarNome}
                disabled={salvando}
                className="flex-1 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                onClick={() => setEditandoPerfil(false)}
                className="flex-1 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <>
            <div 
              className="flex items-center gap-3 mb-3 cursor-pointer hover:bg-blue-800 p-2 rounded-lg -mx-2 transition"
              onClick={() => setEditandoPerfil(true)}
              title="Clique para editar seu perfil"
            >
              {perfil?.avatar_url ? (
                <img 
                  src={perfil.avatar_url} 
                  alt="Avatar" 
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                  {(perfil?.nome || user?.email)?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {perfil?.nome || user?.email?.split('@')[0] || 'Usuário'}
                </p>
                <p className="text-xs text-blue-300 truncate">{user?.email}</p>
              </div>
              <span className="text-blue-400 text-xs">✏️</span>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full text-sm text-blue-200 hover:text-white hover:bg-blue-800 py-2 rounded-lg transition-colors"
            >
              Sair da conta
            </button>
          </>
        )}
      </div>

    </aside>
  );
}