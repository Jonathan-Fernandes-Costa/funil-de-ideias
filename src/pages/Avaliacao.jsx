import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IdeiaCard } from "../components/IdeiaCard";
import { useIdeias } from '../context/IdeiasContext';
import { avaliacoesService } from '../services/ideiasService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export function Avaliacao() {
  const { user } = useAuth();
  const { ideias, loading, atualizarStatus, recarregar } = useIdeias();
  const toast = useToast();
  const [avaliacaoAberta, setAvaliacaoAberta] = useState(null);
  const [notas, setNotas] = useState({ clareza: 3, negocio: 3, tecnica: 3 });
  const [decisao, setDecisao] = useState('Aprovada');
  const [justificativa, setJustificativa] = useState('');
  const [enviando, setEnviando] = useState(false);

  const ideiasParaAvaliar = ideias.filter(i => i.status === 'Pronta para Avaliação');

  const handleAvaliar = async () => {
    if (!avaliacaoAberta) return;
    if (decisao === 'Arquivada' && !justificativa.trim()) {
      toast.warning('Justificativa é obrigatória para rejeição');
      return;
    }

    try {
      setEnviando(true);
      await avaliacoesService.criar({
        ideia_id: avaliacaoAberta.id,
        avaliador_id: user.id,
        nota_clareza_objetivos: notas.clareza,
        nota_analise_negocio: notas.negocio,
        nota_viabilidade_tecnica: notas.tecnica,
        decisao,
        justificativa: decisao === 'Arquivada' ? justificativa : null
      });
      
      setAvaliacaoAberta(null);
      setNotas({ clareza: 3, negocio: 3, tecnica: 3 });
      setDecisao('Aprovada');
      setJustificativa('');
      await recarregar();
      toast.success(decisao === 'Aprovada' ? 'Ideia aprovada com sucesso!' : 'Ideia arquivada');
    } catch (err) {
      console.error('Erro ao avaliar:', err);
      toast.error('Erro ao salvar avaliação');
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Fila de Avaliação ⚖️
        </h1>
        <p className="text-gray-600 mt-2">
          {ideiasParaAvaliar.length > 0 
            ? `${ideiasParaAvaliar.length} ideia(s) aguardando análise técnica.`
            : 'Nenhuma ideia pendente de avaliação.'}
        </p>
      </div>

      {ideiasParaAvaliar.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">Tudo em dia!</h3>
          <p className="text-gray-500">Não há ideias pendentes de avaliação.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideiasParaAvaliar.map((ideia) => (
            <div key={ideia.id} className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              
              <div className="relative bg-white rounded-lg p-1">
                <Link to={`/ideias/${ideia.id}`}>
                  <IdeiaCard 
                    titulo={ideia.titulo}
                    status={ideia.status}
                    descricao={ideia.descricao}
                    tags={ideia.tags || []}
                    votos={ideia.votos || 0}
                    comentarios={ideia.comentarios || 0}
                  />
                </Link>
                <button 
                  onClick={() => setAvaliacaoAberta(ideia)}
                  className="mt-2 w-full bg-indigo-600 text-white py-2 rounded-b-md hover:bg-indigo-700 transition font-medium shadow-sm"
                >
                  Avaliar Ideia →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Avaliação */}
      {avaliacaoAberta && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Avaliar: {avaliacaoAberta.titulo}</h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clareza dos Objetivos
                </label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(n => (
                    <button
                      key={n}
                      onClick={() => setNotas({...notas, clareza: n})}
                      className={`w-10 h-10 rounded-lg font-bold ${notas.clareza === n ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Análise de Negócio
                </label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(n => (
                    <button
                      key={n}
                      onClick={() => setNotas({...notas, negocio: n})}
                      className={`w-10 h-10 rounded-lg font-bold ${notas.negocio === n ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Viabilidade Técnica
                </label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(n => (
                    <button
                      key={n}
                      onClick={() => setNotas({...notas, tecnica: n})}
                      className={`w-10 h-10 rounded-lg font-bold ${notas.tecnica === n ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Decisão */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Decisão</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setDecisao('Aprovada')}
                    className={`flex-1 py-3 rounded-lg font-medium ${decisao === 'Aprovada' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    ✅ Aprovar
                  </button>
                  <button
                    onClick={() => setDecisao('Arquivada')}
                    className={`flex-1 py-3 rounded-lg font-medium ${decisao === 'Arquivada' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    ❌ Rejeitar
                  </button>
                </div>
              </div>

              {/* Justificativa (se rejeitada) */}
              {decisao === 'Arquivada' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Justificativa (obrigatória)
                  </label>
                  <textarea
                    value={justificativa}
                    onChange={(e) => setJustificativa(e.target.value)}
                    rows="3"
                    placeholder="Explique o motivo da rejeição..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => setAvaliacaoAberta(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleAvaliar}
                disabled={enviando}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {enviando ? 'Salvando...' : 'Confirmar Avaliação'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}