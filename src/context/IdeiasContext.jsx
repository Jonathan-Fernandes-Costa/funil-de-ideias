import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { ideiasService, votosService, comentariosService } from '../services/ideiasService';
import { useAuth } from './AuthContext';

const IdeiasContext = createContext();

export function IdeiasProvider({ children }) {
  const { user } = useAuth();
  const [ideias, setIdeias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carregar ideias do Supabase
  const carregarIdeias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ideiasService.listar();
      setIdeias(data || []);
    } catch (err) {
      console.error('Erro ao carregar ideias:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar ideias quando o usuário estiver autenticado
  useEffect(() => {
    if (user) {
      carregarIdeias();
    }
  }, [user, carregarIdeias]);

  // Adicionar nova ideia
  const adicionarIdeia = async (novaIdeia) => {
    try {
      const ideiaCriada = await ideiasService.criar(novaIdeia, user.id);
      await carregarIdeias(); // Recarrega para pegar os contadores
      return ideiaCriada;
    } catch (err) {
      console.error('Erro ao criar ideia:', err);
      throw err;
    }
  };

  // Buscar ideia por ID
  const buscarIdeia = async (id) => {
    try {
      return await ideiasService.buscarPorId(id);
    } catch (err) {
      console.error('Erro ao buscar ideia:', err);
      throw err;
    }
  };

  // Atualizar status
  const atualizarStatus = async (id, novoStatus, justificativa = null) => {
    try {
      await ideiasService.atualizarStatus(id, novoStatus, justificativa);
      await carregarIdeias();
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      throw err;
    }
  };

  // Toggle voto
  const toggleVoto = async (ideiaId) => {
    try {
      const votou = await votosService.toggleVoto(ideiaId, user.id);
      await carregarIdeias();
      return votou;
    } catch (err) {
      console.error('Erro ao votar:', err);
      throw err;
    }
  };

  // Verificar se usuário votou
  const verificarVoto = async (ideiaId) => {
    try {
      return await votosService.verificarVoto(ideiaId, user.id);
    } catch (err) {
      console.error('Erro ao verificar voto:', err);
      return false;
    }
  };

  // Carregar comentários
  const carregarComentarios = async (ideiaId) => {
    try {
      return await comentariosService.listar(ideiaId);
    } catch (err) {
      console.error('Erro ao carregar comentários:', err);
      throw err;
    }
  };

  // Adicionar comentário
  const adicionarComentario = async (ideiaId, conteudo) => {
    try {
      const comentario = await comentariosService.criar(ideiaId, user.id, conteudo);
      await carregarIdeias();
      return comentario;
    } catch (err) {
      console.error('Erro ao adicionar comentário:', err);
      throw err;
    }
  };

  // Deletar comentário
  const deletarComentario = async (comentarioId, ideiaId) => {
    try {
      await comentariosService.deletar(comentarioId);
      await carregarIdeias();
    } catch (err) {
      console.error('Erro ao deletar comentário:', err);
      throw err;
    }
  };

  // Buscar ideias por status
  const buscarPorStatus = async (status) => {
    try {
      return await ideiasService.buscarPorStatus(status);
    } catch (err) {
      console.error('Erro ao buscar por status:', err);
      throw err;
    }
  };

  // Contar por status
  const contarPorStatus = async () => {
    try {
      return await ideiasService.contarPorStatus();
    } catch (err) {
      console.error('Erro ao contar:', err);
      return { total: 0, 'Geração': 0, 'Em Definição': 0, 'Pronta para Avaliação': 0, 'Aprovada': 0, 'Arquivada': 0 };
    }
  };

  return (
    <IdeiasContext.Provider value={{ 
      ideias, 
      loading, 
      error,
      adicionarIdeia,
      buscarIdeia,
      atualizarStatus,
      toggleVoto,
      verificarVoto,
      carregarComentarios,
      adicionarComentario,
      deletarComentario,
      buscarPorStatus,
      contarPorStatus,
      recarregar: carregarIdeias
    }}>
      {children}
    </IdeiasContext.Provider>
  );
}

export function useIdeias() {
  return useContext(IdeiasContext);
}