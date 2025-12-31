import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIdeias } from '../context/IdeiasContext';
import { useToast } from '../components/Toast';

export function NovaIdeia() {
  const navigate = useNavigate();
  const { adicionarIdeia } = useIdeias();
  const toast = useToast();

  const [titulo, setTitulo] = useState('');
  const [fonte, setFonte] = useState('');
  const [descricao, setDescricao] = useState('');
  const [segmento, setSegmento] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [impacto, setImpacto] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      // Transformar a string de tags em um array (separando por vírgula)
      const tagsArray = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

      // Criar o objeto da nova ideia
      const novaIdeia = {
        titulo,
        fonte, // (Opcional no card, mas bom guardar)
        descricao, // Mapeia para "Problema do Cliente"
        segmento,  // (Opcional no card)
        tags: tagsArray,
        impacto    // (Opcional no card)
      };

      // Salvar na memória global!
      await adicionarIdeia(novaIdeia);
      toast.success('Ideia criada com sucesso!');
      navigate('/ideias');
    } catch (err) {
      toast.error(err.message || 'Erro ao criar ideia. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6 lg:mb-8">
        Nova Ideia ✨
      </h1>

      {erro && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {erro}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-4 lg:p-8 rounded-lg shadow-md border border-gray-200 space-y-4 lg:space-y-6">
        
        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome da ideia *</label>
          <input 
            required
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            type="text" 
            placeholder="Ex: Portal de Autoatendimento"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Fonte */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fonte</label>
          <input 
            value={fonte}
            onChange={(e) => setFonte(e.target.value)}
            type="text" 
            placeholder="Ex: Feedback de Clientes"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Problema */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Problema do Cliente *</label>
          <textarea 
            required
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows="3"
            placeholder="Descreva o problema que esta ideia resolve"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          ></textarea>
        </div>

        {/* Segmento e Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Segmento</label>
            <input 
              value={segmento}
              onChange={(e) => setSegmento(e.target.value)}
              type="text" 
              placeholder="Ex: B2B, Varejo"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <input 
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              type="text" 
              placeholder="Separe por vírgula (ex: web, mobile)"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Impacto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Impacto Esperado</label>
          <textarea 
            value={impacto}
            onChange={(e) => setImpacto(e.target.value)}
            rows="2"
            placeholder="Qual o resultado esperado?"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          ></textarea>
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-3 pt-4">
          <button 
            type="button"
            onClick={() => navigate('/ideias')}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Salvando...' : 'Submeter Ideia'}
          </button>
        </div>

      </form>
    </div>
  );
}