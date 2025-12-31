import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IdeiaCard } from "../components/IdeiaCard";
import { useIdeias } from '../context/IdeiasContext';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os Status' },
  { value: 'Geração', label: 'Geração' },
  { value: 'Em Definição', label: 'Em Definição' },
  { value: 'Pronta para Avaliação', label: 'Pronta para Avaliação' },
  { value: 'Aprovada', label: 'Aprovada' },
  { value: 'Arquivada', label: 'Arquivada' }
];

const ORDENACAO_OPTIONS = [
  { value: 'recentes', label: 'Mais Recentes' },
  { value: 'antigas', label: 'Mais Antigas' },
  { value: 'votos', label: 'Mais Votadas' },
  { value: 'comentarios', label: 'Mais Comentadas' }
];

export function Ideias() {
  const navigate = useNavigate();
  const { ideias, loading, error } = useIdeias();
  
  // Estados dos filtros
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [tagFiltro, setTagFiltro] = useState('');
  const [ordenacao, setOrdenacao] = useState('recentes');

  // Extrair todas as tags únicas das ideias
  const todasTags = useMemo(() => {
    const tags = new Set();
    ideias.forEach(ideia => {
      (ideia.tags || []).forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [ideias]);

  // Filtrar e ordenar ideias
  const ideiasFiltradas = useMemo(() => {
    let resultado = [...ideias];

    // Filtro de busca por texto
    if (busca.trim()) {
      const termoBusca = busca.toLowerCase();
      resultado = resultado.filter(ideia => 
        ideia.titulo?.toLowerCase().includes(termoBusca) ||
        ideia.descricao?.toLowerCase().includes(termoBusca) ||
        ideia.fonte?.toLowerCase().includes(termoBusca) ||
        ideia.segmento?.toLowerCase().includes(termoBusca)
      );
    }

    // Filtro por status
    if (statusFiltro) {
      resultado = resultado.filter(ideia => ideia.status === statusFiltro);
    }

    // Filtro por tag
    if (tagFiltro) {
      resultado = resultado.filter(ideia => 
        (ideia.tags || []).includes(tagFiltro)
      );
    }

    // Ordenação
    switch (ordenacao) {
      case 'recentes':
        resultado.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'antigas':
        resultado.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'votos':
        resultado.sort((a, b) => (b.votos || 0) - (a.votos || 0));
        break;
      case 'comentarios':
        resultado.sort((a, b) => (b.comentarios || 0) - (a.comentarios || 0));
        break;
    }

    return resultado;
  }, [ideias, busca, statusFiltro, tagFiltro, ordenacao]);

  const limparFiltros = () => {
    setBusca('');
    setStatusFiltro('');
    setTagFiltro('');
    setOrdenacao('recentes');
  };

  const temFiltrosAtivos = busca || statusFiltro || tagFiltro || ordenacao !== 'recentes';

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando ideias...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          Erro ao carregar ideias: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Mural de Ideias 💡
          </h1>
          <p className="text-gray-500 mt-1">
            Mostrando {ideias.length} ideias cadastradas
          </p>
        </div>
        <button 
          onClick={() => navigate('/ideias/nova')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
        >
          + Nova Ideia
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Campo de Busca */}
          <div className="lg:col-span-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por título, descrição..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Filtro por Status */}
          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Filtro por Tag */}
          <select
            value={tagFiltro}
            onChange={(e) => setTagFiltro(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="">Todas as Tags</option>
            {todasTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>

          {/* Ordenação */}
          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            {ORDENACAO_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Resumo dos filtros e botão limpar */}
        {temFiltrosAtivos && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Mostrando <strong>{ideiasFiltradas.length}</strong> de <strong>{ideias.length}</strong> ideias
            </p>
            <button
              onClick={limparFiltros}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      {ideias.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <div className="text-5xl mb-4">💡</div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">Nenhuma ideia ainda</h3>
          <p className="text-gray-500 mb-6">Seja o primeiro a submeter uma ideia!</p>
          <button 
            onClick={() => navigate('/ideias/nova')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Criar primeira ideia
          </button>
        </div>
      ) : ideiasFiltradas.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">Nenhuma ideia encontrada</h3>
          <p className="text-gray-500 mb-4">Tente ajustar os filtros de busca</p>
          <button 
            onClick={limparFiltros}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-6 justify-center sm:justify-start">
          {ideiasFiltradas.map((ideia) => (
            <Link 
              key={ideia.id}
              to={`/ideias/${ideia.id}`} 
              className="transition-transform hover:-translate-y-1"
            >
              <IdeiaCard 
                titulo={ideia.titulo}
                status={ideia.status}
                descricao={ideia.descricao}
                tags={ideia.tags || []}
                votos={ideia.votos || 0}
                comentarios={ideia.comentarios || 0}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}