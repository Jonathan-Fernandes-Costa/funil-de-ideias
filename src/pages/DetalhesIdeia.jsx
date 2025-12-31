import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useIdeias } from '../context/IdeiasContext';
import { useAuth } from '../context/AuthContext';
import { definicaoService, anexosService, checklistService, ideiasService } from '../services/ideiasService';
import { useToast } from '../components/Toast';

function AnexosTab({ ideiaId, userId }) {
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [anexos, setAnexos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    carregarAnexos();
  }, [ideiaId]);

  const carregarAnexos = async () => {
    try {
      setLoading(true);
      const data = await anexosService.listar(ideiaId);
      setAnexos(data || []);
    } catch (err) {
      console.error('Erro ao carregar anexos:', err);
      toast.error('Erro ao carregar anexos');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv'];

    for (const file of files) {
      if (file.size > maxSize) {
        toast.error(`Arquivo "${file.name}" excede o limite de 10MB`);
        continue;
      }

      if (!allowedTypes.includes(file.type)) {
        toast.error(`Tipo de arquivo não permitido: ${file.name}`);
        continue;
      }

      try {
        setUploading(true);
        await anexosService.upload(ideiaId, file, userId);
        toast.success(`"${file.name}" enviado com sucesso!`);
      } catch (err) {
        console.error('Erro no upload:', err);
        toast.error(`Erro ao enviar "${file.name}"`);
      }
    }

    setUploading(false);
    await carregarAnexos();
  };

  const handleFileInput = (e) => {
    handleUpload(Array.from(e.target.files));
    e.target.value = '';
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleUpload(Array.from(e.dataTransfer.files));
  };

  const handleDownload = async (anexo) => {
    try {
      toast.info('Iniciando download...');
      await anexosService.download(anexo.storage_path, anexo.nome_arquivo);
      toast.success('Download concluído!');
    } catch (err) {
      console.error('Erro no download:', err);
      toast.error('Erro ao baixar arquivo');
    }
  };

  const handleDelete = async (anexo) => {
    if (!confirm(`Deseja excluir "${anexo.nome_arquivo}"?`)) return;

    try {
      await anexosService.deletar(anexo.id, anexo.storage_path);
      toast.success('Anexo removido!');
      await carregarAnexos();
    } catch (err) {
      console.error('Erro ao deletar:', err);
      toast.error('Erro ao remover anexo');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (tipo) => {
    if (tipo?.startsWith('image/')) return '🖼️';
    if (tipo?.includes('pdf')) return '📄';
    if (tipo?.includes('word') || tipo?.includes('document')) return '📝';
    if (tipo?.includes('excel') || tipo?.includes('spreadsheet')) return '📊';
    return '📎';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Área de Upload */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${uploading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInput}
          className="hidden"
          accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
        />
        
        <div className="text-4xl mb-3">{uploading ? '⏳' : '📤'}</div>
        <p className="text-gray-700 font-medium mb-1">
          {uploading ? 'Enviando...' : 'Clique ou arraste arquivos aqui'}
        </p>
        <p className="text-gray-500 text-sm">
          PDF, Word, Excel, Imagens (máx. 10MB)
        </p>
      </div>

      {/* Lista de Anexos */}
      {anexos.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhum anexo ainda</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-gray-700 uppercase">
            {anexos.length} anexo(s)
          </h4>
          
          {anexos.map((anexo) => (
            <div 
              key={anexo.id}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
            >
              <span className="text-2xl">{getFileIcon(anexo.tipo_mime)}</span>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{anexo.nome_arquivo}</p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(anexo.tamanho_bytes)} • 
                  {new Date(anexo.created_at).toLocaleDateString('pt-BR')} •
                  por {anexo.uploader?.nome || anexo.uploader?.email?.split('@')[0] || 'Usuário'}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(anexo)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                  title="Baixar"
                >
                  ⬇️
                </button>
                <button
                  onClick={() => handleDelete(anexo)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                  title="Excluir"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DefinicaoProdutoForm({ definicao, setDefinicao, ideiaId, salvandoDefinicao, setSalvandoDefinicao, definicaoSalva, setDefinicaoSalva }) {
  
  const calcularProgresso = (def) => {
    let campos = 0;
    let preenchidos = 0;
    
    if (def.alinhamento_estrategico?.trim()) preenchidos++;
    campos++;
    if (def.publico_alvo?.trim()) preenchidos++;
    campos++;
    if (def.mercado?.trim()) preenchidos++;
    campos++;
    if (def.hipoteses_valor?.trim()) preenchidos++;
    campos++;
    if (def.estimativa_rentabilidade?.trim()) preenchidos++;
    campos++;
    if (def.capacidade_tecnica) preenchidos++;
    campos++;
    if (def.capacidade_operacional) preenchidos++;
    campos++;
    if (def.capacidade_recursos) preenchidos++;
    campos++;
    
    return Math.round((preenchidos / campos) * 100);
  };

  const handleChange = (field, value) => {
    const novaDefinicao = { ...definicao, [field]: value };
    novaDefinicao.progresso_percentual = calcularProgresso(novaDefinicao);
    setDefinicao(novaDefinicao);
    setDefinicaoSalva(false);
  };

  const handleSalvar = async () => {
    try {
      setSalvandoDefinicao(true);
      await definicaoService.salvar(ideiaId, {
        alinhamento_estrategico: definicao.alinhamento_estrategico,
        capacidade_tecnica: definicao.capacidade_tecnica,
        capacidade_operacional: definicao.capacidade_operacional,
        capacidade_recursos: definicao.capacidade_recursos,
        publico_alvo: definicao.publico_alvo,
        mercado: definicao.mercado,
        hipoteses_valor: definicao.hipoteses_valor,
        estimativa_rentabilidade: definicao.estimativa_rentabilidade,
        progresso_percentual: definicao.progresso_percentual
      });
      setDefinicaoSalva(true);
    } catch (err) {
      console.error('Erro ao salvar definição:', err);
      alert('Erro ao salvar. Tente novamente.');
    } finally {
      setSalvandoDefinicao(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Barra de Progresso */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progresso da Definição</span>
          <span className="text-sm font-bold text-blue-600">{definicao.progresso_percentual || 0}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${definicao.progresso_percentual || 0}%` }}
          ></div>
        </div>
      </div>

      {/* Seção 1: Alinhamento Estratégico */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
          Alinhamento Estratégico
        </h3>
        <textarea
          value={definicao.alinhamento_estrategico || ''}
          onChange={(e) => handleChange('alinhamento_estrategico', e.target.value)}
          placeholder="Descreva como esta ideia se alinha com os objetivos estratégicos da empresa..."
          rows="4"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
        />
      </div>

      {/* Seção 2: Capacidades */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
          Análise de Capacidades
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${definicao.capacidade_tecnica ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <input
              type="checkbox"
              checked={definicao.capacidade_tecnica || false}
              onChange={(e) => handleChange('capacidade_tecnica', e.target.checked)}
              className="w-5 h-5 text-green-600 rounded"
            />
            <div>
              <span className="font-medium text-gray-800">Capacidade Técnica</span>
              <p className="text-xs text-gray-500">Temos conhecimento técnico</p>
            </div>
          </label>
          
          <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${definicao.capacidade_operacional ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <input
              type="checkbox"
              checked={definicao.capacidade_operacional || false}
              onChange={(e) => handleChange('capacidade_operacional', e.target.checked)}
              className="w-5 h-5 text-green-600 rounded"
            />
            <div>
              <span className="font-medium text-gray-800">Capacidade Operacional</span>
              <p className="text-xs text-gray-500">Podemos operar a solução</p>
            </div>
          </label>
          
          <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${definicao.capacidade_recursos ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <input
              type="checkbox"
              checked={definicao.capacidade_recursos || false}
              onChange={(e) => handleChange('capacidade_recursos', e.target.checked)}
              className="w-5 h-5 text-green-600 rounded"
            />
            <div>
              <span className="font-medium text-gray-800">Recursos Disponíveis</span>
              <p className="text-xs text-gray-500">Temos budget e equipe</p>
            </div>
          </label>
        </div>
      </div>

      {/* Seção 3: Mercado */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
          Análise de Mercado
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Público-Alvo</label>
            <textarea
              value={definicao.publico_alvo || ''}
              onChange={(e) => handleChange('publico_alvo', e.target.value)}
              placeholder="Quem são os usuários/clientes desta solução?"
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mercado</label>
            <textarea
              value={definicao.mercado || ''}
              onChange={(e) => handleChange('mercado', e.target.value)}
              placeholder="Tamanho do mercado, concorrentes, tendências..."
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* Seção 4: Valor e Rentabilidade */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">4</span>
          Proposta de Valor
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hipóteses de Valor</label>
            <textarea
              value={definicao.hipoteses_valor || ''}
              onChange={(e) => handleChange('hipoteses_valor', e.target.value)}
              placeholder="Quais problemas resolve? Qual valor entrega?"
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimativa de Rentabilidade</label>
            <textarea
              value={definicao.estimativa_rentabilidade || ''}
              onChange={(e) => handleChange('estimativa_rentabilidade', e.target.value)}
              placeholder="ROI esperado, custos, receita projetada..."
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* Botão Salvar */}
      <div className="flex justify-end items-center gap-4 pt-6 border-t border-gray-200">
        {definicaoSalva && (
          <span className="text-green-600 text-sm font-medium flex items-center gap-1">
            ✓ Salvo com sucesso
          </span>
        )}
        <button
          onClick={handleSalvar}
          disabled={salvandoDefinicao}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {salvandoDefinicao ? 'Salvando...' : 'Salvar Definição'}
        </button>
      </div>
    </div>
  );
}

export function DetalhesIdeia() {
  const { id } = useParams();
  const { user } = useAuth();
  const { buscarIdeia, toggleVoto, verificarVoto, carregarComentarios, adicionarComentario, recarregar } = useIdeias();
  const toast = useToast();
  
  const [ideia, setIdeia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resumo');
  const [jaVotou, setJaVotou] = useState(false);
  const [votando, setVotando] = useState(false);
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState('');
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  
  // Estados para ownership e status
  const [assumindoOwnership, setAssumindoOwnership] = useState(false);
  const [mudandoStatus, setMudandoStatus] = useState(false);
  
  // Estados do checklist
  const [checklist, setChecklist] = useState([]);
  const [novoItemChecklist, setNovoItemChecklist] = useState({ categoria: '', item: '' });

  // Estados da Definição do Produto
  const [definicao, setDefinicao] = useState({
    alinhamento_estrategico: '',
    capacidade_tecnica: false,
    capacidade_operacional: false,
    capacidade_recursos: false,
    publico_alvo: '',
    mercado: '',
    hipoteses_valor: '',
    estimativa_rentabilidade: '',
    progresso_percentual: 0
  });
  const [salvandoDefinicao, setSalvandoDefinicao] = useState(false);
  const [definicaoSalva, setDefinicaoSalva] = useState(false);

  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true);
        const ideiaData = await buscarIdeia(Number(id));
        setIdeia(ideiaData);
        
        const votou = await verificarVoto(Number(id));
        setJaVotou(votou);
        
        const comentariosData = await carregarComentarios(Number(id));
        setComentarios(comentariosData || []);
        
        // Carregar definição do produto
        try {
          const definicaoData = await definicaoService.buscar(Number(id));
          if (definicaoData) {
            setDefinicao(definicaoData);
          }
        } catch (defErr) {
          console.log('Definição ainda não existe');
        }
      } catch (err) {
        console.error('Erro ao carregar ideia:', err);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, [id]);

  const handleVoto = async () => {
    try {
      setVotando(true);
      const votou = await toggleVoto(Number(id));
      setJaVotou(votou);
      const ideiaAtualizada = await buscarIdeia(Number(id));
      setIdeia(ideiaAtualizada);
    } catch (err) {
      console.error('Erro ao votar:', err);
    } finally {
      setVotando(false);
    }
  };

  const handleEnviarComentario = async (e) => {
    e.preventDefault();
    if (!novoComentario.trim()) return;
    
    try {
      setEnviandoComentario(true);
      await adicionarComentario(Number(id), novoComentario);
      setNovoComentario('');
      const comentariosData = await carregarComentarios(Number(id));
      setComentarios(comentariosData || []);
      const ideiaAtualizada = await buscarIdeia(Number(id));
      setIdeia(ideiaAtualizada);
    } catch (err) {
      console.error('Erro ao comentar:', err);
    } finally {
      setEnviandoComentario(false);
    }
  };

  // Assumir ownership da ideia
  const handleAssumirOwnership = async () => {
    try {
      setAssumindoOwnership(true);
      await ideiasService.assumirOwnership(Number(id), user.id);
      const ideiaAtualizada = await buscarIdeia(Number(id));
      setIdeia(ideiaAtualizada);
      toast.success('Você agora é o responsável por esta ideia!');
    } catch (err) {
      console.error('Erro ao assumir ownership:', err);
      toast.error('Erro ao assumir ownership');
    } finally {
      setAssumindoOwnership(false);
    }
  };

  // Mudar status da ideia
  const handleMudarStatus = async (novoStatus) => {
    try {
      setMudandoStatus(true);
      await ideiasService.atualizarStatus(Number(id), novoStatus);
      const ideiaAtualizada = await buscarIdeia(Number(id));
      setIdeia(ideiaAtualizada);
      toast.success(`Status alterado para "${novoStatus}"`);
      if (recarregar) await recarregar();
    } catch (err) {
      console.error('Erro ao mudar status:', err);
      toast.error('Erro ao alterar status');
    } finally {
      setMudandoStatus(false);
    }
  };

  // Define próximo status possível baseado no status atual
  const getProximosStatus = () => {
    switch (ideia?.status) {
      case 'Geração':
        return ['Em Definição'];
      case 'Em Definição':
        return ['Pronta para Avaliação'];
      case 'Pronta para Avaliação':
        return []; // Avaliação é feita na página de avaliação
      case 'Aprovada':
        return ['Arquivada'];
      default:
        return [];
    }
  };

  const proximosStatus = getProximosStatus();
  const podeAssumirOwnership = !ideia?.owner_id && ideia?.status !== 'Arquivada' && ideia?.status !== 'Aprovada';
  const isOwner = ideia?.owner_id === user?.id;
  const isAutor = ideia?.autor_id === user?.id;

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

  if (!ideia) {
    return <div className="p-10 text-center text-gray-500">Ideia não encontrada! 😕</div>;
  }

  // Define a cor da etiqueta baseada no status (igual fizemos no Card)
  const statusColor = ideia.status === 'Aprovada' ? 'bg-green-100 text-green-800' 
                    : ideia.status === 'Rejeitada' ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800';

  return (
    <div>
      {/* Botão Voltar */}
      <Link to="/ideias" className="text-sm text-gray-500 hover:text-blue-600 mb-4 inline-block">
        ← Voltar para o Mural
      </Link>

      {/* Cabeçalho DINÂMICO */}
      <div className="mb-6 lg:mb-8 border-b border-gray-200 pb-4 lg:pb-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 lg:gap-3 mb-2">
               <h1 className="text-xl lg:text-3xl font-bold text-gray-800">{ideia.titulo}</h1>
               <span className={`${statusColor} font-bold px-2 lg:px-3 py-0.5 rounded-full uppercase text-xs tracking-wide`}>
                {ideia.status}
              </span>
            </div>
            <p className="text-gray-500 text-xs lg:text-sm">ID #{ideia.id} • Fonte: {ideia.fonte || 'Não informada'}</p>
          </div>
          
          {/* Ações do cabeçalho */}
          <div className="flex flex-wrap gap-2">
            {podeAssumirOwnership && (
              <button
                onClick={handleAssumirOwnership}
                disabled={assumindoOwnership}
                className="px-3 lg:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-xs lg:text-sm font-medium disabled:opacity-50"
              >
                {assumindoOwnership ? 'Assumindo...' : '🙋 Assumir'}
              </button>
            )}
            
            {ideia.owner_id && (
              <span className="px-2 lg:px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-xs lg:text-sm font-medium">
                {isOwner ? '✓ Responsável' : '👤 Atribuído'}
              </span>
            )}
            
            {(isOwner || isAutor) && proximosStatus.length > 0 && (
              proximosStatus.map((status) => (
                <button
                  key={status}
                  onClick={() => handleMudarStatus(status)}
                  disabled={mudandoStatus}
                  className="px-3 lg:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs lg:text-sm font-medium disabled:opacity-50"
                >
                  {mudandoStatus ? '...' : `→ ${status}`}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Navegação em Abas */}
      <div className="mb-4 lg:mb-6 overflow-x-auto">
        <nav className="flex gap-4 lg:gap-8 border-b border-gray-200 min-w-max">
          <button onClick={() => setActiveTab('resumo')} className={`pb-3 text-xs lg:text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === 'resumo' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>Resumo</button>
          <button onClick={() => setActiveTab('definicao')} className={`pb-3 text-xs lg:text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === 'definicao' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>Definição</button>
          <button onClick={() => setActiveTab('anexos')} className={`pb-3 text-xs lg:text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === 'anexos' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>Anexos</button>
        </nav>
      </div>

      {/* Conteúdo das Abas */}
      <div className="bg-white p-4 lg:p-8 rounded-xl shadow-sm border border-gray-200 min-h-[300px] lg:min-h-[400px]">
        
        {activeTab === 'resumo' && (
          <div className="animate-fade-in">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Descrição do Problema</h3>
            {/* Descrição Real */}
            <p className="text-gray-600 leading-relaxed mb-8">
              {ideia.descricao}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <span className="block text-xs text-gray-500 uppercase font-bold">Impacto Esperado</span>
                <span className="font-medium text-gray-800">{ideia.impacto || 'Não definido'}</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <span className="block text-xs text-gray-500 uppercase font-bold">Segmento</span>
                <span className="font-medium text-gray-800">{ideia.segmento || 'Geral'}</span>
              </div>
            </div>
            
            {/* Tags Reais */}
            <div className="mb-8">
               <h4 className="text-sm font-bold text-gray-700 uppercase mb-2">Tags</h4>
               <div className="flex gap-2">
                 {ideia.tags?.map((tag, idx) => (
                   <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-semibold">#{tag}</span>
                 ))}
               </div>
            </div>

            {/* Seção de Votos */}
            <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
              <button
                onClick={handleVoto}
                disabled={votando}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  jaVotou 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-500'
                } disabled:opacity-50`}
              >
                <span>👍</span>
                {votando ? 'Votando...' : jaVotou ? 'Votado!' : 'Votar'}
              </button>
              <span className="text-gray-600">
                <strong>{ideia.votos || 0}</strong> votos
              </span>
            </div>

            {/* Seção de Comentários */}
            <div className="pt-6 border-t border-gray-100">
              <h4 className="text-sm font-bold text-gray-900 mb-4">Comentários ({comentarios.length})</h4>
              
              {/* Formulário de novo comentário */}
              <form onSubmit={handleEnviarComentario} className="mb-6">
                <textarea
                  value={novoComentario}
                  onChange={(e) => setNovoComentario(e.target.value)}
                  placeholder="Escreva um comentário..."
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={enviandoComentario || !novoComentario.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {enviandoComentario ? 'Enviando...' : 'Comentar'}
                  </button>
                </div>
              </form>

              {/* Lista de comentários */}
              {comentarios.length === 0 ? (
                <p className="text-gray-500 italic text-sm">Seja o primeiro a comentar!</p>
              ) : (
                <div className="space-y-4">
                  {comentarios.map((comentario) => (
                    <div key={comentario.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {comentario.autor?.nome?.charAt(0) || comentario.autor?.email?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {comentario.autor?.nome || comentario.autor?.email?.split('@')[0] || 'Usuário'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(comentario.created_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm">{comentario.conteudo}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'definicao' && (
          <DefinicaoProdutoForm 
            definicao={definicao}
            setDefinicao={setDefinicao}
            ideiaId={Number(id)}
            salvandoDefinicao={salvandoDefinicao}
            setSalvandoDefinicao={setSalvandoDefinicao}
            definicaoSalva={definicaoSalva}
            setDefinicaoSalva={setDefinicaoSalva}
          />
        )}

        {activeTab === 'anexos' && (
          <AnexosTab 
            ideiaId={Number(id)} 
            userId={user.id}
          />
        )}

      </div>
    </div>
  );
}