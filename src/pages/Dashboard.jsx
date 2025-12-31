import { useNavigate } from 'react-router-dom';
import { useIdeias } from '../context/IdeiasContext';

export function Dashboard() {
  const navigate = useNavigate();
  const { ideias, loading } = useIdeias();

  const total = ideias.length;
  const emGeracao = ideias.filter(i => i.status === 'Geração').length;
  const emDefinicao = ideias.filter(i => i.status === 'Em Definição').length;
  const prontasAvaliacao = ideias.filter(i => i.status === 'Pronta para Avaliação').length;
  const aprovadas = ideias.filter(i => i.status === 'Aprovada').length;
  const arquivadas = ideias.filter(i => i.status === 'Arquivada').length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 lg:mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 text-sm lg:text-base mt-1">Acompanhe o fluxo de ideias da sua equipe</p>
        </div>
        <button 
          onClick={() => navigate('/ideias/nova')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm w-full sm:w-auto"
        >
          + Nova Ideia
        </button>
      </div>

      {/* Grid de KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-10">
        
        {/* Card 1: Total */}
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-xs lg:text-sm font-medium uppercase">Total de Ideias</h3>
          <div className="mt-2 flex items-baseline flex-wrap">
            <span className="text-2xl lg:text-3xl font-extrabold text-gray-900">{total}</span>
            <span className="ml-2 text-xs lg:text-sm text-green-600">💡</span>
          </div>
        </div>

        {/* Card 2: Em Geração */}
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-blue-500">
          <h3 className="text-blue-600 text-xs lg:text-sm font-medium uppercase">Em Geração</h3>
          <div className="mt-2">
            <span className="text-2xl lg:text-3xl font-extrabold text-gray-900">{emGeracao}</span>
          </div>
        </div>

        {/* Card 3: Em Definição */}
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-yellow-500">
          <h3 className="text-yellow-600 text-xs lg:text-sm font-medium uppercase">Em Definição</h3>
          <div className="mt-2">
            <span className="text-2xl lg:text-3xl font-extrabold text-gray-900">{emDefinicao}</span>
          </div>
        </div>

        {/* Card 4: Aprovadas */}
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-green-500">
          <h3 className="text-green-600 text-xs lg:text-sm font-medium uppercase">Aprovadas</h3>
          <div className="mt-2">
            <span className="text-2xl lg:text-3xl font-extrabold text-gray-900">{aprovadas}</span>
          </div>
        </div>

      </div>

      {/* Seção de Atalhos Rápidos */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 lg:p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-base lg:text-lg font-medium text-blue-900">Prontas para Avaliação</h3>
          <p className="text-blue-700 text-sm mt-1">
            {prontasAvaliacao > 0 
              ? `${prontasAvaliacao} ideia(s) aguardando sua revisão técnica.`
              : 'Nenhuma ideia pendente de avaliação.'}
          </p>
        </div>
        <button 
          onClick={() => navigate('/avaliacao')}
          className="bg-white text-blue-700 px-4 py-2 rounded border border-blue-200 hover:bg-blue-50 transition text-sm lg:text-base w-full sm:w-auto"
        >
          Ver Fila →
        </button>
      </div>

      {/* Resumo Adicional */}
      {arquivadas > 0 && (
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600 text-sm">
            <span className="font-medium">{arquivadas}</span> ideia(s) arquivada(s)
          </p>
        </div>
      )}

    </div>
  );
}